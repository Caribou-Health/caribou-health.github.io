/**
 * Caribou Health - Google Cloud Backend Configuration
 *
 * This file provides the configuration and integration layer for Google Cloud Platform services.
 * When Google Cloud credits are available, update the configuration values and enable the backend.
 *
 * SERVICES USED:
 * - Firebase Authentication: User login/signup with email, Google, Apple
 * - Cloud Firestore: NoSQL database for user data storage
 * - Cloud Functions: Serverless API endpoints
 * - Cloud Storage: File uploads (PT instructions, profile photos)
 * - Stripe/Google Pay: Payment processing for tier subscriptions
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication providers (Email/Password, Google, Apple)
 * 3. Create Firestore database in production mode
 * 4. Copy your Firebase config below
 * 5. Set BACKEND_ENABLED = true
 * 6. Deploy Cloud Functions from /functions directory
 */

// ============================================
// BACKEND CONFIGURATION
// ============================================

const BackendConfig = {
  // Set to true when Google Cloud is configured
  BACKEND_ENABLED: true,

  // Firebase Configuration — caribou-health-prod (team@caribouhealth.ca)
  firebase: {
    apiKey: "AIzaSyDTSFLX_17i4HWq_WrZoNY9tWLTskfNNEY",
    authDomain: "project-ae9bef9a-6783-49ea-abc.firebaseapp.com",
    projectId: "project-ae9bef9a-6783-49ea-abc",
    storageBucket: "project-ae9bef9a-6783-49ea-abc.firebasestorage.app",
    messagingSenderId: "912857703569",
    appId: "1:912857703569:web:0ede070c0a9d978132cb30",
    measurementId: "G-LBZZMJV6YF"
  },

  // API Endpoints (Cloud Run — northamerica-northeast1 for PIPEDA compliance)
  endpoints: {
    baseUrl: "https://caribou-api-912857703569.northamerica-northeast1.run.app",
    auth: "/api/auth",
    users: "/api/users",
    carePlans: "/api/care-plans",
    progress: "/api/progress",
    subscriptions: "/api/subscriptions",
    promoCodes: "/api/promo-codes",
    admin: "/api/admin",
    conditions: "/api/conditions",
    chat: "/api/chat"
  },

  // Stripe Configuration for Payments
  stripe: {
    publishableKey: "YOUR_STRIPE_PUBLISHABLE_KEY",
    // Price IDs from Stripe Dashboard
    priceIds: {
      premium_monthly: "price_premium_monthly_id",
      premium_yearly: "price_premium_yearly_id",
      family_monthly: "price_family_monthly_id",
      family_yearly: "price_family_yearly_id"
    }
  },

  // Admin Configuration
  admin: {
    // Admin email addresses (can login to admin dashboard)
    adminEmails: [
      "caleigh@caribouhealth.ca",
      "kanny@caribouhealth.ca"
    ]
  }
};

// ============================================
// AUTHENTICATION SERVICE
// ============================================

const AuthService = {
  currentUser: null,
  authStateListeners: [],

  /**
   * Hash a password using SHA-256 via SubtleCrypto
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Initialize Firebase Authentication
   * Call this when the app starts
   */
  async initialize() {
    if (!BackendConfig.BACKEND_ENABLED) {
      console.log('[AuthService] Backend disabled - using local storage');
      return this.initializeLocalAuth();
    }

    // Import Firebase SDK dynamically
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

      const app = initializeApp(BackendConfig.firebase);
      this.auth = getAuth(app);

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.notifyListeners(user);
      });

      console.log('[AuthService] Firebase initialized successfully');
    } catch (error) {
      console.error('[AuthService] Firebase initialization failed:', error);
      return this.initializeLocalAuth();
    }
  },

  /**
   * Initialize local authentication (fallback when backend is disabled)
   */
  initializeLocalAuth() {
    const savedUser = localStorage.getItem('caribou_current_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.notifyListeners(this.currentUser);
    }
    return Promise.resolve();
  },

  /**
   * Sign up with email and password
   */
  async signUp(email, password, userData = {}) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localSignUp(email, password, userData);
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      // Update profile with name if provided
      if (userData.displayName) {
        await updateProfile(userCredential.user, { displayName: userData.displayName });
      }

      // Create user document in Firestore
      await DataService.createUserProfile(userCredential.user.uid, {
        email: email,
        ...userData,
        createdAt: new Date().toISOString(),
        tier: 'free'
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Local signup (fallback)
   */
  async localSignUp(email, password, userData) {
    const accounts = JSON.parse(localStorage.getItem('caribou_accounts') || '{}');

    if (accounts[email]) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const user = {
      uid: 'local_' + Date.now(),
      email: email,
      displayName: userData.displayName || '',
      createdAt: new Date().toISOString(),
      tier: 'free'
    };

    accounts[email] = {
      passwordHash: await this.hashPassword(password),
      user: user,
      appState: null
    };

    localStorage.setItem('caribou_accounts', JSON.stringify(accounts));
    localStorage.setItem('caribou_current_user', JSON.stringify(user));

    this.currentUser = user;
    this.notifyListeners(user);

    return { success: true, user: user };
  },

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localSignIn(email, password);
    }

    try {
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Local signin (fallback)
   */
  async localSignIn(email, password) {
    const accounts = JSON.parse(localStorage.getItem('caribou_accounts') || '{}');
    const account = accounts[email];

    if (!account) {
      return { success: false, error: 'No account found with this email.' };
    }

    const hash = await this.hashPassword(password);
    if (account.passwordHash !== hash) {
      return { success: false, error: 'Incorrect password.' };
    }

    this.currentUser = account.user;
    localStorage.setItem('caribou_current_user', JSON.stringify(account.user));
    this.notifyListeners(account.user);

    return { success: true, user: account.user, hasData: !!account.appState };
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    if (!BackendConfig.BACKEND_ENABLED) {
      return { success: false, error: 'Google Sign-In requires backend to be enabled.' };
    }

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Check if this is a new user
      const isNewUser = result._tokenResponse?.isNewUser;
      if (isNewUser) {
        await DataService.createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          tier: 'free'
        });
      }

      return { success: true, user: result.user, isNewUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    if (!BackendConfig.BACKEND_ENABLED) {
      localStorage.removeItem('caribou_current_user');
      this.currentUser = null;
      this.notifyListeners(null);
      return { success: true };
    }

    try {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if current user is admin
   */
  isAdmin() {
    if (!this.currentUser) return false;
    return BackendConfig.admin.adminEmails.includes(this.currentUser.email);
  },

  /**
   * Admin login
   */
  async adminLogin(email, password) {
    const result = await this.signIn(email, password);
    if (result.success && this.isAdmin()) {
      return { success: true, user: result.user, isAdmin: true };
    } else if (result.success) {
      await this.signOut();
      return { success: false, error: 'This account does not have admin privileges.' };
    }
    return result;
  },

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  },

  notifyListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }
};

// ============================================
// DATA SERVICE (Firestore)
// ============================================

const DataService = {
  db: null,

  /**
   * Initialize Firestore
   */
  async initialize() {
    if (!BackendConfig.BACKEND_ENABLED) {
      console.log('[DataService] Backend disabled - using local storage');
      return;
    }

    try {
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      this.db = getFirestore();
      console.log('[DataService] Firestore initialized successfully');
    } catch (error) {
      console.error('[DataService] Firestore initialization failed:', error);
    }
  },

  /**
   * Create user profile document
   */
  async createUserProfile(userId, data) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localSaveUserProfile(userId, data);
    }

    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      await setDoc(doc(this.db, 'users', userId), data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localGetUserProfile(userId);
    }

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      const docSnap = await getDoc(doc(this.db, 'users', userId));

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Save user care plan data
   * Data is associated with user ID and only accessible by that user
   */
  async saveCarePlan(userId, carePlanData) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localSaveCarePlan(userId, carePlanData);
    }

    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      await setDoc(doc(this.db, 'carePlans', userId), {
        ...carePlanData,
        userId: userId,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user care plan
   */
  async getCarePlan(userId) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localGetCarePlan(userId);
    }

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
      const docSnap = await getDoc(doc(this.db, 'carePlans', userId));

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Save progress data
   */
  async saveProgress(userId, date, progressData) {
    if (!BackendConfig.BACKEND_ENABLED) {
      return this.localSaveProgress(userId, date, progressData);
    }

    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

      const progressId = `${userId}_${date}`;
      await setDoc(doc(this.db, 'progress', progressId), {
        userId: userId,
        date: date,
        ...progressData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Local storage fallback methods
  localSaveUserProfile(userId, data) {
    const profiles = JSON.parse(localStorage.getItem('caribou_profiles') || '{}');
    profiles[userId] = data;
    localStorage.setItem('caribou_profiles', JSON.stringify(profiles));
    return { success: true };
  },

  localGetUserProfile(userId) {
    const profiles = JSON.parse(localStorage.getItem('caribou_profiles') || '{}');
    return profiles[userId] ? { success: true, data: profiles[userId] } : { success: false, error: 'User not found' };
  },

  localSaveCarePlan(userId, carePlanData) {
    const plans = JSON.parse(localStorage.getItem('caribou_careplans') || '{}');
    plans[userId] = { ...carePlanData, updatedAt: new Date().toISOString() };
    localStorage.setItem('caribou_careplans', JSON.stringify(plans));
    return { success: true };
  },

  localGetCarePlan(userId) {
    const plans = JSON.parse(localStorage.getItem('caribou_careplans') || '{}');
    return { success: true, data: plans[userId] || null };
  },

  localSaveProgress(userId, date, progressData) {
    const progress = JSON.parse(localStorage.getItem('caribou_progress') || '{}');
    if (!progress[userId]) progress[userId] = {};
    progress[userId][date] = progressData;
    localStorage.setItem('caribou_progress', JSON.stringify(progress));
    return { success: true };
  }
};

// ============================================
// SUBSCRIPTION & PAYMENT SERVICE
// ============================================

const SubscriptionService = {
  stripe: null,

  /**
   * Initialize Stripe
   */
  async initialize() {
    if (!BackendConfig.BACKEND_ENABLED) {
      console.log('[SubscriptionService] Backend disabled - subscriptions simulated locally');
      return;
    }

    try {
      // Load Stripe.js
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      this.stripe = Stripe(BackendConfig.stripe.publishableKey);
      console.log('[SubscriptionService] Stripe initialized successfully');
    } catch (error) {
      console.error('[SubscriptionService] Stripe initialization failed:', error);
    }
  },

  /**
   * Get subscription plans
   */
  getPlans() {
    return {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          '1 condition tracking',
          'Basic meal plans',
          'Medication reminders',
          'PT exercises'
        ]
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        features: [
          'Up to 3 conditions',
          'Personalized AI meal plans',
          'Advanced progress tracking',
          'Macro & calorie tracking',
          'Priority support'
        ]
      },
      family: {
        id: 'family',
        name: 'Family',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        features: [
          'Everything in Premium',
          'Up to 5 family members',
          'Shared grocery lists',
          'Caregiver dashboard',
          'Family progress reports'
        ]
      }
    };
  },

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(planId, billingCycle = 'monthly', promoCode = null) {
    if (!BackendConfig.BACKEND_ENABLED) {
      // Simulate subscription for testing
      return this.simulateSubscription(planId, promoCode);
    }

    try {
      const priceId = BackendConfig.stripe.priceIds[`${planId}_${billingCycle}`];

      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.subscriptions}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({
          priceId: priceId,
          promoCode: promoCode,
          successUrl: window.location.origin + '/app/?subscription=success',
          cancelUrl: window.location.origin + '/app/?subscription=cancelled'
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const result = await this.stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Simulate subscription (for testing without backend)
   */
  simulateSubscription(planId, promoCode) {
    const userId = AuthService.currentUser?.uid || 'local_user';

    // Apply promo code discount
    let discount = 0;
    if (promoCode) {
      const promo = PromoCodeService.validateCode(promoCode);
      if (promo.valid) {
        discount = promo.discount;
      }
    }

    // Update local subscription
    const subscriptions = JSON.parse(localStorage.getItem('caribou_subscriptions') || '{}');
    subscriptions[userId] = {
      planId: planId,
      status: 'active',
      startDate: new Date().toISOString(),
      promoCode: promoCode,
      discount: discount
    };
    localStorage.setItem('caribou_subscriptions', JSON.stringify(subscriptions));

    return { success: true, simulated: true };
  },

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus() {
    const userId = AuthService.currentUser?.uid || 'local_user';

    if (!BackendConfig.BACKEND_ENABLED) {
      const subscriptions = JSON.parse(localStorage.getItem('caribou_subscriptions') || '{}');
      return subscriptions[userId] || { planId: 'free', status: 'active' };
    }

    try {
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.subscriptions}/status`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      return { planId: 'free', status: 'active', error: error.message };
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription() {
    const userId = AuthService.currentUser?.uid || 'local_user';

    if (!BackendConfig.BACKEND_ENABLED) {
      const subscriptions = JSON.parse(localStorage.getItem('caribou_subscriptions') || '{}');
      if (subscriptions[userId]) {
        subscriptions[userId].status = 'cancelled';
        subscriptions[userId].cancelledAt = new Date().toISOString();
        localStorage.setItem('caribou_subscriptions', JSON.stringify(subscriptions));
      }
      return { success: true };
    }

    try {
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.subscriptions}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// PROMO CODE SERVICE
// ============================================

const PromoCodeService = {
  /**
   * Validate a promo code via backend API
   */
  async validateCode(code) {
    const normalizedCode = code.toUpperCase().trim();
    try {
      const token = AuthService.currentUser ? await AuthService.currentUser.getIdToken() : null;
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.promoCodes}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code: normalizedCode })
      });
      return await response.json();
    } catch (error) {
      return { valid: false, error: 'Unable to validate promo code. Please check your connection.' };
    }
  },

  /**
   * Apply promo code to a plan
   */
  async applyToPrice(originalPrice, promoCode) {
    const validation = await this.validateCode(promoCode);

    if (!validation.valid) {
      return { success: false, error: validation.error, finalPrice: originalPrice };
    }

    let finalPrice = originalPrice;

    if (validation.type === 'percent') {
      finalPrice = originalPrice * (1 - validation.discount / 100);
    } else if (validation.type === 'fixed') {
      finalPrice = Math.max(0, originalPrice - validation.discount);
    }

    return {
      success: true,
      originalPrice: originalPrice,
      discount: originalPrice - finalPrice,
      finalPrice: finalPrice,
      description: validation.description
    };
  }
};

// ============================================
// ADMIN SERVICE
// ============================================

const AdminService = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    if (!AuthService.isAdmin()) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!BackendConfig.BACKEND_ENABLED) {
      // Return local users
      const accounts = JSON.parse(localStorage.getItem('caribou_accounts') || '{}');
      const users = Object.values(accounts).map(acc => ({
        ...acc.user,
        hasCarePlan: !!acc.appState
      }));
      return { success: true, users };
    }

    try {
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.admin}/users`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get analytics dashboard data
   */
  async getAnalytics() {
    if (!AuthService.isAdmin()) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!BackendConfig.BACKEND_ENABLED) {
      // Return simulated analytics
      const accounts = JSON.parse(localStorage.getItem('caribou_accounts') || '{}');
      const subscriptions = JSON.parse(localStorage.getItem('caribou_subscriptions') || '{}');

      return {
        success: true,
        data: {
          totalUsers: Object.keys(accounts).length,
          activeUsers: Object.keys(accounts).length,
          subscriptions: {
            free: Object.values(subscriptions).filter(s => s.planId === 'free').length || Object.keys(accounts).length,
            premium: Object.values(subscriptions).filter(s => s.planId === 'premium').length,
            family: Object.values(subscriptions).filter(s => s.planId === 'family').length
          },
          promoCodesUsed: JSON.parse(localStorage.getItem('caribou_promo_usage') || '{}')
        }
      };
    }

    try {
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.admin}/analytics`, {
        headers: {
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Create new promo code (admin only)
   */
  async createPromoCode(codeData) {
    if (!AuthService.isAdmin()) {
      return { success: false, error: 'Unauthorized' };
    }

    // Add to local promo codes
    PromoCodeService.codes[codeData.code.toUpperCase()] = {
      discount: codeData.discount,
      type: codeData.type || 'percent',
      description: codeData.description,
      maxUses: codeData.maxUses || 100,
      expiresAt: codeData.expiresAt,
      planRestriction: codeData.planRestriction || null
    };

    return { success: true };
  },

  /**
   * Update user tier (admin only)
   */
  async updateUserTier(userId, newTier) {
    if (!AuthService.isAdmin()) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!BackendConfig.BACKEND_ENABLED) {
      const subscriptions = JSON.parse(localStorage.getItem('caribou_subscriptions') || '{}');
      subscriptions[userId] = {
        planId: newTier,
        status: 'active',
        startDate: new Date().toISOString(),
        grantedBy: 'admin'
      };
      localStorage.setItem('caribou_subscriptions', JSON.stringify(subscriptions));
      return { success: true };
    }

    try {
      const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.admin}/users/${userId}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AuthService.currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ tier: newTier })
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// INITIALIZATION
// ============================================

async function initializeBackend() {
  console.log('[Backend] Initializing Caribou Health backend services...');
  console.log('[Backend] Backend enabled:', BackendConfig.BACKEND_ENABLED);

  await AuthService.initialize();
  await DataService.initialize();
  await SubscriptionService.initialize();

  console.log('[Backend] All services initialized');
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BackendConfig,
    AuthService,
    DataService,
    SubscriptionService,
    PromoCodeService,
    AdminService,
    initializeBackend
  };
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBackend);
  } else {
    initializeBackend();
  }
}

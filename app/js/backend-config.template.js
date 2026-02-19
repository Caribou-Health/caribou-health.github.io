/**
 * Caribou Health - Google Cloud Backend Configuration TEMPLATE
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to backend-config.js in the same directory
 * 2. Replace all placeholder values with your actual credentials
 * 3. backend-config.js is gitignored — your secrets stay local
 *
 * SERVICES USED:
 * - Firebase Authentication: User login/signup with email, Google, Apple
 * - Cloud Firestore: NoSQL database for user data storage
 * - Cloud Functions: Serverless API endpoints
 * - Cloud Storage: File uploads (PT instructions, profile photos)
 * - Stripe/Google Pay: Payment processing for tier subscriptions
 *
 * TO GET YOUR FIREBASE CONFIG:
 * 1. Go to https://console.firebase.google.com
 * 2. Select your project → Project Settings → General
 * 3. Scroll to "Your apps" → Web app → Firebase SDK snippet → Config
 * 4. Copy the values below
 */

// ============================================
// BACKEND CONFIGURATION
// ============================================

const BackendConfig = {
  // Set to true when Google Cloud is configured
  BACKEND_ENABLED: false,

  // Firebase Configuration
  // Get these from: Firebase Console → Project Settings → General → Your apps
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  },

  // API Endpoints (Cloud Run)
  endpoints: {
    baseUrl: "https://YOUR_CLOUD_RUN_URL.run.app",
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
  // Get from: https://dashboard.stripe.com/apikeys
  stripe: {
    publishableKey: "YOUR_STRIPE_PUBLISHABLE_KEY",
    priceIds: {
      premium_monthly: "price_premium_monthly_id",
      premium_yearly: "price_premium_yearly_id",
      family_monthly: "price_family_monthly_id",
      family_yearly: "price_family_yearly_id"
    }
  },

  // Admin Configuration
  admin: {
    adminEmails: [
      "your-admin-email@example.com"
    ]
  }
};

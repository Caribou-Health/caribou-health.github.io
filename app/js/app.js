/**
 * ============================================================================
 * Caribou - AI-Powered Patient Care Platform
 * "Because we Caribou-t you"
 * Main Application JavaScript
 * ============================================================================
 *
 * IMPORTANT: This application provides supportive care guidance based on
 * clinician recommendations. It does NOT provide medical advice, diagnosis,
 * or treatment.
 *
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 *
 * KEY DATA STRUCTURES:
 * --------------------
 * - AppState: Central state object holding all user data and UI state
 * - ClinicalDatabase: Condition-specific exercises and nutrition data
 * - MealDatabase: Breakfast/lunch/dinner/snack recipes
 * - AccountSystem: User authentication and profile management
 * - familyProfiles: Multi-user support for Family tier
 *
 * MAIN USER FLOWS:
 * ----------------
 * 1. ONBOARDING (Intake):
 *    welcome → createAccount → intake steps 1-5 → selectTier → dashboard
 *
 * 2. DAILY USE:
 *    dashboard → daily check-in → task categories → complete tasks
 *
 * 3. NAVIGATION:
 *    Dashboard | Nutrition | Medication | Fitness | My Condition | Profile
 *
 * KEY FUNCTIONS (in order of importance):
 * ---------------------------------------
 * - initApp()              : Entry point, checks login state, initializes UI
 * - navigateTo(page)       : Page routing, triggers page-specific updates
 * - updateDashboard()      : Main dashboard refresh function
 * - updateCareOverview()   : Renders the care plan summary card
 * - generateTaskCategories(): Creates PT/Nutrition/Meds/Wellness task lists
 * - generateWeekAhead()    : Renders the 7-day calendar preview
 * - getAllUserConditions() : Returns user's condition IDs (supports multi-condition)
 * - getCombinedExercises() : Merges exercises from multiple conditions
 * - saveState()            : Persists state to localStorage and account
 * - selectTier()           : Finalizes onboarding, sets subscription level
 *
 * TIER SYSTEM:
 * ------------
 * - Free:       1 condition, basic features
 * - Premium:    2-3 conditions, macros, AI personalization
 * - Family:     Multiple profiles, Cura chatbot 24/7
 * - Enterprise: Health coaching, advanced AI
 *
 * DATA PERSISTENCE:
 * -----------------
 * - localStorage: Guest/offline access under 'caribouAppState'
 * - AccountSystem: Logged-in users, syncs across devices
 *
 * CANADIAN MEDICAL SOURCES:
 * -------------------------
 * Clinical data is sourced from trusted Canadian authorities:
 * - Canadian Medical Association (CMA)
 * - Choosing Wisely Canada
 * - Canadian Orthopaedic Association
 * - Peer-reviewed journals (CMAJ, etc.)
 *
 * ============================================================================
 */

// ============================================
// Platform Detection
// ============================================
/**
 * Detects if the app is running as a native mobile app (via Capacitor)
 * or in a web browser. Used to show/hide mobile-specific UI elements.
 */
function isNativeApp() {
  // Check for Capacitor
  if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    return true;
  }
  // Check for Cordova
  if (typeof cordova !== 'undefined') {
    return true;
  }
  // Check if running in a WebView (iOS/Android)
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // iOS WebView detection
  if (/iPhone|iPad|iPod/.test(userAgent) && !window.MSStream && !userAgent.includes('Safari')) {
    return true;
  }
  // Android WebView detection
  if (/Android/.test(userAgent) && /wv/.test(userAgent)) {
    return true;
  }
  return false;
}

/**
 * Check if running on the website version (not native app)
 */
function isWebVersion() {
  return !isNativeApp();
}

// ============================================
// Application State
// ============================================
const AppState = {
  currentPage: 'welcome',
  intakeStep: 1,
  totalIntakeSteps: 5,
  userTier: null,
  hasCompletedIntake: false,
  chatbotOpen: false,
  showCalories: false,
  preferredUnits: 'metric',
  firstVisitDate: null,
  userData: {
    firstName: '',
    // Multi-condition support: primary conditions (up to 3 for Premium+)
    diagnosis: '',           // Primary condition (legacy - still used for free tier)
    primaryConditions: [],   // Array of {id, name, diagnosisDate} for Premium+
    diagnosisDate: '',
    otherConditions: '',     // Sub-conditions (secondary)
    healthBehaviors: [],
    sleepQuality: '',
    chronotype: '',
    avgSleep: '',
    bedtime: '',
    wakeTime: '',
    stressLevel: '',
    hasWorkoutSchedule: null,
    workoutSchedule: '',
    workoutLocation: '',
    equipmentAccess: '',
    intensityPreference: '',
    exerciseFrequency: '',
    preferredExerciseTime: '',
    exerciseDuration: '',
    mobilityLimitations: '',
    dietaryRestrictions: [],
    age: '',
    sex: '',
    height: '',
    weight: '',
    activityLevel: '',
    dietaryHabits: '',
    breakfastTime: '08:00',
    lunchTime: '12:30',
    dinnerTime: '18:30',
    otherDietaryNotes: '',
    medications: '',         // Legacy string format
    medicationsList: [],     // Enhanced: Array of medication objects
    doctorInput: '',
    doctorGoals: '',         // Doctor's goals/recommendations text
    clinicianName: '',
    clinicianPhone: '',
    pharmacyName: '',
    pharmacyPhone: '',
    // Image uploads
    ptInstructionsImage: null,
    conditionInfoImage: null,
    doctorRecommendationsImage: null
  },
  completedTasks: {
    home: [],
    medication: [],
    pt: [],
    nutrition: [],
    wellness: []
  },
  // Meal planning state - tracks which meals are active and servings remaining
  mealPlan: {
    weekStartDate: null,
    meals: {
      breakfast: [], // Array of {mealId, servingsRemaining, startDay}
      lunch: [],
      dinner: [],
      snacks: []
    }
  },
  hydrationCount: 0,
  ptPainLevel: null,
  mealsEatenToday: [],
  isLoading: false,
  dailyCheckin: {
    date: null,
    pain: null,
    sleep: null,
    mood: null
  },
  checkinHistory: []
};

// ============================================
// Common Medication Database (for validation)
// ============================================
const MedicationDatabase = [
  // Pain/Anti-inflammatory
  'Acetaminophen', 'Tylenol', 'Ibuprofen', 'Advil', 'Motrin', 'Naproxen', 'Aleve', 'Aspirin',
  'Celebrex', 'Meloxicam', 'Diclofenac', 'Voltaren',
  // Cardiovascular
  'Lisinopril', 'Amlodipine', 'Metoprolol', 'Atenolol', 'Losartan', 'Valsartan',
  'Hydrochlorothiazide', 'Furosemide', 'Lasix', 'Ramipril', 'Enalapril',
  // Diabetes
  'Metformin', 'Glucophage', 'Glipizide', 'Glyburide', 'Januvia', 'Sitagliptin',
  'Jardiance', 'Empagliflozin', 'Ozempic', 'Trulicity', 'Insulin',
  // Cholesterol
  'Atorvastatin', 'Lipitor', 'Simvastatin', 'Zocor', 'Rosuvastatin', 'Crestor', 'Pravastatin',
  // Thyroid
  'Levothyroxine', 'Synthroid', 'Eltroxin',
  // Antidepressants/Anxiety
  'Sertraline', 'Zoloft', 'Escitalopram', 'Lexapro', 'Fluoxetine', 'Prozac',
  'Citalopram', 'Celexa', 'Venlafaxine', 'Effexor', 'Duloxetine', 'Cymbalta',
  'Bupropion', 'Wellbutrin', 'Lorazepam', 'Ativan', 'Alprazolam', 'Xanax',
  // Antibiotics
  'Amoxicillin', 'Azithromycin', 'Zithromax', 'Ciprofloxacin', 'Cipro',
  'Doxycycline', 'Cephalexin', 'Keflex',
  // GI
  'Omeprazole', 'Prilosec', 'Pantoprazole', 'Protonix', 'Esomeprazole', 'Nexium',
  'Ranitidine', 'Famotidine', 'Pepcid',
  // Blood thinners
  'Warfarin', 'Coumadin', 'Eliquis', 'Apixaban', 'Xarelto', 'Rivaroxaban', 'Plavix', 'Clopidogrel',
  // Respiratory
  'Salbutamol', 'Ventolin', 'Albuterol', 'Fluticasone', 'Flovent', 'Montelukast', 'Singulair',
  // Other common
  'Gabapentin', 'Neurontin', 'Pregabalin', 'Lyrica', 'Cyclobenzaprine', 'Flexeril',
  'Prednisone', 'Methylprednisolone', 'Vitamin D', 'Vitamin B12', 'Iron', 'Calcium'
];

// ============================================
// Toast Notification System
// ============================================
/**
 * showToast - Display a temporary notification message
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', or 'warning'
 * @param {number} duration - How long to show the toast (ms), default 3000
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;

  // Icon based on type
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// Validated Conditions Database (for validation)
// Comprehensive list of all PT-treatable conditions
// ============================================
const ConditionsDatabase = [
  // ==========================================
  // MUSCULOSKELETAL - SPRAINS & STRAINS
  // ==========================================
  { id: 'knee-sprain', name: 'Knee Sprain', aliases: ['knee injury', 'knee ligament', 'acl', 'mcl', 'pcl', 'lcl', 'acl tear', 'mcl tear', 'knee ligament tear'] },
  { id: 'ankle-sprain', name: 'Ankle Sprain', aliases: ['ankle injury', 'twisted ankle', 'rolled ankle', 'ankle ligament', 'lateral ankle sprain', 'high ankle sprain'] },
  { id: 'wrist-sprain', name: 'Wrist Sprain', aliases: ['wrist injury', 'sprained wrist', 'wrist ligament'] },
  { id: 'thumb-sprain', name: 'Thumb Sprain', aliases: ['gamekeeper thumb', 'skier thumb', 'ucl thumb injury'] },
  { id: 'muscle-strain', name: 'Muscle Strain', aliases: ['pulled muscle', 'muscle tear', 'muscle injury', 'strained muscle'] },
  { id: 'hamstring-strain', name: 'Hamstring Strain', aliases: ['hamstring injury', 'pulled hamstring', 'hamstring tear'] },
  { id: 'groin-strain', name: 'Groin Strain', aliases: ['groin pull', 'adductor strain', 'groin injury'] },
  { id: 'calf-strain', name: 'Calf Strain', aliases: ['calf injury', 'pulled calf', 'gastrocnemius strain', 'calf tear'] },
  { id: 'quadriceps-strain', name: 'Quadriceps Strain', aliases: ['quad strain', 'thigh strain', 'quad injury'] },

  // ==========================================
  // BACK & SPINE CONDITIONS
  // ==========================================
  { id: 'back-pain', name: 'Lower Back Pain', aliases: ['back injury', 'lumbar pain', 'lbp', 'back strain', 'lumbar strain'] },
  { id: 'sciatica', name: 'Sciatica', aliases: ['sciatic nerve pain', 'leg pain', 'radiculopathy', 'pinched nerve back'] },
  { id: 'herniated-disc', name: 'Herniated Disc', aliases: ['slipped disc', 'bulging disc', 'disc herniation', 'ruptured disc', 'disc protrusion'] },
  { id: 'degenerative-disc', name: 'Degenerative Disc Disease', aliases: ['ddd', 'disc degeneration', 'spinal degeneration'] },
  { id: 'spinal-stenosis', name: 'Spinal Stenosis', aliases: ['narrowing spine', 'lumbar stenosis', 'cervical stenosis'] },
  { id: 'spondylolisthesis', name: 'Spondylolisthesis', aliases: ['slipped vertebra', 'vertebral slip'] },
  { id: 'scoliosis', name: 'Scoliosis', aliases: ['curved spine', 'spinal curvature', 'spine curve'] },
  { id: 'kyphosis', name: 'Kyphosis', aliases: ['hunchback', 'rounded upper back', 'thoracic kyphosis'] },
  { id: 'neck-pain', name: 'Neck Pain', aliases: ['cervical pain', 'neck strain', 'cervicalgia', 'stiff neck'] },
  { id: 'whiplash', name: 'Whiplash', aliases: ['neck whiplash', 'car accident neck', 'cervical acceleration injury'] },
  { id: 'cervical-radiculopathy', name: 'Cervical Radiculopathy', aliases: ['pinched nerve neck', 'neck nerve pain', 'arm numbness'] },

  // ==========================================
  // SHOULDER CONDITIONS
  // ==========================================
  { id: 'shoulder-injury', name: 'Shoulder Injury', aliases: ['shoulder pain', 'shoulder strain'] },
  { id: 'rotator-cuff', name: 'Rotator Cuff Injury', aliases: ['rotator cuff tear', 'rotator cuff tendinitis', 'shoulder tendon', 'rct'] },
  { id: 'frozen-shoulder', name: 'Frozen Shoulder', aliases: ['adhesive capsulitis', 'stiff shoulder', 'shoulder capsulitis'] },
  { id: 'shoulder-impingement', name: 'Shoulder Impingement', aliases: ['impingement syndrome', 'swimmer shoulder', 'shoulder bursitis'] },
  { id: 'shoulder-dislocation', name: 'Shoulder Dislocation', aliases: ['dislocated shoulder', 'shoulder instability', 'subluxation'] },
  { id: 'labral-tear', name: 'Labral Tear', aliases: ['slap tear', 'shoulder labrum', 'glenoid labrum tear', 'bankart lesion'] },
  { id: 'shoulder-separation', name: 'Shoulder Separation', aliases: ['ac joint separation', 'acromioclavicular injury', 'separated shoulder'] },
  { id: 'biceps-tendinitis', name: 'Biceps Tendinitis', aliases: ['bicep tendon', 'biceps tendinopathy', 'long head biceps'] },

  // ==========================================
  // ELBOW, WRIST & HAND CONDITIONS
  // ==========================================
  { id: 'tennis-elbow', name: 'Tennis Elbow', aliases: ['lateral epicondylitis', 'elbow tendinitis', 'outer elbow pain'] },
  { id: 'golfers-elbow', name: 'Golfers Elbow', aliases: ['medial epicondylitis', 'inner elbow pain'] },
  { id: 'carpal-tunnel', name: 'Carpal Tunnel Syndrome', aliases: ['cts', 'wrist numbness', 'median nerve compression', 'hand tingling'] },
  { id: 'cubital-tunnel', name: 'Cubital Tunnel Syndrome', aliases: ['ulnar nerve entrapment', 'elbow nerve pain', 'funny bone pain'] },
  { id: 'de-quervain', name: 'De Quervain Tenosynovitis', aliases: ['thumb tendinitis', 'texting thumb', 'mommy thumb', 'wrist tendinitis'] },
  { id: 'trigger-finger', name: 'Trigger Finger', aliases: ['stenosing tenosynovitis', 'locked finger', 'clicking finger'] },
  { id: 'dupuytren', name: 'Dupuytren Contracture', aliases: ['dupuytren disease', 'hand contracture', 'palm nodules'] },
  { id: 'hand-fracture', name: 'Hand Fracture Recovery', aliases: ['broken hand', 'metacarpal fracture', 'finger fracture', 'boxer fracture'] },

  // ==========================================
  // HIP CONDITIONS
  // ==========================================
  { id: 'hip-replacement', name: 'Hip Replacement Recovery', aliases: ['hip surgery', 'total hip replacement', 'thr', 'hip arthroplasty', 'tha'] },
  { id: 'hip-pain', name: 'Hip Pain', aliases: ['hip injury', 'hip strain'] },
  { id: 'hip-bursitis', name: 'Hip Bursitis', aliases: ['trochanteric bursitis', 'greater trochanter pain', 'lateral hip pain'] },
  { id: 'hip-labral-tear', name: 'Hip Labral Tear', aliases: ['labrum tear hip', 'hip labrum', 'acetabular labral tear'] },
  { id: 'hip-impingement', name: 'Hip Impingement', aliases: ['fai', 'femoroacetabular impingement', 'cam impingement', 'pincer impingement'] },
  { id: 'piriformis-syndrome', name: 'Piriformis Syndrome', aliases: ['piriformis', 'deep buttock pain', 'sciatic nerve piriformis'] },
  { id: 'it-band-syndrome', name: 'IT Band Syndrome', aliases: ['iliotibial band syndrome', 'itbs', 'runner knee', 'lateral knee pain running'] },
  { id: 'hip-flexor-strain', name: 'Hip Flexor Strain', aliases: ['iliopsoas strain', 'hip flexor injury', 'psoas strain'] },

  // ==========================================
  // KNEE CONDITIONS
  // ==========================================
  { id: 'knee-replacement', name: 'Knee Replacement Recovery', aliases: ['knee surgery', 'total knee replacement', 'tkr', 'knee arthroplasty', 'tka'] },
  { id: 'meniscus-tear', name: 'Meniscus Tear', aliases: ['torn meniscus', 'cartilage tear knee', 'meniscal injury'] },
  { id: 'patellofemoral', name: 'Patellofemoral Pain Syndrome', aliases: ['pfps', 'runner knee', 'anterior knee pain', 'chondromalacia patella'] },
  { id: 'patellar-tendinitis', name: 'Patellar Tendinitis', aliases: ['jumper knee', 'patellar tendinopathy', 'knee tendon pain'] },
  { id: 'knee-osteoarthritis', name: 'Knee Osteoarthritis', aliases: ['knee arthritis', 'degenerative knee', 'knee oa', 'worn knee cartilage'] },
  { id: 'baker-cyst', name: 'Baker Cyst', aliases: ['popliteal cyst', 'knee cyst', 'back of knee swelling'] },
  { id: 'knee-bursitis', name: 'Knee Bursitis', aliases: ['prepatellar bursitis', 'housemaid knee', 'knee swelling'] },
  { id: 'osgood-schlatter', name: 'Osgood-Schlatter Disease', aliases: ['growing pains knee', 'tibial tubercle pain', 'adolescent knee pain'] },

  // ==========================================
  // FOOT & ANKLE CONDITIONS
  // ==========================================
  { id: 'plantar-fasciitis', name: 'Plantar Fasciitis', aliases: ['heel pain', 'plantar fasciopathy', 'heel spur', 'foot arch pain'] },
  { id: 'achilles-tendinitis', name: 'Achilles Tendinitis', aliases: ['achilles tendinopathy', 'heel cord pain', 'achilles injury'] },
  { id: 'achilles-rupture', name: 'Achilles Rupture Recovery', aliases: ['torn achilles', 'achilles tear', 'ruptured achilles'] },
  { id: 'shin-splints', name: 'Shin Splints', aliases: ['medial tibial stress syndrome', 'mtss', 'shin pain', 'tibial pain'] },
  { id: 'stress-fracture', name: 'Stress Fracture', aliases: ['hairline fracture', 'fatigue fracture', 'bone stress injury'] },
  { id: 'morton-neuroma', name: 'Morton Neuroma', aliases: ['foot neuroma', 'toe numbness', 'ball of foot pain'] },
  { id: 'bunion', name: 'Bunion', aliases: ['hallux valgus', 'big toe deformity', 'bunionectomy recovery'] },
  { id: 'flat-feet', name: 'Flat Feet', aliases: ['fallen arches', 'pes planus', 'overpronation'] },
  { id: 'ankle-fracture', name: 'Ankle Fracture Recovery', aliases: ['broken ankle', 'fractured ankle', 'malleolar fracture'] },
  { id: 'foot-drop', name: 'Foot Drop', aliases: ['drop foot', 'peroneal nerve injury', 'ankle weakness'] },

  // ==========================================
  // JOINT REPLACEMENTS & POST-SURGICAL
  // ==========================================
  { id: 'shoulder-replacement', name: 'Shoulder Replacement Recovery', aliases: ['shoulder arthroplasty', 'reverse shoulder replacement', 'tsa'] },
  { id: 'elbow-replacement', name: 'Elbow Replacement Recovery', aliases: ['elbow arthroplasty', 'total elbow replacement'] },
  { id: 'ankle-replacement', name: 'Ankle Replacement Recovery', aliases: ['ankle arthroplasty', 'total ankle replacement'] },
  { id: 'spinal-fusion', name: 'Spinal Fusion Recovery', aliases: ['spine fusion', 'lumbar fusion', 'cervical fusion', 'back surgery'] },
  { id: 'laminectomy', name: 'Laminectomy Recovery', aliases: ['back decompression', 'spinal decompression surgery'] },
  { id: 'discectomy', name: 'Discectomy Recovery', aliases: ['disc surgery', 'microdiscectomy', 'disc removal'] },
  { id: 'acl-reconstruction', name: 'ACL Reconstruction Recovery', aliases: ['acl surgery', 'acl repair', 'anterior cruciate ligament surgery'] },
  { id: 'meniscus-surgery', name: 'Meniscus Surgery Recovery', aliases: ['meniscectomy', 'meniscus repair', 'knee scope'] },
  { id: 'rotator-cuff-surgery', name: 'Rotator Cuff Surgery Recovery', aliases: ['shoulder surgery', 'rotator cuff repair'] },
  { id: 'hip-arthroscopy', name: 'Hip Arthroscopy Recovery', aliases: ['hip scope', 'hip surgery arthroscopic'] },

  // ==========================================
  // ARTHRITIS & JOINT DISEASES
  // ==========================================
  { id: 'arthritis', name: 'Arthritis', aliases: ['osteoarthritis', 'oa', 'degenerative arthritis', 'wear and tear arthritis'] },
  { id: 'rheumatoid-arthritis', name: 'Rheumatoid Arthritis', aliases: ['ra', 'inflammatory arthritis', 'autoimmune arthritis'] },
  { id: 'psoriatic-arthritis', name: 'Psoriatic Arthritis', aliases: ['psa', 'psoriasis arthritis'] },
  { id: 'ankylosing-spondylitis', name: 'Ankylosing Spondylitis', aliases: ['as', 'bamboo spine', 'inflammatory back pain'] },
  { id: 'gout', name: 'Gout', aliases: ['gouty arthritis', 'uric acid', 'big toe gout'] },
  { id: 'juvenile-arthritis', name: 'Juvenile Arthritis', aliases: ['jia', 'juvenile idiopathic arthritis', 'childhood arthritis'] },

  // ==========================================
  // NEUROLOGICAL CONDITIONS
  // ==========================================
  { id: 'stroke-recovery', name: 'Stroke Recovery', aliases: ['stroke', 'cva', 'cerebrovascular accident', 'brain attack', 'tia', 'hemiplegia'] },
  { id: 'parkinsons', name: 'Parkinson Disease', aliases: ['parkinsons disease', 'pd', 'parkinsonism', 'tremor'] },
  { id: 'multiple-sclerosis', name: 'Multiple Sclerosis', aliases: ['ms', 'demyelinating disease'] },
  { id: 'traumatic-brain-injury', name: 'Traumatic Brain Injury', aliases: ['tbi', 'concussion', 'head injury', 'brain injury'] },
  { id: 'spinal-cord-injury', name: 'Spinal Cord Injury', aliases: ['sci', 'paralysis', 'paraplegia', 'quadriplegia', 'tetraplegia'] },
  { id: 'cerebral-palsy', name: 'Cerebral Palsy', aliases: ['cp', 'spastic cerebral palsy'] },
  { id: 'peripheral-neuropathy', name: 'Peripheral Neuropathy', aliases: ['neuropathy', 'nerve damage', 'diabetic neuropathy', 'numbness tingling'] },
  { id: 'bells-palsy', name: 'Bell Palsy', aliases: ['facial paralysis', 'facial palsy', 'facial weakness'] },
  { id: 'guillain-barre', name: 'Guillain-Barre Syndrome', aliases: ['gbs', 'ascending paralysis'] },
  { id: 'vestibular-disorder', name: 'Vestibular Disorder', aliases: ['vertigo', 'dizziness', 'balance disorder', 'bppv', 'menieres', 'labyrinthitis'] },

  // ==========================================
  // CARDIOVASCULAR & PULMONARY
  // ==========================================
  { id: 'cardiac-rehab', name: 'Cardiac Rehabilitation', aliases: ['heart disease', 'heart attack recovery', 'bypass surgery', 'cardiac', 'heart failure', 'coronary artery disease', 'cad', 'mi recovery', 'cabg recovery'] },
  { id: 'copd', name: 'COPD', aliases: ['chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis', 'lung disease'] },
  { id: 'pulmonary-rehab', name: 'Pulmonary Rehabilitation', aliases: ['lung rehab', 'respiratory rehab', 'breathing therapy'] },
  { id: 'post-covid', name: 'Post-COVID Syndrome', aliases: ['long covid', 'covid recovery', 'post-acute covid', 'pasc', 'covid long hauler'] },
  { id: 'asthma', name: 'Asthma Management', aliases: ['asthma', 'reactive airway', 'breathing difficulty'] },
  { id: 'cystic-fibrosis', name: 'Cystic Fibrosis', aliases: ['cf', 'lung cf'] },

  // ==========================================
  // CHRONIC CONDITIONS - METABOLIC
  // ==========================================
  { id: 'diabetes-type2', name: 'Type 2 Diabetes', aliases: ['diabetes', 't2d', 'type 2', 'type ii diabetes', 'adult onset diabetes', 'high blood sugar'] },
  { id: 'diabetes-type1', name: 'Type 1 Diabetes', aliases: ['t1d', 'type 1', 'juvenile diabetes', 'insulin dependent'] },
  { id: 'hypertension', name: 'Hypertension', aliases: ['high blood pressure', 'hbp', 'elevated blood pressure'] },
  { id: 'obesity', name: 'Obesity Management', aliases: ['bariatric', 'metabolic syndrome'] },
  { id: 'osteoporosis', name: 'Osteoporosis', aliases: ['bone loss', 'brittle bones', 'low bone density', 'osteopenia'] },

  // ==========================================
  // WEIGHT MANAGEMENT GOALS
  // ==========================================
  { id: 'weight-loss', name: 'Weight Loss', aliases: ['lose weight', 'weight reduction', 'fat loss', 'slimming', 'diet', 'calorie deficit', 'drop weight'] },
  { id: 'weight-gain', name: 'Weight Gain', aliases: ['gain weight', 'build mass', 'bulk up', 'underweight', 'calorie surplus', 'put on weight', 'muscle gain'] },

  // ==========================================
  // CHRONIC PAIN & FATIGUE
  // ==========================================
  { id: 'fibromyalgia', name: 'Fibromyalgia', aliases: ['fibro', 'chronic pain syndrome', 'widespread pain', 'fms'] },
  { id: 'chronic-fatigue', name: 'Chronic Fatigue Syndrome', aliases: ['cfs', 'me', 'myalgic encephalomyelitis', 'chronic fatigue', 'me/cfs', 'post-viral fatigue'] },
  { id: 'chronic-pain', name: 'Chronic Pain', aliases: ['persistent pain', 'long-term pain', 'pain management'] },
  { id: 'complex-regional-pain', name: 'Complex Regional Pain Syndrome', aliases: ['crps', 'rsd', 'reflex sympathetic dystrophy', 'causalgia'] },
  { id: 'myofascial-pain', name: 'Myofascial Pain Syndrome', aliases: ['trigger points', 'muscle knots', 'mps'] },
  { id: 'temporomandibular', name: 'TMJ Disorder', aliases: ['tmj', 'tmd', 'jaw pain', 'temporomandibular dysfunction', 'jaw clicking'] },
  { id: 'headache-migraine', name: 'Chronic Headache/Migraine', aliases: ['migraine', 'tension headache', 'cervicogenic headache', 'chronic headache'] },

  // ==========================================
  // SPORTS INJURIES
  // ==========================================
  { id: 'concussion', name: 'Concussion Recovery', aliases: ['mild tbi', 'head injury sport', 'brain concussion'] },
  { id: 'sports-hernia', name: 'Sports Hernia', aliases: ['athletic pubalgia', 'groin disruption', 'core muscle injury'] },
  { id: 'turf-toe', name: 'Turf Toe', aliases: ['big toe sprain', 'mtp sprain'] },
  { id: 'compartment-syndrome', name: 'Compartment Syndrome', aliases: ['exertional compartment syndrome', 'leg compartment'] },

  // ==========================================
  // WOMENS HEALTH
  // ==========================================
  { id: 'pelvic-floor', name: 'Pelvic Floor Dysfunction', aliases: ['pelvic floor weakness', 'incontinence', 'prolapse', 'pelvic pain'] },
  { id: 'postpartum', name: 'Postpartum Recovery', aliases: ['post pregnancy', 'after birth recovery', 'diastasis recti', 'c-section recovery'] },
  { id: 'pregnancy-related', name: 'Pregnancy-Related Pain', aliases: ['prenatal pain', 'pregnancy back pain', 'pelvic girdle pain', 'spd'] },
  { id: 'lymphedema', name: 'Lymphedema', aliases: ['lymphatic swelling', 'arm swelling', 'leg swelling', 'post-mastectomy swelling'] },
  { id: 'breast-cancer-rehab', name: 'Breast Cancer Rehabilitation', aliases: ['mastectomy recovery', 'breast surgery rehab', 'cancer rehab'] },

  // ==========================================
  // PEDIATRIC CONDITIONS
  // ==========================================
  { id: 'developmental-delay', name: 'Developmental Delay', aliases: ['motor delay', 'gross motor delay', 'fine motor delay'] },
  { id: 'torticollis', name: 'Torticollis', aliases: ['wry neck', 'twisted neck infant', 'congenital torticollis'] },
  { id: 'plagiocephaly', name: 'Plagiocephaly', aliases: ['flat head syndrome', 'positional plagiocephaly'] },
  { id: 'toe-walking', name: 'Toe Walking', aliases: ['idiopathic toe walking', 'walking on toes'] },
  { id: 'sports-injury-youth', name: 'Youth Sports Injury', aliases: ['little league elbow', 'youth athlete injury', 'growing pains'] },

  // ==========================================
  // GERIATRIC CONDITIONS
  // ==========================================
  { id: 'fall-prevention', name: 'Fall Prevention/Balance', aliases: ['balance training', 'fall risk', 'gait training', 'mobility issues'] },
  { id: 'frailty', name: 'Frailty/Deconditioning', aliases: ['weakness', 'deconditioning', 'generalized weakness', 'hospital deconditioning'] },
  { id: 'hip-fracture', name: 'Hip Fracture Recovery', aliases: ['broken hip', 'femoral neck fracture', 'hip orif'] },
  { id: 'dementia-mobility', name: 'Dementia-Related Mobility', aliases: ['alzheimers mobility', 'cognitive decline mobility'] },

  // ==========================================
  // WORK-RELATED & ERGONOMIC
  // ==========================================
  { id: 'repetitive-strain', name: 'Repetitive Strain Injury', aliases: ['rsi', 'overuse injury', 'cumulative trauma', 'work injury'] },
  { id: 'work-conditioning', name: 'Work Conditioning', aliases: ['work hardening', 'return to work', 'occupational rehab', 'functional capacity'] },
  { id: 'ergonomic-injury', name: 'Ergonomic Injury', aliases: ['desk injury', 'computer injury', 'workplace ergonomics'] },

  // ==========================================
  // TENDINITIS & TENDINOPATHY CONDITIONS
  // ==========================================
  { id: 'tendonitis-general', name: 'Tendonitis (General)', aliases: ['tendonitis', 'tendinitis', 'tendinopathy', 'tendon pain', 'inflamed tendon'] },
  { id: 'wrist-tendonitis', name: 'Wrist Tendonitis', aliases: ['wrist tendinitis', 'wrist tendon pain', 'extensor tendonitis'] },
  { id: 'elbow-tendonitis', name: 'Elbow Tendonitis', aliases: ['elbow tendinitis', 'triceps tendonitis'] },
  { id: 'shoulder-tendonitis', name: 'Shoulder Tendonitis', aliases: ['shoulder tendinitis', 'supraspinatus tendonitis'] },
  { id: 'knee-tendonitis', name: 'Knee Tendonitis', aliases: ['knee tendinitis', 'quadriceps tendonitis'] },
  { id: 'ankle-tendonitis', name: 'Ankle Tendonitis', aliases: ['ankle tendinitis', 'peroneal tendonitis', 'posterior tibial tendonitis'] },
  { id: 'hip-tendonitis', name: 'Hip Tendonitis', aliases: ['hip tendinitis', 'gluteal tendonitis', 'abductor tendonitis'] },

  // ==========================================
  // HEADACHE & MIGRAINE CONDITIONS (expanded)
  // ==========================================
  { id: 'migraine', name: 'Migraine', aliases: ['migraines', 'migraine headache', 'migraine with aura', 'migraine without aura', 'chronic migraine'] },
  { id: 'tension-headache', name: 'Tension Headache', aliases: ['tension type headache', 'stress headache', 'muscle tension headache'] },
  { id: 'cluster-headache', name: 'Cluster Headache', aliases: ['cluster headaches', 'suicide headache'] },
  { id: 'cervicogenic-headache', name: 'Cervicogenic Headache', aliases: ['neck headache', 'headache from neck', 'referred head pain'] },

  // ==========================================
  // ADDITIONAL COMMON CONDITIONS
  // ==========================================
  { id: 'bursitis-general', name: 'Bursitis (General)', aliases: ['bursitis', 'inflamed bursa', 'bursa inflammation'] },
  { id: 'scapular-dyskinesis', name: 'Scapular Dyskinesis', aliases: ['winged scapula', 'shoulder blade dysfunction', 'scapular dysfunction'] },
  { id: 'thoracic-outlet', name: 'Thoracic Outlet Syndrome', aliases: ['tos', 'thoracic outlet', 'arm numbness tingling'] },
  { id: 'posture-problems', name: 'Postural Dysfunction', aliases: ['poor posture', 'posture problems', 'forward head posture', 'rounded shoulders', 'text neck'] },
  { id: 'sacroiliac-dysfunction', name: 'SI Joint Dysfunction', aliases: ['sacroiliac joint pain', 'si joint', 'sacroiliitis', 'si dysfunction'] },
  { id: 'rib-dysfunction', name: 'Rib Dysfunction', aliases: ['rib pain', 'costochondritis', 'rib subluxation', 'rib out of place'] },
  { id: 'nerve-entrapment', name: 'Nerve Entrapment', aliases: ['pinched nerve', 'trapped nerve', 'nerve compression', 'radiculopathy'] },
  { id: 'muscle-imbalance', name: 'Muscle Imbalance', aliases: ['muscular imbalance', 'strength imbalance', 'muscle weakness'] },
  { id: 'joint-hypermobility', name: 'Joint Hypermobility', aliases: ['hypermobility', 'double jointed', 'ehlers danlos', 'eds', 'benign hypermobility'] },
  { id: 'scar-tissue', name: 'Scar Tissue Mobilization', aliases: ['scar tissue', 'adhesions', 'post-surgical scarring', 'scar pain'] },

  // ==========================================
  // GENERAL WELLNESS (minimal PT intervention)
  // ==========================================
  { id: 'general-wellness', name: 'General Wellness', aliases: ['wellness', 'general fitness', 'preventive care', 'health maintenance', 'fitness goals'] },
  { id: 'stress-management', name: 'Stress Management', aliases: ['stress', 'anxiety management', 'relaxation', 'stress relief'] },
  { id: 'sleep-improvement', name: 'Sleep Improvement', aliases: ['sleep issues', 'insomnia', 'sleep quality', 'sleep hygiene'] },
  { id: 'weight-management', name: 'Weight Management', aliases: ['weight loss', 'weight gain', 'healthy weight', 'body composition'] },
  { id: 'flexibility-training', name: 'Flexibility Training', aliases: ['stretching', 'flexibility', 'mobility training', 'range of motion'] },
  { id: 'strength-training', name: 'Strength Training', aliases: ['strength building', 'resistance training', 'muscle building'] },

  // ==========================================
  // OTHER (catch-all)
  // ==========================================
  { id: 'other', name: 'Other Condition', aliases: ['other', 'not listed', 'different condition', 'unlisted'] }
];

// Validate and match user input to a known condition
function validateCondition(userInput) {
  if (!userInput) return null;

  const input = userInput.toLowerCase().trim();

  // Direct ID match
  const directMatch = ConditionsDatabase.find(c => c.id === input);
  if (directMatch) return directMatch;

  // Name match
  const nameMatch = ConditionsDatabase.find(c =>
    c.name.toLowerCase() === input ||
    c.name.toLowerCase().includes(input) ||
    input.includes(c.name.toLowerCase())
  );
  if (nameMatch) return nameMatch;

  // Alias match
  const aliasMatch = ConditionsDatabase.find(c =>
    c.aliases.some(alias =>
      alias.toLowerCase() === input ||
      alias.toLowerCase().includes(input) ||
      input.includes(alias.toLowerCase())
    )
  );
  if (aliasMatch) return aliasMatch;

  return null;
}

// Get condition suggestions based on partial input
function getConditionSuggestions(partialInput) {
  if (!partialInput || partialInput.length < 2) return [];

  const input = partialInput.toLowerCase().trim();

  return ConditionsDatabase.filter(c => {
    if (c.name.toLowerCase().includes(input)) return true;
    if (c.aliases.some(alias => alias.toLowerCase().includes(input))) return true;
    return false;
  }).slice(0, 5); // Return max 5 suggestions
}

// Live validation for other conditions input
function validateOtherConditionsInput(textarea) {
  const validationDiv = document.getElementById('other-conditions-validation');
  if (!validationDiv) return;

  const value = textarea.value.trim();
  if (!value) {
    validationDiv.style.display = 'none';
    return;
  }

  // Parse conditions
  const conditions = value.split(/[,\n;]+/).map(c => c.trim()).filter(c => c.length > 1);

  if (conditions.length === 0) {
    validationDiv.style.display = 'none';
    return;
  }

  // Validate each condition
  const results = conditions.map(c => {
    const validated = validateCondition(c);
    return {
      input: c,
      validated: validated,
      isValid: validated !== null
    };
  });

  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.filter(r => !r.isValid).length;

  // Build validation message
  let html = '';
  results.forEach(r => {
    if (r.isValid) {
      html += `<div class="validation-item">
        <svg class="validation-icon valid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>${r.input} → <strong>${r.validated.name}</strong></span>
      </div>`;
    } else {
      const suggestions = getConditionSuggestions(r.input);
      const suggestionText = suggestions.length > 0
        ? ` (Did you mean: ${suggestions.slice(0, 2).map(s => s.name).join(', ')}?)`
        : '';
      html += `<div class="validation-item">
        <svg class="validation-icon invalid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/>
        </svg>
        <span>"${r.input}" not recognized${suggestionText}</span>
      </div>`;
    }
  });

  // Set class based on results
  validationDiv.className = 'form-validation-message ' + (invalidCount === 0 ? 'success' : 'warning');
  validationDiv.innerHTML = html;
  validationDiv.style.display = 'block';
}

// ============================================
// Condition-Specific Clinical Data
// ============================================

/**
 * ClinicalDatabase - Repository of condition-specific care plan data
 *
 * This database contains evidence-based information for each supported condition.
 * Data is sourced from Canadian medical authorities including:
 * - Canadian Orthopaedic Association
 * - Choosing Wisely Canada
 * - Canadian Medical Association (CMA)
 * - Peer-reviewed Canadian medical journals (CMAJ, etc.)
 *
 * STRUCTURE:
 * ClinicalDatabase.conditions[conditionId] = {
 *   name: string,           // Display name (e.g., "Knee Sprain")
 *   description: string,    // Patient-friendly explanation
 *   clinicalInfo: {         // Medical reference information
 *     definition: string,
 *     prevalence: string,
 *     prognosis: string,
 *     reference: string     // Citation sources
 *   },
 *   exercises: [{           // Physical therapy exercises
 *     name, sets, reps, duration, time, description, holdTime
 *   }],
 *   nutritionGuidelines: [string],  // Dietary recommendations
 *   ptDuration: number,     // Expected daily PT minutes
 *   recoveryWeeks: number   // Typical recovery timeline
 * }
 *
 * SUPPORTED CONDITIONS:
 * - Musculoskeletal: knee-sprain, ankle-sprain, back-pain, shoulder-injury
 * - Chronic: hypertension, arthritis, chronic-fatigue, fibromyalgia
 * - Post-surgical: hip-replacement, knee-replacement
 * - Cardiopulmonary: cardiac-rehab, copd
 * - Fallback: 'other' (general wellness)
 *
 * METHODS:
 * - getConditionData(conditionId): Returns condition object or 'other' fallback
 */
const ClinicalDatabase = {
  conditions: {
    'knee-sprain': {
      name: 'Knee Sprain',
      description: 'A knee sprain occurs when one or more ligaments in the knee are stretched or torn. This commonly happens during sports activities, falls, or sudden twisting movements. Recovery involves rest, ice, compression, and elevation (RICE), along with physical therapy exercises to restore strength and mobility.',
      clinicalInfo: {
        definition: 'Knee sprains involve injury to one or more of the four major ligaments: anterior cruciate (ACL), posterior cruciate (PCL), medial collateral (MCL), or lateral collateral (LCL). Grade I sprains involve stretching without tearing; Grade II involve partial tears; Grade III involve complete tears.',
        prevalence: 'Knee injuries are among the most common musculoskeletal injuries in Canada, with ligament sprains accounting for approximately 40% of sports-related knee injuries.',
        prognosis: 'Most Grade I and II sprains heal within 2-8 weeks with conservative treatment. Grade III injuries may require surgical intervention. Early mobilization and physical therapy significantly improve outcomes.',
        reference: 'Canadian Orthopaedic Association; Choosing Wisely Canada; Canadian Academy of Sport and Exercise Medicine'
      },
      nutritionGuidelines: [
        'Anti-inflammatory foods like fatty fish, berries, and leafy greens can support healing',
        'Adequate protein (lean meats, fish, legumes) helps tissue repair',
        'Stay hydrated - water supports joint lubrication',
        'Vitamin C rich foods (citrus, bell peppers) support collagen synthesis',
        'Limit processed foods and excess sugar which may increase inflammation'
      ],
      exercises: [
        { name: 'Quad Sets', sets: 3, reps: 10, holdTime: 5, duration: '10 reps, hold 5 seconds each', time: '09:00', description: 'Tighten thigh muscle by pressing back of knee into floor. Hold, then release.' },
        { name: 'Heel Slides', sets: 2, reps: 10, duration: '10 reps each side', time: '09:15', description: 'Lying down, slowly slide heel toward buttock, bending knee. Return to start.' },
        { name: 'Straight Leg Raises', sets: 3, reps: 10, duration: '10 reps', time: '14:00', description: 'Lying down, tighten thigh and lift leg 6-8 inches. Hold 3 seconds, lower slowly.' },
        { name: 'Ankle Pumps', sets: 2, reps: 20, duration: '20 reps', time: '14:15', description: 'Flex foot up and down to promote circulation and reduce swelling.' }
      ],
      ptDuration: 20,
      recoveryWeeks: 4
    },
    'ankle-sprain': {
      name: 'Ankle Sprain',
      description: 'An ankle sprain is an injury to the ligaments that support the ankle joint. It typically occurs when the foot twists or rolls beyond its normal range of motion. Treatment focuses on reducing swelling, restoring range of motion, and strengthening the surrounding muscles to prevent future injuries.',
      clinicalInfo: {
        definition: 'Ankle sprains involve injury to the ligaments surrounding the ankle joint, most commonly the anterior talofibular ligament (ATFL). Classified as Grade I (mild stretch), Grade II (partial tear), or Grade III (complete rupture).',
        prevalence: 'Ankle sprains are the most common musculoskeletal injury in Canada, accounting for 10-30% of sports injuries and affecting approximately 1 in 10,000 Canadians daily.',
        prognosis: 'With appropriate treatment, 85% of ankle sprains heal without long-term complications. Early functional rehabilitation reduces recovery time and recurrence risk by up to 50%.',
        reference: 'Canadian Medical Association Journal (CMAJ); Choosing Wisely Canada; Parachute Canada'
      },
      nutritionGuidelines: [
        'Protein-rich foods support ligament healing',
        'Omega-3 fatty acids from fish can help reduce inflammation',
        'Vitamin C and zinc support tissue repair',
        'Calcium and vitamin D for bone health',
        'Limit alcohol which can slow healing'
      ],
      exercises: [
        { name: 'Ankle Alphabet', sets: 2, reps: 3, duration: '2-3 times', time: '09:00', description: 'Draw letters A-Z in the air with your toe to improve range of motion.' },
        { name: 'Towel Scrunches', sets: 3, reps: 10, duration: '10 reps', time: '09:15', description: 'Place towel on floor and scrunch it toward you using only your toes.' },
        { name: 'Calf Raises', sets: 2, reps: 10, duration: '10 reps (when cleared)', time: '14:00', description: 'Stand and slowly rise onto toes, hold, then lower. Use support if needed.' },
        { name: 'Balance Practice', sets: 2, reps: 1, holdTime: 30, duration: '30 seconds each side', time: '14:15', description: 'Stand on affected leg, maintain balance. Use wall for support initially.' }
      ],
      ptDuration: 15,
      recoveryWeeks: 6
    },
    'back-pain': {
      name: 'Lower Back Pain',
      description: 'Lower back pain is one of the most common health complaints, affecting the muscles, nerves, and bones of the spine. It can result from muscle strain, poor posture, disc problems, or other conditions. Management includes gentle exercises, proper ergonomics, and lifestyle modifications.',
      clinicalInfo: {
        definition: 'Non-specific lower back pain (LBP) refers to pain in the lumbosacral region without identifiable pathology. It may involve muscular, ligamentous, discogenic, or facet joint structures.',
        prevalence: 'LBP affects up to 84% of Canadian adults at some point in their lives. It is the leading cause of disability and the most common reason for physician visits and missed work days in Canada.',
        prognosis: 'Approximately 90% of acute LBP episodes resolve within 6 weeks. Evidence supports that staying active and avoiding prolonged bed rest improves outcomes. Physical therapy reduces recurrence risk.',
        reference: 'Choosing Wisely Canada; Canadian Medical Association; Canadian Chiropractic Guideline Initiative; The Lancet Series on Low Back Pain'
      },
      nutritionGuidelines: [
        'Maintain healthy weight to reduce strain on spine',
        'Anti-inflammatory foods may help manage discomfort',
        'Calcium and vitamin D for bone health',
        'Magnesium-rich foods (nuts, seeds, leafy greens) support muscle function',
        'Stay hydrated for spinal disc health'
      ],
      exercises: [
        { name: 'Pelvic Tilts', sets: 3, reps: 10, holdTime: 5, duration: '10 reps', time: '09:00', description: 'Lying on back, tighten abs and press small of back into floor. Hold 5 seconds.' },
        { name: 'Knee-to-Chest Stretch', sets: 2, reps: 1, holdTime: 30, duration: '30 seconds each side', time: '09:15', description: 'Pull one knee gently toward chest while lying down. Keep other leg flat.' },
        { name: 'Cat-Cow Stretch', sets: 2, reps: 10, duration: '10 cycles', time: '14:00', description: 'On hands and knees, alternate between arching and rounding your back.' },
        { name: 'Bird-Dog', sets: 2, reps: 10, holdTime: 3, duration: '10 reps each side', time: '14:15', description: 'On hands and knees, extend opposite arm and leg. Hold 3 seconds.' }
      ],
      ptDuration: 20,
      recoveryWeeks: 8
    },
    'shoulder-injury': {
      name: 'Shoulder Injury',
      description: 'Shoulder injuries can affect the muscles, tendons, and ligaments surrounding the shoulder joint. Common issues include rotator cuff injuries, bursitis, and frozen shoulder. Treatment typically involves rest, physical therapy, and gradual return to normal activities.',
      clinicalInfo: {
        definition: 'Shoulder injuries encompass a range of pathologies including rotator cuff tendinopathy, impingement syndrome, adhesive capsulitis (frozen shoulder), and labral tears. The shoulder complex includes the glenohumeral, acromioclavicular, and scapulothoracic joints.',
        prevalence: 'Shoulder pain affects 18-26% of Canadian adults at any given time. Rotator cuff disorders account for up to 70% of shoulder pain cases. Incidence increases with age, particularly after 40.',
        prognosis: 'Conservative treatment with physical therapy is effective for 60-80% of shoulder injuries. Early intervention and adherence to rehabilitation programs significantly improve functional outcomes.',
        reference: 'Canadian Orthopaedic Association; Choosing Wisely Canada; Canadian Medical Association Journal (CMAJ)'
      },
      nutritionGuidelines: [
        'Protein supports muscle and tendon repair',
        'Omega-3 fatty acids may help reduce inflammation',
        'Vitamin C supports collagen production',
        'Zinc aids in tissue healing',
        'Stay well-hydrated'
      ],
      exercises: [
        { name: 'Pendulum Swings', sets: 2, reps: 1, duration: '1 minute', time: '09:00', description: 'Lean forward, let arm hang and swing gently in circles. Very gentle movement.' },
        { name: 'Passive External Rotation', sets: 2, reps: 10, duration: '10 reps', time: '09:15', description: 'Use other arm to gently rotate affected arm outward while elbow stays at side.' },
        { name: 'Scapular Squeezes', sets: 3, reps: 10, holdTime: 5, duration: '10 reps, hold 5 seconds', time: '14:00', description: 'Squeeze shoulder blades together as if holding a pencil between them.' },
        { name: 'Wall Slides', sets: 2, reps: 10, duration: '10 reps', time: '14:15', description: 'Stand with back against wall, slide arms up and down while maintaining contact.' }
      ],
      ptDuration: 20,
      recoveryWeeks: 8
    },
    'diabetes-type2': {
      name: 'Type 2 Diabetes',
      description: 'Type 2 diabetes is a chronic condition affecting how your body processes blood sugar (glucose). Management involves monitoring blood sugar levels, maintaining a healthy diet, regular physical activity, and medication as prescribed. Lifestyle changes are essential for long-term health.',
      clinicalInfo: {
        definition: 'Type 2 diabetes mellitus (T2DM) is characterized by insulin resistance and relative insulin deficiency, leading to chronic hyperglycemia. It is associated with metabolic syndrome, cardiovascular disease, and microvascular complications.',
        prevalence: 'Over 3.4 million Canadians live with diabetes, with 90% having Type 2. Indigenous peoples, South Asian, and African Canadian populations face 2-4 times higher risk. Diabetes costs the Canadian healthcare system approximately $30 billion annually.',
        prognosis: 'With proper management including lifestyle modifications, medication adherence, and regular monitoring, individuals with T2DM can achieve good glycemic control and reduce complication risk. Diabetes Canada recommends HbA1c targets of 7.0% or lower for most adults.',
        reference: 'Diabetes Canada Clinical Practice Guidelines; Public Health Agency of Canada; Choosing Wisely Canada'
      },
      nutritionGuidelines: [
        'Focus on complex carbohydrates with low glycemic index',
        'Include fiber-rich foods to help manage blood sugar',
        'Choose lean proteins and healthy fats',
        'Portion control is important for glucose management',
        'Regular meal timing helps maintain stable blood sugar',
        'Limit added sugars and refined carbohydrates'
      ],
      exercises: [
        { name: 'Morning Walk', sets: 1, reps: 1, duration: '15-20 minutes', time: '09:00', description: 'Gentle walking helps regulate blood sugar. Walk at a comfortable pace.' },
        { name: 'Chair Squats', sets: 2, reps: 10, duration: '10 reps', time: '10:00', description: 'Stand up from chair and sit back down. Use arms for support if needed.' },
        { name: 'Afternoon Activity', sets: 1, reps: 1, duration: '10 minutes', time: '15:00', description: 'Light activity like walking after meals can help manage blood sugar.' },
        { name: 'Stretching Routine', sets: 1, reps: 1, duration: '10 minutes', time: '19:00', description: 'Gentle full-body stretches to maintain flexibility and circulation.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'hypertension': {
      name: 'Hypertension',
      description: 'Hypertension (high blood pressure) is a common condition where the force of blood against artery walls is consistently too high. It can lead to serious health problems if untreated. Management includes dietary changes (reducing sodium, following DASH diet), exercise, stress reduction, and medication.',
      clinicalInfo: {
        definition: 'Hypertension is defined as sustained blood pressure ≥140/90 mmHg or ≥130/80 mmHg for high-risk patients. Categories include Stage 1 (130-139/80-89), Stage 2 (≥140/90), and hypertensive crisis (>180/120).',
        prevalence: 'Approximately 7.5 million Canadian adults (23% of the population) have hypertension. It is a leading risk factor for cardiovascular disease, stroke, and kidney disease.',
        prognosis: 'With proper treatment including lifestyle modifications and medications when needed, most people can achieve target blood pressure. Hypertension Canada recommends home blood pressure monitoring for accurate assessment.',
        reference: 'Hypertension Canada Guidelines; Heart & Stroke Foundation of Canada; Public Health Agency of Canada'
      },
      nutritionGuidelines: [
        'Reduce sodium intake (aim for less than 2300mg daily)',
        'Increase potassium-rich foods (bananas, potatoes, spinach)',
        'Follow DASH diet principles if recommended by your clinician',
        'Limit alcohol and caffeine intake',
        'Focus on whole grains, fruits, vegetables, and lean proteins',
        'Maintain healthy weight'
      ],
      exercises: [
        { name: 'Morning Walk', sets: 1, reps: 1, duration: '20 minutes', time: '08:00', description: 'Moderate-paced walking. Stop if you feel dizzy or short of breath.' },
        { name: 'Deep Breathing', sets: 1, reps: 1, duration: '5 minutes', time: '12:00', description: 'Slow, deep breaths can help manage stress and blood pressure.' },
        { name: 'Light Stretching', sets: 1, reps: 1, duration: '10 minutes', time: '17:00', description: 'Gentle stretches to maintain flexibility. Avoid holding breath.' },
        { name: 'Evening Relaxation', sets: 1, reps: 1, duration: '10 minutes', time: '20:00', description: 'Relaxation exercises or gentle yoga to reduce stress.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'arthritis': {
      name: 'Arthritis',
      description: 'Arthritis involves inflammation of one or more joints, causing pain and stiffness that can worsen with age. There are many types, with osteoarthritis and rheumatoid arthritis being the most common. Management includes maintaining joint mobility, reducing inflammation through diet and medication, and protecting joints during activities.',
      clinicalInfo: {
        definition: 'Arthritis encompasses over 100 conditions affecting joints. Osteoarthritis (OA) involves cartilage breakdown; rheumatoid arthritis (RA) is an autoimmune condition causing joint inflammation.',
        prevalence: 'Over 6 million Canadians live with arthritis, representing 1 in 5 adults. It is the most common cause of disability in Canada and prevalence is expected to increase to 9 million by 2040.',
        prognosis: 'While arthritis is a chronic condition, early intervention with exercise, weight management, and appropriate medications can significantly improve quality of life and slow disease progression.',
        reference: 'Arthritis Society Canada; Canadian Rheumatology Association; Public Health Agency of Canada; Choosing Wisely Canada'
      },
      nutritionGuidelines: [
        'Anti-inflammatory foods: fatty fish, berries, leafy greens, olive oil',
        'Vitamin D and calcium for bone health',
        'Omega-3 fatty acids may help reduce joint inflammation',
        'Maintain healthy weight to reduce joint stress',
        'Stay hydrated to keep joints lubricated',
        'Consider limiting nightshade vegetables if advised by your clinician'
      ],
      exercises: [
        { name: 'Range of Motion', sets: 1, reps: 1, duration: '5-10 minutes', time: '09:00', description: 'Gentle joint movements through full range. Do not push through pain.' },
        { name: 'Water Walking', sets: 1, reps: 1, duration: '15 minutes (if available)', time: '11:00', description: 'Walking in a pool reduces joint stress while building strength.' },
        { name: 'Hand Exercises', sets: 1, reps: 1, duration: '5 minutes', time: '14:00', description: 'Make fists, spread fingers, touch each fingertip to thumb.' },
        { name: 'Gentle Stretching', sets: 1, reps: 1, duration: '10 minutes', time: '19:00', description: 'Slow, gentle stretches for affected joints. Hold positions, don\'t bounce.' }
      ],
      ptDuration: 25,
      recoveryWeeks: null
    },
    'chronic-fatigue': {
      name: 'Chronic Fatigue Syndrome',
      description: 'Chronic Fatigue Syndrome (CFS/ME) is a complex condition characterized by extreme fatigue that doesn\'t improve with rest and may worsen with physical or mental activity. Management focuses on pacing activities, gentle movement, stress reduction, and optimizing sleep and nutrition.',
      nutritionGuidelines: [
        'Eat regular, balanced meals to maintain stable energy levels',
        'Focus on whole foods and avoid processed foods',
        'Stay well-hydrated throughout the day',
        'Consider anti-inflammatory foods (fatty fish, leafy greens, berries)',
        'Limit caffeine and sugar which can cause energy crashes',
        'Eat smaller, frequent meals to avoid energy dips'
      ],
      exercises: [
        { name: 'Gentle Stretching', sets: 1, reps: 1, duration: '5-10 minutes', time: '10:00', description: 'Very gentle stretches. Stop if you feel any increase in fatigue.' },
        { name: 'Paced Walking', sets: 1, reps: 1, duration: '5-15 minutes', time: '14:00', description: 'Short, slow walk. Rest as needed. Do not push through fatigue.' },
        { name: 'Breathing Exercises', sets: 1, reps: 1, duration: '5 minutes', time: '16:00', description: 'Deep, slow breathing to promote relaxation and reduce stress.' },
        { name: 'Restorative Rest', sets: 1, reps: 1, duration: '20 minutes', time: '15:00', description: 'Lie down in a quiet space. This is not sleep but restful awareness.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'fibromyalgia': {
      name: 'Fibromyalgia',
      description: 'Fibromyalgia is a chronic condition causing widespread musculoskeletal pain, fatigue, and tenderness. Management includes gentle exercise, stress reduction, quality sleep, and medications as prescribed. Pacing activities is essential to prevent flare-ups.',
      nutritionGuidelines: [
        'Anti-inflammatory diet may help reduce symptoms',
        'Adequate vitamin D and magnesium are important',
        'Stay hydrated to support muscle function',
        'Limit processed foods, caffeine, and alcohol',
        'Consider keeping a food diary to identify triggers',
        'Eat regular meals to maintain energy'
      ],
      exercises: [
        { name: 'Warm Water Exercise', sets: 1, reps: 1, duration: '15-20 minutes', time: '10:00', description: 'Gentle movements in warm water if available. Very therapeutic for fibromyalgia.' },
        { name: 'Gentle Stretching', sets: 1, reps: 1, duration: '10 minutes', time: '09:00', description: 'Slow, gentle stretches. Hold each stretch, never bounce.' },
        { name: 'Tai Chi/Qigong', sets: 1, reps: 1, duration: '10-15 minutes', time: '11:00', description: 'Slow, flowing movements. Can be done seated if needed.' },
        { name: 'Relaxation Practice', sets: 1, reps: 1, duration: '15 minutes', time: '20:00', description: 'Progressive muscle relaxation or guided meditation.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'hip-replacement': {
      name: 'Hip Replacement Recovery',
      description: 'Hip replacement surgery replaces a damaged hip joint with an artificial one. Recovery involves physical therapy to restore strength and mobility, following precautions to protect the new joint, and gradually returning to normal activities.',
      nutritionGuidelines: [
        'High protein intake supports tissue healing',
        'Iron-rich foods help prevent post-surgical anemia',
        'Calcium and vitamin D for bone health',
        'Fiber to prevent constipation from pain medications',
        'Stay well-hydrated',
        'Vitamin C supports wound healing'
      ],
      exercises: [
        { name: 'Ankle Pumps', sets: 3, reps: 20, duration: '3 sets of 20', time: '09:00', description: 'Pump ankles up and down to promote circulation. Do frequently.' },
        { name: 'Quad Sets', sets: 3, reps: 10, holdTime: 5, duration: '10 reps, hold 5 sec', time: '10:00', description: 'Tighten thigh muscle, push knee into bed. Hold and release.' },
        { name: 'Heel Slides', sets: 2, reps: 10, duration: '10 reps', time: '14:00', description: 'Slide heel toward buttock, bending knee. Keep hip precautions in mind.' },
        { name: 'Standing Hip Abduction', sets: 2, reps: 10, duration: '10 reps (when cleared)', time: '15:00', description: 'Hold support, lift leg to side. Keep toes forward.' }
      ],
      ptDuration: 30,
      recoveryWeeks: 12
    },
    'knee-replacement': {
      name: 'Knee Replacement Recovery',
      description: 'Knee replacement surgery replaces damaged knee joint surfaces with artificial components. Recovery focuses on regaining range of motion and strength through physical therapy, managing swelling, and gradually returning to activities.',
      nutritionGuidelines: [
        'Protein-rich foods support tissue healing',
        'Anti-inflammatory foods may help with swelling',
        'Iron to support recovery from surgery',
        'Fiber prevents constipation from medications',
        'Calcium and vitamin D for bone health',
        'Adequate hydration supports healing'
      ],
      exercises: [
        { name: 'Ankle Pumps', sets: 3, reps: 20, duration: '3 sets of 20', time: '09:00', description: 'Pump ankles frequently to prevent blood clots.' },
        { name: 'Quad Sets', sets: 3, reps: 10, holdTime: 5, duration: '10 reps, hold 5 sec', time: '10:00', description: 'Tighten thigh, push knee flat. Essential for knee control.' },
        { name: 'Straight Leg Raises', sets: 3, reps: 10, duration: '10 reps', time: '11:00', description: 'Tighten thigh, lift leg 6 inches. Keep knee straight.' },
        { name: 'Knee Bending', sets: 2, reps: 10, duration: '10 reps', time: '14:00', description: 'Seated, slide foot back to bend knee. Use strap if needed.' }
      ],
      ptDuration: 30,
      recoveryWeeks: 12
    },
    'cardiac-rehab': {
      name: 'Cardiac Rehabilitation',
      description: 'Cardiac rehabilitation is a medically supervised program for people recovering from heart attacks, heart surgery, or other heart conditions. It includes monitored exercise, education, and lifestyle counseling.',
      clinicalInfo: {
        definition: 'Cardiac rehabilitation (CR) is a comprehensive program including supervised exercise training, education, and counseling designed to improve cardiovascular health after a cardiac event or procedure.',
        prevalence: 'Heart disease affects approximately 2.4 million Canadian adults. Despite strong evidence, only 20-40% of eligible Canadians participate in cardiac rehabilitation programs.',
        prognosis: 'Completing cardiac rehabilitation reduces mortality by 20-30% and hospital readmissions by 25%. It improves quality of life, exercise capacity, and cardiovascular risk factors.',
        reference: 'Heart & Stroke Foundation of Canada; Canadian Association of Cardiac Rehabilitation; Canadian Cardiovascular Society'
      },
      nutritionGuidelines: [
        'Heart-healthy diet: low in saturated fat and sodium',
        'Increase omega-3 fatty acids (fatty fish, walnuts)',
        'Plenty of fruits, vegetables, and whole grains',
        'Limit alcohol consumption',
        'Control portion sizes',
        'Read food labels for sodium content'
      ],
      exercises: [
        { name: 'Monitored Walking', sets: 1, reps: 1, duration: '20-30 minutes', time: '09:00', description: 'Walk at prescribed pace. Monitor heart rate as instructed.' },
        { name: 'Light Stretching', sets: 1, reps: 1, duration: '10 minutes', time: '08:30', description: 'Gentle warm-up stretches before activity.' },
        { name: 'Stationary Activity', sets: 1, reps: 1, duration: '15-20 minutes', time: '15:00', description: 'Stationary bike or similar at prescribed intensity.' },
        { name: 'Cool Down', sets: 1, reps: 1, duration: '5-10 minutes', time: '09:30', description: 'Gradual reduction in activity intensity.' }
      ],
      ptDuration: 45,
      recoveryWeeks: 12
    },
    'stroke-recovery': {
      name: 'Stroke Recovery',
      description: 'Stroke recovery involves rehabilitation to regain functions affected by the stroke, which may include movement, speech, and cognitive abilities. Recovery is highly individual and continues over months to years.',
      nutritionGuidelines: [
        'Heart-healthy diet to prevent future strokes',
        'Low sodium to manage blood pressure',
        'Adequate protein for tissue repair',
        'Texture modifications if swallowing is affected',
        'Stay well-hydrated',
        'Mediterranean diet principles are beneficial'
      ],
      exercises: [
        { name: 'Range of Motion', sets: 2, reps: 10, duration: '10 reps each joint', time: '09:00', description: 'Move affected limbs through available range. Can be assisted.' },
        { name: 'Seated Balance', sets: 1, reps: 1, duration: '5-10 minutes', time: '10:00', description: 'Practice sitting balance with support as needed.' },
        { name: 'Hand/Arm Exercises', sets: 2, reps: 10, duration: '10 reps', time: '14:00', description: 'Squeeze ball, finger movements, arm lifts as able.' },
        { name: 'Standing Practice', sets: 1, reps: 1, duration: '5-10 minutes', time: '15:00', description: 'Stand with support. Progress as directed by therapist.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'copd': {
      name: 'COPD',
      description: 'Chronic Obstructive Pulmonary Disease (COPD) is a chronic inflammatory lung disease causing obstructed airflow. Management includes medications, breathing techniques, pulmonary rehabilitation, and avoiding irritants.',
      clinicalInfo: {
        definition: 'COPD is a chronic, progressive lung disease characterized by persistent respiratory symptoms and airflow limitation due to airway and/or alveolar abnormalities, usually caused by significant exposure to noxious particles or gases.',
        prevalence: 'COPD affects approximately 2 million Canadians and is the fourth leading cause of death in Canada. Many cases remain undiagnosed. Smoking is the primary cause in 80-90% of cases.',
        prognosis: 'While COPD cannot be cured, early diagnosis and proper management including smoking cessation, medications, and pulmonary rehabilitation can significantly improve symptoms and quality of life.',
        reference: 'Canadian Thoracic Society; COPD Canada; Lung Health Foundation; Public Health Agency of Canada'
      },
      nutritionGuidelines: [
        'Eat smaller, more frequent meals (large meals can make breathing harder)',
        'Maintain healthy weight (both underweight and overweight affect breathing)',
        'Adequate protein to maintain respiratory muscle strength',
        'Stay hydrated to keep mucus thin',
        'Limit salt to reduce fluid retention',
        'Eat slowly and breathe between bites'
      ],
      exercises: [
        { name: 'Pursed Lip Breathing', sets: 3, reps: 10, duration: '10 breaths, 3x daily', time: '09:00', description: 'Breathe in through nose, out slowly through pursed lips.' },
        { name: 'Diaphragmatic Breathing', sets: 2, reps: 10, duration: '10 breaths', time: '12:00', description: 'Place hand on belly, feel it rise with each breath in.' },
        { name: 'Gentle Walking', sets: 1, reps: 1, duration: '10-20 minutes', time: '10:00', description: 'Walk at comfortable pace. Use pursed lip breathing. Rest as needed.' },
        { name: 'Arm Exercises', sets: 2, reps: 10, duration: '10 reps', time: '15:00', description: 'Light arm movements while seated. Coordinate with breathing.' }
      ],
      ptDuration: 30,
      recoveryWeeks: null
    },
    'wrist-sprain': {
      name: 'Wrist Sprain',
      description: 'A wrist sprain occurs when ligaments in the wrist are stretched or torn, usually from a fall or sudden twist. Recovery focuses on protecting the wrist, reducing swelling, and gradually restoring range of motion and strength without putting weight on the affected wrist.',
      clinicalInfo: {
        definition: 'Wrist sprains involve injury to the ligaments connecting the carpal bones. Most commonly affected is the scapholunate ligament. Graded I (stretch), II (partial tear), III (complete tear).',
        prevalence: 'Wrist sprains account for approximately 2.5% of all emergency room visits in Canada. They are common in sports, falls, and motor vehicle accidents.',
        prognosis: 'Most Grade I and II sprains heal within 2-6 weeks with proper rest and rehabilitation. Avoid weight-bearing exercises on the wrist during recovery.',
        reference: 'Canadian Orthopaedic Association; American Academy of Orthopaedic Surgeons'
      },
      nutritionGuidelines: [
        'Anti-inflammatory foods (fatty fish, berries, leafy greens) support healing',
        'Adequate protein helps tissue repair',
        'Vitamin C rich foods support collagen synthesis',
        'Stay hydrated to support tissue health',
        'Avoid excessive alcohol which can slow healing'
      ],
      exercises: [
        { name: 'Wrist Range of Motion', sets: 3, reps: 10, duration: '10 reps each direction', time: '09:00', description: 'Gently bend wrist up and down, then side to side. No pain should be felt. Do NOT put weight on wrist.' },
        { name: 'Finger Spreads', sets: 3, reps: 10, duration: '10 reps', time: '09:15', description: 'Spread fingers wide apart, then make a gentle fist. Repeat slowly.' },
        { name: 'Forearm Rotation', sets: 2, reps: 10, duration: '10 reps', time: '14:00', description: 'With elbow at side, rotate forearm so palm faces up, then down. Keep wrist relaxed.' },
        { name: 'Grip Strengthening', sets: 2, reps: 10, holdTime: 5, duration: '10 reps, hold 5 sec', time: '14:15', description: 'Squeeze a soft ball or rolled towel gently. Only when pain-free.' },
        { name: 'Walking', sets: 1, reps: 1, duration: '15-20 minutes', time: '16:00', description: 'Maintain cardiovascular health with walking. Keep injured wrist supported or in sling if needed.' }
      ],
      avoidExercises: ['push-ups', 'planks', 'weight bearing on hands', 'yoga poses on hands', 'pull-ups', 'bench press'],
      ptDuration: 20,
      recoveryWeeks: 4
    },
    'thumb-sprain': {
      name: 'Thumb Sprain',
      description: 'A thumb sprain involves injury to the ligaments of the thumb, often the ulnar collateral ligament (UCL). Recovery focuses on protecting the thumb joint while maintaining hand function.',
      clinicalInfo: {
        definition: 'Thumb sprains commonly affect the UCL at the base of the thumb (gamekeeper\'s or skier\'s thumb). Can range from mild stretching to complete rupture.',
        prevalence: 'Common in skiing, ball sports, and falls. Represents about 10% of all hand injuries.',
        prognosis: 'Grade I and II sprains typically heal in 4-6 weeks with splinting and therapy. Grade III may require surgery.',
        reference: 'Canadian Orthopaedic Association'
      },
      nutritionGuidelines: [
        'Protein-rich foods support ligament healing',
        'Anti-inflammatory foods may help reduce swelling',
        'Vitamin C and zinc support tissue repair',
        'Stay hydrated'
      ],
      exercises: [
        { name: 'Thumb Range of Motion', sets: 3, reps: 10, duration: '10 reps', time: '09:00', description: 'Gently move thumb in circles, then touch thumb to each fingertip. Stop if painful.' },
        { name: 'Finger Exercises', sets: 2, reps: 10, duration: '10 reps', time: '09:15', description: 'Make a fist (gently), spread fingers wide. Keeps other fingers mobile.' },
        { name: 'Wrist Circles', sets: 2, reps: 10, duration: '10 each direction', time: '14:00', description: 'Gentle wrist rotations to maintain mobility. Avoid if it strains thumb.' },
        { name: 'Walking', sets: 1, reps: 1, duration: '20 minutes', time: '16:00', description: 'Maintain fitness with walking. Avoid gripping activities.' }
      ],
      avoidExercises: ['gripping exercises', 'weight lifting', 'push-ups', 'racquet sports'],
      ptDuration: 15,
      recoveryWeeks: 5
    },
    'carpal-tunnel': {
      name: 'Carpal Tunnel Syndrome',
      description: 'Carpal tunnel syndrome causes numbness, tingling, and weakness in the hand due to pressure on the median nerve in the wrist. Management includes wrist positioning, gentle exercises, and avoiding aggravating activities.',
      clinicalInfo: {
        definition: 'Compression of the median nerve as it passes through the carpal tunnel in the wrist, causing sensory and motor symptoms in the thumb, index, middle, and ring fingers.',
        prevalence: 'Affects approximately 3-6% of the Canadian adult population. More common in women and those doing repetitive hand work.',
        prognosis: 'Early cases often respond well to conservative treatment including splinting, exercises, and activity modification. Severe cases may require surgery.',
        reference: 'Canadian Medical Association; Choosing Wisely Canada'
      },
      nutritionGuidelines: [
        'Anti-inflammatory foods may help reduce swelling',
        'B vitamins (B6, B12) support nerve health',
        'Maintain healthy weight to reduce pressure on nerves',
        'Stay hydrated'
      ],
      exercises: [
        { name: 'Nerve Gliding', sets: 3, reps: 10, duration: '10 reps', time: '09:00', description: 'Extend arm, bend wrist back, then forward. Gently stretches the median nerve.' },
        { name: 'Wrist Stretches', sets: 3, reps: 1, holdTime: 15, duration: 'Hold 15 seconds each', time: '09:15', description: 'Extend arm, use other hand to gently bend wrist down, then up. Stretch forearm muscles.' },
        { name: 'Tendon Glides', sets: 2, reps: 10, duration: '10 reps', time: '14:00', description: 'Start with fingers straight, make a hook fist, then full fist, then tabletop position.' },
        { name: 'Shake It Out', sets: 3, reps: 1, duration: '30 seconds', time: '12:00', description: 'Shake hands gently as if air-drying them. Relieves tension and improves circulation.' },
        { name: 'Walking', sets: 1, reps: 1, duration: '20 minutes', time: '16:00', description: 'General fitness walking. Swing arms naturally.' }
      ],
      avoidExercises: ['prolonged gripping', 'heavy lifting', 'push-ups', 'activities requiring bent wrist position'],
      ptDuration: 20,
      recoveryWeeks: 8
    },
    'weight-loss': {
      name: 'Weight Loss Program',
      description: 'A comprehensive weight loss program combining calorie-controlled nutrition with higher intensity exercises 3x per week. Your personalized calorie target is calculated based on your BMI to achieve safe, sustainable weight loss of 0.5-1 kg per week.',
      isWeightManagement: true,
      goalType: 'weight-loss',
      clinicalInfo: {
        definition: 'Medical weight management combines reduced caloric intake with increased physical activity to achieve healthy, sustainable weight loss. The goal is gradual reduction (0.5-1 kg/week) through a modest calorie deficit of 500-750 calories daily.',
        prevalence: 'Over 8.3 million Canadian adults (26.8%) are classified as obese, with an additional 36.3% considered overweight. Obesity is a risk factor for type 2 diabetes, cardiovascular disease, and certain cancers.',
        prognosis: 'With consistent lifestyle modifications, individuals can achieve 5-10% initial body weight loss, which significantly reduces health risks. Combining diet with exercise improves long-term weight maintenance.',
        reference: 'Health Canada; Obesity Canada; Canadian Task Force on Preventive Health Care'
      },
      nutritionGuidelines: [
        'Create a moderate calorie deficit (your daily target is calculated based on your profile)',
        'High protein intake (1.2-1.6g/kg body weight) to preserve muscle while losing fat',
        'Focus on fiber-rich foods for satiety (vegetables, whole grains, legumes)',
        'Limit processed foods, added sugars, and high-calorie beverages',
        'Practice portion control and mindful eating',
        'Stay well-hydrated (sometimes thirst is mistaken for hunger)',
        'Plan meals ahead to avoid impulsive eating choices',
        'Eat slowly and recognize fullness cues'
      ],
      exercises: [
        { name: 'HIIT Cardio Session', sets: 1, reps: 1, duration: '25-30 minutes', time: '09:00', frequency: 3, description: 'High-intensity intervals: 30 sec hard effort, 60 sec recovery. Start with 15 min, build up. Mon/Wed/Fri recommended.', isHighIntensity: true },
        { name: 'Strength Training', sets: 3, reps: 12, duration: '30-40 minutes', time: '10:00', frequency: 3, description: 'Full body compound exercises (squats, lunges, push-ups, rows). Builds muscle which increases metabolism.', isHighIntensity: true },
        { name: 'Moderate Cardio', sets: 1, reps: 1, duration: '30-45 minutes', time: '09:00', frequency: 2, description: 'Brisk walking, cycling, or swimming at moderate intensity. Tues/Thurs for active recovery.', isHighIntensity: false },
        { name: 'Core & Flexibility', sets: 2, reps: 15, duration: '15-20 minutes', time: '19:00', description: 'Planks, crunches, stretching. Important for overall fitness and injury prevention.' }
      ],
      ptDuration: 45,
      recoveryWeeks: null,
      weeklyHighIntensitySessions: 3,
      targetCalorieAdjustment: -500 // Calorie deficit for weight loss
    },
    'weight-gain': {
      name: 'Weight Gain Program',
      description: 'A muscle-building program combining calorie surplus nutrition with strength training. Your personalized calorie target is calculated based on your BMI to support healthy weight gain through lean muscle development.',
      isWeightManagement: true,
      goalType: 'weight-gain',
      clinicalInfo: {
        definition: 'Healthy weight gain focuses on increasing lean body mass through adequate caloric surplus (300-500 calories above maintenance) combined with progressive resistance training. The goal is gradual gain of 0.25-0.5 kg per week.',
        prevalence: 'Approximately 2% of Canadian adults are classified as underweight (BMI < 18.5). Being underweight is associated with nutritional deficiencies, weakened immune function, and osteoporosis.',
        prognosis: 'With proper nutrition and strength training, individuals can gain lean muscle mass effectively. Protein timing around workouts and progressive overload in training optimize results.',
        reference: 'Health Canada; Canadian Society for Exercise Physiology; Dietitians of Canada'
      },
      nutritionGuidelines: [
        'Create a modest calorie surplus (your daily target is calculated based on your profile)',
        'High protein intake (1.6-2.2g/kg body weight) to support muscle growth',
        'Eat frequent meals (5-6 smaller meals rather than 3 large)',
        'Include calorie-dense healthy foods (nuts, avocados, whole milk, olive oil)',
        'Complex carbohydrates for energy (oats, rice, potatoes, whole grain bread)',
        'Post-workout nutrition within 30 minutes (protein + carbs)',
        'Don\'t skip meals - consistency is key',
        'Consider smoothies to increase calorie intake if appetite is low'
      ],
      exercises: [
        { name: 'Heavy Compound Lifts', sets: 4, reps: 8, duration: '45-60 minutes', time: '10:00', frequency: 3, description: 'Focus on compound movements: squats, deadlifts, bench press, rows. Progressive overload is key.', isHighIntensity: true },
        { name: 'Upper Body Focus', sets: 3, reps: 10, duration: '35-40 minutes', time: '10:00', frequency: 2, description: 'Chest, back, shoulders, arms. Alternate with lower body days.', isHighIntensity: true },
        { name: 'Lower Body Focus', sets: 3, reps: 10, duration: '35-40 minutes', time: '10:00', frequency: 2, description: 'Squats, leg press, lunges, calf raises. Heavy weights with good form.', isHighIntensity: true },
        { name: 'Light Cardio/Mobility', sets: 1, reps: 1, duration: '15-20 minutes', time: '09:00', frequency: 2, description: 'Light cardio for heart health. Don\'t overdo cardio as it burns calories needed for muscle growth.' }
      ],
      ptDuration: 50,
      recoveryWeeks: null,
      weeklyHighIntensitySessions: 4,
      targetCalorieAdjustment: 400 // Calorie surplus for weight gain
    },
    'other': {
      name: 'General Wellness',
      description: 'Your care plan focuses on general wellness principles including balanced nutrition, regular physical activity, stress management, and adequate rest. Work with your healthcare provider to customize this plan for your specific needs.',
      nutritionGuidelines: [
        'Eat a balanced diet with plenty of fruits and vegetables',
        'Choose whole grains over refined grains',
        'Include lean proteins in your diet',
        'Stay well-hydrated with water',
        'Limit processed foods, added sugars, and excess sodium',
        'Practice mindful eating'
      ],
      exercises: [
        { name: 'Morning Stretch', sets: 1, reps: 1, duration: '10 minutes', time: '08:00', description: 'Gentle full-body stretching to start the day.' },
        { name: 'Cardiovascular Activity', sets: 1, reps: 1, duration: '20-30 minutes', time: '10:00', description: 'Walking, cycling, or other activity you enjoy at moderate intensity.' },
        { name: 'Strength Training', sets: 2, reps: 12, duration: '15-20 minutes', time: '11:00', description: 'Basic bodyweight exercises or light weights.' },
        { name: 'Evening Wind-Down', sets: 1, reps: 1, duration: '10 minutes', time: '20:00', description: 'Relaxation, gentle stretching, or meditation.' }
      ],
      ptDuration: 45,
      recoveryWeeks: null
    }
  },

  /**
   * Get condition-specific exercise data
   * Now personalizes exercises based on user preferences (gym vs home, etc.)
   */
  getConditionData(diagnosisId) {
    // First check if we have detailed clinical data for this condition
    if (this.conditions[diagnosisId]) {
      const condition = { ...this.conditions[diagnosisId] };
      // Personalize exercises based on user preferences
      condition.exercises = this.personalizeExercises(condition.exercises, diagnosisId);
      return condition;
    }

    // If not, look up the condition name from ConditionsDatabase and create a basic entry
    const mapping = ConditionsDatabase.find(c => c.id === diagnosisId);
    if (mapping) {
      // Get appropriate exercises based on condition type
      let exercises = this.getSmartExercisesForCondition(diagnosisId, mapping.name);
      exercises = this.personalizeExercises(exercises, diagnosisId);

      return {
        name: mapping.name,
        description: `Your care plan focuses on managing ${mapping.name}. Work with your healthcare provider to customize this plan for your specific needs.`,
        nutritionGuidelines: this.conditions['other'].nutritionGuidelines,
        exercises: exercises,
        ptDuration: 20,
        recoveryWeeks: 8
      };
    }

    // Final fallback to general wellness
    const fallback = { ...this.conditions['other'] };
    fallback.exercises = this.personalizeExercises(fallback.exercises, diagnosisId);
    return fallback;
  },

  /**
   * Get smart exercises based on condition type
   * Avoids exercises that would aggravate specific body parts
   */
  getSmartExercisesForCondition(conditionId, conditionName) {
    const nameLower = conditionName.toLowerCase();
    const idLower = conditionId.toLowerCase();

    // Wrist/hand conditions - avoid weight bearing on hands
    if (nameLower.includes('wrist') || nameLower.includes('hand') || nameLower.includes('carpal') ||
        nameLower.includes('finger') || nameLower.includes('thumb') || idLower.includes('wrist') ||
        idLower.includes('hand') || idLower.includes('carpal')) {
      return [
        { name: 'Wrist Range of Motion', sets: 3, reps: 10, duration: '10 reps', time: '09:00', description: 'Gentle wrist movements - up/down, side to side. No weight bearing.' },
        { name: 'Walking', sets: 1, reps: 1, duration: '20 minutes', time: '10:00', description: 'Maintain cardiovascular fitness. Keep arms relaxed.' },
        { name: 'Lower Body Squats', sets: 2, reps: 10, duration: '10 reps', time: '11:00', description: 'Bodyweight squats - no hand support needed. Focus on leg strength.' },
        { name: 'Standing Calf Raises', sets: 2, reps: 15, duration: '15 reps', time: '14:00', description: 'Rise onto toes, lower slowly. Hold wall for balance only.' }
      ];
    }

    // Shoulder conditions - avoid overhead and pushing movements
    if (nameLower.includes('shoulder') || nameLower.includes('rotator')) {
      return this.conditions['shoulder-injury']?.exercises || this.conditions['other'].exercises;
    }

    // Knee/leg conditions
    if (nameLower.includes('knee') || nameLower.includes('acl') || nameLower.includes('mcl') ||
        nameLower.includes('meniscus') || nameLower.includes('patella')) {
      return this.conditions['knee-sprain']?.exercises || this.conditions['other'].exercises;
    }

    // Ankle/foot conditions
    if (nameLower.includes('ankle') || nameLower.includes('foot') || nameLower.includes('achilles') ||
        nameLower.includes('plantar')) {
      return this.conditions['ankle-sprain']?.exercises || this.conditions['other'].exercises;
    }

    // Back conditions
    if (nameLower.includes('back') || nameLower.includes('spine') || nameLower.includes('lumbar') ||
        nameLower.includes('sciatica') || nameLower.includes('disc')) {
      return this.conditions['back-pain']?.exercises || this.conditions['other'].exercises;
    }

    // Default to general wellness exercises
    return this.conditions['other'].exercises;
  },

  /**
   * Personalize exercises based on user workout preferences
   */
  personalizeExercises(exercises, conditionId) {
    if (!AppState?.userData) return exercises;

    const workoutLocation = AppState.userData.workoutLocation;
    const hasSchedule = AppState.userData.hasWorkoutSchedule;

    // Clone exercises array to avoid mutation
    let personalizedExercises = exercises.map(ex => ({ ...ex }));

    // Find and customize strength training based on preferences
    personalizedExercises = personalizedExercises.map(exercise => {
      if (exercise.name === 'Strength Training' || exercise.name === 'Cardiovascular Activity') {
        return this.customizeExerciseForPreference(exercise, workoutLocation, conditionId);
      }
      return exercise;
    });

    return personalizedExercises;
  },

  /**
   * Customize generic exercise based on user preferences
   */
  customizeExerciseForPreference(exercise, workoutLocation, conditionId) {
    const isWristCondition = conditionId && (
      conditionId.includes('wrist') || conditionId.includes('hand') ||
      conditionId.includes('carpal') || conditionId.includes('thumb')
    );

    if (exercise.name === 'Strength Training') {
      if (workoutLocation === 'gym') {
        if (isWristCondition) {
          return {
            ...exercise,
            name: 'Lower Body Gym Workout',
            description: 'Leg press: 3x12, Leg curls: 3x12, Leg extensions: 3x12, Calf raises: 3x15. Avoid gripping heavy weights with injured wrist.'
          };
        }
        return {
          ...exercise,
          name: 'Gym Strength Circuit',
          description: 'Lat pulldown: 3x12, Leg press: 3x12, Chest press machine: 3x12, Seated rows: 3x12. Use machines for guided movement.'
        };
      } else if (workoutLocation === 'outdoor') {
        if (isWristCondition) {
          return {
            ...exercise,
            name: 'Outdoor Lower Body Workout',
            description: 'Walking lunges: 3x10 each leg, Step-ups on bench: 3x12, Bodyweight squats: 3x15, Single-leg stands: 30 sec each.'
          };
        }
        return {
          ...exercise,
          name: 'Outdoor Bodyweight Circuit',
          description: 'Walking lunges: 3x10, Bench step-ups: 3x12, Park bench dips: 3x10, Incline push-ups on bench: 3x10.'
        };
      } else {
        // Home / minimal equipment
        if (isWristCondition) {
          return {
            ...exercise,
            name: 'Home Lower Body Workout',
            description: 'Squats: 3x15, Glute bridges: 3x15, Wall sits: 3x30 sec, Standing calf raises: 3x20. No hand weight-bearing exercises.'
          };
        }
        return {
          ...exercise,
          name: 'Home Bodyweight Workout',
          description: 'Squats: 3x15, Lunges: 3x10 each leg, Glute bridges: 3x15, Wall push-ups (or regular): 3x10.'
        };
      }
    }

    if (exercise.name === 'Cardiovascular Activity') {
      if (workoutLocation === 'gym') {
        return {
          ...exercise,
          name: 'Cardio Machine Workout',
          description: 'Treadmill, elliptical, or stationary bike at moderate intensity. 20-30 minutes. Heart rate at 50-70% max.'
        };
      } else if (workoutLocation === 'outdoor') {
        return {
          ...exercise,
          name: 'Outdoor Cardio',
          description: 'Brisk walking, light jogging, or cycling outdoors. 20-30 minutes at moderate intensity where you can still talk.'
        };
      }
    }

    return exercise;
  }
};

// ============================================
// Meal Planning Database with Recipes
// ============================================
const MealDatabase = {
  breakfast: [
    {
      id: 'oatmeal-berries',
      name: 'Oatmeal with Berries',
      description: 'Steel-cut oats topped with mixed berries and a drizzle of honey',
      calories: 350,
      servings: 1,
      prepTime: '25 min',
      tags: ['vegetarian', 'dairy-free'],
      recipe: {
        ingredients: ['1 cup steel-cut oats', '2 cups water', '1/2 cup mixed berries', '1 tbsp honey', 'Pinch of cinnamon'],
        instructions: ['Bring water to boil, add oats', 'Reduce heat and simmer 20-25 minutes, stirring occasionally', 'Top with berries, honey, and cinnamon', 'Serve warm']
      }
    },
    {
      id: 'greek-yogurt-parfait',
      name: 'Greek Yogurt Parfait',
      description: 'Greek yogurt layered with granola and fresh fruit',
      calories: 320,
      servings: 1,
      prepTime: '5 min',
      tags: ['vegetarian', 'gluten-free'],
      recipe: {
        ingredients: ['1 cup plain Greek yogurt', '1/4 cup granola', '1/2 cup mixed fresh fruit', '1 tsp honey (optional)'],
        instructions: ['Layer half the yogurt in a glass or bowl', 'Add half the granola and fruit', 'Repeat layers', 'Drizzle with honey if desired']
      }
    },
    {
      id: 'veggie-scramble',
      name: 'Veggie Scramble',
      description: 'Scrambled eggs with spinach, tomatoes, and whole grain toast',
      calories: 380,
      servings: 1,
      prepTime: '15 min',
      tags: ['vegetarian'],
      recipe: {
        ingredients: ['2 eggs', '1 cup fresh spinach', '1/4 cup diced tomatoes', '1 slice whole grain bread', 'Salt and pepper to taste'],
        instructions: ['Whisk eggs with salt and pepper', 'Saute spinach and tomatoes in non-stick pan', 'Add eggs and scramble until set', 'Serve with toasted bread']
      }
    },
    {
      id: 'avocado-toast',
      name: 'Avocado Toast',
      description: 'Whole grain toast with mashed avocado, cherry tomatoes, and seeds',
      calories: 340,
      servings: 1,
      prepTime: '10 min',
      tags: ['vegan', 'dairy-free'],
      recipe: {
        ingredients: ['2 slices whole grain bread', '1 ripe avocado', '6 cherry tomatoes, halved', '1 tbsp mixed seeds', 'Squeeze of lemon'],
        instructions: ['Toast bread to your preference', 'Mash avocado with lemon juice, salt, and pepper', 'Spread avocado on toast', 'Top with tomatoes and seeds']
      }
    },
    {
      id: 'smoothie-bowl',
      name: 'Smoothie Bowl',
      description: 'Blended berries and banana topped with nuts and seeds',
      calories: 310,
      servings: 1,
      prepTime: '10 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['1 frozen banana', '1/2 cup frozen berries', '1/4 cup plant milk', '2 tbsp nuts and seeds', '1/4 cup fresh fruit for topping'],
        instructions: ['Blend banana, berries, and milk until thick and smooth', 'Pour into bowl', 'Top with nuts, seeds, and fresh fruit', 'Serve immediately']
      }
    }
  ],
  lunch: [
    {
      id: 'grilled-chicken-salad',
      name: 'Grilled Chicken Salad',
      description: 'Mixed greens with grilled chicken, vegetables, and olive oil dressing',
      calories: 420,
      servings: 2,
      prepTime: '25 min',
      tags: ['gluten-free', 'dairy-free'],
      recipe: {
        ingredients: ['8 oz grilled chicken breast', '6 cups mixed greens', '1 cup cherry tomatoes', '1/2 cucumber, sliced', '4 tbsp olive oil', '2 tbsp lemon juice'],
        instructions: ['Grill chicken breast until cooked through, let rest and slice', 'Arrange greens on plate', 'Top with chicken, tomatoes, and cucumber', 'Drizzle with olive oil and lemon juice']
      }
    },
    {
      id: 'quinoa-buddha-bowl',
      name: 'Quinoa Buddha Bowl',
      description: 'Quinoa with roasted vegetables, chickpeas, and tahini dressing',
      calories: 450,
      servings: 2,
      prepTime: '35 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['2 cups cooked quinoa', '2 cups roasted vegetables (any mix)', '1 can chickpeas', '4 tbsp tahini', '2 tbsp lemon juice', 'Water to thin'],
        instructions: ['Cook quinoa according to package directions', 'Roast vegetables at 400F for 20-25 minutes', 'Mix tahini, lemon juice, and water for dressing', 'Assemble bowl and drizzle with dressing']
      }
    },
    {
      id: 'turkey-wrap',
      name: 'Turkey Wrap',
      description: 'Whole wheat wrap with turkey, avocado, and fresh vegetables',
      calories: 440,
      servings: 2,
      prepTime: '10 min',
      tags: ['dairy-free'],
      recipe: {
        ingredients: ['2 whole wheat wraps', '8 oz sliced turkey', '1 avocado, sliced', '1 cup shredded lettuce', '4 tomato slices', 'Mustard to taste'],
        instructions: ['Lay wrap flat, spread with mustard', 'Layer turkey, avocado, lettuce, and tomato', 'Fold in sides and roll tightly', 'Cut in half diagonally to serve']
      }
    },
    {
      id: 'lentil-soup',
      name: 'Lentil Soup',
      description: 'Hearty lentil soup with vegetables and crusty bread',
      calories: 380,
      servings: 3,
      prepTime: '40 min',
      tags: ['vegan'],
      recipe: {
        ingredients: ['1.5 cups dried lentils', '6 cups vegetable broth', '2 carrots, diced', '2 celery stalks, diced', '1 onion, diced', '3 cloves garlic', 'Cumin and salt to taste'],
        instructions: ['Saute onion, carrot, celery, and garlic until soft', 'Add lentils, broth, and seasonings', 'Simmer 25-30 minutes until lentils are tender', 'Serve with crusty bread']
      }
    },
    {
      id: 'salmon-salad',
      name: 'Salmon Salad',
      description: 'Mixed greens with baked salmon, cucumber, and lemon dressing',
      calories: 460,
      servings: 2,
      prepTime: '20 min',
      tags: ['gluten-free', 'dairy-free'],
      recipe: {
        ingredients: ['8 oz salmon fillet', '6 cups mixed greens', '1 cucumber, sliced', '4 tbsp olive oil', '2 tbsp lemon juice', '1 bunch fresh dill'],
        instructions: ['Bake salmon at 400F for 12-15 minutes', 'Arrange greens and cucumber on plate', 'Flake salmon over salad', 'Drizzle with olive oil and lemon, garnish with dill']
      }
    }
  ],
  dinner: [
    {
      id: 'baked-salmon-dinner',
      name: 'Baked Salmon',
      description: 'Herb-crusted salmon with roasted vegetables and brown rice',
      calories: 520,
      servings: 2,
      prepTime: '35 min',
      tags: ['gluten-free', 'dairy-free'],
      recipe: {
        ingredients: ['12 oz salmon fillet', '2 cups brown rice', '4 cups mixed vegetables', '3 tbsp olive oil', '1 bunch fresh dill', '1 bunch fresh parsley', 'Lemon wedges'],
        instructions: ['Cook brown rice according to package', 'Season salmon with herbs, salt, pepper, and olive oil', 'Bake salmon at 400F for 15-18 minutes', 'Roast vegetables alongside', 'Serve together with lemon']
      }
    },
    {
      id: 'chicken-stir-fry',
      name: 'Chicken Stir-Fry',
      description: 'Lean chicken with mixed vegetables over brown rice',
      calories: 480,
      servings: 3,
      prepTime: '30 min',
      tags: ['dairy-free'],
      recipe: {
        ingredients: ['1 lb chicken breast, sliced', '4 cups stir-fry vegetables', '2 cups brown rice', '4 tbsp low-sodium soy sauce', '2 tbsp sesame oil', '1 piece fresh ginger', '3 cloves garlic'],
        instructions: ['Cook rice according to package', 'Stir-fry chicken in sesame oil until cooked', 'Add vegetables and cook until tender-crisp', 'Add soy sauce, ginger, garlic', 'Serve over rice']
      }
    },
    {
      id: 'vegetable-curry',
      name: 'Vegetable Curry',
      description: 'Mixed vegetable curry with chickpeas served over basmati rice',
      calories: 450,
      servings: 3,
      prepTime: '35 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['4 cups mixed vegetables', '2 cans chickpeas, drained', '2 cans coconut milk', '4 tbsp curry paste', '2 cups basmati rice', '1 bunch fresh cilantro'],
        instructions: ['Cook rice according to package', 'Saute vegetables until slightly soft', 'Add curry paste, coconut milk, and chickpeas', 'Simmer 15-20 minutes', 'Serve over rice with cilantro']
      }
    },
    {
      id: 'grilled-steak',
      name: 'Grilled Lean Steak',
      description: 'Lean beef with sweet potato and steamed broccoli',
      calories: 550,
      servings: 2,
      prepTime: '50 min',
      tags: ['gluten-free', 'dairy-free'],
      recipe: {
        ingredients: ['12 oz lean sirloin steak', '2 medium sweet potatoes', '4 cups broccoli florets', '2 tbsp olive oil', 'Salt, pepper, garlic powder'],
        instructions: ['Season steak with salt, pepper, garlic powder', 'Grill to desired doneness', 'Bake sweet potato at 400F for 45 minutes', 'Steam broccoli until tender', 'Serve together']
      }
    },
    {
      id: 'mediterranean-bowl',
      name: 'Mediterranean Bowl',
      description: 'Falafel, hummus, tabbouleh, and fresh vegetables',
      calories: 490,
      servings: 2,
      prepTime: '20 min',
      tags: ['vegan'],
      recipe: {
        ingredients: ['8 falafel patties', '1/2 cup hummus', '1 cup tabbouleh', '1 cup cucumber and tomato', 'Pita bread (optional)', 'Tahini sauce'],
        instructions: ['Prepare or heat falafel according to package', 'Arrange all components in a bowl', 'Drizzle with tahini sauce', 'Serve with warm pita if desired']
      }
    }
  ],
  snacks: [
    {
      id: 'apple-almond-butter',
      name: 'Apple with Almond Butter',
      description: 'Sliced apple with a tablespoon of almond butter',
      calories: 180,
      servings: 1,
      prepTime: '2 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['1 medium apple', '1 tbsp almond butter'],
        instructions: ['Slice apple into wedges', 'Serve with almond butter for dipping']
      }
    },
    {
      id: 'greek-yogurt-snack',
      name: 'Greek Yogurt',
      description: 'Plain Greek yogurt with a handful of berries',
      calories: 150,
      servings: 1,
      prepTime: '2 min',
      tags: ['vegetarian', 'gluten-free'],
      recipe: {
        ingredients: ['3/4 cup plain Greek yogurt', '1/4 cup fresh berries'],
        instructions: ['Place yogurt in bowl', 'Top with berries', 'Enjoy!']
      }
    },
    {
      id: 'mixed-nuts',
      name: 'Mixed Nuts',
      description: 'Small handful of unsalted mixed nuts',
      calories: 170,
      servings: 1,
      prepTime: '1 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['1/4 cup mixed unsalted nuts (almonds, walnuts, cashews)'],
        instructions: ['Portion nuts into a small container', 'Enjoy as a satisfying snack']
      }
    },
    {
      id: 'veggie-hummus',
      name: 'Veggie Sticks with Hummus',
      description: 'Carrot, celery, and cucumber with hummus',
      calories: 140,
      servings: 2,
      prepTime: '5 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['2 carrots, cut into sticks', '4 celery stalks, cut into sticks', '1/2 cucumber, cut into sticks', '6 tbsp hummus'],
        instructions: ['Cut vegetables into stick shapes', 'Arrange on plate with hummus for dipping']
      }
    },
    {
      id: 'banana',
      name: 'Banana',
      description: 'One medium banana for quick energy',
      calories: 105,
      servings: 1,
      prepTime: '1 min',
      tags: ['vegan', 'gluten-free'],
      recipe: {
        ingredients: ['1 medium banana'],
        instructions: ['Peel and enjoy!']
      }
    }
  ],
  // Ingredients that are NOT allowed for each dietary restriction
  restrictedIngredients: {
    'vegetarian': ['chicken', 'turkey', 'beef', 'steak', 'salmon', 'fish', 'pork', 'bacon', 'ham', 'meat', 'sirloin', 'fillet'],
    'vegan': ['chicken', 'turkey', 'beef', 'steak', 'salmon', 'fish', 'pork', 'bacon', 'ham', 'meat', 'sirloin', 'fillet', 'egg', 'eggs', 'yogurt', 'cheese', 'milk', 'cream', 'butter', 'honey'],
    'gluten-free': ['bread', 'wheat', 'flour', 'pasta', 'pita', 'wrap', 'toast', 'granola', 'oats', 'oatmeal'],
    'dairy-free': ['yogurt', 'cheese', 'milk', 'cream', 'butter'],
    'nut-allergy': ['almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'peanut', 'peanuts', 'nut', 'nuts'],
    'low-sodium': ['soy sauce', 'salt']
  },

  getMeal(type, restrictions = [], userDislikes = '') {
    const meals = this[type];
    if (!meals || meals.length === 0) return null;

    // Parse user dislikes/allergies from free text
    const dislikeWords = userDislikes.toLowerCase()
      .split(/[,\n;]+/)
      .map(w => w.trim())
      .filter(w => w.length > 2);

    let filtered = meals.filter(meal => {
      // Check meal name, description, and ingredients for restricted items
      const mealText = (meal.name + ' ' + meal.description + ' ' +
        (meal.recipe?.ingredients || []).join(' ')).toLowerCase();

      // Check each dietary restriction
      for (const restriction of restrictions) {
        const restrictedItems = this.restrictedIngredients[restriction] || [];
        for (const item of restrictedItems) {
          if (mealText.includes(item.toLowerCase())) {
            return false; // Exclude this meal
          }
        }
      }

      // Check user-specified dislikes/allergies
      for (const dislike of dislikeWords) {
        if (mealText.includes(dislike)) {
          return false; // Exclude this meal
        }
      }

      return true;
    });

    // If no meals match, fall back to original list (shouldn't happen often)
    if (filtered.length === 0) {
      console.warn(`No meals found matching restrictions for ${type}, using fallback`);
      filtered = meals;
    }

    return filtered[Math.floor(Math.random() * filtered.length)];
  },

  // Get meal for a specific day, accounting for serving rotation
  getMealForDay(type, dayOffset, restrictions = [], userDislikes = '') {
    // Initialize meal plan if needed
    initializeMealPlan();

    const mealPlan = AppState.mealPlan.meals[type];
    if (!mealPlan) return this.getMeal(type, restrictions, userDislikes);

    // Find active meal for this day
    let activeMeal = null;
    for (const plannedMeal of mealPlan) {
      const startDay = plannedMeal.startDay;
      const endDay = startDay + plannedMeal.servingsRemaining - 1;
      if (dayOffset >= startDay && dayOffset <= endDay) {
        activeMeal = this[type].find(m => m.id === plannedMeal.mealId);
        break;
      }
    }

    // If no active meal found, get a new one
    if (!activeMeal) {
      activeMeal = this.getMeal(type, restrictions, userDislikes);
    }

    return activeMeal;
  }
};

// Storage and reheating tips for meal categories
const StorageTips = {
  // Default tips by meal category
  categories: {
    breakfast: {
      storage: 'Most breakfast items are best enjoyed fresh. Prepare ingredients the night before for quick assembly.',
      reheating: 'Reheat oatmeal with a splash of water or milk. Toast bread fresh.',
      duration: '1-2 days refrigerated'
    },
    lunch: {
      storage: 'Store in airtight containers. Keep dressings separate until serving.',
      reheating: 'Reheat proteins and grains; add fresh greens after.',
      duration: '3-4 days refrigerated'
    },
    dinner: {
      storage: 'Cool completely before refrigerating. Store in portion-sized containers for easy reheating.',
      reheating: 'Reheat thoroughly to 165°F (74°C). Add a splash of liquid to prevent drying.',
      duration: '3-5 days refrigerated'
    },
    snacks: {
      storage: 'Pre-portion snacks for grab-and-go convenience.',
      reheating: 'Most snacks are served cold or at room temperature.',
      duration: '3-7 days depending on ingredients'
    }
  },

  // Specific tips by ingredient/dish type
  specific: {
    salmon: { storage: 'Wrap tightly and refrigerate immediately', duration: '2-3 days', reheating: 'Reheat gently at 275°F to prevent drying' },
    chicken: { storage: 'Store cooked chicken separate from other ingredients', duration: '3-4 days', reheating: 'Reheat to 165°F internal temperature' },
    rice: { storage: 'Cool quickly and refrigerate within 1 hour', duration: '4-6 days', reheating: 'Add a few drops of water, cover, and microwave' },
    quinoa: { storage: 'Store in airtight container', duration: '5-7 days', reheating: 'Microwave with a damp paper towel on top' },
    soup: { storage: 'Cool rapidly, store in shallow containers', duration: '4-5 days', reheating: 'Heat on stovetop stirring occasionally' },
    eggs: { storage: 'Best eaten fresh, store covered', duration: '1-2 days', reheating: 'Microwave 30-60 seconds, or enjoy cold' },
    salad: { storage: 'Keep dressing and croutons separate', duration: '1-2 days (greens wilt)', reheating: 'Serve cold; reheat protein separately' },
    steak: { storage: 'Wrap tightly or use vacuum seal', duration: '3-4 days', reheating: 'Reheat in skillet or oven at low heat to prevent overcooking' },
    vegetables: { storage: 'Store in airtight containers', duration: '3-5 days', reheating: 'Quick sauté or steam to refresh' },
    curry: { storage: 'Flavors improve after 1 day', duration: '4-5 days', reheating: 'Stovetop with added splash of coconut milk' },
    oatmeal: { storage: 'Store plain; add toppings fresh', duration: '3-5 days', reheating: 'Add water or milk and microwave 1-2 minutes' },
    wrap: { storage: 'Wrap tightly in foil or plastic', duration: '1-2 days', reheating: 'Best enjoyed cold or at room temperature' },
    falafel: { storage: 'Store in single layer to maintain crispness', duration: '4-5 days', reheating: 'Reheat in oven or air fryer to restore crispness' },
    yogurt: { storage: 'Keep refrigerated, assemble fresh', duration: 'Check expiration date', reheating: 'Serve cold' },
    smoothie: { storage: 'Best made fresh; can freeze portions', duration: '24 hours refrigerated', reheating: 'Re-blend with ice if separated' }
  },

  // Get storage tips for a specific meal
  getTips(meal, mealType) {
    const tips = { ...this.categories[mealType] };

    // Check meal name and ingredients for specific tips
    const mealText = (meal.name + ' ' + (meal.recipe?.ingredients || []).join(' ')).toLowerCase();

    // Apply more specific tips based on key ingredients
    for (const [ingredient, specificTips] of Object.entries(this.specific)) {
      if (mealText.includes(ingredient)) {
        if (specificTips.storage) tips.storage = specificTips.storage;
        if (specificTips.duration) tips.duration = specificTips.duration;
        if (specificTips.reheating) tips.reheating = specificTips.reheating;
        break; // Use first matching specific tip
      }
    }

    // Add freezing tips for meals with multiple servings
    if (meal.servings >= 2) {
      tips.freezing = 'Freeze extra portions in individual containers for up to 2-3 months. Thaw overnight in refrigerator.';
    }

    return tips;
  }
};

// Initialize weekly meal plan with serving rotation
function initializeMealPlan() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Check if we need to initialize or reset the meal plan
  if (!AppState.mealPlan.weekStartDate ||
      daysBetween(new Date(AppState.mealPlan.weekStartDate), today) >= 7) {

    const restrictions = AppState.userData.dietaryRestrictions || [];
    const userDislikes = [
      AppState.userData.otherDietaryNotes || '',
      AppState.userData.dietaryHabits || ''
    ].join(' ');

    AppState.mealPlan.weekStartDate = todayStr;
    AppState.mealPlan.meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    // Plan breakfast - 1 serving each, need 7 different breakfasts
    let breakfastDay = 0;
    while (breakfastDay < 7) {
      const meal = MealDatabase.getMeal('breakfast', restrictions, userDislikes);
      if (meal) {
        const servings = meal.servings || 1;
        AppState.mealPlan.meals.breakfast.push({
          mealId: meal.id,
          servingsRemaining: servings,
          startDay: breakfastDay
        });
        breakfastDay += servings;
      } else {
        break;
      }
    }

    // Plan lunch - 2-3 servings each
    let lunchDay = 0;
    while (lunchDay < 7) {
      const meal = MealDatabase.getMeal('lunch', restrictions, userDislikes);
      if (meal) {
        const servings = meal.servings || 2;
        AppState.mealPlan.meals.lunch.push({
          mealId: meal.id,
          servingsRemaining: servings,
          startDay: lunchDay
        });
        lunchDay += servings;
      } else {
        break;
      }
    }

    // Plan dinner - 2-3 servings each
    let dinnerDay = 0;
    while (dinnerDay < 7) {
      const meal = MealDatabase.getMeal('dinner', restrictions, userDislikes);
      if (meal) {
        const servings = meal.servings || 2;
        AppState.mealPlan.meals.dinner.push({
          mealId: meal.id,
          servingsRemaining: servings,
          startDay: dinnerDay
        });
        dinnerDay += servings;
      } else {
        break;
      }
    }

    // Plan snacks - variable servings
    let snackDay = 0;
    while (snackDay < 7) {
      const meal = MealDatabase.getMeal('snacks', restrictions, userDislikes);
      if (meal) {
        const servings = meal.servings || 1;
        AppState.mealPlan.meals.snacks.push({
          mealId: meal.id,
          servingsRemaining: servings,
          startDay: snackDay
        });
        snackDay += servings;
      } else {
        break;
      }
    }

    saveState();
  }
}

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2 - date1) / oneDay));
}

// Get the current day offset from the start of the week
function getCurrentDayOffset() {
  if (!AppState.mealPlan.weekStartDate) return 0;
  return daysBetween(new Date(AppState.mealPlan.weekStartDate), new Date());
}

// ============================================
// Cura - AI Care Assistant
// ============================================
// Blocked/illegal substances list - cannot be added as medications
const BlockedSubstances = [
  'heroin', 'cocaine', 'crack', 'meth', 'methamphetamine', 'crystal meth',
  'ecstasy', 'mdma', 'lsd', 'acid', 'pcp', 'angel dust', 'ketamine',
  'ghb', 'rohypnol', 'roofies', 'fentanyl', 'carfentanil', 'bath salts',
  'synthetic cannabinoids', 'spice', 'k2', 'flakka'
];

const ChatbotSystem = {
  messages: [],

  getResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    const userName = AppState.userData.firstName || 'there';

    // Safety responses
    if (msg.includes('emergency') || msg.includes('911') || msg.includes('severe pain') || msg.includes('chest pain')) {
      return {
        text: `${userName}, if you're experiencing a medical emergency, please call 911 or go to your nearest emergency room immediately. I cannot provide emergency medical care.`,
        isWarning: true
      };
    }

    // Check for blocked substances in any medication-related context
    if (this.containsBlockedSubstance(msg)) {
      return this.handleBlockedSubstance(msg, userName);
    }

    // Task completion commands
    if (msg.includes('complete') || msg.includes('done') || msg.includes('finished') || msg.includes('check off') || msg.includes('mark')) {
      return this.handleTaskCompletion(msg, userName);
    }

    // Add medication commands
    if (msg.includes('add medication') || msg.includes('add medicine') || msg.includes('add a medication') ||
        msg.includes('new medication') || msg.includes('prescribe') || msg.includes('add to medication') ||
        msg.includes('put on') || msg.includes('taking a new')) {
      return this.handleAddMedication(msg, userName);
    }

    // Remove/stopped medication commands - expanded patterns
    if (msg.includes('remove medication') || msg.includes('stop taking') || msg.includes('stopped taking') ||
        msg.includes('delete medication') || msg.includes('remove medicine') || msg.includes('stopped') ||
        msg.includes('quit taking') || msg.includes('no longer taking') || msg.includes('off of') ||
        msg.includes('discontinued') || msg.includes('came off') || msg.includes('not taking') ||
        msg.includes('drop') || msg.includes('cut out')) {
      return this.handleRemoveMedication(msg, userName);
    }

    // Started/changed medication commands
    if (msg.includes('started taking') || msg.includes('started') || msg.includes('began taking') ||
        msg.includes('now taking') || msg.includes('switched to') || msg.includes('changed to') ||
        msg.includes('increased') || msg.includes('decreased') || msg.includes('dose changed') ||
        msg.includes('dosage changed') || msg.includes('new dose') || msg.includes('doctor put me on') ||
        msg.includes('prescribed me') || msg.includes('taking now')) {
      return this.handleMedicationChange(msg, userName);
    }

    // List medications
    if ((msg.includes('list') || msg.includes('show') || msg.includes('what are') || msg.includes('see my')) &&
        (msg.includes('medication') || msg.includes('medicine') || msg.includes('meds') || msg.includes('prescription'))) {
      return this.handleListMedications(userName);
    }

    // Dynamic profile update commands - comprehensive matching
    if (this.isProfileUpdateRequest(msg)) {
      return this.handleDynamicProfileUpdate(msg, userName);
    }

    // Dietary/allergy changes
    if (msg.includes('allerg') || msg.includes('intoleran') || msg.includes('can\'t eat') ||
        msg.includes('cannot eat') || msg.includes('don\'t eat') || msg.includes('avoid eating') ||
        msg.includes('vegetarian') || msg.includes('vegan') || msg.includes('gluten') || msg.includes('dairy')) {
      return this.handleDietaryChange(msg, userName);
    }

    // Medication questions - but verify first
    if (msg.includes('medication') || msg.includes('medicine') || msg.includes('drug') || msg.includes('pill')) {
      return {
        text: `I can help you with medications, ${userName}! You can:\n- "Add medication [name]" to add a new one\n- "List my medications" to see all\n- "Remove medication [name]" to remove one\n- "Mark medication done" to log as taken\n\nAll medications are verified against our database. For questions about dosages or interactions, contact your pharmacist at ${AppState.userData.pharmacyName || 'your local pharmacy'}.`,
        isWarning: false
      };
    }

    // PT/Exercise questions
    if (msg.includes('exercise') || msg.includes('pt') || msg.includes('physical therapy') || msg.includes('stretch')) {
      const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
      return {
        text: `For ${condition.name}, your plan includes ${condition.exercises.length} exercises, ${userName}. Remember: always stop if you experience sharp pain, and follow your physical therapist's specific instructions. Would you like me to show you today's exercises or mark one as completed?`,
        isWarning: false
      };
    }

    // Nutrition questions
    if (msg.includes('food') || msg.includes('eat') || msg.includes('diet') || msg.includes('nutrition') || msg.includes('meal') || msg.includes('recipe')) {
      const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
      return {
        text: `For ${condition.name}, your nutrition guidelines focus on: ${condition.nutritionGuidelines[0]}. You can view recipes for all meals in your nutrition plan by clicking "View Recipe". For personalized dietary advice, please consult a registered dietitian. I can also mark meals as eaten for you - just say "I ate breakfast" or similar!`,
        isWarning: false
      };
    }

    // Ate meals
    if (msg.includes('ate') || msg.includes('eaten') || msg.includes('had')) {
      return this.handleMealLogging(msg, userName);
    }

    // Update preferences
    if (msg.includes('update') || msg.includes('change') || msg.includes('preference')) {
      return {
        text: `I can help you update your preferences, ${userName}! You can modify your exercise schedule, meal times, or notification preferences. Just tell me what you'd like to change, like "set my breakfast time to 8:30" or "update my pharmacy name". Note: any medical changes should be discussed with your clinician first.`,
        isWarning: false
      };
    }

    // Condition/diagnosis questions or changes
    if (msg.includes('diagnosis') || msg.includes('condition') || msg.includes('diagnosed with') ||
        msg.includes('i have') || msg.includes('my condition')) {
      return this.handleConditionQuery(msg, userName);
    }

    // General greeting
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return {
        text: `Hello, ${userName}! I'm Cura, your Care Assistant. Because we Caribou-t you! I can help you with your care plan, answer questions about your exercises or nutrition, check off tasks, and update your profile. Just tell me what you need! Remember, I provide supportive guidance only - always follow your clinician's recommendations.`,
        isWarning: false
      };
    }

    // Help or support requests
    if (msg.includes('help') || msg.includes('support') || msg.includes('assist') || msg.includes('how do i')) {
      return {
        text: `I'd be happy to help, ${userName}! Here's what I can do:\n\n- Mark tasks as done (meals, medications, exercises)\n- Answer questions about your care plan\n- Update meal times and preferences\n- Add or remove medications\n- Tell you about your condition\n\nFor more detailed help, visit our <a href="#" onclick="navigateTo('help'); toggleChatbot(); return false;" style="color: var(--primary-600); text-decoration: underline;">Help Page</a> which has tutorials and FAQs.`,
        isWarning: false
      };
    }

    // Complex requests beyond chatbot capabilities
    if (this.isComplexRequest(msg)) {
      return {
        text: `That's a great question, ${userName}! This is something I'd recommend exploring in more detail. Please visit our <a href="#" onclick="navigateTo('help'); toggleChatbot(); return false;" style="color: var(--primary-600); text-decoration: underline;">Help Page</a> for comprehensive guides, or contact your healthcare provider for personalized medical advice. Is there anything else I can help you with - like logging a meal or marking an exercise complete?`,
        isWarning: false
      };
    }

    // Default response - more dynamic with suggestions
    const suggestions = this.getContextualSuggestions();
    return {
      text: `I'm here to help, ${userName}! ${suggestions}\n\nFor more detailed assistance, check out our <a href="#" onclick="navigateTo('help'); toggleChatbot(); return false;" style="color: var(--primary-600); text-decoration: underline;">Help Page</a>. What would you like to do?`,
      isWarning: false
    };
  },

  // Check if request is too complex for the chatbot
  isComplexRequest(msg) {
    const complexPatterns = [
      'should i', 'is it safe', 'can i take', 'interact', 'side effect',
      'why do i', 'when should', 'how long', 'what if', 'symptoms',
      'pain management', 'alternative', 'surgery', 'procedure', 'test result',
      'blood pressure', 'heart rate', 'glucose level', 'lab result',
      'insurance', 'appointment', 'referral', 'specialist', 'second opinion'
    ];
    return complexPatterns.some(pattern => msg.includes(pattern));
  },

  // Get contextual suggestions based on time and progress
  getContextualSuggestions() {
    const hour = new Date().getHours();
    const userName = AppState.userData.firstName || 'there';

    // Morning suggestions (6am-11am)
    if (hour >= 6 && hour < 11) {
      if (!AppState.mealsEatenToday.includes('breakfast')) {
        return `Good morning! Have you had breakfast yet? Just say "I ate breakfast" to log it.`;
      }
      if (!AppState.completedTasks.medication.includes('med-morning')) {
        return `Don't forget your morning medications! Say "medication done" when you've taken them.`;
      }
      return `Looking good this morning! You can log exercises, meals, or ask me about your care plan.`;
    }

    // Midday suggestions (11am-2pm)
    if (hour >= 11 && hour < 14) {
      if (!AppState.mealsEatenToday.includes('lunch')) {
        return `It's lunchtime! Remember to log your meal by saying "I ate lunch".`;
      }
      return `How's your day going? I can help you track exercises or hydration.`;
    }

    // Afternoon suggestions (2pm-6pm)
    if (hour >= 14 && hour < 18) {
      const ptComplete = AppState.completedTasks.pt.length;
      const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
      const totalExercises = condition?.exercises?.length || 0;
      if (ptComplete < totalExercises) {
        return `Have you done your PT exercises today? Say "exercise done" to mark them complete.`;
      }
      return `Great progress today! I can help with any questions about your care plan.`;
    }

    // Evening suggestions (6pm-10pm)
    if (hour >= 18 && hour < 22) {
      if (!AppState.mealsEatenToday.includes('dinner')) {
        return `Time for dinner! Log it by saying "I ate dinner".`;
      }
      if (!AppState.completedTasks.medication.includes('med-evening')) {
        return `Don't forget your evening medications if you have any!`;
      }
      return `Winding down for the evening? Let me know if you need anything before bed.`;
    }

    // Night/early morning
    return `I can assist with questions about your care plan, exercises, nutrition, or preferences.`;
  },

  handleConditionQuery(msg, userName) {
    // Check if user is asking about their current condition
    if (msg.includes('what is my') || msg.includes('my diagnosis') || msg.includes('my condition')) {
      const currentCondition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
      return {
        text: `Your current primary condition is ${currentCondition.name}, ${userName}. ${currentCondition.description.split('.')[0]}. Your care plan is tailored specifically for this condition. Would you like to know more about your exercises or nutrition guidelines?`,
        isWarning: false
      };
    }

    // Check if user is reporting a new diagnosis or condition
    const diagnosedPatterns = [
      /diagnosed with\s+(.+)/i,
      /i have\s+(.+)/i,
      /i've been diagnosed\s+(?:with\s+)?(.+)/i,
      /my (?:new\s+)?(?:diagnosis|condition)\s+is\s+(.+)/i,
      /doctor said\s+(?:i have\s+)?(.+)/i
    ];

    for (const pattern of diagnosedPatterns) {
      const match = msg.match(pattern);
      if (match) {
        const conditionInput = match[1].trim().replace(/[.,!?]$/, '');
        const validatedCondition = validateCondition(conditionInput);

        if (validatedCondition) {
          // Check if it's already their condition
          if (validatedCondition.id === AppState.userData.diagnosis) {
            return {
              text: `${validatedCondition.name} is already set as your primary condition, ${userName}. Your care plan is currently tailored for this. Is there anything specific you'd like to know about your treatment plan?`,
              isWarning: false
            };
          }

          // Suggest updating their condition (requires profile change)
          return {
            text: `I found "${validatedCondition.name}" in our conditions database, ${userName}. To update your primary condition, please go to your Profile page and update your diagnosis there. This will automatically adjust your care plan, exercises, and nutrition guidelines. Would you like me to explain what the care plan for ${validatedCondition.name} includes?`,
            isWarning: false
          };
        } else {
          // Condition not found - suggest alternatives
          const suggestions = getConditionSuggestions(conditionInput);
          if (suggestions.length > 0) {
            return {
              text: `I couldn't find an exact match for "${conditionInput}", ${userName}. Did you mean one of these?\n${suggestions.map(s => `- ${s.name}`).join('\n')}\n\nIf your condition isn't listed, select "Other" in your profile and describe it in the notes section.`,
              isWarning: false
            };
          } else {
            return {
              text: `I couldn't find "${conditionInput}" in our supported conditions database, ${userName}. Our current supported conditions include: knee/ankle sprains, back pain, shoulder injury, joint replacements, diabetes, hypertension, cardiac rehab, stroke recovery, COPD, arthritis, fibromyalgia, and chronic fatigue syndrome. If your condition isn't listed, you can select "Other" in your profile.`,
              isWarning: false
            };
          }
        }
      }
    }

    // General condition info request
    const currentCondition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
    return {
      text: `Your care plan is currently set up for ${currentCondition.name}, ${userName}. I can tell you about:\n- Your PT exercises (${currentCondition.exercises.length} exercises)\n- Nutrition guidelines\n- Your current progress\n\nIf you need to update your condition, please visit your Profile page. What would you like to know more about?`,
      isWarning: false
    };
  },

  handleTaskCompletion(msg, userName) {
    // Check for specific task types
    if (msg.includes('breakfast') || msg.includes('morning meal')) {
      markMealEaten('breakfast');
      return { text: `Great job, ${userName}! I've marked your breakfast as eaten. Keep up the healthy eating!`, isWarning: false };
    }
    if (msg.includes('lunch')) {
      markMealEaten('lunch');
      return { text: `Excellent, ${userName}! Lunch marked as eaten. Hope it was delicious and nutritious!`, isWarning: false };
    }
    if (msg.includes('dinner')) {
      markMealEaten('dinner');
      return { text: `Wonderful, ${userName}! Dinner logged. You're doing great with your nutrition plan!`, isWarning: false };
    }
    if (msg.includes('snack')) {
      markMealEaten('snack');
      return { text: `Snack logged, ${userName}! Healthy snacking is part of the plan.`, isWarning: false };
    }
    if (msg.includes('medication') || msg.includes('meds') || msg.includes('medicine') || msg.includes('pill')) {
      if (!AppState.completedTasks.medication.includes('med-morning')) {
        AppState.completedTasks.medication.push('med-morning');
      } else if (!AppState.completedTasks.medication.includes('med-evening')) {
        AppState.completedTasks.medication.push('med-evening');
      }
      saveState();
      updateDashboardStats();
      return { text: `Medication marked as taken, ${userName}. Keep up the good work staying on schedule!`, isWarning: false };
    }
    if (msg.includes('exercise') || msg.includes('pt') || msg.includes('workout') || msg.includes('stretch')) {
      const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
      if (condition.exercises.length > 0) {
        const nextExercise = condition.exercises.find(ex =>
          !AppState.completedTasks.pt.includes(ex.name.toLowerCase().replace(/\s+/g, '-'))
        );
        if (nextExercise) {
          const taskId = nextExercise.name.toLowerCase().replace(/\s+/g, '-');
          AppState.completedTasks.pt.push(taskId);
          saveState();
          updateDashboardStats();
          return { text: `"${nextExercise.name}" marked as complete, ${userName}! ${condition.exercises.length - AppState.completedTasks.pt.length} exercises remaining for today.`, isWarning: false };
        }
      }
      return { text: `All PT exercises are already complete for today, ${userName}! Great work!`, isWarning: false };
    }
    if (msg.includes('water') || msg.includes('hydration') || msg.includes('drink')) {
      if (AppState.hydrationCount < 8) {
        AppState.hydrationCount++;
        saveState();
        updateDashboardStats();
        return { text: `Glass of water logged! You're at ${AppState.hydrationCount}/8 glasses today, ${userName}.`, isWarning: false };
      }
      return { text: `You've already reached your hydration goal of 8 glasses today, ${userName}! Stay hydrated!`, isWarning: false };
    }

    return { text: `I can help you mark tasks as complete, ${userName}! Just tell me what you finished - like "I completed my breakfast" or "mark my medication as done".`, isWarning: false };
  },

  handleMealLogging(msg, userName) {
    if (msg.includes('breakfast')) {
      markMealEaten('breakfast');
      return { text: `Breakfast logged, ${userName}! Hope it was a great start to your day.`, isWarning: false };
    }
    if (msg.includes('lunch')) {
      markMealEaten('lunch');
      return { text: `Lunch recorded, ${userName}! Keep making healthy choices.`, isWarning: false };
    }
    if (msg.includes('dinner')) {
      markMealEaten('dinner');
      return { text: `Dinner logged, ${userName}! You're staying on track with your nutrition plan.`, isWarning: false };
    }
    if (msg.includes('snack')) {
      markMealEaten('snack');
      return { text: `Snack noted, ${userName}! Mindful snacking helps maintain energy levels.`, isWarning: false };
    }
    return { text: `Which meal did you have, ${userName}? Just say "I ate breakfast/lunch/dinner/snack" and I'll log it for you!`, isWarning: false };
  },

  handleProfileUpdate(msg, userName) {
    // Extract time updates
    const timeMatch = msg.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch && (msg.includes('breakfast') || msg.includes('lunch') || msg.includes('dinner'))) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';

      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      if (msg.includes('breakfast')) {
        AppState.userData.breakfastTime = timeStr;
        saveState();
        return { text: `Breakfast time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
      }
      if (msg.includes('lunch')) {
        AppState.userData.lunchTime = timeStr;
        saveState();
        return { text: `Lunch time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
      }
      if (msg.includes('dinner')) {
        AppState.userData.dinnerTime = timeStr;
        saveState();
        return { text: `Dinner time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
      }
    }

    // Pharmacy updates
    if (msg.includes('pharmacy')) {
      const nameMatch = msg.match(/pharmacy\s+(?:name\s+)?(?:to\s+)?["']?([^"']+?)["']?$/i);
      if (nameMatch) {
        AppState.userData.pharmacyName = nameMatch[1].trim();
        saveState();
        return { text: `Pharmacy updated to "${AppState.userData.pharmacyName}", ${userName}!`, isWarning: false };
      }
    }

    // Name updates
    if (msg.includes('name') && !msg.includes('pharmacy') && !msg.includes('clinician')) {
      const nameMatch = msg.match(/name\s+(?:to\s+)?["']?(\w+)["']?/i);
      if (nameMatch) {
        AppState.userData.firstName = nameMatch[1].trim();
        saveState();
        return { text: `Nice to meet you, ${AppState.userData.firstName}! I've updated your name.`, isWarning: false };
      }
    }

    return { text: `I can help update your profile, ${userName}! Try saying things like "set my breakfast time to 8:30 AM" or "update my pharmacy name to Shoppers". What would you like to change?`, isWarning: false };
  },

  handleAddMedication(msg, userName) {
    // Try to extract medication name from the message
    // Patterns: "add medication metformin", "add metformin 500mg", "new medication lisinopril 10mg twice daily"
    const patterns = [
      /add (?:medication|medicine|med|a medication|a medicine)\s+(.+)/i,
      /new (?:medication|medicine|med)\s+(.+)/i,
      /prescribe(?:d)?\s+(.+)/i,
      /taking\s+(.+)/i
    ];

    let medInfo = null;
    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match) {
        medInfo = match[1].trim();
        break;
      }
    }

    if (!medInfo) {
      return {
        text: `I'd be happy to add a medication for you, ${userName}! Please tell me the medication name. For example: "Add medication Metformin 500mg twice daily" or just "Add medication Ibuprofen".`,
        isWarning: false
      };
    }

    // Parse medication info (name, dosage, frequency, condition)
    const parsedMed = this.parseMedicationInfo(medInfo);

    // Validate medication name against database
    const isValidMed = MedicationDatabase.some(med =>
      med.toLowerCase() === parsedMed.name.toLowerCase() ||
      parsedMed.name.toLowerCase().includes(med.toLowerCase())
    );

    // Initialize medications list if needed
    if (!AppState.userData.medicationsList) {
      AppState.userData.medicationsList = [];
    }

    // Check for duplicates
    const existingMed = AppState.userData.medicationsList.find(m =>
      m.name.toLowerCase() === parsedMed.name.toLowerCase()
    );

    if (existingMed) {
      return {
        text: `${parsedMed.name} is already in your medications list, ${userName}. Would you like to update the dosage? Try "update medication ${parsedMed.name} to [new dosage]".`,
        isWarning: false
      };
    }

    // Add the medication
    const newMed = {
      id: Date.now().toString(),
      name: parsedMed.name,
      dosage: parsedMed.dosage || '',
      frequency: parsedMed.frequency || 'as prescribed',
      condition: parsedMed.condition || AppState.userData.diagnosis || '',
      timeOfDay: parsedMed.timeOfDay || ['morning'],
      notes: parsedMed.notes || '',
      addedDate: new Date().toISOString(),
      isValidated: isValidMed
    };

    AppState.userData.medicationsList.push(newMed);

    // Also update legacy medications string
    const medNames = AppState.userData.medicationsList.map(m => m.name);
    AppState.userData.medications = medNames.join(', ');

    saveState();
    generateTaskCategories();

    let response = `I've added ${newMed.name}`;
    if (newMed.dosage) response += ` (${newMed.dosage})`;
    if (newMed.frequency !== 'as prescribed') response += `, ${newMed.frequency}`;
    response += ` to your medications list, ${userName}.`;

    if (!isValidMed) {
      response += ` Note: I couldn't verify this medication in my database. Please confirm the spelling with your pharmacist.`;
    }

    return { text: response, isWarning: false };
  },

  parseMedicationInfo(medString) {
    // Parse: "Metformin 500mg twice daily for diabetes"
    const result = {
      name: '',
      dosage: '',
      frequency: '',
      condition: '',
      timeOfDay: [],
      notes: ''
    };

    // Extract dosage (number + unit like mg, ml, mcg, etc.)
    const dosageMatch = medString.match(/(\d+\.?\d*)\s*(mg|ml|mcg|g|iu|units?)/i);
    if (dosageMatch) {
      result.dosage = dosageMatch[0];
      medString = medString.replace(dosageMatch[0], '').trim();
    }

    // Extract frequency
    const frequencies = [
      'once daily', 'twice daily', 'three times daily', 'four times daily',
      'once a day', 'twice a day', 'three times a day',
      'every morning', 'every evening', 'every night',
      'with meals', 'before meals', 'after meals',
      'as needed', 'prn', 'weekly', 'monthly'
    ];

    for (const freq of frequencies) {
      if (medString.toLowerCase().includes(freq)) {
        result.frequency = freq;
        medString = medString.replace(new RegExp(freq, 'i'), '').trim();
        break;
      }
    }

    // Extract time of day
    if (medString.toLowerCase().includes('morning') || medString.toLowerCase().includes('am')) {
      result.timeOfDay.push('morning');
    }
    if (medString.toLowerCase().includes('afternoon') || medString.toLowerCase().includes('noon')) {
      result.timeOfDay.push('afternoon');
    }
    if (medString.toLowerCase().includes('evening') || medString.toLowerCase().includes('night') || medString.toLowerCase().includes('pm')) {
      result.timeOfDay.push('evening');
    }
    if (result.timeOfDay.length === 0) {
      result.timeOfDay = ['morning']; // Default
    }

    // Extract condition (after "for")
    const conditionMatch = medString.match(/for\s+(\w+[\w\s]*)/i);
    if (conditionMatch) {
      result.condition = conditionMatch[1].trim();
      medString = medString.replace(conditionMatch[0], '').trim();
    }

    // Clean up and get medication name (what's left after removing other parts)
    result.name = medString.replace(/[,]/g, '').trim();

    // Capitalize first letter
    if (result.name) {
      result.name = result.name.charAt(0).toUpperCase() + result.name.slice(1);
    }

    return result;
  },

  handleRemoveMedication(msg, userName) {
    const patterns = [
      /remove (?:medication|medicine|med)\s+(.+)/i,
      /stop(?:ped)? taking\s+(.+)/i,
      /delete (?:medication|medicine|med)\s+(.+)/i,
      /i stopped\s+(.+)/i,
      /stopped\s+(?:my\s+)?(.+)/i,
      /quit(?:ting)? (?:taking\s+)?(.+)/i,
      /no longer taking\s+(.+)/i,
      /off (?:of\s+)?(?:my\s+)?(.+)/i,
      /discontinued\s+(.+)/i,
      /came off\s+(?:of\s+)?(.+)/i
    ];

    let medName = null;
    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match) {
        medName = match[1].trim();
        // Clean up common trailing words
        medName = medName.replace(/\s*(now|today|yesterday|anymore|any more|medicine|medication)$/i, '').trim();
        break;
      }
    }

    // If no pattern matched, try to find medication name from MedicationDatabase in the message
    if (!medName) {
      const msgLower = msg.toLowerCase();
      for (const dbMed of MedicationDatabase) {
        if (msgLower.includes(dbMed.toLowerCase())) {
          medName = dbMed;
          break;
        }
      }
    }

    if (!medName) {
      return {
        text: `I understand you've made a change to your medications, ${userName}. Which medication did you stop taking? Just say the name and I'll update your list.`,
        isWarning: false
      };
    }

    if (!AppState.userData.medicationsList || AppState.userData.medicationsList.length === 0) {
      return {
        text: `You don't have any medications in your list yet, ${userName}. You can add one by saying "add medication [name]".`,
        isWarning: false
      };
    }

    const medIndex = AppState.userData.medicationsList.findIndex(m =>
      m.name.toLowerCase().includes(medName.toLowerCase()) ||
      medName.toLowerCase().includes(m.name.toLowerCase())
    );

    if (medIndex === -1) {
      return {
        text: `I couldn't find "${medName}" in your medications list, ${userName}. Your current medications are: ${AppState.userData.medicationsList.map(m => m.name).join(', ')}.`,
        isWarning: false
      };
    }

    const removedMed = AppState.userData.medicationsList.splice(medIndex, 1)[0];

    // Update legacy string
    AppState.userData.medications = AppState.userData.medicationsList.map(m => m.name).join(', ');

    saveState();
    generateTaskCategories();

    return {
      text: `I've removed ${removedMed.name} from your medications list, ${userName}. Remember: always consult your doctor before stopping any medication.`,
      isWarning: true
    };
  },

  handleMedicationChange(msg, userName) {
    // Handle started taking, switched to, dose changes
    const startedPatterns = [
      /started (?:taking\s+)?(.+?)(?:\s+\d+\s*(?:mg|mcg|ml|g))?$/i,
      /began taking\s+(.+)/i,
      /now taking\s+(.+)/i,
      /switched to\s+(.+)/i,
      /changed to\s+(.+)/i
    ];

    const doseChangePatterns = [
      /(?:increased|decreased)\s+(?:my\s+)?(.+?)\s+(?:to|by)\s+(\d+\s*(?:mg|mcg|ml|g))/i,
      /(?:dose|dosage)\s+(?:changed|updated)\s+(?:for\s+)?(.+?)\s+(?:to\s+)?(\d+\s*(?:mg|mcg|ml|g))/i,
      /new dose\s+(?:of|for)\s+(.+?)\s+(?:is\s+)?(\d+\s*(?:mg|mcg|ml|g))/i
    ];

    // Check for dose changes first
    for (const pattern of doseChangePatterns) {
      const match = msg.match(pattern);
      if (match) {
        const medName = match[1].trim();
        const newDose = match[2].trim();

        // Find and update medication
        if (AppState.userData.medicationsList) {
          const existingMed = AppState.userData.medicationsList.find(m =>
            m.name.toLowerCase().includes(medName.toLowerCase()) ||
            medName.toLowerCase().includes(m.name.toLowerCase())
          );

          if (existingMed) {
            const oldDose = existingMed.dosage || 'unspecified';
            existingMed.dosage = newDose;
            existingMed.lastUpdated = new Date().toISOString();
            saveState();
            generateTaskCategories();
            return {
              text: `I've updated ${existingMed.name} dosage from ${oldDose} to ${newDose}, ${userName}. Make sure to follow your doctor's instructions for the new dosage.`,
              isWarning: false
            };
          }
        }

        return {
          text: `I don't see ${medName} in your current medications list, ${userName}. Would you like me to add it with the ${newDose} dosage? Say "add medication ${medName} ${newDose}".`,
          isWarning: false
        };
      }
    }

    // Check for started taking
    for (const pattern of startedPatterns) {
      const match = msg.match(pattern);
      if (match) {
        let medInfo = match[1].trim();
        medInfo = medInfo.replace(/\s*(now|today|yesterday)$/i, '').trim();

        // Parse the medication info
        const parsedMed = this.parseMedicationInfo(medInfo);

        // Check if it's a valid medication
        const isValidMed = MedicationDatabase.some(med =>
          med.toLowerCase() === parsedMed.name.toLowerCase() ||
          med.toLowerCase().includes(parsedMed.name.toLowerCase()) ||
          parsedMed.name.toLowerCase().includes(med.toLowerCase())
        );

        // Check if already in list
        if (AppState.userData.medicationsList) {
          const existingMed = AppState.userData.medicationsList.find(m =>
            m.name.toLowerCase() === parsedMed.name.toLowerCase()
          );
          if (existingMed) {
            return {
              text: `${parsedMed.name} is already in your medications list, ${userName}. Would you like to update the dosage or frequency?`,
              isWarning: false
            };
          }
        }

        // Add the new medication
        if (!AppState.userData.medicationsList) {
          AppState.userData.medicationsList = [];
        }

        const newMed = {
          id: Date.now().toString(),
          name: parsedMed.name,
          dosage: parsedMed.dosage || '',
          frequency: parsedMed.frequency || 'as prescribed',
          condition: AppState.userData.diagnosis || '',
          timeOfDay: ['morning'],
          notes: '',
          addedDate: new Date().toISOString(),
          isValidated: isValidMed
        };

        AppState.userData.medicationsList.push(newMed);
        AppState.userData.medications = AppState.userData.medicationsList.map(m => m.name).join(', ');

        saveState();
        generateTaskCategories();

        const validationNote = isValidMed ? '' : ' (Note: I couldn\'t verify this medication name - please double-check the spelling.)';
        return {
          text: `I've added ${newMed.name}${newMed.dosage ? ' ' + newMed.dosage : ''} to your medications list, ${userName}.${validationNote} I'll include reminders in your daily tasks.`,
          isWarning: false
        };
      }
    }

    return {
      text: `I understand you've made a change to your medications, ${userName}. Could you tell me more specifically? For example:\n- "I started taking [medication name]"\n- "I stopped taking [medication name]"\n- "My [medication] dose changed to [new dose]"`,
      isWarning: false
    };
  },

  handleListMedications(userName) {
    if (!AppState.userData.medicationsList || AppState.userData.medicationsList.length === 0) {
      // Check legacy format
      if (AppState.userData.medications && AppState.userData.medications.trim()) {
        return {
          text: `Your medications: ${AppState.userData.medications}, ${userName}. Would you like to add more details like dosage? Just say "add medication [name] [dosage]".`,
          isWarning: false
        };
      }
      return {
        text: `You don't have any medications in your list yet, ${userName}. You can add one by saying "add medication [name]" with optional dosage and frequency.`,
        isWarning: false
      };
    }

    const medList = AppState.userData.medicationsList.map(m => {
      let desc = m.name;
      if (m.dosage) desc += ` ${m.dosage}`;
      if (m.frequency && m.frequency !== 'as prescribed') desc += ` (${m.frequency})`;
      if (m.condition) desc += ` - for ${m.condition}`;
      if (!m.isValidated) desc += ' (unverified)';
      return desc;
    }).join('\n- ');

    return {
      text: `Your medications, ${userName}:\n- ${medList}\n\nTo add or remove, just ask! All medications are verified against our database.`,
      isWarning: false
    };
  },

  // Check if message contains a blocked substance
  containsBlockedSubstance(msg) {
    return BlockedSubstances.some(substance => msg.includes(substance));
  },

  // Handle attempts to add blocked substances
  handleBlockedSubstance(msg, userName) {
    const foundSubstance = BlockedSubstances.find(s => msg.includes(s));
    return {
      text: `I'm sorry ${userName}, but I cannot add "${foundSubstance}" to your medications list. This appears to be a controlled or illegal substance that is not a valid prescription medication. If you're struggling with substance use, please reach out to:\n\n- SAMHSA National Helpline: 1-800-662-4357\n- Your healthcare provider\n- A local addiction treatment center\n\nI'm here to help with legitimate prescription medications only.`,
      isWarning: true
    };
  },

  // Check if the message is a profile update request
  isProfileUpdateRequest(msg) {
    const updateKeywords = [
      'update my', 'change my', 'set my', 'modify my', 'edit my',
      'i want to change', 'i need to update', 'can you change',
      'my new', 'i moved', 'my address', 'my phone', 'my email',
      'my age is', 'i am now', 'i\'m now', 'i weigh', 'my weight',
      'my height', 'i\'m allergic', 'i dislike', 'i don\'t like',
      'my name is', 'call me', 'my doctor', 'my clinician',
      'my pharmacy', 'my wake', 'my bedtime', 'i sleep at',
      'i wake up', 'workout at', 'exercise at', 'prefer to eat',
      'eating time', 'meal time'
    ];
    return updateKeywords.some(keyword => msg.includes(keyword));
  },

  // Dynamic profile update handler for all profile attributes
  handleDynamicProfileUpdate(msg, userName) {
    // Name updates
    if (msg.includes('name') || msg.includes('call me')) {
      const patterns = [
        /(?:my name is|call me|name to)\s+["']?(\w+)["']?/i,
        /name[:\s]+["']?(\w+)["']?/i
      ];
      for (const pattern of patterns) {
        const match = msg.match(pattern);
        if (match) {
          AppState.userData.firstName = match[1].trim();
          saveState();
          return { text: `Nice to meet you, ${AppState.userData.firstName}! I've updated your name in your profile.`, isWarning: false };
        }
      }
    }

    // Age updates
    if (msg.includes('age') || msg.includes('years old') || msg.includes('i am ') || msg.includes('i\'m ')) {
      const ageMatch = msg.match(/(?:age is|am|i'm)\s*(\d{1,3})/i) || msg.match(/(\d{1,3})\s*years?\s*old/i);
      if (ageMatch) {
        const age = parseInt(ageMatch[1]);
        if (age >= 13 && age <= 120) {
          AppState.userData.age = age;
          saveState();
          return { text: `I've updated your age to ${age}, ${userName}. This helps us personalize your care plan appropriately.`, isWarning: false };
        }
      }
    }

    // Weight updates
    if (msg.includes('weigh') || msg.includes('weight')) {
      const weightMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms?|lbs?|pounds?)/i);
      if (weightMatch) {
        const weight = weightMatch[0];
        AppState.userData.weight = weight;
        saveState();
        return { text: `Weight updated to ${weight}, ${userName}. This helps with medication dosing and nutrition calculations.`, isWarning: false };
      }
    }

    // Height updates
    if (msg.includes('height') || msg.includes('tall') || msg.includes('cm') || msg.includes('feet')) {
      const heightMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters?|ft|feet|foot|'?\s*\d*"?)/i);
      if (heightMatch) {
        const height = heightMatch[0];
        AppState.userData.height = height;
        saveState();
        return { text: `Height updated to ${height}, ${userName}.`, isWarning: false };
      }
    }

    // Clinician/Doctor updates
    if (msg.includes('doctor') || msg.includes('clinician') || msg.includes('physician') || msg.includes('provider')) {
      const docMatch = msg.match(/(?:doctor|clinician|physician|provider)(?:'s)?\s+(?:is|to|name)?\s*(?:dr\.?\s*)?["']?([A-Za-z\s]+?)["']?(?:\s*$|\s+(?:at|in|from|phone))/i);
      if (docMatch) {
        const docName = docMatch[1].trim();
        AppState.userData.clinicianName = docName.startsWith('Dr') ? docName : `Dr. ${docName}`;
        saveState();
        return { text: `I've updated your clinician to ${AppState.userData.clinicianName}, ${userName}. Your care team info is now up to date.`, isWarning: false };
      }
    }

    // Phone number updates
    if (msg.includes('phone') || msg.includes('number') || msg.includes('call')) {
      const phoneMatch = msg.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        if (msg.includes('pharmacy')) {
          AppState.userData.pharmacyPhone = phoneMatch[1];
          saveState();
          return { text: `Pharmacy phone updated to ${phoneMatch[1]}, ${userName}.`, isWarning: false };
        } else if (msg.includes('doctor') || msg.includes('clinician')) {
          AppState.userData.clinicianPhone = phoneMatch[1];
          saveState();
          return { text: `Clinician phone updated to ${phoneMatch[1]}, ${userName}.`, isWarning: false };
        }
      }
    }

    // Pharmacy updates
    if (msg.includes('pharmacy')) {
      const pharmacyMatch = msg.match(/pharmacy\s+(?:is|to|name|at)?\s*["']?([A-Za-z\s']+?)["']?(?:\s*$|\s+(?:phone|number|at|on))/i);
      if (pharmacyMatch) {
        AppState.userData.pharmacyName = pharmacyMatch[1].trim();
        saveState();
        return { text: `Pharmacy updated to ${AppState.userData.pharmacyName}, ${userName}.`, isWarning: false };
      }
    }

    // Sleep/wake time updates
    if (msg.includes('sleep') || msg.includes('bed') || msg.includes('wake')) {
      const timeMatch = msg.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const isPM = timeMatch[3]?.toLowerCase() === 'pm';
        if (isPM && hours < 12) hours += 12;
        if (!isPM && timeMatch[3] && hours === 12) hours = 0;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        if (msg.includes('wake')) {
          AppState.userData.wakeTime = timeStr;
          saveState();
          return { text: `Wake time set to ${formatTime(timeStr)}, ${userName}. I'll adjust your schedule accordingly.`, isWarning: false };
        } else {
          AppState.userData.bedtime = timeStr;
          saveState();
          return { text: `Bedtime set to ${formatTime(timeStr)}, ${userName}. Getting good sleep is important for recovery!`, isWarning: false };
        }
      }
    }

    // Meal time updates
    if (msg.includes('breakfast') || msg.includes('lunch') || msg.includes('dinner') || msg.includes('meal')) {
      const timeMatch = msg.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const isPM = timeMatch[3]?.toLowerCase() === 'pm';
        if (isPM && hours < 12) hours += 12;
        if (!isPM && timeMatch[3] && hours === 12) hours = 0;
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        if (msg.includes('breakfast')) {
          AppState.userData.breakfastTime = timeStr;
          saveState();
          return { text: `Breakfast time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
        } else if (msg.includes('lunch')) {
          AppState.userData.lunchTime = timeStr;
          saveState();
          return { text: `Lunch time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
        } else if (msg.includes('dinner')) {
          AppState.userData.dinnerTime = timeStr;
          saveState();
          return { text: `Dinner time updated to ${formatTime(timeStr)}, ${userName}!`, isWarning: false };
        }
      }
    }

    // Exercise location preference
    if (msg.includes('workout') || msg.includes('exercise')) {
      if (msg.includes('gym')) {
        AppState.userData.workoutLocation = 'gym';
        saveState();
        return { text: `Got it, ${userName}! I'll tailor your exercises for gym workouts.`, isWarning: false };
      } else if (msg.includes('home')) {
        AppState.userData.workoutLocation = 'home';
        saveState();
        return { text: `Perfect, ${userName}! I'll focus on at-home exercises for you.`, isWarning: false };
      } else if (msg.includes('outdoor') || msg.includes('outside')) {
        AppState.userData.workoutLocation = 'outdoors';
        saveState();
        return { text: `Great choice, ${userName}! Outdoor exercise is wonderful. I'll adjust your plan accordingly.`, isWarning: false };
      }
    }

    return {
      text: `I can help update your profile, ${userName}! Here's what I can change:\n\n` +
        `- Personal: "My name is [name]", "I am [age] years old", "I weigh [weight]"\n` +
        `- Times: "My breakfast time is [time]", "I wake up at [time]"\n` +
        `- Care team: "My doctor is Dr. [name]", "My pharmacy is [name]"\n` +
        `- Preferences: "I workout at [gym/home]", "I'm allergic to [food]"\n\n` +
        `What would you like to update?`,
      isWarning: false
    };
  },

  // Handle dietary changes
  handleDietaryChange(msg, userName) {
    const restrictions = AppState.userData.dietaryRestrictions || [];
    let updated = false;
    let addedItems = [];
    let removedItems = [];

    // Check for adding restrictions
    if (msg.includes('vegetarian') && !msg.includes('not') && !msg.includes('no longer')) {
      if (!restrictions.includes('vegetarian')) {
        restrictions.push('vegetarian');
        addedItems.push('vegetarian');
        updated = true;
      }
    }
    if (msg.includes('vegan') && !msg.includes('not') && !msg.includes('no longer')) {
      if (!restrictions.includes('vegan')) {
        restrictions.push('vegan');
        addedItems.push('vegan');
        updated = true;
      }
    }
    if ((msg.includes('gluten') && (msg.includes('free') || msg.includes('intoleran') || msg.includes('allerg'))) ||
        msg.includes('celiac')) {
      if (!restrictions.includes('gluten-free')) {
        restrictions.push('gluten-free');
        addedItems.push('gluten-free');
        updated = true;
      }
    }
    if (msg.includes('dairy') && (msg.includes('free') || msg.includes('intoleran') || msg.includes('allerg'))) {
      if (!restrictions.includes('dairy-free')) {
        restrictions.push('dairy-free');
        addedItems.push('dairy-free');
        updated = true;
      }
    }
    if (msg.includes('nut') && msg.includes('allerg')) {
      if (!restrictions.includes('nut-allergy')) {
        restrictions.push('nut-allergy');
        addedItems.push('nut allergy');
        updated = true;
      }
    }
    if (msg.includes('sodium') || msg.includes('salt')) {
      if (!restrictions.includes('low-sodium')) {
        restrictions.push('low-sodium');
        addedItems.push('low sodium');
        updated = true;
      }
    }

    // Check for specific food dislikes/allergies
    const foodsToAvoid = ['shellfish', 'fish', 'eggs', 'soy', 'wheat', 'peanuts', 'tree nuts', 'sesame'];
    for (const food of foodsToAvoid) {
      if (msg.includes(food)) {
        const currentNotes = AppState.userData.otherDietaryNotes || '';
        if (!currentNotes.toLowerCase().includes(food)) {
          AppState.userData.otherDietaryNotes = currentNotes ? `${currentNotes}, avoid ${food}` : `Avoid ${food}`;
          addedItems.push(food + ' avoidance');
          updated = true;
        }
      }
    }

    if (updated) {
      AppState.userData.dietaryRestrictions = restrictions;
      saveState();

      // Trigger intelligent meal plan update
      if (typeof updateMealPlanIntelligently === 'function') {
        updateMealPlanIntelligently(addedItems, removedItems, AppState.userData.otherDietaryNotes);
      }

      return {
        text: `I've updated your dietary preferences, ${userName}. Added: ${addedItems.join(', ')}. Your meal plan will be adjusted to accommodate these changes. You can view your updated meals on the Nutrition page.`,
        isWarning: false
      };
    }

    return {
      text: `I can help with dietary changes, ${userName}! Just tell me:\n- "I'm vegetarian" or "I'm vegan"\n- "I'm gluten-free" or "I have celiac disease"\n- "I'm allergic to [food]"\n- "I don't eat [food]"\n\nYour meal plan will automatically adjust!`,
      isWarning: false
    };
  },

  addMessage(text, isUser = false, isWarning = false) {
    this.messages.push({ text, isUser, isWarning, timestamp: new Date() });
    this.renderMessages();
  },

  renderMessages() {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;

    container.innerHTML = '';
    const userName = AppState.userData.firstName || 'there';

    if (this.messages.length === 0) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'chat-message assistant';
      welcomeMsg.textContent = `Hello${userName !== 'there' ? ', ' + userName : ''}! I'm Cura, your Care Assistant. How can I help you today? Remember, I provide supportive guidance only.`;
      container.appendChild(welcomeMsg);
    } else {
      this.messages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = `chat-message ${msg.isUser ? 'user' : 'assistant'}${msg.isWarning ? ' system' : ''}`;
        // Use innerHTML for assistant messages to render links, textContent for user messages (security)
        if (msg.isUser) {
          msgEl.textContent = msg.text;
        } else {
          msgEl.innerHTML = msg.text;
        }
        container.appendChild(msgEl);
      });
    }

    container.scrollTop = container.scrollHeight;
  }
};

// ============================================
// BMI & Weight Management Calculations
// ============================================

// Calculate BMI from height (cm) and weight (kg)
function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const heightM = parseFloat(heightCm) / 100;
  return parseFloat(weightKg) / (heightM * heightM);
}

// Get BMI category and info
function getBMICategory(bmi) {
  if (bmi < 18.5) return { category: 'Underweight', color: '#FFA726', advice: 'Consider a healthy weight gain program' };
  if (bmi < 25) return { category: 'Normal', color: '#66BB6A', advice: 'Maintain your healthy weight' };
  if (bmi < 30) return { category: 'Overweight', color: '#FFA726', advice: 'Consider gradual weight loss' };
  if (bmi < 35) return { category: 'Obese Class I', color: '#EF5350', advice: 'Weight loss recommended for health' };
  if (bmi < 40) return { category: 'Obese Class II', color: '#E53935', advice: 'Weight loss strongly recommended' };
  return { category: 'Obese Class III', color: '#C62828', advice: 'Consult healthcare provider for weight management' };
}

// Calculate ideal weight range based on height (using BMI 18.5-24.9)
function calculateIdealWeight(heightCm) {
  if (!heightCm) return null;
  const heightM = parseFloat(heightCm) / 100;
  const minWeight = 18.5 * heightM * heightM;
  const maxWeight = 24.9 * heightM * heightM;
  const midWeight = 22 * heightM * heightM; // Target BMI of 22
  return {
    min: Math.round(minWeight * 10) / 10,
    max: Math.round(maxWeight * 10) / 10,
    target: Math.round(midWeight * 10) / 10
  };
}

// Get weight management info for user
function getWeightManagementInfo(userData) {
  const heightCm = parseFloat(userData.height);
  const weightKg = parseFloat(userData.weight);

  if (!heightCm || !weightKg) return null;

  const bmi = calculateBMI(heightCm, weightKg);
  const bmiCategory = getBMICategory(bmi);
  const idealWeight = calculateIdealWeight(heightCm);
  const weightDiff = weightKg - idealWeight.target;

  return {
    currentBMI: Math.round(bmi * 10) / 10,
    bmiCategory: bmiCategory.category,
    bmiColor: bmiCategory.color,
    bmiAdvice: bmiCategory.advice,
    idealWeightRange: idealWeight,
    currentWeight: weightKg,
    weightToLose: weightDiff > 0 ? Math.round(weightDiff * 10) / 10 : 0,
    weightToGain: weightDiff < 0 ? Math.round(Math.abs(weightDiff) * 10) / 10 : 0,
    weeksToGoal: Math.abs(weightDiff) > 0 ? Math.ceil(Math.abs(weightDiff) / 0.5) : 0 // ~0.5kg per week
  };
}

// Check if any condition requires weight management
function hasWeightManagementCondition() {
  const conditions = getAllUserConditions();
  return conditions.some(id => id === 'weight-loss' || id === 'weight-gain');
}

// Check if body measurements are required (for weight management conditions)
function isBodyMeasurementsRequired() {
  return hasWeightManagementCondition();
}

// ============================================
// Calorie Calculator
// ============================================
function calculateDailyCalories(userData) {
  let { age, sex, height, weight } = userData;
  const { activityLevel } = userData;

  // Convert from imperial if needed
  if (AppState.preferredUnits === 'imperial') {
    const heightFt = parseFloat(document.getElementById('user-height-ft')?.value) || 0;
    const heightIn = parseFloat(document.getElementById('user-height-in')?.value) || 0;
    const weightLbs = parseFloat(document.getElementById('user-weight-lbs')?.value) || 0;

    if (heightFt || heightIn) {
      height = (heightFt * 30.48) + (heightIn * 2.54);
    }
    if (weightLbs) {
      weight = weightLbs * 0.453592;
    }
  }

  if (!age || !sex || !height || !weight) {
    return 2000;
  }

  // Calculate BMR using Mifflin-St Jeor equation
  let bmr;
  if (sex === 'male') {
    bmr = 88.362 + (13.397 * parseFloat(weight)) + (4.799 * parseFloat(height)) - (5.677 * parseFloat(age));
  } else {
    bmr = 447.593 + (9.247 * parseFloat(weight)) + (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));
  }

  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'extra-active': 1.9
  };

  const multiplier = multipliers[activityLevel] || 1.55;
  let tdee = Math.round(bmr * multiplier);

  // Adjust for weight management goals
  const conditions = getAllUserConditions();
  if (conditions.includes('weight-loss')) {
    // Create 500 calorie deficit for ~0.5kg/week loss
    tdee -= 500;
    // Minimum safe calories
    tdee = Math.max(tdee, sex === 'male' ? 1500 : 1200);
  } else if (conditions.includes('weight-gain')) {
    // Create 400 calorie surplus for healthy muscle gain
    tdee += 400;
  }

  return Math.round(tdee);
}

// Get all user conditions (primary + secondary + weight management)
function getAllUserConditions() {
  const conditions = [];
  if (AppState.userData.diagnosis) {
    conditions.push(AppState.userData.diagnosis);
  }
  if (AppState.userData.additionalConditions && Array.isArray(AppState.userData.additionalConditions)) {
    AppState.userData.additionalConditions.forEach(c => {
      if (c.id && !conditions.includes(c.id)) {
        conditions.push(c.id);
      }
    });
  }

  // Include weight management goal as a condition if set
  const wmGoal = AppState.userData.weightManagement?.goal;
  if (wmGoal && !conditions.includes(wmGoal)) {
    conditions.push(wmGoal);
  }

  return conditions;
}

// ============================================
// Unit Toggle Functions
// ============================================
function toggleUnits(unit) {
  AppState.preferredUnits = unit;

  document.querySelectorAll('.unit-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.unit === unit);
  });

  const metricInputs = document.getElementById('metric-inputs');
  const imperialInputs = document.getElementById('imperial-inputs');

  if (metricInputs && imperialInputs) {
    if (unit === 'metric') {
      metricInputs.style.display = 'grid';
      imperialInputs.style.display = 'none';
    } else {
      metricInputs.style.display = 'none';
      imperialInputs.style.display = 'grid';
    }
  }
}

// ============================================
// Medication Validation
// ============================================
function validateMedications(textarea) {
  const validationDiv = document.getElementById('medication-validation');
  if (!validationDiv) return;

  const value = textarea.value.trim();
  if (!value) {
    validationDiv.style.display = 'none';
    return;
  }

  const lines = value.split('\n').filter(l => l.trim());
  const unknownMeds = [];

  lines.forEach(line => {
    const medName = line.trim().toLowerCase();
    if (medName === 'n/a' || medName === 'none' || medName === 'na' || medName === '-') {
      unknownMeds.push({ original: line.trim(), suggestions: [] });
    } else {
      const found = MedicationDatabase.some(med =>
        med.toLowerCase().includes(medName) || medName.includes(med.toLowerCase())
      );
      if (!found && medName.length > 2) {
        const similar = MedicationDatabase.filter(med =>
          med.toLowerCase().startsWith(medName.charAt(0)) ||
          levenshteinDistance(med.toLowerCase(), medName) <= 3
        ).slice(0, 3);
        unknownMeds.push({ original: line.trim(), suggestions: similar });
      }
    }
  });

  if (unknownMeds.length > 0) {
    validationDiv.style.display = 'block';
    let html = '';

    unknownMeds.forEach(med => {
      if (med.original.toLowerCase() === 'n/a' || med.original.toLowerCase() === 'none' || med.original.toLowerCase() === 'na') {
        html += `<p><strong>"${med.original}"</strong> doesn't appear to be a medication. If you have no medications, you may leave this field empty or skip this section.</p>`;
      } else {
        html += `<p><strong>"${med.original}"</strong> doesn't appear in our database.`;
        if (med.suggestions.length > 0) {
          html += ` Did you mean: `;
          med.suggestions.forEach(s => {
            html += `<span class="med-suggestion" onclick="replaceMedication('${med.original}', '${s}')">${s}</span>`;
          });
        }
        html += `</p>`;
      }
    });

    html += `<p style="font-size: 0.75rem; margin-top: var(--space-2); color: var(--gray-500);">If your medication is spelled correctly, you can ignore this message.</p>`;
    validationDiv.innerHTML = html;
  } else {
    validationDiv.style.display = 'none';
  }
}

function replaceMedication(original, replacement) {
  const textarea = document.getElementById('medications');
  if (textarea) {
    textarea.value = textarea.value.replace(original, replacement);
    validateMedications(textarea);
  }
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ============================================
// Calorie Toggle & Macro Display
// ============================================
function toggleCalorieDisplay() {
  const toggle = document.getElementById('show-calories-toggle');
  AppState.showCalories = toggle?.checked || false;

  const calorieInfo = document.getElementById('calorie-info');
  const mealCalories = document.querySelectorAll('.meal-calories');

  if (AppState.showCalories) {
    if (calorieInfo) calorieInfo.style.display = 'block';
    mealCalories.forEach(el => el.classList.remove('meal-calories-hidden'));
    // Update macro display
    updateMacroDisplay();
    // Update calorie goal tip for weight management
    updateCalorieGoalTip();
  } else {
    if (calorieInfo) calorieInfo.style.display = 'none';
    mealCalories.forEach(el => el.classList.add('meal-calories-hidden'));
  }
}

// Update calorie goal tip for weight management users
function updateCalorieGoalTip() {
  const tipEl = document.getElementById('calorie-goal-tip');
  const labelEl = document.getElementById('calorie-goal-label');
  const descEl = document.getElementById('calorie-goal-description');

  if (!tipEl || !labelEl || !descEl) return;

  const conditions = getAllUserConditions();
  const isWeightLoss = conditions.includes('weight-loss') || conditions.includes('obesity');
  const isWeightGain = conditions.includes('weight-gain');

  if (isWeightLoss) {
    tipEl.style.display = 'flex';
    tipEl.className = 'calorie-goal-tip deficit';
    labelEl.textContent = '🔥 Calorie Deficit';
    descEl.textContent = 'Your target is 500 calories below maintenance for safe, steady weight loss of ~0.5kg (1 lb) per week.';
  } else if (isWeightGain) {
    tipEl.style.display = 'flex';
    tipEl.className = 'calorie-goal-tip surplus';
    labelEl.textContent = '💪 Calorie Surplus';
    descEl.textContent = 'Your target is 400 calories above maintenance to support healthy muscle gain of ~0.25kg (0.5 lb) per week.';
  } else {
    tipEl.style.display = 'none';
  }
}

// Calculate and display macros based on daily calories
function updateMacroDisplay() {
  const calories = calculateDailyCalories(AppState.userData);
  const conditions = getAllUserConditions();

  // Different macro ratios based on goals
  let proteinPercent = 25;  // Default balanced
  let carbsPercent = 45;
  let fatPercent = 30;

  // Adjust for weight management goals
  if (conditions.includes('weight-loss')) {
    // Higher protein for satiety and muscle preservation
    proteinPercent = 30;
    carbsPercent = 40;
    fatPercent = 30;
  } else if (conditions.includes('weight-gain')) {
    // Higher protein for muscle building
    proteinPercent = 30;
    carbsPercent = 45;
    fatPercent = 25;
  } else if (conditions.includes('diabetes-type2')) {
    // Lower carbs for blood sugar management
    proteinPercent = 25;
    carbsPercent = 40;
    fatPercent = 35;
  }

  // Calculate grams (protein & carbs = 4 cal/g, fat = 9 cal/g)
  const proteinGrams = Math.round((calories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercent / 100)) / 4);
  const fatGrams = Math.round((calories * (fatPercent / 100)) / 9);

  // Update display
  const proteinEl = document.getElementById('macro-protein');
  const carbsEl = document.getElementById('macro-carbs');
  const fatEl = document.getElementById('macro-fat');

  if (proteinEl) proteinEl.textContent = `${proteinGrams}g`;
  if (carbsEl) carbsEl.textContent = `${carbsGrams}g`;
  if (fatEl) fatEl.textContent = `${fatGrams}g`;
}

// ============================================
// Navigation
// ============================================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Map aliases to actual page IDs
  const pageAliases = {
    'medicine': 'medication',
    'pt': 'physicaltherapy',
    'dashboard': 'home'
  };
  const actualPage = pageAliases[page] || page;

  const targetPage = document.getElementById(`page-${actualPage}`);
  if (targetPage) {
    targetPage.classList.add('active');
    AppState.currentPage = page;

    // Update desktop nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === page) {
        link.classList.add('active');
      }
    });

    // Update mobile bottom nav highlighting
    updateMobileNavHighlight(page);

    document.getElementById('nav-links')?.classList.remove('open');
    window.scrollTo(0, 0);

    // Close secondary menu when navigating
    closeSecondaryMenu();

    if (page === 'home' || page === 'dashboard') {
      updateDashboard();
      // Load daily check-in state
      loadDailyCheckin();
      // Check if we should show the tutorial for new users
      if (typeof checkAndStartTutorial === 'function') {
        checkAndStartTutorial();
      }
    }
    if (page === 'nutrition') {
      updateNutritionPage();
      // Check for page-specific tutorial
      setTimeout(() => checkPageTutorial('nutrition'), 500);
    }
    if (page === 'medication' || page === 'medicine') {
      updateMedicationPage();
      setTimeout(() => checkPageTutorial('medication'), 500);
    }
    if (page === 'physicaltherapy' || page === 'pt') {
      updatePTPage();
      setTimeout(() => checkPageTutorial('pt'), 500);
    }
    if (page === 'condition') {
      updateConditionPage();
      setTimeout(() => checkPageTutorial('condition'), 500);
    }
    if (page === 'profile') {
      updateProfilePage();
      renderProfileCheckinHistory();
      setTimeout(() => checkPageTutorial('profile'), 500);
    }
    if (page === 'progress') {
      updateProgressPage();
      setTimeout(() => checkPageTutorial('progress'), 500);
    }
  }
}

/**
 * Updates the mobile bottom navigation highlighting
 */
function updateMobileNavHighlight(page) {
  const mobileNav = document.getElementById('mobile-bottom-nav');
  if (!mobileNav) return;

  // Map page names to nav data-page values
  const pageMap = {
    'home': 'home',
    'dashboard': 'home',
    'physicaltherapy': 'pt',
    'pt': 'pt',
    'medication': 'medicine',
    'medicine': 'medicine',
    'nutrition': 'nutrition',
    'profile': 'profile'
  };

  const navPage = pageMap[page] || page;

  mobileNav.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === navPage) {
      item.classList.add('active');
    }
  });
}

/**
 * Opens the profile secondary menu for additional page navigation
 */
function openSecondaryMenu() {
  const menu = document.getElementById('profile-secondary-menu');
  if (menu) {
    menu.style.display = 'block';
    // Trigger reflow then add open class for animation
    menu.offsetHeight;
    menu.classList.add('open');
  }
}

/**
 * Closes the profile secondary menu
 */
function closeSecondaryMenu() {
  const menu = document.getElementById('profile-secondary-menu');
  if (menu) {
    menu.classList.remove('open');
    setTimeout(() => {
      if (!menu.classList.contains('open')) {
        menu.style.display = 'none';
      }
    }, 300);
  }
}

/**
 * Toggle secondary menu on profile tab click
 */
function toggleSecondaryMenu() {
  const menu = document.getElementById('profile-secondary-menu');
  if (menu && menu.classList.contains('open')) {
    closeSecondaryMenu();
  } else {
    openSecondaryMenu();
  }
}

/**
 * Handles profile nav button click - navigates to profile or toggles menu if already there
 */
function handleProfileNavClick() {
  if (AppState.currentPage === 'profile') {
    // Already on profile, toggle the secondary menu
    toggleSecondaryMenu();
  } else {
    // Navigate to profile page
    navigateTo('profile');
  }
}

/**
 * Renders check-in history on the profile page
 */
function renderProfileCheckinHistory() {
  const historyList = document.getElementById('profile-checkin-history-list');
  const noHistory = document.getElementById('no-checkin-history');

  if (!historyList) return;

  const history = AppState.checkinHistory || [];

  // Sort by date descending and show all entries
  const allEntries = history
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (allEntries.length === 0) {
    historyList.style.display = 'none';
    if (noHistory) noHistory.style.display = 'block';
    return;
  }

  historyList.style.display = 'block';
  if (noHistory) noHistory.style.display = 'none';

  const historyHTML = allEntries.map(entry => {
    const date = new Date(entry.timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const weekday = date.toLocaleString('default', { weekday: 'short' });

    return `
      <div class="checkin-history-item">
        <div class="checkin-history-date">
          <div class="day">${day}</div>
          <div class="month">${month} ${year}</div>
          <div class="weekday">${weekday}</div>
        </div>
        <div class="checkin-history-data">
          ${entry.pain ? `
            <div class="checkin-data-item pain">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              ${formatCheckinValue('pain', entry.pain)}
            </div>
          ` : ''}
          ${entry.sleep ? `
            <div class="checkin-data-item sleep">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              ${formatCheckinValue('sleep', entry.sleep)}
            </div>
          ` : ''}
          ${entry.mood ? `
            <div class="checkin-data-item mood">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              </svg>
              ${formatCheckinValue('mood', entry.mood)}
            </div>
          ` : ''}
          ${entry.notes ? `
            <div class="checkin-data-item notes">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              "${entry.notes}"
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  historyList.innerHTML = historyHTML;
}

document.querySelector('.nav-toggle')?.addEventListener('click', function() {
  const navLinks = document.getElementById('nav-links');
  const isOpen = navLinks.classList.toggle('open');
  this.setAttribute('aria-expanded', isOpen);
});

// ============================================
// Dashboard Functions
// ============================================

/**
 * updateDashboard - Main function to refresh the dashboard UI
 *
 * This is the central function that orchestrates the dashboard display.
 * It is called whenever the user navigates to the home page or when
 * significant state changes occur (like completing intake or switching profiles).
 *
 * FLOW:
 * 1. Sets greeting based on time of day
 * 2. Handles family member profile switching (Family tier)
 * 3. Updates condition highlight banner
 * 4. Calls sub-functions to render:
 *    - updateCareOverview() - The personalized care summary
 *    - generateTaskCategories() - PT, Nutrition, Medications, Wellness tasks
 *    - generateWeekAhead() - 7-day calendar preview
 *    - updateDashboardStats() - Progress ring and task counts
 *    - updateProgressCharts() - Weekly progress visualizations
 *
 * DEPENDENCIES:
 * - AppState.userData (user's profile and condition data)
 * - AppState.userTier (determines feature access)
 * - ClinicalDatabase (condition-specific exercise/nutrition data)
 * - familyProfiles (for Family tier multi-profile support)
 */
function updateDashboard() {
  // Debug logging - can be removed in production
  console.log('=========================================');
  console.log('[updateDashboard] STARTING DASHBOARD UPDATE');
  console.log('[updateDashboard] AppState.userData:', JSON.stringify(AppState.userData, null, 2));
  console.log('[updateDashboard] AppState.hasCompletedIntake:', AppState.hasCompletedIntake);
  console.log('[updateDashboard] AppState.userTier:', AppState.userTier);
  console.log('=========================================');

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('today-date');
  if (dateEl) dateEl.textContent = today.toLocaleDateString('en-CA', options);

  const hour = today.getHours();
  let greetingText = 'Good evening';
  if (hour < 12) greetingText = 'Good morning';
  else if (hour < 17) greetingText = 'Good afternoon';

  const isFirstDay = !AppState.firstVisitDate ||
    new Date(AppState.firstVisitDate).toDateString() === today.toDateString();

  if (!isFirstDay) {
    greetingText = 'Welcome back';
  }

  // Check if viewing a family member's plan
  const isViewingFamilyMember = typeof activeProfileId !== 'undefined' && activeProfileId !== 'self';
  let displayName = AppState.userData.firstName;
  let familyMemberData = null;

  if (isViewingFamilyMember && typeof familyProfiles !== 'undefined' && familyProfiles[activeProfileId]) {
    familyMemberData = familyProfiles[activeProfileId];
    displayName = familyMemberData.name;
    greetingText = `${familyMemberData.name}'s Care Plan`;
  }

  const greetingEl = document.getElementById('user-greeting');
  const nameEl = document.getElementById('user-name-display');

  if (greetingEl) {
    if (isViewingFamilyMember) {
      greetingEl.textContent = greetingText;
    } else {
      greetingEl.textContent = greetingText;
    }
  }
  if (nameEl) {
    if (isViewingFamilyMember) {
      nameEl.textContent = ''; // Name is in the greeting for family members
    } else if (AppState.userData.firstName) {
      nameEl.textContent = `, ${AppState.userData.firstName}`;
    }
  }

  // Update welcome subtitle for family members
  const subtitleEl = document.getElementById('welcome-subtitle');
  if (subtitleEl) {
    if (isViewingFamilyMember && familyMemberData) {
      subtitleEl.textContent = `Managing ${familyMemberData.conditionName || 'their condition'} - Family Plan Member`;
    } else {
      subtitleEl.textContent = "Here's your personalized care plan for today.";
    }
  }

  // Show/hide family member indicator
  const familyIndicator = document.getElementById('family-member-indicator');
  const viewingMemberName = document.getElementById('viewing-member-name');
  if (familyIndicator) {
    if (isViewingFamilyMember && familyMemberData) {
      familyIndicator.style.display = 'flex';
      if (viewingMemberName) viewingMemberName.textContent = familyMemberData.name;
    } else {
      familyIndicator.style.display = 'none';
    }
  }

  // Show family toggle bar for Family tier users
  updateFamilyToggleBar();

  const allConditions = getAllUserConditions();
  const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);

  // Update diagnosis display - show "Multiple Conditions" if more than one
  const diagnosisDisplay = document.getElementById('diagnosis-display');
  if (diagnosisDisplay) {
    if (allConditions.length > 1) {
      diagnosisDisplay.textContent = 'Multiple Conditions';
    } else {
      diagnosisDisplay.textContent = condition ? condition.name : 'General Wellness';
    }
  }

  // Populate the prominent condition highlight banner with actual condition names
  const conditionHighlightContainer = document.getElementById('condition-highlight-conditions');
  if (conditionHighlightContainer) {
    let tagsHTML = '';

    allConditions.forEach((conditionId, index) => {
      const conditionData = ClinicalDatabase.getConditionData(conditionId);
      if (conditionData) {
        const isSecondary = index > 0;
        tagsHTML += `<span class="condition-highlight-tag${isSecondary ? ' secondary' : ''}">${conditionData.name}</span>`;
      }
    });

    // If no conditions, show a default
    if (!tagsHTML) {
      tagsHTML = `<span class="condition-highlight-tag">${condition ? condition.name : 'General Wellness'}</span>`;
    }

    conditionHighlightContainer.innerHTML = tagsHTML;
  }

  const clinicianName = AppState.userData.clinicianName || 'Your Clinician';
  const clinicianNameEl = document.getElementById('clinician-name-display');
  if (clinicianNameEl) clinicianNameEl.textContent = clinicianName;

  if (AppState.userData.clinicianPhone) {
    const contactBtn = document.getElementById('clinician-contact-btn');
    if (contactBtn) contactBtn.href = `tel:${AppState.userData.clinicianPhone}`;
  }

  console.log('[updateDashboard] About to call updateCareOverview()');
  updateCareOverview();
  console.log('[updateDashboard] About to call generateTaskCategories()');
  generateTaskCategories();
  console.log('[updateDashboard] About to call generateWeekAhead()');
  generateWeekAhead();
  console.log('[updateDashboard] About to call updateDashboardStats()');
  updateDashboardStats();
  console.log('[updateDashboard] About to call updateProgressCharts()');
  updateProgressCharts();
  console.log('[updateDashboard] Dashboard update complete');
}

// Update family toggle bar visibility and options
function updateFamilyToggleBar() {
  const toggleBar = document.getElementById('family-toggle-bar');
  const toggleSelect = document.getElementById('family-member-toggle');

  if (!toggleBar || !toggleSelect) return;

  // Only show for Family tier and above
  const isFamilyTier = hasTierAccess('family');
  toggleBar.style.display = isFamilyTier ? 'block' : 'none';

  if (!isFamilyTier) return;

  // Populate family members dropdown
  const profiles = typeof familyProfiles !== 'undefined' ? familyProfiles : {};
  const profileIds = Object.keys(profiles);

  let optionsHTML = '<option value="self">Myself</option>';
  profileIds.forEach(id => {
    const profile = profiles[id];
    const relationshipLabels = {
      'parent': 'Parent',
      'spouse': 'Spouse',
      'child': 'Child',
      'sibling': 'Sibling',
      'grandparent': 'Grandparent',
      'other': 'Family'
    };
    const relationship = relationshipLabels[profile.relationship] || '';
    optionsHTML += `<option value="${id}">${profile.name}${relationship ? ' (' + relationship + ')' : ''}</option>`;
  });

  toggleSelect.innerHTML = optionsHTML;

  // Set current selection
  const currentProfile = typeof activeProfileId !== 'undefined' ? activeProfileId : 'self';
  toggleSelect.value = currentProfile;
}

// Handle family member toggle selection
function onFamilyMemberToggle(profileId) {
  if (profileId === 'self') {
    switchToSelfProfile();
  } else {
    switchToFamilyProfile(profileId);
  }
}

/**
 * updateCareOverview - Generates and displays the personalized care summary
 *
 * This function creates the "Your Care Overview" card that appears at the top
 * of the Today's Care Plan section. It provides a personalized greeting and
 * summary of the user's care pillars (PT, Nutrition, Medications, Wellness).
 *
 * WHAT IT DOES:
 * 1. Gets all user conditions using getAllUserConditions()
 * 2. Retrieves condition-specific data from ClinicalDatabase
 * 3. Builds a personalized greeting based on time of day
 * 4. Lists the care plan pillars with counts (e.g., "4 exercises, 45 mins daily")
 * 5. Includes an encouraging message
 *
 * MULTI-CONDITION SUPPORT:
 * - For users with multiple conditions (Premium+), it shows all condition names
 * - Combines exercises from all conditions using getCombinedExercises()
 * - Provides a holistic care overview message
 *
 * TARGET ELEMENT: #care-overview-content
 */
function updateCareOverview() {
  console.log('[updateCareOverview] Starting care overview update');
  const overviewEl = document.getElementById('care-overview-content');
  if (!overviewEl) {
    console.error('[updateCareOverview] ERROR: care-overview-content element not found!');
    return;
  }
  console.log('[updateCareOverview] Found care-overview-content element');

  const hour = new Date().getHours();
  const userName = AppState.userData.firstName || '';
  let greeting;

  if (hour < 12) {
    greeting = `Good morning${userName ? ', ' + userName : ''}`;
  } else if (hour < 17) {
    greeting = `Good afternoon${userName ? ', ' + userName : ''}`;
  } else {
    greeting = `Good evening${userName ? ', ' + userName : ''}`;
  }

  const allConditions = getAllUserConditions();
  const combinedExercises = getCombinedExercises();
  const medicationsList = AppState.userData.medicationsList || [];
  const medCount = medicationsList.length || (AppState.userData.medications ? AppState.userData.medications.split(',').length : 0);

  // Get actual condition names (not "General Wellness" fallback)
  const getActualConditionNames = () => {
    const names = [];
    allConditions.forEach(id => {
      const cond = ClinicalDatabase.getConditionData(id);
      // Only include if it's not the fallback 'other' condition
      if (cond && cond.name && cond.name !== 'General Wellness') {
        names.push(cond.name);
      }
    });
    return names;
  };

  const conditionNames = getActualConditionNames();

  // Build a comprehensive care overview
  let conditionOverview;
  if (conditionNames.length > 1) {
    conditionOverview = `<p style="margin-bottom: var(--space-3);"><strong>${greeting}!</strong> Here's your comprehensive wellness plan managing <strong>${conditionNames.length} conditions</strong>: ${conditionNames.join(', ')}.</p>`;
    conditionOverview += `<p style="margin-bottom: var(--space-3); font-size: 0.9rem;">Your care plan integrates exercises and nutrition guidelines from all your conditions for a holistic approach to your health.</p>`;
  } else if (conditionNames.length === 1) {
    const primaryCondition = ClinicalDatabase.getConditionData(allConditions[0]);
    conditionOverview = `<p style="margin-bottom: var(--space-3);"><strong>${greeting}!</strong> Here's your personalized wellness journey for managing <strong>${conditionNames[0]}</strong>.</p>`;
    conditionOverview += `<p style="margin-bottom: var(--space-3); font-size: 0.9rem;">${primaryCondition.description || 'Your care plan is designed to support your recovery and help you feel your best.'}</p>`;
  } else {
    // No specific conditions - general wellness plan
    conditionOverview = `<p style="margin-bottom: var(--space-3);"><strong>${greeting}!</strong> Here's your personalized wellness plan.</p>`;
    conditionOverview += `<p style="margin-bottom: var(--space-3); font-size: 0.9rem;">Your care plan is designed to support your overall health and well-being.</p>`;
  }

  // Care plan pillars
  conditionOverview += '<div style="display: grid; gap: var(--space-2); margin-top: var(--space-3);">';

  if (combinedExercises.length > 0) {
    // Calculate total PT duration from the actual capped exercises (max 60 min)
    let totalDuration = combinedExercises.reduce((sum, ex) => sum + (ex.durationMinutes || 10), 0);
    // Ensure it doesn't exceed MAX_PT_MINUTES_PER_DAY
    totalDuration = Math.min(totalDuration, MAX_PT_MINUTES_PER_DAY);
    // Round to nearest 15 minutes
    totalDuration = Math.round(totalDuration / 15) * 15;
    // Minimum 15 minutes if there are exercises
    totalDuration = Math.max(15, totalDuration);

    conditionOverview += `
      <div style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.85rem;">
        <span style="color: var(--primary-600);">&#10003;</span>
        <span><strong>Fitness:</strong> ${combinedExercises.length} exercises, ${totalDuration} mins daily</span>
      </div>`;
  }

  conditionOverview += `
    <div style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.85rem;">
      <span style="color: var(--primary-600);">&#10003;</span>
      <span><strong>Nutrition:</strong> Personalized meals tailored to all your conditions</span>
    </div>`;

  if (medCount > 0) {
    conditionOverview += `
      <div style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.85rem;">
        <span style="color: var(--primary-600);">&#10003;</span>
        <span><strong>Medications:</strong> ${medCount} medication${medCount > 1 ? 's' : ''} with daily reminders</span>
      </div>`;
  }

  conditionOverview += `
    <div style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.85rem;">
      <span style="color: var(--primary-600);">&#10003;</span>
      <span><strong>Wellness:</strong> Rest, hydration, and self-care guidance</span>
    </div>`;

  conditionOverview += '</div>';

  // Encouraging message
  conditionOverview += `<p style="margin-top: var(--space-4); font-size: 0.85rem; color: var(--gray-600); font-style: italic;">We're here to support you every step of the way. Remember to listen to your body and celebrate small wins!</p>`;

  console.log('[updateCareOverview] Setting innerHTML with condition overview');
  overviewEl.innerHTML = conditionOverview;
  console.log('[updateCareOverview] Care overview updated successfully');
}

/**
 * generateTaskCategories - Builds the collapsible task cards for Today's Tasks
 *
 * This is the main function that creates the interactive task list on the dashboard.
 * It organizes tasks into collapsible categories: Fitness, Medications,
 * Nutrition, and Wellness.
 *
 * CATEGORIES GENERATED:
 * 1. Fitness - Exercises from ClinicalDatabase based on user's condition(s)
 *    - Uses getCombinedExercises() to merge exercises from multiple conditions
 *    - Caps total PT time at MAX_PT_MINUTES_PER_DAY (60 minutes)
 *    - Each exercise shows sets/reps or duration and scheduled time
 *
 * 2. Medications - From AppState.userData.medicationsList
 *    - Grouped by morning/evening dosing times
 *    - Shows medication names and dosages
 *
 * 3. Nutrition - Meals from MealDatabase
 *    - Breakfast, Lunch, Dinner, Snack
 *    - Respects dietary restrictions and preferences
 *
 * 4. Wellness - General health activities
 *    - Hydration reminders
 *    - Rest periods
 *    - Sleep hygiene (if sleep quality is poor)
 *    - Stress relief (if stress level is high)
 *    - Condition-specific wellness activities
 *    - Caps total wellness time at MAX_WELLNESS_MINUTES_PER_DAY (120 minutes)
 *
 * FEATURES:
 * - Tracks completion state in AppState.completedTasks.home
 * - Categories can be expanded/collapsed via toggleCategory()
 * - Shows completion progress (e.g., "2/4 completed")
 * - Color-coded icons for each category
 *
 * TARGET ELEMENT: #task-categories
 */
function generateTaskCategories() {
  console.log('[generateTaskCategories] Starting task categories generation');
  const container = document.getElementById('task-categories');
  if (!container) {
    console.error('[generateTaskCategories] ERROR: task-categories element not found!');
    return;
  }
  console.log('[generateTaskCategories] Found task-categories element');

  const restrictions = AppState.userData.dietaryRestrictions;
  const userDislikes = [AppState.userData.otherDietaryNotes || '', AppState.userData.dietaryHabits || ''].join(' ');

  // Get today's meals
  const breakfast = MealDatabase.getMealForDay('breakfast', 0, restrictions, userDislikes);
  const lunch = MealDatabase.getMealForDay('lunch', 0, restrictions, userDislikes);
  const dinner = MealDatabase.getMealForDay('dinner', 0, restrictions, userDislikes);
  const snack = MealDatabase.getMealForDay('snacks', 0, restrictions, userDislikes);

  // Build task categories
  const categories = [];

  // Fitness Category - now uses combined exercises from all conditions
  const combinedExercises = getCombinedExercises();
  if (combinedExercises.length > 0) {
    const ptTasks = combinedExercises.map((ex, idx) => {
      // Build subtitle with time and duration
      const timeStr = ex.time ? formatTime(ex.time) : '';
      const durationStr = ex.duration || (`${ex.sets || 3} sets x ${ex.reps || 10} reps` + (ex.holdTime ? `, ${ex.holdTime}s hold` : ''));
      const subtitle = timeStr ? `${timeStr} - ${durationStr}` : durationStr;

      return {
        id: `pt-exercise-${idx}`,
        title: ex.name,
        subtitle: subtitle,
        type: 'pt',
        conditionTag: ex.conditionName, // Tag for multi-condition support
        time: ex.time || '09:00' // Store time for sorting display
      };
    });

    categories.push({
      id: 'pt',
      name: 'Fitness',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      time: '09:00',
      tasks: ptTasks,
      color: 'var(--primary-500)'
    });
  }

  // Medication Category - now uses enhanced medication list
  const medicationsList = AppState.userData.medicationsList || [];
  const legacyMeds = AppState.userData.medications ? AppState.userData.medications.split(',').map(m => m.trim()).filter(m => m) : [];

  if (medicationsList.length > 0 || legacyMeds.length > 0) {
    const medTasks = [];

    // Group medications by time of day
    const morningMeds = medicationsList.filter(m => m.timeOfDay?.includes('morning'));
    const eveningMeds = medicationsList.filter(m => m.timeOfDay?.includes('evening'));

    if (morningMeds.length > 0 || legacyMeds.length > 0) {
      const morningNames = morningMeds.map(m => {
        let name = m.name;
        if (m.dosage) name += ` ${m.dosage}`;
        return name;
      });
      const allMorning = [...morningNames, ...legacyMeds.filter(m => !morningMeds.some(mm => mm.name.toLowerCase() === m.toLowerCase()))];

      medTasks.push({
        id: 'med-morning',
        title: 'Morning medications',
        subtitle: allMorning.length > 0 ? allMorning.slice(0, 3).join(', ') + (allMorning.length > 3 ? ` +${allMorning.length - 3} more` : '') : 'As prescribed',
        type: 'medication',
        conditionTags: morningMeds.filter(m => m.condition).map(m => getConditionName(m.condition))
      });
    }

    if (eveningMeds.length > 0) {
      const eveningNames = eveningMeds.map(m => {
        let name = m.name;
        if (m.dosage) name += ` ${m.dosage}`;
        return name;
      });

      medTasks.push({
        id: 'med-evening',
        title: 'Evening medications',
        subtitle: eveningNames.slice(0, 3).join(', ') + (eveningNames.length > 3 ? ` +${eveningNames.length - 3} more` : ''),
        type: 'medication',
        conditionTags: eveningMeds.filter(m => m.condition).map(m => getConditionName(m.condition))
      });
    } else if (medTasks.length === 1) {
      // Add a general evening reminder if there are medications but none specifically for evening
      medTasks.push({
        id: 'med-evening',
        title: 'Evening medication check',
        subtitle: 'Review any as-needed medications',
        type: 'medication'
      });
    }

    categories.push({
      id: 'medication',
      name: 'Medications',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>',
      time: '08:00',
      tasks: medTasks,
      color: '#ef4444'
    });
  }

  // Nutrition Category
  const nutritionTasks = [];
  if (breakfast) nutritionTasks.push({ id: 'meal-breakfast', title: 'Breakfast', subtitle: breakfast.name, type: 'nutrition' });
  if (lunch) nutritionTasks.push({ id: 'meal-lunch', title: 'Lunch', subtitle: lunch.name, type: 'nutrition' });
  if (dinner) nutritionTasks.push({ id: 'meal-dinner', title: 'Dinner', subtitle: dinner.name, type: 'nutrition' });
  if (snack) nutritionTasks.push({ id: 'meal-snack', title: 'Snack', subtitle: snack.name, type: 'nutrition' });

  categories.push({
    id: 'nutrition',
    name: 'Nutrition',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>',
    time: '12:00',
    tasks: nutritionTasks,
    color: '#22c55e'
  });

  // Wellness Category - capped at MAX_WELLNESS_MINUTES_PER_DAY (2 hours)
  // Now combines wellness activities from ALL conditions (primary + secondary)
  const wellnessTasks = [];
  let wellnessMinutesUsed = 0;

  // Base wellness tasks (low time commitment)
  wellnessTasks.push({ id: 'hydration', title: 'Stay hydrated', subtitle: 'Aim for 8 glasses of water', type: 'wellness', duration: 0 });
  wellnessTasks.push({ id: 'rest', title: 'Rest periods', subtitle: 'Take breaks between activities', type: 'wellness', duration: 15 });
  wellnessMinutesUsed += 15;

  // Add sleep hygiene if needed (15 min)
  if (AppState.userData.sleepQuality && AppState.userData.sleepQuality !== 'good') {
    if (wellnessMinutesUsed + 15 <= MAX_WELLNESS_MINUTES_PER_DAY) {
      wellnessTasks.push({ id: 'sleep-hygiene', title: 'Sleep hygiene', subtitle: 'Follow sleep improvement tips (15 min)', type: 'wellness', duration: 15 });
      wellnessMinutesUsed += 15;
    }
  }

  // Add stress relief if needed (10 min)
  if (AppState.userData.stressLevel && (AppState.userData.stressLevel === 'high' || AppState.userData.stressLevel === 'very_high')) {
    if (wellnessMinutesUsed + 10 <= MAX_WELLNESS_MINUTES_PER_DAY) {
      wellnessTasks.push({ id: 'stress-relief', title: 'Stress relief', subtitle: '5-10 min relaxation exercise', type: 'wellness', duration: 10 });
      wellnessMinutesUsed += 10;
    }
  }

  // Add combined wellness activities from ALL conditions (primary + secondary)
  const combinedWellness = getCombinedWellnessActivities();
  for (const activity of combinedWellness) {
    if (wellnessMinutesUsed + activity.durationMinutes <= MAX_WELLNESS_MINUTES_PER_DAY) {
      wellnessTasks.push({
        id: `wellness-${activity.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: activity.name,
        subtitle: activity.description || activity.duration,
        type: 'wellness',
        duration: activity.durationMinutes,
        conditionTag: activity.conditionName // Tag to show which condition this is for
      });
      wellnessMinutesUsed += activity.durationMinutes;
    }
  }

  // Calculate remaining wellness time available
  const remainingWellnessTime = MAX_WELLNESS_MINUTES_PER_DAY - wellnessMinutesUsed;
  const wellnessTimeNote = wellnessMinutesUsed > 0 ? ` (${wellnessMinutesUsed} min planned, ${remainingWellnessTime} min available)` : '';

  categories.push({
    id: 'wellness',
    name: 'Wellness',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    time: '14:00',
    tasks: wellnessTasks,
    color: '#8b5cf6',
    timeNote: wellnessTimeNote
  });

  // Sort categories by time (earliest first)
  categories.sort((a, b) => {
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });

  // Render categories
  container.innerHTML = categories.map(category => {
    const completedCount = category.tasks.filter(t => AppState.completedTasks.home.includes(t.id)).length;
    const totalCount = category.tasks.length;
    const isComplete = completedCount === totalCount;
    const isExpanded = AppState.expandedCategories && AppState.expandedCategories.includes(category.id);

    return `
      <div class="task-category ${isComplete ? 'completed' : ''}" data-category="${category.id}">
        <div class="task-category-header" onclick="toggleCategory('${category.id}')" role="button" tabindex="0">
          <div class="task-category-left">
            <div class="task-category-icon" style="background: ${category.color}20; color: ${category.color};">
              ${category.icon}
            </div>
            <div class="task-category-info">
              <div class="task-category-name">${category.name}</div>
              <div class="task-category-progress">${completedCount}/${totalCount} completed</div>
            </div>
          </div>
          <div class="task-category-right">
            <div class="task-category-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              ${formatTime(category.time)}
            </div>
            <div class="task-category-chevron ${isExpanded ? 'expanded' : ''}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="task-category-tasks ${isExpanded ? 'expanded' : ''}">
          <ul class="checklist">
            ${category.tasks.map(task => `
              <li class="checklist-item${AppState.completedTasks.home.includes(task.id) ? ' checked' : ''}" data-task="${task.id}">
                <div class="checklist-checkbox${AppState.completedTasks.home.includes(task.id) ? ' checked' : ''}"
                     role="checkbox"
                     aria-checked="${AppState.completedTasks.home.includes(task.id)}"
                     tabindex="0"
                     onclick="toggleTask(this, event)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display: ${AppState.completedTasks.home.includes(task.id) ? 'block' : 'none'};">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div class="checklist-content">
                  <div class="checklist-title">
                    ${task.title}
                    ${task.conditionTag ? `<span class="exercise-condition-tag">${task.conditionTag}</span>` : ''}
                    ${task.conditionTags && task.conditionTags.length > 0 ? task.conditionTags.map(tag => `<span class="medication-condition-tag">${tag}</span>`).join('') : ''}
                  </div>
                  <div class="checklist-meta">${task.subtitle}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  updateDashboardStats();
}

function toggleCategory(categoryId) {
  if (!AppState.expandedCategories) {
    AppState.expandedCategories = [];
  }

  const index = AppState.expandedCategories.indexOf(categoryId);
  if (index > -1) {
    AppState.expandedCategories.splice(index, 1);
  } else {
    AppState.expandedCategories.push(categoryId);
  }

  generateTaskCategories();
}

/**
 * generateWeekAhead - Creates the 7-day calendar preview
 *
 * Displays a horizontal row of day cards showing the upcoming week.
 * Each day card shows:
 * - Day name (Mon, Tue, etc.)
 * - Date number
 * - Colored dots indicating scheduled activities (PT, Nutrition, Medications)
 *
 * CLICK BEHAVIOR:
 * - Clicking a day card opens showDayPreview() modal with detailed schedule
 * - Today's card is highlighted with special styling
 *
 * ACTIVITY DOTS:
 * - PT (teal) - Shown if condition has exercises
 * - Nutrition (green) - Always shown
 * - Medication (red) - Shown if user has medications
 *
 * CALENDAR VIEW TOGGLE:
 * - User can switch between "Week" (default) and "Month" views
 * - Month view is rendered by renderMonthCalendar()
 * - View state stored in currentCalendarView variable
 *
 * TARGET ELEMENT: #week-ahead-grid
 */
function generateWeekAhead() {
  console.log('[generateWeekAhead] Starting week ahead generation');
  const grid = document.getElementById('week-ahead-grid');
  if (!grid) {
    console.error('[generateWeekAhead] ERROR: week-ahead-grid element not found!');
    return;
  }
  console.log('[generateWeekAhead] Found week-ahead-grid element');

  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  console.log('[generateWeekAhead] Diagnosis:', AppState.userData.diagnosis);
  const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
  console.log('[generateWeekAhead] Condition data:', condition ? condition.name : 'NOT FOUND');
  const hasMeds = AppState.userData.medications && AppState.userData.medications.trim();

  let html = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isToday = i === 0;
    const dateStr = date.toISOString().split('T')[0];

    html += `
      <div class="week-day-card${isToday ? ' today' : ''}" onclick="showDayPreview('${dateStr}', ${i})" role="button" tabindex="0">
        <div class="week-day-name">${dayNames[date.getDay()]}</div>
        <div class="week-day-date">${date.getDate()}</div>
        <div class="week-day-tasks">
          ${condition.exercises.length > 0 ? '<div class="week-task-dot pt" title="PT Exercises"></div>' : ''}
          <div class="week-task-dot nutrition" title="Nutrition Plan"></div>
          ${hasMeds ? '<div class="week-task-dot medication" title="Medication"></div>' : ''}
        </div>
      </div>
    `;
  }

  grid.innerHTML = html;
}

function showDayPreview(dateStr, dayOffset) {
  const modal = document.getElementById('day-preview-modal');
  const titleEl = document.getElementById('day-preview-title');
  const bodyEl = document.getElementById('day-preview-body');

  if (!modal || !titleEl || !bodyEl) return;

  const date = new Date(dateStr);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const isToday = dayOffset === 0;
  titleEl.textContent = isToday ? 'Today' : `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;

  const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
  const restrictions = AppState.userData.dietaryRestrictions;
  const userDislikes = [
    AppState.userData.otherDietaryNotes || '',
    AppState.userData.dietaryHabits || ''
  ].join(' ');

  // Get meals for this specific day using meal rotation
  const breakfast = MealDatabase.getMealForDay('breakfast', dayOffset, restrictions, userDislikes);
  const lunch = MealDatabase.getMealForDay('lunch', dayOffset, restrictions, userDislikes);
  const dinner = MealDatabase.getMealForDay('dinner', dayOffset, restrictions, userDislikes);
  const snack = MealDatabase.getMealForDay('snacks', dayOffset, restrictions, userDislikes);

  let html = '';

  // PT Exercises Section
  if (condition.exercises.length > 0) {
    html += `
      <div class="day-preview-section">
        <h4><span class="dot pt"></span> Fitness</h4>
        ${condition.exercises.map(ex => `
          <div class="day-preview-item">
            <div class="day-preview-item-title">${ex.name}</div>
            <div class="day-preview-item-meta">${ex.duration} - ${formatTime(ex.time)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Nutrition Section
  html += `
    <div class="day-preview-section">
      <h4><span class="dot nutrition"></span> Nutrition Plan</h4>
      <div class="day-preview-item">
        <div class="day-preview-item-title">Breakfast: ${breakfast?.name || 'Balanced breakfast'}</div>
        <div class="day-preview-item-meta">${formatTime(AppState.userData.breakfastTime || '08:00')}</div>
      </div>
      <div class="day-preview-item">
        <div class="day-preview-item-title">Lunch: ${lunch?.name || 'Healthy lunch'}</div>
        <div class="day-preview-item-meta">${formatTime(AppState.userData.lunchTime || '12:30')}</div>
      </div>
      <div class="day-preview-item">
        <div class="day-preview-item-title">Dinner: ${dinner?.name || 'Nutritious dinner'}</div>
        <div class="day-preview-item-meta">${formatTime(AppState.userData.dinnerTime || '18:30')}</div>
      </div>
    </div>
  `;

  // Medication Section
  if (AppState.userData.medications && AppState.userData.medications.trim()) {
    const meds = AppState.userData.medications.split('\n').filter(m => m.trim());
    html += `
      <div class="day-preview-section">
        <h4><span class="dot medication"></span> Medications</h4>
        ${meds.map(med => `
          <div class="day-preview-item">
            <div class="day-preview-item-title">${med.trim()}</div>
            <div class="day-preview-item-meta">As prescribed by your clinician</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bodyEl.innerHTML = html;
  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) closeDayPreview(); };
}

function closeDayPreview() {
  const modal = document.getElementById('day-preview-modal');
  if (modal) modal.style.display = 'none';
}

// Calendar View Toggle
let currentCalendarView = 'week';
let currentMonthOffset = 0;

function setCalendarView(view) {
  currentCalendarView = view;
  const weekGrid = document.getElementById('week-ahead-grid');
  const monthGrid = document.getElementById('month-calendar-grid');
  const weekBtn = document.getElementById('week-view-btn');
  const monthBtn = document.getElementById('month-view-btn');

  if (view === 'week') {
    if (weekGrid) weekGrid.style.display = 'grid';
    if (monthGrid) monthGrid.style.display = 'none';
    if (weekBtn) weekBtn.classList.add('active');
    if (monthBtn) monthBtn.classList.remove('active');
  } else {
    if (weekGrid) weekGrid.style.display = 'none';
    if (monthGrid) monthGrid.style.display = 'flex';
    if (weekBtn) weekBtn.classList.remove('active');
    if (monthBtn) monthBtn.classList.add('active');
    currentMonthOffset = 0;
    renderMonthCalendar();
  }
}

function renderMonthCalendar() {
  const grid = document.getElementById('month-calendar-grid');
  if (!grid) return;

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis || 'other');
  const hasMeds = AppState.userData.medications && AppState.userData.medications.trim();

  let html = `
    <div class="month-calendar-header">
      <button class="month-nav-btn" onclick="navigateMonth(-1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h4>${monthNames[month]} ${year}</h4>
      <button class="month-nav-btn" onclick="navigateMonth(1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
    <div class="month-days-header">
      ${dayNames.map(d => `<div class="month-day-label">${d}</div>`).join('')}
    </div>
    <div class="month-days-grid">
  `;

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    html += `
      <div class="month-day-cell other-month" onclick="showDayPreviewFromMonth(${year}, ${month - 1}, ${dayNum})">
        <div class="month-day-number">${dayNum}</div>
      </div>
    `;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day;

    html += `
      <div class="month-day-cell${isToday ? ' today' : ''}" onclick="showDayPreviewFromMonth(${year}, ${month}, ${day})">
        <div class="month-day-number">${day}</div>
        <div class="month-day-dots">
          ${condition.exercises && condition.exercises.length > 0 ? '<div class="week-task-dot pt"></div>' : ''}
          <div class="week-task-dot nutrition"></div>
          ${hasMeds ? '<div class="week-task-dot medication"></div>' : ''}
        </div>
      </div>
    `;
  }

  // Next month days
  const totalCells = firstDay + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    html += `
      <div class="month-day-cell other-month" onclick="showDayPreviewFromMonth(${year}, ${month + 1}, ${day})">
        <div class="month-day-number">${day}</div>
      </div>
    `;
  }

  html += '</div>';
  grid.innerHTML = html;
}

function navigateMonth(direction) {
  currentMonthOffset += direction;
  renderMonthCalendar();
}

function showDayPreviewFromMonth(year, month, day) {
  const selectedDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOffset = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
  const dateStr = selectedDate.toISOString().split('T')[0];

  showDayPreview(dateStr, dayOffset);
}

function updateDashboardStats() {
  // Calculate total tasks across all sections
  const homeTasks = document.querySelectorAll('#today-checklist .checklist-item').length;
  const ptTasks = document.querySelectorAll('#pt-exercise-list .checklist-item').length;
  const medTasks = document.querySelectorAll('#medication-checklist .checklist-item').length;
  const nutritionTasks = 4; // breakfast, lunch, dinner, snack
  const wellnessTasks = 2; // hydration, sleep/stress

  const totalTasks = homeTasks + ptTasks + medTasks + nutritionTasks + wellnessTasks;

  // Calculate completed across all sections
  const homeCompleted = AppState.completedTasks.home.length;
  const ptCompleted = AppState.completedTasks.pt.length;
  const medCompleted = AppState.completedTasks.medication.length;
  const nutritionCompleted = AppState.mealsEatenToday.length;
  const wellnessCompleted = (AppState.hydrationCount >= 8 ? 1 : 0) + (AppState.completedTasks.wellness?.length || 0);

  const completedCount = homeCompleted + ptCompleted + medCompleted + nutritionCompleted + wellnessCompleted;

  const tasksEl = document.getElementById('tasks-completed');
  if (tasksEl) tasksEl.textContent = `${completedCount}/${totalTasks}`;

  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Update progress ring
  const progressPercent = document.getElementById('progress-percent');
  const progressRing = document.getElementById('progress-ring-fill');

  if (progressPercent) progressPercent.textContent = `${progress}%`;

  if (progressRing) {
    // Circle circumference = 2 * PI * radius = 2 * 3.14159 * 52 = 326.73
    const circumference = 326.73;
    const offset = circumference - (progress / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
  }

  const progressEl = document.getElementById('weekly-progress');
  if (progressEl) {
    // Calculate weekly progress based on days completed
    const daysSinceStart = AppState.firstVisitDate ?
      Math.floor((new Date() - new Date(AppState.firstVisitDate)) / (1000 * 60 * 60 * 24)) : 0;
    const weekProgress = Math.min(100, Math.round(((daysSinceStart % 7) + 1) / 7 * 100));
    progressEl.textContent = `${weekProgress}%`;
  }
}

// Mark a meal as eaten
function markMealEaten(mealType) {
  if (!AppState.mealsEatenToday.includes(mealType)) {
    AppState.mealsEatenToday.push(mealType);
    updateDashboardStats();
    saveState();
  }
}

// Toggle meal eaten status
function toggleMealEaten(mealType) {
  const index = AppState.mealsEatenToday.indexOf(mealType);
  if (index > -1) {
    AppState.mealsEatenToday.splice(index, 1);
  } else {
    if (!AppState.mealsEatenToday.includes(mealType)) {
      AppState.mealsEatenToday.push(mealType);
    }
  }
  updateDashboardStats();
  updateNutritionPage();
  updateMealTrackingHeader();
  saveState();
}

// Update the meal tracking header checkboxes
function updateMealTrackingHeader() {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  let loggedCount = 0;

  mealTypes.forEach(type => {
    const trackEl = document.getElementById(`track-${type}`);
    const isEaten = AppState.mealsEatenToday.includes(type);
    if (isEaten) loggedCount++;

    if (trackEl) {
      if (isEaten) {
        trackEl.style.borderColor = 'var(--primary-500)';
        trackEl.style.background = 'var(--primary-light)';
        trackEl.style.color = 'var(--primary-700)';
      } else {
        trackEl.style.borderColor = 'var(--gray-200)';
        trackEl.style.background = 'transparent';
        trackEl.style.color = 'inherit';
      }
    }
  });

  const countEl = document.getElementById('meal-tracking-count');
  if (countEl) {
    countEl.textContent = `${loggedCount}/4 logged`;
    countEl.style.color = loggedCount === 4 ? 'var(--success)' : 'var(--primary-600)';
  }
}

// ============================================
// Daily Check-in Functions (Period Tracker Style)
// ============================================

function selectDailyCheckin(category, value) {
  // Get the container for this category
  const containerId = `daily-${category === 'pain' ? 'pain-level' : category === 'sleep' ? 'sleep-quality' : 'mood'}`;
  const container = document.getElementById(containerId);

  if (container) {
    // Remove selected class from all items in this container
    container.querySelectorAll('.icon-select-item').forEach(item => {
      item.classList.remove('selected');
    });

    // Add selected class to clicked item
    const clickedItem = container.querySelector(`[data-value="${value}"]`);
    if (clickedItem) {
      clickedItem.classList.add('selected');
    }
  }

  // Store in temporary state (will be saved on button click)
  if (!window.dailyCheckinTemp) {
    window.dailyCheckinTemp = {};
  }
  window.dailyCheckinTemp[category] = value;
}

function saveDailyCheckin() {
  const today = new Date().toDateString();

  // Update AppState with today's check-in
  AppState.dailyCheckin = {
    date: today,
    pain: window.dailyCheckinTemp?.pain || null,
    sleep: window.dailyCheckinTemp?.sleep || null,
    mood: window.dailyCheckinTemp?.mood || null
  };

  // Save to history if not already saved today
  if (!AppState.checkinHistory) {
    AppState.checkinHistory = [];
  }

  // Remove existing entry for today if any
  AppState.checkinHistory = AppState.checkinHistory.filter(entry => entry.date !== today);

  // Add today's entry
  AppState.checkinHistory.push({
    date: today,
    timestamp: new Date().toISOString(),
    ...AppState.dailyCheckin
  });

  // Keep only last 30 days
  if (AppState.checkinHistory.length > 30) {
    AppState.checkinHistory = AppState.checkinHistory.slice(-30);
  }

  saveState();

  // Clear temp state
  window.dailyCheckinTemp = {};

  // Show success toast
  showToast('Daily check-in saved!', 'success');

  // Refresh the check-in UI to show completed state
  loadDailyCheckin();
}

function loadDailyCheckin() {
  const today = new Date().toDateString();
  const card = document.getElementById('daily-checkin-card');
  const historyCard = document.getElementById('checkin-history-card');

  // Debug log
  console.log('loadDailyCheckin called', {
    today,
    checkinDate: AppState.dailyCheckin?.date,
    match: AppState.dailyCheckin?.date === today,
    cardExists: !!card
  });

  // Check if already completed today
  if (AppState.dailyCheckin && AppState.dailyCheckin.date === today) {
    // Hide the full check-in card and show a minimal completion message
    if (card) {
      card.style.display = 'none';
    }

    // Show the completion summary in a smaller card if it exists
    const summaryCard = document.getElementById('checkin-complete-summary');
    if (summaryCard) {
      summaryCard.style.display = 'block';
      summaryCard.innerHTML = `
        <div class="checkin-complete-mini">
          <div class="checkin-complete-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Today's Check-in Complete</span>
          </div>
          <div class="checkin-complete-data">
            <span class="pain-badge">${formatCheckinValue('pain', AppState.dailyCheckin.pain)}</span>
            <span class="sleep-badge">${formatCheckinValue('sleep', AppState.dailyCheckin.sleep)}</span>
            <span class="mood-badge">${formatCheckinValue('mood', AppState.dailyCheckin.mood)}</span>
          </div>
        </div>
      `;
    }
  } else {
    // Show the check-in card if not completed today
    if (card) {
      card.style.display = 'block';
    }
    // Hide the completion summary
    const summaryCard = document.getElementById('checkin-complete-summary');
    if (summaryCard) {
      summaryCard.style.display = 'none';
    }
  }

  // Show check-in history if we have any
  renderCheckinHistory();
}

function formatCheckinValue(category, value) {
  const labels = {
    pain: { none: 'No Pain', mild: 'Mild', moderate: 'Moderate', severe: 'Severe' },
    sleep: { poor: 'Tired', okay: 'Okay', good: 'Refreshed', excellent: 'Amazing' },
    mood: { low: 'Low', okay: 'Fine', good: 'Happy', great: 'Great' }
  };
  return labels[category]?.[value] || value || 'Not recorded';
}

function renderCheckinHistory() {
  const historyCard = document.getElementById('checkin-history-card');
  const historyList = document.getElementById('checkin-history-list');

  if (!historyCard || !historyList) return;

  const history = AppState.checkinHistory || [];
  const today = new Date().toDateString();

  // Filter out today's entry (shown separately) and sort by date descending
  const pastEntries = history
    .filter(entry => entry.date !== today)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 7); // Show last 7 days

  if (pastEntries.length === 0) {
    historyCard.style.display = 'none';
    return;
  }

  historyCard.style.display = 'block';

  const historyHTML = pastEntries.map(entry => {
    const date = new Date(entry.timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });

    return `
      <div class="checkin-history-item">
        <div class="checkin-history-date">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <div class="checkin-history-data">
          ${entry.pain ? `
            <div class="checkin-data-item pain">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              ${formatCheckinValue('pain', entry.pain)}
            </div>
          ` : ''}
          ${entry.sleep ? `
            <div class="checkin-data-item sleep">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              ${formatCheckinValue('sleep', entry.sleep)}
            </div>
          ` : ''}
          ${entry.mood ? `
            <div class="checkin-data-item mood">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              </svg>
              ${formatCheckinValue('mood', entry.mood)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  historyList.innerHTML = historyHTML;
}

function toggleCheckinHistoryExpand() {
  const historyList = document.getElementById('checkin-history-list');
  const toggleText = document.getElementById('checkin-history-toggle-text');

  if (!historyList || !toggleText) return;

  const isExpanded = historyList.classList.toggle('expanded');
  toggleText.textContent = isExpanded ? 'Show Less' : 'View All';
}

// ============================================
// Weight Tracker Functions
// ============================================

// Initialize weight data in AppState if not present
function initWeightData() {
  if (!AppState.weightData) {
    AppState.weightData = {
      startingWeight: null,
      goalWeight: null,
      entries: []
    };
  }
}

// Open the weight log modal
function openWeightLogModal() {
  const modal = document.getElementById('weight-log-modal');
  const dateInput = document.getElementById('weight-date');

  if (modal) {
    modal.style.display = 'flex';

    // Set default date to today
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }
}

// Close the weight log modal
function closeWeightLogModal() {
  const modal = document.getElementById('weight-log-modal');
  if (modal) {
    modal.style.display = 'none';

    // Clear form
    const weightInput = document.getElementById('weight-input');
    const notesInput = document.getElementById('weight-notes');
    if (weightInput) weightInput.value = '';
    if (notesInput) notesInput.value = '';
  }
}

// Save a weight log entry
function saveWeightLog() {
  initWeightData();

  const weightInput = document.getElementById('weight-input');
  const dateInput = document.getElementById('weight-date');
  const notesInput = document.getElementById('weight-notes');

  const weight = parseFloat(weightInput?.value);
  const date = dateInput?.value;
  const notes = notesInput?.value || '';

  if (!weight || weight <= 0) {
    alert('Please enter a valid weight.');
    return;
  }

  if (!date) {
    alert('Please select a date.');
    return;
  }

  // Create entry
  const entry = {
    weight: weight,
    date: date,
    notes: notes,
    timestamp: new Date().toISOString()
  };

  // Add to entries
  AppState.weightData.entries.push(entry);

  // Sort entries by date (newest first)
  AppState.weightData.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  // If this is the first entry, set as starting weight
  if (AppState.weightData.entries.length === 1 || !AppState.weightData.startingWeight) {
    // Use the oldest entry as starting weight
    const oldestEntry = AppState.weightData.entries[AppState.weightData.entries.length - 1];
    AppState.weightData.startingWeight = oldestEntry.weight;
  }

  // Set a default goal weight if not set (10% less than starting weight)
  if (!AppState.weightData.goalWeight && AppState.weightData.startingWeight) {
    AppState.weightData.goalWeight = Math.round(AppState.weightData.startingWeight * 0.9);
  }

  saveState();
  closeWeightLogModal();
  updateWeightTrackerDisplay();
}

// Update the weight tracker display
function updateWeightTrackerDisplay() {
  initWeightData();

  const startingEl = document.getElementById('starting-weight');
  const currentEl = document.getElementById('current-weight');
  const goalEl = document.getElementById('goal-weight');
  const progressFill = document.getElementById('weight-progress-fill');
  const progressLabel = document.getElementById('weight-progress-label');
  const historyEl = document.getElementById('weight-history');

  const data = AppState.weightData;
  const entries = data.entries || [];

  // Update stats
  if (startingEl) {
    startingEl.textContent = data.startingWeight ? data.startingWeight.toFixed(1) : '--';
  }

  if (goalEl) {
    goalEl.textContent = data.goalWeight ? data.goalWeight.toFixed(1) : '--';
  }

  if (currentEl) {
    if (entries.length > 0) {
      currentEl.textContent = entries[0].weight.toFixed(1);
    } else {
      currentEl.textContent = '--';
    }
  }

  // Update progress bar
  if (progressFill && progressLabel) {
    if (data.startingWeight && data.goalWeight && entries.length > 0) {
      const currentWeight = entries[0].weight;
      const totalToLose = data.startingWeight - data.goalWeight;
      const lostSoFar = data.startingWeight - currentWeight;
      const progressPercent = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));

      progressFill.style.width = progressPercent + '%';

      if (lostSoFar > 0) {
        progressLabel.textContent = `You've lost ${lostSoFar.toFixed(1)} lbs (${progressPercent.toFixed(0)}% to goal)`;
      } else if (lostSoFar < 0) {
        progressLabel.textContent = `${Math.abs(lostSoFar).toFixed(1)} lbs gained - stay focused!`;
      } else {
        progressLabel.textContent = 'Keep going! Every step counts.';
      }
    } else {
      progressFill.style.width = '0%';
      progressLabel.textContent = 'Log your first weight to start tracking';
    }
  }

  // Update history
  if (historyEl) {
    if (entries.length === 0) {
      historyEl.innerHTML = '<p style="text-align: center; color: var(--gray-500); font-size: 0.875rem;">No entries yet. Log your weight to start tracking!</p>';
    } else {
      historyEl.innerHTML = entries.slice(0, 5).map((entry, index) => {
        const prevEntry = entries[index + 1];
        let changeHTML = '';

        if (prevEntry) {
          const change = entry.weight - prevEntry.weight;
          if (change < 0) {
            changeHTML = `<span class="weight-entry-change loss">↓ ${Math.abs(change).toFixed(1)} lbs</span>`;
          } else if (change > 0) {
            changeHTML = `<span class="weight-entry-change gain">↑ ${change.toFixed(1)} lbs</span>`;
          } else {
            changeHTML = `<span class="weight-entry-change">No change</span>`;
          }
        }

        const dateObj = new Date(entry.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return `
          <div class="weight-entry">
            <div class="weight-entry-info">
              <span class="weight-entry-date">${formattedDate}</span>
              <span class="weight-entry-value">${entry.weight.toFixed(1)} lbs</span>
            </div>
            ${changeHTML}
          </div>
        `;
      }).join('');
    }
  }
}

// ============================================
// Nutrition Page Functions
// ============================================
function updateNutritionPage() {
  const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
  const restrictions = AppState.userData.dietaryRestrictions;

  // Combine dietary notes and other restrictions for allergy/dislike filtering
  const userDislikes = [
    AppState.userData.otherDietaryNotes || '',
    AppState.userData.dietaryHabits || ''
  ].join(' ');

  const calories = calculateDailyCalories(AppState.userData);
  const calorieValue = document.getElementById('daily-calories');
  if (calorieValue) calorieValue.textContent = calories;

  toggleCalorieDisplay();

  // Populate dietary restrictions banner
  const dietaryBanner = document.getElementById('dietary-restrictions-banner');
  const dietaryTags = document.getElementById('dietary-restrictions-tags');
  if (dietaryBanner && dietaryTags && restrictions && restrictions.length > 0) {
    // Map restriction IDs to display names
    const restrictionNames = {
      'vegetarian': 'Vegetarian',
      'vegan': 'Vegan',
      'gluten-free': 'Gluten-Free',
      'dairy-free': 'Dairy-Free',
      'nut-allergy': 'Nut Allergy',
      'shellfish-allergy': 'Shellfish Allergy',
      'low-sodium': 'Low Sodium',
      'low-sugar': 'Low Sugar',
      'halal': 'Halal',
      'kosher': 'Kosher'
    };

    let tagsHTML = '';
    restrictions.forEach(restriction => {
      const displayName = restrictionNames[restriction] || restriction.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      tagsHTML += `<span class="dietary-restriction-tag">${displayName}</span>`;
    });

    dietaryTags.innerHTML = tagsHTML;
    dietaryBanner.style.display = 'block';
  } else if (dietaryBanner) {
    dietaryBanner.style.display = 'none';
  }

  // Show weight tracker if user has weight-loss as a condition
  const weightTrackerCard = document.getElementById('weight-tracker-card');
  if (weightTrackerCard) {
    // Check both primary conditions and otherConditions for weight-loss
    const allConditions = getAllUserConditions();
    const otherConditions = AppState.userData.otherConditions || [];

    // Handle otherConditions as either string or array
    let hasWeightLoss = allConditions.includes('weight-loss');
    if (!hasWeightLoss) {
      if (typeof otherConditions === 'string') {
        // Check for variations: "weight loss", "weight-loss", "obesity"
        const lowerOther = otherConditions.toLowerCase();
        hasWeightLoss = lowerOther.includes('weight loss') ||
                        lowerOther.includes('weight-loss') ||
                        lowerOther.includes('obesity');
      } else if (Array.isArray(otherConditions)) {
        hasWeightLoss = otherConditions.some(c =>
          c === 'weight-loss' ||
          c.toLowerCase().includes('weight') ||
          c.toLowerCase().includes('obesity')
        );
      }
    }

    if (hasWeightLoss) {
      weightTrackerCard.style.display = 'block';
      updateWeightTrackerDisplay();
    } else {
      weightTrackerCard.style.display = 'none';
    }
  }

  const mealsContainer = document.getElementById('meals-container');
  if (mealsContainer) {
    // Use meal rotation system
    const dayOffset = getCurrentDayOffset();
    const breakfast = MealDatabase.getMealForDay('breakfast', dayOffset, restrictions, userDislikes);
    const lunch = MealDatabase.getMealForDay('lunch', dayOffset, restrictions, userDislikes);
    const dinner = MealDatabase.getMealForDay('dinner', dayOffset, restrictions, userDislikes);
    const snack = MealDatabase.getMealForDay('snacks', dayOffset, restrictions, userDislikes);

    const meals = [
      { type: 'Breakfast', mealKey: 'breakfast', time: AppState.userData.breakfastTime || '08:00', meal: breakfast, icon: 'sunrise' },
      { type: 'Lunch', mealKey: 'lunch', time: AppState.userData.lunchTime || '12:30', meal: lunch, icon: 'sun' },
      { type: 'Dinner', mealKey: 'dinner', time: AppState.userData.dinnerTime || '18:30', meal: dinner, icon: 'moon' },
      { type: 'Snack', mealKey: 'snack', time: 'Afternoon', meal: snack, icon: 'clock' }
    ];

    mealsContainer.innerHTML = meals.map(({ type, mealKey, time, meal, icon }) => {
      const isEaten = AppState.mealsEatenToday.includes(mealKey);
      return `
      <div class="meal-card${isEaten ? ' meal-eaten' : ''}">
        <div class="meal-card-header">
          <div class="meal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${icon === 'sunrise' ?
                // Sunrise icon - sun rising over horizon
                '<circle cx="12" cy="17" r="4"/><path d="M12 9v2"/><path d="M5.6 12.4l1.4 1.4"/><path d="M18.4 12.4l-1.4 1.4"/><line x1="2" y1="21" x2="22" y2="21"/>' :
                icon === 'sun' ?
                // Full sun with rays - midday
                '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>' :
                icon === 'moon' ?
                // Moon/evening icon
                '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>' :
                // Clock icon for snack
                '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'}
            </svg>
          </div>
          <div>
            <div class="meal-type">${type}</div>
            <div class="meal-time">${typeof time === 'string' && time.includes(':') ? formatTime(time) : time}</div>
          </div>
          <button class="meal-eaten-btn${isEaten ? ' checked' : ''}" onclick="toggleMealEaten('${mealKey}')" title="${isEaten ? 'Mark as not eaten' : 'Mark as eaten'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
        </div>
        <div class="meal-name">${meal.name}</div>
        <div class="meal-description">${meal.description}</div>
        <div class="meal-servings">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            ${meal.servings || 1} serving${(meal.servings || 1) > 1 ? 's' : ''}
          </span>
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            ${meal.prepTime || '15 min'}
          </span>
        </div>
        <div class="meal-calories${AppState.showCalories ? '' : ' meal-calories-hidden'}">~${meal.calories} cal per serving</div>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--gray-100);">
          <a href="#" class="meal-recipe-link" onclick="showRecipe('${meal.id}'); return false;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            View Recipe
          </a>
          <span style="color: var(--gray-300);">|</span>
          <a href="#" class="meal-recipe-link" onclick="openCustomMealModal('${mealKey}'); return false;" style="color: var(--primary-600); font-weight: 500;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Log My Own Meal
          </a>
        </div>
      </div>
    `}).join('');
  }

  // Use combined nutrition guidelines from ALL conditions (primary + secondary)
  const guidelinesEl = document.getElementById('condition-nutrition-guidelines');
  const combinedGuidelines = getCombinedNutritionGuidelines();
  const allConditions = getAllUserConditions();

  // Define unique colors for each condition (up to 8 conditions supported)
  const conditionColors = {
    // Each condition gets a unique color scheme
    colors: [
      { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },  // Blue
      { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },  // Green
      { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },  // Orange
      { bg: '#F3E5F5', text: '#7B1FA2', border: '#CE93D8' },  // Purple
      { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },  // Red
      { bg: '#E0F7FA', text: '#00838F', border: '#80DEEA' },  // Cyan
      { bg: '#FFF8E1', text: '#F9A825', border: '#FFE082' },  // Amber
      { bg: '#FCE4EC', text: '#AD1457', border: '#F48FB1' }   // Pink
    ],
    getColor: function(conditionId) {
      // Create consistent color for each condition based on hash
      const hash = conditionId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      return this.colors[Math.abs(hash) % this.colors.length];
    }
  };

  if (guidelinesEl && combinedGuidelines.length > 0) {
    // Show multi-condition header if there are multiple conditions
    const headerHTML = allConditions.length > 1
      ? `<p style="margin-bottom: var(--space-3); font-size: 0.85rem; color: var(--gray-600);">Combined guidelines for ${allConditions.length} conditions:</p>`
      : '';

    guidelinesEl.innerHTML = `
      ${headerHTML}
      <ul style="list-style: none; padding: 0;">
        ${combinedGuidelines.map(g => {
          const color = conditionColors.getColor(g.conditionId);
          return `
          <li style="display: flex; gap: var(--space-3); margin-bottom: var(--space-3); padding: var(--space-3); background: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: var(--radius);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color.text}" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <div style="flex: 1;">
              <span style="color: var(--gray-700);">${g.text}</span>
              ${allConditions.length > 1 ? `<span class="nutrition-condition-tag" style="background: ${color.border}; color: ${color.text}; margin-left: var(--space-2); padding: 2px 8px; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 500;">${g.conditionName}</span>` : ''}
            </div>
          </li>
        `}).join('')}
      </ul>
    `;
  } else if (guidelinesEl && condition.nutritionGuidelines) {
    // Fallback to primary condition guidelines only
    const primaryColor = conditionColors.getColor(AppState.userData.condition || 'default');
    guidelinesEl.innerHTML = `
      <ul style="list-style: none; padding: 0;">
        ${condition.nutritionGuidelines.map(g => `
          <li style="display: flex; gap: var(--space-3); margin-bottom: var(--space-3); padding: var(--space-3); background: ${primaryColor.bg}; border-left: 4px solid ${primaryColor.border}; border-radius: var(--radius);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primaryColor.text}" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span style="color: var(--gray-700);">${g}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  const profileEl = document.getElementById('dietary-profile');
  if (profileEl) {
    if (restrictions && restrictions.length > 0) {
      profileEl.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          ${restrictions.map(r => `
            <span style="background: var(--primary-100); color: var(--primary-700); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); font-size: 0.75rem; text-transform: capitalize;">
              ${r.replace('-', ' ')}
            </span>
          `).join('')}
        </div>
      `;
    } else {
      profileEl.innerHTML = '<p style="color: var(--gray-500); font-size: 0.875rem;">No dietary restrictions recorded.</p>';
    }
  }

  initHydrationTracker();
  generateWeeklyGroceryList();
  updateMealTrackingHeader();
}

// ============================================
// Weekly Grocery List
// ============================================
const GroceryCategories = {
  'Produce': ['apple', 'banana', 'berries', 'berry', 'cherry tomato', 'tomato', 'cucumber', 'spinach', 'lettuce', 'greens', 'green', 'avocado', 'lemon', 'carrot', 'celery', 'onion', 'garlic', 'ginger', 'broccoli', 'vegetable', 'mixed vegetable', 'sweet potato', 'potato', 'fruit', 'cilantro', 'dill', 'parsley', 'basil', 'rosemary', 'thyme', 'mint', 'oregano', 'sage', 'chive', 'herb', 'frozen', 'pepper', 'bell pepper', 'zucchini', 'squash', 'kale', 'cabbage', 'mushroom', 'asparagus', 'corn', 'pea', 'bean sprout', 'radish', 'beet', 'turnip', 'eggplant', 'artichoke', 'leek', 'shallot', 'scallion', 'lime', 'orange', 'grape', 'pear', 'peach', 'mango', 'pineapple', 'melon', 'watermelon', 'strawberr', 'blueberr', 'raspberr', 'blackberr', 'cranberr', 'pomegranate', 'fig', 'date', 'plum', 'apricot', 'cherry', 'tabbouleh'],
  'Proteins': ['chicken', 'turkey', 'salmon', 'steak', 'beef', 'sirloin', 'eggs', 'egg', 'falafel', 'chickpea', 'lentil', 'tofu', 'tempeh', 'fish', 'shrimp', 'tuna', 'pork', 'lamb', 'ground meat', 'protein'],
  'Dairy & Alternatives': ['yogurt', 'milk', 'plant milk', 'cheese', 'butter', 'cream', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'feta'],
  'Grains & Bread': ['oats', 'oatmeal', 'quinoa', 'rice', 'brown rice', 'basmati rice', 'bread', 'toast', 'wrap', 'pita', 'granola', 'pasta', 'noodle', 'flour', 'tortilla', 'couscous', 'barley', 'cereal', 'cracker'],
  'Pantry Items': ['olive oil', 'sesame oil', 'oil', 'honey', 'tahini', 'hummus', 'curry paste', 'curry', 'soy sauce', 'mustard', 'coconut milk', 'vegetable broth', 'broth', 'stock', 'cumin', 'cinnamon', 'garlic powder', 'paprika', 'turmeric', 'chili', 'vinegar', 'maple syrup', 'sauce', 'paste', 'seasoning', 'spice', 'dressing', 'ketchup', 'mayo', 'sriracha', 'hot sauce', 'tomato sauce', 'tomato paste', 'canned', 'dried'],
  'Nuts & Seeds': ['almond butter', 'peanut butter', 'almond', 'walnut', 'cashew', 'nut', 'seed', 'mixed nuts', 'pecan', 'pistachio', 'pine nut', 'sunflower', 'pumpkin seed', 'chia', 'flax', 'hemp']
};

// Ingredient synonyms - map different names to a canonical name for proper combining
const ingredientSynonyms = {
  'roasted vegetables': 'mixed vegetables',
  'roasted vegetable': 'mixed vegetables',
  'mixed vegetable': 'mixed vegetables',
  'vegetables': 'mixed vegetables',
  'vegetable': 'mixed vegetables',
  'frozen banana': 'banana',
  'medium banana': 'banana',
  'ripe banana': 'banana',
  'fresh fruit': 'mixed fruit',
  'fruit for topping': 'mixed fruit',
  'diced onion': 'onion',
  'chopped onion': 'onion',
  'minced garlic': 'garlic',
  'fresh herbs': 'fresh herbs (dill, parsley, cilantro)',
  'fresh cilantro': 'cilantro',
  'fresh dill': 'dill',
  'fresh parsley': 'parsley',
  // Pantry item synonyms for proper combining
  'tahini sauce': 'tahini',
  'tahini dressing': 'tahini',
  'lemon dressing': 'lemon juice',
  'low-sodium soy sauce': 'soy sauce',
  'light soy sauce': 'soy sauce'
};

// Ingredients to exclude from grocery list (assume user has these)
const excludedIngredients = [
  'water', 'water to thin', 'ice', 'ice cubes',
  'salt', 'pepper', 'salt and pepper', 'black pepper',
  'cooking spray', 'nonstick spray'
];

// Convert measurements to ml for combining
const measurementToMl = {
  'cup': 237, 'cups': 237,
  'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
  'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
  'oz': 30, 'ounce': 30, 'ounces': 30,
  'ml': 1, 'liter': 1000, 'liters': 1000, 'l': 1000
};

// User-friendly grocery quantities - maps item types to helpful store descriptions
const grocerySizes = {
  // Produce (count-based)
  'apple': { unit: '', size: 1, name: 'apples', isCount: true, friendlyUnit: 'apple' },
  'banana': { unit: '', size: 1, name: 'bananas', isCount: true, friendlyUnit: 'banana' },
  'avocado': { unit: '', size: 1, name: 'avocados', isCount: true, friendlyUnit: 'avocado' },
  'lemon': { unit: '', size: 1, name: 'lemons', isCount: true, friendlyUnit: 'lemon' },
  'onion': { unit: '', size: 1, name: 'onions', isCount: true, friendlyUnit: 'onion' },
  'carrot': { unit: '', size: 1, name: 'carrots', isCount: true, friendlyUnit: 'carrot' },
  'celery': { unit: 'bunch', size: 6, name: 'celery', isCount: true, friendlyUnit: 'stalk' },
  'tomato': { unit: '', size: 1, name: 'tomatoes', isCount: true, friendlyUnit: 'tomato' },
  'sweet potato': { unit: '', size: 1, name: 'sweet potatoes', isCount: true, friendlyUnit: 'sweet potato' },
  'cucumber': { unit: '', size: 1, name: 'cucumbers', isCount: true, friendlyUnit: 'cucumber' },
  'garlic': { unit: 'head', size: 10, name: 'garlic', isCount: true, friendlyUnit: 'clove' },
  'ginger': { unit: 'piece', size: 1, name: 'fresh ginger root', isCount: true, friendlyUnit: 'piece' },
  'broccoli': { unit: 'head', size: 1, name: 'broccoli', isCount: true, friendlyUnit: 'head' },
  // Produce (volume/weight) - with user-friendly sizes
  'spinach': { unit: 'bag', size: 300, name: 'baby spinach', friendlySize: '5-6 oz bag' },
  'lettuce': { unit: 'head', size: 1, name: 'lettuce', isCount: true, friendlyUnit: 'head' },
  'greens': { unit: 'container', size: 400, name: 'mixed greens', friendlySize: '5 oz container' },
  'berries': { unit: 'container', size: 340, name: 'mixed berries', friendlySize: '12 oz container' },
  'frozen berries': { unit: 'bag', size: 340, name: 'frozen mixed berries', friendlySize: '12 oz bag' },
  'cherry tomatoes': { unit: 'pint', size: 300, name: 'cherry tomatoes', friendlySize: '1 pint container' },
  'mixed vegetables': { unit: 'bag', size: 450, name: 'frozen mixed vegetables', friendlySize: '1 lb bag', isFrozen: true },
  'mixed fruit': { unit: 'container', size: 300, name: 'mixed fresh fruit', friendlySize: '1 cup' },
  'mixed herbs': { unit: 'bunch', size: 1, name: 'fresh herbs (dill, parsley, cilantro)', isCount: true, friendlyUnit: 'bunch' },
  'dill': { unit: 'bunch', size: 1, name: 'fresh dill', isCount: true, friendlyUnit: 'bunch' },
  'parsley': { unit: 'bunch', size: 1, name: 'fresh parsley', isCount: true, friendlyUnit: 'bunch' },
  'cilantro': { unit: 'bunch', size: 1, name: 'fresh cilantro', isCount: true, friendlyUnit: 'bunch' },
  'basil': { unit: 'bunch', size: 1, name: 'fresh basil', isCount: true, friendlyUnit: 'bunch' },
  'rosemary': { unit: 'bunch', size: 1, name: 'fresh rosemary', isCount: true, friendlyUnit: 'bunch' },
  'thyme': { unit: 'bunch', size: 1, name: 'fresh thyme', isCount: true, friendlyUnit: 'bunch' },
  'mint': { unit: 'bunch', size: 1, name: 'fresh mint', isCount: true, friendlyUnit: 'bunch' },
  // Proteins (weight in grams)
  'chicken': { unit: 'lb', size: 454, name: 'chicken breast', isWeight: true, friendlySize: '1 lb package' },
  'turkey': { unit: 'lb', size: 454, name: 'sliced turkey', isWeight: true, friendlySize: '1 lb package' },
  'salmon': { unit: 'lb', size: 454, name: 'salmon fillet', isWeight: true, friendlySize: '1 lb fillet' },
  'steak': { unit: 'lb', size: 454, name: 'sirloin steak', isWeight: true, friendlySize: '1 lb steak' },
  'beef': { unit: 'lb', size: 454, name: 'lean ground beef', isWeight: true, friendlySize: '1 lb package' },
  'eggs': { unit: 'dozen', size: 12, name: 'eggs', isCount: true, friendlyUnit: 'egg' },
  'chickpeas': { unit: 'can', size: 1, name: 'chickpeas', isCount: true, friendlyUnit: 'can', friendlySize: '15 oz can' },
  'lentils': { unit: 'bag', size: 454, name: 'dried lentils', friendlySize: '1 lb bag' },
  'falafel': { unit: 'box', size: 8, name: 'falafel patties', isCount: true, friendlySize: '1 box (8-10 pieces)' },
  // Dairy
  'yogurt': { unit: 'container', size: 450, name: 'Greek yogurt', friendlySize: '32 oz container' },
  'milk': { unit: 'carton', size: 946, name: 'milk', friendlySize: '1/2 gallon carton' },
  'plant milk': { unit: 'carton', size: 946, name: 'plant milk', friendlySize: '1/2 gallon carton' },
  'cheese': { unit: 'package', size: 227, name: 'cheese', friendlySize: '8 oz package' },
  // Pantry - liquids
  'hummus': { unit: 'container', size: 283, name: 'hummus', friendlySize: '10 oz container' },
  'olive oil': { unit: 'bottle', size: 500, name: 'olive oil', friendlySize: '1 bottle' },
  'sesame oil': { unit: 'bottle', size: 250, name: 'sesame oil', friendlySize: '1 bottle' },
  'honey': { unit: 'bottle', size: 340, name: 'honey', friendlySize: '12 oz bottle' },
  'tahini': { unit: 'jar', size: 454, name: 'tahini', friendlySize: '1 jar' },
  'soy sauce': { unit: 'bottle', size: 296, name: 'low-sodium soy sauce', friendlySize: '1 bottle' },
  'coconut milk': { unit: 'can', size: 1, name: 'coconut milk', isCount: true, friendlyUnit: 'can', friendlySize: '13.5 oz can' },
  'vegetable broth': { unit: 'carton', size: 946, name: 'vegetable broth', friendlySize: '32 oz carton' },
  'curry paste': { unit: 'jar', size: 200, name: 'curry paste', friendlySize: '1 jar' },
  'mustard': { unit: 'bottle', size: 227, name: 'mustard', friendlySize: '1 bottle' },
  // Grains
  'oats': { unit: 'container', size: 510, name: 'rolled oats', friendlySize: '18 oz container' },
  'rice': { unit: 'bag', size: 907, name: 'rice', friendlySize: '2 lb bag' },
  'brown rice': { unit: 'bag', size: 907, name: 'brown rice', friendlySize: '2 lb bag' },
  'basmati rice': { unit: 'bag', size: 907, name: 'basmati rice', friendlySize: '2 lb bag' },
  'quinoa': { unit: 'bag', size: 340, name: 'quinoa', friendlySize: '12 oz bag' },
  'bread': { unit: 'loaf', size: 1, name: 'whole grain bread', isCount: true, friendlyUnit: 'loaf' },
  'wrap': { unit: 'package', size: 8, name: 'whole wheat wraps', isCount: true, friendlySize: '1 package (8 wraps)' },
  'pita': { unit: 'package', size: 6, name: 'pita bread', isCount: true, friendlySize: '1 package (6 pitas)' },
  'granola': { unit: 'bag', size: 340, name: 'granola', friendlySize: '12 oz bag' },
  // Nuts & Seeds
  'almond butter': { unit: 'jar', size: 454, name: 'almond butter', friendlySize: '1 jar' },
  'almonds': { unit: 'bag', size: 227, name: 'almonds', friendlySize: '8 oz bag' },
  'walnuts': { unit: 'bag', size: 227, name: 'walnuts', friendlySize: '8 oz bag' },
  'cashews': { unit: 'bag', size: 227, name: 'cashews', friendlySize: '8 oz bag' },
  'mixed nuts': { unit: 'container', size: 340, name: 'mixed nuts', friendlySize: '12 oz container' },
  'seeds': { unit: 'bag', size: 170, name: 'mixed seeds', friendlySize: '6 oz bag' },
  'nuts and seeds': { unit: 'container', size: 340, name: 'mixed nuts and seeds', friendlySize: '12 oz container' }
};

// Normalize ingredient name using synonyms for better combining
function normalizeIngredientName(name) {
  const lowerName = name.toLowerCase().trim();

  // Check synonyms first
  for (const [synonym, canonical] of Object.entries(ingredientSynonyms)) {
    if (lowerName.includes(synonym)) {
      return canonical;
    }
  }

  // Remove common modifiers that shouldn't affect combining
  let normalized = lowerName
    .replace(/\s*(frozen|fresh|medium|large|small|ripe|organic|diced|sliced|chopped|minced|halved|quartered|cubed|shredded|grated|julienned|crushed|cooked|raw|any mix)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Handle plurals - convert to singular for matching
  if (normalized.endsWith('es') && !normalized.endsWith('chickpeas')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith('s') && !normalized.endsWith('oats') && !normalized.endsWith('herbs')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

// Parse ingredient string to extract quantity, unit, and item name
function parseIngredient(ingredientStr) {
  const str = ingredientStr.toLowerCase().trim();

  // Match patterns like "1 cup", "1/2 cup", "2 tbsp", "8 oz", "2 carrots, diced"
  const quantityMatch = str.match(/^([\d\/\.\s]+)\s*(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|ml|liter|liters|l|lb|lbs|pound|pounds|medium|large|small|cloves?|slices?|stalks?|heads?|cans?|pieces?)?\s*(.*)$/i);

  if (quantityMatch) {
    let quantity = quantityMatch[1].trim();
    // Handle fractions like 1/2, 1/4
    if (quantity.includes('/')) {
      const fractionParts = quantity.split(' ');
      let total = 0;
      fractionParts.forEach(part => {
        if (part.includes('/')) {
          const [num, denom] = part.split('/');
          total += parseFloat(num) / parseFloat(denom);
        } else if (part) {
          total += parseFloat(part) || 0;
        }
      });
      quantity = total || 1;
    } else {
      quantity = parseFloat(quantity) || 1;
    }

    const unit = (quantityMatch[2] || '').toLowerCase();
    // Clean up item name - remove preparation instructions like "diced", "sliced", etc.
    let item = quantityMatch[3]
      .replace(/^\s*of\s*/, '')
      .replace(/,.*$/, '')
      .replace(/\s*\(.*\)\s*/g, '') // Remove parenthetical notes
      .replace(/\s*(diced|sliced|chopped|minced|halved|quartered|cubed|shredded|grated|julienned|crushed|for topping|any mix)\s*/gi, '')
      .trim();

    // Apply normalization
    const normalizedItem = normalizeIngredientName(item);

    return { quantity, unit, item: normalizedItem, displayName: item, original: ingredientStr };
  }

  const normalizedItem = normalizeIngredientName(str);
  return { quantity: 1, unit: '', item: normalizedItem, displayName: str, original: ingredientStr };
}

// Combine similar ingredients and convert to grocery quantities
function combineIngredients(ingredientsList, recipeMap) {
  const combined = {};

  ingredientsList.forEach(({ ingredient, recipeName }) => {
    const parsed = parseIngredient(ingredient);
    // Normalize key for matching - use the normalized item name
    const key = parsed.item.replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

    if (!combined[key]) {
      combined[key] = {
        items: [],
        totalMl: 0,
        totalCount: 0,
        totalWeight: 0,
        totalCans: 0,
        count: 0,
        displayName: parsed.item,
        recipeDetails: [] // Track per-recipe quantities
      };
    }

    combined[key].items.push(parsed);
    combined[key].count++;

    // Track per-recipe quantities for click-to-see detail
    combined[key].recipeDetails.push({
      recipe: recipeName,
      amount: parsed.original
    });

    // Convert to ml if possible
    if (parsed.unit && measurementToMl[parsed.unit]) {
      combined[key].totalMl += parsed.quantity * measurementToMl[parsed.unit];
    } else if (!parsed.unit || parsed.unit === '') {
      // For items without a unit (like "Tahini sauce"), assume a sensible default serving
      // This prevents counting each mention as needing a whole package
      // Default to ~2 tbsp (30ml) per recipe mention for pantry items
      const pantryItems = ['tahini', 'hummus', 'soy sauce', 'olive oil', 'sesame oil', 'honey', 'mustard', 'curry paste'];
      if (pantryItems.some(item => key.includes(item))) {
        combined[key].totalMl += 30; // Approximate 2 tbsp serving
      }
    }

    // Track count-based items (cloves, stalks, medium, etc.)
    if (['clove', 'cloves', 'stalk', 'stalks', 'medium', 'large', 'small', 'head', 'heads', 'slice', 'slices', 'piece', 'pieces'].includes(parsed.unit)) {
      combined[key].totalCount += parsed.quantity;
    } else if (parsed.unit === '' && !['tahini', 'hummus', 'soy sauce', 'olive oil', 'sesame oil', 'honey', 'mustard', 'curry paste'].some(item => key.includes(item))) {
      // Count-based for non-pantry items without units
      combined[key].totalCount += parsed.quantity;
    }

    // Track cans specifically
    if (['can', 'cans'].includes(parsed.unit)) {
      combined[key].totalCans += parsed.quantity;
    }

    // Track weight (oz, lb)
    if (['oz', 'ounce', 'ounces'].includes(parsed.unit)) {
      combined[key].totalWeight += parsed.quantity * 28.35; // Convert to grams
    } else if (['lb', 'lbs', 'pound', 'pounds'].includes(parsed.unit)) {
      combined[key].totalWeight += parsed.quantity * 454; // Convert to grams
    }
  });

  // Merge entries that ended up with similar keys after normalization (e.g., "garlic" and "garlic ")
  const mergedCombined = {};
  for (const [key, data] of Object.entries(combined)) {
    // Normalize key further: trim, collapse spaces, singularize
    let normalizedKey = key.replace(/\s+/g, ' ').trim();
    if (normalizedKey.endsWith('es') && !normalizedKey.endsWith('chickpeas')) {
      normalizedKey = normalizedKey.slice(0, -2);
    } else if (normalizedKey.endsWith('s') && !normalizedKey.endsWith('oats') && !normalizedKey.endsWith('herbs') && !normalizedKey.endsWith('nuts')) {
      normalizedKey = normalizedKey.slice(0, -1);
    }

    if (mergedCombined[normalizedKey]) {
      // Merge into existing
      const existing = mergedCombined[normalizedKey];
      existing.items.push(...data.items);
      existing.totalMl += data.totalMl;
      existing.totalCount += data.totalCount;
      existing.totalWeight += data.totalWeight;
      existing.totalCans += data.totalCans;
      existing.count += data.count;
      existing.recipeDetails.push(...data.recipeDetails);
    } else {
      mergedCombined[normalizedKey] = { ...data };
    }
  }

  // Convert combined quantities to grocery-sized items with user-friendly descriptions
  const result = [];
  for (const [key, data] of Object.entries(mergedCombined)) {
    let displayText = '';
    let rawQuantity = ''; // Store the raw quantity for detail view

    // Find matching grocery size - try exact match first, then partial
    let groceryMatch = Object.entries(grocerySizes).find(([k]) => key === k);
    if (!groceryMatch) {
      groceryMatch = Object.entries(grocerySizes).find(([k]) => key.includes(k) || k.includes(key));
    }

    if (groceryMatch) {
      const [matchKey, config] = groceryMatch;

      if (config.isCount) {
        // Count-based items (carrots, eggs, apples, bananas, etc.)
        const total = Math.ceil(data.totalCount || data.totalCans || data.count);
        rawQuantity = `${total} ${config.friendlyUnit || matchKey}${total > 1 ? 's' : ''}`;

        if (matchKey === 'eggs') {
          const dozens = Math.ceil(total / 12);
          displayText = dozens === 1 ? '1 dozen eggs' : `${dozens} dozen eggs`;
        } else if (matchKey === 'garlic') {
          const heads = Math.ceil(total / 10);
          displayText = heads === 1 ? '1 head garlic' : `${heads} heads garlic`;
        } else if (matchKey === 'celery') {
          const bunches = Math.ceil(total / 6);
          displayText = bunches === 1 ? '1 bunch celery' : `${bunches} bunches celery`;
        } else if (matchKey === 'chickpeas' || matchKey === 'coconut milk') {
          // Cans should stay as cans
          displayText = `${total} ${total === 1 ? 'can' : 'cans'} ${config.name}`;
        } else if (config.friendlySize) {
          // Use friendly size description
          if (total === 1) {
            displayText = `${config.friendlySize} ${config.name}`;
          } else {
            displayText = `${total} ${config.name}`;
          }
        } else {
          displayText = `${total} ${config.name}`;
        }
      } else if (config.isWeight && data.totalWeight > 0) {
        // Weight-based items (meats)
        const lbs = data.totalWeight / 454;
        const roundedLbs = Math.ceil(lbs * 2) / 2; // Round to nearest 0.5 lb
        rawQuantity = `${roundedLbs} lb`;
        displayText = `${roundedLbs} lb ${config.name}`;
      } else if (data.totalMl > 0) {
        // Volume-based items - use friendly package sizes instead of ml
        const numUnits = Math.ceil(data.totalMl / config.size);
        rawQuantity = `${Math.round(data.totalMl)}ml total`;

        if (config.friendlySize) {
          if (numUnits === 1) {
            displayText = `${config.friendlySize} ${config.name}`;
          } else {
            displayText = `${numUnits} ${config.friendlySize.replace(/^1\s*/, '')}s ${config.name}`;
          }
        } else if (numUnits === 1) {
          displayText = `1 ${config.unit} ${config.name}`;
        } else {
          const unitPlural = config.unit.endsWith('s') ? config.unit : config.unit + 's';
          displayText = `${numUnits} ${unitPlural} ${config.name}`;
        }
      } else if (data.totalCans > 0) {
        // Can-based items
        displayText = `${data.totalCans} ${data.totalCans === 1 ? 'can' : 'cans'} ${config.name}`;
        rawQuantity = `${data.totalCans} can${data.totalCans > 1 ? 's' : ''}`;
      } else {
        // Default - use friendly size if available
        if (config.friendlySize) {
          displayText = `${config.friendlySize} ${config.name}`;
        } else {
          displayText = data.count > 1
            ? `${data.count} ${config.unit}${data.count > 1 ? 's' : ''} ${config.name}`
            : `1 ${config.unit} ${config.name}`;
        }
      }
    } else {
      // No grocery match - show combined quantity in user-friendly way
      if (data.totalCount > 1) {
        const total = Math.ceil(data.totalCount);
        displayText = `${total} ${data.displayName}${total > 1 && !data.displayName.endsWith('s') ? 's' : ''}`;
        rawQuantity = `${total} items`;
      } else if (data.totalCans > 0) {
        displayText = `${data.totalCans} can${data.totalCans > 1 ? 's' : ''} ${data.displayName}`;
        rawQuantity = `${data.totalCans} can${data.totalCans > 1 ? 's' : ''}`;
      } else if (data.totalMl > 0) {
        // Convert ml to user-friendly measurements
        rawQuantity = `${Math.round(data.totalMl)}ml`;
        if (data.totalMl >= 946) {
          // About a quart or more - suggest packages/containers
          const packages = Math.ceil(data.totalMl / 450);
          displayText = `${packages} large package${packages > 1 ? 's' : ''} ${data.displayName}`;
        } else if (data.totalMl >= 474) {
          // About 2 cups - suggest 1 large package
          displayText = `1 large package ${data.displayName}`;
        } else if (data.totalMl >= 237) {
          // About 1 cup
          displayText = `1 package ${data.displayName}`;
        } else {
          // Small amount
          const cups = Math.ceil(data.totalMl / 237);
          displayText = cups <= 1 ? `${data.displayName} (small amount)` : `${cups} cups ${data.displayName}`;
        }
      } else if (data.count > 1) {
        displayText = `${data.displayName} (for ${data.count} recipes)`;
        rawQuantity = `Used in ${data.count} recipes`;
      } else {
        displayText = data.items[0].original;
      }
    }

    result.push({
      name: displayText,
      checked: false,
      key,
      rawQuantity,
      recipeDetails: data.recipeDetails
    });
  }

  return result;
}

// Track current grocery list weeks setting
let groceryWeeksSetting = 1;

function updateGroceryWeeks(weeks) {
  groceryWeeksSetting = parseInt(weeks) || 1;
  generateWeeklyGroceryList();
}

function generateWeeklyGroceryList() {
  const grocerySection = document.getElementById('grocery-list-section');
  const groceryCategoriesEl = document.getElementById('grocery-categories');
  const weekLabel = document.getElementById('grocery-week-label');
  const dateRangeEl = document.getElementById('grocery-date-range');

  if (!grocerySection || !groceryCategoriesEl) return;

  // Always show grocery list
  grocerySection.style.display = 'block';

  // Calculate date range
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (groceryWeeksSetting * 7) - 1);

  const formatDate = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  if (dateRangeEl) {
    dateRangeEl.textContent = `${formatDate(today)} - ${formatDate(endDate)}`;
  }

  if (weekLabel) {
    const weekText = groceryWeeksSetting === 1 ? 'This week\'s recipes' :
                     groceryWeeksSetting === 2 ? 'Next 2 weeks of recipes' :
                     'Next 3 weeks of recipes';
    weekLabel.textContent = weekText;
  }

  // Initialize meal plan if needed
  initializeMealPlan();

  // Collect ingredients with recipe names for proper combining and tracking
  const allIngredients = [];

  // Get ingredients from meal plan, accounting for multi-week
  Object.entries(AppState.mealPlan.meals).forEach(([category, plannedMeals]) => {
    // For multi-week, duplicate the week's meals
    const mealsToProcess = [];
    for (let week = 0; week < groceryWeeksSetting; week++) {
      plannedMeals.forEach(pm => mealsToProcess.push(pm));
    }

    mealsToProcess.forEach(plannedMeal => {
      const meal = MealDatabase[category]?.find(m => m.id === plannedMeal.mealId);
      if (meal?.recipe?.ingredients) {
        meal.recipe.ingredients.forEach(ing => {
          // Skip excluded ingredients (water, salt, etc.)
          const lowerIng = ing.toLowerCase().trim();
          const isExcluded = excludedIngredients.some(excluded =>
            lowerIng === excluded || lowerIng.startsWith(excluded + ' ') || lowerIng.endsWith(' ' + excluded)
          );
          if (isExcluded) return;

          // Store ingredient with recipe name for tracking
          allIngredients.push({
            ingredient: ing,
            recipeName: meal.name
          });
        });
      }
    });
  });

  // Combine similar ingredients into grocery-sized quantities
  // Pass the ingredients with recipe info
  const combinedIngredients = combineIngredients(allIngredients);

  // Recipe info is now included directly from combineIngredients
  combinedIngredients.forEach(item => {
    if (item.recipeDetails && item.recipeDetails.length > 0) {
      // Get unique recipe names
      const uniqueRecipes = [...new Set(item.recipeDetails.map(rd => rd.recipe))];
      item.recipes = uniqueRecipes;
    }
  });

  // Categorize the combined ingredients
  const categorizedIngredients = {};
  Object.keys(GroceryCategories).forEach(cat => {
    categorizedIngredients[cat] = [];
  });
  categorizedIngredients['Other'] = [];

  combinedIngredients.forEach(item => {
    let categorized = false;
    const lowerName = item.name.toLowerCase();
    const lowerKey = item.key.toLowerCase();

    for (const [category, keywords] of Object.entries(GroceryCategories)) {
      if (keywords.some(kw => lowerName.includes(kw) || lowerKey.includes(kw))) {
        categorizedIngredients[category].push(item);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categorizedIngredients['Other'].push(item);
    }
  });

  // Render grocery list
  const categoryIcons = {
    'Produce': '<path d="M12 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-3V5a3 3 0 00-3-3z"/>',
    'Proteins': '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    'Dairy & Alternatives': '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>',
    'Grains & Bread': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>',
    'Pantry Items': '<path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM3 9V6a2 2 0 012-2h14a2 2 0 012 2v3"/>',
    'Nuts & Seeds': '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10"/>',
    'Other': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };

  // Store ingredient data globally for click-to-see functionality
  window.groceryItemData = {};

  let html = '';

  for (const [category, items] of Object.entries(categorizedIngredients)) {
    if (items.length === 0) continue;

    html += `
      <div class="grocery-category">
        <div class="grocery-category-header">
          <svg class="grocery-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${categoryIcons[category] || categoryIcons['Other']}
          </svg>
          <span class="grocery-category-title">${category}</span>
        </div>
        ${items.map((item, idx) => {
          // Store data for click handler
          const itemId = `${category}-${idx}`;
          window.groceryItemData[itemId] = item;

          return `
          <div class="grocery-item" data-category="${category}" data-index="${idx}" data-item-id="${itemId}">
            <div class="grocery-item-checkbox" onclick="event.stopPropagation(); toggleGroceryItem(this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div class="grocery-item-content" onclick="showIngredientRecipes('${itemId}')">
              <span class="grocery-item-name">${item.name}</span>
              ${item.recipes && item.recipes.length > 0 ? `<span class="grocery-recipe-count">(${item.recipes.length} meal${item.recipes.length > 1 ? 's' : ''})</span>` : ''}
              <span class="grocery-tap-hint">Tap for details</span>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }

  groceryCategoriesEl.innerHTML = html;
}

// Show ingredient recipe details modal
function showIngredientRecipes(itemId) {
  const item = window.groceryItemData[itemId];
  if (!item) return;

  // Group recipe details by recipe name and sum up quantities
  const recipeGroups = {};
  if (item.recipeDetails) {
    item.recipeDetails.forEach(detail => {
      if (!recipeGroups[detail.recipe]) {
        recipeGroups[detail.recipe] = [];
      }
      recipeGroups[detail.recipe].push(detail.amount);
    });
  }

  const modalHTML = `
    <div id="ingredient-detail-modal" class="video-modal-overlay" onclick="closeIngredientModal(event)">
      <div class="ingredient-detail-content" onclick="event.stopPropagation()">
        <button class="modal-close-btn" onclick="closeIngredientModal(event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="ingredient-detail-header">
          <h3>${item.name}</h3>
          ${item.rawQuantity ? `<p class="ingredient-total">Total needed: ${item.rawQuantity}</p>` : ''}
        </div>
        <div class="ingredient-recipe-list">
          <h4>Used in recipes:</h4>
          ${Object.entries(recipeGroups).map(([recipe, amounts]) => `
            <div class="ingredient-recipe-row">
              <span class="ingredient-recipe-name">${recipe}</span>
              <span class="ingredient-recipe-amount">${amounts.join(' + ')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeIngredientModal(event) {
  if (event.target.id === 'ingredient-detail-modal' || event.target.closest('.modal-close-btn')) {
    const modal = document.getElementById('ingredient-detail-modal');
    if (modal) modal.remove();
  }
}

function toggleGroceryItem(checkbox) {
  checkbox.classList.toggle('checked');
  const item = checkbox.closest('.grocery-item');
  if (item) item.classList.toggle('checked');
}

function printGroceryList() {
  window.print();
}

// Export grocery list - show options modal
function exportGroceryList() {
  const groceryCategoriesEl = document.getElementById('grocery-categories');
  if (!groceryCategoriesEl) return;

  // Show export options modal
  const modalHTML = `
    <div id="export-modal" class="video-modal-overlay" onclick="closeExportModal(event)">
      <div class="ingredient-detail-content" onclick="event.stopPropagation()" style="max-width: 300px;">
        <button class="modal-close-btn" onclick="event.stopPropagation(); var m=document.getElementById('export-modal'); if(m) m.remove();">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="ingredient-detail-header">
          <h3>Export Grocery List</h3>
          <p style="font-size: 0.85rem; color: var(--gray-500); margin: var(--space-2) 0 0;">Choose how to export</p>
        </div>
        <div class="export-options">
          <button class="export-option-btn" onclick="exportGroceryAsPDF()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span>Print / Save as PDF</span>
          </button>
          <button class="export-option-btn" onclick="shareGroceryList()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>Share</span>
          </button>
          <button class="export-option-btn" onclick="copyGroceryList()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span>Copy to Clipboard</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeExportModal(event) {
  if (event) {
    // Close if clicking the overlay background or the close button
    if (event.target.id === 'export-modal' || event.target.closest('.modal-close-btn')) {
      const modal = document.getElementById('export-modal');
      if (modal) modal.remove();
      return;
    }
  }
  // Fallback: always close when called directly
  const modal = document.getElementById('export-modal');
  if (modal) modal.remove();
}

// Generate beautiful print-ready grocery list HTML
function generatePrintableGroceryHTML() {
  const groceryCategoriesEl = document.getElementById('grocery-categories');
  if (!groceryCategoriesEl) return '';

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (groceryWeeksSetting * 7) - 1);

  const formatDate = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Caribou Grocery List</title>
      <style>
        @page { margin: 0.5in; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #3d9b94;
        }
        .header h1 {
          font-size: 24px;
          color: #3d9b94;
          margin-bottom: 8px;
        }
        .header .date-range {
          font-size: 14px;
          color: #666;
        }
        .header .logo {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .category {
          margin-bottom: 20px;
          break-inside: avoid;
        }
        .category-title {
          font-size: 14px;
          font-weight: 600;
          color: #3d9b94;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 12px;
          background: #e8f4f3;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .item {
          display: flex;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .item:last-child { border-bottom: none; }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #ccc;
          border-radius: 3px;
          margin-right: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .item-name {
          font-size: 14px;
          color: #333;
          flex: 1;
        }
        .item-recipes {
          font-size: 11px;
          color: #888;
          margin-top: 2px;
        }
        .footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body { padding: 0; }
          .category { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🦌</div>
        <h1>Caribou Grocery List</h1>
        <div class="date-range">${formatDate(today)} - ${formatDate(endDate)} (${groceryWeeksSetting === 1 ? '1 week' : groceryWeeksSetting + ' weeks'})</div>
      </div>
  `;

  const categories = groceryCategoriesEl.querySelectorAll('.grocery-category');
  categories.forEach(cat => {
    const title = cat.querySelector('.grocery-category-title')?.textContent || 'Items';
    html += `<div class="category"><div class="category-title">${title}</div>`;

    const items = cat.querySelectorAll('.grocery-item');
    items.forEach(item => {
      const name = item.querySelector('.grocery-item-name')?.textContent || '';
      const recipeTags = item.querySelectorAll('.recipe-tag');
      const recipes = Array.from(recipeTags).map(t => t.textContent).join(', ');

      html += `
        <div class="item">
          <div class="checkbox"></div>
          <div>
            <div class="item-name">${name}</div>
            ${recipes ? `<div class="item-recipes">Used in: ${recipes}</div>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
      <div class="footer">
        Generated by Caribou Health • ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;

  return html;
}

// Export as PDF (opens print dialog)
function exportGroceryAsPDF() {
  closeExportModal({ target: { id: 'export-modal' } });

  const printHTML = generatePrintableGroceryHTML();
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    showToast('Please allow popups to print', 'error');
  }
}

// Share grocery list (native share API)
function shareGroceryList() {
  closeExportModal({ target: { id: 'export-modal' } });

  const groceryCategoriesEl = document.getElementById('grocery-categories');
  if (!groceryCategoriesEl) return;

  // Build text list
  let listText = '🦌 Caribou Grocery List\n';
  listText += `Week of ${new Date().toLocaleDateString()}\n\n`;

  const categories = groceryCategoriesEl.querySelectorAll('.grocery-category');
  categories.forEach(cat => {
    const title = cat.querySelector('.grocery-category-title')?.textContent || 'Items';
    listText += `── ${title} ──\n`;

    const items = cat.querySelectorAll('.grocery-item');
    items.forEach(item => {
      const name = item.querySelector('.grocery-item-name')?.textContent || '';
      const isChecked = item.classList.contains('checked');
      listText += `${isChecked ? '✓' : '☐'} ${name}\n`;
    });
    listText += '\n';
  });

  // Try to use native share on iOS/mobile, otherwise copy to clipboard
  if (navigator.share) {
    navigator.share({
      title: 'Caribou Grocery List',
      text: listText
    }).then(() => {
      showToast('Grocery list ready to share!', 'success');
    }).catch(err => {
      // Fallback to clipboard
      copyToClipboard(listText);
    });
  } else {
    copyToClipboard(listText);
  }
}

// Copy grocery list to clipboard
function copyGroceryList() {
  closeExportModal({ target: { id: 'export-modal' } });

  const groceryCategoriesEl = document.getElementById('grocery-categories');
  if (!groceryCategoriesEl) return;

  // Build text list
  let listText = '🦌 Caribou Grocery List\n';
  listText += `Week of ${new Date().toLocaleDateString()}\n\n`;

  const categories = groceryCategoriesEl.querySelectorAll('.grocery-category');
  categories.forEach(cat => {
    const title = cat.querySelector('.grocery-category-title')?.textContent || 'Items';
    listText += `── ${title} ──\n`;

    const items = cat.querySelectorAll('.grocery-item');
    items.forEach(item => {
      const name = item.querySelector('.grocery-item-name')?.textContent || '';
      const isChecked = item.classList.contains('checked');
      listText += `${isChecked ? '✓' : '☐'} ${name}\n`;
    });
    listText += '\n';
  });

  copyToClipboard(listText);
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Grocery list copied! Paste in Notes app.', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Grocery list copied! Paste in Notes app.', 'success');
  } catch (e) {
    showToast('Could not copy. Please try again.', 'error');
  }
  document.body.removeChild(textarea);
}

// ============================================
// Recipe Modal
// ============================================
function showRecipe(mealId) {
  let meal = null;
  let mealCategory = null;
  for (const category of ['breakfast', 'lunch', 'dinner', 'snacks']) {
    const found = MealDatabase[category].find(m => m.id === mealId);
    if (found) {
      meal = found;
      mealCategory = category;
      break;
    }
  }

  if (!meal || !meal.recipe) return;

  // Get storage tips for this meal
  const storageTips = StorageTips.getTips(meal, mealCategory);

  const modal = document.createElement('div');
  modal.className = 'recipe-modal';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="recipe-modal-content">
      <div class="recipe-modal-header">
        <h2>${meal.name}</h2>
        <button class="recipe-modal-close" onclick="this.closest('.recipe-modal').remove()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="recipe-modal-body">
        <p style="color: var(--gray-600); margin-bottom: var(--space-4);">${meal.description}</p>
        ${AppState.showCalories ? `<p style="color: var(--primary-600); font-weight: 500; margin-bottom: var(--space-6);">~${meal.calories} calories</p>` : ''}

        <div class="recipe-section">
          <h4>Ingredients</h4>
          <ul>
            ${meal.recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>

        <div class="recipe-section">
          <h4>Instructions</h4>
          <ol>
            ${meal.recipe.instructions.map(i => `<li>${i}</li>`).join('')}
          </ol>
        </div>

        <div class="recipe-section storage-tips-section">
          <h4>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="display: inline; vertical-align: text-bottom; margin-right: 6px;">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M12 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"/>
              <path d="M18 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/>
            </svg>
            Storage & Reheating Tips
          </h4>
          <div class="storage-tips-grid">
            <div class="storage-tip-item">
              <span class="storage-tip-label">How to Store</span>
              <span class="storage-tip-text">${storageTips.storage}</span>
            </div>
            <div class="storage-tip-item">
              <span class="storage-tip-label">Keeps For</span>
              <span class="storage-tip-text">${storageTips.duration}</span>
            </div>
            <div class="storage-tip-item">
              <span class="storage-tip-label">Reheating</span>
              <span class="storage-tip-text">${storageTips.reheating}</span>
            </div>
            ${storageTips.freezing ? `
            <div class="storage-tip-item">
              <span class="storage-tip-label">Freezing</span>
              <span class="storage-tip-text">${storageTips.freezing}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="safety-banner" style="margin-top: var(--space-4);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
          <p style="font-size: 0.75rem;">These are general recipes. Adjust according to any dietary restrictions or allergies. Consult a dietitian for personalized nutrition advice.</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// ============================================
// Custom Meal Input
// ============================================

// Calorie lookup per common ingredient (per unit as typically listed)
const ingredientCalories = {
  // Proteins (per oz)
  'chicken breast': 31, 'chicken': 31, 'turkey': 29, 'salmon': 52, 'steak': 55, 'beef': 55,
  'sirloin': 55, 'eggs': 70, 'egg': 70, 'tofu': 20, 'shrimp': 24, 'tuna': 31, 'pork': 46,
  'falafel': 60, 'chickpeas': 45, 'lentils': 40, 'chickpea': 45, 'lentil': 40,
  // Grains (per cup cooked)
  'rice': 205, 'brown rice': 215, 'basmati rice': 210, 'quinoa': 222, 'oats': 150, 'oatmeal': 150,
  'pasta': 220, 'bread': 80, 'wrap': 120, 'pita': 165, 'couscous': 176,
  // Produce (per cup or per item)
  'spinach': 7, 'broccoli': 55, 'carrot': 25, 'onion': 44, 'garlic': 5, 'tomato': 22,
  'sweet potato': 103, 'potato': 110, 'avocado': 240, 'banana': 105, 'apple': 95,
  'berries': 85, 'mixed vegetables': 80, 'vegetables': 80, 'lettuce': 5, 'greens': 10,
  'cucumber': 16, 'cherry tomato': 25, 'mushroom': 15, 'bell pepper': 30, 'corn': 125,
  'celery': 6, 'zucchini': 20, 'kale': 33, 'asparagus': 27, 'lemon': 15,
  // Dairy (per serving)
  'yogurt': 100, 'greek yogurt': 130, 'milk': 103, 'cheese': 110, 'butter': 100, 'cream': 50,
  'plant milk': 40,
  // Fats/Oils (per tbsp)
  'olive oil': 120, 'sesame oil': 120, 'coconut oil': 120, 'oil': 120,
  // Nuts/Seeds (per 1/4 cup)
  'almonds': 170, 'walnuts': 185, 'cashews': 155, 'mixed nuts': 170, 'peanuts': 160,
  'almond butter': 98, 'peanut butter': 94, 'seeds': 150, 'mixed seeds': 150,
  // Pantry
  'hummus': 50, 'tahini': 89, 'honey': 64, 'soy sauce': 8, 'coconut milk': 120,
  'vegetable broth': 15, 'curry paste': 30, 'granola': 200
};

function openCustomMealModal(mealType) {
  const modal = document.getElementById('custom-meal-modal');
  if (modal) {
    modal.style.display = 'flex';
    const typeSelect = document.getElementById('custom-meal-type');
    if (typeSelect) typeSelect.value = mealType || 'lunch';

    // Reset form
    const nameEl = document.getElementById('custom-meal-name');
    const ingEl = document.getElementById('custom-meal-ingredients');
    const instEl = document.getElementById('custom-meal-instructions');
    const preview = document.getElementById('custom-meal-calorie-preview');
    if (nameEl) nameEl.value = '';
    if (ingEl) ingEl.value = '';
    if (instEl) instEl.value = '';
    if (preview) preview.style.display = 'none';
  }
}

function closeCustomMealModal() {
  const modal = document.getElementById('custom-meal-modal');
  if (modal) modal.style.display = 'none';
}

function calculateCustomMealCalories() {
  const ingredientsText = document.getElementById('custom-meal-ingredients')?.value || '';
  if (!ingredientsText.trim()) {
    showToast('Please enter at least one ingredient.', 'error');
    return 0;
  }

  const lines = ingredientsText.split('\n').filter(l => l.trim());
  let totalCalories = 0;

  lines.forEach(line => {
    const parsed = parseIngredient(line);
    const itemLower = parsed.item.toLowerCase().trim();

    // Try to find a calorie match
    let caloriesPerUnit = 0;
    let matched = false;

    for (const [food, cal] of Object.entries(ingredientCalories)) {
      if (itemLower.includes(food) || food.includes(itemLower)) {
        caloriesPerUnit = cal;
        matched = true;
        break;
      }
    }

    if (matched) {
      let multiplier = parsed.quantity || 1;

      // Adjust for units
      const unit = parsed.unit.toLowerCase();
      if (['cup', 'cups'].includes(unit)) {
        // Most grain/veggie values are per cup already
        totalCalories += caloriesPerUnit * multiplier;
      } else if (['tbsp', 'tablespoon', 'tablespoons'].includes(unit)) {
        // Oil/sauce per tbsp
        totalCalories += caloriesPerUnit * multiplier;
      } else if (['tsp', 'teaspoon', 'teaspoons'].includes(unit)) {
        totalCalories += (caloriesPerUnit / 3) * multiplier;
      } else if (['oz', 'ounce', 'ounces'].includes(unit)) {
        totalCalories += caloriesPerUnit * multiplier;
      } else if (['lb', 'lbs', 'pound', 'pounds'].includes(unit)) {
        totalCalories += caloriesPerUnit * 16 * multiplier; // 16 oz per lb
      } else if (['clove', 'cloves'].includes(unit)) {
        totalCalories += 5 * multiplier; // ~5 cal per clove
      } else if (['can', 'cans'].includes(unit)) {
        totalCalories += caloriesPerUnit * 3 * multiplier; // ~3 servings per can
      } else {
        // Default: treat as one serving/item
        totalCalories += caloriesPerUnit * multiplier;
      }
    } else {
      // Unknown ingredient: estimate ~50 calories per ingredient line
      totalCalories += 50;
    }
  });

  totalCalories = Math.round(totalCalories);

  const preview = document.getElementById('custom-meal-calorie-preview');
  const valueEl = document.getElementById('custom-meal-calories-value');
  if (preview) preview.style.display = 'block';
  if (valueEl) valueEl.textContent = `~${totalCalories} cal`;

  return totalCalories;
}

function saveCustomMeal() {
  const name = document.getElementById('custom-meal-name')?.value?.trim();
  const mealType = document.getElementById('custom-meal-type')?.value || 'lunch';
  const ingredientsText = document.getElementById('custom-meal-ingredients')?.value || '';
  const instructionsText = document.getElementById('custom-meal-instructions')?.value || '';
  const servings = parseInt(document.getElementById('custom-meal-servings')?.value) || 1;
  const replaceDays = parseInt(document.getElementById('custom-meal-days')?.value) || 1;

  if (!name) {
    showToast('Please enter a meal name.', 'error');
    return;
  }
  if (!ingredientsText.trim()) {
    showToast('Please enter at least one ingredient.', 'error');
    return;
  }

  const calories = calculateCustomMealCalories();
  const ingredients = ingredientsText.split('\n').filter(l => l.trim());
  const instructions = instructionsText ? instructionsText.split('\n').filter(l => l.trim()) : ['Prepare as desired'];

  // Create the custom meal object
  const customMeal = {
    id: 'custom-' + Date.now(),
    name: name,
    description: `Custom meal: ${name}`,
    calories: calories,
    servings: servings,
    prepTime: 'Varies',
    tags: [],
    isCustom: true,
    recipe: {
      ingredients: ingredients,
      instructions: instructions
    }
  };

  // Add to MealDatabase so it can be found by showRecipe
  const dbType = mealType === 'snack' ? 'snacks' : mealType;
  if (!MealDatabase[dbType]) MealDatabase[dbType] = [];
  MealDatabase[dbType].push(customMeal);

  // Replace planned meals for the specified days
  const mealPlanKey = dbType;
  if (AppState.mealPlan && AppState.mealPlan.meals[mealPlanKey]) {
    const dayOffset = getCurrentDayOffset();
    for (let d = 0; d < replaceDays; d++) {
      const targetDay = (dayOffset + d) % 7;
      // Find and replace the meal for this day
      const plannedMeals = AppState.mealPlan.meals[mealPlanKey];
      if (plannedMeals[targetDay]) {
        plannedMeals[targetDay].mealId = customMeal.id;
      }
    }
  }

  // Mark meal as eaten for today
  if (!AppState.mealsEatenToday.includes(mealType)) {
    AppState.mealsEatenToday.push(mealType);
  }

  saveState();
  closeCustomMealModal();
  updateNutritionPage();
  updateMealTrackingHeader();
  showToast(`"${name}" saved! Calories adjusted to ~${calories} cal.`, 'success');
}

function initHydrationTracker() {
  const container = document.getElementById('hydration-glasses');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const glass = document.createElement('div');
    glass.className = `hydration-glass${i < AppState.hydrationCount ? ' filled' : ''}`;
    glass.onclick = () => toggleHydration(i + 1);
    glass.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${i < AppState.hydrationCount ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
      </svg>
    `;
    container.appendChild(glass);
  }

  const countEl = document.getElementById('water-count');
  if (countEl) countEl.textContent = AppState.hydrationCount;
}

function toggleHydration(count) {
  AppState.hydrationCount = AppState.hydrationCount === count ? count - 1 : count;
  initHydrationTracker();
}

// ============================================
// Medication Page Functions
// ============================================
function updateMedicationPage() {
  const checklist = document.getElementById('medication-checklist');
  const noMedsMsg = document.getElementById('no-medications-message');

  const clinicianName = AppState.userData.clinicianName || 'Your Clinician';
  const medClinicianEl = document.getElementById('med-clinician-name');
  if (medClinicianEl) medClinicianEl.textContent = clinicianName;

  if (AppState.userData.clinicianPhone) {
    const callBtn = document.getElementById('med-clinician-call');
    if (callBtn) callBtn.href = `tel:${AppState.userData.clinicianPhone}`;
  }

  const pharmacyName = AppState.userData.pharmacyName || 'Your Local Pharmacy';
  const pharmacyPhone = AppState.userData.pharmacyPhone || '(555) 987-6543';

  const pharmacyNameEl = document.getElementById('pharmacy-name-display');
  const pharmacyPhoneEl = document.getElementById('pharmacy-phone-display');
  const pharmacyCallBtn = document.getElementById('pharmacy-call-btn');

  if (pharmacyNameEl) pharmacyNameEl.textContent = pharmacyName;
  if (pharmacyPhoneEl) pharmacyPhoneEl.textContent = pharmacyPhone;
  if (pharmacyCallBtn && AppState.userData.pharmacyPhone) {
    pharmacyCallBtn.href = `tel:${AppState.userData.pharmacyPhone}`;
  }

  if (!AppState.userData.medications || AppState.userData.medications.trim() === '') {
    if (checklist) checklist.style.display = 'none';
    if (noMedsMsg) noMedsMsg.style.display = 'block';
    return;
  }

  if (checklist) checklist.style.display = 'block';
  if (noMedsMsg) noMedsMsg.style.display = 'none';

  const medLines = AppState.userData.medications.split('\n').filter(m => m.trim());

  if (checklist) {
    checklist.innerHTML = medLines.map((med, index) => {
      const taskId = `med-${index}`;
      const isCompleted = AppState.completedTasks.medication.includes(taskId);
      const time = index === 0 ? '08:00' : '20:00';

      return `
        <li class="checklist-item${isCompleted ? ' checked' : ''}" data-task="${taskId}">
          <div class="checklist-checkbox${isCompleted ? ' checked' : ''}"
               role="checkbox"
               aria-checked="${isCompleted}"
               tabindex="0"
               onclick="toggleMedTask(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display: ${isCompleted ? 'block' : 'none'};">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">${med.trim()}</div>
            <div class="checklist-meta">Take as prescribed by your clinician</div>
            <div class="checklist-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              ${formatTime(time)}
            </div>
          </div>
        </li>
      `;
    }).join('');
  }
}

function toggleMedTask(checkbox) {
  const isChecked = checkbox.classList.toggle('checked');
  const checkmark = checkbox.querySelector('svg');
  const listItem = checkbox.closest('.checklist-item');
  const taskId = listItem?.dataset.task;

  checkbox.setAttribute('aria-checked', isChecked);
  if (checkmark) checkmark.style.display = isChecked ? 'block' : 'none';
  if (listItem) listItem.classList.toggle('checked', isChecked);

  if (taskId) {
    if (isChecked && !AppState.completedTasks.medication.includes(taskId)) {
      AppState.completedTasks.medication.push(taskId);
    } else if (!isChecked) {
      AppState.completedTasks.medication = AppState.completedTasks.medication.filter(t => t !== taskId);
    }
  }
}

// ============================================
// Fitness Page Functions
// ============================================

// Individual exercise database with proper instructions
const ExerciseInstructions = {
  // Gym exercises
  'lat pulldown': {
    name: 'Lat Pulldown',
    sets: 3, reps: 12,
    instructions: [
      'Sit at the lat pulldown machine with thighs secured under pads',
      'Grip the bar wider than shoulder-width, palms facing away',
      'Pull the bar down to your upper chest, squeezing shoulder blades',
      'Slowly return to starting position with controlled movement',
      'Keep core engaged throughout the movement'
    ]
  },
  'leg press': {
    name: 'Leg Press',
    sets: 3, reps: 12,
    instructions: [
      'Sit in the leg press machine with back flat against the pad',
      'Place feet shoulder-width apart on the platform',
      'Release the safety and lower the weight by bending knees to 90 degrees',
      'Push through your heels to extend legs without locking knees',
      'Keep knees aligned with toes throughout the movement'
    ]
  },
  'chest press machine': {
    name: 'Chest Press Machine',
    sets: 3, reps: 12,
    instructions: [
      'Adjust seat so handles are at chest level',
      'Sit with back flat against pad, feet flat on floor',
      'Grip handles and push forward until arms are extended (don\'t lock elbows)',
      'Slowly return to starting position, feeling a stretch in the chest',
      'Exhale on push, inhale on return'
    ]
  },
  'seated rows': {
    name: 'Seated Cable Rows',
    sets: 3, reps: 12,
    instructions: [
      'Sit at the cable row machine with feet on platforms, knees slightly bent',
      'Grip the handle with both hands, arms extended',
      'Pull the handle toward your torso, squeezing shoulder blades together',
      'Keep back straight and avoid leaning back excessively',
      'Slowly extend arms back to starting position'
    ]
  },
  'leg curls': {
    name: 'Leg Curls',
    sets: 3, reps: 12,
    instructions: [
      'Lie face down on the leg curl machine',
      'Position ankle pad just above your heels',
      'Curl your legs up toward your glutes, squeezing hamstrings',
      'Lower slowly back to starting position',
      'Avoid lifting hips off the pad'
    ]
  },
  'leg extensions': {
    name: 'Leg Extensions',
    sets: 3, reps: 12,
    instructions: [
      'Sit on the machine with back against the pad',
      'Hook ankles under the padded bar',
      'Extend legs until straight, squeezing quadriceps at the top',
      'Lower slowly back to starting position',
      'Avoid using momentum - use controlled movements'
    ]
  },
  'calf raises': {
    name: 'Calf Raises',
    sets: 3, reps: 15,
    instructions: [
      'Stand on the edge of a step or calf raise platform',
      'Let your heels drop below the level of the step',
      'Rise up onto your toes as high as possible',
      'Hold briefly at the top, then lower slowly',
      'Can add weight by holding dumbbells'
    ]
  },
  // Home/bodyweight exercises
  'squats': {
    name: 'Bodyweight Squats',
    sets: 3, reps: 15,
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly out',
      'Keep chest up and core engaged',
      'Lower by pushing hips back and bending knees',
      'Go down until thighs are parallel to floor (or as low as comfortable)',
      'Push through heels to stand back up'
    ]
  },
  'lunges': {
    name: 'Lunges',
    sets: 3, reps: 10,
    instructions: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg, lowering your hips',
      'Both knees should bend to about 90 degrees',
      'Push through front heel to return to standing',
      'Alternate legs or complete all reps on one side first'
    ]
  },
  'glute bridges': {
    name: 'Glute Bridges',
    sets: 3, reps: 15,
    instructions: [
      'Lie on your back with knees bent, feet flat on floor',
      'Arms at sides, palms down for stability',
      'Push through heels to lift hips toward ceiling',
      'Squeeze glutes at the top, hold for 1-2 seconds',
      'Lower slowly back down'
    ]
  },
  'wall push-ups': {
    name: 'Wall Push-ups',
    sets: 3, reps: 10,
    instructions: [
      'Stand arm\'s length from a wall',
      'Place palms flat on wall at shoulder height and width',
      'Bend elbows to bring chest toward wall',
      'Push back to starting position',
      'Keep body in a straight line throughout'
    ]
  },
  'push-ups': {
    name: 'Push-ups',
    sets: 3, reps: 10,
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Keep body in a straight line from head to heels',
      'Lower chest toward floor by bending elbows',
      'Push back up to starting position',
      'Modify by doing from knees if needed'
    ]
  },
  'wall sits': {
    name: 'Wall Sits',
    sets: 3, reps: 1, duration: '30 seconds',
    instructions: [
      'Stand with back against a wall',
      'Slide down until thighs are parallel to floor',
      'Keep knees at 90 degrees, directly above ankles',
      'Hold this position for the duration',
      'Press back flat against wall throughout'
    ]
  },
  // Outdoor exercises
  'walking lunges': {
    name: 'Walking Lunges',
    sets: 3, reps: 10,
    instructions: [
      'Stand tall and take a large step forward',
      'Lower into a lunge position',
      'Push off back foot and step forward into next lunge',
      'Continue alternating legs while walking forward',
      'Keep torso upright throughout'
    ]
  },
  'bench step-ups': {
    name: 'Bench Step-ups',
    sets: 3, reps: 12,
    instructions: [
      'Stand facing a sturdy bench or step',
      'Step up with one foot, pressing through that heel',
      'Bring the other foot up to stand on the bench',
      'Step down leading with the same leg',
      'Alternate leading leg each set'
    ]
  },
  'bench dips': {
    name: 'Bench Dips',
    sets: 3, reps: 10,
    instructions: [
      'Sit on bench edge, hands gripping the edge beside hips',
      'Slide hips off bench, legs extended in front',
      'Lower body by bending elbows to 90 degrees',
      'Push back up to starting position',
      'Keep back close to the bench'
    ]
  },
  'incline push-ups': {
    name: 'Incline Push-ups',
    sets: 3, reps: 10,
    instructions: [
      'Place hands on a bench, shoulder-width apart',
      'Walk feet back so body forms a straight line',
      'Lower chest toward the bench',
      'Push back up to starting position',
      'Easier variation of regular push-ups'
    ]
  },
  // Standing exercises
  'standing calf raises': {
    name: 'Standing Calf Raises',
    sets: 3, reps: 20,
    instructions: [
      'Stand near a wall for balance if needed',
      'Rise up onto your toes as high as possible',
      'Hold briefly at the top',
      'Lower heels back to the floor slowly',
      'Keep knees straight but not locked'
    ]
  }
};

// Expand compound exercises (like "Gym Strength Circuit") into individual exercises
function expandCompoundExercises(exercises) {
  const expanded = [];

  exercises.forEach(exercise => {
    const name = exercise.name.toLowerCase();

    // Check if this is a compound gym circuit
    if (name.includes('gym strength circuit') || name.includes('lower body gym workout')) {
      // Parse the description to extract individual exercises
      const desc = exercise.description || '';
      const exerciseMatches = desc.match(/([A-Za-z\s]+):\s*(\d+)x(\d+)/g) || [];

      exerciseMatches.forEach((match, idx) => {
        const parts = match.match(/([A-Za-z\s]+):\s*(\d+)x(\d+)/);
        if (parts) {
          const exName = parts[1].trim().toLowerCase();
          const sets = parseInt(parts[2]);
          const reps = parseInt(parts[3]);

          const instructions = ExerciseInstructions[exName];
          expanded.push({
            ...exercise,
            name: instructions?.name || parts[1].trim(),
            sets: sets,
            reps: reps,
            duration: `${sets}x${reps}`,
            description: instructions ? instructions.instructions.join('. ') + '.' : `Perform ${sets} sets of ${reps} reps with controlled form.`,
            parentExercise: exercise.name,
            subIndex: idx,
            instructions: instructions?.instructions || []
          });
        }
      });

      // If no matches found, add the original
      if (exerciseMatches.length === 0) {
        expanded.push(exercise);
      }
    }
    // Check for home bodyweight workout
    else if (name.includes('home bodyweight workout') || name.includes('home lower body workout')) {
      const desc = exercise.description || '';
      const exerciseMatches = desc.match(/([A-Za-z\s]+):\s*(\d+)x(\d+)/g) || [];

      exerciseMatches.forEach((match, idx) => {
        const parts = match.match(/([A-Za-z\s]+):\s*(\d+)x(\d+)/);
        if (parts) {
          const exName = parts[1].trim().toLowerCase();
          const sets = parseInt(parts[2]);
          const reps = parseInt(parts[3]);

          const instructions = ExerciseInstructions[exName];
          expanded.push({
            ...exercise,
            name: instructions?.name || parts[1].trim(),
            sets: sets,
            reps: reps,
            duration: `${sets}x${reps}`,
            description: instructions ? instructions.instructions.join('. ') + '.' : `Perform ${sets} sets of ${reps} reps with controlled form.`,
            parentExercise: exercise.name,
            subIndex: idx,
            instructions: instructions?.instructions || []
          });
        }
      });

      if (exerciseMatches.length === 0) {
        expanded.push(exercise);
      }
    }
    // Check for outdoor bodyweight circuit
    else if (name.includes('outdoor bodyweight circuit') || name.includes('outdoor lower body workout')) {
      const desc = exercise.description || '';
      const exerciseMatches = desc.match(/([A-Za-z\s-]+):\s*(\d+)x(\d+)/g) || [];

      exerciseMatches.forEach((match, idx) => {
        const parts = match.match(/([A-Za-z\s-]+):\s*(\d+)x(\d+)/);
        if (parts) {
          const exName = parts[1].trim().toLowerCase().replace(/-/g, ' ');
          const sets = parseInt(parts[2]);
          const reps = parseInt(parts[3]);

          const instructions = ExerciseInstructions[exName];
          expanded.push({
            ...exercise,
            name: instructions?.name || parts[1].trim(),
            sets: sets,
            reps: reps,
            duration: `${sets}x${reps}`,
            description: instructions ? instructions.instructions.join('. ') + '.' : `Perform ${sets} sets of ${reps} reps with controlled form.`,
            parentExercise: exercise.name,
            subIndex: idx,
            instructions: instructions?.instructions || []
          });
        }
      });

      if (exerciseMatches.length === 0) {
        expanded.push(exercise);
      }
    }
    // Not a compound exercise - keep as is but add instructions if available
    else {
      const exNameLower = exercise.name.toLowerCase();
      const instructions = ExerciseInstructions[exNameLower];
      if (instructions) {
        expanded.push({
          ...exercise,
          instructions: instructions.instructions
        });
      } else {
        expanded.push(exercise);
      }
    }
  });

  return expanded;
}

function updatePTPage() {
  // Use combined exercises from all conditions for Premium+ users
  const combinedExercises = getCombinedExercises();
  // Break down compound exercises into individual checkable items
  const expandedExercises = expandCompoundExercises(combinedExercises);
  const primaryCondition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
  const allConditions = getAllUserConditions();

  // Check if viewing a family member's plan
  const isViewingFamilyMember = typeof activeProfileId !== 'undefined' && activeProfileId !== 'self';
  let displayName = AppState.userData.firstName || 'Your';
  let familyNote = '';

  if (isViewingFamilyMember && typeof familyProfiles !== 'undefined' && familyProfiles[activeProfileId]) {
    const familyMember = familyProfiles[activeProfileId];
    displayName = familyMember.name + "'s";
    familyNote = `<span class="family-plan-badge">Family Plan Member</span>`;
  }

  // Update page title for family member
  const pageTitleEl = document.querySelector('#page-physicaltherapy h1');
  if (pageTitleEl) {
    if (isViewingFamilyMember) {
      pageTitleEl.innerHTML = `${displayName} Fitness Plan ${familyNote}`;
    } else {
      pageTitleEl.textContent = 'Fitness Plan';
    }
  }

  const subtitleEl = document.getElementById('pt-subtitle');
  if (subtitleEl) {
    const cappedNote = combinedExercises.totalDuration ? ` (${combinedExercises.totalDuration} min daily max)` : '';
    if (allConditions.length > 1) {
      subtitleEl.textContent = `Exercises for ${allConditions.length} conditions - ${combinedExercises.length} exercises${cappedNote}.`;
    } else {
      subtitleEl.textContent = `Exercises recommended for ${primaryCondition.name.toLowerCase()} recovery${cappedNote}.`;
    }
  }

  const durationEl = document.getElementById('pt-duration');
  if (durationEl) {
    // Use actual capped duration
    const totalDuration = combinedExercises.totalDuration ||
      combinedExercises.reduce((sum, ex) => sum + (ex.durationMinutes || 10), 0);
    // Cap display at MAX_PT_MINUTES_PER_DAY
    const cappedDuration = Math.min(totalDuration, MAX_PT_MINUTES_PER_DAY);
    // Round to nearest 15 minutes for cleaner display
    let roundedDuration = Math.round(cappedDuration / 15) * 15;
    // Minimum 15 minutes if there are exercises
    roundedDuration = Math.max(15, roundedDuration);
    durationEl.textContent = `${roundedDuration}`;
  }

  const weekEl = document.getElementById('pt-week');
  if (weekEl && primaryCondition.recoveryWeeks) {
    const daysSinceDiagnosis = Math.floor((new Date() - new Date(AppState.userData.diagnosisDate)) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.max(1, Math.ceil(daysSinceDiagnosis / 7));
    weekEl.textContent = `Week ${currentWeek}`;
  } else if (weekEl) {
    weekEl.textContent = 'Ongoing';
  }

  const checklist = document.getElementById('pt-checklist');
  if (checklist && expandedExercises.length > 0) {
    checklist.innerHTML = expandedExercises.map((exercise, index) => {
      // Use unique task ID that includes parent exercise if from compound
      const taskId = exercise.parentExercise
        ? `pt-${exercise.parentExercise.replace(/\s+/g, '-').toLowerCase()}-${exercise.subIndex}`
        : `pt-${index}`;
      const isCompleted = AppState.completedTasks.pt.includes(taskId);
      const exerciseImage = getExerciseImage(exercise.name);

      // Build exercise details string (sets, reps, duration)
      const exerciseDetails = [];
      if (exercise.sets && exercise.sets > 1) exerciseDetails.push(`${exercise.sets} sets`);
      if (exercise.reps && exercise.reps > 1) exerciseDetails.push(`${exercise.reps} reps`);
      if (exercise.duration && !exercise.duration.includes('x')) exerciseDetails.push(exercise.duration);
      if (exercise.frequency) exerciseDetails.push(`${exercise.frequency}x/week`);
      const detailsText = exerciseDetails.length > 0 ? exerciseDetails.join(' • ') : '';

      // Build step-by-step instructions if available
      let instructionsHTML = '';
      if (exercise.instructions && exercise.instructions.length > 0) {
        instructionsHTML = `
          <div class="exercise-instructions">
            <ol class="exercise-steps">
              ${exercise.instructions.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        `;
      }

      return `
        <li class="checklist-item${isCompleted ? ' checked' : ''}" data-task="${taskId}">
          <div class="checklist-checkbox${isCompleted ? ' checked' : ''}"
               role="checkbox"
               aria-checked="${isCompleted}"
               tabindex="0"
               onclick="togglePTTask(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display: ${isCompleted ? 'block' : 'none'};">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">
              ${exercise.name}
              ${exercise.parentExercise ? `<span class="exercise-circuit-tag">${exercise.parentExercise}</span>` : ''}
              ${allConditions.length > 1 && !exercise.parentExercise ? `<span class="exercise-condition-tag">${exercise.conditionName}</span>` : ''}
            </div>
            ${detailsText ? `<div class="checklist-exercise-specs">${detailsText}</div>` : ''}
            ${instructionsHTML}
            ${exerciseImage ? `
              <div class="exercise-how-to">
                <button class="exercise-how-to-btn" onclick="toggleExerciseImage(this, '${exercise.name}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  Watch video demo
                </button>
                <div class="exercise-image-container" style="display: none;">
                  ${exerciseImage}
                </div>
              </div>
            ` : ''}
            <div class="checklist-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              ${formatTime(exercise.time)} - ${exercise.durationMinutes ? exercise.durationMinutes + ' min' : exercise.duration || '5 min'}
            </div>
          </div>
        </li>
      `;
    }).join('');

    updatePTStats();
  }

  // Load PT instructions image if available
  if (AppState.userData.ptInstructionsImage) {
    updateImagePreview('pt-instructions', AppState.userData.ptInstructionsImage);
  }
}

// Toggle exercise how-to image visibility
function toggleExerciseImage(button, exerciseName) {
  const container = button.nextElementSibling;
  if (container) {
    const isVisible = container.style.display !== 'none';
    container.style.display = isVisible ? 'none' : 'block';
    button.innerHTML = isVisible ? `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      How to do this exercise
    ` : `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
      Hide instructions
    `;
  }
}

// Get exercise instructional image/diagram
// Uses real images and YouTube videos from exercise-resources.js
function getExerciseImage(exerciseName) {
  // Use the new exercise resources with real images and videos
  if (typeof generateExerciseHTML === 'function') {
    return generateExerciseHTML(exerciseName);
  }

  // Fallback if exercise-resources.js not loaded
  return `
    <div class="exercise-fallback">
      <p>Exercise instructions for: <strong>${exerciseName}</strong></p>
      <button class="btn btn-outline btn-sm" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' physical therapy exercise')}', '_blank')">
        Search for instructions
      </button>
    </div>
  `;
}

// SVG generators for different exercise types
function generateStretchingSVG(type, instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person stretching -->
        <circle cx="100" cy="30" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="45" x2="100" y2="90" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Arms reaching up -->
        <line x1="100" y1="55" x2="70" y2="25" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="55" x2="130" y2="25" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Legs -->
        <line x1="100" y1="90" x2="80" y2="130" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="90" x2="120" y2="130" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Motion lines -->
        <path d="M60 20 Q55 15 60 10" stroke="#4ECDC4" stroke-width="2" fill="none" stroke-dasharray="3,2"/>
        <path d="M140 20 Q145 15 140 10" stroke="#4ECDC4" stroke-width="2" fill="none" stroke-dasharray="3,2"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateWalkingSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person walking -->
        <circle cx="100" cy="30" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="45" x2="100" y2="85" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Arms swinging -->
        <line x1="100" y1="55" x2="75" y2="70" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="55" x2="125" y2="65" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Legs walking -->
        <line x1="100" y1="85" x2="75" y2="130" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="85" x2="125" y2="125" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Ground -->
        <line x1="40" y1="135" x2="160" y2="135" stroke="#E0E0E0" stroke-width="2"/>
        <!-- Motion arrows -->
        <path d="M150 80 L165 80 L160 75 M165 80 L160 85" stroke="#4ECDC4" stroke-width="2" fill="none"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateCardioSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Heart rate symbol -->
        <path d="M50 60 L70 60 L80 40 L90 80 L100 50 L110 60 L150 60" stroke="#FF6B6B" stroke-width="3" fill="none"/>
        <!-- Person active -->
        <circle cx="100" cy="100" r="12" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="112" x2="100" y2="135" stroke="#C4A484" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="118" x2="85" y2="128" stroke="#C4A484" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="118" x2="115" y2="128" stroke="#C4A484" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateStrengthSVG(type, instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person in squat position -->
        <circle cx="100" cy="45" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="60" x2="100" y2="90" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Arms forward -->
        <line x1="100" y1="70" x2="70" y2="75" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="70" x2="130" y2="75" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Bent legs (squat) -->
        <path d="M100 90 Q85 105 75 130" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100 90 Q115 105 125 130" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Up/down arrow -->
        <path d="M160 60 L160 120 M155 70 L160 60 L165 70 M155 110 L160 120 L165 110" stroke="#4ECDC4" stroke-width="2" fill="none"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateROMSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Joint circles -->
        <circle cx="100" cy="75" r="25" fill="none" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="5,3"/>
        <!-- Arm movement -->
        <circle cx="100" cy="75" r="8" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="75" x2="125" y2="60" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="75" x2="125" y2="90" stroke="#C4A484" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
        <!-- Rotation arrow -->
        <path d="M130 50 Q145 75 130 100" stroke="#4ECDC4" stroke-width="2" fill="none"/>
        <path d="M125 95 L130 100 L135 95" stroke="#4ECDC4" stroke-width="2" fill="none"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateShoulderSVG(type, instruction) {
  if (type === 'pendulum') {
    return `
      <div class="exercise-illustration">
        <svg viewBox="0 0 200 150" class="exercise-svg">
          <!-- Person leaning -->
          <circle cx="80" cy="40" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
          <line x1="80" y1="55" x2="95" y2="100" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
          <!-- Supporting arm on surface -->
          <line x1="80" y1="70" x2="55" y2="90" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
          <rect x="40" y="85" width="30" height="40" fill="#E0E0E0" rx="3"/>
          <!-- Hanging arm with swing arc -->
          <line x1="90" y1="65" x2="110" y2="120" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
          <path d="M95 130 Q110 140 125 130" stroke="#4ECDC4" stroke-width="2" fill="none" stroke-dasharray="5,3"/>
          <!-- Circular motion indicator -->
          <circle cx="110" cy="120" r="20" fill="none" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="5,3"/>
        </svg>
        <p class="exercise-instruction">${instruction}</p>
      </div>
    `;
  }
  return generateGenericExerciseSVG('Shoulder Exercise');
}

function generateBreathingSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Lungs outline -->
        <ellipse cx="80" cy="75" rx="30" ry="40" fill="none" stroke="#4ECDC4" stroke-width="2"/>
        <ellipse cx="120" cy="75" rx="30" ry="40" fill="none" stroke="#4ECDC4" stroke-width="2"/>
        <!-- Breath arrows -->
        <path d="M100 20 L100 40" stroke="#4ECDC4" stroke-width="3" fill="none"/>
        <path d="M95 35 L100 40 L105 35" stroke="#4ECDC4" stroke-width="2" fill="none"/>
        <!-- Expanding indicator -->
        <path d="M45 75 L35 75" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="3,2"/>
        <path d="M155 75 L165 75" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="3,2"/>
        <text x="100" y="140" text-anchor="middle" font-size="12" fill="#666">Inhale... Hold... Exhale</text>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateCoreSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person lying down -->
        <circle cx="50" cy="100" r="12" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="62" y1="100" x2="130" y2="100" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Bent knees -->
        <path d="M130 100 Q140 80 150 100 Q160 120 170 100" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Core highlight -->
        <ellipse cx="95" cy="100" rx="20" ry="10" fill="none" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="5,3"/>
        <!-- Engage arrow -->
        <path d="M95 120 L95 110" stroke="#4ECDC4" stroke-width="2"/>
        <path d="M90 115 L95 110 L100 115" stroke="#4ECDC4" stroke-width="2" fill="none"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateBalanceSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person on one leg -->
        <circle cx="100" cy="30" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="45" x2="100" y2="90" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Arms out for balance -->
        <line x1="100" y1="60" x2="65" y2="55" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="60" x2="135" y2="55" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Standing leg -->
        <line x1="100" y1="90" x2="100" y2="130" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Raised leg -->
        <line x1="100" y1="90" x2="130" y2="100" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Chair/support nearby -->
        <rect x="150" y="90" width="25" height="45" fill="none" stroke="#E0E0E0" stroke-width="2" rx="3"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateRelaxationSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Person in relaxed seated pose -->
        <circle cx="100" cy="50" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="65" x2="100" y2="100" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Relaxed arms on knees -->
        <path d="M100 75 Q80 85 70 100" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100 75 Q120 85 130 100" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Crossed legs -->
        <path d="M100 100 Q85 120 70 115" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100 100 Q115 120 130 115" stroke="#C4A484" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Peaceful waves -->
        <path d="M40 30 Q50 25 60 30 Q70 35 80 30" stroke="#4ECDC4" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M120 30 Q130 25 140 30 Q150 35 160 30" stroke="#4ECDC4" stroke-width="2" fill="none" opacity="0.5"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateWaterSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Water waves -->
        <path d="M20 80 Q40 70 60 80 Q80 90 100 80 Q120 70 140 80 Q160 90 180 80" stroke="#64B5F6" stroke-width="3" fill="none"/>
        <!-- Person in water -->
        <circle cx="100" cy="60" r="15" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="75" x2="100" y2="110" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Arms -->
        <line x1="100" y1="85" x2="75" y2="75" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="85" x2="125" y2="75" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Walking motion -->
        <path d="M100 110 L85 135" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <path d="M100 110 L115 130" stroke="#C4A484" stroke-width="4" stroke-linecap="round"/>
        <!-- Pool floor -->
        <line x1="30" y1="140" x2="170" y2="140" stroke="#90CAF9" stroke-width="2"/>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateHandSVG(instruction) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Open hand -->
        <g transform="translate(40, 30)">
          <ellipse cx="30" cy="60" rx="20" ry="25" fill="#F5D0C5" stroke="#C4A484" stroke-width="2"/>
          <rect x="20" y="10" width="8" height="35" rx="4" fill="#F5D0C5" stroke="#C4A484" stroke-width="1"/>
          <rect x="30" y="5" width="8" height="40" rx="4" fill="#F5D0C5" stroke="#C4A484" stroke-width="1"/>
          <rect x="40" y="8" width="8" height="38" rx="4" fill="#F5D0C5" stroke="#C4A484" stroke-width="1"/>
          <rect x="50" y="15" width="8" height="32" rx="4" fill="#F5D0C5" stroke="#C4A484" stroke-width="1"/>
          <rect x="5" y="35" width="25" height="8" rx="4" fill="#F5D0C5" stroke="#C4A484" stroke-width="1" transform="rotate(-30 5 35)"/>
        </g>
        <!-- Arrow -->
        <path d="M100 75 L120 75" stroke="#4ECDC4" stroke-width="3"/>
        <path d="M115 70 L120 75 L115 80" stroke="#4ECDC4" stroke-width="2" fill="none"/>
        <!-- Closed fist -->
        <g transform="translate(120, 40)">
          <ellipse cx="30" cy="45" rx="25" ry="30" fill="#F5D0C5" stroke="#C4A484" stroke-width="2"/>
          <ellipse cx="20" cy="25" rx="8" ry="12" fill="#F5D0C5" stroke="#C4A484" stroke-width="1"/>
        </g>
      </svg>
      <p class="exercise-instruction">${instruction}</p>
    </div>
  `;
}

function generateGenericExerciseSVG(exerciseName) {
  return `
    <div class="exercise-illustration">
      <svg viewBox="0 0 200 150" class="exercise-svg">
        <!-- Generic exercise figure -->
        <circle cx="100" cy="35" r="18" fill="#C4A484" stroke="#8B7355" stroke-width="2"/>
        <line x1="100" y1="53" x2="100" y2="95" stroke="#C4A484" stroke-width="5" stroke-linecap="round"/>
        <!-- Arms -->
        <line x1="100" y1="65" x2="70" y2="85" stroke="#C4A484" stroke-width="5" stroke-linecap="round"/>
        <line x1="100" y1="65" x2="130" y2="85" stroke="#C4A484" stroke-width="5" stroke-linecap="round"/>
        <!-- Legs -->
        <line x1="100" y1="95" x2="75" y2="135" stroke="#C4A484" stroke-width="5" stroke-linecap="round"/>
        <line x1="100" y1="95" x2="125" y2="135" stroke="#C4A484" stroke-width="5" stroke-linecap="round"/>
        <!-- Movement indicator -->
        <circle cx="100" cy="75" r="35" fill="none" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
      </svg>
      <p class="exercise-instruction">Follow the instructions for ${exerciseName}. Focus on proper form and controlled movements.</p>
    </div>
  `;
}

function togglePTTask(checkbox) {
  const isChecked = checkbox.classList.toggle('checked');
  const checkmark = checkbox.querySelector('svg');
  const listItem = checkbox.closest('.checklist-item');
  const taskId = listItem?.dataset.task;

  checkbox.setAttribute('aria-checked', isChecked);
  if (checkmark) checkmark.style.display = isChecked ? 'block' : 'none';
  if (listItem) listItem.classList.toggle('checked', isChecked);

  if (taskId) {
    if (isChecked && !AppState.completedTasks.pt.includes(taskId)) {
      AppState.completedTasks.pt.push(taskId);
    } else if (!isChecked) {
      AppState.completedTasks.pt = AppState.completedTasks.pt.filter(t => t !== taskId);
    }
    updatePTStats();
  }
}

function updatePTStats() {
  const combinedExercises = getCombinedExercises();
  const total = combinedExercises.length || 0;
  const completed = AppState.completedTasks.pt.length;

  const counterEl = document.getElementById('pt-completed');
  if (counterEl) counterEl.textContent = `${completed}/${total}`;
}

function savePTLog() {
  const notes = document.getElementById('pt-notes')?.value || '';
  const painLevel = AppState.ptPainLevel;

  console.log('PT Log saved:', { painLevel, notes, date: new Date().toISOString() });
  alert('Your progress log has been saved. Share this information with your physical therapist at your next appointment.');

  if (document.getElementById('pt-notes')) {
    document.getElementById('pt-notes').value = '';
  }
}

// ============================================
// Dashboard Task Toggle
// ============================================
function toggleTask(checkbox, event) {
  // Prevent the click from bubbling up to the category header
  if (event) {
    event.stopPropagation();
  }

  const isChecked = checkbox.classList.toggle('checked');
  const checkmark = checkbox.querySelector('svg');
  const listItem = checkbox.closest('.checklist-item');
  const taskId = listItem?.dataset.task;

  checkbox.setAttribute('aria-checked', isChecked);
  if (checkmark) checkmark.style.display = isChecked ? 'block' : 'none';
  if (listItem) listItem.classList.toggle('checked', isChecked);

  if (taskId) {
    if (isChecked && !AppState.completedTasks.home.includes(taskId)) {
      AppState.completedTasks.home.push(taskId);
    } else if (!isChecked) {
      AppState.completedTasks.home = AppState.completedTasks.home.filter(t => t !== taskId);
    }
    saveState();
    // Regenerate categories to update the completed count
    generateTaskCategories();
  }
}

// ============================================
// Intake Form Functions
// ============================================
function changeStep(direction) {
  const currentStep = AppState.intakeStep;
  const newStep = currentStep + direction;

  if (direction > 0 && !validateIntakeStep(currentStep)) {
    return;
  }

  if (newStep < 1 || newStep > AppState.totalIntakeSteps) {
    return;
  }

  saveStepData(currentStep);

  // Show Caribou mascot transition between sections
  if (direction > 0) {
    showSectionTransition(currentStep, newStep, () => {
      AppState.intakeStep = newStep;
      updateIntakeStepUI();
    });
  } else {
    // No transition when going back
    AppState.intakeStep = newStep;
    updateIntakeStepUI();
  }
}

// Caribou mascot transition messages for each section
// These messages describe what's COMING NEXT (the step we're going TO)
const sectionTransitionMessages = {
  2: { message: "Great start!", subtitle: "Now let's learn about your health habits..." },
  3: { message: "You're doing great!", subtitle: "Next up — exercise & physical activity..." },
  4: { message: "Keep it up!", subtitle: "Now for some nutrition questions..." },
  5: { message: "Almost there!", subtitle: "Last step — your medical information..." },
  6: { message: "All done!", subtitle: "Creating your personalized care plan..." }
};

function showSectionTransition(fromStep, toStep, callback) {
  const overlay = document.getElementById('section-transition-overlay');
  if (!overlay) {
    callback();
    return;
  }

  const messageEl = document.getElementById('section-transition-message');
  const subtitleEl = document.getElementById('section-transition-subtitle');
  const dots = overlay.querySelectorAll('.progress-dot');

  // Get the transition message for the step we're going TO
  const transitionData = sectionTransitionMessages[toStep] || { message: "Moving on!", subtitle: "Next section..." };

  if (messageEl) messageEl.textContent = transitionData.message;
  if (subtitleEl) subtitleEl.textContent = transitionData.subtitle;

  // Update progress dots
  dots.forEach((dot, index) => {
    const step = index + 1;
    dot.classList.remove('completed', 'active');
    if (step < toStep) {
      dot.classList.add('completed');
    } else if (step === toStep) {
      dot.classList.add('active');
    }
  });

  // Show the overlay
  overlay.style.display = 'flex';

  // Hide after delay and execute callback
  setTimeout(() => {
    overlay.style.display = 'none';
    callback();
  }, 1200);
}

// ============================================
// Diagnosis Typeahead Autocomplete
// ============================================

// Complete database of all supported conditions for typeahead search
const DiagnosisDatabase = [
  // Weight Management (Priority - shown first)
  { id: 'weight-loss', name: 'Weight Loss', category: 'Weight Management', keywords: ['lose weight', 'diet', 'slim', 'fat loss', 'calorie deficit'] },
  { id: 'weight-gain', name: 'Weight Gain / Muscle Building', category: 'Weight Management', keywords: ['gain weight', 'bulk', 'muscle', 'mass', 'strength'] },
  { id: 'obesity', name: 'Obesity Management', category: 'Weight Management', keywords: ['overweight', 'bmi', 'bariatric'] },

  // Sprains & Strains
  { id: 'knee-sprain', name: 'Knee Sprain / ACL / MCL Injury', category: 'Sprains & Strains', keywords: ['acl', 'mcl', 'ligament', 'torn'] },
  { id: 'ankle-sprain', name: 'Ankle Sprain', category: 'Sprains & Strains', keywords: ['twisted ankle', 'rolled ankle'] },
  { id: 'wrist-sprain', name: 'Wrist Sprain', category: 'Sprains & Strains', keywords: ['wrist injury'] },
  { id: 'muscle-strain', name: 'Muscle Strain', category: 'Sprains & Strains', keywords: ['pulled muscle', 'torn muscle'] },
  { id: 'hamstring-strain', name: 'Hamstring Strain', category: 'Sprains & Strains', keywords: ['pulled hamstring', 'leg'] },
  { id: 'groin-strain', name: 'Groin Strain', category: 'Sprains & Strains', keywords: ['groin pull', 'adductor'] },
  { id: 'calf-strain', name: 'Calf Strain', category: 'Sprains & Strains', keywords: ['calf pull', 'gastrocnemius'] },

  // Back & Spine
  { id: 'back-pain', name: 'Lower Back Pain', category: 'Back & Spine', keywords: ['lumbar', 'lumbago', 'backache'] },
  { id: 'sciatica', name: 'Sciatica', category: 'Back & Spine', keywords: ['sciatic nerve', 'leg pain', 'radiating'] },
  { id: 'herniated-disc', name: 'Herniated / Bulging Disc', category: 'Back & Spine', keywords: ['slipped disc', 'ruptured disc', 'disc bulge'] },
  { id: 'spinal-stenosis', name: 'Spinal Stenosis', category: 'Back & Spine', keywords: ['narrow spine', 'nerve compression'] },
  { id: 'neck-pain', name: 'Neck Pain', category: 'Back & Spine', keywords: ['cervical', 'stiff neck'] },
  { id: 'whiplash', name: 'Whiplash', category: 'Back & Spine', keywords: ['car accident', 'neck injury'] },
  { id: 'scoliosis', name: 'Scoliosis', category: 'Back & Spine', keywords: ['curved spine', 'spinal curve'] },

  // Shoulder
  { id: 'shoulder-injury', name: 'Shoulder Injury (General)', category: 'Shoulder', keywords: ['shoulder pain'] },
  { id: 'rotator-cuff', name: 'Rotator Cuff Injury', category: 'Shoulder', keywords: ['rotator cuff tear', 'shoulder tear'] },
  { id: 'frozen-shoulder', name: 'Frozen Shoulder', category: 'Shoulder', keywords: ['adhesive capsulitis', 'stiff shoulder'] },
  { id: 'shoulder-impingement', name: 'Shoulder Impingement', category: 'Shoulder', keywords: ['impingement syndrome'] },
  { id: 'labral-tear', name: 'Labral Tear (SLAP)', category: 'Shoulder', keywords: ['slap tear', 'labrum'] },
  { id: 'shoulder-dislocation', name: 'Shoulder Dislocation', category: 'Shoulder', keywords: ['dislocated shoulder'] },

  // Elbow, Wrist & Hand
  { id: 'tennis-elbow', name: 'Tennis Elbow', category: 'Elbow, Wrist & Hand', keywords: ['lateral epicondylitis', 'elbow pain'] },
  { id: 'golfers-elbow', name: "Golfer's Elbow", category: 'Elbow, Wrist & Hand', keywords: ['medial epicondylitis'] },
  { id: 'carpal-tunnel', name: 'Carpal Tunnel Syndrome', category: 'Elbow, Wrist & Hand', keywords: ['wrist numbness', 'hand tingling', 'cts'] },
  { id: 'de-quervain', name: "De Quervain's Tenosynovitis", category: 'Elbow, Wrist & Hand', keywords: ['thumb pain', 'wrist tendon'] },
  { id: 'trigger-finger', name: 'Trigger Finger', category: 'Elbow, Wrist & Hand', keywords: ['finger locking', 'stenosing tenosynovitis'] },

  // Hip
  { id: 'hip-pain', name: 'Hip Pain (General)', category: 'Hip', keywords: ['hip ache'] },
  { id: 'hip-bursitis', name: 'Hip Bursitis', category: 'Hip', keywords: ['trochanteric bursitis'] },
  { id: 'hip-labral-tear', name: 'Hip Labral Tear', category: 'Hip', keywords: ['hip labrum'] },
  { id: 'hip-impingement', name: 'Hip Impingement (FAI)', category: 'Hip', keywords: ['femoroacetabular impingement', 'fai'] },
  { id: 'piriformis-syndrome', name: 'Piriformis Syndrome', category: 'Hip', keywords: ['piriformis', 'buttock pain'] },
  { id: 'it-band-syndrome', name: 'IT Band Syndrome', category: 'Hip', keywords: ['iliotibial band', 'itbs', 'runners knee'] },

  // Knee
  { id: 'meniscus-tear', name: 'Meniscus Tear', category: 'Knee', keywords: ['torn meniscus', 'cartilage tear'] },
  { id: 'patellofemoral', name: "Patellofemoral Pain (Runner's Knee)", category: 'Knee', keywords: ['runners knee', 'kneecap pain', 'pfps'] },
  { id: 'patellar-tendinitis', name: "Patellar Tendinitis (Jumper's Knee)", category: 'Knee', keywords: ['jumpers knee', 'patellar tendon'] },
  { id: 'knee-osteoarthritis', name: 'Knee Osteoarthritis', category: 'Knee', keywords: ['knee arthritis', 'worn cartilage'] },
  { id: 'knee-bursitis', name: 'Knee Bursitis', category: 'Knee', keywords: ['housemaids knee', 'prepatellar bursitis'] },

  // Foot & Ankle
  { id: 'plantar-fasciitis', name: 'Plantar Fasciitis', category: 'Foot & Ankle', keywords: ['heel pain', 'foot pain', 'plantar'] },
  { id: 'achilles-tendinitis', name: 'Achilles Tendinitis', category: 'Foot & Ankle', keywords: ['achilles pain', 'heel cord'] },
  { id: 'shin-splints', name: 'Shin Splints', category: 'Foot & Ankle', keywords: ['medial tibial stress syndrome', 'shin pain'] },
  { id: 'stress-fracture', name: 'Stress Fracture', category: 'Foot & Ankle', keywords: ['hairline fracture', 'bone stress'] },
  { id: 'ankle-fracture', name: 'Ankle Fracture Recovery', category: 'Foot & Ankle', keywords: ['broken ankle'] },

  // Post-Surgical Recovery
  { id: 'hip-replacement', name: 'Hip Replacement Recovery', category: 'Post-Surgical', keywords: ['total hip arthroplasty', 'tha', 'hip surgery'] },
  { id: 'knee-replacement', name: 'Knee Replacement Recovery', category: 'Post-Surgical', keywords: ['total knee arthroplasty', 'tka', 'knee surgery'] },
  { id: 'shoulder-replacement', name: 'Shoulder Replacement Recovery', category: 'Post-Surgical', keywords: ['shoulder arthroplasty'] },
  { id: 'acl-reconstruction', name: 'ACL Reconstruction Recovery', category: 'Post-Surgical', keywords: ['acl surgery', 'acl repair'] },
  { id: 'meniscus-surgery', name: 'Meniscus Surgery Recovery', category: 'Post-Surgical', keywords: ['meniscectomy', 'meniscus repair'] },
  { id: 'rotator-cuff-surgery', name: 'Rotator Cuff Surgery Recovery', category: 'Post-Surgical', keywords: ['shoulder surgery', 'rotator cuff repair'] },
  { id: 'spinal-fusion', name: 'Spinal Fusion Recovery', category: 'Post-Surgical', keywords: ['spine surgery', 'vertebrae fusion'] },
  { id: 'laminectomy', name: 'Laminectomy Recovery', category: 'Post-Surgical', keywords: ['back surgery', 'decompression'] },

  // Arthritis & Joint Conditions
  { id: 'arthritis', name: 'Osteoarthritis', category: 'Arthritis', keywords: ['oa', 'joint wear', 'degenerative'] },
  { id: 'rheumatoid-arthritis', name: 'Rheumatoid Arthritis', category: 'Arthritis', keywords: ['ra', 'autoimmune arthritis'] },
  { id: 'psoriatic-arthritis', name: 'Psoriatic Arthritis', category: 'Arthritis', keywords: ['psa', 'psoriasis arthritis'] },
  { id: 'ankylosing-spondylitis', name: 'Ankylosing Spondylitis', category: 'Arthritis', keywords: ['as', 'spine arthritis'] },
  { id: 'gout', name: 'Gout', category: 'Arthritis', keywords: ['uric acid', 'gouty arthritis', 'big toe'] },

  // Neurological
  { id: 'stroke-recovery', name: 'Stroke Recovery', category: 'Neurological', keywords: ['cva', 'cerebrovascular', 'stroke rehab'] },
  { id: 'parkinsons', name: "Parkinson's Disease", category: 'Neurological', keywords: ['pd', 'tremor', 'movement disorder'] },
  { id: 'multiple-sclerosis', name: 'Multiple Sclerosis', category: 'Neurological', keywords: ['ms', 'demyelinating'] },
  { id: 'traumatic-brain-injury', name: 'Traumatic Brain Injury', category: 'Neurological', keywords: ['tbi', 'head injury', 'concussion severe'] },
  { id: 'peripheral-neuropathy', name: 'Peripheral Neuropathy', category: 'Neurological', keywords: ['nerve damage', 'numbness tingling'] },
  { id: 'vestibular-disorder', name: 'Vestibular Disorder / Vertigo', category: 'Neurological', keywords: ['dizziness', 'balance', 'bppv'] },
  { id: 'bells-palsy', name: "Bell's Palsy", category: 'Neurological', keywords: ['facial paralysis', 'facial weakness'] },

  // Cardiovascular & Pulmonary
  { id: 'cardiac-rehab', name: 'Cardiac Rehabilitation', category: 'Cardiovascular', keywords: ['heart attack', 'heart surgery', 'cardiac'] },
  { id: 'copd', name: 'COPD', category: 'Cardiovascular', keywords: ['chronic obstructive pulmonary', 'emphysema', 'chronic bronchitis', 'breathing'] },
  { id: 'pulmonary-rehab', name: 'Pulmonary Rehabilitation', category: 'Cardiovascular', keywords: ['lung disease', 'breathing exercises'] },
  { id: 'post-covid', name: 'Post-COVID Syndrome (Long COVID)', category: 'Cardiovascular', keywords: ['long covid', 'covid recovery', 'pasc'] },
  { id: 'asthma', name: 'Asthma Management', category: 'Cardiovascular', keywords: ['wheezing', 'breathing difficulty'] },

  // Chronic Conditions
  { id: 'diabetes-type2', name: 'Type 2 Diabetes', category: 'Chronic Conditions', keywords: ['t2d', 'blood sugar', 'insulin resistance', 'diabetic'] },
  { id: 'diabetes-type1', name: 'Type 1 Diabetes', category: 'Chronic Conditions', keywords: ['t1d', 'juvenile diabetes', 'insulin dependent'] },
  { id: 'hypertension', name: 'Hypertension', category: 'Chronic Conditions', keywords: ['high blood pressure', 'hbp'] },
  { id: 'osteoporosis', name: 'Osteoporosis', category: 'Chronic Conditions', keywords: ['bone density', 'brittle bones', 'bone loss'] },

  // Chronic Pain & Fatigue
  { id: 'fibromyalgia', name: 'Fibromyalgia', category: 'Chronic Pain', keywords: ['fibro', 'widespread pain', 'chronic pain syndrome'] },
  { id: 'chronic-fatigue', name: 'Chronic Fatigue Syndrome', category: 'Chronic Pain', keywords: ['cfs', 'me', 'myalgic encephalomyelitis', 'exhaustion'] },
  { id: 'chronic-pain', name: 'Chronic Pain', category: 'Chronic Pain', keywords: ['persistent pain', 'long term pain'] },
  { id: 'complex-regional-pain', name: 'Complex Regional Pain Syndrome (CRPS)', category: 'Chronic Pain', keywords: ['crps', 'rsd', 'reflex sympathetic dystrophy'] },
  { id: 'temporomandibular', name: 'TMJ Disorder', category: 'Chronic Pain', keywords: ['tmj', 'jaw pain', 'tmd'] },
  { id: 'headache-migraine', name: 'Chronic Headache / Migraine', category: 'Chronic Pain', keywords: ['migraine', 'tension headache', 'cluster headache'] },

  // Women's Health
  { id: 'pelvic-floor', name: 'Pelvic Floor Dysfunction', category: "Women's Health", keywords: ['pelvic pain', 'incontinence', 'prolapse'] },
  { id: 'postpartum', name: 'Postpartum Recovery', category: "Women's Health", keywords: ['post pregnancy', 'after birth', 'postnatal'] },
  { id: 'pregnancy-related', name: 'Pregnancy-Related Pain', category: "Women's Health", keywords: ['prenatal', 'pregnancy pain', 'pregnant'] },
  { id: 'lymphedema', name: 'Lymphedema', category: "Women's Health", keywords: ['lymphatic', 'swelling', 'edema'] },
  { id: 'breast-cancer-rehab', name: 'Breast Cancer Rehabilitation', category: "Women's Health", keywords: ['mastectomy', 'breast surgery recovery'] },

  // Geriatric
  { id: 'fall-prevention', name: 'Fall Prevention / Balance Training', category: 'Geriatric', keywords: ['balance', 'elderly', 'senior', 'fall risk'] },
  { id: 'frailty', name: 'Frailty / Deconditioning', category: 'Geriatric', keywords: ['weakness', 'debility', 'loss of strength'] },
  { id: 'hip-fracture', name: 'Hip Fracture Recovery', category: 'Geriatric', keywords: ['broken hip', 'femur fracture'] },

  // Work & Sports
  { id: 'repetitive-strain', name: 'Repetitive Strain Injury', category: 'Work & Sports', keywords: ['rsi', 'overuse injury', 'repetitive motion'] },
  { id: 'work-conditioning', name: 'Work Conditioning / Return to Work', category: 'Work & Sports', keywords: ['work hardening', 'occupational rehab'] },
  { id: 'concussion', name: 'Concussion Recovery', category: 'Work & Sports', keywords: ['mild tbi', 'head injury', 'brain injury'] },
  { id: 'sports-hernia', name: 'Sports Hernia', category: 'Work & Sports', keywords: ['athletic pubalgia', 'groin pain'] },

  // General / Wellness
  { id: 'general-fitness', name: 'General Fitness', category: 'Wellness', keywords: ['exercise', 'workout', 'health', 'stay fit', 'get fit'] },
  { id: 'stress-management', name: 'Stress Management', category: 'Wellness', keywords: ['anxiety', 'stress relief', 'mental health', 'relaxation'] },
  { id: 'sleep-improvement', name: 'Sleep Improvement', category: 'Wellness', keywords: ['insomnia', 'sleep better', 'sleep quality'] }
];

// Initialize diagnosis autocomplete
function initDiagnosisAutocomplete() {
  const input = document.getElementById('diagnosis-input');
  const hiddenInput = document.getElementById('diagnosis');
  const dropdown = document.getElementById('diagnosis-dropdown');
  const badge = document.getElementById('selected-diagnosis-badge');

  if (!input || !dropdown) return;

  let highlightedIndex = -1;

  // Show dropdown on focus
  input.addEventListener('focus', () => {
    if (input.value.length > 0) {
      showFilteredResults(input.value);
    } else {
      showPopularConditions();
    }
  });

  // Filter on input
  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    highlightedIndex = -1;

    if (query.length === 0) {
      showPopularConditions();
    } else {
      showFilteredResults(query);
    }
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.diagnosis-dropdown-item, .diagnosis-dropdown-custom');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        items[highlightedIndex].click();
      } else if (input.value.trim()) {
        selectCustomCondition(input.value.trim());
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.diagnosis-autocomplete-wrapper')) {
      dropdown.style.display = 'none';
    }
  });

  function updateHighlight(items) {
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === highlightedIndex);
    });
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
      items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function showPopularConditions() {
    const popular = [
      ...DiagnosisDatabase.filter(d => d.category === 'Weight Management'),
      ...DiagnosisDatabase.filter(d => ['back-pain', 'plantar-fasciitis', 'diabetes-type2', 'knee-osteoarthritis', 'shoulder-injury', 'general-fitness'].includes(d.id))
    ];
    renderDropdown(popular, '');
    dropdown.style.display = 'block';
  }

  function showFilteredResults(query) {
    const lowerQuery = query.toLowerCase();

    const filteredResults = DiagnosisDatabase.map(condition => {
      let score = 0;
      if (condition.name.toLowerCase() === lowerQuery) score += 100;
      else if (condition.name.toLowerCase().startsWith(lowerQuery)) score += 50;
      else if (condition.name.toLowerCase().includes(lowerQuery)) score += 30;
      condition.keywords.forEach(kw => {
        if (kw.includes(lowerQuery)) score += 20;
        if (kw.startsWith(lowerQuery)) score += 10;
      });
      if (condition.category.toLowerCase().includes(lowerQuery)) score += 10;
      return { ...condition, score };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

    renderDropdown(filteredResults, query);
    dropdown.style.display = 'block';
  }

  function renderDropdown(results, query) {
    const escapeHtml = str => str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

    if (results.length === 0 && query) {
      dropdown.innerHTML = `
        <div class="diagnosis-dropdown-empty">No matching conditions found</div>
        <div class="diagnosis-dropdown-custom" onclick="selectCustomCondition('${escapeHtml(query)}')">
          <div class="diagnosis-custom-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div>
            <div style="font-weight: 500;">Use "${escapeHtml(query)}"</div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">Add as custom condition</div>
          </div>
        </div>
      `;
      return;
    }

    const grouped = {};
    results.forEach(c => { if (!grouped[c.category]) grouped[c.category] = []; grouped[c.category].push(c); });

    let html = '';
    for (const [category, conditions] of Object.entries(grouped)) {
      html += `<div class="diagnosis-dropdown-category">${category}</div>`;
      conditions.forEach(condition => {
        const highlighted = query ? condition.name.replace(new RegExp(`(${query})`, 'gi'), '<strong style="color:var(--primary-600);">$1</strong>') : condition.name;
        html += `
          <div class="diagnosis-dropdown-item" onclick="selectDiagnosis('${condition.id}', '${escapeHtml(condition.name)}')">
            <div class="diagnosis-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div class="diagnosis-item-content">
              <div class="diagnosis-item-name">${highlighted}</div>
            </div>
          </div>
        `;
      });
    }

    if (query && !results.some(r => r.name.toLowerCase() === query.toLowerCase())) {
      html += `
        <div class="diagnosis-dropdown-custom" onclick="selectCustomCondition('${escapeHtml(query)}')">
          <div class="diagnosis-custom-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div>
            <div style="font-weight: 500;">Use "${escapeHtml(query)}"</div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">Add as custom condition</div>
          </div>
        </div>
      `;
    }

    dropdown.innerHTML = html;
  }
}

// Select a known diagnosis from the database
function selectDiagnosis(id, name) {
  const input = document.getElementById('diagnosis-input');
  const hiddenInput = document.getElementById('diagnosis');
  const dropdown = document.getElementById('diagnosis-dropdown');
  const badge = document.getElementById('selected-diagnosis-badge');

  input.value = name;
  hiddenInput.value = id;
  dropdown.style.display = 'none';

  badge.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
    ${name}
    <span class="badge-remove" onclick="clearDiagnosis()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </span>
  `;
  badge.className = 'selected-diagnosis-badge';
  badge.style.display = 'inline-flex';

  handleDiagnosisChange();
}

// Select a custom (user-entered) condition
function selectCustomCondition(name) {
  const input = document.getElementById('diagnosis-input');
  const hiddenInput = document.getElementById('diagnosis');
  const dropdown = document.getElementById('diagnosis-dropdown');
  const badge = document.getElementById('selected-diagnosis-badge');

  const customId = 'custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  input.value = name;
  hiddenInput.value = customId;
  dropdown.style.display = 'none';

  AppState.userData.customCondition = { id: customId, name: name, isCustom: true };

  badge.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    ${name}
    <span style="font-size: 0.7rem; opacity: 0.8;">(Custom)</span>
    <span class="badge-remove" onclick="clearDiagnosis()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </span>
  `;
  badge.className = 'selected-diagnosis-badge is-custom';
  badge.style.display = 'inline-flex';

  handleDiagnosisChange();
}

// Clear selected diagnosis
function clearDiagnosis() {
  const input = document.getElementById('diagnosis-input');
  const hiddenInput = document.getElementById('diagnosis');
  const badge = document.getElementById('selected-diagnosis-badge');

  input.value = '';
  hiddenInput.value = '';
  badge.style.display = 'none';
  delete AppState.userData.customCondition;
  input.focus();
  handleDiagnosisChange();
}

// Weight Management diagnosis values
const WEIGHT_MANAGEMENT_DIAGNOSES = ['weight-loss', 'weight-gain', 'obesity'];

// Check if current diagnosis is a weight management condition
function isWeightManagementDiagnosis(diagnosis) {
  return WEIGHT_MANAGEMENT_DIAGNOSES.includes(diagnosis);
}

// Show/hide weight goal field based on diagnosis selection
// Body metrics section is now always visible for all users
function handleDiagnosisChange() {
  const diagnosis = document.getElementById('diagnosis')?.value;
  const wmGoalGroup = document.getElementById('wm-goal-group');

  // Body metrics section stays visible for all users
  // Only toggle the weight goal field for weight management conditions
  if (wmGoalGroup) {
    if (isWeightManagementDiagnosis(diagnosis)) {
      wmGoalGroup.style.display = 'block';
      // Update goal options based on diagnosis type
      updateWMGoalOptions(diagnosis);
    } else {
      wmGoalGroup.style.display = 'none';
    }
  }
}

// Update weight management goal options based on diagnosis
function updateWMGoalOptions(diagnosis) {
  const goalSelect = document.getElementById('wm-goal');
  if (!goalSelect) return;

  // Clear existing options except the first placeholder
  goalSelect.innerHTML = '<option value="">Select your goal</option>';

  if (diagnosis === 'weight-loss' || diagnosis === 'obesity') {
    goalSelect.innerHTML += `
      <option value="lose-10">Lose 10 lbs or less</option>
      <option value="lose-25">Lose 10-25 lbs</option>
      <option value="lose-50">Lose 25-50 lbs</option>
      <option value="lose-50plus">Lose 50+ lbs</option>
      <option value="maintain">Maintain current weight</option>
    `;
  } else if (diagnosis === 'weight-gain') {
    goalSelect.innerHTML += `
      <option value="gain-5">Gain 5-10 lbs</option>
      <option value="gain-15">Gain 10-20 lbs</option>
      <option value="gain-25plus">Gain 20+ lbs</option>
      <option value="gain-muscle">Build muscle mass</option>
      <option value="maintain">Maintain current weight</option>
    `;
  }
}

// Toggle units for weight management section
function toggleWMUnits(unit) {
  const metricInputs = document.getElementById('wm-metric-inputs');
  const imperialInputs = document.getElementById('wm-imperial-inputs');
  const toggleButtons = document.querySelectorAll('#wm-unit-toggle .unit-option');

  toggleButtons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.unit === unit);
  });

  if (unit === 'metric') {
    metricInputs.style.display = 'flex';
    imperialInputs.style.display = 'none';
    // Enable metric, disable imperial for validation
    document.querySelectorAll('.wm-metric').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.wm-imperial').forEach(el => el.style.display = 'none');
  } else {
    metricInputs.style.display = 'none';
    imperialInputs.style.display = 'flex';
    // Enable imperial, disable metric for validation
    document.querySelectorAll('.wm-metric').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.wm-imperial').forEach(el => el.style.display = 'block');
  }
}

// Validate weight management fields
function validateWeightManagementFields() {
  const diagnosis = document.getElementById('diagnosis')?.value;
  if (!isWeightManagementDiagnosis(diagnosis)) {
    return true; // Not a WM diagnosis, skip validation
  }

  const age = document.getElementById('wm-age')?.value;
  const sex = document.getElementById('wm-sex')?.value;
  const goal = document.getElementById('wm-goal')?.value;

  // Check if using metric or imperial
  const metricInputs = document.getElementById('wm-metric-inputs');
  const usingMetric = metricInputs && metricInputs.style.display !== 'none';

  let height, weight;
  if (usingMetric) {
    height = document.getElementById('wm-height')?.value;
    weight = document.getElementById('wm-weight')?.value;
  } else {
    const heightFt = document.getElementById('wm-height-ft')?.value;
    const heightIn = document.getElementById('wm-height-in')?.value;
    height = heightFt; // Just check if feet is provided
    weight = document.getElementById('wm-weight-lbs')?.value;
  }

  if (!age || !sex || !height || !weight || !goal) {
    alert('Please fill in all required weight management fields (age, sex, height, weight, and goal).');
    return false;
  }

  return true;
}

function validateIntakeStep(step) {
  switch (step) {
    case 1:
      const firstName = document.getElementById('user-first-name')?.value;
      const diagnosis = document.getElementById('diagnosis')?.value;
      const diagnosisDate = document.getElementById('diagnosis-date')?.value;
      if (!firstName || !diagnosis || !diagnosisDate) {
        alert('Please enter your name, select your diagnosis, and provide the date of diagnosis.');
        return false;
      }
      // Also validate weight management fields if applicable
      if (!validateWeightManagementFields()) {
        return false;
      }
      return true;

    case 2:
      // Check for both old rating-item and new icon-select-item styles
      const sleepQuality = document.querySelector('#sleep-quality .rating-item.selected, #sleep-quality .icon-select-item.selected');
      const chronotype = document.querySelector('#chronotype .rating-item.selected, #chronotype .icon-select-item.selected');
      if (!sleepQuality || !chronotype) {
        alert('Please answer all required questions about your sleep and schedule.');
        return false;
      }
      return true;

    case 3:
      const hasSchedule = document.querySelector('input[name="has-workout-schedule"]:checked');
      if (!hasSchedule) {
        alert('Please indicate whether you have a workout schedule.');
        return false;
      }
      return true;

    default:
      return true;
  }
}

function saveStepData(step) {
  console.log('[saveStepData] Saving data for step:', step);
  switch (step) {
    case 1:
      AppState.userData.firstName = document.getElementById('user-first-name')?.value || '';
      console.log('[saveStepData] Step 1 - firstName:', AppState.userData.firstName);

      // Validate and save diagnosis
      const diagnosisValue = document.getElementById('diagnosis')?.value || '';
      console.log('[saveStepData] Step 1 - raw diagnosis value:', diagnosisValue);
      const validatedDiagnosis = validateCondition(diagnosisValue);
      console.log('[saveStepData] Step 1 - validated diagnosis:', validatedDiagnosis);
      if (validatedDiagnosis) {
        AppState.userData.diagnosis = validatedDiagnosis.id;
        AppState.userData.diagnosisValidated = true;
        console.log('[saveStepData] Step 1 - Using validated diagnosis ID:', validatedDiagnosis.id);
      } else {
        AppState.userData.diagnosis = diagnosisValue;
        AppState.userData.diagnosisValidated = false;
        console.log('[saveStepData] Step 1 - Using raw diagnosis value:', diagnosisValue);
      }

      AppState.userData.diagnosisDate = document.getElementById('diagnosis-date')?.value || '';
      console.log('[saveStepData] Step 1 - diagnosisDate:', AppState.userData.diagnosisDate);

      // Also validate other conditions if provided
      const otherConditionsText = document.getElementById('other-conditions')?.value || '';
      AppState.userData.otherConditions = otherConditionsText;
      // Parse and validate secondary conditions
      if (otherConditionsText) {
        const parsedConditions = otherConditionsText.split(/[,\n;]+/).map(c => c.trim()).filter(c => c);
        AppState.userData.validatedSecondaryConditions = parsedConditions.map(c => {
          const validated = validateCondition(c);
          return validated ? { id: validated.id, name: validated.name, isValidated: true } : { name: c, isValidated: false };
        });
      }

      // Save body metrics for ALL users (required for calorie calculations)
      // Check which units are being used
      const metricInputs = document.getElementById('wm-metric-inputs');
      const usingMetric = metricInputs && metricInputs.style.display !== 'none';

      // Always save age and sex
      AppState.userData.age = document.getElementById('wm-age')?.value || '';
      AppState.userData.sex = document.getElementById('wm-sex')?.value || '';

      if (usingMetric) {
        AppState.userData.height = document.getElementById('wm-height')?.value || '';
        AppState.userData.weight = document.getElementById('wm-weight')?.value || '';
        AppState.userData.units = 'metric';
      } else {
        // Convert imperial to metric for calculations
        const feet = parseFloat(document.getElementById('wm-height-ft')?.value) || 0;
        const inches = parseFloat(document.getElementById('wm-height-in')?.value) || 0;
        const lbs = parseFloat(document.getElementById('wm-weight-lbs')?.value) || 0;
        AppState.userData.height = Math.round((feet * 30.48) + (inches * 2.54));
        AppState.userData.weight = Math.round(lbs * 0.453592);
        AppState.userData.units = 'imperial';
      }

      // Save weight management goal if applicable (only for weight management conditions)
      if (isWeightManagementDiagnosis(diagnosisValue)) {
        AppState.userData.weightManagement = {
          age: AppState.userData.age,
          sex: AppState.userData.sex,
          goal: document.getElementById('wm-goal')?.value || '',
          heightCm: AppState.userData.height,
          weightKg: AppState.userData.weight,
          units: AppState.userData.units
        };
        console.log('[saveStepData] Step 1 - Weight management data saved:', AppState.userData.weightManagement);
      }

      console.log('[saveStepData] Step 1 - Body metrics saved: age=' + AppState.userData.age +
        ', sex=' + AppState.userData.sex + ', height=' + AppState.userData.height + 'cm, weight=' + AppState.userData.weight + 'kg');
      break;

    case 2:
      AppState.userData.avgSleep = document.getElementById('avg-sleep')?.value || '';
      AppState.userData.bedtime = document.getElementById('bedtime')?.value || '';
      AppState.userData.wakeTime = document.getElementById('wake-time')?.value || '';
      break;

    case 3:
      AppState.userData.workoutSchedule = document.getElementById('workout-schedule')?.value || '';
      AppState.userData.exerciseFrequency = document.getElementById('exercise-frequency')?.value || '';
      AppState.userData.preferredExerciseTime = document.getElementById('preferred-exercise-time')?.value || '';
      AppState.userData.exerciseDuration = document.getElementById('exercise-duration')?.value || '';
      AppState.userData.mobilityLimitations = document.getElementById('mobility-limitations')?.value || '';
      break;

    case 4:
      // Only update body metrics if they weren't already set from weight management in step 1
      // or if new values are explicitly provided
      const newAge = document.getElementById('user-age')?.value;
      const newSex = document.getElementById('user-sex')?.value;

      if (newAge) AppState.userData.age = newAge;
      if (newSex) AppState.userData.sex = newSex;

      if (AppState.preferredUnits === 'metric') {
        const newHeight = document.getElementById('user-height')?.value;
        const newWeight = document.getElementById('user-weight')?.value;
        if (newHeight) AppState.userData.height = newHeight;
        if (newWeight) AppState.userData.weight = newWeight;
      } else {
        const ft = parseFloat(document.getElementById('user-height-ft')?.value) || 0;
        const inches = parseFloat(document.getElementById('user-height-in')?.value) || 0;
        const lbs = parseFloat(document.getElementById('user-weight-lbs')?.value) || 0;
        if (ft || inches) AppState.userData.height = Math.round((ft * 30.48) + (inches * 2.54));
        if (lbs) AppState.userData.weight = Math.round(lbs * 0.453592);
      }

      AppState.userData.activityLevel = document.getElementById('activity-level')?.value || '';
      AppState.userData.dietaryHabits = document.getElementById('dietary-habits')?.value || '';
      AppState.userData.groceryBudget = document.getElementById('grocery-budget')?.value || '';
      AppState.userData.breakfastTime = document.getElementById('breakfast-time')?.value || '08:00';
      AppState.userData.lunchTime = document.getElementById('lunch-time')?.value || '12:30';
      AppState.userData.dinnerTime = document.getElementById('dinner-time')?.value || '18:30';
      AppState.userData.otherDietaryNotes = document.getElementById('other-restrictions')?.value || '';
      // Collect pantry ingredients if budget-conscious
      const pantryItems = [];
      document.querySelectorAll('#pantry-ingredients-group input[type="checkbox"]:checked').forEach(cb => {
        pantryItems.push(cb.value);
      });
      AppState.userData.pantryIngredients = pantryItems;
      break;

    case 5:
      AppState.userData.medications = document.getElementById('medications')?.value || '';
      AppState.userData.doctorInput = document.getElementById('doctor-input')?.value || '';
      AppState.userData.clinicianName = document.getElementById('clinician-name')?.value || '';
      AppState.userData.clinicianPhone = document.getElementById('clinician-phone')?.value || '';
      AppState.userData.pharmacyName = document.getElementById('pharmacy-name')?.value || '';
      AppState.userData.pharmacyPhone = document.getElementById('pharmacy-phone')?.value || '';
      break;
  }
}

function updateIntakeStepUI() {
  const currentStep = AppState.intakeStep;

  document.querySelectorAll('.intake-step').forEach(step => {
    step.classList.remove('active');
    if (parseInt(step.dataset.step) === currentStep) {
      step.classList.add('active');
    }
  });

  document.querySelectorAll('.progress-step').forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      step.classList.add('active');
    } else if (stepNum < currentStep) {
      step.classList.add('completed');
    }
  });

  const prevBtn = document.getElementById('prev-step');
  const nextBtn = document.getElementById('next-step');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn) prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

  if (nextBtn && submitBtn) {
    if (currentStep === AppState.totalIntakeSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'flex';
    } else {
      nextBtn.style.display = 'flex';
      submitBtn.style.display = 'none';
    }
  }
}

function toggleWorkoutSchedule(hasSchedule) {
  const detailsDiv = document.getElementById('workout-schedule-details');
  if (detailsDiv) detailsDiv.style.display = hasSchedule ? 'block' : 'none';
  AppState.userData.hasWorkoutSchedule = hasSchedule;
}

function toggleExtendedQuestions(section) {
  const extendedEl = document.getElementById(`extended-${section}`);
  const toggleEl = extendedEl?.previousElementSibling;

  if (extendedEl) {
    const isHidden = extendedEl.style.display === 'none';
    extendedEl.style.display = isHidden ? 'block' : 'none';

    if (toggleEl && toggleEl.classList.contains('extended-toggle')) {
      toggleEl.classList.toggle('open', isHidden);
    }

    // If opening nutrition section, pre-fill from weight management data if available
    if (section === 'nutrition' && isHidden) {
      prefillNutritionFromWeightManagement();
    }
  }
}

// Pre-fill nutrition extended fields from weight management data entered in step 1
function prefillNutritionFromWeightManagement() {
  const wmData = AppState.userData.weightManagement;
  const noticeEl = document.getElementById('wm-data-prefilled-notice');

  if (wmData && (wmData.age || wmData.heightCm || wmData.weightKg)) {
    // Show the pre-filled notice
    if (noticeEl) noticeEl.style.display = 'block';

    // Pre-fill the fields
    const ageField = document.getElementById('user-age');
    const sexField = document.getElementById('user-sex');
    const heightField = document.getElementById('user-height');
    const weightField = document.getElementById('user-weight');
    const heightFtField = document.getElementById('user-height-ft');
    const heightInField = document.getElementById('user-height-in');
    const weightLbsField = document.getElementById('user-weight-lbs');

    if (ageField && wmData.age && !ageField.value) {
      ageField.value = wmData.age;
    }

    if (sexField && wmData.sex && !sexField.value) {
      sexField.value = wmData.sex;
    }

    // Handle metric vs imperial
    if (wmData.units === 'metric') {
      if (heightField && wmData.heightCm && !heightField.value) {
        heightField.value = wmData.heightCm;
      }
      if (weightField && wmData.weightKg && !weightField.value) {
        weightField.value = wmData.weightKg;
      }
    } else if (wmData.units === 'imperial') {
      // Switch to imperial display
      toggleUnits('imperial');
      if (heightFtField && wmData.heightFt && !heightFtField.value) {
        heightFtField.value = wmData.heightFt;
      }
      if (heightInField && wmData.heightIn && !heightInField.value) {
        heightInField.value = wmData.heightIn;
      }
      if (weightLbsField && wmData.weightLbs && !weightLbsField.value) {
        weightLbsField.value = wmData.weightLbs;
      }
    }
  } else {
    // Hide the notice if no WM data
    if (noticeEl) noticeEl.style.display = 'none';
  }
}

async function submitIntakeForm(event) {
  event.preventDefault();
  saveStepData(AppState.intakeStep);

  AppState.firstVisitDate = new Date().toISOString();

  // Show Caribou mascot with progressive loading messages
  const loadingMessages = [
    { text: "Analyzing your health profile...", subtitle: "Cura is reviewing your information", duration: 1200 },
    { text: "Building your care plan...", subtitle: "Creating personalized recommendations", duration: 1200 },
    { text: "Almost ready!", subtitle: "Finalizing your dashboard", duration: 800 }
  ];

  showCaribouLoading(loadingMessages, () => {
    navigateTo('tiers');
  });
}

/**
 * selectTier - Finalizes user onboarding and activates the selected plan
 *
 * This is the final step of the intake process. After the user completes
 * all intake steps and chooses a subscription tier, this function:
 *
 * 1. Sets the user's tier level in AppState
 * 2. Marks intake as complete (hasCompletedIntake = true)
 * 3. Persists state to localStorage and account
 * 4. Shows loading animation with Caribou mascot
 * 5. Reveals navigation and tier-specific features
 * 6. Navigates to the dashboard (home page)
 *
 * TIER LEVELS:
 * - 'free': Basic features, 1 condition, limited AI
 * - 'premium': Multiple conditions, nutrition macros, AI personalization
 * - 'family': Multiple user profiles, Cura chatbot 24/7
 * - 'enterprise': Health coaching, advanced AI, dedicated support
 *
 * FEATURE UNLOCKS BY TIER:
 * - Free: Dashboard, PT, Nutrition, Medication pages
 * - Premium+: Chatbot access, multiple conditions
 * - Family+: Family profiles, full chatbot
 *
 * @param {string} tier - One of: 'free', 'premium', 'family', 'enterprise'
 */
function selectTier(tier) {
  console.log('[selectTier] Selecting tier:', tier);

  const tierNames = {
    'free': 'Free',
    'premium': 'Premium',
    'family': 'Family',
    'enterprise': 'Enterprise'
  };

  const tierPrices = {
    'free': 0,
    'premium': 10,
    'family': 25,
    'enterprise': 50
  };

  // Enterprise tier — redirect to contact
  if (tier === 'enterprise') {
    window.location.href = 'https://caribouhealth.ca/#contact';
    return;
  }

  // Free tier — proceed immediately
  if (tier === 'free') {
    activateTier(tier);
    return;
  }

  // Paid tier — check for promo code
  const promoSkipsPayment = appliedPromoCode && (appliedPromoCode.skipPayment || appliedPromoCode.discount >= 100);

  if (promoSkipsPayment) {
    // BETATESTER or 100% off promo — skip payment entirely
    console.log('[selectTier] Promo code skips payment:', appliedPromoCode.code);
    activateTier(tier);
    return;
  }

  // Paid tier without full promo — show payment modal
  const originalPrice = tierPrices[tier];
  let finalPrice = originalPrice;
  let discountText = '';

  if (appliedPromoCode && appliedPromoCode.discount > 0) {
    if (appliedPromoCode.type === 'percent') {
      finalPrice = originalPrice * (1 - appliedPromoCode.discount / 100);
    } else {
      finalPrice = Math.max(0, originalPrice - appliedPromoCode.discount);
    }
    discountText = `<div style="color: var(--success); font-size: 0.9rem; margin-bottom: var(--space-3);">Promo applied: ${appliedPromoCode.description} (-$${(originalPrice - finalPrice).toFixed(2)})</div>`;
  }

  showPaymentModal(tier, tierNames[tier], finalPrice, originalPrice, discountText);
}

function showPaymentModal(tier, tierName, finalPrice, originalPrice, discountText) {
  // Remove any existing payment modal
  const existing = document.getElementById('payment-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.className = 'auth-modal';
  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="auth-modal-content" style="max-width: 440px;">
      <button class="auth-modal-close" onclick="document.getElementById('payment-modal').remove()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div class="auth-modal-header" style="margin-bottom: var(--space-4);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: var(--space-2);">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <h2>Complete Your ${tierName} Plan</h2>
        <p style="color: var(--gray-600);">Secure payment powered by Stripe</p>
      </div>

      <div style="background: var(--gray-50); padding: var(--space-4); border-radius: var(--radius); margin-bottom: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
          <span style="font-weight: 600;">Caribou ${tierName} Plan</span>
          <span style="font-weight: 600; ${originalPrice !== finalPrice ? 'text-decoration: line-through; color: var(--gray-400);' : ''}">$${originalPrice.toFixed(2)} CAD/mo</span>
        </div>
        ${originalPrice !== finalPrice ? `<div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: var(--success); font-weight: 600;">After discount</span><span style="color: var(--success); font-weight: 700; font-size: 1.1rem;">$${finalPrice.toFixed(2)} CAD/mo</span></div>` : ''}
        ${discountText}
      </div>

      <div style="margin-bottom: var(--space-4);">
        <p style="font-size: 0.85rem; color: var(--gray-500); text-align: center;">
          Stripe payment integration is being set up. You'll be redirected to a secure Stripe checkout page to complete your subscription.
        </p>
      </div>

      <button class="btn btn-primary" style="width: 100%; padding: var(--space-3);" onclick="processPayment('${tier}', ${finalPrice})" id="payment-submit-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-2); vertical-align: middle;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Subscribe — $${finalPrice.toFixed(2)} CAD/month
      </button>

      <p style="text-align: center; margin-top: var(--space-3); font-size: 0.8rem; color: var(--gray-500);">
        Cancel anytime. 14-day free trial included.
      </p>

      <div class="auth-divider"><span>or</span></div>

      <div style="text-align: center;">
        <p style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: var(--space-2);">Have a promo code for free access?</p>
        <div style="display: flex; gap: var(--space-2); max-width: 300px; margin: 0 auto;">
          <input type="text" id="payment-promo-input" placeholder="Enter code" style="flex: 1; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius); text-transform: uppercase; font-size: 0.9rem;" oninput="this.value = this.value.toUpperCase()">
          <button class="btn btn-outline" style="padding: var(--space-2) var(--space-3);" onclick="applyPaymentPromo('${tier}')">Apply</button>
        </div>
        <div id="payment-promo-result" style="margin-top: var(--space-2); font-size: 0.85rem;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function applyPaymentPromo(tier) {
  const input = document.getElementById('payment-promo-input');
  const resultDiv = document.getElementById('payment-promo-result');
  if (!input || !resultDiv) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    resultDiv.innerHTML = '<span style="color: var(--error);">Please enter a code</span>';
    return;
  }

  let validation;
  if (typeof PromoCodeService !== 'undefined') {
    validation = PromoCodeService.validateCode(code);
  } else {
    validation = validatePromoCodeLocal(code);
  }

  if (validation.valid && (validation.skipPayment || validation.discount >= 100)) {
    // Full free access — close payment modal and activate
    appliedPromoCode = { code, discount: validation.discount, type: validation.type, description: validation.description, skipPayment: true };
    AppState.appliedPromoCode = appliedPromoCode;

    resultDiv.innerHTML = `<span style="color: var(--success); font-weight: 600;">Code applied! Activating your free ${tier} access...</span>`;

    setTimeout(() => {
      const modal = document.getElementById('payment-modal');
      if (modal) modal.remove();
      activateTier(tier);
    }, 1200);
  } else if (validation.valid) {
    resultDiv.innerHTML = `<span style="color: var(--success);">${validation.description} — discount applied!</span>`;
    appliedPromoCode = { code, discount: validation.discount, type: validation.type, description: validation.description };
    // Update the payment button price
    const tierPrices = { 'premium': 10, 'family': 25, 'enterprise': 50 };
    const original = tierPrices[tier] || 10;
    const discounted = original * (1 - validation.discount / 100);
    const btn = document.getElementById('payment-submit-btn');
    if (btn) btn.textContent = `Subscribe — $${discounted.toFixed(2)} CAD/month`;
  } else {
    resultDiv.innerHTML = `<span style="color: var(--error);">${validation.error}</span>`;
  }
}

async function processPayment(tier, price) {
  const btn = document.getElementById('payment-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

  try {
    // Try Stripe if configured
    if (typeof SubscriptionService !== 'undefined' && BackendConfig.BACKEND_ENABLED &&
        BackendConfig.stripe.publishableKey !== 'YOUR_STRIPE_PUBLISHABLE_KEY') {
      const result = await SubscriptionService.createCheckoutSession(tier, 'monthly', appliedPromoCode?.code);
      if (result.success && result.url) {
        window.location.href = result.url;
        return;
      }
    }

    // Stripe not yet configured — show friendly message
    if (btn) { btn.disabled = false; btn.textContent = `Subscribe — $${price.toFixed(2)} CAD/month`; }

    const modal = document.getElementById('payment-modal');
    if (modal) {
      const content = modal.querySelector('.auth-modal-content');
      if (content) {
        content.innerHTML = `
          <div style="text-align: center; padding: var(--space-6);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: var(--space-4);">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <h2 style="margin-bottom: var(--space-2);">Payment Coming Soon!</h2>
            <p style="color: var(--gray-600); margin-bottom: var(--space-4);">Our Stripe payment integration is being finalized. In the meantime, use promo code <strong>BETATESTER</strong> to get free access to any plan!</p>
            <div style="display: flex; gap: var(--space-2); max-width: 300px; margin: 0 auto var(--space-4);">
              <input type="text" id="fallback-promo-input" placeholder="Enter BETATESTER" value="BETATESTER" style="flex: 1; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius); text-transform: uppercase; font-size: 0.9rem; text-align: center; font-weight: 600;">
              <button class="btn btn-primary" style="padding: var(--space-2) var(--space-3);" onclick="applyPaymentPromo('${tier}')">Apply</button>
            </div>
            <div id="payment-promo-result" style="margin-bottom: var(--space-3);"></div>
            <button class="btn btn-outline" style="width: 100%;" onclick="document.getElementById('payment-modal').remove()">Maybe Later</button>
          </div>
        `;
        // Wire up the promo input
        const promoInput = document.getElementById('fallback-promo-input');
        if (promoInput) {
          document.getElementById('payment-promo-input')?.remove();
          promoInput.id = 'payment-promo-input';
        }
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
    if (btn) { btn.disabled = false; btn.textContent = `Subscribe — $${price.toFixed(2)} CAD/month`; }
    alert('Payment processing is not yet available. Please use promo code BETATESTER for free access.');
  }
}

function activateTier(tier) {
  const tierNames = {
    'free': 'Free',
    'premium': 'Premium',
    'family': 'Family',
    'enterprise': 'Enterprise'
  };

  AppState.userTier = tier;
  AppState.hasCompletedIntake = true;
  saveState();

  // Show Caribou mascot loading while generating the care plan
  const loadingMessages = [
    { text: `Setting up your ${tierNames[tier]} plan...`, subtitle: "Cura is preparing your dashboard", duration: 1000 },
    { text: "Generating your care plan...", subtitle: `Customizing for ${AppState.userData.firstName || 'you'}`, duration: 1200 },
    { text: "Welcome to Caribou!", subtitle: "Your care plan is ready", duration: 800 }
  ];

  showCaribouLoading(loadingMessages, () => {
    const nav = document.getElementById('main-nav');
    const footer = document.getElementById('main-footer');
    const chatbot = document.getElementById('chatbot-container');
    const mobileNav = document.getElementById('mobile-bottom-nav');

    if (nav) nav.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (mobileNav) {
      mobileNav.style.display = isNativeApp() ? 'flex' : 'none';
    }

    // All paid tiers get chatbot access
    if (chatbot) {
      if (tier === 'free') {
        chatbot.style.display = 'none';
      } else {
        chatbot.style.display = 'block';
      }
    }

    navigateTo('home');
  });
}

// Helper to check tier access levels
function getTierLevel(tier) {
  const levels = { 'free': 0, 'premium': 1, 'family': 2, 'enterprise': 3 };
  return levels[tier] || 0;
}

function hasTierAccess(requiredTier) {
  return getTierLevel(AppState.userTier) >= getTierLevel(requiredTier);
}

// ============================================
// Promo Code Functions
// ============================================

// Current applied promo code state
let appliedPromoCode = null;

/**
 * Apply a promo code from the tier selection page
 */
function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  const resultDiv = document.getElementById('promo-code-result');

  if (!input || !resultDiv) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    showPromoResult(resultDiv, 'Please enter a promo code', 'error');
    return;
  }

  // Use PromoCodeService if available, otherwise use local validation
  let validation;
  if (typeof PromoCodeService !== 'undefined') {
    validation = PromoCodeService.validateCode(code);
  } else {
    validation = validatePromoCodeLocal(code);
  }

  if (validation.valid) {
    appliedPromoCode = {
      code: code,
      discount: validation.discount,
      type: validation.type,
      description: validation.description
    };

    showPromoResult(resultDiv, `${validation.description} applied!`, 'success');
    updateTierPricesWithDiscount(validation.discount, validation.type, validation.planRestriction);

    // Save to AppState
    AppState.appliedPromoCode = appliedPromoCode;
  } else {
    appliedPromoCode = null;
    showPromoResult(resultDiv, validation.error, 'error');
  }
}

/**
 * Promo code validation — always validates via backend API
 */
async function validatePromoCodeLocal(code) {
  try {
    const token = AuthService.currentUser ? await AuthService.currentUser.getIdToken() : null;
    const response = await fetch(`${BackendConfig.endpoints.baseUrl}${BackendConfig.endpoints.promoCodes}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ code })
    });
    const result = await response.json();
    return result.valid ? result : { valid: false, error: result.error || 'Invalid promo code' };
  } catch (error) {
    return { valid: false, error: 'Unable to validate promo code. Please check your connection.' };
  }
}

/**
 * Show promo code result message
 */
function showPromoResult(element, message, type) {
  element.style.display = 'block';
  element.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--space-2); color: ${type === 'success' ? 'var(--success)' : 'var(--error)'};">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success'
          ? '<path d="M20 6L9 17l-5-5"/>'
          : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/>'
        }
      </svg>
      <span>${message}</span>
    </div>
  `;
}

/**
 * Update tier card prices with discount
 */
function updateTierPricesWithDiscount(discount, type, planRestriction) {
  const tierPrices = {
    'premium': { original: 10, element: document.querySelector('.tier-card.featured .tier-card-price') },
    'family': { original: 25, element: document.querySelectorAll('.tier-card')[2]?.querySelector('.tier-card-price') }
  };

  Object.entries(tierPrices).forEach(([tier, data]) => {
    if (!data.element) return;

    // Skip if there's a plan restriction and this isn't the right plan
    if (planRestriction && tier !== planRestriction) return;

    const discountedPrice = type === 'percent'
      ? data.original * (1 - discount / 100)
      : Math.max(0, data.original - discount);

    if (discount > 0) {
      data.element.innerHTML = `
        <span style="text-decoration: line-through; color: var(--gray-400); font-size: 0.8em;">$${data.original}</span>
        <span style="color: var(--success);">$${discountedPrice.toFixed(0)}</span><span>CAD/month</span>
      `;
    }
  });
}

// ============================================
// Admin Functions
// ============================================

/**
 * Show admin login modal
 */
function showAdminLogin() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'admin-login-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width: 400px;">
      <div class="modal-header">
        <h2>Admin Login</h2>
        <button class="modal-close" onclick="closeModal('admin-login-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="admin-login-form" onsubmit="handleAdminLogin(event)">
          <div class="form-group">
            <label for="admin-email">Admin Email</label>
            <input type="email" id="admin-email" required placeholder="admin@caribouhealth.ca">
          </div>
          <div class="form-group">
            <label for="admin-password">Password</label>
            <input type="password" id="admin-password" required>
          </div>
          <div id="admin-login-error" style="color: var(--error); font-size: 0.85rem; margin-bottom: var(--space-3); display: none;"></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Login as Admin</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
}

/**
 * Handle admin login form submission
 */
async function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const errorDiv = document.getElementById('admin-login-error');

  // Use AuthService if available
  let result;
  if (typeof AuthService !== 'undefined') {
    result = await AuthService.adminLogin(email, password);
  } else {
    result = { success: false, error: 'Admin login requires an internet connection. Please check your connection and try again.' };
  }

  if (result.success && result.isAdmin) {
    closeModal('admin-login-modal');
    showAdminDashboard();
  } else {
    errorDiv.textContent = result.error || 'Invalid admin credentials';
    errorDiv.style.display = 'block';
  }
}

/**
 * Show admin dashboard
 */
async function showAdminDashboard() {
  // Get analytics data
  let analytics = { totalUsers: 0, subscriptions: { free: 0, premium: 0, family: 0 }, promoCodesUsed: {} };

  if (typeof AdminService !== 'undefined') {
    const result = await AdminService.getAnalytics();
    if (result.success) {
      analytics = result.data;
    }
  } else {
    // Local analytics
    const accounts = JSON.parse(localStorage.getItem('caribou_accounts') || '{}');
    analytics.totalUsers = Object.keys(accounts).length;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'admin-dashboard-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>Admin Dashboard</h2>
        <button class="modal-close" onclick="closeModal('admin-dashboard-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-bottom: var(--space-6);">
          <div style="background: var(--primary-50); padding: var(--space-4); border-radius: var(--radius); text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-600);">${analytics.totalUsers}</div>
            <div style="color: var(--gray-600); font-size: 0.85rem;">Total Users</div>
          </div>
          <div style="background: var(--success-light, #dcfce7); padding: var(--space-4); border-radius: var(--radius); text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${analytics.subscriptions?.premium || 0}</div>
            <div style="color: var(--gray-600); font-size: 0.85rem;">Premium Users</div>
          </div>
          <div style="background: #fef3c7; padding: var(--space-4); border-radius: var(--radius); text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #d97706;">${analytics.subscriptions?.family || 0}</div>
            <div style="color: var(--gray-600); font-size: 0.85rem;">Family Plans</div>
          </div>
        </div>

        <!-- Create Promo Code -->
        <div style="background: var(--gray-50); padding: var(--space-4); border-radius: var(--radius); margin-bottom: var(--space-4);">
          <h3 style="margin-bottom: var(--space-3);">Create Promo Code</h3>
          <form id="create-promo-form" onsubmit="handleCreatePromoCode(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
              <div class="form-group">
                <label>Code</label>
                <input type="text" id="new-promo-code" required placeholder="e.g., SUMMER25" style="text-transform: uppercase;">
              </div>
              <div class="form-group">
                <label>Discount %</label>
                <input type="number" id="new-promo-discount" required min="1" max="100" placeholder="25">
              </div>
              <div class="form-group">
                <label>Description</label>
                <input type="text" id="new-promo-description" required placeholder="25% off summer sale">
              </div>
              <div class="form-group">
                <label>Expires</label>
                <input type="date" id="new-promo-expires" required>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: var(--space-3);">Create Code</button>
          </form>
          <div id="promo-create-result" style="margin-top: var(--space-2); display: none;"></div>
        </div>

        <!-- Active Promo Codes -->
        <div style="background: var(--gray-50); padding: var(--space-4); border-radius: var(--radius);">
          <h3 style="margin-bottom: var(--space-3);">Active Promo Codes</h3>
          <div id="active-promo-codes-list">
            ${Object.entries(analytics.promoCodesUsed || {}).length > 0
              ? Object.entries(analytics.promoCodesUsed).map(([code, count]) => `
                <div style="display: flex; justify-content: space-between; padding: var(--space-2); border-bottom: 1px solid var(--gray-200);">
                  <span style="font-weight: 500;">${code}</span>
                  <span style="color: var(--gray-500);">${count} uses</span>
                </div>
              `).join('')
              : '<p style="color: var(--gray-500);">No promo codes used yet</p>'
            }
          </div>
        </div>

        <div style="margin-top: var(--space-4); text-align: center;">
          <button class="btn btn-outline" onclick="closeModal('admin-dashboard-modal')">Close Dashboard</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
}

/**
 * Handle promo code creation
 */
async function handleCreatePromoCode(event) {
  event.preventDefault();

  const code = document.getElementById('new-promo-code').value.toUpperCase();
  const discount = parseInt(document.getElementById('new-promo-discount').value);
  const description = document.getElementById('new-promo-description').value;
  const expiresAt = document.getElementById('new-promo-expires').value;
  const resultDiv = document.getElementById('promo-create-result');

  const codeData = {
    code,
    discount,
    type: 'percent',
    description,
    expiresAt,
    maxUses: 100
  };

  let result;
  if (typeof AdminService !== 'undefined') {
    result = await AdminService.createPromoCode(codeData);
  } else {
    // Add to local promo codes
    if (typeof PromoCodeService !== 'undefined') {
      PromoCodeService.codes[code] = {
        discount,
        type: 'percent',
        description,
        expiresAt,
        maxUses: 100
      };
    }
    result = { success: true };
  }

  resultDiv.style.display = 'block';
  if (result.success) {
    resultDiv.innerHTML = `<span style="color: var(--success);">Promo code ${code} created successfully!</span>`;
    event.target.reset();
  } else {
    resultDiv.innerHTML = `<span style="color: var(--error);">${result.error || 'Failed to create promo code'}</span>`;
  }
}

/**
 * Close modal by ID
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ============================================
// Form Helpers
// ============================================
function toggleBehavior(element) {
  element.classList.toggle('selected');

  const behavior = element.dataset.behavior;
  const restriction = element.dataset.restriction;

  if (behavior) {
    if (element.classList.contains('selected')) {
      if (!AppState.userData.healthBehaviors.includes(behavior)) {
        AppState.userData.healthBehaviors.push(behavior);
      }
    } else {
      AppState.userData.healthBehaviors = AppState.userData.healthBehaviors.filter(b => b !== behavior);
    }
  }

  if (restriction) {
    if (element.classList.contains('selected')) {
      if (!AppState.userData.dietaryRestrictions.includes(restriction)) {
        AppState.userData.dietaryRestrictions.push(restriction);
      }
    } else {
      AppState.userData.dietaryRestrictions = AppState.userData.dietaryRestrictions.filter(r => r !== restriction);
    }
  }
}

function selectRating(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;

  // Support both old rating-item and new icon-select-item styles
  group.querySelectorAll('.rating-item, .icon-select-item').forEach(item => {
    item.classList.remove('selected');
    if (item.dataset.value === value) {
      item.classList.add('selected');
    }
  });

  switch (groupId) {
    case 'sleep-quality':
      AppState.userData.sleepQuality = value;
      break;
    case 'chronotype':
      AppState.userData.chronotype = value;
      break;
    case 'stress-level':
      AppState.userData.stressLevel = value;
      break;
    case 'workout-location':
      AppState.userData.workoutLocation = value;
      break;
    case 'equipment-access':
      AppState.userData.equipmentAccess = value;
      break;
    case 'intensity-preference':
      AppState.userData.intensityPreference = value;
      break;
    case 'pain-level':
      AppState.ptPainLevel = value;
      break;
  }
}

// ============================================
// Chatbot Functions
// ============================================
function toggleChatbot() {
  const chatWindow = document.getElementById('chatbot-window');
  const chatContainer = document.getElementById('chatbot-container');

  if (chatWindow && chatContainer) {
    chatWindow.classList.toggle('open');
    AppState.chatbotOpen = chatWindow.classList.contains('open');

    // Make fullscreen on mobile devices
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      if (AppState.chatbotOpen) {
        chatContainer.classList.add('chatbot-fullscreen');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        chatContainer.classList.remove('chatbot-fullscreen');
        document.body.style.overflow = '';
      }
    }

    if (AppState.chatbotOpen) {
      ChatbotSystem.renderMessages();
      document.getElementById('chatbot-input')?.focus();
    }
  }
}

// AI Backend Configuration - set this to connect to an external AI service
const AIBackendConfig = {
  enabled: typeof BackendConfig !== 'undefined' && BackendConfig.BACKEND_ENABLED,
  endpoint: typeof BackendConfig !== 'undefined' ? BackendConfig.endpoints.baseUrl + '/api/chat' : '',
};

async function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  if (!input || !input.value.trim()) return;

  const userMessage = input.value.trim();
  input.value = '';

  ChatbotSystem.addMessage(userMessage, true);

  // Show typing indicator
  showTypingIndicator();

  try {
    let response;

    if (AIBackendConfig.enabled && AIBackendConfig.endpoint) {
      // Use external AI backend
      response = await fetchAIResponse(userMessage);
    } else {
      // Use built-in response system
      await new Promise(resolve => setTimeout(resolve, 600));
      response = ChatbotSystem.getResponse(userMessage);
    }

    hideTypingIndicator();
    ChatbotSystem.addMessage(response.text, false, response.isWarning);

    // Execute any actions the AI suggested
    if (response.action) {
      executeAIAction(response.action);
    }
  } catch (error) {
    hideTypingIndicator();
    ChatbotSystem.addMessage("I'm having trouble connecting right now. Please try again in a moment.", false, true);
  }
}

function showTypingIndicator() {
  const messagesEl = document.getElementById('chatbot-messages');
  if (messagesEl) {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chatbot-message bot typing';
    indicator.innerHTML = `
      <div class="chatbot-message-avatar caribou-avatar">
        <svg viewBox="0 0 459 391" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M142.001 164.001V301.001C156.334 330.334 195.601 388.401 238.001 386.001C280.401 383.601 317.001 328.334 330.001 301.001H238.001M142.001 164.001C143.334 142.334 164.401 98.8009 238.001 98.0009C311.601 97.2009 330.001 141.668 330.001 164.001M238.001 301.001C228.668 292.668 210.601 274.401 213.001 268.001C216.001 260.001 263.001 257.001 261.001 268.001C259.401 276.801 245.001 293.668 238.001 301.001ZM254.001 194.001C255.668 190.001 262.601 182.001 277.001 182.001C291.401 182.001 298.334 190.001 300.001 194.001" stroke="var(--primary-500)" stroke-width="10" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="chatbot-message-content">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesEl.appendChild(indicator);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

async function fetchAIResponse(message) {
  // Get Firebase auth token if available
  const headers = { 'Content-Type': 'application/json' };
  if (typeof AuthService !== 'undefined' && AuthService.currentUser && AuthService.currentUser.getIdToken) {
    try {
      const token = await AuthService.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('[Chat] Could not get auth token, continuing without auth');
    }
  }

  // Build rich context for the AI
  const allConditions = getAllUserConditions();
  const conditionNames = allConditions.map(c => typeof c === 'string' ? c : (c.name || c));

  const response = await fetch(AIBackendConfig.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      conversationHistory: ChatbotSystem.messages.slice(-10).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      })),
      context: {
        userName: AppState.userData.firstName || '',
        diagnosis: AppState.userData.diagnosis || '',
        conditions: conditionNames,
        otherConditions: AppState.userData.otherConditions || '',
        medications: AppState.userData.medications || '',
        tier: AppState.userTier || 'free',
        activityLevel: AppState.userData.activityLevel || '',
        dietaryPreferences: AppState.userData.dietaryPreferences || '',
        allergies: AppState.userData.allergies || '',
        age: AppState.userData.age || '',
        sleepHours: AppState.userData.sleepHours || '',
        stressLevel: AppState.userData.stressLevel || ''
      }
    })
  });

  if (!response.ok) {
    // Fallback to local chatbot if API fails
    console.warn('[Chat] AI API returned', response.status, '- falling back to local responses');
    await new Promise(resolve => setTimeout(resolve, 400));
    return ChatbotSystem.getResponse(message);
  }
  return await response.json();
}

function executeAIAction(action) {
  // Execute actions suggested by the AI
  switch (action.type) {
    case 'navigate':
      navigateTo(action.page);
      break;
    case 'markTaskComplete':
      if (action.taskType && action.taskId) {
        AppState.completedTasks[action.taskType].push(action.taskId);
        saveState();
      }
      break;
    case 'addMedication':
      if (action.medication) {
        const current = AppState.userData.medications || '';
        AppState.userData.medications = current ? `${current}\n${action.medication}` : action.medication;
        saveState();
      }
      break;
    case 'updatePreference':
      if (action.key && action.value !== undefined) {
        AppState.userData[action.key] = action.value;
        saveState();
      }
      break;
  }
}

function sendSuggestion(text) {
  const input = document.getElementById('chatbot-input');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function handleChatKeypress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

// ============================================
// Utility Functions
// ============================================
function formatTime(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function showLoading(show, message = null, subtitle = null) {
  const overlay = document.getElementById('loading-overlay');
  const messageEl = document.getElementById('loading-message');
  const subtitleEl = document.getElementById('loading-subtitle');

  if (overlay) overlay.style.display = show ? 'flex' : 'none';

  if (messageEl && message) {
    messageEl.textContent = message;
  } else if (messageEl && !message) {
    messageEl.textContent = 'Creating your personalized care plan...';
  }

  if (subtitleEl && subtitle) {
    subtitleEl.textContent = subtitle;
  } else if (subtitleEl) {
    subtitleEl.textContent = '';
  }

  AppState.isLoading = show;
}

// Show Caribou mascot loading with progressive messages
function showCaribouLoading(messages, callback) {
  const overlay = document.getElementById('loading-overlay');
  const messageEl = document.getElementById('loading-message');
  const subtitleEl = document.getElementById('loading-subtitle');

  if (!overlay) {
    callback();
    return;
  }

  overlay.style.display = 'flex';
  let currentIndex = 0;

  const showNextMessage = () => {
    if (currentIndex < messages.length) {
      const msg = messages[currentIndex];
      if (messageEl) messageEl.textContent = msg.text;
      if (subtitleEl) subtitleEl.textContent = msg.subtitle || '';
      currentIndex++;
      setTimeout(showNextMessage, msg.duration || 1500);
    } else {
      overlay.style.display = 'none';
      callback();
    }
  };

  showNextMessage();
}

// ============================================
// Condition Page Functions
// ============================================
function updateConditionPage() {
  const allConditions = getAllUserConditions();
  // Get condition data - use first condition from list if available, otherwise fallback to diagnosis or 'other'
  const primaryConditionId = allConditions.length > 0 ? allConditions[0] : (AppState.userData.diagnosis || 'other');
  const primaryCondition = ClinicalDatabase.getConditionData(primaryConditionId);
  const conditionNameEl = document.getElementById('primary-condition-name');
  const conditionInfoEl = document.getElementById('primary-condition-info');
  const hasMultipleConditions = allConditions.length > 1;

  // Update page title and subtitle based on number of conditions
  const pageTitleEl = document.getElementById('condition-page-title');
  const pageSubtitleEl = document.getElementById('condition-page-subtitle');
  if (pageTitleEl) {
    pageTitleEl.textContent = hasMultipleConditions ? 'Understanding Your Conditions' : 'Understanding Your Condition';
  }
  if (pageSubtitleEl) {
    pageSubtitleEl.textContent = hasMultipleConditions
      ? 'Learn about your diagnoses and how they work together in your care plan.'
      : 'Learn about your diagnosis and how to manage it effectively.';
  }

  // Show/hide multiple conditions overview section
  const overviewCard = document.getElementById('conditions-overview-card');
  const integratedPlanCard = document.getElementById('integrated-care-plan-card');
  const primaryConditionCard = document.getElementById('primary-condition-card');

  if (hasMultipleConditions) {
    // Show the overview and integrated plan cards
    if (overviewCard) overviewCard.style.display = 'block';
    if (integratedPlanCard) integratedPlanCard.style.display = 'block';

    // Hide the single primary condition card (we'll show all conditions in overview)
    if (primaryConditionCard) primaryConditionCard.style.display = 'none';

    // Populate conditions overview
    populateConditionsOverview(allConditions);

    // Populate integrated care plan
    populateIntegratedCarePlan(allConditions);
  } else {
    // Hide multiple conditions sections
    if (overviewCard) overviewCard.style.display = 'none';
    if (integratedPlanCard) integratedPlanCard.style.display = 'none';
    if (primaryConditionCard) primaryConditionCard.style.display = 'block';
  }

  if (conditionNameEl) {
    conditionNameEl.textContent = primaryCondition.name;
  }

  // Update the subtitle with condition category or description
  const conditionSubtitleEl = document.getElementById('primary-condition-subtitle');
  if (conditionSubtitleEl) {
    const category = primaryCondition.category || 'Your Primary Diagnosis';
    conditionSubtitleEl.textContent = category;
  }

  if (conditionInfoEl) {
    // Build clinical information section if available
    const clinicalSection = primaryCondition.clinicalInfo ? `
      <div class="condition-section clinical-info-section" style="background: linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%); padding: var(--space-4); border-radius: var(--radius); margin-bottom: var(--space-4);">
        <h3 style="display: flex; align-items: center; gap: var(--space-2);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Clinical Information
        </h3>
        <div style="margin-top: var(--space-3);">
          <div style="margin-bottom: var(--space-3);">
            <strong style="color: var(--gray-700); font-size: 0.9rem;">Definition</strong>
            <p style="color: var(--gray-600); line-height: 1.6; margin-top: var(--space-1);">${primaryCondition.clinicalInfo.definition}</p>
          </div>
          <div style="margin-bottom: var(--space-3);">
            <strong style="color: var(--gray-700); font-size: 0.9rem;">Prevalence</strong>
            <p style="color: var(--gray-600); line-height: 1.6; margin-top: var(--space-1);">${primaryCondition.clinicalInfo.prevalence}</p>
          </div>
          <div style="margin-bottom: var(--space-3);">
            <strong style="color: var(--gray-700); font-size: 0.9rem;">Prognosis</strong>
            <p style="color: var(--gray-600); line-height: 1.6; margin-top: var(--space-1);">${primaryCondition.clinicalInfo.prognosis}</p>
          </div>
          <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--gray-200);">
            <strong>Sources:</strong> ${primaryCondition.clinicalInfo.reference}
          </div>
        </div>
      </div>
    ` : '';

    // Build calorie section - shown for all users
    const isWeightManagement = ['weight-loss', 'weight-gain', 'obesity'].includes(primaryConditionId);
    const calories = calculateDailyCalories(AppState.userData);
    // For weight management, calories is already adjusted. Calculate maintenance for reference.
    const maintenanceCalories = isWeightManagement
      ? (calories + (primaryConditionId === 'weight-loss' || primaryConditionId === 'obesity' ? 500 : primaryConditionId === 'weight-gain' ? -400 : 0))
      : calories; // For non-weight-management, maintenance = daily target

    // Maintenance calorie section for non-weight-management users
    const maintenanceCalorieSection = (!isWeightManagement && AppState.userData.age && AppState.userData.weight) ? `
      <div class="condition-section calorie-info" style="background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, var(--gray-50) 100%); padding: var(--space-5); border-radius: var(--radius-lg); margin-bottom: var(--space-4); border: 1px solid var(--primary-200);">
        <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Your Daily Calorie Target
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          <div style="text-align: center; padding: var(--space-4); background: white; border-radius: var(--radius); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 0.75rem; color: var(--primary-600); text-transform: uppercase; margin-bottom: var(--space-1);">Maintenance Calories</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary-600);">${maintenanceCalories}</div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">calories/day</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: var(--space-3); border-radius: var(--radius); font-size: 0.875rem; color: var(--gray-600); line-height: 1.5;">
          <strong style="color: var(--gray-700);">What this means:</strong> Eating approximately ${maintenanceCalories} calories per day will help you maintain your current weight based on your age, sex, height, weight, and activity level.
        </div>
      </div>
    ` : '';

    const weightManagementSection = isWeightManagement ? `
      <div class="condition-section weight-management-info" style="background: linear-gradient(135deg, ${primaryConditionId === 'weight-gain' ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)'} 0%, var(--gray-50) 100%); padding: var(--space-5); border-radius: var(--radius-lg); margin-bottom: var(--space-4); border: 1px solid ${primaryConditionId === 'weight-gain' ? 'var(--primary-200)' : 'rgba(255, 107, 107, 0.3)'};">
        <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${primaryConditionId === 'weight-gain' ? 'var(--primary-600)' : '#FF6B6B'}" stroke-width="2">
            <path d="M12 20V10M18 20V4M6 20v-4"/>
          </svg>
          Your Personalized Calorie Target
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          <div style="text-align: center; padding: var(--space-4); background: white; border-radius: var(--radius); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: var(--space-1);">Maintenance</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--gray-700);">${maintenanceCalories}</div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">calories/day</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: white; border-radius: var(--radius); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 0.75rem; color: ${primaryConditionId === 'weight-gain' ? 'var(--primary-600)' : '#FF6B6B'}; text-transform: uppercase; margin-bottom: var(--space-1);">${primaryConditionId === 'weight-gain' ? '✨ Surplus Target' : '🔥 Deficit Target'}</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: ${primaryConditionId === 'weight-gain' ? 'var(--primary-600)' : '#FF6B6B'};">${calories}</div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">calories/day</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: white; border-radius: var(--radius); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: var(--space-1);">${primaryConditionId === 'weight-gain' ? 'Daily Surplus' : 'Daily Deficit'}</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--gray-700);">${primaryConditionId === 'weight-gain' ? '+400' : '-500'}</div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">calories</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: var(--space-3); border-radius: var(--radius); font-size: 0.875rem; color: var(--gray-600); line-height: 1.5;">
          <strong style="color: var(--gray-700);">What this means:</strong> ${primaryConditionId === 'weight-gain'
            ? 'Eating 400 calories above your maintenance level supports healthy muscle gain of approximately 0.25-0.5 kg (0.5-1 lb) per week when combined with strength training.'
            : 'Eating 500 calories below your maintenance level promotes safe, sustainable weight loss of approximately 0.5 kg (1 lb) per week while preserving muscle mass.'}
        </div>
      </div>
    ` : '';

    conditionInfoEl.innerHTML = `
      <div class="condition-section" style="border-top: none; padding-top: 0;">
        <h3>About ${primaryCondition.name}</h3>
        <p style="color: var(--gray-600); line-height: 1.6;">
          ${primaryCondition.description || 'Work with your healthcare provider to understand your condition and develop an appropriate management plan.'}
        </p>
      </div>

      ${weightManagementSection}

      ${maintenanceCalorieSection}

      ${clinicalSection}

      ${(primaryCondition.nutritionGuidelines && primaryCondition.nutritionGuidelines.length > 0) ? `
      <div class="condition-section">
        <h3>Nutrition Guidelines</h3>
        <ul style="list-style: none; padding: 0;">
          ${primaryCondition.nutritionGuidelines.map(g => `
            <li style="display: flex; gap: var(--space-3); margin-bottom: var(--space-3); padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span style="color: var(--gray-700);">${g}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${(primaryCondition.exercises && primaryCondition.exercises.length > 0) ? `
      <div class="condition-section">
        <h3>Recommended Exercises</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
          ${primaryCondition.exercises.map(ex => `
            <div style="padding: var(--space-4); background: var(--primary-50); border-radius: var(--radius); border: 1px solid var(--primary-100);">
              <h4 style="color: var(--primary-700); margin-bottom: var(--space-2);">${ex.name}</h4>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: var(--space-2);">${ex.description}</p>
              <span style="font-size: 0.75rem; color: var(--gray-500);">${ex.duration}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${primaryCondition.recoveryWeeks ? `
        <div class="condition-section">
          <h3>Recovery Timeline</h3>
          <p style="color: var(--gray-600);">Typical recovery time: <strong>${primaryCondition.recoveryWeeks} weeks</strong>. Individual recovery varies - follow your clinician's guidance.</p>
        </div>
      ` : ''}
    `;
  }

  // Handle other conditions
  const otherConditionsSection = document.getElementById('other-conditions-section');
  const otherConditionsList = document.getElementById('other-conditions-list');

  if (AppState.userData.otherConditions && AppState.userData.otherConditions.trim()) {
    const conditions = AppState.userData.otherConditions.split(/[,\n]+/).map(c => c.trim()).filter(c => c);

    if (conditions.length > 0 && otherConditionsSection && otherConditionsList) {
      otherConditionsSection.style.display = 'block';
      otherConditionsList.innerHTML = conditions.map(condition => `
        <div class="other-condition-card">
          <h4>${condition}</h4>
          <p style="color: var(--gray-600); font-size: 0.875rem;">
            Discuss management strategies for ${condition} with your healthcare provider to understand how it may interact with your primary condition.
          </p>
        </div>
      `).join('');
    }
  }

  // Load image previews
  loadImagePreviews();

  // Load doctor's goals
  loadDoctorGoals();
}

// Populate conditions overview for multiple conditions
function populateConditionsOverview(conditionIds) {
  const overviewContent = document.getElementById('conditions-overview-content');
  if (!overviewContent) return;

  // Build synopsis for each condition
  let overviewHTML = '<div style="display: grid; gap: var(--space-4);">';

  conditionIds.forEach((condId, index) => {
    const condData = ClinicalDatabase.getConditionData(condId);
    const isPrimary = index === 0;
    const borderColor = isPrimary ? 'var(--primary-500)' : 'var(--gray-300)';
    const labelBg = isPrimary ? 'var(--primary-500)' : 'var(--gray-500)';

    overviewHTML += `
      <div style="padding: var(--space-4); background: white; border-radius: var(--radius); border-left: 4px solid ${borderColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
          <h3 style="margin: 0; color: var(--gray-800);">${condData.name}</h3>
          <span style="background: ${labelBg}; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">
            ${isPrimary ? 'Primary' : 'Secondary'}
          </span>
        </div>
        <p style="color: var(--gray-600); line-height: 1.6; margin: 0;">
          ${condData.description || 'Work with your healthcare provider to develop an appropriate management plan for this condition.'}
        </p>
        ${condData.recoveryWeeks ? `
          <p style="color: var(--gray-500); font-size: 0.85rem; margin-top: var(--space-2); margin-bottom: 0;">
            <strong>Typical recovery:</strong> ${condData.recoveryWeeks} weeks
          </p>
        ` : ''}
      </div>
    `;
  });

  overviewHTML += '</div>';
  overviewContent.innerHTML = overviewHTML;
}

// Populate integrated care plan for multiple conditions
function populateIntegratedCarePlan(conditionIds) {
  const planContent = document.getElementById('integrated-care-content');
  if (!planContent) return;

  // Gather all condition names
  const conditionNames = conditionIds.map(id => ClinicalDatabase.getConditionData(id).name);
  const conditionList = conditionNames.length > 2
    ? conditionNames.slice(0, -1).join(', ') + ', and ' + conditionNames[conditionNames.length - 1]
    : conditionNames.join(' and ');

  // Combine nutrition guidelines, exercises, and wellness from all conditions
  const allNutritionGuidelines = new Set();
  const allExercises = [];
  const allWellnessActivities = [];

  conditionIds.forEach(condId => {
    const condData = ClinicalDatabase.getConditionData(condId);
    if (condData.nutritionGuidelines) {
      condData.nutritionGuidelines.forEach(g => allNutritionGuidelines.add(g));
    }
    if (condData.exercises) {
      condData.exercises.forEach(ex => {
        if (!allExercises.find(e => e.name === ex.name)) {
          allExercises.push(ex);
        }
      });
    }
    if (condData.wellnessActivities) {
      condData.wellnessActivities.forEach(activity => {
        if (!allWellnessActivities.find(a => a.name === activity.name)) {
          allWellnessActivities.push({ ...activity, conditionName: condData.name });
        }
      });
    }
  });

  let planHTML = `
    <div style="margin-bottom: var(--space-6);">
      <p style="color: var(--gray-700); line-height: 1.7; font-size: 1rem;">
        Your care plan has been designed to address <strong>${conditionList}</strong> together.
        When managing multiple conditions, certain treatments and lifestyle changes can benefit all conditions simultaneously,
        while others need to be carefully coordinated to avoid conflicts.
      </p>
    </div>

    <div class="condition-section" style="background: #f0fdf4; padding: var(--space-4); border-radius: var(--radius); margin-bottom: var(--space-4);">
      <h3 style="display: flex; align-items: center; gap: var(--space-2); color: #166534;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        Fitness Approach
      </h3>
      <p style="color: var(--gray-600); margin-top: var(--space-2); line-height: 1.6;">
        Your fitness program focuses on exercises that help with all your conditions when possible.
        Some exercises may target specific conditions while being gentle on areas affected by others.
        Always communicate with your healthcare provider about all your conditions so they can modify exercises appropriately.
      </p>
      ${allExercises.length > 0 ? `
        <div style="margin-top: var(--space-4);">
          <strong style="color: var(--gray-700);">Recommended exercises across your conditions:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2);">
            ${allExercises.slice(0, 6).map(ex => `
              <span style="background: white; padding: var(--space-1) var(--space-3); border-radius: 20px; font-size: 0.85rem; border: 1px solid #bbf7d0;">
                ${ex.name}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="condition-section" style="background: #fff7ed; padding: var(--space-4); border-radius: var(--radius); margin-bottom: var(--space-4);">
      <h3 style="display: flex; align-items: center; gap: var(--space-2); color: #9a3412;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        Nutrition Strategy
      </h3>
      <p style="color: var(--gray-600); margin-top: var(--space-2); line-height: 1.6;">
        Your nutrition plan combines dietary guidelines that support healing and management of all your conditions.
        Anti-inflammatory foods and proper hydration benefit most musculoskeletal and chronic conditions.
      </p>
      ${allNutritionGuidelines.size > 0 ? `
        <div style="margin-top: var(--space-4);">
          <strong style="color: var(--gray-700);">Combined nutrition guidelines:</strong>
          <ul style="margin-top: var(--space-2); padding-left: var(--space-4); color: var(--gray-600);">
            ${Array.from(allNutritionGuidelines).slice(0, 5).map(g => `
              <li style="margin-bottom: var(--space-1);">${g}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>

    <div class="condition-section" style="background: #eff6ff; padding: var(--space-4); border-radius: var(--radius);">
      <h3 style="display: flex; align-items: center; gap: var(--space-2); color: #1e40af;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        Wellness & Recovery Goals
      </h3>
      <p style="color: var(--gray-600); margin-top: var(--space-2); line-height: 1.6;">
        Managing multiple conditions requires patience and consistency. Your wellness goals focus on:
      </p>
      <ul style="margin-top: var(--space-2); padding-left: var(--space-4); color: var(--gray-600);">
        <li style="margin-bottom: var(--space-1);">Gradual progress that accommodates all your conditions</li>
        <li style="margin-bottom: var(--space-1);">Stress management techniques that support overall healing</li>
        <li style="margin-bottom: var(--space-1);">Adequate rest and recovery time between activities</li>
        <li style="margin-bottom: var(--space-1);">Regular communication with all your healthcare providers</li>
        <li style="margin-bottom: var(--space-1);">Tracking symptoms across conditions to identify patterns</li>
      </ul>
      ${allWellnessActivities.length > 0 ? `
        <div style="margin-top: var(--space-4);">
          <strong style="color: var(--gray-700);">Condition-specific wellness activities:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2);">
            ${allWellnessActivities.slice(0, 6).map(activity => `
              <span style="background: white; padding: var(--space-1) var(--space-3); border-radius: 20px; font-size: 0.85rem; border: 1px solid #bfdbfe;">
                ${activity.name}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div style="margin-top: var(--space-6); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius); border: 1px solid var(--gray-200);">
      <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0; display: flex; align-items: flex-start; gap: var(--space-2);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/>
        </svg>
        <span>
          <strong>Important:</strong> Always inform each of your healthcare providers about all your conditions.
          This helps them coordinate your care and avoid treatments that might conflict with each other.
        </span>
      </p>
    </div>
  `;

  planContent.innerHTML = planHTML;
}

function getConditionDescription(diagnosisId) {
  const condition = ClinicalDatabase.getConditionData(diagnosisId);
  return condition.description || 'Work with your healthcare provider to understand your condition and develop an appropriate management plan.';
}

// ============================================
// Profile Page Functions
// ============================================
function updateProfilePage() {
  // Populate form fields with current data
  const fields = {
    'profile-name': AppState.userData.firstName,
    'profile-age': AppState.userData.age,
    'profile-height': AppState.userData.height,
    'profile-weight': AppState.userData.weight,
    'profile-pharmacy': AppState.userData.pharmacyName,
    'profile-pharmacy-phone': AppState.userData.pharmacyPhone,
    'profile-food-notes': AppState.userData.otherDietaryNotes,
    'profile-breakfast-time': AppState.userData.breakfastTime,
    'profile-lunch-time': AppState.userData.lunchTime,
    'profile-dinner-time': AppState.userData.dinnerTime,
    'profile-clinician': AppState.userData.clinicianName,
    'profile-clinician-phone': AppState.userData.clinicianPhone,
    'profile-diagnosis': AppState.userData.diagnosis
  };

  // Build other conditions - keep weight management goal separate as a tag
  let otherConditions = AppState.userData.otherConditions || '';
  const wmGoal = AppState.userData.weightManagement?.goal;
  // Don't append weight management goal text into the textarea anymore
  // It will be shown as a tag on the condition card instead
  fields['profile-other-conditions'] = otherConditions;

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
  });

  // Set up profile unit toggle to match intake form preference
  const userUnits = AppState.userData.units || 'metric';
  toggleProfileUnits(userUnits);

  // Render medications list
  renderMedicationsList();
  populateMedicationSuggestions();
  populateConditionDropdown();

  // Populate primary conditions UI (for Premium+ tiers)
  populatePrimaryConditionsUI();

  // Populate dietary restrictions checkboxes
  const dietaryContainer = document.getElementById('profile-dietary-restrictions');
  if (dietaryContainer) {
    const restrictions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-allergy', 'low-sodium'];
    dietaryContainer.innerHTML = restrictions.map(r => `
      <label class="checkbox-label">
        <input type="checkbox" value="${r}" ${AppState.userData.dietaryRestrictions?.includes(r) ? 'checked' : ''}>
        <span>${r.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </label>
    `).join('');
  }

  // Handle tier-based condition editing
  const conditionLocked = document.getElementById('condition-locked-message');
  const conditionEdit = document.getElementById('condition-edit-section');
  const tierBadge = document.getElementById('condition-tier-badge');
  const tierDisplay = document.getElementById('current-tier-display');

  // Premium tier and above can edit conditions (Premium: 2-3 conditions, Family/Enterprise: unlimited)
  const canEditCondition = hasTierAccess('premium');

  if (conditionLocked) conditionLocked.style.display = canEditCondition ? 'none' : 'flex';
  if (conditionEdit) conditionEdit.style.display = canEditCondition ? 'block' : 'none';
  if (tierBadge) tierBadge.style.display = canEditCondition ? 'none' : 'inline-block';

  // Populate weight management goal tag
  const conditionGoalTags = document.getElementById('condition-goal-tags');
  if (conditionGoalTags) {
    const wmGoalVal = AppState.userData.weightManagement?.goal;
    if (wmGoalVal) {
      const goalTagLabels = {
        'lose-10': 'Losing 10 lbs or less',
        'lose-25': 'Losing 10-25 lbs',
        'lose-50': 'Losing 20-50 lbs',
        'lose-50plus': 'Losing 50+ lbs',
        'gain-muscle': 'Building muscle / Gaining weight',
        'maintain': 'Maintaining current weight'
      };
      const goalTag = goalTagLabels[wmGoalVal] || wmGoalVal;
      conditionGoalTags.style.display = 'flex';
      conditionGoalTags.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center;">
          <span style="font-weight: 600; color: var(--gray-700);">Weight Loss</span>
          <span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; background: var(--primary-light); color: var(--primary-dark); border: 1px solid var(--primary-200);">${goalTag}</span>
        </div>
      `;
    } else {
      conditionGoalTags.style.display = 'none';
    }
  }

  if (tierDisplay) {
    const tierNames = { 'free': 'Free', 'premium': 'Premium', 'family': 'Family', 'enterprise': 'Enterprise' };
    const tierName = tierNames[AppState.userTier] || 'Free';
    const tierDescriptions = {
      'enterprise': 'Full access with health coaching & advanced AI',
      'family': 'Full access with multiple profiles & Cura 24/7',
      'premium': '2-3 conditions with enhanced AI personalization',
      'free': 'Basic care plan with one condition'
    };
    tierDisplay.innerHTML = `
      <div class="tier-display-badge ${AppState.userTier || 'free'}">${tierName}</div>
      <p style="color: var(--gray-500); font-size: 0.875rem; margin-top: var(--space-2);">
        ${tierDescriptions[AppState.userTier] || tierDescriptions['free']}
      </p>
    `;
  }

  // Update account display (show email, change password button if logged in)
  updateAccountDisplay();

  // Load documents section
  loadProfileDocuments();

  // Load health account connections
  loadHealthAccounts();

  // Load wearable device connections
  loadWearables();

  // Load family profiles (Family tier only)
  loadFamilyProfiles();
}

function toggleProfileUnits(unit) {
  const metricInputs = document.getElementById('profile-metric-inputs');
  const imperialInputs = document.getElementById('profile-imperial-inputs');
  const toggleBtns = document.querySelectorAll('#profile-unit-toggle .unit-option');

  toggleBtns.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.unit === unit);
  });

  if (unit === 'imperial') {
    if (metricInputs) metricInputs.style.display = 'none';
    if (imperialInputs) imperialInputs.style.display = 'flex';

    // Convert stored metric values to imperial for display
    const heightCm = parseFloat(AppState.userData.height) || 0;
    const weightKg = parseFloat(AppState.userData.weight) || 0;

    if (heightCm > 0) {
      const totalInches = heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      const ftEl = document.getElementById('profile-height-ft');
      const inEl = document.getElementById('profile-height-in');
      if (ftEl) ftEl.value = feet;
      if (inEl) inEl.value = inches;
    }
    if (weightKg > 0) {
      const lbs = Math.round(weightKg / 0.453592);
      const lbsEl = document.getElementById('profile-weight-lbs');
      if (lbsEl) lbsEl.value = lbs;
    }
  } else {
    if (metricInputs) metricInputs.style.display = 'flex';
    if (imperialInputs) imperialInputs.style.display = 'none';

    // Populate metric fields with stored values
    const heightEl = document.getElementById('profile-height');
    const weightEl = document.getElementById('profile-weight');
    if (heightEl && AppState.userData.height) heightEl.value = AppState.userData.height;
    if (weightEl && AppState.userData.weight) weightEl.value = AppState.userData.weight;
  }

  AppState.userData.units = unit;
}

function saveProfile() {
  // Store old values to detect changes
  const oldRestrictions = [...(AppState.userData.dietaryRestrictions || [])];
  const oldDietaryNotes = AppState.userData.otherDietaryNotes || '';

  // Collect form data
  AppState.userData.firstName = document.getElementById('profile-name')?.value || AppState.userData.firstName;
  AppState.userData.age = document.getElementById('profile-age')?.value || AppState.userData.age;

  // Handle unit-aware height/weight saving
  const profileUnits = AppState.userData.units || 'metric';
  if (profileUnits === 'imperial') {
    const ft = parseFloat(document.getElementById('profile-height-ft')?.value) || 0;
    const inches = parseFloat(document.getElementById('profile-height-in')?.value) || 0;
    const lbs = parseFloat(document.getElementById('profile-weight-lbs')?.value) || 0;
    if (ft || inches) AppState.userData.height = Math.round((ft * 30.48) + (inches * 2.54));
    if (lbs) AppState.userData.weight = Math.round(lbs * 0.453592);
  } else {
    AppState.userData.height = document.getElementById('profile-height')?.value || AppState.userData.height;
    AppState.userData.weight = document.getElementById('profile-weight')?.value || AppState.userData.weight;
  }
  AppState.userData.medications = document.getElementById('profile-medications')?.value || AppState.userData.medications;
  AppState.userData.pharmacyName = document.getElementById('profile-pharmacy')?.value || AppState.userData.pharmacyName;
  AppState.userData.pharmacyPhone = document.getElementById('profile-pharmacy-phone')?.value || AppState.userData.pharmacyPhone;
  AppState.userData.otherDietaryNotes = document.getElementById('profile-food-notes')?.value || AppState.userData.otherDietaryNotes;
  AppState.userData.breakfastTime = document.getElementById('profile-breakfast-time')?.value || AppState.userData.breakfastTime;
  AppState.userData.lunchTime = document.getElementById('profile-lunch-time')?.value || AppState.userData.lunchTime;
  AppState.userData.dinnerTime = document.getElementById('profile-dinner-time')?.value || AppState.userData.dinnerTime;
  AppState.userData.clinicianName = document.getElementById('profile-clinician')?.value || AppState.userData.clinicianName;
  AppState.userData.clinicianPhone = document.getElementById('profile-clinician-phone')?.value || AppState.userData.clinicianPhone;

  // Collect dietary restrictions
  const checkboxes = document.querySelectorAll('#profile-dietary-restrictions input[type="checkbox"]:checked');
  AppState.userData.dietaryRestrictions = Array.from(checkboxes).map(cb => cb.value);

  // Only update condition if user has premium tier or higher
  if (hasTierAccess('premium')) {
    const newDiagnosis = document.getElementById('profile-diagnosis')?.value || AppState.userData.diagnosis;

    // Validate the new diagnosis
    const validatedDiagnosis = validateCondition(newDiagnosis);
    if (validatedDiagnosis) {
      AppState.userData.diagnosis = validatedDiagnosis.id;
      AppState.userData.diagnosisValidated = true;
    } else {
      AppState.userData.diagnosis = newDiagnosis;
      AppState.userData.diagnosisValidated = false;
    }

    // Validate other conditions
    const otherConditionsText = document.getElementById('profile-other-conditions')?.value || '';
    AppState.userData.otherConditions = otherConditionsText;
    if (otherConditionsText) {
      const parsedConditions = otherConditionsText.split(/[,\n;]+/).map(c => c.trim()).filter(c => c);
      AppState.userData.validatedSecondaryConditions = parsedConditions.map(c => {
        const validated = validateCondition(c);
        return validated ? { id: validated.id, name: validated.name, isValidated: true } : { name: c, isValidated: false };
      });
    }
  }

  // Check if dietary preferences changed - if so, intelligently update meal plan
  const newRestrictions = AppState.userData.dietaryRestrictions || [];
  const newDietaryNotes = AppState.userData.otherDietaryNotes || '';

  const restrictionsChanged = !arraysEqual(oldRestrictions, newRestrictions);
  const notesChanged = oldDietaryNotes !== newDietaryNotes;

  if (restrictionsChanged || notesChanged) {
    // Calculate what changed
    const addedRestrictions = newRestrictions.filter(r => !oldRestrictions.includes(r));
    const removedRestrictions = oldRestrictions.filter(r => !newRestrictions.includes(r));

    // Intelligently update meal plan with minimal changes
    const planChanges = updateMealPlanIntelligently(addedRestrictions, removedRestrictions, newDietaryNotes);

    saveState();

    // Show detailed feedback about changes
    if (planChanges.changedMeals.length > 0 || planChanges.groceryChanges.length > 0) {
      showMealPlanChangeNotification(planChanges, addedRestrictions, removedRestrictions);
    } else {
      alert('Your profile has been updated successfully! Your current meal plan is compatible with the new preferences.');
    }
  } else {
    saveState();
    alert('Your profile has been updated successfully!');
  }

  // Refresh pages to reflect changes
  updateDashboard();
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

// Intelligently update meal plan when dietary preferences change
function updateMealPlanIntelligently(addedRestrictions, removedRestrictions, newDietaryNotes) {
  const changes = {
    changedMeals: [],
    keptMeals: [],
    groceryChanges: []
  };

  if (!AppState.mealPlan.meals) return changes;

  const restrictions = AppState.userData.dietaryRestrictions || [];
  const userDislikes = [
    AppState.userData.otherDietaryNotes || '',
    AppState.userData.dietaryHabits || ''
  ].join(' ');

  // Check each planned meal for compatibility
  Object.entries(AppState.mealPlan.meals).forEach(([category, plannedMeals]) => {
    plannedMeals.forEach((plannedMeal, index) => {
      const meal = MealDatabase[category]?.find(m => m.id === plannedMeal.mealId);
      if (!meal) return;

      // Check if meal is still compatible with new restrictions
      const isCompatible = checkMealCompatibility(meal, restrictions, userDislikes);

      if (!isCompatible) {
        // Find a replacement meal that's similar
        const replacement = findSimilarCompatibleMeal(category, meal, restrictions, userDislikes);

        if (replacement) {
          // Track what changed
          changes.changedMeals.push({
            category,
            oldMeal: meal.name,
            newMeal: replacement.name,
            reason: addedRestrictions.length > 0 ? addedRestrictions.join(', ') : 'dietary preferences'
          });

          // Track grocery changes
          if (meal.recipe?.ingredients) {
            meal.recipe.ingredients.forEach(ing => {
              if (!replacement.recipe?.ingredients?.some(rIng =>
                rIng.toLowerCase().includes(ing.toLowerCase().split(' ').pop())
              )) {
                changes.groceryChanges.push({ action: 'remove', item: ing });
              }
            });
          }
          if (replacement.recipe?.ingredients) {
            replacement.recipe.ingredients.forEach(ing => {
              if (!meal.recipe?.ingredients?.some(mIng =>
                mIng.toLowerCase().includes(ing.toLowerCase().split(' ').pop())
              )) {
                changes.groceryChanges.push({ action: 'add', item: ing });
              }
            });
          }

          // Update the planned meal
          AppState.mealPlan.meals[category][index].mealId = replacement.id;
        }
      } else {
        changes.keptMeals.push(meal.name);
      }
    });
  });

  return changes;
}

// Check if a meal is compatible with dietary restrictions
function checkMealCompatibility(meal, restrictions, userDislikes) {
  const mealText = (meal.name + ' ' + meal.description + ' ' +
    (meal.recipe?.ingredients || []).join(' ')).toLowerCase();

  // Check dietary restrictions
  for (const restriction of restrictions) {
    const restrictedItems = MealDatabase.restrictedIngredients[restriction] || [];
    for (const item of restrictedItems) {
      if (mealText.includes(item.toLowerCase())) {
        return false;
      }
    }
  }

  // Check user dislikes
  const dislikeWords = userDislikes.toLowerCase()
    .split(/[,\n;]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2);

  for (const dislike of dislikeWords) {
    if (mealText.includes(dislike)) {
      return false;
    }
  }

  return true;
}

// Find a similar compatible meal to replace an incompatible one
function findSimilarCompatibleMeal(category, originalMeal, restrictions, userDislikes) {
  const meals = MealDatabase[category];
  if (!meals) return null;

  // Find compatible meals
  const compatibleMeals = meals.filter(meal => {
    if (meal.id === originalMeal.id) return false;
    return checkMealCompatibility(meal, restrictions, userDislikes);
  });

  if (compatibleMeals.length === 0) return null;

  // Try to find one with similar characteristics (e.g., similar prep time, calories)
  const originalCalories = originalMeal.calories || 0;
  compatibleMeals.sort((a, b) => {
    const aDiff = Math.abs((a.calories || 0) - originalCalories);
    const bDiff = Math.abs((b.calories || 0) - originalCalories);
    return aDiff - bDiff;
  });

  return compatibleMeals[0];
}

// Show notification about meal plan changes
function showMealPlanChangeNotification(changes, addedRestrictions, removedRestrictions) {
  let message = 'Your profile has been updated!\n\n';

  if (addedRestrictions.length > 0) {
    message += `Added dietary preference: ${addedRestrictions.join(', ')}\n\n`;
  }

  if (changes.changedMeals.length > 0) {
    message += 'Meal Plan Adjustments:\n';
    changes.changedMeals.forEach(change => {
      message += `- ${change.category}: "${change.oldMeal}" replaced with "${change.newMeal}"\n`;
    });
    message += '\n';
  }

  if (changes.keptMeals.length > 0) {
    message += `Kept ${changes.keptMeals.length} compatible meals in your plan.\n\n`;
  }

  if (changes.groceryChanges.length > 0) {
    const additions = changes.groceryChanges.filter(c => c.action === 'add');
    const removals = changes.groceryChanges.filter(c => c.action === 'remove');

    if (additions.length > 0) {
      message += `New grocery items: ${additions.slice(0, 5).map(c => c.item).join(', ')}${additions.length > 5 ? '...' : ''}\n`;
    }
    if (removals.length > 0) {
      message += `Removed items: ${removals.slice(0, 5).map(c => c.item).join(', ')}${removals.length > 5 ? '...' : ''}\n`;
    }
  }

  // Show custom modal instead of alert for better formatting
  showPlanUpdateModal(message, changes);
}

// Show a modal with meal plan update details
function showPlanUpdateModal(message, changes) {
  const modal = document.createElement('div');
  modal.className = 'recipe-modal';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="recipe-modal-content" style="max-width: 500px;">
      <div class="recipe-modal-header">
        <h2>Meal Plan Updated</h2>
        <button class="recipe-modal-close" onclick="this.closest('.recipe-modal').remove()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="recipe-modal-body">
        ${changes.changedMeals.length > 0 ? `
          <div style="margin-bottom: var(--space-4);">
            <h4 style="color: var(--primary-600); margin-bottom: var(--space-2);">Meal Replacements</h4>
            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-2);">
              We've made minimal changes to keep your meal plan compatible:
            </p>
            <ul style="font-size: 0.875rem; padding-left: var(--space-4);">
              ${changes.changedMeals.map(c => `
                <li style="margin-bottom: var(--space-2);">
                  <strong>${c.category}:</strong> ${c.oldMeal} &rarr; ${c.newMeal}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${changes.keptMeals.length > 0 ? `
          <div style="background: var(--success-50); padding: var(--space-3); border-radius: var(--radius); margin-bottom: var(--space-4);">
            <p style="font-size: 0.875rem; color: var(--success-700); margin: 0;">
              <strong>${changes.keptMeals.length}</strong> meals remained unchanged and are compatible with your new preferences.
            </p>
          </div>
        ` : ''}

        ${changes.groceryChanges.length > 0 ? `
          <div style="margin-bottom: var(--space-4);">
            <h4 style="color: var(--secondary-600); margin-bottom: var(--space-2);">Grocery List Changes</h4>
            ${changes.groceryChanges.filter(c => c.action === 'add').length > 0 ? `
              <p style="font-size: 0.875rem; color: var(--gray-600);">
                <strong>Added:</strong> ${changes.groceryChanges.filter(c => c.action === 'add').slice(0, 5).map(c => c.item).join(', ')}
              </p>
            ` : ''}
            ${changes.groceryChanges.filter(c => c.action === 'remove').length > 0 ? `
              <p style="font-size: 0.875rem; color: var(--gray-600);">
                <strong>Removed:</strong> ${changes.groceryChanges.filter(c => c.action === 'remove').slice(0, 5).map(c => c.item).join(', ')}
              </p>
            ` : ''}
          </div>
        ` : ''}

        <button onclick="this.closest('.recipe-modal').remove(); navigateTo('nutrition');" class="btn btn-primary" style="width: 100%;">
          View Updated Meal Plan
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function exportData() {
  const data = {
    exportDate: new Date().toISOString(),
    userData: AppState.userData,
    completedTasks: AppState.completedTasks,
    mealPlan: AppState.mealPlan,
    tier: AppState.userTier
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `caribou-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Spreadsheet Export (Week Look-Ahead Only)
// ============================================

function exportToSpreadsheet(format = 'csv') {
  // Get the week's care plan data
  const weekPlan = generateWeekLookAhead();

  if (format === 'csv') {
    exportToCSV(weekPlan);
  } else if (format === 'googleSheets') {
    exportToGoogleSheetsFormat(weekPlan);
  }
}

function generateWeekLookAhead() {
  const today = new Date();
  const weekDays = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate 7 days starting from today
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayData = {
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: {
        pt: [],
        medication: [],
        nutrition: [],
        wellness: []
      }
    };

    // Generate PT exercises for this day
    const conditionData = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
    if (conditionData && conditionData.ptExercises) {
      dayData.tasks.pt = conditionData.ptExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        notes: ex.notes || ''
      }));
    }

    // Add medication reminders
    if (AppState.userData.medicationsList && AppState.userData.medicationsList.length > 0) {
      dayData.tasks.medication = AppState.userData.medicationsList.map(med => ({
        name: med.name,
        dosage: med.dosage || '',
        frequency: med.frequency || 'once daily',
        time: med.time || 'morning',
        notes: med.notes || ''
      }));
    }

    // Add nutrition goals
    dayData.tasks.nutrition = [
      { name: 'Drink 8 glasses of water', category: 'Hydration' },
      { name: 'Eat anti-inflammatory foods', category: 'Diet' },
      { name: 'Include protein with each meal', category: 'Nutrition' }
    ];

    // Add wellness tasks
    dayData.tasks.wellness = [
      { name: 'Practice stress management', duration: '10 min' },
      { name: 'Get adequate sleep', target: '7-9 hours' }
    ];

    // Check if wellness condition (reduced PT)
    if (isGeneralWellnessCondition && isGeneralWellnessCondition(AppState.userData.diagnosis)) {
      dayData.tasks.pt = [{ name: 'Light stretching routine', duration: '10-15 minutes', notes: 'General wellness - minimal PT intervention' }];
    }

    weekDays.push(dayData);
  }

  return weekDays;
}

function exportToCSV(weekPlan) {
  // Build CSV content
  let csvContent = '';

  // Header with user info
  csvContent += `Caribou Care Plan - Weekly Export\n`;
  csvContent += `Patient: ${AppState.userData.firstName || 'User'}\n`;
  csvContent += `Condition: ${AppState.userData.diagnosis || 'Not specified'}\n`;
  csvContent += `Generated: ${new Date().toLocaleDateString()}\n`;
  csvContent += `\n`;

  // Note about weekly limitation
  csvContent += `Note: This export contains your 7-day look-ahead plan. Visit caribou.care for your complete care plan.\n`;
  csvContent += `\n`;

  // PT Exercises Section
  csvContent += `=== PHYSICAL THERAPY EXERCISES ===\n`;
  csvContent += `Day,Date,Exercise,Sets,Reps/Duration,Notes\n`;

  weekPlan.forEach(day => {
    if (day.tasks.pt && day.tasks.pt.length > 0) {
      day.tasks.pt.forEach(ex => {
        const repsOrDuration = ex.reps ? `${ex.reps} reps` : (ex.duration || '');
        csvContent += `"${day.dayName}","${day.displayDate}","${ex.name}","${ex.sets || ''}","${repsOrDuration}","${ex.notes || ''}"\n`;
      });
    } else {
      csvContent += `"${day.dayName}","${day.displayDate}","Rest day","","",""\n`;
    }
  });

  csvContent += `\n`;

  // Medications Section
  csvContent += `=== MEDICATIONS ===\n`;
  csvContent += `Medication,Dosage,Frequency,Time,Notes\n`;

  if (weekPlan[0].tasks.medication && weekPlan[0].tasks.medication.length > 0) {
    weekPlan[0].tasks.medication.forEach(med => {
      csvContent += `"${med.name}","${med.dosage}","${med.frequency}","${med.time}","${med.notes}"\n`;
    });
  } else {
    csvContent += `"No medications listed","","","",""\n`;
  }

  csvContent += `\n`;

  // Daily Schedule Template
  csvContent += `=== DAILY SCHEDULE TEMPLATE ===\n`;
  csvContent += `Time,Activity,Category\n`;
  csvContent += `"${AppState.userData.wakeTime || '07:00'}","Wake up & morning routine","Wellness"\n`;
  csvContent += `"${AppState.userData.breakfastTime || '08:00'}","Breakfast","Nutrition"\n`;
  csvContent += `"Morning","Fitness Exercises","Fitness"\n`;
  csvContent += `"${AppState.userData.lunchTime || '12:30'}","Lunch","Nutrition"\n`;
  csvContent += `"Afternoon","Light activity / Walking","Wellness"\n`;
  csvContent += `"${AppState.userData.dinnerTime || '18:30'}","Dinner","Nutrition"\n`;
  csvContent += `"Evening","Relaxation & Recovery","Wellness"\n`;
  csvContent += `"${AppState.userData.bedtime || '22:00'}","Bedtime","Sleep"\n`;

  csvContent += `\n`;
  csvContent += `=== END OF WEEKLY EXPORT ===\n`;
  csvContent += `For your complete care plan and tracking, visit caribou.care\n`;

  // Download the CSV
  downloadFile(csvContent, `caribou-week-plan-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

function exportToGoogleSheetsFormat(weekPlan) {
  // Generate a TSV (Tab-Separated Values) format that's easy to paste into Google Sheets
  let tsvContent = '';

  // Header
  tsvContent += `Caribou Care Plan - Weekly Export\t\t\t\t\t\n`;
  tsvContent += `Patient:\t${AppState.userData.firstName || 'User'}\t\t\t\t\n`;
  tsvContent += `Condition:\t${AppState.userData.diagnosis || 'Not specified'}\t\t\t\t\n`;
  tsvContent += `Generated:\t${new Date().toLocaleDateString()}\t\t\t\t\n`;
  tsvContent += `\t\t\t\t\t\n`;

  // Day headers
  tsvContent += `\t`;
  weekPlan.forEach(day => {
    tsvContent += `${day.dayName} (${day.displayDate})\t`;
  });
  tsvContent += `\n`;

  // PT Exercises row
  tsvContent += `PT Exercises\t`;
  weekPlan.forEach(day => {
    const exercises = day.tasks.pt.map(ex => ex.name).join(', ') || 'Rest';
    tsvContent += `${exercises}\t`;
  });
  tsvContent += `\n`;

  // Medications row
  tsvContent += `Medications\t`;
  const medList = weekPlan[0].tasks.medication.map(m => `${m.name} (${m.dosage})`).join(', ') || 'None';
  weekPlan.forEach(() => {
    tsvContent += `${medList}\t`;
  });
  tsvContent += `\n`;

  // Nutrition row
  tsvContent += `Nutrition\t`;
  weekPlan.forEach(() => {
    tsvContent += `8 glasses water, Anti-inflammatory diet\t`;
  });
  tsvContent += `\n`;

  // Wellness row
  tsvContent += `Wellness\t`;
  weekPlan.forEach(() => {
    tsvContent += `Stress management, 7-9hrs sleep\t`;
  });
  tsvContent += `\n`;

  tsvContent += `\t\t\t\t\t\n`;
  tsvContent += `Note: This export shows your 7-day look-ahead. Visit caribou.care for complete tracking.\t\t\t\t\t\n`;

  // Download the TSV
  downloadFile(tsvContent, `caribou-week-plan-${new Date().toISOString().split('T')[0]}.tsv`, 'text/tab-separated-values');

  // Show instruction toast
  showToast('File downloaded! Open Google Sheets and paste (Ctrl+V / Cmd+V) to import.', 'info');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showExportOptions() {
  // Create a simple modal for export options
  const existingModal = document.getElementById('export-options-modal');
  if (existingModal) {
    existingModal.style.display = 'flex';
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'export-options-modal';
  modal.className = 'auth-modal';
  modal.style.display = 'flex';

  modal.innerHTML = `
    <div class="auth-modal-overlay" onclick="closeExportModal()"></div>
    <div class="auth-modal-content" style="max-width: 400px;">
      <button class="auth-modal-close" onclick="closeExportModal()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div class="auth-modal-header">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" style="margin-bottom: var(--space-3);">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <h2>Export Care Plan</h2>
        <p>Download your 7-day look-ahead plan</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4);">
        <button class="btn btn-primary" onclick="exportToSpreadsheet('csv'); closeExportModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-2);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Download as CSV (Excel compatible)
        </button>

        <button class="btn btn-outline" onclick="exportToSpreadsheet('googleSheets'); closeExportModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-2);">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          Download for Google Sheets
        </button>
      </div>

      <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: var(--space-4); text-align: center;">
        Export includes your 7-day look-ahead plan only.<br>
        For complete tracking & history, use the Caribou app.
      </p>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeExportModal() {
  const modal = document.getElementById('export-options-modal');
  if (modal) modal.style.display = 'none';
}

function confirmResetData() {
  if (confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
    if (confirm('This will delete all your progress, preferences, and care plan data. Are you absolutely sure?')) {
      localStorage.removeItem('caribouAppState');
      location.reload();
    }
  }
}

function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    // If logged in with AccountSystem, use its logout
    if (AccountSystem.isLoggedIn()) {
      AccountSystem.logout();
    }
    // Reset app state for guests or after account logout
    AppState.hasCompletedIntake = false;
    AppState.hasSeenTutorial = false;
    saveState();
    // Reload to return to welcome page
    location.reload();
  }
}

function updateAccountDisplay() {
  const emailDisplay = document.getElementById('account-email-display');
  const emailText = document.getElementById('account-email-text');
  const changePasswordBtn = document.getElementById('change-password-btn');

  if (AccountSystem.isLoggedIn()) {
    const email = AccountSystem.getCurrentUser();
    if (emailDisplay && emailText) {
      emailDisplay.style.display = 'block';
      emailText.textContent = email;
    }
    if (changePasswordBtn) {
      changePasswordBtn.style.display = 'block';
    }
  }
}

// ============================================
// Image Upload Functions
// ============================================
function handleImageUpload(imageType, inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (JPG, PNG, etc.)');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;

    // Store image in AppState
    switch (imageType) {
      case 'ptInstructions':
        AppState.userData.ptInstructionsImage = imageData;
        updateImagePreview('pt-instructions', imageData);
        break;
      case 'conditionInfo':
        AppState.userData.conditionInfoImage = imageData;
        updateImagePreview('condition-info', imageData);
        break;
      case 'doctorRecommendations':
        AppState.userData.doctorRecommendationsImage = imageData;
        updateImagePreview('doctor-recommendations', imageData);
        break;
    }

    saveState();
  };

  reader.readAsDataURL(file);
}

function updateImagePreview(prefix, imageData) {
  const placeholder = document.getElementById(`${prefix}-placeholder`);
  const preview = document.getElementById(`${prefix}-preview`);
  const img = document.getElementById(`${prefix}-img`);

  if (placeholder && preview && img) {
    placeholder.style.display = 'none';
    preview.style.display = 'block';
    img.src = imageData;
  }
}

function removeImage(imageType) {
  let prefix;
  switch (imageType) {
    case 'ptInstructions':
      AppState.userData.ptInstructionsImage = null;
      prefix = 'pt-instructions';
      break;
    case 'conditionInfo':
      AppState.userData.conditionInfoImage = null;
      prefix = 'condition-info';
      break;
    case 'doctorRecommendations':
      AppState.userData.doctorRecommendationsImage = null;
      prefix = 'doctor-recommendations';
      break;
  }

  const placeholder = document.getElementById(`${prefix}-placeholder`);
  const preview = document.getElementById(`${prefix}-preview`);
  const fileInput = document.getElementById(`${prefix}-file`);

  if (placeholder && preview) {
    placeholder.style.display = 'flex';
    preview.style.display = 'none';
  }
  if (fileInput) {
    fileInput.value = '';
  }

  saveState();
}

function loadImagePreviews() {
  if (AppState.userData.ptInstructionsImage) {
    updateImagePreview('pt-instructions', AppState.userData.ptInstructionsImage);
  }
  if (AppState.userData.conditionInfoImage) {
    updateImagePreview('condition-info', AppState.userData.conditionInfoImage);
  }
  if (AppState.userData.doctorRecommendationsImage) {
    updateImagePreview('doctor-recommendations', AppState.userData.doctorRecommendationsImage);
  }
}

// ============================================
// Medication Form Functions
// ============================================
function addMedicationFromForm() {
  const name = document.getElementById('new-med-name')?.value?.trim();
  const dosage = document.getElementById('new-med-dosage')?.value?.trim();
  const frequency = document.getElementById('new-med-frequency')?.value;
  const timeOfDay = document.getElementById('new-med-time')?.value?.split(',') || ['morning'];
  const condition = document.getElementById('new-med-condition')?.value || '';
  const notes = document.getElementById('new-med-notes')?.value?.trim();

  if (!name) {
    alert('Please enter a medication name');
    return;
  }

  // Initialize medications list if needed
  if (!AppState.userData.medicationsList) {
    AppState.userData.medicationsList = [];
  }

  // Check for duplicates
  const existingMed = AppState.userData.medicationsList.find(m =>
    m.name.toLowerCase() === name.toLowerCase()
  );

  if (existingMed) {
    alert(`${name} is already in your medications list`);
    return;
  }

  // Validate against database
  const isValidMed = MedicationDatabase.some(med =>
    med.toLowerCase() === name.toLowerCase() ||
    name.toLowerCase().includes(med.toLowerCase())
  );

  // Add the medication
  const newMed = {
    id: Date.now().toString(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    dosage: dosage || '',
    frequency: frequency || 'once daily',
    condition: condition,
    timeOfDay: timeOfDay,
    notes: notes || '',
    addedDate: new Date().toISOString(),
    isValidated: isValidMed
  };

  AppState.userData.medicationsList.push(newMed);

  // Update legacy medications string
  AppState.userData.medications = AppState.userData.medicationsList.map(m => m.name).join(', ');

  saveState();

  // Clear form
  document.getElementById('new-med-name').value = '';
  document.getElementById('new-med-dosage').value = '';
  document.getElementById('new-med-frequency').value = 'once daily';
  document.getElementById('new-med-time').value = 'morning';
  document.getElementById('new-med-notes').value = '';

  // Refresh medications list display
  renderMedicationsList();
  generateTaskCategories();

  // Show success message
  const successMsg = isValidMed ?
    `${newMed.name} has been added to your medications.` :
    `${newMed.name} has been added. Note: Please verify the spelling with your pharmacist.`;
  alert(successMsg);
}

function renderMedicationsList() {
  const container = document.getElementById('medications-list');
  if (!container) return;

  const meds = AppState.userData.medicationsList || [];

  if (meds.length === 0) {
    container.innerHTML = '<p style="color: var(--gray-500); font-style: italic;">No medications added yet. Add your first medication below.</p>';
    return;
  }

  container.innerHTML = meds.map(med => `
    <div class="medication-item" data-med-id="${med.id}">
      <div class="medication-info">
        <div class="medication-name">
          ${med.name}
          ${med.dosage ? `<span class="medication-dosage">${med.dosage}</span>` : ''}
          ${med.isValidated ?
            '<span class="medication-validation-badge verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Verified</span>' :
            '<span class="medication-validation-badge unverified">Unverified</span>'
          }
          ${med.condition ? `<span class="medication-condition-tag">${getConditionName(med.condition)}</span>` : ''}
        </div>
        <div class="medication-details">
          ${med.frequency}${med.timeOfDay?.length ? ` - ${med.timeOfDay.join(', ')}` : ''}
          ${med.notes ? ` - ${med.notes}` : ''}
        </div>
      </div>
      <div class="medication-actions">
        <button class="medication-action-btn delete" onclick="removeMedicationById('${med.id}')" title="Remove medication">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function removeMedicationById(medId) {
  if (!confirm('Are you sure you want to remove this medication?')) return;

  const index = AppState.userData.medicationsList.findIndex(m => m.id === medId);
  if (index > -1) {
    AppState.userData.medicationsList.splice(index, 1);
    AppState.userData.medications = AppState.userData.medicationsList.map(m => m.name).join(', ');
    saveState();
    renderMedicationsList();
    generateTaskCategories();
  }
}

function getConditionName(conditionId) {
  const condition = ClinicalDatabase.getConditionData(conditionId);
  return condition?.name || conditionId;
}

function populateMedicationSuggestions() {
  const datalist = document.getElementById('medication-suggestions');
  if (!datalist) return;

  datalist.innerHTML = MedicationDatabase.map(med =>
    `<option value="${med}">`
  ).join('');
}

function populateConditionDropdown() {
  const dropdown = document.getElementById('new-med-condition');
  if (!dropdown) return;

  let options = '<option value="">General</option>';

  // Add primary condition
  if (AppState.userData.diagnosis) {
    const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
    options += `<option value="${AppState.userData.diagnosis}">${condition.name}</option>`;
  }

  // Add primary conditions for Premium+
  if (AppState.userData.primaryConditions && AppState.userData.primaryConditions.length > 0) {
    AppState.userData.primaryConditions.forEach(pc => {
      if (pc.id !== AppState.userData.diagnosis) {
        const condition = ClinicalDatabase.getConditionData(pc.id);
        options += `<option value="${pc.id}">${condition.name}</option>`;
      }
    });
  }

  dropdown.innerHTML = options;
}

// ============================================
// Doctor Goals Functions
// ============================================
function saveDoctorGoals() {
  const goalsText = document.getElementById('doctor-goals-text')?.value;
  AppState.userData.doctorGoals = goalsText;
  saveState();
  alert('Doctor\'s recommendations saved successfully!');
}

function loadDoctorGoals() {
  const textarea = document.getElementById('doctor-goals-text');
  if (textarea && AppState.userData.doctorGoals) {
    textarea.value = AppState.userData.doctorGoals;
  }
}

// ============================================
// Multi-Condition Support (Premium+)
// ============================================
function getMaxConditions() {
  if (hasTierAccess('family')) return 10; // Unlimited for family/enterprise
  if (hasTierAccess('premium')) return 3;
  return 1;
}

function canAddMoreConditions() {
  const currentCount = (AppState.userData.primaryConditions || []).length;
  return currentCount < getMaxConditions();
}

function addPrimaryCondition(conditionId) {
  if (!hasTierAccess('premium')) {
    alert('Upgrade to Premium to manage multiple conditions');
    return false;
  }

  if (!canAddMoreConditions()) {
    alert(`You can have up to ${getMaxConditions()} primary conditions on your plan`);
    return false;
  }

  if (!AppState.userData.primaryConditions) {
    AppState.userData.primaryConditions = [];
  }

  // Check for duplicate
  if (AppState.userData.primaryConditions.some(c => c.id === conditionId)) {
    alert('This condition is already in your list');
    return false;
  }

  const condition = ClinicalDatabase.getConditionData(conditionId);
  AppState.userData.primaryConditions.push({
    id: conditionId,
    name: condition.name,
    diagnosisDate: new Date().toISOString().split('T')[0]
  });

  // Set first condition as primary if not set
  if (!AppState.userData.diagnosis) {
    AppState.userData.diagnosis = conditionId;
  }

  saveState();
  return true;
}

function removePrimaryCondition(conditionId) {
  if (!AppState.userData.primaryConditions) return;

  AppState.userData.primaryConditions = AppState.userData.primaryConditions.filter(c => c.id !== conditionId);

  // Update primary diagnosis if removed
  if (AppState.userData.diagnosis === conditionId) {
    AppState.userData.diagnosis = AppState.userData.primaryConditions[0]?.id || '';
  }

  saveState();
}

// Populate primary conditions UI on profile page
function populatePrimaryConditionsUI() {
  const container = document.getElementById('primary-conditions-container');
  const addBtn = document.getElementById('add-condition-btn');
  const limitLabel = document.getElementById('condition-limit-label');

  if (!container) return;

  const maxConditions = getMaxConditions();
  const currentConditions = AppState.userData.primaryConditions || [];

  // If no conditions set, use the legacy diagnosis
  if (currentConditions.length === 0 && AppState.userData.diagnosis) {
    const condition = ClinicalDatabase.getConditionData(AppState.userData.diagnosis);
    currentConditions.push({
      id: AppState.userData.diagnosis,
      name: condition.name,
      diagnosisDate: AppState.userData.diagnosisDate || ''
    });
    AppState.userData.primaryConditions = currentConditions;
  }

  // Update limit label
  if (limitLabel) {
    if (maxConditions > 1) {
      limitLabel.textContent = `(${currentConditions.length}/${maxConditions} conditions)`;
    } else {
      limitLabel.textContent = '';
    }
  }

  // Build conditions select options matching intake form
  const optionsHTML = buildConditionOptionsHTML();

  // Render existing conditions
  container.innerHTML = currentConditions.map((cond, index) => `
    <div class="primary-condition-row" style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
      <select class="form-input primary-condition-select" data-index="${index}" onchange="updatePrimaryCondition(${index}, this.value)">
        ${optionsHTML}
      </select>
      ${index > 0 ? `
        <button type="button" class="btn btn-outline btn-sm" onclick="removePrimaryConditionUI(${index})" style="padding: var(--space-2); color: var(--error);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      ` : ''}
    </div>
  `).join('') || `
    <div class="primary-condition-row" style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
      <select class="form-input primary-condition-select" data-index="0" onchange="updatePrimaryCondition(0, this.value)">
        ${optionsHTML}
      </select>
    </div>
  `;

  // Set selected values
  const selects = container.querySelectorAll('.primary-condition-select');
  selects.forEach((select, index) => {
    if (currentConditions[index]) {
      select.value = currentConditions[index].id;
    }
  });

  // Show/hide add button
  if (addBtn) {
    addBtn.style.display = (maxConditions > 1 && currentConditions.length < maxConditions) ? 'inline-flex' : 'none';
  }
}

// Build condition options HTML matching intake form
function buildConditionOptionsHTML() {
  return `
    <option value="">Select your diagnosis</option>
    <optgroup label="Sprains & Strains">
      <option value="knee-sprain">Knee Sprain / ACL / MCL Injury</option>
      <option value="ankle-sprain">Ankle Sprain</option>
      <option value="wrist-sprain">Wrist Sprain</option>
      <option value="muscle-strain">Muscle Strain</option>
      <option value="hamstring-strain">Hamstring Strain</option>
      <option value="groin-strain">Groin Strain</option>
      <option value="calf-strain">Calf Strain</option>
    </optgroup>
    <optgroup label="Back & Spine">
      <option value="back-pain">Lower Back Pain</option>
      <option value="sciatica">Sciatica</option>
      <option value="herniated-disc">Herniated / Bulging Disc</option>
      <option value="spinal-stenosis">Spinal Stenosis</option>
      <option value="neck-pain">Neck Pain</option>
      <option value="whiplash">Whiplash</option>
      <option value="scoliosis">Scoliosis</option>
    </optgroup>
    <optgroup label="Shoulder">
      <option value="shoulder-injury">Shoulder Injury (General)</option>
      <option value="rotator-cuff">Rotator Cuff Injury</option>
      <option value="frozen-shoulder">Frozen Shoulder</option>
      <option value="shoulder-impingement">Shoulder Impingement</option>
      <option value="labral-tear">Labral Tear (SLAP)</option>
      <option value="shoulder-dislocation">Shoulder Dislocation</option>
    </optgroup>
    <optgroup label="Elbow, Wrist & Hand">
      <option value="tennis-elbow">Tennis Elbow</option>
      <option value="golfers-elbow">Golfer's Elbow</option>
      <option value="carpal-tunnel">Carpal Tunnel Syndrome</option>
      <option value="de-quervain">De Quervain's Tenosynovitis</option>
      <option value="trigger-finger">Trigger Finger</option>
    </optgroup>
    <optgroup label="Hip">
      <option value="hip-pain">Hip Pain (General)</option>
      <option value="hip-bursitis">Hip Bursitis</option>
      <option value="hip-labral-tear">Hip Labral Tear</option>
      <option value="hip-impingement">Hip Impingement (FAI)</option>
      <option value="piriformis-syndrome">Piriformis Syndrome</option>
      <option value="it-band-syndrome">IT Band Syndrome</option>
    </optgroup>
    <optgroup label="Knee">
      <option value="meniscus-tear">Meniscus Tear</option>
      <option value="patellofemoral">Patellofemoral Pain (Runner's Knee)</option>
      <option value="patellar-tendinitis">Patellar Tendinitis (Jumper's Knee)</option>
      <option value="knee-osteoarthritis">Knee Osteoarthritis</option>
      <option value="knee-bursitis">Knee Bursitis</option>
    </optgroup>
    <optgroup label="Foot & Ankle">
      <option value="plantar-fasciitis">Plantar Fasciitis</option>
      <option value="achilles-tendinitis">Achilles Tendinitis</option>
      <option value="shin-splints">Shin Splints</option>
      <option value="stress-fracture">Stress Fracture</option>
      <option value="ankle-fracture">Ankle Fracture Recovery</option>
    </optgroup>
    <optgroup label="Tendonitis">
      <option value="tendonitis-general">Tendonitis (General)</option>
      <option value="wrist-tendonitis">Wrist Tendonitis</option>
      <option value="elbow-tendonitis">Elbow Tendonitis</option>
      <option value="shoulder-tendonitis">Shoulder Tendonitis</option>
      <option value="knee-tendonitis">Knee Tendonitis</option>
      <option value="ankle-tendonitis">Ankle Tendonitis</option>
    </optgroup>
    <optgroup label="Headache & Migraine">
      <option value="migraine">Migraine</option>
      <option value="tension-headache">Tension Headache</option>
      <option value="cluster-headache">Cluster Headache</option>
      <option value="cervicogenic-headache">Cervicogenic Headache</option>
      <option value="headache-migraine">Chronic Headache/Migraine</option>
    </optgroup>
    <optgroup label="Post-Surgical Recovery">
      <option value="hip-replacement">Hip Replacement Recovery</option>
      <option value="knee-replacement">Knee Replacement Recovery</option>
      <option value="shoulder-replacement">Shoulder Replacement Recovery</option>
      <option value="acl-reconstruction">ACL Reconstruction Recovery</option>
      <option value="meniscus-surgery">Meniscus Surgery Recovery</option>
      <option value="rotator-cuff-surgery">Rotator Cuff Surgery Recovery</option>
      <option value="spinal-fusion">Spinal Fusion Recovery</option>
      <option value="laminectomy">Laminectomy Recovery</option>
    </optgroup>
    <optgroup label="Arthritis & Joint Conditions">
      <option value="arthritis">Osteoarthritis</option>
      <option value="rheumatoid-arthritis">Rheumatoid Arthritis</option>
      <option value="psoriatic-arthritis">Psoriatic Arthritis</option>
      <option value="ankylosing-spondylitis">Ankylosing Spondylitis</option>
      <option value="gout">Gout</option>
    </optgroup>
    <optgroup label="Neurological">
      <option value="stroke-recovery">Stroke Recovery</option>
      <option value="parkinsons">Parkinson's Disease</option>
      <option value="multiple-sclerosis">Multiple Sclerosis</option>
      <option value="traumatic-brain-injury">Traumatic Brain Injury</option>
      <option value="peripheral-neuropathy">Peripheral Neuropathy</option>
      <option value="vestibular-disorder">Vestibular Disorder / Vertigo</option>
      <option value="bells-palsy">Bell's Palsy</option>
    </optgroup>
    <optgroup label="Cardiovascular & Pulmonary">
      <option value="cardiac-rehab">Cardiac Rehabilitation</option>
      <option value="copd">COPD</option>
      <option value="pulmonary-rehab">Pulmonary Rehabilitation</option>
      <option value="post-covid">Post-COVID Syndrome (Long COVID)</option>
      <option value="asthma">Asthma Management</option>
    </optgroup>
    <optgroup label="Chronic Conditions">
      <option value="diabetes-type2">Type 2 Diabetes</option>
      <option value="diabetes-type1">Type 1 Diabetes</option>
      <option value="hypertension">Hypertension</option>
      <option value="obesity">Obesity / Weight Management</option>
      <option value="osteoporosis">Osteoporosis</option>
    </optgroup>
    <optgroup label="Chronic Pain & Fatigue">
      <option value="fibromyalgia">Fibromyalgia</option>
      <option value="chronic-fatigue">Chronic Fatigue Syndrome</option>
      <option value="chronic-pain">Chronic Pain</option>
      <option value="complex-regional-pain">Complex Regional Pain Syndrome (CRPS)</option>
      <option value="temporomandibular">TMJ Disorder</option>
    </optgroup>
    <optgroup label="Women's Health">
      <option value="pelvic-floor">Pelvic Floor Dysfunction</option>
      <option value="postpartum">Postpartum Recovery</option>
      <option value="pregnancy-related">Pregnancy-Related Pain</option>
      <option value="lymphedema">Lymphedema</option>
      <option value="breast-cancer-rehab">Breast Cancer Rehabilitation</option>
    </optgroup>
    <optgroup label="Geriatric">
      <option value="fall-prevention">Fall Prevention / Balance Training</option>
      <option value="frailty">Frailty / Deconditioning</option>
      <option value="hip-fracture">Hip Fracture Recovery</option>
    </optgroup>
    <optgroup label="Work & Sports">
      <option value="repetitive-strain">Repetitive Strain Injury</option>
      <option value="work-conditioning">Work Conditioning / Return to Work</option>
      <option value="concussion">Concussion Recovery</option>
      <option value="sports-hernia">Sports Hernia</option>
    </optgroup>
    <optgroup label="General Wellness">
      <option value="general-wellness">General Wellness</option>
      <option value="stress-management">Stress Management</option>
      <option value="sleep-improvement">Sleep Improvement</option>
      <option value="flexibility-training">Flexibility Training</option>
      <option value="strength-training">Strength Training</option>
    </optgroup>
    <option value="other">Other Condition</option>
  `;
}

// Update a primary condition
function updatePrimaryCondition(index, conditionId) {
  if (!AppState.userData.primaryConditions) {
    AppState.userData.primaryConditions = [];
  }

  const condition = ClinicalDatabase.getConditionData(conditionId);

  if (index >= AppState.userData.primaryConditions.length) {
    AppState.userData.primaryConditions.push({
      id: conditionId,
      name: condition.name,
      diagnosisDate: new Date().toISOString().split('T')[0]
    });
  } else {
    AppState.userData.primaryConditions[index] = {
      id: conditionId,
      name: condition.name,
      diagnosisDate: AppState.userData.primaryConditions[index].diagnosisDate || new Date().toISOString().split('T')[0]
    };
  }

  // Update legacy diagnosis to first condition
  if (index === 0) {
    AppState.userData.diagnosis = conditionId;
  }

  saveState();
  populatePrimaryConditionsUI();
}

// Add a new primary condition slot
function addPrimaryCondition() {
  const maxConditions = getMaxConditions();
  const current = (AppState.userData.primaryConditions || []).length;

  if (current >= maxConditions) {
    alert(`You can have up to ${maxConditions} primary conditions on your current plan.`);
    return;
  }

  if (!AppState.userData.primaryConditions) {
    AppState.userData.primaryConditions = [];
  }

  // Add empty placeholder
  AppState.userData.primaryConditions.push({
    id: '',
    name: '',
    diagnosisDate: new Date().toISOString().split('T')[0]
  });

  populatePrimaryConditionsUI();
}

// Remove a primary condition from UI
function removePrimaryConditionUI(index) {
  if (!AppState.userData.primaryConditions || AppState.userData.primaryConditions.length <= 1) {
    alert('You must have at least one primary condition.');
    return;
  }

  AppState.userData.primaryConditions.splice(index, 1);

  // Update legacy diagnosis to first remaining condition
  if (AppState.userData.primaryConditions.length > 0) {
    AppState.userData.diagnosis = AppState.userData.primaryConditions[0].id;
  }

  saveState();
  populatePrimaryConditionsUI();
}

// Check if condition is a "general wellness" type (minimal PT intervention)
function isGeneralWellnessCondition(conditionId) {
  const wellnessConditions = [
    'general-wellness', 'stress-management', 'sleep-improvement',
    'flexibility-training', 'strength-training', 'weight-management', 'other'
  ];
  return wellnessConditions.includes(conditionId);
}

// Get messaging for general wellness conditions
function getWellnessConditionMessage(conditionId) {
  const condition = ClinicalDatabase.getConditionData(conditionId);
  return {
    title: condition.name,
    message: 'This plan adheres to general wellness guidelines due to this condition\'s minimal physical therapy intervention requirements. Your plan focuses on nutrition, lifestyle optimization, and preventive care.',
    showPT: false
  };
}

/**
 * getAllUserConditions - Retrieves all condition IDs for the current user
 *
 * This function aggregates conditions from multiple sources to support both
 * legacy (Free tier) and multi-condition (Premium+) users.
 *
 * CONDITION SOURCES (in order of precedence):
 * 1. AppState.userData.diagnosis - The primary/legacy condition ID
 *    Set during intake Step 1 when user selects their diagnosis
 *
 * 2. AppState.userData.primaryConditions - Array for Premium+ users
 *    Allows tracking up to 3 concurrent conditions
 *    Each entry has: { id, name, diagnosisDate }
 *
 * RETURNS:
 * - Array of condition ID strings (e.g., ['knee-sprain', 'hypertension'])
 * - Returns ['other'] if no conditions are set (general wellness fallback)
 *
 * USAGE:
 * Used throughout the app to fetch condition-specific data from ClinicalDatabase
 * and to display condition information in the UI.
 *
 * EXAMPLE:
 * const conditions = getAllUserConditions();
 * // For Free user with knee sprain: ['knee-sprain']
 * // For Premium user with multiple: ['knee-sprain', 'hypertension']
 * // For new user with no conditions: ['other']
 */
function getAllUserConditions() {
  console.log('[getAllUserConditions] Getting all user conditions');
  console.log('[getAllUserConditions] userData.diagnosis:', AppState.userData.diagnosis);
  console.log('[getAllUserConditions] userData.primaryConditions:', AppState.userData.primaryConditions);
  console.log('[getAllUserConditions] userData.validatedSecondaryConditions:', AppState.userData.validatedSecondaryConditions);

  const conditions = [];

  // Add primary diagnosis (legacy) - include 'other' for general wellness plans
  if (AppState.userData.diagnosis && AppState.userData.diagnosis.trim() !== '') {
    conditions.push(AppState.userData.diagnosis);
    console.log('[getAllUserConditions] Added primary diagnosis:', AppState.userData.diagnosis);
  }

  // Add primary conditions (Premium+) - filter out empty/invalid IDs
  if (AppState.userData.primaryConditions) {
    AppState.userData.primaryConditions.forEach(pc => {
      // Only include if ID exists, is not empty, and not already in list
      if (pc.id && pc.id.trim() !== '' && !conditions.includes(pc.id)) {
        conditions.push(pc.id);
        console.log('[getAllUserConditions] Added primary condition:', pc.id);
      }
    });
  }

  // Add validated secondary conditions (from intake form - comma-separated)
  if (AppState.userData.validatedSecondaryConditions) {
    AppState.userData.validatedSecondaryConditions.forEach(sc => {
      // Only include validated conditions with IDs that aren't already in the list
      if (sc.id && sc.isValidated && !conditions.includes(sc.id)) {
        conditions.push(sc.id);
        console.log('[getAllUserConditions] Added secondary condition:', sc.id);
      }
    });
  }

  // If no conditions at all, default to 'other' for general wellness
  if (conditions.length === 0) {
    conditions.push('other');
    console.log('[getAllUserConditions] No conditions found, defaulting to other');
  }

  console.log('[getAllUserConditions] Returning conditions:', conditions);
  return conditions;
}

// Get combined exercises from all conditions with condition tags
// Maximum PT time per day in minutes
const MAX_PT_MINUTES_PER_DAY = 60;
// Maximum wellness time per day in minutes
const MAX_WELLNESS_MINUTES_PER_DAY = 120;

function getCombinedExercises() {
  const conditions = getAllUserConditions();
  let allExercises = [];
  const seenExercises = new Set(); // Track exercise names to avoid duplicates

  // Collect all exercises from all conditions, avoiding duplicates
  conditions.forEach(conditionId => {
    const condition = ClinicalDatabase.getConditionData(conditionId);
    if (condition && condition.exercises) {
      condition.exercises.forEach(ex => {
        // Create a unique key for this exercise (name + time)
        const exerciseKey = `${ex.name.toLowerCase()}-${ex.time || '00:00'}`;

        // Skip duplicates unless they have different times
        if (!seenExercises.has(exerciseKey)) {
          seenExercises.add(exerciseKey);
          allExercises.push({
            ...ex,
            conditionId: conditionId,
            conditionName: condition.name,
            durationMinutes: parseDurationToMinutes(ex.duration),
            timeMinutes: parseTimeToMinutes(ex.time) // For sorting
          });
        }
      });
    }
  });

  // Sort by time of day first
  allExercises.sort((a, b) => {
    return (a.timeMinutes || 0) - (b.timeMinutes || 0);
  });

  // Cap exercises at MAX_PT_MINUTES_PER_DAY (60 minutes)
  const cappedExercises = capExercisesByTime(allExercises, MAX_PT_MINUTES_PER_DAY);

  return cappedExercises;
}

// Parse time string to minutes since midnight for sorting (e.g., "09:00" -> 540)
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 0;
}

// Parse duration string to minutes (e.g., "10 minutes", "15-20 minutes", "5 min")
function parseDurationToMinutes(durationStr) {
  if (!durationStr) return 10; // Default to 10 minutes

  const str = durationStr.toLowerCase();

  // Handle ranges like "15-20 minutes" - use the average
  const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1]);
    const high = parseInt(rangeMatch[2]);
    return Math.round((low + high) / 2);
  }

  // Handle single numbers like "10 minutes"
  const singleMatch = str.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1]);
  }

  return 10; // Default
}

// Cap exercises to stay within time limit, prioritizing condition-specific exercises
function capExercisesByTime(exercises, maxMinutes) {
  if (exercises.length === 0) return exercises;

  // Create a copy with priority scores for selection, without modifying original order
  const primaryCondition = AppState.userData.diagnosis;
  const exercisesWithPriority = exercises.map(ex => ({
    ...ex,
    priority: ex.conditionId === primaryCondition ? 0 : 1
  }));

  // Sort by priority for SELECTION (primary condition first, then shorter duration)
  exercisesWithPriority.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.durationMinutes - b.durationMinutes;
  });

  // Select exercises until we hit the time cap
  const selected = [];
  let totalMinutes = 0;

  for (const exercise of exercisesWithPriority) {
    if (totalMinutes + exercise.durationMinutes <= maxMinutes) {
      selected.push(exercise);
      totalMinutes += exercise.durationMinutes;
    } else if (totalMinutes < maxMinutes) {
      // If we have some time left, see if any remaining exercise fits
      continue;
    }
  }

  // Re-sort selected exercises by TIME for display (earliest to latest)
  selected.sort((a, b) => {
    return (a.timeMinutes || 0) - (b.timeMinutes || 0);
  });

  // Store total duration for display
  selected.totalDuration = totalMinutes;

  return selected;
}

// Get combined nutrition guidelines from all conditions
function getCombinedNutritionGuidelines() {
  const conditions = getAllUserConditions();
  const guidelines = [];
  const seen = new Set();

  conditions.forEach(conditionId => {
    const condition = ClinicalDatabase.getConditionData(conditionId);
    if (condition && condition.nutritionGuidelines) {
      condition.nutritionGuidelines.forEach(guideline => {
        // Avoid duplicates
        if (!seen.has(guideline.toLowerCase())) {
          seen.add(guideline.toLowerCase());
          guidelines.push({
            text: guideline,
            conditionId: conditionId,
            conditionName: condition.name
          });
        }
      });
    }
  });

  return guidelines;
}

// Get combined wellness activities from all conditions
function getCombinedWellnessActivities() {
  const conditions = getAllUserConditions();
  const activities = [];
  const seen = new Set();

  conditions.forEach(conditionId => {
    const condition = ClinicalDatabase.getConditionData(conditionId);
    if (condition && condition.wellnessActivities) {
      condition.wellnessActivities.forEach(activity => {
        // Create unique key for activity (name)
        const activityKey = activity.name.toLowerCase();

        // Avoid duplicates
        if (!seen.has(activityKey)) {
          seen.add(activityKey);
          activities.push({
            ...activity,
            conditionId: conditionId,
            conditionName: condition.name,
            durationMinutes: parseDurationToMinutes(activity.duration || '15 minutes')
          });
        }
      });
    }
  });

  return activities;
}

// ============================================
// Account/Auth System
// ============================================
const AccountSystem = {
  // Simple local storage based auth (in production, use a real backend)
  ACCOUNTS_KEY: 'caribou_accounts',
  CURRENT_USER_KEY: 'caribou_current_user',

  getAccounts() {
    const data = localStorage.getItem(this.ACCOUNTS_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveAccounts(accounts) {
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  getCurrentUser() {
    return localStorage.getItem(this.CURRENT_USER_KEY);
  },

  setCurrentUser(email) {
    localStorage.setItem(this.CURRENT_USER_KEY, email);
  },

  clearCurrentUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  },

  signup(email, password) {
    const accounts = this.getAccounts();

    if (accounts[email]) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create account with hashed password (simple hash for demo - use bcrypt in production)
    accounts[email] = {
      email: email,
      passwordHash: this.simpleHash(password),
      createdAt: new Date().toISOString(),
      appState: null // Will store user's app data
    };

    this.saveAccounts(accounts);
    this.setCurrentUser(email);

    return { success: true };
  },

  login(email, password) {
    const accounts = this.getAccounts();
    const account = accounts[email];

    if (!account) {
      return { success: false, error: 'No account found with this email.' };
    }

    if (account.passwordHash !== this.simpleHash(password)) {
      return { success: false, error: 'Incorrect password.' };
    }

    this.setCurrentUser(email);

    // Load user's saved app state if exists
    if (account.appState) {
      Object.assign(AppState, account.appState);
      return { success: true, hasData: true };
    }

    return { success: true, hasData: false };
  },

  logout() {
    // Save current state before logout
    this.saveUserData();
    this.clearCurrentUser();
  },

  saveUserData() {
    const email = this.getCurrentUser();
    if (!email) return;

    const accounts = this.getAccounts();
    if (accounts[email]) {
      accounts[email].appState = {
        userTier: AppState.userTier,
        hasCompletedIntake: AppState.hasCompletedIntake,
        userData: AppState.userData,
        completedTasks: AppState.completedTasks,
        mealPlan: AppState.mealPlan,
        firstVisitDate: AppState.firstVisitDate
      };
      this.saveAccounts(accounts);
    }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  // Change password for logged-in user
  changePassword(currentPassword, newPassword) {
    const email = this.getCurrentUser();
    if (!email) {
      return { success: false, error: 'You must be logged in to change your password.' };
    }

    const accounts = this.getAccounts();
    const account = accounts[email];

    if (!account) {
      return { success: false, error: 'Account not found.' };
    }

    // Verify current password
    if (account.passwordHash !== this.simpleHash(currentPassword)) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    // Update password
    account.passwordHash = this.simpleHash(newPassword);
    account.passwordChangedAt = new Date().toISOString();
    this.saveAccounts(accounts);

    return { success: true, message: 'Password changed successfully!' };
  },

  // Reset password (forgot password flow - uses email verification simulation)
  requestPasswordReset(email) {
    const accounts = this.getAccounts();

    if (!accounts[email]) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If an account exists with this email, you will receive a reset code.' };
    }

    // Generate a simple reset token (in production, send this via email)
    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    accounts[email].resetToken = resetToken;
    accounts[email].resetTokenExpires = Date.now() + (15 * 60 * 1000); // 15 minutes
    this.saveAccounts(accounts);

    // In production, this would send an email. For demo, show the code.
    console.log(`Password reset code for ${email}: ${resetToken}`);

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a reset code.',
      // For demo purposes only - remove in production
      demoResetCode: resetToken
    };
  },

  // Verify reset code and set new password
  resetPasswordWithCode(email, resetCode, newPassword) {
    const accounts = this.getAccounts();
    const account = accounts[email];

    if (!account) {
      return { success: false, error: 'Invalid reset request.' };
    }

    if (!account.resetToken || account.resetToken !== resetCode.toUpperCase()) {
      return { success: false, error: 'Invalid or expired reset code.' };
    }

    if (Date.now() > account.resetTokenExpires) {
      return { success: false, error: 'Reset code has expired. Please request a new one.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    // Update password and clear reset token
    account.passwordHash = this.simpleHash(newPassword);
    account.resetToken = null;
    account.resetTokenExpires = null;
    account.passwordChangedAt = new Date().toISOString();
    this.saveAccounts(accounts);

    return { success: true, message: 'Password reset successfully! You can now log in.' };
  },

  // Simple hash function (NOT secure - for demo only)
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
};

function showAuthModal(mode = 'signup') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    switchAuthMode(mode);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function switchAuthMode(mode) {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');

  if (mode === 'login') {
    signupForm.style.display = 'none';
    loginForm.style.display = 'flex';
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to continue your care journey';
  } else {
    signupForm.style.display = 'flex';
    loginForm.style.display = 'none';
    title.textContent = 'Create Account';
    subtitle.textContent = 'Join Caribou to start your personalized care journey';
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  // Validate
  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  const termsAccepted = document.getElementById('signup-terms')?.checked;
  if (!termsAccepted) {
    alert('Please agree to the Terms of Service and Privacy Policy to continue.');
    return;
  }

  // Use Firebase Auth if backend is enabled
  if (typeof AuthService !== 'undefined' && BackendConfig.BACKEND_ENABLED) {
    const btn = event.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }

    const result = await AuthService.signUp(email, password, {
      displayName: '',
      createdAt: new Date().toISOString(),
      tier: 'free'
    });

    if (btn) { btn.disabled = false; btn.textContent = 'Create Account & Continue'; }

    if (!result.success) {
      alert(result.error);
      return;
    }

    AppState.userData.email = email;
    AppState.userData.uid = result.user.uid;
    saveState();
  } else {
    // Fallback to local AccountSystem
    const result = AccountSystem.signup(email, password);
    if (!result.success) {
      alert(result.error);
      return;
    }
  }

  // Success - close modal and go to intake
  closeAuthModal();
  navigateTo('intake');
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // Use Firebase Auth if backend is enabled
  if (typeof AuthService !== 'undefined' && BackendConfig.BACKEND_ENABLED) {
    const btn = event.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }

    const result = await AuthService.signIn(email, password);

    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }

    if (!result.success) {
      alert(result.error);
      return;
    }

    AppState.userData.email = email;
    AppState.userData.uid = result.user.uid;
    saveState();
  } else {
    const result = AccountSystem.login(email, password);
    if (!result.success) {
      alert(result.error);
      return;
    }
  }

  closeAuthModal();

  if (AppState.hasCompletedIntake) {
    // User has existing data - go to dashboard
    const nav = document.getElementById('main-nav');
    const footer = document.getElementById('main-footer');
    const chatbot = document.getElementById('chatbot-container');
    const mobileNav = document.getElementById('mobile-bottom-nav');

    if (nav) nav.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (mobileNav) {
      mobileNav.style.display = isNativeApp() ? 'flex' : 'none';
    }
    if (chatbot && (AppState.userTier === 'family' || AppState.userTier === 'enterprise' || AppState.userTier === 'premium')) {
      chatbot.style.display = 'block';
    }

    navigateTo('home');
  } else {
    navigateTo('intake');
  }
}

async function handleGoogleSignIn() {
  if (typeof AuthService === 'undefined' || !BackendConfig.BACKEND_ENABLED) {
    alert('Google Sign-In requires an internet connection. Please use email/password instead.');
    return;
  }

  const btn = document.querySelector('.google-signin-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span>Signing in...</span>'; }

  try {
    const result = await AuthService.signInWithGoogle();

    if (!result.success) {
      alert(result.error || 'Google Sign-In failed. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google`;
      }
      return;
    }

    AppState.userData.email = result.user.email;
    AppState.userData.uid = result.user.uid;
    AppState.userData.firstName = result.user.displayName ? result.user.displayName.split(' ')[0] : '';
    AppState.userData.lastName = result.user.displayName ? result.user.displayName.split(' ').slice(1).join(' ') : '';
    AppState.userData.photoURL = result.user.photoURL || '';
    saveState();

    closeAuthModal();

    if (result.isNewUser || !AppState.hasCompletedIntake) {
      navigateTo('intake');
    } else {
      const nav = document.getElementById('main-nav');
      const footer = document.getElementById('main-footer');
      const chatbot = document.getElementById('chatbot-container');
      const mobileNav = document.getElementById('mobile-bottom-nav');

      if (nav) nav.style.display = 'block';
      if (footer) footer.style.display = 'block';
      if (mobileNav) mobileNav.style.display = isNativeApp() ? 'flex' : 'none';
      if (chatbot && (AppState.userTier === 'family' || AppState.userTier === 'enterprise' || AppState.userTier === 'premium')) {
        chatbot.style.display = 'block';
      }
      navigateTo('home');
    }
  } catch (error) {
    console.error('Google Sign-In error:', error);
    alert('Google Sign-In failed. Please try again or use email/password.');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google`;
    }
  }
}

// Show Change Password Modal
function showChangePasswordModal() {
  const existingModal = document.getElementById('password-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'password-modal';
  modal.className = 'auth-modal';
  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="auth-modal-overlay"></div>
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="document.getElementById('password-modal').remove()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="auth-modal-header">
        <h2 id="password-modal-title">Change Password</h2>
        <p id="password-modal-subtitle">Enter your current password and choose a new one</p>
      </div>
      <form id="change-password-form" class="auth-form" onsubmit="handleChangePassword(event)">
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input type="password" id="current-password" class="form-input" required minlength="6">
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" id="new-password" class="form-input" required minlength="6">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" id="confirm-new-password" class="form-input" required minlength="6">
        </div>
        <div id="password-change-error" class="form-error" style="display: none;"></div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Update Password</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

// Handle Change Password Form
function handleChangePassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;
  const errorDiv = document.getElementById('password-change-error');

  // Validate
  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'New passwords do not match.';
    errorDiv.style.display = 'block';
    return;
  }

  const result = AccountSystem.changePassword(currentPassword, newPassword);

  if (!result.success) {
    errorDiv.textContent = result.error;
    errorDiv.style.display = 'block';
    return;
  }

  // Success
  document.getElementById('password-modal').remove();
  alert('Password changed successfully!');
}

// Show Forgot Password Modal (for login screen)
function showForgotPasswordModal() {
  const existingModal = document.getElementById('forgot-password-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'forgot-password-modal';
  modal.className = 'auth-modal';
  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="auth-modal-overlay"></div>
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="document.getElementById('forgot-password-modal').remove()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="auth-modal-header">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a reset code</p>
      </div>

      <!-- Step 1: Request Reset -->
      <form id="request-reset-form" class="auth-form" onsubmit="handleRequestReset(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="reset-email" class="form-input" required>
        </div>
        <div id="reset-request-message" style="display: none; padding: var(--space-2); border-radius: var(--radius); margin-bottom: var(--space-3);"></div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Send Reset Code</button>
      </form>

      <!-- Step 2: Enter Code and New Password -->
      <form id="reset-password-form" class="auth-form" style="display: none;" onsubmit="handleResetPassword(event)">
        <div class="form-group">
          <label class="form-label">Reset Code</label>
          <input type="text" id="reset-code" class="form-input" required placeholder="Enter 6-character code" maxlength="6" style="text-transform: uppercase; letter-spacing: 2px; text-align: center; font-size: 1.25rem;">
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" id="reset-new-password" class="form-input" required minlength="6">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" id="reset-confirm-password" class="form-input" required minlength="6">
        </div>
        <div id="reset-error" class="form-error" style="display: none;"></div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Reset Password</button>
        <button type="button" class="btn btn-outline" style="width: 100%; margin-top: var(--space-2);" onclick="showRequestResetStep()">
          Request New Code
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

// Store email for reset flow
let resetEmailAddress = '';

function handleRequestReset(event) {
  event.preventDefault();

  const email = document.getElementById('reset-email').value.trim();
  resetEmailAddress = email;

  const result = AccountSystem.requestPasswordReset(email);
  const messageDiv = document.getElementById('reset-request-message');

  if (result.success) {
    messageDiv.style.background = 'var(--success-light)';
    messageDiv.style.color = 'var(--success)';

    // For demo: show the code
    if (result.demoResetCode) {
      messageDiv.innerHTML = `
        <strong>Demo Mode:</strong> Your reset code is <strong>${result.demoResetCode}</strong><br>
        <small>(In production, this would be sent to your email)</small>
      `;
    } else {
      messageDiv.textContent = result.message;
    }
    messageDiv.style.display = 'block';

    // Show step 2 after a moment
    setTimeout(() => {
      document.getElementById('request-reset-form').style.display = 'none';
      document.getElementById('reset-password-form').style.display = 'flex';
    }, 2000);
  }
}

function showRequestResetStep() {
  document.getElementById('request-reset-form').style.display = 'flex';
  document.getElementById('reset-password-form').style.display = 'none';
  document.getElementById('reset-request-message').style.display = 'none';
}

function handleResetPassword(event) {
  event.preventDefault();

  const code = document.getElementById('reset-code').value.trim();
  const newPassword = document.getElementById('reset-new-password').value;
  const confirmPassword = document.getElementById('reset-confirm-password').value;
  const errorDiv = document.getElementById('reset-error');

  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match.';
    errorDiv.style.display = 'block';
    return;
  }

  const result = AccountSystem.resetPasswordWithCode(resetEmailAddress, code, newPassword);

  if (!result.success) {
    errorDiv.textContent = result.error;
    errorDiv.style.display = 'block';
    return;
  }

  // Success
  document.getElementById('forgot-password-modal').remove();
  alert('Password reset successfully! You can now log in with your new password.');
  showAuthModal('login');
}

// Override saveState to also save to account
const originalSaveState = saveState;
/**
 * saveState - Persists critical app state to localStorage and account
 *
 * This function should be called after any significant state changes to ensure
 * data survives page refreshes and browser restarts.
 *
 * DATA SAVED:
 * - userData: User profile, conditions, preferences
 * - hasCompletedIntake: Whether onboarding is complete
 * - completedTasks: Daily task completion tracking
 * - mealPlan: Weekly meal planning state
 * - userTier: Subscription level (free/premium/family/enterprise)
 * - firstVisitDate: Used for recovery progress calculations
 * - dailyCheckin: Today's symptom check-in data
 * - checkinHistory: Past check-in records
 *
 * CALLED BY:
 * - selectTier() - After user chooses subscription
 * - saveStepData() - During intake form progression
 * - toggleTask() - When tasks are completed
 * - Profile updates - When user edits their information
 * - Medication changes - When meds are added/updated
 *
 * STORAGE:
 * 1. localStorage under key 'caribouAppState'
 * 2. AccountSystem (if user is logged in) - syncs across devices
 */
function saveState() {
  // Save to localStorage for offline/guest access
  localStorage.setItem('caribouAppState', JSON.stringify({
    userData: AppState.userData,
    hasCompletedIntake: AppState.hasCompletedIntake,
    completedTasks: AppState.completedTasks,
    mealPlan: AppState.mealPlan,
    userTier: AppState.userTier,
    firstVisitDate: AppState.firstVisitDate,
    dailyCheckin: AppState.dailyCheckin,
    checkinHistory: AppState.checkinHistory
  }));

  // Also save to account if logged in (for cross-device sync)
  AccountSystem.saveUserData();
}

// ============================================
// Document Upload Functions (Intake & Profile)
// ============================================

// Store uploaded documents
let uploadedDocuments = JSON.parse(localStorage.getItem('caribouDocuments') || '[]');

function handleDocumentUpload(input, docType) {
  const file = input.files[0];
  if (!file) return;

  const card = input.closest('.document-upload-card');
  const previewDiv = document.getElementById(`preview-${docType}`);

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload an image (JPG, PNG, GIF, WebP) or PDF file.');
    input.value = '';
    return;
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB.');
    input.value = '';
    return;
  }

  // Read file as base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const docData = {
      id: Date.now().toString(),
      type: docType,
      name: file.name,
      fileType: file.type,
      size: file.size,
      data: e.target.result,
      uploadedAt: new Date().toISOString()
    };

    // Remove existing document of same type (if any)
    uploadedDocuments = uploadedDocuments.filter(d => d.type !== docType);

    // Add new document
    uploadedDocuments.push(docData);
    saveDocuments();

    // Update card styling
    card.classList.add('has-file');

    // Show preview
    if (previewDiv) {
      const isImage = file.type.startsWith('image/');
      previewDiv.innerHTML = `
        <div class="document-preview-item">
          ${isImage ? `<img src="${e.target.result}" alt="${file.name}">` : `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
          `}
          <span class="document-preview-name">${file.name}</span>
          <button type="button" class="document-preview-remove" onclick="removeUploadedDocument('${docType}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
}

function removeUploadedDocument(docType) {
  uploadedDocuments = uploadedDocuments.filter(d => d.type !== docType);
  saveDocuments();

  // Reset the card
  const card = document.querySelector(`#upload-${docType}`).closest('.document-upload-card');
  if (card) {
    card.classList.remove('has-file');
  }

  // Clear preview
  const previewDiv = document.getElementById(`preview-${docType}`);
  if (previewDiv) {
    previewDiv.innerHTML = '';
  }

  // Clear input
  const input = document.getElementById(`upload-${docType}`);
  if (input) {
    input.value = '';
  }
}

function saveDocuments() {
  localStorage.setItem('caribouDocuments', JSON.stringify(uploadedDocuments));
}

function loadDocuments() {
  uploadedDocuments = JSON.parse(localStorage.getItem('caribouDocuments') || '[]');
  return uploadedDocuments;
}

// Load documents on profile page
function loadProfileDocuments() {
  const docs = loadDocuments();
  const listEl = document.getElementById('profile-documents-list');
  if (!listEl) return;

  if (docs.length === 0) {
    listEl.innerHTML = '<p class="no-documents-message" style="color: var(--gray-500); font-size: 0.875rem;">No documents uploaded yet</p>';
    return;
  }

  const docTypeLabels = {
    'pt-instructions': 'PT Instructions',
    'condition-info': 'Condition Info',
    'doctor-notes': 'Doctor Notes'
  };

  listEl.innerHTML = docs.map(doc => {
    const isImage = doc.fileType.startsWith('image/');
    const dateStr = new Date(doc.uploadedAt).toLocaleDateString();
    const sizeStr = formatFileSize(doc.size);

    return `
      <div class="document-item" data-doc-id="${doc.id}">
        <div class="document-item-icon">
          ${isImage ? `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          ` : `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6"/>
            </svg>
          `}
        </div>
        <div class="document-item-info">
          <span class="document-item-name">${doc.name}</span>
          <span class="document-item-meta">${docTypeLabels[doc.type] || doc.type} - ${dateStr} - ${sizeStr}</span>
        </div>
        <div class="document-item-actions">
          <button onclick="viewDocument('${doc.id}')" title="View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="delete-btn" onclick="deleteProfileDocument('${doc.id}')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function viewDocument(docId) {
  const doc = uploadedDocuments.find(d => d.id === docId);
  if (!doc) return;

  // Open document in new window/tab
  const win = window.open('', '_blank');
  if (doc.fileType.startsWith('image/')) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${doc.name}</title></head>
      <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
        <img src="${doc.data}" alt="${doc.name}" style="max-width:100%;max-height:100vh;">
      </body>
      </html>
    `);
  } else {
    // For PDF, create object embed
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${doc.name}</title></head>
      <body style="margin:0;">
        <embed src="${doc.data}" type="application/pdf" width="100%" height="100%" style="position:absolute;top:0;left:0;right:0;bottom:0;">
      </body>
      </html>
    `);
  }
}

function deleteProfileDocument(docId) {
  if (!confirm('Are you sure you want to delete this document?')) return;

  uploadedDocuments = uploadedDocuments.filter(d => d.id !== docId);
  saveDocuments();
  loadProfileDocuments();
}

function showUploadDocumentModal() {
  const existingModal = document.getElementById('upload-doc-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'upload-doc-modal';
  modal.className = 'auth-modal';
  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="auth-modal-overlay"></div>
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="document.getElementById('upload-doc-modal').remove()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="auth-modal-header">
        <h2>Upload Document</h2>
        <p>Upload medical documents to your profile</p>
      </div>

      <form id="upload-doc-form" class="auth-form" onsubmit="handleProfileDocumentUpload(event)">
        <div class="form-group">
          <label class="form-label">Document Type</label>
          <select id="upload-doc-type" class="form-select" required>
            <option value="">Select type...</option>
            <option value="pt-instructions">PT Instructions</option>
            <option value="condition-info">Condition Info / Test Results</option>
            <option value="doctor-notes">Doctor Notes / Prescriptions</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">File</label>
          <input type="file" id="upload-doc-file" class="form-input" accept="image/*,.pdf" required>
          <p class="form-hint">Accepts images (JPG, PNG, etc.) and PDF files up to 10MB</p>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Upload Document</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

function handleProfileDocumentUpload(event) {
  event.preventDefault();

  const docType = document.getElementById('upload-doc-type').value;
  const fileInput = document.getElementById('upload-doc-file');
  const file = fileInput.files[0];

  if (!file || !docType) return;

  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload an image or PDF file.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const docData = {
      id: Date.now().toString(),
      type: docType,
      name: file.name,
      fileType: file.type,
      size: file.size,
      data: e.target.result,
      uploadedAt: new Date().toISOString()
    };

    uploadedDocuments.push(docData);
    saveDocuments();

    document.getElementById('upload-doc-modal').remove();
    loadProfileDocuments();
  };
  reader.readAsDataURL(file);
}

// ============================================
// Health Account Linking Functions
// ============================================

let connectedHealthAccounts = JSON.parse(localStorage.getItem('caribouHealthAccounts') || '{}');

function connectHealthAccount(provider) {
  // In a real app, this would initiate OAuth flow
  // For demo, we'll simulate the connection

  const providerNames = {
    apple: 'Apple Health',
    google: 'Google Fit',
    samsung: 'Samsung Health',
    fitbit: 'Fitbit'
  };

  // Check if already connected
  if (connectedHealthAccounts[provider]) {
    if (confirm(`Disconnect from ${providerNames[provider]}?`)) {
      disconnectHealthAccount(provider);
    }
    return;
  }

  // Simulate OAuth flow
  const confirmed = confirm(`Connect to ${providerNames[provider]}?\n\nIn production, this would redirect you to ${providerNames[provider]} to authorize access to your health data.\n\nClick OK to simulate a successful connection.`);

  if (confirmed) {
    connectedHealthAccounts[provider] = {
      connected: true,
      connectedAt: new Date().toISOString(),
      syncEnabled: true
    };
    saveHealthAccounts();
    updateHealthAccountUI(provider);

    // Update care plan based on connected health data
    updatePlanForConnectedDevice(provider, 'health-account');

    // Show success message
    alert(`Successfully connected to ${providerNames[provider]}!\n\nYour health data will now sync with Caribou and your care plan has been updated to incorporate your health metrics.`);
  }
}

function disconnectHealthAccount(provider) {
  delete connectedHealthAccounts[provider];
  saveHealthAccounts();
  updateHealthAccountUI(provider);
}

function saveHealthAccounts() {
  localStorage.setItem('caribouHealthAccounts', JSON.stringify(connectedHealthAccounts));
}

function loadHealthAccounts() {
  connectedHealthAccounts = JSON.parse(localStorage.getItem('caribouHealthAccounts') || '{}');

  // Update UI for all providers
  ['apple', 'google', 'samsung', 'fitbit'].forEach(provider => {
    updateHealthAccountUI(provider);
  });
}

function updateHealthAccountUI(provider) {
  const statusMap = {
    apple: 'apple-health-status',
    google: 'google-fit-status',
    samsung: 'samsung-health-status',
    fitbit: 'fitbit-status'
  };

  const btnMap = {
    apple: 'apple-health-btn',
    google: 'google-fit-btn',
    samsung: 'samsung-health-btn',
    fitbit: 'fitbit-btn'
  };

  const itemMap = {
    apple: 'health-account-apple',
    google: 'health-account-google',
    samsung: 'health-account-samsung',
    fitbit: 'health-account-fitbit'
  };

  const statusEl = document.getElementById(statusMap[provider]);
  const btnEl = document.getElementById(btnMap[provider]);
  const itemEl = document.getElementById(itemMap[provider]);

  if (!statusEl || !btnEl) return;

  const isConnected = connectedHealthAccounts[provider]?.connected;

  if (isConnected) {
    statusEl.textContent = 'Connected';
    btnEl.textContent = 'Disconnect';
    btnEl.classList.add('btn-outline-danger');
    if (itemEl) itemEl.classList.add('connected');
  } else {
    statusEl.textContent = 'Not connected';
    btnEl.textContent = 'Connect';
    btnEl.classList.remove('btn-outline-danger');
    if (itemEl) itemEl.classList.remove('connected');
  }
}

// ============================================
// Progress Tracking & Charts
// ============================================

// Track daily progress history
let progressHistory = JSON.parse(localStorage.getItem('caribouProgressHistory') || '{}');

function updateProgressCharts() {
  updateWeeklyProgressBars();
  updateHealthMetricsDisplay();
  updateRecoveryProgress();
}

function updateWeeklyProgressBars() {
  const barsContainer = document.getElementById('weekly-progress-bars');
  if (!barsContainer) return;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const todayDay = today.getDay();

  // Get the diagnosis/start date - only show progress from this date onwards
  let startDate = null;
  if (AppState.userData && AppState.userData.diagnosisDate) {
    startDate = new Date(AppState.userData.diagnosisDate);
  } else if (AppState.accountCreatedDate) {
    startDate = new Date(AppState.accountCreatedDate);
  } else {
    // Default to today if no start date - new user
    startDate = today;
  }
  // Reset to start of day for comparison
  startDate.setHours(0, 0, 0, 0);

  // Generate last 7 days progress
  const bars = barsContainer.querySelectorAll('.progress-bar-day');
  bars.forEach((bar, index) => {
    const fill = bar.querySelector('.progress-bar-fill');

    // Calculate what date this bar represents
    // Bars are ordered Sun(0) to Sat(6), representing the current week
    const dayDiff = index - todayDay;
    const barDate = new Date(today);
    barDate.setDate(today.getDate() + dayDiff);
    barDate.setHours(0, 0, 0, 0);

    // Remove any existing today class
    bar.classList.remove('today');

    if (index === todayDay) {
      // Today - show current progress
      bar.classList.add('today');
      const todayProgress = calculateDailyProgress();
      fill.style.height = `${Math.max(todayProgress, 5)}%`;
      fill.style.background = '';
    } else if (barDate < startDate) {
      // Before diagnosis/start date - show empty/disabled
      fill.style.height = '0%';
      fill.style.background = 'var(--gray-200)';
    } else if (barDate > today) {
      // Future days - show empty
      fill.style.height = '0%';
      fill.style.background = 'var(--gray-200)';
    } else {
      // Past days after start date - show historical data
      const dateKey = getDateKey(barDate);
      const historical = progressHistory[dateKey] || 0;
      fill.style.height = `${historical}%`;
      fill.style.background = '';
    }
  });
}

function calculateDailyProgress() {
  const completedCount = Object.values(AppState.completedTasks || {}).filter(Boolean).length;
  // Estimate total tasks for the day (rough approximation)
  const totalTasks = 10; // Could be calculated more precisely
  return Math.min(Math.round((completedCount / totalTasks) * 100), 100);
}

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function saveDailyProgress() {
  const dateKey = getDateKey(new Date());
  progressHistory[dateKey] = calculateDailyProgress();
  localStorage.setItem('caribouProgressHistory', JSON.stringify(progressHistory));
}

function updateHealthMetricsDisplay() {
  const metricsSection = document.getElementById('health-metrics-section');
  if (!metricsSection) return;

  // Check if any wearable or health account is connected
  const hasWearable = Object.values(pairedWearables || {}).some(w => w?.paired);
  const hasHealthAccount = Object.values(connectedHealthAccounts || {}).some(h => h?.connected);

  if (hasWearable || hasHealthAccount) {
    metricsSection.style.display = 'block';

    // Simulate health data (in production, this would come from the connected device)
    const metrics = generateSimulatedHealthMetrics();
    document.getElementById('metric-heart-rate').textContent = metrics.heartRate;
    document.getElementById('metric-steps').textContent = metrics.steps.toLocaleString();
    document.getElementById('metric-sleep').textContent = metrics.sleep;
    document.getElementById('metric-recovery').textContent = metrics.recovery + '%';
  } else {
    metricsSection.style.display = 'none';
  }
}

function generateSimulatedHealthMetrics() {
  // Generate realistic-looking health metrics
  return {
    heartRate: Math.floor(Math.random() * 20 + 60), // 60-80 BPM
    steps: Math.floor(Math.random() * 5000 + 3000), // 3000-8000 steps
    sleep: (Math.random() * 2 + 6).toFixed(1), // 6-8 hours
    recovery: Math.floor(Math.random() * 30 + 60) // 60-90%
  };
}

function getEstimatedRecoveryDays() {
  // Calculate recovery days based on actual condition(s)
  const allConditions = getAllUserConditions();
  let maxRecoveryWeeks = 8; // Default if no condition-specific data

  allConditions.forEach(condId => {
    const condData = ClinicalDatabase.getConditionData(condId);
    if (condData && condData.recoveryWeeks && condData.recoveryWeeks > maxRecoveryWeeks) {
      maxRecoveryWeeks = condData.recoveryWeeks;
    }
  });

  return maxRecoveryWeeks * 7; // Convert weeks to days
}

function updateRecoveryProgress() {
  // Calculate recovery progress based on days since diagnosis
  const diagnosisDate = AppState.userData?.diagnosisDate ? new Date(AppState.userData.diagnosisDate) : new Date();
  const today = new Date();
  const daysSinceDiagnosis = Math.floor((today - diagnosisDate) / (1000 * 60 * 60 * 24));

  // Estimate recovery timeline based on actual condition(s)
  const estimatedRecoveryDays = getEstimatedRecoveryDays();
  const recoveryPercent = Math.min(Math.round((daysSinceDiagnosis / estimatedRecoveryDays) * 100), 100);

  const fillEl = document.getElementById('recovery-progress-fill');
  const percentEl = document.getElementById('recovery-progress-percent');
  const estimateEl = document.getElementById('recovery-estimate');

  if (fillEl) fillEl.style.width = `${recoveryPercent}%`;
  if (percentEl) percentEl.textContent = `${recoveryPercent}%`;

  if (estimateEl) {
    const remainingWeeks = Math.ceil((estimatedRecoveryDays - daysSinceDiagnosis) / 7);
    if (remainingWeeks > 0) {
      estimateEl.textContent = `Estimated: ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''} remaining`;
    } else {
      estimateEl.textContent = 'Recovery goals achieved!';
    }
  }
}

function updateProgressPage() {
  // Update overall progress ring
  const diagnosisDate = AppState.userData?.diagnosisDate ? new Date(AppState.userData.diagnosisDate) : new Date();
  const today = new Date();
  const daysSinceDiagnosis = Math.floor((today - diagnosisDate) / (1000 * 60 * 60 * 24));
  const estimatedRecoveryDays = getEstimatedRecoveryDays();
  const recoveryPercent = Math.min(Math.round((daysSinceDiagnosis / estimatedRecoveryDays) * 100), 100);

  // Update progress ring
  const ringFill = document.getElementById('overall-progress-ring');
  const progressValue = document.getElementById('overall-progress-value');
  if (ringFill) {
    const circumference = 2 * Math.PI * 40; // r=40
    const offset = circumference - (recoveryPercent / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
  }
  if (progressValue) progressValue.textContent = `${recoveryPercent}%`;

  // Update stats
  const daysEl = document.getElementById('days-in-program');
  const tasksEl = document.getElementById('total-tasks-completed');
  const streakEl = document.getElementById('current-streak');

  if (daysEl) daysEl.textContent = daysSinceDiagnosis + 1;
  if (tasksEl) {
    const totalCompleted = Object.values(progressHistory).reduce((sum, val) => sum + Math.floor(val / 10), 0);
    tasksEl.textContent = totalCompleted || Object.values(AppState.completedTasks || {}).filter(Boolean).length;
  }
  if (streakEl) streakEl.textContent = calculateStreak();

  // Update activity chart
  updateActivityChart();

  // Update task breakdown section dynamically
  updateTaskBreakdown();

  // Update achievements section dynamically
  updateAchievements();

  // Update health metrics section if connected
  updateProgressPageHealthMetrics();
}

function updateTaskBreakdown() {
  const breakdownList = document.getElementById('task-breakdown-list');
  if (!breakdownList) return;

  // Get actual completed tasks from AppState (today only)
  const ptCompleted = AppState.completedTasks?.pt?.length || 0;
  const nutritionCompleted = AppState.completedTasks?.nutrition?.length || 0;
  const medCompleted = AppState.completedTasks?.medication?.length || 0;
  const wellnessCompleted = (AppState.completedTasks?.wellness?.length || 0) +
                            (AppState.hydrationCount >= 8 ? 1 : 0);

  // Get ACTUAL tasks available today from what was generated
  // This reflects the real tasks the user has, not estimates
  const combinedExercises = typeof getCombinedExercises === 'function' ? getCombinedExercises() : [];
  const ptTotal = combinedExercises.length || 0;

  // Count actual nutrition tasks (4 meals max per day)
  const nutritionTotal = 4; // breakfast, lunch, dinner, snack

  // Count actual medication tasks from user's medication list
  const medicationsList = AppState.userData?.medicationsList || [];
  const legacyMeds = AppState.userData?.medications ? AppState.userData.medications.split(',').map(m => m.trim()).filter(m => m) : [];
  const hasMorningMeds = medicationsList.some(m => m.timeOfDay?.includes('morning')) || legacyMeds.length > 0;
  const hasEveningMeds = medicationsList.some(m => m.timeOfDay?.includes('evening'));
  const medTotal = (hasMorningMeds ? 1 : 0) + (hasEveningMeds || hasMorningMeds ? 1 : 0); // At most 2 (morning + evening)

  // Count actual wellness tasks based on user conditions
  let wellnessTotal = 2; // Base: hydration + rest
  if (AppState.userData?.sleepQuality && AppState.userData.sleepQuality !== 'good') wellnessTotal++;
  if (AppState.userData?.stressLevel && (AppState.userData.stressLevel === 'high' || AppState.userData.stressLevel === 'very_high')) wellnessTotal++;

  // Calculate percentages based on ACTUAL tasks
  const ptPercent = ptTotal > 0 ? Math.round((ptCompleted / ptTotal) * 100) : (ptCompleted > 0 ? 100 : 0);
  const nutritionPercent = nutritionTotal > 0 ? Math.round((nutritionCompleted / nutritionTotal) * 100) : 0;
  const medPercent = medTotal > 0 ? Math.round((medCompleted / medTotal) * 100) : (medCompleted > 0 ? 100 : 0);
  const wellnessPercent = wellnessTotal > 0 ? Math.round((wellnessCompleted / wellnessTotal) * 100) : 0;

  breakdownList.innerHTML = `
    <div class="task-breakdown-item">
      <div class="task-breakdown-info">
        <span class="task-breakdown-name">Fitness</span>
        <span class="task-breakdown-count">${ptCompleted}/${ptTotal} today</span>
      </div>
      <div class="task-breakdown-bar">
        <div class="task-breakdown-fill" style="width: ${Math.min(ptPercent, 100)}%; background: var(--primary-500);"></div>
      </div>
    </div>
    <div class="task-breakdown-item">
      <div class="task-breakdown-info">
        <span class="task-breakdown-name">Nutrition</span>
        <span class="task-breakdown-count">${nutritionCompleted}/${nutritionTotal} today</span>
      </div>
      <div class="task-breakdown-bar">
        <div class="task-breakdown-fill" style="width: ${Math.min(nutritionPercent, 100)}%; background: var(--success);"></div>
      </div>
    </div>
    ${medTotal > 0 ? `
    <div class="task-breakdown-item">
      <div class="task-breakdown-info">
        <span class="task-breakdown-name">Medication</span>
        <span class="task-breakdown-count">${medCompleted}/${medTotal} today</span>
      </div>
      <div class="task-breakdown-bar">
        <div class="task-breakdown-fill" style="width: ${Math.min(medPercent, 100)}%; background: var(--info);"></div>
      </div>
    </div>
    ` : ''}
    <div class="task-breakdown-item">
      <div class="task-breakdown-info">
        <span class="task-breakdown-name">Wellness</span>
        <span class="task-breakdown-count">${wellnessCompleted}/${wellnessTotal} today</span>
      </div>
      <div class="task-breakdown-bar">
        <div class="task-breakdown-fill" style="width: ${Math.min(wellnessPercent, 100)}%; background: var(--warning);"></div>
      </div>
    </div>
  `;
}

function updateAchievements() {
  const achievementsGrid = document.getElementById('achievements-grid');
  if (!achievementsGrid) return;

  // Calculate achievement status based on actual user progress
  const totalTasksCompleted =
    (AppState.completedTasks?.pt?.length || 0) +
    (AppState.completedTasks?.nutrition?.length || 0) +
    (AppState.completedTasks?.medication?.length || 0) +
    (AppState.completedTasks?.wellness?.length || 0) +
    (AppState.completedTasks?.home?.length || 0);

  const currentStreak = calculateStreak();
  const diagnosisDate = AppState.userData?.diagnosisDate ? new Date(AppState.userData.diagnosisDate) : new Date();
  const today = new Date();
  const daysInProgram = Math.floor((today - diagnosisDate) / (1000 * 60 * 60 * 24)) + 1;

  // Define achievements and their conditions
  const achievements = [
    {
      id: 'first-step',
      name: 'First Step',
      desc: 'Complete your first task',
      icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
      earned: totalTasksCompleted >= 1
    },
    {
      id: 'on-track',
      name: 'On Track',
      desc: '3-day streak',
      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      earned: currentStreak >= 3
    },
    {
      id: 'meal-master',
      name: 'Meal Master',
      desc: 'Follow meal plan for a week',
      icon: '<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
      earned: (AppState.completedTasks?.nutrition?.length || 0) >= 21 || daysInProgram >= 7
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      desc: '7-day streak',
      icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>',
      earned: currentStreak >= 7
    },
    {
      id: 'pt-pro',
      name: 'PT Pro',
      desc: 'Complete 10 exercises',
      icon: '<path d="M18 8c0-2.21-1.79-4-4-4-1.32 0-2.48.64-3.21 1.63"/><path d="M6 8c0-2.21 1.79-4 4-4 1.32 0 2.48.64 3.21 1.63"/><path d="M18 8v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8"/>',
      earned: (AppState.completedTasks?.pt?.length || 0) >= 10
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      desc: 'Complete 50 tasks total',
      icon: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>',
      earned: totalTasksCompleted >= 50
    }
  ];

  // Only show earned achievements
  const earnedAchievements = achievements.filter(a => a.earned);

  if (earnedAchievements.length === 0) {
    achievementsGrid.innerHTML = `
      <div class="no-achievements-placeholder" style="grid-column: 1 / -1; text-align: center; padding: var(--space-6); color: var(--gray-500);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto var(--space-3); opacity: 0.5;">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <p style="font-size: 0.875rem; margin-bottom: var(--space-1);">No badges earned yet</p>
        <p style="font-size: 0.75rem;">Complete tasks to unlock your first achievement!</p>
      </div>
    `;
    return;
  }

  achievementsGrid.innerHTML = earnedAchievements.map(achievement => `
    <div class="achievement-item earned">
      <div class="achievement-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${achievement.icon}
        </svg>
      </div>
      <span class="achievement-name">${achievement.name}</span>
      <span class="achievement-desc">${achievement.desc}</span>
    </div>
  `).join('');
}

function calculateStreak() {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = getDateKey(date);
    const progress = progressHistory[dateKey];

    if (progress && progress > 0) {
      streak++;
    } else if (i > 0) { // Allow today to have 0 progress
      break;
    }
  }

  return Math.max(streak, 1); // At least 1 day
}

function updateActivityChart() {
  const chartEl = document.getElementById('activity-chart');
  if (!chartEl) return;

  const rangeSelect = document.getElementById('activity-chart-range');
  const days = parseInt(rangeSelect?.value || '7');

  const today = new Date();
  let html = '';

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = getDateKey(date);
    // Use actual progress data from history, or calculate today's progress, or show 0 for no data
    const dayProgress = progressHistory[dateKey] || (i === 0 ? calculateDailyProgress() : 0);

    // Distribute progress across categories
    const ptHeight = Math.min(dayProgress * 1.2, 100);
    const nutritionHeight = Math.min(dayProgress * 0.9, 100);
    const medHeight = Math.min(dayProgress * 0.8, 100);

    const dayLabel = date.toLocaleDateString('en', { weekday: 'short' }).charAt(0);

    html += `
      <div class="activity-bar-group">
        <div class="activity-bars">
          <div class="activity-bar pt" style="height: ${ptHeight}%;"></div>
          <div class="activity-bar nutrition" style="height: ${nutritionHeight}%;"></div>
          <div class="activity-bar medication" style="height: ${medHeight}%;"></div>
        </div>
        <span class="activity-bar-label">${dayLabel}</span>
      </div>
    `;
  }

  chartEl.innerHTML = html;
}

function updateProgressPageHealthMetrics() {
  const metricsContent = document.getElementById('progress-metrics-content');
  if (!metricsContent) return;

  const hasWearable = Object.values(pairedWearables || {}).some(w => w?.paired);
  const hasHealthAccount = Object.values(connectedHealthAccounts || {}).some(h => h?.connected);

  if (hasWearable || hasHealthAccount) {
    const metrics = generateSimulatedHealthMetrics();
    metricsContent.innerHTML = `
      <div class="health-metrics-grid" style="margin-bottom: var(--space-4);">
        <div class="health-metric-item">
          <div class="health-metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <div class="health-metric-data">
            <span class="health-metric-value">${metrics.heartRate}</span>
            <span class="health-metric-label">BPM</span>
          </div>
        </div>
        <div class="health-metric-item">
          <div class="health-metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="health-metric-data">
            <span class="health-metric-value">${metrics.steps.toLocaleString()}</span>
            <span class="health-metric-label">Steps</span>
          </div>
        </div>
        <div class="health-metric-item">
          <div class="health-metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </div>
          <div class="health-metric-data">
            <span class="health-metric-value">${metrics.sleep}</span>
            <span class="health-metric-label">hrs sleep</span>
          </div>
        </div>
        <div class="health-metric-item">
          <div class="health-metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="health-metric-data">
            <span class="health-metric-value">${metrics.recovery}%</span>
            <span class="health-metric-label">Recovery</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.75rem; color: var(--gray-500); text-align: center;">Last synced: ${new Date().toLocaleTimeString()}</p>
    `;
  }
}

function exportProgressReport() {
  const diagnosisDate = AppState.userData?.diagnosisDate ? new Date(AppState.userData.diagnosisDate) : new Date();
  const today = new Date();
  const daysSinceDiagnosis = Math.floor((today - diagnosisDate) / (1000 * 60 * 60 * 24));

  const report = `
CARIBOU PROGRESS REPORT
=======================
Generated: ${today.toLocaleDateString()}

Patient: ${AppState.userData?.firstName || 'Patient'}
Condition: ${AppState.userData?.diagnosis || 'Not specified'}
Days in Program: ${daysSinceDiagnosis + 1}

PROGRESS SUMMARY
----------------
Tasks Completed: ${Object.values(AppState.completedTasks || {}).filter(Boolean).length}
Current Streak: ${calculateStreak()} days
Overall Recovery: ${Math.min(Math.round((daysSinceDiagnosis / 49) * 100), 100)}%

This report was generated by Caribou - AI-Powered Patient Care Platform
https://caribou.health
  `.trim();

  // Create download
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `caribou-progress-${getDateKey(today)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function emailProgressReport() {
  const clinicianEmail = AppState.userData?.clinicianEmail || '';
  const subject = encodeURIComponent(`Progress Report - ${AppState.userData?.firstName || 'Patient'}`);
  const body = encodeURIComponent(`Dear ${AppState.userData?.clinicianName || 'Doctor'},\n\nPlease find my latest progress report attached.\n\nBest regards,\n${AppState.userData?.firstName || 'Patient'}`);

  window.open(`mailto:${clinicianEmail}?subject=${subject}&body=${body}`);
}

// ============================================
// Wearable Device Integration
// ============================================

let pairedWearables = JSON.parse(localStorage.getItem('caribouWearables') || '{}');

function pairWearableDevice(deviceType) {
  const deviceNames = {
    'apple-watch': 'Apple Watch',
    'garmin': 'Garmin',
    'whoop': 'Whoop',
    'oura': 'Oura Ring'
  };

  // Check if already paired
  if (pairedWearables[deviceType]) {
    if (confirm(`Unpair ${deviceNames[deviceType]}?`)) {
      unpairWearableDevice(deviceType);
    }
    return;
  }

  // Simulate pairing flow
  const confirmed = confirm(`Pair ${deviceNames[deviceType]}?\n\nIn production, this would:\n1. Search for nearby ${deviceNames[deviceType]} devices\n2. Request Bluetooth pairing\n3. Set up data sync\n\nClick OK to simulate a successful pairing.`);

  if (confirmed) {
    pairedWearables[deviceType] = {
      paired: true,
      pairedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      deviceName: deviceNames[deviceType]
    };
    saveWearables();
    updateWearableUI(deviceType);

    // Update care plan based on wearable data
    updatePlanForConnectedDevice(deviceType, 'wearable');

    // Show success message
    alert(`Successfully paired ${deviceNames[deviceType]}!\n\nYour health metrics will now sync automatically and your care plan has been updated to incorporate:\n- Heart rate monitoring\n- Steps & activity tracking\n- Sleep data analysis\n- Recovery scores`);
  }
}

// Update care plan when a device is connected
function updatePlanForConnectedDevice(deviceId, deviceType) {
  // Get simulated health data from the device
  const healthData = generateSimulatedHealthMetrics();

  // Store the connected device data
  if (!AppState.userData.connectedDevices) {
    AppState.userData.connectedDevices = {};
  }
  AppState.userData.connectedDevices[deviceId] = {
    type: deviceType,
    connectedAt: new Date().toISOString(),
    lastData: healthData
  };

  // Adjust care plan based on health metrics
  const planAdjustments = [];

  // Check heart rate - if elevated, suggest more rest
  if (healthData.heartRate > 75) {
    planAdjustments.push('Added extra rest periods due to elevated heart rate');
    if (!AppState.userData.planAdjustments) {
      AppState.userData.planAdjustments = [];
    }
    AppState.userData.planAdjustments.push({
      type: 'rest-increase',
      reason: 'Elevated resting heart rate detected',
      date: new Date().toISOString()
    });
  }

  // Check steps - if low, encourage more movement
  if (healthData.steps < 5000) {
    planAdjustments.push('Added gentle walking reminders to increase daily activity');
    if (!AppState.userData.planAdjustments) {
      AppState.userData.planAdjustments = [];
    }
    AppState.userData.planAdjustments.push({
      type: 'activity-reminder',
      reason: 'Low step count detected',
      date: new Date().toISOString()
    });
  }

  // Check sleep - if poor, add sleep hygiene tips
  if (parseFloat(healthData.sleep) < 7) {
    planAdjustments.push('Added sleep hygiene recommendations');
    AppState.userData.sleepQuality = 'poor';
  }

  // Check recovery - if low, reduce exercise intensity
  if (healthData.recovery < 70) {
    planAdjustments.push('Temporarily reduced exercise intensity for better recovery');
    if (!AppState.userData.planAdjustments) {
      AppState.userData.planAdjustments = [];
    }
    AppState.userData.planAdjustments.push({
      type: 'intensity-reduction',
      reason: 'Low recovery score',
      date: new Date().toISOString()
    });
  }

  saveState();

  // Regenerate task categories with new adjustments
  if (typeof generateTaskCategories === 'function') {
    generateTaskCategories();
  }

  // Log the adjustments
  console.log('Care plan updated for connected device:', deviceId);
  console.log('Adjustments made:', planAdjustments);

  return planAdjustments;
}

function unpairWearableDevice(deviceType) {
  delete pairedWearables[deviceType];
  saveWearables();
  updateWearableUI(deviceType);
}

function saveWearables() {
  localStorage.setItem('caribouWearables', JSON.stringify(pairedWearables));
}

function loadWearables() {
  pairedWearables = JSON.parse(localStorage.getItem('caribouWearables') || '{}');

  // Update UI for all devices
  ['apple-watch', 'garmin', 'whoop', 'oura'].forEach(device => {
    updateWearableUI(device);
  });
}

function updateWearableUI(deviceType) {
  const statusMap = {
    'apple-watch': 'apple-watch-status',
    'garmin': 'garmin-status',
    'whoop': 'whoop-status',
    'oura': 'oura-status'
  };

  const btnMap = {
    'apple-watch': 'apple-watch-btn',
    'garmin': 'garmin-btn',
    'whoop': 'whoop-btn',
    'oura': 'oura-btn'
  };

  const itemMap = {
    'apple-watch': 'wearable-apple-watch',
    'garmin': 'wearable-garmin',
    'whoop': 'wearable-whoop',
    'oura': 'wearable-oura'
  };

  const statusEl = document.getElementById(statusMap[deviceType]);
  const btnEl = document.getElementById(btnMap[deviceType]);
  const itemEl = document.getElementById(itemMap[deviceType]);

  if (!statusEl || !btnEl) return;

  const isPaired = pairedWearables[deviceType]?.paired;

  if (isPaired) {
    const lastSync = new Date(pairedWearables[deviceType].lastSync);
    const timeAgo = getTimeAgo(lastSync);
    statusEl.textContent = `Paired - Synced ${timeAgo}`;
    btnEl.textContent = 'Unpair';
    if (itemEl) itemEl.classList.add('paired');
  } else {
    statusEl.textContent = 'Not paired';
    btnEl.textContent = 'Pair';
    if (itemEl) itemEl.classList.remove('paired');
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================
// Family Sub-Profiles (Family Tier Feature)
// ============================================

// Store family profiles
let familyProfiles = {};
let activeProfileId = 'self'; // 'self' represents the main user profile

function loadFamilyProfiles() {
  familyProfiles = JSON.parse(localStorage.getItem('caribouFamilyProfiles') || '{}');

  // Show/hide family profiles section based on tier
  const familySection = document.getElementById('family-profiles-section');
  if (familySection) {
    const isFamilyTier = hasTierAccess('family');
    familySection.style.display = isFamilyTier ? 'block' : 'none';
  }

  // Render family profiles list
  renderFamilyProfilesList();
}

function renderFamilyProfilesList() {
  const container = document.getElementById('family-profiles-list');
  if (!container) return;

  const profileIds = Object.keys(familyProfiles);

  if (profileIds.length === 0) {
    container.innerHTML = `
      <p style="color: var(--gray-500); font-size: 0.875rem; text-align: center; padding: var(--space-3);">
        No family members added yet
      </p>
    `;
    return;
  }

  container.innerHTML = profileIds.map(id => {
    const profile = familyProfiles[id];
    const isActive = activeProfileId === id;
    const relationshipLabels = {
      'parent': 'Parent',
      'spouse': 'Spouse/Partner',
      'child': 'Child',
      'sibling': 'Sibling',
      'grandparent': 'Grandparent',
      'other': 'Family Member'
    };

    return `
      <div class="family-profile-item ${isActive ? 'active' : ''}" data-profile-id="${id}">
        <div class="family-profile-info">
          <div class="family-profile-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <span class="family-profile-name">${profile.name}</span>
            <span class="family-profile-relationship">${relationshipLabels[profile.relationship] || 'Family'}</span>
          </div>
        </div>
        <div class="family-profile-actions">
          ${!isActive ? `<button class="btn btn-sm btn-primary" onclick="switchToFamilyProfile('${id}')">View Plan</button>` : '<span class="active-badge">Active</span>'}
          <button class="btn btn-sm btn-outline" onclick="editFamilyProfile('${id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-outline" onclick="deleteFamilyProfile('${id}')" title="Remove" style="color: var(--error);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function showAddFamilyProfileModal() {
  const modal = document.getElementById('family-profile-modal');
  if (!modal) return;

  // Reset form
  document.getElementById('family-profile-id').value = '';
  document.getElementById('family-member-name').value = '';
  document.getElementById('family-member-relationship').value = 'parent';
  document.getElementById('family-member-age').value = '';
  document.getElementById('family-member-notes').value = '';

  // Populate condition dropdown
  populateFamilyConditionDropdown();

  // Update modal title
  document.getElementById('family-modal-title').textContent = 'Add Family Member';
  document.getElementById('family-modal-subtitle').textContent = 'Create a care plan for your loved one';

  modal.style.display = 'flex';
}

function editFamilyProfile(profileId) {
  const profile = familyProfiles[profileId];
  if (!profile) return;

  const modal = document.getElementById('family-profile-modal');
  if (!modal) return;

  // Populate form with existing data
  document.getElementById('family-profile-id').value = profileId;
  document.getElementById('family-member-name').value = profile.name || '';
  document.getElementById('family-member-relationship').value = profile.relationship || 'parent';
  document.getElementById('family-member-age').value = profile.age || '';
  document.getElementById('family-member-notes').value = profile.notes || '';

  // Populate condition dropdown
  populateFamilyConditionDropdown();
  document.getElementById('family-member-condition').value = profile.condition || '';

  // Update modal title
  document.getElementById('family-modal-title').textContent = 'Edit Family Member';
  document.getElementById('family-modal-subtitle').textContent = `Update ${profile.name}'s care profile`;

  modal.style.display = 'flex';
}

function closeFamilyProfileModal() {
  const modal = document.getElementById('family-profile-modal');
  if (modal) modal.style.display = 'none';
}

function populateFamilyConditionDropdown() {
  const select = document.getElementById('family-member-condition');
  if (!select) return;

  // Use the same conditions as intake form
  select.innerHTML = buildConditionOptionsHTML();
}

function saveFamilyProfile(event) {
  event.preventDefault();

  const profileId = document.getElementById('family-profile-id').value || 'family-' + Date.now();
  const name = document.getElementById('family-member-name').value.trim();
  const relationship = document.getElementById('family-member-relationship').value;
  const age = document.getElementById('family-member-age').value;
  const condition = document.getElementById('family-member-condition').value;
  const notes = document.getElementById('family-member-notes').value.trim();

  if (!name || !condition) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  // Get condition name
  const conditionData = ConditionsDatabase.find(c => c.id === condition);
  const conditionName = conditionData ? conditionData.name : condition;

  // Save profile
  familyProfiles[profileId] = {
    id: profileId,
    name: name,
    relationship: relationship,
    age: age ? parseInt(age) : null,
    condition: condition,
    conditionName: conditionName,
    notes: notes,
    createdAt: familyProfiles[profileId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Initialize their care plan data
    carePlan: familyProfiles[profileId]?.carePlan || {
      completedTasks: { home: [], medication: [], pt: [], nutrition: [], wellness: [] },
      hydrationCount: 0,
      mealsEatenToday: []
    }
  };

  // Save to localStorage
  localStorage.setItem('caribouFamilyProfiles', JSON.stringify(familyProfiles));

  // Close modal and refresh list
  closeFamilyProfileModal();
  renderFamilyProfilesList();

  showToast(`${name}'s profile has been saved`, 'success');
}

function deleteFamilyProfile(profileId) {
  const profile = familyProfiles[profileId];
  if (!profile) return;

  if (!confirm(`Are you sure you want to remove ${profile.name}'s profile? This cannot be undone.`)) {
    return;
  }

  // If this was the active profile, switch back to self
  if (activeProfileId === profileId) {
    switchToSelfProfile();
  }

  // Delete profile
  delete familyProfiles[profileId];
  localStorage.setItem('caribouFamilyProfiles', JSON.stringify(familyProfiles));

  // Refresh list
  renderFamilyProfilesList();
  showToast(`${profile.name}'s profile has been removed`, 'success');
}

function switchToFamilyProfile(profileId) {
  const profile = familyProfiles[profileId];
  if (!profile) return;

  // Save current profile's state if switching from self
  if (activeProfileId === 'self') {
    // Current state is already saved in AppState
  } else if (activeProfileId && familyProfiles[activeProfileId]) {
    // Save current family profile's state
    familyProfiles[activeProfileId].carePlan = {
      completedTasks: { ...AppState.completedTasks },
      hydrationCount: AppState.hydrationCount,
      mealsEatenToday: [...AppState.mealsEatenToday]
    };
    localStorage.setItem('caribouFamilyProfiles', JSON.stringify(familyProfiles));
  }

  // Switch to new profile
  activeProfileId = profileId;

  // Update active profile indicator
  const activeNameEl = document.getElementById('active-profile-name');
  if (activeNameEl) {
    activeNameEl.textContent = profile.name;
  }

  // Load family member's care plan state
  if (profile.carePlan) {
    AppState.completedTasks = { ...profile.carePlan.completedTasks };
    AppState.hydrationCount = profile.carePlan.hydrationCount || 0;
    AppState.mealsEatenToday = [...(profile.carePlan.mealsEatenToday || [])];
  }

  // Update diagnosis for this family member
  const originalDiagnosis = AppState.userData.diagnosis;
  AppState.userData.diagnosis = profile.condition;
  AppState.userData.primaryConditions = [{ id: profile.condition, name: profile.conditionName }];

  // Re-render the lists
  renderFamilyProfilesList();

  // Navigate to dashboard with family member's view
  navigateTo('home');

  // Show notification
  showToast(`Now viewing ${profile.name}'s care plan`, 'info');

  // Store that we're viewing a family profile
  localStorage.setItem('caribouActiveProfile', profileId);
}

function switchToSelfProfile() {
  // Save current family profile's state if applicable
  if (activeProfileId !== 'self' && familyProfiles[activeProfileId]) {
    familyProfiles[activeProfileId].carePlan = {
      completedTasks: { ...AppState.completedTasks },
      hydrationCount: AppState.hydrationCount,
      mealsEatenToday: [...AppState.mealsEatenToday]
    };
    localStorage.setItem('caribouFamilyProfiles', JSON.stringify(familyProfiles));
  }

  // Switch to self
  activeProfileId = 'self';

  // Update active profile indicator
  const activeNameEl = document.getElementById('active-profile-name');
  if (activeNameEl) {
    activeNameEl.textContent = 'You';
  }

  // Restore own state from account data
  if (AccountSystem.isLoggedIn()) {
    const email = AccountSystem.getCurrentUser();
    const accounts = AccountSystem.getAccounts();
    const account = accounts[email];
    if (account && account.appState) {
      AppState.completedTasks = { ...account.appState.completedTasks };
      AppState.hydrationCount = account.appState.hydrationCount || 0;
      AppState.mealsEatenToday = [...(account.appState.mealsEatenToday || [])];
      AppState.userData = { ...account.appState.userData };
    }
  }

  // Re-render
  renderFamilyProfilesList();
  navigateTo('home');

  showToast('Now viewing your personal care plan', 'info');
  localStorage.setItem('caribouActiveProfile', 'self');
}

// ============================================
// Document Upload Modal Functions
// ============================================

function showUploadDocumentModal() {
  const modal = document.getElementById('document-upload-modal');
  if (!modal) return;

  // Reset form
  document.getElementById('document-name').value = '';
  document.getElementById('document-type').value = 'medical-record';

  const fileInput = document.getElementById('profile-document-file');
  if (fileInput) fileInput.value = '';

  const preview = document.getElementById('document-file-preview');
  if (preview) {
    preview.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17,8 12,3 7,8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p style="color: var(--gray-500); margin-top: var(--space-2);">Click to select a file</p>
      <p style="color: var(--gray-400); font-size: 0.75rem;">PDF, images, or documents</p>
    `;
  }

  modal.style.display = 'flex';
}

function closeUploadDocumentModal() {
  const modal = document.getElementById('document-upload-modal');
  if (modal) modal.style.display = 'none';
}

function previewDocumentFile(input) {
  const preview = document.getElementById('document-file-preview');
  if (!preview || !input.files || !input.files[0]) return;

  const file = input.files[0];
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 150px; border-radius: var(--radius);">
        <p style="color: var(--gray-600); font-size: 0.75rem; margin-top: var(--space-2);">${file.name}</p>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    // Show file icon for non-images
    const iconMap = {
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝'
    };
    const icon = iconMap[file.type] || '📎';

    preview.innerHTML = `
      <span style="font-size: 48px;">${icon}</span>
      <p style="color: var(--gray-600); font-size: 0.875rem; margin-top: var(--space-2);">${file.name}</p>
      <p style="color: var(--gray-400); font-size: 0.75rem;">${(file.size / 1024).toFixed(1)} KB</p>
    `;
  }
}

function uploadProfileDocument(event) {
  event.preventDefault();

  const name = document.getElementById('document-name').value.trim();
  const type = document.getElementById('document-type').value;
  const fileInput = document.getElementById('profile-document-file');

  if (!name || !fileInput.files || !fileInput.files[0]) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    // Get existing documents
    const documents = JSON.parse(localStorage.getItem('caribouProfileDocuments') || '[]');

    // Add new document
    documents.push({
      id: 'doc-' + Date.now(),
      name: name,
      type: type,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      data: e.target.result,
      uploadedAt: new Date().toISOString()
    });

    // Save to localStorage
    localStorage.setItem('caribouProfileDocuments', JSON.stringify(documents));

    // Refresh documents list
    loadProfileDocuments();

    // Close modal
    closeUploadDocumentModal();

    showToast('Document uploaded successfully', 'success');
  };

  reader.readAsDataURL(file);
}

// ============================================
// Initialize Application
// ============================================
function initApp() {
  const diagnosisDateInput = document.getElementById('diagnosis-date');
  if (diagnosisDateInput) {
    diagnosisDateInput.max = new Date().toISOString().split('T')[0];
  }

  // Initialize diagnosis typeahead autocomplete
  initDiagnosisAutocomplete();

  // Weight management fields visibility based on diagnosis selection
  // (Also handles the initial state)
  handleDiagnosisChange();

  // Budget-based pantry ingredients toggle
  const budgetSelect = document.getElementById('grocery-budget');
  const pantryGroup = document.getElementById('pantry-ingredients-group');
  if (budgetSelect && pantryGroup) {
    budgetSelect.addEventListener('change', function() {
      // Show pantry ingredients for budget-conscious users
      pantryGroup.style.display = this.value === 'low' ? 'block' : 'none';
    });
  }

  // Check if user is logged in with existing data
  if (AccountSystem.isLoggedIn()) {
    const email = AccountSystem.getCurrentUser();
    const accounts = AccountSystem.getAccounts();
    const account = accounts[email];

    if (account && account.appState && account.appState.hasCompletedIntake) {
      // Load saved state
      Object.assign(AppState, account.appState);

      // Show navigation
      const nav = document.getElementById('main-nav');
      const footer = document.getElementById('main-footer');
      const chatbot = document.getElementById('chatbot-container');
      const mobileNav = document.getElementById('mobile-bottom-nav');

      if (nav) nav.style.display = 'block';
      if (footer) footer.style.display = 'block';
      // Only show mobile bottom nav in native app, not on website version
      if (mobileNav) {
        mobileNav.style.display = isNativeApp() ? 'flex' : 'none';
      }
      if (chatbot && (AppState.userTier === 'family' || AppState.userTier === 'enterprise' || AppState.userTier === 'premium')) {
        chatbot.style.display = 'block';
      }

      // Go directly to dashboard
      navigateTo('home');
    }
  }

  updateIntakeStepUI();
  ChatbotSystem.renderMessages();

  console.log('Caribou App initialized');
  console.log('"Because we Caribou-t you"');
  console.log('IMPORTANT: This application provides supportive care guidance and does not replace medical advice.');
}

document.addEventListener('keydown', function(e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('checklist-checkbox')) {
    e.preventDefault();
    if (e.target.closest('#pt-checklist')) {
      togglePTTask(e.target);
    } else if (e.target.closest('#medication-checklist')) {
      toggleMedTask(e.target);
    } else {
      toggleTask(e.target);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ============================================
// Onboarding Tutorial System
// ============================================
const TutorialSystem = {
  currentStep: 0,
  currentPage: 'home', // Track which page we're on
  steps: {
    home: [
      {
        title: "Welcome to Caribou!",
        message: "I'm Cura, your Caribou Care Guide. Let me show you around your personalized care plan. This tour will help you understand how to get the most out of your health journey.",
        target: null,
        position: 'center'
      },
      {
        title: "Your Condition at a Glance",
        message: "This banner shows your current health focus. Click 'View Details' to learn more about your condition and see detailed care recommendations.",
        target: '#condition-highlight-banner',
        position: 'bottom'
      },
      {
        title: "Track Your Progress",
        message: "This progress ring shows how much of today's care plan you've completed. Complete tasks to watch it fill up and build your streak!",
        target: '.progress-tracker-container',
        position: 'bottom'
      },
      {
        title: "Today's Care Plan",
        message: "Your daily tasks are organized into categories - Fitness, Medications, Nutrition, and Wellness. Check off items as you complete them.",
        target: '.task-categories',
        position: 'top'
      },
      {
        title: "Navigate Your Care",
        message: "Use the navigation menu to explore Nutrition, Medication, Fitness, and more. Each section is tailored to your specific needs.",
        target: '.nav-menu',
        position: 'right'
      },
      {
        title: "Meet Cura, Your Care Guide",
        message: "Need help? Click this button to chat with me! I can answer questions about your care plan, update your preferences, or just provide encouragement.",
        target: '#chatbot-toggle',
        position: 'left'
      },
      {
        title: "You're All Set!",
        message: "That's the basics! Remember, Caribou supports your clinician's recommendations - always follow their guidance. Ready to start your health journey?",
        target: null,
        position: 'center'
      }
    ],
    nutrition: [
      {
        title: "Nutrition Dashboard",
        message: "Welcome to your personalized nutrition plan! Here you'll find meal suggestions tailored to your condition and dietary preferences.",
        target: null,
        position: 'center'
      },
      {
        title: "Weekly Meal Plan",
        message: "View your meal recommendations for the entire week. Each meal is designed to support your health goals and can be swapped if needed.",
        target: '.weekly-meal-plan',
        position: 'bottom'
      },
      {
        title: "Grocery List",
        message: "Access your auto-generated grocery list based on your meal plan. Export it as PDF or share it directly from your phone.",
        target: '#grocery-list-card',
        position: 'top'
      },
      {
        title: "Calorie & Macro Tracking",
        message: "Toggle calorie display to see nutritional information. Your targets are calculated based on your profile and health goals.",
        target: '#calorie-toggle',
        position: 'bottom'
      }
    ],
    medication: [
      {
        title: "Medication Management",
        message: "Track all your medications in one place. Set reminders and log when you've taken them to stay on schedule.",
        target: null,
        position: 'center'
      },
      {
        title: "Your Medications",
        message: "View your complete medication list with dosages and schedules. Tap any medication for detailed information and instructions.",
        target: '#medications-list',
        position: 'bottom'
      },
      {
        title: "Add Medications",
        message: "Use the 'Add Medication' button or chat with Cura to add new medications to your list with proper dosage and timing.",
        target: '#add-medication-btn',
        position: 'top'
      }
    ],
    pt: [
      {
        title: "Your Fitness Plan",
        message: "This section contains exercises specifically designed for your condition. Each exercise includes video demonstrations and detailed instructions.",
        target: null,
        position: 'center'
      },
      {
        title: "Exercise Library",
        message: "Browse all recommended exercises. Tap any exercise to watch a video tutorial and learn proper form.",
        target: '.exercise-grid',
        position: 'bottom'
      },
      {
        title: "Track Your Workouts",
        message: "Mark exercises as complete to track your progress. Consistency is key to recovery!",
        target: '.exercise-card',
        position: 'top'
      }
    ],
    condition: [
      {
        title: "Understanding Your Condition",
        message: "Learn everything about your health condition including causes, symptoms, and evidence-based treatment approaches.",
        target: null,
        position: 'center'
      },
      {
        title: "Condition Details",
        message: "Get reliable, medically-reviewed information about your condition. This helps you understand what you're managing and why certain treatments are recommended.",
        target: '.condition-content',
        position: 'bottom'
      }
    ],
    progress: [
      {
        title: "Your Progress Dashboard",
        message: "Track your health journey over time. See your activity trends, achievements, and recovery milestones.",
        target: null,
        position: 'center'
      },
      {
        title: "Activity Overview",
        message: "This chart shows your daily activity across all categories. Identify patterns and celebrate your consistency!",
        target: '#activity-chart',
        position: 'bottom'
      },
      {
        title: "Achievements",
        message: "Earn badges as you progress through your health journey. Each achievement represents a milestone in your recovery!",
        target: '#achievements-grid',
        position: 'top'
      }
    ],
    profile: [
      {
        title: "Your Profile",
        message: "Manage your account settings, connect health devices, and customize your Caribou experience.",
        target: null,
        position: 'center'
      },
      {
        title: "Health Integrations",
        message: "Connect your wearable devices or health apps to automatically sync your health data for more personalized recommendations.",
        target: '.health-accounts-list',
        position: 'bottom'
      },
      {
        title: "Account Settings",
        message: "Update your profile, notification preferences, and subscription settings here.",
        target: '.profile-card',
        position: 'top'
      }
    ]
  },

  // Get current page's steps
  getCurrentSteps() {
    return this.steps[this.currentPage] || this.steps.home;
  },

  start(page = 'home') {
    // Set current page for tutorial context
    this.currentPage = page;
    this.currentStep = 0;
    // Scroll to top of page to ensure tutorial is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay to allow scroll to complete before showing
    setTimeout(() => this.show(), 100);
  },

  // Start tutorial for a specific page (can be called when user navigates)
  startForPage(page) {
    // Check if user has already seen this page's tutorial
    const tutorialKey = `caribou_tutorial_${page}_completed`;
    if (localStorage.getItem(tutorialKey)) {
      return false;
    }

    // Check if this page has tutorial steps
    if (!this.steps[page]) {
      return false;
    }

    this.currentPage = page;
    this.currentStep = 0;
    this.show();
    return true;
  },

  show() {
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;

    overlay.style.display = 'block';
    this.updateStep();
  },

  hide() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }

    // Remove any highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  },

  updateStep() {
    const steps = this.getCurrentSteps();
    const step = steps[this.currentStep];
    if (!step) return;

    // Update text
    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-message').textContent = step.message;
    document.getElementById('tutorial-step-current').textContent = this.currentStep + 1;
    document.getElementById('tutorial-step-total').textContent = steps.length;

    // Update button text
    const nextBtn = document.getElementById('tutorial-next-btn');
    if (this.currentStep === steps.length - 1) {
      nextBtn.textContent = "Get Started";
    } else {
      nextBtn.textContent = "Next";
    }

    // Position the bubble
    this.positionBubble(step);

    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Add highlight to target if exists
    if (step.target) {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        targetEl.classList.add('tutorial-highlight');
        // Scroll target into view if needed
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  },

  positionBubble(step) {
    const bubble = document.getElementById('tutorial-bubble');
    const arrow = document.getElementById('tutorial-arrow');
    const spotlight = document.getElementById('tutorial-spotlight');

    if (!bubble || !arrow) return;

    // Reset arrow classes
    arrow.className = 'tutorial-arrow';

    if (!step.target || step.position === 'center') {
      // Center the bubble on screen using fixed pixel values for reliability
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const bubbleWidth = 360;
      const bubbleHeight = 200;
      bubble.style.top = Math.max(100, (viewportHeight - bubbleHeight) / 2) + 'px';
      bubble.style.left = ((viewportWidth - bubbleWidth) / 2) + 'px';
      bubble.style.transform = '';
      arrow.style.display = 'none';
      spotlight.style.display = 'none';
      return;
    }

    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      // Fallback to center using fixed pixel values
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const bubbleWidth = 360;
      const bubbleHeight = 200;
      bubble.style.top = Math.max(100, (viewportHeight - bubbleHeight) / 2) + 'px';
      bubble.style.left = ((viewportWidth - bubbleWidth) / 2) + 'px';
      bubble.style.transform = '';
      arrow.style.display = 'none';
      spotlight.style.display = 'none';
      return;
    }

    arrow.style.display = 'block';
    spotlight.style.display = 'block';

    const rect = targetEl.getBoundingClientRect();
    const bubbleWidth = 360;
    const bubbleHeight = 200;
    const padding = 16;
    const arrowOffset = 20;

    // Position spotlight
    spotlight.style.top = (rect.top - 8) + 'px';
    spotlight.style.left = (rect.left - 8) + 'px';
    spotlight.style.width = (rect.width + 16) + 'px';
    spotlight.style.height = (rect.height + 16) + 'px';

    // Reset transform
    bubble.style.transform = '';

    // Calculate positions with bounds checking to keep bubble in viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    switch (step.position) {
      case 'bottom':
        let bottomTop = rect.bottom + arrowOffset;
        // If bubble would go off-screen bottom, position it above instead
        if (bottomTop + bubbleHeight > viewportHeight - padding) {
          bottomTop = Math.max(padding, rect.top - bubbleHeight - arrowOffset);
          arrow.classList.add('bottom');
        } else {
          arrow.classList.add('top');
        }
        bubble.style.top = Math.max(padding, bottomTop) + 'px';
        bubble.style.left = Math.max(padding, Math.min(rect.left + rect.width/2 - bubbleWidth/2, viewportWidth - bubbleWidth - padding)) + 'px';
        break;
      case 'top':
        let topTop = rect.top - bubbleHeight - arrowOffset;
        // If bubble would go off-screen top, position it below instead
        if (topTop < padding) {
          topTop = rect.bottom + arrowOffset;
          arrow.classList.add('top');
        } else {
          arrow.classList.add('bottom');
        }
        // Ensure it doesn't go off-screen bottom either
        bubble.style.top = Math.min(Math.max(padding, topTop), viewportHeight - bubbleHeight - padding) + 'px';
        bubble.style.left = Math.max(padding, Math.min(rect.left + rect.width/2 - bubbleWidth/2, viewportWidth - bubbleWidth - padding)) + 'px';
        break;
      case 'left':
        let leftLeft = rect.left - bubbleWidth - arrowOffset;
        // If bubble would go off-screen left, position it to the right instead
        if (leftLeft < padding) {
          leftLeft = rect.right + arrowOffset;
          arrow.classList.add('left');
        } else {
          arrow.classList.add('right');
        }
        bubble.style.top = Math.min(Math.max(padding, rect.top + rect.height/2 - bubbleHeight/2), viewportHeight - bubbleHeight - padding) + 'px';
        bubble.style.left = Math.max(padding, Math.min(leftLeft, viewportWidth - bubbleWidth - padding)) + 'px';
        break;
      case 'right':
        let rightLeft = rect.right + arrowOffset;
        // If bubble would go off-screen right, position it to the left instead
        if (rightLeft + bubbleWidth > viewportWidth - padding) {
          rightLeft = Math.max(padding, rect.left - bubbleWidth - arrowOffset);
          arrow.classList.add('right');
        } else {
          arrow.classList.add('left');
        }
        bubble.style.top = Math.min(Math.max(padding, rect.top + rect.height/2 - bubbleHeight/2), viewportHeight - bubbleHeight - padding) + 'px';
        bubble.style.left = rightLeft + 'px';
        break;
    }
  },

  next() {
    const steps = this.getCurrentSteps();
    this.currentStep++;
    if (this.currentStep >= steps.length) {
      this.complete();
    } else {
      this.updateStep();
    }
  },

  complete() {
    this.hide();
    // Store completion for the current page's tutorial
    localStorage.setItem(`caribou_tutorial_${this.currentPage}_completed`, 'true');
    // Also store general completion for backward compatibility
    if (this.currentPage === 'home') {
      localStorage.setItem('caribou_tutorial_completed', 'true');
    }
  },

  skip() {
    this.complete();
  },

  reset() {
    // Reset all page tutorials
    Object.keys(this.steps).forEach(page => {
      localStorage.removeItem(`caribou_tutorial_${page}_completed`);
    });
    localStorage.removeItem('caribou_tutorial_completed');
    this.currentStep = 0;
    this.currentPage = 'home';
  },

  // Check if a specific page tutorial has been completed
  hasSeenPageTutorial(page) {
    return localStorage.getItem(`caribou_tutorial_${page}_completed`) === 'true';
  }
};

// Tutorial control functions
function nextTutorialStep() {
  TutorialSystem.next();
}

function skipTutorial() {
  TutorialSystem.skip();
}

function startTutorial(page = 'home') {
  TutorialSystem.reset();
  TutorialSystem.start(page);
}

// Start page-specific tutorial
function startPageTutorial(page) {
  return TutorialSystem.startForPage(page);
}

// Start tutorial after user completes intake and sees dashboard for first time
function checkAndStartTutorial() {
  // Only show tutorial on dashboard page for new users
  if (AppState.currentPage === 'home' && !localStorage.getItem('caribou_tutorial_completed')) {
    // Small delay to let the page render
    setTimeout(() => {
      TutorialSystem.start('home');
    }, 1000);
  }
}

// Check if tutorial should be shown for the current page (for first-time visits)
function checkPageTutorial(page) {
  // Map page names to tutorial keys
  const pageMap = {
    'home': 'home',
    'nutrition': 'nutrition',
    'medication': 'medication',
    'pt': 'pt',
    'condition': 'condition',
    'progress': 'progress',
    'profile': 'profile'
  };

  const tutorialPage = pageMap[page];
  if (!tutorialPage || TutorialSystem.hasSeenPageTutorial(tutorialPage)) {
    return;
  }

  // Only auto-start tutorials for pages other than home (home is already handled by checkAndStartTutorial)
  // For other pages, show a small tooltip/banner offering to start the tutorial
  if (page !== 'home' && TutorialSystem.steps[tutorialPage]) {
    showPageTutorialPrompt(tutorialPage);
  }
}

// Show a subtle prompt to start the page tutorial
function showPageTutorialPrompt(page) {
  // Check if prompt already exists
  if (document.getElementById('tutorial-page-prompt')) return;

  const pageNames = {
    'nutrition': 'Nutrition',
    'medication': 'Medication',
    'pt': 'Fitness',
    'condition': 'My Condition',
    'progress': 'Progress',
    'profile': 'Profile'
  };

  const prompt = document.createElement('div');
  prompt.id = 'tutorial-page-prompt';
  prompt.className = 'tutorial-page-prompt';
  prompt.innerHTML = `
    <div class="tutorial-prompt-content">
      <span>New here? Take a quick tour of ${pageNames[page] || 'this page'}.</span>
      <div class="tutorial-prompt-buttons">
        <button class="btn btn-sm btn-primary" onclick="startPageTutorialFromPrompt('${page}')">Show me</button>
        <button class="btn btn-sm btn-outline" onclick="dismissPageTutorialPrompt('${page}')">Skip</button>
      </div>
    </div>
  `;

  document.body.appendChild(prompt);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    const el = document.getElementById('tutorial-page-prompt');
    if (el) el.remove();
  }, 10000);
}

function startPageTutorialFromPrompt(page) {
  const prompt = document.getElementById('tutorial-page-prompt');
  if (prompt) prompt.remove();
  TutorialSystem.startForPage(page);
}

function dismissPageTutorialPrompt(page) {
  const prompt = document.getElementById('tutorial-page-prompt');
  if (prompt) prompt.remove();
  // Mark as seen so we don't show again
  localStorage.setItem(`caribou_tutorial_${page}_completed`, 'true');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    ClinicalDatabase,
    MealDatabase,
    ChatbotSystem,
    navigateTo,
    toggleTask,
    calculateDailyCalories,
    validateMedications
  };
}

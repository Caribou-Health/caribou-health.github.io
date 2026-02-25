/**
 * Caribou Health - Internationalization (i18n) System
 * Supports: English (en) and Canadian French (fr-CA)
 * 
 * Usage:
 *   window.t('key') - get translated string
 *   CaribouI18n.setLanguage('fr') - switch language
 *   CaribouI18n.applyTranslations() - apply to DOM
 */

const CaribouI18n = {
  language: localStorage.getItem('caribou_language') || 'en',
  
  translations: {
    en: {
      // ===== NAVIGATION =====
      nav_dashboard: 'Dashboard',
      nav_nutrition: 'Nutrition',
      nav_medication: 'Medication',
      nav_fitness: 'Fitness',
      nav_condition: 'My Condition',
      nav_profile: 'Profile',
      nav_plans: 'Plans',
      nav_about: 'About',
      nav_toggle_lang: 'Français',
      
      // ===== WELCOME PAGE =====
      welcome_title: 'Welcome to Caribou',
      welcome_slogan: '"Because we Caribou-t you"',
      welcome_subtitle: 'Your personalized care companion for better health outcomes.',
      welcome_description: 'Caribou transforms your diagnosis into an actionable, daily care plan - bridging the gap between clinical consultations and your everyday health management.',
      welcome_create_account: 'Create Account',
      welcome_sign_in: 'Sign In',
      welcome_disclaimer: 'This platform supports your clinician\'s recommendations and does not provide medical advice.',
      
      // ===== FEATURES =====
      feature_plans_title: 'Personalized Plans',
      feature_plans_desc: 'Care plans tailored to your diagnosis and lifestyle',
      feature_daily_title: 'Daily Guidance',
      feature_daily_desc: 'Nutrition, medication, and exercise reminders',
      feature_ai_title: 'Cura AI Support',
      feature_ai_desc: 'Get answers and update your plan anytime',
      
      // ===== AUTH MODAL =====
      auth_create_title: 'Create Account',
      auth_create_subtitle: 'Join Caribou to start your personalized care journey',
      auth_signin_title: 'Welcome Back',
      auth_signin_subtitle: 'Sign in to your Caribou account',
      auth_email: 'Email Address',
      auth_email_placeholder: 'you@example.com',
      auth_password: 'Password',
      auth_password_placeholder: 'Create a password',
      auth_password_hint: 'At least 6 characters',
      auth_confirm_password: 'Confirm Password',
      auth_confirm_placeholder: 'Confirm your password',
      auth_terms: 'I agree to the',
      auth_terms_link: 'Terms of Service',
      auth_and: 'and',
      auth_privacy_link: 'Privacy Policy',
      auth_terms_note: 'I understand that Caribou provides holistic wellness plans to complement, not replace, professional medical care.',
      auth_create_btn: 'Create Account & Continue',
      auth_already_have: 'Already have an account?',
      auth_sign_in_link: 'Sign In',
      auth_no_account: 'Don\'t have an account?',
      auth_create_link: 'Create Account',
      auth_forgot_password: 'Forgot your password?',
      auth_google: 'Continue with Google',
      auth_google_note: 'Sign in securely with your Google account',
      auth_or: 'or',
      
      // ===== INTAKE FORM =====
      intake_title: 'Let\'s Build Your Care Plan',
      intake_subtitle: 'Tell us about yourself so we can create your personalized care plan.',
      intake_step_diagnosis: 'Diagnosis',
      intake_step_health: 'Health',
      intake_step_exercise: 'Exercise',
      intake_step_nutrition: 'Nutrition',
      intake_step_medical: 'Medical',
      
      // Step 1
      intake_your_diagnosis: 'Your Diagnosis',
      intake_name_label: 'What should we call you?',
      intake_name_placeholder: 'e.g., Cal',
      intake_name_hint: 'We\'ll use this to personalize your care plan.',
      intake_diagnosis_label: 'What is your diagnosis or health goal?',
      intake_diagnosis_placeholder: 'Start typing... e.g., back pain, weight loss, diabetes',
      intake_diagnosis_hint: 'Type to search conditions, or enter your own if not listed.',
      intake_date_label: 'Date of diagnosis',
      intake_secondary_label: 'Secondary diagnoses & other conditions',
      intake_secondary_placeholder: 'Enter any additional health conditions, separated by commas',
      intake_metrics_title: 'Your Body Metrics',
      intake_metrics_desc: 'This information helps us calculate your daily calorie needs and personalize your nutrition plan.',
      intake_age: 'Age',
      intake_sex: 'Biological sex',
      intake_sex_select: 'Select',
      intake_sex_male: 'Male',
      intake_sex_female: 'Female',
      intake_units: 'Preferred units',
      intake_units_metric: 'Metric (kg, cm)',
      intake_units_imperial: 'Imperial (lbs, ft)',
      intake_height: 'Height',
      intake_weight: 'Weight',
      intake_activity: 'Activity Level',
      intake_activity_sedentary: 'Sedentary (little/no exercise)',
      intake_activity_light: 'Lightly active (1-3 days/week)',
      intake_activity_moderate: 'Moderately active (3-5 days/week)',
      intake_activity_very: 'Very active (6-7 days/week)',
      intake_activity_extra: 'Extra active (physical job + exercise)',
      
      // Step 2 - Health
      intake_health_title: 'Your Health & Lifestyle',
      intake_sleep_quality: 'Sleep Quality',
      intake_sleep_excellent: 'Excellent',
      intake_sleep_good: 'Good',
      intake_sleep_fair: 'Fair',
      intake_sleep_poor: 'Poor',
      intake_avg_sleep: 'Average sleep duration',
      intake_stress: 'Stress level',
      intake_stress_low: 'Low',
      intake_stress_moderate: 'Moderate',
      intake_stress_high: 'High',
      
      // Step 3 - Exercise
      intake_exercise_title: 'Your Exercise Preferences',
      intake_workout_schedule: 'Do you have a workout schedule?',
      intake_yes: 'Yes',
      intake_no: 'No',
      intake_frequency: 'Exercise frequency',
      intake_duration: 'Exercise duration',
      intake_location: 'Workout location',
      intake_location_home: 'Home',
      intake_location_gym: 'Gym',
      intake_location_outdoor: 'Outdoor',
      intake_intensity: 'Preferred intensity',
      intake_intensity_low: 'Low',
      intake_intensity_moderate: 'Moderate',
      intake_intensity_high: 'High',
      intake_mobility: 'Mobility limitations',
      intake_mobility_none: 'None',
      
      // Step 4 - Nutrition
      intake_nutrition_title: 'Your Nutrition',
      intake_dietary_restrictions: 'Dietary restrictions',
      intake_meal_times: 'Meal times',
      intake_breakfast_time: 'Breakfast time',
      intake_lunch_time: 'Lunch time',
      intake_dinner_time: 'Dinner time',
      
      // Step 5 - Medical
      intake_medical_title: 'Medical Information',
      intake_medications: 'Current medications',
      intake_doctor_name: 'Doctor/Clinician name',
      intake_doctor_phone: 'Clinician phone',
      intake_pharmacy: 'Pharmacy name',
      intake_pharmacy_phone: 'Pharmacy phone',
      intake_doctor_goals: 'Doctor\'s goals & recommendations',
      
      // Buttons
      btn_next: 'Next',
      btn_back: 'Back',
      btn_submit: 'Create My Care Plan',
      btn_save: 'Save',
      btn_cancel: 'Cancel',
      btn_close: 'Close',
      btn_continue: 'Continue',
      btn_skip: 'Skip for now',
      
      // ===== DASHBOARD =====
      dashboard_welcome: 'Welcome back',
      dashboard_care_overview: 'Your Care Overview',
      dashboard_today_tasks: 'Today\'s Tasks',
      dashboard_week_ahead: 'Week Ahead',
      dashboard_check_in: 'Daily Check-In',
      dashboard_checkin_pain: 'Pain level today',
      dashboard_checkin_sleep: 'Sleep quality',
      dashboard_checkin_mood: 'Mood',
      dashboard_complete: 'Complete',
      dashboard_pending: 'Pending',
      dashboard_streak: 'Day streak',
      dashboard_hydration: 'Hydration',
      dashboard_glasses: 'glasses of water',
      
      // ===== REMINDERS =====
      reminders_title: 'Set Reminders',
      reminders_subtitle: 'Stay on track with your care plan',
      reminders_push: 'Push Notifications',
      reminders_push_desc: 'Get notified directly on your device',
      reminders_calendar: 'Add to Calendar',
      reminders_calendar_desc: 'Sync with Apple or Google Calendar',
      reminders_email: 'Email Reminders',
      reminders_email_desc: 'Receive reminders in your inbox',
      reminders_medication: 'Medication Reminders',
      reminders_pt: 'Physical Therapy',
      reminders_meals: 'Meal Reminders',
      reminders_grocery: 'Grocery Reminder',
      reminders_grocery_cadence: 'How often should we remind you?',
      reminders_weekly: 'Weekly',
      reminders_biweekly: 'Every 2 weeks',
      reminders_monthly: 'Monthly',
      reminders_time: 'Reminder time',
      reminders_save: 'Save Reminders',
      reminders_permission_needed: 'Please allow notifications to receive reminders',
      reminders_enabled: 'Reminders enabled!',
      reminders_calendar_download: 'Download Calendar File',
      
      // ===== NUTRITION PAGE =====
      nutrition_title: 'Nutrition Plan',
      nutrition_today: 'Today\'s Meals',
      nutrition_breakfast: 'Breakfast',
      nutrition_lunch: 'Lunch',
      nutrition_dinner: 'Dinner',
      nutrition_snacks: 'Snacks',
      nutrition_calories: 'Calories',
      nutrition_protein: 'Protein',
      nutrition_carbs: 'Carbs',
      nutrition_fat: 'Fat',
      nutrition_water: 'Water intake',
      nutrition_grocery_list: 'Grocery List',
      nutrition_week_plan: 'Weekly Meal Plan',
      
      // ===== MEDICATION PAGE =====
      medication_title: 'Medications',
      medication_schedule: 'Today\'s Schedule',
      medication_taken: 'Taken',
      medication_not_taken: 'Not taken',
      medication_add: 'Add Medication',
      medication_name: 'Medication name',
      medication_dose: 'Dosage',
      medication_frequency: 'Frequency',
      medication_time: 'Time',
      medication_notes: 'Notes',
      
      // ===== FITNESS/PT PAGE =====
      pt_title: 'Physical Therapy',
      pt_exercises: 'Your Exercises',
      pt_sets: 'sets',
      pt_reps: 'reps',
      pt_seconds: 'seconds',
      pt_duration: 'Duration',
      pt_instructions: 'Instructions',
      pt_pain_before: 'Pain level before',
      pt_pain_after: 'Pain level after',
      pt_complete_all: 'Complete All Exercises',
      pt_completed: 'Session Complete!',
      pt_great_job: 'Great job on today\'s exercises!',
      
      // ===== CONDITION PAGE =====
      condition_title: 'My Condition',
      condition_about: 'About Your Condition',
      condition_symptoms: 'Common Symptoms',
      condition_treatment: 'Treatment Approach',
      condition_prognosis: 'Recovery Outlook',
      condition_resources: 'Resources',
      
      // ===== PROFILE PAGE =====
      profile_title: 'My Profile',
      profile_personal: 'Personal Information',
      profile_health: 'Health Information',
      profile_subscription: 'Subscription',
      profile_notifications: 'Notifications',
      profile_language: 'Language',
      profile_logout: 'Sign Out',
      profile_edit: 'Edit Profile',
      profile_save_changes: 'Save Changes',
      
      // ===== TIERS/PLANS =====
      plans_title: 'Choose Your Plan',
      plans_free: 'Free',
      plans_premium: 'Premium',
      plans_family: 'Family',
      plans_per_month: '/month',
      plans_per_year: '/year',
      plans_get_started: 'Get Started',
      plans_current: 'Current Plan',
      plans_upgrade: 'Upgrade',
      plans_most_popular: 'Most Popular',
      
      // ===== FAMILY =====
      family_add: 'Add Family Member',
      family_edit: 'Edit Member',
      family_name: 'Name',
      family_relationship: 'Relationship',
      family_age: 'Age',
      family_condition: 'Primary Condition',
      family_notes: 'Additional Notes',
      family_save: 'Save Family Member',
      family_parent: 'Parent',
      family_spouse: 'Spouse/Partner',
      family_child: 'Child',
      family_sibling: 'Sibling',
      family_grandparent: 'Grandparent',
      family_other: 'Other Family Member',
      
      // ===== DOCUMENTS =====
      doc_upload: 'Upload Document',
      doc_add: 'Add a document to your health records',
      doc_name: 'Document Name',
      doc_name_placeholder: 'e.g., MRI Results, PT Instructions',
      doc_type: 'Document Type',
      doc_medical_record: 'Medical Record',
      doc_pt_instructions: 'PT Instructions',
      doc_imaging: 'Imaging (X-ray, MRI, etc.)',
      doc_lab: 'Lab Results',
      doc_prescription: 'Prescription',
      doc_insurance: 'Insurance Document',
      doc_other: 'Other',
      doc_file: 'File',
      doc_click_upload: 'Click to select a file',
      doc_formats: 'PDF, images, or documents',
      doc_upload_btn: 'Upload Document',
      
      // ===== CURA CHATBOT =====
      cura_title: 'Cura',
      cura_subtitle: 'Your AI Care Assistant',
      cura_placeholder: 'Ask Cura anything about your care plan...',
      cura_send: 'Send',
      cura_disclaimer: 'Cura provides guidance based on your care plan. Always consult your healthcare provider for medical decisions.',
      
      // ===== COMMON =====
      optional: 'optional',
      required: 'required',
      loading: 'Loading...',
      error_generic: 'Something went wrong. Please try again.',
      success_saved: 'Saved successfully!',
      confirm_delete: 'Are you sure you want to delete this?',
      today: 'Today',
      yesterday: 'Yesterday',
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    },
    
    fr: {
      // ===== NAVIGATION =====
      nav_dashboard: 'Tableau de bord',
      nav_nutrition: 'Nutrition',
      nav_medication: 'Médicaments',
      nav_fitness: 'Conditionnement',
      nav_condition: 'Ma condition',
      nav_profile: 'Profil',
      nav_plans: 'Forfaits',
      nav_about: 'À propos',
      nav_toggle_lang: 'English',
      
      // ===== WELCOME PAGE =====
      welcome_title: 'Bienvenue chez Caribou',
      welcome_slogan: '"Parce que vous nous tenez à cœur"',
      welcome_subtitle: 'Votre compagnon de soins personnalisé pour de meilleurs résultats de santé.',
      welcome_description: 'Caribou transforme votre diagnostic en un plan de soins quotidien et concret — comblant le fossé entre les consultations cliniques et votre gestion de la santé au quotidien.',
      welcome_create_account: 'Créer un compte',
      welcome_sign_in: 'Se connecter',
      welcome_disclaimer: 'Cette plateforme appuie les recommandations de votre clinicien et ne fournit pas de conseils médicaux.',
      
      // ===== FEATURES =====
      feature_plans_title: 'Plans personnalisés',
      feature_plans_desc: 'Des plans de soins adaptés à votre diagnostic et à votre mode de vie',
      feature_daily_title: 'Guidance quotidienne',
      feature_daily_desc: 'Rappels de nutrition, de médicaments et d\'exercices',
      feature_ai_title: 'Soutien IA Cura',
      feature_ai_desc: 'Obtenez des réponses et mettez à jour votre plan en tout temps',
      
      // ===== AUTH MODAL =====
      auth_create_title: 'Créer un compte',
      auth_create_subtitle: 'Rejoignez Caribou pour commencer votre parcours de soins personnalisé',
      auth_signin_title: 'Bon retour',
      auth_signin_subtitle: 'Connectez-vous à votre compte Caribou',
      auth_email: 'Adresse courriel',
      auth_email_placeholder: 'vous@exemple.com',
      auth_password: 'Mot de passe',
      auth_password_placeholder: 'Créer un mot de passe',
      auth_password_hint: 'Au moins 6 caractères',
      auth_confirm_password: 'Confirmer le mot de passe',
      auth_confirm_placeholder: 'Confirmez votre mot de passe',
      auth_terms: 'J\'accepte les',
      auth_terms_link: 'Conditions d\'utilisation',
      auth_and: 'et la',
      auth_privacy_link: 'Politique de confidentialité',
      auth_terms_note: 'Je comprends que Caribou fournit des plans de bien-être holistiques pour compléter, et non remplacer, les soins médicaux professionnels.',
      auth_create_btn: 'Créer un compte et continuer',
      auth_already_have: 'Vous avez déjà un compte?',
      auth_sign_in_link: 'Se connecter',
      auth_no_account: 'Vous n\'avez pas de compte?',
      auth_create_link: 'Créer un compte',
      auth_forgot_password: 'Mot de passe oublié?',
      auth_google: 'Continuer avec Google',
      auth_google_note: 'Connectez-vous de façon sécurisée avec votre compte Google',
      auth_or: 'ou',
      
      // ===== INTAKE FORM =====
      intake_title: 'Créons votre plan de soins',
      intake_subtitle: 'Parlez-nous de vous afin que nous puissions créer votre plan de soins personnalisé.',
      intake_step_diagnosis: 'Diagnostic',
      intake_step_health: 'Santé',
      intake_step_exercise: 'Exercice',
      intake_step_nutrition: 'Nutrition',
      intake_step_medical: 'Médical',
      
      // Step 1
      intake_your_diagnosis: 'Votre diagnostic',
      intake_name_label: 'Comment devrions-nous vous appeler?',
      intake_name_placeholder: 'p. ex., Cal',
      intake_name_hint: 'Nous utiliserons ceci pour personnaliser votre plan de soins.',
      intake_diagnosis_label: 'Quel est votre diagnostic ou objectif de santé?',
      intake_diagnosis_placeholder: 'Commencez à taper... p. ex., douleur au dos, perte de poids, diabète',
      intake_diagnosis_hint: 'Tapez pour rechercher des conditions, ou entrez la vôtre si elle n\'est pas répertoriée.',
      intake_date_label: 'Date du diagnostic',
      intake_secondary_label: 'Diagnostics secondaires et autres conditions',
      intake_secondary_placeholder: 'Entrez les conditions de santé supplémentaires, séparées par des virgules',
      intake_metrics_title: 'Vos mesures corporelles',
      intake_metrics_desc: 'Ces informations nous aident à calculer vos besoins caloriques quotidiens et à personnaliser votre plan nutritionnel.',
      intake_age: 'Âge',
      intake_sex: 'Sexe biologique',
      intake_sex_select: 'Sélectionner',
      intake_sex_male: 'Masculin',
      intake_sex_female: 'Féminin',
      intake_units: 'Unités préférées',
      intake_units_metric: 'Métrique (kg, cm)',
      intake_units_imperial: 'Impérial (lbs, pi)',
      intake_height: 'Taille',
      intake_weight: 'Poids',
      intake_activity: 'Niveau d\'activité',
      intake_activity_sedentary: 'Sédentaire (peu/pas d\'exercice)',
      intake_activity_light: 'Légèrement actif (1-3 jours/semaine)',
      intake_activity_moderate: 'Modérément actif (3-5 jours/semaine)',
      intake_activity_very: 'Très actif (6-7 jours/semaine)',
      intake_activity_extra: 'Extrêmement actif (travail physique + exercice)',
      
      // Step 2 - Health
      intake_health_title: 'Votre santé et mode de vie',
      intake_sleep_quality: 'Qualité du sommeil',
      intake_sleep_excellent: 'Excellente',
      intake_sleep_good: 'Bonne',
      intake_sleep_fair: 'Passable',
      intake_sleep_poor: 'Mauvaise',
      intake_avg_sleep: 'Durée moyenne de sommeil',
      intake_stress: 'Niveau de stress',
      intake_stress_low: 'Faible',
      intake_stress_moderate: 'Modéré',
      intake_stress_high: 'Élevé',
      
      // Step 3 - Exercise
      intake_exercise_title: 'Vos préférences d\'exercice',
      intake_workout_schedule: 'Avez-vous un horaire d\'entraînement?',
      intake_yes: 'Oui',
      intake_no: 'Non',
      intake_frequency: 'Fréquence d\'exercice',
      intake_duration: 'Durée d\'exercice',
      intake_location: 'Lieu d\'entraînement',
      intake_location_home: 'À domicile',
      intake_location_gym: 'Gymnase',
      intake_location_outdoor: 'Extérieur',
      intake_intensity: 'Intensité préférée',
      intake_intensity_low: 'Faible',
      intake_intensity_moderate: 'Modérée',
      intake_intensity_high: 'Élevée',
      intake_mobility: 'Limitations de mobilité',
      intake_mobility_none: 'Aucune',
      
      // Step 4 - Nutrition
      intake_nutrition_title: 'Votre nutrition',
      intake_dietary_restrictions: 'Restrictions alimentaires',
      intake_meal_times: 'Heures des repas',
      intake_breakfast_time: 'Heure du petit-déjeuner',
      intake_lunch_time: 'Heure du déjeuner',
      intake_dinner_time: 'Heure du souper',
      
      // Step 5 - Medical
      intake_medical_title: 'Informations médicales',
      intake_medications: 'Médicaments actuels',
      intake_doctor_name: 'Nom du médecin/clinicien',
      intake_doctor_phone: 'Téléphone du clinicien',
      intake_pharmacy: 'Nom de la pharmacie',
      intake_pharmacy_phone: 'Téléphone de la pharmacie',
      intake_doctor_goals: 'Objectifs et recommandations du médecin',
      
      // Buttons
      btn_next: 'Suivant',
      btn_back: 'Retour',
      btn_submit: 'Créer mon plan de soins',
      btn_save: 'Sauvegarder',
      btn_cancel: 'Annuler',
      btn_close: 'Fermer',
      btn_continue: 'Continuer',
      btn_skip: 'Passer pour l\'instant',
      
      // ===== DASHBOARD =====
      dashboard_welcome: 'Bon retour',
      dashboard_care_overview: 'Votre aperçu de soins',
      dashboard_today_tasks: 'Tâches d\'aujourd\'hui',
      dashboard_week_ahead: 'La semaine à venir',
      dashboard_check_in: 'Bilan quotidien',
      dashboard_checkin_pain: 'Niveau de douleur aujourd\'hui',
      dashboard_checkin_sleep: 'Qualité du sommeil',
      dashboard_checkin_mood: 'Humeur',
      dashboard_complete: 'Complété',
      dashboard_pending: 'En attente',
      dashboard_streak: 'Jours consécutifs',
      dashboard_hydration: 'Hydratation',
      dashboard_glasses: 'verres d\'eau',
      
      // ===== REMINDERS =====
      reminders_title: 'Configurer les rappels',
      reminders_subtitle: 'Restez sur la bonne voie avec votre plan de soins',
      reminders_push: 'Notifications push',
      reminders_push_desc: 'Recevez des notifications directement sur votre appareil',
      reminders_calendar: 'Ajouter au calendrier',
      reminders_calendar_desc: 'Synchronisez avec Apple Calendrier ou Google Agenda',
      reminders_email: 'Rappels par courriel',
      reminders_email_desc: 'Recevez des rappels dans votre boîte de réception',
      reminders_medication: 'Rappels de médicaments',
      reminders_pt: 'Physiothérapie',
      reminders_meals: 'Rappels de repas',
      reminders_grocery: 'Rappel d\'épicerie',
      reminders_grocery_cadence: 'À quelle fréquence devons-nous vous rappeler?',
      reminders_weekly: 'Chaque semaine',
      reminders_biweekly: 'Toutes les 2 semaines',
      reminders_monthly: 'Chaque mois',
      reminders_time: 'Heure du rappel',
      reminders_save: 'Sauvegarder les rappels',
      reminders_permission_needed: 'Veuillez autoriser les notifications pour recevoir des rappels',
      reminders_enabled: 'Rappels activés!',
      reminders_calendar_download: 'Télécharger le fichier de calendrier',
      
      // ===== NUTRITION PAGE =====
      nutrition_title: 'Plan nutritionnel',
      nutrition_today: 'Repas d\'aujourd\'hui',
      nutrition_breakfast: 'Petit-déjeuner',
      nutrition_lunch: 'Déjeuner',
      nutrition_dinner: 'Souper',
      nutrition_snacks: 'Collations',
      nutrition_calories: 'Calories',
      nutrition_protein: 'Protéines',
      nutrition_carbs: 'Glucides',
      nutrition_fat: 'Lipides',
      nutrition_water: 'Apport en eau',
      nutrition_grocery_list: 'Liste d\'épicerie',
      nutrition_week_plan: 'Plan de repas hebdomadaire',
      
      // ===== MEDICATION PAGE =====
      medication_title: 'Médicaments',
      medication_schedule: 'Horaire d\'aujourd\'hui',
      medication_taken: 'Pris',
      medication_not_taken: 'Non pris',
      medication_add: 'Ajouter un médicament',
      medication_name: 'Nom du médicament',
      medication_dose: 'Dosage',
      medication_frequency: 'Fréquence',
      medication_time: 'Heure',
      medication_notes: 'Notes',
      
      // ===== FITNESS/PT PAGE =====
      pt_title: 'Physiothérapie',
      pt_exercises: 'Vos exercices',
      pt_sets: 'séries',
      pt_reps: 'répétitions',
      pt_seconds: 'secondes',
      pt_duration: 'Durée',
      pt_instructions: 'Instructions',
      pt_pain_before: 'Niveau de douleur avant',
      pt_pain_after: 'Niveau de douleur après',
      pt_complete_all: 'Compléter tous les exercices',
      pt_completed: 'Séance complétée!',
      pt_great_job: 'Excellent travail pour les exercices d\'aujourd\'hui!',
      
      // ===== CONDITION PAGE =====
      condition_title: 'Ma condition',
      condition_about: 'À propos de votre condition',
      condition_symptoms: 'Symptômes courants',
      condition_treatment: 'Approche de traitement',
      condition_prognosis: 'Perspectives de rétablissement',
      condition_resources: 'Ressources',
      
      // ===== PROFILE PAGE =====
      profile_title: 'Mon profil',
      profile_personal: 'Informations personnelles',
      profile_health: 'Informations de santé',
      profile_subscription: 'Abonnement',
      profile_notifications: 'Notifications',
      profile_language: 'Langue',
      profile_logout: 'Se déconnecter',
      profile_edit: 'Modifier le profil',
      profile_save_changes: 'Sauvegarder les modifications',
      
      // ===== TIERS/PLANS =====
      plans_title: 'Choisissez votre forfait',
      plans_free: 'Gratuit',
      plans_premium: 'Premium',
      plans_family: 'Famille',
      plans_per_month: '/mois',
      plans_per_year: '/an',
      plans_get_started: 'Commencer',
      plans_current: 'Forfait actuel',
      plans_upgrade: 'Améliorer',
      plans_most_popular: 'Le plus populaire',
      
      // ===== FAMILY =====
      family_add: 'Ajouter un membre de la famille',
      family_edit: 'Modifier le membre',
      family_name: 'Nom',
      family_relationship: 'Relation',
      family_age: 'Âge',
      family_condition: 'Condition principale',
      family_notes: 'Notes supplémentaires',
      family_save: 'Sauvegarder le membre',
      family_parent: 'Parent',
      family_spouse: 'Conjoint(e)/Partenaire',
      family_child: 'Enfant',
      family_sibling: 'Frère/Sœur',
      family_grandparent: 'Grand-parent',
      family_other: 'Autre membre de la famille',
      
      // ===== DOCUMENTS =====
      doc_upload: 'Téléverser un document',
      doc_add: 'Ajoutez un document à vos dossiers de santé',
      doc_name: 'Nom du document',
      doc_name_placeholder: 'p. ex., Résultats IRM, Instructions de physio',
      doc_type: 'Type de document',
      doc_medical_record: 'Dossier médical',
      doc_pt_instructions: 'Instructions de physiothérapie',
      doc_imaging: 'Imagerie (rayons X, IRM, etc.)',
      doc_lab: 'Résultats de laboratoire',
      doc_prescription: 'Ordonnance',
      doc_insurance: 'Document d\'assurance',
      doc_other: 'Autre',
      doc_file: 'Fichier',
      doc_click_upload: 'Cliquez pour sélectionner un fichier',
      doc_formats: 'PDF, images ou documents',
      doc_upload_btn: 'Téléverser le document',
      
      // ===== CURA CHATBOT =====
      cura_title: 'Cura',
      cura_subtitle: 'Votre assistante de soins IA',
      cura_placeholder: 'Demandez à Cura tout ce qui concerne votre plan de soins...',
      cura_send: 'Envoyer',
      cura_disclaimer: 'Cura fournit des conseils basés sur votre plan de soins. Consultez toujours votre professionnel de la santé pour les décisions médicales.',
      
      // ===== COMMON =====
      optional: 'facultatif',
      required: 'obligatoire',
      loading: 'Chargement...',
      error_generic: 'Une erreur s\'est produite. Veuillez réessayer.',
      success_saved: 'Sauvegardé avec succès!',
      confirm_delete: 'Êtes-vous sûr de vouloir supprimer ceci?',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim',
    }
  },
  
  /**
   * Get a translated string by key
   * Falls back to English if French key not found
   */
  t(key, params = {}) {
    const lang = this.language;
    const dict = this.translations[lang] || this.translations['en'];
    const enDict = this.translations['en'];
    let str = dict[key] || enDict[key] || key;
    
    // Replace {param} placeholders
    Object.keys(params).forEach(param => {
      str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
    
    return str;
  },
  
  /**
   * Set language and persist preference
   */
  setLanguage(lang) {
    if (!['en', 'fr'].includes(lang)) return;
    this.language = lang;
    localStorage.setItem('caribou_language', lang);
    document.documentElement.lang = lang === 'fr' ? 'fr-CA' : 'en';
    this.applyTranslations();
    
    // Re-render current page if app is initialized
    if (typeof navigateTo === 'function' && typeof AppState !== 'undefined') {
      navigateTo(AppState.currentPage);
    }
    
    // Dispatch event for components listening
    window.dispatchEvent(new CustomEvent('caribou:languageChange', { detail: { lang } }));
  },
  
  /**
   * Toggle between English and French
   */
  toggle() {
    this.setLanguage(this.language === 'en' ? 'fr' : 'en');
  },
  
  /**
   * Apply translations to all DOM elements with data-i18n attribute
   * Also updates HTML lang attribute
   */
  applyTranslations() {
    document.documentElement.lang = this.language === 'fr' ? 'fr-CA' : 'en';
    
    // Apply to elements with data-i18n attribute (text content)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // Apply to elements with data-i18n-placeholder attribute (input placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // Apply to elements with data-i18n-html attribute (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });
    
    // Update language toggle button
    const toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = this.language === 'en' ? 'FR' : 'EN';
      toggleBtn.setAttribute('aria-label', this.language === 'en' ? 'Switch to French' : 'Passer à l\'anglais');
    }
    
    // Update nav links if visible
    this._updateNavLinks();
  },
  
  /**
   * Update navigation link text
   */
  _updateNavLinks() {
    const navPages = {
      home: 'nav_dashboard',
      nutrition: 'nav_nutrition',
      medication: 'nav_medication',
      physicaltherapy: 'nav_fitness',
      condition: 'nav_condition',
      profile: 'nav_profile',
      tiers: 'nav_plans',
      about: 'nav_about'
    };
    
    document.querySelectorAll('[data-page]').forEach(link => {
      const page = link.getAttribute('data-page');
      const key = navPages[page];
      if (key) link.textContent = this.t(key);
    });
  },
  
  /**
   * Initialize the i18n system
   * Called on app startup
   */
  init() {
    // Set HTML lang attribute
    document.documentElement.lang = this.language === 'fr' ? 'fr-CA' : 'en';
    
    // Apply translations after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyTranslations());
    } else {
      this.applyTranslations();
    }
    
    console.log('[i18n] Initialized with language:', this.language);
  }
};

// Expose global shorthand
window.t = (key, params) => CaribouI18n.t(key, params);
window.CaribouI18n = CaribouI18n;

// Auto-initialize
CaribouI18n.init();

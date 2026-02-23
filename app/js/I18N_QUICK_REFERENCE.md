# i18n Quick Reference Guide

## One-Minute Setup

```javascript
// Already auto-initialized in i18n.js!
// Just include in your HTML:
<script src="app/js/i18n.js"></script>
```

## Common Usage Patterns

### 1. Translate HTML Element Text
```html
<!-- English: "Dashboard" -->
<!-- French: "Tableau de bord" -->
<button data-i18n="nav_dashboard">Dashboard</button>
```

### 2. Translate Input Placeholder
```html
<!-- English: "you@example.com" -->
<!-- French: "vous@exemple.com" -->
<input type="email" data-i18n-placeholder="auth_email_placeholder">
```

### 3. Translate in JavaScript
```javascript
// Get translated string
const title = window.t('welcome_title');
// Returns: "Welcome to Caribou" (EN) or "Bienvenue chez Caribou" (FR)

// With dynamic values
const message = window.t('key', { name: 'John' });
```

### 4. Language Toggle Button
```html
<button onclick="CaribouI18n.toggle()" id="lang-toggle-btn">
  FR <!-- or EN -->
</button>
```

### 5. Switch to Specific Language
```javascript
CaribouI18n.setLanguage('fr'); // Switch to French
CaribouI18n.setLanguage('en'); // Switch to English
```

## Key Categories Cheat Sheet

| Category | Prefix | Examples |
|----------|--------|----------|
| Navigation | `nav_` | nav_dashboard, nav_nutrition |
| Welcome Page | `welcome_` | welcome_title, welcome_subtitle |
| Auth Forms | `auth_` | auth_email, auth_password |
| Intake Form | `intake_` | intake_name_label, intake_age |
| Dashboard | `dashboard_` | dashboard_welcome, dashboard_checkin |
| Reminders | `reminders_` | reminders_title, reminders_medication |
| Nutrition | `nutrition_` | nutrition_breakfast, nutrition_calories |
| Medications | `medication_` | medication_schedule, medication_dose |
| Physical Therapy | `pt_` | pt_exercises, pt_pain_before |
| Buttons | `btn_` | btn_next, btn_save, btn_submit |
| Common | Various | loading, error_generic, success_saved |

## Full Translation Key List (by section)

### Navigation (9 keys)
```
nav_dashboard, nav_nutrition, nav_medication, nav_fitness,
nav_condition, nav_profile, nav_plans, nav_about, nav_toggle_lang
```

### Welcome Page (11 keys)
```
welcome_title, welcome_slogan, welcome_subtitle,
welcome_description, welcome_create_account, welcome_sign_in,
welcome_disclaimer
```

### Features (6 keys)
```
feature_plans_title, feature_plans_desc, feature_daily_title,
feature_daily_desc, feature_ai_title, feature_ai_desc
```

### Auth/Login (27 keys)
```
auth_create_title, auth_signin_title, auth_email,
auth_password, auth_confirm_password, auth_terms,
auth_terms_link, auth_privacy_link, auth_create_btn,
[... and more auth-related keys]
```

### Intake Form - Step 1 (25+ keys)
```
intake_title, intake_your_diagnosis, intake_name_label,
intake_diagnosis_label, intake_age, intake_sex,
intake_height, intake_weight, intake_activity,
[... more form fields]
```

### Intake Form - Step 2 Health (8 keys)
```
intake_health_title, intake_sleep_quality,
intake_avg_sleep, intake_stress, intake_stress_low,
intake_stress_moderate, intake_stress_high
```

### Intake Form - Step 3 Exercise (10 keys)
```
intake_exercise_title, intake_workout_schedule,
intake_frequency, intake_duration, intake_location,
intake_intensity, intake_mobility
```

### Intake Form - Step 4 Nutrition (4 keys)
```
intake_nutrition_title, intake_dietary_restrictions,
intake_meal_times, intake_breakfast_time
```

### Intake Form - Step 5 Medical (6 keys)
```
intake_medical_title, intake_medications,
intake_doctor_name, intake_doctor_phone,
intake_pharmacy, intake_pharmacy_phone
```

### Buttons (8 keys)
```
btn_next, btn_back, btn_submit, btn_save,
btn_cancel, btn_close, btn_continue, btn_skip
```

### Dashboard (15 keys)
```
dashboard_welcome, dashboard_care_overview,
dashboard_today_tasks, dashboard_check_in,
dashboard_checkin_pain, dashboard_hydration,
dashboard_glasses, [... more dashboard keys]
```

### Reminders (15 keys)
```
reminders_title, reminders_push, reminders_calendar,
reminders_email, reminders_medication, reminders_pt,
reminders_meals, reminders_grocery, reminders_time,
[... more reminder keys]
```

### Nutrition (12 keys)
```
nutrition_title, nutrition_today, nutrition_breakfast,
nutrition_lunch, nutrition_dinner, nutrition_snacks,
nutrition_calories, nutrition_protein, nutrition_carbs,
nutrition_fat, nutrition_water, nutrition_grocery_list
```

### Medication (8 keys)
```
medication_title, medication_schedule, medication_taken,
medication_not_taken, medication_add, medication_name,
medication_dose, medication_frequency
```

### Physical Therapy (11 keys)
```
pt_title, pt_exercises, pt_sets, pt_reps,
pt_seconds, pt_duration, pt_instructions,
pt_pain_before, pt_pain_after, pt_completed
```

### Condition Info (5 keys)
```
condition_title, condition_about, condition_symptoms,
condition_treatment, condition_prognosis
```

### Profile (8 keys)
```
profile_title, profile_personal, profile_health,
profile_subscription, profile_notifications,
profile_language, profile_logout, profile_edit
```

### Plans/Pricing (12 keys)
```
plans_title, plans_free, plans_premium, plans_family,
plans_per_month, plans_per_year, plans_get_started,
plans_current, plans_upgrade, plans_most_popular
```

### Family (14 keys)
```
family_add, family_edit, family_name, family_relationship,
family_age, family_condition, family_notes, family_save,
family_parent, family_spouse, family_child, family_sibling
```

### Documents (13 keys)
```
doc_upload, doc_add, doc_name, doc_type,
doc_medical_record, doc_pt_instructions, doc_imaging,
doc_lab, doc_prescription, doc_insurance, doc_file,
doc_click_upload, doc_upload_btn
```

### Cura AI Chatbot (4 keys)
```
cura_title, cura_subtitle, cura_placeholder,
cura_send, cura_disclaimer
```

### Common/Generic (17 keys)
```
optional, required, loading, error_generic,
success_saved, confirm_delete, today, yesterday,
monday, tuesday, wednesday, thursday, friday,
saturday, sunday
```

## French Translation Examples

| Key | English | French (Canadian) |
|-----|---------|-------------------|
| nav_dashboard | Dashboard | Tableau de bord |
| auth_email | Email Address | Adresse courriel |
| btn_next | Next | Suivant |
| intake_age | Age | Âge |
| nutrition_breakfast | Breakfast | Petit-déjeuner |
| medication_dose | Dosage | Dosage |
| pt_title | Physical Therapy | Physiothérapie |
| doc_upload | Upload Document | Téléverser un document |
| cura_title | Cura | Cura |
| loading | Loading... | Chargement... |

## Quick Debug Commands

```javascript
// Check current language
console.log(CaribouI18n.language);

// List all EN keys
console.log(Object.keys(CaribouI18n.translations.en));

// List all FR keys
console.log(Object.keys(CaribouI18n.translations.fr));

// Get specific translation
console.log(window.t('nav_dashboard'));

// Switch language and test
CaribouI18n.setLanguage('fr');
console.log(window.t('nav_dashboard')); // "Tableau de bord"

// Check localStorage
console.log(localStorage.getItem('caribou_language'));

// Count total keys
console.log(Object.keys(CaribouI18n.translations.en).length);
```

## HTML Implementation Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title data-i18n="welcome_title">Caribou Health</title>
</head>
<body>
    <!-- Navigation -->
    <nav>
        <button data-i18n="nav_dashboard">Dashboard</button>
        <button data-i18n="nav_nutrition">Nutrition</button>
        <button id="lang-toggle-btn" onclick="CaribouI18n.toggle()">FR</button>
    </nav>

    <!-- Main Content -->
    <main>
        <h1 data-i18n="welcome_title">Welcome to Caribou</h1>
        <p data-i18n="welcome_subtitle">Your personalized care companion</p>
        
        <form>
            <input type="email" 
                   data-i18n-placeholder="auth_email_placeholder" 
                   placeholder="you@example.com">
            <button type="submit" data-i18n="btn_submit">Submit</button>
        </form>
    </main>

    <!-- Include i18n System -->
    <script src="app/js/i18n.js"></script>
    
    <!-- Your app scripts -->
    <script src="app/js/app.js"></script>
</body>
</html>
```

---

**Last Updated**: February 23, 2026
**Status**: Production Ready
**Languages Supported**: English (en), Canadian French (fr)

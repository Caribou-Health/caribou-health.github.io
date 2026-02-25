/**
 * Caribou Health - Reminders Infrastructure
 * 
 * Supports three reminder delivery methods:
 * 1. Push Notifications (Web Push API - default)
 * 2. Calendar Export (ICS file generation)
 * 3. Email Reminders (via backend API)
 * 
 * Reminder types:
 * - Medication (per medication, per schedule)
 * - Physical Therapy (daily sessions)
 * - Meals (breakfast, lunch, dinner)
 * - Grocery (weekly/biweekly/monthly)
 */

const CaribouReminders = {
  // Storage key for preferences
  STORAGE_KEY: 'caribou_reminders',
  
  // Default preferences
  defaults: {
    method: 'push', // 'push' | 'calendar' | 'email'
    medication: {
      enabled: true,
      times: [] // populated from user's medication schedule
    },
    pt: {
      enabled: true,
      time: '09:00'
    },
    meals: {
      breakfast: { enabled: true, time: '08:00' },
      lunch: { enabled: true, time: '12:30' },
      dinner: { enabled: true, time: '18:30' }
    },
    grocery: {
      enabled: true,
      cadence: 'weekly', // 'weekly' | 'biweekly' | 'monthly'
      dayOfWeek: 0, // 0=Sunday, 6=Saturday
      time: '09:00'
    },
    email: '' // user's email for email reminders
  },
  
  /**
   * Load saved preferences from localStorage
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...this.defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('[Reminders] Error loading preferences:', e);
    }
    return { ...this.defaults };
  },
  
  /**
   * Save preferences to localStorage
   */
  savePreferences(prefs) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
      return true;
    } catch (e) {
      console.error('[Reminders] Error saving preferences:', e);
      return false;
    }
  },
  
  /**
   * Request push notification permission
   */
  async requestPushPermission() {
    if (!('Notification' in window)) {
      return { success: false, reason: 'not_supported' };
    }
    
    if (Notification.permission === 'granted') {
      return { success: true, permission: 'granted' };
    }
    
    if (Notification.permission === 'denied') {
      return { success: false, reason: 'denied' };
    }
    
    const permission = await Notification.requestPermission();
    return { 
      success: permission === 'granted', 
      permission,
      reason: permission !== 'granted' ? 'denied' : null
    };
  },
  
  /**
   * Schedule a push notification (uses service worker if available)
   * Note: Web Push requires a service worker for background delivery
   * This sends immediate + stores for service worker scheduling
   */
  async schedulePushNotification(title, body, tag, scheduledTime = null) {
    if (Notification.permission !== 'granted') {
      const result = await this.requestPushPermission();
      if (!result.success) return result;
    }
    
    // Store scheduled notification in localStorage for service worker
    const scheduled = JSON.parse(localStorage.getItem('caribou_scheduled_notifications') || '[]');
    const notification = {
      id: tag + '_' + Date.now(),
      tag,
      title,
      body,
      scheduledTime: scheduledTime ? scheduledTime.toISOString() : new Date().toISOString(),
      icon: '/app/assets/app-icon-180.png',
      badge: '/app/assets/app-icon-180.png'
    };
    
    // Remove old notifications with same tag
    const filtered = scheduled.filter(n => n.tag !== tag);
    filtered.push(notification);
    localStorage.setItem('caribou_scheduled_notifications', JSON.stringify(filtered));
    
    // Send immediate test notification if time is now
    if (!scheduledTime || Math.abs(new Date() - scheduledTime) < 60000) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          tag,
          icon: '/app/assets/app-icon-180.png'
        });
      } else {
        new Notification(title, { body, tag, icon: '/app/assets/app-icon-180.png' });
      }
    }
    
    return { success: true };
  },
  
  /**
   * Register service worker for background notifications
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.register('/app/sw.js');
      console.log('[Reminders] Service worker registered:', registration.scope);
      return true;
    } catch (e) {
      console.error('[Reminders] Service worker registration failed:', e);
      return false;
    }
  },
  
  /**
   * Generate an ICS calendar file for all reminders
   * @param {Object} prefs - Reminder preferences
   * @param {Object} userData - User data (medications, meal times, etc.)
   * @returns {string} ICS file content
   */
  generateICS(prefs, userData) {
    const events = [];
    const now = new Date();
    const userName = userData?.firstName || 'Caribou User';
    
    // Helper to format date for ICS (YYYYMMDDTHHMMSS)
    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    // Helper to format time string "HH:MM" to hours/minutes
    const parseTime = (timeStr) => {
      const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);
      return { hours, minutes };
    };
    
    // Helper to create a date at specific time
    const dateAtTime = (base, timeStr, daysOffset = 0) => {
      const d = new Date(base);
      d.setDate(d.getDate() + daysOffset);
      const { hours, minutes } = parseTime(timeStr);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };
    
    // Helper to generate UID
    const uid = (type) => `caribou-${type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}@caribouhealth.ca`;
    
    // ── MEDICATION REMINDERS ──
    if (prefs.medication?.enabled) {
      const medications = userData?.medicationsList || [];
      
      if (medications.length > 0) {
        medications.forEach(med => {
          if (!med.name) return;
          const times = med.times || [med.time || '08:00'];
          times.forEach(time => {
            const startDate = dateAtTime(now, time);
            const endDate = new Date(startDate.getTime() + 10 * 60000); // 10 min
            
            events.push({
              uid: uid('med-' + med.name.replace(/\s/g, '-').toLowerCase()),
              summary: `💊 Take ${med.name}`,
              description: `Medication reminder: ${med.name}${med.dosage ? ' - ' + med.dosage : ''}\\nFrom your Caribou care plan.`,
              location: '',
              dtstart: formatICSDate(startDate),
              dtend: formatICSDate(endDate),
              rrule: 'FREQ=DAILY',
              alarmMinutes: 5
            });
          });
        });
      } else if (userData?.medications) {
        // Legacy medications string
        const medStart = dateAtTime(now, '08:00');
        const medEnd = new Date(medStart.getTime() + 10 * 60000);
        events.push({
          uid: uid('medications'),
          summary: '💊 Take Medications',
          description: `Daily medication reminder from your Caribou care plan.\\nMedications: ${userData.medications}`,
          dtstart: formatICSDate(medStart),
          dtend: formatICSDate(medEnd),
          rrule: 'FREQ=DAILY',
          alarmMinutes: 5
        });
      }
    }
    
    // ── PHYSICAL THERAPY ──
    if (prefs.pt?.enabled) {
      const ptStart = dateAtTime(now, prefs.pt.time || '09:00');
      const ptEnd = new Date(ptStart.getTime() + 45 * 60000); // 45 min
      const condition = userData?.diagnosis || 'your condition';
      events.push({
        uid: uid('pt'),
        summary: '🏃 Physical Therapy Session',
        description: `Daily PT exercise session from your Caribou care plan for ${condition}.\\nOpen the Caribou app for today\\'s exercises.`,
        dtstart: formatICSDate(ptStart),
        dtend: formatICSDate(ptEnd),
        rrule: 'FREQ=DAILY',
        alarmMinutes: 10
      });
    }
    
    // ── MEAL REMINDERS ──
    const mealConfig = [
      { key: 'breakfast', emoji: '🥣', name: 'Breakfast', time: userData?.breakfastTime || '08:00' },
      { key: 'lunch', emoji: '🥗', name: 'Lunch', time: userData?.lunchTime || '12:30' },
      { key: 'dinner', emoji: '🍽️', name: 'Dinner/Supper', time: userData?.dinnerTime || '18:30' }
    ];
    
    mealConfig.forEach(meal => {
      if (prefs.meals?.[meal.key]?.enabled) {
        const mealStart = dateAtTime(now, meal.time);
        const mealEnd = new Date(mealStart.getTime() + 30 * 60000);
        events.push({
          uid: uid(meal.key),
          summary: `${meal.emoji} ${meal.name} Time`,
          description: `${meal.name} reminder from your Caribou nutrition plan.\\nOpen the Caribou app for today\\'s meal suggestions.`,
          dtstart: formatICSDate(mealStart),
          dtend: formatICSDate(mealEnd),
          rrule: 'FREQ=DAILY',
          alarmMinutes: 15
        });
      }
    });
    
    // ── GROCERY REMINDER ──
    if (prefs.grocery?.enabled) {
      const cadenceMap = { weekly: 'WEEKLY', biweekly: 'BIWEEKLY', monthly: 'MONTHLY' };
      const rruleFreq = cadenceMap[prefs.grocery.cadence] || 'WEEKLY';
      
      // Find next occurrence of the target day of week
      const targetDay = prefs.grocery.dayOfWeek ?? 0; // Default Sunday
      const groceryDate = new Date(now);
      const currentDay = groceryDate.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      groceryDate.setDate(groceryDate.getDate() + daysUntil);
      const { hours, minutes } = parseTime(prefs.grocery.time || '09:00');
      groceryDate.setHours(hours, minutes, 0, 0);
      const groceryEnd = new Date(groceryDate.getTime() + 60 * 60000);
      
      let rrule = `FREQ=${rruleFreq === 'BIWEEKLY' ? 'WEEKLY;INTERVAL=2' : rruleFreq}`;
      
      events.push({
        uid: uid('grocery'),
        summary: '🛒 Grocery Shopping Day',
        description: `Weekly grocery reminder from Caribou.\\nOpen the app to see your personalized grocery list based on your meal plan.`,
        dtstart: formatICSDate(groceryDate),
        dtend: formatICSDate(groceryEnd),
        rrule: rrule,
        alarmMinutes: 60
      });
    }
    
    // ── BUILD ICS FILE ──
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Caribou Health//Caribou Care Plan//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Caribou Health Reminders',
      'X-WR-TIMEZONE:America/Toronto',
      'X-WR-CALDESC:Your personalized care plan reminders from Caribou Health',
    ];
    
    events.forEach(event => {
      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${event.dtstart}`,
        `DTEND:${event.dtend}`,
        `SUMMARY:${event.summary}`,
        `DESCRIPTION:${event.description}`,
        ...(event.rrule ? [`RRULE:${event.rrule}`] : []),
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${event.summary}`,
        `TRIGGER:-PT${event.alarmMinutes || 10}M`,
        'END:VALARM',
        'END:VEVENT'
      );
    });
    
    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
  },
  
  /**
   * Download ICS file
   */
  downloadICS(prefs, userData) {
    const icsContent = this.generateICS(prefs, userData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caribou-care-plan-reminders.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },
  
  /**
   * Configure email reminders via backend API
   */
  async scheduleEmailReminders(prefs, userData) {
    if (!prefs.email) return { success: false, error: 'No email address provided' };
    
    try {
      const baseUrl = (typeof BackendConfig !== 'undefined') 
        ? BackendConfig.endpoints.baseUrl 
        : 'https://caribou-api-912857703569.northamerica-northeast1.run.app';
      
      const token = (typeof AuthService !== 'undefined' && AuthService.currentUser)
        ? await AuthService.currentUser.getIdToken()
        : null;
      
      const response = await fetch(`${baseUrl}/api/reminders/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: prefs.email,
          preferences: prefs,
          userData: {
            firstName: userData?.firstName,
            diagnosis: userData?.diagnosis,
            medications: userData?.medicationsList || [],
            mealTimes: {
              breakfast: userData?.breakfastTime,
              lunch: userData?.lunchTime,
              dinner: userData?.dinnerTime
            }
          }
        })
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        // Store locally for retry
        localStorage.setItem('caribou_pending_email_reminders', JSON.stringify({ prefs, userData }));
        return { success: false, error: 'Server unavailable - saved for retry', stored: true };
      }
    } catch (error) {
      localStorage.setItem('caribou_pending_email_reminders', JSON.stringify({ prefs, userData }));
      return { success: false, error: error.message, stored: true };
    }
  },
  
  /**
   * Setup all reminders based on preferences
   * This is the main entry point called after saving preferences
   */
  async setupReminders(prefs, userData) {
    const results = { push: null, calendar: null, email: null };
    
    if (prefs.method === 'push' || prefs.method === 'all') {
      const permResult = await this.requestPushPermission();
      if (permResult.success) {
        await this.registerServiceWorker();
        
        // Schedule medication reminders
        if (prefs.medication?.enabled) {
          const meds = userData?.medicationsList || [];
          if (meds.length > 0) {
            for (const med of meds) {
              const times = med.times || [med.time || '08:00'];
              for (const time of times) {
                const [h, m] = time.split(':').map(Number);
                const schedTime = new Date();
                schedTime.setHours(h, m, 0, 0);
                if (schedTime < new Date()) schedTime.setDate(schedTime.getDate() + 1);
                await this.schedulePushNotification(
                  `💊 Time for ${med.name}`,
                  med.dosage ? `Take ${med.dosage}` : 'Time to take your medication',
                  `med-${med.name}`,
                  schedTime
                );
              }
            }
          }
        }
        
        // Schedule PT reminder
        if (prefs.pt?.enabled) {
          const [h, m] = (prefs.pt.time || '09:00').split(':').map(Number);
          const ptTime = new Date();
          ptTime.setHours(h, m, 0, 0);
          if (ptTime < new Date()) ptTime.setDate(ptTime.getDate() + 1);
          await this.schedulePushNotification(
            '🏃 Physical Therapy Time',
            'Open Caribou for today\'s exercises',
            'pt-daily',
            ptTime
          );
        }
        
        // Schedule meal reminders
        const mealConfig = [
          { key: 'breakfast', emoji: '🥣', name: 'Breakfast', time: prefs.meals?.breakfast?.time || userData?.breakfastTime || '08:00' },
          { key: 'lunch', emoji: '🥗', name: 'Lunch', time: prefs.meals?.lunch?.time || userData?.lunchTime || '12:30' },
          { key: 'dinner', emoji: '🍽️', name: 'Dinner', time: prefs.meals?.dinner?.time || userData?.dinnerTime || '18:30' }
        ];
        
        for (const meal of mealConfig) {
          if (prefs.meals?.[meal.key]?.enabled) {
            const [h, m] = meal.time.split(':').map(Number);
            const mealTime = new Date();
            mealTime.setHours(h, m, 0, 0);
            if (mealTime < new Date()) mealTime.setDate(mealTime.getDate() + 1);
            await this.schedulePushNotification(
              `${meal.emoji} ${meal.name} Time`,
              'Check your Caribou nutrition plan',
              `meal-${meal.key}`,
              mealTime
            );
          }
        }
        
        results.push = { success: true };
      } else {
        results.push = permResult;
      }
    }
    
    return results;
  },
  
  /**
   * Render the reminders modal HTML
   */
  renderModal(userData) {
    const prefs = this.loadPreferences();
    const lang = (typeof CaribouI18n !== 'undefined') ? CaribouI18n.language : 'en';
    const t = (key) => (typeof window.t === 'function') ? window.t(key) : key;
    
    const modalHtml = `
      <div id="reminders-modal" class="reminders-modal" role="dialog" aria-modal="true" aria-labelledby="reminders-title">
        <div class="reminders-modal-overlay" onclick="CaribouReminders.closeModal()"></div>
        <div class="reminders-modal-content">
          <button class="reminders-modal-close" onclick="CaribouReminders.closeModal()" aria-label="${t('btn_close')}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <div class="reminders-header">
            <div class="reminders-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h2 id="reminders-title">${t('reminders_title')}</h2>
            <p>${t('reminders_subtitle')}</p>
          </div>
          
          <!-- Delivery Method Selection -->
          <div class="reminders-section">
            <h3 class="reminders-section-title">How would you like to receive reminders?</h3>
            <div class="reminders-method-grid">
              <label class="reminders-method-card ${prefs.method === 'push' ? 'selected' : ''}">
                <input type="radio" name="reminder-method" value="push" ${prefs.method === 'push' ? 'checked' : ''} onchange="CaribouReminders.onMethodChange('push')">
                <div class="method-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <span class="method-label">${t('reminders_push')}</span>
                <span class="method-desc">${t('reminders_push_desc')}</span>
              </label>
              
              <label class="reminders-method-card ${prefs.method === 'calendar' ? 'selected' : ''}">
                <input type="radio" name="reminder-method" value="calendar" ${prefs.method === 'calendar' ? 'checked' : ''} onchange="CaribouReminders.onMethodChange('calendar')">
                <div class="method-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span class="method-label">${t('reminders_calendar')}</span>
                <span class="method-desc">${t('reminders_calendar_desc')}</span>
              </label>
              
              <label class="reminders-method-card ${prefs.method === 'email' ? 'selected' : ''}">
                <input type="radio" name="reminder-method" value="email" ${prefs.method === 'email' ? 'checked' : ''} onchange="CaribouReminders.onMethodChange('email')">
                <div class="method-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <span class="method-label">${t('reminders_email')}</span>
                <span class="method-desc">${t('reminders_email_desc')}</span>
              </label>
            </div>
          </div>
          
          <!-- Email address (shown when email method selected) -->
          <div id="reminders-email-field" class="reminders-section" style="display: ${prefs.method === 'email' ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label">Email Address for Reminders</label>
              <input type="email" id="reminders-email-input" class="form-input" 
                placeholder="your@email.com" 
                value="${userData?.email || prefs.email || ''}">
            </div>
          </div>
          
          <!-- Medication Reminders -->
          <div class="reminders-section">
            <div class="reminders-section-header">
              <div class="reminders-section-info">
                <h3>💊 ${t('reminders_medication')}</h3>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="reminder-med-toggle" ${prefs.medication?.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div id="reminder-med-times" class="reminder-times" style="${prefs.medication?.enabled ? '' : 'display:none;'}">
              ${this._renderMedicationTimes(userData, prefs)}
            </div>
          </div>
          
          <!-- PT Reminders -->
          <div class="reminders-section">
            <div class="reminders-section-header">
              <div class="reminders-section-info">
                <h3>🏃 ${t('reminders_pt')}</h3>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="reminder-pt-toggle" ${prefs.pt?.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div id="reminder-pt-time" class="reminder-times" style="${prefs.pt?.enabled ? '' : 'display:none;'}">
              <div class="form-group">
                <label class="form-label">${t('reminders_time')}</label>
                <input type="time" id="reminder-pt-time-input" class="form-input" value="${prefs.pt?.time || '09:00'}">
              </div>
            </div>
          </div>
          
          <!-- Meal Reminders -->
          <div class="reminders-section">
            <div class="reminders-section-header">
              <div class="reminders-section-info">
                <h3>🍽️ ${t('reminders_meals')}</h3>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="reminder-meals-toggle" ${(prefs.meals?.breakfast?.enabled || prefs.meals?.lunch?.enabled || prefs.meals?.dinner?.enabled) ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div id="reminder-meals-times" class="reminder-times" style="${(prefs.meals?.breakfast?.enabled || prefs.meals?.lunch?.enabled || prefs.meals?.dinner?.enabled) ? '' : 'display:none;'}">
              ${[
                { key: 'breakfast', label: `🥣 ${t('nutrition_breakfast')}`, time: userData?.breakfastTime || '08:00' },
                { key: 'lunch', label: `🥗 ${t('nutrition_lunch')}`, time: userData?.lunchTime || '12:30' },
                { key: 'dinner', label: `🍽️ ${t('nutrition_dinner')}`, time: userData?.dinnerTime || '18:30' }
              ].map(meal => `
                <div class="reminder-meal-row">
                  <label class="checkbox-label-inline">
                    <input type="checkbox" id="reminder-${meal.key}" ${prefs.meals?.[meal.key]?.enabled !== false ? 'checked' : ''}>
                    <span>${meal.label}</span>
                  </label>
                  <input type="time" id="reminder-${meal.key}-time" class="form-input time-input-sm" 
                    value="${prefs.meals?.[meal.key]?.time || meal.time}">
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Grocery Reminders -->
          <div class="reminders-section">
            <div class="reminders-section-header">
              <div class="reminders-section-info">
                <h3>🛒 ${t('reminders_grocery')}</h3>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="reminder-grocery-toggle" ${prefs.grocery?.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div id="reminder-grocery-settings" class="reminder-times" style="${prefs.grocery?.enabled ? '' : 'display:none;'}">
              <div class="form-group">
                <label class="form-label">${t('reminders_grocery_cadence')}</label>
                <select id="reminder-grocery-cadence" class="form-input">
                  <option value="weekly" ${(prefs.grocery?.cadence || 'weekly') === 'weekly' ? 'selected' : ''}>${t('reminders_weekly')}</option>
                  <option value="biweekly" ${prefs.grocery?.cadence === 'biweekly' ? 'selected' : ''}>${t('reminders_biweekly')}</option>
                  <option value="monthly" ${prefs.grocery?.cadence === 'monthly' ? 'selected' : ''}>${t('reminders_monthly')}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Day of Week</label>
                  <select id="reminder-grocery-day" class="form-input">
                    ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => 
                      `<option value="${i}" ${(prefs.grocery?.dayOfWeek ?? 0) === i ? 'selected' : ''}>${day}</option>`
                    ).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${t('reminders_time')}</label>
                  <input type="time" id="reminder-grocery-time" class="form-input" value="${prefs.grocery?.time || '09:00'}">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="reminders-actions">
            <button class="btn btn-outline" onclick="CaribouReminders.closeModal()">${t('btn_cancel')}</button>
            <button class="btn btn-primary" onclick="CaribouReminders.saveAndActivate()">${t('reminders_save')}</button>
          </div>
          
          <!-- Status message -->
          <div id="reminders-status" class="reminders-status" style="display:none;"></div>
        </div>
      </div>
    `;
    
    return modalHtml;
  },
  
  /**
   * Render medication time inputs
   */
  _renderMedicationTimes(userData, prefs) {
    const meds = userData?.medicationsList || [];
    if (meds.length === 0) {
      return '<p class="reminder-note">Your medications will appear here once added to your care plan.</p>';
    }
    
    return meds.map(med => `
      <div class="reminder-med-item">
        <span class="reminder-med-name">💊 ${med.name}${med.dosage ? ' (' + med.dosage + ')' : ''}</span>
        ${(med.times || [med.time || '08:00']).map((time, idx) => `
          <div class="reminder-meal-row">
            <label class="checkbox-label-inline">
              <input type="checkbox" checked>
              <span>Dose ${idx + 1}</span>
            </label>
            <input type="time" class="form-input time-input-sm" value="${time}">
          </div>
        `).join('')}
      </div>
    `).join('');
  },
  
  /**
   * Handle delivery method change
   */
  onMethodChange(method) {
    document.querySelectorAll('.reminders-method-card').forEach(card => {
      card.classList.toggle('selected', card.querySelector('input').value === method);
    });
    
    const emailField = document.getElementById('reminders-email-field');
    if (emailField) emailField.style.display = method === 'email' ? 'block' : 'none';
  },
  
  /**
   * Toggle section visibility
   */
  toggleSection(checkboxId, sectionId) {
    const checkbox = document.getElementById(checkboxId);
    const section = document.getElementById(sectionId);
    if (checkbox && section) {
      section.style.display = checkbox.checked ? '' : 'none';
    }
  },
  
  /**
   * Gather preferences from the modal form
   */
  gatherPreferences(userData) {
    const method = document.querySelector('input[name="reminder-method"]:checked')?.value || 'push';
    
    const prefs = {
      method,
      email: document.getElementById('reminders-email-input')?.value || '',
      medication: {
        enabled: document.getElementById('reminder-med-toggle')?.checked ?? true,
        times: []
      },
      pt: {
        enabled: document.getElementById('reminder-pt-toggle')?.checked ?? true,
        time: document.getElementById('reminder-pt-time-input')?.value || '09:00'
      },
      meals: {
        breakfast: {
          enabled: document.getElementById('reminder-breakfast')?.checked ?? true,
          time: document.getElementById('reminder-breakfast-time')?.value || userData?.breakfastTime || '08:00'
        },
        lunch: {
          enabled: document.getElementById('reminder-lunch')?.checked ?? true,
          time: document.getElementById('reminder-lunch-time')?.value || userData?.lunchTime || '12:30'
        },
        dinner: {
          enabled: document.getElementById('reminder-dinner')?.checked ?? true,
          time: document.getElementById('reminder-dinner-time')?.value || userData?.dinnerTime || '18:30'
        }
      },
      grocery: {
        enabled: document.getElementById('reminder-grocery-toggle')?.checked ?? true,
        cadence: document.getElementById('reminder-grocery-cadence')?.value || 'weekly',
        dayOfWeek: parseInt(document.getElementById('reminder-grocery-day')?.value ?? 0),
        time: document.getElementById('reminder-grocery-time')?.value || '09:00'
      }
    };
    
    return prefs;
  },
  
  /**
   * Save preferences and activate reminders
   */
  async saveAndActivate() {
    const statusEl = document.getElementById('reminders-status');
    const userData = (typeof AppState !== 'undefined') ? AppState.userData : {};
    const prefs = this.gatherPreferences(userData);
    
    this.savePreferences(prefs);
    
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.className = 'reminders-status loading';
      statusEl.textContent = 'Setting up your reminders...';
    }
    
    if (prefs.method === 'calendar') {
      this.downloadICS(prefs, userData);
      if (statusEl) {
        statusEl.className = 'reminders-status success';
        statusEl.textContent = '✓ Calendar file downloaded! Open it to add reminders to your calendar.';
      }
    } else if (prefs.method === 'email') {
      const result = await this.scheduleEmailReminders(prefs, userData);
      if (statusEl) {
        statusEl.className = `reminders-status ${result.success || result.stored ? 'success' : 'error'}`;
        statusEl.textContent = result.success 
          ? '✓ Email reminders scheduled!' 
          : result.stored 
          ? '✓ Email reminders saved! They\'ll be sent from your next session.'
          : '✗ Could not set up email reminders. Please try again.';
      }
    } else {
      // Push notifications
      const results = await this.setupReminders(prefs, userData);
      if (statusEl) {
        if (results.push?.success) {
          statusEl.className = 'reminders-status success';
          statusEl.textContent = typeof window.t === 'function' 
            ? '✓ ' + window.t('reminders_enabled') 
            : '✓ Reminders enabled!';
        } else if (results.push?.reason === 'denied') {
          statusEl.className = 'reminders-status warning';
          statusEl.textContent = typeof window.t === 'function'
            ? window.t('reminders_permission_needed')
            : 'Please allow notifications in your browser settings to receive reminders.';
        } else if (results.push?.reason === 'not_supported') {
          statusEl.className = 'reminders-status warning';
          statusEl.textContent = 'Push notifications are not supported. Try Calendar or Email instead.';
        } else {
          statusEl.className = 'reminders-status success';
          statusEl.textContent = '✓ Reminder preferences saved!';
        }
      }
    }
    
    setTimeout(() => this.closeModal(), 3000);
  },
  
  /**
   * Open the reminders modal
   */
  openModal() {
    // Remove existing modal if any
    const existing = document.getElementById('reminders-modal');
    if (existing) existing.remove();
    
    const userData = (typeof AppState !== 'undefined') ? AppState.userData : {};
    const modalHtml = this.renderModal(userData);
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper.firstElementChild);
    
    // Add event listeners for toggles
    setTimeout(() => {
      const toggles = [
        { checkbox: 'reminder-med-toggle', section: 'reminder-med-times' },
        { checkbox: 'reminder-pt-toggle', section: 'reminder-pt-time' },
        { checkbox: 'reminder-meals-toggle', section: 'reminder-meals-times' },
        { checkbox: 'reminder-grocery-toggle', section: 'reminder-grocery-settings' }
      ];
      
      toggles.forEach(({ checkbox, section }) => {
        const el = document.getElementById(checkbox);
        if (el) el.addEventListener('change', () => this.toggleSection(checkbox, section));
      });
      
      // Animate in
      requestAnimationFrame(() => {
        const modal = document.getElementById('reminders-modal');
        if (modal) modal.classList.add('reminders-modal-visible');
      });
    }, 0);
  },
  
  /**
   * Close the reminders modal
   */
  closeModal() {
    const modal = document.getElementById('reminders-modal');
    if (modal) {
      modal.classList.remove('reminders-modal-visible');
      setTimeout(() => modal.remove(), 300);
    }
  }
};

window.CaribouReminders = CaribouReminders;

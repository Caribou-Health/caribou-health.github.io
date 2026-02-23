/**
 * Caribou Health — Gemini PT Exercise Illustrations
 * 
 * Uses Vertex AI (Gemini) via the Caribou Cloud Run API to generate
 * personalized PT exercise instructions. Renders clean SVG line-art
 * illustrations for each exercise in the care plan.
 * 
 * Line art style: Black strokes on white, no fill, anatomical clarity
 * (similar to medical/PT textbook illustrations)
 */

const GeminiPT = {
  API_BASE: 'https://caribou-api-912857703569.northamerica-northeast1.run.app',
  
  // Cache generated instructions to avoid repeated API calls
  _cache: {},
  
  /**
   * Get exercise instructions from Gemini via Cloud Run
   * Falls back to built-in instructions if API unavailable
   */
  async getInstructions(exerciseName, condition, userDetails = {}) {
    const cacheKey = `${exerciseName}_${condition}`;
    if (this._cache[cacheKey]) return this._cache[cacheKey];
    
    try {
      const token = (typeof AuthService !== 'undefined' && AuthService.currentUser)
        ? await AuthService.currentUser.getIdToken()
        : null;
      
      const response = await fetch(`${this.API_BASE}/api/pt-instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          exercise: exerciseName,
          condition: condition,
          userAge: userDetails.age,
          mobilityLimitations: userDetails.mobilityLimitations,
          intensityPreference: userDetails.intensityPreference
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.instructions) {
          this._cache[cacheKey] = data;
          return data;
        }
      }
    } catch (e) {
      console.log('[GeminiPT] API unavailable, using built-in instructions');
    }
    
    // Fallback to built-in instructions
    const fallback = this.getFallbackInstructions(exerciseName, condition);
    this._cache[cacheKey] = fallback;
    return fallback;
  },
  
  /**
   * Built-in exercise instructions for common exercises
   * Used as fallback when Gemini API is unavailable
   */
  getFallbackInstructions(exerciseName, condition) {
    const instructions = this.exerciseInstructionsDB[exerciseName.toLowerCase()] 
      || this.generateGenericInstructions(exerciseName);
    
    return {
      exercise: exerciseName,
      steps: instructions.steps,
      primaryMuscles: instructions.primaryMuscles || ['Core'],
      secondaryMuscles: instructions.secondaryMuscles || [],
      tips: instructions.tips || ['Breathe steadily throughout the exercise'],
      modifications: instructions.modifications || ['Reduce range of motion if uncomfortable'],
      source: 'built-in'
    };
  },
  
  /**
   * Generate generic instructions for unknown exercises
   */
  generateGenericInstructions(exerciseName) {
    return {
      steps: [
        `Start in the correct starting position for ${exerciseName}.`,
        'Engage your core and maintain proper posture throughout.',
        'Perform the movement slowly and with control.',
        'Return to the starting position and repeat.',
        'Focus on quality of movement over quantity.'
      ],
      primaryMuscles: ['Multiple muscle groups'],
      secondaryMuscles: ['Core, Stabilizers'],
      tips: ['Stop if you feel sharp pain', 'Breathe steadily throughout']
    };
  },
  
  /**
   * Database of common PT exercise instructions
   */
  exerciseInstructionsDB: {
    'wall push-ups': {
      steps: [
        'Stand arm\'s length from a wall with feet shoulder-width apart.',
        'Place both palms flat on the wall at shoulder height and width.',
        'Lean forward slightly, keeping your body in a straight line from head to heels.',
        'Slowly bend your elbows, lowering your chest toward the wall. Keep elbows at 45°.',
        'Pause when your upper arms form a 90° angle, then push back to start.',
      ],
      primaryMuscles: 'Chest, Triceps',
      secondaryMuscles: 'Abs, Shoulders',
      tips: ['Keep core tight', 'Don\'t lock elbows at top', 'Move slowly and controlled']
    },
    'heel slides': {
      steps: [
        'Lie flat on your back with both legs straight on the floor.',
        'Keep the non-exercising leg straight and relaxed.',
        'Slowly slide the heel of your exercising leg toward your buttocks, bending the knee.',
        'Slide until you feel a gentle stretch or reach your comfortable range.',
        'Slowly return to the starting position. Repeat on the same side.'
      ],
      primaryMuscles: 'Quadriceps, Hamstrings',
      secondaryMuscles: 'Hip Flexors',
      tips: ['Move within pain-free range', 'Keep movement slow and controlled']
    },
    'clamshells': {
      steps: [
        'Lie on your side with hips bent to about 45° and knees bent to 90°.',
        'Stack your feet and hips directly on top of each other.',
        'Keep your feet together and slowly rotate your top knee upward, like a clamshell opening.',
        'Raise the knee as high as you can without rolling your hips backward.',
        'Hold for 2 seconds at the top, then slowly lower. Repeat on same side.'
      ],
      primaryMuscles: 'Glutes (Gluteus Medius)',
      secondaryMuscles: 'Hip External Rotators',
      tips: ['Keep hips stacked', 'Don\'t roll back', 'Use a resistance band to progress']
    },
    'straight leg raises': {
      steps: [
        'Lie flat on your back with one knee bent and foot flat on the floor.',
        'Keep the exercising leg straight, tighten the quad by pressing knee toward floor.',
        'Raise the straight leg to the height of the opposite bent knee (about 45°).',
        'Hold for 3 seconds at the top, keeping the quad engaged.',
        'Slowly lower back to the floor. Repeat, then switch sides.'
      ],
      primaryMuscles: 'Quadriceps',
      secondaryMuscles: 'Hip Flexors, Core',
      tips: ['Tighten quad before lifting', 'Keep toes pointed up', 'No knee bend on working leg']
    },
    'bridges': {
      steps: [
        'Lie on your back with knees bent, feet flat on floor, hip-width apart.',
        'Arms are at your sides with palms facing down for stability.',
        'Tighten your core and squeeze your glutes before lifting.',
        'Push through your heels and raise your hips until your body forms a straight line from shoulders to knees.',
        'Hold for 3 seconds at the top, then slowly lower back down one vertebra at a time.'
      ],
      primaryMuscles: 'Glutes, Hamstrings',
      secondaryMuscles: 'Core, Lower Back',
      tips: ['Don\'t hyperextend the back', 'Squeeze glutes at top', 'Keep feet flat']
    },
    'ankle pumps': {
      steps: [
        'Sit or lie flat with your legs extended and relaxed.',
        'Point your toes away from you (plantarflexion) as far as comfortable.',
        'Hold for 2 seconds, feeling a gentle calf stretch.',
        'Now pull your toes toward you (dorsiflexion) as far as comfortable.',
        'Hold for 2 seconds, feeling a gentle shin stretch. Continue alternating.'
      ],
      primaryMuscles: 'Calf (Gastrocnemius, Soleus)',
      secondaryMuscles: 'Tibialis Anterior',
      tips: ['Great post-surgery for circulation', 'Move slowly', 'Do this hourly if recovering from lower leg surgery']
    },
    'shoulder rolls': {
      steps: [
        'Sit or stand with arms relaxed at your sides and spine tall.',
        'Gently lift both shoulders up toward your ears.',
        'Roll shoulders back, squeezing shoulder blades slightly together.',
        'Lower shoulders down, then roll forward to complete one circle.',
        'Perform 5 backward rolls, then 5 forward rolls.'
      ],
      primaryMuscles: 'Trapezius, Shoulder Muscles',
      secondaryMuscles: 'Neck Muscles',
      tips: ['Move slowly and gently', 'Breathe throughout', 'Stop if you feel clicking or pain']
    },
    'knee extensions': {
      steps: [
        'Sit tall in a chair with feet flat on the floor, back supported.',
        'Place a rolled towel under the knee of the exercising leg for support if needed.',
        'Slowly straighten your knee, lifting your foot until your leg is as straight as comfortable.',
        'Hold for 5 seconds at the top, focusing on tightening the quadriceps muscle.',
        'Slowly lower your foot back to the floor. Repeat, then switch legs.'
      ],
      primaryMuscles: 'Quadriceps',
      secondaryMuscles: 'Hip Flexors',
      tips: ['Sit tall throughout', 'Don\'t lock the knee forcefully', 'Ankle weights can add resistance when ready']
    },
    'hip abduction': {
      steps: [
        'Stand tall with feet together, holding a chair or wall for balance.',
        'Engage your core and keep your standing leg slightly bent.',
        'Slowly lift your working leg out to the side, keeping toes forward.',
        'Raise to about 30-45° without tilting your torso to the opposite side.',
        'Hold 2 seconds, then slowly lower. Repeat on same side, then switch.'
      ],
      primaryMuscles: 'Gluteus Medius, Hip Abductors',
      secondaryMuscles: 'Core, Balance Muscles',
      tips: ['Don\'t lean to opposite side', 'Lead with the heel', 'Keep movement controlled']
    },
    'cervical retraction': {
      steps: [
        'Sit or stand with good posture, chin level, eyes looking straight ahead.',
        'Without tilting your head up or down, gently draw your chin straight back.',
        'Create a "double chin" — feel a gentle stretch at the base of the skull.',
        'Hold for 3-5 seconds, maintaining normal breathing.',
        'Release and return to neutral position. This is one repetition.'
      ],
      primaryMuscles: 'Deep Cervical Flexors',
      secondaryMuscles: 'Upper Trapezius',
      tips: ['Think "tall spine, chin back" not "chin down"', 'Move gently', 'Great for forward head posture']
    }
  },
  
  /**
   * SVG Library — Line Art Exercise Illustrations
   * Black strokes, no fill, clean anatomical style
   */
  svgLibrary: {
    
    'standing': `
      <svg viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg" width="80" height="140">
        <!-- Head -->
        <circle cx="40" cy="14" r="11" fill="none" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Neck -->
        <line x1="40" y1="25" x2="40" y2="32" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Torso -->
        <line x1="40" y1="32" x2="40" y2="75" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Shoulders -->
        <line x1="40" y1="36" x2="20" y2="38" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="40" y1="36" x2="60" y2="38" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Upper arms -->
        <line x1="20" y1="38" x2="16" y2="58" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="60" y1="38" x2="64" y2="58" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Lower arms -->
        <line x1="16" y1="58" x2="14" y2="74" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="64" y1="58" x2="66" y2="74" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Hips -->
        <line x1="40" y1="75" x2="28" y2="78" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="40" y1="75" x2="52" y2="78" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Upper legs -->
        <line x1="28" y1="78" x2="25" y2="108" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="52" y1="78" x2="55" y2="108" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Lower legs -->
        <line x1="25" y1="108" x2="24" y2="130" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="55" y1="108" x2="56" y2="130" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Feet -->
        <line x1="24" y1="130" x2="18" y2="133" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="56" y1="130" x2="62" y2="133" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,

    'lying': `
      <svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" width="160" height="55">
        <!-- Head -->
        <circle cx="14" cy="22" r="10" fill="none" stroke="#1a1a1a" stroke-width="2.2"/>
        <!-- Neck + Torso -->
        <line x1="24" y1="22" x2="42" y2="22" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Spine/body -->
        <line x1="42" y1="22" x2="110" y2="24" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Arms (one shown) -->
        <line x1="55" y1="22" x2="58" y2="38" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="58" y1="38" x2="68" y2="44" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Hips to knee -->
        <line x1="110" y1="24" x2="138" y2="26" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Knees bent one side -->
        <line x1="138" y1="26" x2="148" y2="12" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="148" y1="12" x2="162" y2="18" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Straight leg -->
        <line x1="110" y1="28" x2="160" y2="30" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Floor line -->
        <line x1="4" y1="38" x2="170" y2="38" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
      </svg>`,

    'sitting': `
      <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" width="85" height="120">
        <!-- Head -->
        <circle cx="45" cy="14" r="11" fill="none" stroke="#1a1a1a" stroke-width="2.2"/>
        <!-- Neck -->
        <line x1="45" y1="25" x2="45" y2="32" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Torso (upright) -->
        <line x1="45" y1="32" x2="45" y2="72" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Chair back -->
        <line x1="20" y1="40" x2="20" y2="80" stroke="#aaa" stroke-width="2" stroke-linecap="round"/>
        <!-- Shoulders -->
        <line x1="45" y1="36" x2="28" y2="38" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="45" y1="36" x2="62" y2="38" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Arms down -->
        <line x1="28" y1="38" x2="24" y2="58" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="62" y1="38" x2="66" y2="58" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Hips (seated angle) -->
        <line x1="45" y1="72" x2="28" y2="75" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="45" y1="72" x2="62" y2="75" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Thighs (horizontal) -->
        <line x1="28" y1="75" x2="18" y2="78" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="62" y1="75" x2="72" y2="78" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Lower legs (down) -->
        <line x1="18" y1="78" x2="18" y2="108" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="72" y1="78" x2="72" y2="108" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Chair seat -->
        <line x1="10" y1="78" x2="80" y2="78" stroke="#aaa" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Floor -->
        <line x1="4" y1="108" x2="90" y2="108" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
      </svg>`,

    'side_lying': `
      <svg viewBox="0 0 190 80" xmlns="http://www.w3.org/2000/svg" width="170" height="72">
        <!-- Head (side view) -->
        <circle cx="14" cy="28" r="10" fill="none" stroke="#1a1a1a" stroke-width="2.2"/>
        <!-- Neck + Torso -->
        <line x1="24" y1="28" x2="90" y2="34" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Hip -->
        <line x1="90" y1="34" x2="100" y2="36" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Upper arm (on top) -->
        <line x1="55" y1="28" x2="64" y2="18" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="64" y1="18" x2="80" y2="16" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Bottom arm -->
        <line x1="50" y1="32" x2="40" y2="44" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3,2"/>
        <!-- Lower legs bent (clamshell position) -->
        <line x1="100" y1="36" x2="130" y2="50" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="130" y1="50" x2="158" y2="54" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Top leg raised -->
        <line x1="100" y1="34" x2="124" y2="22" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="124" y1="22" x2="158" y2="48" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Floor -->
        <line x1="4" y1="62" x2="180" y2="62" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
      </svg>`,
      
    'wall_pushup_start': `
      <svg viewBox="0 0 110 160" xmlns="http://www.w3.org/2000/svg" width="90" height="140">
        <!-- Wall -->
        <line x1="80" y1="5" x2="80" y2="155" stroke="#888" stroke-width="3" stroke-linecap="round"/>
        <!-- Head -->
        <circle cx="32" cy="18" r="11" fill="none" stroke="#1a1a1a" stroke-width="2.2"/>
        <!-- Neck -->
        <line x1="32" y1="29" x2="34" y2="36" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Torso (slight lean) -->
        <line x1="34" y1="36" x2="38" y2="80" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Arms extended to wall -->
        <line x1="38" y1="42" x2="80" y2="38" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="38" y1="48" x2="80" y2="50" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Hands on wall -->
        <circle cx="80" cy="38" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="2"/>
        <circle cx="80" cy="50" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="2"/>
        <!-- Hips -->
        <line x1="38" y1="80" x2="26" y2="84" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="38" y1="80" x2="48" y2="84" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Legs straight (slight lean) -->
        <line x1="26" y1="84" x2="20" y2="118" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="48" y1="84" x2="44" y2="118" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Lower legs -->
        <line x1="20" y1="118" x2="16" y2="140" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="44" y1="118" x2="40" y2="140" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Floor -->
        <line x1="2" y1="145" x2="78" y2="145" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
      </svg>`,

    'wall_pushup_end': `
      <svg viewBox="0 0 110 160" xmlns="http://www.w3.org/2000/svg" width="90" height="140">
        <!-- Wall -->
        <line x1="80" y1="5" x2="80" y2="155" stroke="#888" stroke-width="3" stroke-linecap="round"/>
        <!-- Head (closer to wall) -->
        <circle cx="44" cy="20" r="11" fill="none" stroke="#1a1a1a" stroke-width="2.2"/>
        <!-- Neck -->
        <line x1="48" y1="30" x2="52" y2="37" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Torso (more lean) -->
        <line x1="52" y1="37" x2="56" y2="82" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Arms bent (elbows out) -->
        <line x1="56" y1="42" x2="70" y2="32" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="70" y1="32" x2="80" y2="38" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="56" y1="50" x2="70" y2="56" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="70" y1="56" x2="80" y2="50" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Hands on wall -->
        <circle cx="80" cy="38" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="2"/>
        <circle cx="80" cy="50" r="3.5" fill="none" stroke="#1a1a1a" stroke-width="2"/>
        <!-- Hips -->
        <line x1="56" y1="82" x2="44" y2="86" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="56" y1="82" x2="66" y2="86" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <!-- Legs -->
        <line x1="44" y1="86" x2="36" y2="118" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="66" y1="86" x2="60" y2="118" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        <line x1="36" y1="118" x2="30" y2="140" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="60" y1="118" x2="54" y2="140" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Floor -->
        <line x1="2" y1="145" x2="78" y2="145" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
      </svg>`,
  },
  
  /**
   * Get the appropriate SVG illustration(s) for an exercise
   * Returns array of {svg, label} objects for before/during/after positions
   */
  getIllustrations(exerciseName) {
    const name = exerciseName.toLowerCase();
    
    // Exercise-specific illustrations
    if (name.includes('wall push') || name.includes('wall push-up')) {
      return [
        { svg: this.svgLibrary['wall_pushup_start'], label: 'Start Position' },
        { svg: this.svgLibrary['wall_pushup_end'], label: 'End Position' }
      ];
    }
    if (name.includes('bridge') || name.includes('glute bridge')) {
      return [
        { svg: this.svgLibrary['lying'], label: 'Bridge Exercise' }
      ];
    }
    if (name.includes('clamshell') || name.includes('clam shell') || name.includes('hip abduction side')) {
      return [
        { svg: this.svgLibrary['side_lying'], label: 'Clamshell Position' }
      ];
    }
    if (name.includes('heel slide') || name.includes('straight leg') || name.includes('ankle pump') || name.includes('bridge') || name.includes('quad set')) {
      return [
        { svg: this.svgLibrary['lying'], label: 'Lying Position' }
      ];
    }
    if (name.includes('seated') || name.includes('knee extension') || name.includes('sitting') || name.includes('chair')) {
      return [
        { svg: this.svgLibrary['sitting'], label: 'Seated Position' }
      ];
    }
    if (name.includes('standing') || name.includes('hip abduction') || name.includes('calf raise') || name.includes('mini squat')) {
      return [
        { svg: this.svgLibrary['standing'], label: 'Standing Position' }
      ];
    }
    
    // Default: standing
    return [
      { svg: this.svgLibrary['standing'], label: 'Exercise Position' }
    ];
  },
  
  /**
   * Render a complete exercise card with SVG illustration + Gemini instructions
   * @param {Object} exercise - Exercise object from the care plan
   * @param {string} condition - User's diagnosis
   * @param {Object} userData - User details
   * @returns {HTMLElement} The rendered card element
   */
  async renderExerciseCard(exercise, condition, userData) {
    const card = document.createElement('div');
    card.className = 'gemini-exercise-card';
    card.setAttribute('data-exercise', exercise.name);
    
    // Show loading state initially
    card.innerHTML = `
      <div class="gemini-exercise-header">
        <div class="gemini-exercise-name">${exercise.name}</div>
        <div class="gemini-exercise-meta">
          ${exercise.sets ? `<span class="gemini-exercise-badge sets">${exercise.sets} ${typeof window.t === 'function' ? window.t('pt_sets') : 'sets'}</span>` : ''}
          ${exercise.reps ? `<span class="gemini-exercise-badge reps">${exercise.reps} ${typeof window.t === 'function' ? window.t('pt_reps') : 'reps'}</span>` : ''}
          ${exercise.duration ? `<span class="gemini-exercise-badge duration">${exercise.duration}</span>` : ''}
        </div>
      </div>
      <div class="gemini-loading">
        <div class="gemini-loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p>Generating instructions with Cura AI...</p>
      </div>
    `;
    
    // Fetch instructions async
    const instructionData = await this.getInstructions(exercise.name, condition, userData);
    const illustrations = this.getIllustrations(exercise.name);
    
    const lang = (typeof CaribouI18n !== 'undefined') ? CaribouI18n.language : 'en';
    const t = (key) => (typeof window.t === 'function') ? window.t(key) : key;
    
    card.innerHTML = `
      <div class="gemini-exercise-header">
        <div class="gemini-exercise-name">${exercise.name}</div>
        <div class="gemini-exercise-meta">
          ${exercise.sets ? `<span class="gemini-exercise-badge sets">${exercise.sets} ${t('pt_sets')}</span>` : ''}
          ${exercise.reps ? `<span class="gemini-exercise-badge reps">${exercise.reps} ${t('pt_reps')}</span>` : ''}
          ${exercise.duration ? `<span class="gemini-exercise-badge duration">${exercise.duration}</span>` : ''}
        </div>
      </div>
      
      <div class="gemini-exercise-illustration">
        ${illustrations.map(ill => `
          <div class="illustration-step">
            ${ill.svg}
            <span class="illustration-label">${ill.label}</span>
          </div>
        `).join('')}
      </div>
      
      ${instructionData.primaryMuscles ? `
      <div class="gemini-muscles">
        <div class="gemini-muscles-group">
          <h4>Primary muscle group(s):</h4>
          <p>${instructionData.primaryMuscles}</p>
        </div>
        ${instructionData.secondaryMuscles ? `
        <div class="gemini-muscles-group">
          <h4>Secondary:</h4>
          <p>${instructionData.secondaryMuscles}</p>
        </div>` : ''}
      </div>
      ` : ''}
      
      <div class="gemini-instructions">
        <h4>${t('pt_instructions')}</h4>
        ${instructionData.steps.map((step, i) => `
          <div class="gemini-step">
            <span class="gemini-step-num">${i + 1}</span>
            <p>${step}</p>
          </div>
        `).join('')}
        ${instructionData.tips && instructionData.tips.length > 0 ? `
          <div style="margin-top: 12px; padding: 10px 12px; background: rgba(74,155,155,0.06); border-radius: 8px; border-left: 3px solid var(--primary, #4A9B9B);">
            <p style="font-size: 0.78rem; font-weight: 600; color: var(--primary, #4A9B9B); margin: 0 0 4px;">💡 Tips</p>
            ${instructionData.tips.map(tip => `<p style="font-size: 0.8rem; color: var(--gray-600, #4b5563); margin: 2px 0;">• ${tip}</p>`).join('')}
          </div>
        ` : ''}
        ${instructionData.source === 'gemini' ? '<p style="font-size: 0.7rem; color: var(--gray-400, #9ca3af); margin-top: 8px; text-align: right;">✨ Generated by Cura AI</p>' : ''}
      </div>
    `;
    
    return card;
  },
  
  /**
   * Render all exercises for the current care plan
   * Called from the PT page render
   */
  async renderAllExercises(exercises, condition, userData, containerEl) {
    if (!containerEl) return;
    
    containerEl.innerHTML = '';
    
    for (const exercise of exercises) {
      const card = await this.renderExerciseCard(exercise, condition, userData);
      containerEl.appendChild(card);
    }
  }
};

window.GeminiPT = GeminiPT;

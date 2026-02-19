/**
 * Caribou Health - Comprehensive Exercise Resources Library
 *
 * EXHAUSTIVE list of physical therapy exercises for all conditions.
 * Images sourced from Pexels (free to use with attribution).
 * YouTube videos embedded in modal for proper playback.
 *
 * Organized by body region and exercise type.
 * Last updated: 2024
 */

const ExerciseResources = {

  // ============================================
  // WRIST & HAND EXERCISES
  // ============================================

  'wrist-range-of-motion': {
    name: 'Wrist Range of Motion',
    category: 'wrist-hand',
    bodyPart: 'wrist',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Wrist flexion and extension exercise demonstration',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'mQLFKu0mXIo',
    youtubeTitle: 'Wrist Stretches & Range of Motion Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Extend your arm in front of you with palm down',
      'Gently bend wrist up (extension) and hold 5 seconds',
      'Gently bend wrist down (flexion) and hold 5 seconds',
      'Move wrist side to side slowly (radial/ulnar deviation)',
      'Repeat 10 times in each direction'
    ],
    conditions: ['wrist-sprain', 'carpal-tunnel', 'wrist-tendonitis', 'repetitive-strain']
  },

  'wrist-flexion-stretch': {
    name: 'Wrist Flexion Stretch',
    category: 'wrist-hand',
    bodyPart: 'wrist',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7298877/pexels-photo-7298877.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching wrist in flexion position',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'mQLFKu0mXIo',
    youtubeTitle: 'Wrist Flexion Stretches',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Extend arm straight in front, palm facing up',
      'Use other hand to gently press fingers toward floor',
      'Feel stretch on top of forearm',
      'Hold for 20-30 seconds',
      'Repeat 3 times each wrist'
    ],
    conditions: ['carpal-tunnel', 'wrist-tendonitis', 'tennis-elbow']
  },

  'wrist-extension-stretch': {
    name: 'Wrist Extension Stretch',
    category: 'wrist-hand',
    bodyPart: 'wrist',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7298877/pexels-photo-7298877.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching wrist in extension position',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'mQLFKu0mXIo',
    youtubeTitle: 'Wrist Extension Stretches',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Extend arm straight in front, palm facing down',
      'Use other hand to gently press fingers toward body',
      'Feel stretch on inner forearm',
      'Hold for 20-30 seconds',
      'Repeat 3 times each wrist'
    ],
    conditions: ['carpal-tunnel', 'wrist-tendonitis', 'golfers-elbow']
  },

  'finger-spreads': {
    name: 'Finger Spreads',
    category: 'wrist-hand',
    bodyPart: 'hand',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Hand with fingers spread wide apart',
    imageCredit: 'Pexels - cottonbro studio',
    youtubeId: 'EiRC80FLbsQ',
    youtubeTitle: 'Hand and Finger Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start with your hand relaxed',
      'Spread all fingers as wide apart as possible',
      'Hold for 3-5 seconds',
      'Bring fingers back together',
      'Make a gentle fist, then spread again',
      'Repeat 10-15 times'
    ],
    conditions: ['wrist-sprain', 'thumb-sprain', 'carpal-tunnel', 'trigger-finger', 'arthritis']
  },

  'finger-tendon-glides': {
    name: 'Finger Tendon Glides',
    category: 'wrist-hand',
    bodyPart: 'hand',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Hand performing tendon gliding exercises',
    imageCredit: 'Pexels - cottonbro studio',
    youtubeId: 'EiRC80FLbsQ',
    youtubeTitle: 'Tendon Gliding Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start with fingers straight (table top position)',
      'Bend at knuckles only - keep fingers straight (hook fist)',
      'Make a full fist',
      'Open to straight position',
      'Bend at first finger joints (tabletop)',
      'Move through each position slowly, 10 times'
    ],
    conditions: ['carpal-tunnel', 'trigger-finger', 'finger-fracture', 'hand-surgery']
  },

  'forearm-rotation': {
    name: 'Forearm Rotation (Supination/Pronation)',
    category: 'wrist-hand',
    bodyPart: 'forearm',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person rotating forearm palm up and palm down',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'BHxKk20jfhM',
    youtubeTitle: 'Forearm Supination and Pronation',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit with elbow bent at 90 degrees, close to your side',
      'Start with palm facing down (pronation)',
      'Slowly rotate forearm so palm faces up (supination)',
      'Rotate back to palm down position',
      'Keep elbow stationary - only forearm moves',
      'Repeat 10-15 times'
    ],
    conditions: ['wrist-sprain', 'elbow-sprain', 'tennis-elbow', 'golfers-elbow', 'forearm-fracture']
  },

  'grip-strengthening': {
    name: 'Grip Strengthening',
    category: 'wrist-hand',
    bodyPart: 'hand',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Hand squeezing therapy ball for grip strength',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'TSuG-xfwCU4',
    youtubeTitle: 'Hand Grip Strengthening Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Use a soft stress ball or rolled towel',
      'Squeeze gently - no pain should be felt',
      'Hold squeeze for 5 seconds',
      'Release slowly',
      'Repeat 10 times',
      'Only do this exercise when your wrist is pain-free'
    ],
    conditions: ['wrist-sprain', 'thumb-sprain', 'carpal-tunnel', 'arthritis', 'stroke-recovery']
  },

  'thumb-opposition': {
    name: 'Thumb Opposition',
    category: 'wrist-hand',
    bodyPart: 'hand',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Thumb touching each fingertip in sequence',
    imageCredit: 'Pexels - cottonbro studio',
    youtubeId: 'EiRC80FLbsQ',
    youtubeTitle: 'Thumb Opposition Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start with hand open, fingers extended',
      'Touch thumb to tip of index finger, making an "O"',
      'Open hand back to starting position',
      'Touch thumb to middle finger tip',
      'Continue to ring finger, then pinky',
      'Repeat the full sequence 10 times'
    ],
    conditions: ['thumb-sprain', 'carpal-tunnel', 'arthritis', 'stroke-recovery']
  },

  'nerve-glides-median': {
    name: 'Median Nerve Glides',
    category: 'wrist-hand',
    bodyPart: 'arm',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/7298877/pexels-photo-7298877.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing median nerve glide stretch',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'pAjjwVKY5d4',
    youtubeTitle: 'Median Nerve Glides for Carpal Tunnel',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start with elbow bent, wrist flexed, fingers in fist',
      'Straighten elbow while keeping wrist flexed',
      'Extend wrist back while straightening fingers',
      'Turn head away from extended arm',
      'Move slowly - should feel gentle stretch, no pain',
      'Repeat 10-15 times'
    ],
    conditions: ['carpal-tunnel', 'peripheral-neuropathy', 'thoracic-outlet']
  },

  // ============================================
  // ELBOW EXERCISES
  // ============================================

  'elbow-flexion-extension': {
    name: 'Elbow Flexion and Extension',
    category: 'elbow',
    bodyPart: 'elbow',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person bending and straightening elbow',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'TcYjBwKOvXM',
    youtubeTitle: 'Elbow Range of Motion Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start with arm at side, palm facing forward',
      'Slowly bend elbow, bringing hand toward shoulder',
      'Hold for 2 seconds at the top',
      'Slowly straighten elbow completely',
      'Keep upper arm still',
      'Repeat 10-15 times'
    ],
    conditions: ['elbow-sprain', 'tennis-elbow', 'golfers-elbow', 'elbow-fracture', 'elbow-surgery']
  },

  'tennis-elbow-stretch': {
    name: 'Tennis Elbow Stretch',
    category: 'elbow',
    bodyPart: 'elbow',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7298877/pexels-photo-7298877.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching forearm extensors for tennis elbow',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'we4UoiKG3Co',
    youtubeTitle: 'Tennis Elbow Stretches',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Extend arm straight in front, palm down',
      'Make a fist',
      'Bend wrist down toward floor',
      'Use other hand to gently press down further',
      'Feel stretch along outer forearm',
      'Hold 30 seconds, repeat 3 times'
    ],
    conditions: ['tennis-elbow', 'lateral-epicondylitis', 'forearm-strain']
  },

  'golfers-elbow-stretch': {
    name: 'Golfer\'s Elbow Stretch',
    category: 'elbow',
    bodyPart: 'elbow',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/7298877/pexels-photo-7298877.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching forearm flexors for golfer elbow',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'CLjtSyuE11I',
    youtubeTitle: 'Golfers Elbow Stretches',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Extend arm straight in front, palm up',
      'Straighten fingers',
      'Bend wrist back, fingers pointing down',
      'Use other hand to gently pull fingers back further',
      'Feel stretch along inner forearm',
      'Hold 30 seconds, repeat 3 times'
    ],
    conditions: ['golfers-elbow', 'medial-epicondylitis', 'forearm-strain']
  },

  'eccentric-wrist-extension': {
    name: 'Eccentric Wrist Extension',
    category: 'elbow',
    bodyPart: 'forearm',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing eccentric wrist curl with light weight',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'we4UoiKG3Co',
    youtubeTitle: 'Eccentric Wrist Exercises for Tennis Elbow',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Rest forearm on table, wrist over edge, palm down',
      'Hold light weight (1-2 lbs or can of soup)',
      'Use other hand to help lift wrist up',
      'Slowly lower wrist down (eccentric phase) over 3 seconds',
      'Focus on the slow lowering motion',
      'Repeat 10-15 times, 3 sets'
    ],
    conditions: ['tennis-elbow', 'lateral-epicondylitis', 'wrist-tendonitis']
  },

  // ============================================
  // SHOULDER EXERCISES
  // ============================================

  'pendulum-swings': {
    name: 'Pendulum Swings (Codman Exercises)',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing pendulum arm swings leaning on table',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'W5CVconTqHE',
    youtubeTitle: 'Pendulum Exercises for Shoulder',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lean forward, support yourself on a table with unaffected arm',
      'Let affected arm hang down relaxed',
      'Gently swing arm in small circles (clockwise)',
      'Swing in opposite direction (counterclockwise)',
      'Swing forward and back, then side to side',
      'Let momentum do the work - keep arm relaxed',
      'Continue 1-2 minutes each direction'
    ],
    conditions: ['shoulder-impingement', 'rotator-cuff', 'frozen-shoulder', 'shoulder-surgery', 'shoulder-sprain']
  },

  'shoulder-flexion': {
    name: 'Shoulder Flexion (Arm Raise)',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person raising arms overhead for shoulder flexion',
    imageCredit: 'Pexels - Andrea Piacquadio',
    youtubeId: 'Cp3eFEAYwAM',
    youtubeTitle: 'Shoulder Flexion Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand or sit with arm at side, thumb up',
      'Slowly raise arm forward and up toward ceiling',
      'Go as high as comfortable without pain',
      'Hold 2 seconds at the top',
      'Slowly lower back down',
      'Repeat 10-15 times'
    ],
    conditions: ['shoulder-impingement', 'rotator-cuff', 'frozen-shoulder', 'shoulder-surgery']
  },

  'shoulder-abduction': {
    name: 'Shoulder Abduction (Side Raise)',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person raising arms out to sides for shoulder abduction',
    imageCredit: 'Pexels - Andrea Piacquadio',
    youtubeId: 'MSTrPJV5UjE',
    youtubeTitle: 'Shoulder Abduction Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand with arm at side, palm facing body',
      'Slowly raise arm out to the side',
      'Keep elbow straight, thumb pointing up',
      'Raise to shoulder level or as high as comfortable',
      'Hold 2 seconds',
      'Slowly lower back down',
      'Repeat 10-15 times'
    ],
    conditions: ['shoulder-impingement', 'rotator-cuff', 'frozen-shoulder']
  },

  'external-rotation-sidelying': {
    name: 'External Rotation (Side-Lying)',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person lying on side performing shoulder external rotation',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'QstnGgJ0XnQ',
    youtubeTitle: 'Shoulder External Rotation Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on your unaffected side',
      'Hold light weight in top hand',
      'Bend elbow 90 degrees, rest it against your side',
      'Slowly rotate forearm upward toward ceiling',
      'Keep elbow pressed against your side',
      'Lower slowly back down',
      'Repeat 10-15 times'
    ],
    conditions: ['rotator-cuff', 'shoulder-impingement', 'shoulder-instability']
  },

  'internal-rotation-stretch': {
    name: 'Internal Rotation Stretch (Sleeper Stretch)',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing sleeper stretch for shoulder internal rotation',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'ehyJAT4zvKs',
    youtubeTitle: 'Sleeper Stretch for Shoulder',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on your affected side',
      'Bend affected elbow to 90 degrees in front of you',
      'Use other hand to gently push forearm toward floor',
      'Keep shoulder blade pressed down',
      'Feel stretch in back of shoulder',
      'Hold 30 seconds, repeat 3 times'
    ],
    conditions: ['rotator-cuff', 'frozen-shoulder', 'shoulder-impingement']
  },

  'scapular-squeezes': {
    name: 'Scapular Squeezes (Shoulder Blade Squeeze)',
    category: 'shoulder',
    bodyPart: 'upper-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person squeezing shoulder blades together',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'QAJSuWs1dEU',
    youtubeTitle: 'Scapular Squeeze Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit or stand with good posture',
      'Arms relaxed at sides',
      'Squeeze shoulder blades together and down',
      'Imagine holding a pencil between them',
      'Hold for 5 seconds',
      'Relax and repeat 10-15 times'
    ],
    conditions: ['posture-problems', 'upper-back-pain', 'neck-pain', 'shoulder-impingement', 'scapular-dyskinesis']
  },

  'wall-slides': {
    name: 'Wall Slides',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing wall slide exercise arms overhead',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'HV1Y1hLqCHQ',
    youtubeTitle: 'Wall Slides for Shoulder Mobility',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand with back against wall',
      'Feet about 6 inches from wall',
      'Press lower back, head, and arms against wall',
      'Arms in "goal post" position (90/90)',
      'Slowly slide arms up overhead',
      'Keep everything touching wall',
      'Slide back down, repeat 10-15 times'
    ],
    conditions: ['posture-problems', 'shoulder-impingement', 'frozen-shoulder', 'thoracic-kyphosis']
  },

  'cross-body-stretch': {
    name: 'Cross-Body Shoulder Stretch',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing cross body shoulder stretch',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: '8lDC4Ri9zAQ',
    youtubeTitle: 'Cross Body Shoulder Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Bring affected arm across your body',
      'Use other hand to gently pull at the elbow',
      'Keep shoulder down, not raised up',
      'Feel stretch in back of shoulder',
      'Hold for 30 seconds',
      'Repeat 3 times each side'
    ],
    conditions: ['shoulder-impingement', 'rotator-cuff', 'frozen-shoulder']
  },

  'doorway-chest-stretch': {
    name: 'Doorway Chest Stretch (Pec Stretch)',
    category: 'shoulder',
    bodyPart: 'chest',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching chest muscles in doorway',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: '6Yh8lqKqS9s',
    youtubeTitle: 'Doorway Pec Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand in doorway',
      'Place forearms on door frame, elbows at shoulder height',
      'Step one foot forward through doorway',
      'Lean forward until you feel stretch in chest',
      'Keep back straight, don\'t arch',
      'Hold 30 seconds, repeat 3 times'
    ],
    conditions: ['posture-problems', 'shoulder-impingement', 'rounded-shoulders']
  },

  'shoulder-isometric-exercises': {
    name: 'Shoulder Isometrics',
    category: 'shoulder',
    bodyPart: 'shoulder',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person pushing against wall for isometric shoulder exercise',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'bqL4pnNmX-s',
    youtubeTitle: 'Shoulder Isometric Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand facing wall, elbow bent 90 degrees',
      'Push fist gently into wall (forward push)',
      'Hold 10 seconds - no movement, just push',
      'Repeat with side of arm against wall (side push)',
      'Repeat pushing backward against wall',
      'Do 10 repetitions each direction'
    ],
    conditions: ['shoulder-impingement', 'rotator-cuff', 'shoulder-surgery', 'frozen-shoulder']
  },

  // ============================================
  // NECK EXERCISES
  // ============================================

  'neck-range-of-motion': {
    name: 'Neck Range of Motion',
    category: 'neck',
    bodyPart: 'neck',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing gentle neck movements',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: '7Uos1EDw3Gk',
    youtubeTitle: 'Neck Range of Motion Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit tall with shoulders relaxed',
      'Slowly turn head to look over right shoulder',
      'Return to center, then turn to left',
      'Tilt head ear to shoulder each side',
      'Look up toward ceiling, then down toward chest',
      'Move slowly, no jerky movements, 10 times each'
    ],
    conditions: ['neck-pain', 'whiplash', 'cervical-strain', 'posture-problems']
  },

  'chin-tucks': {
    name: 'Chin Tucks (Cervical Retraction)',
    category: 'neck',
    bodyPart: 'neck',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing chin tuck exercise',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'wQylqaCl8Zo',
    youtubeTitle: 'Chin Tucks for Neck Pain',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit or stand with good posture',
      'Look straight ahead',
      'Draw chin straight back (make a double chin)',
      'Don\'t tilt head up or down',
      'Feel lengthening at back of neck',
      'Hold 5 seconds, repeat 10-15 times'
    ],
    conditions: ['neck-pain', 'posture-problems', 'cervical-disc', 'headache-migraine', 'forward-head-posture']
  },

  'levator-scapulae-stretch': {
    name: 'Levator Scapulae Stretch',
    category: 'neck',
    bodyPart: 'neck',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching side of neck looking down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'yUm1Jc4mWEU',
    youtubeTitle: 'Levator Scapulae Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit tall in chair, hold seat with right hand',
      'Turn head 45 degrees to left (look at armpit)',
      'Drop chin toward chest',
      'Use left hand to gently add pressure on back of head',
      'Feel stretch right side of neck/shoulder blade',
      'Hold 30 seconds, repeat 3 times each side'
    ],
    conditions: ['neck-pain', 'upper-back-pain', 'tension-headache', 'stress-management']
  },

  'upper-trap-stretch': {
    name: 'Upper Trapezius Stretch',
    category: 'neck',
    bodyPart: 'neck',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching upper trap ear to shoulder',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'zJfepwrYaRc',
    youtubeTitle: 'Upper Trapezius Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit tall, hold seat with right hand to anchor shoulder',
      'Tilt left ear toward left shoulder',
      'Face forward (don\'t rotate head)',
      'Use left hand to gently add pressure',
      'Feel stretch along right side of neck',
      'Hold 30 seconds, repeat 3 times each side'
    ],
    conditions: ['neck-pain', 'tension-headache', 'stress-management', 'posture-problems']
  },

  'isometric-neck-exercises': {
    name: 'Isometric Neck Exercises',
    category: 'neck',
    bodyPart: 'neck',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person pushing head against hand for neck isometrics',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'lJzEqSlYOWE',
    youtubeTitle: 'Isometric Neck Strengthening',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Place hand on forehead',
      'Press head forward against hand - don\'t let head move',
      'Hold 10 seconds, relax',
      'Place hand on back of head, press backward',
      'Place hand on side of head, press sideways each side',
      'Repeat each direction 10 times'
    ],
    conditions: ['neck-pain', 'cervical-strain', 'whiplash', 'neck-strengthening']
  },

  // ============================================
  // BACK EXERCISES - LOWER BACK
  // ============================================

  'pelvic-tilts': {
    name: 'Pelvic Tilts',
    category: 'lower-back',
    bodyPart: 'lower-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person lying on back doing pelvic tilt exercise',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'bFwJPVE6H_E',
    youtubeTitle: 'Pelvic Tilts for Back Pain',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back with knees bent, feet flat on floor',
      'Flatten lower back against the floor',
      'Tighten abdominal muscles',
      'Tilt pelvis up slightly (belly button toward chest)',
      'Hold for 5-10 seconds',
      'Relax and repeat 10-15 times'
    ],
    conditions: ['lower-back-pain', 'sciatica', 'disc-herniation', 'core-weakness', 'posture-problems']
  },

  'knee-to-chest-stretch': {
    name: 'Knee to Chest Stretch',
    category: 'lower-back',
    bodyPart: 'lower-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person pulling knee to chest while lying down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: '6s2xTuGQyHM',
    youtubeTitle: 'Knee to Chest Stretch for Back Pain',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back with knees bent',
      'Bring one knee toward chest',
      'Clasp hands behind thigh (not over knee)',
      'Gently pull knee closer to chest',
      'Keep other foot on floor or extend leg',
      'Hold 20-30 seconds, switch legs, repeat 2-3 times each'
    ],
    conditions: ['lower-back-pain', 'sciatica', 'piriformis-syndrome', 'hip-flexor-tightness']
  },

  'double-knee-to-chest': {
    name: 'Double Knee to Chest',
    category: 'lower-back',
    bodyPart: 'lower-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person hugging both knees to chest',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: '6s2xTuGQyHM',
    youtubeTitle: 'Double Knee to Chest Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back',
      'Bring both knees toward chest',
      'Wrap arms around both knees',
      'Gently pull knees closer to chest',
      'Rock gently side to side (optional)',
      'Hold 20-30 seconds, repeat 3 times'
    ],
    conditions: ['lower-back-pain', 'lower-back-stiffness']
  },

  'cat-cow-stretch': {
    name: 'Cat-Cow Stretch',
    category: 'lower-back',
    bodyPart: 'spine',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person on hands and knees doing cat cow stretch',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'kqnua4rHVVA',
    youtubeTitle: 'Cat Cow Stretch',
    youtubeChannel: 'Yoga With Adriene',
    instructions: [
      'Start on hands and knees (tabletop position)',
      'CAT: Round spine up toward ceiling, tuck chin',
      'COW: Drop belly toward floor, lift head and tailbone',
      'Move slowly with your breath',
      'Inhale for cow, exhale for cat',
      'Repeat 10-15 cycles'
    ],
    conditions: ['lower-back-pain', 'upper-back-pain', 'spine-mobility', 'general-wellness']
  },

  'bird-dog': {
    name: 'Bird Dog',
    category: 'lower-back',
    bodyPart: 'core',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing bird dog exercise arm and leg extended',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'wiFNA3sqjCA',
    youtubeTitle: 'Bird Dog Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Start on hands and knees (tabletop)',
      'Keep back flat and core engaged',
      'Extend right arm forward and left leg back',
      'Keep arm and leg parallel to floor',
      'Hold 5 seconds, return to start',
      'Switch sides (left arm, right leg)',
      'Repeat 10 times each side'
    ],
    conditions: ['lower-back-pain', 'core-weakness', 'balance-training']
  },

  'bridges': {
    name: 'Glute Bridges',
    category: 'lower-back',
    bodyPart: 'glutes',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/6454069/pexels-photo-6454069.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing glute bridge exercise hips raised',
    imageCredit: 'Pexels - MART PRODUCTION',
    youtubeId: 'wPM8icPu6H8',
    youtubeTitle: 'Glute Bridge Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back, knees bent, feet flat on floor',
      'Arms at sides, palms down',
      'Squeeze glutes and lift hips off floor',
      'Body forms straight line from shoulders to knees',
      'Hold 2-3 seconds at the top',
      'Lower slowly, repeat 10-15 times'
    ],
    conditions: ['lower-back-pain', 'hip-weakness', 'glute-weakness', 'piriformis-syndrome']
  },

  'prone-press-up': {
    name: 'Prone Press-Up (McKenzie Extension)',
    category: 'lower-back',
    bodyPart: 'lower-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person pressing up from lying face down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'dlNqr4G6DFM',
    youtubeTitle: 'McKenzie Press Up Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie face down on floor',
      'Place hands under shoulders',
      'Slowly press upper body up, keeping hips on floor',
      'Straighten arms as much as comfortable',
      'Keep pelvis and legs relaxed on floor',
      'Hold 1-2 seconds at top, lower slowly',
      'Repeat 10 times'
    ],
    conditions: ['disc-herniation', 'lower-back-pain', 'sciatica']
  },

  'lumbar-rotation-stretch': {
    name: 'Lower Trunk Rotation',
    category: 'lower-back',
    bodyPart: 'lower-back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing lower back rotation lying down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: '58E1gQ5v-xs',
    youtubeTitle: 'Lower Back Rotation Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back, knees bent, feet flat',
      'Keep shoulders on floor',
      'Slowly drop both knees to the right',
      'Hold 15-30 seconds',
      'Return knees to center',
      'Drop both knees to the left',
      'Repeat 5 times each side'
    ],
    conditions: ['lower-back-pain', 'lower-back-stiffness', 'si-joint-dysfunction']
  },

  'dead-bug': {
    name: 'Dead Bug',
    category: 'lower-back',
    bodyPart: 'core',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing dead bug core exercise',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'I5xbsA71v1A',
    youtubeTitle: 'Dead Bug Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back, arms pointing toward ceiling',
      'Lift legs, bend knees 90 degrees (tabletop)',
      'Press low back into floor',
      'Slowly lower right arm overhead and left leg down',
      'Return to start, switch sides',
      'Keep core engaged, back flat throughout',
      'Repeat 10 times each side'
    ],
    conditions: ['lower-back-pain', 'core-weakness', 'disc-herniation']
  },

  'child-pose': {
    name: 'Child\'s Pose',
    category: 'lower-back',
    bodyPart: 'back',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person in child pose yoga position',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: '2MJGg-dUKh0',
    youtubeTitle: 'Childs Pose Stretch',
    youtubeChannel: 'Yoga With Adriene',
    instructions: [
      'Start on hands and knees',
      'Sit back on heels',
      'Extend arms forward on floor',
      'Rest forehead on floor',
      'Let lower back gently stretch',
      'Breathe deeply, hold 30-60 seconds'
    ],
    conditions: ['lower-back-pain', 'stress-management', 'general-wellness']
  },

  // ============================================
  // HIP EXERCISES
  // ============================================

  'hip-flexor-stretch': {
    name: 'Hip Flexor Stretch (Kneeling Lunge)',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person in kneeling lunge stretch position',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'UGEpQ1BRx-4',
    youtubeTitle: 'Hip Flexor Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Kneel on one knee (use cushion if needed)',
      'Other foot flat in front, knee at 90 degrees',
      'Keep torso upright',
      'Shift weight forward until stretch in front of back hip',
      'Don\'t let front knee go past toes',
      'Hold 30 seconds, repeat 3 times each side'
    ],
    conditions: ['hip-pain', 'lower-back-pain', 'hip-flexor-tightness', 'posture-problems']
  },

  'piriformis-stretch': {
    name: 'Piriformis Stretch (Figure 4)',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing figure 4 piriformis stretch',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'iYYu_nIdVcc',
    youtubeTitle: 'Piriformis Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back, knees bent',
      'Cross right ankle over left knee (figure 4)',
      'Reach through and grab behind left thigh',
      'Pull left leg toward chest',
      'Feel stretch deep in right buttock',
      'Hold 30 seconds, repeat 3 times each side'
    ],
    conditions: ['piriformis-syndrome', 'sciatica', 'hip-pain', 'lower-back-pain']
  },

  'clamshells': {
    name: 'Clamshells',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing clamshell exercise lying on side',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'nNJiF3Szd-c',
    youtubeTitle: 'Clamshell Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on side, knees bent 45 degrees, feet together',
      'Keep pelvis stable, don\'t roll backward',
      'Lift top knee up (like clamshell opening)',
      'Keep feet touching throughout',
      'Lower slowly with control',
      'Repeat 15-20 times each side'
    ],
    conditions: ['hip-pain', 'hip-bursitis', 'it-band-syndrome', 'knee-pain', 'glute-weakness']
  },

  'hip-abduction-sidelying': {
    name: 'Hip Abduction (Side Leg Raise)',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person lying on side raising top leg',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'jgh6sGwtTwk',
    youtubeTitle: 'Side Leg Raises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on side, bottom knee bent for stability',
      'Keep top leg straight',
      'Lift top leg toward ceiling',
      'Keep toes pointing forward, not up',
      'Don\'t let hip roll backward',
      'Lower slowly, repeat 15-20 times each side'
    ],
    conditions: ['hip-pain', 'hip-bursitis', 'it-band-syndrome', 'hip-weakness']
  },

  'hip-internal-rotation': {
    name: 'Hip Internal Rotation Stretch',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching hip internal rotation',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'A2bWO-QSWYI',
    youtubeTitle: 'Hip Internal Rotation Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit on floor with knees bent, feet flat and wide',
      'Let one knee fall inward toward floor',
      'Keep foot planted',
      'Feel stretch in outer hip/buttock',
      'Hold 30 seconds',
      'Repeat on other side'
    ],
    conditions: ['hip-pain', 'hip-impingement', 'hip-stiffness']
  },

  'hip-external-rotation': {
    name: 'Hip External Rotation Stretch',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching hip external rotation',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'A2bWO-QSWYI',
    youtubeTitle: 'Hip External Rotation Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit on floor with knees bent',
      'Cross one ankle over opposite knee',
      'Gently press down on raised knee',
      'Keep back straight',
      'Feel stretch in outer hip',
      'Hold 30 seconds, switch sides'
    ],
    conditions: ['hip-pain', 'piriformis-syndrome', 'hip-stiffness']
  },

  'standing-hip-flexion': {
    name: 'Standing Hip Flexion',
    category: 'hip',
    bodyPart: 'hip',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person lifting knee while standing',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'dYs4Vn3mFYw',
    youtubeTitle: 'Standing Hip Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand tall, hold chair or wall for balance',
      'Lift one knee up toward chest',
      'Keep back straight, don\'t lean back',
      'Lower foot back to floor',
      'Repeat 15 times each leg'
    ],
    conditions: ['hip-pain', 'hip-replacement', 'hip-weakness', 'balance-training']
  },

  // ============================================
  // KNEE EXERCISES
  // ============================================

  'quad-sets': {
    name: 'Quad Sets',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person tightening thigh muscle lying down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'D2t4KdOlXnI',
    youtubeTitle: 'Quad Sets Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back or sit with leg straight',
      'Tighten thigh muscle by pushing knee down into floor',
      'You should see kneecap move up slightly',
      'Hold for 5-10 seconds',
      'Relax and repeat',
      'Do 10-15 repetitions'
    ],
    conditions: ['knee-pain', 'acl-injury', 'knee-surgery', 'patella-problems', 'knee-arthritis']
  },

  'straight-leg-raises': {
    name: 'Straight Leg Raises',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person raising straight leg while lying down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'yJiBx6dzsHU',
    youtubeTitle: 'Straight Leg Raise Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back, one knee bent, other leg straight',
      'Tighten thigh muscle of straight leg',
      'Lift leg 6-8 inches off the ground',
      'Keep knee completely straight',
      'Hold 3-5 seconds at top',
      'Lower slowly, repeat 10-15 times each leg'
    ],
    conditions: ['knee-pain', 'acl-injury', 'knee-surgery', 'knee-arthritis', 'quad-weakness']
  },

  'heel-slides': {
    name: 'Heel Slides',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person sliding heel toward buttock lying down',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'MIJ2HR5qJJg',
    youtubeTitle: 'Heel Slides for Knee ROM',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back with legs straight',
      'Slowly slide heel toward buttock',
      'Bend knee as far as comfortable',
      'Slide heel back to starting position',
      'Keep movement slow and controlled',
      'Repeat 10-15 times each leg'
    ],
    conditions: ['knee-surgery', 'knee-replacement', 'knee-stiffness', 'acl-injury']
  },

  'terminal-knee-extension': {
    name: 'Terminal Knee Extension',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person straightening knee over towel roll',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'DNlBRkHZvhw',
    youtubeTitle: 'Terminal Knee Extension',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Place towel roll under affected knee',
      'Straighten knee by lifting heel off floor',
      'Squeeze thigh muscle at top',
      'Hold 5 seconds',
      'Lower slowly',
      'Repeat 10-15 times'
    ],
    conditions: ['acl-injury', 'knee-surgery', 'patella-problems', 'knee-weakness']
  },

  'hamstring-curls-standing': {
    name: 'Standing Hamstring Curls',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person standing curling heel toward buttock',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'cBbgOy7X9yQ',
    youtubeTitle: 'Standing Hamstring Curls',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand holding chair or wall for balance',
      'Bend one knee, bringing heel toward buttock',
      'Keep thighs parallel (knee pointing down)',
      'Lower foot back to floor',
      'Repeat 15 times each leg'
    ],
    conditions: ['knee-pain', 'hamstring-strain', 'knee-surgery', 'acl-injury']
  },

  'hamstring-stretch-supine': {
    name: 'Hamstring Stretch (Lying)',
    category: 'knee',
    bodyPart: 'thigh',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching hamstring lying on back',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'FDwpEdxZ4H4',
    youtubeTitle: 'Hamstring Stretch Lying Down',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Lie on back near doorway',
      'Raise leg and rest it on door frame',
      'Other leg through doorway, flat on floor',
      'Scoot closer to door to increase stretch',
      'Feel stretch in back of thigh',
      'Hold 30 seconds, repeat 3 times each leg'
    ],
    conditions: ['hamstring-strain', 'lower-back-pain', 'sciatica', 'knee-pain']
  },

  'wall-sits': {
    name: 'Wall Sits',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing wall sit against wall',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'y-wV4Lz6EIM',
    youtubeTitle: 'Wall Sit Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand with back against wall',
      'Slide down until knees bent 45-60 degrees',
      'Keep knees over ankles, not past toes',
      'Hold position as long as comfortable',
      'Stand back up',
      'Work up to 30-60 seconds, repeat 3 times'
    ],
    conditions: ['knee-pain', 'patella-problems', 'quad-weakness', 'knee-arthritis']
  },

  'step-ups': {
    name: 'Step Ups',
    category: 'knee',
    bodyPart: 'knee',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stepping up onto platform',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'dQqApCGd5Ss',
    youtubeTitle: 'Step Up Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand facing stairs or step (4-8 inch height)',
      'Step up with affected leg',
      'Straighten leg fully on step',
      'Tap other foot on step, then lower it down',
      'Control the movement - don\'t let knee collapse inward',
      'Repeat 10-15 times each leg'
    ],
    conditions: ['knee-pain', 'knee-surgery', 'patella-problems', 'acl-injury']
  },

  // ============================================
  // ANKLE & FOOT EXERCISES
  // ============================================

  'ankle-pumps': {
    name: 'Ankle Pumps',
    category: 'ankle-foot',
    bodyPart: 'ankle',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498607/pexels-photo-4498607.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person pumping ankle up and down',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: '0A9jqfIp6sg',
    youtubeTitle: 'Ankle Pumps Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit or lie with legs extended',
      'Point toes away from you (plantarflexion)',
      'Pull toes toward you (dorsiflexion)',
      'Move in a pumping motion',
      'Keep movement smooth and rhythmic',
      'Repeat 20-30 times'
    ],
    conditions: ['ankle-sprain', 'ankle-surgery', 'dvt-prevention', 'swelling', 'circulation']
  },

  'ankle-circles': {
    name: 'Ankle Circles',
    category: 'ankle-foot',
    bodyPart: 'ankle',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498607/pexels-photo-4498607.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person rotating ankle in circle',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: '0A9jqfIp6sg',
    youtubeTitle: 'Ankle Circle Exercises',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit or lie with legs extended',
      'Lift one foot slightly',
      'Draw circles in the air with toes',
      'Make 10 circles clockwise',
      'Make 10 circles counterclockwise',
      'Repeat with other foot'
    ],
    conditions: ['ankle-sprain', 'ankle-stiffness', 'ankle-surgery']
  },

  'calf-raises': {
    name: 'Calf Raises',
    category: 'ankle-foot',
    bodyPart: 'calf',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person rising up on toes for calf raise',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'gwLzBJYoWlI',
    youtubeTitle: 'Calf Raises Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold wall or chair for balance',
      'Rise up onto toes, lifting heels',
      'Hold at top for 2-3 seconds',
      'Lower heels slowly back down',
      'Repeat 10-15 times, work up to 3 sets'
    ],
    conditions: ['ankle-sprain', 'achilles-tendonitis', 'plantar-fasciitis', 'calf-strain']
  },

  'calf-stretch-wall': {
    name: 'Calf Stretch (Wall)',
    category: 'ankle-foot',
    bodyPart: 'calf',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching calf against wall',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'q1_qVQN3fDA',
    youtubeTitle: 'Calf Stretch Against Wall',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand facing wall, hands on wall',
      'Step one foot back, keeping it flat',
      'Bend front knee, keep back knee straight',
      'Lean into wall until stretch in back calf',
      'Hold 30 seconds',
      'Repeat 3 times each leg'
    ],
    conditions: ['achilles-tendonitis', 'plantar-fasciitis', 'calf-strain', 'ankle-sprain']
  },

  'towel-scrunches': {
    name: 'Towel Scrunches',
    category: 'ankle-foot',
    bodyPart: 'foot',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498607/pexels-photo-4498607.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Foot scrunching towel on floor',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'Gcm564ZKsIk',
    youtubeTitle: 'Towel Scrunches for Feet',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit with foot flat on towel on floor',
      'Keep heel on floor',
      'Use toes to scrunch towel toward you',
      'Spread toes and push towel away',
      'Repeat scrunching motion',
      'Do 2-3 sets of 10 scrunches each foot'
    ],
    conditions: ['plantar-fasciitis', 'foot-pain', 'flat-feet', 'foot-weakness']
  },

  'ankle-inversion-eversion': {
    name: 'Ankle Inversion/Eversion',
    category: 'ankle-foot',
    bodyPart: 'ankle',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498607/pexels-photo-4498607.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person turning ankle inward and outward',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: '3dr2quCx8x4',
    youtubeTitle: 'Ankle Inversion and Eversion',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit with foot off floor',
      'Turn sole of foot inward (inversion)',
      'Hold 2 seconds',
      'Turn sole of foot outward (eversion)',
      'Hold 2 seconds',
      'Repeat 10-15 times each direction'
    ],
    conditions: ['ankle-sprain', 'ankle-instability', 'ankle-surgery']
  },

  'balance-single-leg': {
    name: 'Single Leg Balance',
    category: 'ankle-foot',
    bodyPart: 'ankle',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person balancing on one leg',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'unXfNj9oaB8',
    youtubeTitle: 'Single Leg Balance Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand near wall or chair for safety',
      'Lift one foot slightly off ground',
      'Try to balance for 30 seconds',
      'Keep standing leg slightly bent',
      'Use support as needed',
      'Work up to 60 seconds, eyes closed for challenge'
    ],
    conditions: ['ankle-sprain', 'balance-training', 'fall-prevention', 'ankle-instability']
  },

  'plantar-fascia-stretch': {
    name: 'Plantar Fascia Stretch',
    category: 'ankle-foot',
    bodyPart: 'foot',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498607/pexels-photo-4498607.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person stretching bottom of foot',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: 'b2ycgKh-xrM',
    youtubeTitle: 'Plantar Fascia Stretch',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit and cross affected foot over opposite knee',
      'Hold toes and pull them back toward shin',
      'Feel stretch along arch of foot',
      'Massage arch with other hand if desired',
      'Hold 30 seconds',
      'Repeat 3 times, especially in morning'
    ],
    conditions: ['plantar-fasciitis', 'foot-pain', 'heel-pain']
  },

  // ============================================
  // WALKING & CARDIO
  // ============================================

  'walking': {
    name: 'Walking',
    category: 'cardio',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4148932/pexels-photo-4148932.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person walking outdoors for exercise',
    imageCredit: 'Pexels - Ketut Subiyanto',
    youtubeId: 'njeZ29umqVE',
    youtubeTitle: '15 Minute Walking Workout',
    youtubeChannel: 'Walk at Home',
    instructions: [
      'Start at comfortable, easy pace',
      'Stand tall with shoulders back',
      'Swing arms naturally at sides',
      'Take smooth, even steps',
      'Aim for 15-30 minutes',
      'Gradually increase pace or distance'
    ],
    conditions: ['general-wellness', 'cardiac-rehab', 'weight-management', 'diabetes', 'arthritis']
  },

  'stationary-marching': {
    name: 'Stationary Marching',
    category: 'cardio',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person marching in place',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'bMaI9e_sXAE',
    youtubeTitle: 'March in Place Workout',
    youtubeChannel: 'HASfit',
    instructions: [
      'Stand with feet hip-width apart',
      'March in place lifting knees',
      'Pump arms as you march',
      'Keep core engaged',
      'Maintain steady rhythm',
      'Continue for 5-10 minutes'
    ],
    conditions: ['general-wellness', 'cardiac-rehab', 'fall-prevention', 'warm-up']
  },

  // ============================================
  // SQUATS & LOWER BODY STRENGTH
  // ============================================

  'bodyweight-squats': {
    name: 'Bodyweight Squats',
    category: 'strength',
    bodyPart: 'legs',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing bodyweight squat',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'aclHkVaku9U',
    youtubeTitle: 'How to Squat Correctly',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep chest up and core engaged',
      'Push hips back as if sitting in chair',
      'Lower until thighs parallel to floor (or as comfortable)',
      'Keep knees over toes, not collapsing inward',
      'Push through heels to stand',
      'Repeat 10-15 times'
    ],
    conditions: ['general-wellness', 'knee-strengthening', 'hip-strengthening', 'fall-prevention']
  },

  'chair-squats': {
    name: 'Chair Squats (Sit to Stand)',
    category: 'strength',
    bodyPart: 'legs',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing sit to stand from chair',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'V9xDbFpf2lE',
    youtubeTitle: 'Sit to Stand Exercise',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Sit at edge of sturdy chair',
      'Feet flat, shoulder-width apart',
      'Lean slightly forward',
      'Push through heels to stand',
      'Slowly lower back to seated',
      'Don\'t use hands for assistance',
      'Repeat 10-15 times'
    ],
    conditions: ['fall-prevention', 'knee-weakness', 'hip-replacement', 'general-wellness']
  },

  'lunges': {
    name: 'Lunges',
    category: 'strength',
    bodyPart: 'legs',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person performing forward lunge',
    imageCredit: 'Pexels - Klaus Nielsen',
    youtubeId: 'QOVaHwm-Q6U',
    youtubeTitle: 'How to Do Lunges',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg',
      'Lower body until both knees at 90 degrees',
      'Keep front knee over ankle, not past toes',
      'Push back to starting position',
      'Repeat 10 times each leg'
    ],
    conditions: ['leg-strengthening', 'balance-training', 'general-wellness']
  },

  // ============================================
  // STRETCHING & FLEXIBILITY
  // ============================================

  'morning-stretch': {
    name: 'Morning Stretch Routine',
    category: 'stretching',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing morning stretches',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'itJE95SLcAs',
    youtubeTitle: '5 Minute Morning Stretch',
    youtubeChannel: 'MadFit',
    instructions: [
      'Reach arms overhead, stretch tall',
      'Gentle neck rolls - each direction',
      'Shoulder shrugs and circles',
      'Side bends - reach over head each side',
      'Standing forward fold (touch toes)',
      'Hold each stretch 15-30 seconds'
    ],
    conditions: ['general-wellness', 'flexibility', 'morning-routine', 'stiffness']
  },

  'gentle-stretching': {
    name: 'Gentle Full Body Stretching',
    category: 'stretching',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing gentle stretches',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'g_tea8ZNk5A',
    youtubeTitle: 'Full Body Stretching Routine',
    youtubeChannel: 'Yoga With Adriene',
    instructions: [
      'Move slowly and gently',
      'Only stretch to comfortable point - no pain',
      'Start with neck and shoulder stretches',
      'Move to back and hip stretches',
      'Finish with leg stretches',
      'Breathe deeply throughout',
      'Hold each stretch 20-30 seconds'
    ],
    conditions: ['general-wellness', 'flexibility', 'arthritis', 'fibromyalgia']
  },

  // ============================================
  // BREATHING & RELAXATION
  // ============================================

  'deep-breathing': {
    name: 'Deep Breathing (Diaphragmatic)',
    category: 'breathing',
    bodyPart: 'respiratory',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person practicing deep breathing',
    imageCredit: 'Pexels - Andrea Piacquadio',
    youtubeId: 'tybOi4hjZFQ',
    youtubeTitle: 'Deep Breathing Exercises',
    youtubeChannel: 'Goodful',
    instructions: [
      'Sit or lie comfortably',
      'Place one hand on chest, one on belly',
      'Breathe in slowly through nose for 4 counts',
      'Feel belly rise (chest stays still)',
      'Hold for 2 counts',
      'Exhale slowly through mouth for 6 counts',
      'Repeat 5-10 cycles'
    ],
    conditions: ['stress-management', 'copd', 'asthma', 'anxiety', 'general-wellness']
  },

  'pursed-lip-breathing': {
    name: 'Pursed Lip Breathing',
    category: 'breathing',
    bodyPart: 'respiratory',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person doing pursed lip breathing',
    imageCredit: 'Pexels - Andrea Piacquadio',
    youtubeId: 'RSkaFHmVta8',
    youtubeTitle: 'Pursed Lip Breathing Technique',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Relax shoulders',
      'Inhale through nose for 2 counts',
      'Purse lips like blowing out candle',
      'Exhale slowly through pursed lips for 4 counts',
      'The exhale should be twice as long as inhale',
      'Repeat 4-5 times or as needed'
    ],
    conditions: ['copd', 'asthma', 'shortness-of-breath', 'pulmonary-rehab']
  },

  // ============================================
  // BALANCE EXERCISES
  // ============================================

  'balance-practice': {
    name: 'Balance Practice',
    category: 'balance',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person practicing balance on one leg',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'unXfNj9oaB8',
    youtubeTitle: 'Balance Exercises for Beginners',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand near wall or chair for safety',
      'Shift weight to one leg',
      'Lift other foot slightly off ground',
      'Try to balance for 30 seconds',
      'Use support as needed for safety',
      'Switch legs and repeat'
    ],
    conditions: ['fall-prevention', 'vestibular-disorder', 'ankle-instability', 'stroke-recovery']
  },

  'tandem-stance': {
    name: 'Tandem Stance (Heel to Toe)',
    category: 'balance',
    bodyPart: 'full-body',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person standing heel to toe',
    imageCredit: 'Pexels - Elina Fairytale',
    youtubeId: 'unXfNj9oaB8',
    youtubeTitle: 'Tandem Stance Balance',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand near wall or counter',
      'Place one foot directly in front of other',
      'Heel of front foot touches toes of back foot',
      'Hold position for 30 seconds',
      'Switch which foot is in front',
      'Progress to no hand support'
    ],
    conditions: ['fall-prevention', 'vestibular-disorder', 'balance-training']
  },

  'heel-toe-walking': {
    name: 'Heel to Toe Walking',
    category: 'balance',
    bodyPart: 'full-body',
    difficulty: 'intermediate',
    image: 'https://images.pexels.com/photos/4148932/pexels-photo-4148932.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person walking heel to toe in line',
    imageCredit: 'Pexels - Ketut Subiyanto',
    youtubeId: 'unXfNj9oaB8',
    youtubeTitle: 'Heel Toe Walking',
    youtubeChannel: 'AskDoctorJo',
    instructions: [
      'Stand near wall for safety',
      'Walk in a straight line',
      'Place heel of front foot against toes of back foot',
      'Walk like on a tightrope',
      'Take 10-20 steps',
      'Turn around and repeat'
    ],
    conditions: ['fall-prevention', 'vestibular-disorder', 'balance-training']
  },

  // ============================================
  // DEFAULT FALLBACK
  // ============================================

  'default': {
    name: 'General Exercise',
    category: 'general',
    bodyPart: 'full-body',
    difficulty: 'beginner',
    image: 'https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    imageAlt: 'Person exercising',
    imageCredit: 'Pexels - Karolina Grabowska',
    youtubeId: null,
    youtubeTitle: null,
    youtubeChannel: null,
    instructions: [
      'Follow your physical therapist\'s instructions',
      'Move slowly and carefully',
      'Stop if you feel any sharp pain',
      'Maintain proper form throughout',
      'Breathe normally during exercises'
    ],
    conditions: ['general']
  }
};

/**
 * Get exercise resource by name with fuzzy matching
 */
function getExerciseResource(exerciseName) {
  if (!exerciseName) return ExerciseResources['default'];

  const normalized = exerciseName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  // Direct match
  if (ExerciseResources[normalized]) {
    return ExerciseResources[normalized];
  }

  // Partial match mapping for common variations
  const mappings = {
    'wrist range': 'wrist-range-of-motion',
    'wrist rom': 'wrist-range-of-motion',
    'wrist flex': 'wrist-flexion-stretch',
    'wrist ext': 'wrist-extension-stretch',
    'finger spread': 'finger-spreads',
    'finger': 'finger-spreads',
    'tendon glide': 'finger-tendon-glides',
    'forearm': 'forearm-rotation',
    'supination': 'forearm-rotation',
    'pronation': 'forearm-rotation',
    'grip': 'grip-strengthening',
    'squeeze': 'grip-strengthening',
    'thumb': 'thumb-opposition',
    'nerve glide': 'nerve-glides-median',
    'median nerve': 'nerve-glides-median',
    'elbow flex': 'elbow-flexion-extension',
    'tennis elbow': 'tennis-elbow-stretch',
    'lateral epicondyl': 'tennis-elbow-stretch',
    'golfer': 'golfers-elbow-stretch',
    'medial epicondyl': 'golfers-elbow-stretch',
    'eccentric': 'eccentric-wrist-extension',
    'pendulum': 'pendulum-swings',
    'codman': 'pendulum-swings',
    'shoulder flex': 'shoulder-flexion',
    'arm raise': 'shoulder-flexion',
    'shoulder abduct': 'shoulder-abduction',
    'side raise': 'shoulder-abduction',
    'external rotation': 'external-rotation-sidelying',
    'internal rotation': 'internal-rotation-stretch',
    'sleeper': 'internal-rotation-stretch',
    'scapular': 'scapular-squeezes',
    'shoulder blade': 'scapular-squeezes',
    'wall slide': 'wall-slides',
    'cross body': 'cross-body-stretch',
    'doorway': 'doorway-chest-stretch',
    'pec stretch': 'doorway-chest-stretch',
    'isometric shoulder': 'shoulder-isometric-exercises',
    'neck range': 'neck-range-of-motion',
    'neck rom': 'neck-range-of-motion',
    'chin tuck': 'chin-tucks',
    'cervical retract': 'chin-tucks',
    'levator': 'levator-scapulae-stretch',
    'upper trap': 'upper-trap-stretch',
    'trapezius': 'upper-trap-stretch',
    'isometric neck': 'isometric-neck-exercises',
    'pelvic tilt': 'pelvic-tilts',
    'knee to chest': 'knee-to-chest-stretch',
    'double knee': 'double-knee-to-chest',
    'cat cow': 'cat-cow-stretch',
    'cat-cow': 'cat-cow-stretch',
    'bird dog': 'bird-dog',
    'bird-dog': 'bird-dog',
    'bridge': 'bridges',
    'glute bridge': 'bridges',
    'press up': 'prone-press-up',
    'mckenzie': 'prone-press-up',
    'trunk rotation': 'lumbar-rotation-stretch',
    'lumbar rotation': 'lumbar-rotation-stretch',
    'dead bug': 'dead-bug',
    'child': 'child-pose',
    'childs': 'child-pose',
    'hip flexor': 'hip-flexor-stretch',
    'kneeling lunge': 'hip-flexor-stretch',
    'piriformis': 'piriformis-stretch',
    'figure 4': 'piriformis-stretch',
    'clamshell': 'clamshells',
    'clam': 'clamshells',
    'hip abduct': 'hip-abduction-sidelying',
    'side leg': 'hip-abduction-sidelying',
    'hip internal': 'hip-internal-rotation',
    'hip external': 'hip-external-rotation',
    'standing hip': 'standing-hip-flexion',
    'quad set': 'quad-sets',
    'straight leg raise': 'straight-leg-raises',
    'slr': 'straight-leg-raises',
    'heel slide': 'heel-slides',
    'terminal knee': 'terminal-knee-extension',
    'tke': 'terminal-knee-extension',
    'hamstring curl': 'hamstring-curls-standing',
    'hamstring stretch': 'hamstring-stretch-supine',
    'wall sit': 'wall-sits',
    'step up': 'step-ups',
    'ankle pump': 'ankle-pumps',
    'ankle circle': 'ankle-circles',
    'calf raise': 'calf-raises',
    'heel raise': 'calf-raises',
    'calf stretch': 'calf-stretch-wall',
    'towel scrunch': 'towel-scrunches',
    'toe curl': 'towel-scrunches',
    'inversion': 'ankle-inversion-eversion',
    'eversion': 'ankle-inversion-eversion',
    'single leg balance': 'balance-single-leg',
    'one leg balance': 'balance-single-leg',
    'plantar fascia': 'plantar-fascia-stretch',
    'arch stretch': 'plantar-fascia-stretch',
    'walk': 'walking',
    'walking': 'walking',
    'march': 'stationary-marching',
    'marching': 'stationary-marching',
    'squat': 'bodyweight-squats',
    'body weight squat': 'bodyweight-squats',
    'chair squat': 'chair-squats',
    'sit to stand': 'chair-squats',
    'sit-to-stand': 'chair-squats',
    'lunge': 'lunges',
    'morning stretch': 'morning-stretch',
    'stretch routine': 'gentle-stretching',
    'gentle stretch': 'gentle-stretching',
    'deep breath': 'deep-breathing',
    'diaphragm': 'deep-breathing',
    'belly breath': 'deep-breathing',
    'pursed lip': 'pursed-lip-breathing',
    'balance': 'balance-practice',
    'tandem': 'tandem-stance',
    'heel toe': 'heel-toe-walking',
    'tightrope': 'heel-toe-walking'
  };

  // Check partial matches
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key.replace(/\s+/g, '-')) ||
        exerciseName.toLowerCase().includes(key)) {
      return ExerciseResources[value];
    }
  }

  // Search by category/body part
  const exerciseArray = Object.values(ExerciseResources);
  const bodyPartMatch = exerciseArray.find(ex =>
    ex.bodyPart && normalized.includes(ex.bodyPart)
  );
  if (bodyPartMatch && bodyPartMatch.name !== 'General Exercise') {
    return bodyPartMatch;
  }

  return ExerciseResources['default'];
}

/**
 * Get all exercises for a specific condition
 */
function getExercisesForCondition(conditionId) {
  return Object.entries(ExerciseResources)
    .filter(([key, ex]) => ex.conditions && ex.conditions.includes(conditionId))
    .map(([key, ex]) => ({ id: key, ...ex }));
}

/**
 * Get all exercises for a body part
 */
function getExercisesForBodyPart(bodyPart) {
  return Object.entries(ExerciseResources)
    .filter(([key, ex]) => ex.bodyPart === bodyPart)
    .map(([key, ex]) => ({ id: key, ...ex }));
}

/**
 * Generate HTML for exercise display with embedded YouTube video modal
 */
function generateExerciseHTML(exerciseName, description) {
  const resource = getExerciseResource(exerciseName);
  const exerciseId = exerciseName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const uniqueId = `exercise-${exerciseId}-${Date.now()}`;

  return `
    <div class="exercise-resource" data-exercise="${exerciseId}">
      <div class="exercise-image-container">
        <img
          src="${resource.image}"
          alt="${resource.imageAlt}"
          class="exercise-image"
          loading="lazy"
          onerror="this.src='https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'; this.alt='Exercise demonstration';"
        >
        <p class="exercise-image-credit">${resource.imageCredit}</p>
      </div>

      <div class="exercise-instructions">
        <h4>How to do this exercise:</h4>
        <ol>
          ${resource.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <div class="exercise-actions">
        ${resource.youtubeId ? `
          <button class="btn btn-primary btn-sm video-play-btn" onclick="openVideoModal('${resource.youtubeId}', '${resource.youtubeTitle.replace(/'/g, "\\'")}', '${resource.youtubeChannel}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            Watch Video Tutorial
          </button>
          <p class="video-channel">by ${resource.youtubeChannel} on YouTube</p>
        ` : ''}
        <button class="btn btn-outline btn-sm" onclick="searchExercise('${resource.name} physical therapy exercise')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Find More
        </button>
      </div>
    </div>
  `;
}

/**
 * Open video modal with embedded YouTube player
 */
function openVideoModal(youtubeId, title, channel) {
  // Remove any existing modal
  const existingModal = document.getElementById('video-modal');
  if (existingModal) existingModal.remove();

  // Create modal HTML
  const modalHTML = `
    <div id="video-modal" class="video-modal-overlay" onclick="closeVideoModal(event)">
      <div class="video-modal-content" onclick="event.stopPropagation()">
        <div class="video-modal-header">
          <div>
            <h3>${title}</h3>
            <p class="video-channel">by ${channel}</p>
          </div>
          <button class="video-modal-close" onclick="closeVideoModal()">&times;</button>
        </div>
        <div class="video-container">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
            title="${title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="video-modal-footer">
          <a href="https://www.youtube.com/watch?v=${youtubeId}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Open on YouTube
          </a>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';
}

/**
 * Close video modal
 */
function closeVideoModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('video-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

/**
 * Open Google search for exercise
 */
function searchExercise(query) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.open(searchUrl, '_blank', 'noopener,noreferrer');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExerciseResources, getExerciseResource, getExercisesForCondition, getExercisesForBodyPart, generateExerciseHTML };
}

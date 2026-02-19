/**
 * Caribou Health - Exercise Illustration Library
 *
 * Professional wellness-style illustrations for physical therapy exercises.
 * Each illustration shows start and end positions with movement arrows.
 *
 * Style: Soft, warm colors matching modern wellness apps
 * - Skin tones: Warm peach (#E8C4A8, #D4A574)
 * - Clothing: Soft coral (#E8927C), teal (#4AA8A0)
 * - Arrows: Warm coral (#E67E5A) for movement direction
 * - Background: Soft cream/warm white
 */

const ExerciseIllustrations = {

  // ============================================
  // LOWER BODY EXERCISES
  // ============================================

  'quad-sets': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Mat/Floor -->
      <rect x="20" y="155" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- Figure lying on back -->
      <!-- Head -->
      <ellipse cx="60" cy="115" rx="22" ry="20" fill="url(#skinGrad)"/>
      <!-- Hair -->
      <ellipse cx="55" cy="100" rx="20" ry="12" fill="#8B6F5C"/>

      <!-- Torso/Upper body -->
      <ellipse cx="115" cy="125" rx="45" ry="22" fill="url(#clothingGrad)"/>

      <!-- Extended leg with shorts -->
      <rect x="155" y="115" width="80" height="25" rx="12" fill="url(#clothingGrad)"/>
      <path d="M230 125 L350 130" stroke="url(#skinGrad)" stroke-width="24" stroke-linecap="round" fill="none"/>

      <!-- Foot -->
      <ellipse cx="355" cy="130" rx="15" ry="10" fill="url(#skinGrad)"/>

      <!-- Knee area with engagement indicator -->
      <ellipse cx="270" cy="128" rx="25" ry="15" fill="#4AA8A0" opacity="0.25"/>

      <!-- Down arrow showing press -->
      <path d="M270 95 L270 115" stroke="#E67E5A" stroke-width="4" stroke-linecap="round"/>
      <polygon points="260,112 270,125 280,112" fill="#E67E5A"/>

      <!-- Curved arrow showing muscle engagement -->
      <path d="M295 105 Q310 100 315 115" stroke="#E67E5A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <polygon points="313,108 320,118 310,118" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Press back of knee firmly into mat • Hold 5 seconds • Relax • Repeat</text>
    </svg>
  `,

  'heel-slides': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Mat/Floor -->
      <rect x="20" y="155" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- POSITION 1 (Extended - faded) -->
      <g opacity="0.4">
        <!-- Head -->
        <ellipse cx="60" cy="118" rx="18" ry="16" fill="url(#skinGrad2)"/>
        <!-- Torso -->
        <ellipse cx="105" cy="128" rx="38" ry="18" fill="url(#clothingGrad2)"/>
        <!-- Extended leg -->
        <path d="M140 130 L280 145" stroke="url(#skinGrad2)" stroke-width="20" stroke-linecap="round"/>
        <ellipse cx="285" cy="148" rx="12" ry="8" fill="url(#skinGrad2)"/>
      </g>

      <!-- POSITION 2 (Bent - solid) -->
      <!-- Head -->
      <ellipse cx="60" cy="100" rx="20" ry="18" fill="url(#skinGrad2)"/>
      <ellipse cx="55" cy="88" rx="18" ry="10" fill="#8B6F5C"/>

      <!-- Torso -->
      <ellipse cx="110" cy="115" rx="42" ry="20" fill="url(#clothingGrad2)"/>

      <!-- Bent leg -->
      <path d="M148 118 Q200 55 220 95 L245 145" stroke="url(#skinGrad2)" stroke-width="22" stroke-linecap="round" fill="none"/>

      <!-- Foot on mat -->
      <ellipse cx="250" cy="150" rx="14" ry="8" fill="url(#skinGrad2)"/>

      <!-- Movement arrow (curved slide path) -->
      <path d="M285 148 C265 120 250 90 245 150" stroke="#E67E5A" stroke-width="3" fill="none" stroke-dasharray="8,4"/>
      <polygon points="248,145 240,155 252,155" fill="#E67E5A"/>

      <!-- Small directional arrows -->
      <path d="M320 130 L290 145" stroke="#E67E5A" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="295,141 285,148 293,150" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Slowly slide heel toward buttock • Return to start • Repeat 10-15 times</text>
    </svg>
  `,

  'straight-leg-raises': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Mat/Floor -->
      <rect x="20" y="160" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- Figure lying on back -->
      <!-- Head -->
      <ellipse cx="55" cy="125" rx="20" ry="18" fill="url(#skinGrad3)"/>
      <ellipse cx="50" cy="112" rx="18" ry="10" fill="#5C4A3D"/>

      <!-- Torso -->
      <ellipse cx="105" cy="135" rx="42" ry="20" fill="url(#clothingGrad3)"/>

      <!-- Resting leg (on mat) - faded -->
      <path d="M142 140 L300 155" stroke="url(#skinGrad3)" stroke-width="20" stroke-linecap="round" opacity="0.5"/>
      <ellipse cx="308" cy="157" rx="12" ry="8" fill="url(#skinGrad3)" opacity="0.5"/>

      <!-- Raised leg -->
      <path d="M148 130 L280 55" stroke="url(#skinGrad3)" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="288" cy="50" rx="13" ry="9" fill="url(#skinGrad3)" transform="rotate(-25 288 50)"/>

      <!-- Height indicator line -->
      <line x1="290" y1="155" x2="290" y2="55" stroke="#4AA8A0" stroke-width="1.5" stroke-dasharray="5,3"/>
      <text x="305" y="105" font-family="system-ui, sans-serif" font-size="11" fill="#4AA8A0" font-weight="600">6-8"</text>

      <!-- Movement arc arrow -->
      <path d="M240 155 A60 60 0 0 1 270 70" stroke="#E67E5A" stroke-width="3" fill="none"/>
      <polygon points="265,78 278,65 275,82" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Tighten thigh • Lift leg 6-8 inches • Hold 3-5 seconds • Lower slowly</text>
    </svg>
  `,

  'ankle-pumps': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
      </defs>

      <!-- Background circle for focus -->
      <circle cx="200" cy="100" r="85" fill="#F5F0EC" opacity="0.5"/>

      <!-- POSITION 1 - Foot pointed up (Dorsiflexion) -->
      <g transform="translate(-30, -20)">
        <!-- Lower leg -->
        <path d="M80 110 L175 110" stroke="url(#skinGrad4)" stroke-width="28" stroke-linecap="round"/>
        <!-- Ankle joint -->
        <circle cx="175" cy="110" r="14" fill="#E8C4A8" stroke="#D4A574" stroke-width="2"/>
        <!-- Foot pointing UP -->
        <path d="M175 110 L225 75" stroke="url(#skinGrad4)" stroke-width="22" stroke-linecap="round"/>
        <ellipse cx="230" cy="68" rx="18" ry="10" fill="url(#skinGrad4)" transform="rotate(-35 230 68)"/>

        <!-- UP label -->
        <text x="250" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#4AA8A0" font-weight="600">FLEX UP</text>
      </g>

      <!-- POSITION 2 - Foot pointed down (Plantarflexion) - faded -->
      <g transform="translate(30, 20)" opacity="0.45">
        <!-- Lower leg -->
        <path d="M80 110 L175 110" stroke="url(#skinGrad4)" stroke-width="28" stroke-linecap="round"/>
        <!-- Ankle joint -->
        <circle cx="175" cy="110" r="14" fill="#E8C4A8" stroke="#D4A574" stroke-width="2"/>
        <!-- Foot pointing DOWN -->
        <path d="M175 110 L235 145" stroke="url(#skinGrad4)" stroke-width="22" stroke-linecap="round"/>
        <ellipse cx="242" cy="150" rx="18" ry="10" fill="url(#skinGrad4)" transform="rotate(30 242 150)"/>

        <!-- DOWN label -->
        <text x="255" y="165" font-family="system-ui, sans-serif" font-size="12" fill="#D47E6A" font-weight="600">POINT DOWN</text>
      </g>

      <!-- Movement arrows (up and down) -->
      <path d="M290 65 C315 80 320 120 295 145" stroke="#E67E5A" stroke-width="3" fill="none"/>
      <polygon points="290,60 300,70 285,70" fill="#E67E5A"/>
      <polygon points="300,140 295,150 290,140" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Pump foot up and down • Move only at ankle • 10-20 repetitions per set</text>
    </svg>
  `,

  'ankle-alphabet': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Seated figure side view -->
      <!-- Chair suggestion -->
      <path d="M50 140 L50 170 M30 140 L90 140" stroke="#C4B8AC" stroke-width="4" fill="none"/>

      <!-- Torso on chair -->
      <ellipse cx="70" cy="100" rx="30" ry="35" fill="url(#clothingGrad5)"/>
      <!-- Head -->
      <ellipse cx="70" cy="50" rx="22" ry="20" fill="url(#skinGrad5)"/>
      <ellipse cx="65" cy="38" rx="20" ry="12" fill="#8B6F5C"/>

      <!-- Extended leg -->
      <path d="M95 130 L220 120" stroke="url(#skinGrad5)" stroke-width="24" stroke-linecap="round"/>

      <!-- Ankle -->
      <circle cx="220" cy="118" r="12" fill="#E8C4A8" stroke="#D4A574" stroke-width="2"/>

      <!-- Foot -->
      <path d="M220 118 L275 105" stroke="url(#skinGrad5)" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="282" cy="102" rx="15" ry="9" fill="url(#skinGrad5)" transform="rotate(-10 282 102)"/>

      <!-- Letters being traced with foot -->
      <text x="300" y="70" font-family="Georgia, serif" font-size="28" fill="#E67E5A" font-weight="bold">A</text>
      <text x="328" y="85" font-family="Georgia, serif" font-size="24" fill="#E67E5A" opacity="0.7">B</text>
      <text x="350" y="105" font-family="Georgia, serif" font-size="20" fill="#E67E5A" opacity="0.5">C</text>

      <!-- Circular motion indicator -->
      <ellipse cx="280" cy="115" rx="30" ry="20" fill="none" stroke="#E67E5A" stroke-width="2.5" stroke-dasharray="6,4"/>
      <polygon points="305,105 315,110 305,118" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Trace letters A through Z with your big toe • Move only at ankle joint</text>
    </svg>
  `,

  'calf-raises': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- Wall/support on left -->
      <rect x="30" y="30" width="10" height="145" fill="#D4CFC8"/>

      <!-- POSITION 1 - Flat feet (faded) -->
      <g transform="translate(80, 0)" opacity="0.4">
        <!-- Head -->
        <ellipse cx="50" cy="45" rx="18" ry="16" fill="url(#skinGrad6)"/>
        <!-- Torso -->
        <ellipse cx="50" cy="90" rx="22" ry="35" fill="url(#clothingGrad6)"/>
        <!-- Legs -->
        <path d="M42 125 L38 175" stroke="url(#skinGrad6)" stroke-width="16" stroke-linecap="round"/>
        <path d="M58 125 L62 175" stroke="url(#skinGrad6)" stroke-width="16" stroke-linecap="round"/>
        <!-- Feet flat -->
        <ellipse cx="38" cy="177" rx="15" ry="6" fill="url(#skinGrad6)"/>
        <ellipse cx="62" cy="177" rx="15" ry="6" fill="url(#skinGrad6)"/>
      </g>

      <!-- POSITION 2 - On tiptoes (solid) -->
      <g transform="translate(220, 0)">
        <!-- Head -->
        <ellipse cx="50" cy="35" rx="20" ry="18" fill="url(#skinGrad6)"/>
        <ellipse cx="45" cy="22" rx="18" ry="10" fill="#5C4A3D"/>
        <!-- Torso -->
        <ellipse cx="50" cy="82" rx="24" ry="38" fill="url(#clothingGrad6)"/>
        <!-- Arm reaching to wall -->
        <path d="M32 70 L-148 60" stroke="url(#skinGrad6)" stroke-width="10" stroke-linecap="round"/>
        <!-- Legs -->
        <path d="M40 118 L35 155" stroke="url(#skinGrad6)" stroke-width="18" stroke-linecap="round"/>
        <path d="M60 118 L65 155" stroke="url(#skinGrad6)" stroke-width="18" stroke-linecap="round"/>
        <!-- Raised heels - on toes -->
        <ellipse cx="35" cy="165" rx="12" ry="8" fill="url(#skinGrad6)"/>
        <ellipse cx="65" cy="165" rx="12" ry="8" fill="url(#skinGrad6)"/>
        <!-- Calf muscle highlight -->
        <ellipse cx="50" cy="140" rx="10" ry="18" fill="#4AA8A0" opacity="0.3"/>
      </g>

      <!-- Up arrow -->
      <path d="M335 160 L335 120" stroke="#E67E5A" stroke-width="3.5"/>
      <polygon points="325,128 335,110 345,128" fill="#E67E5A"/>

      <!-- Movement arrow between positions -->
      <path d="M160 120 L200 110" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="195,105 208,110 195,115" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Rise onto toes slowly • Hold 2-3 seconds • Lower with control • 10-15 reps</text>
    </svg>
  `,

  'balance-practice': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- Chair for safety (background) -->
      <g opacity="0.6">
        <rect x="300" y="100" width="70" height="75" rx="5" fill="#D4CFC8"/>
        <rect x="295" y="90" width="80" height="15" rx="3" fill="#C4B8AC"/>
        <text x="340" y="165" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#8B7F72">for safety</text>
      </g>

      <!-- Figure standing on one leg -->
      <!-- Head -->
      <ellipse cx="180" cy="35" rx="22" ry="20" fill="url(#skinGrad7)"/>
      <ellipse cx="175" cy="22" rx="20" ry="12" fill="#8B6F5C"/>

      <!-- Torso -->
      <ellipse cx="180" cy="85" rx="28" ry="40" fill="url(#clothingGrad7)"/>

      <!-- Arms out for balance -->
      <path d="M155 70 L95 55" stroke="url(#skinGrad7)" stroke-width="12" stroke-linecap="round"/>
      <path d="M205 70 L265 55" stroke="url(#skinGrad7)" stroke-width="12" stroke-linecap="round"/>
      <!-- Hands -->
      <circle cx="90" cy="52" r="8" fill="url(#skinGrad7)"/>
      <circle cx="270" cy="52" r="8" fill="url(#skinGrad7)"/>

      <!-- Standing leg -->
      <path d="M175 125 L175 175" stroke="url(#skinGrad7)" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="175" cy="177" rx="16" ry="7" fill="url(#skinGrad7)"/>

      <!-- Raised leg (bent) -->
      <path d="M190 125 Q230 130 235 155" stroke="url(#skinGrad7)" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="238" cy="160" rx="12" ry="8" fill="url(#skinGrad7)"/>

      <!-- Balance wobble indicators -->
      <path d="M85 45 Q78 38 88 38" stroke="#E67E5A" stroke-width="2" fill="none"/>
      <path d="M275 45 Q282 38 272 38" stroke="#E67E5A" stroke-width="2" fill="none"/>

      <!-- Timer indicator -->
      <circle cx="70" cy="100" r="25" fill="none" stroke="#4AA8A0" stroke-width="2"/>
      <text x="70" y="105" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4AA8A0" font-weight="bold">30s</text>

      <!-- Instruction text -->
      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Stand on one leg • Hold 30 seconds • Keep chair nearby for safety • Switch legs</text>
    </svg>
  `,

  'chair-squats': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- POSITION 1 - Seated (faded) -->
      <g transform="translate(40, 0)" opacity="0.45">
        <!-- Chair -->
        <rect x="30" y="110" width="65" height="55" rx="5" fill="#D4CFC8"/>
        <rect x="25" y="100" width="75" height="15" rx="3" fill="#C4B8AC"/>

        <!-- Seated figure -->
        <ellipse cx="65" cy="60" rx="18" ry="16" fill="url(#skinGrad8)"/>
        <ellipse cx="65" cy="95" rx="22" ry="28" fill="url(#clothingGrad8)"/>
        <!-- Bent legs -->
        <path d="M55 120 L45 170" stroke="url(#skinGrad8)" stroke-width="14" stroke-linecap="round"/>
        <path d="M75 120 L85 170" stroke="url(#skinGrad8)" stroke-width="14" stroke-linecap="round"/>
        <!-- Arms forward -->
        <path d="M50 85 L25 95" stroke="url(#skinGrad8)" stroke-width="8" stroke-linecap="round"/>
        <path d="M80 85 L105 95" stroke="url(#skinGrad8)" stroke-width="8" stroke-linecap="round"/>
      </g>

      <!-- POSITION 2 - Standing (solid) -->
      <g transform="translate(230, 0)">
        <!-- Chair behind -->
        <rect x="-30" y="110" width="65" height="55" rx="5" fill="#D4CFC8" opacity="0.3"/>

        <!-- Standing figure -->
        <ellipse cx="65" cy="35" rx="20" ry="18" fill="url(#skinGrad8)"/>
        <ellipse cx="60" cy="22" rx="18" ry="10" fill="#5C4A3D"/>
        <ellipse cx="65" cy="82" rx="24" ry="35" fill="url(#clothingGrad8)"/>
        <!-- Straight legs -->
        <path d="M55 115 L50 170" stroke="url(#skinGrad8)" stroke-width="16" stroke-linecap="round"/>
        <path d="M75 115 L80 170" stroke="url(#skinGrad8)" stroke-width="16" stroke-linecap="round"/>
        <!-- Feet -->
        <ellipse cx="50" cy="175" rx="14" ry="6" fill="url(#skinGrad8)"/>
        <ellipse cx="80" cy="175" rx="14" ry="6" fill="url(#skinGrad8)"/>
        <!-- Arms at sides -->
        <path d="M45 70 L30 100" stroke="url(#skinGrad8)" stroke-width="9" stroke-linecap="round"/>
        <path d="M85 70 L100 100" stroke="url(#skinGrad8)" stroke-width="9" stroke-linecap="round"/>
      </g>

      <!-- Movement arrow -->
      <path d="M155 95 C185 60 220 50 265 50" stroke="#E67E5A" stroke-width="3" fill="none"/>
      <polygon points="258,44 272,50 258,56" fill="#E67E5A"/>

      <!-- Up arrow -->
      <path d="M335 140 L335 80" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="325,90 335,70 345,90" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Sit to stand slowly • Use arms for balance if needed • 10 repetitions</text>
    </svg>
  `,

  // ============================================
  // BACK & CORE EXERCISES
  // ============================================

  'pelvic-tilts': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Mat/Floor -->
      <rect x="20" y="150" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- Figure lying with knees bent -->
      <!-- Head -->
      <ellipse cx="55" cy="105" rx="20" ry="18" fill="url(#skinGrad9)"/>
      <ellipse cx="50" cy="92" rx="18" ry="10" fill="#8B6F5C"/>

      <!-- Torso -->
      <ellipse cx="115" cy="120" rx="50" ry="22" fill="url(#clothingGrad9)"/>

      <!-- Lower back area with gap indication -->
      <path d="M90 140 Q110 130 130 140" stroke="#E67E5A" stroke-width="2" fill="none" stroke-dasharray="4,3"/>

      <!-- Bent legs -->
      <path d="M160 125 Q200 75 210 110 L230 148" stroke="url(#skinGrad9)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <path d="M165 130 Q195 85 205 115 L220 148" stroke="url(#skinGrad9)" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Feet -->
      <ellipse cx="235" cy="150" rx="14" ry="7" fill="url(#skinGrad9)"/>
      <ellipse cx="218" cy="150" rx="14" ry="7" fill="url(#skinGrad9)"/>

      <!-- Pelvis tilt indicator arrows -->
      <path d="M110 100 L110 118" stroke="#E67E5A" stroke-width="3.5"/>
      <polygon points="102,115 110,125 118,115" fill="#E67E5A"/>

      <!-- Curved arrow showing the tilt motion -->
      <path d="M75 140 Q85 125 95 138" stroke="#E67E5A" stroke-width="2.5" fill="none"/>
      <polygon points="92,133 100,140 90,142" fill="#E67E5A"/>

      <!-- Core engagement highlight -->
      <ellipse cx="110" cy="120" rx="30" ry="12" fill="#4AA8A0" opacity="0.2"/>

      <!-- Instruction text -->
      <text x="200" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Flatten lower back against mat • Engage abs • Hold 5 seconds • Relax</text>
    </svg>
  `,

  'knee-to-chest-stretch': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad10" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad10" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Mat/Floor -->
      <rect x="20" y="155" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- Figure lying on back -->
      <!-- Head -->
      <ellipse cx="55" cy="105" rx="20" ry="18" fill="url(#skinGrad10)"/>
      <ellipse cx="50" cy="92" rx="18" ry="10" fill="#5C4A3D"/>

      <!-- Torso -->
      <ellipse cx="115" cy="120" rx="50" ry="22" fill="url(#clothingGrad10)"/>

      <!-- Flat leg -->
      <path d="M160 130 L320 150" stroke="url(#skinGrad10)" stroke-width="20" stroke-linecap="round" opacity="0.6"/>
      <ellipse cx="328" cy="152" rx="13" ry="8" fill="url(#skinGrad10)" opacity="0.6"/>

      <!-- Pulled up knee -->
      <path d="M155 115 Q180 55 170 80" stroke="url(#skinGrad10)" stroke-width="20" stroke-linecap="round"/>
      <!-- Thigh bent toward chest -->
      <ellipse cx="172" cy="70" rx="16" ry="14" fill="url(#skinGrad10)"/>

      <!-- Lower leg of pulled knee -->
      <path d="M172 70 L155 95" stroke="url(#skinGrad10)" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="152" cy="100" rx="10" ry="7" fill="url(#skinGrad10)"/>

      <!-- Arms holding knee -->
      <path d="M95 105 Q130 60 165 72" stroke="url(#skinGrad10)" stroke-width="10" stroke-linecap="round"/>
      <path d="M100 115 Q140 75 168 78" stroke="url(#skinGrad10)" stroke-width="10" stroke-linecap="round"/>

      <!-- Hands clasped on knee -->
      <ellipse cx="168" cy="75" rx="12" ry="10" fill="url(#skinGrad10)"/>

      <!-- Pull direction arrow -->
      <path d="M200 65 L175 80" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="180,75 170,82 178,85" fill="#E67E5A"/>

      <!-- Stretch indication in lower back -->
      <ellipse cx="100" cy="130" rx="25" ry="10" fill="#4AA8A0" opacity="0.25"/>

      <!-- Instruction text -->
      <text x="200" y="182" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Gently pull knee toward chest • Hold 30 seconds • Feel stretch in lower back • Switch legs</text>
    </svg>
  `,

  'cat-cow-stretch': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad11" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad11" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="165" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- CAT POSITION (arched back - left side) -->
      <g transform="translate(10, 0)">
        <!-- Back arched UP (cat) -->
        <path d="M60 110 Q115 60 170 110" stroke="url(#clothingGrad11)" stroke-width="24" fill="none" stroke-linecap="round"/>

        <!-- Head tucked down -->
        <ellipse cx="55" cy="125" rx="16" ry="14" fill="url(#skinGrad11)"/>
        <ellipse cx="50" cy="115" rx="14" ry="8" fill="#8B6F5C"/>

        <!-- Arms -->
        <path d="M70 115 L65 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>
        <path d="M85 120 L80 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>

        <!-- Legs -->
        <path d="M155 115 L150 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>
        <path d="M170 115 L165 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>

        <!-- Arch up indicator -->
        <path d="M115 55 L115 40" stroke="#E67E5A" stroke-width="3"/>
        <polygon points="107,48 115,35 123,48" fill="#E67E5A"/>

        <text x="115" y="30" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#E67E5A" font-weight="600">CAT</text>
      </g>

      <!-- COW POSITION (swayed back - right side) -->
      <g transform="translate(195, 0)">
        <!-- Back swayed DOWN (cow) -->
        <path d="M60 95 Q115 130 170 95" stroke="url(#clothingGrad11)" stroke-width="24" fill="none" stroke-linecap="round"/>

        <!-- Head lifted up -->
        <ellipse cx="55" cy="85" rx="16" ry="14" fill="url(#skinGrad11)"/>
        <ellipse cx="50" cy="75" rx="14" ry="8" fill="#8B6F5C"/>

        <!-- Arms -->
        <path d="M70 100 L65 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>
        <path d="M85 102 L80 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>

        <!-- Legs -->
        <path d="M155 100 L150 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>
        <path d="M170 98 L165 160" stroke="url(#skinGrad11)" stroke-width="12" stroke-linecap="round"/>

        <!-- Sway down indicator -->
        <path d="M115 130 L115 145" stroke="#4AA8A0" stroke-width="3"/>
        <polygon points="107,138 115,150 123,138" fill="#4AA8A0"/>

        <text x="115" y="160" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#4AA8A0" font-weight="600">COW</text>
      </g>

      <!-- Arrow between positions -->
      <path d="M178 100 L210 100" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="205,95 215,100 205,105" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="190" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">On hands and knees • Alternate arching up (cat) and down (cow) • Breathe slowly</text>
    </svg>
  `,

  'bird-dog': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad12" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad12" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="165" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- Figure on hands and knees -->
      <!-- Torso (horizontal) -->
      <path d="M130 95 L260 95" stroke="url(#clothingGrad12)" stroke-width="28" fill="none" stroke-linecap="round"/>

      <!-- Head looking forward -->
      <ellipse cx="125" cy="80" rx="18" ry="16" fill="url(#skinGrad12)"/>
      <ellipse cx="118" cy="70" rx="16" ry="9" fill="#5C4A3D"/>

      <!-- Supporting arm (left) -->
      <path d="M145 95 L140 160" stroke="url(#skinGrad12)" stroke-width="14" stroke-linecap="round"/>

      <!-- Extended arm (right - reaching forward) -->
      <path d="M140 90 L60 60" stroke="url(#skinGrad12)" stroke-width="14" stroke-linecap="round"/>
      <circle cx="52" cy="56" r="8" fill="url(#skinGrad12)"/>

      <!-- Supporting leg (right) -->
      <path d="M245 95 L250 160" stroke="url(#skinGrad12)" stroke-width="14" stroke-linecap="round"/>

      <!-- Extended leg (left - reaching back) -->
      <path d="M260 98 L350 70" stroke="url(#skinGrad12)" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="358" cy="68" rx="12" ry="8" fill="url(#skinGrad12)" transform="rotate(-15 358 68)"/>

      <!-- Balance/alignment line -->
      <line x1="60" y1="60" x2="350" y2="70" stroke="#4AA8A0" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>

      <!-- Extension arrows -->
      <path d="M50 45 L40 35" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="45,40 35,30 50,35" fill="#E67E5A"/>

      <path d="M355 55 L365 45" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="360,50 370,40 365,55" fill="#E67E5A"/>

      <!-- Core highlight -->
      <ellipse cx="200" cy="95" rx="40" ry="12" fill="#4AA8A0" opacity="0.15"/>

      <!-- Instruction text -->
      <text x="200" y="190" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Extend opposite arm and leg • Keep back flat • Hold 5 seconds • Switch sides</text>
    </svg>
  `,

  // ============================================
  // SHOULDER EXERCISES
  // ============================================

  'pendulum-swings': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad13" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad13" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- Table/support surface -->
      <rect x="30" y="55" width="100" height="10" rx="3" fill="#C4B8AC"/>
      <rect x="35" y="65" width="10" height="110" fill="#D4CFC8"/>
      <rect x="115" y="65" width="10" height="110" fill="#D4CFC8"/>

      <!-- Figure leaning on table -->
      <!-- Head looking down -->
      <ellipse cx="145" cy="65" rx="18" ry="16" fill="url(#skinGrad13)"/>
      <ellipse cx="140" cy="55" rx="16" ry="9" fill="#8B6F5C"/>

      <!-- Torso bent forward -->
      <ellipse cx="175" cy="90" rx="35" ry="25" fill="url(#clothingGrad13)" transform="rotate(25 175 90)"/>

      <!-- Supporting arm on table -->
      <path d="M145 75 L95 60" stroke="url(#skinGrad13)" stroke-width="12" stroke-linecap="round"/>
      <circle cx="90" cy="58" r="7" fill="url(#skinGrad13)"/>

      <!-- Hanging/swinging arm - multiple positions -->
      <path d="M200 95 L190 155" stroke="url(#skinGrad13)" stroke-width="12" stroke-linecap="round" opacity="0.35"/>
      <path d="M200 95 L215 150" stroke="url(#skinGrad13)" stroke-width="12" stroke-linecap="round"/>
      <path d="M200 95 L240 145" stroke="url(#skinGrad13)" stroke-width="12" stroke-linecap="round" opacity="0.35"/>

      <!-- Hand positions -->
      <circle cx="188" cy="160" r="7" fill="url(#skinGrad13)" opacity="0.35"/>
      <circle cx="218" cy="155" r="8" fill="url(#skinGrad13)"/>
      <circle cx="245" cy="148" r="7" fill="url(#skinGrad13)" opacity="0.35"/>

      <!-- Circular motion indicator -->
      <ellipse cx="215" cy="150" rx="35" ry="18" fill="none" stroke="#E67E5A" stroke-width="2.5" stroke-dasharray="6,4"/>
      <polygon points="245,140 255,148 245,155" fill="#E67E5A"/>

      <!-- Legs (standing) -->
      <path d="M185 115 L175 175" stroke="url(#skinGrad13)" stroke-width="14" stroke-linecap="round"/>
      <path d="M195 115 L200 175" stroke="url(#skinGrad13)" stroke-width="14" stroke-linecap="round"/>

      <!-- Instruction text -->
      <text x="280" y="70" font-family="system-ui, sans-serif" font-size="11" fill="#6B5B4F">Let arm</text>
      <text x="280" y="85" font-family="system-ui, sans-serif" font-size="11" fill="#6B5B4F">hang and</text>
      <text x="280" y="100" font-family="system-ui, sans-serif" font-size="11" fill="#6B5B4F">swing gently</text>

      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Lean on table • Let arm hang • Small circles • 1-2 minutes each direction</text>
    </svg>
  `,

  'scapular-squeezes': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad14" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad14" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Figure - back view -->
      <!-- Head -->
      <ellipse cx="200" cy="35" rx="22" ry="20" fill="url(#skinGrad14)"/>
      <!-- Neck -->
      <rect x="190" y="50" width="20" height="15" fill="url(#skinGrad14)"/>

      <!-- Upper back/shoulders (trapeziodal shape) -->
      <path d="M130 65 Q200 55 270 65 L280 140 Q200 150 120 140 Z" fill="url(#clothingGrad14)"/>

      <!-- Shoulder blades highlighted -->
      <ellipse cx="165" cy="100" rx="20" ry="30" fill="#4AA8A0" opacity="0.35" stroke="#3D918A" stroke-width="2"/>
      <ellipse cx="235" cy="100" rx="20" ry="30" fill="#4AA8A0" opacity="0.35" stroke="#3D918A" stroke-width="2"/>

      <!-- Squeeze arrows pointing inward -->
      <path d="M125 100 L155 100" stroke="#E67E5A" stroke-width="3.5"/>
      <polygon points="150,93 162,100 150,107" fill="#E67E5A"/>

      <path d="M275 100 L245 100" stroke="#E67E5A" stroke-width="3.5"/>
      <polygon points="250,93 238,100 250,107" fill="#E67E5A"/>

      <!-- Arms at sides -->
      <path d="M135 70 L105 125" stroke="url(#skinGrad14)" stroke-width="14" stroke-linecap="round"/>
      <path d="M265 70 L295 125" stroke="url(#skinGrad14)" stroke-width="14" stroke-linecap="round"/>

      <!-- Hands -->
      <circle cx="100" cy="130" r="9" fill="url(#skinGrad14)"/>
      <circle cx="300" cy="130" r="9" fill="url(#skinGrad14)"/>

      <!-- Center squeeze indication -->
      <path d="M190 100 L210 100" stroke="#3D918A" stroke-width="2" stroke-dasharray="3,2"/>

      <!-- Instruction text -->
      <text x="200" y="175" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Squeeze shoulder blades together • Hold 5 seconds • Relax • 10-15 repetitions</text>
    </svg>
  `,

  'wall-slides': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad15" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad15" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Wall -->
      <rect x="30" y="15" width="20" height="170" fill="#D4CFC8"/>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- POSITION 1 - Arms down (faded) -->
      <g transform="translate(80, 0)" opacity="0.4">
        <!-- Head -->
        <ellipse cx="50" cy="50" rx="16" ry="14" fill="url(#skinGrad15)"/>
        <!-- Torso -->
        <ellipse cx="50" cy="95" rx="20" ry="35" fill="url(#clothingGrad15)"/>
        <!-- Arms in low position -->
        <path d="M35 75 L-25 95" stroke="url(#skinGrad15)" stroke-width="10" stroke-linecap="round"/>
        <path d="M65 75 L75 100" stroke="url(#skinGrad15)" stroke-width="10" stroke-linecap="round"/>
        <!-- Legs -->
        <path d="M42 130 L38 175" stroke="url(#skinGrad15)" stroke-width="12" stroke-linecap="round"/>
        <path d="M58 130 L62 175" stroke="url(#skinGrad15)" stroke-width="12" stroke-linecap="round"/>
      </g>

      <!-- POSITION 2 - Arms up (solid) -->
      <g transform="translate(220, 0)">
        <!-- Head -->
        <ellipse cx="50" cy="50" rx="18" ry="16" fill="url(#skinGrad15)"/>
        <ellipse cx="45" cy="38" rx="16" ry="9" fill="#8B6F5C"/>
        <!-- Torso against wall -->
        <ellipse cx="50" cy="100" rx="22" ry="40" fill="url(#clothingGrad15)"/>
        <!-- Arms in high "goal post" position -->
        <path d="M32 70 L-165 30" stroke="url(#skinGrad15)" stroke-width="12" stroke-linecap="round"/>
        <path d="M68 70 L80 40" stroke="url(#skinGrad15)" stroke-width="12" stroke-linecap="round"/>
        <!-- Forearms against wall -->
        <path d="M-165 30 L-168 60" stroke="url(#skinGrad15)" stroke-width="10" stroke-linecap="round"/>
        <path d="M80 40 L85 70" stroke="url(#skinGrad15)" stroke-width="10" stroke-linecap="round"/>
        <!-- Hands -->
        <circle cx="-170" cy="65" r="7" fill="url(#skinGrad15)"/>
        <circle cx="87" cy="75" r="7" fill="url(#skinGrad15)"/>
        <!-- Legs -->
        <path d="M40 140 L35 175" stroke="url(#skinGrad15)" stroke-width="14" stroke-linecap="round"/>
        <path d="M60 140 L65 175" stroke="url(#skinGrad15)" stroke-width="14" stroke-linecap="round"/>

        <!-- Contact points with wall -->
        <circle cx="-168" cy="45" r="4" fill="#4AA8A0"/>
        <circle cx="-170" cy="100" r="4" fill="#4AA8A0"/>
      </g>

      <!-- Up/down movement arrows -->
      <path d="M340 130 L340 60" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="330,70 340,50 350,70" fill="#E67E5A"/>
      <path d="M340 140 L340 160" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="330,155 340,170 350,155" fill="#E67E5A"/>

      <!-- Instruction text -->
      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Back against wall • Slide arms up and down • Keep contact with wall • 10-15 reps</text>
    </svg>
  `,

  'passive-external-rotation': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad16" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad16" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Figure - front view, upper body -->
      <!-- Head -->
      <ellipse cx="200" cy="40" rx="24" ry="22" fill="url(#skinGrad16)"/>
      <ellipse cx="193" cy="25" rx="22" ry="12" fill="#5C4A3D"/>

      <!-- Torso -->
      <ellipse cx="200" cy="100" rx="45" ry="50" fill="url(#clothingGrad16)"/>

      <!-- Affected arm - bent at elbow, rotating outward -->
      <!-- Upper arm against body -->
      <path d="M245 85 L280 85" stroke="url(#skinGrad16)" stroke-width="16" stroke-linecap="round"/>

      <!-- Elbow -->
      <circle cx="280" cy="85" r="8" fill="#E8C4A8"/>

      <!-- Forearm - starting position (faded) -->
      <path d="M280 85 L280 120" stroke="url(#skinGrad16)" stroke-width="14" stroke-linecap="round" opacity="0.35"/>
      <circle cx="280" cy="125" r="7" fill="url(#skinGrad16)" opacity="0.35"/>

      <!-- Forearm - rotated outward position -->
      <path d="M280 85 L340 55" stroke="url(#skinGrad16)" stroke-width="14" stroke-linecap="round"/>
      <circle cx="345" cy="52" r="8" fill="url(#skinGrad16)"/>

      <!-- Other arm (assisting) -->
      <path d="M155 85 L100 100" stroke="url(#skinGrad16)" stroke-width="14" stroke-linecap="round"/>
      <path d="M100 100 Q150 90 280 85" stroke="url(#skinGrad16)" stroke-width="8" fill="none" stroke-dasharray="5,3" opacity="0.5"/>
      <circle cx="95" cy="102" r="8" fill="url(#skinGrad16)"/>

      <!-- Rotation arc -->
      <path d="M295 115 A35 35 0 0 1 335 65" stroke="#E67E5A" stroke-width="3" fill="none"/>
      <polygon points="330,72 342,60 338,75" fill="#E67E5A"/>

      <!-- 90 degree indicator -->
      <rect x="275" y="80" width="12" height="12" fill="none" stroke="#4AA8A0" stroke-width="1.5"/>

      <!-- Instruction text -->
      <text x="200" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Keep elbow at side • Use other hand to assist • Rotate forearm outward slowly</text>
    </svg>
  `,

  // ============================================
  // BREATHING & RELAXATION
  // ============================================

  'deep-breathing': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad17" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad17" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
      </defs>

      <!-- Soft background glow -->
      <ellipse cx="200" cy="100" rx="120" ry="80" fill="#F5F0EC" opacity="0.5"/>

      <!-- Seated figure (cross-legged meditation pose) -->
      <!-- Head -->
      <ellipse cx="200" cy="45" rx="26" ry="24" fill="url(#skinGrad17)"/>
      <ellipse cx="193" cy="30" rx="24" ry="14" fill="#8B6F5C"/>

      <!-- Peaceful face -->
      <path d="M188 42 Q193 46 198 42" stroke="#8B6F5C" stroke-width="2" fill="none"/>
      <path d="M202 42 Q207 46 212 42" stroke="#8B6F5C" stroke-width="2" fill="none"/>
      <path d="M192 55 Q200 60 208 55" stroke="#8B6F5C" stroke-width="1.5" fill="none"/>

      <!-- Torso -->
      <ellipse cx="200" cy="100" rx="40" ry="45" fill="url(#clothingGrad17)"/>

      <!-- Hands on belly -->
      <ellipse cx="200" cy="115" rx="25" ry="12" fill="url(#skinGrad17)"/>

      <!-- Arms -->
      <path d="M165 90 L175 115" stroke="url(#skinGrad17)" stroke-width="14" stroke-linecap="round"/>
      <path d="M235 90 L225 115" stroke="url(#skinGrad17)" stroke-width="14" stroke-linecap="round"/>

      <!-- Cross-legged position hint -->
      <path d="M165 140 Q200 160 235 140" stroke="url(#skinGrad17)" stroke-width="20" fill="none" stroke-linecap="round"/>

      <!-- Belly expansion rings (breathing indication) -->
      <ellipse cx="200" cy="105" rx="35" ry="25" fill="none" stroke="#4AA8A0" stroke-width="2" stroke-dasharray="5,3" opacity="0.5"/>
      <ellipse cx="200" cy="105" rx="45" ry="32" fill="none" stroke="#4AA8A0" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.3"/>

      <!-- Breath in arrow -->
      <g transform="translate(290, 55)">
        <path d="M0 30 L0 10" stroke="#E67E5A" stroke-width="3"/>
        <polygon points="-8,15 0,0 8,15" fill="#E67E5A"/>
        <text x="0" y="48" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#E67E5A" font-weight="600">INHALE</text>
        <text x="0" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#E67E5A">4 seconds</text>
      </g>

      <!-- Breath out arrow -->
      <g transform="translate(290, 115)">
        <path d="M0 0 L0 20" stroke="#4AA8A0" stroke-width="3"/>
        <polygon points="-8,15 0,30 8,15" fill="#4AA8A0"/>
        <text x="0" y="48" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#4AA8A0" font-weight="600">EXHALE</text>
        <text x="0" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#4AA8A0">6 seconds</text>
      </g>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Breathe in through nose (4 sec) • Exhale slowly through mouth (6 sec) • Repeat 5-10 times</text>
    </svg>
  `,

  'stretching-routine': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad18" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad18" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5FBFB8"/>
          <stop offset="100%" style="stop-color:#4AA8A0"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="175" width="360" height="8" rx="4" fill="#E8E4E0"/>

      <!-- Standing figure reaching up -->
      <!-- Head looking up -->
      <ellipse cx="200" cy="45" rx="22" ry="20" fill="url(#skinGrad18)"/>
      <ellipse cx="193" cy="32" rx="20" ry="11" fill="#5C4A3D"/>

      <!-- Torso -->
      <ellipse cx="200" cy="100" rx="28" ry="45" fill="url(#clothingGrad18)"/>

      <!-- Arms reaching up and out -->
      <path d="M175 70 L130 25" stroke="url(#skinGrad18)" stroke-width="14" stroke-linecap="round"/>
      <path d="M225 70 L270 25" stroke="url(#skinGrad18)" stroke-width="14" stroke-linecap="round"/>

      <!-- Hands -->
      <circle cx="125" cy="20" r="9" fill="url(#skinGrad18)"/>
      <circle cx="275" cy="20" r="9" fill="url(#skinGrad18)"/>

      <!-- Legs -->
      <path d="M190 145 L180 175" stroke="url(#skinGrad18)" stroke-width="16" stroke-linecap="round"/>
      <path d="M210 145 L220 175" stroke="url(#skinGrad18)" stroke-width="16" stroke-linecap="round"/>

      <!-- Stretch arrows pointing up and out -->
      <path d="M125 20 L110 5" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="115,10 105,0 120,5" fill="#E67E5A"/>

      <path d="M275 20 L290 5" stroke="#E67E5A" stroke-width="2.5"/>
      <polygon points="285,10 295,0 280,5" fill="#E67E5A"/>

      <!-- Body lengthening arrows -->
      <path d="M200 55 L200 35" stroke="#E67E5A" stroke-width="2" stroke-dasharray="4,2"/>

      <!-- Side stretch hints -->
      <path d="M310 80 Q330 90 320 110" stroke="#E67E5A" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
      <path d="M90 80 Q70 90 80 110" stroke="#E67E5A" stroke-width="2" fill="none" stroke-dasharray="4,2"/>

      <!-- Instruction text -->
      <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Reach tall through fingertips • Hold each stretch 15-30 seconds • Breathe deeply</text>
    </svg>
  `,

  'morning-walk': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad19" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
        <linearGradient id="clothingGrad19" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8927C"/>
          <stop offset="100%" style="stop-color:#D47E6A"/>
        </linearGradient>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FEF3E2"/>
          <stop offset="100%" style="stop-color:#F5E6D3"/>
        </linearGradient>
      </defs>

      <!-- Sky background -->
      <rect x="0" y="0" width="400" height="145" fill="url(#skyGrad)"/>

      <!-- Sun -->
      <circle cx="330" cy="45" r="25" fill="#FFD93D" opacity="0.9"/>
      <g stroke="#FFD93D" stroke-width="3" opacity="0.6">
        <line x1="330" y1="10" x2="330" y2="0"/>
        <line x1="355" y1="25" x2="365" y2="15"/>
        <line x1="365" y1="45" x2="375" y2="45"/>
        <line x1="355" y1="65" x2="365" y2="75"/>
      </g>

      <!-- Ground/path -->
      <path d="M0 145 Q100 140 200 145 Q300 150 400 145 L400 200 L0 200 Z" fill="#E8E4E0"/>
      <path d="M0 155 Q100 150 200 155 Q300 160 400 155" fill="none" stroke="#D4CFC8" stroke-width="2"/>

      <!-- Trees/nature suggestion (background) -->
      <ellipse cx="50" cy="120" rx="30" ry="35" fill="#8FBC8F" opacity="0.4"/>
      <ellipse cx="370" cy="115" rx="25" ry="30" fill="#8FBC8F" opacity="0.3"/>

      <!-- Walking figure -->
      <!-- Head -->
      <ellipse cx="180" cy="65" rx="18" ry="16" fill="url(#skinGrad19)"/>
      <ellipse cx="175" cy="54" rx="16" ry="9" fill="#8B6F5C"/>

      <!-- Slight smile -->
      <path d="M175 72 Q180 76 185 72" stroke="#8B6F5C" stroke-width="1.5" fill="none"/>

      <!-- Torso -->
      <ellipse cx="180" cy="105" rx="22" ry="30" fill="url(#clothingGrad19)"/>

      <!-- Arms swinging (walking motion) -->
      <path d="M160 95 L140 115" stroke="url(#skinGrad19)" stroke-width="10" stroke-linecap="round"/>
      <path d="M200 95 L215 80" stroke="url(#skinGrad19)" stroke-width="10" stroke-linecap="round"/>

      <!-- Legs walking -->
      <path d="M172 135 L155 170" stroke="url(#skinGrad19)" stroke-width="12" stroke-linecap="round"/>
      <path d="M188 135 L210 165" stroke="url(#skinGrad19)" stroke-width="12" stroke-linecap="round"/>

      <!-- Feet -->
      <ellipse cx="152" cy="173" rx="12" ry="6" fill="url(#skinGrad19)"/>
      <ellipse cx="215" cy="168" rx="12" ry="6" fill="url(#skinGrad19)"/>

      <!-- Motion lines -->
      <path d="M125 95 L115 95" stroke="#C4B8AC" stroke-width="2" opacity="0.5"/>
      <path d="M120 105 L108 105" stroke="#C4B8AC" stroke-width="2" opacity="0.4"/>
      <path d="M125 115 L115 115" stroke="#C4B8AC" stroke-width="2" opacity="0.3"/>

      <!-- Timer badge -->
      <g transform="translate(280, 90)">
        <rect x="0" y="0" width="70" height="28" rx="14" fill="#4AA8A0" opacity="0.9"/>
        <text x="35" y="19" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="white" font-weight="600">15-20 min</text>
      </g>

      <!-- Instruction text -->
      <text x="200" y="192" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Walk at comfortable pace • Stay relaxed • Swing arms naturally • Breathe easily</text>
    </svg>
  `,

  // ============================================
  // HAND & WRIST EXERCISES
  // ============================================

  'hand-exercises': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad20" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
      </defs>

      <!-- POSITION 1 - Hand open (left) -->
      <g transform="translate(50, 25)">
        <!-- Palm -->
        <ellipse cx="60" cy="95" rx="35" ry="45" fill="url(#skinGrad20)"/>
        <!-- Fingers spread -->
        <path d="M35 55 L25 15" stroke="url(#skinGrad20)" stroke-width="14" stroke-linecap="round"/>
        <path d="M50 45 L45 0" stroke="url(#skinGrad20)" stroke-width="14" stroke-linecap="round"/>
        <path d="M70 45 L75 0" stroke="url(#skinGrad20)" stroke-width="14" stroke-linecap="round"/>
        <path d="M88 55 L100 20" stroke="url(#skinGrad20)" stroke-width="14" stroke-linecap="round"/>
        <!-- Thumb -->
        <path d="M30 85 L5 70" stroke="url(#skinGrad20)" stroke-width="14" stroke-linecap="round"/>

        <!-- Spread indicators -->
        <path d="M25 10 L20 0" stroke="#E67E5A" stroke-width="2"/>
        <path d="M45 -5 L45 -15" stroke="#E67E5A" stroke-width="2"/>
        <path d="M75 -5 L75 -15" stroke="#E67E5A" stroke-width="2"/>
        <path d="M100 15 L110 5" stroke="#E67E5A" stroke-width="2"/>

        <text x="60" y="155" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#4AA8A0" font-weight="600">OPEN</text>
      </g>

      <!-- Arrow between -->
      <path d="M170 100 L200 100" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="195,93 210,100 195,107" fill="#E67E5A"/>
      <path d="M230 100 L200 100" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="205,93 190,100 205,107" fill="#E67E5A"/>

      <!-- POSITION 2 - Fist closed (right) -->
      <g transform="translate(240, 35)">
        <!-- Fist -->
        <ellipse cx="60" cy="75" rx="40" ry="35" fill="url(#skinGrad20)"/>
        <!-- Curled fingers on top -->
        <path d="M30 55 Q60 40 90 55" stroke="#D4A574" stroke-width="3" fill="none"/>
        <path d="M35 65 Q60 52 85 65" stroke="#D4A574" stroke-width="2" fill="none"/>
        <!-- Thumb wrapped -->
        <ellipse cx="25" cy="85" rx="15" ry="12" fill="url(#skinGrad20)"/>

        <text x="60" y="135" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#D47E6A" font-weight="600">CLOSE</text>
      </g>

      <!-- Instruction text -->
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Spread fingers wide • Make tight fist • Alternate slowly • 10-15 repetitions</text>
    </svg>
  `,

  'towel-scrunches': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad21" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5D5C0"/>
          <stop offset="100%" style="stop-color:#E8C4A8"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <rect x="20" y="150" width="360" height="12" rx="6" fill="#E8E4E0"/>

      <!-- Towel on floor -->
      <path d="M80 148 Q150 142 220 148 Q290 155 340 148" stroke="#A8C4C0" stroke-width="8" fill="none" stroke-linecap="round"/>
      <rect x="70" y="140" width="280" height="12" rx="3" fill="#B8D4D0" opacity="0.6"/>

      <!-- Lower leg and foot -->
      <path d="M170 60 L170 125" stroke="url(#skinGrad21)" stroke-width="28" stroke-linecap="round"/>

      <!-- Foot on towel -->
      <ellipse cx="200" cy="138" rx="45" ry="15" fill="url(#skinGrad21)"/>

      <!-- Toes gripping (curled) -->
      <path d="M220 132 Q225 128 228 132" stroke="#D4A574" stroke-width="3" fill="none"/>
      <path d="M232 130 Q238 126 242 130" stroke="#D4A574" stroke-width="3" fill="none"/>
      <path d="M245 132 Q250 128 252 133" stroke="#D4A574" stroke-width="3" fill="none"/>

      <!-- Scrunch arrows showing towel gathering -->
      <path d="M320 145 L265 145" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="272,138 258,145 272,152" fill="#E67E5A"/>

      <path d="M90 145 L140 145" stroke="#E67E5A" stroke-width="3"/>
      <polygon points="133,138 147,145 133,152" fill="#E67E5A"/>

      <!-- Gathered towel indication -->
      <path d="M195 145 Q205 138 215 145 Q225 152 235 145" stroke="#A8C4C0" stroke-width="4" fill="none"/>

      <!-- Instruction text -->
      <text x="200" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#6B5B4F" font-weight="500">Place towel under foot • Scrunch towel with toes • Repeat 15-20 times</text>
    </svg>
  `,

  // ============================================
  // DEFAULT / GENERIC
  // ============================================

  'default': `
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F5F0EC"/>
          <stop offset="100%" style="stop-color:#EDE8E4"/>
        </linearGradient>
      </defs>

      <!-- Background circle -->
      <circle cx="200" cy="90" r="70" fill="url(#bgGrad)"/>
      <circle cx="200" cy="90" r="55" fill="#E8E4E0" opacity="0.5"/>

      <!-- Exercise icon (dumbbell) -->
      <g transform="translate(140, 65)">
        <rect x="0" y="15" width="20" height="22" rx="4" fill="#4AA8A0"/>
        <rect x="100" y="15" width="20" height="22" rx="4" fill="#4AA8A0"/>
        <rect x="18" y="20" width="84" height="12" rx="3" fill="#5FBFB8"/>
      </g>

      <!-- Motion indicators -->
      <g stroke="#E67E5A" stroke-width="2.5" stroke-linecap="round">
        <path d="M115 55 L105 45"/>
        <path d="M105 65 L92 58"/>
        <path d="M285 55 L295 45"/>
        <path d="M295 65 L308 58"/>
      </g>

      <!-- Instruction text -->
      <text x="200" y="160" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#6B5B4F" font-weight="500">Follow your physical therapist's instructions</text>
      <text x="200" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#8B7F72">Move slowly and carefully • Stop if you feel pain</text>
    </svg>
  `
};

/**
 * Get SVG illustration for an exercise
 * @param {string} exerciseName - Name of the exercise
 * @returns {string} SVG markup or default illustration
 */
function getExerciseIllustration(exerciseName) {
  const normalized = exerciseName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  // Direct match
  if (ExerciseIllustrations[normalized]) {
    return ExerciseIllustrations[normalized];
  }

  // Partial match mapping
  const mappings = {
    'quad': 'quad-sets',
    'heel slide': 'heel-slides',
    'straight leg': 'straight-leg-raises',
    'leg raise': 'straight-leg-raises',
    'ankle pump': 'ankle-pumps',
    'ankle circle': 'ankle-alphabet',
    'ankle alphabet': 'ankle-alphabet',
    'calf raise': 'calf-raises',
    'toe raise': 'calf-raises',
    'balance': 'balance-practice',
    'single leg': 'balance-practice',
    'towel scrunch': 'towel-scrunches',
    'chair squat': 'chair-squats',
    'sit to stand': 'chair-squats',
    'pelvic tilt': 'pelvic-tilts',
    'knee to chest': 'knee-to-chest-stretch',
    'cat cow': 'cat-cow-stretch',
    'cat-cow': 'cat-cow-stretch',
    'bird dog': 'bird-dog',
    'bird-dog': 'bird-dog',
    'pendulum': 'pendulum-swings',
    'scapular squeeze': 'scapular-squeezes',
    'shoulder blade': 'scapular-squeezes',
    'wall slide': 'wall-slides',
    'external rotation': 'passive-external-rotation',
    'deep breath': 'deep-breathing',
    'breathing': 'deep-breathing',
    'diaphragmatic': 'deep-breathing',
    'stretch': 'stretching-routine',
    'morning walk': 'morning-walk',
    'walk': 'morning-walk',
    'walking': 'morning-walk',
    'hand exercise': 'hand-exercises',
    'finger': 'hand-exercises',
    'grip': 'hand-exercises'
  };

  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key.replace(/\s+/g, '-')) ||
        exerciseName.toLowerCase().includes(key)) {
      return ExerciseIllustrations[value];
    }
  }

  // Return default
  return ExerciseIllustrations['default'];
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExerciseIllustrations, getExerciseIllustration };
}

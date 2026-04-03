// Hand-drawn style SVG illustrations

// Hero: person sitting with a plant, calm feeling
export function IllustrationHero({ width = 280 }) {
  return (
    <svg width={width} viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background blobs */}
      <ellipse cx="140" cy="185" rx="100" ry="12" fill="#e8f4f0" opacity="0.6"/>
      {/* Plant pot */}
      <path d="M190 160 Q188 145 192 140 Q196 135 200 140 Q204 145 202 160 Z" fill="#c4a882" stroke="#a8896a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M186 160 H206 Q204 168 196 168 Q188 168 186 160 Z" fill="#b8956e" stroke="#a8896a" strokeWidth="1.5"/>
      {/* Plant leaves */}
      <path d="M196 140 Q185 125 178 118 Q182 125 196 138" fill="#7fb5a0" stroke="#5a9a84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M196 135 Q207 120 215 115 Q210 123 196 133" fill="#7fb5a0" stroke="#5a9a84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M196 128 Q190 112 188 104 Q193 113 196 126" fill="#a8d4c4" stroke="#5a9a84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Person - body */}
      <path d="M95 165 Q92 145 95 130 Q98 118 110 115 Q122 112 128 120 Q135 130 132 145 Q130 158 128 165 Z" fill="#fde8d8" stroke="#d4b49a" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Person - head */}
      <circle cx="112" cy="102" r="18" fill="#fde8d8" stroke="#d4b49a" strokeWidth="1.5"/>
      {/* Hair */}
      <path d="M96 100 Q94 88 100 82 Q106 76 112 76 Q120 76 126 82 Q130 88 128 96" fill="#8b6f5e" stroke="#6b4f3e" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eyes - closed/peaceful */}
      <path d="M106 102 Q108 100 110 102" stroke="#6b4f3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M114 102 Q116 100 118 102" stroke="#6b4f3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Smile */}
      <path d="M108 108 Q112 112 116 108" stroke="#c47e6a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Person - legs */}
      <path d="M100 165 Q98 172 95 178 Q105 180 108 175 Q110 170 108 165 Z" fill="#a8c8e8" stroke="#7aa8c8" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M122 165 Q124 172 127 178 Q117 180 114 175 Q112 170 114 165 Z" fill="#a8c8e8" stroke="#7aa8c8" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Floating hearts / stars */}
      <path d="M148 85 Q150 82 152 85 Q154 82 156 85 Q156 89 152 92 Q148 89 148 85 Z" fill="#f9b8a0" opacity="0.8"/>
      <path d="M68 95 Q70 92 72 95 Q74 92 76 95 Q76 99 72 102 Q68 99 68 95 Z" fill="#f9b8a0" opacity="0.6"/>
      <circle cx="160" cy="70" r="3" fill="#7fb5a0" opacity="0.7"/>
      <circle cx="65" cy="75" r="2" fill="#a8c8e8" opacity="0.8"/>
      <circle cx="155" cy="110" r="2" fill="#fde8d8" stroke="#d4b49a" strokeWidth="1"/>
      {/* Sparkles */}
      <path d="M78 118 L80 114 L82 118 L86 120 L82 122 L80 126 L78 122 L74 120 Z" fill="#fde68a" opacity="0.8"/>
    </svg>
  );
}

// Completion: confetti / celebration
export function IllustrationDone({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Check circle */}
      <circle cx="80" cy="72" r="38" fill="#e8f4f0" stroke="#7fb5a0" strokeWidth="2.5" strokeDasharray="4 2"/>
      <path d="M62 72 L74 84 L98 60" stroke="#7fb5a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Confetti */}
      <rect x="30" y="28" width="8" height="8" rx="2" fill="#f9b8a0" transform="rotate(20 30 28)"/>
      <rect x="120" y="20" width="6" height="6" rx="1.5" fill="#a8c8e8" transform="rotate(-15 120 20)"/>
      <rect x="125" y="95" width="7" height="7" rx="2" fill="#fde68a" transform="rotate(30 125 95)"/>
      <rect x="22" y="95" width="6" height="6" rx="1.5" fill="#7fb5a0" transform="rotate(-10 22 95)"/>
      <circle cx="45" cy="22" r="5" fill="#fde68a" opacity="0.9"/>
      <circle cx="118" cy="58" r="4" fill="#f9b8a0" opacity="0.8"/>
      <circle cx="38" cy="110" r="3" fill="#a8c8e8"/>
      <path d="M100 28 L103 22 L106 28" stroke="#7fb5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50 108 L53 102 L56 108" stroke="#f9b8a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Achievement sparkle star
export function IllustrationAchievement({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Jar */}
      <path d="M52 55 Q50 52 54 48 H106 Q110 52 108 55 V108 Q108 116 100 116 H60 Q52 116 52 108 Z" fill="#faf8f3" stroke="#d4b49a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M54 48 H106 V42 Q106 38 100 38 H60 Q54 38 54 42 Z" fill="#e8e0d0" stroke="#d4b49a" strokeWidth="1.5"/>
      {/* Stars in jar */}
      <path d="M80 65 L83 73 L92 73 L85 78 L88 86 L80 81 L72 86 L75 78 L68 73 L77 73 Z" fill="#fde68a" stroke="#f0c430" strokeWidth="1"/>
      <path d="M65 88 L67 93 L72 93 L68 96 L70 101 L65 98 L60 101 L62 96 L58 93 L63 93 Z" fill="#fde68a" stroke="#f0c430" strokeWidth="1" opacity="0.7"/>
      <path d="M96 85 L98 89 L102 89 L99 92 L100 96 L96 94 L92 96 L93 92 L90 89 L94 89 Z" fill="#fde68a" stroke="#f0c430" strokeWidth="1" opacity="0.8"/>
      {/* Sparkle outside */}
      <path d="M36 48 L38 44 L40 48 L44 50 L40 52 L38 56 L36 52 L32 50 Z" fill="#7fb5a0" opacity="0.8"/>
      <path d="M120 40 L122 36 L124 40 L128 42 L124 44 L122 48 L120 44 L116 42 Z" fill="#a8c8e8" opacity="0.8"/>
      <circle cx="126" cy="72" r="4" fill="#f9b8a0" opacity="0.7"/>
      <circle cx="34" cy="80" r="3" fill="#fde68a" opacity="0.8"/>
    </svg>
  );
}

// Empty emotion: peaceful blank page with a feather
export function IllustrationEmptyEmotion({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Page */}
      <rect x="38" y="20" width="84" height="100" rx="8" fill="#faf8f3" stroke="#e8e0d0" strokeWidth="2"/>
      <line x1="52" y1="44" x2="108" y2="44" stroke="#e8e0d0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="52" y1="56" x2="108" y2="56" stroke="#e8e0d0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="52" y1="68" x2="88" y2="68" stroke="#e8e0d0" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Feather */}
      <path d="M100 95 Q88 75 80 68 Q85 80 78 98 Q86 88 100 95 Z" fill="#b8d9cf" stroke="#7fb5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M80 68 L78 98" stroke="#7fb5a0" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Small dots */}
      <circle cx="130" cy="35" r="5" fill="#e8f4f0"/>
      <circle cx="28" cy="90" r="4" fill="#fde8d8"/>
      <circle cx="135" cy="95" r="3" fill="#a8c8e8" opacity="0.6"/>
    </svg>
  );
}

// Empty conflicts: two arrows pointing different ways
export function IllustrationEmptyConflict({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Scale / balance */}
      <line x1="80" y1="30" x2="80" y2="85" stroke="#d4b49a" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="55" x2="110" y2="55" stroke="#d4b49a" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Left pan */}
      <path d="M50 55 Q40 65 36 75 Q46 80 50 80 Q54 80 64 75 Q60 65 50 55 Z" fill="#e8f4f0" stroke="#7fb5a0" strokeWidth="1.5"/>
      {/* Right pan - slightly lower (weighed down) */}
      <path d="M110 58 Q100 68 96 80 Q106 85 110 85 Q114 85 124 80 Q120 68 110 58 Z" fill="#fdf3ee" stroke="#f0b8a0" strokeWidth="1.5"/>
      {/* Items on pans */}
      <path d="M44 72 L47 68 L50 72 L53 68 L56 72" stroke="#7fb5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="110" cy="76" r="5" fill="#f9b8a0" stroke="#e09080" strokeWidth="1.2"/>
      {/* Base */}
      <path d="M68 85 H92 Q90 92 80 92 Q70 92 68 85 Z" fill="#e8e0d0" stroke="#d4b49a" strokeWidth="1.5"/>
      {/* Stars */}
      <circle cx="30" cy="40" r="3" fill="#fde68a" opacity="0.8"/>
      <circle cx="130" cy="38" r="4" fill="#a8c8e8" opacity="0.7"/>
      <path d="M25 80 L27 76 L29 80 L33 82 L29 84 L27 88 L25 84 L21 82 Z" fill="#7fb5a0" opacity="0.6"/>
    </svg>
  );
}

// Login illustration: key and door
export function IllustrationLogin({ width = 120 }) {
  return (
    <svg width={width} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Door frame */}
      <rect x="28" y="20" width="64" height="88" rx="6" fill="#faf8f3" stroke="#d4b49a" strokeWidth="2"/>
      <rect x="34" y="26" width="52" height="76" rx="4" fill="#e8f4f0" stroke="#b8d9cf" strokeWidth="1.5"/>
      {/* Door knob */}
      <circle cx="74" cy="68" r="5" fill="#d4b49a" stroke="#b89a7a" strokeWidth="1.5"/>
      {/* Keyhole */}
      <circle cx="74" cy="66" r="2.5" fill="#b89a7a"/>
      <path d="M72 68 H76 L75 72 H73 Z" fill="#b89a7a"/>
      {/* Window on door */}
      <rect x="44" y="36" width="32" height="24" rx="3" fill="#c8e4f8" stroke="#a8c8e8" strokeWidth="1.2"/>
      {/* Leaf through window */}
      <path d="M52 48 Q58 40 66 44 Q62 50 52 48 Z" fill="#7fb5a0" stroke="#5a9a84" strokeWidth="1"/>
      {/* Sparkle */}
      <path d="M100 30 L102 26 L104 30 L108 32 L104 34 L102 38 L100 34 L96 32 Z" fill="#fde68a" opacity="0.9"/>
      <circle cx="18" cy="60" r="4" fill="#f9b8a0" opacity="0.7"/>
      <circle cx="106" cy="72" r="3" fill="#b8d9cf" opacity="0.8"/>
    </svg>
  );
}

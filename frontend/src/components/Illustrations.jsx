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

// Achievement empty: hand-drawn trophy + stars
export function IllustrationAchievement({ width = 160, isDark = false }) {
  const ink = isDark ? '#d6d3d1' : '#44403c';
  const cupFill = isDark ? 'rgba(254,249,195,0.15)' : '#fef9c3';
  return (
    <svg width={width} viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trophy cup body */}
      <path d="M52 38 Q50 70 58 84 Q64 94 80 96 Q96 94 102 84 Q110 70 108 38 Z" fill={cupFill} stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Trophy handles */}
      <path d="M52 50 Q38 50 36 62 Q34 74 50 76" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M108 50 Q122 50 124 62 Q126 74 110 76" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Trophy stem */}
      <path d="M80 96 L80 112" stroke={ink} strokeWidth="2.2" strokeLinecap="round"/>
      {/* Trophy base */}
      <path d="M62 112 Q80 108 98 112" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M58 118 H102" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Star inside trophy */}
      <path d="M80 52 L83 62 L94 62 L85 68 L88 78 L80 72 L72 78 L75 68 L66 62 L77 62 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Decorative stars around */}
      <path d="M28 42 L29.5 38 L31 42 L35 43.5 L31 45 L29.5 49 L28 45 L24 43.5 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
      <path d="M128 55 L129.5 51 L131 55 L135 56.5 L131 58 L129.5 62 L128 58 L124 56.5 Z" fill="#7fb5a0" stroke="#5a9a84" strokeWidth="1"/>
      <path d="M118 28 L119 25 L120 28 L123 29 L120 30 L119 33 L118 30 L115 29 Z" fill="#f9b8a0" stroke="#e07060" strokeWidth="1"/>
      {/* Small dots */}
      <circle cx="38" cy="90" r="3.5" fill="#a8c8e8" opacity="0.8"/>
      <circle cx="130" cy="90" r="3" fill="#fde68a" opacity="0.9"/>
      <circle cx="25" cy="65" r="2.5" fill="#f9b8a0" opacity="0.7"/>
      {/* Sparkle lines */}
      <path d="M140 38 L142 34 M142 36 L138 36" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 110 L24 106 M24 108 L20 108" stroke="#7fb5a0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Empty emotion: hand-drawn journal / diary with a heart
export function IllustrationEmptyEmotion({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Journal cover */}
      <path d="M36 22 Q34 18 36 15 Q38 12 42 12 L118 12 Q122 12 124 15 Q126 18 124 22 L124 128 Q124 133 120 134 Q116 135 42 135 Q38 135 36 132 Q34 129 36 128 Z" fill="#fef9ec" stroke="#44403c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Spine binding */}
      <path d="M44 12 L44 135" stroke="#44403c" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Binding dots */}
      <circle cx="44" cy="30" r="3" fill="#44403c"/>
      <circle cx="44" cy="50" r="3" fill="#44403c"/>
      <circle cx="44" cy="70" r="3" fill="#44403c"/>
      <circle cx="44" cy="90" r="3" fill="#44403c"/>
      <circle cx="44" cy="110" r="3" fill="#44403c"/>
      {/* Ruled lines (empty — nothing written yet) */}
      <line x1="58" y1="48" x2="112" y2="48" stroke="#e8ddc8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="58" y1="62" x2="112" y2="62" stroke="#e8ddc8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="58" y1="76" x2="112" y2="76" stroke="#e8ddc8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="58" y1="90" x2="96" y2="90" stroke="#e8ddc8" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Heart doodle on cover */}
      <path d="M80 32 Q80 27 85 27 Q90 27 90 32 Q90 36 80 42 Q70 36 70 32 Q70 27 75 27 Q80 27 80 32 Z" fill="#f9b8a0" stroke="#e07060" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Tiny sparkle top-right */}
      <path d="M130 18 L131.5 14 L133 18 L137 19.5 L133 21 L131.5 25 L130 21 L126 19.5 Z" fill="#fbbf24" opacity="0.85"/>
      {/* Small accent dots */}
      <circle cx="24" cy="55" r="4" fill="#f9b8a0" opacity="0.7"/>
      <circle cx="140" cy="80" r="3.5" fill="#7fb5a0" opacity="0.6"/>
      <circle cx="28" cy="110" r="3" fill="#a8c8e8" opacity="0.7"/>
      {/* Tiny star bottom-left */}
      <path d="M18 85 L19.2 81 L20.4 85 L24 86.2 L20.4 87.4 L19.2 91 L18 87.4 L14 86.2 Z" fill="#7fb5a0" opacity="0.6"/>
    </svg>
  );
}

// Empty conflicts: hand-drawn balance scale with thought bubbles
export function IllustrationEmptyConflict({ width = 160 }) {
  return (
    <svg width={width} viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Scale pole */}
      <line x1="80" y1="28" x2="80" y2="100" stroke="#44403c" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Scale top knob */}
      <circle cx="80" cy="27" r="4" fill="#fef9ec" stroke="#44403c" strokeWidth="2"/>
      {/* Scale arm — slightly tilted (left side heavier) */}
      <path d="M38 56 Q58 50 80 52 Q102 50 122 58" stroke="#44403c" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Left string */}
      <line x1="40" y1="56" x2="40" y2="76" stroke="#44403c" strokeWidth="1.6" strokeLinecap="round"/>
      {/* Right string */}
      <line x1="120" y1="58" x2="120" y2="82" stroke="#44403c" strokeWidth="1.6" strokeLinecap="round"/>
      {/* Left pan (lower — heavier side) */}
      <path d="M26 78 Q33 82 40 82 Q47 82 54 78 Q50 74 40 74 Q30 74 26 78 Z" fill="#e8f4f0" stroke="#44403c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right pan (higher) */}
      <path d="M106 82 Q113 86 120 86 Q127 86 134 82 Q130 78 120 78 Q110 78 106 82 Z" fill="#fdf3ee" stroke="#44403c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Left pan item: tiny heart */}
      <path d="M40 76 Q40 73 42.5 73 Q45 73 45 76 Q45 78 40 80.5 Q35 78 35 76 Q35 73 37.5 73 Q40 73 40 76 Z" fill="#f9b8a0" stroke="#e07060" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Right pan item: small star */}
      <path d="M120 80 L121.2 76.5 L124 76.5 L121.8 78.5 L122.6 82 L120 80.2 L117.4 82 L118.2 78.5 L116 76.5 L118.8 76.5 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Scale base */}
      <path d="M68 100 H92" stroke="#44403c" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M62 108 Q80 103 98 108" stroke="#44403c" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M58 115 H102" stroke="#44403c" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Thought bubble left */}
      <circle cx="20" cy="36" r="5" fill="#e8f4f0" stroke="#7fb5a0" strokeWidth="1.4"/>
      <circle cx="26" cy="28" r="3.5" fill="#e8f4f0" stroke="#7fb5a0" strokeWidth="1.2"/>
      <circle cx="30" cy="22" r="2.5" fill="#e8f4f0" stroke="#7fb5a0" strokeWidth="1.2"/>
      {/* Thought bubble right */}
      <circle cx="140" cy="40" r="5" fill="#fdf3ee" stroke="#f0b8a0" strokeWidth="1.4"/>
      <circle cx="134" cy="32" r="3.5" fill="#fdf3ee" stroke="#f0b8a0" strokeWidth="1.2"/>
      <circle cx="130" cy="26" r="2.5" fill="#fdf3ee" stroke="#f0b8a0" strokeWidth="1.2"/>
      {/* Accent sparkle */}
      <path d="M138 110 L139.5 106 L141 110 L145 111.5 L141 113 L139.5 117 L138 113 L134 111.5 Z" fill="#fbbf24" opacity="0.8"/>
      {/* Small dots */}
      <circle cx="22" cy="90" r="3" fill="#a8c8e8" opacity="0.7"/>
      <circle cx="145" cy="68" r="2.5" fill="#7fb5a0" opacity="0.6"/>
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

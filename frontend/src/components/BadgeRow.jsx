import { useState, useEffect } from 'react';
import { getBadges } from '../api/badges';
import { getT } from '../i18n';

const BADGE_ORDER = ['FIRST_EMOTION', 'EMOTION_10', 'STREAK_7', 'FIRST_ACHIEVEMENT', 'FIRST_CONFLICT', 'FIRST_BREATHING', 'BREATHING_5'];

export default function BadgeRow({ isDark, lang, isLoggedIn }) {
  const [earned, setEarned] = useState(null); // null = loading

  useEffect(() => {
    if (!isLoggedIn) return;
    getBadges()
      .then((r) => setEarned(r.data.map((b) => b.badge_id)))
      .catch(() => setEarned([]));
  }, [isLoggedIn]);

  if (!isLoggedIn || earned === null) return null;

  const t = getT(lang);
  const D = isDark;

  return (
    <section style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb5a0', letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 10px' }}>
        {t.badgesTitle}
      </p>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {BADGE_ORDER.map((id) => {
          const def = t.badges[id];
          const isEarned = earned.includes(id);
          return (
            <div
              key={id}
              title={`${def.name} — ${def.desc}`}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                width: 64,
                opacity: isEarned ? 1 : 0.35,
                filter: isEarned ? 'none' : 'grayscale(1)',
                transition: 'opacity 0.3s',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: isEarned
                  ? (D ? 'rgba(127,181,160,0.2)' : '#e8f4f0')
                  : (D ? 'rgba(255,255,255,0.05)' : '#f3f4f6'),
                border: `2px solid ${isEarned ? '#7fb5a0' : (D ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: isEarned ? '0 2px 10px rgba(127,181,160,0.3)' : 'none',
              }}>
                {def.emoji}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.3,
                color: isEarned ? (D ? '#c8ddd6' : '#3d6b5e') : (D ? '#78716c' : '#9ca3af'),
              }}>
                {def.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Home, Search, SquarePen, Heart, User } from 'lucide-react';

const TABS = [
  { id: 'home',    Icon: Home,      label: '首頁'   },
  { id: 'search',  Icon: Search,    label: '搜尋'   },
  { id: 'post',    Icon: SquarePen, label: '發布'   },
  { id: 'heart',   Icon: Heart,     label: '心動'   },
  { id: 'profile', Icon: User,      label: '個人'   },
];

export default function ThreadsBottomNav({ active = 'home', onChange }) {
  const [pressed, setPressed] = useState(null);

  return (
    <nav style={s.nav}>
      {TABS.map(({ id, Icon, label }) => {
        const isActive  = active === id;
        const isPressed = pressed === id;

        return (
          <button
            key={id}
            aria-label={label}
            onPointerDown={() => setPressed(id)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            onClick={() => onChange?.(id)}
            style={{
              ...s.btn,
              transform: isPressed ? 'scale(0.82)' : 'scale(1)',
            }}
          >
            <Icon
              size={26}
              strokeWidth={isActive ? 2.5 : 1.75}
              color={isActive ? '#7fb5a0' : '#b8b2ab'}
              style={{ display: 'block', transition: 'color 0.2s, stroke-width 0.2s' }}
            />
          </button>
        );
      })}
    </nav>
  );
}

const s = {
  nav: {
    position: 'fixed',
    bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
    left: 16,
    right: 16,
    margin: '0 auto',
    maxWidth: 400,
    height: 60,
    background: 'rgba(255,253,250,0.82)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 9999,
    boxShadow: '0 8px 30px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 12px',
    zIndex: 9999,
    WebkitTransform: 'translate3d(0,0,0)',
    transform: 'translate3d(0,0,0)',
  },
  btn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  },
};

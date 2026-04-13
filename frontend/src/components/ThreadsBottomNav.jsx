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
              color={isActive ? '#000000' : '#9ca3af'}
              style={{ display: 'block', transition: 'color 0.15s, stroke-width 0.15s' }}
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: '#ffffff',
    borderTop: '1px solid #f0f0f0',
    boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 9999,
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

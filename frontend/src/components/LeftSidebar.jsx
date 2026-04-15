import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" fill={active ? 'rgba(255,255,255,0.3)' : 'none'} stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BreathIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" />
      <circle cx="12" cy="12" r="2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.5 : 1} />
    </svg>
  );
}

function HistoryIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function AchieveIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.2 : 1} />
    </svg>
  );
}

export default function LeftSidebar() {
  const { lang, isDark, isLoggedIn } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (AUTH_PAGES.includes(location.pathname)) return null;

  const tabs = [
    { path: '/',                                label: lang === 'zh' ? '首頁'  : 'Home',    Icon: HomeIcon    },
    { path: '/breathing',                       label: lang === 'zh' ? '放鬆'  : 'Breathe', Icon: BreathIcon  },
    { path: '/emotions/history',                label: lang === 'zh' ? '紀錄'  : 'History', Icon: HistoryIcon },
    { path: '/achievements',                    label: lang === 'zh' ? '成就'  : 'Wins',    Icon: AchieveIcon },
    { path: isLoggedIn ? '/account' : '/login', label: lang === 'zh' ? '我的'  : 'Profile', Icon: ProfileIcon },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/account' || path === '/login') {
      return location.pathname.startsWith('/account') || location.pathname.startsWith('/settings');
    }
    return location.pathname.startsWith(path);
  };

  const bg           = isDark ? 'rgba(22,18,16,0.6)'       : 'rgba(255,253,250,0.7)';
  const border       = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.06)';
  const activeColor  = '#7fb5a0';
  const inactiveColor= isDark ? '#6b6560' : '#b8b2ab';

  return (
    <aside style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      width: 72,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 24,
      gap: 8,
      justifyContent: 'center',
      background: bg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: `1px solid ${border}`,
      flexShrink: 0,
    }}>
      {/* Logo mark */}
      <div style={{ fontSize: 24, marginBottom: 16 }}>🌿</div>

      {tabs.map(({ path, label, Icon }) => {
        const on = isActive(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: on ? (isDark ? 'rgba(127,181,160,0.15)' : 'rgba(0,0,0,0.06)') : 'none',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              color: on ? activeColor : inactiveColor,
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
          >
            <Icon active={on} />
          </button>
        );
      })}
    </aside>
  );
}

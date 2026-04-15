import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

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

export default function BottomTabBar() {
  const { lang, isDark, isLoggedIn } = useApp();
  const t = getT(lang);
  const location = useLocation();
  const navigate = useNavigate();

  if (AUTH_PAGES.includes(location.pathname)) return null;

  const tabs = [
    { path: '/',                                  label: t.tabHome,    Icon: HomeIcon    },
    { path: '/breathing',                         label: t.tabBreath,  Icon: BreathIcon  },
    { path: '/emotions/history',                  label: t.tabHistory, Icon: HistoryIcon },
    { path: '/achievements',                      label: t.tabAchieve, Icon: AchieveIcon },
    { path: isLoggedIn ? '/account' : '/login',   label: t.tabProfile, Icon: ProfileIcon },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/account' || path === '/login') {
      return location.pathname.startsWith('/account') || location.pathname.startsWith('/settings');
    }
    return location.pathname.startsWith(path);
  };

  const activeIndex = tabs.findIndex(({ path }) => isActive(path));

  const bg            = isDark ? 'rgba(28,24,22,0.85)' : 'rgba(255,253,250,0.82)';
  const border        = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';
  const shadow        = isDark
    ? '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 8px 30px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)';
  const activeColor   = '#7fb5a0';
  const inactiveColor = isDark ? '#6b6560' : '#b8b2ab';
  const indicatorBg   = isDark ? 'rgba(127,181,160,0.14)' : 'rgba(127,181,160,0.12)';

  return (
    <nav
      className="bottom-tab-bar"
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: 16,
        right: 16,
        margin: '0 auto',
        maxWidth: 400,
        height: 60,
        background: bg,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: `1px solid ${border}`,
        borderRadius: 9999,
        boxShadow: shadow,
        zIndex: 150,
        transition: 'background 0.35s ease, box-shadow 0.35s ease',
        WebkitTransform: 'translate3d(0,0,0)',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 4px',
        overflow: 'hidden',
      }}
    >
      {/* Sliding indicator pill */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 4,
            width: `calc((100% - 8px) / ${tabs.length})`,
            height: 46,
            borderRadius: 9999,
            background: indicatorBg,
            transform: `translate(calc(${activeIndex} * 100%), -50%)`,
            transition: 'transform 0.38s cubic-bezier(0.34,0,0.2,1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {tabs.map(({ path, label, Icon }) => {
        const on = isActive(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: on ? activeColor : inactiveColor,
              transition: 'color 0.25s ease',
              minHeight: 44,
              padding: '6px 0',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Icon active={on} />
            <span style={{
              fontSize: 10,
              fontWeight: on ? 600 : 400,
              letterSpacing: 0.3,
              transition: 'font-weight 0.25s ease',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

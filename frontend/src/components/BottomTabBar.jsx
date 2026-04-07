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

function JournalIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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
    { path: '/',         label: t.tabHome,    Icon: HomeIcon },
    { path: '/emotions', label: t.tabJournal, Icon: JournalIcon },
    { path: isLoggedIn ? '/account' : '/login', label: t.tabProfile, Icon: ProfileIcon },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path === '/account' ? '/account' : path);
  };

  const bg     = isDark ? 'rgba(22,19,17,0.88)' : 'rgba(250,248,243,0.88)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const active = '#7fb5a0';
  const inactive = isDark ? '#57534e' : '#b0aaa3';

  return (
    <nav
      className="bottom-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: bg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${border}`,
        display: 'flex',
        zIndex: 150,
        transition: 'background 0.3s',
      }}
    >
      {tabs.map(({ path, label, Icon }) => {
        const on = isActive(path);
        return (
          <button
            key={path}
            data-small
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: on ? active : inactive,
              transition: 'color 0.2s',
              paddingTop: 6,
              position: 'relative',
            }}
          >
            {on && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 3,
                borderRadius: '0 0 3px 3px',
                background: active,
              }} />
            )}
            <Icon active={on} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, letterSpacing: 0.3 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

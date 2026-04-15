import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Tab order for swipe navigation (must match BottomTabBar order)
const TAB_PATHS = ['/', '/breathing', '/emotions/history', '/achievements', '/account'];

function getCurrentTabIndex(pathname, isLoggedIn) {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/breathing')) return 1;
  if (pathname.startsWith('/emotions')) return 2;
  if (pathname.startsWith('/achievements')) return 3;
  if (pathname.startsWith('/account') || pathname.startsWith('/settings') || pathname.startsWith('/login')) return 4;
  return -1; // non-tab page — disable swipe
}

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];
const MIN_SWIPE_X = 55;   // px — minimum horizontal distance
const MAX_SWIPE_Y = 80;   // px — max vertical drift allowed (prevent conflict with scroll)

export default function useSwipeNav(isLoggedIn) {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef(null);

  useEffect(() => {
    // Disable on auth pages
    if (AUTH_PAGES.includes(location.pathname)) return;

    function onTouchStart(e) {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    }

    function onTouchEnd(e) {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = Math.abs(t.clientY - touchStart.current.y);
      touchStart.current = null;

      // Ignore if too short or too much vertical movement (user scrolling)
      if (Math.abs(dx) < MIN_SWIPE_X || dy > MAX_SWIPE_Y) return;

      const idx = getCurrentTabIndex(location.pathname, isLoggedIn);
      if (idx === -1) return; // not a tab page

      const profilePath = isLoggedIn ? '/account' : '/login';
      const paths = ['/', '/breathing', '/emotions/history', '/achievements', profilePath];

      if (dx < 0 && idx < paths.length - 1) {
        // Swipe left → next tab
        navigate(paths[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        // Swipe right → previous tab
        navigate(paths[idx - 1]);
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [location.pathname, navigate, isLoggedIn]);
}

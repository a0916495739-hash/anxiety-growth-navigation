import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createGuestSession, logout as apiLogout, getMe } from '../api/auth';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [guestToken, setGuestToken] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'zh');
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');
  const [isDark, setIsDark] = useState(false);

  const setLang = useCallback((l) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  }, []);

  const setTheme = useCallback((t) => {
    document.documentElement.classList.add('theme-changing');
    localStorage.setItem('theme', t);
    setThemeState(t);
    setTimeout(() => document.documentElement.classList.remove('theme-changing'), 400);
  }, []);

  useEffect(() => {
    const apply = () => {
      const dark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  // Today's emotion count: { date: 'YYYY-MM-DD', count: N }
  const [todayEmotion, setTodayEmotion] = useState(() => {
    const saved = localStorage.getItem('today_emotion');
    return saved ? JSON.parse(saved) : { date: null, count: 0 };
  });

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayCount = todayEmotion.date === todayDateStr ? todayEmotion.count : 0;

  // On mount: check if JWT cookie is still valid; if not, fall back to guest session
  useEffect(() => {
    getMe()
      .then((r) => {
        setIsLoggedIn(true);
        setDisplayName(r.data.displayName || null);
        setAuthChecked(true);
      })
      .catch(() => {
        // Not logged in — initialize guest session
        const stored = localStorage.getItem('guest_token');
        if (stored) {
          setGuestToken(stored);
        } else {
          createGuestSession()
            .then((res) => {
              const token = res.data.guest_token;
              localStorage.setItem('guest_token', token);
              setGuestToken(token);
            })
            .catch(console.error);
        }
        setAuthChecked(true);
      });
  }, []);

  const incrementTodayCount = useCallback(() => {
    setTodayEmotion((prev) => {
      const newState =
        prev.date === todayDateStr
          ? { date: todayDateStr, count: prev.count + 1 }
          : { date: todayDateStr, count: 1 };
      localStorage.setItem('today_emotion', JSON.stringify(newState));
      return newState;
    });
  }, [todayDateStr]);

  const onLoginSuccess = useCallback(async () => {
    setIsLoggedIn(true);
    localStorage.removeItem('guest_token');
    setGuestToken(null);
    try {
      const r = await getMe();
      setDisplayName(r.data.displayName || null);
    } catch (_) {}
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (_) {}
    setIsLoggedIn(false);
    setDisplayName(null);
    // Re-initialize guest session after logout
    createGuestSession()
      .then((res) => {
        const token = res.data.guest_token;
        localStorage.setItem('guest_token', token);
        setGuestToken(token);
      })
      .catch(console.error);
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      authChecked,
      guestToken,
      displayName,
      setDisplayName,
      todayCount,
      incrementTodayCount,
      onLoginSuccess,
      handleLogout,
      lang,
      setLang,
      theme,
      setTheme,
      isDark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

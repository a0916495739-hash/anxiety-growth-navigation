import { useState, useEffect, useCallback } from 'react';
import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Listen for global API errors dispatched by axios interceptor
  useEffect(() => {
    function handler(e) { addToast(e.detail, 'error'); }
    window.addEventListener('api-error', handler);
    return () => window.removeEventListener('api-error', handler);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={s.container}>
        {toasts.map((t) => (
          <div key={t.id} style={t.type === 'error' ? s.error : s.success}>
            <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{t.message}</span>
            <button style={s.close} onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const s = {
  container: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 9999,
    width: 'min(400px, 90vw)',
    pointerEvents: 'none',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    pointerEvents: 'auto',
    animation: 'slideUp 0.2s ease',
  },
  success: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    pointerEvents: 'auto',
    animation: 'slideUp 0.2s ease',
  },
  close: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    lineHeight: 1,
    padding: '0 2px',
  },
};

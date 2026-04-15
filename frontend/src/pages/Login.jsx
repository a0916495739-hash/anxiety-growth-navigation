import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useApp } from '../context/AppContext';
import { IllustrationLogin } from '../components/Illustrations';
import { getT } from '../i18n';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLoginSuccess, lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const d = isDark ? {
    bg:       'linear-gradient(135deg,#1c1917 0%,#231f1d 50%,#1c1917 100%)',
    card:     'rgba(28,24,22,0.92)',
    cardBdr:  '1px solid rgba(255,255,255,0.08)',
    cardShd:  '0 24px 48px rgba(0,0,0,0.45)',
    title:    '#f5f5f4',
    sub:      '#a8a29e',
    label:    '#d6d3d1',
    inputBg:  'rgba(28,25,23,0.8)',
    inputBdr: '1.5px solid rgba(255,255,255,0.1)',
    inputC:   '#e7e5e4',
    errBg:    'rgba(127,29,29,0.3)',
    errBdr:   '1px solid rgba(153,27,27,0.5)',
    errC:     '#f87171',
    footer:   '#57534e',
  } : {
    bg:       'linear-gradient(135deg,#f5f3f0 0%,#ede8e3 50%,#f0ebe8 100%)',
    card:     'rgba(255,252,250,0.65)',
    cardBdr:  '1px solid rgba(255,255,255,0.45)',
    cardShd:  '0 24px 48px rgba(0,0,0,0.07),0 4px 12px rgba(0,0,0,0.04)',
    title:    '#2d3748',
    sub:      '#6b7280',
    label:    '#374151',
    inputBg:  '#faf8f3',
    inputBdr: '1.5px solid #e8e0d0',
    inputC:   '#2d3748',
    errBg:    '#fef2f2',
    errBdr:   '1px solid #fecaca',
    errC:     '#dc2626',
    footer:   '#6b7280',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...s.bg, background: d.bg }}>
      <div style={s.inner}>
        <div style={s.header}>
          <div style={s.illusWrap}><IllustrationLogin width={100} /></div>
          <h1 style={{ ...s.title, color: d.title }}>{t.welcomeBack}</h1>
          <p style={{ ...s.sub, color: d.sub }}>{t.loginSub}</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={{ ...s.label, color: d.label }}>Email</label>
            <input
              style={{ ...s.input, background: d.inputBg, border: d.inputBdr, color: d.inputC }}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={s.field}>
            <label style={{ ...s.label, color: d.label }}>{t.password}</label>
            <div style={s.pwWrap}>
              <input
                style={{ ...s.pwInput, background: d.inputBg, border: d.inputBdr, color: d.inputC }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ ...s.errorBox, background: d.errBg, border: d.errBdr, color: d.errC }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button style={loading ? s.btnDisabled : s.btn} type="submit" disabled={loading}>
            {loading ? t.signingIn : t.signInBtn}
          </button>
        </form>

        <p style={{ ...s.footer, color: d.footer }}><Link to="/forgot-password">{t.forgotPassword}</Link></p>
        <p style={{ ...s.footer, color: d.footer }}>{t.noAccount} <Link to="/register">{t.createAccount}</Link></p>
        <p style={{ ...s.footer, color: d.footer }}><Link to="/">{t.continueGuest}</Link></p>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    padding: '48px 40px',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  illusWrap: { display: 'flex', justifyContent: 'center', marginBottom: 8 },
  logo: { fontSize: 40, display: 'block', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 700, color: '#2d3748', marginBottom: 6 },
  sub: { fontSize: 14, color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: 0.2 },
  input: {
    border: '1.5px solid #e8e0d0',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 15,
    color: '#2d3748',
    background: '#faf8f3',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  pwWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput: {
    flex: 1,
    border: '1.5px solid #e8e0d0',
    borderRadius: 10,
    padding: '11px 44px 11px 14px',
    fontSize: 15,
    color: '#2d3748',
    background: '#faf8f3',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    minHeight: 'unset',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#dc2626',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  btn: {
    background: '#fbbf24',
    border: 'none',
    color: '#fff',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    boxShadow: '0 2px 10px rgba(251,191,36,0.4)',
    marginTop: 4,
    cursor: 'pointer',
    width: '100%',
  },
  btnDisabled: {
    background: '#fde68a',
    border: 'none',
    color: '#fff',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    marginTop: 4,
    cursor: 'not-allowed',
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
};

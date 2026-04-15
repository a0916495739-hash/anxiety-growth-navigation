import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';
import AuthPixelPanel, { PixelBoard } from '../components/AuthPixelPanel';

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

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLoginSuccess, lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const d = isDark ? {
    rightBg:  '#1c1917',
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
    divider:  'rgba(255,255,255,0.1)',
  } : {
    rightBg:  '#faf8f3',
    title:    '#2d3748',
    sub:      '#6b7280',
    label:    '#374151',
    inputBg:  '#fff',
    inputBdr: '1.5px solid #e8e0d0',
    inputC:   '#2d3748',
    errBg:    '#fef2f2',
    errBdr:   '1px solid #fecaca',
    errC:     '#dc2626',
    footer:   '#9ca3af',
    divider:  '#e8e0d0',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError(t.passwordTooShort); return; }
    setLoading(true);
    try {
      await register(email, password);
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t.registerFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      <AuthPixelPanel lang={lang} />

      {/* 右欄 — 表單 */}
      <div style={{
        width: '100%', maxWidth: 480, background: d.rightBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', flexShrink: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* 手機版插圖 */}
          <div className="login-mobile-illus" style={{ marginBottom: 24, maxHeight: 160, overflow: 'hidden' }}>
            <PixelBoard />
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: d.title, marginBottom: 6 }}>{t.startJourney}</h1>
            <p style={{ fontSize: 14, color: d.sub }}>{t.registerSub}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: d.label, letterSpacing: 0.2 }}>Email</label>
              <input
                style={{ ...s.input, background: d.inputBg, border: d.inputBdr, color: d.inputC }}
                type="email" placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: d.label, letterSpacing: 0.2 }}>{t.password}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  style={{ ...s.pwInput, background: d.inputBg, border: d.inputBdr, color: d.inputC }}
                  type={showPw ? 'text' : 'password'} placeholder={t.atLeast8}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="new-password"
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
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
              {loading ? t.creating : t.createAccountBtn}
            </button>
          </form>

          <Link to="/" style={{
            display: 'block', textAlign: 'center', marginTop: 12,
            padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            border: `1.5px solid ${d.divider}`,
            color: d.sub, textDecoration: 'none',
          }}>
            {t.continueGuest}
          </Link>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: d.footer, margin: 0 }}>
              {t.hasAccount} <Link to="/login" style={{ color: '#7fb5a0', fontWeight: 600 }}>{t.signInBtn}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  input: {
    border: '1.5px solid #e8e0d0', borderRadius: 10,
    padding: '11px 14px', fontSize: 15, outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  pwInput: {
    flex: 1, width: '100%', border: '1.5px solid #e8e0d0', borderRadius: 10,
    padding: '11px 44px 11px 14px', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, background: 'none', border: 'none',
    padding: 0, color: '#9ca3af', cursor: 'pointer',
    display: 'flex', alignItems: 'center', minHeight: 'unset',
  },
  errorBox: {
    borderRadius: 10, padding: '10px 14px',
    fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start',
  },
  btn: {
    background: '#fbbf24', border: 'none', color: '#fff',
    borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600,
    boxShadow: '0 2px 10px rgba(251,191,36,0.4)',
    marginTop: 4, cursor: 'pointer', width: '100%',
  },
  btnDisabled: {
    background: '#fde68a', border: 'none', color: '#fff',
    borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600,
    marginTop: 4, cursor: 'not-allowed', width: '100%',
  },
};

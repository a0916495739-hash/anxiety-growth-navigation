import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useApp } from '../context/AppContext';
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

// 像素風植物場景
function PixelScene() {
  const P = 6; // pixel size
  const c = (x, y, w, h, fill) => (
    <rect key={`${x}-${y}-${fill}`} x={x*P} y={y*P} width={w*P} height={h*P} fill={fill} />
  );
  return (
    <svg width="100%" viewBox="0 0 252 216" style={{ imageRendering: 'pixelated', maxWidth: 320 }}>
      {/* 地面 */}
      {c(0,34,42,1,'#52b788')}{c(0,35,42,1,'#40916c')}

      {/* 大樹幹 */}
      {c(17,22,3,13,'#6b4226')}{c(18,22,1,13,'#8a5a36')}

      {/* 樹冠 — 深 */}
      {c(13,12,10,4,'#2d6a4f')}
      {c(11,14,14,4,'#2d6a4f')}
      {c(12,18,10,4,'#2d6a4f')}

      {/* 樹冠 — 亮 */}
      {c(15,11,6,3,'#52b788')}
      {c(13,13,8,3,'#52b788')}
      {c(14,16,8,3,'#52b788')}
      {c(16,19,4,3,'#52b788')}

      {/* 小草 */}
      {c(3,33,1,2,'#52b788')}{c(5,32,1,3,'#40916c')}{c(7,33,1,2,'#52b788')}
      {c(32,33,1,2,'#52b788')}{c(35,32,1,3,'#40916c')}{c(38,33,1,2,'#52b788')}

      {/* 人物身體 */}
      {c(26,25,4,1,'#ffd6a5')}{/* 頭 */}
      {c(25,26,6,1,'#ffd6a5')}
      {c(25,27,6,1,'#ffd6a5')}
      {c(26,28,4,1,'#ffd6a5')}
      {/* 眼睛 */}
      {c(26,27,1,1,'#2d3748')}{c(29,27,1,1,'#2d3748')}
      {/* 嘴巴 */}
      {c(27,28,2,1,'#e07070')}
      {/* 身體 */}
      {c(26,29,4,4,'#7fb5a0')}
      {/* 手 */}
      {c(24,29,2,3,'#ffd6a5')}{c(30,29,2,3,'#ffd6a5')}
      {/* 腳 */}
      {c(26,33,2,2,'#6b4226')}{c(29,33,2,2,'#6b4226')}

      {/* 星星 */}
      {c(2,2,2,2,'#fbbf24')}{c(38,5,2,2,'#fbbf24')}{c(20,1,2,2,'#fbbf24')}
      {c(7,8,1,1,'#fde68a')}{c(35,10,1,1,'#fde68a')}{c(14,4,1,1,'#fde68a')}

      {/* 小花 */}
      {c(1,30,1,1,'#f472b6')}{c(2,29,1,1,'#f472b6')}{c(2,31,1,1,'#f472b6')}{c(3,30,1,1,'#fbbf24')}
      {c(39,30,1,1,'#fb923c')}{c(40,29,1,1,'#fb923c')}{c(40,31,1,1,'#fb923c')}{c(41,30,1,1,'#fbbf24')}
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
    leftBg:   'linear-gradient(160deg,#1a2e25 0%,#0f1f18 100%)',
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
    divider:  'rgba(255,255,255,0.08)',
  } : {
    leftBg:   'linear-gradient(160deg,#1a3a2a 0%,#2d6a4f 100%)',
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* 左欄 — 插圖區（桌面才顯示） */}
      <div className="login-left" style={{
        flex: 1,
        background: d.leftBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        gap: 28,
      }}>
        <PixelScene />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            {lang === 'zh' ? '抗焦慮成長導航' : 'Anxiety Growth Nav'}
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: 0 }}>
            {lang === 'zh' ? '不需要比任何人好，\n只需要比昨天的自己\n更理解自己' : "You don't need to be better\nthan anyone.\nJust a little more you."}
          </h2>
        </div>
      </div>

      {/* 右欄 — 表單區 */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: d.rightBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        flexShrink: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* 手機版插圖 */}
          <div className="login-mobile-illus" style={{ textAlign: 'center', marginBottom: 24 }}>
            <PixelScene />
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: d.title, marginBottom: 6 }}>{t.welcomeBack}</h1>
            <p style={{ fontSize: 14, color: d.sub }}>{t.loginSub}</p>
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
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
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
              {loading ? t.signingIn : t.signInBtn}
            </button>
          </form>

          <Link to="/" style={{
            display: 'block', textAlign: 'center', marginTop: 12,
            padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            border: `1.5px solid ${d.divider}`,
            color: d.sub, textDecoration: 'none',
            background: 'transparent',
            transition: 'border-color 0.15s',
          }}>
            {t.continueGuest}
          </Link>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#7fb5a0' }}>{t.forgotPassword}</Link>
            <p style={{ fontSize: 13, color: d.footer, margin: 0 }}>{t.noAccount} <Link to="/register" style={{ color: '#7fb5a0', fontWeight: 600 }}>{t.createAccount}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  input: {
    border: '1.5px solid #e8e0d0',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 15,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  pwInput: {
    flex: 1, width: '100%',
    border: '1.5px solid #e8e0d0',
    borderRadius: 10,
    padding: '11px 44px 11px 14px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: 12,
    background: 'none', border: 'none', padding: 0,
    color: '#9ca3af', cursor: 'pointer',
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { IllustrationLogin } from '../components/Illustrations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.data?.devResetUrl) setDevUrl(res.data.devResetUrl);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || '發送失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.illusWrap}><IllustrationLogin width={90} /></div>
          <h1 style={s.title}>忘記密碼</h1>
          <p style={s.sub}>輸入你的 Email，我們會寄送重設連結</p>
        </div>

        {sent ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>📬</div>
            <p style={s.successTitle}>重設連結已發送</p>
            <p style={s.successDesc}>
              若此 Email 已註冊，重設連結將在幾分鐘內抵達。<br />
              連結有效期為 <strong>1 小時</strong>，請記得檢查垃圾郵件。
            </p>
            {devUrl && (
              <div style={s.devBox}>
                <p style={s.devLabel}>🛠 本地開發模式 — 點此重設密碼：</p>
                <a href={devUrl} style={s.devLink}>前往設定新密碼</a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <div style={s.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button style={loading ? s.btnDisabled : s.btn} type="submit" disabled={loading}>
              {loading ? '發送中...' : '發送重設連結'}
            </button>
          </form>
        )}

        <p style={s.footer}>
          <Link to="/login">← 返回登入</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f4f0 0%, #faf8f3 50%, #e8f4fb 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  illusWrap: { display: 'flex', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, color: '#2d3748', marginBottom: 6 },
  sub: { fontSize: 14, color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: 0.2 },
  input: {
    border: '1.5px solid #e8e0d0', borderRadius: 10, padding: '11px 14px',
    fontSize: 15, color: '#2d3748', background: '#faf8f3', outline: 'none',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
    padding: '10px 14px', fontSize: 14, color: '#dc2626', display: 'flex', gap: 8,
  },
  btn: {
    background: '#7fb5a0', border: 'none', color: '#fff', borderRadius: 10,
    padding: '13px', fontSize: 15, fontWeight: 600,
    boxShadow: '0 2px 8px rgba(127,181,160,0.4)', marginTop: 4,
  },
  btnDisabled: {
    background: '#b8d9cf', border: 'none', color: '#fff', borderRadius: 10,
    padding: '13px', fontSize: 15, fontWeight: 600, marginTop: 4, cursor: 'not-allowed',
  },
  successBox: { textAlign: 'center', padding: '8px 0 16px' },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#6b7280', lineHeight: 1.8 },
  devBox: { marginTop: 20, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px' },
  devLabel: { fontSize: 12, color: '#16a34a', marginBottom: 8, fontWeight: 600 },
  devLink: { display: 'inline-block', background: '#7fb5a0', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
};

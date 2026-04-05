import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { IllustrationLogin } from '../components/Illustrations';

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('連結無效，請重新申請忘記密碼');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading || !token) return;
    if (newPassword.length < 8) {
      setError('密碼至少需要 8 個字元');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || '重設失敗，連結可能已失效');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.illusWrap}><IllustrationLogin width={90} /></div>
          <h1 style={s.title}>設定新密碼</h1>
          <p style={s.sub}>請輸入你的新密碼</p>
        </div>

        {done ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>✅</div>
            <p style={s.successTitle}>密碼已重設完成</p>
            <p style={s.successDesc}>你現在可以使用新密碼登入了。</p>
            <button style={s.btn} onClick={() => navigate('/login')}>前往登入</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>新密碼</label>
              <div style={s.pwWrap}>
                <input
                  style={s.pwInput}
                  type={showPw ? 'text' : 'password'}
                  placeholder="至少 8 個字元"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                  disabled={!token}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button style={(loading || !token) ? s.btnDisabled : s.btn} type="submit" disabled={loading || !token}>
              {loading ? '設定中...' : '確認新密碼'}
            </button>
          </form>
        )}

        {!done && (
          <p style={s.footer}>
            連結失效了？<Link to="/forgot-password">重新申請</Link>
          </p>
        )}
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
  pwWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput: {
    flex: 1, border: '1.5px solid #e8e0d0', borderRadius: 10,
    padding: '11px 44px 11px 14px', fontSize: 15, color: '#2d3748',
    background: '#faf8f3', outline: 'none', width: '100%',
  },
  eyeBtn: {
    position: 'absolute', right: 12, background: 'none', border: 'none',
    padding: 0, color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: 'unset',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
    padding: '10px 14px', fontSize: 14, color: '#dc2626', display: 'flex', gap: 8,
  },
  btn: {
    background: '#7fb5a0', border: 'none', color: '#fff', borderRadius: 10,
    padding: '13px', fontSize: 15, fontWeight: 600,
    boxShadow: '0 2px 8px rgba(127,181,160,0.4)', marginTop: 4, cursor: 'pointer', width: '100%',
  },
  btnDisabled: {
    background: '#b8d9cf', border: 'none', color: '#fff', borderRadius: 10,
    padding: '13px', fontSize: 15, fontWeight: 600, marginTop: 4, cursor: 'not-allowed',
  },
  successBox: { textAlign: 'center', padding: '8px 0 8px' },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
};

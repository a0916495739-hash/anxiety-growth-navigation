import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useApp } from '../context/AppContext';
import { IllustrationLogin } from '../components/Illustrations';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { onLoginSuccess } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '登入失敗，請確認帳號密碼後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.illusWrap}><IllustrationLogin width={100} /></div>
          <h1 style={s.title}>歡迎回來</h1>
          <p style={s.sub}>登入以繼續你的成長旅程</p>
        </div>

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
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>密碼</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button style={loading ? s.btnDisabled : s.btn} type="submit" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <p style={s.footer}>
          還沒有帳號？ <Link to="/register">建立帳號</Link>
        </p>
        <p style={s.footer}>
          <Link to="/">← 以訪客身份繼續</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f4f0 0%, #faf8f3 50%, #e8f4fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
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
    background: '#7fb5a0',
    border: 'none',
    color: '#fff',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(127,181,160,0.4)',
    marginTop: 4,
  },
  btnDisabled: {
    background: '#b8d9cf',
    border: 'none',
    color: '#fff',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    marginTop: 4,
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
};

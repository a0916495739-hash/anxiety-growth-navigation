import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, changePassword, logout, updateProfile } from '../api/auth';
import { useApp } from '../context/AppContext';

export default function Account() {
  const [email, setEmail] = useState('');
  // Profile
  const [nameInput, setNameInput] = useState('');
  const [nameMsg, setNameMsg] = useState(null);
  const [nameSaving, setNameSaving] = useState(false);
  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const { handleLogout, displayName, setDisplayName } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((r) => {
        setEmail(r.data.email || '');
        setNameInput(r.data.displayName || '');
      })
      .catch(() => navigate('/'));
  }, [navigate]);

  async function handleSaveName(e) {
    e.preventDefault();
    if (nameSaving || !nameInput.trim()) return;
    setNameMsg(null);
    setNameSaving(true);
    try {
      const r = await updateProfile(nameInput.trim());
      setDisplayName(r.data.displayName);
      setNameMsg({ type: 'success', text: '顯示名稱已更新' });
    } catch (err) {
      setNameMsg({ type: 'error', text: err.response?.data?.error || '更新失敗，請再試一次' });
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwLoading) return;
    setPwMsg(null);
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: '密碼已更新' });
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || '更新失敗，請再試一次' });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogoutClick() {
    await handleLogout();
    navigate('/login');
  }

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/')}>← 返回首頁</button>
      <h2 style={s.heading}>帳號設定</h2>

      {/* Profile */}
      <div style={s.section}>
        <p style={s.sectionLabel}>個人檔案</p>
        <div style={s.avatar}>
          <div style={s.avatarCircle}>
            {displayName ? displayName[0].toUpperCase() : email ? email[0].toUpperCase() : '?'}
          </div>
          <div>
            <p style={s.avatarName}>{displayName || '（尚未設定顯示名稱）'}</p>
            <p style={s.avatarEmail}>{email}</p>
          </div>
        </div>
        <form onSubmit={handleSaveName} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>顯示名稱</label>
            <input
              style={s.input}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="輸入你想顯示的名稱（最多 30 字）"
              maxLength={30}
              autoComplete="nickname"
            />
          </div>
          {nameMsg && (
            <div style={nameMsg.type === 'success' ? s.successBox : s.errorBox}>
              {nameMsg.text}
            </div>
          )}
          <button type="submit" style={s.submitBtn} disabled={nameSaving || !nameInput.trim()}>
            {nameSaving ? '儲存中...' : '儲存名稱'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div style={s.section}>
        <p style={s.sectionLabel}>修改密碼</p>
        <form onSubmit={handleChangePassword} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>目前密碼</label>
            <input
              style={s.input}
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="輸入目前密碼"
              autoComplete="current-password"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>新密碼</label>
            <input
              style={s.input}
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="至少 8 個字元"
              autoComplete="new-password"
            />
          </div>
          {pwMsg && (
            <div style={pwMsg.type === 'success' ? s.successBox : s.errorBox}>
              {pwMsg.text}
            </div>
          )}
          <button type="submit" style={s.submitBtn} disabled={pwLoading}>
            {pwLoading ? '更新中...' : '更新密碼'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div style={s.section}>
        <p style={s.sectionLabel}>帳號操作</p>
        <button style={s.logoutBtn} onClick={handleLogoutClick}>登出</button>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 20px', display: 'block' },
  heading: { fontSize: 22, marginBottom: 28 },
  section: { background: '#fff', border: '1.5px solid #e8e0d0', borderRadius: 14, padding: '20px', marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  avatar: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #7fb5a0, #5a9fc0)',
    color: '#fff', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarName: { fontWeight: 600, fontSize: 16, color: '#2d3748', margin: '0 0 2px' },
  avatarEmail: { fontSize: 13, color: '#9ca3af', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { border: '1.5px solid #e8e0d0', borderRadius: 10, padding: '10px 14px', fontSize: 15, background: '#faf8f3', outline: 'none' },
  successBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#16a34a' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#dc2626' },
  submitBtn: { background: '#7fb5a0', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  logoutBtn: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '11px 20px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' },
};

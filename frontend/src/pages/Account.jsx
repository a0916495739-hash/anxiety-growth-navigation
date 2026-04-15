import { useState, useEffect, useRef } from 'react';
import { Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile, updateAvatar } from '../api/auth';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

// ── Growth Level System ──────────────────────────────────────────────────────
const LEVELS = [
  { lv: 1,  title: '種子萌芽者', minDays: 0   },
  { lv: 2,  title: '嫩芽探索者', minDays: 4   },
  { lv: 3,  title: '生長冒險者', minDays: 10  },
  { lv: 4,  title: '綠意守護者', minDays: 20  },
  { lv: 5,  title: '茁壯旅行者', minDays: 35  },
  { lv: 6,  title: '心靈探索者', minDays: 55  },
  { lv: 7,  title: '智慧行者',   minDays: 80  },
  { lv: 8,  title: '花朵綻放者', minDays: 110 },
  { lv: 9,  title: '大樹庇護者', minDays: 150 },
  { lv: 10, title: '成長傳說者', minDays: 200 },
];

function getGrowthLevel() {
  let firstUse = localStorage.getItem('first_use_date');
  if (!firstUse) {
    firstUse = new Date().toISOString();
    localStorage.setItem('first_use_date', firstUse);
  }
  const days = Math.floor((Date.now() - new Date(firstUse).getTime()) / 86400000);
  const current = [...LEVELS].reverse().find((l) => days >= l.minDays) || LEVELS[0];
  const next = LEVELS.find((l) => l.lv === current.lv + 1);
  const progress = next
    ? Math.min(100, Math.round(((days - current.minDays) / (next.minDays - current.minDays)) * 100))
    : 100;
  return { ...current, days, progress };
}

function GrowthAvatarCard({ isDark }) {
  const { lv, title, days, progress } = getGrowthLevel();
  const bg         = isDark ? '#1e2d27' : '#f0faf5';
  const border     = isDark ? '2px solid rgba(127,181,160,0.5)' : '2px solid #2d6a4f';
  const shadow     = '4px 4px 0px 0px rgba(45,106,79,0.25)';
  const textPrimary = isDark ? '#c8e6c9' : '#1b4332';
  const textSub     = isDark ? '#81c995' : '#40916c';
  const barBg       = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(45,106,79,0.12)';

  return (
    <div style={{ background: bg, border, borderRadius: 16, boxShadow: shadow, padding: '18px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 8, right: 12, display: 'flex', gap: 4 }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: textSub, opacity: 0.4 - i * 0.1 }} />
        ))}
      </div>
      <div style={{ width: 64, height: 64, flexShrink: 0, background: isDark ? 'rgba(127,181,160,0.15)' : 'rgba(45,106,79,0.08)', border: `2px solid ${isDark ? 'rgba(127,181,160,0.4)' : '#2d6a4f'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px 0px rgba(45,106,79,0.3)' }}>
        <Sprout size={34} color={isDark ? '#81c995' : '#2d6a4f'} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: textSub, letterSpacing: 1.2, textTransform: 'uppercase', margin: '0 0 4px' }}>我的成長化身</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 2px', letterSpacing: -0.3 }}>
          Lv.{lv} <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
        </p>
        <p style={{ fontSize: 12, color: textSub, margin: '0 0 10px' }}>已陪伴 {days} 天</p>
        <div style={{ background: barBg, borderRadius: 4, height: 6, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(127,181,160,0.2)' : 'rgba(45,106,79,0.15)'}` }}>
          <div style={{ height: '100%', width: `${progress}%`, background: isDark ? 'linear-gradient(90deg,#52b788,#95d5b2)' : 'linear-gradient(90deg,#2d6a4f,#52b788)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <p style={{ fontSize: 10, color: textSub, margin: '4px 0 0', opacity: 0.8 }}>
          {progress < 100 ? `距離下一等級 ${progress}%` : '已達最高等級 ✦'}
        </p>
      </div>
    </div>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Account() {
  const [email, setEmail] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameMsg, setNameMsg] = useState(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(() => localStorage.getItem('cover_url') || null);
  const [growthGoal, setGrowthGoal] = useState(() => localStorage.getItem('growth_goal') || '');
  const [goalEditing, setGoalEditing] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const goalInputRef = useRef(null);

  const { displayName, setDisplayName, avatarUrl, setAvatarUrl, lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((r) => {
        setEmail(r.data.email || '');
        setNameInput(r.data.displayName || '');
      })
      .catch((err) => {
        if (err?.response?.status === 401) navigate('/');
      });
  }, [navigate]);

  async function handleSaveName(e) {
    e.preventDefault();
    if (nameSaving || !nameInput.trim()) return;
    setNameMsg(null);
    setNameSaving(true);
    try {
      const r = await updateProfile(nameInput.trim());
      setDisplayName(r.data.displayName);
      setNameMsg({ type: 'success', text: t.nameUpdated });
    } catch (err) {
      setNameMsg({ type: 'error', text: err.response?.data?.error || t.updateFailed });
    } finally {
      setNameSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || avatarUploading) return;
    setAvatarUploading(true);
    try {
      const base64 = await toBase64(file);
      await updateAvatar(base64);
      setAvatarUrl(base64);
    } catch (err) {
      console.error('頭貼上傳失敗', err);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    if (coverUrl?.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
    setCoverUrl(objectUrl);
    localStorage.setItem('cover_url', objectUrl);
    e.target.value = '';
  }

  function handleGoalBlur() {
    setGoalEditing(false);
    localStorage.setItem('growth_goal', growthGoal);
  }

  function handleGoalKeyDown(e) {
    if (e.key === 'Enter') goalInputRef.current?.blur();
    if (e.key === 'Escape') setGoalEditing(false);
  }

  const c = isDark ? {
    card: 'rgba(41,37,36,0.85)', cardBorder: '1.5px solid rgba(255,255,255,0.08)',
    heading: '#f5f5f4', label: '#a8a29e', text: '#e7e5e4', textMid: '#78716c',
    input: 'rgba(28,25,23,0.6)', inputBorder: '1.5px solid rgba(255,255,255,0.1)',
    successBg: '#14532d22', successBorder: '#166534', successText: '#4ade80',
    errorBg: '#7f1d1d22', errorBorder: '#991b1b', errorText: '#f87171',
    submitBg: '#7fb5a0',
  } : {
    card: '#fff', cardBorder: '1.5px solid #e8e0d0',
    heading: '#2d3748', label: '#9ca3af', text: '#374151', textMid: '#6b7280',
    input: '#faf8f3', inputBorder: '1.5px solid #e8e0d0',
    successBg: '#f0fdf4', successBorder: '#bbf7d0', successText: '#16a34a',
    errorBg: '#fef2f2', errorBorder: '#fecaca', errorText: '#dc2626',
    submitBg: '#7fb5a0',
  };

  return (
    <div style={s.page}>
      <button style={{ ...s.back, color: '#7fb5a0' }} onClick={() => navigate('/')}>{t.backToHome}</button>
      <h2 style={{ ...s.heading, color: c.heading }}>我的</h2>

      {/* Growth Avatar */}
      <GrowthAvatarCard isDark={isDark} />

      {/* Profile card */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder, padding: 0, overflow: 'hidden' }}>

        {/* Cover Photo */}
        <div style={{ position: 'relative', width: '100%', height: 120 }}>
          <div style={{ width: '100%', height: '100%', background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #c8dfd8 0%, #e8f4f0 40%, #fdf3ee 100%)', transition: 'background 0.4s ease' }} />
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          <button onClick={() => coverInputRef.current?.click()} title="更換封面圖" style={{ position: 'absolute', bottom: 10, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>

        {/* Retro avatar card */}
        <div style={{ padding: '16px 20px 0' }}>
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

          <div style={{ background: isDark ? '#1e1a17' : '#f8f5f0', border: isDark ? '2px solid rgba(255,255,255,0.15)' : '2px solid #1a1a1a', borderRadius: 12, boxShadow: isDark ? '4px 4px 0px 0px rgba(0,0,0,0.5)' : '4px 4px 0px 0px rgba(0,0,0,0.10)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Pixel avatar */}
            <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => !avatarUploading && avatarInputRef.current?.click()} title="點擊更換頭貼">
              <div style={{ width: 64, height: 64, border: isDark ? '2px solid rgba(255,255,255,0.6)' : '2px solid #1a1a1a', borderRadius: 8, imageRendering: 'pixelated', overflow: 'hidden', background: isDark ? '#2a2520' : '#e8e4df', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '2px 2px 0 rgba(255,255,255,0.1)' : '2px 2px 0 rgba(0,0,0,0.15)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', imageRendering: 'pixelated' }} />
                  : (
                    <svg width="36" height="36" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="1" width="4" height="4" fill={isDark ? '#c8b8a8' : '#6b5c4e'} />
                      <rect x="5" y="5" width="6" height="5" fill={isDark ? '#95d5b2' : '#7fb5a0'} />
                      <rect x="3" y="5" width="2" height="4" fill={isDark ? '#95d5b2' : '#7fb5a0'} />
                      <rect x="11" y="5" width="2" height="4" fill={isDark ? '#95d5b2' : '#7fb5a0'} />
                      <rect x="5" y="10" width="2" height="5" fill={isDark ? '#a8c8b8' : '#5a8a78'} />
                      <rect x="9" y="10" width="2" height="5" fill={isDark ? '#a8c8b8' : '#5a8a78'} />
                      <rect x="7" y="1" width="2" height="1" fill={isDark ? '#8b7060' : '#4a3828'} />
                    </svg>
                  )
                }
              </div>
              {avatarUploading && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: -6, right: -6, width: 20, height: 20, background: '#7fb5a0', border: '2px solid #1a1a1a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#e7e5e4' : '#1a1a1a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || t.noDisplayName}</p>
              <p style={{ fontSize: 11, color: isDark ? '#78716c' : '#9ca3af', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
              {(() => {
                const { lv, title, days } = getGrowthLevel();
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#7fb5a0', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>LVL</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: isDark ? '#95d5b2' : '#2d6a4f', letterSpacing: -0.5 }}>{String(lv).padStart(2, '0')}</span>
                      <span style={{ fontSize: 11, color: isDark ? '#a8a29e' : '#6b7280' }}>{title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#7fb5a0', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>DAY</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: isDark ? '#95d5b2' : '#2d6a4f', letterSpacing: -0.5 }}>{String(days).padStart(3, '0')}</span>
                      <span style={{ fontSize: 11, color: isDark ? '#a8a29e' : '#6b7280' }}>{lang === 'zh' ? '天陪伴' : 'days'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Growth Goal */}
          <div style={{ margin: '4px 0 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.label, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>我目前的成長目標是...</p>
            {goalEditing ? (
              <input ref={goalInputRef} autoFocus value={growthGoal} onChange={(e) => setGrowthGoal(e.target.value)} onBlur={handleGoalBlur} onKeyDown={handleGoalKeyDown} maxLength={80} placeholder="寫下你的目標，例如：每天記錄一次情緒" style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${isDark ? 'rgba(127,181,160,0.5)' : '#7fb5a0'}`, outline: 'none', fontSize: 15, color: isDark ? '#d6d3d1' : '#4a5568', padding: '4px 0', fontFamily: 'inherit' }} />
            ) : (
              <p onClick={() => { setGoalEditing(true); setTimeout(() => goalInputRef.current?.focus(), 0); }} style={{ fontSize: 15, color: growthGoal ? (isDark ? '#c4b8ae' : '#6b7280') : (isDark ? '#6b6560' : '#b8b2ab'), fontStyle: growthGoal ? 'normal' : 'italic', cursor: 'text', padding: '4px 0', borderBottom: '1.5px solid transparent', minHeight: 28 }}>
                {growthGoal || '點擊輸入你的成長目標...'}
              </p>
            )}
          </div>
        </div>

        {/* Display name form */}
        <div style={{ padding: '0 20px 20px' }}>
          <form onSubmit={handleSaveName} style={s.form}>
            <div style={s.field}>
              <label style={{ ...s.label, color: c.text }}>{t.displayName}</label>
              <input style={{ ...s.input, background: c.input, border: c.inputBorder, color: c.text }} type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={t.displayNamePlaceholder} maxLength={30} autoComplete="nickname" />
            </div>
            {nameMsg && <div style={{ ...s.msgBox, background: nameMsg.type === 'success' ? c.successBg : c.errorBg, border: `1px solid ${nameMsg.type === 'success' ? c.successBorder : c.errorBorder}`, color: nameMsg.type === 'success' ? c.successText : c.errorText }}>{nameMsg.text}</div>}
            <button type="submit" style={{ ...s.submitBtn, background: c.submitBg }} disabled={nameSaving || !nameInput.trim()}>{nameSaving ? t.savingName : t.saveName}</button>
          </form>
        </div>
      </div>

      {/* Settings entry */}
      <button
        onClick={() => navigate('/settings')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: c.card, border: c.cardBorder, borderRadius: 14,
          padding: '18px 20px', cursor: 'pointer', marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(127,181,160,0.15)' : '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fb5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: c.text, margin: 0 }}>帳號設定</p>
            <p style={{ fontSize: 12, color: c.label, margin: 0 }}>密碼、語言、主題、訂閱</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

const s = {
  page: { maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 20px', display: 'block' },
  heading: { fontSize: 22, marginBottom: 28 },
  section: { borderRadius: 14, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600 },
  input: { borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none', transition: 'background 0.3s, border-color 0.3s' },
  msgBox: { borderRadius: 8, padding: '10px 14px', fontSize: 14 },
  submitBtn: { border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'opacity 0.2s, background 0.3s', width: '100%' },
};

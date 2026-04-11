import { useState, useEffect, useRef } from 'react';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}
import { useNavigate } from 'react-router-dom';
import { getMe, changePassword, updateProfile, updateAvatar } from '../api/auth';
import { submitFeedback } from '../api/feedback';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

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
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const avatarInputRef = useRef(null);

  const { handleLogout, isLoggedIn, displayName, setDisplayName, avatarUrl, setAvatarUrl, subscriptionPlan, lang, setLang, theme, setTheme, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((r) => {
        setEmail(r.data.email || '');
        setNameInput(r.data.displayName || '');
      })
      .catch((err) => {
        // 只有 401 未登入才導回首頁，其餘錯誤（網路抖動等）不跳轉
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

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwLoading) return;
    setPwMsg(null);
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: t.passwordUpdated });
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || t.updateFailed });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    if (feedbackLoading || !feedbackText.trim()) return;
    setFeedbackMsg(null);
    setFeedbackLoading(true);
    try {
      await submitFeedback(feedbackText.trim());
      setFeedbackMsg({ type: 'success', text: t.feedbackSuccess });
      setFeedbackText('');
    } catch {
      setFeedbackMsg({ type: 'error', text: t.feedbackError });
    } finally {
      setFeedbackLoading(false);
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
      // reset so selecting the same file again still fires onChange
      e.target.value = '';
    }
  }

  async function handleExportCSV() {
    if (exporting) return;
    setExporting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${baseURL}/export/csv`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anxiety-navigator-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('匯出失敗', err);
    } finally {
      setExporting(false);
    }
  }

  async function handleLogoutClick() {
    await handleLogout();
    navigate('/login');
  }

  // Dynamic colour palette based on dark mode
  const c = isDark ? {
    page:        'transparent',
    card:        'rgba(41,37,36,0.85)',
    cardBorder:  '1.5px solid rgba(255,255,255,0.08)',
    heading:     '#f5f5f4',
    label:       '#a8a29e',
    text:        '#e7e5e4',
    textMid:     '#78716c',
    input:       'rgba(28,25,23,0.6)',
    inputBorder: '1.5px solid rgba(255,255,255,0.1)',
    successBg:   '#14532d22',
    successBorder:'#166534',
    successText: '#4ade80',
    errorBg:     '#7f1d1d22',
    errorBorder: '#991b1b',
    errorText:   '#f87171',
    submitBg:    '#7fb5a0',
    logoutBg:    'rgba(239,68,68,0.12)',
    logoutBorder:'rgba(239,68,68,0.3)',
    logoutText:  '#f87171',
    langBtn:     'rgba(255,255,255,0.06)',
    langBorder:  'rgba(255,255,255,0.1)',
    langText:    '#a8a29e',
  } : {
    page:        'transparent',
    card:        '#fff',
    cardBorder:  '1.5px solid #e8e0d0',
    heading:     '#2d3748',
    label:       '#9ca3af',
    text:        '#374151',
    textMid:     '#6b7280',
    input:       '#faf8f3',
    inputBorder: '1.5px solid #e8e0d0',
    successBg:   '#f0fdf4',
    successBorder:'#bbf7d0',
    successText: '#16a34a',
    errorBg:     '#fef2f2',
    errorBorder: '#fecaca',
    errorText:   '#dc2626',
    submitBg:    '#7fb5a0',
    logoutBg:    '#fef2f2',
    logoutBorder:'#fecaca',
    logoutText:  '#dc2626',
    langBtn:     '#f5f3f0',
    langBorder:  '#e8e0d0',
    langText:    '#6b7280',
  };

  return (
    <div style={{ ...s.page }}>
      <button style={{ ...s.back, color: '#7fb5a0' }} onClick={() => navigate('/')}>{t.backToHome}</button>
      <h2 style={{ ...s.heading, color: c.heading }}>{t.accountSettings}</h2>

      {/* Profile */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.profile}</p>
        <div style={s.avatar}>
          {/* Hidden file input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          {/* Clickable avatar circle with camera badge */}
          <div
            style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
            title="點擊更換頭貼"
          >
            <div style={{ ...s.avatarCircle, overflow: 'hidden' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : (displayName ? displayName[0].toUpperCase() : email ? email[0].toUpperCase() : '?')
              }
            </div>
            {/* Camera badge */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 20, height: 20, borderRadius: '50%',
              background: '#7fb5a0',
              border: `2px solid ${c.card}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarUploading
                ? <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
              }
            </div>
          </div>
          <div>
            <p style={{ ...s.avatarName, color: c.text }}>{displayName || t.noDisplayName}</p>
            <p style={{ ...s.avatarEmail, color: c.textMid }}>{email}</p>
          </div>
        </div>
        <form onSubmit={handleSaveName} style={s.form}>
          <div style={s.field}>
            <label style={{ ...s.label, color: c.text }}>{t.displayName}</label>
            <input style={{ ...s.input, background: c.input, border: c.inputBorder, color: c.text }} type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={t.displayNamePlaceholder} maxLength={30} autoComplete="nickname" />
          </div>
          {nameMsg && <div style={{ ...s.msgBox, background: nameMsg.type === 'success' ? c.successBg : c.errorBg, border: `1px solid ${nameMsg.type === 'success' ? c.successBorder : c.errorBorder}`, color: nameMsg.type === 'success' ? c.successText : c.errorText }}>{nameMsg.text}</div>}
          <button type="submit" style={{ ...s.submitBtn, background: c.submitBg }} disabled={nameSaving || !nameInput.trim()}>{nameSaving ? t.savingName : t.saveName}</button>
        </form>
      </div>

      {/* Password */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.changePassword}</p>
        <form onSubmit={handleChangePassword} style={s.form}>
          <div style={s.field}>
            <label style={{ ...s.label, color: c.text }}>{t.currentPassword}</label>
            <input style={{ ...s.input, background: c.input, border: c.inputBorder, color: c.text }} type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder={t.currentPasswordPlaceholder} autoComplete="current-password" />
          </div>
          <div style={s.field}>
            <label style={{ ...s.label, color: c.text }}>{t.newPassword}</label>
            <input style={{ ...s.input, background: c.input, border: c.inputBorder, color: c.text }} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t.atLeast8} autoComplete="new-password" />
          </div>
          {pwMsg && <div style={{ ...s.msgBox, background: pwMsg.type === 'success' ? c.successBg : c.errorBg, border: `1px solid ${pwMsg.type === 'success' ? c.successBorder : c.errorBorder}`, color: pwMsg.type === 'success' ? c.successText : c.errorText }}>{pwMsg.text}</div>}
          <button type="submit" style={{ ...s.submitBtn, background: c.submitBg }} disabled={pwLoading}>{pwLoading ? t.updating : t.updatePassword}</button>
        </form>
      </div>

      {/* Language */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.language}</p>
        <div style={s.langRow}>
          {['zh', 'en'].map((l) => (
            <button key={l} onClick={() => setLang(l)} style={lang === l ? { ...s.langBtnActive } : { ...s.langBtn, background: c.langBtn, border: `1.5px solid ${c.langBorder}`, color: c.langText }}>
              {l === 'zh' ? '中文' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Appearance / Theme */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.themeLabel}</p>
        <div style={s.themeRow}>
          {[
            { key: 'light', label: t.themeLight, icon: <SunIcon /> },
            { key: 'dark',  label: t.themeDark,  icon: <MoonIcon /> },
            { key: 'system',label: t.themeSystem,icon: <MonitorIcon /> },
          ].map(({ key, label, icon }) => {
            const active = theme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  ...s.themeBtn,
                  background: active ? '#7fb5a0' : c.langBtn,
                  border: `1.5px solid ${active ? '#7fb5a0' : c.langBorder}`,
                  color: active ? '#fff' : c.langText,
                  boxShadow: active ? '0 2px 8px rgba(127,181,160,0.35)' : 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.7 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.feedbackLabel}</p>
        <form onSubmit={handleSubmitFeedback} style={s.form}>
          <textarea style={{ ...s.textarea, background: c.input, border: c.inputBorder, color: c.text }} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder={t.feedbackPlaceholder} rows={4} maxLength={1000} />
          {feedbackMsg && <div style={{ ...s.msgBox, background: feedbackMsg.type === 'success' ? c.successBg : c.errorBg, border: `1px solid ${feedbackMsg.type === 'success' ? c.successBorder : c.errorBorder}`, color: feedbackMsg.type === 'success' ? c.successText : c.errorText }}>{feedbackMsg.text}</div>}
          <button type="submit" style={{ ...s.submitBtn, background: c.submitBg, opacity: feedbackLoading || !feedbackText.trim() ? 0.6 : 1 }} disabled={feedbackLoading || !feedbackText.trim()}>{feedbackLoading ? t.feedbackSubmitting : t.feedbackSubmit}</button>
        </form>
      </div>

      {/* Subscription */}
      {isLoggedIn && (() => {
        const isPro = subscriptionPlan === 'pro';
        const stripeMonthly = import.meta.env.VITE_STRIPE_MONTHLY_LINK;
        const stripeYearly  = import.meta.env.VITE_STRIPE_YEARLY_LINK;
        const upgradeLink   = billing === 'yearly' ? stripeYearly : stripeMonthly;

        return (
          <div style={{ ...s.section, background: c.card, border: isPro ? '1.5px solid rgba(127,181,160,0.5)' : c.cardBorder }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ ...s.sectionLabel, color: c.label, marginBottom: 0 }}>{t.subscriptionLabel}</p>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                background: isPro ? 'rgba(127,181,160,0.15)' : (isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                color: isPro ? '#7fb5a0' : c.textMid,
                border: isPro ? '1px solid rgba(127,181,160,0.3)' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              }}>
                {isPro ? `✨ ${t.planPro}` : t.planFree}
              </span>
            </div>

            {!isPro && (
              /* Billing toggle */
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', borderRadius: 10, padding: 3, marginBottom: 16 }}>
                {['monthly', 'yearly'].map((b) => (
                  <button key={b} onClick={() => setBilling(b)} style={{
                    flex: 1, border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13,
                    fontWeight: billing === b ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
                    background: billing === b ? (isDark ? 'rgba(127,181,160,0.2)' : '#fff') : 'transparent',
                    color: billing === b ? '#7fb5a0' : c.textMid,
                    boxShadow: billing === b ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {b === 'monthly' ? t.billingMonthly : `${t.billingYearly} · ${t.yearlyDiscount}`}
                  </button>
                ))}
              </div>
            )}

            {/* Price */}
            {!isPro && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#7fb5a0' }}>
                  {billing === 'monthly' ? 'NT$99' : 'NT$660'}
                </span>
                <span style={{ fontSize: 13, color: c.textMid, marginLeft: 4 }}>
                  {billing === 'monthly' ? '/ 月' : '/ 年'}
                </span>
              </div>
            )}

            {/* Feature lists side by side */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {/* Free column */}
              <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f3', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: c.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.planFree}</p>
                {t.freeFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                    <span style={{ color: '#7fb5a0', fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: c.text, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pro column */}
              <div style={{
                flex: 1, borderRadius: 12, padding: '12px 14px',
                background: isPro ? 'rgba(127,181,160,0.08)' : (isDark ? 'rgba(127,181,160,0.07)' : '#f0f9f6'),
                border: isPro ? '1px solid rgba(127,181,160,0.25)' : '1px solid rgba(127,181,160,0.15)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7fb5a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>✨ {t.planPro}</p>
                {t.proFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                    <span style={{ color: '#7fb5a0', fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: c.text, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isPro ? (
                <button
                  style={{ ...s.submitBtn, background: 'transparent', color: '#7fb5a0', border: '1.5px solid rgba(127,181,160,0.4)', padding: '12px 32px', width: 'auto' }}
                  onClick={() => window.open(stripeMonthly || '#', '_blank')}
                >
                  {t.manageBtn}
                </button>
              ) : (
                <button
                  style={{ ...s.submitBtn, background: upgradeLink ? '#7fb5a0' : '#a8c8be', cursor: upgradeLink ? 'pointer' : 'default', padding: '12px 36px', width: 'auto' }}
                  onClick={() => upgradeLink && window.open(upgradeLink, '_blank')}
                  title={!upgradeLink ? '請設定 VITE_STRIPE_MONTHLY_LINK / VITE_STRIPE_YEARLY_LINK' : undefined}
                >
                  {upgradeLink ? t.upgradeBtn : `${t.upgradeBtn} (即將開放)`}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Export */}
      {isLoggedIn && (
        <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
          <p style={{ ...s.sectionLabel, color: c.label }}>{t.weeklyReportLabel}</p>
          <p style={{ fontSize: 13, color: c.label, marginBottom: 12, lineHeight: 1.6 }}>{t.weeklyReportDesc}</p>
          <button onClick={() => navigate('/report')} style={{ ...s.submitBtn, background: c.submitBg }}>
            {t.viewWeeklyReport}
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
          <p style={{ ...s.sectionLabel, color: c.label }}>{t.exportData.replace(' (CSV)', '')}</p>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            style={{ ...s.submitBtn, background: exporting ? '#5a9a87' : c.submitBg, opacity: exporting ? 0.7 : 1 }}
          >
            {exporting ? t.exporting : t.exportData}
          </button>
        </div>
      )}

      {/* Logout */}
      <div style={{ ...s.section, background: c.card, border: c.cardBorder }}>
        <p style={{ ...s.sectionLabel, color: c.label }}>{t.accountActions}</p>
        <button style={{ ...s.logoutBtn, background: c.logoutBg, border: `1.5px solid ${c.logoutBorder}`, color: c.logoutText }} onClick={handleLogoutClick}>{t.signOut}</button>
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
  input: { borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none', transition: 'background 0.3s, border-color 0.3s' },
  textarea: { borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: 'background 0.3s, border-color 0.3s' },
  msgBox: { borderRadius: 8, padding: '10px 14px', fontSize: 14 },
  submitBtn: { border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'opacity 0.2s, background 0.3s' },
  langRow: { display: 'flex', gap: 10 },
  langBtn: { flex: 1, borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s, color 0.2s' },
  langBtnActive: { flex: 1, background: '#7fb5a0', border: '1.5px solid #7fb5a0', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  logoutBtn: { borderRadius: 10, padding: '11px 20px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%', transition: 'background 0.2s' },
  themeRow: { display: 'flex', gap: 10 },
  themeBtn: { flex: 1, borderRadius: 12, padding: '12px 8px', fontSize: 13, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'background 0.25s, color 0.25s, box-shadow 0.25s' },
};

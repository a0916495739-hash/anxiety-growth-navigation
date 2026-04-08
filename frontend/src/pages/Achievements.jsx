import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAchievement, getAchievements, deleteAchievement } from '../api/achievements';
import { IllustrationDone, IllustrationAchievement } from '../components/Illustrations';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';
import PolaroidExport from '../components/PolaroidExport';

export function AchievementNew() {
  const [title, setTitle] = useState('');
  const [standard, setStandard] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const c = isDark ? {
    card: 'rgba(41,37,36,0.85)', border: 'rgba(255,255,255,0.08)',
    text: '#e7e5e4', sub: '#a8a29e', input: 'rgba(28,25,23,0.6)',
    inputBorder: 'rgba(255,255,255,0.1)',
  } : {
    card: '#fff', border: '#e8e0d0',
    text: '#2d3748', sub: '#6b7280', input: '#faf8f3',
    inputBorder: '#e8e0d0',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError(t.achievementRequired); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      await createAchievement({ title, my_standard: standard || undefined });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return (
    <div style={styles.page}>
      {showExport && (
        <PolaroidExport
          achievementText={title}
          standard={standard}
          onClose={() => setShowExport(false)}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IllustrationDone width={140} />
      </div>
      <h2 style={{ ...styles.heading, textAlign: 'center', color: c.text }}>{t.wellDone}</h2>
      <p style={{ ...styles.sub, color: c.sub }}>{t.wellDoneDesc}</p>
      <button
        style={{
          ...styles.btn,
          background: 'transparent',
          border: '1.5px solid #7fb5a0',
          color: '#7fb5a0',
          marginBottom: 10,
        }}
        onClick={() => setShowExport(true)}
      >
        儲存為拍立得 📸
      </button>
      <button style={styles.btn} onClick={() => navigate('/achievements')}>{t.viewMyAchievements}</button>
      <button style={{ ...styles.ghost, color: c.sub }} onClick={() => navigate('/')}>{t.backHome}</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
      <h2 style={{ ...styles.heading, color: c.text }}>{t.logSmallWinTitle}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={{ ...styles.label, color: c.text }}>{t.whatAccomplished}</label>
        <input
          style={{ ...styles.input, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.text }}
          placeholder={t.achievementPlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {error && <p style={styles.error}>{error}</p>}
        <label style={{ ...styles.label, color: c.text }}>{t.whyAchievement}</label>
        <textarea
          style={{ ...styles.textarea, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.text }}
          placeholder={t.whyAchievementPlaceholder}
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
          rows={3}
        />
        <button type="submit" style={styles.btn} disabled={submitting}>
          {submitting ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
}

export function AchievementList() {
  const [achievements, setAchievements] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const navigate = useNavigate();

  useEffect(() => {
    getAchievements().then((r) => setAchievements(r.data)).catch(() => setAchievements([]));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t.deleteAchievementConfirm)) return;
    setDeletingId(id);
    try {
      await deleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const c = isDark ? {
    page: 'transparent', text: '#f5f5f4', sub: '#a8a29e',
  } : {
    page: 'transparent', text: '#2d3748', sub: '#6b7280',
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
        <h2 style={{ ...styles.heading, color: c.text }}>{t.myAchievements}</h2>
        <button style={styles.addBtn} onClick={() => navigate('/achievements/new')}>{t.add}</button>
      </div>

      {achievements === null && <p style={{ color: c.sub }}>{t.loading}</p>}
      {achievements?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationAchievement width={150} />
          <p style={{ ...styles.emptyTitle, color: c.text }}>{t.noAchievements}</p>
          <p style={{ ...styles.emptyDesc, color: c.sub }}>{t.achievementsEmptyDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/achievements/new')}>{t.firstAchievement}</button>
        </div>
      )}

      {/* Polaroid card grid */}
      <div style={styles.cardGrid}>
        {achievements?.map((a, idx) => (
          <PolaroidCard
            key={a.id}
            achievement={a}
            idx={idx}
            isDark={isDark}
            locale={locale}
            t={t}
            onDelete={() => handleDelete(a.id)}
            deleting={deletingId === a.id}
          />
        ))}
      </div>
    </div>
  );
}

function PolaroidCard({ achievement: a, idx, isDark, locale, t, onDelete, deleting }) {
  const [showExport, setShowExport] = useState(false);
  const encourage = t.achievementEncourage[a.id % t.achievementEncourage.length];
  const tilt = idx % 2 === 0 ? '-1.2deg' : '1.4deg';

  const cardBg = isDark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.82)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)';
  const textColor = isDark ? '#f5f5f4' : '#2d3748';
  const subColor = isDark ? '#a8a29e' : '#9ca3af';

  return (
    <div
      style={{
        ...styles.polaroid,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        transform: `rotate(${tilt})`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {showExport && (
        <PolaroidExport
          achievementText={a.title}
          standard={a.my_standard}
          onClose={() => setShowExport(false)}
        />
      )}
      {/* Photo area */}
      <div style={{ ...styles.polaroidPhoto, background: isDark ? 'rgba(255,255,255,0.04)' : '#faf7f4' }}>
        <span style={styles.polaroidEmoji}>✨</span>
        <p style={{ ...styles.polaroidDate, color: subColor }}>
          {new Date(a.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Caption area */}
      <div style={styles.polaroidCaption}>
        <p style={{ ...styles.polaroidTitle, color: textColor }}>{a.title}</p>
        {a.my_standard && (
          <p style={{ ...styles.polaroidStandard, color: subColor }}>「{a.my_standard}」</p>
        )}
        <p style={{ ...styles.polaroidEncourage, color: '#7fb5a0' }}>{encourage}</p>
        <button
          data-small
          onClick={() => setShowExport(true)}
          style={{
            marginTop: 8, width: '100%',
            background: 'transparent',
            border: `1px solid ${isDark ? 'rgba(127,181,160,0.3)' : '#b8d9cf'}`,
            color: '#7fb5a0', borderRadius: 6,
            padding: '4px 0', fontSize: 11,
            cursor: 'pointer',
          }}
        >
          📸 儲存圖片
        </button>
      </div>

      {/* Delete */}
      <button
        data-small
        style={{ ...styles.polaroidDelete, color: isDark ? '#78716c' : '#d1d5db' }}
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? '...' : '×'}
      </button>
    </div>
  );
}

const styles = {
  page: { maxWidth: 600, margin: '0 auto', padding: 24 },
  heading: { fontSize: 22, marginBottom: 8, margin: 0 },
  sub: { marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontWeight: 500, fontSize: 15 },
  input: { padding: '10px 14px', borderRadius: 10, fontSize: 15, outline: 'none' },
  textarea: { padding: '10px 14px', borderRadius: 10, fontSize: 15, resize: 'vertical', outline: 'none' },
  error: { color: '#ef4444', fontSize: 14, margin: 0 },
  btn: { display: 'block', width: '100%', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', cursor: 'pointer', fontSize: 15, fontWeight: 600, marginBottom: 10 },
  ghost: { display: 'block', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, padding: '10px' },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 16px', display: 'block' },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  addBtn: { marginLeft: 'auto', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  empty: { textAlign: 'center', paddingTop: 40 },
  emptyTitle: { fontWeight: 600, fontSize: 16, marginBottom: 6 },
  emptyDesc: { fontSize: 14, marginBottom: 20, whiteSpace: 'pre-line', lineHeight: 1.7 },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 24,
    padding: '8px 4px 40px',
  },
  polaroid: {
    position: 'relative',
    borderRadius: 4,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '10px 10px 14px',
    cursor: 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  polaroidPhoto: {
    borderRadius: 2,
    height: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  polaroidEmoji: { fontSize: 32 },
  polaroidDate: { fontSize: 11, fontWeight: 500, letterSpacing: 0.3, margin: 0 },
  polaroidCaption: { padding: '0 2px' },
  polaroidTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.4 },
  polaroidStandard: { fontSize: 11, fontStyle: 'italic', margin: '0 0 6px', lineHeight: 1.4 },
  polaroidEncourage: { fontSize: 11, fontWeight: 500, margin: 0 },
  polaroidDelete: {
    position: 'absolute',
    top: 6, right: 8,
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    opacity: 0.5,
  },
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAchievement, getAchievements, deleteAchievement } from '../api/achievements';
import { IllustrationDone, IllustrationAchievement } from '../components/Illustrations';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

export function AchievementNew() {
  const [title, setTitle] = useState('');
  const [standard, setStandard] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useApp();
  const t = getT(lang);
  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const navigate = useNavigate();

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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IllustrationDone width={140} />
      </div>
      <h2 style={{ ...styles.heading, textAlign: 'center' }}>{t.wellDone}</h2>
      <p style={styles.sub}>{t.wellDoneDesc}</p>
      <button style={styles.btn} onClick={() => navigate('/achievements')}>{t.viewMyAchievements}</button>
      <button style={styles.ghost} onClick={() => navigate('/')}>{t.backHome}</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
      <h2 style={styles.heading}>{t.logSmallWinTitle}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>{t.whatAccomplished}</label>
        <input style={styles.input} placeholder={t.achievementPlaceholder}
          value={title} onChange={(e) => setTitle(e.target.value)} />
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label}>{t.whyAchievement}</label>
        <textarea style={styles.textarea} placeholder={t.whyAchievementPlaceholder}
          value={standard} onChange={(e) => setStandard(e.target.value)} rows={3} />
        <button type="submit" style={styles.submitBtn} disabled={submitting}>
          {submitting ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
}

export function AchievementList() {
  const [achievements, setAchievements] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { lang } = useApp();
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

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
        <h2 style={styles.heading}>{t.myAchievements}</h2>
        <button style={styles.addBtn} onClick={() => navigate('/achievements/new')}>{t.add}</button>
      </div>

      {achievements === null && <p>{t.loading}</p>}
      {achievements?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationAchievement width={150} />
          <p style={styles.emptyTitle}>{t.noAchievements}</p>
          <p style={styles.emptyDesc}>{t.achievementsEmptyDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/achievements/new')}>{t.firstAchievement}</button>
        </div>
      )}

      <div style={styles.timeline}>
        {achievements?.map((a) => (
          <div key={a.id} style={styles.item}>
            <div style={styles.dot} />
            <div style={styles.content}>
              <div style={styles.itemHeader}>
                <p style={styles.date}>{new Date(a.created_at).toLocaleDateString(locale)}</p>
                <button style={styles.deleteBtn} onClick={() => handleDelete(a.id)} disabled={deletingId === a.id}>
                  {deletingId === a.id ? '...' : t.delete}
                </button>
              </div>
              <p style={styles.title}>{a.title}</p>
              {a.my_standard && <p style={styles.standard}>「{a.my_standard}」</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: 24 },
  heading: { fontSize: 22, marginBottom: 8, margin: 0 },
  sub: { color: '#6b7280', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontWeight: 500, fontSize: 15 },
  input: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 },
  textarea: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, resize: 'vertical' },
  error: { color: '#dc2626', fontSize: 14 },
  submitBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: 15 },
  successIcon: { fontSize: 56, textAlign: 'center' },
  btn: { display: 'block', width: '100%', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: 15, marginBottom: 10 },
  ghost: { display: 'block', width: '100%', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 15 },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 16px', display: 'block' },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  addBtn: { marginLeft: 'auto', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },
  empty: { textAlign: 'center', paddingTop: 40 },
  emptyTitle: { fontWeight: 600, fontSize: 16, color: '#374151', marginBottom: 6 },
  emptyDesc: { color: '#9ca3af', fontSize: 14, marginBottom: 20 },
  timeline: { position: 'relative', paddingLeft: 24 },
  item: { position: 'relative', marginBottom: 20, display: 'flex', gap: 14 },
  dot: { width: 10, height: 10, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 },
  content: { flex: 1 },
  itemHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  date: { color: '#9ca3af', fontSize: 13, margin: 0 },
  deleteBtn: { background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '2px 8px', fontSize: 12, cursor: 'pointer' },
  title: { fontWeight: 600, margin: '0 0 4px' },
  standard: { color: '#6b7280', fontSize: 14, fontStyle: 'italic', margin: 0 },
};

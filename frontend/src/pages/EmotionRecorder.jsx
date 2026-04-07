import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { createEmotion, getEmotionTrend, deleteEmotion } from '../api/emotions';
import { useApp } from '../context/AppContext';
import TagSelector from '../components/TagSelector';
import PromptCard from '../components/PromptCard';
import { IllustrationDone, IllustrationEmptyEmotion } from '../components/Illustrations';
import { getT } from '../i18n';
import { detectEmotion } from '../utils/emotionFilter';

function EmotionFeedback({ emotion }) {
  if (!emotion.type) return null;

  const isCritical = emotion.type === 'critical';
  const box = {
    marginBottom: 12,
    padding: '16px 18px',
    borderRadius: 18,
    background: isCritical
      ? 'rgba(255, 255, 255, 0.45)'
      : 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.65)',
    boxShadow: isCritical
      ? '0 4px 20px rgba(251, 113, 133, 0.15), inset 0 1px 1px rgba(255,255,255,0.8)'
      : '0 4px 20px rgba(134, 239, 172, 0.15), inset 0 1px 1px rgba(255,255,255,0.8)',
    animation: isCritical
      ? 'gentlePulse 2.8s ease-in-out infinite, fadeSlideIn 0.5s ease both'
      : 'fadeSlideIn 0.5s ease both',
  };

  return (
    <div style={box}>
      <p style={{
        fontSize: 14,
        color: isCritical ? '#be123c' : '#166534',
        lineHeight: 1.75,
        margin: 0,
        fontWeight: 500,
        letterSpacing: 0.1,
      }}>
        {emotion.message}
      </p>
      {isCritical && emotion.helpLink && (
        <a href={emotion.helpLink} target="_blank" rel="noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontSize: 12,
            background: 'rgba(225, 29, 72, 0.85)',
            color: '#fff',
            borderRadius: 99,
            padding: '4px 14px',
            fontWeight: 600,
            textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
          {emotion.helpLabel} →
        </a>
      )}
    </div>
  );
}

function BackButton({ onClick, label }) {
  return (
    <button style={styles.back} onClick={onClick}>{label}</button>
  );
}

// Mode selection screen
function ModeSelect({ onSelect, onBack, t }) {
  return (
    <div style={styles.page}>
      <BackButton onClick={onBack} label={t.back} />
      <h2 style={styles.heading}>{t.emotionRecorderTitle}</h2>
      <p style={styles.sub}>{t.howRecord}</p>
      <div style={styles.modeGrid}>
        <div style={styles.modeCard} onClick={() => onSelect('guided')}>
          <span style={styles.modeEmoji}>🧭</span>
          <h3>{t.guided}</h3>
          <p>{t.guidedDesc}</p>
        </div>
        <div style={styles.modeCard} onClick={() => onSelect('free')}>
          <span style={styles.modeEmoji}>✍️</span>
          <h3>{t.freeWrite}</h3>
          <p>{t.freeWriteDesc}</p>
        </div>
      </div>
    </div>
  );
}

// Guided mode: 3 steps
function GuidedForm({ onSubmit, onBack, t }) {
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState(null);
  const [trigger, setTrigger] = useState('');
  const [protection, setProtection] = useState('');
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const activeText = step === 2 ? trigger : step === 3 ? protection : '';
  const isCritical = detectEmotion(activeText).type === 'critical';

  function handleNext() {
    if (step === 1 && !intensity) return;
    setStep(step + 1);
  }

  function handleBack() {
    if (step === 1) onBack();
    else setStep(step - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await onSubmit({ mode: 'guided', intensity, trigger_event: trigger, protection, emotion_tags: tags });
  }

  return (
    <div style={{
      ...styles.page,
      background: isCritical ? 'rgba(255, 228, 230, 0.6)' : 'transparent',
      borderRadius: 20,
      transition: 'background 2s ease',
      padding: '20px 16px 60px',
    }}>
      <BackButton onClick={handleBack} label={t.back} />
      <h2 style={styles.heading}>{t.guidedRecording}</h2>
      <p style={styles.stepIndicator}>Step {step} / 3</p>

      {step === 1 && (
        <div>
          <p style={styles.question}>{t.intensityQ}</p>
          <div style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button"
                style={intensity === n ? styles.intensityActive : styles.intensityBtn}
                onClick={() => setIntensity(n)}>{n}</button>
            ))}
          </div>
          <p style={styles.hint}>{intensity ? t.intensityLabels[intensity - 1] : t.selectIntensity}</p>
          <button style={styles.nextBtn} onClick={handleNext} disabled={!intensity}>{t.continue}</button>
        </div>
      )}

      {step === 2 && (
        <form>
          <p style={styles.question}>{t.triggerQ}</p>
          <textarea style={styles.textarea} placeholder={t.triggerPlaceholder}
            value={trigger} onChange={(e) => setTrigger(e.target.value)} rows={4} />
          <EmotionFeedback emotion={detectEmotion(trigger)} />
          <button type="button" style={styles.nextBtn} onClick={() => setStep(3)}>{t.continue}</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <p style={styles.question}>{t.protectionQ}</p>
          <textarea style={styles.textarea} placeholder={t.protectionPlaceholder}
            value={protection} onChange={(e) => setProtection(e.target.value)} rows={4} />
          <EmotionFeedback emotion={detectEmotion(protection)} />
          <p style={styles.tagLabel}>{t.emotionTags}</p>
          <TagSelector selected={tags} onChange={setTags} presets={t.emotionDefaultTags}
            placeholder={t.tagCustomPlaceholder} addLabel={t.tagAddBtn} />
          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? t.saving : t.save}
          </button>
        </form>
      )}
    </div>
  );
}

// Free writing mode
function FreeForm({ onSubmit, onBack, t }) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emotion = detectEmotion(text);
  const isCritical = emotion.type === 'critical';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) { setError(t.emptyInput); return; }
    if (submitting) return;
    setSubmitting(true);
    await onSubmit({ mode: 'free', raw_emotion: text, emotion_tags: tags });
  }

  return (
    <div style={{
      ...styles.page,
      background: isCritical ? 'rgba(255, 228, 230, 0.6)' : 'transparent',
      borderRadius: 20,
      transition: 'background 2s ease',
      padding: '20px 16px 60px',
    }}>
      <BackButton onClick={onBack} label={t.back} />
      <h2 style={styles.heading}>{t.freeWrite}</h2>
      <p style={styles.sub}>{t.freeWriteSub}</p>
      <form onSubmit={handleSubmit}>
        <textarea style={{ ...styles.textarea, minHeight: 180 }}
          placeholder={t.freeWritePlaceholder} value={text}
          onChange={(e) => setText(e.target.value)} rows={7} />
        {error && <p style={styles.error}>{error}</p>}
        <EmotionFeedback emotion={emotion} />
        <p style={styles.tagLabel}>{t.emotionTags}</p>
        <TagSelector selected={tags} onChange={setTags} presets={t.emotionDefaultTags}
          placeholder={t.tagCustomPlaceholder} addLabel={t.tagAddBtn} />
        <button type="submit" style={styles.submitBtn} disabled={submitting}>
          {submitting ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
}

// Confetti particles for completion celebration
const CONFETTI_COLORS = ['#7fb5a0', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#f472b6'];
const CONFETTI_COUNT = 18;

function Confetti() {
  return (
    <div style={{ position: 'relative', height: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 0.6}s`;
        const duration = `${0.8 + Math.random() * 0.6}s`;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + Math.floor(Math.random() * 6);
        const shape = i % 3 === 0 ? '50%' : (i % 3 === 1 ? '2px' : '0%');
        return (
          <div key={i} style={{
            position: 'absolute',
            top: -20,
            left,
            width: size,
            height: size,
            background: color,
            borderRadius: shape,
            animation: `confettiFall ${duration} ${delay} ease-in forwards`,
          }} />
        );
      })}
    </div>
  );
}

// Completion screen
function CompletionScreen({ todayCount, t }) {
  const navigate = useNavigate();
  const [showAchievementPrompt, setShowAchievementPrompt] = useState(todayCount >= 3);
  const [showConflictPrompt, setShowConflictPrompt] = useState(true);
  const [message] = useState(
    () => t.surpriseMessages[Math.floor(Math.random() * t.surpriseMessages.length)]
  );

  return (
    <div style={{ ...styles.page, animation: 'completionEnter 0.4s ease both' }}>
      <Confetti />
      <div style={{ display: 'flex', justifyContent: 'center', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <IllustrationDone width={140} />
      </div>
      <h2 style={{ ...styles.heading, textAlign: 'center', animation: 'popIn 0.5s 0.15s both' }}>{t.recordDone}</h2>
      <p style={{ ...styles.sub, textAlign: 'center', animation: 'popIn 0.5s 0.25s both' }}>{message}</p>

      {showAchievementPrompt && (
        <PromptCard
          message={t.achievementPrompt(todayCount)}
          buttonLabel={t.logSmallWin}
          to="/achievements/new"
          onDismiss={() => setShowAchievementPrompt(false)}
        />
      )}

      {showConflictPrompt && (
        <div style={styles.conflictHint}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/conflicts/new')}>
            {t.conflictPrompt}
          </button>
          <button style={styles.ghostBtn} onClick={() => setShowConflictPrompt(false)}>{t.skip}</button>
        </div>
      )}

      <button style={styles.homeBtn} onClick={() => navigate('/')}>{t.backHome}</button>
    </div>
  );
}

export default function EmotionRecorder() {
  const [mode, setMode] = useState(null);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { todayCount, incrementTodayCount, lang } = useApp();
  const t = getT(lang);
  const [finalCount, setFinalCount] = useState(todayCount);
  const navigate = useNavigate();

  async function handleSubmit(data) {
    setExiting(true);
    await createEmotion(data);
    incrementTodayCount();
    setFinalCount(todayCount + 1);
    await new Promise((r) => setTimeout(r, 320));
    setDone(true);
  }

  if (done) return <CompletionScreen todayCount={finalCount} t={t} />;

  const exitStyle = exiting ? { animation: 'formExit 0.32s ease forwards', pointerEvents: 'none' } : {};
  if (!mode) return <div style={exitStyle}><ModeSelect onSelect={setMode} onBack={() => navigate('/')} t={t} /></div>;
  if (mode === 'guided') return <div style={exitStyle}><GuidedForm onSubmit={handleSubmit} onBack={() => setMode(null)} t={t} /></div>;
  return <div style={exitStyle}><FreeForm onSubmit={handleSubmit} onBack={() => setMode(null)} t={t} /></div>;
}

// History page
export function EmotionHistory() {
  const [records, setRecords] = useState(null);
  const [trend, setTrend] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const { lang } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();
  const locale = lang === 'en' ? 'en-US' : 'zh-TW';

  useEffect(() => {
    import('../api/emotions').then(({ getEmotions }) =>
      getEmotions().then((r) => setRecords(r.data)).catch(() => setRecords([]))
    );
    getEmotionTrend().then((r) => setTrend(r.data)).catch(() => {});
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t.deleteRecordConfirm)) return;
    setDeletingId(id);
    try {
      await deleteEmotion(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const intensityKey = t.avgIntensity;
  const trendData = trend.map((d) => ({
    day: new Date(d.day).toLocaleDateString(locale, { month: 'numeric', day: 'numeric' }),
    [intensityKey]: parseFloat(d.avg_intensity),
  }));

  return (
    <div style={styles.page}>
      <BackButton onClick={() => navigate('/')} label={t.back} />
      <h2 style={styles.heading}>{t.emotionHistoryTitle}</h2>

      {trendData.length >= 2 && (
        <div style={styles.trendCard}>
          <p style={styles.trendTitle}>{t.trendTitle}</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e8e0d0', background: '#fff' }}
                formatter={(v) => [`${v} / 5`, intensityKey]}
              />
              <Line type="monotone" dataKey={intensityKey} stroke="#7fb5a0" strokeWidth={2.5} dot={{ r: 4, fill: '#7fb5a0' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {records === null && (
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>{t.loading}</p>
        </div>
      )}

      {records?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationEmptyEmotion width={150} />
          <p style={styles.emptyTitle}>{t.noEntries}</p>
          <p style={styles.emptyDesc}>{t.noEntriesDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/emotions')}>{t.startFirstRecord}</button>
        </div>
      )}

      {records?.map((r) => (
        <div key={r.id} style={styles.record}>
          <div style={styles.recordMeta}>
            <span style={styles.date}>{new Date(r.created_at).toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' })}</span>
            <span style={styles.badge}>{r.mode === 'guided' ? t.modeGuided : t.modeFree}</span>
            {r.intensity && <span style={styles.intensity}>{t.intensity(r.intensity)}</span>}
            <button style={styles.deleteBtn} onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}>
              {deletingId === r.id ? '...' : t.delete}
            </button>
          </div>
          <p style={styles.recordText}>{(r.raw_emotion || r.trigger_event || t.noText).slice(0, 100)}</p>
          {r.emotion_tags?.length > 0 && (
            <div style={styles.tagRow}>
              {r.emotion_tags.map((tag) => <span key={tag} style={styles.tag}>{tag}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px' },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 16px', display: 'block' },
  heading: { fontSize: 22, marginBottom: 8 },
  sub: { color: '#6b7280', marginBottom: 24 },
  modeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  modeCard: { background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 16px', cursor: 'pointer', textAlign: 'center' },
  modeEmoji: { fontSize: 32, display: 'block', marginBottom: 8 },
  stepIndicator: { color: '#9ca3af', fontSize: 13, marginBottom: 16, background: '#f3f4f6', display: 'inline-block', padding: '3px 10px', borderRadius: 99 },
  question: { fontSize: 17, fontWeight: 600, marginBottom: 16, color: '#2d3748' },
  hint: { color: '#6b7280', fontSize: 14, marginTop: 8, minHeight: 20 },
  intensityRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  intensityBtn: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #e5e7eb', background: '#f9fafb', fontSize: 17, cursor: 'pointer' },
  intensityActive: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #7fb5a0', background: '#7fb5a0', color: '#fff', fontSize: 17, cursor: 'pointer' },
  textarea: { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', background: '#faf8f3', lineHeight: 1.6 },
  tagLabel: { fontWeight: 500, marginBottom: 8, marginTop: 16, fontSize: 14, color: '#374151' },
  nextBtn: { marginTop: 16, background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 500 },
  submitBtn: { marginTop: 20, width: '100%', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', cursor: 'pointer', fontSize: 15, fontWeight: 600 },
  error: { color: '#dc2626', fontSize: 14, background: '#fef2f2', padding: '8px 12px', borderRadius: 8, marginTop: 4 },
  successIcon: { fontSize: 52, textAlign: 'center', color: '#7fb5a0', marginBottom: 4 },
  conflictHint: { display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' },
  secondaryBtn: { background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 },
  ghostBtn: { background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 14 },
  homeBtn: { marginTop: 24, display: 'block', width: '100%', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', cursor: 'pointer', fontSize: 15, fontWeight: 600 },
  loading: { textAlign: 'center', paddingTop: 60, color: '#9ca3af' },
  spinner: { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #7fb5a0', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' },
  empty: { textAlign: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 48, margin: '0 0 12px' },
  emptyTitle: { fontWeight: 600, fontSize: 16, color: '#374151', marginBottom: 6 },
  emptyDesc: { color: '#9ca3af', fontSize: 14, marginBottom: 20 },
  btn: { background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  trendCard: { background: '#fff', border: '1.5px solid #e8f4f0', borderRadius: 14, padding: '16px', marginBottom: 20 },
  trendTitle: { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 },
  record: { background: '#fff', border: '1.5px solid #e8f4f0', borderRadius: 12, padding: '14px 16px', marginBottom: 12 },
  recordMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  date: { color: '#9ca3af', fontSize: 12 },
  badge: { background: '#e8f4f0', color: '#4a9580', borderRadius: 99, padding: '2px 10px', fontSize: 12 },
  intensity: { color: '#6b7280', fontSize: 12, background: '#f3f4f6', borderRadius: 99, padding: '2px 8px' },
  recordText: { color: '#374151', fontSize: 14, lineHeight: 1.6 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { background: '#fef9c3', color: '#78600a', borderRadius: 99, padding: '2px 10px', fontSize: 12 },
  deleteBtn: { marginLeft: 'auto', background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '2px 10px', fontSize: 12, cursor: 'pointer' },
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { createEmotion, getEmotionTrend, deleteEmotion } from '../api/emotions';
import { useApp } from '../context/AppContext';
import TagSelector from '../components/TagSelector';
import PromptCard from '../components/PromptCard';
import { IllustrationDone, IllustrationEmptyEmotion } from '../components/Illustrations';

function BackButton({ onClick }) {
  return (
    <button style={styles.back} onClick={onClick}>← 上一頁</button>
  );
}

// Mode selection screen
function ModeSelect({ onSelect, onBack }) {
  return (
    <div style={styles.page}>
      <BackButton onClick={onBack} />
      <h2 style={styles.heading}>情緒除噪器</h2>
      <p style={styles.sub}>你今天想要怎麼記錄？</p>
      <div style={styles.modeGrid}>
        <div style={styles.modeCard} onClick={() => onSelect('guided')}>
          <span style={styles.modeEmoji}>🧭</span>
          <h3>引導我思考</h3>
          <p>三個問題，幫你看清情緒</p>
        </div>
        <div style={styles.modeCard} onClick={() => onSelect('free')}>
          <span style={styles.modeEmoji}>✍️</span>
          <h3>自由書寫</h3>
          <p>不受拘束，盡情傾訴</p>
        </div>
      </div>
    </div>
  );
}

// Guided mode: 3 steps
function GuidedForm({ onSubmit, onBack }) {
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState(null);
  const [trigger, setTrigger] = useState('');
  const [protection, setProtection] = useState('');
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
    await onSubmit({
      mode: 'guided',
      intensity,
      trigger_event: trigger,
      protection,
      emotion_tags: tags,
    });
  }

  return (
    <div style={styles.page}>
      <BackButton onClick={handleBack} />
      <h2 style={styles.heading}>引導式記錄</h2>
      <p style={styles.stepIndicator}>Step {step} / 3</p>

      {step === 1 && (
        <div>
          <p style={styles.question}>這個情緒有多強烈？</p>
          <div style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                style={intensity === n ? styles.intensityActive : styles.intensityBtn}
                onClick={() => setIntensity(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={styles.hint}>{intensity ? `${['很輕微', '有點強', '中等', '相當強', '非常強烈'][intensity - 1]}` : '請選擇強度'}</p>
          <button style={styles.nextBtn} onClick={handleNext} disabled={!intensity}>繼續</button>
        </div>
      )}

      {step === 2 && (
        <form>
          <p style={styles.question}>是什麼事情引發了這個情緒？</p>
          <textarea
            style={styles.textarea}
            placeholder="可以描述一下發生了什麼...(選填)"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            rows={4}
          />
          <button type="button" style={styles.nextBtn} onClick={() => setStep(3)}>繼續</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <p style={styles.question}>這個情緒在保護你什麼？</p>
          <textarea
            style={styles.textarea}
            placeholder="也許它在提醒你某件重要的事...(選填)"
            value={protection}
            onChange={(e) => setProtection(e.target.value)}
            rows={4}
          />
          <p style={styles.tagLabel}>情緒標籤（選填）</p>
          <TagSelector selected={tags} onChange={setTags} />
          <button type="submit" style={styles.submitBtn} disabled={submitting}>{submitting ? '記錄中...' : '完成記錄'}</button>
        </form>
      )}
    </div>
  );
}

// Free writing mode
function FreeForm({ onSubmit, onBack }) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) { setError('請輸入一些內容再送出'); return; }
    if (submitting) return;
    setSubmitting(true);
    await onSubmit({ mode: 'free', raw_emotion: text, emotion_tags: tags });
  }

  return (
    <div style={styles.page}>
      <BackButton onClick={onBack} />
      <h2 style={styles.heading}>自由書寫</h2>
      <p style={styles.sub}>把心裡的話都寫下來吧</p>
      <form onSubmit={handleSubmit}>
        <textarea
          style={{ ...styles.textarea, minHeight: 180 }}
          placeholder="今天發生了什麼？你感覺如何？"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
        />
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.tagLabel}>情緒標籤（選填）</p>
        <TagSelector selected={tags} onChange={setTags} />
        <button type="submit" style={styles.submitBtn} disabled={submitting}>{submitting ? '記錄中...' : '完成記錄'}</button>
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
function CompletionScreen({ todayCount }) {
  const navigate = useNavigate();
  const [showAchievementPrompt, setShowAchievementPrompt] = useState(todayCount >= 3);
  const [showConflictPrompt, setShowConflictPrompt] = useState(true);

  return (
    <div style={styles.page}>
      <Confetti />
      <div style={{ display: 'flex', justifyContent: 'center', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <IllustrationDone width={140} />
      </div>
      <h2 style={{ ...styles.heading, textAlign: 'center', animation: 'popIn 0.5s 0.15s both' }}>記錄完成</h2>
      <p style={{ ...styles.sub, textAlign: 'center', animation: 'popIn 0.5s 0.25s both' }}>你很勇敢，願意面對自己的情緒。</p>

      {showAchievementPrompt && (
        <PromptCard
          message={`你今天已經記錄了 ${todayCount} 次情緒，要不要停下來，紀錄一件今天還是做到的小事？`}
          buttonLabel="去記錄小成就"
          to="/achievements/new"
          onDismiss={() => setShowAchievementPrompt(false)}
        />
      )}

      {showConflictPrompt && (
        <div style={styles.conflictHint}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/conflicts/new')}>
            這是某個衝突造成的嗎？
          </button>
          <button style={styles.ghostBtn} onClick={() => setShowConflictPrompt(false)}>略過</button>
        </div>
      )}

      <button style={styles.homeBtn} onClick={() => navigate('/')}>回首頁</button>
    </div>
  );
}

export default function EmotionRecorder() {
  const [mode, setMode] = useState(null);
  const [done, setDone] = useState(false);
  const { todayCount, incrementTodayCount } = useApp();
  const [finalCount, setFinalCount] = useState(todayCount);
  const navigate = useNavigate();

  async function handleSubmit(data) {
    await createEmotion(data);
    incrementTodayCount();
    setFinalCount(todayCount + 1);
    setDone(true);
  }

  if (done) return <CompletionScreen todayCount={finalCount} />;
  if (!mode) return <ModeSelect onSelect={setMode} onBack={() => navigate('/')} />;
  if (mode === 'guided') return <GuidedForm onSubmit={handleSubmit} onBack={() => setMode(null)} />;
  return <FreeForm onSubmit={handleSubmit} onBack={() => setMode(null)} />;
}

// History page
export function EmotionHistory() {
  const [records, setRecords] = useState(null);
  const [trend, setTrend] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    import('../api/emotions').then(({ getEmotions }) =>
      getEmotions().then((r) => setRecords(r.data)).catch(() => setRecords([]))
    );
    getEmotionTrend().then((r) => setTrend(r.data)).catch(() => {});
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('確定要刪除這筆記錄嗎？')) return;
    setDeletingId(id);
    try {
      await deleteEmotion(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const trendData = trend.map((d) => ({
    day: new Date(d.day).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
    強度: parseFloat(d.avg_intensity),
  }));

  return (
    <div style={styles.page}>
      <BackButton onClick={() => navigate('/')} />
      <h2 style={styles.heading}>情緒記錄歷史</h2>

      {trendData.length >= 2 && (
        <div style={styles.trendCard}>
          <p style={styles.trendTitle}>近 7 天情緒強度趨勢</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e8e0d0', background: '#fff' }}
                formatter={(v) => [`${v} / 5`, '平均強度']}
              />
              <Line type="monotone" dataKey="強度" stroke="#7fb5a0" strokeWidth={2.5} dot={{ r: 4, fill: '#7fb5a0' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {records === null && (
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>載入中...</p>
        </div>
      )}

      {records?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationEmptyEmotion width={150} />
          <p style={styles.emptyTitle}>還沒有情緒記錄</p>
          <p style={styles.emptyDesc}>記錄你的第一次情緒，開始認識自己。</p>
          <button style={styles.btn} onClick={() => navigate('/emotions')}>開始第一次記錄</button>
        </div>
      )}

      {records?.map((r) => (
        <div key={r.id} style={styles.record}>
          <div style={styles.recordMeta}>
            <span style={styles.date}>{new Date(r.created_at).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
            <span style={styles.badge}>{r.mode === 'guided' ? '引導式' : '自由書寫'}</span>
            {r.intensity && <span style={styles.intensity}>強度 {r.intensity}/5</span>}
            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(r.id)}
              disabled={deletingId === r.id}
            >
              {deletingId === r.id ? '...' : '刪除'}
            </button>
          </div>
          <p style={styles.recordText}>{(r.raw_emotion || r.trigger_event || '（無文字記錄）').slice(0, 100)}</p>
          {r.emotion_tags?.length > 0 && (
            <div style={styles.tagRow}>
              {r.emotion_tags.map((t) => <span key={t} style={styles.tag}>{t}</span>)}
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

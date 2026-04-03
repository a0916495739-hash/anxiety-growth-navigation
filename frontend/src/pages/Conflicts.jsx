import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createConflict, getConflicts, getConflictStats, deleteConflict } from '../api/conflicts';
import TagSelector from '../components/TagSelector';
import { IllustrationDone, IllustrationEmptyConflict } from '../components/Illustrations';

const FEELING_TAGS = ['自由', '壓力', '期待', '委屈', '迷茫', '焦慮', '憤怒', '無奈', '不甘心'];
const SOURCE_OPTIONS = [
  { value: 'family', label: '家人' },
  { value: 'peers', label: '同儕/朋友' },
  { value: 'society', label: '社會期待' },
  { value: 'self', label: '自我要求' },
];
const CHOSEN_OPTIONS = [
  { value: 'should', label: '選了「應該」' },
  { value: 'want', label: '選了「想要」' },
  { value: 'neither', label: '都沒有' },
  { value: 'pending', label: '還沒決定' },
];
const PIE_COLORS = { family: '#6366f1', peers: '#f59e0b', society: '#10b981', self: '#ef4444' };

export function ConflictNew() {
  const [form, setForm] = useState({ should_content: '', want_content: '', source: '', feeling_tags: [], chosen: 'pending' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function set(key, val) { setForm((p) => ({ ...p, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.should_content.trim()) e.should_content = '請填寫「應該要」的內容';
    if (!form.want_content.trim()) e.want_content = '請填寫「但我想要」的內容';
    if (!form.source) e.source = '請選擇期望來源';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      await createConflict(form);
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
      <h2 style={{ ...styles.heading, textAlign: 'center' }}>記錄完成</h2>
      <p style={styles.sub}>看清楚衝突，是做出選擇的第一步。</p>
      <button style={styles.btn} onClick={() => navigate('/conflicts')}>查看歷史記錄</button>
      <button style={styles.ghost} onClick={() => navigate('/')}>回首頁</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>← 上一頁</button>
      <h2 style={styles.heading}>應該 vs 想要</h2>
      <p style={styles.sub}>記錄下這個讓你感到拉扯的時刻</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>我「應該」要...</label>
          <textarea style={styles.textarea} rows={3} value={form.should_content}
            onChange={(e) => set('should_content', e.target.value)} placeholder="填寫外在期望要你做的事" />
          {errors.should_content && <p style={styles.error}>{errors.should_content}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>但我「想要」...</label>
          <textarea style={styles.textarea} rows={3} value={form.want_content}
            onChange={(e) => set('want_content', e.target.value)} placeholder="填寫你內心真正想要的" />
          {errors.want_content && <p style={styles.error}>{errors.want_content}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>這個「應該」來自...</label>
          <div style={styles.optionRow}>
            {SOURCE_OPTIONS.map((o) => (
              <button key={o.value} type="button"
                style={form.source === o.value ? styles.optionActive : styles.option}
                onClick={() => set('source', o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          {errors.source && <p style={styles.error}>{errors.source}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>這個衝突讓我感到...（選填）</label>
          <TagSelector selected={form.feeling_tags} onChange={(v) => set('feeling_tags', v)} presets={FEELING_TAGS} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>今天我選擇了...（選填）</label>
          <div style={styles.optionRow}>
            {CHOSEN_OPTIONS.map((o) => (
              <button key={o.value} type="button"
                style={form.chosen === o.value ? styles.optionActive : styles.option}
                onClick={() => set('chosen', o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={submitting}>{submitting ? '記錄中...' : '記錄下來'}</button>
      </form>
    </div>
  );
}

export function ConflictList() {
  const [conflicts, setConflicts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getConflicts().then((r) => setConflicts(r.data)).catch(() => setConflicts([]));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('確定要刪除這筆衝突記錄嗎？')) return;
    setDeletingId(id);
    try {
      await deleteConflict(id);
      setConflicts((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>← 上一頁</button>
        <h2 style={styles.heading}>衝突紀錄</h2>
        <button style={styles.addBtn} onClick={() => navigate('/conflicts/new')}>+ 新增</button>
      </div>

      {conflicts === null && <p>載入中...</p>}
      {conflicts?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationEmptyConflict width={150} />
          <p style={styles.emptyTitle}>還沒有衝突記錄</p>
          <p style={styles.emptyDesc}>記錄下讓你感到拉扯的時刻，慢慢看清自己。</p>
          <button style={styles.btn} onClick={() => navigate('/conflicts/new')}>記錄第一個衝突</button>
        </div>
      )}

      {conflicts?.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.date}>{new Date(c.created_at).toLocaleDateString('zh-TW')}</p>
            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(c.id)}
              disabled={deletingId === c.id}
            >
              {deletingId === c.id ? '...' : '刪除'}
            </button>
          </div>
          <div style={styles.versus}>
            <div style={styles.should}><span style={styles.badge}>應該</span> {c.should_content}</div>
            <div style={styles.want}><span style={styles.badgeWant}>想要</span> {c.want_content}</div>
          </div>
          <div style={styles.meta}>
            <span style={styles.tag}>{SOURCE_OPTIONS.find((o) => o.value === c.source)?.label}</span>
            <span style={styles.tag}>{CHOSEN_OPTIONS.find((o) => o.value === c.chosen)?.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConflictStats() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getConflictStats().then((r) => setStats(r.data)).catch(() => setStats({}));
  }, []);

  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;
  const pieData = stats
    ? SOURCE_OPTIONS.map((o) => ({ name: o.label, value: stats[o.value] || 0, key: o.value })).filter((d) => d.value > 0)
    : [];

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>← 上一頁</button>
        <h2 style={styles.heading}>應該來源分析</h2>
      </div>

      {total === 0 ? (
        <div style={styles.empty}>
          <IllustrationEmptyConflict width={150} />
          <p style={styles.emptyTitle}>還沒有足夠的資料</p>
          <p style={styles.emptyDesc}>記錄幾個衝突時刻後，就能看到你的「應該」主要來自哪裡。</p>
          <button style={styles.btn} onClick={() => navigate('/conflicts/new')}>記錄第一個衝突</button>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.statList}>
            {SOURCE_OPTIONS.map((o) => (
              <div key={o.value} style={styles.statRow}>
                <span style={{ ...styles.dot, background: PIE_COLORS[o.value] }} />
                <span>{o.label}</span>
                <span style={styles.statCount}>{stats?.[o.value] || 0} 次</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: 24 },
  heading: { fontSize: 22, margin: 0 },
  sub: { color: '#6b7280', marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontWeight: 500, fontSize: 15 },
  textarea: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, resize: 'vertical' },
  error: { color: '#dc2626', fontSize: 13 },
  optionRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  option: { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 },
  optionActive: { background: '#6366f1', color: '#fff', border: '1px solid #6366f1', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 },
  submitBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: 15 },
  btn: { display: 'block', width: '100%', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: 15, marginBottom: 10 },
  ghost: { display: 'block', width: '100%', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 15 },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 16px', display: 'block' },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  addBtn: { marginLeft: 'auto', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },
  empty: { textAlign: 'center', paddingTop: 20 },
  emptyTitle: { fontWeight: 600, fontSize: 16, color: '#374151', marginBottom: 6 },
  emptyDesc: { color: '#9ca3af', fontSize: 14, marginBottom: 20 },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px', marginBottom: 14 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  date: { color: '#9ca3af', fontSize: 13, margin: 0 },
  deleteBtn: { background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '2px 8px', fontSize: 12, cursor: 'pointer' },
  versus: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 },
  should: { fontSize: 14, color: '#374151' },
  want: { fontSize: 14, color: '#374151' },
  badge: { background: '#fee2e2', color: '#dc2626', borderRadius: 10, padding: '2px 8px', fontSize: 12, marginRight: 6 },
  badgeWant: { background: '#dcfce7', color: '#16a34a', borderRadius: 10, padding: '2px 8px', fontSize: 12, marginRight: 6 },
  meta: { display: 'flex', gap: 8 },
  tag: { background: '#f3f4f6', color: '#6b7280', borderRadius: 10, padding: '2px 10px', fontSize: 12 },
  statList: { marginTop: 20 },
  statRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  statCount: { marginLeft: 'auto', fontWeight: 600 },
};

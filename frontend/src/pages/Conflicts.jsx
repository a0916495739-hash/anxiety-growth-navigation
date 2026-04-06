import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { createConflict, getConflicts, getConflictStats, deleteConflict } from '../api/conflicts';
import { getCorrelation } from '../api/stats';
import TagSelector from '../components/TagSelector';
import { IllustrationDone, IllustrationEmptyConflict } from '../components/Illustrations';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

const PIE_COLORS = { family: '#6366f1', peers: '#f59e0b', society: '#10b981', self: '#ef4444' };

export function ConflictNew() {
  const [form, setForm] = useState({ should_content: '', want_content: '', source: '', feeling_tags: [], chosen: 'pending' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  function set(key, val) { setForm((p) => ({ ...p, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.should_content.trim()) e.should_content = t.shouldRequired;
    if (!form.want_content.trim()) e.want_content = t.wantRequired;
    if (!form.source) e.source = t.sourceRequired;
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
      <h2 style={{ ...styles.heading, textAlign: 'center' }}>{t.conflictSaved}</h2>
      <p style={styles.sub}>{t.conflictSavedDesc}</p>
      <button style={styles.btn} onClick={() => navigate('/conflicts')}>{t.viewHistory}</button>
      <button style={styles.ghost} onClick={() => navigate('/')}>{t.backHome}</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
      <h2 style={styles.heading}>{t.shouldVsWant}</h2>
      <p style={styles.sub}>{t.conflictSub}</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.shouldLabel}</label>
          <textarea style={styles.textarea} rows={3} value={form.should_content}
            onChange={(e) => set('should_content', e.target.value)} placeholder={t.shouldPlaceholder} />
          {errors.should_content && <p style={styles.error}>{errors.should_content}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.wantLabel}</label>
          <textarea style={styles.textarea} rows={3} value={form.want_content}
            onChange={(e) => set('want_content', e.target.value)} placeholder={t.wantPlaceholder} />
          {errors.want_content && <p style={styles.error}>{errors.want_content}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.sourceLabel}</label>
          <div style={styles.optionRow}>
            {t.sourceOptions.map((o) => (
              <button key={o.value} type="button"
                style={form.source === o.value ? styles.optionActive : styles.option}
                onClick={() => set('source', o.value)}>{o.label}</button>
            ))}
          </div>
          {errors.source && <p style={styles.error}>{errors.source}</p>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.feelingLabel}</label>
          <TagSelector selected={form.feeling_tags} onChange={(v) => set('feeling_tags', v)}
            presets={t.feelingTags} placeholder={t.tagCustomPlaceholder} addLabel={t.tagAddBtn} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.chosenLabel}</label>
          <div style={styles.optionRow}>
            {t.chosenOptions.map((o) => (
              <button key={o.value} type="button"
                style={form.chosen === o.value ? styles.optionActive : styles.option}
                onClick={() => set('chosen', o.value)}>{o.label}</button>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={submitting}>
          {submitting ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
}

export function ConflictList() {
  const [conflicts, setConflicts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { lang } = useApp();
  const t = getT(lang);
  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const navigate = useNavigate();

  useEffect(() => {
    getConflicts().then((r) => setConflicts(r.data)).catch(() => setConflicts([]));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t.deleteConflictConfirm)) return;
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
        <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
        <h2 style={styles.heading}>{t.conflictListTitle}</h2>
        <button style={styles.addBtn} onClick={() => navigate('/conflicts/new')}>{t.add}</button>
      </div>

      {conflicts === null && <p>{t.loading}</p>}
      {conflicts?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationEmptyConflict width={150} />
          <p style={styles.emptyTitle}>{t.noConflicts}</p>
          <p style={styles.emptyDesc}>{t.conflictsEmptyDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/conflicts/new')}>{t.firstConflict}</button>
        </div>
      )}

      {conflicts?.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.date}>{new Date(c.created_at).toLocaleDateString(locale)}</p>
            <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
              {deletingId === c.id ? '...' : t.delete}
            </button>
          </div>
          <div style={styles.versus}>
            <div style={styles.should}><span style={styles.badge}>{t.shouldBadge}</span> {c.should_content}</div>
            <div style={styles.want}><span style={styles.badgeWant}>{t.wantBadge}</span> {c.want_content}</div>
          </div>
          <div style={styles.meta}>
            <span style={styles.tag}>{t.sourceOptions.find((o) => o.value === c.source)?.label}</span>
            <span style={styles.tag}>{t.chosenOptions.find((o) => o.value === c.chosen)?.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConflictStats() {
  const [stats, setStats] = useState(null);
  const [correlation, setCorrelation] = useState([]);
  const { lang } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  useEffect(() => {
    getConflictStats().then((r) => setStats(r.data)).catch(() => setStats({}));
    getCorrelation().then((r) => setCorrelation(r.data)).catch(() => {});
  }, []);

  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;
  const pieData = stats
    ? t.sourceOptions.map((o) => ({ name: o.label, value: stats[o.value] || 0, key: o.value })).filter((d) => d.value > 0)
    : [];

  const dominant = stats
    ? t.sourceOptions.reduce((best, o) => (!best || (stats[o.value] || 0) > (stats[best.value] || 0) ? o : best), null)
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
        <h2 style={styles.heading}>{t.conflictStatsTitle}</h2>
        <button style={styles.addBtn} onClick={() => navigate('/conflicts')}>{t.historyBtn}</button>
      </div>

      {total === 0 ? (
        <div style={styles.empty}>
          <IllustrationEmptyConflict width={150} />
          <p style={styles.emptyTitle}>{t.notEnoughData}</p>
          <p style={styles.emptyDesc}>{t.notEnoughDataDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/conflicts/new')}>{t.firstConflict}</button>
        </div>
      ) : (
        <>
          {dominant && total >= 2 && (
            <div style={{ ...styles.insightCard, borderColor: PIE_COLORS[dominant.value] + '60', background: PIE_COLORS[dominant.value] + '0d' }}>
              <div style={styles.insightHeader}>
                <span style={{ ...styles.insightBadge, background: PIE_COLORS[dominant.value] }}>
                  {t.primarySource(dominant.label)}
                </span>
                <span style={styles.insightPct}>
                  {Math.round(((stats[dominant.value] || 0) / total) * 100)}%
                </span>
              </div>
              <p style={styles.insightText}>{t.sourceInsights[dominant.value]}</p>
            </div>
          )}

          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={95} innerRadius={40} paddingAngle={3}
                  label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}>
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [t.times(v), n]} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.barList}>
            {t.sourceOptions.filter((o) => (stats?.[o.value] || 0) > 0)
              .sort((a, b) => (stats[b.value] || 0) - (stats[a.value] || 0))
              .map((o) => {
                const count = stats?.[o.value] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={o.value} style={styles.barRow}>
                    <div style={styles.barLabel}>
                      <span style={{ ...styles.dot, background: PIE_COLORS[o.value] }} />
                      <span style={styles.barName}>{o.label}</span>
                      <span style={styles.barCount}>{t.times(count)}</span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: PIE_COLORS[o.value] }} />
                    </div>
                  </div>
                );
              })}
          </div>

          <p style={styles.totalNote}>{t.totalConflicts(total)}</p>

          {correlation.length > 0 && (
            <div style={styles.corrSection}>
              <p style={styles.corrTitle}>{t.corrTitle}</p>
              <p style={styles.corrDesc}>{t.corrDesc}</p>
              {correlation.map((row) => {
                const src = t.sourceOptions.find((o) => o.value === row.source);
                const color = PIE_COLORS[row.source];
                const pct = ((parseFloat(row.avg_intensity) / 5) * 100).toFixed(0);
                const intensity = parseFloat(row.avg_intensity);
                return (
                  <div key={row.source} style={styles.corrRow}>
                    <div style={styles.corrHeader}>
                      <span style={{ ...styles.corrBadge, background: color + '20', color }}>{src?.label}</span>
                      <span style={styles.corrValue}>{t.avgOf5(row.avg_intensity)}</span>
                    </div>
                    <div style={styles.corrTrack}>
                      <div style={{ ...styles.corrFill, width: `${pct}%`, background: color }} />
                    </div>
                    <p style={styles.corrNote}>
                      {intensity >= 4 ? t.corrNoteHigh(src?.label)
                        : intensity >= 2.5 ? t.corrNoteMid(src?.label)
                        : t.corrNoteLow(src?.label)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
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
  insightCard: { border: '1.5px solid', borderRadius: 14, padding: '16px 18px', marginBottom: 20 },
  insightHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  insightBadge: { color: '#fff', borderRadius: 99, padding: '3px 12px', fontSize: 13, fontWeight: 600 },
  insightPct: { fontSize: 28, fontWeight: 700, color: '#2d3748', lineHeight: 1 },
  insightText: { fontSize: 14, color: '#6b7280', lineHeight: 1.7 },
  chartWrap: { background: '#fff', border: '1px solid #f3f4f6', borderRadius: 14, padding: '8px 0', marginBottom: 20 },
  barList: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12 },
  barRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  barLabel: { display: 'flex', alignItems: 'center', gap: 8 },
  barName: { fontSize: 14, color: '#374151', flex: 1 },
  barCount: { fontSize: 13, color: '#6b7280', fontWeight: 600 },
  barTrack: { height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.6s ease' },
  totalNote: { textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 8 },
  corrSection: { marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
  corrTitle: { fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 4 },
  corrDesc: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  corrRow: { marginBottom: 18 },
  corrHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  corrBadge: { borderRadius: 99, padding: '3px 10px', fontSize: 13, fontWeight: 600 },
  corrValue: { fontSize: 13, color: '#6b7280' },
  corrTrack: { height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  corrFill: { height: '100%', borderRadius: 99, transition: 'width 0.8s ease' },
  corrNote: { fontSize: 12, color: '#9ca3af', lineHeight: 1.5 },
};

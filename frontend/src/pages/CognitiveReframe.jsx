import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCognitiveRecord, getCognitiveRecords, deleteCognitiveRecord } from '../api/cognitive';
import { IllustrationDone } from '../components/Illustrations';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

const STEPS = ['situation', 'auto_thought', 'evidence', 'balanced_thought'];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ current, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i < current ? '#7fb5a0' : i === current ? '#5a9580' : '#e5e7eb',
              color: i <= current ? '#fff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              transition: 'background 0.3s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10, color: i === current ? '#5a9580' : '#9ca3af', fontWeight: i === current ? 600 : 400 }}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div style={{
              width: 24, height: 2, marginBottom: 18,
              background: i < current ? '#7fb5a0' : '#e5e7eb',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── New exercise form ─────────────────────────────────────────────────────────
export function CognitiveReframeNew() {
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ situation: '', auto_thought: '', evidence: '', balanced_thought: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const bg       = isDark ? '#1c1917' : '#faf8f3';
  const card     = isDark ? 'rgba(41,37,36,0.9)' : 'rgba(255,255,255,0.85)';
  const cardBdr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(127,181,160,0.25)';
  const textMain = isDark ? '#f5f5f4' : '#2d3748';
  const textSub  = isDark ? '#a8a29e' : '#6b7280';
  const inputBg  = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
  const inputBdr = isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db';

  const stepMeta = [
    { key: 'situation',        label: t.cognitiveStep1Label, placeholder: t.cognitiveStep1Placeholder, emoji: '📍' },
    { key: 'auto_thought',     label: t.cognitiveStep2Label, placeholder: t.cognitiveStep2Placeholder, emoji: '💭' },
    { key: 'evidence',         label: t.cognitiveStep3Label, placeholder: t.cognitiveStep3Placeholder, emoji: '🔍' },
    { key: 'balanced_thought', label: t.cognitiveStep4Label, placeholder: t.cognitiveStep4Placeholder, emoji: '⚖️' },
  ];

  const shortLabels = [t.cognitiveStep1Short, t.cognitiveStep2Short, t.cognitiveStep3Short, t.cognitiveStep4Short];

  function handleNext() {
    const key = STEPS[step];
    if (!form[key].trim()) { setError(t.cognitiveFieldRequired); return; }
    setError('');
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const key = STEPS[step];
    if (!form[key].trim()) { setError(t.cognitiveFieldRequired); return; }
    setError('');
    setSubmitting(true);
    try {
      await saveCognitiveRecord(form);
      setDone(true);
    } catch {
      setError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <IllustrationDone width={140} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain, marginBottom: 12 }}>{t.cognitiveDoneTitle}</h2>
          <p style={{ color: textSub, lineHeight: 1.75, marginBottom: 32, fontSize: 15 }}>{t.cognitiveDoneDesc}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/cognitive/history')} style={btnStyle('#7fb5a0', '#fff')}>
              {t.cognitiveViewHistory}
            </button>
            <button onClick={() => { setDone(false); setStep(0); setForm({ situation: '', auto_thought: '', evidence: '', balanced_thought: '' }); }}
              style={btnStyle('transparent', '#7fb5a0', '1px solid #7fb5a0')}>
              {t.cognitiveAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = stepMeta[step];

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 16px 100px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 20px', display: 'block' }}>
          {t.back}
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain, marginBottom: 4 }}>{t.cognitiveTitle}</h2>
        <p style={{ color: textSub, fontSize: 14, marginBottom: 28 }}>{t.cognitiveSub}</p>

        <StepDots current={step} labels={shortLabels} />

        <div style={{
          background: card, border: `1px solid ${cardBdr}`,
          borderRadius: 20, padding: '28px 24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{current.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#7fb5a0', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t.cognitiveStep(step + 1)}
            </span>
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: textMain, marginBottom: 16, lineHeight: 1.5 }}>
            {current.label}
          </p>

          <textarea
            key={step}
            autoFocus
            value={form[current.key]}
            onChange={(e) => { setForm((f) => ({ ...f, [current.key]: e.target.value })); setError(''); }}
            placeholder={current.placeholder}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: inputBg, border: `1px solid ${error ? '#f87171' : inputBdr}`,
              borderRadius: 12, padding: '14px 16px',
              fontSize: 15, color: textMain, lineHeight: 1.7,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'space-between' }}>
            {step > 0 && (
              <button onClick={() => { setStep((s) => s - 1); setError(''); }}
                style={btnStyle('transparent', textSub, `1px solid ${inputBdr}`)}>
                {t.cognitivePrev}
              </button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {step < STEPS.length - 1 ? (
                <button onClick={handleNext} style={btnStyle('#7fb5a0', '#fff')}>
                  {t.cognitiveNext}
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} style={btnStyle('#5a9580', '#fff')}>
                  {submitting ? t.cognitiveSubmitting : t.cognitiveSubmit}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary of previous steps */}
        {step > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stepMeta.slice(0, step).map((s, i) => (
              <div key={i} style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(127,181,160,0.08)',
                border: `1px solid ${cardBdr}`, borderRadius: 12, padding: '12px 16px',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7fb5a0', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {shortLabels[i]}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: textSub, lineHeight: 1.6 }}>
                  {form[s.key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── History list ──────────────────────────────────────────────────────────────
export function CognitiveReframeList() {
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const bg      = isDark ? '#1c1917' : '#faf8f3';
  const card    = isDark ? 'rgba(41,37,36,0.9)' : 'rgba(255,255,255,0.85)';
  const cardBdr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(127,181,160,0.2)';
  const textMain= isDark ? '#f5f5f4' : '#2d3748';
  const textSub = isDark ? '#a8a29e' : '#6b7280';

  useEffect(() => {
    getCognitiveRecords()
      .then((r) => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t.cognitiveDeleteConfirm)) return;
    await deleteCognitiveRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  const stepLabels = [t.cognitiveStep1Short, t.cognitiveStep2Short, t.cognitiveStep3Short, t.cognitiveStep4Short];
  const stepKeys   = ['situation', 'auto_thought', 'evidence', 'balanced_thought'];
  const stepEmojis = ['📍', '💭', '🔍', '⚖️'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #7fb5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 16px 100px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 20px', display: 'block' }}>
          {t.back}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain, margin: 0 }}>{t.cognitiveHistoryTitle}</h2>
          <button onClick={() => navigate('/cognitive/new')} style={btnStyle('#7fb5a0', '#fff')}>
            {t.add}
          </button>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>🧠</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: textMain, marginBottom: 8 }}>{t.cognitiveEmpty}</p>
            <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 28, whiteSpace: 'pre-line' }}>{t.cognitiveEmptyDesc}</p>
            <button onClick={() => navigate('/cognitive/new')} style={btnStyle('#7fb5a0', '#fff')}>
              {t.cognitiveStartFirst}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {records.map((rec) => {
              const isOpen = expanded === rec.id;
              const date = new Date(rec.created_at).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={rec.id} style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  {/* Card header — always visible */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : rec.id)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, color: '#7fb5a0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        📍 {t.cognitiveStep1Short} · {date}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: 14, color: textMain, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                        {rec.situation}
                      </p>
                    </div>
                    <span style={{ color: textSub, fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                      ›
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${cardBdr}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {stepKeys.slice(1).map((key, i) => (
                        <div key={key}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#7fb5a0', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            {stepEmojis[i + 1]} {stepLabels[i + 1]}
                          </span>
                          <p style={{ margin: '4px 0 0', fontSize: 14, color: textSub, lineHeight: 1.65 }}>{rec[key]}</p>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, padding: 0 }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color, border) {
  return {
    background: bg, color, border: border || 'none',
    borderRadius: 10, padding: '10px 20px',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

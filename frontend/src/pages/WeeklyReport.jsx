import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeeklyReport, generateWeeklyReport } from '../api/ai';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

function parseReport(text) {
  // 把 【標題】 或 [Title] 開頭的段落切成陣列 [{ title, body }]
  const parts = text.split(/\n(?=【|(?:\[(?!.*\[)))/g);
  return parts.map((block) => {
    const titleMatch = block.match(/^[【\[](.+?)[】\]]/);
    const title = titleMatch ? titleMatch[1] : null;
    const body = title ? block.replace(/^[【\[].+?[】\]]\s*\n?/, '').trim() : block.trim();
    return { title, body };
  }).filter((p) => p.body);
}

const SECTION_COLORS = [
  { bg: 'rgba(127,181,160,0.10)', border: 'rgba(127,181,160,0.3)', accent: '#3d8b72' },
  { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', accent: '#4f46e5' },
  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', accent: '#b45309' },
];

export default function WeeklyReport() {
  const { lang, isDark, isLoggedIn } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const [status, setStatus] = useState('idle'); // idle | loading | done | no_data | error | disabled
  const [report, setReport] = useState(null);
  const [cached, setCached] = useState(false);
  const [weekStart, setWeekStart] = useState('');

  const bg       = isDark ? '#1c1917' : '#faf8f3';
  const card     = isDark ? 'rgba(41,37,36,0.9)' : 'rgba(255,255,255,0.88)';
  const cardBdr  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,210,200,0.4)';
  const textMain = isDark ? '#f5f5f4' : '#2d3748';
  const textSub  = isDark ? '#a8a29e' : '#6b7280';

  // 進頁面先查快取
  useEffect(() => {
    if (!isLoggedIn) { setStatus('disabled'); return; }
    fetchWeeklyReport()
      .then((r) => {
        if (!r.data.enabled) { setStatus('disabled'); return; }
        if (r.data.cached) {
          setReport(r.data);
          setCached(true);
          setWeekStart(r.data.week_start || '');
          setStatus('done');
        } else {
          setWeekStart(r.data.week_start || '');
          setStatus('idle');
        }
      })
      .catch(() => setStatus('idle'));
  }, [isLoggedIn]);

  async function handleGenerate() {
    setStatus('loading');
    try {
      const r = await generateWeeklyReport(lang);
      if (!r.data.enabled) { setStatus('disabled'); return; }
      if (r.data.error === 'NO_DATA') { setStatus('no_data'); return; }
      setReport(r.data);
      setCached(r.data.cached);
      setWeekStart(r.data.week_start || '');
      setStatus('done');
    } catch (err) {
      const isNoData = err.response?.data?.error === 'NO_DATA';
      setStatus(isNoData ? 'no_data' : 'error');
    }
  }

  const reportText = report ? (lang === 'en' ? report.report_en : report.report_zh) : '';
  const sections = reportText ? parseReport(reportText) : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 16px 100px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <button onClick={() => navigate('/account')}
          style={{ background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 24px', display: 'block' }}>
          {t.back}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain, marginBottom: 6 }}>
            {cached ? t.weeklyReportCached : t.weeklyReportLabel}
          </h2>
          {weekStart && (
            <p style={{ fontSize: 13, color: textSub }}>
              {lang === 'zh' ? `本週起始：${formatDate(weekStart)}` : `Week of ${formatDate(weekStart)}`}
            </p>
          )}
        </div>

        {/* Idle: show generate button */}
        {status === 'idle' && (
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>📊</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: textMain, marginBottom: 8 }}>{t.weeklyReportLabel}</p>
            <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{t.weeklyReportDesc}</p>
            <button onClick={handleGenerate} style={btnPrimary}>
              {t.weeklyReportBtn}
            </button>
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #7fb5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: textSub, fontSize: 14 }}>{t.weeklyReportGenerating}</p>
          </div>
        )}

        {/* No data */}
        {status === 'no_data' && (
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>🌱</p>
            <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7 }}>{t.weeklyReportNoData}</p>
            <button onClick={() => navigate('/emotions')} style={{ ...btnPrimary, marginTop: 20 }}>
              {t.emotionFeatureLabel}
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{t.weeklyReportError}</p>
            <button onClick={handleGenerate} style={btnPrimary}>{t.weeklyReportBtn}</button>
          </div>
        )}

        {/* Disabled */}
        {status === 'disabled' && (
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>🔒</p>
            <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7 }}>
              {isLoggedIn ? 'AI 功能尚未開啟' : '請先登入才能查看週報'}
            </p>
            {!isLoggedIn && (
              <button onClick={() => navigate('/login')} style={{ ...btnPrimary, marginTop: 20 }}>
                {t.signIn}
              </button>
            )}
          </div>
        )}

        {/* Report done */}
        {status === 'done' && sections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sections.map((sec, i) => {
              const color = SECTION_COLORS[i % SECTION_COLORS.length];
              return (
                <div key={i} style={{
                  background: isDark ? 'rgba(41,37,36,0.9)' : color.bg,
                  border: `1px solid ${color.border}`,
                  borderRadius: 18, padding: '20px 22px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  animation: `fadeSlideIn 0.4s ${i * 0.12}s ease both`,
                }}>
                  {sec.title && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: color.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      {sec.title}
                    </p>
                  )}
                  <p style={{ fontSize: 15, color: textMain, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>
                    {sec.body}
                  </p>
                </div>
              );
            })}

            {/* Hint + regen */}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <p style={{ fontSize: 12, color: textSub, marginBottom: 12 }}>{t.weeklyReportRegenerateHint}</p>
              {!cached && (
                <button onClick={handleGenerate} style={btnOutline}>{t.weeklyReportBtn}</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: '#7fb5a0', color: '#fff', border: 'none',
  borderRadius: 12, padding: '12px 24px',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
};

const btnOutline = {
  background: 'transparent', color: '#7fb5a0',
  border: '1px solid #7fb5a0',
  borderRadius: 12, padding: '10px 20px',
  fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

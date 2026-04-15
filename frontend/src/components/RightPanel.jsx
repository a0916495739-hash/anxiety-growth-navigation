import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';

function pickQuote(quotes) {
  const d = new Date();
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

export default function RightPanel() {
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const quote = pickQuote(t.dailyQuotes);

  const bg     = isDark ? 'rgba(22,18,16,0.5)'    : 'rgba(255,253,250,0.6)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const text   = isDark ? '#e7e5e4' : '#2d3748';
  const sub    = isDark ? '#a8a29e' : '#6b7280';

  return (
    <aside style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      width: 260,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '28px 20px',
      background: bg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderLeft: `1px solid ${border}`,
      overflowY: 'auto',
    }}>

      {/* 快捷進入 */}
      <div style={{
        borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        border: `1px solid ${border}`,
        padding: '16px',
      }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: sub, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {lang === 'zh' ? '快捷進入' : 'Quick Access'}
        </p>

        <button
          onClick={() => navigate('/emotions')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: isDark ? 'rgba(90,159,192,0.15)' : 'rgba(90,159,192,0.1)',
            color: isDark ? '#8bc4de' : '#3d7fa0',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 8,
            textAlign: 'left',
            transition: 'background 0.2s',
          }}
        >
          <span style={{ fontSize: 18 }}>🌊</span>
          <span>{lang === 'zh' ? '記錄情緒' : 'Log Emotion'}</span>
        </button>

        <button
          onClick={() => navigate('/achievements/new')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: isDark ? 'rgba(127,181,160,0.15)' : 'rgba(127,181,160,0.1)',
            color: isDark ? '#7fb5a0' : '#3d7a68',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            textAlign: 'left',
            transition: 'background 0.2s',
          }}
        >
          <span style={{ fontSize: 18 }}>🏆</span>
          <span>{lang === 'zh' ? '新增成就' : 'New Achievement'}</span>
        </button>
      </div>

      {/* 每日一句 */}
      <div style={{
        borderRadius: 16,
        background: isDark ? 'rgba(127,181,160,0.08)' : 'rgba(127,181,160,0.07)',
        border: `1px solid ${isDark ? 'rgba(127,181,160,0.2)' : 'rgba(127,181,160,0.18)'}`,
        padding: '16px',
      }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: sub, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {lang === 'zh' ? '每日一句' : 'Daily Quote'}
        </p>
        <span style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>🌿</span>
        <p style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.7,
          color: isDark ? '#c8ddd6' : '#3d6b5e',
          fontStyle: 'italic',
        }}>
          {quote}
        </p>
      </div>

      {/* 版本 */}
      <p style={{ margin: 'auto 0 0', fontSize: 11, color: isDark ? '#44403c' : '#d1cdc8', textAlign: 'center' }}>
        {t.version}
      </p>
    </aside>
  );
}

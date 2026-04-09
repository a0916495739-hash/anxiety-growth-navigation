import { useState } from 'react';
import { getT } from '../i18n';

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function pickQuote(quotes) {
  const d = new Date();
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

export default function DailyQuote({ isDark, lang }) {
  const dismissed = localStorage.getItem('daily_quote_dismissed') === todayKey();
  const [visible, setVisible] = useState(!dismissed);

  if (!visible) return null;

  const t = getT(lang);
  const quote = pickQuote(t.dailyQuotes);

  function dismiss() {
    localStorage.setItem('daily_quote_dismissed', todayKey());
    setVisible(false);
  }

  const D = isDark;

  return (
    <div style={{
      margin: '0 0 20px',
      padding: '12px 14px',
      borderRadius: 14,
      background: D ? 'rgba(127,181,160,0.1)' : 'rgba(127,181,160,0.08)',
      border: `1px solid ${D ? 'rgba(127,181,160,0.25)' : 'rgba(127,181,160,0.2)'}`,
      display: 'flex', alignItems: 'flex-start', gap: 10,
      animation: 'fadeSlideIn 0.4s ease both',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🌿</span>
      <p style={{
        flex: 1, margin: 0,
        fontSize: 14, lineHeight: 1.65,
        color: D ? '#c8ddd6' : '#3d6b5e',
        fontStyle: 'italic',
      }}>
        {quote}
      </p>
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: D ? '#6b7280' : '#9ca3af', fontSize: 16, lineHeight: 1,
          padding: '0 2px', flexShrink: 0, marginTop: 1,
        }}
        aria-label="dismiss"
      >×</button>
    </div>
  );
}

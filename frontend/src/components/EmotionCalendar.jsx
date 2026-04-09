import { useState, useMemo } from 'react';

// 強度 → 顏色
const INTENSITY_COLOR = {
  1: '#86efac',   // 輕微 — 淡綠
  2: '#4ade80',   // 低   — 綠
  3: '#fbbf24',   // 中   — 琥珀
  4: '#f97316',   // 高   — 橙
  5: '#ef4444',   // 強烈 — 紅
};

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function toDateKey(dateStr) {
  // 把 ISO string 轉成本地 YYYY-MM-DD
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function avgIntensity(records) {
  const withI = records.filter((r) => r.intensity);
  if (!withI.length) return null;
  return Math.round(withI.reduce((s, r) => s + r.intensity, 0) / withI.length);
}

/**
 * EmotionCalendar
 * Props:
 *   records  {Array}   全部情緒紀錄
 *   isDark   {boolean}
 *   locale   {string}  'zh-TW' | 'en-US'
 *   onDelete {fn}      (id) => void
 *   deletingId {string|null}
 *   t        {object}  i18n strings
 */
export default function EmotionCalendar({ records, isDark, locale, onDelete, deletingId, t }) {
  const today = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());    // 0-indexed
  const [selectedDay, setSelectedDay] = useState(null);        // 'YYYY-MM-DD'

  const D = isDark;

  // ── 把 records 按 YYYY-MM-DD 分組 ──────────────────────────────────
  const byDay = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => {
      const key = toDateKey(r.created_at);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [records]);

  // ── 建構月曆格子 ──────────────────────────────────────────────────
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);           // 空格
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function dayKey(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const selectedRecords = selectedDay ? (byDay[selectedDay] || []) : [];

  // ── 色板 ──────────────────────────────────────────────────────────
  const c = {
    bg:        D ? 'rgba(41,37,36,0.85)' : '#fff',
    border:    D ? 'rgba(255,255,255,0.08)' : '#e8f0eb',
    header:    D ? '#f5f5f4' : '#2d3748',
    nav:       D ? '#a8a29e' : '#6b7280',
    weekLabel: D ? '#78716c' : '#9ca3af',
    dayText:   D ? '#e7e5e4' : '#374151',
    dayMuted:  D ? '#44403c' : '#e5e7eb',
    todayRing: '#7fb5a0',
    selectedBg:D ? 'rgba(127,181,160,0.2)' : 'rgba(127,181,160,0.12)',
    panelBg:   D ? 'rgba(28,25,23,0.7)' : '#f5f9f7',
    panelBdr:  D ? 'rgba(127,181,160,0.25)' : '#c8e6dc',
    recordBg:  D ? 'rgba(41,37,36,0.9)' : '#fff',
    recordBdr: D ? 'rgba(255,255,255,0.08)' : '#e8f0eb',
    text:      D ? '#d6d3d1' : '#374151',
    sub:       D ? '#a8a29e' : '#6b7280',
  };

  const todayKey = toDateKey(today.toISOString());

  return (
    <div>
      {/* ── 月份導覽 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prevMonth} style={navBtn(c)}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: c.header }}>
          {year} 年 {month + 1} 月
        </span>
        <button onClick={nextMonth} style={navBtn(c)}>›</button>
      </div>

      {/* ── 月曆卡 ── */}
      <div style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        padding: '12px 10px 10px',
        marginBottom: 12,
      }}>
        {/* 星期標題 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {WEEK_LABELS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: c.weekLabel, paddingBottom: 4 }}>
              {w}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const key     = dayKey(d);
            const recs    = byDay[key];
            const avg     = recs ? avgIntensity(recs) : null;
            const dotColor = avg ? INTENSITY_COLOR[avg] : null;
            const isToday  = key === todayKey;
            const isSel    = key === selectedDay;

            return (
              <div
                key={key}
                onClick={() => setSelectedDay(isSel ? null : key)}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  aspectRatio: '1/1',
                  borderRadius: 8,
                  cursor: recs ? 'pointer' : 'default',
                  background: isSel ? c.selectedBg : 'transparent',
                  border: isToday ? `2px solid ${c.todayRing}` : '2px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 12, color: recs ? c.dayText : c.dayMuted, fontWeight: isToday ? 700 : 400, lineHeight: 1.2 }}>
                  {d}
                </span>
                {dotColor && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: dotColor,
                    marginTop: 2,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 強度圖例 ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {[1,2,3,4,5].map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: INTENSITY_COLOR[n] }} />
            <span style={{ fontSize: 11, color: c.sub }}>{['輕微','低','中','高','強烈'][n-1]}</span>
          </div>
        ))}
      </div>

      {/* ── 選取日的紀錄面板 ── */}
      {selectedDay && (
        <div style={{
          background: c.panelBg,
          border: `1px solid ${c.panelBdr}`,
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
          animation: 'fadeSlideIn 0.25s ease both',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb5a0', margin: '0 0 10px' }}>
            {new Date(selectedDay).toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>

          {selectedRecords.length === 0 ? (
            <p style={{ fontSize: 13, color: c.sub, margin: 0 }}>這天沒有紀錄</p>
          ) : (
            selectedRecords.map((r) => (
              <div key={r.id} style={{
                background: c.recordBg,
                border: `1px solid ${c.recordBdr}`,
                borderRadius: 10, padding: '10px 12px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: c.sub }}>
                    {new Date(r.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{
                    background: D ? 'rgba(127,181,160,0.2)' : '#e8f4f0',
                    color: '#7fb5a0', borderRadius: 99, padding: '1px 8px', fontSize: 11,
                  }}>
                    {r.mode === 'guided' ? t.modeGuided : t.modeFree}
                  </span>
                  {r.intensity && (
                    <span style={{
                      background: INTENSITY_COLOR[r.intensity] + '33',
                      color: INTENSITY_COLOR[r.intensity],
                      borderRadius: 99, padding: '1px 8px', fontSize: 11,
                    }}>
                      {t.intensity(r.intensity)}
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(r.id)}
                    disabled={deletingId === r.id}
                    style={{
                      marginLeft: 'auto', background: 'none',
                      border: D ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fca5a5',
                      color: '#ef4444', borderRadius: 6,
                      padding: '2px 8px', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    {deletingId === r.id ? '...' : t.delete}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: c.text, lineHeight: 1.6, margin: 0 }}>
                  {(r.raw_emotion || r.trigger_event || t.noText).slice(0, 120)}
                </p>
                {r.emotion_tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {r.emotion_tags.map((tag) => (
                      <span key={tag} style={{
                        background: D ? 'rgba(251,191,36,0.15)' : '#fef9c3',
                        color: D ? '#fbbf24' : '#78600a',
                        borderRadius: 99, padding: '1px 8px', fontSize: 11,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function navBtn(c) {
  return {
    background: 'none', border: 'none',
    color: c.nav, fontSize: 22, cursor: 'pointer',
    padding: '4px 12px', lineHeight: 1,
  };
}

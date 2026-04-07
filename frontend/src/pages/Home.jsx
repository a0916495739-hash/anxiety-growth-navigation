import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IllustrationHero } from '../components/Illustrations';
import { getWeeklyStats, getHeatmap } from '../api/stats';
import Onboarding, { useOnboarding } from '../components/Onboarding';
import { getT } from '../i18n';

export default function Home() {
  const { isLoggedIn, displayName, lang, setLang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();
  const [weekStats, setWeekStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(useOnboarding);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('in'); // 'in' | 'out' | 'ready'
  const [heatmapData, setHeatmapData] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: lang === 'zh' ? '歡迎回來！記得今天也記錄一下情緒 🌊' : 'Welcome back! Remember to log your emotions today 🌊', time: lang === 'zh' ? '剛才' : 'Just now', read: false },
    { id: 2, text: lang === 'zh' ? '你上週記錄了成就，繼續保持 ✨' : 'You logged achievements last week. Keep it up ✨', time: lang === 'zh' ? '1 天前' : '1 day ago', read: false },
    { id: 3, text: lang === 'zh' ? '試試看「應該 vs 想要」，釐清內心的拉扯 ⚖️' : 'Try "Should vs Want" to clarify inner tension ⚖️', time: lang === 'zh' ? '3 天前' : '3 days ago', read: true },
  ]);

  // Dark mode colour tokens
  const nav_bg   = isDark ? 'rgba(0,0,0,0.3)'        : 'rgba(255,255,255,0.35)';
  const nav_bdr  = isDark ? 'rgba(255,255,255,0.1)'   : 'rgba(255,255,255,0.5)';
  const nav_text = isDark ? '#d6d3d1'                 : '#4a5568';
  const card_bg_d= isDark ? 'rgba(41,37,36,0.85)'     : 'rgba(245,241,237,0.7)';
  const card_bdr = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(255,182,193,0.3)';
  const text_head= isDark ? '#f5f5f4'                 : '#2d3748';
  const text_sub = isDark ? '#a8a29e'                 : '#6b7280';

  const features = [
    { label: t.emotionFeatureLabel, desc: t.emotionFeatureDesc, path: '/emotions', emoji: '🌊', color: '#e8f4fb', border: '#a8c8e8', accent: '#5a9fc0' },
    { label: t.achievementFeatureLabel, desc: t.achievementFeatureDesc, path: '/achievements', emoji: '✨', color: '#e8f4f0', border: '#7fb5a0', accent: '#4a9580' },
    { label: t.conflictFeatureLabel, desc: t.conflictFeatureDesc, path: '/conflicts', emoji: '⚖️', color: '#fdf3ee', border: '#f0b8a0', accent: '#c87050' },
  ];

  useEffect(() => {
    getWeeklyStats().then((r) => setWeekStats(r.data)).catch(() => {});
    getHeatmap().then((r) => setHeatmapData(r.data)).catch(() => {});
  }, []);

  // Breathing animation phase cycling
  useEffect(() => {
    if (!breathing) return;
    const phases = ['in', 'out', 'in', 'out', 'ready'];
    let i = 0;
    setBreathPhase(phases[0]);
    const timer = setInterval(() => {
      i++;
      if (i < phases.length) {
        setBreathPhase(phases[i]);
      } else {
        clearInterval(timer);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [breathing]);

  function startBreathing() {
    setBreathing(true);
    setBreathPhase('in');
  }

  function goToEmotions() {
    setBreathing(false);
    navigate('/emotions');
  }

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => {
      if (!e.target.closest('[data-notif]')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [notifOpen]);

  return (
    <div style={s.page}>
      {/* 背景光暈球 — 讓磨砂玻璃有東西可以折射 */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {/* Nav */}
      <nav style={{ ...s.nav, borderBottomColor: isDark ? '#3d3530' : '#e8e0d0' }}>
        <div style={s.logo}>
          <span style={s.logoMark}>🌿</span>
          <span style={{ ...s.logoText, color: text_head }}>{t.appName}</span>
        </div>
        <div style={s.navActions}>
          {/* 桌面版導覽 */}
          <div className="nav-desktop-only" style={s.desktopButtons}>
            <button style={{ ...s.langToggle, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{lang === 'zh' ? 'EN' : '中文'}</span>
            </button>
            {isLoggedIn ? (
              <>
                {displayName && <span style={{ ...s.greeting, color: nav_text }}>Hi, {displayName}</span>}
                <button style={{ ...s.ghostBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/account')}>{t.settings}</button>
              </>
            ) : (
              <>
                <button style={{ ...s.ghostBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/login')}>{t.signIn}</button>
                <button style={{ ...s.primaryBtn, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)', borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/register')}>{t.createAccount}</button>
              </>
            )}
          </div>

          {/* 通知鈴鐺 — 桌面 + 手機都顯示 */}
          {(() => {
            const unread = notifications.filter(n => !n.read).length;
            return (
              <button
                data-notif="1"
                style={{ ...s.bellBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text, position: 'relative' }}
                onClick={() => {
                  setNotifOpen(o => !o);
                  setMenuOpen(false);
                  if (!notifOpen) setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                aria-label="Notifications"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unread > 0 && <span style={s.redDot} />}
              </button>
            );
          })()}

          {/* 手機版漢堡按鈕 */}
          <button
            className="nav-hamburger"
            style={{ ...s.hamburgerBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* 手機版下拉選單 */}
        {menuOpen && (
          <div style={{ ...s.mobileMenu, background: isDark ? 'rgba(28,25,23,0.92)' : 'rgba(255,255,255,0.85)', borderColor: nav_bdr }}>
            <button style={{ ...s.menuItem, color: nav_text }} onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}>
              🌐 {lang === 'zh' ? 'Switch to English' : '切換為中文'}
            </button>
            {isLoggedIn ? (
              <button style={{ ...s.menuItem, color: nav_text }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate('/account'); }}>
                ⚙️ {t.settings}
              </button>
            ) : (
              <>
                <button style={{ ...s.menuItem, color: nav_text }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate('/login'); }}>
                  👤 {t.signIn}
                </button>
                <button style={{ ...s.menuItem, fontWeight: 600, color: '#7fb5a0' }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate('/register'); }}>
                  ✨ {t.createAccount}
                </button>
              </>
            )}
          </div>
        )}

        {/* 通知下拉面板 */}
        {notifOpen && (
          <div data-notif="1" style={{
            ...s.notifPanel,
            background: isDark ? 'rgba(28,25,23,0.92)' : 'rgba(255,255,255,0.82)',
            borderColor: nav_bdr,
            boxShadow: isDark
              ? '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 12px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>
            <p style={{ ...s.notifHeader, color: nav_text }}>{lang === 'zh' ? '通知' : 'Notifications'}</p>
            {notifications.length === 0 ? (
              <p style={{ ...s.notifEmpty, color: nav_text }}>
                {lang === 'zh' ? '沒有新通知' : 'No notifications'}
              </p>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ ...s.notifItem, background: n.read ? 'transparent' : (isDark ? 'rgba(127,181,160,0.08)' : 'rgba(127,181,160,0.07)'), borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0ede8' }}>
                  {!n.read && <span style={s.unreadDot} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ ...s.notifText, color: nav_text }}>{n.text}</p>
                    <p style={{ ...s.notifTime, color: isDark ? '#78716c' : '#9ca3af' }}>{n.time}</p>
                  </div>
                </div>
              ))
            )}
            <button
              style={{ ...s.notifClear, color: '#7fb5a0' }}
              onClick={() => { setNotifications([]); setNotifOpen(false); }}
            >
              {lang === 'zh' ? '清除全部' : 'Clear all'}
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroIllus}>
          <IllustrationHero width={240} />
        </div>
        <p style={s.heroEyebrow}>{t.homeEyebrow}</p>
        <h1 style={{ ...s.heroTitle, color: text_head }}>
          {t.homeTitle1}<br />
          <span style={{ display: 'inline-block', wordBreak: 'keep-all' }}>
            {t.homeTitle2}<span style={s.heroAccent}>{t.homeAccent}</span>
          </span>
        </h1>
        <p style={{ ...s.heroSub, color: text_sub }}>{t.homeSub}</p>

        {!isLoggedIn && (
          <div style={{ ...s.guestBanner, background: isDark ? 'rgba(120,100,50,0.2)' : '#fefce8', borderColor: isDark ? 'rgba(251,191,36,0.25)' : '#fde68a', color: isDark ? '#d4a84b' : '#78600a' }}>
            <span>🔒</span>
            <span>{t.guestBanner}</span>
            <button style={{ ...s.bannerBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/register')}>{t.getStarted}</button>
          </div>
        )}
      </section>

      {/* Weekly Stats */}
      {weekStats && (weekStats.emotions > 0 || weekStats.achievements > 0 || weekStats.conflicts > 0) && (
        <section style={{ ...s.statsBar, background: card_bg_d, borderColor: card_bdr }}>
          <p style={s.statsLabel}>{t.weekStatsLabel}</p>
          <div style={s.statsRow}>
            {weekStats.emotions > 0 && (
              <div style={s.statItem}>
                <span style={{ ...s.statNum, color: text_head }}>{weekStats.emotions}</span>
                <span style={{ ...s.statDesc, color: text_sub }}>{t.emotionLogs}</span>
              </div>
            )}
            {weekStats.achievements > 0 && (
              <div style={s.statItem}>
                <span style={{ ...s.statNum, color: text_head }}>{weekStats.achievements}</span>
                <span style={{ ...s.statDesc, color: text_sub }}>{t.smallWins}</span>
              </div>
            )}
            {weekStats.conflicts > 0 && (
              <div style={s.statItem}>
                <span style={{ ...s.statNum, color: text_head }}>{weekStats.conflicts}</span>
                <span style={{ ...s.statDesc, color: text_sub }}>{t.conflictsRecorded}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Heatmap */}
      {heatmapData.length > 0 && <HeatmapGrid data={heatmapData} t={t} isDark={isDark} text_head={text_head} text_sub={text_sub} card_bg_d={card_bg_d} card_bdr={card_bdr} />}

      {/* Feature Cards */}
      <section style={s.cards}>
        {features.map((f) => (
          <div
            key={f.path}
            style={{ ...s.card, background: isDark ? 'rgba(41,37,36,0.7)' : f.color, borderColor: isDark ? 'rgba(255,255,255,0.08)' : f.border }}
            onClick={() => f.path === '/emotions' ? startBreathing() : navigate(f.path)}
          >
            <div style={{ ...s.cardIcon, background: isDark ? 'rgba(255,255,255,0.08)' : f.border }}>{f.emoji}</div>
            <div style={s.cardBody}>
              <h2 style={{ ...s.cardTitle, color: isDark ? '#d6d3d1' : f.accent }}>{f.label}</h2>
              <p style={{ ...s.cardDesc, color: text_sub }}>{f.desc}</p>
            </div>
            <span style={{ ...s.cardArrow, color: isDark ? '#7fb5a0' : f.accent }}>→</span>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section style={s.quick}>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/emotions/history')}>{t.emotionHistory}</button>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/conflicts/stats')}>{t.conflictStats}</button>
      </section>

      {/* Story button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 4 }}>
        <button
          style={{ ...s.storyBtn, color: text_sub }}
          onClick={() => setStoryOpen(true)}
        >
          <span>📖</span>
          <span>{t.storyBtn}</span>
        </button>
      </div>

      {/* Footer */}
      <footer style={{ ...s.footer, borderTopColor: isDark ? '#3d3530' : '#e8e0d0', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button style={{ ...s.privacyLink, color: text_sub }} onClick={() => navigate('/privacy')}>{t.privacyPolicy}</button>
          <span style={{ color: isDark ? '#44403c' : '#d1d5db', fontSize: 13 }}>|</span>
          <button style={{ ...s.privacyLink, color: text_sub }} onClick={() => {}}>{t.tos}</button>
        </div>
        <p style={{ fontSize: 12, color: isDark ? '#44403c' : '#d1d5db', margin: 0 }}>{t.version}</p>
      </footer>

      {/* Story Modal */}
      {storyOpen && (
        <div style={s.storyOverlay} onClick={() => setStoryOpen(false)}>
          <div
            style={{
              ...s.storyModal,
              background: isDark ? 'rgba(28,25,23,0.95)' : 'rgba(255,255,255,0.92)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
              boxShadow: isDark
                ? '0 24px 60px rgba(0,0,0,0.7)'
                : '0 24px 60px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ ...s.storyEyebrow, color: '#7fb5a0' }}>📖 Origin Story</p>
            <h2 style={{ ...s.storyTitle, color: text_head }}>{t.storyTitle}</h2>
            <div style={{ ...s.storyBody, color: text_sub }}>
              {t.storyContent.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: i > 0 ? '16px 0 0' : 0 }}>{para}</p>
              ))}
            </div>
            <button
              style={{ ...s.storyClose, background: '#7fb5a0', color: '#fff' }}
              onClick={() => setStoryOpen(false)}
            >
              {t.storyClose}
            </button>
          </div>
        </div>
      )}

      {/* 深呼吸過場動畫 */}
      {breathing && (
        <div style={s.breathOverlay} onClick={breathPhase === 'ready' ? goToEmotions : undefined}>
          <div style={s.breathCircleWrap}>
            <div style={s.breathCircle} />
            <div style={s.breathCircleInner} />
          </div>
          <p style={s.breathText}>
            {breathPhase === 'in' && t.breatheIn}
            {breathPhase === 'out' && t.breatheOut}
            {breathPhase === 'ready' && t.breatheReady}
          </p>
          {breathPhase === 'ready' && (
            <button style={s.breathBtn} onClick={goToEmotions}>{t.breatheTap}</button>
          )}
        </div>
      )}
    </div>
  );
}

function HeatmapGrid({ data, t, isDark, text_head, text_sub, card_bg_d, card_bdr }) {
  const countMap = {};
  data.forEach(({ day, count }) => { countMap[day] = count; });

  const today = new Date();
  // Align to start of week (Monday)
  const startOffset = (today.getDay() + 6) % 7; // days since last Monday
  const totalDays = 84;
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (totalDays - 1 - i) + (6 - startOffset));
    return d.toISOString().slice(0, 10);
  });

  const getColor = (count) => {
    if (!count || count === 0) return isDark ? 'rgba(255,255,255,0.07)' : '#ede8e3';
    if (count === 1) return '#fad5c8';
    if (count === 2) return '#f4a898';
    return '#e8836c';
  };

  // Group into columns of 7 (weeks)
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const maxCount = Math.max(...data.map(d => d.count), 0);

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb5a0', letterSpacing: 0.6, textTransform: 'uppercase', margin: 0 }}>{t.heatmapLabel}</p>
        <p style={{ fontSize: 11, color: text_sub, margin: 0 }}>{t.heatmapSub}</p>
      </div>
      <div style={{ background: card_bg_d, border: `1px solid ${card_bdr}`, borderRadius: 16, padding: '16px 18px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {week.map((day) => {
                const count = countMap[day] || 0;
                return (
                  <div
                    key={day}
                    title={`${day}: ${count} 筆`}
                    style={{
                      width: 12, height: 12,
                      borderRadius: 3,
                      background: getColor(count),
                      transition: 'background 0.3s',
                      flexShrink: 0,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: text_sub }}>{t.heatmapLess}</span>
          {['#ede8e3','#fad5c8','#f4a898','#e8836c'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: isDark && c === '#ede8e3' ? 'rgba(255,255,255,0.07)' : c }} />
          ))}
          <span style={{ fontSize: 10, color: text_sub }}>{t.heatmapMore}</span>
        </div>
      </div>
    </section>
  );
}

const s = {
  page: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 20px 60px',
    minHeight: '100vh',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderBottom: '1px solid #e8e0d0',
    marginBottom: 40,
    gap: 8,
    flexWrap: 'wrap',
    position: 'relative',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoMark: { fontSize: 22 },
  logoText: { fontWeight: 700, fontSize: 17, color: '#2d3748', letterSpacing: '-0.3px' },
  navActions: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'nowrap',
    flexShrink: 0,
  },
  desktopButtons: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  bellBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid',
    borderRadius: 99,
    padding: '7px 10px',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
    flexShrink: 0,
  },
  redDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fb7185',
    border: '1.5px solid rgba(255,255,255,0.8)',
    display: 'block',
  },
  notifPanel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 300,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 100,
    animation: 'fadeSlideIn 0.18s ease',
  },
  notifHeader: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    padding: '14px 16px 10px',
    margin: 0,
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 16px',
    borderBottom: '1px solid',
    transition: 'background 0.2s',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#fb7185',
    flexShrink: 0,
    marginTop: 5,
    display: 'block',
  },
  notifText: { fontSize: 13, lineHeight: 1.5, margin: '0 0 3px', fontWeight: 500 },
  notifTime: { fontSize: 11, margin: 0 },
  notifEmpty: { fontSize: 13, padding: '12px 16px 16px', margin: 0, opacity: 0.6 },
  notifClear: {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    padding: '12px 16px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  hamburgerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 99,
    padding: '7px 12px',
    cursor: 'pointer',
    color: '#4a5568',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
  },
  mobileMenu: {
    width: '100%',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 14,
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    marginTop: 4,
  },
  menuItem: {
    background: 'none',
    border: 'none',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 15,
    color: '#374151',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s',
  },
  greeting: { fontSize: 13, color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  langToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 99,
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 600,
    color: '#4a5568',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  langText: {
    // 手機隱藏文字，只顯示圖示 — 用 JS 動態判斷
  },
  ghostBtn: {
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.5)',
    color: '#4a5568',
    borderRadius: 99,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.06)',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  primaryBtn: {
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.6)',
    color: '#374151',
    borderRadius: 99,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  hero: {
    textAlign: 'center',
    marginBottom: 48,
    padding: '0 12px',
  },
  heroIllus: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: '#7fb5a0',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 'clamp(18px, 5vw, 30px)',
    fontWeight: 700,
    lineHeight: 1.45,
    color: '#2d3748',
    marginBottom: 16,
    letterSpacing: '-0.2px',
  },
  heroAccent: {
    color: '#7fb5a0',
    borderBottom: '3px solid #b8d9cf',
  },
  heroSub: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: 24,
  },
  guestBanner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    background: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 14,
    color: '#78600a',
  },
  bannerBtn: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.7)',
    color: '#374151',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 13,
    fontWeight: 600,
    marginLeft: 4,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)',
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1.5px solid',
    borderRadius: 18,
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    ':hover': { transform: 'translateY(-2px)' },
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  cardArrow: {
    fontSize: 20,
    fontWeight: 300,
    flexShrink: 0,
  },
  quick: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickLink: {
    background: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.55)',
    borderRadius: 99,
    padding: '8px 20px',
    fontSize: 14,
    color: '#4a5568',
    fontWeight: 500,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 4px rgba(0,0,0,0.05)',
    transition: 'background 0.2s',
  },
  statsBar: {
    background: 'rgba(245, 241, 237, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,182,193,0.3)',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 28,
    textAlign: 'center',
  },
  statsLabel: { fontSize: 12, fontWeight: 600, color: '#7fb5a0', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontSize: 28, fontWeight: 700, color: '#2d3748', lineHeight: 1 },
  statDesc: { fontSize: 12, color: '#6b7280' },
  blob1: {
    position: 'fixed', top: '-60px', right: '-40px',
    width: 320, height: 320,
    background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', bottom: '10%', left: '-80px',
    width: 280, height: 280,
    background: 'radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(50px)', zIndex: -1, pointerEvents: 'none',
  },
  blob3: {
    position: 'fixed', top: '40%', right: '5%',
    width: 200, height: 200,
    background: 'radial-gradient(circle, rgba(249,168,212,0.18) 0%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(35px)', zIndex: -1, pointerEvents: 'none',
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e8e0d0' },
  privacyLink: { background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500 },
  footerDot: { color: '#d1d5db', fontSize: 13 },
  footerText: { fontSize: 13, color: '#9ca3af' },
  storyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 99,
    transition: 'color 0.2s, opacity 0.2s',
    opacity: 0.75,
  },
  breathOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(28,23,20,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    gap: 28,
  },
  breathCircleWrap: {
    position: 'relative',
    width: 180, height: 180,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  breathCircle: {
    position: 'absolute',
    width: '100%', height: '100%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(248,177,149,0.35) 0%, rgba(232,131,108,0.15) 60%, transparent 100%)',
    animation: 'breathe 4s ease-in-out infinite, breatheGlow 4s ease-in-out infinite',
  },
  breathCircleInner: {
    width: 80, height: 80,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(248,200,180,0.6) 0%, rgba(232,131,108,0.4) 100%)',
    animation: 'breathe 4s ease-in-out infinite',
    animationDelay: '0.5s',
  },
  breathText: {
    fontSize: 20,
    fontWeight: 300,
    color: '#f5e6df',
    letterSpacing: 2,
    textAlign: 'center',
    margin: 0,
  },
  breathBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 99,
    color: '#f5e6df',
    fontSize: 14,
    padding: '10px 24px',
    cursor: 'pointer',
    letterSpacing: 0.5,
    animation: 'fadeSlideIn 0.4s ease',
  },
  storyOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 200,
    animation: 'fadeSlideIn 0.2s ease',
    padding: '0 0 0 0',
  },
  storyModal: {
    width: '100%',
    maxWidth: 560,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid',
    borderRadius: '24px 24px 0 0',
    padding: '28px 28px 40px',
    animation: 'completionEnter 0.25s ease',
  },
  storyEyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', margin: '0 0 8px' },
  storyTitle: { fontSize: 20, fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.3px' },
  storyBody: { fontSize: 15, lineHeight: 1.8 },
  storyClose: {
    display: 'block',
    width: '100%',
    border: 'none',
    borderRadius: 12,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 28,
    transition: 'opacity 0.2s',
  },
};

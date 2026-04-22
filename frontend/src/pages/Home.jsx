import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IllustrationHero } from '../components/Illustrations';
import { getWeeklyStats, getHeatmap } from '../api/stats';
import Onboarding, { useOnboarding } from '../components/Onboarding';
import { getT } from '../i18n';
import CommunityWall from '../components/CommunityWall';
import DailyQuote from '../components/DailyQuote';
import BadgeRow from '../components/BadgeRow';

export default function Home() {
  const { isLoggedIn, displayName, lang, setLang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();
  const [weekStats, setWeekStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(useOnboarding);
  const [notifOpen, setNotifOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    { label: t.emotionFeatureLabel,   desc: t.emotionFeatureDesc,   path: '/emotions',      emoji: '🌊', color: '#e8f4fb', border: '#a8c8e8', accent: '#5a9fc0' },
    { label: t.conflictFeatureLabel,  desc: t.conflictFeatureDesc,  path: '/conflicts',     emoji: '⚖️', color: '#fdf3ee', border: '#f0b8a0', accent: '#c87050' },
    { label: t.cognitiveFeatureLabel, desc: t.cognitiveFeatureDesc, path: '/cognitive/new', emoji: '🧠', color: '#f3f0fb', border: '#b8a8e8', accent: '#7060c8' },
    { label: t.weeklyReportLabel,     desc: t.weeklyReportDesc,     path: '/report',        emoji: '📊', color: '#f0f4ff', border: '#a8b8e8', accent: '#5060c8' },
  ];

  useEffect(() => {
    getWeeklyStats().then((r) => setWeekStats(r.data)).catch(() => {});
    getHeatmap().then((r) => setHeatmapData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => {
      if (!e.target.closest('[data-notif]')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [notifOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!e.target.closest('[data-menu]')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

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
          <span style={{ ...s.logoText, color: text_head, fontSize: lang === 'en' ? 14 : 17 }}>{t.appName}</span>
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

          {/* 手機版漢堡選單 */}
          <div data-menu="1" className="nav-hamburger" style={{ position: 'relative' }}>
            <button
              style={{ ...s.hamburgerBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text, padding: '8px 11px' }}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {/* 漢堡三條線 */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {menuOpen && (
              <div data-menu="1" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 180,
                background: isDark ? 'rgba(28,25,23,0.95)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${nav_bdr}`,
                borderRadius: 14,
                padding: '6px',
                boxShadow: isDark
                  ? '0 12px 40px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 200,
              }}>
                {/* 語言切換 */}
                <button
                  style={{ ...s.menuItem, color: nav_text, width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}
                  onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  {lang === 'zh' ? 'Switch to English' : '切換中文'}
                </button>

                {/* 分隔線 */}
                <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', margin: '4px 6px' }} />

                {/* 帳號 / 登入登出 */}
                {isLoggedIn ? (
                  <button
                    style={{ ...s.menuItem, color: nav_text, width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}
                    onClick={() => { navigate('/account'); setMenuOpen(false); }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {t.settings}
                  </button>
                ) : (
                  <>
                    <button
                      style={{ ...s.menuItem, color: nav_text, width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      {t.signIn}
                    </button>
                    <button
                      style={{ ...s.menuItem, color: '#7fb5a0', fontWeight: 600, width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => { navigate('/register'); setMenuOpen(false); }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      {t.createAccount}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 手機版下拉選單已移除 — 導覽改由底部 Tab Bar 處理 */}

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
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', width: '100%', maxWidth: 420,
          margin: '0 auto', gap: 12,
        }}>
          <p style={s.heroEyebrow}>{t.homeEyebrow}</p>
          <h1 style={{ ...s.heroTitle, color: text_head }}>
            {t.homeTitle1}<br />
            {t.homeTitle2}<span style={s.heroAccent}>{t.homeAccent}</span>
          </h1>
          <p style={{ ...s.heroSub, color: text_sub }}>{t.homeSub}</p>
        </div>

        {!isLoggedIn && (
          <div style={{ ...s.guestBanner, background: isDark ? 'rgba(120,100,50,0.2)' : '#fefce8', borderColor: isDark ? 'rgba(251,191,36,0.25)' : '#fde68a', color: isDark ? '#d4a84b' : '#78600a' }}>
            <span>🔒</span>
            <span>{t.guestBanner}</span>
            <button style={{ ...s.bannerBtn, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/register')}>{t.getStarted}</button>
          </div>
        )}
      </section>

      {/* Daily Quote */}
      <DailyQuote isDark={isDark} lang={lang} />

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
            style={{
              ...s.card,
              background: isDark ? 'rgba(22,18,16,0.48)' : 'rgba(255,255,255,0.42)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.75)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.45)'
                : 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07)',
            }}
            onClick={() => navigate(f.path)}
          >
            <div style={{
              ...s.cardIcon,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.85)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
            }}>{f.emoji}</div>
            <div style={s.cardBody}>
              <h2 style={{ ...s.cardTitle, color: isDark ? '#d6d3d1' : f.accent }}>{f.label}</h2>
              <p style={{ ...s.cardDesc, color: text_sub }}>{f.desc}</p>
            </div>
            <span style={{ ...s.cardArrow, color: isDark ? '#7fb5a0' : f.accent }}>→</span>
          </div>
        ))}
      </section>

      {/* Badges */}
      <BadgeRow isDark={isDark} lang={lang} isLoggedIn={isLoggedIn} />

      {/* Community Wall */}
      <CommunityWall isDark={isDark} lang={lang} />

      {/* Quick links */}
      <section style={s.quick}>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/emotions/history')}>{t.emotionHistory}</button>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/conflicts/stats')}>{t.conflictStats}</button>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/breathing')}>
          {lang === 'zh' ? '🌬️ 深呼吸' : '🌬️ Breathe'}
        </button>
        <button style={{ ...s.quickLink, background: nav_bg, borderColor: nav_bdr, color: nav_text }} onClick={() => navigate('/affirmations')}>
          {lang === 'zh' ? '🎙️ 激勵牆' : '🎙️ Voice Wall'}
        </button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flexWrap: 'wrap', gap: '2px 8px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb5a0', letterSpacing: 0.6, textTransform: 'uppercase', margin: 0, flexShrink: 0 }}>{t.heatmapLabel}</p>
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
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #e8e0d0',
    marginBottom: 40,
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
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
    fontSize: 'clamp(20px, 5.5vw, 28px)',
    fontWeight: 700,
    lineHeight: 1.5,
    color: '#2d3748',
    marginBottom: 16,
    letterSpacing: '-0.2px',
    textWrap: 'balance',
  },
  heroAccent: {
    color: '#7fb5a0',
    borderBottom: '3px solid #b8d9cf',
  },
  heroSub: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: 24,
    textWrap: 'balance',
  },
  guestBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    color: '#78600a',
    width: '100%',
    boxSizing: 'border-box',
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
    marginLeft: 'auto',
    flexShrink: 0,
    whiteSpace: 'nowrap',
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
    borderRadius: 20,
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
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
    background: 'rgba(255,255,255,0.42)',
    backdropFilter: 'blur(40px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
    border: '1px solid rgba(255,255,255,0.72)',
    borderRadius: 99,
    padding: '8px 20px',
    fontSize: 14,
    color: '#4a5568',
    fontWeight: 500,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s',
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
    position: 'fixed', top: '-80px', right: '-60px',
    width: 380, height: 380,
    background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(48px)', zIndex: -1, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', bottom: '8%', left: '-100px',
    width: 340, height: 340,
    background: 'radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(56px)', zIndex: -1, pointerEvents: 'none',
  },
  blob3: {
    position: 'fixed', top: '38%', right: '-40px',
    width: 220, height: 220,
    background: 'radial-gradient(circle, rgba(249,168,212,0.42) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none',
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

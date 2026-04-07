import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IllustrationHero } from '../components/Illustrations';
import { getWeeklyStats } from '../api/stats';
import Onboarding, { useOnboarding } from '../components/Onboarding';
import { getT } from '../i18n';

export default function Home() {
  const { isLoggedIn, displayName, lang, setLang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();
  const [weekStats, setWeekStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(useOnboarding);
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, []);

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
              <button style={{ ...s.menuItem, color: nav_text }} onClick={() => { navigate('/account'); setMenuOpen(false); }}>
                ⚙️ {t.settings}
              </button>
            ) : (
              <>
                <button style={{ ...s.menuItem, color: nav_text }} onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                  👤 {t.signIn}
                </button>
                <button style={{ ...s.menuItem, fontWeight: 600, color: '#7fb5a0' }} onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                  ✨ {t.createAccount}
                </button>
              </>
            )}
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

      {/* Feature Cards */}
      <section style={s.cards}>
        {features.map((f) => (
          <div
            key={f.path}
            style={{ ...s.card, background: isDark ? 'rgba(41,37,36,0.7)' : f.color, borderColor: isDark ? 'rgba(255,255,255,0.08)' : f.border }}
            onClick={() => navigate(f.path)}
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

      {/* Footer */}
      <footer style={{ ...s.footer, borderTopColor: isDark ? '#3d3530' : '#e8e0d0' }}>
        <button style={{ ...s.privacyLink, color: text_sub }} onClick={() => navigate('/privacy')}>{t.privacyPolicy}</button>
        <span style={{ ...s.footerDot, color: text_sub }}>·</span>
        <span style={{ ...s.footerText, color: text_sub }}>{t.dataProtected}</span>
      </footer>
    </div>
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
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, paddingTop: 20, borderTop: '1px solid #e8e0d0' },
  privacyLink: { background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 },
  footerDot: { color: '#d1d5db', fontSize: 13 },
  footerText: { fontSize: 13, color: '#9ca3af' },
};

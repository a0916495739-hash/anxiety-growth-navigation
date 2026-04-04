import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IllustrationHero } from '../components/Illustrations';
import { getWeeklyStats } from '../api/stats';
import Onboarding, { useOnboarding } from '../components/Onboarding';

const features = [
  {
    label: '情緒除噪器',
    desc: '記錄並轉化你的負面情緒，找到它想保護你的事',
    path: '/emotions',
    emoji: '🌊',
    color: '#e8f4fb',
    border: '#a8c8e8',
    accent: '#5a9fc0',
  },
  {
    label: '微小成就系統',
    desc: '記錄生活中的小事，累積屬於你的成就感',
    path: '/achievements',
    emoji: '✨',
    color: '#e8f4f0',
    border: '#7fb5a0',
    accent: '#4a9580',
  },
  {
    label: '應該 vs 想要',
    desc: '釐清外在期望與內心渴望的差異',
    path: '/conflicts',
    emoji: '⚖️',
    color: '#fdf3ee',
    border: '#f0b8a0',
    accent: '#c87050',
  },
];

export default function Home() {
  const { isLoggedIn, handleLogout, displayName } = useApp();
  const navigate = useNavigate();
  const [weekStats, setWeekStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(useOnboarding);

  useEffect(() => {
    getWeeklyStats().then((r) => setWeekStats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.logoMark}>🌿</span>
          <span style={s.logoText}>抗焦慮成長導航</span>
        </div>
        <div style={s.navActions}>
          {isLoggedIn ? (
            <>
              {displayName && <span style={s.greeting}>Hi, {displayName}</span>}
              <button style={s.ghostBtn} onClick={() => navigate('/account')}>設定</button>
            </>
          ) : (
            <>
              <button style={s.ghostBtn} onClick={() => navigate('/login')}>登入</button>
              <button style={s.primaryBtn} onClick={() => navigate('/register')}>建立帳號</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroIllus}>
          <IllustrationHero width={240} />
        </div>
        <p style={s.heroEyebrow}>給在社群比較中感到疲憊的你</p>
        <h1 style={s.heroTitle}>
          不需要比任何人好，<br />只需要比昨天的自己<span style={s.heroAccent}>更理解自己</span>
        </h1>
        <p style={s.heroSub}>三個輕量工具，幫你梳理情緒、肯定自我、釐清方向。</p>

        {!isLoggedIn && (
          <div style={s.guestBanner}>
            <span>🔒</span>
            <span>你目前以訪客身份體驗，<strong>建立帳號</strong>後資料永久保留</span>
            <button style={s.bannerBtn} onClick={() => navigate('/register')}>立即建立</button>
          </div>
        )}
      </section>

      {/* Weekly Stats */}
      {weekStats && (weekStats.emotions > 0 || weekStats.achievements > 0 || weekStats.conflicts > 0) && (
        <section style={s.statsBar}>
          <p style={s.statsLabel}>本週你做到了</p>
          <div style={s.statsRow}>
            {weekStats.emotions > 0 && (
              <div style={s.statItem}>
                <span style={s.statNum}>{weekStats.emotions}</span>
                <span style={s.statDesc}>次情緒記錄</span>
              </div>
            )}
            {weekStats.achievements > 0 && (
              <div style={s.statItem}>
                <span style={s.statNum}>{weekStats.achievements}</span>
                <span style={s.statDesc}>個小成就</span>
              </div>
            )}
            {weekStats.conflicts > 0 && (
              <div style={s.statItem}>
                <span style={s.statNum}>{weekStats.conflicts}</span>
                <span style={s.statDesc}>次衝突釐清</span>
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
            style={{ ...s.card, background: f.color, borderColor: f.border }}
            onClick={() => navigate(f.path)}
          >
            <div style={{ ...s.cardIcon, background: f.border }}>{f.emoji}</div>
            <div style={s.cardBody}>
              <h2 style={{ ...s.cardTitle, color: f.accent }}>{f.label}</h2>
              <p style={s.cardDesc}>{f.desc}</p>
            </div>
            <span style={{ ...s.cardArrow, color: f.accent }}>→</span>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section style={s.quick}>
        <button style={s.quickLink} onClick={() => navigate('/emotions/history')}>📋 情緒記錄歷史</button>
        <button style={s.quickLink} onClick={() => navigate('/conflicts/stats')}>📊 應該來源分析</button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <button style={s.privacyLink} onClick={() => navigate('/privacy')}>🛡️ 隱私權政策</button>
        <span style={s.footerDot}>·</span>
        <span style={s.footerText}>資料加密保護，不販售個人資訊</span>
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
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #e8e0d0',
    marginBottom: 40,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoMark: { fontSize: 22 },
  logoText: { fontWeight: 700, fontSize: 17, color: '#2d3748', letterSpacing: '-0.3px' },
  navActions: { display: 'flex', gap: 8, alignItems: 'center' },
  greeting: { fontSize: 14, color: '#6b7280', fontWeight: 500 },
  ghostBtn: {
    background: 'transparent',
    border: '1.5px solid #7fb5a0',
    color: '#4a9580',
    borderRadius: 99,
    padding: '7px 18px',
    fontSize: 14,
    fontWeight: 500,
  },
  primaryBtn: {
    background: '#7fb5a0',
    border: 'none',
    color: '#fff',
    borderRadius: 99,
    padding: '7px 18px',
    fontSize: 14,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(127,181,160,0.35)',
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
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#2d3748',
    marginBottom: 16,
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
    background: '#f59e0b',
    border: 'none',
    color: '#fff',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 13,
    fontWeight: 600,
    marginLeft: 4,
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
    background: '#fff',
    border: '1.5px solid #e8e0d0',
    borderRadius: 99,
    padding: '8px 20px',
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
  },
  statsBar: {
    background: 'linear-gradient(135deg, #e8f4f0, #faf8f3)',
    border: '1.5px solid #c8ddd7',
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
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, paddingTop: 20, borderTop: '1px solid #e8e0d0' },
  privacyLink: { background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 },
  footerDot: { color: '#d1d5db', fontSize: 13 },
  footerText: { fontSize: 13, color: '#9ca3af' },
};

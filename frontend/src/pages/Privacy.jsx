import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    icon: '🔐',
    title: '密碼安全（Bcrypt 加密）',
    badge: '已實作',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    content: [
      '你的密碼在存入資料庫前，會經過 bcrypt（cost factor 10）雜湊處理。',
      '我們儲存的是「雜湊值」，而非你的真實密碼。就算資料庫遭到未授權存取，攻擊者也無法還原你的密碼。',
      '我們的系統無法查看你的密碼，任何人也無法以明文取得它。',
    ],
  },
  {
    icon: '🌐',
    title: '傳輸加密（HTTPS）',
    badge: '部署後自動啟用',
    badgeColor: '#0369a1',
    badgeBg: '#f0f9ff',
    content: [
      '部署至 Railway 或 Vercel 等平台後，所有連線會自動升級為 HTTPS（TLS 加密）。',
      '這代表你輸入的情緒記錄、帳號密碼，在從瀏覽器傳送到伺服器的過程中，都是加密的，無法被網路中途攔截。',
      '本機開發環境（localhost）不包含此保護，但正式上線後由平台自動提供。',
    ],
  },
  {
    icon: '⚙️',
    title: '環境變數與金鑰管理',
    badge: '已實作',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    content: [
      '所有敏感設定（資料庫密碼、JWT 金鑰）均透過環境變數傳入，不寫死在程式碼中。',
      '前端 API 位址透過 VITE_API_URL 環境變數設定，部署時只需在平台後台填入正確網址，無需修改程式碼。',
      '.env 檔案已加入 .gitignore，不會上傳至 GitHub 或任何公開版本控制系統。',
    ],
  },
  {
    icon: '🗄️',
    title: '資料儲存與隔離',
    badge: '已實作',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    content: [
      '每位使用者的資料（情緒記錄、成就、衝突）以獨立 user_id 關聯，各帳號之間完全隔離。',
      '訪客模式資料以 UUID guest_token 識別，僅存在於你的裝置（localStorage）及伺服器。',
      '當你建立正式帳號時，訪客資料會在同一個資料庫 transaction 內完整遷移，原訪客記錄同時刪除。',
    ],
  },
  {
    icon: '📋',
    title: '我們收集哪些資料',
    badge: null,
    content: [
      '帳號資訊：Email、bcrypt 加密後的密碼雜湊、顯示名稱（選填）。',
      '使用記錄：你主動輸入的情緒記錄、成就、應該 vs 想要衝突紀錄。',
      '我們不收集裝置資訊、IP 位址或任何第三方追蹤資料。',
      '我們不會將你的個人資料販售或分享給任何第三方。',
    ],
  },
  {
    icon: '🗑️',
    title: '資料刪除',
    badge: null,
    content: [
      '你可以在各功能頁面隨時刪除個別記錄。',
      '如需刪除整個帳號與所有資料，請聯繫我們。',
      '資料庫設有 ON DELETE CASCADE，刪除帳號時所有關聯資料將同步刪除。',
    ],
  },
];

export default function Privacy() {
  const navigate = useNavigate();
  const updated = '2026 年 4 月';

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate(-1)}>← 返回</button>

      <div style={s.hero}>
        <span style={s.heroIcon}>🛡️</span>
        <h1 style={s.title}>隱私權政策</h1>
        <p style={s.sub}>我們如何保護你的資料與隱私</p>
        <p style={s.updated}>最後更新：{updated}</p>
      </div>

      <div style={s.intro}>
        <p>
          抗焦慮成長導航是一個用來認識自己的工具。你在這裡記錄的，是你最脆弱、最真實的內心狀態。
          我們認真對待這份信任，以下說明我們在技術層面如何保護你的資料。
        </p>
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.title} style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>{sec.icon}</span>
            <div style={s.sectionMeta}>
              <h2 style={s.sectionTitle}>{sec.title}</h2>
              {sec.badge && (
                <span style={{ ...s.badge, color: sec.badgeColor, background: sec.badgeBg }}>
                  {sec.badge}
                </span>
              )}
            </div>
          </div>
          <ul style={s.list}>
            {sec.content.map((item, i) => (
              <li key={i} style={s.listItem}>
                <span style={s.bullet}>·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div style={s.footer}>
        <p style={s.footerText}>
          本政策適用於目前的開發版本。正式上線後將依實際部署環境更新。
        </p>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← 返回</button>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' },
  back: { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 24px', display: 'block' },
  hero: { textAlign: 'center', padding: '16px 0 32px' },
  heroIcon: { fontSize: 48, display: 'block', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 700, color: '#2d3748', marginBottom: 8 },
  sub: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  updated: { fontSize: 13, color: '#9ca3af' },
  intro: {
    background: 'linear-gradient(135deg, #e8f4f0, #faf8f3)',
    border: '1.5px solid #c8ddd7',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 20,
    fontSize: 15,
    color: '#374151',
    lineHeight: 1.8,
  },
  section: {
    background: '#fff',
    border: '1.5px solid #e8e0d0',
    borderRadius: 14,
    padding: '20px',
    marginBottom: 12,
  },
  sectionHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  sectionIcon: { fontSize: 22, flexShrink: 0, marginTop: 2 },
  sectionMeta: { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#2d3748', margin: 0 },
  badge: { fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '2px 8px', width: 'fit-content' },
  list: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  listItem: { display: 'flex', gap: 8, fontSize: 14, color: '#6b7280', lineHeight: 1.7 },
  bullet: { color: '#7fb5a0', fontWeight: 700, flexShrink: 0, marginTop: 1 },
  footer: { marginTop: 32, textAlign: 'center' },
  footerText: { fontSize: 13, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 },
  backBtn: { background: '#7fb5a0', border: 'none', color: '#fff', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

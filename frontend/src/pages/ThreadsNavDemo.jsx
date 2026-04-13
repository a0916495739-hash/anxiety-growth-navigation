import { useState } from 'react';
import ThreadsBottomNav from '../components/ThreadsBottomNav';
import { Home, Search, SquarePen, Heart, User } from 'lucide-react';

const PAGE_CONTENT = {
  home:    { emoji: '🏠', title: '首頁',     desc: '你的動態牆在這裡' },
  search:  { emoji: '🔍', title: '搜尋',     desc: '找人、找話題、找靈感' },
  post:    { emoji: '✍️', title: '發布',     desc: '說說你現在的想法' },
  heart:   { emoji: '❤️', title: '心動',     desc: '有人對你的貼文有反應' },
  profile: { emoji: '👤', title: '個人檔案', desc: '你的貼文、追蹤、設定' },
};

export default function ThreadsNavDemo() {
  const [active, setActive] = useState('home');
  const page = PAGE_CONTENT[active];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Mock phone frame on desktop */}
      <div style={{
        maxWidth: 390,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#ffffff',
        position: 'relative',
        boxShadow: '0 0 40px rgba(0,0,0,0.08)',
      }}>
        {/* Top bar */}
        <div style={{ padding: '52px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Threads</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0' }} />
          </div>
        </div>

        {/* Page content */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 140px)',
          paddingBottom: 80, gap: 12,
        }}>
          <span style={{ fontSize: 64 }}>{page.emoji}</span>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{page.title}</p>
          <p style={{ fontSize: 15, color: '#9ca3af', margin: 0 }}>{page.desc}</p>

          {/* Active indicator */}
          <div style={{
            marginTop: 24,
            display: 'flex', gap: 8,
          }}>
            {Object.keys(PAGE_CONTENT).map((id) => (
              <div key={id} style={{
                width: id === active ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: id === active ? '#000' : '#e5e7eb',
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <ThreadsBottomNav active={active} onChange={setActive} />
      </div>
    </div>
  );
}

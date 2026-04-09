import { useState, useEffect } from 'react';
import { getCommunityPosts, submitCommunityPost, hugPost } from '../api/community';

function timeAgo(dateStr, lang) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return lang === 'zh' ? '剛才' : 'just now';
  if (diff < 3600) return lang === 'zh' ? `${Math.floor(diff / 60)} 分鐘前` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return lang === 'zh' ? `${Math.floor(diff / 3600)} 小時前` : `${Math.floor(diff / 3600)}h ago`;
  return lang === 'zh' ? `${Math.floor(diff / 86400)} 天前` : `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityWall({ isDark, lang }) {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hugged, setHugged] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hugged_posts') || '[]'); } catch { return []; }
  });

  const D = isDark;
  const zh = lang === 'zh';

  useEffect(() => {
    getCommunityPosts()
      .then((r) => setPosts(r.data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitCommunityPost(input.trim());
      setInput('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      // silent fail for MVP
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHug(id) {
    if (hugged.includes(id)) return;
    try {
      const r = await hugPost(id);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, hug_count: r.data.hug_count } : p));
      const next = [...hugged, id];
      setHugged(next);
      localStorage.setItem('hugged_posts', JSON.stringify(next));
    } catch {}
  }

  const c = {
    bg:      D ? 'rgba(41,37,36,0.85)' : 'rgba(245,241,237,0.7)',
    border:  D ? 'rgba(255,255,255,0.08)' : 'rgba(255,182,193,0.3)',
    text:    D ? '#e7e5e4' : '#374151',
    sub:     D ? '#a8a29e' : '#6b7280',
    card:    D ? 'rgba(28,25,23,0.6)' : '#fff',
    cardBdr: D ? 'rgba(255,255,255,0.07)' : '#f0ede8',
    input:   D ? 'rgba(28,25,23,0.6)' : '#faf8f3',
    inputBdr:D ? 'rgba(255,255,255,0.1)' : '#e8e0d0',
  };

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7fb5a0', letterSpacing: 0.6, textTransform: 'uppercase', margin: 0 }}>
          {zh ? '樹洞牆' : 'Community Wall'}
        </p>
        <p style={{ fontSize: 11, color: c.sub, margin: 0 }}>
          {zh ? '匿名 · 溫暖 · 真實' : 'anonymous · warm · real'}
        </p>
      </div>

      <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '14px 16px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        {/* Posts */}
        {posts.length === 0 ? (
          <p style={{ fontSize: 13, color: c.sub, textAlign: 'center', padding: '16px 0', margin: 0 }}>
            {zh ? '還沒有人分享，來第一個吧 🌱' : 'No posts yet — be the first 🌱'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {posts.map((p) => {
              const didHug = hugged.includes(p.id);
              return (
                <div key={p.id} style={{ background: c.card, border: `1px solid ${c.cardBdr}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <p style={{ flex: 1, fontSize: 14, color: c.text, lineHeight: 1.6, margin: 0, wordBreak: 'break-all' }}>{p.content}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => handleHug(p.id)}
                      style={{
                        background: 'none', border: 'none', cursor: didHug ? 'default' : 'pointer',
                        fontSize: 18, lineHeight: 1, padding: '2px 4px',
                        opacity: didHug ? 0.5 : 1,
                        transition: 'transform 0.15s',
                        transform: didHug ? 'scale(1.15)' : 'scale(1)',
                      }}
                      disabled={didHug}
                      title={zh ? '送出擁抱' : 'Give a hug'}
                    >
                      🫂
                    </button>
                    <span style={{ fontSize: 11, color: c.sub }}>{p.hug_count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit */}
        {submitted ? (
          <div style={{ background: D ? 'rgba(127,181,160,0.12)' : '#e8f4f0', border: `1px solid ${D ? 'rgba(127,181,160,0.25)' : '#c8e6dc'}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#7fb5a0', textAlign: 'center' }}>
            {zh ? '✓ 已送出，審核後會出現在這裡 🌱' : '✓ Sent! It will appear here after review 🌱'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={100}
              placeholder={zh ? '分享一句話，讓別人知道你不孤單…' : 'Share a line — someone needs to hear it…'}
              style={{
                flex: 1, borderRadius: 10, padding: '9px 12px', fontSize: 13,
                background: c.input, border: `1px solid ${c.inputBdr}`,
                color: c.text, outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || submitting}
              style={{
                background: '#7fb5a0', color: '#fff', border: 'none',
                borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600,
                cursor: !input.trim() || submitting ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || submitting ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              {zh ? '投稿' : 'Post'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

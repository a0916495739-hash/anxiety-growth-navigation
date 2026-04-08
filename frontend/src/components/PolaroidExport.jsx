import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

/**
 * PolaroidExport
 * 顯示一個全螢幕 Modal，包含 9:16 拍立得卡片，可下載為 PNG。
 *
 * Props:
 *   achievementText  {string}  成就標題（必填）
 *   standard         {string}  我的標準（選填）
 *   onClose          {fn}      關閉 Modal
 */
export default function PolaroidExport({ achievementText, standard, onClose }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('.');

  async function handleDownload() {
    if (!cardRef.current || loading) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `成就-${dateStr}.png`;
      a.click();
    } catch (err) {
      console.error('圖片生成失敗', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    /* ── 全螢幕遮罩 ── */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(20,18,17,0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── 9:16 截圖目標 (300 × 533) ── */}
      <div
        ref={cardRef}
        style={{
          width: 300, height: 533,
          borderRadius: 20,
          background: 'linear-gradient(145deg, #bdd9cf 0%, #ddeee8 40%, #f0ebe4 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* 光暈 1 — 右上角鼠尾草綠 */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(127,181,160,0.38)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        {/* 光暈 2 — 左下角琥珀 */}
        <div style={{
          position: 'absolute', bottom: 50, left: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(251,191,36,0.22)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
        }} />

        {/* ── 拍立得卡片本體 ── */}
        <div style={{
          background: '#fff',
          borderRadius: 3,
          padding: '12px 12px 32px',
          width: 210,
          boxShadow: '0 18px 52px rgba(0,0,0,0.22)',
          transform: 'rotate(-2deg)',
          position: 'relative', zIndex: 1,
        }}>
          {/* 1:1 相片區 */}
          <div style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: 'linear-gradient(135deg, #c8e6dc 0%, #f0e6d3 100%)',
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 52, userSelect: 'none' }}>✨</span>
          </div>

          {/* 說明文字 */}
          <div style={{ padding: '0 2px' }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: '#2d3748', lineHeight: 1.55,
              margin: '0 0 6px',
              wordBreak: 'break-all',
            }}>
              {achievementText}
            </p>
            {standard && (
              <p style={{
                fontSize: 11, color: '#9ca3af',
                fontStyle: 'italic', lineHeight: 1.45,
                margin: '0 0 8px',
              }}>
                「{standard}」
              </p>
            )}
            <p style={{
              fontSize: 11, color: '#b5b0a8',
              margin: 0, letterSpacing: 1.2,
            }}>
              {dateStr}
            </p>
          </div>
        </div>

        {/* 浮水印 */}
        <p style={{
          position: 'absolute', bottom: 14,
          left: 0, right: 0, textAlign: 'center',
          fontSize: 10, letterSpacing: 2.5,
          color: 'rgba(127,181,160,0.55)',
          margin: 0, userSelect: 'none',
        }}>
          微光成長導航
        </p>
      </div>

      {/* ── 操作按鈕 ── */}
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          marginTop: 24,
          background: loading ? '#5a9a87' : '#7fb5a0',
          color: '#fff', border: 'none',
          borderRadius: 14, padding: '13px 36px',
          fontSize: 15, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          boxShadow: '0 6px 24px rgba(127,181,160,0.45)',
        }}
      >
        {loading ? '生成中…' : '儲存為圖片'}
      </button>

      <button
        onClick={onClose}
        style={{
          marginTop: 12, background: 'transparent',
          border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: 14, cursor: 'pointer', padding: '6px 16px',
        }}
      >
        關閉
      </button>
    </div>
  );
}

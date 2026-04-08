import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

/**
 * PolaroidModal
 *
 * Props:
 *   achievementText  {string}    成就標題（必填）
 *   standard         {string}    我的標準（選填）
 *   imageUrl         {string}    使用者上傳圖片的 Object URL（選填）
 *   onClose          {fn}        關閉 Modal
 *   onSave           {fn|null}   若傳入，Modal 內顯示「儲存成就」按鈕，呼叫後儲存至 DB
 */
export default function PolaroidModal({ achievementText, standard, imageUrl, onClose, onSave }) {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('.');

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `成就-${dateStr}.png`;
      a.click();
    } catch (err) {
      console.error('圖片生成失敗', err);
    } finally {
      setExporting(false);
    }
  }

  async function handleSave() {
    if (!onSave || saving) return;
    setSaving(true);
    await onSave();
    // onSave 呼叫後父元件會切換 done 狀態，Modal 自然卸載
  }

  return (
    /* ── 全螢幕遮罩 ── */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(18,15,14,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── 關閉按鈕 ── */}
      <button
        onClick={onClose}
        aria-label="關閉"
        style={{
          position: 'fixed', top: 20, right: 20,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 20, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      {/* ── 9:16 截圖目標 (320 × 568) ── */}
      <div
        ref={cardRef}
        style={{
          width: 320, height: 568,
          borderRadius: 20, flexShrink: 0,
          background: 'linear-gradient(145deg, #bdd9cf 0%, #ddeee8 40%, #f0ebe4 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* 光暈 1 — 右上鼠尾草綠 */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(127,181,160,0.38)',
          filter: 'blur(70px)', pointerEvents: 'none',
        }} />
        {/* 光暈 2 — 左下琥珀 */}
        <div style={{
          position: 'absolute', bottom: 50, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(251,191,36,0.22)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        {/* ── 拍立得卡片本體 ── */}
        <div style={{
          background: '#fff', borderRadius: 3,
          padding: '14px 14px 36px',
          width: 232,
          boxShadow: '0 20px 60px rgba(0,0,0,0.24)',
          transform: 'rotate(-2deg)',
          position: 'relative', zIndex: 1,
        }}>
          {/* 1:1 相片區 */}
          <div style={{
            width: '100%', aspectRatio: '1 / 1',
            borderRadius: 2, overflow: 'hidden',
            marginBottom: 14,
            background: 'linear-gradient(135deg, #c8e6dc 0%, #f0e6d3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="成就圖片"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <span style={{ fontSize: 54, userSelect: 'none' }}>✨</span>
            )}
          </div>

          {/* 文字區 */}
          <div style={{ padding: '0 2px' }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: '#2d3748', lineHeight: 1.6,
              margin: '0 0 6px', wordBreak: 'break-all',
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
            <p style={{ fontSize: 11, color: '#b5b0a8', margin: 0, letterSpacing: 1.2 }}>
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

      {/* ── 操作按鈕區 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 22, width: '100%', maxWidth: 320 }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            width: '100%',
            background: exporting ? '#5a9a87' : '#7fb5a0',
            color: '#fff', border: 'none',
            borderRadius: 14, padding: '13px',
            fontSize: 15, fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 24px rgba(127,181,160,0.4)',
            transition: 'background 0.2s',
          }}
        >
          {exporting ? '生成中…' : '匯出為圖片 📥'}
        </button>

        {onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.75)',
              borderRadius: 14, padding: '12px',
              fontSize: 15, fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            {saving ? '儲存中…' : '儲存成就 ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

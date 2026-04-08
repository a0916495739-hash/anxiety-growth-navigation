import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

/**
 * PolaroidModal
 *
 * Props:
 *   achievementText  {string}    成就標題（必填）
 *   standard         {string}    我的標準（選填）
 *   imageUrl         {string}    使用者上傳圖片的 Object URL 或 Base64（選填）
 *   onClose          {fn}        關閉 Modal
 *   onSave           {fn|null}   若傳入，顯示「儲存成就」按鈕
 */
export default function PolaroidModal({ achievementText, standard, imageUrl, onClose, onSave }) {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving]       = useState(false);

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('.');

  // ── 根據螢幕高度計算縮放比 ──────────────────────────────────────────
  // 卡片高度固定 568，保留 40px padding + 120px 按鈕區
  const CARD_H  = 568;
  const CARD_W  = 320;
  const RESERVE = 40 + 120; // 上下 padding + 按鈕高度
  const scale   = Math.min(1, (window.innerHeight - RESERVE) / CARD_H);
  // transform: scale 不改變 layout 尺寸，需用負 margin 補回多餘空白
  const excessH = CARD_H * (1 - scale); // 縮小後節省的 px

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      // toPng 依 DOM offsetWidth/offsetHeight 截圖，不受 transform 影響
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `成就-${dateStr}.png`;
      a.click();
      onClose(); // 下載後自動關閉
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
  }

  return (
    /* ── 全螢幕遮罩
       justifyContent: flex-start + paddingTop 解決 center + overflow 捲動 bug ── */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(18,15,14,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',   // ← 關鍵：讓內容從頂部開始排，才能正常捲動
        paddingTop: 20, paddingBottom: 24,
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── 關閉按鈕（fixed，永遠在右上角） ── */}
      <button
        onClick={onClose}
        aria-label="關閉"
        style={{
          position: 'fixed', top: 16, right: 16,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 20, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1201,
        }}
      >
        ×
      </button>

      {/* ── 縮放包裝層（視覺縮放，不影響 cardRef DOM 尺寸） ── */}
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        marginBottom: -excessH,   // 補回因縮放而多出的 layout 空白
        flexShrink: 0,
      }}>
        {/* ── 截圖目標 9:16 (320 × 568)，ref 只綁這裡 ── */}
        <div
          ref={cardRef}
          style={{
            width: CARD_W, height: CARD_H,
            borderRadius: 20,
            background: 'linear-gradient(145deg, #bdd9cf 0%, #ddeee8 40%, #f0ebe4 100%)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* 光暈 1 */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 240, height: 240, borderRadius: '50%',
            background: 'rgba(127,181,160,0.38)',
            filter: 'blur(70px)', pointerEvents: 'none',
          }} />
          {/* 光暈 2 */}
          <div style={{
            position: 'absolute', bottom: 50, left: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(251,191,36,0.22)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          {/* 拍立得本體 */}
          <div style={{
            background: '#fff', borderRadius: 3,
            padding: '14px 14px 36px', width: 232,
            boxShadow: '0 20px 60px rgba(0,0,0,0.24)',
            transform: 'rotate(-2deg)',
            position: 'relative', zIndex: 1,
          }}>
            {/* 1:1 相片區 */}
            <div style={{
              width: '100%', aspectRatio: '1 / 1',
              borderRadius: 2, overflow: 'hidden', marginBottom: 14,
              background: 'linear-gradient(135deg, #c8e6dc 0%, #f0e6d3 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {imageUrl ? (
                <img src={imageUrl} alt="成就圖片"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ fontSize: 54, userSelect: 'none' }}>✨</span>
              )}
            </div>

            {/* 文字區 */}
            <div style={{ padding: '0 2px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2d3748', lineHeight: 1.6, margin: '0 0 6px', wordBreak: 'break-all' }}>
                {achievementText}
              </p>
              {standard && (
                <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.45, margin: '0 0 8px' }}>
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
      </div>

      {/* ── 操作按鈕（在縮放層外，永遠緊貼卡片下方） ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10,
        marginTop: 20, width: '100%', maxWidth: 320, padding: '0 16px',
        flexShrink: 0,
      }}>
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
            }}
          >
            {saving ? '儲存中…' : '儲存成就 ✓'}
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13, cursor: 'pointer', padding: '4px 0',
          }}
        >
          關閉
        </button>
      </div>
    </div>
  );
}

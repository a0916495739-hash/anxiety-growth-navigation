import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';

export default function PolaroidModal({ achievementText, standard, imageUrl, onClose, onSave }) {
  const cardRef  = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving]       = useState(false);

  const today   = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href     = dataUrl;
      a.download = `成就-${dateStr}.png`;
      a.click();
      onClose();
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

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(18,15,14,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',   // 垂直分兩區：上方卡片（可捲）+ 下方按鈕（固定）
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── 關閉按鈕 ── */}
      <button
        onClick={onClose}
        aria-label="關閉"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 18, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1,
        }}
      >×</button>

      {/* ── 上方：卡片預覽區（flex:1 佔滿剩餘空間，內容置中） ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 12px 8px',
        overflow: 'hidden',          // 不需要捲動，靠縮放自適應
      }}>
        {/* 縮放容器：讓卡片永遠不超出可用高度 */}
        <CardScaler>
          {/* ── 截圖目標 9:16 (320 × 568)，ref 只綁這裡 ── */}
          <div
            ref={cardRef}
            style={{
              width: 320, height: 568,
              borderRadius: 20,
              background: 'linear-gradient(145deg, #bdd9cf 0%, #ddeee8 40%, #f0ebe4 100%)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* 光暈 */}
            <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(127,181,160,0.38)', filter:'blur(70px)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:50, left:-60, width:200, height:200, borderRadius:'50%', background:'rgba(251,191,36,0.22)', filter:'blur(60px)', pointerEvents:'none' }} />

            {/* 拍立得本體 */}
            <div style={{ background:'#fff', borderRadius:3, padding:'14px 14px 36px', width:232, boxShadow:'0 20px 60px rgba(0,0,0,0.24)', transform:'rotate(-2deg)', position:'relative', zIndex:1 }}>
              {/* 1:1 相片區 */}
              <div style={{ width:'100%', aspectRatio:'1/1', borderRadius:2, overflow:'hidden', marginBottom:14, background:'linear-gradient(135deg,#c8e6dc,#f0e6d3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {imageUrl
                  ? <img src={imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <span style={{ fontSize:54, userSelect:'none' }}>✨</span>
                }
              </div>
              {/* 文字 */}
              <div style={{ padding:'0 2px' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#2d3748', lineHeight:1.6, margin:'0 0 6px', wordBreak:'break-all' }}>{achievementText}</p>
                {standard && <p style={{ fontSize:11, color:'#9ca3af', fontStyle:'italic', lineHeight:1.45, margin:'0 0 8px' }}>「{standard}」</p>}
                <p style={{ fontSize:11, color:'#b5b0a8', margin:0, letterSpacing:1.2 }}>{dateStr}</p>
              </div>
            </div>

            {/* 浮水印 */}
            <p style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center', fontSize:10, letterSpacing:2.5, color:'rgba(127,181,160,0.55)', margin:0, userSelect:'none' }}>
              微光成長導航
            </p>
          </div>
        </CardScaler>
      </div>

      {/* ── 下方：按鈕列（橫排，高度最小化） ── */}
      <div style={{
        flexShrink: 0,
        padding: `10px 16px calc(10px + env(safe-area-inset-bottom, 0px))`,
        display: 'flex', flexDirection: 'row', gap: 10,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(18,15,14,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}>
        {onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 12, padding: '11px 8px',
              fontSize: 14, fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '儲存中…' : '儲存 ✓'}
          </button>
        )}
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            flex: onSave ? 2 : 1,
            background: exporting ? '#5a9a87' : '#7fb5a0',
            color: '#fff', border: 'none', borderRadius: 12, padding: '11px 8px',
            fontSize: 14, fontWeight: 700,
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(127,181,160,0.4)',
          }}
        >
          {exporting ? '生成中…' : '匯出圖片 📥'}
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── 自動縮放卡片以適應可用空間 ──────────────────────────────
// 用 ResizeObserver 量測父容器實際高度，動態計算 scale
import { useState as _useState, useEffect as _useEffect, useRef as _useRef } from 'react';

function CardScaler({ children }) {
  const wrapRef = _useRef(null);
  const [scale, setScale] = _useState(1);

  _useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const s = Math.min(1, width / 320, height / 568);
      setScale(parseFloat(s.toFixed(3)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        // transform 不改 layout，用固定尺寸讓父層正確量測
        width: 320, height: 568,
        flexShrink: 0,
      }}>
        {children}
      </div>
    </div>
  );
}

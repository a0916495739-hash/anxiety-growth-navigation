import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAchievement, getAchievements, deleteAchievement } from '../api/achievements';
import { IllustrationDone, IllustrationAchievement } from '../components/Illustrations';
import { useApp } from '../context/AppContext';
import { getT } from '../i18n';
import PolaroidModal from '../components/PolaroidModal';
import { toPng } from 'html-to-image';

// ─────────────────────────────────────────────
// 新增成就表單（手風琴式拍立得預覽）
// ─────────────────────────────────────────────
export function AchievementNew() {
  const [title, setTitle]               = useState('');
  const [standard, setStandard]         = useState('');
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);
  const [saving, setSaving]             = useState(false);
  const [exporting, setExporting]         = useState(false);
  const [imageUrl, setImageUrl]           = useState(null);   // Object URL
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);  // 手機手風琴
  const [isModalOpen, setIsModalOpen]     = useState(false);  // 桌機 Modal
  const fileInputRef        = useRef(null);
  const polaroidRef         = useRef(null);   // 截圖目標
  const previewContainerRef = useRef(null);   // 手風琴外框（捲動錨點）
  const formTopRef          = useRef(null);   // 表單頂部（匯出後捲回用）

  const { lang, isDark } = useApp();
  const t = getT(lang);
  const navigate = useNavigate();

  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('.');

  const c = isDark ? {
    text: '#e7e5e4', sub: '#a8a29e',
    input: 'rgba(28,25,23,0.6)', inputBorder: 'rgba(255,255,255,0.1)',
    uploadBtn: 'rgba(255,255,255,0.07)', uploadBdr: 'rgba(255,255,255,0.15)', uploadC: '#a8a29e',
    previewBdr: 'rgba(127,181,160,0.3)',
    accordion: 'rgba(28,25,23,0.5)', accordionBdr: 'rgba(255,255,255,0.08)',
  } : {
    text: '#2d3748', sub: '#6b7280',
    input: '#faf8f3', inputBorder: '#e8e0d0',
    uploadBtn: '#f3f4f6', uploadBdr: '#d1d5db', uploadC: '#6b7280',
    previewBdr: '#b8d9cf',
    accordion: '#f5f2ee', accordionBdr: '#e8e0d0',
  };

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  }

  function handleOpenPreview() {
    if (!title.trim()) { setError(t.achievementRequired); return; }
    setError('');
    // 桌機（≥ 768px）用 Modal，手機用手風琴
    if (window.innerWidth >= 768) {
      setIsModalOpen(true);
    } else {
      setIsPreviewOpen(true);
      setTimeout(() => {
        previewContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  async function handleExport() {
    if (!polaroidRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(polaroidRef.current, { pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `成就-${dateStr}.png`;
      a.click();
      // 匯出成功：收合手風琴 + 平滑捲回表單頂部
      setIsPreviewOpen(false);
      setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('圖片生成失敗', err);
    } finally {
      setExporting(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      let image_data = null;
      if (imageUrl && fileInputRef.current?.files?.[0]) {
        image_data = await toBase64(fileInputRef.current.files[0]);
      }
      await createAchievement({ title, my_standard: standard || undefined, image_data });
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  // ── 完成畫面 ──
  if (done) return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IllustrationDone width={140} />
      </div>
      <h2 style={{ ...styles.heading, textAlign: 'center', color: c.text }}>{t.wellDone}</h2>
      <p style={{ ...styles.sub, color: c.sub }}>{t.wellDoneDesc}</p>
      <button style={styles.btn} onClick={() => navigate('/achievements')}>{t.viewMyAchievements}</button>
      <button style={{ ...styles.ghost, color: c.sub }} onClick={() => navigate('/')}>{t.backHome}</button>
    </div>
  );

  // ── 表單畫面 ──
  return (
    <div ref={formTopRef} style={styles.page}>
      {/* 桌機 Modal（手機時 isModalOpen 永遠不會被設為 true） */}
      {isModalOpen && (
        <PolaroidModal
          achievementText={title}
          standard={standard}
          imageUrl={imageUrl}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
      <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
      <h2 style={{ ...styles.heading, color: c.text }}>{t.logSmallWinTitle}</h2>

      <div style={styles.form}>
        {/* 成就標題 */}
        <label style={{ ...styles.label, color: c.text }}>{t.whatAccomplished}</label>
        <input
          style={{ ...styles.input, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.text }}
          placeholder={t.achievementPlaceholder}
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
        />
        {error && <p style={styles.error}>{error}</p>}

        {/* 我的標準 */}
        <label style={{ ...styles.label, color: c.text }}>{t.whyAchievement}</label>
        <textarea
          style={{ ...styles.textarea, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.text }}
          placeholder={t.whyAchievementPlaceholder}
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
          rows={3}
        />

        {/* 圖片上傳 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: c.uploadBtn, border: `1.5px solid ${c.uploadBdr}`,
              color: c.uploadC, borderRadius: 10,
              padding: '9px 16px', fontSize: 13, cursor: 'pointer',
            }}
          >
            <CameraIcon /> 新增照片
          </button>
          {imageUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={imageUrl}
                alt="預覽"
                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: `1.5px solid ${c.previewBdr}` }}
              />
              <span style={{ fontSize: 12, color: '#7fb5a0', fontWeight: 500 }}>已選取圖片</span>
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(imageUrl); setImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 16, cursor: 'pointer', padding: 0 }}
              >×</button>
            </div>
          )}
        </div>

        {/* 預覽卡片按鈕 */}
        <button type="button" onClick={handleOpenPreview} style={styles.btn}>
          預覽卡片 📸
        </button>
      </div>

      {/* ── 手風琴展開區塊 ── */}
      <div
        ref={previewContainerRef}
        style={{
          overflow: 'hidden',
          maxHeight: isPreviewOpen ? '820px' : '0',
          transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 內容包裝 — padding 讓卡片有呼吸空間 */}
        <div style={{ paddingTop: 20, paddingBottom: 8 }}>

          {/* 截圖目標的置中外框
              overflow: visible → 卡片超出螢幕寬度也不裁切，html-to-image 才能完整截到 300px */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '24px 0',
            overflow: 'visible',
          }}>
            {/* ── 截圖目標：純視覺區塊，ref 只綁這裡，絕對不含按鈕 ── */}
            <div
              ref={polaroidRef}
              style={{
                width: 300, height: 533,
                minWidth: 300, minHeight: 533,   // 雙重鎖死，防任何父層壓縮
                flexShrink: 0,
                borderRadius: 16,
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

              {/* 拍立得卡片本體 */}
              <div style={{
                background: '#fff', borderRadius: 3,
                padding: '14px 14px 36px', width: 222,
                boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                transform: 'rotate(-2deg)',
                position: 'relative', zIndex: 1,
                flexShrink: 0,
              }}>
                {/* 1:1 照片區 */}
                <div style={{
                  width: '100%', aspectRatio: '1 / 1',
                  borderRadius: 2, overflow: 'hidden', marginBottom: 14,
                  background: 'linear-gradient(135deg, #c8e6dc 0%, #f0e6d3 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="成就圖片" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <span style={{ fontSize: 52, userSelect: 'none' }}>✨</span>
                  )}
                </div>

                {/* 文字區 */}
                <div style={{ padding: '0 2px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#2d3748', lineHeight: 1.6, margin: '0 0 6px', wordBreak: 'break-all' }}>
                    {title || '你的成就文字'}
                  </p>
                  {standard && (
                    <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.45, margin: '0 0 8px' }}>
                      「{standard}」
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: '#b5b0a8', margin: 0, letterSpacing: 1.2 }}>{dateStr}</p>
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
            {/* ── ref 在這裡關閉，以下絕對不在截圖範圍內 ── */}
          </div>

          {/* 操作按鈕 — 完全在 ref div 之外 */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12,
            padding: '4px 16px 16px',
          }}>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                flex: 1, maxWidth: 180,
                background: exporting ? '#5a9a87' : '#7fb5a0',
                color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 8px',
                fontSize: 14, fontWeight: 600,
                cursor: exporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 18px rgba(127,181,160,0.35)',
                transition: 'background 0.2s',
              }}
            >
              {exporting ? '生成中…' : '匯出圖片 📥'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, maxWidth: 180,
                background: 'transparent',
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db'}`,
                color: isDark ? 'rgba(255,255,255,0.65)' : '#6b7280',
                borderRadius: 12, padding: '11px 8px',
                fontSize: 14, fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '儲存中…' : '儲存成就 ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 成就列表
// ─────────────────────────────────────────────
export function AchievementList() {
  const [achievements, setAchievements] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { lang, isDark } = useApp();
  const t = getT(lang);
  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const navigate = useNavigate();

  useEffect(() => {
    getAchievements().then((r) => setAchievements(r.data)).catch(() => setAchievements([]));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t.deleteAchievementConfirm)) return;
    setDeletingId(id);
    try {
      await deleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const c = isDark
    ? { text: '#f5f5f4', sub: '#a8a29e' }
    : { text: '#2d3748', sub: '#6b7280' };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <button style={styles.back} onClick={() => navigate(-1)}>{t.back}</button>
        <h2 style={{ ...styles.heading, color: c.text }}>{t.myAchievements}</h2>
        <button style={styles.addBtn} onClick={() => navigate('/achievements/new')}>{t.add}</button>
      </div>

      {achievements === null && <p style={{ color: c.sub }}>{t.loading}</p>}
      {achievements?.length === 0 && (
        <div style={styles.empty}>
          <IllustrationAchievement width={150} />
          <p style={{ ...styles.emptyTitle, color: c.text }}>{t.noAchievements}</p>
          <p style={{ ...styles.emptyDesc, color: c.sub }}>{t.achievementsEmptyDesc}</p>
          <button style={styles.btn} onClick={() => navigate('/achievements/new')}>{t.firstAchievement}</button>
        </div>
      )}

      <div style={styles.cardGrid}>
        {achievements?.map((a, idx) => (
          <PolaroidCard
            key={a.id}
            achievement={a}
            idx={idx}
            isDark={isDark}
            locale={locale}
            t={t}
            onDelete={() => handleDelete(a.id)}
            deleting={deletingId === a.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 成就卡片（列表用）
// ─────────────────────────────────────────────
function PolaroidCard({ achievement: a, idx, isDark, locale, t, onDelete, deleting }) {
  const [showModal, setShowModal] = useState(false);
  const encourage = t.achievementEncourage[a.id % t.achievementEncourage.length];
  const tilt = idx % 2 === 0 ? '-1.2deg' : '1.4deg';

  const cardBg     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(255,255,255,0.9)';
  const textColor  = isDark ? '#f5f5f4' : '#2d3748';
  const subColor   = isDark ? '#a8a29e' : '#9ca3af';

  return (
    <div
      style={{
        ...styles.polaroid,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        transform: `rotate(${tilt})`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {showModal && (
        <PolaroidModal
          achievementText={a.title}
          standard={a.my_standard}
          imageUrl={a.image_data || null}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* 相片區 */}
      <div style={{ ...styles.polaroidPhoto, background: isDark ? 'rgba(255,255,255,0.04)' : '#faf7f4', overflow: 'hidden', padding: 0 }}>
        {a.image_data ? (
          <img src={a.image_data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <>
            <span style={styles.polaroidEmoji}>✨</span>
            <p style={{ ...styles.polaroidDate, color: subColor }}>
              {new Date(a.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
            </p>
          </>
        )}
      </div>

      {/* 文字區 */}
      <div style={styles.polaroidCaption}>
        <p style={{ ...styles.polaroidTitle, color: textColor }}>{a.title}</p>
        {a.my_standard && (
          <p style={{ ...styles.polaroidStandard, color: subColor }}>「{a.my_standard}」</p>
        )}
        <p style={{ ...styles.polaroidEncourage, color: '#7fb5a0' }}>{encourage}</p>
        <button
          data-small
          onClick={() => setShowModal(true)}
          style={{
            marginTop: 8, width: '100%',
            background: 'transparent',
            border: `1px solid ${isDark ? 'rgba(127,181,160,0.3)' : '#b8d9cf'}`,
            color: '#7fb5a0', borderRadius: 6,
            padding: '4px 0', fontSize: 11,
            cursor: 'pointer',
          }}
        >
          📸 儲存圖片
        </button>
      </div>

      {/* 刪除 */}
      <button
        data-small
        style={{ ...styles.polaroidDelete, color: isDark ? '#78716c' : '#d1d5db' }}
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? '...' : '×'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 工具函式
// ─────────────────────────────────────────────
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);   // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// 相機 Icon
// ─────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  page:        { maxWidth: 600, margin: '0 auto', padding: 24 },
  heading:     { fontSize: 22, marginBottom: 8, margin: 0 },
  sub:         { marginBottom: 24 },
  form:        { display: 'flex', flexDirection: 'column', gap: 10 },
  label:       { fontWeight: 500, fontSize: 15 },
  input:       { padding: '10px 14px', borderRadius: 10, fontSize: 15, outline: 'none' },
  textarea:    { padding: '10px 14px', borderRadius: 10, fontSize: 15, resize: 'vertical', outline: 'none' },
  error:       { color: '#ef4444', fontSize: 14, margin: 0 },
  btn:         { display: 'block', width: '100%', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', cursor: 'pointer', fontSize: 15, fontWeight: 600, marginBottom: 10 },
  ghost:       { display: 'block', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, padding: '10px' },
  back:        { background: 'none', border: 'none', color: '#7fb5a0', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 0 16px', display: 'block' },
  pageHeader:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  addBtn:      { marginLeft: 'auto', background: '#7fb5a0', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  empty:       { textAlign: 'center', paddingTop: 40 },
  emptyTitle:  { fontWeight: 600, fontSize: 16, marginBottom: 6 },
  emptyDesc:   { fontSize: 14, marginBottom: 20, whiteSpace: 'pre-line', lineHeight: 1.7 },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 24, padding: '8px 4px 40px',
  },
  polaroid: {
    position: 'relative', borderRadius: 4,
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    padding: '10px 10px 14px', cursor: 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  polaroidPhoto: {
    borderRadius: 2, height: 100,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 10,
  },
  polaroidEmoji:    { fontSize: 32 },
  polaroidDate:     { fontSize: 11, fontWeight: 500, letterSpacing: 0.3, margin: 0 },
  polaroidCaption:  { padding: '0 2px' },
  polaroidTitle:    { fontSize: 13, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.4 },
  polaroidStandard: { fontSize: 11, fontStyle: 'italic', margin: '0 0 6px', lineHeight: 1.4 },
  polaroidEncourage:{ fontSize: 11, fontWeight: 500, margin: 0 },
  polaroidDelete: {
    position: 'absolute', top: 6, right: 8,
    background: 'none', border: 'none',
    fontSize: 16, cursor: 'pointer',
    padding: 0, lineHeight: 1, opacity: 0.5,
  },
};

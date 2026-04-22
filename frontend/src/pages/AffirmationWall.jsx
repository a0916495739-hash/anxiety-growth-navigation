import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'affirmation_recordings';

function loadRecordings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecordings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function AffirmationWall() {
  const { isDark, lang } = useApp();
  const navigate = useNavigate();

  const [recordings, setRecordings] = useState(loadRecordings);
  const [recording, setRecording]   = useState(false);
  const [playing, setPlaying]       = useState(null); // id of currently playing
  const [seconds, setSeconds]       = useState(0);
  const [error, setError]           = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [editName, setEditName]     = useState('');

  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const audioRef    = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    audioRef.current?.pause();
  }, []);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const next = [
            {
              id: Date.now(),
              name: lang === 'zh' ? `宣誓 ${new Date().toLocaleDateString('zh-TW')}` : `Affirmation ${new Date().toLocaleDateString()}`,
              date: new Date().toISOString(),
              url: reader.result,
            },
            ...recordings,
          ];
          setRecordings(next);
          saveRecordings(next);
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError(lang === 'zh' ? '無法存取麥克風，請確認瀏覽器權限。' : 'Cannot access microphone. Check browser permissions.');
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  }

  function playRecording(rec) {
    if (playing === rec.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(rec.url);
    audio.onended = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(rec.id);
  }

  function deleteRecording(id) {
    const next = recordings.filter((r) => r.id !== id);
    setRecordings(next);
    saveRecordings(next);
    if (playing === id) { audioRef.current?.pause(); setPlaying(null); }
  }

  function saveEditName(id) {
    if (!editName.trim()) { setEditingId(null); return; }
    const next = recordings.map((r) => r.id === id ? { ...r, name: editName.trim() } : r);
    setRecordings(next);
    saveRecordings(next);
    setEditingId(null);
  }

  function fmt(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ── Colours ─────────────────────────────────────────────────────────────────
  const bg     = isDark ? 'linear-gradient(160deg,#1c1917,#231f1d)' : 'linear-gradient(160deg,#faf5f0,#f0ebe4)';
  const text   = isDark ? '#e7e5e4' : '#2d3748';
  const muted  = isDark ? '#78716c' : '#9ca3af';
  const accent = '#7fb5a0';
  const btnBg  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)';
  const btnBdr = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.07)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';

  return (
    <div style={{ minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 60px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 0' }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: muted, letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {lang === 'zh' ? '語音激勵牆' : 'Voice Wall'}
          </p>
          <h1 style={{ margin: '3px 0 0', fontSize: 20, fontWeight: 600, color: text }}>
            {lang === 'zh' ? '對自己說句話' : 'Speak to Yourself'}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          style={{ width: 36, height: 36, borderRadius: '50%', background: btnBg, border: `1px solid ${btnBdr}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: muted, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >×</button>
      </div>

      {/* Hint */}
      <p style={{ width: '100%', maxWidth: 420, margin: '12px 0 0', fontSize: 13, color: muted, lineHeight: 1.7 }}>
        {lang === 'zh'
          ? '錄下你最有力量的話。心情低落時，聽聽那個更強大的自己。'
          : "Record your most empowering words. When you're struggling, hear the stronger version of you."}
      </p>

      {/* Record button */}
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={recording ? stopRecording : startRecording}
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: recording ? '#ef4444' : accent,
            border: 'none',
            boxShadow: recording
              ? '0 0 0 12px rgba(239,68,68,0.15), 0 8px 28px rgba(239,68,68,0.4)'
              : `0 8px 28px ${accent}66`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
          aria-label={recording ? 'Stop' : 'Record'}
        >
          {recording ? '⏹' : '🎙️'}
        </motion.button>

        <p style={{ margin: 0, fontSize: 13, color: recording ? '#ef4444' : muted, fontVariantNumeric: 'tabular-nums', minHeight: 20 }}>
          {recording
            ? (lang === 'zh' ? `錄音中 ${fmt(seconds)}` : `Recording ${fmt(seconds)}`)
            : (lang === 'zh' ? '點擊開始錄音' : 'Tap to record')}
        </p>

        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#ef4444', textAlign: 'center', maxWidth: 300 }}>{error}</p>
        )}
      </div>

      {/* Recordings list */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 40 }}>
        {recordings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: muted, fontSize: 13 }}>
            <p style={{ margin: 0, fontSize: 36 }}>🎧</p>
            <p style={{ margin: '12px 0 0' }}>
              {lang === 'zh' ? '還沒有任何錄音' : 'No recordings yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {recordings.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.22 }}
                style={{
                  marginBottom: 10, padding: '12px 14px',
                  background: cardBg, borderRadius: 16,
                  border: `1px solid ${playing === rec.id ? accent + '66' : btnBdr}`,
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'border-color 0.25s',
                }}
              >
                {/* Play button */}
                <button
                  onClick={() => playRecording(rec)}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: playing === rec.id ? accent : `${accent}22`,
                    border: `1.5px solid ${accent}44`,
                    color: playing === rec.id ? '#fff' : accent,
                    fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  aria-label={playing === rec.id ? 'Pause' : 'Play'}
                >
                  {playing === rec.id ? '⏸' : '▶'}
                </button>

                {/* Name + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === rec.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEditName(rec.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditName(rec.id); if (e.key === 'Escape') setEditingId(null); }}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: `1px solid ${accent}`, outline: 'none',
                        color: text, fontSize: 14, fontWeight: 600, padding: '2px 0',
                      }}
                    />
                  ) : (
                    <p
                      onClick={() => { setEditingId(rec.id); setEditName(rec.name); }}
                      style={{ margin: 0, fontSize: 14, fontWeight: 600, color: text, cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={lang === 'zh' ? '點擊重新命名' : 'Click to rename'}
                    >
                      {rec.name}
                    </p>
                  )}
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: muted }}>
                    {new Date(rec.date).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteRecording(rec.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 18, padding: '4px', flexShrink: 0, lineHeight: 1 }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Privacy note */}
      {recordings.length > 0 && (
        <p style={{ marginTop: 16, fontSize: 11, color: muted, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
          {lang === 'zh'
            ? '🔒 錄音只儲存在你的裝置上，不會上傳至伺服器。'
            : '🔒 Recordings are stored only on your device and never uploaded.'}
        </p>
      )}
    </div>
  );
}

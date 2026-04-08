import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { useApp } from '../context/AppContext';

const DURATIONS = [
  { label: '1 分', labelEn: '1 min', seconds: 60 },
  { label: '3 分', labelEn: '3 min', seconds: 180 },
  { label: '5 分', labelEn: '5 min', seconds: 300 },
];

const INHALE = 4; // seconds
const EXHALE = 4; // seconds

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function BreathingTool() {
  const { isDark, lang } = useApp();
  const navigate = useNavigate();
  const controls = useAnimationControls();

  const [selected, setSelected] = useState(DURATIONS[1]); // default 3 min
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[1].seconds);
  const [phase, setPhase] = useState('in');
  const [done, setDone] = useState(false);

  const playingRef = useRef(false);

  // keep ref in sync for use inside closures
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // --- breathing circle animation ---
  useEffect(() => {
    if (!playing) {
      controls.stop();
      return;
    }
    setPhase('in');
    let active = true;

    async function cycle() {
      while (active && playingRef.current) {
        setPhase('in');
        await controls.start({
          scale: 1.55,
          transition: { duration: INHALE, ease: 'easeInOut' },
        });
        if (!active || !playingRef.current) break;
        setPhase('out');
        await controls.start({
          scale: 1,
          transition: { duration: EXHALE, ease: 'easeInOut' },
        });
      }
    }
    cycle();
    return () => { active = false; };
  }, [playing, controls]);

  // --- countdown ---
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setPlaying(false);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  function selectDuration(d) {
    if (playing) return;
    setSelected(d);
    setTimeLeft(d.seconds);
    setDone(false);
  }

  function togglePlay() {
    if (done) return;
    setPlaying((p) => !p);
  }

  function restart() {
    setPlaying(false);
    setTimeLeft(selected.seconds);
    setDone(false);
    controls.set({ scale: 1 });
  }

  const bg        = isDark ? 'linear-gradient(160deg,#1c1917,#231f1d)' : 'linear-gradient(160deg,#faf5f0,#f0ebe4)';
  const text      = isDark ? '#e7e5e4' : '#2d3748';
  const muted     = isDark ? '#78716c' : '#9ca3af';
  const accent    = '#7fb5a0';
  const btnBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)';
  const btnBdr    = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  const phaseText = phase === 'in'
    ? (lang === 'zh' ? '吸氣' : 'Inhale')
    : (lang === 'zh' ? '呼氣' : 'Exhale');

  return (
    <div style={{
      minHeight: '100dvh',
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px 40px',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 0' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {lang === 'zh' ? '深呼吸' : 'Deep Breathing'}
          </p>
          <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 600, color: text }}>
            {lang === 'zh' ? '放鬆練習' : 'Relax & Breathe'}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: btnBg,
            border: `1px solid ${btnBdr}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: muted,
            fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Duration selector */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {DURATIONS.map((d) => {
          const active = selected.seconds === d.seconds && !done;
          return (
            <button
              key={d.seconds}
              onClick={() => selectDuration(d)}
              disabled={playing}
              style={{
                padding: '7px 20px',
                borderRadius: 99,
                border: `1.5px solid ${active ? accent : btnBdr}`,
                background: active ? `${accent}22` : btnBg,
                color: active ? accent : muted,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: playing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                opacity: playing && !active ? 0.5 : 1,
              }}
            >
              {lang === 'zh' ? d.label : d.labelEn}
            </button>
          );
        })}
      </div>

      {/* Breathing circle */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌿</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: text, margin: '0 0 8px' }}>
              {lang === 'zh' ? '練習完成' : 'Session complete'}
            </h2>
            <p style={{ fontSize: 14, color: muted, margin: 0, lineHeight: 1.7 }}>
              {lang === 'zh' ? '你給自己留了一段呼吸的空間。\n好好感受當下。' : 'You gave yourself a moment to breathe.\nStay with this feeling.'}
            </p>
            <button
              onClick={restart}
              style={{
                marginTop: 28,
                padding: '10px 28px',
                borderRadius: 99,
                background: accent,
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '再來一次' : 'Try again'}
            </button>
          </motion.div>
        ) : (
          <>
            {/* Circle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Glow ring */}
              <motion.div
                animate={controls}
                initial={{ scale: 1 }}
                style={{
                  width: 200, height: 200,
                  borderRadius: '50%',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(127,181,160,0.25) 0%, rgba(127,181,160,0.08) 60%, transparent 100%)'
                    : 'radial-gradient(circle, rgba(127,181,160,0.35) 0%, rgba(127,181,160,0.12) 60%, transparent 100%)',
                  position: 'absolute',
                  inset: -30,
                  width: 'calc(100% + 60px)',
                  height: 'calc(100% + 60px)',
                  borderRadius: '50%',
                }}
              />
              {/* Main circle */}
              <motion.div
                animate={controls}
                initial={{ scale: 1 }}
                style={{
                  width: 180, height: 180,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 38% 38%, rgba(168,208,196,0.9), ${accent})`,
                  boxShadow: isDark
                    ? `0 0 40px rgba(127,181,160,0.3), 0 0 0 1px rgba(127,181,160,0.15)`
                    : `0 8px 32px rgba(127,181,160,0.35), 0 0 0 1px rgba(127,181,160,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 28, userSelect: 'none' }}>🌊</span>
              </motion.div>
            </div>

            {/* Phase label + timer */}
            <div style={{ textAlign: 'center' }}>
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: playing ? 1 : 0, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 300, letterSpacing: 3, color: accent }}
              >
                {phaseText}
              </motion.p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 200, color: text, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(timeLeft)}
              </p>
              {!playing && !done && timeLeft < selected.seconds && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: muted }}>
                  {lang === 'zh' ? '已暫停' : 'Paused'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Play / Pause button */}
      {!done && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: playing
              ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
              : accent,
            border: `2px solid ${playing ? btnBdr : 'transparent'}`,
            color: playing ? muted : '#fff',
            fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: playing ? 'none' : '0 8px 24px rgba(127,181,160,0.4)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </motion.button>
      )}
    </div>
  );
}

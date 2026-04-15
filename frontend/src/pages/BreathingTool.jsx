import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { logBreathingSession, getBreathingSessions } from '../api/breathing';
import { getT } from '../i18n';

// ── Breathing patterns ──────────────────────────────────────────────────────
const PATTERNS = [
  {
    id: '424',
    label: '4-2-4',
    descZh: '吸氣 4s · 憋氣 2s · 呼氣 4s',
    descEn: 'Inhale 4s · Hold 2s · Exhale 4s',
    nameZh: '舒緩呼吸',
    nameEn: 'Calm',
    inhale: 4, hold: 2, exhale: 4,
  },
  {
    id: '478',
    label: '4-7-8',
    descZh: '吸氣 4s · 憋氣 7s · 呼氣 8s',
    descEn: 'Inhale 4s · Hold 7s · Exhale 8s',
    nameZh: '深度放鬆',
    nameEn: 'Deep Rest',
    inhale: 4, hold: 7, exhale: 8,
  },
  {
    id: 'box',
    label: '4-4-4',
    descZh: '吸氣 4s · 憋氣 4s · 呼氣 4s',
    descEn: 'Inhale 4s · Hold 4s · Exhale 4s',
    nameZh: '箱式呼吸',
    nameEn: 'Box',
    inhale: 4, hold: 4, exhale: 4,
  },
];

// ── Session durations ────────────────────────────────────────────────────────
const DURATIONS = [
  { label: '1 分', labelEn: '1 min', seconds: 60 },
  { label: '3 分', labelEn: '3 min', seconds: 180 },
  { label: '5 分', labelEn: '5 min', seconds: 300 },
];

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ── Phase labels ─────────────────────────────────────────────────────────────
const PHASE_LABEL = {
  idle:   { zh: '準備好了嗎', en: 'Ready?' },
  inhale: { zh: '吸　氣', en: 'Inhale' },
  hold:   { zh: '憋　氣', en: 'Hold' },
  exhale: { zh: '呼　氣', en: 'Exhale' },
};

export default function BreathingTool() {
  const { isDark, lang } = useApp();
  const navigate = useNavigate();
  const controls = useAnimationControls();

  const [pattern, setPattern]   = useState(PATTERNS[0]);
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [playing, setPlaying]   = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[1].seconds);
  const [phase, setPhase]       = useState('idle');
  const [done, setDone]         = useState(false);
  const [sessions, setSessions] = useState([]);
  const t = getT(lang);

  const playingRef = useRef(false);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Log session when done, fetch history
  useEffect(() => {
    getBreathingSessions().then((r) => setSessions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!done) return;
    logBreathingSession(pattern.id, duration.seconds)
      .then(() => getBreathingSessions().then((r) => setSessions(r.data)).catch(() => {}))
      .catch(() => {});
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Breathing cycle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      controls.stop();
      return;
    }

    let active = true;

    async function cycle() {
      while (active && playingRef.current) {
        // Inhale: scale up
        setPhase('inhale');
        await controls.start({
          scale: 1.55,
          transition: { duration: pattern.inhale, ease: 'easeInOut' },
        });
        if (!active || !playingRef.current) break;

        // Hold: pause at peak
        if (pattern.hold > 0) {
          setPhase('hold');
          await new Promise((res) => {
            const t = setTimeout(res, pattern.hold * 1000);
            // allow early break by checking ref each tick
            const check = setInterval(() => {
              if (!active || !playingRef.current) { clearTimeout(t); clearInterval(check); res(); }
            }, 100);
          });
          if (!active || !playingRef.current) break;
        }

        // Exhale: scale down
        setPhase('exhale');
        await controls.start({
          scale: 1,
          transition: { duration: pattern.exhale, ease: 'easeInOut' },
        });
        if (!active || !playingRef.current) break;
      }
    }

    controls.set({ scale: 1 });
    cycle();
    return () => { active = false; };
  }, [playing, pattern, controls]);

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setPlaying(false);
          setPhase('idle');
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  // ── Actions ────────────────────────────────────────────────────────────────
  function selectPattern(p) {
    if (playing) return;
    setPattern(p);
  }

  function selectDuration(d) {
    if (playing) return;
    setDuration(d);
    setTimeLeft(d.seconds);
    setDone(false);
  }

  function togglePlay() {
    if (done) return;
    if (!playing) setPhase('inhale');
    else setPhase('idle');
    setPlaying((p) => !p);
  }

  function restart() {
    controls.set({ scale: 1 });
    setPlaying(false);
    setPhase('idle');
    setTimeLeft(duration.seconds);
    setDone(false);
  }

  // ── Colours ────────────────────────────────────────────────────────────────
  const bg       = isDark ? 'linear-gradient(160deg,#1c1917,#231f1d)' : 'linear-gradient(160deg,#faf5f0,#f0ebe4)';
  const text     = isDark ? '#e7e5e4' : '#2d3748';
  const muted    = isDark ? '#78716c' : '#9ca3af';
  const accent   = '#7fb5a0';
  const btnBg    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)';
  const btnBdr   = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.07)';

  const phaseLabel = PHASE_LABEL[phase] ?? PHASE_LABEL.idle;
  const phaseColor = phase === 'hold' ? '#f59e0b' : accent;

  return (
    <div style={{ minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 40px' }}>

      {/* ── Header ── */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 0' }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: muted, letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {lang === 'zh' ? '深呼吸練習' : 'Breathing'}
          </p>
          <h1 style={{ margin: '3px 0 0', fontSize: 20, fontWeight: 600, color: text }}>
            {lang === 'zh' ? pattern.nameZh : pattern.nameEn}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          style={{ width: 36, height: 36, borderRadius: '50%', background: btnBg, border: `1px solid ${btnBdr}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: muted, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >×</button>
      </div>

      {/* ── Pattern selector ── */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 24 }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: muted, letterSpacing: 1 }}>
          {lang === 'zh' ? '呼吸節奏' : 'PATTERN'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {PATTERNS.map((p) => {
            const active = pattern.id === p.id && !playing;
            const activeOrPlaying = pattern.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectPattern(p)}
                disabled={playing}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 14,
                  border: `1.5px solid ${activeOrPlaying ? accent : btnBdr}`,
                  background: activeOrPlaying ? `${accent}18` : btnBg,
                  color: activeOrPlaying ? accent : muted,
                  cursor: playing ? 'default' : 'pointer',
                  opacity: playing && !activeOrPlaying ? 0.4 : 1,
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{p.label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, opacity: 0.75 }}>
                  {lang === 'zh' ? p.nameZh : p.nameEn}
                </p>
              </button>
            );
          })}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: muted }}>
          {lang === 'zh' ? pattern.descZh : pattern.descEn}
        </p>
      </div>

      {/* ── Duration selector ── */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 16 }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: muted, letterSpacing: 1 }}>
          {lang === 'zh' ? '練習時長' : 'DURATION'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {DURATIONS.map((d) => {
            const active = duration.seconds === d.seconds;
            return (
              <button
                key={d.seconds}
                onClick={() => selectDuration(d)}
                disabled={playing}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 99,
                  border: `1.5px solid ${active ? accent : btnBdr}`,
                  background: active ? `${accent}18` : btnBg,
                  color: active ? accent : muted,
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  cursor: playing ? 'default' : 'pointer',
                  opacity: playing && !active ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {lang === 'zh' ? d.label : d.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 16 }}>
        {done ? (
          // Done screen
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ textAlign: 'center', maxWidth: 320 }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌿</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: text, margin: '0 0 8px' }}>
              {lang === 'zh' ? '練習完成' : 'Session complete'}
            </h2>
            <p style={{ fontSize: 14, color: muted, margin: 0, lineHeight: 1.8 }}>
              {lang === 'zh'
                ? '你給自己留了一段呼吸的空間。\n好好感受當下這份平靜。'
                : 'You gave yourself a moment to breathe.\nStay with this stillness.'}
            </p>
            <button
              onClick={restart}
              style={{ marginTop: 28, padding: '10px 32px', borderRadius: 99, background: accent, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {lang === 'zh' ? '再練一次' : 'Try again'}
            </button>

            {/* Session history */}
            {sessions.length > 0 && (
              <div style={{ marginTop: 32, textAlign: 'left', width: '100%', maxWidth: 300 }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: muted, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {t.breathingHistory}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sessions.slice(0, 5).map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: 13, color: text }}>{s.pattern_id.toUpperCase()}</span>
                      <span style={{ fontSize: 12, color: muted }}>{Math.round(s.duration_seconds / 60)} min · {new Date(s.completed_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Circle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 220 }}>
              {/* Outer glow */}
              <motion.div
                animate={controls}
                initial={{ scale: 1 }}
                style={{
                  position: 'absolute', inset: -24, borderRadius: '50%',
                  background: isDark
                    ? `radial-gradient(circle, ${phaseColor}28 0%, transparent 70%)`
                    : `radial-gradient(circle, ${phaseColor}38 0%, transparent 70%)`,
                  transition: 'background 1s ease',
                }}
              />
              {/* Main circle */}
              <motion.div
                animate={controls}
                initial={{ scale: 1 }}
                style={{
                  width: 180, height: 180, borderRadius: '50%',
                  background: `radial-gradient(circle at 38% 35%, rgba(168,208,196,0.9), ${accent})`,
                  boxShadow: isDark
                    ? `0 0 40px ${phaseColor}44, 0 0 0 1px ${phaseColor}22`
                    : `0 8px 36px ${phaseColor}55, 0 0 0 1px ${phaseColor}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'box-shadow 1s ease',
                }}
              >
                <span style={{ fontSize: 30, userSelect: 'none' }}>
                  {phase === 'inhale' ? '🌊' : phase === 'hold' ? '🌿' : phase === 'exhale' ? '☁️' : '✨'}
                </span>
              </motion.div>
            </div>

            {/* Phase label */}
            <div style={{ textAlign: 'center', minHeight: 60 }}>
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 300, letterSpacing: 4, color: phaseColor }}
              >
                {lang === 'zh' ? phaseLabel.zh : phaseLabel.en}
              </motion.p>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 200, color: text, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(timeLeft)}
              </p>
              {!playing && !done && timeLeft < duration.seconds && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: muted }}>
                  {lang === 'zh' ? '已暫停' : 'Paused'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Play / Pause / Done ── */}
      <motion.button
        whileTap={done ? {} : { scale: 0.94 }}
        onClick={done ? undefined : togglePlay}
        style={{
          width: 76, height: 76, borderRadius: '50%',
          background: done ? '#7fb5a0' : playing ? btnBg : accent,
          border: `2px solid ${playing && !done ? btnBdr : 'transparent'}`,
          color: playing && !done ? muted : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: done ? 'default' : 'pointer',
          boxShadow: (playing || done) ? 'none' : `0 8px 28px ${accent}66`,
          transition: 'background 0.4s ease, box-shadow 0.3s',
          fontSize: 24,
        }}
        aria-label={done ? 'Done' : playing ? 'Pause' : 'Play'}
      >
        {done ? (
          <svg
            width="28" height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : playing ? '⏸' : '▶'}
      </motion.button>
    </div>
  );
}

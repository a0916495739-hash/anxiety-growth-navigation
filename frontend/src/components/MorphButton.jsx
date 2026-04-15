import { useEffect, useState } from 'react';

/**
 * MorphButton
 * idle  → full-width button with label
 * loading → shrinks to circle with spinner
 * done  → circle with checkmark (green)
 *
 * Props:
 *   label       string   — button text in idle state
 *   loading     bool     — triggers loading phase
 *   done        bool     — triggers done (checkmark) phase
 *   onClick     fn
 *   color       string   — idle background color (default amber)
 *   doneColor   string   — done background color (default sage)
 *   style       object   — extra styles on wrapper div
 */
export default function MorphButton({
  label,
  loading = false,
  done = false,
  onClick,
  color = '#fbbf24',
  doneColor = '#7fb5a0',
  style = {},
}) {
  // phase: 'idle' | 'shrink' | 'loading' | 'check'
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (done) {
      setPhase('check');
    } else if (loading) {
      setPhase('shrink');
      const t = setTimeout(() => setPhase('loading'), 20); // let shrink animate first
      return () => clearTimeout(t);
    } else {
      setPhase('idle');
    }
  }, [loading, done]);

  const isCircle = phase === 'shrink' || phase === 'loading' || phase === 'check';
  const bg = phase === 'check' ? doneColor : color;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', ...style }}>
      <button
        onClick={onClick}
        disabled={loading || done}
        style={{
          height: 50,
          width: isCircle ? 50 : '100%',
          maxWidth: isCircle ? 50 : 480,
          borderRadius: isCircle ? '50%' : 12,
          background: bg,
          border: 'none',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          cursor: loading || done ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: phase === 'idle' ? `0 2px 10px ${color}66` : 'none',
          transition: [
            'width 0.38s cubic-bezier(0.4,0,0.2,1)',
            'max-width 0.38s cubic-bezier(0.4,0,0.2,1)',
            'border-radius 0.38s cubic-bezier(0.4,0,0.2,1)',
            'background 0.25s ease',
            'box-shadow 0.25s ease',
          ].join(', '),
        }}
      >
        {/* Idle label */}
        <span style={{
          position: 'absolute',
          opacity: phase === 'idle' ? 1 : 0,
          transform: phase === 'idle' ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>

        {/* Spinner */}
        <div style={{
          position: 'absolute',
          opacity: phase === 'loading' ? 1 : 0,
          transition: 'opacity 0.15s ease 0.15s',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 20, height: 20,
            border: '2.5px solid rgba(255,255,255,0.3)',
            borderTop: '2.5px solid #fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>

        {/* Checkmark */}
        <svg
          width="22" height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            opacity: phase === 'check' ? 1 : 0,
            transform: phase === 'check' ? 'scale(1)' : 'scale(0.4)',
            transition: 'opacity 0.2s ease 0.1s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
            pointerEvents: 'none',
          }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  );
}

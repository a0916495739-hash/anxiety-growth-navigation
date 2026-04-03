import { useState } from 'react';

const STEPS = [
  {
    emoji: '🌊',
    title: '情緒除噪器',
    desc: '當你感到煩躁或焦慮，用引導式或自由書寫記錄下來，讓情緒被看見，而不是被壓下去。',
  },
  {
    emoji: '✨',
    title: '微小成就系統',
    desc: '不需要做大事才算成就。今天喝夠水、早起、說了一句貼心的話，都算。用你自己的標準定義。',
  },
  {
    emoji: '⚖️',
    title: '應該 vs 想要',
    desc: '被外在期望拉扯時，記錄下「我應該」與「我想要」的差距，慢慢看清哪些是真正屬於你的選擇。',
  },
  {
    emoji: '🌿',
    title: '準備好了',
    desc: '這裡沒有比較，沒有評分。只有你和自己的對話。\n慢慢來，一步一步理解自己。',
  },
];

const STORAGE_KEY = 'onboarding_done';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1');
    onDone();
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Progress dots */}
        <div style={s.dots}>
          {STEPS.map((_, i) => (
            <div key={i} style={i === step ? s.dotActive : s.dot} />
          ))}
        </div>

        <div style={s.emoji}>{current.emoji}</div>
        <h2 style={s.title}>{current.title}</h2>
        <p style={s.desc}>{current.desc}</p>

        <div style={s.actions}>
          {!isLast && (
            <button style={s.skipBtn} onClick={finish}>略過</button>
          )}
          <button style={s.nextBtn} onClick={isLast ? finish : () => setStep(step + 1)}>
            {isLast ? '開始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  return !localStorage.getItem(STORAGE_KEY);
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 24,
    padding: '36px 28px 28px',
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
    animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
  },
  dots: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#e5e7eb' },
  dotActive: { width: 20, height: 6, borderRadius: 99, background: '#7fb5a0', transition: 'width 0.2s' },
  emoji: { fontSize: 48, marginBottom: 16, display: 'block' },
  title: { fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 12 },
  desc: { fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 28, whiteSpace: 'pre-line' },
  actions: { display: 'flex', gap: 10, justifyContent: 'center' },
  skipBtn: { background: 'transparent', border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer', padding: '10px 16px' },
  nextBtn: { background: '#7fb5a0', border: 'none', color: '#fff', borderRadius: 10, padding: '11px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', flex: 1 },
};

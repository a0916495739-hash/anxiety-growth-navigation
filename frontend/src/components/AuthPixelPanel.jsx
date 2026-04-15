// 共用：登入 / 建立帳號 左側像素插圖面板

const P = 5; // px per pixel unit
const r = (x, y, w, h, fill, key) => (
  <rect key={key ?? `${x}${y}${fill}`} x={x*P} y={y*P} width={w*P} height={h*P} fill={fill} />
);

// ── 各種像素小貼紙 ────────────────────────────────────────────
function Heart({ x, y, color = '#f87171' }) {
  const t = (dx, dy, w, h) => r(x+dx, y+dy, w, h, color, `h${x}${y}${dx}${dy}`);
  return <>{t(1,0,2,1)}{t(4,0,2,1)}{t(0,1,7,1)}{t(0,2,7,1)}{t(1,3,5,1)}{t(2,4,3,1)}{t(3,5,1,1)}</>;
}

function Star({ x, y, color = '#fbbf24' }) {
  const t = (dx, dy, w, h) => r(x+dx, y+dy, w, h, color, `s${x}${y}${dx}${dy}`);
  return <>{t(3,0,1,2)}{t(0,2,7,1)}{t(1,3,5,1)}{t(0,4,3,1)}{t(4,4,3,1)}{t(0,5,2,1)}{t(5,5,2,1)}</>;
}

function Sprout({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `sp${x}${y}${dx}${dy}`);
  return <>
    {t(2,0,2,1,'#52b788')}{t(1,1,4,1,'#52b788')}{t(2,2,2,1,'#52b788')}
    {t(2,3,1,1,'#95d5b2')}{t(1,2,1,1,'#95d5b2')}
    {t(2,4,1,1,'#74c69d')}{t(2,5,1,1,'#74c69d')}{t(2,6,1,1,'#6b4226')}
    {t(1,7,3,1,'#52b788')}{t(0,8,2,1,'#52b788')}{t(3,8,2,1,'#52b788')}
  </>;
}

function Mushroom({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `m${x}${y}${dx}${dy}`);
  return <>
    {t(1,0,4,1,'#ef4444')}{t(0,1,6,1,'#ef4444')}{t(0,2,6,1,'#ef4444')}
    {t(1,1,1,1,'#fff')}{t(4,2,1,1,'#fff')}
    {t(1,3,4,1,'#fde68a')}{t(2,4,2,1,'#fde68a')}{t(2,5,2,1,'#fde68a')}
  </>;
}

function Flower({ x, y, petal = '#f9a8d4', center = '#fbbf24' }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `fl${x}${y}${dx}${dy}`);
  return <>
    {t(2,0,2,1,petal)}{t(0,2,1,2,petal)}{t(5,2,1,2,petal)}{t(2,5,2,1,petal)}
    {t(1,1,1,1,petal)}{t(4,1,1,1,petal)}{t(1,4,1,1,petal)}{t(4,4,1,1,petal)}
    {t(2,2,2,1,center)}{t(1,2,1,1,center)}{t(4,2,1,1,center)}
    {t(1,3,4,1,center)}{t(2,4,2,1,center)}
  </>;
}

function Diamond({ x, y, color = '#67e8f9' }) {
  const t = (dx, dy, w, h) => r(x+dx, y+dy, w, h, color, `d${x}${y}${dx}${dy}`);
  return <>{t(2,0,2,1)}{t(1,1,4,1)}{t(0,2,6,1)}{t(1,3,4,1)}{t(2,4,2,1)}{t(3,5,0,1)}</>;
}

function Moon({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `mn${x}${y}${dx}${dy}`);
  return <>
    {t(2,0,3,1,'#fde68a')}{t(1,1,3,2,'#fde68a')}{t(0,2,3,1,'#fde68a')}
    {t(1,3,3,1,'#fde68a')}{t(2,4,2,1,'#fde68a')}
    {t(3,1,1,1,'#fef9c3')}{t(2,1,1,1,'#fef9c3')}
  </>;
}

function Cloud({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `cl${x}${y}${dx}${dy}`);
  return <>
    {t(2,0,3,1,'#fff')}{t(1,1,6,1,'#fff')}{t(0,2,8,1,'#fff')}{t(0,3,8,1,'#fff')}{t(1,4,6,1,'#e5e7eb')}
  </>;
}

function Wave({ x, y, color = '#60a5fa' }) {
  const t = (dx, dy, w, h) => r(x+dx, y+dy, w, h, color, `w${x}${y}${dx}${dy}`);
  return <>{t(0,1,2,1)}{t(2,0,2,1)}{t(4,1,2,1)}{t(6,0,2,1)}{t(8,1,2,1)}{t(0,3,2,1)}{t(2,2,2,1)}{t(4,3,2,1)}{t(6,2,2,1)}{t(8,3,2,1)}</>;
}

function Leaf({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `lf${x}${y}${dx}${dy}`);
  return <>
    {t(2,0,1,1,'#4ade80')}{t(1,1,3,1,'#22c55e')}{t(0,2,4,1,'#22c55e')}
    {t(1,3,3,1,'#16a34a')}{t(2,4,1,1,'#15803d')}{t(2,5,1,2,'#6b4226')}
  </>;
}

function SmallStar({ x, y, color = '#fbbf24' }) {
  const t = (dx, dy, w, h) => r(x+dx, y+dy, w, h, color, `ss${x}${y}${dx}${dy}`);
  return <>{t(1,0,1,1)}{t(0,1,3,1)}{t(1,2,1,1)}</>;
}

function Gem({ x, y }) {
  const t = (dx, dy, w, h, c) => r(x+dx, y+dy, w, h, c, `gm${x}${y}${dx}${dy}`);
  return <>
    {t(1,0,3,1,'#a78bfa')}{t(0,1,5,1,'#8b5cf6')}{t(1,2,3,1,'#7c3aed')}{t(2,3,1,1,'#6d28d9')}
    {t(1,1,1,1,'#c4b5fd')}
  </>;
}

// ── 整張插圖面板 ─────────────────────────────────────────────
export function PixelBoard() {
  return (
    <svg
      viewBox="0 0 280 420"
      style={{ imageRendering: 'pixelated', width: '100%', height: '100%', maxHeight: 480 }}
    >
      {/* row 1 */}
      <Heart    x={1}  y={1} color="#f87171" />
      <Star     x={10} y={1} color="#fbbf24" />
      <Leaf     x={20} y={0} />
      <Moon     x={30} y={1} />
      <SmallStar x={39} y={2} color="#a5f3fc" />
      <SmallStar x={42} y={0} color="#fde68a" />
      <SmallStar x={50} y={3} color="#fbcfe8" />

      {/* row 2 */}
      <Cloud    x={2}  y={10} />
      <Sprout   x={13} y={9} />
      <Flower   x={22} y={9} petal="#f9a8d4" />
      <Diamond  x={31} y={10} color="#67e8f9" />
      <SmallStar x={42} y={11} color="#fbbf24" />
      <Gem      x={47} y={9} />

      {/* row 3 */}
      <Heart    x={0}  y={20} color="#fb923c" />
      <Mushroom x={9}  y={19} />
      <Wave     x={18} y={21} color="#60a5fa" />
      <Star     x={31} y={20} color="#a5f3fc" />
      <SmallStar x={42} y={22} color="#f9a8d4" />
      <SmallStar x={46} y={20} color="#fbbf24" />

      {/* row 4 */}
      <Gem      x={1}  y={29} />
      <Star     x={9}  y={29} color="#fb923c" />
      <Heart    x={19} y={30} color="#f9a8d4" />
      <Cloud    x={28} y={30} />
      <Leaf     x={40} y={29} />
      <SmallStar x={48} y={31} color="#c4b5fd" />

      {/* row 5 */}
      <Flower   x={0}  y={39} petal="#fde68a" center="#f87171" />
      <Diamond  x={9}  y={40} color="#a78bfa" />
      <Sprout   x={18} y={38} />
      <Moon     x={27} y={39} />
      <Mushroom x={36} y={39} />
      <SmallStar x={46} y={40} color="#fbbf24" />
      <SmallStar x={50} y={38} color="#4ade80" />

      {/* row 6 */}
      <Wave     x={0}  y={50} color="#818cf8" />
      <Heart    x={12} y={49} color="#c084fc" />
      <Star     x={20} y={50} color="#fbbf24" />
      <Flower   x={28} y={49} petal="#86efac" center="#fbbf24" />
      <Gem      x={37} y={50} />
      <SmallStar x={44} y={51} color="#f87171" />

      {/* row 7 */}
      <SmallStar x={3}  y={60} color="#a5f3fc" />
      <Diamond  x={8}  y={59} color="#fb923c" />
      <Cloud    x={16} y={60} />
      <Heart    x={27} y={59} color="#f87171" />
      <Star     x={36} y={60} color="#c084fc" />
      <SmallStar x={45} y={61} color="#fde68a" />
      <SmallStar x={49} y={59} color="#4ade80" />

      {/* row 8 */}
      <Leaf     x={1}  y={69} />
      <Star     x={9}  y={68} color="#f87171" />
      <Mushroom x={17} y={68} />
      <Wave     x={26} y={70} color="#34d399" />
      <Moon     x={38} y={68} />
      <SmallStar x={48} y={70} color="#fbbf24" />
    </svg>
  );
}

// ── 左側整體面板 ─────────────────────────────────────────────
export default function AuthPixelPanel({ lang }) {
  return (
    <div className="login-left" style={{
      flex: 1,
      background: 'linear-gradient(160deg,#1a3a2a 0%,#2d6a4f 60%,#1a2e25 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      gap: 32,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 背景裝飾光點 */}
      {[
        { top:'8%', left:'12%', s:120, o:0.06 },
        { top:'55%', left:'70%', s:180, o:0.05 },
        { top:'80%', left:'20%', s:100, o:0.07 },
      ].map((b, i) => (
        <div key={i} style={{
          position:'absolute', top:b.top, left:b.left,
          width:b.s, height:b.s, borderRadius:'50%',
          background:'#52b788', opacity:b.o, pointerEvents:'none',
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 300, flex: 1, display:'flex', alignItems:'center' }}>
        <PixelBoard />
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
          {lang === 'zh' ? '抗焦慮成長導航' : 'Anxiety Growth Nav'}
        </p>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
          {lang === 'zh'
            ? '不需要比任何人好，\n只需要比昨天的自己\n更理解自己'
            : "You don't need to be\nbetter than anyone.\nJust more yourself."}
        </p>
      </div>
    </div>
  );
}

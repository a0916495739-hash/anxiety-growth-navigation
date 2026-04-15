// 像素貼紙元件 — 各自獨立 SVG，可絕對定位散落

const mk = (P, items) => items.map(([x, y, w, h, fill], i) => (
  <rect key={i} x={x*P} y={y*P} width={w*P} height={h*P} fill={fill} />
));

export function HeartSticker({ size = 36, color = '#f87171' }) {
  const P = size / 7;
  return (
    <svg viewBox="0 0 7 6" width={size} height={size*6/7} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [1,0,2,1,color],[4,0,2,1,color],
        [0,1,7,2,color],
        [1,3,5,1,color],[2,4,3,1,color],[3,5,1,1,color],
      ])}
    </svg>
  );
}

export function StarSticker({ size = 36, color = '#fbbf24' }) {
  const P = size / 7;
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [3,0,1,2,color],
        [0,2,7,1,color],[1,3,5,1,color],
        [0,4,3,1,color],[4,4,3,1,color],
        [0,5,2,1,color],[5,5,2,1,color],
      ])}
    </svg>
  );
}

export function SproutSticker({ size = 40 }) {
  return (
    <svg viewBox="0 0 6 9" width={size} height={size*9/6} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [2,0,2,1,'#52b788'],[1,1,4,1,'#52b788'],[1,2,1,1,'#95d5b2'],[2,2,2,1,'#52b788'],
        [2,3,1,1,'#74c69d'],[2,4,1,1,'#74c69d'],[2,5,1,1,'#6b4226'],
        [1,6,4,1,'#52b788'],[0,7,2,1,'#52b788'],[4,7,2,1,'#52b788'],
      ])}
    </svg>
  );
}

export function MushroomSticker({ size = 36 }) {
  return (
    <svg viewBox="0 0 6 6" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [1,0,4,1,'#ef4444'],[0,1,6,2,'#ef4444'],
        [1,1,1,1,'#fff'],[4,2,1,1,'#fff'],
        [1,3,4,1,'#fde68a'],[2,4,2,1,'#fde68a'],[2,5,2,1,'#fde68a'],
      ])}
    </svg>
  );
}

export function FlowerSticker({ size = 38, petal = '#f9a8d4', center = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [2,0,2,1,petal],[0,2,1,2,petal],[5,2,1,2,petal],[2,5,2,1,petal],
        [1,1,1,1,petal],[4,1,1,1,petal],[1,4,1,1,petal],[4,4,1,1,petal],
        [1,2,1,1,center],[4,2,1,1,center],[2,2,2,1,center],[1,3,4,1,center],[2,4,2,1,center],
      ])}
    </svg>
  );
}

export function DiamondSticker({ size = 34, color = '#67e8f9' }) {
  return (
    <svg viewBox="0 0 6 6" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [2,0,2,1,color],[1,1,4,1,color],[0,2,6,1,color],
        [1,3,4,1,color],[2,4,2,1,color],[3,5,0,1,color],
      ])}
    </svg>
  );
}

export function MoonSticker({ size = 34 }) {
  return (
    <svg viewBox="0 0 6 6" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [2,0,3,1,'#fde68a'],[1,1,3,1,'#fde68a'],[0,2,3,1,'#fde68a'],
        [1,3,3,1,'#fde68a'],[2,4,2,1,'#fde68a'],
        [2,1,1,1,'#fef9c3'],[1,1,1,1,'#fef9c3'],
      ])}
    </svg>
  );
}

export function CloudSticker({ size = 48 }) {
  return (
    <svg viewBox="0 0 8 5" width={size} height={size*5/8} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [2,0,3,1,'#fff'],[1,1,6,1,'#fff'],[0,2,8,2,'#fff'],[1,4,6,1,'#e5e7eb'],
      ])}
    </svg>
  );
}

export function GemSticker({ size = 34 }) {
  return (
    <svg viewBox="0 0 5 5" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [
        [1,0,3,1,'#a78bfa'],[0,1,5,1,'#8b5cf6'],[1,1,1,1,'#c4b5fd'],
        [1,2,3,1,'#7c3aed'],[2,3,1,1,'#6d28d9'],
      ])}
    </svg>
  );
}

export function SmallStarSticker({ size = 20, color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 3 3" width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {mk(1, [[1,0,1,1,color],[0,1,3,1,color],[1,2,1,1,color]])}
    </svg>
  );
}

// ── 散落配置（供 Login / Register 使用） ─────────────────────
export const STICKER_LAYOUT = [
  // 左上角
  { C: 'Heart',       style: { top:'4%',  left:'3%'  }, props: { size:32, color:'#f87171' } },
  { C: 'Star',        style: { top:'10%', left:'9%'  }, props: { size:28, color:'#fbbf24' } },
  { C: 'SmallStar',   style: { top:'3%',  left:'14%' }, props: { size:16, color:'#a5f3fc' } },
  { C: 'Sprout',      style: { top:'16%', left:'2%'  }, props: { size:34 } },
  { C: 'Flower',      style: { top:'22%', left:'11%' }, props: { size:32, petal:'#f9a8d4' } },
  { C: 'SmallStar',   style: { top:'20%', left:'5%'  }, props: { size:14, color:'#fde68a' } },

  // 右上角
  { C: 'Moon',        style: { top:'3%',  right:'4%' }, props: { size:30 } },
  { C: 'Diamond',     style: { top:'9%',  right:'10%'}, props: { size:28, color:'#67e8f9' } },
  { C: 'SmallStar',   style: { top:'5%',  right:'18%'}, props: { size:18, color:'#fbbf24' } },
  { C: 'Mushroom',    style: { top:'16%', right:'3%' }, props: { size:32 } },
  { C: 'Heart',       style: { top:'22%', right:'12%'}, props: { size:26, color:'#fb923c' } },
  { C: 'Gem',         style: { top:'13%', right:'20%'}, props: { size:28 } },

  // 左下角
  { C: 'Cloud',       style: { bottom:'18%', left:'2%' }, props: { size:44 } },
  { C: 'Star',        style: { bottom:'10%', left:'6%' }, props: { size:30, color:'#c084fc' } },
  { C: 'Heart',       style: { bottom:'4%',  left:'3%' }, props: { size:28, color:'#f9a8d4' } },
  { C: 'SmallStar',   style: { bottom:'22%', left:'13%'}, props: { size:16, color:'#4ade80' } },
  { C: 'Flower',      style: { bottom:'13%', left:'13%'}, props: { size:30, petal:'#86efac', center:'#fbbf24' } },

  // 右下角
  { C: 'Sprout',      style: { bottom:'20%', right:'4%' }, props: { size:36 } },
  { C: 'Diamond',     style: { bottom:'10%', right:'5%' }, props: { size:30, color:'#a78bfa' } },
  { C: 'SmallStar',   style: { bottom:'5%',  right:'12%'}, props: { size:18, color:'#f87171' } },
  { C: 'Cloud',       style: { bottom:'4%',  right:'18%'}, props: { size:38 } },
  { C: 'Moon',        style: { bottom:'14%', right:'14%'}, props: { size:28 } },

  // 中間側邊（不遮表單）
  { C: 'SmallStar',   style: { top:'42%', left:'3%'  }, props: { size:20, color:'#fbbf24' } },
  { C: 'Heart',       style: { top:'50%', left:'9%'  }, props: { size:24, color:'#f87171' } },
  { C: 'SmallStar',   style: { top:'38%', right:'4%' }, props: { size:18, color:'#a5f3fc' } },
  { C: 'Gem',         style: { top:'48%', right:'9%' }, props: { size:26 } },
];

const MAP = {
  Heart: HeartSticker, Star: StarSticker, Sprout: SproutSticker,
  Mushroom: MushroomSticker, Flower: FlowerSticker, Diamond: DiamondSticker,
  Moon: MoonSticker, Cloud: CloudSticker, Gem: GemSticker, SmallStar: SmallStarSticker,
};

export default function AuthPixelBg({ isDark }) {
  const bg = isDark
    ? 'linear-gradient(135deg,#1c1917 0%,#231f1d 100%)'
    : 'linear-gradient(135deg,#1a3a2a 0%,#2d6a4f 60%,#1a2e25 100%)';

  return (
    <div style={{ position: 'fixed', inset: 0, background: bg, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {STICKER_LAYOUT.map(({ C, style, props }, i) => {
        const Comp = MAP[C];
        return (
          <div key={i} style={{ position: 'absolute', opacity: 0.85, ...style }}>
            <Comp {...props} />
          </div>
        );
      })}
    </div>
  );
}

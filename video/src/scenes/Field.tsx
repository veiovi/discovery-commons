import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, Center, H, ROLE_COLORS, W, Words, clamp, prng } from "../lib";

type Dot = { x: number; y: number; d: number; role: number; phase: number; ang: number; len: number; trailAt: number; size: number };

const COLS = 46;
const ROWS = 26;
const DOTS: Dot[] = (() => {
  const r = prng(2048);
  const out: Dot[] = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const x = (i + 0.5) * (W / COLS) + (r() - 0.5) * 30;
      const y = (j + 0.5) * (H / ROWS) + (r() - 0.5) * 30;
      const d = Math.hypot(x - W / 2, y - H / 2);
      out.push({
        x,
        y,
        d,
        role: Math.floor(r() * 3),
        phase: r() * Math.PI * 2,
        ang: r() * Math.PI * 2,
        len: 60 + r() * 220,
        trailAt: r() < 0.32 ? 330 + r() * 120 : -1,
        size: 1.6 + r() * 1.8,
      });
    }
  }
  return out;
})();

/**
 * Local frames 0–516 (global 84–600).
 * A single spark → "what if" → the whole world lights up → everyone explores.
 */
export const Field: React.FC = () => {
  const f = useCurrentFrame();
  const spark = interpolate(f, [6, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(f, [0, 516], [1.18, 1.0]);
  const textShade = 0.78;

  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,200,120,${0.10 * clamp((f - 144) / 120)}) 0%, rgba(11,22,38,0) 60%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
        <defs>
          <radialGradient id="bloom">
            <stop offset="0%" stopColor="#fff3d6" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffd27a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {DOTS.map((p, i) => {
          const lightAt = 144 + (p.d / 1100) * 120 + (p.phase / 6.28) * 14;
          const on = clamp((f - lightAt) / 14);
          if (on <= 0) return null;
          const twinkle = 0.75 + 0.25 * Math.sin(f / 9 + p.phase);
          const roleMix = clamp((f - 330) / 60);
          const color = roleMix > 0.5 ? ROLE_COLORS[p.role] : "#ffe7bf";
          const elems: React.ReactNode[] = [];
          if (p.trailAt > 0 && f > p.trailAt) {
            const t = clamp((f - p.trailAt) / 46);
            const fade = 1 - clamp((f - p.trailAt - 70) / 50);
            // gently curving path in a random direction
            const bend = Math.sin(p.phase) * 0.6;
            const a = p.ang + bend * t;
            const ex = p.x + Math.cos(a) * p.len * t;
            const ey = p.y + Math.sin(a) * p.len * t;
            const mx = p.x + Math.cos(p.ang) * p.len * t * 0.55;
            const my = p.y + Math.sin(p.ang) * p.len * t * 0.55;
            elems.push(
              <path
                key={`t${i}`}
                d={`M${p.x},${p.y} Q${mx},${my} ${ex},${ey}`}
                stroke={ROLE_COLORS[p.role]}
                strokeWidth={1.6}
                fill="none"
                strokeLinecap="round"
                opacity={0.55 * fade}
              />,
              <circle key={`h${i}`} cx={ex} cy={ey} r={2.6} fill={ROLE_COLORS[p.role]} opacity={fade} />,
            );
          }
          elems.push(<circle key={`g${i}`} cx={p.x} cy={p.y} r={p.size * 4} fill={color} opacity={0.08 * on * twinkle} />);
          elems.push(<circle key={`d${i}`} cx={p.x} cy={p.y} r={p.size * (0.6 + 0.4 * on)} fill={color} opacity={on * twinkle} />);
          return <g key={i}>{elems}</g>;
        })}
        {/* the first spark, at the centre */}
        <circle cx={W / 2} cy={H / 2 - 150} r={140 * spark} fill="url(#bloom)" opacity={spark * interpolate(f, [130, 190], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <circle cx={W / 2} cy={H / 2 - 150} r={7 * spark} fill="#fff6e0" opacity={interpolate(f, [150, 190], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </svg>
      {/* keep the copy readable over the field */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 300px at 50% 52%, rgba(7,14,25,${textShade}) 0%, rgba(7,14,25,${textShade * 0.6}) 45%, rgba(7,14,25,0) 100%)`,
          opacity: clamp((f - 140) / 20),
        }}
      />
      <Center>
        <Sequenced f={f} from={14} to={58}>
          <Words text="Or…" at={14} out={58} size={110} italic color="#ffe7bf" />
        </Sequenced>
        <Sequenced f={f} from={60} to={142}>
          <Words text="What if intelligence" at={60} out={142} size={92} />
          <Words text="stays open to everyone?" at={72} out={142} size={92} highlight={{ open: C.gold }} />
        </Sequenced>
        <Sequenced f={f} from={150} to={244}>
          <Words text="Cheap. Abundant." at={152} out={244} size={96} />
          <Words text="As common as electricity." at={178} out={244} size={64} color={C.muted} />
        </Sequenced>
        <Sequenced f={f} from={246} to={332}>
          <Words text="Then every person on Earth" at={248} out={332} size={84} />
          <Words text="gets a lab." at={264} out={332} size={128} highlight={{ lab: C.gold }} />
        </Sequenced>
        <Sequenced f={f} from={340} to={430}>
          <Words text="Everyone explores." at={342} out={430} size={104} />
        </Sequenced>
        <Sequenced f={f} from={430} to={516}>
          <Words text="In every direction." at={432} out={516} size={96} />
          <Words text="All at once." at={452} out={516} size={64} color={C.muted} />
        </Sequenced>
      </Center>
    </AbsoluteFill>
  );
};

/** Render children only while their window is on screen, stacked in the same centred slot. */
const Sequenced: React.FC<{ f: number; from: number; to: number; children: React.ReactNode }> = ({ f, from, to, children }) =>
  f >= from && f <= to ? (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>{children}</div>
  ) : null;


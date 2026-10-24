import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, ROLE_COLORS, SANS, W, Words, clamp, prng } from "../lib";

const CX = W / 2;
const CY = 610;
const RX = 800;
const RY = 330;
const N = 60;
const PEOPLE = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(a) * RX, y: CY + Math.sin(a) * RY, role: i % 3 };
});

const r = prng(77);
const PACKETS = Array.from({ length: 96 }, (_, i) => ({
  from: Math.floor(r() * N),
  at: 4 + i * 1.9 + r() * 3,
  ok: r() > 0.26,
  bend: (r() - 0.5) * 260,
}));
const TRAVEL = 34;
const REWARDS = Array.from({ length: 70 }, (_, i) => ({ to: (i * 23 + 5) % N, at: 176 + i * 1.5 + r() * 4 }));
const RTRAVEL = 28;

function bez(t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
}

/** Local frames 0–315 (global 870–1185). Everything flows in, gets checked, rewards flow out. */
export const Commons: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = clamp(f / 14);
  const accepted = PACKETS.filter((p) => p.ok && f >= p.at + TRAVEL);
  const flash = PACKETS.reduce((s, p) => (p.ok && f >= p.at + TRAVEL ? s + Math.exp(-(f - p.at - TRAVEL) / 6) : s), 0);
  const rings = Math.min(7, 2 + Math.floor(accepted.length / 9));
  const rewardGlow = (to: number) =>
    REWARDS.reduce((s, q) => (q.to === to && f >= q.at + RTRAVEL ? s + Math.exp(-(f - q.at - RTRAVEL) / 14) : s), 0);
  const goldPhase = clamp((f - 176) / 30);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 58%, #13263f 0%, ${C.deep} 70%)`, opacity: fadeIn }}>
      <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="core">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={C.mint} stopOpacity="0.5" />
            <stop offset="100%" stopColor={C.mint} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="goldcore">
            <stop offset="0%" stopColor="#fff6dd" stopOpacity="1" />
            <stop offset="40%" stopColor={C.gold} stopOpacity="0.45" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* faint spokes */}
        {PEOPLE.map((p, i) => (
          <line key={`s${i}`} x1={p.x} y1={p.y} x2={CX} y2={CY} stroke={ROLE_COLORS[p.role]} strokeOpacity={0.06} />
        ))}
        {/* core */}
        <circle cx={CX} cy={CY} r={150 + 30 * Math.min(flash, 2)} fill="url(#core)" opacity={0.35 + 0.25 * Math.min(flash, 2)} />
        <circle cx={CX} cy={CY} r={190} fill="url(#goldcore)" opacity={goldPhase * (0.55 + 0.15 * Math.sin(f / 5))} />
        {Array.from({ length: rings }, (_, k) => {
          const rad = 34 + k * 17;
          const pts = Array.from({ length: 6 }, (_, j) => {
            const a = (j / 6) * Math.PI * 2 + f / (40 + k * 12) * (k % 2 ? -1 : 1);
            return `${CX + Math.cos(a) * rad},${CY + Math.sin(a) * rad}`;
          }).join(" ");
          const grow = clamp((accepted.length - (k - 2) * 9) / 3);
          return <polygon key={k} points={pts} fill="none" stroke={k > 3 ? C.gold : C.mint} strokeOpacity={0.65 * (k < 2 ? 1 : grow)} strokeWidth={2} />;
        })}
        <circle cx={CX} cy={CY} r={14} fill="#fff" />
        {/* packets flowing in */}
        {PACKETS.map((p, i) => {
          const t = (f - p.at) / TRAVEL;
          if (t < 0 || t > 1) return null;
          const s = PEOPLE[p.from];
          const [x, y] = bez(t, s.x, s.y, (s.x + CX) / 2 + p.bend, (s.y + CY) / 2 - p.bend * 0.3, CX, CY);
          if (!p.ok && t > 0.62) {
            const fail = clamp((t - 0.62) / 0.25);
            return (
              <g key={i} opacity={1 - fail}>
                <circle cx={x} cy={y} r={7 + 16 * fail} fill="none" stroke={C.coral} strokeWidth={2} />
                <circle cx={x} cy={y} r={5} fill={C.coral} />
              </g>
            );
          }
          if (!p.ok && t > 0.87) return null;
          const [tx, ty] = bez(Math.max(0, t - 0.12), s.x, s.y, (s.x + CX) / 2 + p.bend, (s.y + CY) / 2 - p.bend * 0.3, CX, CY);
          return (
            <g key={i}>
              <line x1={tx} y1={ty} x2={x} y2={y} stroke={ROLE_COLORS[s.role]} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
              <circle cx={x} cy={y} r={15} fill={ROLE_COLORS[s.role]} opacity={0.2} />
              <circle cx={x} cy={y} r={7} fill={ROLE_COLORS[s.role]} />
            </g>
          );
        })}
        {/* rewards flowing back out */}
        {REWARDS.map((q, i) => {
          const t = (f - q.at) / RTRAVEL;
          if (t < 0 || t > 1) return null;
          const d = PEOPLE[q.to];
          const [x, y] = bez(t, CX, CY, (d.x + CX) / 2, (d.y + CY) / 2 - 80, d.x, d.y);
          return (
            <g key={`r${i}`}>
              <circle cx={x} cy={y} r={12} fill={C.gold} opacity={0.22} />
              <circle cx={x} cy={y} r={4.5} fill="#fff1c9" />
            </g>
          );
        })}
        {/* people */}
        {PEOPLE.map((p, i) => {
          const g = Math.min(rewardGlow(i), 1.6);
          return (
            <g key={`p${i}`}>
              <circle cx={p.x} cy={p.y} r={16 + 14 * g} fill={C.gold} opacity={0.25 * g} />
              <circle cx={p.x} cy={p.y} r={9} fill={ROLE_COLORS[p.role]} />
              <circle cx={p.x} cy={p.y} r={9 + 3 * g} fill="none" stroke={C.gold} strokeWidth={2} opacity={g} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY + 185,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          letterSpacing: "0.32em",
          fontSize: 22,
          color: C.mint,
          opacity: clamp((f - 20) / 20) * 0.9,
        }}
      >
        THE COMMONS
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70 }}>
        {f < 98 && <Words text="Everything flows into one shared Commons." at={8} out={98} size={74} />}
        {f >= 98 && f < 176 && <Words text="It checks what's real." at={100} out={176} size={84} highlight={{ whats: C.mint, real: C.mint }} />}
        {f >= 176 && <Words text="And rewards whoever moves us all forward." at={178} out={315} size={74} highlight={{ rewards: C.gold, forward: C.gold }} />}
      </div>
      <AbsoluteFill style={{ background: C.deep, opacity: interpolate(f, [302, 315], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

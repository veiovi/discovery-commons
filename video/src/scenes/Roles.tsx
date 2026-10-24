import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { C, FPS, SANS, SERIF, W, Words, clamp, prog } from "../lib";

const COLS = [
  { name: "Makers", verb: "Some create.", sub: "tools · datasets · methods", color: C.ice, at: 0 },
  { name: "Explorers", verb: "Some research.", sub: "questions · hypotheses · leads", color: C.violet, at: 62 },
  { name: "Verifiers", verb: "Some verify.", sub: "replications · challenges", color: C.mint, at: 124 },
];

/** Local frames 0–270 (global 600–870). Three kinds of gift. */
export const Roles: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [258, 270], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #12233a 0%, ${C.deep} 75%)`, opacity: out }}>
      {COLS.map((c, i) => {
        const cx = (W / 6) * (1 + i * 2);
        const p = prog(f, c.at, 22);
        const local = f - c.at;
        return (
          <div
            key={c.name}
            style={{
              position: "absolute",
              left: cx - 290,
              top: 150,
              width: 580,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
            }}
          >
            <svg width={360} height={360} viewBox="-180 -180 360 360" style={{ overflow: "visible" }}>
              <circle r={170} fill="none" stroke={c.color} strokeOpacity={0.18} strokeWidth={1.5} />
              <circle r={170} fill={c.color} opacity={0.04 + 0.03 * Math.sin(f / 10 + i)} />
              {i === 0 && <Maker t={local} color={c.color} />}
              {i === 1 && <Explorer t={local} color={c.color} />}
              {i === 2 && <Verifier t={local} color={c.color} />}
            </svg>
            <div style={{ fontFamily: SERIF, fontSize: 76, color: C.cloud, marginTop: 26 }}>{c.verb}</div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: c.color,
                marginTop: 14,
              }}
            >
              {c.name}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: C.muted, marginTop: 10 }}>{c.sub}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880 }}>
        <Words text="Different strengths. All of them count." at={196} size={62} highlight={{ All: C.gold, count: C.gold }} />
      </div>
    </AbsoluteFill>
  );
};

/** Blocks fly in and lock into a small structure. */
const Maker: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const cells = [
    [-1, 1], [0, 1], [1, 1],
    [-1, 0], [0, 0], [1, 0],
    [-0.5, -1], [0.5, -1],
    [0, -2],
  ];
  return (
    <g>
      {cells.map(([gx, gy], k) => {
        const s = spring({ frame: t - 6 - k * 4, fps: FPS, config: { damping: 14, stiffness: 120 } });
        const x = gx * 62;
        const y = gy * 56 + 40;
        const fromY = -260;
        return (
          <rect
            key={k}
            x={x - 26}
            y={fromY + (y - fromY) * s - 24}
            width={52}
            height={48}
            rx={8}
            fill={color}
            fillOpacity={0.18 + 0.5 * s}
            stroke={color}
            strokeWidth={2}
            opacity={clamp(s * 1.4)}
          />
        );
      })}
    </g>
  );
};

/** Branching lines search outward; leads light up at the tips. */
const Explorer: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const branches: { a: number; l: number; kids: number[] }[] = [
    { a: -2.4, l: 90, kids: [-0.5, 0.4] },
    { a: -1.2, l: 100, kids: [-0.45, 0.5] },
    { a: 0.1, l: 95, kids: [-0.5, 0.35] },
    { a: 1.4, l: 90, kids: [-0.4, 0.5] },
    { a: 2.6, l: 85, kids: [0.45] },
  ];
  const p1 = clamp((t - 6) / 26);
  const p2 = clamp((t - 26) / 26);
  return (
    <g>
      {branches.map((b, k) => {
        const ex = Math.cos(b.a) * b.l;
        const ey = Math.sin(b.a) * b.l;
        return (
          <g key={k}>
            <line x1={0} y1={0} x2={ex * p1} y2={ey * p1} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {b.kids.map((ka, j) => {
              const a = b.a + ka;
              const kx = ex + Math.cos(a) * 62 * p2;
              const ky = ey + Math.sin(a) * 62 * p2;
              const lit = clamp((t - 46 - k * 3 - j * 5) / 10);
              return (
                <g key={j}>
                  <line x1={ex} y1={ey} x2={kx} y2={ky} stroke={color} strokeWidth={1.8} strokeOpacity={p2 > 0 ? 0.8 : 0} strokeLinecap="round" />
                  <circle cx={kx} cy={ky} r={5 + 7 * lit} fill={color} opacity={p2 > 0.9 ? 0.25 + 0.75 * lit : 0} />
                  <circle cx={kx} cy={ky} r={18 * lit} fill={color} opacity={0.18 * lit} />
                </g>
              );
            })}
          </g>
        );
      })}
      <circle r={13} fill={color} />
      <circle r={13 + 10 * Math.abs(Math.sin(t / 8))} fill="none" stroke={color} strokeOpacity={0.5} />
    </g>
  );
};

/** A scanner passes over four results: three hold up, one doesn't. */
const Verifier: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const rows = [0, 1, 2, 3];
  const scanY = interpolate(t, [10, 70], [-120, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g>
      {rows.map((r) => {
        const y = -105 + r * 70;
        const fail = r === 2;
        const done = clamp((scanY - y + 10) / 18);
        const c = fail ? C.coral : color;
        return (
          <g key={r}>
            <rect x={-130} y={y - 24} width={260} height={48} rx={10} fill={c} fillOpacity={0.06 + 0.12 * done} stroke={c} strokeOpacity={0.3 + 0.5 * done} strokeWidth={2} />
            <rect x={-110} y={y - 6} width={120 - r * 14} height={12} rx={6} fill={C.cloud} opacity={0.35} />
            {fail ? (
              <g stroke={c} strokeWidth={5} strokeLinecap="round" opacity={done}>
                <line x1={78} y1={y - 12} x2={102} y2={y + 12} />
                <line x1={102} y1={y - 12} x2={78} y2={y + 12} />
              </g>
            ) : (
              <path
                d={`M76,${y} L88,${y + 12} L108,${y - 14}`}
                stroke={c}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={60}
                strokeDashoffset={60 * (1 - done)}
              />
            )}
          </g>
        );
      })}
      <line x1={-150} x2={150} y1={scanY} y2={scanY} stroke={color} strokeWidth={2} opacity={t < 74 ? 0.9 : 0} />
      <rect x={-150} y={scanY - 30} width={300} height={30} fill={color} opacity={t < 74 ? 0.08 : 0} />
    </g>
  );
};

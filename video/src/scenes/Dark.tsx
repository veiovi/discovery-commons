import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, CONDENSED, H, SANS, W, prng } from "../lib";

const LINES = [
  { text: "AI takes the jobs.", at: 0, size: 92 },
  { text: "AI makes the decisions.", at: 16, size: 92 },
  { text: "AI ends the world.", at: 34, size: 168 },
];

/** 0–84: the doom-scroll future, then the screen dies like an old CRT. */
export const Dark: React.FC = () => {
  const f = useCurrentFrame();
  const rnd = prng(f * 7919 + 13);
  const jolt = LINES.some((l) => f >= l.at && f < l.at + 4) ? 1 : 0;
  const shake = (rnd() - 0.5) * (4 + jolt * 26);
  const split = 3 + rnd() * 6 + jolt * 18;
  const flicker = rnd() < 0.08 ? 0.55 : 1;
  const squashY = interpolate(f, [66, 74], [1, 0.006], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const squashX = interpolate(f, [73, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(f, [64, 70, 80], [0, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.55 + 0.45 * Math.sin(f / 3);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${squashX}, ${squashY})`,
          filter: `brightness(${1 + flash * 2.5})`,
          opacity: f > 80 ? 0 : 1,
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 55%, rgba(120,0,10,${0.55 * pulse}) 0%, rgba(30,0,4,0.9) 55%, #000 100%)`,
          }}
        />
        {/* skyline of burning bars */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
          {Array.from({ length: 48 }, (_, i) => {
            const r = prng(i * 31 + 5);
            const h = 80 + r() * 330 + Math.sin(f / 4 + i) * 10;
            const w = 26 + r() * 30;
            return <rect key={i} x={i * 41 - 10} y={H - h} width={w} height={h} fill="#14020a" stroke="#3a0610" />;
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            top: 54,
            left: 64,
            fontFamily: SANS,
            fontWeight: 700,
            letterSpacing: "0.2em",
            fontSize: 24,
            color: C.blood,
            opacity: Math.floor(f / 8) % 2 ? 1 : 0.35,
          }}
        >
          ● BREAKING
        </div>
        <div style={{ position: "absolute", top: 54, right: 64, fontFamily: SANS, fontSize: 22, color: "#a35", letterSpacing: "0.12em" }}>
          T-MINUS {String(99 - Math.floor(f * 1.17)).padStart(2, "0")}:{String(Math.floor(rnd() * 99)).padStart(2, "0")}
        </div>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transform: `translate(${shake}px, ${shake * 0.4}px)`,
            opacity: flicker,
          }}
        >
          {LINES.map((l, i) => {
            if (f < l.at) return <div key={i} style={{ height: l.size * 1.05 }} />;
            const t = f - l.at;
            const pop = interpolate(t, [0, 3], [1.25, 1], { extrapolateRight: "clamp" });
            const dim = i < 2 && f > 34 ? 0.45 : 1;
            const style: React.CSSProperties = {
              fontFamily: CONDENSED,
              fontWeight: 800,
              fontSize: l.size,
              lineHeight: 1.05,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            };
            return (
              <div key={i} style={{ position: "relative", transform: `scale(${pop})`, opacity: dim }}>
                <div style={{ ...style, color: "rgba(255,0,40,0.85)", position: "absolute", left: split, top: 0, mixBlendMode: "screen" }}>{l.text}</div>
                <div style={{ ...style, color: "rgba(0,220,255,0.6)", position: "absolute", left: -split, top: 0, mixBlendMode: "screen" }}>{l.text}</div>
                <div style={{ ...style, color: "#fff4f4", position: "relative" }}>{l.text}</div>
              </div>
            );
          })}
        </AbsoluteFill>
        {/* scanlines + torn bands */}
        <AbsoluteFill
          style={{
            background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 2px, transparent 2px, transparent 5px)",
          }}
        />
        {Array.from({ length: jolt ? 6 : 2 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rnd() * H,
              height: 4 + rnd() * 28,
              background: `rgba(255,${Math.floor(rnd() * 60)},60,${0.08 + rnd() * 0.2})`,
              transform: `translateX(${(rnd() - 0.5) * 120}px)`,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

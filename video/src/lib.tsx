import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ocean: "#0b1626",
  deep: "#070e19",
  cloud: "#edf3f8",
  muted: "#a6b8ca",
  ice: "#a9d9f5",
  violet: "#b9aff0",
  mint: "#96d6c5",
  coral: "#ffb78d",
  gold: "#ffd27a",
  blood: "#ff2b3a",
};

export const ROLE_COLORS = [C.ice, C.violet, C.mint];

export const SERIF = 'Georgia, "Times New Roman", serif';
export const SANS = '"Avenir Next", Avenir, "Helvetica Neue", sans-serif';
export const CONDENSED = '"Avenir Next Condensed", "Avenir Next", Impact, sans-serif';

export function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 over [start, start+len] with an ease-out. */
export function prog(frame: number, start: number, len: number) {
  return interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

/** Opacity for a block that fades in at `inAt` and out at `outAt`. */
export function fadeWindow(frame: number, inAt: number, outAt: number, fade = 10) {
  return Math.min(
    interpolate(frame, [inAt, inAt + fade], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [outAt - fade, outAt], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
}

type WordsProps = {
  text: string;
  at: number;
  out?: number;
  size?: number;
  color?: string;
  font?: string;
  italic?: boolean;
  weight?: number;
  stagger?: number;
  highlight?: Record<string, string>;
  style?: React.CSSProperties;
};

/** A line of words that rise into focus one after another. */
export const Words: React.FC<WordsProps> = ({
  text,
  at,
  out = 99999,
  size = 84,
  color = C.cloud,
  font = SERIF,
  italic,
  weight = 400,
  stagger = 4,
  highlight = {},
  style,
}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const fadeOut = interpolate(f, [out - 10, out], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontStyle: italic ? "italic" : "normal",
        fontWeight: weight,
        color,
        lineHeight: 1.12,
        letterSpacing: font === SERIF ? "-0.01em" : "0",
        textAlign: "center",
        opacity: fadeOut,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(f, at + i * stagger, 16);
        const key = w.replace(/[^\w]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 26}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
              color: highlight[key] ?? undefined,
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              textShadow: "0 2px 30px rgba(0,0,0,0.55)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Center: React.FC<{ children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({
  children,
  y = 0,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transform: `translateY(${y}px)`,
      gap: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Subtle film grain so flat gradients don't band in the encode. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "overlay" }}>
      <filter id={`g${f % 6}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} />
      </filter>
      <rect width={W} height={H} filter={`url(#g${f % 6})`} />
    </svg>
  );
};

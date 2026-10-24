import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, Center, H, ROLE_COLORS, SANS, SERIF, W, Words, clamp, prng, prog } from "../lib";

const STARS = (() => {
  const r = prng(9);
  return Array.from({ length: 900 }, () => ({ x: r() * W, y: r() * H, s: 0.8 + r() * 2.2, role: Math.floor(r() * 4), p: r() * 6.28 }));
})();

/** Local 0–105 (global 1185–1290). */
export const Everyone: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 105], [1.06, 1]);
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
        {STARS.map((s, i) => {
          const on = clamp((f - (s.x / W) * 30) / 20);
          const color = s.role === 3 ? C.gold : ROLE_COLORS[s.role];
          return <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={color} opacity={on * (0.55 + 0.4 * Math.sin(f / 7 + s.p))} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 760px 380px at 50% 50%, rgba(7,14,25,0.9), rgba(7,14,25,0))" }} />
      <Center>
        <Words text="Not one genius." at={4} out={105} size={78} color={C.muted} />
        <Words text="Not one lab." at={24} out={105} size={78} color={C.muted} />
        <Words text="Everyone." at={46} out={105} size={150} highlight={{ Everyone: C.gold }} style={{ marginTop: 10 }} />
      </Center>
    </AbsoluteFill>
  );
};

/** Local 0–180 (global 1290–1470). The playable simulation and where to find it. */
export const End: React.FC<{ simVideo: string }> = ({ simVideo }) => {
  const f = useCurrentFrame();
  const card = prog(f, 4, 26);
  const text = (d: number) => ({ opacity: prog(f, 16 + d, 18), transform: `translateY(${(1 - prog(f, 16 + d, 18)) * 20}px)` });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 50%, #15294a 0%, ${C.deep} 70%)` }}>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 222,
          width: 1060,
          height: 636,
          borderRadius: 22,
          overflow: "hidden",
          background: "#101e32",
          border: "1px solid #2c4562",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(169,217,245,0.06)",
          opacity: card,
          transform: `perspective(1800px) rotateY(${(1 - card) * 8 + 4}deg) translateX(${(1 - card) * -60}px)`,
        }}
      >
        <div style={{ height: 40, background: "#0c1828", display: "flex", alignItems: "center", gap: 9, paddingLeft: 18 }}>
          {["#ff6b5f", "#ffbd2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.8 }} />
          ))}
          <span style={{ marginLeft: 18, fontFamily: SANS, fontSize: 17, color: C.muted }}>Discovery Commons · simulation</span>
        </div>
        <OffthreadVideo src={staticFile(simVideo)} muted style={{ width: "100%", height: 596, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 1230, top: 250, width: 620 }}>
        <div style={{ ...text(0), fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: "0.26em", color: C.gold }}>
          OPEN SOURCE
        </div>
        <div style={{ ...text(4), fontFamily: SERIF, fontSize: 92, lineHeight: 1.02, color: C.cloud, marginTop: 18 }}>
          Discovery
          <br />
          Commons
        </div>
        <div style={{ ...text(10), fontFamily: SERIF, fontSize: 42, lineHeight: 1.2, color: C.ice, marginTop: 26 }}>
          We built a simulation.
          <br />
          Come play with it.
        </div>
        <div
          style={{
            ...text(18),
            marginTop: 48,
            display: "inline-block",
            padding: "16px 24px",
            borderRadius: 14,
            border: `1px solid ${C.gold}`,
            background: "rgba(255,210,122,0.08)",
            fontFamily: '"SF Mono", Menlo, monospace',
            fontSize: 25,
            color: C.cloud,
          }}
        >
          github.com/veiovi/discovery-commons
        </div>
      </div>
    </AbsoluteFill>
  );
};

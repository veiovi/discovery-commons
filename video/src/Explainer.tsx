import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile } from "remotion";
import { Grain } from "./lib";
import { Dark } from "./scenes/Dark";
import { Field } from "./scenes/Field";
import { Roles } from "./scenes/Roles";
import { Commons } from "./scenes/Commons";
import { End, Everyone } from "./scenes/Finale";

export const DURATION = 1470;
// Sound effects are optional local files (not redistributed with the repo); missing ones are skipped.
const HAVE = new Set(getStaticFiles().map((f) => f.name));
const MUSIC_AT = 84;

const SFX: { file: string; at: number; volume: number }[] = [
  { file: "glitch-1", at: 0, volume: 0.4 },
  { file: "glitch-2", at: 16, volume: 0.38 },
  { file: "impact-bass-1", at: 34, volume: 0.55 },
  { file: "glitch-3", at: 64, volume: 0.45 },
  { file: "sparkle", at: 92, volume: 0.35 },
  { file: "whoosh-cinematic", at: 222, volume: 0.35 },
  { file: "whoosh-short", at: 600, volume: 0.3 },
  { file: "pop", at: 606, volume: 0.25 },
  { file: "pop", at: 668, volume: 0.25 },
  { file: "pop", at: 730, volume: 0.25 },
  { file: "whoosh-short", at: 870, volume: 0.3 },
  { file: "chime", at: 1046, volume: 0.28 },
  { file: "impact-bass-2", at: 1231, volume: 0.45 },
  { file: "sparkle", at: 1296, volume: 0.3 },
];

export const Explainer: React.FC<{ simVideo: string }> = ({ simVideo }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={84}>
      <Dark />
    </Sequence>
    <Sequence from={84} durationInFrames={516}>
      <Field />
    </Sequence>
    <Sequence from={600} durationInFrames={270}>
      <Roles />
    </Sequence>
    <Sequence from={870} durationInFrames={315}>
      <Commons />
    </Sequence>
    <Sequence from={1185} durationInFrames={105}>
      <Everyone />
    </Sequence>
    <Sequence from={1290} durationInFrames={180}>
      <End simVideo={simVideo} />
    </Sequence>
    <Grain />
    <Sequence from={MUSIC_AT}>
      <Audio
        src={staticFile("music.m4a")}
        volume={(f) =>
          interpolate(f, [0, 30, 500, 1100, DURATION - MUSIC_AT - 50, DURATION - MUSIC_AT], [0, 0.5, 0.62, 0.8, 0.8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    {SFX.filter((s) => HAVE.has(`sfx/${s.file}.mp3`)).map((s, i) => (
      <Sequence key={i} from={s.at}>
        <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

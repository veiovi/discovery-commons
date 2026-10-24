import React from "react";
import { Composition } from "remotion";
import { DURATION, Explainer } from "./Explainer";
import { FPS, H, W } from "./lib";

export const Root: React.FC = () => (
  <Composition id="Explainer" component={Explainer} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ simVideo: "sim.mp4" }} />
);

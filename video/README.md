# The explainer video

A 49-second explainer for Discovery Commons, written as a [Remotion](https://www.remotion.dev) composition. Every frame is drawn in code: no stock footage, and the last scene is a recording of the simulation itself.

| Time | Scene |
|---|---|
| 0:00 | The fear: "AI ends the world." The screen dies. |
| 0:03 | The turn: one warm light. "What if intelligence stays open to everyone?" |
| 0:08 | Cheap as electricity. Every person on Earth gets a lab, and everyone explores. |
| 0:20 | Makers create, Explorers research, Verifiers verify. All of them count. |
| 0:29 | Everything flows into one shared Commons, which checks what's real and rewards whoever moves us all forward. |
| 0:39 | Not one genius. Not one lab. Everyone. |
| 0:43 | The simulation, open source. |

## Render it

```sh
cd video
npm ci
npm run render    # writes out/discovery-commons-explainer.mp4 (1920×1080, 30 fps; needs ffmpeg for the loudness pass)
npm run studio    # opens Remotion Studio to preview and edit
```

`public/sim.mp4` is a 7-second recording of the simulation at `/?embed=1&autoplay=1&speed=4&intro=0`, captured at 1920×1080. To refresh it, run the simulation (`npm run dev` in the repository root), record that URL, and replace the file.

## Credits

- Music: generated for this video with Google's Lyria RealTime.
- Sound effects: from [Pixabay](https://pixabay.com/sound-effects/) under the [Pixabay Content License](https://pixabay.com/service/license-summary/). They are not redistributed here. Put your own `glitch-1/2/3`, `impact-bass-1/2`, `sparkle`, `whoosh-cinematic`, `whoosh-short`, `pop` and `chime` MP3s in `public/sfx/` to hear them; any missing file is skipped.
- Remotion is free for individuals and small teams; larger companies need a [company license](https://www.remotion.dev/license) to render it themselves.

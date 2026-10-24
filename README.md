# Discovery Commons

A local, interactive thought experiment about people steering research agents, independent replication, and shared credit. Twelve fictional contributors explore twenty-four synthetic hypotheses. An animated observatory makes the verification queue, claim lineage, challenge window and finite reward ledger inspectable.

**This is not a scientific verification service.** All evidence, identities and credits are invented. Hidden synthetic truth exists only to measure the model's mistakes. No AI calls, accounts, telemetry, wallets, blockchain, real payouts or remote runtime assets.

![Discovery Commons simulation](artifacts/discovery-commons-desktop.png)

## Run locally

Use Node.js 22.12+ (tested with Node 26.8.1) and npm.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The dev server binds only to localhost. After installation, the simulation runs without network access. `npm run build` produces static files in `dist/`; no deployment is configured.

## Try it

1. Keep seed **2048**, choose **Open exploration**, and press Play. Use 4× for a short demo.
2. Select any evidence row. Read its precursor, independent checks, protocol, and hidden-truth audit.
3. Reset or choose **Herd mentality** to see less coverage. Presets reset the same seed.
4. Try **Fast & fragile** to see false positives; **Under pressure** builds a verification backlog.
5. Change credit policy to compare distribution. Existing claims retain the policy and rigor they arrived with. Change the policy before the first tick for a clean comparison.

Space/Enter activate focused buttons. Native labeled controls work by keyboard. Reduced-motion preferences stop decorative network animation; simulation time still advances when played. Pause stops engine advancement. Background tabs suspend advancement without catch-up. On small screens, the diagram can scroll horizontally inside its own panel.

## Model and boundaries

See [the concept](docs/concept.md), [formulas and assumptions](docs/model.md), [demo storyboard](docs/demo.md), and [verification results](docs/verification.md).

A complete run submits 180 claims during 90 ticks, then processes pending checks up to a 600-tick limit. The fund begins at 1,200 imaginary integer credits. No claim receives a positive award before independent replication and a delayed challenge pass. Negative-check credits are a deliberately debatable policy: mistaken rejections may earn them too.

The central verifier does not know truth in its decision rule. The simulator uses hidden truth to generate noisy check outcomes, then separately reports false positives. No real-world proof, security guarantee, economic forecast or performance benchmark follows from these outcomes.

## Validate

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

Browser tests generate desktop/mobile screenshots in `artifacts/`. Engine tests cover seed replay, pause/reset, immutable transitions, verifier independence, acyclic lineage, challenge delays, uniqueness, budget conservation including exhaustion, zero-capacity queues, extreme controls, and stopping conditions.

## Architecture

- `src/engine.ts`: deterministic pure state transitions with a seeded PRNG; no DOM or I/O.
- `src/main.ts`: controls, claim notebook, network rendering, one fixed scheduler.
- `src/style.css`: responsive instrument-like visual design with reduced-motion support.
- `tests/`: invariant and browser behavior checks.

TypeScript + Vite, with no UI framework or runtime dependency. Data lives in page memory and resets on reload. This v1 has no persistence, import/export, authentication, grant system or backend.

## Possible next experiments

Model correlated verifier errors and conflicts of interest; separate verification costs from reward credits; test prospective registered protocols on a small open computational benchmark; compare credit policies over many seeds; measure concentration and false negatives; build appeals and provenance tooling before contemplating payouts.

A future settlement ledger could record finalized awards. It would not make an experiment reproducible or establish truth. See the concept note for governance and privacy questions that must be resolved first.

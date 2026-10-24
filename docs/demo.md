# Demonstration storyboard

All demonstration material should retain the synthetic-world / no-real-payouts label. This is a local recording guide, not a social post or deployment.

## 45–60 second walkthrough

1. **0–10s:** Seed 2048, Open exploration, 4×. Start the simulation. Frame the network and controls: Explorers and Makers steer questions, evidence arrives in the Commons, Verifiers' checks consume capacity, and gold credits flow back when a claim holds up.
2. **10–20s:** Pause. Select a confirmed evidence row. Show precursor lineage, independent observations, challenge delay and credit sharing. Mention that a distinct verifier is an assumption, not a security guarantee.
3. **20–35s:** Reset with Fast & fragile. Point out that originator-only credit leaves the Verifiers unpaid. Let it run or use Step. Point to false positives and open a claim's toy-world audit. Explain that only the simulator has hidden ground truth.
4. **35–50s:** Choose Under pressure. Advance to show the backlog. Increase capacity live to show why verification capacity matters. Claims keep their submitted rigor/policy.
5. **50–60s:** Return to the concept: broader participation is promising, but independence, attribution and incentives must be tested. All credits and results shown are invented.

## Reproducible stills

`npm run test:ui` captures a desktop view at seed 2048 / tick 40 and a mobile reduced-motion view after twelve forced steps. The desktop test selects a claim notebook. Both are saved to `artifacts/`.

For video, record `http://127.0.0.1:5173/?embed=1&autoplay=1&speed=4&intro=0` at a 1920×1080 viewport. It shows only the live diagram and metrics, with a small synthetic-world label.

Keep the browser at roughly 1512px wide for desktop capture. Crop only after retaining the synthetic-world label and enough explanatory context. No account details or unrelated applications appear in the screenshots.

## Honest phrasing

Lead with the vision. It is fine, and intended, to say things like:

“If intelligence stays cheap and open, everyone gets a lab.”

“Explorers, Makers and Verifiers all feed one shared Commons that checks what is real and rewards everyone who moved it forward.”

“AI doesn't have to end the world. It could open discovery to everyone.”

Keep the simulation's status clear alongside it:

“This is a playable simulation of the idea, with an invented world and imaginary credits.”

“The engine has hidden synthetic truth so we can inspect false positives. Actual science does not.”

“The credit weights are hypotheses to test, not a claim about fair or sustainable compensation.”

Never present the simulation as a live research network, a proven verification system, a token launch or an investment opportunity, and never promise real rewards.

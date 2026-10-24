# Verification record

Local checks on macOS with Node 26.8.1.

- TypeScript strict typecheck: passed.
- ESLint: passed.
- Vite production build: passed. Runtime JavaScript is approximately 27 KB before compression; no remote runtime assets.
- Engine: 16 tests passed, covering deterministic replay, pause/reset/repeated state controls, immutable state, all-policy accounting at budgets 0/1/7/40/1200, unique verifier identities, acyclic lineage, delayed payouts, negative-check policy, novelty uniqueness, capacity zero, clamped invalid values, protocol snapshots, preset differences, final-state idempotence, role behaviour (only Explorers and Makers author, claim kinds follow roles, Verifiers take most checks, all three roles earn under shared credit) and unpaid Verifiers under originator-only credit.
- Playwright: 4 browser tests passed. Controls, seeds, filters, policy/preset changes, parent inspection, paused clock, repeated reset, speed, browser errors, desktop layout, 390px mobile layout, native keyboard focus, reduced-motion animation, page overflow, the opening moment, autoplay, celebration toasts and the `embed`, `speed` and `seed` URL options checked.
- Desktop (1512px wide), mobile (390px wide) and embed (1920×1080) views inspected visually. No page-level horizontal overflow. The mobile network is intentionally horizontally scrollable, with an explicit cue and keyboard-focusable region.
- No browser runtime errors observed in the interaction tests.

## Reproducible seed 2048 reference outputs

Run each preset until completion, with no mid-run control changes:

| Scenario | Final tick | Coverage | Confirmed | False positives | Novel | Failed | Checks | Paid | Explorers | Makers | Verifiers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Open exploration | 95 | 24 | 99 | 0 | 24 | 81 | 535 | 1200 | 461 | 314 | 425 |
| Herd mentality | 95 | 11 | 99 | 0 | 5 | 81 | 535 | 1200 | 378 | 366 | 456 |
| Under pressure | 187 | 24 | 49 | 0 | 19 | 131 | 366 | 1200 | 351 | 329 | 520 |
| Fast & fragile | 95 | 23 | 74 | 13 | 26 | 106 | 275 | 1200 | 724 | 476 | 0 |

All finish with zero queued and zero held claims. Every person earns credit in the three shared-lineage presets; under Fast & fragile (originator-only) only the eight authors do. Novelty can exceed 24 because polarity is part of the key and false claims can be confirmed. Checks includes challenges. These numbers validate this implementation only; they are not scientific or economic findings.

## Limits of verification

Browser checks use Chromium, not every browser or assistive technology. Visual inspection covers the saved viewports. Formal contrast auditing, full screen-reader testing and independent security review have not been performed. Invariant coverage does not validate the invented probabilities or the fairness of the reward policy. No real data, payouts or adversary defences are exercised.

The repository includes a read-only-permission GitHub Actions workflow that repeats typecheck, lint, engine tests, build and browser tests. Check its actual state and run status in GitHub; this file does not assume that hosted runs are enabled or succeed.

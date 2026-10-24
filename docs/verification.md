# Verification record

Local checks completed 24 October 2026 on macOS / Node 26.8.1.

- TypeScript strict typecheck: passed.
- ESLint: passed.
- Vite production build: passed. Runtime JavaScript approximately 21 KB before compression; no remote runtime assets.
- Engine: 14 tests passed, covering deterministic replay, pause/reset/repeated state controls, immutable state, all-policy accounting at budgets 0/1/7/40/1200, unique verifier identities, acyclic lineage, delayed payouts, negative-check policy, novelty uniqueness, capacity zero, clamped invalid values, protocol snapshots, preset differences and final-state idempotence.
- Playwright: 3 browser tests passed. Controls, seeds, filters, policy/preset changes, parent inspection, paused clock, repeated reset, speed, browser errors, desktop layout, 390px mobile layout, native keyboard focus, reduced-motion animation and page overflow checked.
- Desktop (1512px wide) and mobile (390px wide) screenshots inspected visually. No page-level horizontal overflow. The mobile network is intentionally horizontally scrollable, with an explicit cue and keyboard-focusable region.
- No browser runtime errors observed in the interaction test.
- Dependency install audit reported no vulnerabilities at installation. This is not a security audit.

## Reproducible seed 2048 reference outputs

Run each preset until completion, with no mid-run control changes:

| Scenario | Final tick | Coverage | Confirmed | False positives | Novel | Failed | Checks | Paid |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Open exploration | 94 | 24 | 109 | 0 | 24 | 71 | 576 | 1200 |
| Herd mentality | 94 | 15 | 109 | 0 | 11 | 71 | 576 | 1200 |
| Under pressure | 188 | 24 | 48 | 0 | 21 | 132 | 369 | 1200 |
| Fast & fragile | 95 | 24 | 59 | 12 | 29 | 121 | 269 | 1200 |

All finish with zero queued and zero held claims. Novelty can exceed 24 because polarity is part of the key and false claims can be confirmed. Checks includes challenges. These numbers validate this implementation only; they are not scientific or economic findings.

## Limits of verification

Browser checks use Chromium, not every browser or assistive technology. Visual inspection covers the two saved viewports. Formal contrast auditing, full screen-reader testing and independent security review have not been performed. Invariant coverage does not validate the invented probabilities or fairness of the reward policy. No real data, payouts or adversary defenses are exercised.

The repository includes a read-only-permission GitHub Actions workflow that repeats typecheck, lint, engine tests, build and browser tests on main pushes and pull requests. Its actual run status should be checked in GitHub; this file does not assume future runs succeed.

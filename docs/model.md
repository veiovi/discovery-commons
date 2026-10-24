# Model specification

These are invented simulation parameters, not empirical estimates. They are intentionally legible rather than realistic.

## Randomness and lifecycle

A 32-bit linear congruential generator advances as `x = (1664525*x + 1013904223) mod 2^32`, then returns `x/2^32`. The seed is coerced to an unsigned 32-bit integer. Initial truth for each of 24 fictional hypotheses is sampled as `U < 0.7`. It is fixed for the run. No cryptographic security is intended.

Every tick processes up to `capacity` check operations, prioritizing mature challenges, then FIFO replication work. A single claim can consume multiple slots in one tick. Two new submissions arrive per tick through tick 90. Their author is sampled from twelve equally likely people; their agent direction is implicit in the sampled hypothesis. A run ends when submissions close and the queue drains, or at tick 600. Zero capacity therefore ends with unresolved claims. No unresolved claim is silently confirmed.

Diversity `d` means a `d/100` chance of sampling any of 24 topics; otherwise one of three fashionable topics is sampled. An honest submission flips the hidden truth with probability `noise/100`. A malicious submission always asserts its opposite. Malicious contributions occur with probability `malicious/100`; they also increase the chance of a misleading check signal under weak rigor. This is an aggregate adversarial proxy, not a sybil, plagiarism or collusion detector.

A precursor is the latest earlier submission on the same topic, regardless of validity or polarity. This is an intentionally simplistic attribution rule that can reward poor precursors. It is not evidence of causal contribution. The graph is acyclic because parents always have lower IDs. The UI lets users traverse the direct-parent chain.

## Verification

Each claim snapshots rigor `r` and reward policy when submitted. Replications required: `1 + floor(r/30)` (1–4 over the slider range). Every required observation must pass. A failed check immediately rejects the claim. This is a conjunction of observations, not a vote or posterior probability.

Verifiers are randomly selected without replacement from contributors other than the author. A different verifier checks the challenge. Unique identities stand in for independence; they do not guarantee separate data, software, methods or institutions in reality. Reused precursors can have authored earlier claims, including by the same originator.

If an assertion agrees with hidden truth, a check passes with probability:

`p(pass | correct) = 0.96 - 0.0004*r`

If it contradicts hidden truth:

`p(pass | incorrect) = 0.30 - 0.0025*r + (malicious ? 0.12*(1-r/100) : 0)`

The slightly lower true-positive pass rate at high rigor deliberately illustrates false-negative costs. Check draws are independent conditional on the simulated claim. Real correlated errors can make this assumption dangerously optimistic.

After successful replications, a claim becomes provisional until `current tick + 4`. The next available capacity slot performs an additional independent challenge check. Pass confirms it; failure marks it challenged. No positive credit is reserved or paid before this check. This toy challenge is automatic and probabilistic; it does not represent an actual open dispute process. Capacity can delay it beyond four ticks.

## Credit and accounting

Novelty is true for the first **confirmed** claim with a given topic and assertion polarity. Thus there are at most 48 novelty slots, including potentially incorrect claims. Requested reward: 40 credits for novel confirmation, 12 for repeat confirmation. Later evidence does not revoke already paid credits in v1. False positives can be paid because the verifier does not consult the audit oracle.

Shared lineage weights:

- Originator: 50.
- Direct precursor's author: 20 if a precursor exists.
- Successful replicators and challenger: 30 divided equally among them.

Weights are normalized over available recipients; without a precursor, the 50 and 30 weights sum to 80. They are not always literal percentages. If the same person has multiple roles, their payments aggregate. Each role except the last receives a floored integer share; the last receives the remainder. This rounding creates a small ordering bias, documented rather than disguised.

Under originator-only policy, 100% goes to the originator. Under shared policy, a failed replication or challenge requests 3 credits for its verifier as a negative finding. This can pay for mistaken rejection; there is no truth-oracle veto. There is no negative-finding reward under originator-only policy.

Every award is `min(requested amount, remaining fund)`. Total requested parts are apportioned to that capped award. The initial 1,200-credit fund is conserved exactly:

`remaining + sum(person balances) = initial fund = remaining + sum(all payment entries)`

A depleted fund stops payments, not verification. This creates arrival-order advantage; mature challenge priority and FIFO processing are policy assumptions, not neutrality claims. There are no real payouts and no verifier operating costs in this version.

## Controls, interpretation and limitations

Capacity changes processing immediately. Diversity/noise/malice changes future submissions. Rigor/policy affect newly submitted claims only. Presets reset the run; reset preserves current settings and seed. Speed changes wall-clock pacing, never the sequence of transitions. The interface uses one scheduler, with background-tab suspension.

Same seed plus the same sequence of controls and steps gives exact replay. Changes that alter check processing also change PRNG consumption, so comparisons are not matched causal trials. Use many seeds or independent random streams for serious policy comparison.

Queue counts queued/checking claims; held counts provisional claims. Replications includes challenge observations, and therefore is a check-operation count. False positives counts confirmed assertions that contradict hidden truth, even if no budget remained to pay them. Coverage counts topics ever submitted. Novel advances counts model novelty, which can include false positives. The UI exposes the hidden-truth audit only as a demonstration diagnostic.

Not implemented: actual research agents, real protocols/data, scientific novelty search, correlated errors, identity checks, plagiarism detection, appeals, consent workflow, causal credit assignment, verification-cost accounting, external settlement, or durable provenance. The checks are not calibrated scientific probabilities.

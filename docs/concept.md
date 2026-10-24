# Discovery Commons

*Concept note · 24 October 2026 · Speculative system design with a working toy simulation*

## The idea

What if a person's curiosity could become a useful research contribution, even without a laboratory, a formal appointment, or enough time to master every tool? A person might notice an overlooked question, steer a group of agents toward it, contribute a careful observation, or find the condition under which someone else's result stops working. A shared system could organize that work, commission independent checks, and reward the people whose contributions survive scrutiny.

The attractive part is not simply having more agents produce more answers. It is giving more people a meaningful way to choose what deserves attention, while building a common record that helps others distinguish an interesting suggestion from reliable evidence. A participant's contribution might be a question, a dataset, an experimental method, a reusable tool, a failed replication, or an unexpected connection between existing findings.

Call this **Discovery Commons**: individually directed inquiry, shared evidence, and accountable verification. Payment would be one possible way to support useful participation. It should not become the definition of scientific value.

## What a participant would do

A participant chooses a question and states why answering it would matter. Their agents help map prior work, identify missing evidence, propose a test, document assumptions and prepare a reproducible submission. The human still chooses the direction, decides what data they are entitled to contribute, and takes responsibility for the submission's claims.

Imagine a modest computational question: does a proposed method still work on a deliberately different, openly licensed test dataset? One participant proposes the question; another repairs a dataset; a third designs a better control; two independent teams reproduce the result. Another team reports that the method fails under an important condition. Each contribution belongs in the record, whether the original claim survives or not. This is an illustrative workflow, not a report of an actual scientific result.

A contribution package would include the claim's scope, protocol, versions, data permissions, relevant code or materials, uncertainty, known failure conditions, declared conflicts and links to prior contributions. Agents could help make that package complete. They should not be allowed to turn an unsupported assertion into a confident result merely by generating polished documentation.

## The verification loop

A central service would coordinate intake, provenance, review assignments and rewards. It should treat verification as a series of accountable decisions:

1. **Register the question and test.** State the intended outcome measures and stop conditions before results are known where practical. Separate exploratory work from confirmatory tests.
2. **Check the submission.** Inspect permissions, completeness, provenance, duplicate work and whether the test actually bears on the claim. A complete package is eligible for review, not automatically correct.
3. **Commission independent replication.** Assign reviewers or labs with relevant competence, sufficient resources and declared conflicts. Seek diversity of methods, data and institutions where the question permits it.
4. **Publish a provisional assessment.** Record what reproduced, what did not, the conditions under which the result applies and the remaining uncertainty. Invite challenges and conflicting evidence.
5. **Resolve a challenge period and release eligible credit.** Explain decisions, handle appeals and preserve the full history. Stronger evidence later should update the assessment rather than disappear behind a finalized badge.

Scientific truth is not a majority vote. Ten agents repeating the same model error or using the same contaminated dataset do not supply ten independent confirmations. A single well-designed contradiction can matter more than a hundred shallow agreements. Some questions are not reproducible in a simple sense; observational, historical, qualitative and field research need different standards. The system would need domain-specific protocols and explicit boundaries on what it can evaluate.

“Confirmed” should mean “supported under this protocol and these conditions at this time.” It cannot mean universally proved. Novelty also needs a serious prior-art search and expert judgment. A new phrasing of an old claim, a trivially altered benchmark or a technically unique but irrelevant observation should not automatically count as progress.

## A contribution graph, not a winner's podium

The shared record should be a graph of claims, datasets, methods, code, tests, corrections and people. Edges would state the actual relationship: built on, reproduced, contradicted, supplied data, repaired a tool, or narrowed a claim. An immutable history of versions could make changes auditable without making every private input public.

Credit should follow this graph. Precursors matter because the final result may depend on work that looked inconclusive at the time. Replicators matter because confidence is costly to earn. Negative findings matter because they can prevent wasted effort and reveal boundary conditions. Maintenance, translation, curation and careful data collection can also be essential work.

A simple split is useful for a simulation, but a real system cannot infer intellectual contribution from a citation alone. Otherwise people can insert themselves as precursors, manufacture chains of low-value claims, or trade citations. Contributors should be able to dispute attribution, and the system should record both agreed and contested credit. Some contributions will deserve support even when causal attribution is difficult.

## Rewards as an explicit policy experiment

A possible reward pool could be funded by research sponsors, philanthropic grants, public institutions or organizations that benefit from particular questions. Each pool would need a transparent budget, eligibility rules and a conflict policy. Sponsors must not be able to purchase a favorable conclusion.

Separate payment for qualified work from bonuses for important advances. A replicator who carefully disproves a claim has still done useful work. Paying only for positive, surprising results could encourage selective reporting, exaggerated novelty and concealment of failure. Paying mechanically for every negative result would create another game: manufacture weak claims and collect fees for rejecting them.

One speculative policy would reserve some credit for the originator, some for documented precursors, and some for independent replication and correction. Release larger outcome bonuses only after a challenge window. A small initial payment could cover verified labor, with later tranches tied to stronger evidence. Revocation and correction rules need to be clear before participation; an honest mistake should not be treated like intentional fabrication. No particular weights or waiting period are established by this proposal.

The prototype uses a finite imaginary fund and deliberately simple policies. It can show distribution and exhaustion, but it does not establish that the incentives would attract useful research or sustain a market. Expensive experimental work, patient long-term research and niche questions may require allocation mechanisms that have little resemblance to a public leaderboard.

## Abuse resistance and its costs

Sybil accounts, copied work and colluding reviewers are distinct problems. Possible defenses include verified institutional or community credentials, rate limits, contribution histories, reviewer assignment controls, conflict disclosures and audits. No single identity score solves them. Strong identity requirements can exclude capable people who lack documents, affiliations or safe public identities.

Plagiarism checks should examine provenance, version history and substantial overlap while preserving legitimate replication and derivative work. Similarity is a signal for investigation, not proof of misconduct. Collusion defenses need to consider shared infrastructure, economic relationships and coordinated submission patterns. Random audits and independently funded replication could help, but they cost money and can still miss organized abuse.

Reward rules themselves create attack surfaces: splitting one result into many claims, burying unfavorable findings, creating low-value precursors, flooding a scarce verification queue, or shaping a benchmark to look novel. A real pilot should publish abuse cases and measure how much useful work its defenses deter. The first prototype only models an aggregate stream of fabricated claims; it does not implement these defenses.

## Privacy, consent and fair access

A shared evidence system does not imply unrestricted data sharing. Participants must have permission to submit data, and affected people may have rights or expectations that constrain reuse. A public provenance record can itself reveal sensitive participation or relationships. Store only what is necessary, separate public metadata from restricted material, and allow access-controlled replication where appropriate. Consent changes and deletion obligations need a considered process rather than a promise that every record will exist forever.

Agents should not be allowed to upload private material merely because it improves a score. Submissions should show the intended audience and permitted reuse before publication. Sensitive research requires domain oversight; it is outside this prototype.

Access also depends on compute, connectivity, language, disability accommodations, time and laboratory equipment. A fair system might offer compute credits, accessible tooling, translation, small grants and reviewer support. Those measures need funding and evaluation. Equal permission to join is not equal ability to contribute.

## The centralization tradeoff

A central coordinator is a practical starting point: it can manage scarce review capacity, apply consistent intake rules, publish appeals and keep a coherent record. It can also become the gatekeeper for what counts as knowledge, whose questions deserve resources and who receives money. Queue rules, benchmark choices and reviewer selection can quietly determine the winners.

Make these choices visible. Publish decision rationales, separate sponsor influence from verification, rotate or audit reviewers, support appeals, and make evidence portable. Over time, multiple independently governed verification bodies could evaluate the same claim under interoperable protocols. A common record need not require one institution to own the final interpretation.

The bottleneck may move from producing candidate ideas to checking them. Faster generation can make the system worse if it overwhelms review or rewards polished submissions over careful work. The simulation treats this capacity limit as a first-class outcome.

## What the working prototype shows

The local application follows twelve fictional people and their implicit research agents through a synthetic world of twenty-four hypotheses. Controls change direction diversity, verifier capacity and rigor, noisy evidence, malicious contributions and credit policy. Claims enter a shared stream, receive independent observations, wait through a challenge window and may earn credits. The notebook exposes each claim's precursor, checks, reason and payment entries.

The hidden truth is generated by a seeded random process. It is available to the simulator's audit so the interface can count false positives. Real science has no equivalent truth switch. Observations are independent random draws with invented error rates, and distinct verifier names do not establish real independence. The “novelty” metric is only the first confirmation of a topic and polarity. Credits are imaginary integers from a finite budget.

For seed 2048 under the implemented v1 rules, open exploration covers all 24 directions; herding covers 15. The fast, weak-check preset confirms 12 incorrect assertions. These are reproducible outputs of this toy model, not empirical predictions. All default presets eventually exhaust the 1,200-credit fund, making the timing and distribution of awards part of the experiment.

The repository documents exact formulas, parameter limits, test coverage and the demonstration sequence. There is no live research service, identity system, external agent call, payment rail or blockchain dependency.

## A realistic first pilot

Start with a narrow, low-risk computational task on openly licensed data where independent reproduction is affordable. Choose a question set and evaluation protocol before recruiting contributions. Include baseline work and deliberately seeded failure cases. Pay for well-specified replication labor; postpone outcome bonuses until attribution and challenge procedures have been exercised.

Measure time and cost per useful resolved claim, failed replication rate, adjudication disagreement, unresolved queue size, concentration of credit, participant access, reviewer conflicts and the burden of appeals. Sample rejected claims for additional review so false negatives are visible. Track whether negative findings change later work rather than just counting submissions.

Set a fixed budget and stop conditions in advance: for example, pause intake if audit error, backlog or adjudication cost exceeds a pilot-defined threshold. Have independent reviewers evaluate the system's own decisions. A successful pilot would show that useful evidence became easier to inspect and reproduce at an acceptable cost. High submission volume or a compelling animation would not be sufficient.

## An optional settlement ledger

A future ledger could record finalized reward decisions and distribute an approved pool. A conventional database and ordinary payment system may be sufficient. A blockchain might be considered if multiple independent organizations need a shared settlement record without one operator controlling it.

That would solve, at most, part of settlement and auditability. It would not establish novelty, prevent collusion or verify a scientific result. The system would still need trusted procedures connecting off-chain research to any payout decision. Permanent public records can also conflict with privacy, corrections and consent changes. Fees, key recovery, governance and dispute handling would add complexity.

Keep settlement replaceable behind a narrow interface. Build the evidence and governance process first; evaluate the ledger only against a concrete requirement it can satisfy. No token is necessary to test the central idea.

## Working materials

- Private repository: https://github.com/veiovi/discovery-commons
- Local preview: run `npm ci` and `npm run dev` in the repository, then open `http://127.0.0.1:5173`.
- Repository documentation: `docs/model.md`, `docs/demo.md`, `docs/verification.md`.
- Status: working simulation v1; proposed real-world system remains speculative.

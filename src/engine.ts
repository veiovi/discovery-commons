export type Policy = "shared" | "originator";
export type Config = {
  diversity: number;
  capacity: number;
  rigor: number;
  noise: number;
  malicious: number;
  policy: Policy;
};
export const presets: Record<string, Config> = {
  "Open exploration": {
    diversity: 85,
    capacity: 7,
    rigor: 70,
    noise: 15,
    malicious: 5,
    policy: "shared",
  },
  "Herd mentality": {
    diversity: 10,
    capacity: 7,
    rigor: 70,
    noise: 15,
    malicious: 5,
    policy: "shared",
  },
  "Under pressure": {
    diversity: 80,
    capacity: 2,
    rigor: 85,
    noise: 45,
    malicious: 30,
    policy: "shared",
  },
  "Fast & fragile": {
    diversity: 85,
    capacity: 10,
    rigor: 10,
    noise: 45,
    malicious: 30,
    policy: "originator",
  },
};
export const people = [
  "Ada",
  "Noor",
  "Ivo",
  "Mika",
  "Sol",
  "Eli",
  "Ren",
  "Luz",
  "Kit",
  "Uma",
  "Bo",
  "Ari",
];
export const domains = [
  "Energy",
  "Materials",
  "Ecology",
  "Computation",
  "Water",
  "Sensing",
];
export type Check = {
  verifier: number;
  pass: boolean;
  kind: "replication" | "challenge";
  tick: number;
};
export type Claim = {
  id: number;
  author: number;
  topic: number;
  assertion: boolean;
  truth: boolean;
  malicious: boolean;
  parent?: number;
  created: number;
  required: number;
  rigor: number;
  policy: Policy;
  checks: Check[];
  status:
    | "queued"
    | "checking"
    | "provisional"
    | "confirmed"
    | "rejected"
    | "challenged";
  reason: string;
  until?: number;
  novelty: boolean;
  paid: number;
};
export type Payment = {
  claim: number;
  person: number;
  amount: number;
  role: "originator" | "precursor" | "replicator" | "negative finding";
  tick: number;
};
export type State = {
  seed: number;
  rng: number;
  tick: number;
  running: boolean;
  config: Config;
  claims: Claim[];
  world: boolean[];
  payments: Payment[];
  balances: number[];
  remaining: number;
  initialBudget: number;
  checks: number;
  submitted: number;
  exhausted: boolean;
};
export const SUBMISSION_END = 90;
export const MAX_TICKS = 600;
const bounded = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
export function normalize(c: Config): Config {
  return {
    diversity: bounded(c.diversity, 0, 100),
    capacity: Math.round(bounded(c.capacity, 0, 12)),
    rigor: bounded(c.rigor, 0, 100),
    noise: bounded(c.noise, 0, 100),
    malicious: bounded(c.malicious, 0, 100),
    policy: c.policy === "originator" ? "originator" : "shared",
  };
}
function random(s: State) {
  s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
export function createState(
  seed = 2048,
  config = presets["Open exploration"],
  budget = 1200,
): State {
  const s: State = {
    seed: seed >>> 0,
    rng: seed >>> 0,
    tick: 0,
    running: false,
    config: normalize(config),
    claims: [],
    world: [],
    payments: [],
    balances: people.map(() => 0),
    remaining: Math.floor(bounded(budget, 0, 1000000)),
    initialBudget: Math.floor(bounded(budget, 0, 1000000)),
    checks: 0,
    submitted: 0,
    exhausted: false,
  };
  s.world = Array.from({ length: 24 }, () => random(s) < 0.7);
  return s;
}
export function setRunning(s: State, running: boolean): State {
  return { ...s, running: running && !s.exhausted };
}
export function configure(s: State, patch: Partial<Config>): State {
  return { ...s, config: normalize({ ...s.config, ...patch }) };
}
export function reset(s: State): State {
  return createState(s.seed, s.config, s.initialBudget);
}
function pay(
  s: State,
  c: Claim,
  parts: { person: number; weight: number; role: Payment["role"] }[],
  requested: number,
) {
  const amount = Math.min(requested, s.remaining);
  if (!amount) return;
  const total = parts.reduce((a, p) => a + p.weight, 0);
  let left = amount;
  parts.forEach((p, i) => {
    const share =
      i === parts.length - 1 ? left : Math.floor((amount * p.weight) / total);
    left -= share;
    if (share) {
      s.payments.push({
        claim: c.id,
        person: p.person,
        amount: share,
        role: p.role,
        tick: s.tick,
      });
      s.balances[p.person] += share;
    }
  });
  c.paid += amount;
  s.remaining -= amount;
}
function reward(s: State, c: Claim) {
  c.novelty = !s.claims.some(
    (x) =>
      x.id !== c.id &&
      x.status === "confirmed" &&
      x.topic === c.topic &&
      x.assertion === c.assertion,
  );
  const amount = c.novelty ? 40 : 12;
  if (c.policy === "originator") {
    pay(s, c, [{ person: c.author, weight: 1, role: "originator" }], amount);
    return;
  }
  const parent = s.claims.find((x) => x.id === c.parent);
  const reps = c.checks.filter((x) => x.pass);
  pay(
    s,
    c,
    [
      { person: c.author, weight: 50, role: "originator" },
      ...(parent
        ? [{ person: parent.author, weight: 20, role: "precursor" as const }]
        : []),
      ...reps.map((x) => ({
        person: x.verifier,
        weight: 30 / reps.length,
        role: "replicator" as const,
      })),
    ],
    amount,
  );
}
function check(s: State, c: Claim, kind: Check["kind"]) {
  const used = new Set([c.author, ...c.checks.map((x) => x.verifier)]);
  const eligible = people.map((_, i) => i).filter((i) => !used.has(i));
  const verifier = eligible[Math.floor(random(s) * eligible.length)];
  // Hidden truth generates observations; it never directly decides acceptance.
  const correct = c.assertion === c.truth;
  const falseSignal =
    0.3 - 0.0025 * c.rigor + (c.malicious ? 0.12 * (1 - c.rigor / 100) : 0);
  const pass = random(s) < (correct ? 0.96 - 0.0004 * c.rigor : falseSignal);
  c.checks.push({ verifier, pass, kind, tick: s.tick });
  s.checks++;
  if (!pass) {
    c.status = kind === "challenge" ? "challenged" : "rejected";
    c.reason =
      kind === "challenge"
        ? "Independent challenge failed; provisional credit cancelled."
        : "Replication failed; evidence does not meet the threshold.";
    if (c.policy === "shared")
      pay(s, c, [{ person: verifier, weight: 1, role: "negative finding" }], 3);
    return;
  }
  if (kind === "challenge") {
    c.status = "confirmed";
    c.reason =
      "Required independent replications and delayed challenge passed. This remains a model decision.";
    reward(s, c);
    return;
  }
  if (c.checks.length >= c.required) {
    c.status = "provisional";
    c.until = s.tick + 4;
    c.reason =
      "Replication threshold met. Reward held for a four-tick challenge window.";
  } else {
    c.status = "checking";
    c.reason = `${c.checks.length} of ${c.required} independent replications passed; more evidence required.`;
  }
}
export function step(input: State, force = false): State {
  if ((!input.running && !force) || input.exhausted) return input;
  const s = structuredClone(input);
  s.tick++;
  // Mature challenges receive capacity before new replication jobs.
  const eligible = () =>
    s.claims
      .filter(
        (c) => c.status === "provisional" && (c.until ?? Infinity) <= s.tick,
      )
      .concat(
        s.claims.filter(
          (c) => c.status === "queued" || c.status === "checking",
        ),
      );
  for (let i = 0; i < s.config.capacity; i++) {
    const c = eligible()[0];
    if (!c) break;
    check(s, c, c.status === "provisional" ? "challenge" : "replication");
  }
  if (s.tick <= SUBMISSION_END) {
    for (let i = 0; i < 2; i++) {
      const author = Math.floor(random(s) * people.length);
      const explore = random(s) < s.config.diversity / 100;
      const topic = explore
        ? Math.floor(random(s) * 24)
        : Math.floor(random(s) * 3);
      const malicious = random(s) < s.config.malicious / 100;
      const noisy = random(s) < s.config.noise / 100;
      const assertion = malicious
        ? !s.world[topic]
        : noisy
          ? !s.world[topic]
          : s.world[topic];
      const parent = s.claims.filter((c) => c.topic === topic).at(-1)?.id;
      s.claims.push({
        id: ++s.submitted,
        author,
        topic,
        assertion,
        truth: s.world[topic],
        malicious,
        parent,
        created: s.tick,
        required: 1 + Math.floor(s.config.rigor / 30),
        rigor: s.config.rigor,
        policy: s.config.policy,
        checks: [],
        status: "queued",
        reason: "Awaiting independent replication capacity.",
        novelty: false,
        paid: 0,
      });
    }
  }
  if (
    (s.tick > SUBMISSION_END &&
      !s.claims.some((c) =>
        ["queued", "checking", "provisional"].includes(c.status),
      )) ||
    s.tick >= MAX_TICKS
  ) {
    s.exhausted = true;
    s.running = false;
  }
  return s;
}
export function metrics(s: State) {
  const confirmed = s.claims.filter((c) => c.status === "confirmed");
  return {
    confirmed: confirmed.length,
    falsePositives: confirmed.filter((c) => c.assertion !== c.truth).length,
    novel: confirmed.filter((c) => c.novelty).length,
    queue: s.claims.filter((c) => ["queued", "checking"].includes(c.status))
      .length,
    held: s.claims.filter((c) => c.status === "provisional").length,
    rejected: s.claims.filter((c) =>
      ["rejected", "challenged"].includes(c.status),
    ).length,
    coverage: new Set(s.claims.map((c) => c.topic)).size,
    paid: s.initialBudget - s.remaining,
    checks: s.checks,
  };
}
export function title(c: Claim) {
  return `${domains[Math.floor(c.topic / 4)]} / hypothesis ${String(c.topic + 1).padStart(2, "0")}`;
}

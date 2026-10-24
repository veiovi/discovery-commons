import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  step,
  setRunning,
  reset,
  configure,
  metrics,
  presets,
  people,
  roles,
  roleTotals,
  type State,
} from "../src/engine";
function run(s = createState(), ticks = 160) {
  for (let i = 0; i < ticks; i++) s = step(s, true);
  return s;
}
function accounting(s: State) {
  assert.equal(
    s.remaining + s.balances.reduce((a, b) => a + b, 0),
    s.initialBudget,
  );
  assert.equal(
    s.payments.reduce((a, b) => a + b.amount, 0),
    s.initialBudget - s.remaining,
  );
  for (let i = 0; i < people.length; i++)
    assert.equal(
      s.balances[i],
      s.payments
        .filter((p) => p.person === i)
        .reduce((a, p) => a + p.amount, 0),
    );
  assert.ok(
    s.payments.every((p) => Number.isInteger(p.amount) && p.amount > 0),
  );
  assert.ok(s.remaining >= 0);
}
test("same seed and settings reproduce every observation and payment", () =>
  assert.deepEqual(run(), run()));
test("different seeds produce different evidence", () =>
  assert.notDeepEqual(run(createState(1)), run(createState(2))));
test("paused steps are no-ops and repeated play never changes engine time", () => {
  let s = createState();
  assert.equal(step(s), s);
  s = setRunning(setRunning(s, true), true);
  assert.equal(s.tick, 0);
  s = step(s);
  assert.equal(s.tick, 1);
  s = setRunning(setRunning(s, false), false);
  assert.equal(step(s), s);
});
test("reset restores seed, settings and full budget without retaining lineage", () => {
  const s = run(configure(createState(7), { capacity: 3 }));
  assert.deepEqual(reset(s), createState(7, s.config));
});
test("immutable transitions do not modify input", () => {
  const s = createState();
  const before = structuredClone(s);
  step(s, true);
  assert.deepEqual(s, before);
});
test("all policies conserve integer budgets across every tick including tiny funds", () => {
  for (const policy of ["shared", "originator"] as const)
    for (const budget of [0, 1, 7, 40, 1200]) {
      let s = createState(12, { ...presets["Fast & fragile"], policy }, budget);
      for (let i = 0; i < 160; i++) {
        s = step(s, true);
        accounting(s);
      }
    }
});
test("replication and challenge identities are distinct and exclude originator; lineage is acyclic", () => {
  const s = run();
  for (const c of s.claims) {
    assert.ok(c.parent === undefined || c.parent < c.id);
    assert.equal(
      new Set(c.checks.map((x) => x.verifier)).size,
      c.checks.length,
    );
    assert.ok(c.checks.every((x) => x.verifier !== c.author));
    if (c.status === "confirmed") {
      assert.equal(c.checks.length, c.required + 1);
      assert.ok(c.checks.every((x) => x.pass));
      assert.equal(c.checks.at(-1)?.kind, "challenge");
      assert.ok(c.checks.at(-1)!.tick >= c.checks.at(-2)!.tick + 4);
    }
  }
});
test("positive rewards are delayed; failed checks only earn negative-finding credits", () => {
  const s = run();
  for (const p of s.payments) {
    const c = s.claims.find((c) => c.id === p.claim)!;
    if (p.role === "negative finding") {
      assert.ok(["rejected", "challenged"].includes(c.status));
      // A full 3 credits unless this payment emptied the fund.
      assert.ok(p.amount === 3 || (p.amount < 3 && s.remaining === 0));
    } else {
      assert.equal(c.status, "confirmed");
      assert.ok(p.tick >= (c.until ?? 0));
    }
  }
});
test("only one novel confirmed claim per hypothesis and polarity", () => {
  const s = run();
  const novel = s.claims.filter((x) => x.novelty);
  assert.equal(
    new Set(novel.map((x) => `${x.topic}-${x.assertion}`)).size,
    novel.length,
  );
});
test("capacity zero queues evidence without inventing checks or rewards, reaches safe stop", () => {
  const s = run(
    createState(1, { ...presets["Open exploration"], capacity: 0 }),
    700,
  );
  assert.equal(s.claims.length, 180);
  assert.equal(s.checks, 0);
  assert.equal(metrics(s).paid, 0);
  assert.equal(s.tick, 600);
  assert.equal(s.exhausted, true);
  assert.equal(step(s, true), s);
});
test("extreme values are clamped, invalid numbers are finite, no malformed identities", () => {
  const s = run(
    createState(0, {
      diversity: NaN,
      capacity: Infinity,
      rigor: -5,
      noise: 200,
      malicious: 100,
      policy: "shared",
    }),
    10,
  );
  assert.ok(
    Object.values(s.config).every(
      (v) => typeof v !== "number" || Number.isFinite(v),
    ),
  );
  assert.equal(s.config.noise, 100);
});
test("changing rigor and policy affects new claims without rewriting existing protocols", () => {
  let s = step(createState(), true);
  const original = structuredClone(s.claims);
  s = configure(s, { rigor: 0, policy: "originator" });
  s = step(s, true);
  assert.equal(s.claims[0].required, original[0].required);
  assert.equal(s.claims[0].policy, "shared");
  assert.equal(s.claims.at(-1)!.policy, "originator");
  assert.equal(s.claims.at(-1)!.required, 1);
});
test("preset outcomes visibly differ for the demonstration seed", () => {
  const a = metrics(run(createState(2048, presets["Open exploration"])));
  const b = metrics(run(createState(2048, presets["Herd mentality"])));
  const fast = metrics(run(createState(2048, presets["Fast & fragile"])));
  const pressure = metrics(
    run(createState(2048, presets["Under pressure"]), 90),
  );
  assert.ok(a.coverage > b.coverage);
  assert.ok(fast.falsePositives > a.falsePositives);
  assert.ok(pressure.queue > 20);
});
test("finished runs cannot restart or award twice", () => {
  const s = run(createState(), 600);
  assert.equal(s.exhausted, true);
  assert.equal(setRunning(s, true).running, false);
  assert.deepEqual(run(s, 50), s);
});
test("Explorers and Makers submit, Verifiers take most checks, and all three roles earn", () => {
  const s = run(createState(2048, presets["Open exploration"]), 600);
  for (const c of s.claims) {
    assert.notEqual(roles[c.author], "verifier");
    assert.equal(c.kind, roles[c.author] === "maker" ? "tool" : "finding");
  }
  const checks = s.claims.flatMap((c) => c.checks);
  const byVerifiers = checks.filter((x) => roles[x.verifier] === "verifier");
  assert.ok(byVerifiers.length / checks.length > 0.6);
  const totals = roleTotals(s);
  assert.ok(totals.explorer > 0 && totals.maker > 0 && totals.verifier > 0);
  assert.equal(
    totals.explorer + totals.maker + totals.verifier,
    s.initialBudget - s.remaining,
  );
});
test("originator-only policy leaves Verifiers without credit", () => {
  const s = run(createState(2048, presets["Fast & fragile"]), 600);
  assert.equal(roleTotals(s).verifier, 0);
});

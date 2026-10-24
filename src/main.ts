import "./style.css";
import {
  createState,
  step,
  reset,
  setRunning,
  configure,
  metrics,
  people,
  presets,
  domains,
  title,
  roles,
  roleNames,
  roleTotals,
  SUBMISSION_END,
  type Config,
  type Claim,
  type Role,
  type State,
} from "./engine";
// URL flags: ?autoplay=0|1&speed=1|2|4&seed=N&preset=Name&intro=0&embed=1
const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const embed = params.get("embed") === "1";
const autoplay = params.has("autoplay")
  ? params.get("autoplay") === "1"
  : !reducedMotion;
const showIntro = params.get("intro") !== "0" && !reducedMotion && !embed;
let activePreset =
  params.get("preset") && params.get("preset")! in presets
    ? params.get("preset")!
    : "Open exploration";
const seedParam = Number(params.get("seed"));
let state = createState(
  params.has("seed") && Number.isInteger(seedParam) && seedParam >= 0
    ? seedParam
    : 2048,
  presets[activePreset],
);
let selected = 1;
let speed = [1, 2, 4].includes(Number(params.get("speed")))
  ? Number(params.get("speed"))
  : 1;
let elapsed = 0;
let filter = "all";
let lastToast = 0;
let celebrated = false;
const roleColor: Record<Role, string> = {
  explorer: "#a9d9f5",
  maker: "#c3b8ff",
  verifier: "#8fe3c9",
};
const gold = "#ffd27a";
/** A role's glyph: Explorers are circles, Makers diamonds, Verifiers triangles. */
function glyph(role: Role, x: number, y: number, r: number, extra = "") {
  const fill = `fill="${roleColor[role]}" ${extra}`;
  if (role === "explorer")
    return `<circle cx="${x}" cy="${y}" r="${r}" ${fill}/>`;
  if (role === "maker")
    return `<path d="M${x} ${y - r * 1.25}L${x + r * 1.25} ${y}L${x} ${y + r * 1.25}L${x - r * 1.25} ${y}Z" ${fill}/>`;
  return `<path d="M${x} ${y - r * 1.2}L${x + r * 1.15} ${y + r * 0.85}L${x - r * 1.15} ${y + r * 0.85}Z" ${fill}/>`;
}
const icon = (role: Role, size = 10) =>
  `<svg class="glyph" width="${size}" height="${size}" viewBox="0 0 12 12" aria-hidden="true">${glyph(role, 6, 6, 4.4)}</svg>`;
const who = (i: number) => `${icon(roles[i])}${people[i]}`;
const roleList: Role[] = ["explorer", "maker", "verifier"];
const plural: Record<Role, string> = {
  explorer: "Explorers",
  maker: "Makers",
  verifier: "Verifiers",
};
const personY = (i: number) => 60 + i * 22 + Math.floor(i / 4) * 8;
const app = document.querySelector<HTMLDivElement>("#app")!;
document.body.classList.toggle("embed", embed);
app.innerHTML = `${showIntro ? '<div class="intro-film" aria-hidden="true"><p class="film-dark">Everyone says AI ends the world.</p><p class="film-light">What if it gives everyone a lab?</p></div>' : ""}<header><a class="brand" href="#"><span class="brand-mark">◈</span> Discovery Commons</a><span class="edition">A playable thought experiment</span><span class="simulation-tag">Synthetic world · imaginary credits · no real payouts</span></header>
<main><section class="intro"><div class="intro-copy"><p class="kicker">What if intelligence stays cheap and open to everyone?</p><h1>Everyone gets<br>a lab.</h1><p class="lede">Anyone can chase a question in any direction. Everything they find flows into one shared Commons that checks what is real, and rewards everyone who moved it forward.</p><a class="cta" href="#lab">Watch the Commons work ↓</a></div><ul class="roles-legend" aria-label="Three ways to contribute">${roleList
  .map(
    (r) =>
      `<li class="role-card ${r}">${icon(r, 22)}<div><strong>${plural[r]}</strong><span>${
        {
          explorer: "Chase questions and test hunches.",
          maker: "Build the tools, data and methods others stand on.",
          verifier: "Check what is real. A careful “no” earns credit too.",
        }[r]
      }</span></div></li>`,
  )
  .join(
    "",
  )}<li class="role-foot">Different strengths. One shared record. Everyone who helps gets a share.</li></ul></section>
<section id="lab" class="workspace" aria-label="Research simulation"><div class="toolbar"><div class="transport"><button id="play" class="primary">Play simulation</button><button id="step" title="Advance one tick">Step</button><button id="reset">Reset</button><label class="speed">Speed <select id="speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><div class="clock"><span id="run-status">Ready</span><span id="tick">Tick 000</span><label>Seed <input id="seed" type="number" min="0" max="4294967295" value="${state.seed}" aria-label="Simulation seed"></label></div></div>
<div class="lab-layout"><aside class="controls"><div class="section-heading"><h2>Conditions</h2><span>Change the world, then watch</span></div><label class="preset-label">Scenario<select id="preset"><option value="Custom conditions" disabled hidden>Custom conditions</option>${Object.keys(
  presets,
)
  .map((k) => `<option>${k}</option>`)
  .join(
    "",
  )}</select></label><div id="sliders"></div><label class="policy-label">Credit policy<select id="policy"><option value="shared">Share the lineage</option><option value="originator">Originator takes all</option></select></label><p class="control-note">Conditions apply immediately; rigor and policy are locked when each claim arrives. Presets reset the run.</p><div class="budget"><span>Shared reward fund</span><strong id="budget">1,200 <small>credits</small></strong><progress id="fund" max="1200" value="1200" aria-label="Remaining reward fund"></progress><p>Imaginary credits. No money moves.</p></div></aside>
<div class="observatory"><div class="pipeline-head"><h2>From curiosity to shared discovery</h2><span id="stage-summary">Start the flow or advance one step</span></div><div class="mobile-hint">Scroll the diagram to follow checks and rewards →</div><div class="network-wrap" tabindex="0" role="region" aria-label="Scrollable research pipeline"><svg id="network" viewBox="0 0 900 365" role="img" aria-label="Explorers and Makers send claims into the Commons, Verifiers check them independently, and a shared fund rewards everyone who contributed"><g id="net-base"></g><g id="net-fx"></g></svg><div class="toast" id="toast" aria-hidden="true"></div></div><div class="network-caption"><span>${icon("explorer")} Explorer</span><span>${icon("maker")} Maker</span><span>${icon("verifier")} Verifier</span><span><i class="dot violet"></i> Waiting</span><span><i class="dot mint"></i> Held up</span><span><i class="dot coral"></i> Failed a check</span><span><i class="dot gold"></i> Reward</span><span>Select any claim below</span></div><div class="metrics" id="metrics"></div><div class="experiment-note" id="experiment-note"></div></div></div>${embed ? '<p class="embed-tag">Discovery Commons · synthetic world · imaginary credits</p>' : ""}</section>
<section class="details"><div class="claims-panel"><div class="section-heading"><h2>Evidence stream</h2><label>Show <select id="filter"><option value="all">All claims</option><option value="confirmed">Confirmed</option><option value="provisional">Provisional</option><option value="rejected">Failed checks</option></select></label></div><div class="table-head"><span>Claim / direction</span><span>Checks</span><span>Decision</span></div><div id="claims" class="claim-list"></div></div><div class="inspector"><div class="section-heading"><h2>Claim notebook</h2><span id="claim-id">Awaiting evidence</span></div><div id="inspector"></div></div><div class="ledger"><div class="section-heading"><h2>Shared rewards</h2><span id="paid">0 awarded</span></div><div id="role-totals" class="role-totals"></div><div id="balances"></div><div class="ledger-foot" id="ledger-foot"></div></div></section>
<section id="method" class="method"><div><p class="kicker">Why it is careful, not just hopeful</p><h2>Verification is a process.<br>Certainty is not a feature.</h2></div><div class="method-copy"><p>This is a seeded toy world with 24 fictional hypotheses. The engine knows their truth so we can measure mistakes. Real science has no such oracle.</p><p>Explorers submit findings and Makers submit tools; Verifiers take most of the checks. Acceptance requires every assigned independent check to pass, followed by a four-tick challenge window and one more check. More rigor costs capacity. Agreement alone is not proof.</p><p>Shared credit rewards the originator, a direct precursor, the people who replicated it and the people who caught failures. Switch to “Originator takes all” and watch the Verifiers go unpaid. These weights are policy choices, not an economic forecast.</p><details><summary>Model boundaries & demonstration guide</summary><p>Run the same seed under Open exploration and Herd mentality to compare coverage. Try Fast & fragile for false positives, then Under pressure for a backlog. Each run submits 180 claims over 90 ticks, then drains the queue (600-tick ceiling). Reset restores the seed and current settings. No network requests, wallets, AI services or payments are used.</p><p>Different verifier IDs are only an independence assumption. This version does not implement identity, real protocols, plagiarism detection, correlated errors or appeals. Negative-check credits can reward mistaken rejections. See the repository documentation for formulas, limitations and pilot design.</p></details></div></section></main><footer><span>Discovery Commons / Everyone gets a lab</span><span>Open-source simulation · v0.1</span></footer><div class="sr-only" id="announcement" role="status" aria-live="polite"></div>`;
const sliders: {
  key: keyof Config;
  label: string;
  max: number;
  hint: string;
}[] = [
  {
    key: "diversity",
    label: "Direction diversity",
    max: 100,
    hint: "Herding → exploration",
  },
  {
    key: "capacity",
    label: "Verifier capacity",
    max: 12,
    hint: "Independent checks per tick",
  },
  {
    key: "rigor",
    label: "Verification rigor",
    max: 100,
    hint: "More checks, fewer false signals",
  },
  {
    key: "noise",
    label: "Noisy evidence",
    max: 100,
    hint: "Honest submissions with flipped claims",
  },
  {
    key: "malicious",
    label: "Malicious contributions",
    max: 100,
    hint: "Fabricated claims with persuasive signals",
  },
];
document.querySelector("#sliders")!.innerHTML = sliders
  .map(
    (x) =>
      `<label class="slider-label">${x.label}<output id="out-${x.key}"></output><input id="${x.key}" type="range" min="0" max="${x.max}" value="${state.config[x.key]}" aria-describedby="hint-${x.key}"><small id="hint-${x.key}">${x.hint}</small></label>`,
  )
  .join("");
const el = (id: string) => document.getElementById(id)!;
function syncControls() {
  for (const x of sliders) {
    (el(x.key) as HTMLInputElement).value = String(state.config[x.key]);
    el(`out-${x.key}`).textContent =
      String(state.config[x.key]) + (x.key === "capacity" ? "" : "%");
  }
  (el("policy") as HTMLSelectElement).value = state.config.policy;
}
function announce(message: string) {
  el("announcement").textContent = message;
}
function network() {
  const m = metrics(state);
  const colors = {
    queued: "#b9aff0",
    checking: "#a9d9f5",
    provisional: "#e6cd92",
    confirmed: "#96d6c5",
    rejected: "#ffb78d",
    challenged: "#ffb78d",
  };
  const confirmedNow = state.claims.some(
    (c) => c.status === "confirmed" && c.checks.at(-1)?.tick === state.tick,
  );
  const rewarded = new Set(
    state.payments
      .filter((p) => p.tick >= state.tick - 1 && p.tick > 0)
      .map((p) => p.person),
  );
  const paths = people
    .map((_, i) => {
      const y = personY(i);
      return roles[i] === "verifier"
        ? `<path class="flow-path verify-path" d="M 87 ${y} C 300 ${y}, 470 ${y}, 554 232"/>`
        : `<path class="flow-path" d="M 87 ${y} C 190 ${y}, 190 178, 316 178"/>`;
    })
    .join("");
  const groups = roleList
    .map(
      (r, g) =>
        `<text class="group-label ${r}" x="10" y="${personY(g * 4) + 4}" transform="rotate(-90 10 ${personY(g * 4) + 4})" text-anchor="end">${plural[r]}</text>`,
    )
    .join("");
  const totals = roleTotals(state);
  const maxTotal = Math.max(1, totals.explorer, totals.maker, totals.verifier);
  const claims = state.claims.slice(-24);
  el("net-base").innerHTML =
    `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#47627c" opacity=".32"/></pattern><radialGradient id="aura"><stop stop-color="#477b9b" stop-opacity=".25"/><stop offset="1" stop-color="#477b9b" stop-opacity="0"/></radialGradient><radialGradient id="goldglow"><stop stop-color="${gold}" stop-opacity=".55"/><stop offset="1" stop-color="${gold}" stop-opacity="0"/></radialGradient></defs><rect width="900" height="365" fill="url(#grid)"/><ellipse cx="365" cy="178" rx="225" ry="170" fill="url(#aura)"/>${confirmedNow ? '<circle class="commons-glow" cx="350" cy="178" r="95" fill="url(#goldglow)"/>' : ""}<g class="wires">${paths}<path class="flow-path" d="M 395 178 C 454 178 446 178 505 178"/><path class="flow-path" d="M 603 178 C 668 178 653 178 725 178"/></g><g class="svg-label"><text x="38" y="27">01  People choose directions</text><text x="282" y="27">02  The Commons</text><text x="489" y="27">03  Independent checks</text><text x="726" y="27">04  Shared rewards</text></g>${groups}${people
      .map((p, i) => {
        const y = personY(i);
        const big = state.claims.at(-1)?.author === i;
        return `<g>${rewarded.has(i) ? `<circle class="reward-ring" cx="77" cy="${y}" r="9" fill="none" stroke="${gold}" stroke-width="1.5"/>` : ""}${glyph(roles[i], 77, y, big ? 7 : 4.6)}<text class="person-label" x="62" y="${y + 4}">${p}</text></g>`;
      })
      .join(
        "",
      )}<circle class="orbit" cx="350" cy="178" r="82"/><circle class="orbit inner" cx="350" cy="178" r="55"/>${claims
      .map((c, i) => {
        const a = i * 2.399;
        const r = 45 + (i % 4) * 13;
        const x = 350 + Math.cos(a) * r;
        const y = 178 + Math.sin(a) * r;
        const size = c.id === selected ? 7 : 4;
        const shape =
          c.kind === "tool"
            ? `<path d="M${x} ${y - size * 1.2}L${x + size * 1.2} ${y}L${x} ${y + size * 1.2}L${x - size * 1.2} ${y}Z" fill="${colors[c.status]}">`
            : `<circle cx="${x}" cy="${y}" r="${size}" fill="${colors[c.status]}">`;
        return `${shape}<title>Claim ${c.id} (${c.kind}): ${c.status}</title>${c.kind === "tool" ? "</path>" : "</circle>"}`;
      })
      .join(
        "",
      )}<circle cx="350" cy="178" r="27" fill="#263c55" stroke="${confirmedNow ? gold : "#85a9c2"}"/><text class="node-value" x="350" y="184">${state.claims.length}</text><text class="node-desc" x="350" y="302">${m.coverage} / 24 directions explored</text><g transform="translate(505 128)"><rect width="98" height="100" rx="21" fill="#22364d" stroke="${roleColor.verifier}" stroke-opacity=".55"/><path d="M28 49l14 14 29-30" fill="none" stroke="${roleColor.verifier}" stroke-width="2"/><circle cx="49" cy="49" r="34" fill="none" stroke="#57758e" stroke-dasharray="3 6" class="check-ring"/></g><text class="node-desc" x="554" y="256">${m.queue} queued · ${m.held} held</text><text class="node-desc muted" x="554" y="278">No majority vote</text><g transform="translate(727 127)"><rect width="126" height="103" rx="5" fill="#22364d" stroke="${gold}" stroke-opacity=".5"/>${roleList.map((r, i) => `${glyph(r, 17, 27 + i * 25, 4)}<path d="M28 ${27 + i * 25}h${4 + Math.round((totals[r] / maxTotal) * 84)}" stroke="${roleColor[r]}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`).join("")}</g><text class="node-desc" x="790" y="256">${m.paid} credits shared</text><text class="node-desc muted" x="790" y="278">${totals.explorer && totals.maker && totals.verifier ? "All three roles rewarded" : "After the challenge window"}</text><text class="svg-bottom" x="38" y="352">${state.running ? "Evidence is moving" : "Simulation paused"} / seed ${state.seed}</text>`;
  el("network").classList.toggle("running", state.running);
}
/** Gold credits travel from the fund, through the Commons, back to each person. */
function flyRewards(people: number[]) {
  if (reducedMotion || document.hidden) return;
  const fx = el("net-fx");
  people.slice(0, 8).forEach((person, n) => {
    if (fx.childElementCount > 24) return;
    const y = personY(person);
    const ns = "http://www.w3.org/2000/svg";
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("r", "3.6");
    dot.setAttribute("fill", gold);
    dot.setAttribute("class", "reward-dot");
    dot.setAttribute("cx", "0");
    dot.setAttribute("cy", "0");
    const move = document.createElementNS(ns, "animateMotion");
    move.setAttribute(
      "path",
      `M 760 178 C 650 178 450 178 380 178 C 190 178, 190 ${y}, 88 ${y}`,
    );
    move.setAttribute("dur", "1.5s");
    move.setAttribute("begin", "indefinite");
    move.setAttribute("fill", "freeze");
    dot.append(move);
    fx.append(dot);
    window.setTimeout(
      () => (move as unknown as SVGAnimationElement).beginElement(),
      n * 90,
    );
    window.setTimeout(() => dot.remove(), 1700 + n * 90);
  });
}
function toast(message: string) {
  const t = el("toast");
  t.innerHTML = message;
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  lastToast = performance.now();
}
/** Celebrate what changed in one step: confirmations first, then a careful "no". */
function celebrate(before: State, after: State) {
  const fresh = after.claims.filter(
    (c) =>
      c.status === "confirmed" &&
      before.claims.find((x) => x.id === c.id)?.status !== "confirmed",
  );
  const newPayments = after.payments.slice(before.payments.length);
  if (newPayments.length)
    flyRewards([...new Set(newPayments.map((p) => p.person))]);
  if (fresh.length) {
    const c = fresh.at(-1)!;
    const payees = new Set(
      after.payments.filter((p) => p.claim === c.id).map((p) => p.person),
    ).size;
    const what = c.kind === "tool" ? "tool" : "finding";
    if (!celebrated) {
      celebrated = true;
      announce(
        `First discovery confirmed: ${people[c.author]}'s ${what} held up.`,
      );
    }
    if (performance.now() - lastToast > 1200 || c.novelty)
      toast(
        `<b>${c.novelty ? "Breakthrough!" : "It held up."}</b> ${who(c.author)}’s ${what} on ${domains[Math.floor(c.topic / 4)]} ${c.topic + 1} · ${payees ? `${payees} ${payees === 1 ? "person" : "people"} rewarded` : "the fund is empty"}`,
      );
    return;
  }
  const caught = newPayments.find((p) => p.role === "negative finding");
  if (caught && performance.now() - lastToast > 2600)
    toast(
      `<b>Caught it.</b> ${who(caught.person)} found a flaw · +${caught.amount} for a careful “no”`,
    );
}
function kindLabel(c: Claim) {
  return c.kind === "tool" ? "Tool" : "Finding";
}
function inspect() {
  const c = state.claims.find((c) => c.id === selected);
  el("claim-id").textContent = c
    ? `C${String(c.id).padStart(3, "0")}`
    : "Awaiting evidence";
  if (!c) {
    el("inspector").innerHTML =
      '<div class="empty"><span>◇</span><h3>Every claim has a story.</h3><p>Start the simulation, then select evidence to follow who found it, who built on it and who checked it.</p></div>';
    return;
  }
  const parent = state.claims.find((x) => x.id === c.parent);
  const payments = state.payments.filter((x) => x.claim === c.id);
  el("inspector").innerHTML =
    `<h3>${title(c)}</h3><p class="assertion"><span class="kind ${c.kind}">${kindLabel(c)}</span> ${c.kind === "tool" ? "A method whose result" : "Evidence that"} ${c.assertion ? "supports" : "does not support"} the fictional hypothesis</p><span class="status ${c.status}">${c.status}</span><p class="reason">${c.reason}</p><div class="lineage"><span>${parent ? `<button class="parent-link" data-claim="${parent.id}">C${parent.id} · ${who(parent.author)}</button>` : "Independent starting point"}</span><span class="lineage-arrow">↓ direct precursor</span><strong>C${c.id} · ${who(c.author)} <small class="role-name">${roleNames[roles[c.author]]}</small></strong><small>Submitted tick ${c.created} / ${c.required} replications required</small></div><h4>Independent observations</h4><ul class="checks">${c.checks.length ? c.checks.map((x) => `<li><span>${who(x.verifier)} <small>${x.kind} / t${x.tick}</small></span><b class="${x.pass ? "pass" : "fail"}">${x.pass ? "Pass" : "Fail"}</b></li>`).join("") : '<li class="subtle">Waiting for a verifier slot.</li>'}</ul><div class="truth"><strong>Toy-world audit</strong><span>${c.assertion === c.truth ? "Assertion matches" : "Assertion contradicts"} hidden synthetic truth.</span><small>${c.malicious ? "Generated as malicious." : "Generated as an honest contribution."} This audit is never an acceptance shortcut.</small></div><p class="subtle credit-detail">${c.paid} credits recorded · ${c.policy === "shared" ? "Shared lineage" : "Originator-only"} policy${payments.length ? "<br>" + payments.map((p) => `${who(p.person)} +${p.amount} (${p.role})`).join("<br>") : ""}</p>`;
}
function render() {
  const focusClaim = (document.activeElement as HTMLElement | null)?.dataset
    .claim;
  const m = metrics(state);
  el("play").textContent = state.running ? "Pause" : "Play simulation";
  (el("play") as HTMLButtonElement).disabled = state.exhausted;
  (el("step") as HTMLButtonElement).disabled = state.running || state.exhausted;
  el("run-status").textContent = state.exhausted
    ? "Run complete"
    : state.running
      ? "Running"
      : "Paused";
  el("tick").textContent = `Tick ${String(state.tick).padStart(3, "0")}`;
  el("budget").innerHTML =
    `${state.remaining.toLocaleString()} <small>credits</small>`;
  (el("fund") as HTMLProgressElement).value = state.remaining;
  el("stage-summary").textContent =
    state.tick > SUBMISSION_END
      ? "Submissions closed · draining verification queue"
      : `${activePreset} / ${SUBMISSION_END - state.tick} submission ticks left`;
  network();
  el("metrics").innerHTML = [
    ["Held up", m.confirmed, "Passed every independent check"],
    ["False positives", m.falsePositives, "Known only in this toy world"],
    ["Breakthroughs", m.novel, "First confirmed for a hypothesis"],
    ["Checks run", m.checks, "Replications and challenges"],
  ]
    .map(
      ([a, b, c]) =>
        `<div><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`,
    )
    .join("");
  const totals = roleTotals(state);
  el("experiment-note").innerHTML =
    `<span class="note-symbol">↳</span><p>${state.exhausted ? `Run ended. ${m.paid} credits went to ${state.balances.filter((b) => b > 0).length} of 12 people: Explorers ${totals.explorer}, Makers ${totals.maker}, Verifiers ${totals.verifier}. Reset or switch the credit policy to compare.` : m.queue > 20 ? `Verification is the bottleneck. ${m.queue} claims await checks; ideas arrive faster than they can be tested.` : m.falsePositives ? `${m.falsePositives} accepted claims contradict hidden truth. Passing checks does not make a claim infallible.` : m.coverage > 0 ? `${m.coverage} directions explored, ${m.rejected} claims failed a check. Rewards wait until the challenge window closes.` : "Twelve people, three strengths, one shared fund. Press Play to begin."}</p>`;
  const visible = state.claims
    .filter(
      (c) =>
        filter === "all" ||
        (filter === "rejected"
          ? ["rejected", "challenged"].includes(c.status)
          : c.status === filter),
    )
    .slice()
    .reverse();
  el("claims").innerHTML = visible.length
    ? visible
        .map(
          (c) =>
            `<button class="claim-row ${c.id === selected ? "selected" : ""}" data-claim="${c.id}" aria-pressed="${c.id === selected}"><span><b>C${String(c.id).padStart(3, "0")} <em>${domains[Math.floor(c.topic / 4)]} ${c.topic + 1}</em></b><small>${who(c.author)} · ${c.kind} · ${c.parent ? "builds on C" + c.parent : "new starting point"}</small></span><span class="check-count">${c.checks.filter((x) => x.pass).length}/${c.required + 1}</span><span class="status ${c.status}">${c.status}</span></button>`,
        )
        .join("")
    : '<div class="empty"><span>⌁</span><p>No claims in this view yet.</p></div>';
  inspect();
  if (focusClaim)
    document
      .querySelector<HTMLButtonElement>(`.claim-row[data-claim="${selected}"]`)
      ?.focus({ preventScroll: true });
  el("paid").textContent = `${m.paid} awarded`;
  el("role-totals").innerHTML = roleList
    .map(
      (r) =>
        `<div class="role-total ${r}">${icon(r, 12)}<span>${plural[r]}</span><b>${totals[r]}</b></div>`,
    )
    .join("");
  const max = Math.max(1, ...state.balances);
  el("balances").innerHTML = people
    .map(
      (p, i) =>
        `<div class="balance ${roles[i]}"><span>${icon(roles[i])}${p}</span><div><i style="width:${(state.balances[i] / max) * 100}%"></i></div><b>${state.balances[i]}</b></div>`,
    )
    .join("");
  const positive = state.balances.filter((x) => x > 0).length;
  el("ledger-foot").textContent =
    `${positive} / 12 people received credit${totals.explorer && totals.maker && totals.verifier ? ", across all three roles" : ""}. ${m.held} claims in the challenge window. ${state.remaining === 0 ? "Fund exhausted; verification continues." : "Budget conserved across every award."}`;
}
function advance() {
  const before = state;
  state = step(state, true);
  render();
  celebrate(before, state);
  if (state.exhausted)
    announce("Run complete. Every reward is recorded in the ledger.");
}
function restart() {
  state = reset(state);
  selected = 1;
  elapsed = 0;
  render();
  announce("Simulation reset with the same seed and current conditions.");
}
el("play").addEventListener("click", () => {
  state = setRunning(state, !state.running);
  elapsed = 0;
  render();
  announce(state.running ? "Simulation running" : "Simulation paused");
});
el("step").addEventListener("click", () => {
  if (!state.running) advance();
});
el("reset").addEventListener("click", restart);
el("speed").addEventListener("change", (e) => {
  speed = Number((e.target as HTMLSelectElement).value);
  elapsed = 0;
});
el("seed").addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement;
  const seed = Number(input.value);
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    input.value = String(state.seed);
    return;
  }
  state = createState(seed, state.config);
  selected = 1;
  elapsed = 0;
  render();
});
el("preset").addEventListener("change", (e) => {
  activePreset = (e.target as HTMLSelectElement).value;
  state = createState(state.seed, presets[activePreset]);
  selected = 1;
  elapsed = 0;
  syncControls();
  render();
  announce(`${activePreset} scenario loaded; run reset.`);
});
for (const x of sliders)
  el(x.key).addEventListener("input", (e) => {
    state = configure(state, {
      [x.key]: Number((e.target as HTMLInputElement).value),
    });
    activePreset = "Custom conditions";
    (el("preset") as HTMLSelectElement).value = activePreset;
    el(`out-${x.key}`).textContent =
      String(state.config[x.key]) + (x.key === "capacity" ? "" : "%");
    render();
  });
el("policy").addEventListener("change", (e) => {
  state = configure(state, {
    policy: (e.target as HTMLSelectElement).value as Config["policy"],
  });
  activePreset = "Custom conditions";
  (el("preset") as HTMLSelectElement).value = activePreset;
  render();
});
el("filter").addEventListener("change", (e) => {
  filter = (e.target as HTMLSelectElement).value;
  render();
});
app.addEventListener("click", (e) => {
  const button = (e.target as Element).closest<HTMLButtonElement>(
    "[data-claim]",
  );
  if (button) {
    selected = Number(button.dataset.claim);
    render();
  }
});
// One scheduler for the lifetime of the page. Repeated play/speed controls never add timers.
setInterval(() => {
  if (!state.running || document.hidden) return;
  elapsed += 100;
  if (elapsed >= 800 / speed) {
    elapsed = 0;
    advance();
  }
}, 100);
(el("speed") as HTMLSelectElement).value = String(speed);
(el("preset") as HTMLSelectElement).value = activePreset;
syncControls();
render();
function dismissIntro() {
  document.querySelector(".intro-film")?.remove();
}
if (showIntro) {
  window.setTimeout(dismissIntro, 3400);
  for (const type of ["pointerdown", "keydown", "wheel"])
    window.addEventListener(type, dismissIntro, { once: true, passive: true });
}
if (autoplay)
  window.setTimeout(
    () => {
      if (state.tick === 0 && !state.running) {
        state = setRunning(state, true);
        render();
      }
    },
    showIntro ? 2600 : 300,
  );

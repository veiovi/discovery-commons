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
  SUBMISSION_END,
  type Config,
} from "./engine";
let state = createState();
let selected = 1;
let speed = 1;
let elapsed = 0;
let filter = "all";
let activePreset = "Open exploration";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header><a class="brand" href="#"><span class="brand-mark">◈</span> Discovery Commons</a><span class="edition">Experimental systems / 001</span><span class="simulation-tag">Synthetic world · No real payouts</span></header>
<main><section class="intro"><div><p class="kicker">A laboratory for collective discovery</p><h1>Many questions.<br>Shared understanding.</h1><p class="lede">People choose a direction. Agents bring back evidence.<br>Independent checks decide what holds up.</p></div><div class="intro-aside"><span class="orbit-mark">✳</span><p>What would we discover<br>if everyone could contribute?</p><a href="#method">Explore the model ↓</a></div></section>
<section class="workspace" aria-label="Research simulation"><div class="toolbar"><div class="transport"><button id="play" class="primary">Play simulation</button><button id="step" title="Advance one tick">Step</button><button id="reset">Reset</button><label class="speed">Speed <select id="speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><div class="clock"><span id="run-status">Ready</span><span id="tick">Tick 000</span><label>Seed <input id="seed" type="number" min="0" max="4294967295" value="2048" aria-label="Simulation seed"></label></div></div>
<div class="lab-layout"><aside class="controls"><div class="section-heading"><h2>Conditions</h2><span>Change the experiment</span></div><label class="preset-label">Scenario<select id="preset"><option value="Custom conditions" disabled hidden>Custom conditions</option>${Object.keys(
  presets,
)
  .map((k) => `<option>${k}</option>`)
  .join(
    "",
  )}</select></label><div id="sliders"></div><label class="policy-label">Credit policy<select id="policy"><option value="shared">Share the lineage</option><option value="originator">Originator takes all</option></select></label><p class="control-note">Conditions apply immediately; rigor and policy are locked when each claim arrives. Presets reset the run.</p><div class="budget"><span>Finite research fund</span><strong id="budget">1,200 <small>credits</small></strong><progress id="fund" max="1200" value="1200" aria-label="Remaining research fund"></progress><p>Imaginary credits. No money moves.</p></div></aside>
<div class="observatory"><div class="pipeline-head"><h2>From curiosity to confidence</h2><span id="stage-summary">Start the flow or advance one step</span></div><div class="mobile-hint">Scroll the diagram to follow verification and credit →</div><div class="network-wrap" tabindex="0" role="region" aria-label="Scrollable research pipeline"><svg id="network" viewBox="0 0 900 365" role="img" aria-label="Research pipeline: twelve people contribute claims, independent checks test them, and a delayed ledger shares credit"></svg></div><div class="network-caption"><span><i class="dot blue"></i> Participant</span><span><i class="dot violet"></i> Pending evidence</span><span><i class="dot mint"></i> Confirmed</span><span><i class="dot coral"></i> Failed check</span><span>Inspect any claim below</span></div><div class="metrics" id="metrics"></div><div class="experiment-note" id="experiment-note"></div></div></div></section>
<section class="details"><div class="claims-panel"><div class="section-heading"><h2>Evidence stream</h2><label>Show <select id="filter"><option value="all">All claims</option><option value="confirmed">Confirmed</option><option value="provisional">Provisional</option><option value="rejected">Failed checks</option></select></label></div><div class="table-head"><span>Claim / direction</span><span>Checks</span><span>Decision</span></div><div id="claims" class="claim-list"></div></div><div class="inspector"><div class="section-heading"><h2>Claim notebook</h2><span id="claim-id">Awaiting evidence</span></div><div id="inspector"></div></div><div class="ledger"><div class="section-heading"><h2>Shared credit</h2><span id="paid">0 awarded</span></div><p class="subtle">Who benefits from the current policy?</p><div id="balances"></div><div class="ledger-foot" id="ledger-foot"></div></div></section>
<section id="method" class="method"><div><p class="kicker">Read the experiment carefully</p><h2>Verification is a process.<br>Certainty is not a feature.</h2></div><div class="method-copy"><p>This is a seeded toy world with 24 fictional hypotheses. The engine knows their truth so we can measure mistakes. Real science has no such oracle.</p><p>Acceptance requires every assigned independent check to pass, followed by a four-tick challenge window and one more check. More rigor costs capacity. Agreement alone is not proof.</p><p>Novelty means the first confirmed claim for a hypothesis and polarity, not real-world originality. Shared credit rewards originators, a direct precursor, replicators and failed checks. These weights are policy choices, not an economic forecast.</p><details><summary>Model boundaries & demonstration guide</summary><p>Run the same seed under Open exploration and Herd mentality to compare coverage. Try Fast & fragile for false positives, then Under pressure for a backlog. Each run submits 180 claims over 90 ticks, then drains the queue (600-tick ceiling). Reset restores the seed and current settings. No network requests, wallets, AI services or payments are used.</p><p>Different verifier IDs are only an independence assumption. This v1 does not implement identity, real protocols, plagiarism detection, correlated errors or appeals. Negative-check credits can reward mistaken rejections. See the repository documentation for formulas, limitations and pilot design.</p></details></div></section></main><footer><span>Discovery Commons / An idea in motion</span><span>Local simulation · v0.1</span></footer><div class="sr-only" id="announcement" role="status" aria-live="polite"></div>`;
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
  const paths = people
    .map((_, i) => {
      const y = 63 + i * 22;
      return `<path class="flow-path" d="M 87 ${y} C 190 ${y}, 190 178, 316 178"/>`;
    })
    .join("");
  const claims = state.claims.slice(-24);
  el("network").innerHTML =
    `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#47627c" opacity=".32"/></pattern><radialGradient id="aura"><stop stop-color="#477b9b" stop-opacity=".25"/><stop offset="1" stop-color="#477b9b" stop-opacity="0"/></radialGradient></defs><rect width="900" height="365" fill="url(#grid)"/><ellipse cx="365" cy="178" rx="225" ry="170" fill="url(#aura)"/><g class="wires">${paths}<path class="flow-path" d="M 395 178 C 454 178 446 178 505 178"/><path class="flow-path" d="M 603 178 C 668 178 653 178 725 178"/></g><g class="svg-label"><text x="38" y="27">01  Individual directions</text><text x="267" y="27">02  Shared evidence</text><text x="489" y="27">03  Independent checks</text><text x="726" y="27">04  Credit ledger</text></g>${people.map((p, i) => `<g><circle cx="77" cy="${63 + i * 22}" r="${state.claims.at(-1)?.author === i ? 8 : 5}" fill="#a9d9f5"/><text class="person-label" x="39" y="${67 + i * 22}">${p}</text></g>`).join("")}<circle class="orbit" cx="350" cy="178" r="82"/><circle class="orbit inner" cx="350" cy="178" r="55"/>${claims
      .map((c, i) => {
        const a = i * 2.399;
        const r = 45 + (i % 4) * 13;
        return `<circle cx="${350 + Math.cos(a) * r}" cy="${178 + Math.sin(a) * r}" r="${c.id === selected ? 7 : 4}" fill="${colors[c.status]}"><title>Claim ${c.id}: ${c.status}</title></circle>`;
      })
      .join(
        "",
      )}<circle cx="350" cy="178" r="27" fill="#263c55" stroke="#85a9c2"/><text class="node-value" x="350" y="184">${state.claims.length}</text><text class="node-desc" x="350" y="302">${m.coverage} / 24 directions explored</text><g transform="translate(505 128)"><rect width="98" height="100" rx="21" fill="#22364d" stroke="#a9d9f5" stroke-opacity=".55"/><path d="M28 49l14 14 29-30" fill="none" stroke="#a9d9f5" stroke-width="2"/><circle cx="49" cy="49" r="34" fill="none" stroke="#57758e" stroke-dasharray="3 6" class="check-ring"/></g><text class="node-desc" x="554" y="256">${m.queue} queued · ${m.held} held</text><text class="node-desc muted" x="554" y="278">No majority vote</text><g transform="translate(727 127)"><rect width="126" height="103" rx="5" fill="#22364d" stroke="#96d6c5" stroke-opacity=".5"/>${[0, 1, 2, 3].map((i) => `<path d="M15 ${23 + i * 19}h${18 + (state.balances[i] % 60)}" stroke="#96d6c5" stroke-width="4" opacity="${0.9 - i * 0.15}"/>`).join("")}<text class="ledger-plus" x="103" y="89">+</text></g><text class="node-desc" x="790" y="256">${m.paid} credits shared</text><text class="node-desc muted" x="790" y="278">After challenge window</text><text class="svg-bottom" x="38" y="343">${state.running ? "Evidence is moving" : "Simulation paused"} / seed ${state.seed}</text>`;
  el("network").classList.toggle("running", state.running);
}
function inspect() {
  const c = state.claims.find((c) => c.id === selected);
  el("claim-id").textContent = c
    ? `C${String(c.id).padStart(3, "0")}`
    : "Awaiting evidence";
  if (!c) {
    el("inspector").innerHTML =
      '<div class="empty"><span>◇</span><h3>A claim has a history.</h3><p>Start the simulation, then select evidence to follow its lineage and independent checks.</p></div>';
    return;
  }
  const parent = state.claims.find((x) => x.id === c.parent);
  const payments = state.payments.filter((x) => x.claim === c.id);
  el("inspector").innerHTML =
    `<h3>${title(c)}</h3><p class="assertion">${c.assertion ? "Supports" : "Does not support"} the fictional hypothesis</p><span class="status ${c.status}">${c.status}</span><p class="reason">${c.reason}</p><div class="lineage"><span>${parent ? `<button class="parent-link" data-claim="${parent.id}">C${parent.id} · ${people[parent.author]}</button>` : "Independent starting point"}</span><span class="lineage-arrow">↓ direct precursor</span><strong>C${c.id} · ${people[c.author]}</strong><small>Submitted tick ${c.created} / ${c.required} replications required</small></div><h4>Independent observations</h4><ul class="checks">${c.checks.length ? c.checks.map((x) => `<li><span>${people[x.verifier]} <small>${x.kind} / t${x.tick}</small></span><b class="${x.pass ? "pass" : "fail"}">${x.pass ? "Pass" : "Fail"}</b></li>`).join("") : '<li class="subtle">Waiting for a verifier slot.</li>'}</ul><div class="truth"><strong>Toy-world audit</strong><span>${c.assertion === c.truth ? "Assertion matches" : "Assertion contradicts"} hidden synthetic truth.</span><small>${c.malicious ? "Generated as malicious." : "Generated as an honest contribution."} This audit is never an acceptance shortcut.</small></div><p class="subtle credit-detail">${c.paid} credits recorded · ${c.policy === "shared" ? "Shared lineage" : "Originator-only"} policy${payments.length ? "<br>" + payments.map((p) => `${people[p.person]} +${p.amount} (${p.role})`).join("<br>") : ""}</p>`;
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
    ["Confirmed", m.confirmed, "Model decisions"],
    ["False positives", m.falsePositives, "Known only in this toy world"],
    ["Novel advances", m.novel, "First confirmed topic + polarity"],
    ["Replications", m.checks, "Includes challenge checks"],
  ]
    .map(
      ([a, b, c]) =>
        `<div><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`,
    )
    .join("");
  el("experiment-note").innerHTML =
    `<span class="note-symbol">↳</span><p>${state.exhausted ? `Run ended. ${m.queue} claims remain queued; ${m.held} provisional. Reset to explore another policy.` : m.queue > 20 ? `Verification is the bottleneck. ${m.queue} claims await checks; evidence arrives faster than it can be tested.` : m.falsePositives ? `${m.falsePositives} accepted claims contradict hidden truth. Passing checks does not make a claim infallible.` : m.coverage > 0 ? `${m.coverage} directions explored, ${m.rejected} claims failed a check. Credit is held until the challenge window closes.` : "A finite fund, fallible checks, and many possible directions. Press Play to begin."}</p>`;
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
            `<button class="claim-row ${c.id === selected ? "selected" : ""}" data-claim="${c.id}" aria-pressed="${c.id === selected}"><span><b>C${String(c.id).padStart(3, "0")} <em>${domains[Math.floor(c.topic / 4)]} ${c.topic + 1}</em></b><small>${people[c.author]} · ${c.parent ? "builds on C" + c.parent : "new starting point"}</small></span><span class="check-count">${c.checks.filter((x) => x.pass).length}/${c.required + 1}</span><span class="status ${c.status}">${c.status}</span></button>`,
        )
        .join("")
    : '<div class="empty"><span>⌁</span><p>No claims in this view yet.</p></div>';
  inspect();
  if (focusClaim)
    document
      .querySelector<HTMLButtonElement>(`.claim-row[data-claim="${selected}"]`)
      ?.focus({ preventScroll: true });
  el("paid").textContent = `${m.paid} awarded`;
  const max = Math.max(1, ...state.balances);
  el("balances").innerHTML = people
    .map(
      (p, i) =>
        `<div class="balance"><span>${p}</span><div><i style="width:${(state.balances[i] / max) * 100}%"></i></div><b>${state.balances[i]}</b></div>`,
    )
    .join("");
  const positive = state.balances.filter((x) => x > 0).length;
  el("ledger-foot").textContent =
    `${positive} / 12 people received credit. ${m.held} claims in the challenge window. ${state.remaining === 0 ? "Fund exhausted; verification continues." : "Budget conserved across every award."}`;
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
  if (!state.running) {
    state = step(state, true);
    render();
  }
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
    state = step(state);
    render();
  }
}, 100);
syncControls();
render();

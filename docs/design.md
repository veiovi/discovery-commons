# Visual direction

The page should feel like hope with a working instrument underneath. It opens on the vision (everyone gets a lab) and then lets a visitor watch it work: claims flow into the Commons, Verifiers check them, and gold credits travel back to everyone who helped.

## Story

On first load, a three-second opening echoes the explainer video: a dark line ("Everyone says AI ends the world.") flickers and gives way to light ("What if it gives everyone a lab?"). It never blocks input, any click or key dismisses it, and it is skipped under reduced motion or `?intro=0`. The simulation then starts playing on its own so the page is alive within seconds.

The hero leads with the claim and the three roles. The careful material (model boundaries, hidden-truth audit, challenge window) stays one scroll away, under "Why it is careful, not just hopeful".

## Roles and colour

Each role has a shape and a colour, used everywhere a person appears: the network, evidence stream, notebook and ledger.

- Explorers: circle, ice #a9d9f5.
- Makers: diamond, lavender #c3b8ff.
- Verifiers: triangle, mint #8fe3c9.

Shape carries the role as well as colour. Claims in the Commons are circles (findings) or diamonds (tools), coloured by status: violet waiting, ice checking, sand held for the challenge window, mint held up, apricot #ffb78d failed. Gold #ffd27a is reserved for rewards. Status is always also written, never colour alone.

Base palette: deep ocean #101e32, slate #263c55, cloud #edf3f8.

## Typography

Georgia for display headlines, suggesting an institution rather than a trading terminal. Avenir Next with sans-serif fallbacks for the interface. No remote fonts or other external assets.

## Motion and celebration

The network is the expressive element. Wires flow while the simulation runs. When a claim is confirmed, the Commons glows gold, a short toast names the person and how many people were rewarded ("Breakthrough!" for the first confirmation of a hypothesis), and gold credits fly back along the wires to each recipient, whose glyph gains a brief gold ring. When a Verifier's failed check earns credit, a toast thanks them for a careful "no". Toasts are visual only; the live region announces the first confirmation and the end of a run rather than every event.

All decorative motion stops under reduced motion. Pausing stops the engine.

## Layout

Wide screens show the hero and role cards side by side, then the lab: conditions on the left, the network and metrics on the right, and the evidence stream, notebook and ledger below. The ledger shows totals by role so "all three get rewarded" is visible at a glance. On small screens, role cards stack, controls form two columns and the network scrolls horizontally inside its own panel with an explicit cue. `?embed=1` shows only the network and metrics, sized for 1920×1080 recording.

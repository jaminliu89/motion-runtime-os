# Motion Art Direction Engine — V1

Status: ACTIVE

## Purpose
Motion Grammar answers **what visual behavior serves the story**. Art Direction answers **how that behavior should feel as a coherent film/design system**. Renderers still only execute.

Canonical chain:
`Director IR → MG Planner → MG Plan → Art Direction Profile → styled MG Plan → Motion IR → Provider`.

## Non-template rule
A profile is not a scene template and not a renderer preset. It supplies bounded design tokens and rhythm constraints that can be applied to any compatible grammar primitive without changing its narrative meaning.

## V1 profiles
### editorial_restraint
Humanistic/editorial. Warm paper-black palette, moderate type scale, long holds, sparse borders, low effect density. Best for documentary, philosophy, essays.

### precision_tech
Cold precision. Near-black surfaces, high-contrast neutral type, thin grid/borders, compact timing, data/UI emphasis. Best for AI/software/business explanation.

### kinetic_signal
Higher energy but controlled. Large numeric/type contrast, shorter entrances, directional interruption, stronger spatial hierarchy. Best for hooks, proof, contrast, payoff.

## Style dimensions
- palette: background, foreground, muted, panel, accent, danger;
- typography: hero/data/body sizes, weight, tracking, line height, max width;
- geometry: radius, border width, panel opacity, grid gap;
- rhythm: enter/exit multiplier, hold bias, stagger, camera push amount;
- intensity caps: max strong effects per segment, veil opacity, impact strength;
- data/diagram: stroke, node radius, chart gap, label scale;
- provenance: profile id/version must survive into Motion IR layers and Zhijian override evidence.

## Semantic invariants
Art Direction may change tokens, timing multipliers and layout density. It MUST NOT:
1. change `narrative_function`;
2. invent/remove attention targets;
3. turn high-restraint exposition into high-intensity animation;
4. replace a data/proof grammar with decorative motion;
5. leak provider-specific API into MG Plan or Motion IR.

## V1 quality gate
The same proof → contrast → reveal fixture must compile under all three profiles. Tests must prove semantic grammar identity while style tokens differ. At least `timeline`, `node_graph`, `document_highlight`, `browser_frame`, and `mask_reveal` must compile to provider-neutral Motion IR. Remotion and HyperFrames must each render one styled fixture without unsupported MG downgrade.

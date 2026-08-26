# Motion Canvas Provider Decision

Status: EXPERIMENTAL / NOT VERIFIED
Date: 2026-08-26

## Decision
Motion Canvas is valuable as a future specialist for diagram, vector explanation, causal graph, timeline and narration-synchronized procedural motion. It is **not** a V1 canonical automated renderer yet.

## Why
Its model is highly aligned with our MG grammar for information motion, but the currently documented render path is editor/browser oriented. Fully automated headless CLI rendering is not yet a sufficiently stable contract for us to mark a production Provider as verified.

## Boundary
- MG Planner and Motion IR remain provider-neutral.
- Do not leak Motion Canvas generator APIs into Motion IR.
- Do not add it to verified provider routing until CI renders a real source fixture without human UI interaction.
- FFmpeg image-sequence composition is allowed for an experimental adapter, but must be explicit evidence, not hidden fallback.

## Entry gate
Motion Canvas becomes VERIFIED only when one CI fixture proves:
1. same canonical MG Plan / Motion IR input;
2. diagram/data grammar compiled without semantic downgrade;
3. fully unattended render on Linux CI;
4. deterministic frame/video artifact;
5. source audio preserved or explicitly assembled with evidence;
6. media probe PASS;
7. provider result + provenance emitted.

Until then, HyperFrames + Remotion remain the verified local execution pair.

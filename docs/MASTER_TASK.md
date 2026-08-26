# Master Task

## Goal
跑通 Motion Runtime OS 的真实可执行闭环，并证明 Renderer/Provider 接口不是单样例假象；在此基础上建立无需付费 NLE 依赖的 Semantic Motion / MG Intelligence。

## Current Status
- [x] M1 Runtime contracts: Storyboard/SceneGraph/Timeline/MotionIR/RenderJob/ArtifactManifest/RenderResult
- [x] M2 Director skills and provider-neutral motion intent
- [x] M3a Remotion executable adapter
- [x] M3b HyperFrames executable adapter
- [x] M4 Render/media/audio/subtitle evidence
- [x] M5 Quality + Golden Baseline + visual regression
- [x] M6 Multi-example rendering
- [x] M7 Provider Independence: same Motion IR through Remotion + HyperFrames
- [x] M8/M9 Cross-provider semantic parity/QA for established Motion IR semantics
- [x] M10 Real Director bridge through Remotion + HyperFrames with source video/audio
- [x] M11 MG Plan v1: machine schema + composable grammar + restraint policy
- [x] M12 Semantic MG Planner: Director IR → differentiated proof/contrast/question/reveal/exposition grammar
- [x] M13 MG Plan → Motion IR compiler with source-video/subtitle lineage
- [x] M14 Generic Remotion Runtime executes MG typography/data/diagram/rhythm primitives (`number_counter`, `bar_chart`, `comparison`, `process_flow`, `veil`, `hero_text`, impact/camera)
- [x] M15 MG QA: grammar-family diversity, strong-effect density, exposition restraint, attention target and timing gates
- [x] M16 Real 20s A/B acceptance: pinned vertical human source → Neutral subtitle-only baseline + Directed MG → both MP4 → source audio preserved → artifact upload
- [x] M16b HyperFrames MG parity: same Directed Motion IR executes `bar_chart`, `comparison`, `process_flow`, `hero_text`, `number_counter`, `veil` with strict seek-safe lint and source audio
- [~] M17 Human blind preference: reproducible concealed A/B pack + scorer DONE; real reviewer votes / preference lift still pending
- [~] M18 Motion Canvas provider: product decision and entry gate DONE; provider remains EXPERIMENTAL until unattended headless CI is proven
- [ ] M19 Expand grammar execution: line charts, timelines, node graphs, document/UI motion, mask/morph transitions
- [~] M20 Zhijian MG takeover: MG provenance visible and preserved in Override Evidence; richer per-effect parameter controls remain

## Verified Evidence
- Provider Independence Phase 3 run `32926669799`: SUCCESS.
- Real Director→Remotion run `32926421757`: SUCCESS, artifact `9591739910`.
- Real Director→HyperFrames run `32926669798`: SUCCESS, artifact `9591815442`.
- MG Intelligence compiler/QA run `32965740388`: SUCCESS. Planner + compiler + schema + restraint/diversity QA + renderer build all PASS.
- Directed MG A/B run `32974061233`: SUCCESS.
  - Neutral and Directed 20s vertical MP4 both rendered locally and retained source audio;
  - concealed human-study package (`A.mp4`, `B.mp4`, `study.json`, `answer-key.json`, `votes.jsonl`) generated deterministically;
  - artifact `9608852317`, size ~118.4 MB, digest `sha256:57509aad783224d96dda01c81739058577f456f83437d3a10d277d6bc8f35621`.
- Directed MG HyperFrames Acceptance run `32974210663`: SUCCESS.
  - exact same MG Motion IR rendered through HyperFrames strict mode;
  - MG semantic mapping gate PASS with no MG/shape downgrade warnings;
  - source video/audio media probe PASS;
  - artifact `9608898870`, digest `sha256:b0ad4ca884a81b1c5b56b0b5796fa2856b7fe029aafe9279cfaec4ccdeedbcd9`.

## Product Decision
ChatCut is OPTIONAL_PROVIDER / BENCHMARK, not a release dependency. The verified local-first execution pair is now:
`Director IR → MG Planner → MG Plan/Motion Grammar → Motion IR → Remotion | HyperFrames → QA → Zhijian human takeover`.

Motion Canvas remains a future diagram/vector specialist, but is not allowed into the VERIFIED provider list until an unattended headless CI render passes its entry gate. See `docs/MOTION_CANVAS_PROVIDER_DECISION.md`.

The second technical risk is now closed: MG semantics are not Remotion-specific. The next hard quality gate is human preference, followed by expanding grammar breadth and style/art-direction quality.

## Constraints
- Renderer/provider never owns narrative meaning.
- No template-ID architecture; grammar is composable semantics.
- Do not animate every sentence; restraint is a first-class QA dimension.
- No paid-provider release dependency.
- No provider-specific JSX/API leakage into Motion IR.
- Render success alone is never quality DONE.
- Golden Baseline is approval-controlled.
- Provider Independence ≠ Semantic Equivalence ≠ Pixel Identity ≠ Human Preference; measure them separately.

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
- [x] M8/M9 Cross-provider semantic parity/QA for the established Motion IR semantics
- [x] M10 Real Director bridge through Remotion + HyperFrames with source video/audio
- [x] M11 MG Plan v1: machine schema + composable grammar + restraint policy
- [x] M12 Semantic MG Planner: Director IR → differentiated proof/contrast/question/reveal/exposition grammar
- [x] M13 MG Plan → Motion IR compiler with source-video/subtitle lineage
- [x] M14 Generic Remotion Runtime executes MG typography/data/diagram/rhythm primitives (`number_counter`, `bar_chart`, `comparison`, `process_flow`, `veil`, `hero_text`, impact/camera)
- [x] M15 MG QA: grammar-family diversity, strong-effect density, exposition restraint, attention target and timing gates
- [x] M16 Real 20s A/B acceptance: pinned vertical human source → Neutral subtitle-only baseline + Directed MG → both MP4 → source audio preserved → artifact upload
- [ ] M17 Human blind preference: Neutral vs Directed preference lift and qualitative failure tags
- [ ] M18 Motion Canvas provider: discovery → contract → real diagram/vector render → semantic comparison
- [ ] M19 Expand grammar execution: line charts, timelines, node graphs, document/UI motion, mask/morph transitions
- [ ] M20 Zhijian MG takeover: expose MG Plan/grammar provenance and per-effect override/edit controls

## Verified Evidence
- Provider Independence Phase 3 run `32926669799`: SUCCESS.
- Real Director→Remotion run `32926421757`: SUCCESS, artifact `9591739910`.
- Real Director→HyperFrames run `32926669798`: SUCCESS, artifact `9591815442`.
- MG Intelligence compiler/QA run `32965740388`: SUCCESS. Planner + compiler + schema + restraint/diversity QA + renderer build all PASS.
- Directed MG Real Media Acceptance run `32965688798`: SUCCESS.
  - pinned source SHA-256 verified;
  - semantic compilation produced data (`bar_chart`), comparison and reveal (`hero_text`) grammar;
  - Neutral and Directed 20s vertical MP4 both rendered locally;
  - both retained source audio according to ffprobe;
  - artifact ID `9605679296`, size ~59.2 MB, digest `sha256:0acf5fd570e63828ac521ba1bce36236a13fae6d3e0b40da6f8d9fa95aef042b`.

## Product Decision
ChatCut is OPTIONAL_PROVIDER / BENCHMARK, not a release dependency. The canonical local-first path is:
`Director IR → MG Planner → MG Plan/Motion Grammar → Motion IR → HyperFrames | Motion Canvas | Remotion → QA → Zhijian human takeover`.

The first technical risk is now closed: the stack can generate non-trivial MG locally on real footage without a paid ChatCut execution path. This does **not** yet prove the result is aesthetically superior; M17 human preference is the next hard quality gate.

## Constraints
- Renderer/provider never owns narrative meaning.
- No template-ID architecture; grammar is composable semantics.
- Do not animate every sentence; restraint is a first-class QA dimension.
- No paid-provider release dependency.
- No provider-specific JSX/API leakage into Motion IR.
- Render success alone is never quality DONE.
- Golden Baseline is approval-controlled.
- Provider Independence ≠ Semantic Equivalence ≠ Pixel Identity ≠ Human Preference; measure them separately.

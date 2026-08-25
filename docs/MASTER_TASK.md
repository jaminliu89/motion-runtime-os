# Master Task

## Goal
跑通 Motion Runtime OS 的真实可执行闭环，并证明 Renderer/Provider 接口不是单样例假象。

## Current Status
- [x] M1 Runtime contracts: Storyboard/SceneGraph/Timeline/MotionIR/RenderJob/ArtifactManifest/RenderResult
- [x] M2 Director skills: motion-director, motion-design, storyboard, timeline + supporting motion skills
- [x] M3a Remotion executable adapter: executable provider contract + Composition + CI render + RenderResult
- [x] M3b HyperFrames executable adapter: Motion IR → HyperFrames HTML → strict render → MP4 → RenderResult
- [x] M4a Render evidence: MP4 + artifact manifest + deterministic keyframe plan + PNG keyframes
- [x] M4b Audio/subtitle runtime evidence: subtitle renderer + audio track renderer + semantic sync + MP4 video/audio stream probe all pass CI
- [x] M5a Quality: IR validation, static QA, typecheck, executable provider contract conformance
- [x] M5b Real visual regression: Golden Baseline v1 approved; run #55 passes approved fingerprint regression for all 9 deterministic frames
- [x] M6a Example 1: 7s cinematic intro renders in CI
- [x] M6b Example 2: multi-scene fixture renders in CI and proves scene offset behavior
- [x] M7 Provider comparison: the same Motion IR executes successfully through Remotion and HyperFrames; Provider Independence is proven
- [~] M8 Semantic parity: implementation landed for blur-fade-rise, exit fade, directional light motion and camera push-in via HyperFrames seekable GSAP timeline; CI verification pending
- [~] M9 Cross-provider semantic QA: executable gate landed for timing, text/subtitle visibility, audio timing, motion intent and camera intent without requiring pixel identity; CI verification pending

## Verified Evidence
- Golden Baseline gate: GitHub Actions run #55 (`32886279334`) completed successfully using `mode: approved_fingerprint`, baseline `cinematic-intro-v1`; all 9 frames matched exact SHA-256 with Hamming distance 0.
- Provider Independence gate: GitHub Actions Provider Independence run #3 (`32887649705`) completed successfully.
- HyperFrames artifact: 7.0s H.264 video + AAC audio, media probe PASS.
- Provider comparison: `provider_independence_proven: true`, while the last verified run still predates Phase 3 semantic parity implementation.

## Phase 3 Implementation Landed
- HyperFrames compiler v0.3 maps `blur-fade-rise` using seekable GSAP opacity/y/filter animation.
- HyperFrames compiler maps title exit fade with a registered seekable timeline.
- HyperFrames compiler maps left→right light-cut with seekable xPercent motion.
- HyperFrames compiler maps `subtle-push-in` camera intent through stage scale animation.
- Compiler emits normalized `semantic_mappings` instead of silently dropping intent.
- `cross-provider-semantic-qa.mjs` verifies mapped semantics, subtitle/audio windows, runtime smoke and zero remaining compile warnings.
- Remotion RenderResult now emits semantic coverage as the reference provider so provider comparison can represent semantic equivalence correctly.

## Current Phase 3 Gate
`Same Motion IR → Remotion + HyperFrames → both artifacts PASS → zero semantic downgrade warnings → cross-provider semantic QA PASS → semantic equivalence evidence`

## Definition of Done
Provider Independence 已完成。Phase 3 只有在新的 CI 实际通过 HyperFrames strict render、media probe、provider comparison 和 cross-provider semantic QA 后，M8/M9 才能从 `[~]` 升为 `[x]`。不要求像素一致，但要求关键 motion semantics、时序、字幕、音频、镜头意图在多个 Provider 上达到可解释的一致性。

## Constraints
- 不把未来 Blender/Unreal 做进当前实现，只保留 adapter seam
- 不允许 provider-specific JSX/API 泄漏进 Motion IR
- 不允许 render success 直接标记质量 DONE
- 任何 schema 变更必须有 versioning/migration 说明
- 未真实运行的 Provider 不得标记 verified
- Golden Baseline 不得自动批准或被新渲染静默覆盖
- Provider Independence ≠ Semantic Equivalence ≠ Pixel Identity；三者必须分开度量

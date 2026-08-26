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
- [x] M8 Semantic parity: blur-fade-rise, exit fade, directional light motion and camera push-in are mapped in HyperFrames seekable GSAP timeline and verified in Provider Independence run #9
- [x] M9 Cross-provider semantic QA: timing, text/subtitle visibility, audio timing, motion intent and camera intent gate passes without requiring pixel identity in Provider Independence run #9
- [x] M10a Real Director bridge / Remotion: real human interview → AI Director Motion IR → source video+audio+subtitles → Remotion MP4 passes media probe
- [~] M10b Real Director bridge / HyperFrames: real video layer implementation landed; second-provider real-media CI verification in progress

## Verified Evidence
- Golden Baseline gate: GitHub Actions run #55 (`32886279334`) completed successfully using `mode: approved_fingerprint`, baseline `cinematic-intro-v1`; all 9 frames matched exact SHA-256 with Hamming distance 0.
- Provider Independence original gate: run #3 (`32887649705`) proved two executable providers.
- Provider Independence Phase 3 gate: run #9 (`32926669799`) completed SUCCESS including Remotion render, HyperFrames strict render, both media probes, provider comparison, Cross-provider Semantic QA and semantic evidence verification.
- Real AI Director upstream: `ai-director-engine` Real Media Acceptance run #7 (`32926244006`) completed SUCCESS using a pinned real public-domain human interview; Director Intent QA and Motion Runtime consumer contract both PASS.
- Real Director→Remotion downstream: Director Bridge Acceptance run #1 (`32926421757`) completed SUCCESS; exact accepted Motion IR rendered with the pinned source footage and final MP4 passed media-stream probe. Artifact ID `9591739910`.

## Phase 3 Closed
`Same Motion IR → Remotion + HyperFrames → artifacts PASS → zero semantic downgrade warnings → cross-provider semantic QA PASS → semantic equivalence evidence`

M8/M9 are now DONE based on run #9, not merely code presence.

## Current Gate
`Real human MP4 → AI Director Engine → Director IR → Motion IR → source-video layer → Remotion + HyperFrames → media-probed artifacts`

Remotion side is DONE. HyperFrames real-media side remains separate until its dedicated acceptance workflow succeeds.

## Constraints
- 不把未来 Blender/Unreal 做进当前实现，只保留 adapter seam
- 不允许 provider-specific JSX/API 泄漏进 Motion IR
- 不允许 render success 直接标记质量 DONE
- 任何 schema 变更必须有 versioning/migration 说明
- 未真实运行的 Provider 不得标记 verified
- Golden Baseline 不得自动批准或被新渲染静默覆盖
- Provider Independence ≠ Semantic Equivalence ≠ Pixel Identity；三者必须分开度量

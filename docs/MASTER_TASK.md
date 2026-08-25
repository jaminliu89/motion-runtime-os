# Master Task

## Goal
跑通 Motion Runtime OS 的真实可执行闭环，并证明 Renderer/Provider 接口不是单样例假象。

## Current Status
- [x] M1 Runtime contracts: Storyboard/SceneGraph/Timeline/MotionIR/RenderJob/ArtifactManifest
- [x] M2 Director skills: motion-director, motion-design, storyboard, timeline + supporting motion skills
- [x] M3a Remotion executable adapter: package, Composition, CI render
- [x] M4a Render evidence: MP4 + artifact manifest + deterministic keyframe plan
- [x] M5a Quality: IR validation, static QA, typecheck, provider contract conformance
- [x] M6a Example 1: 7s cinematic intro renders in CI
- [ ] M6b Example 2: multi-scene fixture renders in CI and proves scene offset behavior
- [ ] M5b Real visual regression: sample PNG frames + perceptual diff + approved baseline
- [ ] M3b HyperFrames runtime capability discovery + real adapter call
- [ ] M4b Audio/subtitle runtime evidence and sync QA
- [ ] M7 Provider comparison report from the same Motion IR

## Definition of Done
不是文档完成，而是至少两个不同结构的真实 examples 能：IR validate → provider compile/render → artifact evidence → QA。Provider Independence 只有在同一 IR 被第二 Provider 实际执行后才成立。

## Constraints
- 不把未来 Blender/Unreal 做进 MVP，只实现 adapter seam
- 不允许 provider-specific JSX/API 泄漏进 Motion IR
- 不允许 render success 直接标记 DONE
- 任何 schema 变更必须有 versioning/migration 说明
- 未真实运行的 Provider 不得标记 verified

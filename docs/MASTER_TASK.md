# Master Task

## Goal
跑通一个 7 秒 cinematic intro 的完整闭环，并保证 Provider 可替换。

## Phases
- M1 Runtime contracts: Storyboard/SceneGraph/Timeline/MotionIR/RenderJob schemas
- M2 Director skills: motion-director, motion-design, storyboard, timeline
- M3 Provider adapters: Remotion first, HyperFrames contract second
- M4 Render pipeline: assets/fonts/audio/subtitles/export
- M5 Quality: timing/layout/sync/visual regression/render validation
- M6 Example: intro + documentary title + short-video caption pack

## Definition of Done
不是文档完成，而是至少一个真实 example 能：输入 brief → 生成结构化 IR → 编译到 provider → render → QA → artifact evidence。

## Constraints
- 不把未来 Blender/Unreal 做进 MVP，只实现 adapter seam
- 不允许 provider-specific JSX/API 泄漏进 Motion IR
- 不允许 render success 直接标记 DONE
- 任何 schema 变更必须有 versioning/migration 说明
# Motion Runtime OS Consolidation Audit

## 已迁移/新建
- motion-director
- motion-design
- storyboard
- scene-graph
- timeline-design
- motion-layout
- remotion
- hyperframes
- render
- motion-qa
- subtitle-motion
- audio-sync
- asset-font-management
- format-adaptation
- motion-accessibility

## 核心机器协议
- Storyboard Schema
- Scene Graph Schema
- Timeline Schema
- Motion IR Schema
- Render Job Schema
- Runtime State Machine
- Provider Registry
- Adapter Contract
- Motion Quality Gate
- Motion IR Versioning
- Visual Regression / Golden tests

## 本次复盘补出的遗漏
1. Layout Engine：动画中的动态边界/碰撞/多画幅不能只靠静态设计。
2. Asset/Font Preflight：很多 render 漂移来自字体与远程素材，而非动画代码。
3. Audio/Subtitle 共用时间源：避免字幕、视觉、音乐各算一套时间。
4. UNKNOWN_OUTCOME：远程 Provider 状态未知时先查询，避免重复 render/计费。
5. Motion IR Versioning：Provider 可替换的前提是中间表示可迁移。
6. Visual Regression：render 成功无法发现视觉回归。
7. Accessibility / reduced motion：高频闪烁、阅读速度、运动强度需要独立约束。
8. Multi-format adaptation：9:16/16:9/1:1 不是简单裁切。
9. Provider capability discovery：HyperFrames 等远程能力不能靠静态记忆假设。
10. Golden examples：架构必须通过真实样片 fixture 验证，而不是只写文档。

## 有意后置
- Blender Adapter implementation
- Unreal/Game Engine Adapter implementation
- Three.js/WebGL Adapter implementation
- HyperFrames 真实 API/Plugin 调用验证（需安装/授权后做 capability discovery）
- 完整 Remotion 工程代码与真实 render（下一阶段 walking skeleton）

## 当前结论
仓库已经从“动画 Skill 集合”升级为 Motion Runtime：上层创意与下层 Provider 解耦。下一阶段唯一优先级是跑通 cinematic intro 的真实 Remotion walking skeleton，并让 HyperFrames 走同一 Motion IR contract。
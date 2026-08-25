# Motion Runtime OS

AI 动画与可编程视频统一运行时。目标不是绑定某个视频生成工具，而是把创意意图编译成可迁移的 Motion IR，再由 Remotion、HyperFrames、HTML/CSS/SVG、Three.js、Blender、游戏引擎等 Adapter 执行。

## 核心链路

`Creative Intent → Storyboard → Scene Graph → Timeline → Motion Spec / Motion IR → Provider Router → Render → Motion Quality Gate → Artifact`

## 核心原则

1. Remotion / HyperFrames 是执行后端，不是导演大脑。
2. Motion IR、Scene Graph、Timeline、Render Job 是稳定中间层。
3. 创意导演层与 Provider 解耦。
4. Render 成功不等于 Motion 成功；必须通过视觉、时序、字幕、音画同步和画幅 QA。
5. 所有 Provider 都实现统一 Adapter Contract。
6. 未来 Blender / Unreal / Three.js 只新增 Adapter，不重写上层导演逻辑。

## 目录

- `docs/` 产品、架构、Master Task、决策
- `runtime/` 状态机、Agent Loop、路由
- `schemas/` Motion IR / Storyboard / Scene Graph / Timeline / Render Job
- `skills/` 导演、动画设计、Remotion、HyperFrames、字幕、音频、渲染、QA
- `adapters/` Provider 契约和实现说明
- `quality/` Motion Quality Gate / Visual Regression / Render Validation
- `examples/` 片头、纪录片、短视频、TVC

## 与其他系统的关系

`Creator OS → AI Director Engine / Motion Runtime OS → SkillHub / Connector OS`

SkillHub 只保留轻量入口与索引；本仓库保存 Motion 专业 Runtime、Schema、Adapter、质量规范和示例。
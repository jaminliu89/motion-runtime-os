# Decision Log

## ADR-001 — Motion IR is the core IP
决定：上层导演/动画语义与 Remotion/HyperFrames 解耦。原因：Provider 会变化，创意结构和 Motion semantics 应稳定。

## ADR-002 — Remotion is first deterministic adapter
决定：Remotion 作为第一优先可编辑、可参数化、可重复渲染后端；不等于产品核心。

## ADR-003 — HyperFrames is a remote provider adapter
决定：首次运行必须 capability discovery；不支持特性显式降级或切换 Provider。

## ADR-004 — Render success is not Done
决定：所有输出经过 Motion Quality Gate；关键项目增加 visual regression/golden samples。

## ADR-005 — Blender / Unreal are future adapters
决定：当前只留 Adapter Contract，不扩大 MVP。

## ADR-006 — SkillHub keeps only lightweight routing
决定：Motion 专业 Schema/Runtime/Provider/Examples 归本仓库；SkillHub 只承担跨 Agent 能力发现与入口。
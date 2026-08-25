# Decision Log

## ADR-001 — Motion IR is the core IP
决定：上层导演/动画语义与 Remotion/HyperFrames 解耦。原因：Provider 会变化，创意结构和 Motion semantics 应稳定。

## ADR-002 — Remotion is first deterministic adapter
决定：Remotion 作为第一优先可编辑、可参数化、可重复渲染后端；不等于产品核心。

## ADR-003 — HyperFrames is a provider adapter
决定：HyperFrames 必须经过 capability discovery、strict compile/render、media probe 和 same-IR comparison 后才能标记 verified；不支持特性显式降级，禁止静默 drop。

## ADR-004 — Render success is not Done
决定：所有输出经过 Motion Quality Gate；关键项目增加 visual regression/golden samples。

## ADR-005 — Blender / Unreal are future adapters
决定：当前只留 Adapter Contract，不扩大 MVP。

## ADR-006 — SkillHub keeps only lightweight routing
决定：Motion 专业 Schema/Runtime/Provider/Examples 归本仓库；SkillHub 只承担跨 Agent 能力发现与入口。

## ADR-007 — Golden Baseline v1 uses reviewed visual fingerprints
决定：Cinematic Intro 的第一套 Golden Baseline 基于 GitHub Actions run #52 的 9 个 deterministic keyframes，经独立视觉审查后批准。仓库 canonical baseline 保存每帧 dimensions + SHA-256 + 64-bit perceptual average hash；CI 优先执行 fingerprint regression。若未来仓库包含 materialized Golden PNGs，则自动升级到 pixelmatch diff。

原因：Golden Baseline 必须是经过批准的历史真相，不能由当前 render 自动生成；同时 connector/CI 不应依赖二进制运输能力。Fingerprint baseline 保持小型、可审计、可版本化，并允许以后增加 PNG pixel diagnostics。

约束：任何 baseline 更新必须引用来源 run/commit/artifact digest、经过视觉审查并写入 Decision Log；禁止新 render 静默覆盖已批准 baseline。

## ADR-008 — Provider Independence is proven, Semantic Equivalence is separate
决定：GitHub Actions Provider Independence run #3 (`32887649705`) 已证明同一份 `examples/cinematic-intro/motion-ir.json` 可以由 Remotion 与 HyperFrames 0.8.12 两个真实执行后端分别产出通过 media probe 的 MP4，因此 Provider Independence 标记为 proven。

证据：HyperFrames 产物为 7.0s H.264 + AAC，media probe PASS；provider comparison 输出 `provider_independence_proven: true`。对应 evidence artifact digest 为 `sha256:c69e7ad0fd0372b06923f0c3a7ec99beda46837642a4e4c85ab8617670619bd0`。

边界：当前 comparison 同时输出 `semantic_equivalence_proven: false`，因为 HyperFrames compiler 仍显式报告 4 个 downgrade：`blur-fade-rise`、exit fade、directional light motion、camera push-in。下一阶段优化这些语义，但不会把 Provider Independence、Semantic Equivalence、Pixel Identity 混为一个指标。

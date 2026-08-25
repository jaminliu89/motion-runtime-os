# Motion Runtime MCP Contract

## 目标
把 Motion Runtime OS 暴露为模型无关的工具协议，而不是要求 Agent 直接理解某个 provider SDK。

## Core Tools
- `motion.plan`：Creative Brief → Storyboard + Motion IR draft
- `motion.validate_ir`：校验 Motion IR schema/version/capabilities
- `motion.resolve_provider`：根据能力、成本、时延、质量选择 provider
- `motion.compile`：Motion IR → provider-specific executable plan/code
- `motion.render`：提交 render job
- `motion.status`：读取真实 render/job 状态
- `motion.cancel`：取消可取消任务
- `motion.inspect`：读取帧、日志、metadata、warnings
- `motion.qa`：执行 Motion Quality Gate
- `motion.export`：导出 MP4/WebM/GIF/frames/project

## Resource URIs
- `motion://project/{id}`
- `motion://ir/{id}`
- `motion://render/{id}`
- `motion://artifact/{id}`
- `motion://provider/{name}`

## Hard Rules
1. MCP 层只暴露稳定语义，不把 Remotion/HyperFrames 私有函数名变成上层协议。
2. 写操作返回 `job_id`/`artifact_id`，UNKNOWN_OUTCOME 必须先 `status` 再重试。
3. Provider 不支持的能力必须显式返回 capability gap，禁止静默降级。
4. 所有 render 结果绑定 Motion IR version + provider + adapter version。
5. 质量结果绑定真实 artifact，不接受仅基于代码的“看起来应该没问题”。

## Capability Discovery
Provider 至少声明：2D/3D、text、svg、image、video、audio、subtitle、camera、shader、physics、custom-code、remote-render、local-render、deterministic-render、max-duration、supported-fps、formats、cost model、latency profile。

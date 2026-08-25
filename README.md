# Motion Runtime OS

AI 动画与可编程视频统一运行时。目标不是绑定某个视频生成工具，而是把创意意图编译成可迁移的 Motion IR，再由 Remotion、HyperFrames、HTML/CSS/SVG、Three.js、Blender、游戏引擎等 Adapter 执行。

## Control Center

```text
Creative Intent
  ↓
Motion Director / Agents
  ↓
Storyboard → Scene Graph → Timeline → Motion IR
  ↓
MCP / CLI / Prompt Pack / Runtime Workflow
  ↓
Provider Router
  ├─ Remotion
  ├─ HyperFrames
  ├─ Three.js / HTML Motion
  └─ Blender / Game Engine (future adapters)
  ↓
Render → Artifact Manifest → Motion Quality Gate
  ↓
Visual Regression / Golden Samples / Observability
```

## 使用入口
- `SKILL_REGISTRY.yaml`：Skill 与运行接口总注册表
- `mcp/MCP_CONTRACT.md`：模型/Agent 工具协议
- `cli/CLI_SPEC.md`：本地、CI、Shell 自动化命令面
- `prompts/PROMPT_PACK.md`：Director / Compiler / QA / Adaptation Prompt Pack
- `agents/AGENT_REGISTRY.yaml`：Motion Director、Storyboard、Animation、Provider、Render、Subtitle、Adaptation、QA Agents
- `runtime/RUNTIME_WORKFLOW.yaml`：机器状态机
- `runtime/EXECUTION_POLICY.md`：幂等、缓存、素材、失败恢复
- `observability/OBSERVABILITY.md`：Trace / Event / Metric / Debug Bundle
- `benchmarks/BENCHMARKS.md`：Golden Samples、Provider/Prompt benchmark

## 核心原则
1. Remotion / HyperFrames 是执行后端，不是导演大脑。
2. Motion IR、Scene Graph、Timeline、Render Job、Artifact Manifest 是稳定中间层。
3. 创意导演层与 Provider 解耦；Provider 必须先 capability discovery。
4. Render 成功不等于 Motion 成功；必须通过视觉、时序、字幕、音画同步、画幅和 accessibility QA。
5. 远程 UNKNOWN_OUTCOME 先查真实 job 状态，禁止盲重试。
6. 同一个 Motion IR 应能在多个 Provider 上做能力/质量/成本对比。
7. Prompt 升级、Adapter 升级、Schema 升级必须经过 Golden Sample regression。
8. 未来 Blender / Unreal / Three.js 只新增 Adapter，不重写上层导演逻辑。

## 目录
- `docs/` 产品、架构、Master Task、决策
- `runtime/` 状态机、Workflow、执行策略、IR versioning
- `schemas/` Storyboard / Scene Graph / Timeline / Motion IR / Render Job / Artifact Manifest
- `skills/` 导演、动画设计、布局、Remotion、HyperFrames、字幕、音频、渲染、QA、适配、无障碍
- `agents/` 多 Agent 角色注册
- `prompts/` Prompt Pack / Few-shot 规范
- `mcp/` MCP 语义工具协议
- `cli/` CLI 命令契约
- `adapters/` Provider Registry / Adapter Contract
- `quality/` Motion Quality Gate / Visual Regression
- `observability/` Trace / Logs / Metrics
- `benchmarks/` Golden Samples / Provider & Prompt Benchmarks
- `examples/` 片头、纪录片、短视频、TVC

## 与其他系统的关系
`Creator OS → AI Director Engine / Motion Runtime OS → SkillHub / Connector OS`

SkillHub 只保留轻量入口与索引；本仓库保存 Motion 专业 Runtime、Schema、Agent、Prompt、MCP、CLI、Adapter、质量规范和示例。

## 当前执行目标
第一条 Walking Skeleton：`examples/cinematic-intro/motion-ir.json → Remotion compile → MP4 → QA → 修复 → final artifact`。然后用同一 Motion IR 验证 HyperFrames Provider Independence。
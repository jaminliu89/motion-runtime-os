# Motion Runtime OS

AI 动画与可编程视频统一运行时。核心不是某一个渲染工具，而是把创意意图编译成稳定的 Motion IR，再由不同 Provider 执行、验证、比较和演进。

## Current Architecture

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
  ├─ Remotion ✅ verified primary
  ├─ HyperFrames ✅ verified secondary
  ├─ Three.js / HTML Motion (planned)
  └─ Blender / Unreal (future adapters)
  ↓
RenderResult → Media Probe → Artifact Manifest
  ↓
Golden Baseline / Visual Regression / Motion QA
  ↓
Provider Comparison / Semantic QA
```

## 已验证的工程闭环

### Remotion
`Motion IR → Generic Renderer → Remotion → MP4 → audio/subtitle probe → deterministic PNG keyframes → approved Golden Baseline → visual regression → evidence`

### HyperFrames
`同一 Motion IR → IR-to-HyperFrames compiler → strict HTML composition → HyperFrames 0.8.12 → MP4 → media probe → RenderResult → provider comparison`

Provider Independence 已通过 GitHub Actions Provider Independence run #3 (`32887649705`) 证明：同一 Motion IR 能由 Remotion 与 HyperFrames 两个真实后端成功执行。HyperFrames 输出为 7.0s H.264 + AAC，media probe PASS。

当前不把 Provider Independence 和 Semantic Equivalence 混为一谈。HyperFrames v1 compiler 仍有 4 个显式 downgrade：标题 `blur-fade-rise` 入场、标题 exit fade、directional light motion、camera push-in。因此当前状态是：

- Provider Independence: **PROVEN**
- Golden Visual Regression: **ACTIVE**
- Audio / Subtitle Runtime: **VERIFIED**
- Semantic Equivalence: **IN PROGRESS**
- Pixel Identity: **NOT A GOAL**

## Control Center

- `SKILL_REGISTRY.yaml`：Skill 与运行接口总注册表
- `PROJECT.yaml`：当前 phase / exit gate / evidence 真相源
- `docs/MASTER_TASK.md`：Master Task 与 Definition of Done
- `runtime/providers/`：Executable Provider Adapters
- `scripts/compile-hyperframes-project.mjs`：Motion IR → HyperFrames HTML compiler
- `mcp/MCP_CONTRACT.md`：模型/Agent 工具协议
- `cli/CLI_SPEC.md`：本地、CI、Shell 自动化命令面
- `prompts/PROMPT_PACK.md`：Director / Compiler / QA / Adaptation Prompt Pack
- `agents/AGENT_REGISTRY.yaml`：Motion Agents
- `quality/golden-baselines/`：批准后的视觉历史真相
- `adapters/PROVIDER_REGISTRY.yaml`：Provider capability / verification / routing registry
- `.github/workflows/provider-independence.yml`：same-IR multi-provider 强制执行门

## 核心原则

1. Motion IR、Scene Graph、Timeline、Render Job、RenderResult、Artifact Manifest 是稳定中间层。
2. Remotion / HyperFrames 是 Provider，不是导演大脑。
3. Provider 不支持的语义必须显式 downgrade，禁止静默丢弃。
4. Render success 不等于完成；必须有 media / visual / temporal / semantic evidence。
5. Golden Baseline 只能审批更新，不能由当前 render 静默覆盖。
6. Provider Independence、Semantic Equivalence、Pixel Identity 是三个不同指标。
7. 新 Provider 必须经过 capability discovery → contract → real render → probe → comparison 才能标记 verified。
8. Blender / Unreal / Three.js 以后只新增 Adapter，不重写上层导演逻辑。

## 当前阶段

Phase 3：**Cross-provider Semantic Parity**。

目标不是再证明“两个后端都能出片”，这个已经完成；现在要消除已知 semantic downgrade，并建立跨 Provider 的 motion intent / timing / subtitle / audio / visual-landmark QA，使不同执行后端尽可能忠实实现同一 Motion IR。

与其他系统关系：`Creator OS → AI Director Engine / Motion Runtime OS → SkillHub / Connector OS`。SkillHub 只保留能力发现与轻量路由，本仓库存放 Motion 专业 Runtime、Schema、Agent、Prompt、MCP、CLI、Adapter、质量系统和真实执行证据。

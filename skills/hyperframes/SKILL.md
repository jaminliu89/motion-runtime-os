---
name: hyperframes
version: 1.0.0
description: HyperFrames 可编程视频/动画 Provider Skill。负责能力发现、Motion IR 映射、场景生成、渲染请求、结果校验与 Provider 失败恢复。
---
# HyperFrames Skill

## 定位
HyperFrames 是 Motion Runtime OS 的远程执行 Provider，不承担导演层职责。

## Workflow
`capability discovery → Motion IR compatibility check → provider mapping → render request → poll/observe → artifact validation → QA`。

## Rules
1. 首次使用先确认当前 Provider 能力和输入约束，不能假设 API/schema 永久不变。
2. 不支持的 Motion IR 特性必须显式降级或切换 Provider，不能静默丢失。
3. 外部 render 状态未知时先查询真实 job 状态，禁止盲目重复提交造成重复计费/重复任务。
4. Provider prompt/参数只是编译目标，不回写为核心 Motion IR。
5. 保留 provider_job_id、input version、artifact ref 与失败原因，支持追踪和重放。
6. 输出仍必须经过 Motion Quality Gate。

## Router 偏好
适合远程生成/高层动画能力或 Provider 原生擅长的效果；需要逐帧确定性、复杂参数化和强可编辑性时优先考虑 Remotion。
---
name: remotion
version: 1.0.0
description: 将 Motion IR 编译为 Remotion 可维护工程，覆盖 Composition、Sequence、spring/interpolate、audio/video、字幕、字体、资产、render 与参数化批量视频。
---
# Remotion Skill

## 角色
Remotion 是 deterministic programmable-video Adapter。上游输入必须来自 Motion IR/Timeline，而不是直接从自然语言跳到 JSX。

## Workflow
`Motion IR → composition map → component/layer map → timing compile → asset/font/audio bind → preview → render → QA`。

## Rules
1. Composition 显式 width/height/fps/durationInFrames。
2. 时间统一从秒/beat 转 frame，避免散落 magic frames。
3. Sequence/Series 管时间分段；复杂镜头拆可复用 layer components。
4. interpolate/spring 必须有明确输入域、clamp/overshoot 选择。
5. 字体在 render 前完成加载；远程资产默认先解析/缓存，避免 render 时网络漂移。
6. 音频、字幕、视觉 cue 从同一 timeline source 计算。
7. 参数化视频通过 schema props，不复制 Composition。
8. Provider-specific implementation 不回写 Motion IR。
9. render 后必须走 Motion Quality Gate。

## 适用
动态图形、字幕、数据可视化、信息图、片头、产品演示、批量参数化视频、需要可编辑与确定性渲染的作品。
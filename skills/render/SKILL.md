---
name: render
version: 1.0.0
description: 统一视频渲染流水线 Skill，负责分辨率、FPS、codec、音频、字体、资产预取、并发、重试、缓存、artifact 与失败恢复。
---
# Render Skill
流程：`preflight → resolve assets/fonts → compile → render → mux → artifact probe → QA`。
硬规则：渲染前验证所有 asset ref；输出参数来自 RenderJob；未知 outcome 先查询，不盲重试；长任务保留 job/commit/IR version；失败区分 compile/render/asset/font/audio/codec/provider；首尾帧、总时长、音轨必须可探测。
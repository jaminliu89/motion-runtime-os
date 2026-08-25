---
name: timeline-design
description: 把 Scene Graph 投影到时间轴，负责 track、clip、节拍、同步点、过渡区、字幕与音效 cue。
version: 1.0.0
---
# Timeline Design
规则：所有 clip 有 start/end；镜头总时长与 timeline 一致；字幕/音效/视觉关键帧共享 sync cue；转场占用时间必须显式；帧率变化必须先重采样；避免魔法数字，优先 beat/cue token。
输出：Timeline schema compatible object + sync map。
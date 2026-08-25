---
name: audio-sync
version: 1.0.0
description: 音乐、对白、音效与视觉动作同步 Skill，负责 beat/cue map、impact、ducking、fade、音画关键点和最终同步验证。
---
# Audio Sync
流程：`analyze audio → cue map → map visual beats → mix rules → render → sync QA`。
规则：所有关键视觉 impact 可绑定 cue id；对白优先级高于背景音乐；字幕与对白共用时间源；转场音效不要掩盖关键信息；最终检查首尾静音、峰值、总时长和 lip/dialogue alignment（适用时）。
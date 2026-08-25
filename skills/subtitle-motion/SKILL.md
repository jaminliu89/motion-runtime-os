---
name: subtitle-motion
version: 1.0.0
description: 动态字幕与口播包装 Skill，负责断句、词级/句级 timing、强调、可读性、安全区、字幕动画与多画幅适配。
---
# Subtitle Motion
规则：字幕 timing 来源于 transcript/alignment 而不是视觉猜测；先保证阅读速度再设计动画；关键词强调不得破坏断句；竖屏/横屏分别定义 safe area；避免每个字都无差别弹跳；字幕与画面主体冲突时优先自动避让；输出 cue 可映射到 Remotion/HyperFrames。
---
name: format-adaptation
version: 1.0.0
description: 将同一 Motion Project 适配 16:9、9:16、1:1 等多画幅，处理重构图、safe area、字幕、镜头裁切和信息优先级。
---
# Format Adaptation
规则：不是简单 center crop；每个画幅重新计算 composition zones、主体位置、文字宽度和 safe area；字幕与 UI overlay 预留平台安全区；镜头/背景允许 crop，但关键主体和品牌 lockup 不得被裁掉；同一 Motion IR 可通过 layout variants 输出多画幅。
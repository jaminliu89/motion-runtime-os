---
name: motion-layout
version: 1.0.0
description: 动画布局引擎 Skill，负责 composition zones、锚点、safe area、碰撞避让、文本测量、响应式画幅与镜头内动态重排。
---
# Motion Layout

布局先于动画。输入 canvas、主体、文字、品牌 lockup、平台 overlay safe zones，输出 provider-neutral layout constraints。

规则：
- 文本必须在字体加载后测量。
- 关键主体/Logo/CTA 有不可裁切约束。
- 字幕与主体发生碰撞时支持避让而不是覆盖。
- 9:16/16:9/1:1 使用 layout variants，不只做 center crop。
- 动画中的 scale/translation 也要验证全时间段边界，而不是只检查静态首帧。
- 输出 anchor/box/constraint，不输出 Provider-specific CSS/JSX。
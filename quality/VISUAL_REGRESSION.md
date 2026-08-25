# Visual Regression / Golden Motion Tests

## Why
动画 bug 很多不会让 build/render 失败：字体漂移、布局偏移、转场断裂、素材替换、色彩/透明度变化、某帧黑屏。

## Golden Strategy
每个关键 example 保存：Motion IR fixture、RenderJob、关键采样时间点、期望元数据、可选 baseline frames/hash。

采样建议：首帧、每个 scene 中点、transition 前/中/后、impact cue、尾帧。对动态粒子等非确定性场景使用结构/区域/统计阈值而不是严格像素相等。

## Gate
比较 canvas/fps/duration、关键元素 bounding boxes、文本内容/可见性、blank frame、音轨时长、可选 image similarity。视觉差异不能自动视为 bug；必须输出 diff evidence 供 Reviewer 判断是 intentional change 还是 regression。
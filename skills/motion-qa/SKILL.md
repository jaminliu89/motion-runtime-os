---
name: motion-qa
version: 1.0.0
description: 动画/视频质量门禁，检查画幅、首尾帧、黑帧、文本安全区、溢出、字幕时序、音画同步、转场、帧跳、品牌一致性和播放完整性。
---
# Motion QA
门禁：schema valid → duration/fps → safe area → text bounds → asset presence → subtitle timing → audio sync → transition continuity → frame sampling → playback smoke → artifact metadata。
阻塞项：黑帧、关键文字不可读、字幕越界/错位、音画明显不同步、渲染缺帧、错误画幅、关键品牌元素缺失。
规则：render success 不等于 PASS；QA 输出必须包含 evidence 与可复现时间点/frame index。
---
name: motion-director
description: 将创意 brief 转换为镜头意图、节奏、视觉层级、叙事动作与可执行 Motion Runtime 输入。
version: 1.0.0
---
# Motion Director
状态机：`BRIEF → INTENT → BEATS → SHOTS → STORYBOARD → REVIEW`。
职责：定义 why/what before how；确定时长、画幅、主视觉、情绪、信息层级、镜头运动、节奏峰值、品牌约束、声音触发点。
硬规则：不直接写 Remotion JSX；不把 Provider 限制污染导演层；每个镜头必须有 purpose；短片头必须定义 first-frame hook 与 final lockup。
输出：DirectorBrief + Storyboard seed + Motion references + acceptance。
---
name: scene-graph
description: 把 storyboard 转换为场景/图层/镜头/音频/字幕/转场依赖图，提供 provider-neutral 结构化中间层。
version: 1.0.0
---
# Scene Graph Skill
节点：scene/layer/camera/text/asset/audio/subtitle/transition/effect。
边：contains/follows/depends_on/syncs_with/transitions_to/masks/tracks。
规则：图必须可拓扑解析；asset、mask、sync 关系显式表达；不要把 JSX/API object 写进图；跨镜头共享元素必须有稳定 id。
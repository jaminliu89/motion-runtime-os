---
name: asset-font-management
version: 1.0.0
description: 动画素材与字体管理 Skill，负责 asset registry、字体加载、许可证/来源记录、缓存、缺失回退、跨 Provider 可用性和 render preflight。
---
# Asset & Font Management
规则：每个外部 asset 有稳定 ref、来源、类型、尺寸/时长元数据；远程依赖在渲染前解析或缓存；字体必须在 layout measurement 前加载；缺失字体不得静默替换导致排版漂移；Provider 不支持的格式需预转换；记录版权/许可证元数据供发布前检查。
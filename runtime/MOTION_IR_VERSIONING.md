# Motion IR Versioning

Motion IR 是仓库核心长期资产，必须独立版本化。

## Rules
- `version` 必填，使用 semver-like major.minor。
- breaking schema 变更提升 major，并提供 migration notes。
- Adapter 声明支持的 Motion IR version range。
- 新字段默认向后兼容；删除/重命名字段必须迁移。
- Example/golden fixtures 固定其 IR 版本，防止 schema 漂移无感破坏。
- Provider-specific 字段禁止进入核心 IR；如确需扩展，放 `extensions.<provider>` 且不得影响其他 Provider。

## Migration Gate
`old fixture → migrate → schema validate → compile on supported adapters → render/QA golden test`。
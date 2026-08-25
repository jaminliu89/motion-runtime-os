# Motion Provider Adapter Contract

每个 Provider 必须实现语义接口：

`discoverCapabilities()` → 当前真实能力与限制
`validate(ir)` → Motion IR 兼容性与降级项
`compile(ir, renderJob)` → provider-specific project/request
`submit(compiled)` → job/ref
`observe(job)` → status/progress/errors
`retrieve(job)` → artifact refs
`verify(artifact, expected)` → provider-level postconditions
`normalizeFailure(error)` → AUTH/PERMISSION/UNSUPPORTED/ASSET/COMPILE/RENDER/RATE_LIMIT/UNKNOWN_OUTCOME/PROVIDER_ERROR

## Hard Rules
- 不支持能力必须显式报告，不能静默 drop。
- Adapter 不修改上游创意意图；只能给出 downgrade proposal。
- UNKNOWN_OUTCOME 先 observe，不盲重试。
- Provider-specific IDs/params 只存在 adapter/runtime observation 层。
- 新 Adapter 需要 fixtures + contract tests + 至少一个 example。

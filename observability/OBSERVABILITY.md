# Motion Runtime Observability

## Trace
每次任务生成 `run_id`，贯穿 brief → IR → provider decision → compile → render job → artifact → QA。

## Events
- motion.intake
- ir.generated / ir.validated / ir.rejected
- provider.selected / capability_gap
- compile.started / compile.completed / compile.failed
- render.submitted / render.completed / render.failed / render.unknown
- artifact.created
- qa.started / qa.failed / qa.passed
- export.completed

## Metrics
- render success rate
- render latency p50/p95
- provider failure rate
- QA first-pass rate
- average revision loops
- cache hit rate
- cost per rendered second
- artifact size / render time
- subtitle/audio drift incidents
- visual regression incidents

## Logs
Structured JSON logs with run_id, stage, provider, job_id, artifact_id, severity, error_class. Never log provider secrets.

## Debug Bundle
On failure persist: normalized IR, provider capability snapshot, compile plan, stderr/provider error, sampled frames where allowed, QA report, manifest and relevant version metadata.
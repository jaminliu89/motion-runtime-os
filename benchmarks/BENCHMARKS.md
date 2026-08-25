# Motion Runtime Benchmarks

## Golden Samples
保留小而高价值的基准集，覆盖：cinematic intro、documentary title、short-video kinetic subtitles、TVC product card、multi-aspect adaptation、audio-reactive cue。

每个样例包含：brief、expected Motion IR、reference frames/metrics（如适用）、provider outputs、QA report。Golden Sample 用于检测 Runtime/Adapter/Prompt 版本升级是否退化。

## Provider Benchmark
统一 Motion IR 分别编译/渲染到不同 provider，比较：capability coverage、视觉一致性、render latency、失败率、cost、determinism、editable output、artifact quality。

## Prompt Benchmark
Prompt 不是靠感觉升级。对固定 brief 比较：IR schema validity、constraint retention、scene/timing completeness、capability hallucination rate、QA first-pass rate。

## Regression Policy
任何 Motion IR schema、Prompt Pack、Adapter、Motion Quality Gate 升级，都至少跑相关 golden samples。出现视觉漂移时保留 before/after 和显式批准记录。

## First Benchmark
`examples/cinematic-intro/motion-ir.json` 作为 walking skeleton 的第一基准：先 Remotion 真实渲染，再用同 IR 测 HyperFrames（能力验证后），验证 Provider Independence。
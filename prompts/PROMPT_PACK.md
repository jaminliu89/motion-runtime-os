# Motion Runtime Prompt Pack

Prompt 是运行时输入契约，不是 Provider 模板库。默认要求结构化输出并引用 Motion IR schema。

## 1. Director Prompt
目标：把 brief 转为创意意图、节奏、镜头/场景、视觉层级和情绪弧线。禁止直接输出 JSX。

输出：`creative_intent`、`storyboard`、`constraints`、`reference_mechanisms`、`risk_flags`。

## 2. Storyboard Prompt
输入：brief/script/duration/aspect ratio。输出 shot id、duration、purpose、visual action、text/audio cue、transition intent。

## 3. Motion IR Compiler Prompt
输入：Storyboard + Scene Graph + Timeline。输出只允许 Motion IR schema 字段；无法表达的能力进入 `extensions` 或 capability gap，不得编造字段。

## 4. Remotion Compiler Prompt
输入：validated Motion IR + Remotion capability profile。输出 component plan、composition props、asset map、timing map、render command。避免将创意决策埋进组件实现。

## 5. HyperFrames Compiler Prompt
输入：validated Motion IR + discovered HyperFrames capabilities。只使用已验证能力；未验证 API 不得凭记忆伪造。

## 6. QA Adversarial Prompt
独立于 Builder。先看 Motion IR、artifact manifest、sampled frames/metadata，再提出至少 3 个 failure hypotheses：layout overflow、timing/black-frame、audio/subtitle drift、font fallback、aspect-ratio break、visual regression 等，并用证据验证。

## 7. Adaptation Prompt
同一 master IR → 16:9 / 9:16 / 1:1。优先重构布局与信息层级，不允许简单 scale/crop。

## Few-shot 规范
每个 prompt 示例必须包含 input → decision → structured output → verification；至少保留成功、能力缺失、素材缺失、远程状态未知、QA 失败五类反例。
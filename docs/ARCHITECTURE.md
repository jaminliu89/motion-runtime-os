# Architecture

## Layers
1. Creative/Director Layer — 意图、叙事、品牌、节奏、镜头语言
2. Structural Layer — Storyboard / Scene Graph / Timeline
3. Motion IR Layer — provider-neutral animation semantics
4. Routing Layer — capability/cost/style/output constraints
5. Adapter Layer — Remotion / HyperFrames / HTML/SVG / Three.js / future Blender/Unreal
6. Render Layer — frame/audio/subtitle/font/asset pipeline
7. Quality Layer — deterministic + visual + temporal QA

## State Machine
`INTAKE → DIRECT → STORYBOARD → GRAPH → TIMELINE → MOTION_IR → ROUTE → COMPILE → RENDER → QA → REVISE/COMPLETE`

Failure path: `ANY → BLOCKED → DIAGNOSE → RECOVER → RESUME`.

## Motion IR
Motion IR 必须表达：scene duration/fps/aspect、layers、z-order、time spans、enter/hold/exit、transform、opacity、blur、mask、camera、typography、audio cues、subtitle cues、transition、easing、asset refs、safe areas。

## Provider Selection
Provider 不能靠品牌名硬编码。Router 根据：capabilities、editable requirement、determinism、render target、latency、cost、privacy、offline/online、style constraints 选择。

## Quality
Render accepted 只是 Q0。最低要求：schema valid → timing valid → visual bounds → audio/subtitle sync → render artifact → smoke playback。核心作品增加 frame sampling / visual regression / brand consistency review。
# Motion / MG Intelligence — V1 Spec

Status: ACTIVE — PRIMARY BATTLE

## Product decision
The default Creator OS video stack must not depend on paid ChatCut execution. ChatCut remains OPTIONAL_PROVIDER / BENCHMARK. The canonical path is local-first and provider-neutral:

`Director IR → MG Planner → Motion Grammar → Motion IR → Provider Router → HyperFrames | Motion Canvas | Remotion → QA → MP4`

## Why this layer exists
Renderers should not decide creative meaning. `ai-director-engine` identifies narrative/emotional intent; this runtime converts that intent into visual storytelling grammar. Providers only execute.

## Motion Grammar primitives
### Typography
kinetic_text, word_reveal, keyword_isolation, number_counter, mask_reveal, type_scale_contrast, tracking_shift.

### Diagram
node_graph, causal_chain, process_flow, timeline, comparison_map, hierarchy, callout_annotation.

### Data
bar_chart, line_chart, percentage, ranking, counter, before_after, delta, progress.

### Spatial
push_in, pull_out, parallax, depth_stack, rack_attention, focus_isolation, pan, orbit.

### Transition
match_cut, semantic_morph, mask_wipe, directional_wipe, whip, flash, dissolve, hard_interrupt.

### UI / Document
browser_frame, phone_frame, chat_bubble, code_panel, search_result, document_highlight, screenshot_focus, quote_card.

### Emotion / Rhythm
freeze, blackout, negative_space, slow_reveal, impact_hit, breath, silence_hold, acceleration, deceleration.

### Story function
setup, escalation, contrast, question, reveal, payoff, callback, proof, explanation.

## Planner contract
Input: Director IR segment + transcript + available assets + brand/style constraints.
Output is not a template ID. It is a composable grammar plan:

```yaml
segment_id: s-03
narrative_function: revelation
attention_target: "30"
restraint: high
grammar:
  - number_counter
  - freeze
  - suppress_background
  - keyword_isolation
  - push_in
timing:
  build: 1.2
  pause: 0.3
  reveal: 1.1
provider_requirements:
  - vector_text
  - deterministic_timeline
  - local_asset
```

## Restraint policy
1. Motion is evidence-driven; exposition defaults to low intensity.
2. Do not animate every sentence.
3. One segment should normally have one dominant attention target.
4. Strong effects require narrative justification (turn/reveal/proof/payoff).
5. Silence, negative space and hold are first-class motion decisions.
6. If confidence is low, prefer typography/subtitle clarity over decorative MG.

## Provider strategy
- HyperFrames: local-first primary for agent-generated HTML/CSS/SVG/JS motion and compositional MG.
- Motion Canvas: planned primary specialist for information diagrams, vector explanation and narration-synced procedural animation.
- Remotion: verified provider retained for React/video composition and compatibility.
- FFmpeg: assembly/probe/fallback utility, not MG director.
- ChatCut: optional editable NLE provider/benchmark; never required for canonical completion.

## Quality gates
A render is not accepted because it exists. Evaluate:
- semantic intent survival;
- attention target correctness;
- temporal alignment with transcript/audio;
- visual hierarchy/readability;
- restraint (effect density);
- continuity across adjacent segments;
- provider downgrade evidence;
- media probe and deterministic artifact evidence.

## V1 acceptance fixture
Create one 20–40s talking-head/knowledge segment containing: setup → numeric proof → contrast → revelation. The MG Planner must produce at least three distinct grammar families (typography, data/diagram, rhythm/spatial), render locally, preserve source audio, and outperform a subtitle-only baseline in human preference review.

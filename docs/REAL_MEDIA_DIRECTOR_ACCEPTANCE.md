# Real Media Director Acceptance

## A-REAL-001 — AI Director Engine → Motion Runtime → Remotion

Status: **PASS**

### Upstream
- `ai-director-engine` Real Media Acceptance run `32926244006` / run #7: SUCCESS.
- Real public-domain U.S. Army interview processed by FFmpeg + faster-whisper + Perception + Semantic Director.
- 4 Director IR segments.
- Director Intent QA: PASS.
- Motion Runtime consumer-contract QA: PASS.
- Input SHA-256: `a93869b5712154b990909a3bfb14e2636a5cce59174ecd64854abdbda302fad0`.

### Runtime
- Exact upstream Motion IR copied to `examples/real-media-director/motion-ir.json`.
- Canvas: 1080×1920 @ 30fps.
- Duration: 28.733s.
- Source footage preserved as Motion IR `video` layer.
- Runtime `GenericMotion` supports source video layers with embedded original audio plus timed subtitles.

### Verified Remotion execution
- Workflow: `Director Bridge Acceptance`.
- Run: `32926421757` / run #1.
- Result: SUCCESS.
- Gates passed: pinned source download/hash → Motion IR validator → TypeScript → real Remotion render → media stream probe → artifact evidence.
- Artifact: `real-media-director-render`, artifact ID `9591739910`, size 41,431,418 bytes, artifact ZIP digest `sha256:39ba17a48a10ee26023dc57b0b4c8924675b305f95205f58de427fecdb1cbadb`.
- Final MP4 is included in that artifact as `out/real-media-director.mp4`.

## Interpretation
This closes the first real-human cross-repository path:

`real MP4 → Whisper → Perception → Semantic Director → Director IR → Motion IR → Remotion → MP4`

It proves executable integration and media preservation. It does not prove sophisticated creative direction: the deterministic Semantic Director v1 made conservative exposition decisions for this specific interview.

## HyperFrames
A separate gate tests the exact same real Motion IR through HyperFrames. Its status must be recorded independently; Remotion success does not imply HyperFrames success.

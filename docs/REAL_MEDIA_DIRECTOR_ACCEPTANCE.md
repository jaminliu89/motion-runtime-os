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
- Final MP4 is included as `out/real-media-director.mp4`.

## A-REAL-002 — Exact Same Motion IR → HyperFrames

Status: **PASS**

### Implementation correction found by strict runtime evidence
The first HyperFrames real-media attempt failed strict lint because an audible timed `<video>` must explicitly declare `data-has-audio="true"`. The compiler was corrected instead of disabling strict mode.

### Verified HyperFrames execution
- Workflow: `Real Media HyperFrames Acceptance`.
- Successful run: `32926669798` / run #2.
- Result: SUCCESS.
- Same pinned source SHA and exact same `examples/real-media-director/motion-ir.json` as Remotion.
- HyperFrames compiler maps `video` layer to a timed media element, copies the runtime asset, declares embedded audio explicitly, preserves four subtitle windows, and runs in strict mode.
- Final artifact passed video+audio media-stream probe.
- Artifact: `real-media-hyperframes-render`, artifact ID `9591815442`, size 787,865 bytes, artifact ZIP digest `sha256:1478e8f58d61eb0daffac40c0567c4cc32f3306ffbf35e7244fa32d8556747c8`.

## Interpretation
The full real-human provider-neutral bridge is now proven:

`real MP4 → Whisper → Perception → Semantic Director → Director IR → Motion IR → {Remotion | HyperFrames} → MP4`

Both providers consume the same accepted Motion IR and the same pinned real source footage, and both outputs pass media-stream verification.

This proves executable integration, media preservation and real-footage provider independence. It does not prove sophisticated creative direction: deterministic Semantic Director v1 made conservative exposition decisions for this particular interview. Director intelligence quality is the next benchmark frontier.

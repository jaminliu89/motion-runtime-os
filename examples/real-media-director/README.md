# Real Media Director Bridge Fixture

This Motion IR is copied verbatim from the successful `ai-director-engine` Real Media Acceptance run `32926244006` (run #7), where a real public-domain human interview was processed through FFmpeg → faster-whisper → Perception → Semantic Director → Director IR v1 → Motion IR.

## Source media
- Wikimedia Commons: `Participant interview from the Strategic Competition and Russia course (999987)`
- Original MP4: `https://d34w7g4gy10iej.cloudfront.net/video/2603/DOD_111581929/DOD_111581929.mp4`
- SHA-256: `a93869b5712154b990909a3bfb14e2636a5cce59174ecd64854abdbda302fad0`
- 1080×1920, H.264 + AAC, about 28.733 seconds
- Public Domain U.S. federal government work (U.S. Army official-duty work, per Wikimedia Commons source page)

## Contract evidence
Upstream acceptance produced 4 transcript/director segments, Director Intent QA PASS, Motion Runtime consumer contract PASS, and a `source-video` Motion IR layer pointing to `assets/real-media-interview.mp4`.

The source binary is intentionally not committed. CI downloads it, verifies the pinned hash, stages it into `public/assets/`, renders the exact Motion IR fixture, probes the resulting MP4, and uploads the final artifact.

This fixture proves a real-media bridge. It is not a claim that the deterministic Semantic Director v1 is creatively sophisticated; its current interview decisions are deliberately conservative.

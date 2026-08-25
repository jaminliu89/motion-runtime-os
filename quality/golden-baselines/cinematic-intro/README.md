# Cinematic Intro Golden Baseline

Golden Baseline v1 is approved from GitHub Actions run #52 (`32884289831`), commit `d9a070caf634eeb87579e004bb3c56560fc00093`, artifact digest `sha256:da03597c1e628e573b22830b82777471a142d52b88ff61627eecbae1bdd6c290`.

Approval basis:
- 9 deterministic keyframes were independently visually reviewed.
- Progression is coherent: black lead-in → title reveal → subtitle → light-cut → fade-out → black tail.
- No text overflow, layer breakage, unexpected frame discontinuity, or unsafe layout was observed in the approved sample.
- Media probe passed with H.264 video and AAC audio; video duration is 7.0s.
- CI run #52 completed successfully across render, media probe, keyframe capture, QA, manifest, and evidence upload.

The repository canonical baseline is `baseline-fingerprint.json`. It stores dimensions, SHA-256, and a provider-neutral 64-bit average perceptual hash for every approved keyframe. This avoids coupling the quality gate to binary-file transport while preserving an immutable reviewed baseline. `npm run visual:diff` now fails when current frames diverge beyond the approved perceptual threshold.

If materialized Golden PNGs are added later, the same runner automatically upgrades to pixelmatch diagnostics and emits diff PNGs. Baseline updates remain explicit quality decisions and must be recorded in the Decision Log; a new render must never silently overwrite the baseline.

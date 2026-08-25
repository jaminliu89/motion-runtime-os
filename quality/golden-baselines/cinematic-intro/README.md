# Cinematic Intro Golden Baseline

This directory intentionally starts without PNG baselines.

Golden PNGs may only be added after the corresponding render has passed IR validation, static QA, typecheck, provider conformance, render artifact verification, and human/independent visual review. Updating a baseline is a quality decision, not an automatic consequence of a changed render.

Expected filenames follow deterministic keyframes, for example `frame-00000.png`.

Once PNG baselines exist, `npm run visual:diff` becomes an effective pixel-level regression gate. Default maximum changed-pixel ratio is 1% and can be overridden with `MOTION_VISUAL_DIFF_THRESHOLD`.

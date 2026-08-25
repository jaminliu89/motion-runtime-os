# Execution Policy

## Idempotency
Remote render/create actions must derive or store an idempotency key from `motion_ir hash + provider + adapter version + render profile`. UNKNOWN_OUTCOME requires provider status/read before retry.

## Cache Layers
- IR cache: normalized/validated Motion IR by content hash
- compile cache: provider execution plan by IR hash + adapter version
- asset cache: downloaded/generated assets by checksum/license metadata
- render cache: deterministic provider outputs by render profile
- QA cache: artifact checksum + QA policy version

Cache hit is not permission to skip validation when schema/provider/policy versions changed.

## Asset Policy
Record source, license/usage constraints when known, checksum, dimensions/duration, transform history. Never silently substitute missing fonts/assets; fallback must be explicit and QA-visible.

## Reproducibility
Artifact Manifest must capture IR version, provider, adapter version, render settings, source commit, assets/fonts and output checksum.

## Failure Classes
INVALID_IR / CAPABILITY_GAP / ASSET_MISSING / FONT_MISSING / AUTH / RATE_LIMIT / PROVIDER_ERROR / RENDER_ERROR / TIMEOUT / UNKNOWN_OUTCOME / QA_FAIL / NON_DETERMINISTIC_DRIFT.

## Recovery
re-read truth → narrow failure → invalidate minimum cache layer → recompile/rerender only affected stage → preserve failed artifacts/logs for diagnosis.
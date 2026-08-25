import fs from 'node:fs';
import path from 'node:path';

const [aPath,bPath,outPath='out/provider-comparison.json'] = process.argv.slice(2);
if (!aPath || !bPath) throw new Error('Usage: compare-providers <a.render-result.json> <b.render-result.json> [out]');
const a = JSON.parse(fs.readFileSync(aPath,'utf8'));
const b = JSON.parse(fs.readFileSync(bPath,'utf8'));
const normalized = (r) => ({
  provider:r.provider,
  status:r.status,
  artifact:r.artifacts?.[0]?.path ?? null,
  runtime_smoke:r.evidence?.runtime_smoke ?? null,
  semantic_warnings:r.semantic_coverage?.total_warnings ?? 0,
  fully_equivalent:r.semantic_coverage?.fully_equivalent ?? null,
  capabilities:r.capabilities ?? null,
});
const report = {
  schema_version:1,
  source_ir:'examples/cinematic-intro/motion-ir.json',
  providers:[normalized(a),normalized(b)],
  provider_independence_proven:a.status==='done' && b.status==='done',
  semantic_equivalence_proven:Boolean(a.semantic_coverage?.fully_equivalent && b.semantic_coverage?.fully_equivalent),
  note:'Provider independence means the same Motion IR executed on multiple backends. It does not imply pixel-identical output or full semantic equivalence.',
};
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(report,null,2));
if (!report.provider_independence_proven) process.exitCode=1;
console.log(`Provider comparison written: ${outPath}`);

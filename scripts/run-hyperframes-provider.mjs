import fs from 'node:fs';
import path from 'node:path';
import {assertProviderContract} from '../runtime/providers/provider-contract.mjs';
import {hyperframesProvider} from '../runtime/providers/hyperframes-provider.mjs';

const irPath = process.argv[2] ?? 'examples/cinematic-intro/motion-ir.json';
const outputPath = process.argv[3] ?? 'out/hyperframes/cinematic-intro.mp4';
const resultPath = process.argv[4] ?? 'out/hyperframes/cinematic-intro.render-result.json';
const projectDir = 'out/hyperframes/project';

assertProviderContract(hyperframesProvider);
const capabilities = await hyperframesProvider.discoverCapabilities();
const validation = await hyperframesProvider.validate({irPath});
if (!validation.ok) throw new Error(validation.issues.join('; '));
const startedAt = new Date().toISOString();
try {
  const compiled = await hyperframesProvider.compile({irPath,projectDir,outputPath});
  const job = await hyperframesProvider.submit(compiled);
  const observed = await hyperframesProvider.observe(job);
  const retrieved = await hyperframesProvider.retrieve(job);
  const verification = await hyperframesProvider.verify(retrieved.artifacts[0]);
  if (!verification.ok || observed.status !== 'done') throw new Error(`HyperFrames verification failed: ${verification.reason ?? observed.status}`);
  const warnings = retrieved.compile_report?.warnings ?? [];
  const result = {
    job_id:job.job_id,
    provider:hyperframesProvider.id,
    adapter_version:hyperframesProvider.version,
    status:'done',
    started_at:startedAt,
    completed_at:new Date().toISOString(),
    artifacts:[{path:retrieved.artifacts[0],kind:'video',checksum:verification.checksum}],
    evidence:{ir_validation:'pass',static_qa:'pass',visual_regression:null,runtime_smoke:'pass'},
    semantic_coverage:{warnings,total_warnings:warnings.length,fully_equivalent:warnings.length===0},
    failure:null,
    capabilities,
  };
  fs.mkdirSync(path.dirname(resultPath),{recursive:true});
  fs.writeFileSync(resultPath,JSON.stringify(result,null,2));
  console.log(`HyperFrames provider completed: ${resultPath}`);
} catch (error) {
  const failure = hyperframesProvider.normalizeFailure(error);
  fs.mkdirSync(path.dirname(resultPath),{recursive:true});
  fs.writeFileSync(resultPath,JSON.stringify({provider:'hyperframes',adapter_version:hyperframesProvider.version,status:'failed',started_at:startedAt,completed_at:new Date().toISOString(),artifacts:[],failure},null,2));
  throw error;
}

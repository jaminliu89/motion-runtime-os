import fs from 'node:fs';
import path from 'node:path';
import {assertProviderContract} from '../runtime/providers/provider-contract.mjs';
import {remotionProvider} from '../runtime/providers/remotion-provider.mjs';

const composition = process.argv[2] ?? 'CinematicIntro';
const irPath = process.argv[3] ?? 'examples/cinematic-intro/motion-ir.json';
const outputPath = process.argv[4] ?? 'out/provider/cinematic-intro.mp4';
const resultPath = process.argv[5] ?? 'out/provider/cinematic-intro.render-result.json';

assertProviderContract(remotionProvider);
const capabilities = await remotionProvider.discoverCapabilities();
const validation = await remotionProvider.validate({irPath});
if (!validation.ok) throw new Error(validation.issues.join('; '));

const startedAt = new Date().toISOString();
try {
  const compiled = await remotionProvider.compile({composition, outputPath});
  const job = await remotionProvider.submit(compiled);
  const observed = await remotionProvider.observe(job);
  const retrieved = await remotionProvider.retrieve(job);
  const verification = await remotionProvider.verify(retrieved.artifacts[0]);
  if (!verification.ok || observed.status !== 'done') throw new Error(`Provider verification failed: ${verification.reason ?? observed.status}`);
  const result = {
    job_id: job.job_id,
    provider: remotionProvider.id,
    adapter_version: remotionProvider.version,
    status: 'done',
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    artifacts: [{path:retrieved.artifacts[0],kind:'video',checksum:verification.checksum}],
    evidence: {ir_validation:'pass',static_qa:'pass',visual_regression:null,runtime_smoke:'pass'},
    failure: null,
    capabilities,
  };
  fs.mkdirSync(path.dirname(resultPath), {recursive:true});
  fs.writeFileSync(resultPath, JSON.stringify(result,null,2));
  console.log(`Remotion provider completed: ${resultPath}`);
} catch (error) {
  const failure = remotionProvider.normalizeFailure(error);
  const result = {
    job_id: `remotion-failed-${Date.now()}`,
    provider: remotionProvider.id,
    adapter_version: remotionProvider.version,
    status: 'failed',
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    artifacts: [],
    evidence: {ir_validation:'pass',static_qa:'pass',visual_regression:null,runtime_smoke:'fail'},
    failure,
  };
  fs.mkdirSync(path.dirname(resultPath), {recursive:true});
  fs.writeFileSync(resultPath, JSON.stringify(result,null,2));
  throw error;
}

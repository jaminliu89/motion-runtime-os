import fs from 'node:fs';
import path from 'node:path';

const irPath = process.argv[2] ?? 'examples/cinematic-intro/motion-ir.json';
const remotionResultPath = process.argv[3] ?? 'out/cinematic-intro.render-result.json';
const hyperResultPath = process.argv[4] ?? 'out/hyperframes/cinematic-intro.render-result.json';
const hyperCompilePath = process.argv[5] ?? 'out/hyperframes/project/compile-report.json';
const outPath = process.argv[6] ?? 'out/cross-provider-semantic-qa.json';

const read = (p) => JSON.parse(fs.readFileSync(p,'utf8'));
const ir = read(irPath);
const remotion = read(remotionResultPath);
const hyper = read(hyperResultPath);
const compile = read(hyperCompilePath);
const failures = [];
const checks = [];

const pass = (name, details={}) => checks.push({name,status:'pass',...details});
const fail = (name, reason, details={}) => { checks.push({name,status:'fail',reason,...details}); failures.push(`${name}: ${reason}`); };

if (remotion.status === 'done' && hyper.status === 'done') pass('both_providers_rendered');
else fail('both_providers_rendered','one or more provider results are not done');

const expectedDuration = (ir.scenes ?? []).reduce((sum,s)=>sum+Number(s.duration||0),0);
const mapped = new Map((compile.semantic_mappings ?? []).map((m)=>[m.feature,m]));
const warningFeatures = new Set((compile.warnings ?? []).map((w)=>w.feature));

for (const scene of ir.scenes ?? []) {
  if (scene.camera?.movement === 'subtle-push-in') {
    const key = `${scene.id}.camera.subtle-push-in`;
    mapped.has(key) && !warningFeatures.has(key) ? pass(key,{mechanism:mapped.get(key).mechanism}) : fail(key,'camera semantic not mapped cleanly');
  }
  for (const layer of scene.layers ?? []) {
    if (layer.enter?.type === 'blur-fade-rise') {
      const key = `${layer.id}.enter.blur-fade-rise`;
      mapped.has(key) && !warningFeatures.has(key) ? pass(key,{mechanism:mapped.get(key).mechanism}) : fail(key,'entrance semantic not mapped cleanly');
    }
    if (layer.exit?.type === 'fade') {
      const key = `${layer.id}.exit.fade`;
      mapped.has(key) && !warningFeatures.has(key) ? pass(key,{mechanism:mapped.get(key).mechanism}) : fail(key,'exit semantic not mapped cleanly');
    }
    if (layer.type === 'light' && layer.transform?.from === 'left' && layer.transform?.to === 'right') {
      const key = `${layer.id}.transform.left-to-right`;
      mapped.has(key) && !warningFeatures.has(key) ? pass(key,{mechanism:mapped.get(key).mechanism}) : fail(key,'directional light semantic not mapped cleanly');
    }
  }
  for (const cue of scene.subtitle_cues ?? []) {
    const key = `${cue.id}.subtitle_visibility`;
    const m = mapped.get(key);
    if (!m) fail(key,'subtitle timing mapping missing');
    else if (Math.abs(m.start-cue.start) > 0.001 || Math.abs(m.end-cue.end) > 0.001) fail(key,'subtitle timing differs from IR',{mapped:m,expected:{start:cue.start,end:cue.end}});
    else pass(key,{start:m.start,end:m.end});
  }
  for (const track of scene.audio_tracks ?? []) {
    const key = `${track.id}.audio_window`;
    const m = mapped.get(key);
    if (!m) fail(key,'audio timing mapping missing');
    else if (Math.abs(m.start-track.start) > 0.001 || Math.abs(m.end-(track.end ?? scene.duration)) > 0.001) fail(key,'audio timing differs from IR',{mapped:m});
    else pass(key,{start:m.start,end:m.end});
  }
}

if ((compile.warnings ?? []).length === 0) pass('hyperframes_compile_warnings_zero');
else fail('hyperframes_compile_warnings_zero',`${compile.warnings.length} compile warning(s) remain`,{warnings:compile.warnings});

if (remotion.evidence?.runtime_smoke === 'pass' && hyper.evidence?.runtime_smoke === 'pass') pass('runtime_smoke_both');
else fail('runtime_smoke_both','runtime smoke evidence missing');

const report = {
  schema_version:1,
  source_ir:irPath,
  expected_duration_seconds:expectedDuration,
  providers:[remotion.provider,hyper.provider],
  semantic_equivalence_proven:failures.length===0,
  pixel_identity_required:false,
  checks,
  failures,
  note:'Semantic QA proves timing and motion-intent mappings across providers; it intentionally does not require pixel-identical frames.'
};
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(report,null,2));
console.log(`Cross-provider semantic QA: ${report.semantic_equivalence_proven ? 'PASS' : 'FAIL'} → ${outPath}`);
if (failures.length) process.exitCode=1;

import fs from 'node:fs';

const paths = process.argv.slice(2);
if (paths.length === 0) paths.push('examples/cinematic-intro/motion-ir.json');
let totalFailures = 0;

for (const path of paths) {
  const ir = JSON.parse(fs.readFileSync(path, 'utf8'));
  const failures = [];
  const warnings = [];
  if (!ir.scenes?.length) failures.push('missing scenes');
  if (ir.canvas?.fps !== 30) warnings.push('non-30fps fixture; verify provider support and timing expectations');

  for (const scene of ir.scenes ?? []) {
    if (!scene.layers?.length) warnings.push(`${scene.id}: scene has no layers`);
    for (const layer of scene.layers ?? []) {
      if (layer.type === 'text' && layer.safe_area !== true) failures.push(`${scene.id}/${layer.id}: text layer must opt into safe_area`);
      if (layer.type === 'text' && (!layer.content || layer.content.trim().length === 0)) failures.push(`${scene.id}/${layer.id}: text content is empty`);
      if (layer.end - layer.start < 0.15) warnings.push(`${scene.id}/${layer.id}: visibility window is very short`);
      if ((layer.z ?? 0) > 1000 || (layer.z ?? 0) < -1000) warnings.push(`${scene.id}/${layer.id}: extreme z index`);
    }
    const cueIds = new Set();
    for (const cue of scene.audio_cues ?? []) {
      if (cueIds.has(cue.id)) failures.push(`${scene.id}: duplicate audio cue ${cue.id}`);
      cueIds.add(cue.id);
      if (!(cue.time >= 0 && cue.time <= scene.duration)) failures.push(`${scene.id}/${cue.id}: audio cue out of scene range`);
    }
  }

  for (const warning of warnings) console.warn(`WARN ${path}: ${warning}`);
  if (failures.length) {
    totalFailures += failures.length;
    for (const failure of failures) console.error(`FAIL ${path}: ${failure}`);
  } else {
    console.log(`Static Motion QA passed: ${path}`);
  }
}

if (totalFailures > 0) process.exit(1);

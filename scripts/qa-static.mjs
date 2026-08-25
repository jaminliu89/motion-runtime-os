import fs from 'node:fs';

const ir = JSON.parse(fs.readFileSync('examples/cinematic-intro/motion-ir.json', 'utf8'));
const failures = [];
const warnings = [];
const scene = ir.scenes?.[0];

if (!scene) failures.push('missing first scene');
if (ir.canvas.width !== 1920 || ir.canvas.height !== 1080) warnings.push('walking skeleton is expected to target 1920x1080');
if (ir.canvas.fps !== 30) warnings.push('walking skeleton is expected to use 30fps');

for (const layer of scene?.layers ?? []) {
  if (layer.type === 'text' && layer.safe_area !== true) failures.push(`${layer.id}: text layer must opt into safe_area`);
  if (layer.type === 'text' && (!layer.content || layer.content.trim().length === 0)) failures.push(`${layer.id}: text content is empty`);
  if (layer.end - layer.start < 0.15) warnings.push(`${layer.id}: visibility window is very short`);
}

const cueIds = new Set();
for (const cue of scene?.audio_cues ?? []) {
  if (cueIds.has(cue.id)) failures.push(`duplicate audio cue ${cue.id}`);
  cueIds.add(cue.id);
  if (!(cue.time >= 0 && cue.time <= scene.duration)) failures.push(`${cue.id}: audio cue out of scene range`);
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('Static Motion QA passed');

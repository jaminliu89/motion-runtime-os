import fs from 'node:fs';

const paths = process.argv.slice(2);
if (paths.length === 0) paths.push('examples/cinematic-intro/motion-ir.json');
let totalFailures = 0;

for (const path of paths) {
  const ir = JSON.parse(fs.readFileSync(path, 'utf8'));
  const failures = [];
  if (ir.version !== '1.0') failures.push('version must be 1.0');
  if (!ir.canvas || !Number.isFinite(ir.canvas.fps) || ir.canvas.fps <= 0) failures.push('canvas.fps must be > 0');
  if (!Number.isInteger(ir.canvas?.width) || !Number.isInteger(ir.canvas?.height)) failures.push('canvas dimensions must be integers');
  if (!Array.isArray(ir.scenes) || ir.scenes.length === 0) failures.push('at least one scene is required');
  const sceneIds = new Set();
  for (const scene of ir.scenes ?? []) {
    if (!scene.id) failures.push('scene.id is required');
    if (sceneIds.has(scene.id)) failures.push(`duplicate scene id ${scene.id}`);
    sceneIds.add(scene.id);
    if (!Number.isFinite(scene.duration) || scene.duration <= 0) failures.push(`${scene.id}: duration must be > 0`);
    const ids = new Set();
    for (const layer of scene.layers ?? []) {
      if (!layer.id) failures.push(`${scene.id}: layer.id is required`);
      if (ids.has(layer.id)) failures.push(`${scene.id}: duplicate layer id ${layer.id}`);
      ids.add(layer.id);
      if (!(layer.start >= 0 && layer.end > layer.start && layer.end <= scene.duration)) failures.push(`${scene.id}/${layer.id}: invalid start/end window`);
    }
  }
  if (failures.length) {
    totalFailures += failures.length;
    console.error(`Motion IR validation failed: ${path}`);
    for (const failure of failures) console.error(`- ${failure}`);
  } else {
    console.log(`Motion IR valid: ${path}`);
  }
}

if (totalFailures > 0) process.exit(1);

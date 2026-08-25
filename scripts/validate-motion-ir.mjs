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
    for (const cue of scene.subtitle_cues ?? []) {
      if (!cue.id || !cue.text?.trim()) failures.push(`${scene.id}: subtitle cue requires id/text`);
      if (!(cue.start >= 0 && cue.end > cue.start && cue.end <= scene.duration)) failures.push(`${scene.id}/${cue.id}: invalid subtitle window`);
    }
    for (const cue of scene.audio_cues ?? []) {
      if (!(cue.time >= 0 && cue.time <= scene.duration)) failures.push(`${scene.id}/${cue.id}: audio cue outside scene`);
    }
    for (const track of scene.audio_tracks ?? []) {
      if (!track.id || !track.asset_ref) failures.push(`${scene.id}: audio track requires id/asset_ref`);
      if (!(track.start >= 0 && track.start <= scene.duration)) failures.push(`${scene.id}/${track.id}: invalid audio start`);
      if (track.end != null && !(track.end > track.start && track.end <= scene.duration)) failures.push(`${scene.id}/${track.id}: invalid audio end`);
      if (track.volume != null && !(track.volume >= 0 && track.volume <= 1)) failures.push(`${scene.id}/${track.id}: volume must be 0..1`);
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

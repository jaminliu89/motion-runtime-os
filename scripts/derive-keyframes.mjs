import fs from 'node:fs';

const ir = JSON.parse(fs.readFileSync('examples/cinematic-intro/motion-ir.json', 'utf8'));
const fps = ir.canvas.fps;
const frames = new Set([0]);
let sceneOffset = 0;
for (const scene of ir.scenes) {
  frames.add(Math.round(sceneOffset));
  frames.add(Math.max(0, Math.round(sceneOffset + scene.duration * fps - 1)));
  for (const layer of scene.layers ?? []) {
    frames.add(Math.round(sceneOffset + layer.start * fps));
    frames.add(Math.round(sceneOffset + ((layer.start + layer.end) / 2) * fps));
    frames.add(Math.max(0, Math.round(sceneOffset + layer.end * fps - 1)));
  }
  for (const cue of scene.audio_cues ?? []) frames.add(Math.round(sceneOffset + cue.time * fps));
  sceneOffset += scene.duration * fps;
}
const result = {
  source: 'examples/cinematic-intro/motion-ir.json',
  fps,
  frames: [...frames].sort((a,b)=>a-b)
};
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/cinematic-intro.keyframes.json', JSON.stringify(result, null, 2));
console.log(`Derived ${result.frames.length} deterministic keyframes`);

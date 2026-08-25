import fs from 'node:fs';
import path from 'node:path';

const [irPath = 'examples/cinematic-intro/motion-ir.json', projectDir = 'out/hyperframes/project'] = process.argv.slice(2);
const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
const escapeHtml = (s='') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const safeId = (s='item') => String(s).replace(/[^a-zA-Z0-9_-]+/g,'-');
const totalDuration = ir.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
const warnings = [];
const clips = [];
let sceneOffset = 0;

for (const scene of ir.scenes ?? []) {
  clips.push(`<div id="scene-${safeId(scene.id)}-background" class="clip bg" data-start="${sceneOffset}" data-duration="${scene.duration}" data-track-index="0"></div>`);
  for (const layer of scene.layers ?? []) {
    const start = sceneOffset + layer.start;
    const duration = Math.max(0.001, layer.end - layer.start);
    const id = `layer-${safeId(scene.id)}-${safeId(layer.id)}`;
    if (layer.type === 'text') {
      clips.push(`<div id="${id}" class="clip title" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 10}">${escapeHtml(layer.content)}</div>`);
      if (layer.enter?.type) warnings.push({feature:`${layer.id}.enter.${layer.enter.type}`,status:'downgraded',reason:'HyperFrames v1 compiler maps timing/content but not provider-specific entrance animation yet'});
      if (layer.exit?.type) warnings.push({feature:`${layer.id}.exit.${layer.exit.type}`,status:'downgraded',reason:'HyperFrames v1 compiler maps timing/content but not provider-specific exit animation yet'});
    } else if (layer.type === 'light') {
      clips.push(`<div id="${id}" class="clip light-cut" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 20}"></div>`);
      warnings.push({feature:`${layer.id}.transform`,status:'downgraded',reason:'Light is represented as timed strip; directional motion is deferred to seekable animation adapter'});
    } else {
      warnings.push({feature:`${layer.id}.${layer.type}`,status:'unsupported',reason:'Layer type not mapped by HyperFrames v1 compiler'});
    }
  }
  for (const cue of scene.subtitle_cues ?? []) {
    clips.push(`<div id="subtitle-${safeId(scene.id)}-${safeId(cue.id)}" class="clip subtitle" data-start="${sceneOffset + cue.start}" data-duration="${Math.max(0.001,cue.end-cue.start)}" data-track-index="100">${escapeHtml(cue.text)}</div>`);
  }
  for (const track of scene.audio_tracks ?? []) {
    const src = `./assets/${path.basename(track.asset_ref)}`;
    clips.push(`<audio id="audio-${safeId(scene.id)}-${safeId(track.id)}" data-start="${sceneOffset + track.start}" data-duration="${Math.max(0.001,(track.end ?? scene.duration)-track.start)}" data-track-index="200" data-volume="${track.volume ?? 1}" src="${src}"></audio>`);
  }
  if (scene.camera?.movement && scene.camera.movement !== 'none') warnings.push({feature:`${scene.id}.camera.${scene.camera.movement}`,status:'downgraded',reason:'Camera semantics not mapped in HyperFrames v1 compiler'});
  sceneOffset += scene.duration;
}

fs.mkdirSync(path.join(projectDir,'assets'), {recursive:true});
for (const scene of ir.scenes ?? []) {
  for (const track of scene.audio_tracks ?? []) {
    const source = path.join('public', track.asset_ref);
    const dest = path.join(projectDir,'assets',path.basename(track.asset_ref));
    if (!fs.existsSync(source)) throw new Error(`Missing audio asset for HyperFrames compile: ${source}`);
    fs.copyFileSync(source,dest);
  }
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${ir.canvas.background ?? '#000'};font-family:Inter,Arial,sans-serif}
[data-composition-id]{position:relative;overflow:hidden;background:${ir.canvas.background ?? '#000'};color:white}
.clip{position:absolute;box-sizing:border-box}
.bg{inset:0;background:${ir.canvas.background ?? '#000'};z-index:0}
.title{inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;letter-spacing:.08em;font-weight:400;z-index:10}
.subtitle{left:0;right:0;bottom:64px;text-align:center;font-size:26px;z-index:100}
.light-cut{top:-10%;bottom:-10%;left:50%;width:3px;background:white;box-shadow:0 0 24px 8px rgba(255,255,255,.55);transform:rotate(7deg);z-index:20}
</style></head><body>
<div id="motion-runtime-root" data-composition-id="motion-runtime" data-no-timeline data-width="${ir.canvas.width}" data-height="${ir.canvas.height}" data-fps="${ir.canvas.fps}" data-duration="${totalDuration}">
${clips.join('\n')}
</div></body></html>`;

fs.writeFileSync(path.join(projectDir,'index.html'), html);
const report = {provider:'hyperframes',compiler_version:'0.2.0',source_ir:irPath,total_duration:totalDuration,fps:ir.canvas.fps,warnings};
fs.writeFileSync(path.join(projectDir,'compile-report.json'), JSON.stringify(report,null,2));
console.log(`HyperFrames project compiled: ${projectDir}`);
console.log(`Compile warnings: ${warnings.length}`);

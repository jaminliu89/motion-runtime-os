import fs from 'node:fs';
import path from 'node:path';

const [irPath = 'examples/cinematic-intro/motion-ir.json', projectDir = 'out/hyperframes/project'] = process.argv.slice(2);
const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
const escapeHtml = (s='') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const safeId = (s='item') => String(s).replace(/[^a-zA-Z0-9_-]+/g,'-');
const totalDuration = ir.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
const warnings = [];
const clips = [];
const timeline = [];
const semanticMappings = [];
const mediaAssets = [];
let sceneOffset = 0;

for (const scene of ir.scenes ?? []) {
  clips.push(`<div id="scene-${safeId(scene.id)}-background" class="clip bg" data-start="${sceneOffset}" data-duration="${scene.duration}" data-track-index="0"></div>`);

  if (scene.camera?.movement === 'subtle-push-in') {
    const selector = '#motion-runtime-stage';
    timeline.push(`tl.fromTo(${JSON.stringify(selector)}, {scale:1}, {scale:1.035,duration:${scene.duration},ease:'none',immediateRender:false}, ${sceneOffset});`);
    semanticMappings.push({feature:`${scene.id}.camera.subtle-push-in`,status:'mapped',mechanism:'gsap-scale',start:sceneOffset,end:sceneOffset+scene.duration});
  } else if (scene.camera?.movement && scene.camera.movement !== 'none') {
    warnings.push({feature:`${scene.id}.camera.${scene.camera.movement}`,status:'unsupported',reason:'Camera movement not mapped by HyperFrames compiler'});
  }

  for (const layer of scene.layers ?? []) {
    const start = sceneOffset + layer.start;
    const duration = Math.max(0.001, layer.end - layer.start);
    const id = `layer-${safeId(scene.id)}-${safeId(layer.id)}`;
    if (layer.type === 'text') {
      const innerId = `${id}-inner`;
      clips.push(`<div id="${id}" class="clip title-shell" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 10}"><div id="${innerId}" class="title-inner">${escapeHtml(layer.content)}</div></div>`);
      const selector = `#${innerId}`;
      if (layer.enter?.type === 'blur-fade-rise') {
        const enterDuration = Math.max(0.001, Number(layer.enter.duration ?? 0.6));
        timeline.push(`tl.fromTo(${JSON.stringify(selector)}, {opacity:0,y:36,filter:'blur(14px)'}, {opacity:1,y:0,filter:'blur(0px)',duration:${enterDuration},ease:'power3.out',immediateRender:false}, ${start});`);
        semanticMappings.push({feature:`${layer.id}.enter.blur-fade-rise`,status:'mapped',mechanism:'gsap-opacity-y-filter',start,end:start+enterDuration});
      } else if (layer.enter?.type) {
        warnings.push({feature:`${layer.id}.enter.${layer.enter.type}`,status:'unsupported',reason:'Entrance animation not mapped by HyperFrames compiler'});
      }
      if (layer.exit?.type === 'fade') {
        const exitDuration = Math.max(0.001, Number(layer.exit.duration ?? 0.35));
        const exitStart = Math.max(start, sceneOffset + layer.end - exitDuration);
        timeline.push(`tl.to(${JSON.stringify(selector)}, {opacity:0,duration:${exitDuration},ease:'power2.in'}, ${exitStart});`);
        semanticMappings.push({feature:`${layer.id}.exit.fade`,status:'mapped',mechanism:'gsap-opacity',start:exitStart,end:sceneOffset+layer.end});
      } else if (layer.exit?.type) {
        warnings.push({feature:`${layer.id}.exit.${layer.exit.type}`,status:'unsupported',reason:'Exit animation not mapped by HyperFrames compiler'});
      }
    } else if (layer.type === 'light') {
      const innerId = `${id}-inner`;
      clips.push(`<div id="${id}" class="clip light-shell" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 20}"><div id="${innerId}" class="light-inner"></div></div>`);
      const selector = `#${innerId}`;
      const from = layer.transform?.from ?? 'left';
      const to = layer.transform?.to ?? 'right';
      if (from === 'left' && to === 'right') {
        timeline.push(`tl.fromTo(${JSON.stringify(selector)}, {xPercent:-4200}, {xPercent:4200,duration:${duration},ease:'power4.inOut',immediateRender:false}, ${start});`);
        semanticMappings.push({feature:`${layer.id}.transform.left-to-right`,status:'mapped',mechanism:'gsap-xPercent',start,end:start+duration});
      } else {
        warnings.push({feature:`${layer.id}.transform.${from}-to-${to}`,status:'unsupported',reason:'Directional light mapping currently supports left-to-right'});
      }
    } else if (layer.type === 'video') {
      if (!layer.asset_ref) {
        warnings.push({feature:`${layer.id}.video`,status:'unsupported',reason:'Video layer missing asset_ref'});
      } else {
        const filename = path.basename(layer.asset_ref);
        clips.push(`<video id="${id}" class="clip source-video" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? -100}" src="./assets/${escapeHtml(filename)}"></video>`);
        mediaAssets.push({source:path.join('public',layer.asset_ref),dest:path.join(projectDir,'assets',filename),kind:'video'});
        semanticMappings.push({feature:`${layer.id}.video_window`,status:'mapped',mechanism:'hyperframes-media-timing',start,end:start+duration});
      }
    } else if (layer.type === 'background') {
      clips.push(`<div id="${id}" class="clip bg" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 0}" style="background:${escapeHtml(layer.content ?? ir.canvas.background ?? '#000')}"></div>`);
    } else {
      warnings.push({feature:`${layer.id}.${layer.type}`,status:'unsupported',reason:'Layer type not mapped by HyperFrames compiler'});
    }
  }
  for (const cue of scene.subtitle_cues ?? []) {
    clips.push(`<div id="subtitle-${safeId(scene.id)}-${safeId(cue.id)}" class="clip subtitle" data-start="${sceneOffset + cue.start}" data-duration="${Math.max(0.001,cue.end-cue.start)}" data-track-index="100">${escapeHtml(cue.text)}</div>`);
    semanticMappings.push({feature:`${cue.id}.subtitle_visibility`,status:'mapped',mechanism:'hyperframes-clip-timing',start:sceneOffset+cue.start,end:sceneOffset+cue.end});
  }
  for (const track of scene.audio_tracks ?? []) {
    const filename = path.basename(track.asset_ref);
    clips.push(`<audio id="audio-${safeId(scene.id)}-${safeId(track.id)}" data-start="${sceneOffset + track.start}" data-duration="${Math.max(0.001,(track.end ?? scene.duration)-track.start)}" data-track-index="200" data-volume="${track.volume ?? 1}" src="./assets/${filename}"></audio>`);
    mediaAssets.push({source:path.join('public',track.asset_ref),dest:path.join(projectDir,'assets',filename),kind:'audio'});
    semanticMappings.push({feature:`${track.id}.audio_window`,status:'mapped',mechanism:'hyperframes-media-timing',start:sceneOffset+track.start,end:sceneOffset+(track.end ?? scene.duration)});
  }
  sceneOffset += scene.duration;
}

fs.mkdirSync(path.join(projectDir,'assets'), {recursive:true});
for (const asset of mediaAssets) {
  if (!fs.existsSync(asset.source)) throw new Error(`Missing ${asset.kind} asset for HyperFrames compile: ${asset.source}`);
  fs.copyFileSync(asset.source,asset.dest);
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${ir.canvas.background ?? '#000'};font-family:Inter,Arial,sans-serif}
[data-composition-id]{position:relative;overflow:hidden;background:${ir.canvas.background ?? '#000'};color:white}
#motion-runtime-stage{position:absolute;inset:0;transform-origin:center center}
.clip{position:absolute;box-sizing:border-box}
.bg{inset:0;background:${ir.canvas.background ?? '#000'};z-index:0}
.source-video{inset:0;width:100%;height:100%;object-fit:cover;z-index:-100}
.title-shell{inset:0;display:flex;align-items:center;justify-content:center;z-index:10}
.title-inner{font-size:64px;letter-spacing:.08em;font-weight:400;text-align:center;will-change:transform,opacity,filter}
.subtitle{left:5%;right:5%;bottom:64px;text-align:center;font-size:26px;z-index:100;background:rgba(0,0,0,.55);padding:10px 14px;border-radius:10px}
.light-shell{inset:0;overflow:visible;z-index:20;pointer-events:none}
.light-inner{position:absolute;top:-10%;bottom:-10%;left:50%;width:3px;background:white;box-shadow:0 0 24px 8px rgba(255,255,255,.55);transform:rotate(7deg);will-change:transform}
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
</head><body>
<div id="motion-runtime-root" data-composition-id="motion-runtime" data-width="${ir.canvas.width}" data-height="${ir.canvas.height}" data-fps="${ir.canvas.fps}" data-duration="${totalDuration}">
<div id="motion-runtime-stage">${clips.join('\n')}</div>
</div>
<script>
const tl = gsap.timeline({paused:true});
${timeline.join('\n')}
window.__timelines = window.__timelines || {};
window.__timelines['motion-runtime'] = tl;
</script>
</body></html>`;

fs.writeFileSync(path.join(projectDir,'index.html'), html);
const report = {provider:'hyperframes',compiler_version:'0.4.0',source_ir:irPath,total_duration:totalDuration,fps:ir.canvas.fps,warnings,semantic_mappings:semanticMappings};
fs.writeFileSync(path.join(projectDir,'compile-report.json'), JSON.stringify(report,null,2));
console.log(`HyperFrames project compiled: ${projectDir}`);
console.log(`Compile warnings: ${warnings.length}`);
console.log(`Semantic mappings: ${semanticMappings.length}`);

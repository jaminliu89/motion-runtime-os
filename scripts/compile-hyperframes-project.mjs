import fs from 'node:fs';
import path from 'node:path';

const [irPath = 'examples/cinematic-intro/motion-ir.json', projectDir = 'out/hyperframes/project'] = process.argv.slice(2);
const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
const escapeHtml = (s='') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const safeId = (s='item') => String(s).replace(/[^a-zA-Z0-9_-]+/g,'-');
const totalDuration = ir.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
const warnings = [], clips = [], timeline = [], semanticMappings = [], mediaAssets = [];
let sceneOffset = 0;

const addMapping = (feature, mechanism, start, end) => semanticMappings.push({feature,status:'mapped',mechanism,start,end});
const addWarning = (feature, reason) => warnings.push({feature,status:'unsupported',reason});

function textClip({id,start,duration,z,content,style={}}) {
  const innerId = `${id}-inner`;
  const kind = style.mg_kind ?? 'text';
  const fontSize = Number(style.fontSize ?? (kind === 'number_counter' ? 190 : kind === 'hero_text' ? 104 : 64));
  clips.push(`<div id="${id}" class="clip title-shell mg-${safeId(kind)}" data-start="${start}" data-duration="${duration}" data-track-index="${z}"><div id="${innerId}" class="title-inner" style="font-size:${fontSize}px">${escapeHtml(content)}</div></div>`);
  return {innerId,kind};
}

function shapeClip(layer, start, duration, id) {
  const style = layer.style ?? {};
  const kind = style.mg_kind ?? 'shape';
  if (kind === 'veil') {
    clips.push(`<div id="${id}" class="clip mg-veil" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 5}" style="opacity:${Number(style.opacity ?? .5)}"></div>`);
    addMapping(`${layer.id}.mg.veil`, 'css-overlay', start, start+duration);
    return true;
  }
  if (kind === 'bar_chart') {
    const bars = Array.isArray(style.bars) ? style.bars : [.3,.55,.8,1];
    const barHtml = bars.map((v,i)=>`<div class="mg-bar" data-v="${Number(v)}" style="height:${Math.max(4,Number(v)*100)}%"><span>${i+1}</span></div>`).join('');
    clips.push(`<div id="${id}" class="clip mg-card mg-chart" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 25}"><div class="mg-label">${escapeHtml(style.label ?? layer.content ?? '')}</div><div class="mg-bars">${barHtml}</div></div>`);
    timeline.push(`tl.fromTo('#${id} .mg-bar',{scaleY:0,transformOrigin:'bottom'},{scaleY:1,duration:${Math.min(.8,duration*.35)},stagger:.08,ease:'power3.out',immediateRender:false},${start});`);
    addMapping(`${layer.id}.mg.bar_chart`, 'html-css+gsap-bars', start, start+duration);
    return true;
  }
  if (kind === 'comparison') {
    clips.push(`<div id="${id}" class="clip mg-card mg-comparison" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 24}"><div class="mg-side left">${escapeHtml(style.left ?? '过去')}</div><div class="mg-vs">VS</div><div class="mg-side right">${escapeHtml(style.right ?? '现在')}</div></div>`);
    timeline.push(`tl.fromTo('#${id} .left',{x:-120,opacity:0},{x:0,opacity:1,duration:.45,ease:'power3.out',immediateRender:false},${start});`);
    timeline.push(`tl.fromTo('#${id} .right',{x:120,opacity:0},{x:0,opacity:1,duration:.45,ease:'power3.out',immediateRender:false},${start});`);
    addMapping(`${layer.id}.mg.comparison`, 'html-css+gsap-split', start, start+duration);
    return true;
  }
  if (kind === 'process_flow') {
    const nodes = Array.isArray(style.nodes) ? style.nodes : ['问题','判断','结果'];
    const nodeHtml = nodes.map((n,i)=>`${i?'<span class="mg-arrow">→</span>':''}<div class="mg-node">${escapeHtml(n)}</div>`).join('');
    clips.push(`<div id="${id}" class="clip mg-card mg-flow" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 26}">${nodeHtml}</div>`);
    timeline.push(`tl.fromTo('#${id} .mg-node',{opacity:0,y:24},{opacity:1,y:0,duration:.38,stagger:.16,ease:'power2.out',immediateRender:false},${start});`);
    addMapping(`${layer.id}.mg.process_flow`, 'html-css+gsap-node-flow', start, start+duration);
    return true;
  }
  addWarning(`${layer.id}.shape.${kind}`, 'MG shape kind not mapped by HyperFrames compiler');
  return false;
}

for (const scene of ir.scenes ?? []) {
  clips.push(`<div id="scene-${safeId(scene.id)}-background" class="clip bg" data-start="${sceneOffset}" data-duration="${scene.duration}" data-track-index="0"></div>`);
  if (scene.camera?.movement === 'subtle-push-in') {
    timeline.push(`tl.fromTo('#motion-runtime-stage',{scale:1},{scale:1.035,duration:${scene.duration},ease:'none',immediateRender:false},${sceneOffset});`);
    addMapping(`${scene.id}.camera.subtle-push-in`, 'gsap-scale', sceneOffset, sceneOffset+scene.duration);
  } else if (scene.camera?.movement && scene.camera.movement !== 'none') addWarning(`${scene.id}.camera.${scene.camera.movement}`, 'Camera movement not mapped');

  for (const layer of scene.layers ?? []) {
    const start = sceneOffset + Number(layer.start ?? 0);
    const duration = Math.max(.001, Number(layer.end ?? 0)-Number(layer.start ?? 0));
    const id = `layer-${safeId(scene.id)}-${safeId(layer.id)}`;
    if (layer.type === 'text') {
      const {innerId,kind} = textClip({id,start,duration,z:layer.z ?? 10,content:layer.content ?? '',style:layer.style});
      const selector = `#${innerId}`;
      const enterType = layer.enter?.type;
      const enterDuration = Math.max(.001, Number(layer.enter?.duration ?? .6));
      if (enterType === 'blur-fade-rise') timeline.push(`tl.fromTo('${selector}',{opacity:0,y:36,filter:'blur(14px)'},{opacity:1,y:0,filter:'blur(0px)',duration:${enterDuration},ease:'power3.out',immediateRender:false},${start});`);
      else if (enterType === 'scale-count') timeline.push(`tl.fromTo('${selector}',{opacity:0,scale:.35},{opacity:1,scale:1,duration:${enterDuration},ease:'back.out(1.7)',immediateRender:false},${start});`);
      else if (enterType) addWarning(`${layer.id}.enter.${enterType}`, 'Entrance animation not mapped');
      if (enterType === 'blur-fade-rise' || enterType === 'scale-count') addMapping(`${layer.id}.enter.${enterType}`, `gsap-${enterType}`, start, start+enterDuration);
      if (layer.exit?.type === 'fade') {
        const d=Math.max(.001,Number(layer.exit.duration ?? .35)), clipEnd=sceneOffset+Number(layer.end), s=Math.max(start,clipEnd-d);
        timeline.push(`tl.to('${selector}',{opacity:0,duration:${d},ease:'power2.in'},${s});`);
        timeline.push(`tl.set('${selector}',{opacity:0},${clipEnd});`);
        addMapping(`${layer.id}.exit.fade`, 'gsap-opacity+hard-kill', s, clipEnd);
      } else if (layer.exit?.type) addWarning(`${layer.id}.exit.${layer.exit.type}`, 'Exit animation not mapped');
      if (kind !== 'text') addMapping(`${layer.id}.mg.${kind}`, 'styled-html-text', start, start+duration);
    } else if (layer.type === 'shape') {
      shapeClip(layer, start, duration, id);
    } else if (layer.type === 'light') {
      const innerId=`${id}-inner`;
      clips.push(`<div id="${id}" class="clip light-shell" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 20}"><div id="${innerId}" class="light-inner"></div></div>`);
      const from=layer.transform?.from ?? 'left', to=layer.transform?.to ?? 'right';
      if (from==='left'&&to==='right') {
        timeline.push(`tl.fromTo('#${innerId}',{xPercent:-4200},{xPercent:4200,duration:${duration},ease:'power4.inOut',immediateRender:false},${start});`);
        addMapping(`${layer.id}.transform.left-to-right`,'gsap-xPercent',start,start+duration);
      } else addWarning(`${layer.id}.transform.${from}-to-${to}`,'Directional light mapping supports left-to-right');
    } else if (layer.type === 'video') {
      if (!layer.asset_ref) addWarning(`${layer.id}.video`,'Video layer missing asset_ref');
      else {
        const filename=path.basename(layer.asset_ref);
        clips.push(`<video id="${id}" class="clip source-video" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? -100}" data-has-audio="true" src="./assets/${escapeHtml(filename)}"></video>`);
        mediaAssets.push({source:path.join('public',layer.asset_ref),dest:path.join(projectDir,'assets',filename),kind:'video'});
        addMapping(`${layer.id}.video_window`,'hyperframes-media-timing+embedded-audio',start,start+duration);
      }
    } else if (layer.type === 'background') {
      clips.push(`<div id="${id}" class="clip bg" data-start="${start}" data-duration="${duration}" data-track-index="${layer.z ?? 0}" style="background:${escapeHtml(layer.content ?? ir.canvas.background ?? '#000')}"></div>`);
    } else addWarning(`${layer.id}.${layer.type}`,'Layer type not mapped by HyperFrames compiler');
  }
  for (const cue of scene.subtitle_cues ?? []) {
    const start=sceneOffset+Number(cue.start), end=sceneOffset+Number(cue.end);
    clips.push(`<div id="subtitle-${safeId(scene.id)}-${safeId(cue.id)}" class="clip subtitle" data-start="${start}" data-duration="${Math.max(.001,end-start)}" data-track-index="100">${escapeHtml(cue.text)}</div>`);
    addMapping(`${cue.id}.subtitle_visibility`,'hyperframes-clip-timing',start,end);
  }
  for (const track of scene.audio_tracks ?? []) {
    const filename=path.basename(track.asset_ref), start=sceneOffset+Number(track.start), end=sceneOffset+Number(track.end ?? scene.duration);
    clips.push(`<audio id="audio-${safeId(scene.id)}-${safeId(track.id)}" data-start="${start}" data-duration="${Math.max(.001,end-start)}" data-track-index="200" data-volume="${track.volume ?? 1}" src="./assets/${filename}"></audio>`);
    mediaAssets.push({source:path.join('public',track.asset_ref),dest:path.join(projectDir,'assets',filename),kind:'audio'});
    addMapping(`${track.id}.audio_window`,'hyperframes-media-timing',start,end);
  }
  sceneOffset += Number(scene.duration ?? 0);
}

fs.mkdirSync(path.join(projectDir,'assets'), {recursive:true});
for (const asset of mediaAssets) {
  if (!fs.existsSync(asset.source)) throw new Error(`Missing ${asset.kind} asset for HyperFrames compile: ${asset.source}`);
  fs.copyFileSync(asset.source,asset.dest);
}

const html=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${ir.canvas.background ?? '#000'};font-family:Inter,Arial,sans-serif}[data-composition-id]{position:relative;overflow:hidden;background:${ir.canvas.background ?? '#000'};color:white}#motion-runtime-stage{position:absolute;inset:0;transform-origin:center}.clip{position:absolute;box-sizing:border-box}.bg{inset:0;background:${ir.canvas.background ?? '#000'}}.source-video{inset:0;width:100%;height:100%;object-fit:cover}.title-shell{inset:0;display:flex;align-items:center;justify-content:center;padding:8%;}.title-inner{font-weight:650;text-align:center;will-change:transform,opacity,filter;text-shadow:0 8px 40px rgba(0,0,0,.6)}.mg-number_counter .title-inner{font-weight:800}.subtitle{left:5%;right:5%;bottom:64px;text-align:center;font-size:26px;background:rgba(0,0,0,.55);padding:10px 14px;border-radius:10px}.light-shell{inset:0;overflow:visible;pointer-events:none}.light-inner{position:absolute;top:-10%;bottom:-10%;left:50%;width:3px;background:white;box-shadow:0 0 24px 8px rgba(255,255,255,.55);transform:rotate(7deg)}.mg-veil{inset:0;background:#050505}.mg-card{left:8%;right:8%;top:22%;bottom:22%;border:1px solid rgba(255,255,255,.25);border-radius:28px;background:rgba(9,10,12,.76);backdrop-filter:blur(18px);padding:42px}.mg-label{font-size:42px;font-weight:650;margin-bottom:28px}.mg-bars{height:70%;display:flex;align-items:flex-end;gap:18px}.mg-bar{flex:1;min-height:4%;border-radius:14px 14px 4px 4px;background:linear-gradient(180deg,#fff,#8b8f98);position:relative}.mg-bar span{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:#111;font-size:20px}.mg-comparison{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:26px}.mg-side{padding:44px 20px;text-align:center;border-radius:20px;background:rgba(255,255,255,.08);font-size:48px;font-weight:700}.mg-vs{font-size:22px;opacity:.55}.mg-flow{display:flex;align-items:center;justify-content:center;gap:18px}.mg-node{padding:28px 34px;border:1px solid rgba(255,255,255,.28);border-radius:18px;background:rgba(255,255,255,.08);font-size:34px;font-weight:650}.mg-arrow{font-size:34px;opacity:.55}
</style><script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script></head><body><div id="motion-runtime-root" data-composition-id="motion-runtime" data-width="${ir.canvas.width}" data-height="${ir.canvas.height}" data-fps="${ir.canvas.fps}" data-duration="${totalDuration}"><div id="motion-runtime-stage">${clips.join('\n')}</div></div><script>const tl=gsap.timeline({paused:true});${timeline.join('\n')}window.__timelines=window.__timelines||{};window.__timelines['motion-runtime']=tl;</script></body></html>`;
fs.writeFileSync(path.join(projectDir,'index.html'),html);
const report={provider:'hyperframes',compiler_version:'0.5.1',source_ir:irPath,total_duration:totalDuration,fps:ir.canvas.fps,warnings,semantic_mappings:semanticMappings,mg_mappings:semanticMappings.filter(x=>x.feature.includes('.mg.'))};
fs.writeFileSync(path.join(projectDir,'compile-report.json'),JSON.stringify(report,null,2));
console.log(`HyperFrames project compiled: ${projectDir}`); console.log(`Compile warnings: ${warnings.length}`); console.log(`Semantic mappings: ${semanticMappings.length}`); console.log(`MG mappings: ${report.mg_mappings.length}`);

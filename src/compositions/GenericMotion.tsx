import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import type {MotionIR} from '../motion-ir';

type Props = {ir: MotionIR};
type Layer = MotionIR['scenes'][number]['layers'][number];
type Scene = MotionIR['scenes'][number];

const activeProgress = (layer: Layer, sceneOffset: number) => {
  const frame = useCurrentFrame() - sceneOffset;
  const {fps} = useVideoConfig();
  const local = frame - layer.start * fps;
  const duration = Math.max(1, (layer.end - layer.start) * fps);
  return {frame, fps, local, duration, active: frame >= layer.start * fps && frame <= layer.end * fps};
};

const TextLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const {frame,fps,local,active}=activeProgress(layer,sceneOffset);
  if (!active) return null;
  const enterFrames = Math.max(1, (layer.enter?.duration ?? 0.6) * fps);
  const reveal = spring({frame: Math.max(0,local), fps, durationInFrames: enterFrames, config: {damping: 18, stiffness: 90, mass: 1}});
  const exitFrames = Math.max(1, (layer.exit?.duration ?? 0.35) * fps);
  const exit = interpolate(frame, [layer.end * fps - exitFrames, layer.end * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kind = String(layer.style?.mg_kind ?? 'text');
  const raw = String(layer.content ?? '');
  let display = raw;
  if (kind === 'number_counter') {
    const match = raw.match(/-?\d+(?:\.\d+)?/);
    if (match) {
      const target = Number(match[0]);
      const n = target * interpolate(reveal,[0,1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
      display = raw.replace(match[0], Number.isInteger(target) ? String(Math.round(n)) : n.toFixed(1));
    }
  }
  const fontSize=Number(layer.style?.fontSize ?? (kind === 'number_counter' ? 190 : 92));
  const scale = kind === 'number_counter' ? interpolate(reveal,[0,1],[0.72,1]) : 1;
  return <AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'0 110px',zIndex:layer.z ?? 0,pointerEvents:'none'}}>
    <div style={{maxWidth:Number(layer.style?.maxWidth ?? 1500),color:String(layer.style?.color ?? '#f6f2e8'),fontFamily:'Inter, Helvetica Neue, Arial, sans-serif',fontSize,fontWeight:kind==='number_counter'?750:600,letterSpacing:`${Number(layer.style?.tracking ?? 0.02)}em`,lineHeight:1.02,textAlign:'center',opacity:Math.min(reveal, exit),transform:`translateY(${interpolate(reveal,[0,1],[34,0])}px) scale(${scale})`,filter:`blur(${interpolate(reveal,[0,1],[12,0])}px)`,textShadow:'0 6px 32px rgba(0,0,0,.45)'}}>{display}</div>
  </AbsoluteFill>;
};

const ShapeLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const {fps,local,active}=activeProgress(layer,sceneOffset); if (!active) return null;
  const duration=Math.max(1,(layer.enter?.duration ?? .55)*fps); const p=interpolate(local,[0,duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const kind=String(layer.style?.mg_kind ?? 'shape');
  if (kind==='veil') return <AbsoluteFill style={{zIndex:layer.z??5,background:'rgba(4,4,5,1)',opacity:Number(layer.style?.opacity ?? .5)*p,pointerEvents:'none'}}/>;
  if (kind==='bar_chart') {
    const bars=Array.isArray(layer.style?.bars)?(layer.style?.bars as number[]):[.34,.58,.82,1];
    return <AbsoluteFill style={{zIndex:layer.z??25,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}><div style={{width:'72%',padding:'42px 46px',borderRadius:28,background:'rgba(12,12,14,.74)',backdropFilter:'blur(18px)',border:'1px solid rgba(255,255,255,.15)'}}><div style={{fontSize:26,letterSpacing:'.12em',color:'rgba(255,255,255,.62)',marginBottom:28}}>PROOF / DATA</div><div style={{height:290,display:'flex',alignItems:'flex-end',gap:22}}>{bars.map((v,i)=><div key={i} style={{flex:1,height:`${Math.max(4,v*p*100)}%`,borderRadius:'10px 10px 2px 2px',background:'linear-gradient(180deg,#f2efe6,#858078)',boxShadow:'0 12px 30px rgba(0,0,0,.25)'}}/>)}</div><div style={{marginTop:24,fontSize:42,color:'#fff'}}>{String(layer.style?.label ?? layer.content ?? '')}</div></div></AbsoluteFill>;
  }
  if (kind==='comparison') return <AbsoluteFill style={{zIndex:layer.z??24,alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'stretch',width:'82%',gap:18,opacity:p,transform:`scale(${.94+.06*p})`}}><div style={{padding:'44px 30px',background:'rgba(25,25,27,.82)',border:'1px solid rgba(255,255,255,.12)',fontSize:52,textAlign:'center'}}>{String(layer.style?.left ?? 'BEFORE')}</div><div style={{display:'grid',placeItems:'center',fontSize:38}}>→</div><div style={{padding:'44px 30px',background:'rgba(235,231,219,.94)',color:'#171716',fontSize:52,textAlign:'center'}}>{String(layer.style?.right ?? 'AFTER')}</div></div></AbsoluteFill>;
  if (kind==='process_flow') {
    const nodes=Array.isArray(layer.style?.nodes)?(layer.style?.nodes as string[]):['问题','判断','结果'];
    return <AbsoluteFill style={{zIndex:layer.z??26,alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><div style={{display:'flex',alignItems:'center',gap:16,width:'86%',justifyContent:'center'}}>{nodes.map((node,i)=><React.Fragment key={node}><div style={{minWidth:190,padding:'26px 24px',borderRadius:18,border:'1px solid rgba(255,255,255,.2)',background:'rgba(10,10,12,.78)',fontSize:36,textAlign:'center',opacity:interpolate(p,[i/nodes.length,Math.min(1,(i+1)/nodes.length)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>{node}</div>{i<nodes.length-1&&<div style={{fontSize:32,opacity:.65}}>→</div>}</React.Fragment>)}</div></AbsoluteFill>;
  }
  return null;
};

const LightLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const {frame,fps,active}=activeProgress(layer,sceneOffset); if (!active) return null;
  const p = interpolate(frame,[layer.start*fps,layer.end*fps],[-35,135],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <div style={{position:'absolute',top:'-20%',bottom:'-20%',left:`${p}%`,width:5,zIndex:layer.z ?? 0,transform:'rotate(8deg)',background:'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.95) 50%, rgba(255,255,255,0))',boxShadow:'0 0 32px 10px rgba(255,255,255,0.22)'}}/>;
};

const VideoLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const {fps} = useVideoConfig(); if (!layer.asset_ref) return null;
  const from = Math.round(sceneOffset + layer.start * fps); const durationInFrames = Math.max(1, Math.round((layer.end - layer.start) * fps));
  return <Sequence from={from} durationInFrames={durationInFrames} layout="none"><AbsoluteFill style={{zIndex:layer.z ?? -100,backgroundColor:'#000'}}><Video src={staticFile(layer.asset_ref)} style={{width:'100%',height:'100%',objectFit:'cover'}} /></AbsoluteFill></Sequence>;
};

const SubtitleLayer: React.FC<{scene: Scene; sceneOffset: number}> = ({scene, sceneOffset}) => {
  const frame = useCurrentFrame() - sceneOffset; const {fps} = useVideoConfig(); const cue=(scene.subtitle_cues ?? []).find((item)=>frame>=item.start*fps&&frame<item.end*fps); if(!cue)return null;
  return <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'center',padding:'0 70px 72px',zIndex:1000,pointerEvents:'none'}}><div style={{maxWidth:'88%',padding:'12px 20px',borderRadius:14,background:'rgba(0,0,0,0.56)',color:'#fff',fontFamily:'Inter, Helvetica Neue, Arial, sans-serif',fontSize:38,lineHeight:1.25,textAlign:'center',textShadow:'0 2px 8px rgba(0,0,0,0.7)'}}>{cue.text}</div></AbsoluteFill>;
};

const AudioTracks: React.FC<{scene: Scene; sceneOffset: number}> = ({scene, sceneOffset}) => {const {fps}=useVideoConfig();return <>{(scene.audio_tracks??[]).map((track)=>{const from=Math.round(sceneOffset+track.start*fps);const durationInFrames=track.end==null?undefined:Math.max(1,Math.round((track.end-track.start)*fps));return <Sequence key={track.id} from={from} durationInFrames={durationInFrames} layout="none"><Audio src={staticFile(track.asset_ref)} volume={track.volume??1}/></Sequence>})}</>};

const renderLayer=(layer:Layer,sceneOffset:number)=>{if(layer.type==='text')return <TextLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;if(layer.type==='shape')return <ShapeLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;if(layer.type==='light')return <LightLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;if(layer.type==='video')return <VideoLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;if(layer.type==='background')return <AbsoluteFill key={layer.id} style={{backgroundColor:layer.content??'#000',zIndex:layer.z??-100}}/>;return null;};

export const GenericMotion: React.FC<Props> = ({ir}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); let cursor=0;let sceneOffset=0;let scene=ir.scenes[ir.scenes.length-1];
  for(const candidate of ir.scenes){const durationFrames=candidate.duration*fps;if(frame<cursor+durationFrames){scene=candidate;sceneOffset=cursor;break}cursor+=durationFrames}
  const sceneFrame=Math.max(0,frame-sceneOffset);const cameraScale=interpolate(sceneFrame,[0,Math.max(1,scene.duration*fps)],[1,scene.camera?.movement==='subtle-push-in'?1.035:1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{backgroundColor:ir.canvas.background,overflow:'hidden',transform:`scale(${cameraScale})`}}>{[...scene.layers].sort((a,b)=>(a.z??0)-(b.z??0)).map((layer)=>renderLayer(layer,sceneOffset))}<SubtitleLayer scene={scene} sceneOffset={sceneOffset}/><AudioTracks scene={scene} sceneOffset={sceneOffset}/></AbsoluteFill>;
};

import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import type {MotionIR} from '../motion-ir';

type Props = {ir: MotionIR};
type Layer = MotionIR['scenes'][number]['layers'][number];
type Scene = MotionIR['scenes'][number];

const TextLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const frame = useCurrentFrame() - sceneOffset;
  const {fps} = useVideoConfig();
  if (frame < layer.start * fps || frame > layer.end * fps) return null;
  const enterFrames = Math.max(1, (layer.enter?.duration ?? 0.6) * fps);
  const local = Math.max(0, frame - layer.start * fps);
  const reveal = spring({frame: local, fps, durationInFrames: enterFrames, config: {damping: 18, stiffness: 90, mass: 1}});
  const exitFrames = Math.max(1, (layer.exit?.duration ?? 0.35) * fps);
  const exit = interpolate(frame, [layer.end * fps - exitFrames, layer.end * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'0 140px',zIndex:layer.z ?? 0}}>
    <div style={{color:'#f3f3f0',fontFamily:'Inter, Helvetica Neue, Arial, sans-serif',fontSize:92,fontWeight:500,letterSpacing:`${layer.style?.tracking ?? 0.04}em`,textAlign:'center',opacity:Math.min(reveal, exit),transform:`translateY(${interpolate(reveal,[0,1],[36,0])}px)`,filter:`blur(${interpolate(reveal,[0,1],[14,0])}px)`}}>{layer.content ?? ''}</div>
  </AbsoluteFill>;
};

const LightLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const frame = useCurrentFrame() - sceneOffset;
  const {fps} = useVideoConfig();
  if (frame < layer.start * fps || frame > layer.end * fps) return null;
  const p = interpolate(frame,[layer.start*fps,layer.end*fps],[-35,135],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <div style={{position:'absolute',top:'-20%',bottom:'-20%',left:`${p}%`,width:5,zIndex:layer.z ?? 0,transform:'rotate(8deg)',background:'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.95) 50%, rgba(255,255,255,0))',boxShadow:'0 0 32px 10px rgba(255,255,255,0.22)'}}/>;
};

const VideoLayer: React.FC<{layer: Layer; sceneOffset: number}> = ({layer, sceneOffset}) => {
  const {fps} = useVideoConfig();
  if (!layer.asset_ref) return null;
  const from = Math.round(sceneOffset + layer.start * fps);
  const durationInFrames = Math.max(1, Math.round((layer.end - layer.start) * fps));
  return <Sequence from={from} durationInFrames={durationInFrames} layout="none">
    <AbsoluteFill style={{zIndex:layer.z ?? -100,backgroundColor:'#000'}}>
      <Video src={staticFile(layer.asset_ref)} style={{width:'100%',height:'100%',objectFit:'cover'}} />
    </AbsoluteFill>
  </Sequence>;
};

const SubtitleLayer: React.FC<{scene: Scene; sceneOffset: number}> = ({scene, sceneOffset}) => {
  const frame = useCurrentFrame() - sceneOffset;
  const {fps} = useVideoConfig();
  const cue = (scene.subtitle_cues ?? []).find((item)=>frame >= item.start * fps && frame < item.end * fps);
  if (!cue) return null;
  return <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'center',padding:'0 110px 72px',zIndex:1000,pointerEvents:'none'}}>
    <div style={{maxWidth:'82%',padding:'12px 20px',borderRadius:14,background:'rgba(0,0,0,0.58)',color:'#fff',fontFamily:'Inter, Helvetica Neue, Arial, sans-serif',fontSize:42,lineHeight:1.25,textAlign:'center',textShadow:'0 2px 8px rgba(0,0,0,0.7)'}}>{cue.text}</div>
  </AbsoluteFill>;
};

const AudioTracks: React.FC<{scene: Scene; sceneOffset: number}> = ({scene, sceneOffset}) => {
  const {fps} = useVideoConfig();
  return <>
    {(scene.audio_tracks ?? []).map((track) => {
      const from = Math.round(sceneOffset + track.start * fps);
      const durationInFrames = track.end == null ? undefined : Math.max(1, Math.round((track.end - track.start) * fps));
      return <Sequence key={track.id} from={from} durationInFrames={durationInFrames} layout="none">
        <Audio src={staticFile(track.asset_ref)} volume={track.volume ?? 1}/>
      </Sequence>;
    })}
  </>;
};

const renderLayer = (layer: Layer, sceneOffset: number) => {
  if (layer.type === 'text') return <TextLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;
  if (layer.type === 'light') return <LightLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;
  if (layer.type === 'video') return <VideoLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;
  if (layer.type === 'background') return <AbsoluteFill key={layer.id} style={{backgroundColor: layer.content ?? '#000', zIndex: layer.z ?? -100}}/>;
  return null;
};

export const GenericMotion: React.FC<Props> = ({ir}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let cursor = 0;
  let sceneOffset = 0;
  let scene = ir.scenes[ir.scenes.length - 1];
  for (const candidate of ir.scenes) {
    const durationFrames = candidate.duration * fps;
    if (frame < cursor + durationFrames) {
      scene = candidate;
      sceneOffset = cursor;
      break;
    }
    cursor += durationFrames;
  }
  const sceneFrame = Math.max(0, frame - sceneOffset);
  const cameraScale = interpolate(sceneFrame,[0,Math.max(1,scene.duration*fps)],[1,scene.camera?.movement === 'subtle-push-in' ? 1.035 : 1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{backgroundColor:ir.canvas.background,overflow:'hidden',transform:`scale(${cameraScale})`}}>
    {[...scene.layers].sort((a,b)=>(a.z??0)-(b.z??0)).map((layer)=>renderLayer(layer,sceneOffset))}
    <SubtitleLayer scene={scene} sceneOffset={sceneOffset}/>
    <AudioTracks scene={scene} sceneOffset={sceneOffset}/>
  </AbsoluteFill>;
};

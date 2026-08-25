import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {MotionIR} from '../motion-ir';

type Props = {ir: MotionIR};
type Layer = MotionIR['scenes'][number]['layers'][number];

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

const renderLayer = (layer: Layer, sceneOffset: number) => {
  if (layer.type === 'text') return <TextLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;
  if (layer.type === 'light') return <LightLayer key={layer.id} layer={layer} sceneOffset={sceneOffset}/>;
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
  return <AbsoluteFill style={{backgroundColor:ir.canvas.background,overflow:'hidden',transform:`scale(${cameraScale})`}}>{[...scene.layers].sort((a,b)=>(a.z??0)-(b.z??0)).map((layer)=>renderLayer(layer,sceneOffset))}</AbsoluteFill>;
};

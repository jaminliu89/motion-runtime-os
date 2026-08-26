import React from 'react';
import {Composition} from 'remotion';
import cinematicIr from '../examples/cinematic-intro/motion-ir.json';
import multiSceneIr from '../examples/multi-scene-demo/motion-ir.json';
import realMediaDirectorIr from '../examples/real-media-director/motion-ir.json';
import directedMgIr from '../examples/directed-mg/motion-ir.json';
import neutralMgIr from '../examples/directed-mg/neutral-motion-ir.json';
import artDirectionIr from '../examples/art-direction/motion-ir.json';
import expandedMgIr from '../examples/expanded-mg/motion-ir.json';
import {GenericMotion} from './compositions/GenericMotion';

const durationFrames=(ir:{canvas:{fps:number};scenes:Array<{duration:number}>})=>Math.round(ir.scenes.reduce((sum,scene)=>sum+scene.duration,0)*ir.canvas.fps);

export const RemotionRoot:React.FC=()=> <>
  <Composition id="CinematicIntro" component={GenericMotion} durationInFrames={durationFrames(cinematicIr)} fps={cinematicIr.canvas.fps} width={cinematicIr.canvas.width} height={cinematicIr.canvas.height} defaultProps={{ir:cinematicIr}} />
  <Composition id="MultiSceneDemo" component={GenericMotion} durationInFrames={durationFrames(multiSceneIr)} fps={multiSceneIr.canvas.fps} width={multiSceneIr.canvas.width} height={multiSceneIr.canvas.height} defaultProps={{ir:multiSceneIr}} />
  <Composition id="RealMediaDirector" component={GenericMotion} durationInFrames={durationFrames(realMediaDirectorIr)} fps={realMediaDirectorIr.canvas.fps} width={realMediaDirectorIr.canvas.width} height={realMediaDirectorIr.canvas.height} defaultProps={{ir:realMediaDirectorIr}} />
  <Composition id="DirectedMG" component={GenericMotion} durationInFrames={durationFrames(directedMgIr)} fps={directedMgIr.canvas.fps} width={directedMgIr.canvas.width} height={directedMgIr.canvas.height} defaultProps={{ir:directedMgIr}} />
  <Composition id="NeutralMG" component={GenericMotion} durationInFrames={durationFrames(neutralMgIr)} fps={neutralMgIr.canvas.fps} width={neutralMgIr.canvas.width} height={neutralMgIr.canvas.height} defaultProps={{ir:neutralMgIr}} />
  <Composition id="ArtDirection" component={GenericMotion} durationInFrames={durationFrames(artDirectionIr)} fps={artDirectionIr.canvas.fps} width={artDirectionIr.canvas.width} height={artDirectionIr.canvas.height} defaultProps={{ir:artDirectionIr}} />
  <Composition id="ExpandedMG" component={GenericMotion} durationInFrames={durationFrames(expandedMgIr)} fps={expandedMgIr.canvas.fps} width={expandedMgIr.canvas.width} height={expandedMgIr.canvas.height} defaultProps={{ir:expandedMgIr}} />
</>;

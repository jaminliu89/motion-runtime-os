import React from 'react';
import {Composition} from 'remotion';
import cinematicIr from '../examples/cinematic-intro/motion-ir.json';
import multiSceneIr from '../examples/multi-scene-demo/motion-ir.json';
import {GenericMotion} from './compositions/GenericMotion';

const durationFrames = (ir: {canvas: {fps: number}; scenes: Array<{duration: number}>}) =>
  Math.round(ir.scenes.reduce((sum, scene) => sum + scene.duration, 0) * ir.canvas.fps);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CinematicIntro"
        component={GenericMotion}
        durationInFrames={durationFrames(cinematicIr)}
        fps={cinematicIr.canvas.fps}
        width={cinematicIr.canvas.width}
        height={cinematicIr.canvas.height}
        defaultProps={{ir: cinematicIr}}
      />
      <Composition
        id="MultiSceneDemo"
        component={GenericMotion}
        durationInFrames={durationFrames(multiSceneIr)}
        fps={multiSceneIr.canvas.fps}
        width={multiSceneIr.canvas.width}
        height={multiSceneIr.canvas.height}
        defaultProps={{ir: multiSceneIr}}
      />
    </>
  );
};

import React from 'react';
import {Composition} from 'remotion';
import ir from '../examples/cinematic-intro/motion-ir.json';
import {CinematicIntro} from './compositions/CinematicIntro';

const durationSeconds = ir.scenes.reduce((sum, scene) => sum + scene.duration, 0);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CinematicIntro"
      component={CinematicIntro}
      durationInFrames={Math.round(durationSeconds * ir.canvas.fps)}
      fps={ir.canvas.fps}
      width={ir.canvas.width}
      height={ir.canvas.height}
      defaultProps={{ir}}
    />
  );
};

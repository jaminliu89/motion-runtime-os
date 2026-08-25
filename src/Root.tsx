import React from 'react';
import {Composition} from 'remotion';
import ir from '../examples/cinematic-intro/motion-ir.json';
import {CinematicIntro} from './compositions/CinematicIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CinematicIntro"
      component={CinematicIntro}
      durationInFrames={Math.round(ir.duration * ir.fps)}
      fps={ir.fps}
      width={1920}
      height={1080}
      defaultProps={{ir}}
    />
  );
};

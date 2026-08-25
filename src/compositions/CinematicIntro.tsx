import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {MotionIR} from '../motion-ir';

type Props = {ir: MotionIR};

export const CinematicIntro: React.FC<Props> = ({ir}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = ir.scenes[0];
  const title = scene.layers.find((layer) => layer.id === 'title');
  const light = scene.layers.find((layer) => layer.id === 'light-cut');

  if (!scene || !title || !light) {
    throw new Error('CinematicIntro requires intro/title/light-cut layers');
  }

  const titleStart = title.start * fps;
  const titleEnterDuration = (title.enter?.duration ?? 1) * fps;
  const titleEnd = title.end * fps;
  const titleExitDuration = (title.exit?.duration ?? 0.4) * fps;

  const reveal = spring({
    frame: Math.max(0, frame - titleStart),
    fps,
    config: {damping: 18, stiffness: 90, mass: 1},
    durationInFrames: titleEnterDuration,
  });

  const exitOpacity = interpolate(
    frame,
    [titleEnd - titleExitDuration, titleEnd],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const titleOpacity = Math.min(reveal, exitOpacity);
  const titleTranslateY = interpolate(reveal, [0, 1], [42, 0]);
  const blur = interpolate(reveal, [0, 1], [18, 0]);
  const cameraScale = interpolate(
    frame,
    [0, Math.max(1, scene.duration * fps)],
    [1, 1.035],
    {extrapolateRight: 'clamp'},
  );

  const lightStart = light.start * fps;
  const lightEnd = light.end * fps;
  const lightProgress = interpolate(frame, [lightStart, lightEnd], [-35, 135], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lightOpacity = interpolate(
    frame,
    [lightStart, lightStart + 4, lightEnd - 4, lightEnd],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ir.canvas.background,
        overflow: 'hidden',
        transform: `scale(${cameraScale})`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.045), rgba(0,0,0,0) 42%)',
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 140px',
        }}
      >
        <div
          style={{
            color: '#f3f3f0',
            fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
            fontSize: 92,
            fontWeight: 500,
            letterSpacing: `${title.style?.tracking ?? 0.08}em`,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
            filter: `blur(${blur}px)`,
            textShadow: '0 0 28px rgba(255,255,255,0.08)',
          }}
        >
          {title.content ?? 'Frontier AI Labs'}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: '-20%',
          bottom: '-20%',
          left: `${lightProgress}%`,
          width: 5,
          opacity: lightOpacity,
          transform: 'rotate(8deg)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.95) 50%, rgba(255,255,255,0))',
          boxShadow: '0 0 32px 10px rgba(255,255,255,0.22)',
        }}
      />
    </AbsoluteFill>
  );
};

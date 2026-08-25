export type MotionIR = {
  version: string;
  canvas: {
    width: number;
    height: number;
    fps: number;
    background: string;
  };
  scenes: Array<{
    id: string;
    duration: number;
    camera?: {movement?: string};
    layers: Array<{
      id: string;
      type: 'text' | 'light' | string;
      start: number;
      end: number;
      z?: number;
      content?: string;
      style?: {align?: string; tracking?: number};
      enter?: {type?: string; duration?: number};
      hold?: {type?: string};
      exit?: {type?: string; duration?: number};
      transform?: {from?: string; to?: string};
      easing?: string;
      safe_area?: boolean;
    }>;
    audio_cues?: Array<{id: string; time: number; type: string}>;
  }>;
};

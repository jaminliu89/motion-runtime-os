export type MotionIR = {
  version: string;
  art_direction?: {profile_id?: string | null; version?: string | null};
  canvas: {width:number;height:number;fps:number;background:string};
  scenes: Array<{
    id:string;
    duration:number;
    camera?: {movement?:string;scale_to?:number};
    layers: Array<{
      id:string;
      type:'text'|'light'|'background'|'image'|'video'|'shape'|'svg'|'particle'|'group'|string;
      start:number;end:number;z?:number;content?:string;asset_ref?:string;
      style?: {align?:string;tracking?:number;[key:string]:unknown};
      enter?: {type?:string;duration?:number};hold?:{type?:string};exit?:{type?:string;duration?:number};
      transform?:{from?:string;to?:string};easing?:string;safe_area?:boolean;
    }>;
    audio_cues?:Array<{id:string;time:number;type:string}>;
    audio_tracks?:Array<{id:string;start:number;end?:number;asset_ref:string;volume?:number}>;
    subtitle_cues?:Array<{id:string;start:number;end:number;text:string;speaker?:string}>;
  }>;
};

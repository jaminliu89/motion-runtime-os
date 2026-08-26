"""MG Plan -> Motion IR compiler.

Compiles semantic motion grammar into provider-neutral Motion IR primitives that the
verified runtimes can execute. The compiler does not choose a renderer.
"""
from __future__ import annotations
from typing import Any, Dict, List


def _segment_map(director_ir: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    return {str(s.get("id")): s for s in director_ir.get("segments", [])}


def _overlay_layers(plan: Dict[str, Any], seg: Dict[str, Any], idx: int) -> List[Dict[str, Any]]:
    start=float(seg.get("start", 0)); end=float(seg.get("end", start + plan["timing"]["duration"])); duration=max(.1,end-start)
    attention=plan.get("attention_target") or seg.get("transcript") or ""
    grammar=set(plan.get("grammar", [])); layers=[]; base=f"mg-{idx}"
    enter_duration=min(.55,max(.18,duration*.18)); exit_duration=min(.35,max(.12,duration*.12))

    if "suppress_background" in grammar or "negative_space" in grammar:
        layers.append({"id":f"{base}-veil","type":"shape","start":start,"end":end,"z":5,"content":"","style":{"mg_kind":"veil","opacity":0.66 if "negative_space" in grammar else 0.46}})

    if any(g in grammar for g in {"keyword_isolation","kinetic_text","word_reveal","type_scale_contrast","slow_reveal"}):
        layers.append({"id":f"{base}-type","type":"text","start":start+min(.12,duration*.05),"end":end,"z":30,"content":str(attention),"style":{"mg_kind":"hero_text","tracking":0.02,"fontSize":104 if plan.get("restraint")!="high" else 62,"maxWidth":1500},"enter":{"type":"blur-fade-rise","duration":enter_duration},"hold":{"type":"steady"},"exit":{"type":"fade","duration":exit_duration},"safe_area":True})

    if "number_counter" in grammar or "counter" in grammar:
        layers.append({"id":f"{base}-counter","type":"text","start":start,"end":end,"z":36,"content":str(attention),"style":{"mg_kind":"number_counter","fontSize":190,"tracking":-0.03},"enter":{"type":"scale-count","duration":min(.8,duration*.3)},"exit":{"type":"fade","duration":exit_duration},"safe_area":True})

    if any(g in grammar for g in {"bar_chart","line_chart","percentage","ranking","delta","progress"}):
        layers.append({"id":f"{base}-data","type":"shape","start":start+min(.2,duration*.08),"end":end,"z":25,"content":str(attention),"style":{"mg_kind":"bar_chart","bars":[0.34,0.58,0.82,1.0],"label":str(attention)},"enter":{"type":"grow","duration":min(.75,duration*.3)},"exit":{"type":"fade","duration":exit_duration}})

    if any(g in grammar for g in {"before_after","comparison_map"}):
        layers.append({"id":f"{base}-compare","type":"shape","start":start,"end":end,"z":24,"content":str(attention),"style":{"mg_kind":"comparison","left":"过去","right":"现在"},"enter":{"type":"split","duration":enter_duration},"exit":{"type":"fade","duration":exit_duration}})

    if any(g in grammar for g in {"callout_annotation","process_flow","causal_chain","node_graph","timeline"}):
        layers.append({"id":f"{base}-diagram","type":"shape","start":start,"end":end,"z":26,"content":str(attention),"style":{"mg_kind":"process_flow","nodes":["问题","判断","结果"]},"enter":{"type":"draw","duration":min(.85,duration*.35)},"exit":{"type":"fade","duration":exit_duration}})

    if "impact_hit" in grammar:
        layers.append({"id":f"{base}-impact","type":"light","start":min(end-.08,start+.18),"end":min(end,start+.52),"z":45,"transform":{"from":"left","to":"right"},"easing":"cinematic-expo"})
    return layers


def compile_motion_ir(mg_plan: Dict[str, Any], director_ir: Dict[str, Any], *, source_asset_ref: str | None=None, audio_asset_ref: str | None=None, width: int=1080, height: int=1920, fps: float=30) -> Dict[str, Any]:
    segs=_segment_map(director_ir); plans=mg_plan.get("segments", [])
    director_segments=director_ir.get("segments", [])
    total=max((float(s.get("end",0)) for s in director_segments), default=sum(float(p.get("timing",{}).get("duration",0)) for p in plans))
    total=max(.1,total); layers=[]; subtitles=[]; audio_tracks=[]
    if source_asset_ref:
        layers.append({"id":"source-video","type":"video","asset_ref":source_asset_ref,"start":0,"end":total,"z":-100})
    cursor=0.0
    for idx,p in enumerate(plans):
        seg=segs.get(str(p.get("segment_id")))
        if not seg:
            duration=float(p.get("timing",{}).get("duration",1)); seg={"id":p.get("segment_id"),"start":cursor,"end":cursor+duration,"transcript":p.get("attention_target") or ""}; cursor+=duration
        layers.extend(_overlay_layers(p,seg,idx))
        text=str(seg.get("transcript") or "").strip()
        if text:
            subtitles.append({"id":f"subtitle-{idx}","start":float(seg.get("start",0)),"end":float(seg.get("end",0)),"text":text})
    if audio_asset_ref:
        audio_tracks.append({"id":"source-audio","start":0,"end":total,"asset_ref":audio_asset_ref,"volume":1.0})
    movement="subtle-push-in" if any("push_in" in p.get("grammar",[]) for p in plans) else "none"
    return {"version":"1.0","canvas":{"width":width,"height":height,"fps":fps,"background":"#0b0b0b"},"scenes":[{"id":"directed-mg","duration":round(total,3),"camera":{"movement":movement},"layers":layers,"subtitle_cues":subtitles,"audio_tracks":audio_tracks,"audio_cues":[]}]}

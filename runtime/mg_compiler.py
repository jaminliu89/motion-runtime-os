"""MG Plan -> Motion IR compiler.

Compiles semantic motion grammar plus provider-neutral art direction tokens into Motion IR.
The compiler never chooses a renderer.
"""
from __future__ import annotations
from typing import Any, Dict, List


def _segment_map(director_ir: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    return {str(s.get("id")): s for s in director_ir.get("segments", [])}


def _tokens(plan: Dict[str, Any]) -> Dict[str, Any]:
    return dict(plan.get("style_tokens") or {})


def _style(plan: Dict[str, Any], kind: str, **extra: Any) -> Dict[str, Any]:
    t=_tokens(plan)
    return {
        "mg_kind": kind,
        "mg_grammar": list(plan.get("grammar", [])),
        "mg_segment_id": str(plan.get("segment_id")),
        "mg_narrative_function": plan.get("narrative_function"),
        "mg_restraint": plan.get("restraint"),
        "art_direction_ref": plan.get("art_direction_ref"),
        "art_tokens": t,
        **extra,
    }


def _timing(plan: Dict[str, Any], duration: float) -> tuple[float,float]:
    tm=plan.get("timing",{})
    enter_mult=float(tm.get("enter_multiplier",1)); exit_mult=float(tm.get("exit_multiplier",1))
    enter=min(.75,max(.16,duration*.18*enter_mult)); exit=min(.45,max(.1,duration*.12*exit_mult))
    return enter,exit


def _overlay_layers(plan: Dict[str, Any], seg: Dict[str, Any], idx: int) -> List[Dict[str, Any]]:
    start=float(seg.get("start",0)); end=float(seg.get("end",start+plan["timing"]["duration"])); duration=max(.1,end-start)
    attention=plan.get("attention_target") or seg.get("transcript") or ""
    grammar=set(plan.get("grammar",[])); layers=[]; base=f"mg-{idx}"; enter_duration,exit_duration=_timing(plan,duration); t=_tokens(plan)
    typo=t.get("typography",{}); palette=t.get("palette",{}); geom=t.get("geometry",{}); veil=float(t.get("veil_opacity",.46))

    if "suppress_background" in grammar or "negative_space" in grammar:
        layers.append({"id":f"{base}-veil","type":"shape","start":start,"end":end,"z":5,"content":"","style":_style(plan,"veil",opacity=max(veil,.62) if "negative_space" in grammar else veil,color=palette.get("background"))})

    if any(g in grammar for g in {"keyword_isolation","kinetic_text","word_reveal","type_scale_contrast","slow_reveal","mask_reveal"}):
        layers.append({"id":f"{base}-type","type":"text","start":start+min(.12,duration*.05),"end":end,"z":30,"content":str(attention),"style":_style(plan,"hero_text",tracking=typo.get("tracking",.02),fontSize=typo.get("hero_size",104) if plan.get("restraint")!="high" else min(72,typo.get("hero_size",104)),fontWeight=typo.get("weight",650),maxWidth=typo.get("max_width",1500),color=palette.get("foreground")),"enter":{"type":"mask-reveal" if "mask_reveal" in grammar else "blur-fade-rise","duration":enter_duration},"hold":{"type":"steady"},"exit":{"type":"fade","duration":exit_duration},"safe_area":True})

    if "number_counter" in grammar or "counter" in grammar:
        layers.append({"id":f"{base}-counter","type":"text","start":start,"end":end,"z":36,"content":str(attention),"style":_style(plan,"number_counter",fontSize=typo.get("data_size",190),fontWeight=typo.get("weight",760),tracking=-.03,color=palette.get("foreground")),"enter":{"type":"scale-count","duration":min(.8,duration*.3)},"exit":{"type":"fade","duration":exit_duration},"safe_area":True})

    if "line_chart" in grammar:
        layers.append({"id":f"{base}-line","type":"shape","start":start,"end":end,"z":25,"content":str(attention),"style":_style(plan,"line_chart",points=[.18,.34,.28,.61,.74,1.0],label=str(attention),accent=palette.get("accent"),radius=geom.get("radius",18)),"enter":{"type":"draw","duration":min(.9,duration*.34)},"exit":{"type":"fade","duration":exit_duration}})
    elif any(g in grammar for g in {"bar_chart","percentage","ranking","delta","progress"}):
        layers.append({"id":f"{base}-data","type":"shape","start":start+min(.2,duration*.08),"end":end,"z":25,"content":str(attention),"style":_style(plan,"bar_chart",bars=[.34,.58,.82,1.0],label=str(attention),accent=palette.get("accent"),radius=geom.get("radius",18)),"enter":{"type":"grow","duration":min(.75,duration*.3)},"exit":{"type":"fade","duration":exit_duration}})

    if any(g in grammar for g in {"before_after","comparison_map"}):
        layers.append({"id":f"{base}-compare","type":"shape","start":start,"end":end,"z":24,"content":str(attention),"style":_style(plan,"comparison",left="过去",right="现在",panel=palette.get("panel"),radius=geom.get("radius",18)),"enter":{"type":"split","duration":enter_duration},"exit":{"type":"fade","duration":exit_duration}})

    if "timeline" in grammar:
        layers.append({"id":f"{base}-timeline","type":"shape","start":start,"end":end,"z":26,"content":str(attention),"style":_style(plan,"timeline",nodes=["起点","变化","现在"],accent=palette.get("accent")),"enter":{"type":"draw","duration":min(.9,duration*.35)},"exit":{"type":"fade","duration":exit_duration}})
    elif "node_graph" in grammar:
        layers.append({"id":f"{base}-graph","type":"shape","start":start,"end":end,"z":26,"content":str(attention),"style":_style(plan,"node_graph",nodes=["输入","判断","输出"],edges=[[0,1],[1,2]],accent=palette.get("accent")),"enter":{"type":"draw","duration":min(.9,duration*.35)},"exit":{"type":"fade","duration":exit_duration}})
    elif any(g in grammar for g in {"callout_annotation","process_flow","causal_chain"}):
        layers.append({"id":f"{base}-diagram","type":"shape","start":start,"end":end,"z":26,"content":str(attention),"style":_style(plan,"process_flow",nodes=["问题","判断","结果"],accent=palette.get("accent")),"enter":{"type":"draw","duration":min(.85,duration*.35)},"exit":{"type":"fade","duration":exit_duration}})

    if any(g in grammar for g in {"document_highlight","screenshot_focus"}):
        layers.append({"id":f"{base}-doc","type":"shape","start":start,"end":end,"z":27,"content":str(attention),"style":_style(plan,"document_highlight",quote=str(attention),panel=palette.get("panel"),accent=palette.get("accent")),"enter":{"type":"reveal","duration":enter_duration},"exit":{"type":"fade","duration":exit_duration}})
    if any(g in grammar for g in {"browser_frame","phone_frame","chat_bubble","code_panel","search_result"}):
        layers.append({"id":f"{base}-ui","type":"shape","start":start,"end":end,"z":27,"content":str(attention),"style":_style(plan,"browser_frame",title="AI WORKFLOW",body=str(attention),panel=palette.get("panel"),accent=palette.get("accent")),"enter":{"type":"reveal","duration":enter_duration},"exit":{"type":"fade","duration":exit_duration}})

    if "impact_hit" in grammar:
        layers.append({"id":f"{base}-impact","type":"light","start":min(end-.08,start+.18),"end":min(end,start+.52),"z":45,"style":_style(plan,"impact_light",strength=t.get("impact_strength",.7)),"transform":{"from":"left","to":"right"},"easing":"cinematic-expo"})
    return layers


def compile_motion_ir(mg_plan: Dict[str, Any], director_ir: Dict[str, Any], *, source_asset_ref: str | None=None, audio_asset_ref: str | None=None, width: int=1080, height: int=1920, fps: float=30) -> Dict[str, Any]:
    segs=_segment_map(director_ir); plans=mg_plan.get("segments",[]); director_segments=director_ir.get("segments",[])
    total=max((float(s.get("end",0)) for s in director_segments),default=sum(float(p.get("timing",{}).get("duration",0)) for p in plans)); total=max(.1,total)
    art=mg_plan.get("art_direction",{}); palette=art.get("palette",{}); layers=[]; subtitles=[]; audio_tracks=[]
    if source_asset_ref: layers.append({"id":"source-video","type":"video","asset_ref":source_asset_ref,"start":0,"end":total,"z":-100})
    cursor=0.0
    for idx,p in enumerate(plans):
        seg=segs.get(str(p.get("segment_id")))
        if not seg:
            duration=float(p.get("timing",{}).get("duration",1)); seg={"id":p.get("segment_id"),"start":cursor,"end":cursor+duration,"transcript":p.get("attention_target") or ""}; cursor+=duration
        layers.extend(_overlay_layers(p,seg,idx)); text=str(seg.get("transcript") or "").strip()
        if text: subtitles.append({"id":f"subtitle-{idx}","start":float(seg.get("start",0)),"end":float(seg.get("end",0)),"text":text})
    if audio_asset_ref: audio_tracks.append({"id":"source-audio","start":0,"end":total,"asset_ref":audio_asset_ref,"volume":1.0})
    movement="subtle-push-in" if any("push_in" in p.get("grammar",[]) for p in plans) else "none"
    return {"version":"1.0","art_direction":{"profile_id":art.get("profile_id"),"version":art.get("version")},"canvas":{"width":width,"height":height,"fps":fps,"background":palette.get("background","#0b0b0b")},"scenes":[{"id":"directed-mg","duration":round(total,3),"camera":{"movement":movement,"scale_to":art.get("rhythm",{}).get("camera_push",1.035)},"layers":layers,"subtitle_cues":subtitles,"audio_tracks":audio_tracks,"audio_cues":[]}]}

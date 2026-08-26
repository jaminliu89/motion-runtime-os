"""Static quality checks for MG Plan v1."""
from __future__ import annotations
from typing import Any, Dict

FAMILIES={
 "typography":{"kinetic_text","word_reveal","keyword_isolation","number_counter","mask_reveal","type_scale_contrast","tracking_shift"},
 "data_diagram":{"node_graph","causal_chain","process_flow","timeline","comparison_map","hierarchy","callout_annotation","bar_chart","line_chart","percentage","ranking","counter","before_after","delta","progress"},
 "spatial":{"push_in","pull_out","parallax","depth_stack","rack_attention","focus_isolation","pan","orbit"},
 "transition":{"match_cut","semantic_morph","mask_wipe","directional_wipe","whip","flash","dissolve","hard_interrupt"},
 "ui_document":{"browser_frame","phone_frame","chat_bubble","code_panel","search_result","document_highlight","screenshot_focus","quote_card"},
 "rhythm":{"freeze","blackout","negative_space","slow_reveal","impact_hit","breath","silence_hold","acceleration","deceleration","suppress_background"},
}
STRONG={"impact_hit","flash","whip","blackout","hard_interrupt","push_in","number_counter","bar_chart","before_after"}


def evaluate(mg_plan: Dict[str,Any])->Dict[str,Any]:
    segments=mg_plan.get("segments",[]); issues=[]; used=set(); strong_count=0; total_grammar=0
    for seg in segments:
        grammar=set(seg.get("grammar",[])); total_grammar += len(grammar); strong_count += len(grammar & STRONG)
        for family, members in FAMILIES.items():
            if grammar & members: used.add(family)
        if seg.get("narrative_function")=="explanation" and seg.get("restraint")!="high":
            issues.append({"segment_id":seg.get("segment_id"),"code":"EXPOSITION_NOT_RESTRAINED"})
        if seg.get("restraint")=="high" and len(grammar & STRONG)>0:
            issues.append({"segment_id":seg.get("segment_id"),"code":"STRONG_EFFECT_UNDER_HIGH_RESTRAINT"})
        if not seg.get("attention_target") and seg.get("narrative_function") in {"reveal","proof","contrast","payoff"}:
            issues.append({"segment_id":seg.get("segment_id"),"code":"MISSING_ATTENTION_TARGET"})
        timing=seg.get("timing",{}); duration=float(timing.get("duration",0)); parts=float(timing.get("build",0))+float(timing.get("pause",0))+float(timing.get("reveal",0))
        if duration<=0: issues.append({"segment_id":seg.get("segment_id"),"code":"INVALID_DURATION"})
        if parts > duration*1.35: issues.append({"segment_id":seg.get("segment_id"),"code":"TIMING_OVERCOMMITTED"})
    strong_density=strong_count/max(1,total_grammar)
    if strong_density>.55: issues.append({"segment_id":None,"code":"GLOBAL_EFFECT_DENSITY_TOO_HIGH"})
    return {"status":"pass" if not issues else "fail","families":sorted(used),"family_count":len(used),"strong_effect_density":round(strong_density,3),"issues":issues,"segment_count":len(segments)}

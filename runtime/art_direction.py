"""Provider-neutral Art Direction Engine v1."""
from __future__ import annotations
from copy import deepcopy
from typing import Any, Dict

PROFILES: Dict[str, Dict[str, Any]] = {
    "editorial_restraint": {
        "version":"1.0","palette":{"background":"#171613","foreground":"#F3EFE6","muted":"#B1AA9B","panel":"#211F1A","accent":"#D6C3A1"},
        "typography":{"hero_size":92,"data_size":168,"body_size":38,"weight":620,"tracking":0.01,"max_width":1460},
        "geometry":{"radius":12,"border_width":1,"panel_opacity":0.72,"gap":22},
        "rhythm":{"enter_multiplier":1.12,"exit_multiplier":1.08,"stagger":0.16,"camera_push":1.022},
        "intensity":{"veil_opacity":0.38,"impact_strength":0.55,"max_strong_effects":2}
    },
    "precision_tech": {
        "version":"1.0","palette":{"background":"#080A0D","foreground":"#F5F7FA","muted":"#87909D","panel":"#10141A","accent":"#A7B8CC"},
        "typography":{"hero_size":98,"data_size":180,"body_size":36,"weight":680,"tracking":0.025,"max_width":1500},
        "geometry":{"radius":18,"border_width":1,"panel_opacity":0.78,"gap":18},
        "rhythm":{"enter_multiplier":0.92,"exit_multiplier":0.9,"stagger":0.1,"camera_push":1.03},
        "intensity":{"veil_opacity":0.48,"impact_strength":0.7,"max_strong_effects":3}
    },
    "kinetic_signal": {
        "version":"1.0","palette":{"background":"#090909","foreground":"#FFFDF7","muted":"#A6A6A1","panel":"#151515","accent":"#E7E1D3"},
        "typography":{"hero_size":116,"data_size":210,"body_size":40,"weight":760,"tracking":-0.01,"max_width":1540},
        "geometry":{"radius":26,"border_width":1,"panel_opacity":0.82,"gap":14},
        "rhythm":{"enter_multiplier":0.78,"exit_multiplier":0.82,"stagger":0.07,"camera_push":1.04},
        "intensity":{"veil_opacity":0.55,"impact_strength":0.88,"max_strong_effects":4}
    },
}


def get_profile(profile_id: str) -> Dict[str, Any]:
    if profile_id not in PROFILES:
        raise ValueError(f"unknown art direction profile: {profile_id}")
    return deepcopy(PROFILES[profile_id])


def apply_profile(mg_plan: Dict[str, Any], profile_id: str) -> Dict[str, Any]:
    profile=get_profile(profile_id)
    result=deepcopy(mg_plan)
    result["art_direction"]={"profile_id":profile_id, **profile}
    for seg in result.get("segments", []):
        seg["art_direction_ref"]=profile_id
        timing=seg.setdefault("timing", {})
        timing["enter_multiplier"]=profile["rhythm"]["enter_multiplier"]
        timing["exit_multiplier"]=profile["rhythm"]["exit_multiplier"]
        timing["stagger"]=profile["rhythm"]["stagger"]
        # Style cannot override semantic restraint. It only caps intensity further.
        seg["style_tokens"]={
            "palette":profile["palette"],"typography":profile["typography"],"geometry":profile["geometry"],
            "camera_push":profile["rhythm"]["camera_push"],"veil_opacity":profile["intensity"]["veil_opacity"],
            "impact_strength":profile["intensity"]["impact_strength"],"max_strong_effects":profile["intensity"]["max_strong_effects"]
        }
    return result

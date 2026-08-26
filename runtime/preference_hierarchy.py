"""Preference hierarchy compiler.

Builds scoped style evidence without allowing any semantic mutation. Project evidence is
most local, brand evidence is broader, user evidence is broadest. The output is a bounded
weighted prior for Style Selection Intelligence.
"""
from __future__ import annotations
from typing import Any, Dict, Iterable, List
from runtime.preference_learning import compile_preference_evidence, PROFILES

_SCOPE_WEIGHT={"project":1.0,"brand":0.75,"user":0.5}


def compile_scopes(records: Iterable[Dict[str, Any]], *, project_id: str|None=None, brand_id: str|None=None, user_id: str|None=None) -> Dict[str, Any]:
    rows=list(records)
    scoped={}
    for scope,key,value in (("project","project_id",project_id),("brand","brand_id",brand_id),("user","user_id",user_id)):
        subset=[r for r in rows if value is not None and r.get(key)==value]
        scoped[scope]=compile_preference_evidence(subset,context_key=f"{scope}:{value}" if value is not None else f"{scope}:none")
    weighted={p:0.0 for p in PROFILES}; weights={p:0.0 for p in PROFILES}
    for scope,evidence in scoped.items():
        scope_weight=_SCOPE_WEIGHT[scope] * float(evidence.get("confidence",0) or 0)
        for profile,bias in (evidence.get("profile_bias") or {}).items():
            weighted[profile]+=float(bias)*scope_weight; weights[profile]+=scope_weight
    merged={p:round(max(-1.5,min(1.5, weighted[p]/weights[p] if weights[p] else 0.0)),3) for p in PROFILES}
    return {
        "version":"1.0",
        "scopes":scoped,
        "profile_bias":merged,
        "semantic_mutation_allowed":False,
        "precedence":["explicit_user_or_brand_constraint","project_preference","brand_preference","user_preference","heuristic"],
    }

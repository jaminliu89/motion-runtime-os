"""Preference Learning v1 for Art Direction.

Compiles blind votes / human overrides into bounded style priors. It never edits
Director IR, MG grammar, timing semantics, or attention targets.
"""
from __future__ import annotations
from collections import defaultdict
from typing import Any, Dict, Iterable, List

PROFILES=("editorial_restraint","precision_tech","kinetic_signal")


def _profile(record: Dict[str, Any]) -> str | None:
    for key in ("preferred_profile","winner_profile","selected_profile","artDirectionProfile","art_direction_profile"):
        value=record.get(key)
        if value in PROFILES: return str(value)
    patch=record.get("patch") or {}
    provenance=patch.get("provenance") or {}
    for key in ("artDirectionProfile","art_direction_profile"):
        value=provenance.get(key)
        if value in PROFILES: return str(value)
    return None


def compile_preference_evidence(records: Iterable[Dict[str, Any]], *, context_key: str="global") -> Dict[str, Any]:
    scores=defaultdict(float); counts=defaultdict(int); accepted=[]; ignored=[]
    for i,record in enumerate(records):
        profile=_profile(record)
        if profile is None:
            ignored.append({"index":i,"reason":"no_valid_profile"}); continue
        action=str(record.get("action") or record.get("vote") or record.get("result") or "prefer").lower()
        weight=float(record.get("weight",1.0) or 1.0)
        weight=max(.1,min(3.0,weight))
        if action in {"reject","dislike","lose","loser"}: delta=-1.0*weight
        elif action in {"override","prefer","preferred","winner","approve","accept","like"}: delta=1.0*weight
        else:
            ignored.append({"index":i,"reason":f"unsupported_action:{action}"}); continue
        scores[profile]+=delta; counts[profile]+=1
        accepted.append({"index":i,"profile":profile,"action":action,"delta":round(delta,3)})

    total=sum(counts.values())
    raw={p:scores[p] for p in PROFILES}
    # Bounded prior: enough to break heuristic ties and learn taste, never enough to become
    # an implicit hard constraint. Explicit user/brand preference still wins in selector.
    bias={p:round(max(-1.5,min(1.5,raw[p]/max(1,counts[p]))),3) for p in PROFILES}
    confidence=round(min(.92, .35 + min(total,20)*.025),3) if total else 0.0
    return {
        "version":"1.0","context_key":context_key,"sample_count":total,
        "profile_bias":bias,"profile_counts":{p:counts[p] for p in PROFILES},
        "confidence":confidence,"accepted_events":accepted,"ignored_events":ignored,
        "semantic_mutation_allowed":False,
    }


def merge_evidence(*evidence_sets: Dict[str, Any]) -> Dict[str, Any]:
    rows=[]
    for evidence in evidence_sets:
        confidence=float(evidence.get("confidence",0) or 0)
        for profile,bias in (evidence.get("profile_bias") or {}).items():
            if profile in PROFILES:
                rows.append({"preferred_profile":profile,"action":"prefer" if float(bias)>=0 else "reject","weight":abs(float(bias))*max(.25,confidence)})
    return compile_preference_evidence(rows,context_key="merged")

"""Style Selection Intelligence v1.

Deterministic/evidence-friendly baseline. A future model may propose style choices but
must return the same typed decision fields and may not rewrite semantic grammar.
"""
from __future__ import annotations
from typing import Any, Dict

PROFILES=("editorial_restraint","precision_tech","kinetic_signal")


def _text(context: Dict[str, Any]) -> str:
    values=[context.get("content_type"),context.get("audience"),context.get("brand"),context.get("tone")]
    values += list(context.get("keywords") or [])
    return " ".join(str(x or "").lower() for x in values)


def select(context: Dict[str, Any], director_ir: Dict[str, Any]) -> Dict[str, Any]:
    text=_text(context)
    functions=[str(s.get("narrative_function","")) for s in director_ir.get("segments",[])]
    scores={p:0.0 for p in PROFILES}; reasons={p:[] for p in PROFILES}

    def add(profile: str, value: float, reason: str):
        scores[profile]+=value; reasons[profile].append(reason)

    for word in ("documentary","essay","humanistic","philosophy","history","纪录片","人文","哲学","历史","访谈"):
        if word in text: add("editorial_restraint",2.0,f"context:{word}")
    for word in ("ai","software","technology","tech","business","data","product","saas","代码","科技","商业","数据","产品","大模型"):
        if word in text: add("precision_tech",1.5,f"context:{word}")
    for word in ("short video","hook","launch","promo","viral","短视频","爆款","发布","宣传","带货"):
        if word in text: add("kinetic_signal",1.6,f"context:{word}")

    proof=sum(f in {"proof","evidence"} for f in functions); reveal=sum(f in {"reveal","revelation"} for f in functions); contrast=sum(f in {"turn","contrast"} for f in functions)
    exposition=sum(f in {"setup","exposition","explanation"} for f in functions)
    if proof: add("precision_tech",min(2.0,.55*proof),f"director:proof×{proof}")
    if reveal+contrast>=2: add("kinetic_signal",min(1.8,.45*(reveal+contrast)),f"director:turn/reveal×{reveal+contrast}")
    if exposition>=3: add("editorial_restraint",min(1.5,.35*exposition),f"director:exposition×{exposition}")

    evidence=context.get("preference_evidence") or {}
    evidence_conf=max(0.0,min(.92,float(evidence.get("confidence",0) or 0)))
    for profile,bias in (evidence.get("profile_bias") or {}).items():
        if profile in scores:
            bounded=max(-1.5,min(1.5,float(bias))) * evidence_conf
            if bounded:
                add(profile,bounded,f"human_preference:{bounded:+.3f}")

    forbidden=set(context.get("forbidden_profiles") or [])
    for p in forbidden: scores.pop(p,None); reasons.pop(p,None)
    if not scores: raise ValueError("all art direction profiles are forbidden")

    requested=context.get("preferred_profile")
    if requested is not None:
        if requested not in PROFILES: raise ValueError(f"unknown preferred profile: {requested}")
        if requested in forbidden: raise ValueError(f"preferred profile is forbidden: {requested}")
        reasons[str(requested)].append("explicit_brand_preference")
        selected=str(requested)
        ranked=[(selected,scores[selected])]+[(p,s) for p,s in sorted(scores.items(),key=lambda x:(x[1],x[0]),reverse=True) if p!=selected]
        confidence=.97
    else:
        ranked=sorted(scores.items(),key=lambda x:(x[1],x[0]),reverse=True)
        selected,top=ranked[0]; second=ranked[1][1] if len(ranked)>1 else 0.0
        margin=max(0.0,top-second); confidence=max(.5,min(.94,.55+margin*.08+min(max(top,0),5)*.03))

    return {
        "version":"1.1","selected_profile":selected,"confidence":round(confidence,3),
        "scores":{k:round(v,3) for k,v in sorted(scores.items())},"reasons":reasons[selected],
        "alternatives":[{"profile":p,"score":round(s,3)} for p,s in ranked if p!=selected],
        "context_snapshot":context,"preference_evidence_applied":bool(evidence and evidence_conf>0),
        "semantic_summary":{"functions":functions,"proof":proof,"reveal":reveal,"contrast":contrast,"exposition":exposition}
    }

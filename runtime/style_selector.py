"""Style Selection Intelligence v1.

Deterministic/evidence-friendly baseline. A future model may propose style choices but
must return the same typed decision fields and may not rewrite semantic grammar.
"""
from __future__ import annotations
from typing import Any, Dict, Iterable


def _text(context: Dict[str, Any]) -> str:
    values=[context.get("content_type"),context.get("audience"),context.get("brand"),context.get("tone")]
    values += list(context.get("keywords") or [])
    return " ".join(str(x or "").lower() for x in values)


def select(context: Dict[str, Any], director_ir: Dict[str, Any]) -> Dict[str, Any]:
    text=_text(context)
    functions=[str(s.get("narrative_function","")) for s in director_ir.get("segments",[])]
    scores={"editorial_restraint":0.0,"precision_tech":0.0,"kinetic_signal":0.0}
    reasons={k:[] for k in scores}

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

    requested=context.get("preferred_profile")
    if requested in scores: add(str(requested),3.0,"explicit_brand_preference")
    forbidden=set(context.get("forbidden_profiles") or [])
    for p in forbidden: scores.pop(p,None); reasons.pop(p,None)
    if not scores: raise ValueError("all art direction profiles are forbidden")

    ranked=sorted(scores.items(),key=lambda x:(x[1],x[0]),reverse=True)
    selected,top=ranked[0]; second=ranked[1][1] if len(ranked)>1 else 0.0
    margin=max(0.0,top-second); confidence=max(.5,min(.97,.55+margin*.08+min(top,5)*.03))
    return {
        "version":"1.0","selected_profile":selected,"confidence":round(confidence,3),
        "scores":{k:round(v,3) for k,v in sorted(scores.items())},
        "reasons":reasons[selected],
        "alternatives":[{"profile":p,"score":round(s,3)} for p,s in ranked[1:]],
        "context_snapshot":context,
        "semantic_summary":{"functions":functions,"proof":proof,"reveal":reveal,"contrast":contrast,"exposition":exposition}
    }

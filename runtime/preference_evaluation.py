"""Preference learning evaluation.

Evaluates whether learned style priors improve agreement with held-out human choices.
This is deliberately separate from training/compilation to prevent circular success claims.
"""
from __future__ import annotations
from typing import Any, Dict, Iterable, List
from runtime.style_selector import select


def evaluate(records: Iterable[Dict[str, Any]], *, evidence: Dict[str, Any]) -> Dict[str, Any]:
    rows=list(records); total=0; before_hits=0; after_hits=0; details=[]
    for row in rows:
        director=row.get("director_ir") or {"segments":[]}
        context=dict(row.get("context") or {})
        expected=row.get("expected_profile") or row.get("winner_profile")
        if not expected: continue
        before=select(context,director)
        learned_context=dict(context); learned_context["preference_evidence"]=evidence
        after=select(learned_context,director)
        total+=1; before_hit=before.get("selected_profile")==expected; after_hit=after.get("selected_profile")==expected
        before_hits+=int(before_hit); after_hits+=int(after_hit)
        details.append({"expected":expected,"before":before.get("selected_profile"),"after":after.get("selected_profile"),"before_hit":before_hit,"after_hit":after_hit})
    before_rate=before_hits/total if total else 0.0; after_rate=after_hits/total if total else 0.0
    return {"version":"1.0","sample_count":total,"before_accuracy":round(before_rate,4),"after_accuracy":round(after_rate,4),"lift":round(after_rate-before_rate,4),"improved":after_rate>before_rate,"details":details}

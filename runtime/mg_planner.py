"""Provider-neutral MG Planner v1.

Deterministic baseline: compiles Director IR into composable motion grammar.
Later LLM/agent planners must satisfy the same MG Plan contract and quality gates.
"""
from __future__ import annotations
from typing import Any, Dict, List


def _grammar(function: str, attention: str | None, confidence: float) -> List[str]:
    if function in {"revelation", "reveal"}:
        return ["freeze", "suppress_background", "keyword_isolation", "push_in", "impact_hit"]
    if function in {"turn", "contrast"}:
        return ["before_after", "hard_interrupt", "focus_isolation"]
    if function == "question":
        return ["negative_space", "word_reveal", "silence_hold"]
    if function in {"proof", "evidence"}:
        return ["number_counter", "bar_chart", "callout_annotation"]
    if function in {"emphasis", "payoff"}:
        return ["kinetic_text", "type_scale_contrast", "breath"]
    if attention and confidence >= .72:
        return ["keyword_isolation", "slow_reveal"]
    return ["word_reveal"]


def _story_function(function: str) -> str:
    return {
        "revelation": "reveal", "turn": "contrast", "question": "question",
        "emphasis": "payoff", "proof": "proof", "evidence": "proof",
        "setup": "setup", "exposition": "explanation"
    }.get(function, "explanation")


def plan(director_ir: Dict[str, Any]) -> Dict[str, Any]:
    result=[]
    for seg in director_ir.get("segments", []):
        fn=str(seg.get("narrative_function", "exposition"))
        confidence=float(seg.get("confidence", .5))
        attention=seg.get("attention_target")
        duration=max(.1, float(seg.get("end", 0))-float(seg.get("start", 0)))
        grammar=_grammar(fn, attention, confidence)
        # Restraint means stronger semantics get richer grammar; weak exposition stays quiet.
        restraint="low" if fn in {"revelation","turn","proof","evidence"} and confidence>=.72 else "medium" if attention else "high"
        req=["deterministic_timeline","local_asset"]
        if any(x in grammar for x in {"bar_chart","number_counter","callout_annotation","before_after"}): req.append("vector_graphics")
        result.append({
            "segment_id": str(seg.get("id")),
            "narrative_function": _story_function(fn),
            "attention_target": attention,
            "confidence": round(confidence,3),
            "restraint": restraint,
            "grammar": grammar,
            "timing": {"duration": round(duration,3), "build": round(min(duration*.35,.9),3), "pause": .25 if fn in {"revelation","question"} else 0, "reveal": round(min(duration*.45,1.2),3)},
            "provider_requirements": req,
            "rationale": f"semantic={fn}; confidence={confidence:.2f}; restraint={restraint}"
        })
    return {"version":"1.0","segments":result}

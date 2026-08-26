from runtime.mg_planner import plan
from runtime.mg_qa import evaluate


def test_directed_fixture_has_multiple_grammar_families_without_restraint_violation():
    director={"segments":[
      {"id":"p","start":0,"end":4,"narrative_function":"proof","attention_target":"30","confidence":.9},
      {"id":"t","start":4,"end":8,"narrative_function":"turn","attention_target":"but","confidence":.9},
      {"id":"r","start":8,"end":12,"narrative_function":"revelation","attention_target":"real problem","confidence":.93},
      {"id":"e","start":12,"end":16,"narrative_function":"exposition","attention_target":None,"confidence":.6},
    ]}
    report=evaluate(plan(director))
    assert report["status"]=="pass"
    assert report["family_count"]>=3
    assert report["strong_effect_density"]<.55


def test_high_restraint_rejects_strong_decorative_effect():
    p={"version":"1.0","segments":[{"segment_id":"e","narrative_function":"explanation","attention_target":None,"confidence":.6,"restraint":"high","grammar":["flash"],"timing":{"duration":3},"provider_requirements":[]}]}
    report=evaluate(p)
    assert report["status"]=="fail"
    assert any(i["code"]=="STRONG_EFFECT_UNDER_HIGH_RESTRAINT" for i in report["issues"])

from runtime.art_direction import apply_profile
from runtime.mg_planner import plan


def fixture():
    return {"segments":[
        {"id":"p","start":0,"end":5,"narrative_function":"proof","attention_target":"30","confidence":.92},
        {"id":"c","start":5,"end":10,"narrative_function":"turn","attention_target":"但是","confidence":.91},
        {"id":"r","start":10,"end":15,"narrative_function":"revelation","attention_target":"真正的问题","confidence":.94},
    ]}


def test_profiles_change_tokens_not_semantics():
    base=plan(fixture())
    editorial=apply_profile(base,"editorial_restraint")
    tech=apply_profile(base,"precision_tech")
    kinetic=apply_profile(base,"kinetic_signal")
    for styled in (editorial,tech,kinetic):
        assert [s["grammar"] for s in styled["segments"]] == [s["grammar"] for s in base["segments"]]
        assert [s["narrative_function"] for s in styled["segments"]] == [s["narrative_function"] for s in base["segments"]]
        assert [s["attention_target"] for s in styled["segments"]] == [s["attention_target"] for s in base["segments"]]
    assert editorial["art_direction"]["typography"]["hero_size"] != kinetic["art_direction"]["typography"]["hero_size"]
    assert tech["art_direction"]["palette"] != editorial["art_direction"]["palette"]


def test_unknown_profile_rejected():
    try:
        apply_profile(plan(fixture()),"celebrity-copy")
        assert False
    except ValueError:
        assert True

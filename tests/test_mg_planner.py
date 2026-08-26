from runtime.mg_planner import plan


def test_revelation_gets_directed_visual_grammar():
    ir={"segments":[{"id":"s1","start":0,"end":3,"narrative_function":"revelation","attention_target":"30","confidence":.9}]}
    p=plan(ir)["segments"][0]
    assert p["narrative_function"]=="reveal"
    assert "freeze" in p["grammar"]
    assert "keyword_isolation" in p["grammar"]
    assert "push_in" in p["grammar"]
    assert p["restraint"]=="low"


def test_exposition_is_restrained():
    ir={"segments":[{"id":"s2","start":0,"end":4,"narrative_function":"exposition","attention_target":None,"confidence":.6}]}
    p=plan(ir)["segments"][0]
    assert p["grammar"]==["word_reveal"]
    assert p["restraint"]=="high"


def test_contrast_and_question_are_not_same_template():
    ir={"segments":[
      {"id":"a","start":0,"end":2,"narrative_function":"turn","attention_target":"但是","confidence":.85},
      {"id":"b","start":2,"end":4,"narrative_function":"question","attention_target":"为什么","confidence":.88}
    ]}
    segments=plan(ir)["segments"]
    assert segments[0]["grammar"] != segments[1]["grammar"]
    assert "before_after" in segments[0]["grammar"]
    assert "negative_space" in segments[1]["grammar"]

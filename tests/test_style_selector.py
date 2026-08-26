from runtime.style_selector import select


def director(*functions):
    return {"segments":[{"id":str(i),"narrative_function":f} for i,f in enumerate(functions)]}


def test_ai_business_proof_prefers_precision_tech():
    d=select({"content_type":"AI product business explanation","audience":"founders","keywords":["data"]},director("proof","explanation","proof"))
    assert d["selected_profile"]=="precision_tech"
    assert d["confidence"]>=.5
    assert d["reasons"]


def test_humanistic_documentary_prefers_editorial_restraint():
    d=select({"content_type":"humanistic documentary","tone":"history philosophy"},director("setup","exposition","explanation","explanation"))
    assert d["selected_profile"]=="editorial_restraint"


def test_short_video_turns_can_prefer_kinetic_signal():
    d=select({"content_type":"short video viral hook"},director("turn","revelation","contrast"))
    assert d["selected_profile"]=="kinetic_signal"


def test_explicit_brand_preference_is_evidence_not_semantic_rewrite():
    d=select({"preferred_profile":"editorial_restraint","content_type":"AI product"},director("proof"))
    assert d["selected_profile"]=="editorial_restraint"
    assert "explicit_brand_preference" in d["reasons"]


def test_forbidden_profile_cannot_win():
    d=select({"content_type":"AI product data","forbidden_profiles":["precision_tech"]},director("proof","proof"))
    assert d["selected_profile"]!="precision_tech"

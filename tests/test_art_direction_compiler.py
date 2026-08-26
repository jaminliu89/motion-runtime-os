from runtime.art_direction import apply_profile
from runtime.mg_compiler import compile_motion_ir


def test_art_direction_survives_into_motion_ir():
    plan={"version":"1.0","segments":[{"segment_id":"s","narrative_function":"proof","attention_target":"42","confidence":.9,"restraint":"low","grammar":["number_counter","bar_chart","timeline","document_highlight","browser_frame","mask_reveal"],"timing":{"duration":6},"provider_requirements":[]}]}
    styled=apply_profile(plan,"precision_tech")
    director={"segments":[{"id":"s","start":0,"end":6,"transcript":"42 is the proof"}]}
    ir=compile_motion_ir(styled,director)
    assert ir["art_direction"]["profile_id"]=="precision_tech"
    kinds={x.get("style",{}).get("mg_kind") for x in ir["scenes"][0]["layers"]}
    assert {"number_counter","bar_chart","timeline","document_highlight","browser_frame","hero_text"}.issubset(kinds)
    for layer in ir["scenes"][0]["layers"]:
        if layer.get("style",{}).get("mg_kind"):
            assert layer["style"]["art_direction_ref"]=="precision_tech"

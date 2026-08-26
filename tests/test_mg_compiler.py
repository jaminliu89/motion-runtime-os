from runtime.mg_planner import plan
from runtime.mg_compiler import compile_motion_ir


def _director():
    return {"segments":[
        {"id":"s1","start":0,"end":3,"transcript":"两个月，我们做了30个产品。","narrative_function":"proof","attention_target":"30","confidence":.9},
        {"id":"s2","start":3,"end":6,"transcript":"但是数量并不是问题。","narrative_function":"turn","attention_target":"但是","confidence":.88},
        {"id":"s3","start":6,"end":10,"transcript":"真正的问题，是有没有一条闭环。","narrative_function":"revelation","attention_target":"真正的问题","confidence":.93},
    ]}


def test_compiler_preserves_source_audio_and_semantic_layers():
    d=_director(); p=plan(d); ir=compile_motion_ir(p,d,source_asset_ref="assets/source.mp4",audio_asset_ref="audio/source.wav")
    scene=ir["scenes"][0]
    assert scene["duration"]==10
    assert any(x.get("asset_ref")=="assets/source.mp4" for x in scene["layers"])
    assert scene["audio_tracks"][0]["asset_ref"]=="audio/source.wav"
    kinds={x.get("style",{}).get("mg_kind") for x in scene["layers"]}
    assert "bar_chart" in kinds
    assert "comparison" in kinds
    assert "hero_text" in kinds
    assert "veil" in kinds
    assert scene["camera"]["movement"]=="subtle-push-in"
    assert len(scene["subtitle_cues"])==3


def test_compiled_layer_times_stay_inside_director_duration():
    d=_director(); ir=compile_motion_ir(plan(d),d)
    scene=ir["scenes"][0]
    assert all(0 <= layer["start"] < layer["end"] <= 10 for layer in scene["layers"])

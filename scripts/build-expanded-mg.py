import json, sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
if str(root) not in sys.path: sys.path.insert(0,str(root))
from runtime.art_direction import apply_profile
from runtime.mg_compiler import compile_motion_ir

segments=[
 {"id":"line","start":0,"end":4,"transcript":"growth is not linear","narrative_function":"proof"},
 {"id":"timeline","start":4,"end":8,"transcript":"the system evolves through stages","narrative_function":"explanation"},
 {"id":"graph","start":8,"end":12,"transcript":"input judgment and output form a network","narrative_function":"explanation"},
 {"id":"doc","start":12,"end":16,"transcript":"the evidence is written in the document","narrative_function":"proof"},
 {"id":"ui","start":16,"end":20,"transcript":"the workflow becomes a visible product surface","narrative_function":"reveal"}
]
plan={"version":"1.0","segments":[
 {"segment_id":"line","narrative_function":"proof","attention_target":"growth","confidence":.92,"restraint":"low","grammar":["line_chart"],"timing":{"duration":4},"provider_requirements":["vector_graphics"]},
 {"segment_id":"timeline","narrative_function":"explanation","attention_target":"stages","confidence":.9,"restraint":"medium","grammar":["timeline"],"timing":{"duration":4},"provider_requirements":["vector_graphics"]},
 {"segment_id":"graph","narrative_function":"explanation","attention_target":"network","confidence":.9,"restraint":"medium","grammar":["node_graph"],"timing":{"duration":4},"provider_requirements":["vector_graphics"]},
 {"segment_id":"doc","narrative_function":"proof","attention_target":"evidence","confidence":.93,"restraint":"low","grammar":["document_highlight"],"timing":{"duration":4},"provider_requirements":["vector_graphics"]},
 {"segment_id":"ui","narrative_function":"reveal","attention_target":"product surface","confidence":.95,"restraint":"low","grammar":["browser_frame","mask_reveal","keyword_isolation"],"timing":{"duration":4},"provider_requirements":["vector_graphics"]}
]}
styled=apply_profile(plan,'precision_tech')
director={"segments":segments}
ir=compile_motion_ir(styled,director,source_asset_ref='assets/expanded-mg-source.mp4',width=1080,height=1920,fps=30)
(root/'examples/expanded-mg/mg-plan.json').write_text(json.dumps(styled,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'examples/expanded-mg/motion-ir.json').write_text(json.dumps(ir,ensure_ascii=False,indent=2),encoding='utf-8')
print('Expanded MG fixture compiled')
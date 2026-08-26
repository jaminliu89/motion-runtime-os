import json
import sys
from pathlib import Path

root=Path(__file__).resolve().parents[1]
if str(root) not in sys.path:
    sys.path.insert(0,str(root))

from runtime.mg_planner import plan
from runtime.mg_compiler import compile_motion_ir

director=json.loads((root/'examples/directed-mg/director-ir.json').read_text(encoding='utf-8'))
mg=plan(director)
(root/'examples/directed-mg/mg-plan.json').write_text(json.dumps(mg,ensure_ascii=False,indent=2),encoding='utf-8')
motion=compile_motion_ir(mg,director,source_asset_ref='assets/directed-mg-source.mp4',width=1080,height=1920,fps=30)
(root/'examples/directed-mg/motion-ir.json').write_text(json.dumps(motion,ensure_ascii=False,indent=2),encoding='utf-8')
print('Directed MG fixture compiled')

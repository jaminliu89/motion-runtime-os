import argparse, json, sys
from pathlib import Path

root=Path(__file__).resolve().parents[1]
if str(root) not in sys.path: sys.path.insert(0,str(root))
from runtime.mg_planner import plan
from runtime.art_direction import apply_profile
from runtime.mg_compiler import compile_motion_ir

parser=argparse.ArgumentParser()
parser.add_argument('--profile',choices=['editorial_restraint','precision_tech','kinetic_signal'],default='precision_tech')
args=parser.parse_args()
director=json.loads((root/'examples/art-direction/director-ir.json').read_text(encoding='utf-8'))
mg=apply_profile(plan(director),args.profile)
(root/'examples/art-direction/mg-plan.json').write_text(json.dumps(mg,ensure_ascii=False,indent=2),encoding='utf-8')
motion=compile_motion_ir(mg,director,source_asset_ref='assets/art-direction-source.mp4',width=1080,height=1920,fps=30)
(root/'examples/art-direction/motion-ir.json').write_text(json.dumps(motion,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Art direction fixture compiled: {args.profile}')
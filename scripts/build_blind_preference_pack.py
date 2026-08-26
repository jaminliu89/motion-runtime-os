#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, random, shutil
from pathlib import Path


def sha256(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--neutral',required=True); p.add_argument('--directed',required=True)
    p.add_argument('--out',default='out/preference-pack'); p.add_argument('--seed',type=int,default=20260826)
    a=p.parse_args(); neutral=Path(a.neutral); directed=Path(a.directed); out=Path(a.out)
    for x in (neutral,directed):
        if not x.exists() or x.stat().st_size==0: raise SystemExit(f'missing artifact: {x}')
    out.mkdir(parents=True,exist_ok=True); rng=random.Random(a.seed)
    mapping=['neutral','directed']; rng.shuffle(mapping)
    public={"schema_version":"1.0","study":"directed-mg-vs-neutral","seed":a.seed,"question":"Which version better communicates the idea while feeling intentional rather than decorative?","choices":[{"id":"A","file":"A.mp4"},{"id":"B","file":"B.mp4"}],"vote_schema":{"reviewer_id":"string","choice":"A|B|tie","clarity":1,"attention_control":1,"restraint":1,"overall":1,"comment":"optional"}}
    key={"schema_version":"1.0","study":"directed-mg-vs-neutral","mapping":{"A":mapping[0],"B":mapping[1]},"source_sha256":{"neutral":sha256(neutral),"directed":sha256(directed)}}
    sources={'neutral':neutral,'directed':directed}
    shutil.copy2(sources[mapping[0]],out/'A.mp4'); shutil.copy2(sources[mapping[1]],out/'B.mp4')
    (out/'study.json').write_text(json.dumps(public,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'answer-key.json').write_text(json.dumps(key,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'votes.jsonl').write_text('',encoding='utf-8')
    print(json.dumps({"pack":str(out),"A_sha256":sha256(out/'A.mp4'),"B_sha256":sha256(out/'B.mp4')},indent=2))

if __name__=='__main__': main()

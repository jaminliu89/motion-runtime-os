#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, math
from pathlib import Path


def wilson(k:int,n:int,z:float=1.96):
    if n==0: return [0.0,0.0]
    p=k/n; d=1+z*z/n
    c=(p+z*z/(2*n))/d; m=z*math.sqrt((p*(1-p)+z*z/(4*n))/n)/d
    return [max(0,c-m),min(1,c+m)]


def main():
    p=argparse.ArgumentParser(); p.add_argument('--key',required=True); p.add_argument('--votes',required=True); p.add_argument('--out',default='evidence/preference-score.json'); p.add_argument('--min-votes',type=int,default=5); p.add_argument('--target',type=float,default=.60)
    a=p.parse_args(); key=json.loads(Path(a.key).read_text(encoding='utf-8')); votes=[]
    for line in Path(a.votes).read_text(encoding='utf-8').splitlines():
        if line.strip(): votes.append(json.loads(line))
    directed_choice=next(k for k,v in key['mapping'].items() if v=='directed')
    decisive=[v for v in votes if v.get('choice') in {'A','B'}]
    wins=sum(v['choice']==directed_choice for v in decisive); n=len(decisive); rate=wins/n if n else 0
    metrics={m:[] for m in ('clarity','attention_control','restraint','overall')}
    for v in votes:
        for m in metrics:
            if isinstance(v.get(m),(int,float)): metrics[m].append(float(v[m]))
    averages={m:(sum(xs)/len(xs) if xs else None) for m,xs in metrics.items()}
    result={"schema_version":"1.0","study":key.get('study'),"total_votes":len(votes),"decisive_votes":n,"directed_choice":directed_choice,"directed_wins":wins,"directed_preference_rate":round(rate,4),"wilson_95":[round(x,4) for x in wilson(wins,n)],"average_scores":averages,"target":a.target,"min_votes":a.min_votes,"status":"PASS" if n>=a.min_votes and rate>=a.target else "INSUFFICIENT" if n<a.min_votes else "FAIL"}
    out=Path(a.out); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8'); print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__': main()

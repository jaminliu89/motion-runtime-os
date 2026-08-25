import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [composition = 'CinematicIntro', planPath = 'out/cinematic-intro.keyframes.json', outDir = 'evidence/frames/current'] = process.argv.slice(2);
if (!fs.existsSync(planPath)) throw new Error(`Missing keyframe plan: ${planPath}`);
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
fs.mkdirSync(outDir, {recursive: true});

const rawFrames = Array.isArray(plan.frames) ? plan.frames : (plan.keyframes ?? []).map((k) => k.frame);
const frames = [...new Set(rawFrames.filter(Number.isInteger))].sort((a,b)=>a-b);
if (!frames.length) throw new Error('No deterministic keyframes found');

for (const frame of frames) {
  const output = path.join(outDir, `frame-${String(frame).padStart(5,'0')}.png`);
  execFileSync('npx', ['remotion', 'still', 'src/index.ts', composition, output, `--frame=${frame}`], {stdio: 'inherit'});
  if (!fs.existsSync(output) || fs.statSync(output).size === 0) throw new Error(`Still render failed: ${output}`);
}
console.log(`Rendered ${frames.length} keyframe PNGs to ${outDir}`);

import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const [currentDir = 'evidence/frames/current', baselineDir = 'quality/golden-baselines/cinematic-intro', diffDir = 'evidence/visual-diff'] = process.argv.slice(2);
const threshold = Number(process.env.MOTION_VISUAL_DIFF_THRESHOLD ?? '0.01');
fs.mkdirSync(diffDir, {recursive:true});

if (!fs.existsSync(currentDir)) throw new Error(`Missing current frames: ${currentDir}`);
const current = fs.readdirSync(currentDir).filter((f)=>f.endsWith('.png')).sort();
if (current.length === 0) throw new Error(`No current PNG frames in ${currentDir}`);

const baselineFiles = fs.existsSync(baselineDir)
  ? fs.readdirSync(baselineDir).filter((f)=>f.endsWith('.png')).sort()
  : [];

if (baselineFiles.length === 0) {
  const report = {status:'NO_BASELINE', current_frames:current.length, baseline_dir:baselineDir, message:'Golden baseline approval is required before pixel diff becomes mandatory.'};
  fs.writeFileSync(path.join(diffDir,'report.json'), JSON.stringify(report,null,2));
  console.log(`NO_BASELINE: ${baselineDir}. Captured ${current.length} current frames; approval is required before enforcing visual diff.`);
  process.exit(0);
}

const baselines = new Set(baselineFiles);
let failed = false;
const report = [];
for (const file of current) {
  if (!baselines.has(file)) {
    report.push({file,status:'missing_baseline'}); failed = true; continue;
  }
  const a = PNG.sync.read(fs.readFileSync(path.join(currentDir,file)));
  const b = PNG.sync.read(fs.readFileSync(path.join(baselineDir,file)));
  if (a.width !== b.width || a.height !== b.height) {
    report.push({file,status:'dimension_mismatch',current:[a.width,a.height],baseline:[b.width,b.height]}); failed = true; continue;
  }
  const diff = new PNG({width:a.width,height:a.height});
  const count = pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:0.1,includeAA:false});
  const ratio = count/(a.width*a.height);
  fs.writeFileSync(path.join(diffDir,file), PNG.sync.write(diff));
  report.push({file,status:ratio <= threshold ? 'pass':'fail',diff_pixels:count,diff_ratio:ratio});
  if (ratio > threshold) failed = true;
}
fs.writeFileSync(path.join(diffDir,'report.json'), JSON.stringify({status: failed ? 'FAIL':'PASS',threshold,report},null,2));
if (failed) {
  console.error(`Visual regression failed. See ${diffDir}/report.json`);
  process.exit(1);
}
console.log(`Visual regression passed for ${report.length} frames`);

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
const fingerprintPath = path.join(baselineDir, 'baseline-fingerprint.json');
const fingerprint = fs.existsSync(fingerprintPath)
  ? JSON.parse(fs.readFileSync(fingerprintPath, 'utf8'))
  : null;

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function averageHash64(png) {
  const values = [];
  for (let gy = 0; gy < 8; gy++) {
    const y0 = Math.floor((gy * png.height) / 8);
    const y1 = Math.floor(((gy + 1) * png.height) / 8);
    for (let gx = 0; gx < 8; gx++) {
      const x0 = Math.floor((gx * png.width) / 8);
      const x1 = Math.floor(((gx + 1) * png.width) / 8);
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * png.width + x) * 4;
          sum += 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
          count++;
        }
      }
      values.push(count ? sum / count : 0);
    }
  }
  const avg = values.reduce((a,b)=>a+b,0) / values.length;
  let bits = 0n;
  for (const value of values) bits = (bits << 1n) | (value >= avg ? 1n : 0n);
  return bits.toString(16).padStart(16, '0');
}

function hammingHex(a, b) {
  let value = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let count = 0;
  while (value) {
    count += Number(value & 1n);
    value >>= 1n;
  }
  return count;
}

if (baselineFiles.length === 0 && fingerprint?.review_status === 'approved') {
  const expected = new Map((fingerprint.frames ?? []).map((entry) => [entry.file, entry]));
  const maxHamming = Number(process.env.MOTION_VISUAL_HASH_HAMMING ?? fingerprint.max_hamming_distance ?? 2);
  let failed = false;
  const report = [];
  for (const file of current) {
    const baseline = expected.get(file);
    if (!baseline) {
      report.push({file,status:'missing_fingerprint'});
      failed = true;
      continue;
    }
    const buffer = fs.readFileSync(path.join(currentDir,file));
    const png = PNG.sync.read(buffer);
    if (png.width !== baseline.width || png.height !== baseline.height) {
      report.push({file,status:'dimension_mismatch',current:[png.width,png.height],baseline:[baseline.width,baseline.height]});
      failed = true;
      continue;
    }
    const currentSha = sha256(buffer);
    const currentHash = averageHash64(png);
    const hamming = hammingHex(currentHash, baseline.ahash64);
    const exact = currentSha === baseline.sha256;
    const pass = exact || hamming <= maxHamming;
    report.push({file,status:pass ? 'pass':'fail',exact_sha256:exact,hamming_distance:hamming,max_hamming_distance:maxHamming,current_ahash64:currentHash,baseline_ahash64:baseline.ahash64});
    if (!pass) failed = true;
  }
  for (const file of expected.keys()) {
    if (!current.includes(file)) {
      report.push({file,status:'missing_current'});
      failed = true;
    }
  }
  fs.writeFileSync(path.join(diffDir,'report.json'), JSON.stringify({status: failed ? 'FAIL':'PASS',mode:'approved_fingerprint',baseline_id:fingerprint.baseline_id,source_run_id:fingerprint.source_run_id,report},null,2));
  if (failed) {
    console.error(`Visual fingerprint regression failed. See ${diffDir}/report.json`);
    process.exit(1);
  }
  console.log(`Visual fingerprint regression passed for ${current.length} frames against ${fingerprint.baseline_id}`);
  process.exit(0);
}

if (baselineFiles.length === 0) {
  const report = {status:'NO_BASELINE', current_frames:current.length, baseline_dir:baselineDir, message:'Golden baseline approval is required before visual regression becomes mandatory.'};
  fs.writeFileSync(path.join(diffDir,'report.json'), JSON.stringify(report,null,2));
  console.log(`NO_BASELINE: ${baselineDir}. Captured ${current.length} current frames; approval is required before enforcing visual regression.`);
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
fs.writeFileSync(path.join(diffDir,'report.json'), JSON.stringify({status: failed ? 'FAIL':'PASS',mode:'pixelmatch',threshold,report},null,2));
if (failed) {
  console.error(`Visual regression failed. See ${diffDir}/report.json`);
  process.exit(1);
}
console.log(`Visual regression passed for ${report.length} frames`);

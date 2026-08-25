import fs from 'node:fs';
import crypto from 'node:crypto';

const irPath = 'examples/cinematic-intro/motion-ir.json';
const outputPath = 'out/cinematic-intro.mp4';
const manifestPath = 'out/cinematic-intro.artifact.json';
const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
if (!fs.existsSync(outputPath)) throw new Error(`missing artifact: ${outputPath}`);
const bytes = fs.readFileSync(outputPath);
const durationMs = Math.round(ir.scenes.reduce((sum, scene) => sum + scene.duration, 0) * 1000);
const manifest = {
  artifact_id: `cinematic-intro-${crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12)}`,
  ir_version: ir.version,
  provider: 'remotion',
  adapter_version: '0.1.0',
  render_job_id: process.env.GITHUB_RUN_ID ?? null,
  source_commit: process.env.GITHUB_SHA ?? null,
  outputs: [{
    path: outputPath,
    format: 'mp4',
    width: ir.canvas.width,
    height: ir.canvas.height,
    fps: ir.canvas.fps,
    duration_ms: durationMs,
    checksum: crypto.createHash('sha256').update(bytes).digest('hex')
  }],
  assets: [],
  fonts: ['Inter fallback stack'],
  qa_report: 'out/qa-report.json',
  created_at: new Date().toISOString()
};
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Artifact manifest written: ${manifestPath}`);

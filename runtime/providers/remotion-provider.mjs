import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const remotionProvider = {
  id: 'remotion',
  version: '0.1.0',
  async discoverCapabilities() {
    return {provider:'remotion', deterministic:true, local_render:true, audio:true, subtitles:true, stills:true, supported_outputs:['mp4','png']};
  },
  async validate({irPath}) {
    if (!fs.existsSync(irPath)) return {ok:false, issues:[`missing IR: ${irPath}`]};
    return {ok:true, issues:[]};
  },
  async compile({composition, outputPath}) {
    return {entry:'src/index.ts', composition, outputPath};
  },
  async submit(compiled) {
    fs.mkdirSync(path.dirname(compiled.outputPath), {recursive:true});
    execFileSync('npx', ['remotion','render',compiled.entry,compiled.composition,compiled.outputPath], {stdio:'inherit'});
    return {job_id:`remotion-${Date.now()}`, status:'done', compiled};
  },
  async observe(job) {
    return {job_id:job.job_id,status:fs.existsSync(job.compiled.outputPath)?'done':'unknown'};
  },
  async retrieve(job) {
    return {artifacts:[job.compiled.outputPath]};
  },
  async verify(artifact) {
    if (!fs.existsSync(artifact) || fs.statSync(artifact).size === 0) return {ok:false, reason:'missing_or_empty'};
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(artifact)).digest('hex');
    return {ok:true, size_bytes:fs.statSync(artifact).size, checksum};
  },
  normalizeFailure(error) {
    return {category:'RENDER', message:error instanceof Error ? error.message : String(error)};
  },
};

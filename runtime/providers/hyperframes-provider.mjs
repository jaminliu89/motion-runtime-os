import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

export const hyperframesProvider = {
  id: 'hyperframes',
  version: '0.2.0',
  async discoverCapabilities() {
    return {
      provider:'hyperframes',
      connected:true,
      deterministic:true,
      local_render:true,
      html_native:true,
      audio:true,
      subtitles:true,
      stills:false,
      supported_outputs:['mp4'],
      runtime:'hyperframes@0.8.12',
      node_min:22,
    };
  },
  async validate({irPath}) {
    if (!fs.existsSync(irPath)) return {ok:false,issues:[`missing IR: ${irPath}`]};
    const ir = JSON.parse(fs.readFileSync(irPath,'utf8'));
    const issues = [];
    if (!ir.canvas?.width || !ir.canvas?.height || !ir.canvas?.fps) issues.push('canvas width/height/fps required');
    if (!ir.scenes?.length) issues.push('at least one scene required');
    return {ok:issues.length===0,issues};
  },
  async compile({irPath,projectDir,outputPath}) {
    fs.rmSync(projectDir,{recursive:true,force:true});
    fs.mkdirSync(projectDir,{recursive:true});
    execFileSync(process.execPath,['scripts/compile-hyperframes-project.mjs',irPath,projectDir],{stdio:'inherit'});
    const compileReport = JSON.parse(fs.readFileSync(path.join(projectDir,'compile-report.json'),'utf8'));
    return {irPath,projectDir,outputPath,compileReport};
  },
  async submit(compiled) {
    fs.mkdirSync(path.dirname(compiled.outputPath),{recursive:true});
    const env = {
      ...process.env,
      HYPERFRAMES_FFMPEG_PATH: ffmpegPath,
      HYPERFRAMES_FFPROBE_PATH: ffprobe.path,
    };
    execFileSync('npx',[
      'hyperframes','render',compiled.projectDir,
      '--output',path.resolve(compiled.outputPath),
      '--fps','30','--quality','draft','--workers','1','--no-browser-gpu','--strict'
    ],{stdio:'inherit',env});
    return {job_id:`hyperframes-${Date.now()}`,status:'done',compiled};
  },
  async observe(job) {
    return {job_id:job.job_id,status:fs.existsSync(job.compiled.outputPath)?'done':'unknown'};
  },
  async retrieve(job) {
    return {artifacts:[job.compiled.outputPath],compile_report:job.compiled.compileReport};
  },
  async verify(artifact) {
    if (!fs.existsSync(artifact) || fs.statSync(artifact).size===0) return {ok:false,reason:'missing_or_empty'};
    const bytes = fs.readFileSync(artifact);
    return {ok:true,size_bytes:bytes.length,checksum:crypto.createHash('sha256').update(bytes).digest('hex')};
  },
  normalizeFailure(error) {
    return {category:'RENDER',message:error instanceof Error ? error.message : String(error)};
  },
};

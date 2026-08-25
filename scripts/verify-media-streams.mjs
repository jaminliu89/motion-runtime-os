import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const ffprobeStatic = require('ffprobe-static');
const ffprobePath = ffprobeStatic.path ?? ffprobeStatic;
const [mediaPath = 'out/cinematic-intro.mp4', reportPath = 'evidence/media-probe/cinematic-intro.json'] = process.argv.slice(2);

if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
  throw new Error(`Missing media artifact: ${mediaPath}`);
}

const raw = execFileSync(ffprobePath, [
  '-v', 'error',
  '-show_entries', 'stream=index,codec_type,codec_name,duration:format=duration,format_name',
  '-of', 'json',
  mediaPath,
], {encoding: 'utf8'});

const probe = JSON.parse(raw);
const streams = Array.isArray(probe.streams) ? probe.streams : [];
const hasVideo = streams.some((stream) => stream.codec_type === 'video');
const hasAudio = streams.some((stream) => stream.codec_type === 'audio');
const report = {
  media_path: mediaPath,
  probe_binary: ffprobePath,
  has_video: hasVideo,
  has_audio: hasAudio,
  streams,
  format: probe.format ?? null,
  status: hasVideo && hasAudio ? 'PASS' : 'FAIL',
};

fs.mkdirSync(path.dirname(reportPath), {recursive: true});
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

if (!hasVideo || !hasAudio) {
  throw new Error(`Media stream gate failed: video=${hasVideo} audio=${hasAudio}. See ${reportPath}`);
}
console.log(`Media stream gate passed: video=${hasVideo} audio=${hasAudio}`);

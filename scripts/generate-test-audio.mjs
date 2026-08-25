import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 48000;
const durationSeconds = 1.2;
const frequency = 880;
const amplitude = 0.18;
const samples = Math.floor(sampleRate * durationSeconds);
const bytesPerSample = 2;
const dataSize = samples * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
let offset = 0;

const writeString = (value) => { buffer.write(value, offset, 'ascii'); offset += value.length; };
const writeU32 = (value) => { buffer.writeUInt32LE(value, offset); offset += 4; };
const writeU16 = (value) => { buffer.writeUInt16LE(value, offset); offset += 2; };

writeString('RIFF');
writeU32(36 + dataSize);
writeString('WAVE');
writeString('fmt ');
writeU32(16);
writeU16(1);
writeU16(1);
writeU32(sampleRate);
writeU32(sampleRate * bytesPerSample);
writeU16(bytesPerSample);
writeU16(16);
writeString('data');
writeU32(dataSize);

for (let i = 0; i < samples; i++) {
  const t = i / sampleRate;
  const attack = Math.min(1, t / 0.02);
  const release = Math.min(1, (durationSeconds - t) / 0.18);
  const envelope = Math.max(0, Math.min(attack, release));
  const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope;
  buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
}

const out = path.join('public','audio','impact-test.wav');
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, buffer);
console.log(`Generated deterministic audio fixture: ${out}`);

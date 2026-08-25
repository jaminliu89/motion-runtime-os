import fs from 'node:fs';

const paths = process.argv.slice(2);
if (paths.length === 0) paths.push('examples/cinematic-intro/motion-ir.json');
let failures = 0;

for (const file of paths) {
  const ir = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const scene of ir.scenes ?? []) {
    const tracks = scene.audio_tracks ?? [];
    for (const cue of scene.audio_cues ?? []) {
      if (tracks.length === 0) continue;
      const covered = tracks.some((track) => cue.time >= track.start && cue.time <= (track.end ?? scene.duration));
      if (!covered) {
        console.error(`FAIL ${file}/${scene.id}: audio cue ${cue.id} at ${cue.time}s is outside all audio tracks`);
        failures++;
      }
    }
    const subtitles = [...(scene.subtitle_cues ?? [])].sort((a,b)=>a.start-b.start);
    for (let i = 1; i < subtitles.length; i++) {
      const prev = subtitles[i-1];
      const current = subtitles[i];
      if (current.start < prev.end) {
        console.error(`FAIL ${file}/${scene.id}: subtitle cues ${prev.id} and ${current.id} overlap`);
        failures++;
      }
    }
  }
}

if (failures) process.exit(1);
console.log(`A/V semantic sync passed for ${paths.length} Motion IR fixture(s)`);

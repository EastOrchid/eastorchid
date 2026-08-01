const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = 'D:/.openclaw/workspace/eastorchid';

// Get duration via ffprobe
function duration(file) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`, { encoding: 'utf8' }).trim();
  return parseFloat(out);
}

// Extract frame at fraction of video, output webp
function extractFrame(video, outWebp, fraction = 0.35) {
  const dur = duration(video);
  const t = Math.min(dur * fraction, dur - 0.2).toFixed(2);
  execSync(`ffmpeg -y -ss ${t} -i "${video}" -frames:v 1 -q:v 60 "${outWebp}"`, { stdio: 'ignore' });
  return t;
}

// 1) Huilan videos 1-22
const huilanVideos = 'D:/.openclaw/workspace/eastorchid/assets/videos/huilan';
const huilanOut = 'D:/.openclaw/workspace/eastorchid/assets/images/videos/huilan';
for (let i = 1; i <= 22; i++) {
  const v = path.join(huilanVideos, `huilan-${i}.mp4`);
  const out = path.join(huilanOut, `huilan-${i}.webp`);
  if (!fs.existsSync(v)) { console.log('SKIP missing ' + v); continue; }
  const t = extractFrame(v, out);
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`huilan-${i}.webp  (t=${t}s, ${kb}KB)`);
}

// 2) Watering videos 1-4
const waterVideos = 'D:/.openclaw/workspace/eastorchid/assets/video-library/watering/web';
const waterOut = 'D:/.openclaw/workspace/eastorchid/assets/images/garden/video-cover';
for (let i = 1; i <= 4; i++) {
  const v = path.join(waterVideos, `watering-0${i}.mp4`);
  const out = path.join(waterOut, `watering0${i}.webp`);
  if (!fs.existsSync(v)) { console.log('SKIP missing ' + v); continue; }
  const t = extractFrame(v, out);
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`watering0${i}.webp  (t=${t}s, ${kb}KB)`);
}

console.log('DONE');

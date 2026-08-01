const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcBase = 'G:/eastorchid-assets/orchid-library/photos/species';
const dstBase = 'D:/.openclaw/workspace/eastorchid/assets/images';

const species = [
  { name: 'chunlan', maxW: 1600 },
  { name: 'huilan', maxW: 1600 },
  { name: 'jianlan', maxW: 1600 },
];

let copied = 0;
let skipped = 0;

species.forEach(s => {
  const srcDir = path.join(srcBase, s.name, 'original');
  const dstDir = path.join(dstBase, s.name);
  if (!fs.existsSync(srcDir)) { console.log('SKIP (no src): ' + srcDir); return; }
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => /\.(JPG|jpeg|jpg)$/i.test(f));
  files.forEach(f => {
    const base = path.parse(f).name; // chunlan_01
    const src = path.join(srcDir, f);
    // 如果原图已在网站上（同名 JPG 或 webp），跳过
    const existingJpg = path.join(dstDir, f);
    const existingWebp = path.join(dstDir, base + '.webp');
    if (fs.existsSync(existingJpg) || fs.existsSync(existingWebp)) { skipped++; return; }

    const sizeKB = Math.round(fs.statSync(src).size / 1024);
    // 大图(>500KB)转webp压缩，小图直接复制
    if (sizeKB > 500) {
      const out = path.join(dstDir, base + '.webp');
      execSync(`ffmpeg -y -i "${src}" -vf "scale='min(1600,iw)':-2" -q:v 60 "${out}"`, { stdio: 'ignore' });
      const outKB = Math.round(fs.statSync(out).size / 1024);
      console.log(`  ${s.name}/${base}.webp  (${sizeKB}KB -> ${outKB}KB)`);
    } else {
      fs.copyFileSync(src, existingJpg);
      console.log(`  ${s.name}/${f}  (${sizeKB}KB copy)`);
    }
    copied++;
  });
});

console.log(`\nDone: copied ${copied}, skipped ${skipped} (already on site)`);

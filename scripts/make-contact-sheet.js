const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const SRC_DIR = 'G:\\兰花\\';
const OUT_DIR = 'D:\\.openclaw\\workspace\\eastorchid\\assets\\orchid-library\\contact-sheet';
const THUMB_DIR = path.join(OUT_DIR, 'thumbs');

// Ensure output dirs
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

// Get all image files
const files = fs.readdirSync(SRC_DIR)
  .filter(f => /\.jpe?g$/i.test(f))
  .sort();

console.log(`Found ${files.length} images`);

// Generate thumbnails using ffmpeg (max 200px wide)
let completed = 0;
let pending = [];

for (const f of files) {
  const src = path.join(SRC_DIR, f);
  const thumbName = f.replace(/\.jpe?g$/i, '.jpg');
  const thumbPath = path.join(THUMB_DIR, thumbName);
  
  // Skip if thumbnail already exists
  if (fs.existsSync(thumbPath)) {
    completed++;
    continue;
  }
  
  pending.push({ src, thumbPath, name: f });
}

console.log(`Already cached: ${completed}, need to generate: ${pending.length}`);

function getFileSizeKB(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return Math.round(stat.size / 1024);
  } catch { return 0; }
}

function getDimensions(filePath) {
  try {
    const out = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${filePath}"`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const data = JSON.parse(out);
    const s = data.streams?.[0];
    if (s) return { w: s.width, h: s.height };
  } catch {}
  return { w: 0, h: 0 };
}

function classifyFile(name) {
  if (name.startsWith('IMG_2388') || name.startsWith('IMG_2390')) return 'iPhone环境照';
  if (name.includes('春兰')) return '春兰';
  if (name.includes('惠兰')) return '蕙兰';
  if (name.includes('建兰')) return '建兰';
  return 'unknown';
}

// Generate thumbnails in batches of 4
async function generateThumbnails() {
  const batchSize = 4;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const promises = batch.map(({ src, thumbPath, name }) => {
      return new Promise((resolve) => {
        // Use ffmpeg to scale to 200px width, keep aspect ratio
        const cmd = `ffmpeg -y -i "${src}" -vf "scale=200:-1" -q:v 5 "${thumbPath}"`;
        exec(cmd, { timeout: 15000 }, (err) => {
          if (err) console.error(`  ✗ ${name}: ${err.message.slice(0, 60)}`);
          else process.stdout.write('.');
          resolve();
        });
      });
    });
    await Promise.all(promises);
    process.stdout.write(` ${Math.min(i + batchSize, pending.length)}/${pending.length}\n`);
  }
}

(async () => {
  console.log('Generating thumbnails...');
  await generateThumbnails();
  console.log('Done!');
  
  // Build HTML contact sheet
  console.log('Building HTML contact sheet...');
  
  const groups = {};
  for (const f of files) {
    const cat = classifyFile(f);
    if (!groups[cat]) groups[cat] = [];
    const dim = getDimensions(path.join(SRC_DIR, f));
    groups[cat].push({ name: f, dim, sizeKB: getFileSizeKB(path.join(SRC_DIR, f)) });
  }
  
  const categoryOrder = ['春兰', '蕙兰', '建兰', 'iPhone环境照', 'unknown'];
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>📸 Eastern Orchid — 照片缩略图索引</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Noto Sans SC', sans-serif; background: #f5f0e8; padding: 20px; color: #2d3a1e; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
  h2 { font-size: 18px; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #5a7a3a; color: #3d5a1e; }
  .count-badge { display: inline-block; background: #5a7a3a; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px; margin-left: 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.15s; }
  .card:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .card img { width: 100%; height: 150px; object-fit: cover; display: block; background: #e8e0d0; }
  .card .info { padding: 6px 8px 8px; }
  .card .name { font-size: 11px; color: #333; word-break: break-all; line-height: 1.3; }
  .card .meta { font-size: 10px; color: #888; margin-top: 2px; }
  .status-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #2d3a1e; color: #ccc; padding: 8px 20px; font-size: 13px; text-align: center; }
  .legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; font-size: 13px; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .dot-春兰 { background: #e8a0c0; }
  .dot-蕙兰 { background: #f0c060; }
  .dot-建兰 { background: #80c080; }
  .dot-iPhone { background: #60a0d0; }
  .dot-unknown { background: #a08060; }
</style>
</head>
<body>
<h1>🌿 Eastern Orchid — 照片总索引</h1>
<p class="subtitle">共 ${files.length} 张照片 · 点击图片查看原图 · 帮助识别品种</p>

<div class="legend">
  <span class="legend-item"><span class="dot dot-春兰"></span> 春兰</span>
  <span class="legend-item"><span class="dot dot-蕙兰"></span> 蕙兰</span>
  <span class="legend-item"><span class="dot dot-建兰"></span> 建兰</span>
  <span class="legend-item"><span class="dot dot-iPhone"></span> iPhone环境照</span>
  <span class="legend-item"><span class="dot dot-unknown"></span> 待识别</span>
</div>
`;

  for (const cat of categoryOrder) {
    if (!groups[cat]) continue;
    const items = groups[cat];
    const dotClass = cat === '春兰' ? 'dot-春兰' : cat === '蕙兰' ? 'dot-蕙兰' : cat === '建兰' ? 'dot-建兰' : cat === 'iPhone环境照' ? 'dot-iPhone' : 'dot-unknown';
    
    html += `<h2><span class="dot ${dotClass}"></span> ${cat} <span class="count-badge">${items.length}</span></h2>\n`;
    html += `<div class="grid">\n`;
    
    for (const item of items) {
      const thumbFile = item.name.replace(/\.jpe?g$/i, '.jpg');
      html += `  <div class="card" onclick="window.open('file:///${SRC_DIR.replace(/\\\\/g, '/').replace(/:/g, '')}/${item.name}','_blank')">
    <img src="thumbs/${thumbFile}" alt="${item.name}" loading="lazy">
    <div class="info">
      <div class="name">${item.name}</div>
      <div class="meta">${item.dim.w}×${item.dim.h} · ${item.sizeKB}KB</div>
    </div>
  </div>\n`;
    }
    html += `</div>\n`;
  }

  html += `<div class="status-bar">🦞 Eastern Orchid · 缩略图索引 · 共 ${files.length} 张照片 · 生成于 ${new Date().toLocaleString('zh-CN')}</div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf8');
  console.log(`✅ Contact sheet saved: ${path.join(OUT_DIR, 'index.html')}`);
  console.log(`📁 Thumbnails: ${THUMB_DIR}`);
})();

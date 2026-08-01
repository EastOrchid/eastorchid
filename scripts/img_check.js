const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = 'D:/.openclaw/workspace/eastorchid';

const htmlFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !['scripts', 'node_modules', '.git'].includes(e.name)) walk(full);
    else if (e.isFile() && /\.html$/i.test(e.name)) htmlFiles.push(full);
  }
}
walk(dir);

const missing = new Set();
htmlFiles.forEach(fp => {
  const c = fs.readFileSync(fp, 'utf-8');
  const rel = path.relative(dir, fp).replace(/\\/g, '/');
  const baseDir = path.dirname(rel);
  [...c.matchAll(/src="([^"]+)"/g)].forEach(m => {
    const r = m[1];
    if (/^(https?:|data:)/.test(r) || /\$\{/.test(r)) return;
    const clean = r.split('#')[0].split('?')[0];
    const resolved = path.posix.normalize(path.posix.join(baseDir, clean)).replace(/\\/g, '/');
    if (!fs.existsSync(path.join(dir, resolved))) missing.add(rel + ' -> ' + r);
  });
});
console.log('Missing img files on disk: ' + missing.size);
missing.forEach(r => console.log('  ' + r));

// HTTP check key fixed images on preview server
const paths = [
  'assets/images/hanlan/hanlan_kouki.jpg',
  'assets/images/hanlan/hanlan_flower.jpg',
  'assets/images/hanlan/hanlan_whole.jpg',
  'assets/images/molan/molan_flower.jpg',
  'assets/images/molan/molan_whole.jpg',
  'assets/images/chunlan/chunlan_12.JPG',
  'assets/images/chunlan/chunlan_04.JPG',
  'assets/images/chunlan/chunlan_05.JPG',
  'assets/images/huilan/huilan_06.JPG',
  'assets/images/huilan/huilan_02.JPG',
  'assets/images/huilan/huilan_07.JPG',
  'assets/images/jianlan/jianlan_04.JPG',
  'assets/images/jianlan/jianlan_01.JPG',
  'assets/images/jianlan/jianlan_05.JPG',
  'gallery/index.html'
];
let pending = paths.length;
const fails = [];
paths.forEach(p => {
  http.get('http://localhost:3001/' + p, res => {
    if (res.statusCode !== 200) fails.push(p + ' -> ' + res.statusCode);
    if (--pending === 0) {
      console.log('HTTP check done. Fails: ' + fails.length);
      fails.forEach(f => console.log('  ' + f));
    }
  }).on('error', () => {
    fails.push(p + ' -> ERR');
    if (--pending === 0) {
      console.log('HTTP check done. Fails: ' + fails.length);
      fails.forEach(f => console.log('  ' + f));
    }
  });
});

// 全面对比线上主站 vs 本地工作区所有 HTML
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const localRoot = 'D:\\.openclaw\\workspace\\eastorchid';
const base = 'https://eastorchid.github.io/eastorchid';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 400) { reject(new Error('HTTP ' + res.statusCode + ' ' + url)); return; }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
const md5 = s => crypto.createHash('md5').update(s).digest('hex').substring(0, 10);

// 收集本地 HTML
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name.startsWith('tmp-') || e.name === 'scripts' || e.name === 'assets') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
}
walk(localRoot);

(async () => {
  let same = 0, diff = 0, fail = 0;
  for (const f of files) {
    const rel = path.relative(localRoot, f).replace(/\\/g, '/');
    const url = base + '/' + rel;
    const local = fs.readFileSync(f, 'utf8');
    try {
      const online = await fetch(url);
      const lm = md5(local), om = md5(online);
      if (lm === om) { same++; console.log('✅ SAME   ' + rel); }
      else {
        diff++;
        console.log('❌ DIFF   ' + rel + '  local=' + lm + ' online=' + om);
      }
    } catch (e) {
      fail++;
      console.log('⚠️ FAIL   ' + rel + '  ' + e.message);
    }
  }
  console.log('---');
  console.log('相同: ' + same + '  不同: ' + diff + '  失败: ' + fail);
})();

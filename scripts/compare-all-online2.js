// 规范化换行后对比线上 vs 本地（只比内容，忽略 CRLF/LF）
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
const norm = s => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
const md5 = s => crypto.createHash('md5').update(s).digest('hex').substring(0, 10);

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
    const local = norm(fs.readFileSync(f, 'utf8'));
    try {
      const online = norm(await fetch(url));
      if (md5(local) === md5(online)) { same++; }
      else {
        diff++;
        console.log('❌ 真差异 ' + rel + '  local=' + md5(local) + ' online=' + md5(online));
      }
    } catch (e) {
      fail++;
      console.log('⚠️ FAIL ' + rel + '  ' + e.message);
    }
  }
  console.log('---');
  console.log('内容一致: ' + same + '  内容不同: ' + diff + '  失败: ' + fail);
})();

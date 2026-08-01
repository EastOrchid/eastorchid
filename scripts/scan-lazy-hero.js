// 检查每个 HTML 前 120 行（首屏区域）的 img 是否 lazy
const fs = require('fs');
const path = require('path');
const root = 'G:\\eastorchid-preview';
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
}
walk(root);
files.forEach(f => {
  const html = fs.readFileSync(f, 'utf8');
  const lines = html.split('\n');
  lines.slice(0, 120).forEach((line, i) => {
    if (/<img/.test(line) && /loading="lazy"/.test(line)) {
      console.log(f.replace(root, '') + ':' + (i + 1) + '  ' + line.trim().substring(0, 130));
    }
  });
});
console.log('--- scan done ---');

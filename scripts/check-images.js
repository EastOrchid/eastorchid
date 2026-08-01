// 检查预览站所有 HTML 引用的图片/视频文件是否存在
const fs = require('fs');
const path = require('path');
const root = 'G:\\eastorchid-preview';

const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (path.extname(e.name).toLowerCase() === '.html') files.push(p);
  }
}
walk(root);

const refs = new Map(); // ref -> [{page, tag}]
const re = /(?:src|href|content)=["']([^"']+\.(?:webp|jpg|jpeg|png|gif|svg|mp4|mov|webm))["']/gi;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = re.exec(html))) {
    let ref = m[1];
    if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:')) continue;
    ref = ref.split('#')[0].split('?')[0];
    if (!refs.has(ref)) refs.set(ref, []);
    refs.get(ref).push({ page: f.replace(root, ''), tag: m[0] });
  }
}

let missing = 0;
for (const [ref, pages] of refs) {
  let found = false;
  for (const p of pages) {
    const abs = path.resolve(path.dirname(path.join(root, p.page)), ref);
    if (fs.existsSync(abs)) { found = true; break; }
  }
  if (!found) {
    missing++;
    console.log('MISSING: ' + ref);
    for (const p of pages.slice(0, 4)) console.log('    <- ' + p.page + '  ' + p.tag);
  }
}
console.log('total unique refs: ' + refs.size + ', missing: ' + missing);

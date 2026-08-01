const fs = require('fs');
const path = require('path');
const dir = 'D:/.openclaw/workspace/eastorchid';

const htmlFiles = [];
const allFiles = new Set();

function walkAll(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !['scripts', 'node_modules', '.git'].includes(e.name)) walkAll(full);
    else allFiles.add(path.relative(dir, full).replace(/\\/g, '/'));
  }
}
walkAll(dir);

function walkHtml(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !['scripts', 'node_modules', '.git', 'assets'].includes(e.name)) walkHtml(full);
    else if (e.isFile() && /\.html$/i.test(e.name)) htmlFiles.push(full);
  }
}
walkHtml(dir);

const brokenLinks = [];
const checked = new Set();

htmlFiles.forEach(fp => {
  const content = fs.readFileSync(fp, 'utf-8');
  const rel = path.relative(dir, fp).replace(/\\/g, '/');
  const baseDir = path.dirname(rel);
  const refs = [...content.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  refs.forEach(r => {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(r)) return;
    const clean = r.split('#')[0].split('?')[0];
    if (!clean) return;
    const resolved = path.posix.normalize(path.posix.join(baseDir, clean)).replace(/\\/g, '/').replace(/\/$/, '');
    if (resolved === '.' || resolved === '') return;
    // skip template-literal refs (JS-generated paths)
    if (/\$\{/.test(r)) return;
    const key = rel + ' -> ' + r;
    if (checked.has(key)) return;
    checked.add(key);
    if (!allFiles.has(resolved) && !allFiles.has(resolved + '/index.html') && !allFiles.has(resolved + '.html')) {
      brokenLinks.push(key + '  [missing: ' + resolved + ']');
    }
  });
});

console.log('=== Broken links (' + brokenLinks.length + ') ===');
brokenLinks.forEach(b => console.log('  ' + b));

// Also check images referenced inside CSS
const css = fs.readFileSync(path.join(dir, 'css/style.css'), 'utf-8');
const cssRefs = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]);
const cssBroken = cssRefs.filter(u => !allFiles.has('css/' + u.replace(/^\.\//, '')));
console.log('\n=== CSS image refs broken (' + cssBroken.length + ') ===');
cssBroken.forEach(b => console.log('  ' + b));

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

// naive tag balance check for structural tags
const tags = ['section', 'div', 'ul', 'li', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'header', 'footer', 'main', 'article'];
htmlFiles.forEach(fp => {
  const rel = path.relative(dir, fp).replace(/\\/g, '/');
  const c = fs.readFileSync(fp, 'utf-8');
  // remove script & style contents
  const clean = c.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  // strip comments
  const nocomment = clean.replace(/<!--[\s\S]*?-->/g, '');
  const problems = [];
  tags.forEach(t => {
    const open = (nocomment.match(new RegExp('<' + t + '(\\s|>)', 'gi')) || []).length;
    const close = (nocomment.match(new RegExp('</' + t + '>', 'gi')) || []).length;
    if (open !== close) problems.push(t + ' open=' + open + ' close=' + close);
  });
  if (problems.length) console.log('⚠️  ' + rel + ': ' + problems.join(' | '));
});
console.log('Tag balance check done.');

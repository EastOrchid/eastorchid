const fs = require('fs');
const path = require('path');

const root = 'D:\\.openclaw\\workspace\\eastorchid';

function walk(dir) {
  const files = fs.readdirSync(dir);
  let htmlFiles = [];
  for (const f of files) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      if (!f.startsWith('.')) htmlFiles = htmlFiles.concat(walk(fp));
    } else if (f.endsWith('.html')) {
      htmlFiles.push(fp);
    }
  }
  return htmlFiles;
}

const files = walk(root);
let count = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  
  if (html.includes('WeChat: 18638788818')) {
    html = html.replace(/WeChat: 18638788818/g, '联系：18638788818');
    fs.writeFileSync(file, html, 'utf8');
    count++;
    console.log(`  ✅ ${path.relative(root, file)}`);
  }
}

console.log(`\n✅ Updated ${count} files`);

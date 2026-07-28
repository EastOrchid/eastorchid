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
  
  // Remove the extra WeChat/联系 line we added in footer-bottom
  const regex = /<p style="margin-bottom:4px;font-size:0\.85rem;opacity:0\.7;">联系：18638788818<\/p>\n      /g;
  
  if (regex.test(html)) {
    html = html.replace(regex, '');
    fs.writeFileSync(file, html, 'utf8');
    count++;
    console.log(`  ✅ ${path.relative(root, file)}`);
  } else {
    console.log(`  ⚠️  No match: ${path.relative(root, file)}`);
  }
}

console.log(`\n✅ Cleaned ${count} files`);

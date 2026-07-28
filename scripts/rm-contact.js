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
  
  // Remove the Contact list item from footer
  // Pattern: <li><a href=".../#contact">Contact</a></li>
  const regex = /<li><a href="[^"]*#contact">Contact<\/a><\/li>\n/g;
  
  if (regex.test(html)) {
    html = html.replace(regex, '');
    fs.writeFileSync(file, html, 'utf8');
    count++;
    console.log(`  ✅ ${path.relative(root, file)}`);
  } else {
    console.log(`  ⚠️  No match: ${path.relative(root, file)}`);
  }
}

console.log(`\n✅ Removed Contact links from ${count} files`);

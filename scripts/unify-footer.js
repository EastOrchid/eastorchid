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

// footer-links block: from <div class="footer-links"> (Explore) through the closing </div> of Info block
const footerRe = /<div class="footer-links">\s*<h4>Explore<\/h4>[\s\S]*?<h4>Info<\/h4>[\s\S]*?<\/ul>\s*<\/div>/;

let changed = [];
htmlFiles.forEach(fp => {
  const rel = path.relative(dir, fp).replace(/\\/g, '/');
  const depth = rel.split('/').length - 1; // 0 for index.html, 1 for about/index.html, 2 for articles/culture/x.html
  const P = depth === 0 ? '' : depth === 1 ? '../' : '../../';
  let c = fs.readFileSync(fp, 'utf-8');
  const block = `      <div class="footer-links">
        <h4>Explore</h4>
        <ul>
          <li><a href="${P}orchids/">Orchid World</a></li>
          <li><a href="${P}culture/">Orchid Culture</a></li>
          <li><a href="${P}garden/">Garden Life</a></li>
          <li><a href="${P}videos/">Videos</a></li>
          <li><a href="${P}gallery/">Gallery</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Info</h4>
        <ul>
          <li><a href="${P}articles/">Knowledge Library</a></li>
          <li><a href="${P}about/">About</a></li>
        </ul>
      </div>`;
  if (footerRe.test(c)) {
    const nc = c.replace(footerRe, block);
    if (nc !== c) {
      fs.writeFileSync(fp, nc, 'utf-8');
      changed.push(rel + ' (depth ' + depth + ')');
    }
  } else {
    changed.push(rel + ' (NO MATCH!)');
  }
});

console.log('Updated ' + changed.length + ' files:');
changed.forEach(x => console.log('  ' + x));

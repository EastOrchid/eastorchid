const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

// Check all files
const files = [
    'index.html', 'about/index.html', 'articles/index.html',
    'articles/growing/how-to-grow-orchids-at-home.html',
    'culture/index.html', 'orchids/index.html', 'videos/index.html'
];

files.forEach(f => {
    const fp = dir + '\\' + f.replace(/\//g, '\\');
    const content = fs.readFileSync(fp, 'utf-8');
    const fffd = (content.match(/\uFFFD/g) || []).length;
    const brokenCard = (content.match(/card-link">[^<]*? — \/span>/g) || []).length;
    const brokenDiv = (content.match(/ — \/div>/g) || []).length;
    const arrows = (content.match(/→/g) || []).length;
    const hamburger = (content.match(/☰/g) || []).length;
    const emDash = (content.match(/—/g) || []).length;

    console.log(f + ':');
    console.log('  FFFD: ' + fffd + ' | Arrows: ' + arrows + ' | Hamburger: ' + hamburger + ' | EmDash: ' + emDash);
    if (brokenCard > 0) console.log('  ⚠️  Broken card links: ' + brokenCard);
    if (brokenDiv > 0) console.log('  ⚠️  Broken divs: ' + brokenDiv);
});

// Also verify index.html card links look correct
console.log('\n--- Index.html card links ---');
const idxContent = fs.readFileSync(dir + '\\index.html', 'utf-8');
const cards = idxContent.match(/card-link">.*?<\/span>/g) || [];
cards.forEach(c => console.log('  ' + c));

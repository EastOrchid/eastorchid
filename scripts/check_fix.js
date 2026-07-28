const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

const content = fs.readFileSync(dir + '\\index.html', 'utf-8');

// Check what's around the card-link areas
const idx = content.indexOf('card-link">Explore');
console.log('Around card-link:');
console.log(JSON.stringify(content.slice(idx, idx + 40)));

// Nav toggle
const navIdx = content.indexOf('nav-toggle');
console.log('Around nav-toggle:');
console.log(JSON.stringify(content.slice(navIdx, navIdx + 100)));

// Check all files for broken </span> (missing <)
console.log('\nChecking all files for broken spans...');
const files = [
    'index.html', 'about/index.html', 'articles/index.html',
    'articles/growing/how-to-grow-orchids-at-home.html',
    'culture/index.html', 'orchids/index.html', 'videos/index.html'
];
files.forEach(f => {
    const c = fs.readFileSync(dir + '\\' + f.replace(/\//g, '\\'), 'utf-8');
    // Check for card-link text without proper closing
    const broken = c.match(/card-link">[^<]*? — \/span>/);
    if (broken) console.log('BROKEN in ' + f + ': ' + broken[0].slice(0, 60));
});

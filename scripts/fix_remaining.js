const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

const files = [
    'index.html', 'about/index.html', 'articles/index.html',
    'articles/growing/how-to-grow-orchids-at-home.html',
    'culture/index.html', 'orchids/index.html', 'videos/index.html'
];

files.forEach(f => {
    const fp = dir + '\\' + f.replace(/\//g, '\\');
    let content = fs.readFileSync(fp, 'utf-8');
    const original = content;

    // Fix: " — /button>" -> "☰</button>"
    content = content.replace(/ — \/button>/g, '☰</button>');
    
    // Fix: " — /span>" -> "→</span>" BUT only in card-link context
    content = content.replace(/(card-link">[^<]*?) — \/span>/g, '$1→</span>');

    // Fix: " — /div>" -> keep the em dash, just fix closing
    content = content.replace(/ — \/div>/g, '—</div>');

    if (content !== original) {
        fs.writeFileSync(fp, content, 'utf-8');
        console.log('✅ Fixed: ' + f);
    } else {
        console.log('-- No change: ' + f);
    }
});

// Final verification
console.log('\n=== Final check ===');
files.forEach(f => {
    const fp = dir + '\\' + f.replace(/\//g, '\\');
    const content = fs.readFileSync(fp, 'utf-8');
    const fffd = (content.match(/\uFFFD/g) || []).length;
    const brokenBtn = (content.match(/ — \/button>/g) || []).length;
    const brokenSpan = (content.match(/ — \/span>/g) || []).length;
    const brokenDiv = (content.match(/ — \/div>/g) || []).length;
    const hamburger = (content.match(/☰/g) || []).length;
    const arrows = (content.match(/→/g) || []).length;
    const dashes = (content.match(/—/g) || []).length;
    console.log(f + ' → FFFD:' + fffd + ' broken:' + (brokenBtn+brokenSpan+brokenDiv) + ' ☰:' + hamburger + ' →:' + arrows + ' —:' + dashes);
});

const fs = require('fs');
const path = require('path');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

function fixFile(relPath) {
    const fp = path.join(dir, relPath);
    let content = fs.readFileSync(fp, 'utf-8');
    const original = content;
    
    // 1. Fix nav toggle buttons: hamburger menu icon
    content = content.replace(/>\uFFFD<\/button>/g, '>☰</button>');
    
    // 2. Fix card link arrows
    content = content.replace(/(Explore|Discover|Visit|Learn more|Read more|View gallery|Read|View|View All) \uFFFD<\/span>/g, '$1 →</span>');
    
    // 3. Fix numeric ranges (digitFFFDdigit → digit–digit)
    content = content.replace(/(\d)\uFFFD(\d)/g, '$1–$2');
    
    // 4. Fix FFFD followed by literal ?
    content = content.replace(/\uFFFD\?/g, ' — ');
    
    // 5. All remaining FFFD in text content → em dash with spaces
    content = content.replace(/\uFFFD/g, ' — ');
    
    // Cleanup: fix double spaces from replacements
    content = content.replace(/  — /g, ' — ');
    content = content.replace(/ —  /g, ' — ');
    content = content.replace(/  —/g, ' —');
    
    // Write back
    if (content !== original) {
        fs.writeFileSync(fp, content, 'utf-8');
        const dashes = (content.match(/—/g) || []).length;
        const arrows = (content.match(/→/g) || []).length;
        const remaining = (content.match(/\uFFFD/g) || []).length;
        console.log('OK ' + relPath + ' — ' + dashes + ' dashes, ' + arrows + ' arrows, ' + remaining + ' remaining');
    } else {
        console.log('-- ' + relPath + ' unchanged');
    }
}

const files = [
    'index.html',
    'about/index.html',
    'articles/index.html',
    'articles/growing/how-to-grow-orchids-at-home.html',
    'culture/index.html',
    'orchids/index.html',
    'videos/index.html'
];

files.forEach(f => fixFile(f));
console.log('DONE');

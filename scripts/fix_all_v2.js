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

    // 1. Nav toggle button: ">FFFD?/button>" -> ">☰</button>"
    content = content.replace(/>\uFFFD\?\/button>/g, '>☰</button>');

    // 2. Card links: "word FFFD?/span>" -> "word →</span>"
    content = content.replace(/(Explore|Discover|Visit|Learn more|Read more|View gallery|Read|View|View All) \uFFFD\?\/span>/g, '$1 →</span>');
    // Catch any remaining generic FFFD?/span> patterns
    content = content.replace(/ \uFFFD\?\/span>/g, ' →</span>');

    // 3. Nav button (in case it was FFFD without ?): ">FFFD/button>" -> ">☰</button>"
    content = content.replace(/>\uFFFD<\/button>/g, '>☰</button>');

    // 4. Card links (without ?): "word FFFD/span>" -> "word →</span>"
    content = content.replace(/(Explore|Discover|Visit|Learn more|Read more|View gallery|Read|View|View All) \uFFFD<\/span>/g, '$1 →</span>');

    // 5. Numeric ranges: "\dFFFD\d" -> "\d–\d"
    content = content.replace(/(\d)\uFFFD(\d)/g, '$1–$2');

    // 6. All remaining FFFD -> em dash
    content = content.replace(/\uFFFD/g, ' — ');

    // Cleanup double spaces
    content = content.replace(/  — /g, ' — ');
    content = content.replace(/ —  /g, ' — ');
    content = content.replace(/  —/g, ' —');

    if (content !== original) {
        fs.writeFileSync(fp, content, 'utf-8');
        const fffd = (content.match(/\uFFFD/g) || []).length;
        const arrows = (content.match(/→/g) || []).length;
        const hamburger = (content.match(/☰/g) || []).length;
        const dashes = (content.match(/—/g) || []).length;
        console.log('OK ' + f + ' | FFFD:' + fffd + ' →:' + arrows + ' ☰:' + hamburger + ' —:' + dashes);
    } else {
        console.log('-- ' + f + ' unchanged');
    }
});

// Verify all files
console.log('\n--- Verification ---');
files.forEach(f => {
    const fp = dir + '\\' + f.replace(/\//g, '\\');
    const content = fs.readFileSync(fp, 'utf-8');
    const fffd = (content.match(/\uFFFD/g) || []).length;
    const broken = content.match(/ — \/(button|span|div)>/g) || [];
    if (fffd > 0 || broken.length > 0) {
        console.log('⚠️  ' + f + ' has issues: FFFD=' + fffd + ' broken=' + broken.length);
    } else {
        console.log('✅ ' + f + ' clean');
    }
});

const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

// File list
const files = [
    'index.html', 'about/index.html', 'articles/index.html',
    'articles/growing/how-to-grow-orchids-at-home.html',
    'culture/index.html', 'orchids/index.html', 'videos/index.html'
];

files.forEach(f => {
    const fp = dir + '\\' + f.replace(/\//g, '\\');
    let content = fs.readFileSync(fp, 'utf-8');
    const original = content;
    
    // Fix: "Explore — /span>" -> "Explore →</span>"
    // The broken pattern is: word + space + emdash + space + "/span>"
    // Should be: word + space + arrow + "</span>"
    
    const cardWords = ['Explore', 'Discover', 'Visit', 'Learn more', 'Read more', 'View gallery', 'Read', 'View', 'View All'];
    
    cardWords.forEach(word => {
        // Match: word + space + — + space + /span>
        const brokenPattern = new RegExp(word + ' — \\/span>', 'g');
        content = content.replace(brokenPattern, word + ' →</span>');
    });
    
    // Also fix: just "— /span>" (if word-based didn't catch all)
    // But be careful not to break em dashes used in sentences
    content = content.replace(/ — \/span>/g, ' →</span>');
    
    // Also fix the em dash in / button cases
    content = content.replace(/ — \/div>/g, '—</div>');
    
    if (content !== original) {
        fs.writeFileSync(fp, content, 'utf-8');
        console.log('Fixed: ' + f);
    } else {
        console.log('No change: ' + f);
    }
});

console.log('DONE');

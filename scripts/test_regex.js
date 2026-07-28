const fs = require('fs');
const { execSync } = require('child_process');

// Get git original
const original = execSync('git show HEAD:index.html', {cwd: 'D:\\.openclaw\\workspace\\eastorchid'}).toString('utf-8');

// Try the regex
const regex = /(Explore|Discover) \uFFFD<\/span>/g;
const match = regex.exec(original);
console.log('Match result:', match ? match[0].replace(/\uFFFD/g, '[FFFD]') : 'NO MATCH');

// Show the exact character codes around Explore in card-link
const idx = original.indexOf('card-link">Explore');
const chunk = original.slice(idx, idx + 40);
console.log('Hex of area:');
for (let i = 0; i < chunk.length; i++) {
    const code = chunk.charCodeAt(i);
    if (code > 127 || code < 32) {
        console.log('  pos ' + i + ': U+' + code.toString(16).toUpperCase());
    }
}
console.log('Full chunk:', JSON.stringify(chunk));

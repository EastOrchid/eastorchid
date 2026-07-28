const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

const content = fs.readFileSync(dir + '\\index.html', 'utf-8');

// Find the nav-toggle button
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('nav-toggle')) {
        console.log('Line ' + (i+1) + ':');
        console.log('  ' + JSON.stringify(line.trim()));
        // Check what's in the button
        const match = line.match(/nav-toggle[^>]*>([^<]*)</);
        if (match) {
            console.log('  Button content: ' + JSON.stringify(match[1]));
            console.log('  Button content codes:');
            for (const ch of match[1]) {
                console.log('    U+' + ch.charCodeAt(0).toString(16).toUpperCase() + ' = ' + ch);
            }
        }
    }
});

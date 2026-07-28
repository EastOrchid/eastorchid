const fs = require('fs');
const path = require('path');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

let totalFFFD = 0;
let totalBroken = 0;
let fileCount = 0;
let htmlFiles = [];

function walkDir(d) {
    const entries = fs.readdirSync(d, {withFileTypes: true});
    for (const e of entries) {
        const full = path.join(d, e.name);
        if (e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('scripts') && !e.name.startsWith('node_modules')) {
            walkDir(full);
        } else if (e.isFile() && /\.html$/i.test(e.name)) {
            htmlFiles.push(full);
        }
    }
}
walkDir(dir);

htmlFiles.forEach(fp => {
    const content = fs.readFileSync(fp, 'utf-8');
    const fffd = (content.match(/\uFFFD/g) || []).length;
    const broken = (content.match(/ — \/(button|span|div)>/g) || []).length;
    const rel = path.relative(dir, fp).replace(/\\/g, '/');
    
    if (fffd > 0 || broken > 0) {
        console.log('⚠️  ' + rel + ' — FFFD:' + fffd + ' broken:' + broken);
    } else {
        console.log('✅ ' + rel);
    }
    totalFFFD += fffd;
    totalBroken += broken;
    fileCount++;
});

console.log('\nScanned ' + fileCount + ' HTML files');
console.log('Total FFFD: ' + totalFFFD);
console.log('Total broken: ' + totalBroken);

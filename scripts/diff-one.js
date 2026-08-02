// 对比单个文件：本地 vs 线上，输出前几处差异
const https = require('https');
const fs = require('fs');

const localFile = process.argv[2];
const url = process.argv[3];
const local = fs.readFileSync(localFile, 'utf8').replace(/\r\n/g, '\n');

https.get(url, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const online = d.replace(/\r\n/g, '\n');
    const lLines = local.split('\n');
    const oLines = online.split('\n');
    console.log('本地行数: ' + lLines.length + '  线上行数: ' + oLines.length);
    let diffCount = 0;
    for (let i = 0; i < Math.max(lLines.length, oLines.length); i++) {
      const l = i < lLines.length ? lLines[i] : '<缺失>';
      const o = i < oLines.length ? oLines[i] : '<缺失>';
      if (l !== o) {
        diffCount++;
        if (diffCount <= 6) {
          console.log('行' + (i + 1) + ':');
          console.log('  本地: ' + l.substring(0, 110));
          console.log('  线上: ' + o.substring(0, 110));
        }
      }
    }
    console.log('差异行数: ' + diffCount);
  });
}).on('error', e => console.log('ERR', e.message));

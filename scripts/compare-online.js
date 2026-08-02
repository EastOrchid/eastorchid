// 用 Node 准确对比本地与线上 garden/index.html
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const local = fs.readFileSync('G:\\eastorchid-preview\\garden\\index.html', 'utf8');
const localWs = fs.readFileSync('D:\\.openclaw\\workspace\\eastorchid\\garden\\index.html', 'utf8');

https.get('https://eastorchid.github.io/eastorchid/garden/', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const md5 = s => crypto.createHash('md5').update(s).digest('hex');
    console.log('本地预览站 MD5:   ' + md5(local));
    console.log('本地工作区 MD5:   ' + md5(localWs));
    console.log('线上 GitHub MD5:  ' + md5(data));
    console.log('');
    console.log('预览站 == 线上? ' + (md5(local) === md5(data) ? '✅ 一致' : '❌ 不一致'));
    console.log('工作区 == 线上? ' + (md5(localWs) === md5(data) ? '✅ 一致' : '❌ 不一致'));
    // 查看线上 hero 标签
    const m = data.match(/<img[^>]*huilan6-hero\.webp[^>]*>/);
    console.log('线上 hero 标签: ' + (m ? m[0] : '未找到'));
    const m2 = localWs.match(/<img[^>]*huilan6-hero\.webp[^>]*>/);
    console.log('工作区 hero 标签: ' + (m2 ? m2[0] : '未找到'));
  });
}).on('error', e => console.log('ERR', e.message));

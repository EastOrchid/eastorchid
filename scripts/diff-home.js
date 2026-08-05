// 对比线上首页 vs 本地首页的板块结构
const https = require('https');
const fs = require('fs');

const local = fs.readFileSync('D:\\.openclaw\\workspace\\eastorchid\\index.html', 'utf8');
const localHash = require('crypto').createHash('md5').update(local).digest('hex');
console.log('本地 index.html 长度: ' + local.length + '  MD5: ' + localHash.substring(0, 10));

https.get('https://eastorchid.github.io/eastorchid/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const onlineHash = require('crypto').createHash('md5').update(d).digest('hex');
    console.log('线上 index.html 长度: ' + d.length + '  MD5: ' + onlineHash.substring(0, 10));
    console.log('内容一致: ' + (localHash === onlineHash));

    // 提取两边所有 section 的 h2 / class
    function sections(html) {
      const out = [];
      const re = /<section[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/section>/g;
      let m;
      while ((m = re.exec(html))) {
        const h2 = (m[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '';
        out.push(h2.replace(/<[^>]+>/g, '').trim().substring(0, 40) || '(无h2, class=' + m[1].substring(0, 30) + ')');
      }
      return out;
    }
    console.log('\n本地板块:');
    sections(local).forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s));
    console.log('\n线上板块:');
    sections(d).forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s));

    // 对比关键标记
    const markers = ['home-hero', 'explore-grid', 'featured-grid', 'About Eastern Orchid', 'From the Knowledge Library', 'Welcome to Eastern Orchid'];
    console.log('\n关键标记对比:');
    markers.forEach(mk => {
      console.log('  ' + mk + ': 本地=' + local.includes(mk) + ' 线上=' + d.includes(mk));
    });
  });
}).on('error', e => console.log('ERR', e.message));

// 对比 sitemap 与实际页面，找出缺失条目
const fs = require('fs');
const path = require('path');
const root = 'G:\\eastorchid-preview';
const base = 'https://eastorchid.github.io/eastorchid';

// 收集所有 HTML 页面（排除 assets/测试文件）
const pages = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name.includes('tmp-') || e.name === 'contact-sheet') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html') && !/^(test|garden-test|photo-preview|imgcheck|_online)/.test(e.name)) pages.push(p);
  }
}
walk(root);

// sitemap URLs
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set(Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), m => m[1]));

// 生成页面应有 URL
const expected = [];
for (const p of pages) {
  const rel = p.replace(root, '').replace(/\\/g, '/');
  let url;
  if (rel === '/index.html') url = base + '/';
  else if (rel.endsWith('/index.html')) url = base + rel.replace('/index.html', '/');
  else url = base + rel;
  expected.push({ rel, url });
}

console.log('sitemap 条目: ' + sitemapUrls.size + '  实际页面: ' + expected.length);
const missing = expected.filter(e => !sitemapUrls.has(e.url));
if (missing.length) {
  console.log('❌ sitemap 缺失:');
  missing.forEach(m => console.log('   ' + m.url));
} else {
  console.log('✅ sitemap 覆盖全部页面');
}
// sitemap 里有多余的吗
const extra = [...sitemapUrls].filter(u => !expected.some(e => e.url === u));
if (extra.length) {
  console.log('⚠️ sitemap 多余条目:');
  extra.forEach(u => console.log('   ' + u));
} else {
  console.log('✅ 无多余条目');
}

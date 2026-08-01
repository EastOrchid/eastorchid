/**
 * Eastern Orchid 预览服务器
 * 端口 3001（和搅拌站 3000 分开）
 * 预览目录: G:\eastorchid-preview\
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = 'G:\\eastorchid-preview';
const port = 3001;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm'
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}
  
  // 默认首页
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!path.extname(urlPath)) urlPath += '.html';
  
  const filePath = path.join(dir, urlPath);
  
  // 安全检查：不允许超出预览目录
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(dir))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    // 预览站禁用缓存，避免改了文件浏览器还显示旧内容/旧图片路径
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log('');
  console.log('🌿 Eastern Orchid 预览站');
  console.log('   http://localhost:' + port);
  console.log('   端口 3001（搅拌站 3000 ⇢ 兰花 3001）');
  console.log('');
});

/**
 * 东方兰花网 → 预览站同步脚本
 * 从工作目录同步到 G:\eastorchid-preview\
 */

const fs = require('fs');
const path = require('path');

const src = 'D:\\.openclaw\\workspace\\eastorchid';
const dst = 'G:\\eastorchid-preview';

// 需要同步的文件扩展名
const includeExt = ['.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.mp4', '.mov', '.webm', '.json'];

function syncDir(dir, relative) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const srcPath = path.join(dir, item.name);
    const relPath = relative ? path.join(relative, item.name) : item.name;
    const dstPath = path.join(dst, relPath);
    
    if (item.isDirectory()) {
      if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath, { recursive: true });
        console.log('  📁 ' + relPath + '/');
      }
      syncDir(srcPath, relPath);
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (includeExt.includes(ext)) {
        fs.copyFileSync(srcPath, dstPath);
        console.log('  📄 ' + relPath);
      }
    }
  }
}

console.log('🔄 同步东方兰花网 → 预览站...');
console.log('   源: ' + src);
console.log('   目标: ' + dst);
console.log('');

if (!fs.existsSync(dst)) {
  fs.mkdirSync(dst, { recursive: true });
}

syncDir(src, '');
console.log('');
console.log('✅ 同步完成！');
console.log('   http://localhost:3001');

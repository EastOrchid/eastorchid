// 用 CDP 打开线上主站 garden 页面，检查图片加载状态
const WebSocket = require('ws');
const fs = require('fs');
const wsUrl = process.argv[2];
const url = process.argv[3];
const outFile = process.argv[4];
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('message', data => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }
});

ws.on('open', async () => {
  try {
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url });
    await sleep(8000);
    const result = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        title: document.title,
        imgs: Array.from(document.images).map(img => {
          const r = img.getBoundingClientRect();
          return {
            src: img.getAttribute('src'),
            loaded: img.complete && img.naturalWidth > 0,
            broken: img.complete && img.naturalWidth === 0,
            inViewport: r.top < window.innerHeight && r.bottom > 0,
            rect: { top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
            lazy: img.getAttribute('loading')
          };
        })
      })`,
      returnByValue: true
    });
    const data = JSON.parse(result.result.value);
    console.log('PAGE: ' + url);
    console.log('title: ' + data.title);
    console.log('total: ' + data.imgs.length);
    data.imgs.forEach(i => {
      console.log((i.loaded ? 'OK  ' : (i.broken ? 'BROKEN' : 'PENDING')) + (i.inViewport ? ' IN-VIEW' : ' off-view') + ' lazy=' + (i.lazy || 'none') + '  ' + i.src);
    });
    // 截图
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
    console.log('screenshot saved: ' + outFile);
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
});

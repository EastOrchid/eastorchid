// 检查页面图片加载状态（img + 断图）
const WebSocket = require('ws');
const wsUrl = process.argv[2];
const url = process.argv[3] || 'http://localhost:3001/';
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
    await sleep(5000);
    const result = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        title: document.title,
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent),
        imgs: Array.from(document.images).map(img => {
          const r = img.getBoundingClientRect();
          return {
            src: img.getAttribute('src'),
            loaded: img.complete && img.naturalWidth > 0,
            broken: img.complete && img.naturalWidth === 0,
            inViewport: r.top < window.innerHeight && r.bottom > 0
          };
        }),
        links: Array.from(document.querySelectorAll('a')).length
      })`,
      returnByValue: true
    });
    const data = JSON.parse(result.result.value);
    console.log('PAGE: ' + url + '  [' + data.title + ']');
    console.log('H2 区块: ' + data.h2.join(' | '));
    console.log('图片: ' + data.imgs.length + ' 张, broken: ' + data.imgs.filter(i => i.broken).length);
    data.imgs.filter(i => i.broken).forEach(i => console.log('  BROKEN: ' + i.src));
    data.imgs.filter(i => !i.loaded && !i.broken).forEach(i => console.log('  PENDING: ' + i.src));
    console.log('链接数: ' + data.links);
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
});

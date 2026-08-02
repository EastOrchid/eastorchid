// 滚动页面检查 lazy 图片是否全部加载
const WebSocket = require('ws');
const wsUrl = process.argv[2];
const url = process.argv[3] || 'http://localhost:3001/orchids/';
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
    await sleep(4000);
    for (let i = 0; i < 12; i++) {
      await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 700)' });
      await sleep(400);
    }
    await sleep(2500);
    const r = await send('Runtime.evaluate', {
      expression: `JSON.stringify(Array.from(document.images).map(i => ({ s: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })))`,
      returnByValue: true
    });
    const imgs = JSON.parse(r.result.value);
    const bad = imgs.filter(i => !i.ok);
    console.log('滚动后: ' + url);
    console.log('总图: ' + imgs.length + '  未加载: ' + bad.length);
    bad.forEach(i => console.log('  NOT-LOADED: ' + i.s));
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
});

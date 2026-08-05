// 截图线上首页（顶部 + 全页滚动拼接）
const WebSocket = require('ws');
const fs = require('fs');
const wsUrl = process.argv[2];
const url = process.argv[3];
const outPrefix = process.argv[4];
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
    await sleep(7000);
    // 顶部截图
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPrefix + '-top.png', Buffer.from(shot1.data, 'base64'));
    console.log('saved ' + outPrefix + '-top.png');
    // 滚动到中部（Explore 板块）
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1300)' });
    await sleep(3000);
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPrefix + '-explore.png', Buffer.from(shot2.data, 'base64'));
    console.log('saved ' + outPrefix + '-explore.png');
    // 滚动到底部（文章+About）
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 2400)' });
    await sleep(3000);
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPrefix + '-bottom.png', Buffer.from(shot3.data, 'base64'));
    console.log('saved ' + outPrefix + '-bottom.png');
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
});

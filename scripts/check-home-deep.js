// 深度检查线上首页渲染：板块可见性、CSS 加载、图片
const WebSocket = require('ws');
const wsUrl = process.argv[2];
const url = process.argv[3];
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
    await send('Runtime.enable');
    await send('Network.enable');
    const netEvents = [];
    ws.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
        netEvents.push(msg.params.response.status + ' ' + msg.params.response.url);
      }
      if (msg.method === 'Network.loadingFailed') {
        netEvents.push('FAIL ' + msg.params.errorText + ' ' + (msg.params.blockedReason || ''));
      }
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url });
    await sleep(7000);
    const result = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        title: document.title,
        bodyChildren: document.body.children.length,
        sections: Array.from(document.querySelectorAll('section')).map(s => {
          const r = s.getBoundingClientRect();
          const cs = getComputedStyle(s);
          const h2 = s.querySelector('h2');
          return {
            cls: s.className.substring(0, 40),
            h2: h2 ? h2.textContent.substring(0, 30) : '',
            rect: { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) },
            display: cs.display,
            visibility: cs.visibility,
            bg: cs.backgroundColor
          };
        }),
        cssLoaded: Array.from(document.styleSheets).map(s => { try { return s.href || 'inline'; } catch(e) { return 'error'; } }),
        imgs: Array.from(document.images).map(img => ({
          src: img.getAttribute('src'),
          loaded: img.complete && img.naturalWidth > 0,
          broken: img.complete && img.naturalWidth === 0
        }))
      })`,
      returnByValue: true
    });
    const data = JSON.parse(result.result.value);
    console.log('PAGE: ' + url + '  [' + data.title + ']');
    console.log('body 子元素数: ' + data.bodyChildren);
    console.log('\nCSS 加载:');
    data.cssLoaded.forEach(c => console.log('  ' + c));
    console.log('\n板块渲染:');
    data.sections.forEach(s => {
      console.log('  ' + (s.cls || '(no class)').padEnd(28) + ' h2="' + s.h2 + '" rect=' + JSON.stringify(s.rect) + ' display=' + s.display + ' vis=' + s.visibility);
    });
    console.log('\n图片: ' + data.imgs.length + ' 张, broken: ' + data.imgs.filter(i => i.broken).length);
    data.imgs.filter(i => i.broken).forEach(i => console.log('  BROKEN: ' + i.src));
    console.log('\n网络异常: ' + (netEvents.length ? netEvents.join('\n  ') : '无'));
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
});

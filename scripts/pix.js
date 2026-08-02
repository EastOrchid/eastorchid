// 分析截图像素
const fs = require('fs');
const zlib = require('zlib');

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') { width = buf.readUInt32BE(pos + 8); height = buf.readUInt32BE(pos + 12); bitDepth = buf[pos + 16]; colorType = buf[pos + 17]; }
    else if (type === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = colorType === 2 ? 3 : colorType === 6 ? 4 : 0;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const line = raw.slice(p, p + stride);
    p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = y > 0 && x >= bpp ? out[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
          v = (v + pr) & 0xff; break;
        }
        default: throw new Error('filter ' + filter);
      }
      out[y * stride + x] = v;
    }
  }
  return { width, height, bpp, data: out };
}

const buf = fs.readFileSync(process.argv[2]);
const { width, height, bpp, data } = decodePNG(buf);
console.log('size: ' + width + 'x' + height);

function sampleRegion(x0, y0, x1, y1, label) {
  let colors = new Map();
  let total = 0;
  for (let y = y0; y < y1; y += 4) {
    for (let x = x0; x < x1; x += 4) {
      const i = (y * width + x) * bpp;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
      colors.set(key, (colors.get(key) || 0) + 1);
      total++;
    }
  }
  const sorted = [...colors.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4).map(([k, v]) => k + ':' + Math.round(v / total * 100) + '%').join('  ');
  console.log(label + ' colors=' + colors.size + '  top: ' + top);
}

sampleRegion(0, 80, 1200, 500, '顶部(80-500)');
sampleRegion(0, 500, 1200, 900, '中部(500-900)');

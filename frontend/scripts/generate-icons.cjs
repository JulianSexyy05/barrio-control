const { writeFileSync, mkdirSync } = require('fs');
const { deflateSync } = require('zlib');
const path = require('path');

const OUT = path.resolve(__dirname, '../public');

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(w, h, pixels) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (1 + w * 3) + 1 + x * 3;
      const i = (y * w + x) * 3;
      raw[o] = pixels[i]; raw[o+1] = pixels[i+1]; raw[o+2] = pixels[i+2];
    }
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function solidPNG(w, h, r, g, b) {
  const pixels = Buffer.alloc(w * h * 3);
  for (let i = 0; i < pixels.length; i += 3) { pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; }
  return makePNG(w, h, pixels);
}

function drawIcon(w, h) {
  const pixels = Buffer.alloc(w * h * 3);
  const bg = [134, 59, 255];
  const fg = [237, 230, 255];
  const accent = [126, 20, 255];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 3;
      const cx = x / w, cy = y / h;
      const dist = Math.sqrt((cx - 0.5) ** 2 + (cy - 0.5) ** 2);

      if (dist < 0.42) {
        pixels[o] = bg[0]; pixels[o+1] = bg[1]; pixels[o+2] = bg[2];
      } else {
        pixels[o] = accent[0]; pixels[o+1] = accent[1]; pixels[o+2] = accent[2];
      }

      if (dist > 0.35 && dist < 0.42) {
        const t = (dist - 0.35) / 0.07;
        pixels[o] = Math.round(accent[0] + (bg[0] - accent[0]) * t);
        pixels[o+1] = Math.round(accent[1] + (bg[1] - accent[1]) * t);
        pixels[o+2] = Math.round(accent[2] + (bg[2] - accent[2]) * t);
      }

      const dx = (cx - 0.5) * 2, dy = (cy - 0.5) * 2;
      const inShield = dy < -0.4 * dx + 0.4 && dy < 0.4 * dx + 0.4 && dy > -0.6;
      if (inShield && dist < 0.38) {
        pixels[o] = fg[0]; pixels[o+1] = fg[1]; pixels[o+2] = fg[2];
      }
    }
  }
  return makePNG(w, h, pixels);
}

mkdirSync(OUT, { recursive: true });

const sizes = [192, 512];
for (const s of sizes) {
  writeFileSync(path.join(OUT, `icon-${s}.png`), drawIcon(s, s));
  console.log(`Generated icon-${s}.png`);
}

console.log('Done');

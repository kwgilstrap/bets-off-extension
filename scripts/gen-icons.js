import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const smallSrc = path.resolve(__dirname, '../artwork/icon-small.svg');   // 16 px
const bigSrc   = path.resolve(__dirname, '../artwork/icon-master.svg');  // 32‑256 px
const outDir   = path.resolve(__dirname, '../icons');

await fs.mkdir(outDir, { recursive: true });

const sizes = [16, 32, 48, 128, 256];
for (const s of sizes) {
  const src = (s === 16 ? smallSrc : bigSrc);
  await sharp(src)
    .resize(s, s)
    .png()
    .toFile(path.join(outDir, `${s}.png`));
}

console.log('✓ Icon set rebuilt');
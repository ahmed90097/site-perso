const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'photos');
const outDir = path.join(srcDir, 'optimized');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const sizes = [320, 640, 1200];

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;
  if (file.toLowerCase().includes('logo')) return; // skip logo
  const name = path.basename(file, ext);
  const input = path.join(srcDir, file);

  for (const w of sizes) {
    const outJpg = path.join(outDir, `${name}-${w}.jpg`);
    const outWebp = path.join(outDir, `${name}-${w}.webp`);
    try {
      await sharp(input)
        .rotate()
        .resize({ width: w })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(outJpg);

      await sharp(input)
        .rotate()
        .resize({ width: w })
        .webp({ quality: 78 })
        .toFile(outWebp);

      console.log(`wrote ${outJpg} and ${outWebp}`);
    } catch (err) {
      console.error('error processing', input, err);
    }
  }
}

(async () => {
  const files = fs.readdirSync(srcDir);
  for (const f of files) {
    await processFile(f);
  }
  console.log('done');
})();

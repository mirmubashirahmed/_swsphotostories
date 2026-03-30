import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const imagesDir = path.join(root, 'images');
const dataDir = path.join(root, 'data');
const outFile = path.join(dataDir, 'image-manifest.json');
const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function buildManifest() {
  const stories = {};
  if (!fs.existsSync(imagesDir)) {
    return { generatedAt: new Date().toISOString(), stories };
  }
  for (const code of fs.readdirSync(imagesDir).sort(naturalCompare)) {
    const folder = path.join(imagesDir, code);
    if (!fs.statSync(folder).isDirectory()) continue;
    const files = fs.readdirSync(folder)
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .sort(naturalCompare)
      .map((name) => `images/${code}/${name}`);
    stories[code] = files;
  }
  return { generatedAt: new Date().toISOString(), stories };
}

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(buildManifest(), null, 2) + '\n', 'utf8');
console.log(`[OK] wrote ${path.relative(root, outFile)}`);

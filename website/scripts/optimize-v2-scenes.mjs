import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const sharp = nextRequire('sharp');
const output = path.join(project, 'public/images/v2');
await mkdir(output, { recursive: true });

const scenes = ['minigolf', 'hospitality', 'interactive', 'workshop'];
const variants = [
  { name: 'desktop', width: 1600, height: 900, quality: 82 },
  { name: 'tablet', width: 1000, height: 750, quality: 78 },
  { name: 'mobile', width: 600, height: 750, quality: 72 },
];

for (const scene of scenes) {
  const input = path.join(project, 'assets/v2-originals', `${scene}.png`);
  for (const variant of variants) {
    const destination = path.join(output, `${scene}-${variant.name}.webp`);
    const result = await sharp(input)
      .resize(variant.width, variant.height, { fit: 'cover', position: 'centre' })
      .webp({ quality: variant.quality, effort: 6 })
      .toFile(destination);
    console.log(JSON.stringify({ scene, variant: variant.name, width: result.width, height: result.height, bytes: result.size }));
  }
}

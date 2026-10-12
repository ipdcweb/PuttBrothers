import { createRequire } from 'node:module';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const sharp = nextRequire('sharp');
const output = path.join(project, 'public/images/v2/products');
await mkdir(output, { recursive: true });

const products = [
  { source: 'CourseHoles/THE_HOM_RUN.png', name: 'the-home-run' },
  { source: 'TableGolf/SOCCER.png', name: 'soccer-table-golf' },
];

for (const product of products) {
  const input = path.join(project, 'public/images', product.source);
  const sourceBytes = (await stat(input)).size;
  const destination = path.join(output, `${product.name}.webp`);
  const result = await sharp(input)
    .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(destination);
  console.log(JSON.stringify({ source: product.source, output: `${product.name}.webp`, width: result.width, height: result.height, bytes: result.size, sourceBytes }));
}

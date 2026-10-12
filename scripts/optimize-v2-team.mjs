import { createRequire } from 'node:module';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const sharp = nextRequire('sharp');
const output = path.join(project, 'public/images/v2/team');
await mkdir(output, { recursive: true });

const portraits = [
  { source: 'Douglas.png', name: 'douglas-tonsic' },
  { source: 'Imre-Szenttornyay.png', name: 'imre-szenttornyay' },
  { source: 'John.png', name: 'joao-nascimento' },
  { source: 'Eduardo.png', name: 'luiz-tonsic' },
];

for (const portrait of portraits) {
  // AI background extraction and common framing are saved as non-destructive masters.
  const input = path.join(project, 'assets/v2-originals', `${portrait.name}-studio-v3.png`);
  const sourceBytes = (await stat(input)).size;
  const destination = path.join(output, `${portrait.name}-studio-v3.webp`);
  const result = await sharp(input)
    .resize(640, 640, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, alphaQuality: 100, effort: 6 })
    .toFile(destination);
  console.log(JSON.stringify({ source: input, output: `${portrait.name}-studio-v3.webp`, width: result.width, height: result.height, bytes: result.size, sourceBytes }));
}

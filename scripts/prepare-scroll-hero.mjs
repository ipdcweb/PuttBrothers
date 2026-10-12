import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'assets/ScrollingVideo_v01/ScrollingVideo_v01.mp4');
const output = path.join(root, 'public/videos');
mkdirSync(output, { recursive: true });
const videoFiles = {};
for (const [name, width, crf] of [['desktop', 1280, 21], ['mobile', 768, 23]]) {
  const result = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'warning', '-i', input,
    '-an', '-vf', `scale=${width}:-2`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
    '-pix_fmt', 'yuv420p', '-g', '12', '-keyint_min', '12', '-sc_threshold', '0', '-bf', '0',
    '-movflags', '+faststart', path.join(output, `putt-brothers-scroll-v1-${name}.mp4`)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Encoding ${name} failed`);
  videoFiles[`/videos/putt-brothers-scroll-v1-${name}.mp4`] = statSync(path.join(output, `putt-brothers-scroll-v1-${name}.mp4`)).size;
}
writeFileSync(path.join(root, 'lib/scroll-video-files.json'), JSON.stringify(videoFiles, null, 2) + '\n');

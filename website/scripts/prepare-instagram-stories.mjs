// Web encodings of three client-supplied Instagram files. No cuts or soundtrack changes.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const downloads = path.join(os.homedir(), 'Downloads')
const definitions = [
  { id: 'putting-challenge', prefix: 'WHO DOESN’T WANT TO PLAY A PUTT BROTHERS HOLE!', label: 'The putting challenge', title: 'One putt. Plenty of reactions.', description: 'A playful challenge and the fun of giving it a go. See a Putt Brothers hole in action.', alt: 'A player trying a Putt Brothers mini golf hole' },
  { id: 'operator-courses', prefix: 'Or maybe you’re an operator.Our mini golf courses', label: 'Mini golf for venues', title: 'Make room for more play.', description: 'Take a closer look at mini golf designed for entertainment venues and the people who run them.', alt: 'Putt Brothers mini golf courses presented for venue operators' },
  { id: 'venue-courses', prefix: 'We make the best mini golf courses in the world,', label: 'Your next attraction', title: 'Picture the possibilities.', description: 'Explore Putt Brothers mini golf and imagine a new experience for guests at your venue.', alt: 'Putt Brothers presenting mini golf courses for venues' },
]
const verify = process.argv.length === 3 && process.argv[2] === '--verify'
if (process.argv.length > 2 && !verify) throw Error('Use no arguments to prepare new files, or --verify to check existing derivatives.')
const run = (bin, args) => {
  const result = spawnSync(bin, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 8e6 })
  if (result.status !== 0) throw Error(result.stderr || String(result.error))
  return result.stdout
}
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'))
const stories = read('lib/client-stories.json'), records = read('assets/client-stories-web.json'), files = read('lib/scroll-video-files.json')
const audioHash = file => run('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:a:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-']).trim()
let inputBytes = 0, outputBytes = 0
for (const definition of definitions) {
  const matches = fs.readdirSync(downloads).filter(name => name.startsWith(definition.prefix) && name.endsWith('.mp4'))
  if (matches.length !== 1) throw Error('Expected one supplied video: ' + definition.id)
  const source = matches[0], input = path.join(downloads, source)
  const video = `/videos/client-story-${definition.id}-instagram-v1.mp4`, poster = `/images/v2/client-story-${definition.id}-instagram-v1.webp`
  const output = path.join(root, 'public', video), image = path.join(root, 'public', poster)
  if (!verify) {
    if (fs.existsSync(output) || fs.existsSync(image) || stories.some(s => s.id === definition.id)) throw Error('Refusing to overwrite existing story: ' + definition.id)
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', input, '-map', '0:v:0', '-map', '0:a:0', '-vf', 'scale=720:1280:flags=lanczos,fps=30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '26', '-maxrate', '1500k', '-bufsize', '3M', '-threads', '2', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'copy', '-map_metadata', '-1', '-movflags', '+faststart', '-n', output])
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', input, '-frames:v', '1', '-vf', 'scale=540:960:flags=lanczos', '-c:v', 'libwebp', '-quality', '82', '-n', image])
  }
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', output]))
  const original = JSON.parse(run('ffprobe', ['-v', 'error', '-show_format', '-of', 'json', input]))
  const stream = probe.streams.find(s => s.codec_type === 'video'), duration = Number(probe.format.duration)
  if (stream.width !== 720 || stream.height !== 1280 || stream.r_frame_rate !== '30/1' || Math.abs(duration - Number(original.format.duration)) > 0.15) throw Error('Video geometry or duration changed unexpectedly')
  if (audioHash(input) !== audioHash(output)) throw Error('Original audio changed')
  const bytes = fs.statSync(output).size, posterBytes = fs.statSync(image).size
  if (bytes >= 24 * 1024 * 1024 || posterBytes >= 200000) throw Error('Web media exceeds its size budget')
  const record = { id: definition.id, source, sourceType: 'client-supplied-instagram', sourceSha256: sha(input), video, bytes, sha256: sha(output), width: 720, height: 1280, duration, audioCopiedExactly: true, rightsBasis: 'Supplied by Rafael for website publication, 2026-11-16', poster, posterBytes, posterSha256: sha(image) }
  if (verify) {
    const saved = records.find(r => r.id === definition.id), story = stories.find(s => s.id === definition.id)
    if (!saved || !story || saved.sourceSha256 !== record.sourceSha256 || saved.sha256 !== record.sha256 || saved.posterSha256 !== record.posterSha256 || files[video] !== bytes || Math.abs(story.duration - duration) > 0.01) throw Error('Media differs from its recorded manifest')
  } else {
    const { prefix, ...copy } = definition
    stories.push({ ...copy, sourceFile: source, sourceType: record.sourceType, audioDescription: 'Original audio from the supplied Instagram film.', duration, video, poster })
    records.push(record); files[video] = bytes
  }
  inputBytes += fs.statSync(input).size; outputBytes += bytes
  console.log(JSON.stringify({ id: definition.id, duration, sourceBytes: fs.statSync(input).size, webBytes: bytes, posterBytes, audioCopiedExactly: true, verified: verify }))
}
if (!verify) for (const [name, value] of [['lib/client-stories.json', stories], ['assets/client-stories-web.json', records], ['lib/scroll-video-files.json', files]]) fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n')
console.log(JSON.stringify({ inputBytes, outputBytes, reductionPercent: +(100 * (1 - outputBytes / inputBytes)).toFixed(1) }))

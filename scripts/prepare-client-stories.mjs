// Web delivery only. Approved masters, cuts, timing and soundtracks stay intact.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const source=path.resolve(root,'../New Website/videos/client-stories-v01/exports/trilhas-individuais-v03')
const stories=JSON.parse(fs.readFileSync(path.join(root,'lib/client-stories.json'),'utf8'))
const masters=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'))
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const files=JSON.parse(fs.readFileSync(path.join(root,'lib/scroll-video-files.json'),'utf8'))
const records=[]
function run(bin,args){const r=spawnSync(bin,args,{encoding:'utf8',maxBuffer:8e6,windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.error);return r.stdout}
for(const story of stories){
 const input=path.join(source,story.sourceFile),master=masters.find(m=>m.file===story.sourceFile)
 if(!master||hash(input)!==master.sha256)throw Error('Unverified master: '+story.id)
 const output=path.join(root,'public',story.video),poster=path.join(root,'public',story.poster)
 if(fs.existsSync(output)||fs.existsSync(poster))throw Error('Web assets already exist: '+story.id)
 run('ffmpeg',['-hide_banner','-loglevel','error','-i',input,'-map','0:v:0','-map','0:a:0','-vf','scale=720:1280:flags=lanczos','-c:v','libx264','-preset','medium','-crf','22','-maxrate','3M','-bufsize','6M','-threads','2','-pix_fmt','yuv420p','-g','60','-c:a','copy','-map_metadata','-1','-movflags','+faststart','-n',output])
 run('ffmpeg',['-hide_banner','-loglevel','error','-ss','1','-i',input,'-frames:v','1','-vf','scale=540:960:flags=lanczos','-c:v','libwebp','-quality','82','-n',poster])
 const probe=JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',output]))
 if(Math.abs(+probe.format.duration-story.duration)>0.1)throw Error('Duration changed')
 if(fs.statSync(output).size>=24*1024*1024)throw Error('Static asset too large')
 const audioHash=p=>run('ffmpeg',['-v','error','-i',p,'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-']).trim()
 if(audioHash(input)!==audioHash(output))throw Error('Soundtrack changed')
 files[story.video]=fs.statSync(output).size
 records.push({id:story.id,source:story.sourceFile,sourceSha256:master.sha256,video:story.video,bytes:files[story.video],sha256:hash(output),width:720,height:1280,duration:story.duration,music:master.music,artist:master.artist,license:master.license,attributionRequired:false,audioCopiedExactly:true,poster:story.poster,posterBytes:fs.statSync(poster).size})
 console.log(`${story.id}: ${(files[story.video]/1e6).toFixed(2)} MB, audio preserved`)
}
fs.writeFileSync(path.join(root,'lib/scroll-video-files.json'),JSON.stringify(files,null,2)+'\n')
fs.writeFileSync(path.join(root,'assets/client-stories-web.json'),JSON.stringify(records,null,2)+'\n')

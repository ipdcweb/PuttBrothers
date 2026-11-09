import assert from 'node:assert/strict'
import {readFile,stat} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import test from 'node:test'
import ts from 'typescript'
const read=async file=>readFile(new URL(`../${file}`,import.meta.url),'utf8')
const source=await read('lib/client-story-playback.ts')
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const helpers={};new Function('exports',compiled)(helpers)
const stories=JSON.parse(await read('lib/client-stories.json'))
const {storyIndex,storyOffset,mayPlayStory,mayAdvanceStory,storyTime}=helpers

test('carousel wraps forwards/backwards and has exactly one active position',()=>{
 for(let active=0;active<6;active++){
  const positions=stories.map((_,i)=>storyOffset(i,active,6))
  assert.equal(positions.filter(x=>x===0).length,1)
  assert.equal(positions.filter(x=>Math.abs(x)===1).length,2)
 }
 assert.equal(storyIndex(-1,6),5);assert.equal(storyIndex(6,6),0);assert.equal(storyIndex(0,0),0)
})
test('playback stops outside the viewport, on a hidden tab, or on user pause',()=>{
 const base={inView:true,visible:true,requested:true,loaded:true,reducedMotion:false,saveData:false,userStarted:false}
 assert.equal(mayPlayStory(base),true)
 for(const key of ['inView','visible','requested','loaded'])assert.equal(mayPlayStory({...base,[key]:false}),false)
 for(const key of ['reducedMotion','saveData']){
  assert.equal(mayPlayStory({...base,[key]:true}),false)
  assert.equal(mayPlayStory({...base,[key]:true,userStarted:true}),true)
 }
})
test('auto-next respects focus, motion, data saving, visibility and its pause switch',()=>{
 const base={inView:true,visible:true,autoNext:true,keyboardFocus:false,reducedMotion:false,saveData:false}
 assert.equal(mayAdvanceStory(base),true)
 for(const key of ['inView','visible','autoNext'])assert.equal(mayAdvanceStory({...base,[key]:false}),false)
 for(const key of ['keyboardFocus','reducedMotion','saveData'])assert.equal(mayAdvanceStory({...base,[key]:true}),false)
 assert.equal(storyTime(25.2),'0:25');assert.equal(storyTime(NaN),'0:00');assert.equal(storyTime(80),'1:20')
})
test('six approved anonymous films have lightweight posters and ready-to-host audio/video',async()=>{
 const manifest=JSON.parse(await read('assets/client-stories-web.json'))
 const sizes=JSON.parse(await read('lib/scroll-video-files.json'))
 assert.equal(stories.length,6);assert.equal(new Set(stories.map(s=>s.video)).size,6)
 for(const story of stories){
  assert.doesNotMatch(`${story.label} ${story.title} ${story.description} ${story.alt}`,/[\u2013\u2014]/u)
  assert.doesNotMatch(JSON.stringify(story),/Extremesim|Lets Go Putt|Whanganui|Melbourne|Putt Social|Tauranga/i)
  const file=new URL(`../public${story.video}`,import.meta.url)
  const videoStat=await stat(file),posterStat=await stat(new URL(`../public${story.poster}`,import.meta.url))
  assert.equal(sizes[story.video],videoStat.size);assert.ok(videoStat.size<24*1024*1024)
  assert.ok(posterStat.size<200000);assert.match(story.poster,/\.webp$/)
  const record=manifest.find(m=>m.id===story.id)
  assert.equal(record.audioCopiedExactly,true);assert.equal(record.attributionRequired,false)
  const probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',fileURLToPath(file)],{encoding:'utf8',windowsHide:true})
  assert.equal(probe.status,0)
  const media=JSON.parse(probe.stdout),video=media.streams.find(s=>s.codec_type==='video')
  assert.equal(video.width,720);assert.equal(video.height,1280);assert.equal(video.r_frame_rate,'30/1')
  assert.equal(media.streams.filter(s=>s.codec_type==='audio').length,1)
  assert.ok(Math.abs(+media.format.duration-story.duration)<0.1)
 }
})
test('home mounts stories once and media remains lazy, inline and muted by default',async()=>{
 const home=await read('app/page.tsx'),component=await read('components/v2/client-stories.tsx')
 assert.equal(home.match(/<ClientStories\s*\/>/g)?.length,1)
 assert.ok(home.indexOf('<ClientStories')>home.indexOf('id="experiences"'))
 assert.match(component,/src=\{loadMedia \? item.video : undefined\}/)
 assert.match(component,/useState\(true\)/)
 assert.match(component,/playsInline/);assert.match(component,/video\.pause\(\)/)
 assert.doesNotMatch(component,/addEventListener\(['"]wheel/)
 assert.match(component,/<noscript>/)
})

import { runWebsiteRelease } from './release-website.mjs'

await runWebsiteRelease('preview', process.argv.slice(2))

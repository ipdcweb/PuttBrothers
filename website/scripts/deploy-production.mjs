import { runWebsiteRelease } from './release-website.mjs'

await runWebsiteRelease('production', process.argv.slice(2))

import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import { assertPreviewConfig } from "../scripts/preview-safety.mjs"
import { assertProductionConfig } from "../scripts/production-safety.mjs"

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

async function parsePage(path) {
  const source = await readProjectFile(path)
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  assert.equal(file.parseDiagnostics.length, 0, `${path} must parse before its structure can be checked`)
  return file
}

function componentUsages(file, modulePath, exportedName) {
  const localNames = new Set()
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== modulePath) continue
    const bindings = statement.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const binding of bindings.elements) {
        if ((binding.propertyName?.text ?? binding.name.text) === exportedName) localNames.add(binding.name.text)
      }
    }
  }

  const usages = []
  const visit = (node) => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))
      && ts.isIdentifier(node.tagName) && localNames.has(node.tagName.text)) usages.push(node)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return usages
}

function staticClassNames(openingElement) {
  const attribute = openingElement.attributes.properties.find((item) => (
    ts.isJsxAttribute(item) && item.name.text === "className"
  ))
  if (!attribute?.initializer) return []
  const value = attribute.initializer
  if (ts.isStringLiteral(value)) return value.text.split(/\s+/)
  if (ts.isJsxExpression(value) && value.expression
    && (ts.isStringLiteral(value.expression) || ts.isNoSubstitutionTemplateLiteral(value.expression))) {
    return value.expression.text.split(/\s+/)
  }
  assert.fail("Keep the approved form's ancestor classes statically auditable for V2 isolation")
}

test("V2 production and its separate preview keep their authorized routes, storage and indexing", async () => {
  const parsed = ts.parseConfigFileTextToJson("wrangler.preview.jsonc", await readProjectFile("wrangler.preview.jsonc"))
  assert.equal(parsed.error, undefined)
  const config = parsed.config
  assert.equal(config.name, "puttbrothers-v2-preview")
  assert.deepEqual(config.routes, [])
  assert.equal(config.route, undefined)
  assert.equal(config.workers_dev, true)
  assert.equal(config.preview_urls, false)
  assertPreviewConfig(config)
  assert.throws(() => assertPreviewConfig({ ...config, name: 'puttbrothers-com' }))
  assert.throws(() => assertPreviewConfig({ ...config, r2_buckets: [{ binding: 'PRODUCT_MEDIA', bucket_name: 'production' }] }))
  assert.throws(() => assertPreviewConfig({ ...config, r2_buckets: [] }))
  assert.throws(() => assertPreviewConfig({ ...config, routes: [{ pattern: 'puttbrothers.com/*' }] }))
  assert.throws(() => assertPreviewConfig({ ...config, vars: { PREVIEW_MODE: 'false' } }))
  for (const [name, environment] of Object.entries(config.env ?? {})) {
    assert.equal(environment.route, undefined, `${name} must not attach a route`)
    assert.deepEqual(environment.routes ?? [], [], `${name} must not attach routes`)
    assert.notEqual(environment.name, "puttbrothers-com", `${name} must not target V1`)
    assert.notEqual(environment.workers_dev, true, `${name} must not enable a public endpoint`)
    assert.notEqual(environment.preview_urls, true, `${name} must not enable public previews`)
  }
  const production = ts.parseConfigFileTextToJson("wrangler.jsonc", await readProjectFile("wrangler.jsonc"))
  assert.equal(production.error, undefined)
  assertProductionConfig(production.config)
  assert.throws(() => assertProductionConfig({ ...production.config, routes: [] }))
  assert.throws(() => assertProductionConfig({ ...production.config, vars: { PREVIEW_MODE: "true" } }))
  assert.throws(() => assertProductionConfig({ ...production.config, r2_buckets: config.r2_buckets }))
  assert.match(await readProjectFile("app/layout.tsx"), /robots:\s*\{\s*index:\s*true,\s*follow:\s*true\s*\}/)
  assert.match(await readProjectFile("public/robots.txt"), /Allow:\s*\//)
  assert.doesNotMatch(await readProjectFile("public/robots.txt"), /Disallow:\s*\//)
  assert.doesNotMatch(await readProjectFile("public/_headers"), /X-Robots-Tag:\s*noindex/i)
})

test("the V2 deployment command points to a guard that exits unsuccessfully without deployment tools", async () => {
  const pkg = JSON.parse(await readProjectFile("package.json"))
  assert.equal(pkg.scripts["deploy:vinext"], "node scripts/deploy-disabled.mjs")
  const simulatedProcess = { exitCode: 0 }
  // Evaluate only the guard, never the package command or Wrangler.
  runInNewContext(await readProjectFile("scripts/deploy-disabled.mjs"), {
    process: simulatedProcess,
    console: { error() {}, log() {} },
  }, { timeout: 1000 })
  assert.equal(typeof simulatedProcess.exitCode, "number")
  assert.notEqual(simulatedProcess.exitCode, 0)
})

test("the existing product carousel is rendered once on Products and not on Home", async () => {
  const [home, products] = await Promise.all([parsePage("app/page.tsx"), parsePage("app/products/page.tsx")])
  assert.equal(componentUsages(home, "@/components/products-showcase", "ProductsShowcase").length, 0)
  assert.equal(componentUsages(products, "@/components/products-showcase", "ProductsShowcase").length, 1)
})

for (const path of ["app/page.tsx", "app/contact/page.tsx"]) {
  test(`${path} keeps the approved Contact component outside V2 typography ancestors`, async () => {
    const file = await parsePage(path)
    const contacts = componentUsages(file, "@/components/contact", "Contact")
    assert.equal(contacts.length, 1, "Render the existing Contact component exactly once")
    let withinMain = false
    for (let ancestor = contacts[0].parent; ancestor; ancestor = ancestor.parent) {
      if (!ts.isJsxElement(ancestor)) continue
      const opening = ancestor.openingElement
      if (ts.isIdentifier(opening.tagName) && opening.tagName.text === "main") withinMain = true
      assert.equal(staticClassNames(opening).includes("pb-v2"), false, "V2 typography must not wrap the form")
    }
    assert.equal(withinMain, true, "Keep the form within the page's main landmark")
  })
}

test("all five V2 scenes have three real WebP assets and a lighter mobile variant", async () => {
  for (const scene of ["hero", "minigolf", "hospitality", "interactive", "workshop"]) {
    const assets = await Promise.all(["desktop", "tablet", "mobile"].map(async (variant) => {
      const data = await readFile(new URL(`../public/images/v2/${scene}-${variant}.webp`, import.meta.url))
      assert.equal(data.subarray(0, 4).toString("ascii"), "RIFF", `${scene}/${variant} has a WebP container`)
      assert.equal(data.subarray(8, 12).toString("ascii"), "WEBP", `${scene}/${variant} is WebP`)
      assert.ok(data.length > 12, `${scene}/${variant} is not empty`)
      return data
    }))
    assert.ok(assets[2].length < assets[0].length, `${scene} mobile asset must be lighter than desktop`)
  }
})

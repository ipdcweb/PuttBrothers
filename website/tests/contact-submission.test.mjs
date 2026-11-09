import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../components/contact.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('contact.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const stateNames = []
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) &&
      node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(ast) === 'useState') {
    stateNames.push(node.name.elements[0].getText(ast))
  }
  ts.forEachChild(node, visit)
}
visit(ast)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText
const initialForm = {
  firstName: 'Test', lastName: 'Fixture', email: 'fixture@example.invalid', mobile: '+10000000000',
  FindUs: 'IAAPA Expo', FindLead: 'Full Selected Name', industry: 'Family Entertainment Center',
  businessStatus: 'Opening a first venue', deployment: 'Oceania', message: 'Isolated form interaction test',
}

// Run the real submit handler with isolated React state, inert child components and
// a deferred in-memory fetch. No browser CAPTCHA is solved and no network is used.
function fixture() {
  const state = new Map(Object.entries({ formData: {...initialForm}, isCaptchaValid: true,
    showLayoutPlanner: true, layoutPdfUrl: 'https://example.invalid/layout.pdf', layoutPdfFilename: 'layout.pdf' }))
  const calls = []
  let hook = 0, finish
  const pending = new Promise(resolve => { finish = resolve })
  const jsx = (type, props) => ({type,props})
  const requireStub = name => {
    if (name === 'react') return {
      useState(initial) {
        const key = stateNames[hook++]
        assert.ok(key)
        if (!state.has(key)) state.set(key,initial)
        return [state.get(key),value=>state.set(key,typeof value === 'function' ? value(state.get(key)) : value)]
      },
      useEffect() {}, useRef: initial=>({current:initial}),
    }
    if (name === 'react/jsx-runtime') return {jsx,jsxs:jsx}
    if (name === '@/hooks/use-planner-device-warning') return {useIsPlannerMobileDevice:()=>false}
    return new Proxy({}, {get:(_target,key)=>String(key)})
  }
  const exports = {}
  new Function('require','exports','fetch',compiled)(requireStub,exports,async (url,options)=>{
    calls.push({url,payload:JSON.parse(options.body)})
    return pending
  })
  const tree = exports.Contact()
  function find(node,type) {
    if (!node || typeof node !== 'object') return
    if (node.type === type) return node
    for (const child of [node.props?.children].flat(Infinity)) {
      const found=find(child,type)
      if (found) return found
    }
  }
  const form = find(tree,'form')
  assert.ok(form)
  return {state,calls,finish,submit:()=>form.props.onSubmit({preventDefault(){}})}
}

test('sending shows the pending state and prevents duplicate requests', async () => {
  const f=fixture(), first=f.submit()
  assert.equal(f.state.get('isSubmitting'),true)
  await f.submit()
  assert.equal(f.calls.length,1)
  assert.equal(f.calls[0].payload.howDidYouFindUs.FindLead,initialForm.FindLead)
  assert.equal(f.calls[0].payload.layoutPdfUrl,'https://example.invalid/layout.pdf')
  f.finish(Response.json({success:true}))
  await first
  assert.equal(f.state.get('isSubmitting'),false)
})

test('confirmed success collapses the planner, clears the form and keeps the confirmation open', async () => {
  const f=fixture(), submitted=f.submit()
  f.finish(Response.json({success:true}))
  await submitted
  assert.equal(f.state.get('submitSuccess'),true)
  assert.equal(f.state.get('submittedWithLayout'),true)
  assert.equal(f.state.get('showLayoutPlanner'),false)
  assert.equal(f.state.get('isCollapsingLayout'),false)
  assert.equal(f.state.get('layoutPdfUrl'),'')
  assert.ok(Object.values(f.state.get('formData')).every(value=>value===''))
  assert.equal(f.state.get('isCaptchaValid'),false)
})

test('failed responses, including HTTP 200 with success false, preserve the enquiry and attached layout', async () => {
  for (const status of [200,503]) {
    const f=fixture(), submitted=f.submit()
    f.finish(Response.json({success:false,message:'Please try again'}, {status}))
    await submitted
    assert.equal(f.state.get('submitSuccess'),false)
    assert.equal(f.state.get('isSubmitting'),false)
    assert.equal(f.state.get('showLayoutPlanner'),true)
    assert.equal(f.state.get('layoutPdfUrl'),'https://example.invalid/layout.pdf')
    assert.deepEqual(f.state.get('formData'),initialForm)
    assert.equal(f.state.get('submitError'),'Please try again')
  }
})

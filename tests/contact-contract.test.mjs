import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../app/api/contact/route.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

const TEST_API_URL = "https://example.invalid/workorg"
const TEST_TOKEN = "test-only-not-a-real-token"

// Execute the real handler with isolated configuration and an in-memory upstream.
// No fixture reads real environment variables or makes a network request.
function fixture({ env = {}, upstream = async () => new Response("{}") } = {}) {
  const calls = []
  const errors = []
  const exports = {}
  const requireStub = (name) => {
    assert.equal(name, "next/server", "Unexpected handler dependency must be explicitly mocked")
    return { NextResponse: { json: (body, init) => Response.json(body, init) } }
  }

  new Function("require", "process", "fetch", "exports", "console", compiled)(
    requireStub,
    { env: { NODE_ENV: "production", WORKORG_CONTACT_API_URL: TEST_API_URL, WORKORG_API_TOKEN: TEST_TOKEN, ...env } },
    async (url, options) => {
      const call = { url, method: options.method, headers: new Headers(options.headers), payload: JSON.parse(options.body) }
      calls.push(call)
      return upstream(call)
    },
    exports,
    { error: (...args) => errors.push(args) },
  )

  return {
    calls,
    errors,
    post: (payload) => exports.POST(new Request("https://example.invalid/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })),
  }
}

function contactPayload(howDidYouFindUs = { FindUs: "Google", FindUsOther: "", FindLead: "" }) {
  return {
    personalInformation: {
      firstName: "Test",
      lastName: "Fixture",
      mobile: "+10000000000",
      email: "fixture@example.invalid",
    },
    howDidYouFindUs,
    industryInformation: {
      industry: "Family Entertainment Center",
      businessStatus: "Opening an additional venue",
      deployment: "North America",
    },
    message: "In-memory contact contract test",
    layoutPdfUrl: "",
  }
}

test("IAAPA Expo sends the full selected person's name and the complete WorkOrg contract", async () => {
  const f = fixture()
  const payload = contactPayload({ FindUs: "IAAPA Expo", FindUsOther: "", FindLead: "João Nascimento" })
  const response = await f.post(payload)

  assert.equal(response.status, 200)
  assert.equal((await response.json()).success, true)
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].url, TEST_API_URL)
  assert.equal(f.calls[0].method, "POST")
  assert.equal(f.calls[0].headers.get("Content-Type"), "application/json")
  assert.equal(f.calls[0].headers.get("Authorization"), `Bearer ${TEST_TOKEN}`)
  assert.deepEqual(f.calls[0].payload, payload)
})

test("IATP Annual Conference preserves the manually entered person's name", async () => {
  const f = fixture()
  const payload = contactPayload({ FindUs: "IATP Annual Conference", FindUsOther: "", FindLead: "Alexandra Montgomery" })
  const response = await f.post(payload)

  assert.equal(response.status, 200)
  assert.equal(f.calls.length, 1)
  assert.deepEqual(f.calls[0].payload, payload)
})

test("a standard source without optional lead fields sends empty strings", async () => {
  const f = fixture()
  const payload = contactPayload({ FindUs: "Google" })
  delete payload.layoutPdfUrl
  const response = await f.post(payload)

  assert.equal(response.status, 200)
  assert.equal(f.calls.length, 1)
  assert.deepEqual(f.calls[0].payload, {
    ...payload,
    howDidYouFindUs: { FindUs: "Google", FindUsOther: "", FindLead: "" },
    layoutPdfUrl: "",
  })
})

test("the completed planner PDF URL is preserved in the WorkOrg payload", async () => {
  const f = fixture()
  const payload = contactPayload()
  payload.layoutPdfUrl = "https://example.invalid/layout-plans/test-layout.pdf"
  const response = await f.post(payload)

  assert.equal(response.status, 200)
  assert.equal(f.calls.length, 1)
  assert.deepEqual(f.calls[0].payload, payload)
})

test("missing WorkOrg credentials fail without contacting the upstream", async () => {
  const f = fixture({ env: { WORKORG_API_TOKEN: undefined } })
  const response = await f.post(contactPayload())

  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { success: false, message: "Contact service is not configured" })
  assert.equal(f.calls.length, 0)
})

test("an upstream failure stays a failure without exposing its response body in production", async () => {
  const f = fixture({ upstream: async () => new Response("private upstream diagnostic", { status: 503, statusText: "Service Unavailable" }) })
  const response = await f.post(contactPayload())

  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { success: false, message: "API error: Service Unavailable" })
  assert.equal(f.calls.length, 1)
})

test("a network exception returns an unsuccessful response instead of claiming submission", async () => {
  const f = fixture({ upstream: async () => { throw new Error("simulated network failure") } })
  const response = await f.post(contactPayload())

  assert.equal(response.status, 500)
  const body = await response.json()
  assert.equal(body.success, false)
  assert.equal(body.message, "Internal server error")
  assert.equal(f.calls.length, 1)
})

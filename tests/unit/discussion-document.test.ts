import { describe, expect, it } from "vitest"
import {
  buildDiscussionDocument,
  readDiscussionFields,
  sanitizeDiscussionHtml,
} from "../../src/domain/discussion-document"
import {
  candidates,
  contentValid,
  createSeed,
  getCurrent,
} from "../../src/domain/model"
import { WorkspaceSession } from "../../src/state/session"
import { loadWorkspace } from "../../src/state/persistence"

function storage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

describe("editable discussion document", () => {
  it("includes the current brief, all three CV summaries and seven unresolved questions", () => {
    const editor = document.createElement("div")
    editor.innerHTML = buildDiscussionDocument(getCurrent(createSeed()).content)
    expect(editor.textContent).toContain("integrate two acquisitions")
    expect(editor.textContent).toContain("$190K–$220K")
    expect(editor.textContent).toContain("6 regional operations leaders")
    for (const candidate of candidates)
      expect(editor.textContent).toContain(candidate.name)
    expect(
      editor.querySelectorAll('[data-brief-section="questions"] li')
    ).toHaveLength(7)
    expect(editor.textContent).toContain("90 days")
    expect(editor.textContent).toContain("relocation to Chicago")
    expect(readDiscussionFields(editor).summary).toContain(
      "integrate two acquisitions"
    )
  })
  it("saves formatted edits as a new version and reloads them without modifying the original seed", () => {
    const saved = storage(),
      session = new WorkspaceSession(saved)
    const original = getCurrent(session.getSnapshot().state)
    const editor = document.createElement("div")
    editor.innerHTML = buildDiscussionDocument(original.content)
    editor.querySelector("h1")!.innerHTML = "<i>Client discussion notes</i>"
    editor.insertAdjacentHTML(
      "beforeend",
      "<p>Advisor note: confirm interview dates.</p>"
    )
    session.beginEdit()
    session.changeWorking(readDiscussionFields(editor))
    session.failNextSave()
    expect(session.save()).toBe(false)
    expect(session.getSnapshot().working?.documentHtml).toContain(
      "<i>Client discussion notes</i>"
    )
    expect(session.retry()).toBe(true)
    const loaded = loadWorkspace(saved)
    expect(loaded.recovery).toBe("none")
    expect(loaded.state.versions[1]).toEqual(original)
    expect(getCurrent(loaded.state).content.documentHtml).toContain(
      "<i>Client discussion notes</i>"
    )
    expect(getCurrent(loaded.state).content.documentHtml).toContain(
      "Advisor note: confirm interview dates."
    )
    expect(getCurrent(loaded.state).status).toBe("draft")
  })
  it("removes executable markup while retaining safe formatting and document sections", () => {
    const clean = sanitizeDiscussionHtml(
      '<section data-brief-section="opening" onclick="alert(1)"><h2>Objective</h2><p><b>Integration</b><script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">Notes</a><span style="color:red">Keep text</span></p></section>'
    )
    expect(clean).toContain('data-brief-section="opening"')
    expect(clean).toContain("<b>Integration</b>")
    expect(clean).toContain("Keep text")
    expect(clean).not.toMatch(/script|onclick|onerror|javascript|style=|<img/)
  })
  it("rejects an empty document and regenerates a restored mandate without losing its saved predecessor", () => {
    const session = new WorkspaceSession(storage())
    const content = getCurrent(session.getSnapshot().state).content
    expect(contentValid({ ...content, documentHtml: "<p><br></p>" })).toBe(
      false
    )
    session.beginEdit()
    session.changeWorking({ documentHtml: buildDiscussionDocument(content) })
    expect(session.save()).toBe(true)
    expect(session.restore("V1")).toBe(true)
    const state = session.getSnapshot().state
    expect(state.versions.at(-2)?.content.documentHtml).toBeDefined()
    expect(getCurrent(state).content.documentHtml).toBeUndefined()
    expect(buildDiscussionDocument(getCurrent(state).content)).toContain(
      "geographic expansion"
    )
  })
})

describe("document font-size persistence", () => {
  it("retains point sizes while removing font-family and unrelated styling", () => {
    const clean = sanitizeDiscussionHtml(
      '<p><font size="7" face="Papyrus" color="red" style="font-size: 18pt; background: red;">Selected text</font><span style="font-size: 24px; font-family: Georgia; color: red;">Other text</span><span style="font-size: 200pt">Invalid size</span></p>'
    )
    const container = document.createElement("div")
    container.innerHTML = clean
    expect(container.querySelectorAll("font")).toHaveLength(0)
    const spans = container.querySelectorAll("span")
    expect(spans[0].style.fontSize).toBe("18pt")
    expect(spans[1].style.fontSize).toBe("18pt")
    expect(spans[2].style.fontSize).toBe("")
    expect(spans[0].style.length).toBe(1)
    expect(clean).not.toMatch(/Papyrus|Georgia|face=|color=|background|200pt/)
  })
})

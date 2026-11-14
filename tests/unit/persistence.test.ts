import { describe, expect, it } from "vitest"
import {
  createSeed,
  getCurrent,
  markReady,
  saveContent,
} from "../../src/domain/model"
import {
  STORAGE_KEY,
  loadWorkspace,
  commitWorkspace,
  resetWorkspace,
  type StorageLike,
} from "../../src/state/persistence"
import { WorkspaceSession } from "../../src/state/session"

class MemoryStorage implements StorageLike {
  data = new Map<string, string>()
  denyRead = false
  denyWrite = false
  getItem(key: string) {
    if (this.denyRead) throw new Error("denied")
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string) {
    if (this.denyWrite) throw new Error("quota")
    this.data.set(key, value)
  }
  removeItem(key: string) {
    if (this.denyWrite) throw new Error("denied")
    this.data.delete(key)
  }
}

describe("session edits, recovery and persistence", () => {
  it("D05 cancel leaves committed content/status unchanged", () => {
    const session = new WorkspaceSession(new MemoryStorage())
    session.ready()
    const before = structuredClone(session.getSnapshot().state)
    session.beginEdit()
    session.changeWorking({ summary: "Unsaved working text" })
    expect(session.getSnapshot().dirty).toBe(true)
    session.cancelEdit()
    expect(session.getSnapshot().state).toEqual(before)
    expect(session.getSnapshot().dirty).toBe(false)
    expect(session.getSnapshot().working).toBeNull()
  })

  it("D05 session no-op edit closes without invalidating the ready snapshot", () => {
    const session = new WorkspaceSession(new MemoryStorage())
    expect(session.ready()).toBe(true)
    const before = session.getSnapshot().state
    session.beginEdit()
    expect(session.save()).toBe(true)
    expect(session.getSnapshot().state).toBe(before)
    expect(session.getSnapshot().working).toBeNull()
    expect(getCurrent(session.getSnapshot().state).status).toBe("ready")
  })

  it("D09 retains failed edits and saves exactly once on retry", () => {
    const storage = new MemoryStorage()
    const session = new WorkspaceSession(storage)
    const before = structuredClone(session.getSnapshot().state)
    session.beginEdit()
    session.changeWorking({
      summary:
        "Integrate two acquisitions across twelve locations; start within sixty days. Ask about operating responsibilities.",
    })
    const intended = session.getSnapshot().working!
    session.failNextSave()
    expect(session.save()).toBe(false)
    expect(session.getSnapshot()).toMatchObject({
      dirty: true,
      error: "save-failed",
      working: intended,
      state: before,
    })
    expect(session.ready()).toBe(false)
    expect(session.retry()).toBe(true)
    expect(session.getSnapshot().dirty).toBe(false)
    expect(getCurrent(session.getSnapshot().state).content).toEqual(intended)
    expect(session.getSnapshot().state.versions).toHaveLength(
      before.versions.length + 1
    )
    const saved = session.getSnapshot().state
    session.retry()
    expect(session.getSnapshot().state.versions).toHaveLength(
      saved.versions.length
    )
    expect(getCurrent(loadWorkspace(storage).state).content).toEqual(intended)
  })

  it("U04 rejects whitespace-only required summary or questions without losing input", () => {
    const session = new WorkspaceSession(new MemoryStorage())
    session.beginEdit()
    session.changeWorking({ summary: "   " })
    expect(session.save()).toBe(false)
    expect(session.getSnapshot().error).toBe("validation")
    expect(session.getSnapshot().working?.summary).toBe("   ")
    session.cancelEdit()
    session.beginEdit()
    session.changeWorking({ questions: "\n  " })
    expect(session.save()).toBe(false)
    expect(session.getSnapshot().error).toBe("validation")
  })

  it("D10 round trips current status, content and immutable history", () => {
    const storage = new MemoryStorage()
    const seed = createSeed()
    const ready = markReady(seed)
    expect(commitWorkspace(storage, ready, seed.revision).ok).toBe(true)
    expect(loadWorkspace(storage)).toEqual({ state: ready, recovery: "none" })
    const loadedSession = new WorkspaceSession(storage)
    expect(loadedSession.getSnapshot().state).toEqual(ready)
  })

  it.each([
    ["corrupt JSON", "{bad", "corrupt"],
    [
      "unsupported schema",
      JSON.stringify({ ...createSeed(), schemaVersion: 99 }),
      "unsupported",
    ],
    [
      "missing current",
      JSON.stringify({ ...createSeed(), currentId: "missing" }),
      "corrupt",
    ],
    [
      "structurally invalid",
      JSON.stringify({ schemaVersion: 1, versions: [] }),
      "corrupt",
    ],
    [
      "invented current approval",
      JSON.stringify({
        ...createSeed(),
        versions: createSeed().versions.map((v) =>
          v.id === "V2" ? { ...v, status: "earlier-approved" } : v
        ),
      }),
      "corrupt",
    ],
    [
      "ready outdated content",
      JSON.stringify({
        ...createSeed(),
        versions: createSeed().versions.map((v) =>
          v.id === "V2"
            ? {
                ...v,
                status: "ready",
                content: { ...v.content, alignment: "expansion" },
              }
            : v
        ),
      }),
      "corrupt",
    ],
    [
      "altered historical approval",
      JSON.stringify({
        ...createSeed(),
        versions: createSeed().versions.map((v) =>
          v.id === "V1"
            ? {
                ...v,
                content: {
                  ...v.content,
                  summary: "Invented historical recommendation",
                },
              }
            : v
        ),
      }),
      "corrupt",
    ],
    [
      "invalid version sequence",
      JSON.stringify({
        ...createSeed(),
        versions: createSeed().versions.map((v) =>
          v.id === "V2" ? { ...v, sequence: -1 } : v
        ),
      }),
      "corrupt",
    ],
  ])(
    "D11 safely rejects %s and retains raw data until explicit reset",
    (_label, raw, expected) => {
      const storage = new MemoryStorage()
      storage.setItem(STORAGE_KEY, raw)
      const result = loadWorkspace(storage)
      expect(result.recovery).toBe(expected)
      expect(getCurrent(result.state).status).toBe("draft")
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
      const session = new WorkspaceSession(storage)
      expect(session.ready()).toBe(false)
      expect(session.getSnapshot().recovery).toBe(expected)
      expect(session.reset()).toBe(true)
      expect(session.getSnapshot().recovery).toBe("none")
    }
  )

  it("D12 read denial is recoverable in a truthful memory-only session", () => {
    const storage = new MemoryStorage()
    storage.denyRead = true
    expect(loadWorkspace(storage).recovery).toBe("unavailable")
    const session = new WorkspaceSession(storage)
    expect(session.getSnapshot().recovery).toBe("unavailable")
    session.continueInMemory()
    expect(session.getSnapshot().persistence).toBe("memory")
    session.beginEdit()
    session.changeWorking({
      summary: "Integration mandate with memory-only changes.",
    })
    expect(session.save()).toBe(true)
    expect(getCurrent(session.getSnapshot().state).content.summary).toContain(
      "memory-only"
    )
    expect(storage.data.size).toBe(0)
  })

  it("D12 quota failure does not advance saved state or lose text", () => {
    const storage = new MemoryStorage()
    const session = new WorkspaceSession(storage)
    const before = structuredClone(session.getSnapshot().state)
    session.beginEdit()
    session.changeWorking({
      questions: "What operating responsibility did each candidate hold?",
    })
    storage.denyWrite = true
    expect(session.save()).toBe(false)
    expect(session.getSnapshot().state).toEqual(before)
    expect(session.getSnapshot().dirty).toBe(true)
    expect(session.getSnapshot().working?.questions).toContain(
      "operating responsibility"
    )
    expect(session.getSnapshot().error).toMatch(/unavailable|save-failed/)
    storage.denyWrite = false
    expect(session.retry()).toBe(true)
  })

  it("D13 protects dirty work from a newer external revision and detects stale commit", () => {
    const storage = new MemoryStorage()
    const local = new WorkspaceSession(storage)
    const remote = new WorkspaceSession(storage)
    local.beginEdit()
    local.changeWorking({ questions: "Local unsaved question?" })
    remote.beginEdit()
    remote.changeWorking({ questions: "Remote saved question?" })
    expect(remote.save()).toBe(true)
    const remoteState = structuredClone(remote.getSnapshot().state)
    local.receiveExternal()
    expect(local.getSnapshot().conflict).toBe(true)
    expect(local.getSnapshot().working?.questions).toBe(
      "Local unsaved question?"
    )
    expect(local.save()).toBe(false)
    expect(loadWorkspace(storage).state).toEqual(remoteState)
    local.keepWorking()
    expect(local.getSnapshot().working?.questions).toBe(
      "Local unsaved question?"
    )
    local.reloadExternal()
    expect(local.getSnapshot().state).toEqual(remoteState)
    expect(local.getSnapshot().dirty).toBe(false)
    const stale = saveContent(createSeed(), {
      ...getCurrent(createSeed()).content,
      questions: "Stale question?",
    })
    expect(
      commitWorkspace(storage, stale, createSeed().revision)
    ).toMatchObject({ ok: false, error: "conflict" })
  })

  it("D14 resets only namespaced sample data and restores initial versions", () => {
    const storage = new MemoryStorage()
    storage.setItem("unrelated:key", "preserve me")
    const seed = createSeed()
    commitWorkspace(storage, markReady(seed), seed.revision)
    expect(resetWorkspace(storage)).toEqual(seed)
    expect(storage.getItem("unrelated:key")).toBe("preserve me")
    expect(loadWorkspace(storage).state).toEqual(seed)
  })

  it("D13 explicit keep-working resolution rebases text and preserves external snapshots", () => {
    const storage = new MemoryStorage()
    const local = new WorkspaceSession(storage)
    const remote = new WorkspaceSession(storage)
    local.beginEdit()
    local.changeWorking({ questions: "Local work to preserve?" })
    remote.beginEdit()
    remote.changeWorking({ questions: "External saved question?" })
    expect(remote.save()).toBe(true)
    const external = getCurrent(remote.getSnapshot().state)
    local.receiveExternal()
    expect(local.save()).toBe(false)
    local.keepWorking()
    expect(local.getSnapshot().working?.questions).toBe(
      "Local work to preserve?"
    )
    expect(local.save()).toBe(true)
    const saved = loadWorkspace(storage).state
    expect(saved.versions.find((v) => v.id === external.id)).toEqual(external)
    expect(saved.versions).toHaveLength(4)
    expect(getCurrent(saved).content.questions).toBe("Local work to preserve?")
    expect(getCurrent(saved).status).toBe("draft")
  })
})

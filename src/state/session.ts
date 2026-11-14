import {
  createSeed,
  getCurrent,
  contentEquals,
  contentValid,
  saveContent,
  markReady,
  canMarkReady,
  restoreMandate,
  revisedSummary,
  type Workspace,
  type BriefContent,
} from "../domain/model"
import {
  loadWorkspace,
  commitWorkspace,
  resetWorkspace,
  type StorageLike,
  type Recovery,
} from "./persistence"

export interface SessionView {
  state: Workspace
  working: BriefContent | null
  dirty: boolean
  error: string | null
  conflict: boolean
  recovery: Recovery
  persistence: "persistent" | "memory"
}

/** Synchronous, injected persistence keeps failures deterministic and avoids stale save callbacks. */
export class WorkspaceSession {
  private storage: StorageLike
  private listeners = new Set<() => void>()
  private failSave = false
  private view: SessionView

  constructor(storage: StorageLike) {
    this.storage = storage
    const loaded = loadWorkspace(storage)
    this.view = {
      ...loaded,
      working: null,
      dirty: false,
      error: null,
      conflict: false,
      persistence: "persistent",
    }
  }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private publish(patch: Partial<SessionView>) {
    this.view = { ...this.view, ...patch }
    for (const listener of this.listeners) listener()
  }
  private allowed(): boolean {
    if (this.view.recovery !== "none" && this.view.persistence !== "memory") {
      this.publish({ error: "recovery-required" })
      return false
    }
    if (this.view.conflict) {
      this.publish({ error: "conflict" })
      return false
    }
    return true
  }
  private commit(next: Workspace): boolean {
    if (!this.allowed()) return false
    if (next === this.view.state) return true
    if (this.view.persistence === "memory") {
      this.publish({ state: next, error: null })
      return true
    }
    const result = commitWorkspace(this.storage, next, this.view.state.revision)
    if (!result.ok) {
      this.publish({
        error: result.error ?? "save-failed",
        conflict: result.error === "conflict",
      })
      return false
    }
    this.publish({ state: next, error: null, conflict: false })
    return true
  }

  beginEdit = () => {
    if (this.view.working) return
    this.publish({
      working: { ...getCurrent(this.view.state).content },
      dirty: false,
      error: null,
    })
  }
  changeWorking = (patch: Partial<BriefContent>) => {
    const working = {
      ...(this.view.working ?? getCurrent(this.view.state).content),
      ...patch,
    }
    this.publish({
      working,
      dirty: !contentEquals(working, getCurrent(this.view.state).content),
      error: this.view.conflict ? "conflict" : null,
    })
  }
  cancelEdit = () => {
    this.publish({
      working: null,
      dirty: false,
      error: this.view.conflict ? "conflict" : null,
    })
  }

  save = (): boolean => {
    if (!this.allowed()) return false
    const working = this.view.working
    if (!working) return true
    if (!contentValid(working)) {
      this.publish({ error: "validation" })
      return false
    }
    if (!this.view.dirty) {
      this.publish({ working: null, dirty: false, error: null })
      return true
    }
    if (this.failSave) {
      this.failSave = false
      this.publish({ error: "save-failed" })
      return false
    }
    const next = saveContent(this.view.state, working)
    if (!this.commit(next)) return false
    this.publish({ working: null, dirty: false, error: null })
    return true
  }
  retry = () => this.save()
  ready = (): boolean => {
    if (!this.allowed()) return false
    if (this.view.dirty || this.view.error) {
      return false
    }
    if (!canMarkReady(this.view.state).allowed) {
      this.publish({ error: "alignment" })
      return false
    }
    return this.commit(markReady(this.view.state))
  }
  restore = (sourceId: string): boolean => {
    if (!this.allowed() || this.view.dirty) return false
    const next = restoreMandate(this.view.state, sourceId)
    if (
      next === this.view.state &&
      !this.view.state.versions.some(
        (version) =>
          version.id === sourceId && version.status === "earlier-approved"
      )
    )
      return false
    if (!this.commit(next)) return false
    this.publish({ working: null, dirty: false, error: null })
    return true
  }
  updateToRevisedMandate = () => {
    this.beginEdit()
    this.changeWorking({
      summary: revisedSummary,
      alignment: "integration",
      documentHtml: undefined,
    })
  }
  reloadExternal = () => {
    const loaded = loadWorkspace(this.storage)
    this.publish({
      ...loaded,
      working: null,
      dirty: false,
      error: null,
      conflict: false,
    })
  }
  /** Explicit conflict choice preserves local text and external history; Save still creates a draft. */
  keepWorking = () => {
    const loaded = loadWorkspace(this.storage)
    if (loaded.recovery !== "none") {
      this.publish({ recovery: loaded.recovery, error: "recovery-required" })
      return
    }
    const working = this.view.working
      ? { ...this.view.working }
      : { ...getCurrent(this.view.state).content }
    this.publish({
      state: loaded.state,
      recovery: "none",
      working,
      dirty: !contentEquals(working, getCurrent(loaded.state).content),
      conflict: false,
      error: null,
    })
  }
  reset = (fallbackToMemory = false): boolean => {
    try {
      const state = resetWorkspace(this.storage)
      this.failSave = false
      this.publish({
        state,
        working: null,
        dirty: false,
        error: null,
        conflict: false,
        recovery: "none",
        persistence: "persistent",
      })
      return true
    } catch {
      if (fallbackToMemory) {
        this.failSave = false
        this.publish({
          state: createSeed(),
          working: null,
          dirty: false,
          error: null,
          conflict: false,
          recovery: "unavailable",
          persistence: "memory",
        })
        return true
      }
      this.publish({ error: "unavailable" })
      return false
    }
  }
  failNextSave = () => {
    this.failSave = true
  }
  continueInMemory = () => {
    this.publish({
      persistence: "memory",
      recovery: "none",
      conflict: false,
      error: null,
    })
  }
  receiveExternal = () => {
    if (this.view.persistence === "memory") return
    const loaded = loadWorkspace(this.storage)
    if (loaded.recovery !== "none") {
      this.publish({ recovery: loaded.recovery, error: "recovery-required" })
      return
    }
    if (loaded.state.revision === this.view.state.revision) return
    if (this.view.dirty) {
      this.publish({ conflict: true, error: "conflict" })
      return
    }
    this.publish({
      state: loaded.state,
      working: this.view.working
        ? { ...getCurrent(loaded.state).content }
        : null,
      dirty: false,
      error: null,
      conflict: false,
    })
  }
}

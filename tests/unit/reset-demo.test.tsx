import { afterEach, beforeAll, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { ResetSample } from "../../src/components/workspace/RecoveryNotice"
import {
  WorkspaceProvider,
  useWorkspace,
} from "../../src/state/WorkspaceProvider"
import {
  WorkspaceV2Provider,
  V2_PREFERENCES_KEY,
  useWorkspaceV2,
} from "../../src/state/WorkspaceV2Provider"
import { WorkspaceSession } from "../../src/state/session"
import { STORAGE_KEY } from "../../src/state/persistence"
import { getCurrent } from "../../src/domain/model"
import { getAssignmentChanges } from "../../src/domain/v2"

beforeAll(() => {
  window.matchMedia ??= vi.fn().mockImplementation((media: string) => ({
    matches: false,
    media,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})
afterEach(() => {
  cleanup()
  localStorage.clear()
})
it("confirms demo reset, restores records and notifications, and leaves unrelated browser data intact", async () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
  const initial = new WorkspaceSession(storage)
  initial.beginEdit()
  initial.changeWorking({ summary: "Saved advisor edits." })
  expect(initial.save()).toBe(true)
  localStorage.setItem(
    V2_PREFERENCES_KEY,
    JSON.stringify({
      schemaVersion: 1,
      includedIds: ["B"],
      acknowledgedChangeIds: [getAssignmentChanges()[0].id],
    })
  )
  localStorage.setItem("unrelated-browser-data", "keep me")
  const reset = vi.fn()
  function Controls() {
    const { state, working, dirty, session } = useWorkspace()
    const preferences = useWorkspaceV2()
    return (
      <>
        <output aria-label="state">
          {getCurrent(state).id}|{preferences.includedIds.join(",")}|
          {preferences.acknowledgedChangeIds.length}|
          {working ? "editing" : "idle"}|{String(dirty)}
        </output>
        <button
          onClick={() => {
            session.beginEdit()
            session.changeWorking({ summary: "Unsaved advisor edits." })
          }}
        >
          Make unsaved edit
        </button>
        <ResetSample demo onReset={reset} />
      </>
    )
  }
  render(
    <WorkspaceProvider storage={storage}>
      <WorkspaceV2Provider>
        <Controls />
      </WorkspaceV2Provider>
    </WorkspaceProvider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Make unsaved edit" }))
  const before = screen.getByLabelText("state").textContent
  fireEvent.click(
    screen.getByRole("button", { name: "Reset demo", exact: true })
  )
  let dialog = await screen.findByRole("dialog", {
    name: "Reset demo?",
    exact: true,
  })
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Cancel", exact: true })
  )
  await waitFor(() => expect(dialog).not.toBeInTheDocument())
  expect(screen.getByLabelText("state").textContent).toBe(before)
  expect(reset).not.toHaveBeenCalled()
  fireEvent.click(
    screen.getByRole("button", { name: "Reset demo", exact: true })
  )
  dialog = await screen.findByRole("dialog", {
    name: "Reset demo?",
    exact: true,
  })
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Reset demo", exact: true })
  )
  expect(screen.getByLabelText("state")).toHaveTextContent(
    "V2|A,B,C|0|idle|false"
  )
  expect(storage.getItem(STORAGE_KEY)).toBeNull()
  expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBeNull()
  expect(localStorage.getItem("unrelated-browser-data")).toBe("keep me")
  expect(reset).toHaveBeenCalledOnce()
})

it("starts a fresh in-memory demo when browser storage cannot be cleared", () => {
  const unavailable = () => {
    throw new Error("Storage blocked")
  }
  const session = new WorkspaceSession({
    getItem: unavailable,
    setItem: unavailable,
    removeItem: unavailable,
  })
  session.continueInMemory()
  session.beginEdit()
  session.changeWorking({ summary: "Unsaved previous session" })
  expect(session.reset(true)).toBe(true)
  const view = session.getSnapshot()
  expect(view.state.currentId).toBe("V2")
  expect(view.state.versions).toHaveLength(2)
  expect(view.working).toBeNull()
  expect(view.dirty).toBe(false)
  expect(view.persistence).toBe("memory")
})

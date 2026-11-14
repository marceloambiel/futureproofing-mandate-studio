import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import {
  act,
  fireEvent,
  cleanup,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { AssignmentComplete } from "../../src/features/AssignmentComplete"
import { Discussion } from "../../src/features/Discussion"
import { WorkspaceProvider } from "../../src/state/WorkspaceProvider"
import { WorkspaceV2Provider } from "../../src/state/WorkspaceV2Provider"

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
function mount(saved = storage(), scenario = "") {
  const router = createMemoryRouter(
    [
      { path: "/workspace/completed", element: <AssignmentComplete /> },
      { path: "/workspace/discussion", element: <Discussion /> },
      { path: "/workspace/candidates", element: <h1>Candidate list</h1> },
    ],
    { initialEntries: [`/workspace/discussion${scenario}`] }
  )
  return {
    ...render(
      <WorkspaceProvider storage={saved}>
        <WorkspaceV2Provider>
          <RouterProvider router={router} />
        </WorkspaceV2Provider>
      </WorkspaceProvider>
    ),
    saved,
    router,
  }
}
function addNote(text: string) {
  const editor = screen.getByRole("textbox", {
    name: "Discussion brief document",
    exact: true,
  })
  editor.insertAdjacentHTML("beforeend", `<p>${text}</p>`)
  fireEvent.input(editor)
  return editor
}

describe("inline discussion editor", () => {
  it("edits, saves and reloads the whole document, including formatting and new notes", async () => {
    const first = mount()
    const editor = screen.getByRole("textbox", {
      name: "Discussion brief document",
      exact: true,
    })
    expect(screen.getByRole("combobox", { name: "Font size" })).toBeVisible()
    expect(screen.queryByText("Arial", { exact: true })).not.toBeInTheDocument()
    const note = screen.getByRole("complementary", {
      name: "AI-generated brief",
    })
    expect(note).toHaveTextContent("latest client brief")
    expect(
      within(note).queryByRole("button", {
        name: "Send for review",
        exact: true,
      })
    ).not.toBeInTheDocument()
    expect(
      editor.querySelectorAll('[data-brief-section="questions"] li')
    ).toHaveLength(7)
    editor.querySelector("h1")!.innerHTML = "<i>Edited client discussion</i>"
    addNote("Advisor note: confirm interview dates.")
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes")
    fireEvent.click(
      screen.getByRole("button", { name: "Save changes", exact: true })
    )
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
    first.unmount()
    mount(first.saved)
    expect(screen.getByRole("textbox")).toHaveTextContent(
      "Advisor note: confirm interview dates."
    )
    expect(screen.getByRole("textbox").querySelector("h1 i")).toHaveTextContent(
      "Edited client discussion"
    )
    fireEvent.click(
      screen.getByRole("button", { name: "View past versions", exact: true })
    )
    const history = await screen.findByRole("dialog", {
      name: "Discussion brief versions",
      exact: true,
    })
    expect(
      within(history).getByRole("button", { name: /Version 3/ })
    ).toBeVisible()
    fireEvent.click(within(history).getByRole("button", { name: /Version 2/ }))
    expect(
      within(history).getByRole("heading", {
        name: "Northline Integration Search",
      })
    ).toBeVisible()
  })
  it("retains unsaved text on blocked navigation and discards only when requested", async () => {
    const { router } = mount()
    addNote("Keep this unsaved note.")
    await act(async () => {
      await router.navigate("/workspace/candidates")
    })
    const guard = await screen.findByRole("dialog", {
      name: "Discard unsaved changes?",
      exact: true,
    })
    fireEvent.click(
      within(guard).getByRole("button", { name: "Keep editing", exact: true })
    )
    expect(screen.getByRole("textbox")).toHaveTextContent(
      "Keep this unsaved note."
    )
    await act(async () => {
      await router.navigate("/workspace/candidates")
    })
    const next = await screen.findByRole("dialog", {
      name: "Discard unsaved changes?",
      exact: true,
    })
    fireEvent.click(
      within(next).getByRole("button", { name: "Discard changes", exact: true })
    )
    expect(
      await screen.findByRole("heading", { name: "Candidate list" })
    ).toBeVisible()
  })
  it("keeps document edits through a failed save and confirms an immutable review version", async () => {
    mount(storage(), "?scenario=save-failure")
    addNote("Retain this note through a failed save.")
    fireEvent.click(
      screen.getByRole("button", { name: "Save changes", exact: true })
    )
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your changes are still here"
    )
    expect(screen.getByRole("textbox")).toHaveTextContent(
      "Retain this note through a failed save."
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Retry save", exact: true })
    )
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
    const toolbar = screen.getByRole("toolbar", { name: "Document formatting" })
    expect(
      within(toolbar).getByRole("button", {
        name: "View past versions",
        exact: true,
      })
    ).toBeVisible()
    expect(
      within(toolbar).getByRole("button", { name: "Save changes", exact: true })
    ).toBeVisible()
    fireEvent.focus(screen.getByRole("textbox"))
    fireEvent.click(
      screen.getByRole("button", { name: "Send for review", exact: true })
    )
    let confirmation = await screen.findByRole("dialog", {
      name: "Send for review?",
      exact: true,
    })
    fireEvent.click(
      within(confirmation).getByRole("button", { name: "Cancel", exact: true })
    )
    await waitFor(() => expect(confirmation).not.toBeInTheDocument())
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "contenteditable",
      "true"
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Send for review", exact: true })
    )
    confirmation = await screen.findByRole("dialog", {
      name: "Send for review?",
      exact: true,
    })
    fireEvent.click(
      within(confirmation).getByRole("button", {
        name: "Send for review",
        exact: true,
      })
    )
    await waitFor(() => expect(confirmation).not.toBeInTheDocument())
    expect(
      await screen.findByRole("heading", {
        name: "Assignment completed",
        exact: true,
      })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole("link", { name: "View submitted assignment" })
    )
    await screen.findByRole("textbox", { name: "Discussion brief document" })
    const submittedToolbar = screen.getByRole("toolbar", {
      name: "Document formatting",
    })
    expect(screen.getByRole("status")).toHaveTextContent("Sent for review")
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "contenteditable",
      "false"
    )
    expect(
      screen.getByRole("button", { name: "Bold", exact: true })
    ).toBeDisabled()
    expect(screen.getByRole("combobox", { name: "Font size" })).toBeDisabled()
    fireEvent.click(
      within(submittedToolbar).getByRole("button", {
        name: "Edit as new draft",
        exact: true,
      })
    )
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "contenteditable",
      "true"
    )
    addNote("A further edit in a new draft.")
    fireEvent.click(
      within(submittedToolbar).getByRole("button", {
        name: "Save changes",
        exact: true,
      })
    )
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
  })
})

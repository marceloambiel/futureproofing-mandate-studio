import { beforeAll, afterEach, describe, expect, it, vi } from "vitest"
import { Fragment, type ComponentType, type ReactNode } from "react"
import {
  render,
  screen,
  within,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { MemoryRouter } from "react-router-dom"
import { WorkspaceProvider } from "../../src/state/WorkspaceProvider"
import { AssignmentFlowProvider } from "../../src/state/AssignmentFlowProvider"
import { Candidates } from "../../src/features/Candidates"

type ProviderModule = {
  WorkspaceV2Provider: ComponentType<{ children: ReactNode }>
  useWorkspaceV2: () => {
    includedIds: string[]
    acknowledgedChangeIds: string[]
    persistence: string
    setIncluded: (id: "A" | "B" | "C", included: boolean) => void
    acknowledgeChange: (id: string) => void
  }
}
let actualChangeId = ""
let preferences: ProviderModule | undefined
let PreferenceProvider: ComponentType<{ children: ReactNode }> = Fragment
beforeAll(async () => {
  const loader = Object.values(
    import.meta.glob("../../src/state/WorkspaceV2Provider.tsx")
  )[0]
  if (loader) {
    preferences = (await loader()) as ProviderModule
    PreferenceProvider = preferences.WorkspaceV2Provider
  }
  const domainLoader = Object.values(
    import.meta.glob("../../src/domain/v2.ts")
  )[0]
  if (domainLoader) {
    const domain = (await domainLoader()) as {
      getAssignmentChanges: () => { id: string }[]
    }
    actualChangeId = domain.getAssignmentChanges()[0].id
  }
  window.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  Element.prototype.scrollIntoView = vi.fn()
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver ??= class {
    root = null
    rootMargin = "0px"
    thresholds = [0]
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
})
afterEach(() => {
  cleanup()
  localStorage.clear()
})
function renderCandidates() {
  return render(
    <MemoryRouter initialEntries={["/workspace/candidates"]}>
      <WorkspaceProvider>
        <PreferenceProvider>
          <AssignmentFlowProvider>
            <Candidates />
          </AssignmentFlowProvider>
        </PreferenceProvider>
      </WorkspaceProvider>
    </MemoryRouter>
  )
}

describe("v2 rendered React interactions", () => {
  it("harness control renders all original candidates and supplied constraints", () => {
    renderCandidates()
    expect(
      screen.getByRole("heading", { name: "Candidate comparison", exact: true })
    ).toBeVisible()
    expect(
      screen.getByRole("button", {
        name: "View full profile for Claire Bennett",
        exact: true,
      })
    ).toBeVisible()
  })
  it("opens a full database profile with contact details and tab navigation", async () => {
    renderCandidates()
    fireEvent.click(
      screen.getByRole("button", {
        name: "View full profile for Claire Bennett",
        exact: true,
      })
    )
    const panel = await screen.findByRole("dialog", {
      name: "Claire Bennett",
      exact: true,
    })
    expect(
      within(panel).getByRole("tab", { name: "Experience", exact: true })
    ).toHaveAttribute("aria-selected", "true")
    expect(
      within(panel).queryByRole("tab", { name: "Overview", exact: true })
    ).not.toBeInTheDocument()
    expect(
      within(panel).getByRole("link", { name: "claire.bennett@example.com" })
    ).toBeVisible()
    fireEvent.click(
      within(panel).getByRole("tab", { name: "Education", exact: true })
    )
    expect(
      within(panel).getByRole("tab", { name: "Education", exact: true })
    ).toHaveAttribute("aria-selected", "true")
    expect(within(panel).getByText("BSc, Business Management")).toBeVisible()
    expect(
      within(panel).getByRole("heading", {
        name: "Westhaven University",
        exact: true,
      })
    ).toBeVisible()
  })
  it("keeps a candidate until removal is confirmed and lets cancelled removal keep selection", async () => {
    renderCandidates()
    const remove = screen.getByRole("button", {
      name: "Remove Claire Bennett from selection",
      exact: true,
    })
    const card = screen.getByRole("button", {
      name: "View full profile for Claire Bennett",
      exact: true,
    })
    fireEvent.click(remove)
    const dialog = await screen.findByRole("dialog", {
      name: "Remove Claire Bennett?",
      exact: true,
    })
    expect(card).toBeInTheDocument()
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Cancel", exact: true })
    )
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(card).toBeInTheDocument()
    fireEvent.click(remove)
    const confirmation = await screen.findByRole("dialog", {
      name: "Remove Claire Bennett?",
      exact: true,
    })
    fireEvent.click(
      within(confirmation).getByRole("button", {
        name: "Remove candidate",
        exact: true,
      })
    )
    expect(
      screen.queryByRole("button", {
        name: "View full profile for Claire Bennett",
        exact: true,
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Claire Bennett", exact: true })
    ).not.toBeInTheDocument()
  })
  it("V237 preference provider restores membership and persists only explicit acknowledgement", async () => {
    expect(preferences?.WorkspaceV2Provider).toBeTypeOf("function")
    const usePreferences = preferences!.useWorkspaceV2
    function Controls() {
      const state = usePreferences()
      return (
        <>
          <output aria-label="included">{state.includedIds.join(",")}</output>
          <output aria-label="acknowledged">
            {state.acknowledgedChangeIds.join(",")}
          </output>
          <button onClick={() => state.setIncluded("A", false)}>
            Remove A
          </button>
          <button onClick={() => state.setIncluded("A", true)}>Add A</button>
          <button onClick={() => state.acknowledgeChange(actualChangeId)}>
            Acknowledge
          </button>
        </>
      )
    }
    const view = render(
      <PreferenceProvider>
        <Controls />
      </PreferenceProvider>
    )
    expect(screen.getByLabelText("included")).toHaveTextContent("A,B,C")
    expect(screen.getByLabelText("acknowledged")).toHaveTextContent("")
    fireEvent.click(
      screen.getByRole("button", { name: "Remove A", exact: true })
    )
    expect(screen.getByLabelText("included")).toHaveTextContent("B,C")
    fireEvent.click(screen.getByRole("button", { name: "Add A", exact: true }))
    expect(screen.getByLabelText("included")).toHaveTextContent(/A/)
    fireEvent.click(
      screen.getByRole("button", { name: "Acknowledge", exact: true })
    )
    view.unmount()
    render(
      <PreferenceProvider>
        <Controls />
      </PreferenceProvider>
    )
    expect(screen.getByLabelText("acknowledged")).toHaveTextContent(
      actualChangeId
    )
    expect(screen.getByLabelText("included")).toHaveTextContent(/A/)
  })
})

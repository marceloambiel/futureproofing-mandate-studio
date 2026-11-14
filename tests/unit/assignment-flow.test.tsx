import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { AssignmentLayout } from "../../src/features/AssignmentLayout"
import { useAssignmentFlow } from "../../src/state/AssignmentFlowProvider"
import { WorkspaceProvider } from "../../src/state/WorkspaceProvider"
import {
  WorkspaceV2Provider,
  useWorkspaceV2,
  V2_PREFERENCES_KEY,
} from "../../src/state/WorkspaceV2Provider"
import { generationDuration } from "../../src/domain/assignment-flow"

beforeAll(() => {
  window.matchMedia ??= vi.fn().mockImplementation((media: string) => ({
    matches: false,
    media,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  HTMLElement.prototype.scrollIntoView ??= vi.fn()
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.useRealTimers()
})
function Overview() {
  const flow = useAssignmentFlow()
  return <button onClick={flow.generateCandidates}>Generate candidates</button>
}
function Candidates() {
  const flow = useAssignmentFlow()
  return (
    <>
      <h2 data-step-result-heading tabIndex={-1}>
        Candidate results
      </h2>
      <button onClick={flow.generateDiscussion}>
        Generate discussion brief
      </button>
    </>
  )
}
function Reset() {
  const { reset } = useWorkspaceV2()
  return <button onClick={reset}>Reset flow</button>
}
function mount(path = "/workspace/assignment") {
  const router = createMemoryRouter(
    [
      {
        element: <AssignmentLayout />,
        children: [
          { path: "/workspace/assignment", element: <Overview /> },
          { path: "/workspace/candidates", element: <Candidates /> },
          {
            path: "/workspace/discussion",
            element: (
              <h2 data-step-result-heading tabIndex={-1}>
                Editable discussion document
              </h2>
            ),
          },
        ],
      },
    ],
    { initialEntries: [path] }
  )
  return {
    ...render(
      <WorkspaceProvider>
        <WorkspaceV2Provider>
          <Reset />
          <RouterProvider router={router} />
        </WorkspaceV2Provider>
      </WorkspaceProvider>
    ),
    router,
  }
}

describe("assignment steps experiment", () => {
  it("requires brief approval and candidate review, shows both skeletons, and persists progress", async () => {
    vi.useFakeTimers()
    const view = mount()
    const steps = screen.getByRole("navigation", { name: "Assignment steps" })
    expect(
      within(steps).getByRole("button", { name: /Candidates/ })
    ).toBeDisabled()
    expect(
      within(steps).getByRole("button", { name: /Discussion Brief/ })
    ).toBeDisabled()
    fireEvent.click(
      screen.getByRole("button", { name: "Generate candidates", exact: true })
    )
    expect(
      screen.getByRole("region", { name: "Generating candidates" })
    ).toHaveAttribute("aria-busy", "true")
    expect(document.querySelectorAll(".generation-candidate")).toHaveLength(3)
    expect(
      screen.queryByRole("heading", { name: "Candidate results" })
    ).not.toBeInTheDocument()
    await act(async () => vi.advanceTimersByTime(generationDuration.candidates))
    expect(
      screen.getByRole("heading", { name: "Candidate results" })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole("button", {
        name: "Generate discussion brief",
        exact: true,
      })
    )
    expect(
      screen.getByRole("region", { name: "Generating discussion brief" })
    ).toHaveAttribute("aria-busy", "true")
    expect(
      screen.queryByRole("heading", { name: "Editable discussion document" })
    ).not.toBeInTheDocument()
    await act(async () => vi.advanceTimersByTime(generationDuration.discussion))
    expect(
      screen.getByRole("heading", { name: "Editable discussion document" })
    ).toBeVisible()
    expect(
      JSON.parse(localStorage.getItem(V2_PREFERENCES_KEY)!).assignmentProgress
        .stage
    ).toBe("discussion")
    view.unmount()
    mount("/workspace/discussion")
    expect(
      screen.getByRole("heading", { name: "Editable discussion document" })
    ).toBeVisible()
  })
  it("resumes an interrupted search and cancels generation when the demo is reset", async () => {
    vi.useFakeTimers()
    const view = mount()
    fireEvent.click(
      screen.getByRole("button", { name: "Generate candidates", exact: true })
    )
    view.unmount()
    mount("/workspace/candidates")
    expect(
      screen.getByRole("region", { name: "Generating candidates" })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole("button", { name: "Reset flow", exact: true })
    )
    expect(
      screen.getByRole("button", { name: "Generate candidates", exact: true })
    ).toBeVisible()
    await act(async () =>
      vi.advanceTimersByTime(generationDuration.candidates + 100)
    )
    expect(
      screen.queryByRole("heading", { name: "Candidate results" })
    ).not.toBeInTheDocument()
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBeNull()
  })
  it("redirects a direct link to the discussion to the first incomplete step", async () => {
    const view = mount("/workspace/discussion")
    expect(
      await screen.findByRole("button", {
        name: "Generate candidates",
        exact: true,
      })
    ).toBeVisible()
    expect(view.router.state.location.pathname).toBe("/workspace/assignment")
  })
})

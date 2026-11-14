import { afterEach, describe, expect, it } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { AssignmentDetails } from "../../src/features/AssignmentDetails"
import {
  WorkspaceV2Provider,
  V2_PREFERENCES_KEY,
  useWorkspaceV2,
} from "../../src/state/WorkspaceV2Provider"
import { clientBriefDocuments } from "../../src/domain/v2"
import { contentEquals, getCurrent, createSeed } from "../../src/domain/model"

afterEach(() => {
  cleanup()
  localStorage.clear()
})
function State() {
  const state = useWorkspaceV2()
  return (
    <output aria-label="Review state">
      {state.assignmentProgress?.stage}:
      {String(state.assignmentDetails?.requiresReview)}
    </output>
  )
}
function mount() {
  return render(
    <WorkspaceV2Provider>
      <AssignmentDetails />
      <State />
    </WorkspaceV2Provider>
  )
}
describe("assignment detail review", () => {
  it("preserves the shortlist and version history while edits and restores invalidate prior workflow approval", async () => {
    localStorage.setItem(
      V2_PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 1,
        includedIds: ["A", "C"],
        acknowledgedChangeIds: [],
        assignmentProgress: {
          briefVersion: clientBriefDocuments[0].version,
          stage: "discussion",
        },
      })
    )
    const view = mount()
    fireEvent.click(
      screen.getByRole("button", { name: "Edit company", exact: true })
    )
    let dialog = await screen.findByRole("dialog", {
      name: "Edit company",
      exact: true,
    })
    fireEvent.change(
      within(dialog).getByLabelText("Company", { exact: true }),
      { target: { value: "Updated Northline" } }
    )
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save and require review" })
    )
    expect(screen.getByLabelText("Review state")).toHaveTextContent(
      "overview:true"
    )
    const saved = JSON.parse(localStorage.getItem(V2_PREFERENCES_KEY)!)
    expect(saved.includedIds).toEqual(["A", "C"])
    expect(saved.assignmentDetails.sections.company).toHaveLength(2)
    expect(saved.assignmentDetails.sections.company[1].values.company).toBe(
      "Northline Services Group"
    )
    view.unmount()
    mount()
    expect(screen.getByText("Updated Northline", { exact: true })).toBeVisible()
    fireEvent.click(
      screen.getByRole("button", { name: "Edit company", exact: true })
    )
    dialog = await screen.findByRole("dialog", {
      name: "Edit company",
      exact: true,
    })
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Restore source details" })
    )
    expect(
      within(dialog).getByLabelText("Company", { exact: true })
    ).toHaveValue("Northline Services Group")
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Restore and require review" })
    )
    const restored = JSON.parse(localStorage.getItem(V2_PREFERENCES_KEY)!)
    expect(restored.assignmentDetails.revision).toBe(2)
    expect(restored.assignmentDetails.requiresReview).toBe(true)
    expect(restored.assignmentDetails.sections.company).toHaveLength(3)
    expect(restored.assignmentDetails.sections.company[0].kind).toBe("restore")
  })
  it("requires a new draft when otherwise-identical content is reviewed against newer assignment details", () => {
    const original = getCurrent(createSeed()).content
    expect(
      contentEquals(original, { ...original, assignmentDetailsRevision: 0 })
    ).toBe(true)
    expect(
      contentEquals(original, { ...original, assignmentDetailsRevision: 1 })
    ).toBe(false)
  })
})

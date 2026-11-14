import { chromium } from "@playwright/test"
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
})
const p = await context.newPage()
const base = "http://127.0.0.1:5173"
const out = "docs/run/mandate-studio-v1/evidence/screenshots"
const snap = async (name) => {
  await p.screenshot({
    path: `${out}/${name}.png`,
    fullPage: false,
    animations: "disabled",
  })
  console.log(name)
}
await p.goto(base + "/workspace/discussion?scenario=save-failure")
await p
  .getByRole("button", { name: "Edit discussion brief", exact: true })
  .click()
await p
  .getByLabel("Next questions", { exact: true })
  .fill(
    "Candidate A: What responsibility have you held for integrating acquired businesses?\nCandidate B: How many locations did you oversee?\nCandidate C: What integration work did you personally lead, and is an earlier start possible?"
  )
await p.getByRole("button", { name: "Save changes", exact: true }).click()
await snap("failed-save-retry")
await p.getByRole("button", { name: "Retry save", exact: true }).click()
await p
  .getByRole("button", { name: "Mark ready for review", exact: true })
  .click()
await p
  .getByRole("button", { name: "Edit discussion brief", exact: true })
  .click()
await p
  .getByLabel("Meeting opening", { exact: true })
  .fill(
    "The board now prioritizes integrating two acquisitions. Clarify responsibility across twelve locations and a start within sixty days."
  )
await p.getByRole("button", { name: "Save changes", exact: true }).click()
await snap("edited-after-ready")
await p
  .getByRole("button", { name: "Edit discussion brief", exact: true })
  .click()
await p.getByLabel("Meeting opening", { exact: true }).fill(" ")
await p.getByRole("button", { name: "Save changes", exact: true }).click()
await snap("required-content-error")
await p.getByRole("button", { name: "Cancel", exact: true }).click()
await snap("unsaved-changes-guard")
await p.getByRole("button", { name: "Discard changes", exact: true }).click()
await p.evaluate(() => localStorage.setItem("mandate-studio:v1", "{corrupt"))
await p.reload()
await snap("storage-recovery")
await p.goto(base + "/workspace/candidates?candidate=missing")
await snap("invalid-candidate")
await context.close()
const denied = await browser.newContext({
  viewport: { width: 390, height: 844 },
})
const d = await denied.newPage()
await d.addInitScript(() => {
  const original = Storage.prototype.getItem
  Storage.prototype.getItem = function (k) {
    if (k === "mandate-studio:v1")
      throw new DOMException("Denied", "SecurityError")
    return original.call(this, k)
  }
})
await d.goto(base + "/workspace/discussion")
await d.screenshot({
  path: `${out}/storage-unavailable-mobile.png`,
  fullPage: true,
  animations: "disabled",
})
console.log("storage-unavailable-mobile")
await browser.close()

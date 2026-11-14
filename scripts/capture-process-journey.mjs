import { chromium, expect } from "@playwright/test"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
const directory = "public/process/journey"
await mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const manifest = {
  capturedAt: new Date().toISOString(),
  baseURL: "http://127.0.0.1:5173",
  head: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  source: "current working tree including pre-existing uncommitted refinements",
  browser: await browser.version(),
  motion: "reduced (stable final UI captures)",
  captures: [],
  checks: [],
}
const contexts = []
async function context(width, height) {
  const c = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  })
  contexts.push(c)
  return c
}
async function ready(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.locator("main").waitFor()
  await page.waitForTimeout(180)
}
async function shot(page, name, target = page) {
  await ready(page)
  const path = `${directory}/${name}.jpg`
  await target.screenshot({
    path,
    type: "jpeg",
    quality: 88,
    animations: "disabled",
  })
  const bytes = await readFile(path)
  manifest.captures.push({
    file: path,
    url: page.url(),
    viewport: page.viewportSize(),
    sha256: createHash("sha256").update(bytes).digest("hex"),
  })
  console.log(`Captured ${name}`)
}
async function closeOverlays(page) {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(100)
}
try {
  const web = await context(1440, 1000),
    marketing = await web.newPage()
  await marketing.goto(`${manifest.baseURL}/`)
  await shot(marketing, "website-desktop", marketing.locator(".mandate-hero"))
  await marketing.locator("#challenges").scrollIntoViewIfNeeded()
  await shot(marketing, "website-challenges", marketing.locator("#challenges"))
  await marketing.locator(".product-feature").first().scrollIntoViewIfNeeded()
  await shot(
    marketing,
    "website-product",
    marketing.locator(".product-feature").first()
  )
  await marketing.locator(".demo-preview-container").scrollIntoViewIfNeeded()
  await marketing.frameLocator("iframe").locator(".bento-task-list").waitFor()
  await shot(
    marketing,
    "embedded-demo",
    marketing.locator(".demo-preview-container")
  )
  const app = await context(1440, 1000),
    page = await app.newPage()
  await page.goto(`${manifest.baseURL}/workspace`)
  await expect(
    page.getByRole("status").filter({
      has: page.getByRole("heading", {
        name: "Northline Integration Search",
        exact: true,
      }),
    })
  ).toBeVisible()
  await shot(page, "dashboard-notification")
  await page
    .getByRole("link", {
      name: "Review Northline Integration Search update",
      exact: true,
    })
    .click()
  await expect(
    page.getByRole("heading", { name: "Client Brief", exact: true })
  ).toBeVisible()
  const toast = page.getByRole("button", {
    name: "Dismiss mandate update",
    exact: true,
  })
  if (await toast.isVisible()) await toast.click()
  await shot(page, "assignment-desktop")
  await page
    .getByRole("button", { name: "View past versions", exact: true })
    .click()
  await expect(
    page.getByRole("dialog", { name: "Client brief versions", exact: true })
  ).toBeVisible()
  await shot(page, "client-brief-versions")
  await page.getByRole("button", { name: /Read original brief/ }).click()
  await shot(page, "original-client-brief")
  await closeOverlays(page)
  await page.getByRole("button", { name: "Edit search", exact: true }).click()
  await shot(page, "edit-requirements")
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  await page
    .getByRole("button", { name: "Match candidates to brief", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Included profiles", exact: true })
  ).toBeVisible({ timeout: 10000 })
  await shot(page, "candidates-desktop")
  await page
    .getByRole("button", {
      name: "View full profile: Marcus Reed",
      exact: true,
    })
    .click()
  await expect(
    page.getByRole("dialog", { name: "Marcus Reed", exact: true })
  ).toBeVisible()
  await shot(page, "candidate-profile")
  await closeOverlays(page)
  await page
    .getByRole("button", {
      name: "Remove Claire Bennett from selection",
      exact: true,
    })
    .click()
  await page
    .getByRole("button", { name: "Remove candidate", exact: true })
    .click()
  await expect(page.locator(".candidate-overview-card")).toHaveCount(2)
  await page
    .getByRole("button", { name: "Add candidates", exact: true })
    .click()
  await shot(page, "add-candidate")
  await page
    .getByRole("button", {
      name: "Add Claire Bennett to selection",
      exact: true,
    })
    .click()
  await closeOverlays(page)
  await expect(page.locator(".candidate-overview-card")).toHaveCount(3)
  await page.locator("#candidate-comparison").scrollIntoViewIfNeeded()
  await shot(
    page,
    "comparison-desktop",
    page.locator(".v2-comparison-table-wrap")
  )
  manifest.checks.push(
    "Candidate removal and re-add performed through visible UI; three profiles restored."
  )
  await page
    .getByRole("button", { name: "Prepare Discussion Brief", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true })
  ).toBeVisible({ timeout: 10000 })
  await page.locator(".discussion-doc-editor[contenteditable=true]").waitFor()
  await shot(page, "discussion-editor-desktop")
  await page
    .locator(".discussion-doc-editor[contenteditable=true]")
    .press("ControlOrMeta+End")
  await page.keyboard.insertText(
    " Confirm integration ownership before the next client discussion."
  )
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page
    .getByRole("button", { name: "View past versions", exact: true })
    .click()
  await page
    .getByRole("button", { name: /Version 1.*Earlier approved/ })
    .click()
  await shot(page, "discussion-history")
  const discussionState = await app.storageState()
  await page
    .getByRole("button", {
      name: "Restore original mandate as a draft",
      exact: true,
    })
    .click()
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "restored mandate reflects geographic expansion" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Send for review", exact: true })
  ).toBeDisabled()
  await shot(page, "restored-draft-blocked")
  manifest.checks.push(
    "Restored historical expansion opening is a new draft; Send for review disabled in actual UI."
  )
  // Continue from the captured, edited integration draft in a separate isolated session.
  const reviewed = await browser.newContext({
    storageState: discussionState,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  })
  contexts.push(reviewed)
  const review = await reviewed.newPage()
  await review.goto(`${manifest.baseURL}/workspace/discussion`)
  await review
    .getByRole("button", { name: "Send for review", exact: true })
    .click()
  await shot(review, "review-confirmation")
  await review
    .getByRole("dialog", { name: "Send for review?", exact: true })
    .getByRole("button", { name: "Send for review", exact: true })
    .click()
  await expect(
    review.getByRole("heading", { name: "Assignment completed", exact: true })
  ).toBeVisible()
  await shot(review, "completed")
  await review.goto(`${manifest.baseURL}/workspace`)
  await expect(
    review.getByRole("status", { name: "Assignment sent for review" })
  ).toBeVisible()
  await expect(
    review.locator(".bento-task-list").getByRole("link", { name: /Northline/ })
  ).toHaveCount(0)
  await shot(review, "completed-dashboard")
  manifest.checks.push(
    "Submission reaches completion, then removes Northline from current assignments and displays local waiting-for-review summary."
  )
  const edited = await context(1440, 1000),
    edit = await edited.newPage()
  await edit.goto(`${manifest.baseURL}/workspace/assignment`)
  if (
    await edit
      .getByRole("button", { name: "Dismiss mandate update", exact: true })
      .isVisible()
  )
    await edit
      .getByRole("button", { name: "Dismiss mandate update", exact: true })
      .click()
  await edit.getByRole("button", { name: "Edit search", exact: true }).click()
  const priority = edit.getByRole("dialog").getByRole("textbox").first()
  await priority.fill(
    "Integrate two acquisitions into one operating model. Confirm integration ownership."
  )
  await edit
    .getByRole("button", { name: "Save and require review", exact: true })
    .click()
  await expect(
    edit.getByRole("status").filter({ hasText: "Fresh review required" })
  ).toBeVisible()
  await shot(edit, "fresh-review-required")
  manifest.checks.push(
    "Editing Search requires fresh review in the actual overview UI."
  )
  const mobile = await context(390, 844),
    phone = await mobile.newPage()
  await phone.goto(`${manifest.baseURL}/`)
  await shot(phone, "website-mobile", phone.locator(".mandate-hero"))
  await phone.goto(`${manifest.baseURL}/workspace`)
  await phone
    .getByRole("link", {
      name: "Review Northline Integration Search update",
      exact: true,
    })
    .waitFor()
  await shot(phone, "dashboard-mobile")
  await phone
    .getByRole("link", {
      name: "Review Northline Integration Search update",
      exact: true,
    })
    .click()
  if (
    await phone
      .getByRole("button", { name: "Dismiss mandate update", exact: true })
      .isVisible()
  )
    await phone
      .getByRole("button", { name: "Dismiss mandate update", exact: true })
      .click()
  await shot(phone, "assignment-mobile")
  await phone
    .getByRole("button", { name: "Match candidates to brief", exact: true })
    .click()
  await expect(
    phone.getByRole("heading", { name: "Included profiles", exact: true })
  ).toBeVisible({ timeout: 10000 })
  await shot(phone, "candidates-mobile")
  await phone.locator("#candidate-comparison").scrollIntoViewIfNeeded()
  await shot(phone, "comparison-mobile")
  await phone
    .getByRole("button", { name: "Prepare Discussion Brief", exact: true })
    .click()
  await phone
    .getByRole("button", { name: "Open discussion brief editor", exact: true })
    .waitFor({ timeout: 10000 })
  await phone
    .getByRole("button", { name: "Open discussion brief editor", exact: true })
    .click()
  await shot(phone, "discussion-editor-mobile")
  await phone.getByRole("button", { name: "Save changes", exact: true }).click()
  await expect(
    phone.getByRole("dialog", { name: "Discussion brief", exact: true })
  ).not.toBeVisible()
  manifest.checks.push(
    "Mobile save closes the full-screen discussion editor and returns to the assignment view."
  )
  await writeFile(
    "docs/process-journey/capture-manifest.json",
    JSON.stringify(manifest, null, 2) + "\n"
  )
} finally {
  for (const c of contexts) await c.close()
  await browser.close()
}

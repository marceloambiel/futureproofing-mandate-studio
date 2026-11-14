import { test, expect, type Page, type Locator } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

async function check(page: Page, label: string) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  await test.info().attach(label, {
    body: JSON.stringify(report.violations, null, 2),
    contentType: "application/json",
  })
  expect(report.violations, label).toEqual([])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    ),
    label + " overflow"
  ).toBe(true)
}
async function candidates(page: Page) {
  await page.goto("/workspace/assignment")
  await page
    .getByRole("button", { name: "Match candidates to brief", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Included profiles", exact: true })
  ).toBeVisible({ timeout: 10000 })
}
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 90; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return
    await page.keyboard.press("Tab")
  }
  throw Error("Keyboard did not reach target")
}
for (const width of [390, 1440]) {
  test(`current assignment workflow and all profile tabs pass AA checks at ${width}`, async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace")
    await check(page, "home")
    await page
      .locator(".bento-task-list")
      .getByRole("link", { name: /Northline Integration Search/ })
      .click()
    await check(page, "overview")
    await page
      .getByRole("button", { name: "Match candidates to brief", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Included profiles", exact: true })
    ).toBeVisible({ timeout: 10000 })
    await check(page, "candidates")
    const profile = page.getByRole("button", {
      name: "View full profile: Claire Bennett",
      exact: true,
    })
    await profile.click()
    const drawer = page.getByRole("dialog", {
      name: "Claire Bennett",
      exact: true,
    })
    for (const name of ["Experience", "Education", "Projects", "Skill Map"]) {
      await drawer.getByRole("tab", { name, exact: true }).click()
      await check(page, "profile-" + name)
    }
    await page.keyboard.press("Escape")
    await expect(profile).toBeFocused()
    const source = page.getByRole("button", {
      name: "Source: Claire Bennett, Acquisition integration",
      exact: true,
    })
    await source.click()
    await expect(drawer.locator("[data-comparison-focus=true]")).toBeFocused()
    const focus = await drawer
      .locator("[data-comparison-focus=true]")
      .boundingBox()
    const bounds = await drawer.boundingBox()
    expect(focus!.x + focus!.width).toBeLessThanOrEqual(
      bounds!.x + bounds!.width
    )
    await page.keyboard.press("Escape")
    await page
      .getByRole("button", {
        name: "Remove Claire Bennett from selection",
        exact: true,
      })
      .click()
    await check(page, "remove-confirmation")
    await page.getByRole("button", { name: "Cancel", exact: true }).click()
    await expect(
      page.getByRole("button", {
        name: "View full profile: Claire Bennett",
        exact: true,
      })
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Prepare Discussion Brief", exact: true })
      .click()
    if (width < 801)
      await expect(
        page.locator(".mobile-assignment-current-step")
      ).toContainText("Discussion Brief", { timeout: 10000 })
    else
      await expect(
        page.getByRole("heading", { name: "Discussion brief", exact: true })
      ).toBeVisible({ timeout: 10000 })
    if (width < 801)
      await page
        .getByRole("button", {
          name: "Open discussion brief editor",
          exact: true,
        })
        .click()
    await check(page, "discussion-editor")
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click()
    if (width < 801)
      await expect(
        page.getByRole("dialog", { name: "Discussion brief", exact: true })
      ).not.toBeVisible()
    await page
      .getByRole("button", { name: "Send for review", exact: true })
      .click()
    const confirm = page.getByRole("dialog", {
      name: "Send for review?",
      exact: true,
    })
    await check(page, "send-confirmation")
    await confirm
      .getByRole("button", { name: "Send for review", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Assignment completed", exact: true })
    ).toBeVisible()
    await check(page, "completed")
    await page.reload()
    await expect(
      page.getByRole("heading", { name: "Assignment completed", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Restart demo", exact: true })
    ).toBeVisible()
    await page.screenshot({
      path: `docs/qa/2026-11-13/completion/complete-${width}.png`,
    })
    await page
      .getByRole("link", { name: "View submitted assignment", exact: true })
      .click()
    await expect(page).toHaveURL(/\/workspace\/discussion$/)
    await page.goBack()
    await page
      .getByRole("link", { name: "Request a conversation", exact: true })
      .click()
    await expect(
      page.getByRole("dialog", { name: "Request a conversation", exact: true })
    ).toBeVisible()
    await page.goBack()
    await expect(
      page.getByRole("heading", { name: "Assignment completed", exact: true })
    ).toBeVisible()
    await page.goto("/workspace")
    const currentList = page.locator(".bento-task-list")
    await expect(currentList.locator(".bento-task")).toHaveCount(2)
    await expect(
      currentList.getByText("Northline Integration Search", { exact: true })
    ).toHaveCount(0)
    await expect(currentList.getByRole("link")).toHaveCount(0)
    await expect(
      page.getByRole("status", { name: "Assignment sent for review" })
    ).toContainText("Waiting for manager review")
    await expect(page.locator(".assignment-count")).toHaveCount(0)
    await check(page, "home-after-submission")
    await page.reload()
    await expect(currentList.locator(".bento-task")).toHaveCount(2)
    await expect(
      page.getByRole("status", { name: "Assignment sent for review" })
    ).toBeVisible()
    await page.goto("/workspace/completed")
    await page
      .getByRole("button", { name: "Restart demo", exact: true })
      .click()
    await expect(
      currentList.getByRole("link", { name: /Northline Integration Search/ })
    ).toBeVisible()
    await expect(
      page.getByRole("status", { name: "Assignment sent for review" })
    ).toHaveCount(0)
  })
}
for (const width of [320, 768]) {
  test(`narrow layouts preserve reflow and readable content at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace")
    await check(page, "home-" + width)
    await page.goto("/workspace/assignment")
    await check(page, "overview-" + width)
  })
}
test("charts expose named data and keyboard-operable tooltips", async ({
  page,
}) => {
  await page.goto("/workspace")
  const point = page.getByRole("img", {
    name: "January · $225K placement fees",
    exact: true,
  })
  await tabTo(page, point)
  await expect(point).toBeFocused()
  await expect(page.getByRole("tooltip")).toContainText("January")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("tooltip")).toBeHidden()
})
test("directory preserves filtering, membership confirmation and shared full profiles", async ({
  page,
}) => {
  await page.goto("/workspace/experts")
  await page
    .getByLabel("Search sample profiles", { exact: true })
    .fill("Claire")
  await expect(page.locator(".candidate-overview-card")).toHaveCount(1)
  await page
    .getByRole("button", {
      name: "View full profile: Claire Bennett",
      exact: true,
    })
    .click()
  await expect(
    page.getByRole("dialog", { name: "Claire Bennett", exact: true })
  ).toBeVisible()
  await check(page, "directory-profile")
  await page.keyboard.press("Escape")
  await page
    .getByRole("button", {
      name: "Remove Claire Bennett from selection",
      exact: true,
    })
    .click()
  await page
    .getByRole("button", { name: "Remove candidate", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Add to shortlist", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("button", {
      name: "View full profile: Claire Bennett",
      exact: true,
    })
  ).toBeFocused()
  await page
    .getByRole("button", { name: "Add to shortlist", exact: true })
    .click()
  await expect(
    page.getByRole("button", {
      name: "Remove Claire Bennett from selection",
      exact: true,
    })
  ).toBeVisible()
})
test("keyboard profile tabs trap and restore focus", async ({ page }) => {
  await candidates(page)
  const trigger = page.getByRole("button", {
    name: "View full profile: Claire Bennett",
    exact: true,
  })
  await tabTo(page, trigger)
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", {
    name: "Claire Bennett",
    exact: true,
  })
  await tabTo(
    page,
    dialog.getByRole("tab", { name: "Experience", exact: true })
  )
  await page.keyboard.press("ArrowRight")
  await expect(
    dialog.getByRole("tab", { name: "Education", exact: true })
  ).toBeFocused()
  await expect(
    dialog.getByRole("tab", { name: "Education", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab")
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement))
    ).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

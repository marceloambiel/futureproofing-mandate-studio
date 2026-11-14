import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

for (const width of [390, 1440]) {
  test(`first homepage visit presents the assignment update at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/workspace")
    const card = page.locator(".home-assignment-notification")
    await expect(card).toBeVisible()
    await expect(card).toContainText("Northline Integration Search")
    await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
    const charts = page.locator(
      width < 801
        ? ".mobile-chart-carousel>.bento-card"
        : ".executive-dashboard>.bento-card"
    )
    await expect(charts).toHaveCount(4)
    for (const chart of await charts.all())
      await expect(chart).toHaveCSS("filter", "none")
    await expect(
      page.getByRole("button", { name: "Notifications, 1 unread", exact: true })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true)
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(axe.violations).toEqual([])
    await card.screenshot({
      path: `/tmp/mandate-home-notification-${width}.png`,
    })
    await page
      .getByRole("link", {
        name: "Review Northline Integration Search update",
        exact: true,
      })
      .click()
    await expect(page).toHaveURL(/\/workspace\/assignment$/)
    await expect(
      page.getByRole("heading", {
        name: "Northline Integration Search",
        level: 1,
        exact: true,
      })
    ).toBeVisible()
    await page.goto("/workspace")
    await expect(card).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true })
    ).toBeVisible()
  })
}
test("notification presentation persists separately from read status and resets with the demo", async ({
  page,
}) => {
  await page.goto("/workspace")
  const card = page.locator(".home-assignment-notification")
  await expect(card).toBeVisible()
  await page
    .getByRole("button", {
      name: "Dismiss assignment notification",
      exact: true,
    })
    .click()
  await expect(card).toHaveCount(0)
  await page.reload()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("mandate-studio:v2:preferences")!)
            .presentedChangeIds.length
      )
    )
    .toBe(1)
  await expect(card).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Notifications, 1 unread", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Reset", exact: true }).click()
  await page
    .getByRole("dialog", { name: "Reset demo?", exact: true })
    .getByRole("button", { name: "Reset demo", exact: true })
    .click()
  await expect(card).toBeVisible()
})
test("notification entrance respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/workspace")
  const card = page.locator(".home-assignment-notification")
  await expect(card).toBeVisible()
  await expect(card).toHaveCSS("transition-property", "none")
  await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
})

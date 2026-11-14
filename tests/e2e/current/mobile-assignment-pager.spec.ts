import { test, expect } from "@playwright/test"
for (const width of [320, 390])
  test(`mobile step pager respects unlocks and scrolls pages at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace/assignment")
    const nav = page.getByRole("navigation", { name: "Assignment steps" })
    await expect(
      page.locator(
        ".mobile-assignment-page:not([inert]) .assignment-step-header>h2"
      )
    ).toBeHidden()
    await expect(
      page.locator(
        ".mobile-assignment-page:not([inert]) .mobile-document-preview-paper"
      )
    ).toHaveCSS("height", "300px")
    await expect(page.locator(".assignment-extracted-details")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)"
    )
    await expect(
      nav.getByRole("button", { name: /Previous step/ })
    ).toBeDisabled()
    await expect(nav.getByRole("button", { name: /Next step/ })).toBeDisabled()
    const action = page.getByRole("button", {
      name: "Match candidates to brief",
      exact: true,
    })
    const before = await action.boundingBox()
    await page.locator(".app-main").evaluate((el) => (el.scrollTop = 400))
    const after = await action.boundingBox()
    expect(after!.y).toBeCloseTo(before!.y, 0)
    await action.click()
    await expect(
      page.getByRole("heading", { name: "Included profiles", exact: true })
    ).toBeVisible({ timeout: 10000 })
    const summary = page.locator(".mobile-assignment-context")
    await expect(summary).toHaveAttribute("open", "")
    await summary.locator("summary").click()
    await expect(summary).not.toHaveAttribute("open")
    await nav.getByRole("button", { name: /Previous step/ }).click()
    await expect(page).toHaveURL(/\/workspace\/assignment$/)
    await expect(summary).not.toHaveAttribute("open")
    await summary.locator("summary").click()
    await nav.getByRole("button", { name: /Next step/ }).click()
    await expect(page).toHaveURL(/\/workspace\/candidates$/)
    await expect(summary).toHaveAttribute("open", "")
    await page
      .getByRole("button", { name: "Prepare Discussion Brief", exact: true })
      .click()
    await expect(
      page.getByRole("button", { name: "Open discussion brief editor" })
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator(
        ".mobile-assignment-page:not([inert]) .mobile-document-preview-paper"
      )
    ).toHaveCSS("height", "412.5px")
    const track = page.locator(".mobile-assignment-page-track")
    await track.evaluate((el) =>
      el.scrollTo({ left: el.clientWidth, behavior: "instant" })
    )
    await expect(page).toHaveURL(/\/workspace\/candidates$/)
    await expect(nav.locator(".mobile-assignment-current-step")).toContainText(
      "Candidates"
    )
    // A partially dragged page shows its neighbor before the route changes.
    const preview = await track.evaluate((el) => {
      el.style.scrollSnapType = "none"
      el.scrollLeft = el.clientWidth * 1.4
      return Array.from(el.children).map((child) =>
        child.getBoundingClientRect().toJSON()
      )
    })
    expect(preview[1].right).toBeGreaterThan(0)
    expect(preview[2].left).toBeLessThan(width)
    await track.evaluate((el) => {
      el.style.scrollSnapType = ""
      el.scrollTo({ left: el.clientWidth * 2, behavior: "instant" })
    })
    await expect(page).toHaveURL(/\/workspace\/discussion$/)
    expect(
      await page
        .locator(".app-main")
        .evaluate((el) => el.scrollWidth <= el.clientWidth)
    ).toBe(true)
    await page
      .getByRole("button", { name: "Open discussion brief editor" })
      .click()
    await expect(page.getByRole("dialog")).toHaveCount(1)
    await page.getByRole("button", { name: "Cancel", exact: true }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })

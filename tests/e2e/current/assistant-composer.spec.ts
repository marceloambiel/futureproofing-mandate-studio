import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

for (const width of [320, 390, 1440]) {
  test(`assistant expands downward with disabled demo controls at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/workspace")
    await page
      .getByRole("button", {
        name: "Dismiss assignment notification",
        exact: true,
      })
      .click()
    const field = page.getByRole("textbox", {
      name: "Message your assistant",
      exact: true,
    })
    const composer = page.locator(".home-assistant-input")
    const initial = await composer.boundingBox()
    await expect(composer).toHaveCSS("height", "58px")
    await field.click()
    await expect(composer).toHaveCSS("height", width < 801 ? "118px" : "106px")
    const expanded = await composer.boundingBox()
    expect(Math.abs(expanded!.y - initial!.y)).toBeLessThan(1)
    await expect(field).toHaveCSS("height", "24px")
    await field.fill(
      "Review the client brief.\nFind candidates with integration experience."
    )
    await expect(field).toHaveValue(
      "Review the client brief.\nFind candidates with integration experience."
    )
    for (const name of [
      "Add attachment",
      "Mention a person or assignment",
      "Voice input",
      "Assistant commands",
      "Auto",
      "Assistant settings",
    ])
      await expect(
        composer.getByRole("button", { name, exact: true })
      ).toBeDisabled()
    const send = composer.getByRole("button", {
      name: "Send message",
      exact: true,
    })
    await expect(send).toHaveAttribute("aria-disabled", "true")
    if (width < 801) {
      await send.click({ force: true })
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: "Assistant unavailable in this demo." })
      ).toBeVisible()
    } else {
      await send.hover()
      await expect(page.getByRole("tooltip")).toContainText(
        "Assistant unavailable in this demo."
      )
    }
    const geometry = await composer.evaluate((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth,
      pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    }))
    expect(geometry.pageOverflow).toBe(false)
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1)
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(axe.violations).toEqual([])
    await composer.screenshot({ path: `/tmp/mandate-composer-${width}.png` })
    await page.getByRole("heading", { level: 1 }).click()
    await expect(composer).toHaveCSS("height", "58px")
    await expect(composer).toHaveCSS("border-color", "rgb(124, 130, 120)")
    await expect(field).toHaveValue(
      "Review the client brief.\nFind candidates with integration experience."
    )
    await field.focus()
    await expect(composer).toHaveCSS("height", width < 801 ? "142px" : "130px")
    await field.fill("First line\nSecond line\nThird line\nFourth line")
    await expect(field).toHaveCSS("height", "48px")
    await expect(composer).toHaveCSS("height", width < 801 ? "142px" : "130px")
    const scroll = await field.evaluate((el) => ({
      height: el.clientHeight,
      content: el.scrollHeight,
      top: el.scrollTop,
    }))
    expect(scroll.content).toBeGreaterThan(scroll.height)
    expect(scroll.top).toBeGreaterThan(0)
    await field.evaluate((el) => (el.scrollTop = 0))
    expect(await field.evaluate((el) => el.scrollTop)).toBe(0)
  })
}
test("assistant expansion respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/workspace")
  await page
    .getByRole("textbox", { name: "Message your assistant", exact: true })
    .focus()
  await expect(page.locator(".home-assistant-input")).toHaveCSS(
    "transition-property",
    "none"
  )
  await expect(page.locator(".home-assistant-input")).toHaveCSS(
    "height",
    "106px"
  )
})

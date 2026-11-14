import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
for (const width of [1440, 390, 320])
  test(`minimal FAQ disclosures work at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/#faq")
    const faq = page.locator("#faq")
    await expect(faq.getByRole("heading", { level: 2 })).toHaveText(
      "Common questions"
    )
    await expect(faq.locator("details")).toHaveCount(5)
    await expect(faq.locator("details[open]")).toHaveCount(0)
    await expect(faq).toHaveCSS("border-top-width", "0px")
    expect(
      await page
        .locator("#sample-workspace")
        .evaluate((el) => getComputedStyle(el).backgroundColor)
    ).toBe(await faq.evaluate((el) => getComputedStyle(el).backgroundColor))
    const first = faq.locator("summary").first()
    await first.focus()
    await page.keyboard.press("Enter")
    await expect(faq.locator("details").first()).toHaveAttribute("open", "")
    await expect(faq.locator("details").first().locator("p")).toBeVisible()
    await page.keyboard.press("Enter")
    await expect(faq.locator("details").first()).not.toHaveAttribute("open")
    for (const detail of await faq.locator("details").all()) {
      await detail.locator("summary").click()
      await expect(detail.locator("p")).toBeVisible()
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const result = await new AxeBuilder({ page })
      .include("#faq")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    await faq.screenshot({ path: `/tmp/mandate-faq-${width}.png` })
  })

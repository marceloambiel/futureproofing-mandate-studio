import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

for (const width of [1440, 1024, 390, 320]) {
  test(`product value interfaces are readable and isolated at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/#product-value")
    const section = page.locator("#product-value")
    await expect(section).toBeVisible()
    await expect(section.locator(".product-feature")).toHaveCount(3)
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "A brief that evolves with your business",
      "Go deeper than candidate profiles",
      "Keep a clearer view of every search",
    ])
    await expect(section.locator(".product-feature-brief")).not.toContainText(
      /Northline|Head of Operations|Candidate [ABC]\b|Claire Bennett|Marcus Reed|Daniel Foster|12 locations|60.day/
    )
    await expect(
      section.locator("iframe, img, [contenteditable=true], [role=dialog]")
    ).toHaveCount(0)
    await expect(page.locator("iframe")).toHaveCount(1)
    await expect(section.getByRole("tab")).toHaveCount(2)
    const originalSize = await section.locator(".product-brief").boundingBox()
    await section.getByRole("tab", { name: "Previous brief" }).click()
    const previousSize = await section.locator(".product-brief").boundingBox()
    expect(previousSize!.height).toBe(originalSize!.height)
    expect(previousSize!.width).toBe(originalSize!.width)
    await expect(
      section.getByLabel("Previous illustrative brief")
    ).toContainText("Start with the organization’s direction")
    await expect(section.locator(".product-brief-new-tag:visible")).toHaveCount(
      0
    )
    await expect(
      section.getByRole("tab", { name: "Previous brief" })
    ).toHaveAttribute("aria-selected", "true")
    await section.getByRole("tab", { name: "Current brief" }).focus()
    await page.keyboard.press("Space")
    await expect(
      section.getByLabel("Current illustrative brief")
    ).toContainText("As business priorities evolve")
    await expect(section.locator(".product-brief-new-tag:visible")).toHaveCount(
      3
    )
    await expect(section.getByRole("table")).toHaveCount(1)
    await expect(
      section.getByRole("cell", { name: /integration scope is unverified/ })
    ).toBeVisible()
    await expect(
      section
        .getByRole("group", { name: "Illustrative search tracking dashboard" })
        .locator("svg")
    ).toHaveCount(4)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const clipped = await section
      .locator(".product-interface")
      .evaluateAll((nodes) =>
        nodes.some(
          (node) =>
            !node.classList.contains("product-comparison-full") &&
            node.scrollWidth > node.clientWidth + 1
        )
      )
    expect(clipped).toBe(false)
    const result = await new AxeBuilder({ page })
      .include("#product-value")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    await section.screenshot({
      path: `docs/qa/2026-11-13/home-04/product-value-${width}.png`,
      style: ".skip-link { visibility: hidden; }",
    })
  })
}

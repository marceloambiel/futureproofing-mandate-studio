import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
for (const width of [1440, 1024, 390, 320])
  test(`advisory timeline is vertical with sticky context and accessible at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/#our-process")
    const section = page.locator("#our-process")
    const timeline = section.getByRole("list", {
      name: "Our approach timeline",
    })
    await expect(timeline.getByRole("listitem")).toHaveCount(4)
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "Understand",
      "Explore",
      "Evaluate",
      "Advise",
    ])
    await expect(
      section.locator(".product-interface,[role=tablist],[role=tabpanel]")
    ).toHaveCount(0)
    const bounds = await timeline
      .getByRole("listitem")
      .evaluateAll((items) =>
        items.map((item) => item.getBoundingClientRect().toJSON())
      )
    expect(new Set(bounds.map((box) => box.x)).size).toBe(1)
    expect(bounds[3].y).toBeGreaterThan(bounds[0].y)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const context = section.locator(".approach-context")
    if (width > 900) {
      await expect(context).toHaveCSS("position", "sticky")
      const target = await section
        .locator(".approach-layout")
        .evaluate((el) => el.getBoundingClientRect().top + scrollY + 84)
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        target
      )
      await expect
        .poll(async () => Math.round((await context.boundingBox())!.y))
        .toBe(96)
      const firstY = (await timeline.boundingBox())!.y
      await page.evaluate(() => scrollBy({ top: 60, behavior: "instant" }))
      await expect
        .poll(async () => Math.round((await context.boundingBox())!.y))
        .toBe(96)
      expect((await timeline.boundingBox())!.y).toBeLessThan(firstY)
    } else await expect(context).toHaveCSS("position", "static")
    expect(
      await timeline
        .locator(".approach-timeline-number")
        .first()
        .evaluate((el) => getComputedStyle(el).borderTopColor)
    ).toBe("rgb(128, 128, 128)")
    const result = await new AxeBuilder({ page })
      .include("#our-process")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    await section.screenshot({
      path: `/tmp/mandate-approach-timeline-${width}.png`,
    })
  })

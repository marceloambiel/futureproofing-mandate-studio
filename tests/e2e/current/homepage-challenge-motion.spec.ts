import { test, expect } from "@playwright/test"
for (const width of [1440, 390])
  test(`challenge animations reveal once and finish within three seconds at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/#challenges")
    const cards = page.locator(".leadership-challenge")
    await expect(cards).toHaveCount(3)
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded()
      await expect(card).toHaveAttribute("data-revealed", "true")
      const timings = await card.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .filter((animation) => animation instanceof CSSAnimation)
          .map((animation) => {
            const timing = animation.effect!.getComputedTiming()
            animation.pause()
            animation.currentTime = 0
            return Number(timing.endTime)
          })
      )
      expect(timings.length).toBeGreaterThan(0)
      expect(Math.max(...timings)).toBeLessThanOrEqual(3000)
    }
    const claire = page.locator(".challenge-mini-candidate.is-previous")
    await expect(claire).toHaveCSS("background-color", "rgb(255, 255, 255)")
    await expect(claire.locator("img")).toHaveCSS("filter", "grayscale(0)")
    await page.locator("#challenges").evaluate((el) => {
      for (const animation of el.getAnimations({ subtree: true })) {
        animation.currentTime = 3000
      }
    })
    await expect(claire).toHaveCSS("background-color", "rgb(234, 234, 234)")
    await expect(claire.locator("img")).toHaveCSS("filter", "grayscale(1)")
    await expect(
      page.locator(".challenge-mini-candidate:not(.is-previous)")
    ).toHaveCSS("opacity", "1")
    await expect(page.locator(".challenge-replacement-arrow")).toHaveCSS(
      "opacity",
      "1"
    )
    await expect(page.locator(".field-history-past")).toHaveCSS("opacity", "1")
  })
test("reduced motion shows the complete static illustrations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/#challenges")
  await expect(page.locator("#challenges")).not.toHaveAttribute(
    "data-motion-ready",
    "true"
  )
  expect(
    await page
      .locator("#challenges")
      .evaluate((el) => el.getAnimations({ subtree: true }).length)
  ).toBe(0)
  await expect(
    page.locator(".challenge-mini-candidate.is-previous img")
  ).toHaveCSS("filter", "grayscale(1)")
})

test("the desktop sequence repeats after a three-second rest and pauses off-screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/#challenges")
  const first = page.locator(".leadership-challenge").first()
  await expect(first).toHaveAttribute("data-revealed", "true")
  const chart = page.locator(".challenge-growth-series")
  await expect
    .poll(() => chart.evaluate((el) => el.getAnimations()[0]?.playState))
    .toBe("finished")
  const time = await chart.evaluate((el) => el.getAnimations()[0].currentTime)
  await expect
    .poll(
      () => chart.evaluate((el) => Number(el.getAnimations()[0].currentTime)),
      { timeout: 7000 }
    )
    .toBeLessThan(Number(time))
  await page.setViewportSize({ width: 1440, height: 600 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  await expect
    .poll(() => chart.evaluate((el) => el.getAnimations()[0]?.playState))
    .toBe("paused")
})

test("components fade out in order before the next desktop sequence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/#challenges")
  const cards = page.locator(".leadership-challenge")
  await expect(cards).toHaveCount(3)
  for (const card of await cards.all())
    await expect(card).toHaveAttribute("data-revealed", "true")
  const timings = await cards.evaluateAll((nodes) =>
    nodes.map((card) => {
      const component = card.querySelector(".challenge-visual > div")!
      const fade = component
        .getAnimations()
        .find((animation) => !(animation instanceof CSSAnimation))!
      fade.pause()
      return fade.effect!.getComputedTiming().delay
    })
  )
  expect(timings).toEqual([5000, 5300, 5600])
  for (const card of await cards.all()) {
    const component = card.locator(".challenge-visual > div")
    await component.evaluate((el) => {
      const fade = el
        .getAnimations()
        .find((animation) => !(animation instanceof CSSAnimation))!
      fade.currentTime = 5800
    })
    await expect(component).toHaveCSS("opacity", "0")
  }
})

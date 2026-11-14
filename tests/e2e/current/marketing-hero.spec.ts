import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
for (const width of [1440, 390, 320])
  test(`website video hero is readable and usable at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    const header = page.locator(".marketing-v2>.site-header")
    await expect(
      header.getByRole("img", { name: "Mandate", exact: true })
    ).toHaveAttribute("src", "/brand/mandate.svg")
    expect((await header.boundingBox())!.height).toBe(64)
    if (width > 800)
      expect(
        (await header
          .getByRole("button", { name: "Request a conversation", exact: true })
          .boundingBox())!.height
      ).toBe(36)
    const hero = page.locator(".mandate-hero")
    const videos = hero.locator("video")
    await expect(videos).toHaveCount(2)
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "The right leadership for what comes next."
    )
    await expect(hero.locator(".eyebrow")).toHaveCount(0)
    await expect(
      hero.getByRole("link", { name: "Explore sample workspace" })
    ).toHaveAttribute("href", "#sample-workspace")
    await expect(
      hero.getByRole("button", { name: "Request a conversation", exact: true })
    ).toBeVisible()
    await expect
      .poll(() =>
        videos
          .nth(0)
          .evaluate((video) => (video as HTMLVideoElement).currentTime)
      )
      .toBeGreaterThan(0)
    expect(
      await videos.evaluateAll((nodes) =>
        nodes.every((node) => (node as HTMLVideoElement).muted)
      )
    ).toBe(true)
    await videos.nth(0).evaluate((video) => {
      const clip = video as HTMLVideoElement
      clip.currentTime = clip.duration - 0.15
    })
    await expect(videos.nth(1)).toHaveClass("is-active")
    await expect
      .poll(() =>
        videos
          .nth(1)
          .evaluate((video) => (video as HTMLVideoElement).readyState)
      )
      .toBeGreaterThanOrEqual(2)
    await videos.nth(1).evaluate((video) => {
      const clip = video as HTMLVideoElement
      clip.currentTime = clip.duration - 0.15
    })
    await expect(videos.nth(0)).toHaveClass("is-active")
    await expect(
      hero.getByRole("button", { name: /background videos/ })
    ).toHaveCount(0)
    const heading = await hero.getByRole("heading", { level: 1 }).boundingBox()
    expect(Math.abs(heading!.x + heading!.width / 2 - width / 2)).toBeLessThan(
      2
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.screenshot({
      path: `docs/qa/2026-11-13/home-03/hero-${width}.png`,
    })
    const results = await new AxeBuilder({ page })
      .include(".site-header")
      .include(".mandate-hero")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(results.violations).toEqual([])
    if (width < 801) {
      const menu = header.locator("summary")
      await menu.click()
      await expect(
        header.getByRole("navigation", { name: "Mobile main navigation" })
      ).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(menu).toBeFocused()
      await expect(header.locator("details")).not.toHaveAttribute("open")
    }
    await hero
      .getByRole("button", { name: "Request a conversation", exact: true })
      .click()
    await expect(
      page.getByRole("dialog", { name: "Request a conversation", exact: true })
    ).toBeVisible()
  })
test("website videos stay static for reduced motion without playback controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const hero = page.locator(".mandate-hero")
  await expect(
    hero.getByRole("button", { name: /background videos/ })
  ).toHaveCount(0)
  expect(
    await hero
      .locator("video")
      .evaluateAll((nodes) =>
        nodes.every((video) => (video as HTMLVideoElement).paused)
      )
  ).toBe(true)
})

test("homepage navigation targets the existing sections and sample without replacing the embed", async ({
  page,
}) => {
  await page.goto("/")
  const frame = page.locator("#sample-workspace iframe")
  await expect(frame).toHaveAttribute("src", "/workspace?preview=1")
  const originalFrame = await frame.elementHandle()
  for (const [name, id] of [
    ["Challenges", "challenges"],
    ["Workspace", "product-value"],
    ["Approach", "our-process"],
    ["Technology", "technology-judgment"],
    ["Demo", "sample-workspace"],
    ["FAQ", "faq"],
  ]) {
    await page
      .locator(".site-header")
      .getByRole("link", { name, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toBeInViewport()
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  await page
    .locator(".mandate-hero")
    .getByRole("link", { name: "Explore sample workspace" })
    .click()
  await expect(page.locator("#sample-workspace")).toBeInViewport()
  await expect(frame).toHaveCount(1)
  expect(
    await frame.evaluate((node, original) => node === original, originalFrame)
  ).toBe(true)
  await page.setViewportSize({ width: 390, height: 900 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('summary[aria-label="Toggle navigation"]').click()
  await page
    .getByRole("navigation", { name: "Mobile main navigation" })
    .getByRole("link", { name: "Demo", exact: true })
    .click()
  await expect(
    page.locator(".marketing-mobile-navigation")
  ).not.toHaveAttribute("open")
  await expect(page.locator("#sample-workspace")).toBeInViewport()
})

for (const width of [1440, 390, 320])
  test(`sticky glass navigation follows dark and light sections at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    const header = page.locator(".mandate-home>.site-header")
    for (const [selector, tone, textColor] of [
      [".mandate-hero", "dark", "rgb(255, 255, 255)"],
      ["#challenges", "light", "rgb(41, 44, 41)"],
      ["#product-value", "dark", "rgb(255, 255, 255)"],
      ["#our-process", "light", "rgb(41, 44, 41)"],
    ] as const) {
      await page
        .locator(selector)
        .evaluate((element) =>
          window.scrollTo(
            0,
            element.getBoundingClientRect().top + window.scrollY + 16
          )
        )
      await expect(header).toHaveAttribute("data-nav-theme", tone)
      await expect
        .poll(() =>
          header.evaluate((element) => getComputedStyle(element).color)
        )
        .toBe(textColor)
      expect((await header.boundingBox())!.y).toBe(0)
      expect((await header.boundingBox())!.height).toBe(64)
      if (width < 801) {
        await header.locator("summary").click()
        await expect(
          header.getByRole("navigation", { name: "Mobile main navigation" })
        ).toBeVisible()
        await expect(
          header
            .getByRole("navigation", { name: "Mobile main navigation" })
            .getByRole("link", { name: "Approach" })
        ).toHaveCSS("color", textColor)
        await page.keyboard.press("Escape")
      }
      const results = await new AxeBuilder({ page })
        .include(".mandate-home>.site-header")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
      expect(results.violations).toEqual([])
      await page.screenshot({
        path: `/tmp/mandate-navbar-${width}-${tone}.png`,
      })
    }
    if (width > 800) {
      await header
        .getByRole("link", { name: "Challenges", exact: true })
        .click()
      await expect(page.locator("#challenges")).toHaveCSS(
        "scroll-margin-top",
        "88px"
      )
      await expect
        .poll(() =>
          page
            .locator("#challenges")
            .evaluate((element) => element.getBoundingClientRect().top)
        )
        .toBeGreaterThanOrEqual(64)
      await expect
        .poll(() =>
          page
            .locator("#challenges")
            .evaluate((element) => element.getBoundingClientRect().top)
        )
        .toBeLessThan(160)
    }
  })

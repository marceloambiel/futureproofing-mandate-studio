import { test, expect } from "@playwright/test"

for (const width of [320, 1440])
  test(`text enlargement and custom spacing preserve home content at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace")
    await page
      .getByRole("button", {
        name: "Dismiss assignment notification",
        exact: true,
      })
      .click()
    await page.addStyleTag({
      content:
        "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}",
    })
    await page.evaluate(() => {
      const sizes = Array.from(document.querySelectorAll<HTMLElement>("body *"))
        .filter(
          (el) =>
            Array.from(el.childNodes).some(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
            ) || el.matches("input,textarea,select")
        )
        .map((el) => [el, getComputedStyle(el).fontSize] as const)
      for (const [el, size] of sizes)
        el.style.fontSize = `${parseFloat(size) * 2}px`
    })
    await expect
      .poll(() =>
        page
          .locator(".app-main")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      )
      .toBe(true)
    const clipped = await page
      .locator(".home-assistant-header h1,.bento-task-content h3")
      .evaluateAll((elements) =>
        elements.some((el) => el.scrollWidth > el.clientWidth + 2)
      )
    expect(clipped).toBe(false)
    await expect
      .poll(() =>
        page
          .locator(".bento-actions,.bento-card")
          .evaluateAll((elements) =>
            elements.every((el) => el.scrollHeight <= el.clientHeight + 2)
          )
      )
      .toBe(true)
  })

test("compact mobile indicators have usable separate targets and dark summary focus is visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/workspace")
  const dots = page.locator(".chart-pagination button")
  await expect(dots).toHaveCount(4)
  const targets = await dots.evaluateAll((elements) =>
    elements.map((el) => el.getBoundingClientRect().toJSON())
  )
  expect(targets.every((rect) => rect.width >= 24 && rect.height >= 24)).toBe(
    true
  )
  expect(
    targets.slice(1).every((rect, index) => rect.left >= targets[index].right)
  ).toBe(true)
  await page.goto("/workspace/assignment")
  await page.getByRole("button", { name: "Dismiss mandate update" }).click()
  const summary = page.locator(".mobile-assignment-context>summary")
  await summary.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(summary).toBeFocused()
  const contrast = await summary.evaluate((el) => {
    const color = getComputedStyle(el)
      .outlineColor.match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
    const background = getComputedStyle(el.closest(".assignment-general-info")!)
      .backgroundColor.match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
    const luminance = (channels: number[]) =>
      channels
        .map((value) => value / 255)
        .map((value) =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        )
        .reduce(
          (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
          0
        )
    const values = [luminance(color), luminance(background)].sort(
      (a, b) => a - b
    )
    return (values[1] + 0.05) / (values[0] + 0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(3)
})

import { test, expect } from "@playwright/test"

for (const width of [390, 1440]) {
  test(`toast border counts down and auto-dismisses without moving focus at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace/assignment")
    const toast = page.locator(".assignment-update-alert")
    const border = toast.locator(".assignment-toast-countdown rect")
    await expect(toast).toBeVisible()
    await expect
      .poll(() => border.evaluate((el) => el.getAnimations().length))
      .toBe(1)
    const duration = await border.evaluate(
      (el) => el.getAnimations()[0].effect?.getTiming().duration
    )
    expect(duration).toBe(10000)
    await border.evaluate((el) => {
      el.getAnimations()[0].currentTime = 5000
    })
    await expect
      .poll(() =>
        border.evaluate((el) =>
          parseFloat(getComputedStyle(el).strokeDashoffset)
        )
      )
      .toBeGreaterThanOrEqual(50)
    await toast.getByRole("button", { name: "Dismiss mandate update" }).focus()
    await expect
      .poll(() => border.evaluate((el) => el.getAnimations()[0].playState))
      .toBe("paused")
    await border.evaluate((el) => {
      el.getAnimations()[0].currentTime = 9900
    })
    const action = page.getByRole("button", {
      name: "Match candidates to brief",
      exact: true,
    })
    await action.focus()
    await expect(toast).toBeHidden()
    await expect(action).toBeFocused()
    await page.reload()
    await expect(toast).toBeHidden()
  })
}

test("toast countdown pauses on mouse hover and preserves manual dismissal", async ({
  page,
}) => {
  await page.goto("/workspace/assignment")
  const toast = page.locator(".assignment-update-alert")
  await toast.hover()
  await expect
    .poll(() =>
      toast.locator("rect").evaluate((el) => el.getAnimations()[0].playState)
    )
    .toBe("paused")
  await toast.getByRole("button", { name: "Dismiss mandate update" }).click()
  await expect(toast).toBeHidden()
  await expect(
    page.getByRole("heading", {
      name: "Northline Integration Search",
      exact: true,
    })
  ).toBeFocused()
})

test("toast uses stepped progress for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/workspace/assignment")
  const rect = page.locator(".assignment-toast-countdown rect")
  await expect
    .poll(() =>
      rect.evaluate((el) => el.getAnimations()[0]?.effect?.getTiming().easing)
    )
    .toBe("steps(10)")
})

import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
for (const width of [1440, 390])
  test(`sign in is a non-authenticating preview at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    if (width < 801) await page.getByLabel("Toggle navigation").click()
    const trigger = page
      .getByRole("button", { name: "Sign in", exact: true })
      .filter({ visible: true })
    await trigger.click()
    const popup = page.locator("[data-signin-popup]")
    await expect(popup).toBeVisible()
    await expect(popup).toContainText("no credentials are accepted")
    await popup.getByLabel("Username", { exact: true }).fill("sample-user")
    await popup.getByLabel("Password", { exact: true }).fill("sample-password")
    await expect(
      popup.getByRole("button", { name: "Sign in", exact: true })
    ).toBeDisabled()
    await popup.getByLabel("Password", { exact: true }).press("Enter")
    await expect(page).toHaveURL(/\/$/)
    const bounds = (await popup.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    const result = await new AxeBuilder({ page })
      .include("[data-signin-popup]")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    await page.keyboard.press("Escape")
    await expect(popup).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(popup.getByLabel("Username", { exact: true })).toHaveValue("")
    await expect(popup.getByLabel("Password", { exact: true })).toHaveValue("")
    await popup.getByRole("button", { name: "Close sign in" }).click()
    await expect(popup).not.toBeVisible()
  })

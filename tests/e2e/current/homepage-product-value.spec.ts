import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const width of [1440, 1024, 390, 320]) {
  test(`product value interfaces are readable and isolated at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/#product-value')
    const section = page.getByRole('region', { name: 'Better understanding. Better conversations. More informed decisions.' })
    await expect(section).toBeVisible()
    await expect(section.locator('.product-feature')).toHaveCount(3)
    await expect(section.getByRole('heading', { level: 3 })).toHaveText([
      'A brief that evolves with your business',
      'Go deeper than candidate profiles',
      'Turn research into meaningful conversations',
    ])
    await expect(section).not.toContainText(/Northline|Head of Operations|Candidate [ABC]\b|Claire Bennett|Marcus Reed|Daniel Foster|12 locations|60.day/)
    await expect(section.locator('iframe, img, [contenteditable=true], [role=dialog]')).toHaveCount(0)
    await expect(page.locator('iframe')).toHaveCount(1)
    await expect(section.getByRole('button')).toHaveCount(2)
    await section.getByRole('button', { name: 'Previous brief Earlier context' }).click()
    await expect(section.getByLabel('Previous illustrative brief')).toContainText('Start with the organization’s direction')
    await expect(section.getByRole('button', { name: 'Previous brief Earlier context' })).toHaveAttribute('aria-pressed', 'true')
    await section.getByRole('button', { name: 'Current brief Latest priorities' }).focus()
    await page.keyboard.press('Space')
    await expect(section.getByLabel('Current illustrative brief')).toContainText('As business priorities evolve')
    await expect(section.getByRole('table')).toHaveCount(1)
    await expect(section.getByRole('cell', { name: /Candidate-described; unverified/ })).toBeVisible()
    await expect(section.getByLabel('Illustrative discussion document')).toContainText('Review before sharing')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const clipped = await section.locator('.product-interface').evaluateAll(nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1))
    expect(clipped).toBe(false)
    const result = await new AxeBuilder({ page }).include('#product-value').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(result.violations).toEqual([])
    await section.screenshot({ path: `docs/qa/2026-11-13/home-04/product-value-${width}.png`, style: '.skip-link { visibility: hidden; }' })
  })
}

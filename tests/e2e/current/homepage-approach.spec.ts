import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const width of [1440, 1024, 390, 320]) {
  test(`advisory stages switch accessible product previews at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/#our-process')
    const section = page.getByRole('region', { name: 'A considered process, from understanding to action.' })
    const tabs = section.getByRole('tablist', { name: 'Our approach stages' })
    await expect(section).toBeVisible()
    await expect(section.getByRole('tab')).toHaveCount(4)
    await expect(section.getByRole('tabpanel')).toHaveCount(1)
    const previews = [
      ['Understand', 'Client brief and requirements interface illustration'],
      ['Explore', 'Candidate discovery and profile interface illustration'],
      ['Evaluate', 'Candidate comparison interface illustration'],
      ['Advise', 'Read-only discussion brief editor interface illustration'],
    ] as const
    for (const [stage, preview] of previews) {
      await tabs.getByRole('tab', { name: stage, exact: true }).click()
      await expect(tabs.getByRole('tab', { name: stage, exact: true })).toHaveAttribute('aria-selected', 'true')
      await expect(section.getByRole('tabpanel')).toHaveCount(1)
      const panel = section.getByRole('tabpanel', { name: stage, exact: true })
      await expect(panel.getByLabel(preview)).toBeVisible()
      await expect(panel.locator('iframe, [contenteditable=true]')).toHaveCount(0)
      const overflow = await panel.locator('.product-interface').evaluateAll(nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1))
      expect(overflow).toBe(false)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await panel.locator('.approach-preview-enter').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
      const result = await new AxeBuilder({ page }).include('#our-process').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(result.violations).toEqual([])
      if (width === 1440 || width === 390) await panel.screenshot({ path: `docs/qa/2026-11-13/home-05/preview-${stage.toLowerCase()}-${width}.png`, style: '.skip-link, .mandate-home > .site-header { visibility: hidden; }' })
    }
    await tabs.getByRole('tab', { name: 'Understand', exact: true }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(tabs.getByRole('tab', { name: 'Explore', exact: true })).toBeFocused()
    await expect(section.getByRole('tabpanel', { name: 'Explore', exact: true })).toBeVisible()
    await page.keyboard.press('End')
    await expect(tabs.getByRole('tab', { name: 'Advise', exact: true })).toBeFocused()
    await page.keyboard.press('Home')
    await expect(tabs.getByRole('tab', { name: 'Understand', exact: true })).toBeFocused()
    await expect(section).not.toContainText(/Northline|Head of Operations|Candidate [ABC]\b|12 locations|60.day/)
    await expect(page.locator('iframe')).toHaveCount(1)
    if (width > 900) {
      const list = section.locator('.approach-stage-selector')
      await expect(list).toHaveCSS('position', 'sticky')
      await list.evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 64))
      expect((await list.boundingBox())!.y).toBeGreaterThanOrEqual(96)
      expect((await list.boundingBox())!.y).toBeLessThan(98)
    }
    await section.locator('.approach-preview-enter').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
    await page.mouse.move(0, 0)
    await section.screenshot({ path: `docs/qa/2026-11-13/home-05/approach-${width}.png`, style: '.skip-link, .mandate-home > .site-header { visibility: hidden; }' })
  })
}

test('approach preview transition respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#our-process')
  const section = page.locator('#our-process')
  await section.getByRole('tab', { name: 'Explore', exact: true }).click()
  await expect(section.locator('.approach-preview-enter')).toHaveCSS('animation-name', 'none')
})

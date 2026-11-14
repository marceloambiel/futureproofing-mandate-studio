import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const width of [1440, 1024, 390, 320]) {
  test(`leadership challenges explain the broader service and reflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/#challenges')
    const section = page.getByRole('region', { name: "Leadership needs don't stand still." })
    await expect(section).toBeVisible()
    await expect(section.locator('.leadership-challenge')).toHaveCount(3)
    await expect(section.getByRole('heading', { level: 3 })).toHaveText(['Growth & scale', 'Acquisitions & transformation', 'Critical leadership transitions'])
    await expect(section.getByRole('img', { name: /A rising line illustrates increasing operational scale/ })).toBeVisible()
    await expect(section.getByLabel('Priority version history preview')).toContainText('Integrate two acquisitions into one operating model.')
    await expect(section.getByLabel('Priority version history preview')).toContainText('Geographic expansion and capacity for growth.')
    await expect(section.getByRole('group', {name:'Candidate transition illustration'})).toContainText('Marcus Reed')
    await expect(section.locator('.challenge-mini-candidate.is-previous')).toContainText('Claire Bennett')
    await expect(section.locator('.challenge-new-tag')).toHaveCount(0)
    await expect(section.locator('.challenges-sample-note')).toHaveCount(0)
    await expect(section).not.toContainText(/Northline|Head of Operations|\b(?:30|45|60|90) days\b|12 locations/)
    await expect(section.locator('button, a, iframe')).toHaveCount(2)
    const boxes = await section.locator('.leadership-challenge').evaluateAll(nodes => nodes.map(node => { const { x, y, width, height } = node.getBoundingClientRect(); return { x, y, width, height } }))
    if (width > 900) {
      expect(new Set(boxes.map(box => box.y)).size).toBe(1)
      expect(Math.max(...boxes.map(box => box.height)) - Math.min(...boxes.map(box => box.height))).toBeLessThan(1)
    } else {
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
    await section.screenshot({ path: `docs/qa/2026-11-13/home-03/challenges-${width}.png`, style: '.skip-link { visibility: hidden; }' })
    const result = await new AxeBuilder({ page }).include('#challenges').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(result.violations).toEqual([])
  })
}

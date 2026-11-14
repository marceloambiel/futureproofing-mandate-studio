import { test, expect } from '@playwright/test'

test('E12 production assets and deep links resolve without runtime errors', async ({ page, request }) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  for (const route of ['/', '/workspace/assignment', '/workspace/candidates', '/workspace/discussion', '/process', '/prototype-notes']) {
    const response = await page.goto(route)
    expect(response?.ok(), route).toBe(true)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Asset validation includes below-the-fold/closed-disclosure screenshots.
    // Eager loading here tests availability without removing production lazy loading.
    await page.locator('img').evaluateAll(images => images.forEach(img => { img.loading = 'eager' }))
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), { message: `All images load on ${route}`, timeout: 60000 }).toBe(true)
  }
  for (const asset of ['/brand/mandate-studio.svg', '/brand/mandate-studio-icon.svg']) {
    const response = await request.get(asset)
    expect(response.ok(), asset).toBe(true)
    expect(await response.text()).toContain('<svg')
  }
  expect(errors).toEqual([])
})

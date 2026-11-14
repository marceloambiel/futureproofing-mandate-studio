import { test, expect } from '@playwright/test'

test('U08 sample enquiry validates associated errors and never transmits a request', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Request a conversation', exact: true }).first().click()
  const enquiry = page.getByRole('dialog', { name: 'Request a conversation', exact: true })
  await enquiry.getByRole('button', { name: 'Submit sample enquiry', exact: true }).click()
  for (const label of ['Name', 'Work email', 'Leadership need']) {
    const input = enquiry.getByLabel(label, { exact: true })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(await input.getAttribute('aria-describedby')).toBeTruthy()
  }
  await enquiry.getByLabel('Name', { exact: true }).fill('Alex Example')
  await enquiry.getByLabel('Work email', { exact: true }).fill('invalid-address')
  await enquiry.getByLabel('Leadership need', { exact: true }).fill('Operational leadership for acquisition integration.')
  await enquiry.getByRole('button', { name: 'Submit sample enquiry', exact: true }).click()
  await expect(enquiry.getByText('Enter a valid work email.', { exact: true })).toBeVisible()
  await enquiry.getByLabel('Work email', { exact: true }).fill('alex@example.test')
  const mutations: string[] = []
  page.on('request', request => { if (request.method() !== 'GET') mutations.push(`${request.method()} ${request.url()}`) })
  await enquiry.getByRole('button', { name: 'Submit sample enquiry', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Sample enquiry recorded', exact: true })).toContainText('No actual enquiry was sent.')
  expect(mutations).toEqual([])
})

test('U10 rapid ready and restore controls do not duplicate document versions', async ({ page }) => {
  await page.goto('/workspace/discussion')
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).dblclick()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
  const afterReady = await page.evaluate(() => JSON.parse(localStorage.getItem('mandate-studio:v1')!))
  expect(afterReady.versions).toHaveLength(2)
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click()
  await page.getByRole('button', { name: 'Restore this mandate section as draft', exact: true }).click()
  await page.getByRole('button', { name: 'Restore as draft', exact: true }).dblclick()
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
  const afterRestore = await page.evaluate(() => JSON.parse(localStorage.getItem('mandate-studio:v1')!))
  expect(afterRestore.versions).toHaveLength(3)
  expect(afterRestore.versions[0].status).toBe('earlier-approved')
  expect(afterRestore.versions.find((v: { id: string }) => v.id === afterRestore.currentId).status).toBe('draft')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('D11 corrupt sample storage offers explicit recovery and does not silently reset', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('corruption-installed')) {
      localStorage.setItem('mandate-studio:v1', '{invalid')
      sessionStorage.setItem('corruption-installed', 'yes')
    }
  })
  await page.goto('/workspace/discussion')
  await expect(page.getByRole('main')).toContainText(/couldn.t.*(load|read|open)|recover|saved.*(invalid|damaged|could)/i)
  expect(await page.evaluate(() => localStorage.getItem('mandate-studio:v1'))).toBe('{invalid')
  await expect(page.getByRole('button', { name: 'Mark ready for review', exact: true })).toBeDisabled()
  await page.goto('/prototype-notes')
  await page.getByRole('button', { name: 'Reset sample workspace', exact: true }).click()
  const reset = page.getByRole('dialog', { name: 'Reset sample workspace?', exact: true })
  await reset.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await page.evaluate(() => localStorage.getItem('mandate-studio:v1'))).toBe('{invalid')
  await page.getByRole('button', { name: 'Reset sample workspace', exact: true }).click()
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click()
  await page.goto('/workspace/discussion')
  await expect(page.getByRole('button', { name: 'Mark ready for review', exact: true })).toBeEnabled()
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
})

test('D14 reset cancel preserves state and confirmed reset preserves unrelated storage', async ({ page }) => {
  await page.goto('/workspace/discussion')
  await page.evaluate(() => localStorage.setItem('unrelated:test', 'preserve'))
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  const before = await page.evaluate(() => localStorage.getItem('mandate-studio:v1'))
  await page.goto('/prototype-notes')
  await page.getByRole('button', { name: 'Reset sample workspace', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await page.evaluate(() => localStorage.getItem('mandate-studio:v1'))).toBe(before)
  await page.getByRole('button', { name: 'Reset sample workspace', exact: true }).click()
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click()
  expect(await page.evaluate(() => localStorage.getItem('unrelated:test'))).toBe('preserve')
  await page.goto('/workspace/discussion')
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
})

test('D12 browser saving denial allows a truthful session without persistence', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (key === 'mandate-studio:v1') throw new DOMException('Storage access denied', 'SecurityError')
      return original.call(this, key)
    }
  })
  await page.goto('/workspace/discussion')
  await expect(page.getByText('Changes are kept in this session only.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue without saving', exact: true }).click()
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  await page.getByLabel('Meeting opening', { exact: true }).fill('Integrate two acquisitions; clarify operating responsibility. This copy is kept only in this session.')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Changes are kept in this session only.', { exact: true })).toBeVisible()
})

test('D13 two-tab conflict keeps local text until explicit resolution and preserves remote history', async ({ page, context }) => {
  await page.goto('/workspace/discussion')
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  await page.getByLabel('Next questions', { exact: true }).fill('Local question: what integration work did each candidate personally lead?')
  const other = await context.newPage()
  await other.goto('/workspace/discussion')
  await other.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  await other.getByLabel('Next questions', { exact: true }).fill('Remote question: how many locations did Candidate B oversee?')
  await other.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('A newer version was saved in another tab.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Next questions', { exact: true })).toHaveValue('Local question: what integration work did each candidate personally lead?')
  await page.getByRole('dialog').getByRole('button', { name: 'Keep my edits as a new draft', exact: true }).click()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mandate-studio:v1')!))
  expect(stored.versions.some((v: { content: { questions: string } }) => v.content.questions.includes('Remote question'))).toBe(true)
  expect(stored.versions.find((v: { id: string }) => v.id === stored.currentId).content.questions).toContain('Local question')
  await other.close()
})

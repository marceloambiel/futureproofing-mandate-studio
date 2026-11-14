import { test, expect } from '@playwright/test'

test('E01 complete desktop journey keeps readiness after reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  await page.getByRole('link', { name: 'Open sample workspace', exact: true }).first().click()
  await expect(page).toHaveURL(/\/workspace$/)
  await page.getByRole('link', { name: 'Open assignment', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Head of Operations', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Compare candidates', exact: true }).click()
  await expect(page).toHaveURL(/\/workspace\/candidates/)
  for (const name of ['Candidate A', 'Candidate B', 'Candidate C']) await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  await page.getByRole('link', { name: 'Prepare discussion brief', exact: true }).click()
  await expect(page).toHaveURL(/\/workspace\/discussion/)
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/not.*approved/i).first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
})

test('E02 version comparison works from assignment and discussion with focus return', async ({ page }) => {
  for (const route of ['/workspace/assignment', '/workspace/discussion']) {
    await page.goto(route)
    const trigger = page.getByRole('button', { name: 'Compare versions', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Compare versions', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/earlier approved/i).first()).toBeVisible()
    await expect(dialog.getByText(/expansion/i).first()).toBeVisible()
    await expect(dialog.getByText(/integration|integrat/i).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  }
})

test('E03 U04 U06 ready edit save creates a fresh-review draft, validates and preserves long text', async ({ page }) => {
  await page.goto('/workspace/discussion')
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  const editor = page.getByRole('dialog', { name: 'Edit discussion brief', exact: true })
  await editor.getByLabel('Meeting opening', { exact: true }).fill('   ')
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(editor).toBeVisible()
  await expect(editor.getByRole('alert')).toBeVisible()
  const longSummary = 'The board prioritizes integrating two acquisitions across twelve locations; the target start is within sixty days. ' + 'Clarify each candidate’s operating responsibility before deciding next steps. '.repeat(12)
  await editor.getByLabel('Meeting opening', { exact: true }).fill(longSummary)
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(editor).toBeHidden()
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/fresh review required/i).first()).toBeVisible()
  await expect(page.getByText(longSummary, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  await page.reload()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
})

test('E04 U05 restore is confirmed, stays a draft and leaves business mandate current', async ({ page }) => {
  await page.goto('/workspace/discussion')
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click()
  await page.getByRole('button', { name: 'Restore this mandate section as draft', exact: true }).click()
  const confirmation = page.getByRole('dialog', { name: 'Restore mandate section?', exact: true })
  await expect(confirmation.getByText(/fresh review|require.*review/i)).toBeVisible()
  await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Compare versions', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Restore this mandate section as draft', exact: true }).click()
  await page.getByRole('button', { name: 'Restore as draft', exact: true }).click()
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/outdated priority/i).first()).toBeVisible()
  await expect(page.getByText(/Integrate two acquisitions/i).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark ready for review', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Update to revised mandate', exact: true }).click()
  const editor = page.getByRole('dialog', { name: 'Edit discussion brief', exact: true })
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Mark ready for review', exact: true }).click()
  await expect(page.getByText('Ready for review', { exact: true }).first()).toBeVisible()
})

test('E05 U07 failed save preserves text, retries and persists without duplicate save', async ({ page }) => {
  await page.goto('/workspace/discussion?scenario=save-failure')
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  const editor = page.getByRole('dialog', { name: 'Edit discussion brief', exact: true })
  const summary = 'The board now prioritizes integrating two acquisitions across twelve locations. Start within sixty days; clarify operating responsibilities.'
  await editor.getByLabel('Meeting opening', { exact: true }).fill(summary)
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(editor.getByRole('alert')).toContainText(/couldn.t save|could not save/i)
  await expect(editor.getByLabel('Meeting opening', { exact: true })).toHaveValue(summary)
  await editor.getByRole('button', { name: 'Retry save', exact: true }).click()
  await expect(editor).toBeHidden()
  await page.reload()
  await expect(page.getByText(summary, { exact: true })).toBeVisible()
})

test('U01 U02 evidence panel preserves facts and returns focus', async ({ page }) => {
  await page.goto('/workspace/candidates')
  const data = [
    ['A', /helped expand/i, /not.*established/i, /30 days/i],
    ['B', /led (two|2) acquisition integrations/i, /clarification/i, /45 days/i],
    ['C', /describes/i, /unverified/i, /90 days/i],
  ] as const
  for (const [id, fact, limitation, days] of data) {
    const trigger = page.getByRole('button', { name: `View evidence for Candidate ${id}`, exact: true })
    await trigger.click()
    const panel = page.getByRole('dialog', { name: `Candidate ${id}`, exact: true })
    await expect(panel.getByText(fact).first()).toBeVisible()
    await expect(panel.getByText(limitation).first()).toBeVisible()
    await expect(panel.getByText(days).first()).toBeVisible()
    await expect(panel.getByText(/\?$/).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
})

test('U09 dirty editor protects Close and Escape and supports explicit discard', async ({ page }) => {
  await page.goto('/workspace/discussion')
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  const editor = page.getByRole('dialog', { name: 'Edit discussion brief', exact: true })
  const opening = editor.getByLabel('Meeting opening', { exact: true })
  const original = await opening.inputValue()
  await opening.fill('Unsaved integration discussion opening')
  await page.keyboard.press('Escape')
  await expect(editor.getByRole('heading', { name: 'Unsaved changes', exact: true })).toBeVisible()
  await editor.getByRole('button', { name: 'Keep editing', exact: true }).click()
  await expect(opening).toHaveValue('Unsaved integration discussion opening')
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click()
  await editor.getByRole('button', { name: 'Discard changes', exact: true }).click()
  await expect(editor).toBeHidden()
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  await expect(page.getByLabel('Meeting opening', { exact: true })).toHaveValue(original)
})

test('U09 dirty editor protects close button, backdrop and browser navigation', async ({ page }) => {
  await page.goto('/workspace/candidates')
  await page.getByRole('link', { name: 'Prepare discussion brief', exact: true }).click()
  await page.getByRole('button', { name: 'Edit discussion brief', exact: true }).click()
  const editor = page.getByRole('dialog', { name: 'Edit discussion brief', exact: true })
  await editor.getByLabel('Meeting opening', { exact: true }).fill('Unsaved integration discussion retained through navigation.')
  await editor.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(editor.getByRole('heading', { name: 'Unsaved changes', exact: true })).toBeVisible()
  await editor.getByRole('button', { name: 'Keep editing', exact: true }).click()
  await page.mouse.click(2, 2)
  await expect(editor.getByLabel('Meeting opening', { exact: true })).toHaveValue('Unsaved integration discussion retained through navigation.')
  await page.goBack()
  await expect(editor.getByRole('heading', { name: 'Unsaved changes', exact: true })).toBeVisible()
  await editor.getByRole('button', { name: 'Discard changes', exact: true }).click()
  await expect(page).toHaveURL(/\/workspace\/candidates/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('E06 direct routes, Back/Forward and invalid routes recover meaningfully', async ({ page }) => {
  for (const route of ['/workspace/assignment', '/workspace/candidates', '/workspace/discussion', '/process', '/prototype-notes']) {
    await page.goto(route)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  await page.goto('/workspace/assignment')
  await page.getByRole('link', { name: 'Compare candidates', exact: true }).click()
  await page.goBack()
  await expect(page).toHaveURL(/\/workspace\/assignment/)
  await page.goForward()
  await expect(page).toHaveURL(/\/workspace\/candidates/)
  for (const route of ['/missing', '/workspace/assignment?assignment=missing', '/workspace/candidates?candidate=missing']) {
    await page.goto(route)
    await expect(page.getByRole('main')).toContainText(/not found|couldn.t find|unavailable|not available|unknown/i)
    await expect(page.getByRole('link', { name: /workspace|assignment|home|candidate comparison/i }).first()).toBeVisible()
  }
})

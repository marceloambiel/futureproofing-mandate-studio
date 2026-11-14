import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

async function acknowledgeIfShown(page: Page) {
  const dialog = page.getByRole("dialog", {
    name: /assignment updated|board priority changed/i,
  })
  if (await dialog.isVisible())
    await dialog
      .getByRole("button", { name: /acknowledge|got it|continue|understood/i })
      .click()
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    )
  ).toBe(true)
}

test("V210 sample entry opens distinct workspace Home and Home navigation returns", async ({
  page,
}) => {
  await page.goto("/")
  await page
    .getByRole("link", { name: "Open sample workspace", exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/\/workspace(?:\/home)?$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /welcome|workspace home|good|hello/i
  )
  await expect(
    page.getByRole("button", { name: "What changed?", exact: true })
  ).toBeVisible()
  await page
    .getByRole("link", {
      name: /open assignment|review assignment|review change/i,
    })
    .first()
    .click()
  await acknowledgeIfShown(page)
  await page.getByRole("link", { name: "Home", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "What changed?", exact: true })
  ).toBeVisible()
})

test("V211 V212 V220 real change is acknowledged persistently without fabricated last visit", async ({
  page,
}) => {
  await page.goto("/workspace/assignment")
  const alert = page.getByRole("dialog", {
    name: /assignment updated|board priority changed/i,
  })
  await expect(alert).toBeVisible()
  await expect(alert).toContainText(/expansion/i)
  await expect(alert).toContainText(/integrat/i)
  await expect(alert).not.toContainText(
    /since your last visit|yesterday|minutes ago/i
  )
  await alert
    .getByRole("button", { name: /acknowledge|got it|continue|understood/i })
    .click()
  await expect(alert).toBeHidden()
  await page.reload()
  await expect(alert).toBeHidden()
  await expect(
    page.getByText("Geographic expansion", { exact: true }).first()
  ).toBeVisible()
  await expect(
    page.getByText("Integrate two acquisitions", { exact: true }).first()
  ).toBeVisible()
})

test("V213 V214 assistant responses are local sourced and insert normal editable draft", async ({
  page,
}) => {
  const externalRequests: string[] = []
  page.on("request", (request) => {
    if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      externalRequests.push(request.url())
  })
  await page.goto("/workspace")
  await page.getByRole("button", { name: "What changed?", exact: true }).click()
  await expect(page.getByRole("main")).toContainText(/expansion/i)
  await expect(page.getByRole("main")).toContainText(/integration/i)
  await expect(page.getByRole("main")).toContainText(/sample|preview/i)
  await page
    .getByRole("button", { name: "What evidence is missing?", exact: true })
    .click()
  await expect(page.getByRole("main")).toContainText(/unverified/i)
  await expect(page.getByRole("main")).toContainText(/Candidate A/i)
  await page
    .getByRole("button", { name: "Prepare a meeting opening", exact: true })
    .click()
  await page
    .getByRole("button", { name: /insert.*brief|use.*brief|insert.*draft/i })
    .click()
  await expect(page).toHaveURL(/\/workspace\/discussion/)
  const editor = page.getByRole("dialog", {
    name: "Edit discussion brief",
    exact: true,
  })
  await expect(editor).toBeVisible()
  await expect(
    editor.getByLabel("Meeting opening", { exact: true })
  ).toHaveValue(/integrat/i)
  await expect(editor).toContainText(/fresh review/i)
  await editor
    .getByRole("button", { name: "Save changes", exact: true })
    .click()
  await expect(editor).toBeHidden()
  expect(externalRequests).toEqual([])
})

test("V221 V222 V225 focused changes and reversible comparison overlay preserve full journey", async ({
  page,
}) => {
  await page.goto("/workspace/assignment")
  await acknowledgeIfShown(page)
  const changeTrigger = page
    .getByRole("button", {
      name: /updated.*mandate|view mandate changes|updated/i,
    })
    .first()
  await changeTrigger.click()
  const history = page.getByRole("dialog").last()
  await expect(history).toContainText("V1")
  await expect(history).toContainText("V2")
  await expect(history).toContainText(/expansion/i)
  await expect(history).toContainText(/integrat/i)
  await page.keyboard.press("Escape")
  await expect(changeTrigger).toBeFocused()
  await page
    .getByRole("button", { name: "Compare candidates", exact: true })
    .click()
  const comparison = page.getByRole("dialog", {
    name: /compare candidates|candidate comparison/i,
  })
  await expect(comparison).toBeVisible()
  await comparison
    .getByRole("button", { name: /remove Candidate A.*comparison/i })
    .click()
  await expect(comparison).toContainText(/removed from.*comparison/i)
  await comparison
    .getByRole("button", {
      name: /add Candidate A.*comparison|include Candidate A|restore Candidate A/i,
    })
    .click()
  await comparison
    .getByRole("link", {
      name: /full.*comparison|full candidates|open candidates/i,
    })
    .click()
  await expect(page).toHaveURL(/\/workspace\/candidates/)
})

test("V230 V231 V232 V234 V235 candidate identity opens structured profile and full profile", async ({
  page,
}) => {
  await page.goto("/workspace/candidates")
  for (const id of ["A", "B", "C"])
    await expect(
      page.getByText(`Candidate ${id}`, { exact: true }).first()
    ).toBeVisible()
  const trigger = page
    .getByRole("button", { name: "Candidate A", exact: true })
    .first()
  await trigger.click()
  const panel = page.getByRole("dialog", { name: "Candidate A", exact: true })
  await expect(panel).toBeVisible()
  for (const name of [
    "Overview",
    "Experience",
    "Skills / Technical",
    "Education",
  ]) {
    const tab = panel.getByRole("tab", { name, exact: true })
    await tab.click()
    await expect(tab).toHaveAttribute("aria-selected", "true")
    const id = await tab.getAttribute("aria-controls")
    expect(id).toBeTruthy()
    await expect(page.locator(`[id="${id}"]`)).toBeVisible()
  }
  await expect(
    panel.getByText("Not supplied in this sample", { exact: true }).first()
  ).toBeVisible()
  await panel
    .getByRole("button", { name: "View full profile", exact: true })
    .click()
  const full = page.getByRole("dialog", {
    name: /Candidate A.*full profile|full profile.*Candidate A/i,
  })
  await expect(full).toBeVisible()
  await expect(full).toContainText("No profile history in this sample")
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab")
    expect(
      await full.evaluate((el) => el.contains(document.activeElement))
    ).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(full).toBeHidden()
  await expect(
    panel.getByRole("button", { name: "View full profile", exact: true })
  ).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

test("V233 detail scroll follows real visible section and candidate switch resets", async ({
  page,
}) => {
  await page.goto("/workspace/candidates?candidate=A")
  const panel = page.getByRole("dialog", { name: "Candidate A", exact: true })
  await panel.getByRole("tab", { name: "Education", exact: true }).click()
  await expect(
    panel.getByRole("tab", { name: "Education", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  await panel
    .getByRole("tabpanel")
    .first()
    .evaluate((el) => el.scrollIntoView({ block: "start" }))
  await expect(
    panel.getByRole("tab", { name: "Overview", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("Escape")
  await page
    .getByRole("button", { name: "View evidence for Candidate B", exact: true })
    .click()
  const next = page.getByRole("dialog", { name: "Candidate B", exact: true })
  await expect(
    next.getByRole("tab", { name: "Overview", exact: true })
  ).toHaveAttribute("aria-selected", "true")
})

test("V236 V237 directory searches only supplied records and membership reverses", async ({
  page,
}) => {
  await page.goto("/workspace/experts")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Experts/i
  )
  await expect(page.getByRole("main")).toContainText(
    /fictional sample directory/i
  )
  const search = page.getByRole("searchbox")
  await search.fill("Candidate B")
  await expect(
    page.getByRole("main").getByText("Candidate B", { exact: true }).first()
  ).toBeVisible()
  await expect(
    page.getByRole("main").getByText("Candidate A", { exact: true })
  ).toHaveCount(0)
  await search.fill("Not a supplied profile")
  await expect(page.getByRole("main")).toContainText(
    /no additional sample profiles|no sample profiles/i
  )
  await search.fill("Candidate B")
  await page
    .getByRole("button", { name: /remove Candidate B.*comparison/i })
    .click()
  await expect(page.getByRole("main")).toContainText(
    /removed from.*comparison/i
  )
  await page
    .getByRole("button", {
      name: /add Candidate B.*comparison|include Candidate B|restore Candidate B/i,
    })
    .click()
  await page.reload()
  await expect(
    page.getByRole("button", { name: /remove Candidate B.*comparison/i })
  ).toBeVisible()
})

test("V240 V241 V245 discussion candidate summaries and questions retain brief context", async ({
  page,
}) => {
  await page.goto("/workspace/discussion")
  const summary = page
    .getByRole("button", { name: /Candidate C|view.*Candidate C/i })
    .first()
  await summary.click()
  const panel = page.getByRole("dialog", { name: "Candidate C", exact: true })
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(/unverified/i)
  await page.keyboard.press("Escape")
  await expect(page).toHaveURL(/\/workspace\/discussion$/)
  await expect(summary).toBeFocused()
  await page
    .getByRole("button", {
      name: /question.*Candidate A|Candidate A.*question/i,
    })
    .click()
  await expect(
    page.getByRole("dialog", { name: "Candidate A", exact: true })
  ).toBeVisible()
})

for (const width of [390, 1440]) {
  test(`V215 V250 V253 V254 guided sample is bounded, reversible and reduced motion at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    const trigger = page
      .getByRole("button", { name: /start guided demo|explore guided demo/i })
      .first()
    await trigger.click()
    const demo = page.getByRole("dialog", { name: /guided sample/i })
    await expect(demo).toBeVisible()
    await expect(demo).toContainText(/Head of Operations/i)
    await noOverflow(page)
    await demo.getByRole("button", { name: "Next", exact: true }).click()
    await expect(demo).toContainText(/Candidate A/i)
    await demo.getByRole("button", { name: "Back", exact: true }).click()
    await expect(demo).toContainText(/mandate/i)
    await demo.getByRole("button", { name: "Next", exact: true }).click()
    await demo.getByRole("button", { name: "Next", exact: true }).click()
    await expect(demo).toContainText(/Discussion brief/i)
    await page.keyboard.press("Escape")
    await expect(demo).toBeHidden()
    await expect(page).toHaveURL(/\/$/)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await demo
      .getByRole("button", { name: /skip|close demo/i })
      .first()
      .click()
    await expect(demo).toBeHidden()
  })
}

test("V223 V239 V246 V252 V253 added views and mobile profile pass serious axe checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of [
    "/workspace",
    "/workspace/assignment",
    "/workspace/experts",
    "/workspace/candidates?candidate=C",
    "/workspace/discussion",
  ]) {
    await page.goto(route)
    await expect(page.locator("main").first()).toBeVisible()
    await noOverflow(page)
    const results = await new AxeBuilder({ page }).analyze()
    await test.info().attach(`v2-axe-${route.replaceAll("/", "-")}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    })
    expect(
      results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      ),
      route
    ).toEqual([])
  }
  await page
    .getByRole("button", { name: "Mark ready for review", exact: true })
    .click()
  await expect(page.getByText(/not been approved/i).first()).toBeVisible()
  await expect(page.getByText(/nothing has been sent/i).first()).toBeVisible()
})

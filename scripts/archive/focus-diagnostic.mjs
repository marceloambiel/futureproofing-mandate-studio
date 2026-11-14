import { chromium } from "@playwright/test"
const b = await chromium.launch()
const p = await b.newPage()
await p.goto("http://127.0.0.1:5173/workspace/candidates")
await p
  .getByRole("button", { name: "View evidence for Candidate A", exact: true })
  .focus()
await p.keyboard.press("Enter")
await p.getByRole("dialog").waitFor()
for (let i = 0; i < 10; i++) {
  await p.keyboard.press("Tab")
  console.log(
    i,
    await p.evaluate(() => ({
      active: document.activeElement?.outerHTML,
      inside: !!document
        .querySelector("[role=dialog]")
        ?.contains(document.activeElement),
    }))
  )
}
await b.close()

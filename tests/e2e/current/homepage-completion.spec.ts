import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for(const width of [1440,390,320])test(`completed homepage navigation and closing invitation at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900})
 await page.goto('/')
 await expect(page.locator('#main > section')).toHaveCount(8)
 await expect(page.getByText('Know what needs an answer before deciding.',{exact:true})).toHaveCount(0)
 const final=page.locator('#conversation')
 await final.scrollIntoViewIfNeeded()
 await expect(final.getByRole('heading')).toHaveText("Let's find the leadership your next chapter needs.")
 await expect(final.getByRole('link')).toHaveCount(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 const footer=page.getByRole('contentinfo')
 await expect(footer).toContainText('Mandate is a fictional prototype.')
 const links=footer.getByRole('navigation').getByRole('link')
 for(const link of await links.all()){
  const href=await link.getAttribute('href')
  await expect(page.locator(href!)).toHaveCount(1)
 }
 const results=await new AxeBuilder({page}).include('#conversation').include('.homepage-footer').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
 expect(results.violations).toEqual([])
 await final.scrollIntoViewIfNeeded()
 await page.screenshot({path:`docs/qa/2026-11-13/home-08/final-${width}.png`})
 await final.getByRole('button',{name:'Request a conversation',exact:true}).click()
 let dialog=page.getByRole('dialog',{name:'Request a conversation',exact:true})
 await expect(dialog).toContainText('nothing will be sent or saved')
 await dialog.getByRole('button',{name:'Preview contact request'}).click()
 await expect(dialog.getByLabel('Name',{exact:true})).toBeFocused()
 await dialog.getByLabel('Name',{exact:true}).fill('Alex Example')
 await dialog.getByLabel('Work email',{exact:true}).fill('alex@example.test')
 await dialog.getByLabel('Leadership need',{exact:true}).fill('Leadership for a growing organization.')
 const writes:string[]=[]
 page.on('request',request=>{if(['POST','PUT','PATCH'].includes(request.method()))writes.push(request.url())})
 await dialog.getByRole('button',{name:'Preview contact request'}).click()
 dialog=page.getByRole('dialog',{name:'Contact preview only',exact:true})
 await expect(dialog).toContainText('No inquiry was sent or saved.')
 expect(writes).toEqual([])
 await dialog.getByRole('button',{name:'Close',exact:true}).first().click()
 await expect(final.getByRole('button',{name:'Request a conversation',exact:true})).toBeFocused()
})

for(const width of [1440,390])test(`each marketing section has contextual conversation and demo actions at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000})
 await page.goto('/')
 for(const id of ['challenges','our-process']){
  const actions=page.locator(`#${id} .homepage-section-actions`)
  await expect(actions.getByRole('button')).toHaveCount(1)
  await expect(actions.getByRole('link')).toHaveAttribute('href','/workspace')
  const primary=actions.getByRole('button')
  if(width<801){
   const first=(await primary.boundingBox())!,second=(await actions.getByRole('link').boundingBox())!
   expect(first.height).toBeGreaterThanOrEqual(44)
   expect(second.height).toBeGreaterThanOrEqual(44)
   expect(second.y-first.y-first.height).toBeGreaterThanOrEqual(12)
  }
  await primary.click()
  const dialog=page.getByRole('dialog',{name:'Request a conversation',exact:true})
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click()
  await expect(primary).toBeFocused()
 }
})

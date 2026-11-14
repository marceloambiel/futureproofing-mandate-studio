import {test,expect} from '@playwright/test'

for(const navigation of ['sample link','browser Back']) {
 test(`V203 V242 V244 public live preview preserves unsaved edits on ${navigation}`,async({page})=>{
  await page.goto('/process')
  await page.getByRole('link',{name:'Mandate Studio homepage',exact:true}).click()
  const frame=page.frameLocator('iframe[title="Interactive Mandate Studio sample workspace Home"]')
  await frame.getByRole('link',{name:'Prepare discussion brief',exact:true}).click()
  await frame.getByRole('button',{name:'Edit discussion brief',exact:true}).click()
  const text='Unsaved homepage preview opening about integration.'
  await frame.getByLabel('Meeting opening',{exact:true}).fill(text)
  if(navigation==='sample link')await page.getByRole('link',{name:'Open sample workspace',exact:true}).first().click()
  else await page.goBack()
  const guard=page.getByRole('dialog',{name:'Unsaved sample changes',exact:true})
  await expect(guard).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
  await guard.getByRole('button',{name:'Keep editing',exact:true}).click()
  await expect(frame.getByLabel('Meeting opening',{exact:true})).toHaveValue(text)
  if(navigation==='sample link')await page.getByRole('link',{name:'Open sample workspace',exact:true}).first().click()
  else await page.goBack()
  await guard.getByRole('button',{name:'Discard and continue',exact:true}).click()
  await expect(page).toHaveURL(navigation==='sample link'?/\/workspace$/:/\/process$/)
 })
}

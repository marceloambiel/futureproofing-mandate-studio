import {test,expect} from '@playwright/test'

test('product cards stack with scroll and keyboard focus returns to uncovered content',async({page})=>{
 await page.setViewportSize({width:1440,height:1000})
 await page.goto('/#product-value')
 const stack=page.locator('.product-value-features')
 await expect(stack).toHaveAttribute('data-stacked','true')
 const cards=stack.locator(':scope>.product-feature')
 const target=await stack.evaluate(el=>el.getBoundingClientRect().top+scrollY+[...el.children].slice(0,2).reduce((sum,item)=>sum+(item as HTMLElement).offsetHeight+40,0)-120)
 await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),target)
 await expect.poll(async()=>Math.round((await cards.nth(0).boundingBox())!.y)).toBe(88)
 await expect.poll(async()=>Math.round((await cards.nth(1).boundingBox())!.y)).toBe(104)
 await expect.poll(async()=>Math.round((await cards.nth(2).boundingBox())!.y)).toBeLessThanOrEqual(121)
 expect(await cards.nth(0).evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1)
 expect(await cards.nth(0).evaluate(el=>Number(getComputedStyle(el).opacity))).toBeLessThan(.2)
 expect(await cards.nth(0).evaluate(el=>parseFloat(getComputedStyle(el).filter.replace('blur(','')))).toBeGreaterThan(0)
 const tab=cards.nth(0).getByRole('tab',{name:'Current brief',exact:true})
 await tab.focus()
 await expect(tab).toBeFocused()
 await expect.poll(async()=>{
  const first=(await cards.nth(0).boundingBox())!,next=(await cards.nth(1).boundingBox())!
  return next.y>=first.y+first.height
 }).toBe(true)
 await expect(cards.nth(0)).toHaveCSS('opacity','1')
 await expect(cards.nth(0)).toHaveCSS('filter','blur(0px)')
 await page.keyboard.press('ArrowRight')
 await expect(cards.nth(0).getByRole('tab',{name:'Previous brief',exact:true})).toBeFocused()
})

test('stacking stays off for reduced motion, mobile and short viewports',async({page})=>{
 await page.setViewportSize({width:1440,height:1000})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#product-value')
 const stack=page.locator('.product-value-features')
 await expect(stack).not.toHaveAttribute('data-stacked')
 await expect(stack.locator(':scope>.product-feature').first()).toHaveCSS('position','static')
 await page.emulateMedia({reducedMotion:'no-preference'})
 await expect(stack).toHaveAttribute('data-stacked','true')
 await page.setViewportSize({width:390,height:900})
 await expect(stack).not.toHaveAttribute('data-stacked')
 await page.setViewportSize({width:1440,height:600})
 await expect(stack).not.toHaveAttribute('data-stacked')
})

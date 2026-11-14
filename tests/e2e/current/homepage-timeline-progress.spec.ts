import {test,expect} from '@playwright/test'
for(const width of [1440,390])test(`timeline follows scroll progress in both directions at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900})
 await page.goto('/')
 const first=page.locator('.approach-timeline > li').first()
 await first.waitFor()
 const seek=async(progress:number)=>{
  await first.evaluate((el,progress)=>{
   const start=el.getBoundingClientRect().top+scrollY+44,end=el.nextElementSibling!.getBoundingClientRect().top+scrollY
   window.scrollTo({top:start+(end-start)*progress-innerHeight*.55,behavior:'instant'})
  },progress)
 }
 const progress=()=>first.evaluate(el=>Number((el as HTMLElement).style.getPropertyValue('--timeline-progress')))
 await seek(.45)
 await expect.poll(progress).toBeGreaterThan(.4)
 await expect.poll(progress).toBeLessThan(.5)
 await expect(first).toHaveAttribute('data-reached','true')
 await seek(1.2)
 await expect.poll(progress).toBe(1)
 await seek(-.2)
 await expect.poll(progress).toBe(0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
})
test('reduced motion uses discrete rail fills',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#our-process')
 const values=await page.locator('.approach-timeline > li').evaluateAll(items=>items.slice(0,-1).map(el=>Number((el as HTMLElement).style.getPropertyValue('--timeline-progress'))))
 expect(values.every(value=>value===0||value===1)).toBe(true)
})

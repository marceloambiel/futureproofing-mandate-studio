import {test,expect} from '@playwright/test'
import {createSeed,getCurrent,saveContent,markReady} from '../../../src/domain/model'
import {getAssignmentChanges,sampleAssignment} from '../../../src/domain/v2'
import {STORAGE_KEY} from '../../../src/state/persistence'
import {V2_PREFERENCES_KEY} from '../../../src/state/WorkspaceV2Provider'

for(const entry of ['hub','website','website-reduced','hub-new-tab'] as const)test(`external demo entry resets saved completion and choices: ${entry}`,async({page,context})=>{
 await page.emulateMedia({reducedMotion:entry==='website'?'no-preference':'reduce'})
 const route=entry.startsWith('hub')?'/prototype-notes':'/#sample-workspace'
 await page.goto(route)
 if(entry.startsWith('hub')){
  await page.getByLabel('Password',{exact:true}).fill('hiremarcelonow')
  await page.getByRole('button',{name:'View project hub'}).click()
 }
 await expect(page.getByRole('heading',{level:1})).toBeVisible()
 const seed=createSeed()
 const completed=markReady(saveContent(seed,{...getCurrent(seed).content,summary:'Previously saved integration discussion.'}))
 const preferences={schemaVersion:1,includedIds:['B'],acknowledgedChangeIds:getAssignmentChanges().map(change=>change.id),assignmentProgress:{briefVersion:sampleAssignment.current.version,stage:'discussion'}}
 await page.evaluate(({completed,preferences,workspaceKey,preferencesKey})=>{
  localStorage.setItem(workspaceKey,JSON.stringify(completed))
  localStorage.setItem(preferencesKey,JSON.stringify(preferences))
  localStorage.setItem('unrelated-demo-test','preserve')
 },{completed,preferences,workspaceKey:STORAGE_KEY,preferencesKey:V2_PREFERENCES_KEY})
 await page.reload()
 // Visiting the page or loading its inert preview must not reset the sample.
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).currentId,STORAGE_KEY)).toBe('V3')
 const link=entry.startsWith('hub')?page.getByRole('link',{name:/The demo/}):page.getByRole('link',{name:'Start the demo',exact:true})
 await expect(link).toHaveAttribute('href','/workspace?restart=1')
 let demo=page
 if(entry==='hub-new-tab'){
  demo=await context.newPage()
  await demo.goto((await link.getAttribute('href'))!)
 }else await link.click()
 await expect(demo).toHaveURL(/\/workspace$/)
 await expect(demo.getByRole('link',{name:'Review Northline Integration Search update',exact:true})).toBeVisible()
 await expect(demo.locator('.bento-task-list')).toContainText('Northline Integration Search')
 const state=await demo.evaluate(({workspaceKey,preferencesKey})=>({workspace:localStorage.getItem(workspaceKey),preferences:JSON.parse(localStorage.getItem(preferencesKey)??'{}'),other:localStorage.getItem('unrelated-demo-test')}),{workspaceKey:STORAGE_KEY,preferencesKey:V2_PREFERENCES_KEY})
 expect(state.workspace).toBeNull()
 expect(state.preferences.includedIds??['A','B','C']).toEqual(['A','B','C'])
 expect(state.preferences.acknowledgedChangeIds??[]).toEqual([])
 expect(state.preferences.assignmentProgress).toBeUndefined()
 expect(state.other).toBe('preserve')
 await demo.locator('.bento-task-list').getByRole('link',{name:/Northline Integration Search/}).click()
 await demo.getByRole('button',{name:'Match candidates to brief',exact:true}).click()
 await expect(demo.getByRole('heading',{name:'Included profiles',exact:true})).toBeVisible({timeout:10000})
 await demo.reload()
 await expect(demo.getByRole('heading',{name:'Included profiles',exact:true})).toBeVisible()
})

test('canceling the website expansion leaves existing progress intact',async({page})=>{
 await page.goto('/#sample-workspace')
 const start=page.getByRole('link',{name:'Start the demo',exact:true})
 await expect(start).toBeVisible()
 await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:STORAGE_KEY,value:markReady(createSeed())})
 const before=await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)
 await start.click()
 await expect(page.locator('.workspace-demo')).toHaveAttribute('data-opening','true')
 await page.keyboard.press('Escape')
 await expect(page.locator('.workspace-demo')).not.toHaveAttribute('data-opening')
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe(before)
})

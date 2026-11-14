import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {createMemoryRouter,RouterProvider} from 'react-router-dom'
import {AssignmentLayout} from '../../src/features/AssignmentLayout'
import {Assignment} from '../../src/features/Assignment'
import {WorkspaceProvider} from '../../src/state/WorkspaceProvider'
import {WorkspaceV2Provider} from '../../src/state/WorkspaceV2Provider'

let mobile=false
beforeAll(()=>{
 window.matchMedia=vi.fn().mockImplementation((media:string)=>({matches:mobile,media,addEventListener:vi.fn(),removeEventListener:vi.fn()}))
 globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}}
 HTMLElement.prototype.scrollIntoView??=vi.fn()
 HTMLElement.prototype.scrollTo??=vi.fn()
})
afterEach(()=>{cleanup();localStorage.clear();mobile=false})
function mount(){
 const router=createMemoryRouter([{element:<AssignmentLayout/>,children:[{path:'/workspace/assignment',element:<Assignment/>},{path:'/workspace/candidates',element:<h2>Candidate results</h2>}]}],{initialEntries:['/workspace/assignment']})
 return {...render(<WorkspaceProvider><WorkspaceV2Provider><RouterProvider router={router}/></WorkspaceV2Provider></WorkspaceProvider>),router}
}
describe('mobile overview task flow',()=>{
 it('retains the desktop document, expanded information and section layout',()=>{
  const view=mount()
  expect(view.container.querySelector('.assignment-document-reader')).toBeInTheDocument()
  expect(view.container.querySelector('.mobile-assignment-context')).not.toBeInTheDocument()
  expect(view.container.querySelectorAll('.assignment-extracted-section')).toHaveLength(3)
  expect(screen.getByRole('button',{name:'Edit role',exact:true})).toBeVisible()
  expect(view.container.querySelector('.mobile-assignment-action-bar')).not.toBeInTheDocument()
 })
 it('keeps all assignment information available through compact disclosures and the full document',async()=>{
  mobile=true
  const view=mount()
  const context=view.container.querySelector('details.mobile-assignment-context')!
  expect(context).toHaveAttribute('open')
  expect(context).toHaveTextContent('Find a Head of Operations to integrate two acquisitions across 12 locations.')
  expect(context).toHaveTextContent('Caroline S.')
  fireEvent.click(context.querySelector('summary')!)
  expect(context).not.toHaveAttribute('open')
  fireEvent.click(context.querySelector('summary')!)
  expect(context).toHaveAttribute('open')
  expect(within(context as HTMLElement).getByText('Northline Services Group',{exact:true})).toBeVisible()
  const sections=view.container.querySelectorAll('details.mobile-assignment-section')
  expect(sections).toHaveLength(3)
  expect(sections[0]).toHaveAttribute('open')
  expect(sections[1]).not.toHaveAttribute('open')
  expect(sections[2]).not.toHaveAttribute('open')
  fireEvent.click(sections[1].querySelector('summary')!)
  expect(within(sections[1] as HTMLElement).getByText('6 regional operations leaders',{exact:true})).toBeVisible()
  fireEvent.click(screen.getByRole('button',{name:'Open full client brief'}))
  const document=await screen.findByRole('dialog',{name:'Client brief',exact:true})
  expect(within(document).getByRole('heading',{name:'Search process and client contacts'})).toBeVisible()
  fireEvent.click(within(document).getByRole('button',{name:'Close',exact:true}))
  expect(view.container.querySelector('.assignment-document-reader')).not.toBeInTheDocument()
  expect(view.container.querySelector('.mobile-assignment-action-bar')).toContainElement(screen.getByRole('button',{name:'Match candidates to brief',exact:true}))
 })
 it('preserves editing, required review and the next-step generation action',async()=>{
  mobile=true
  const view=mount()
  fireEvent.click(screen.getByRole('button',{name:'Edit search brief',exact:true}))
  const dialog=await screen.findByRole('dialog',{name:'Edit search brief',exact:true})
  fireEvent.change(within(dialog).getByRole('textbox',{name:'Priority',exact:true}),{target:{value:'Review the integration plan with the client.'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Save and require review'}))
  expect(screen.getByText('Fresh review required',{exact:true})).toBeVisible()
  fireEvent.click(screen.getByRole('button',{name:'Review and match candidates',exact:true}))
  const confirmation=await screen.findByRole('dialog',{name:'Confirm updated assignment?'})
  fireEvent.click(within(confirmation).getByRole('button',{name:'Confirm and match candidates',exact:true}))
  expect(view.router.state.location.pathname).toBe('/workspace/candidates')
  expect(view.container.querySelector('details.mobile-assignment-context')).toHaveAttribute('open')
  expect(screen.getByRole('region',{name:'Generating candidates',exact:true})).toBeVisible()
 })
})

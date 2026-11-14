import {lazy, Suspense} from 'react'
import {createBrowserRouter,createMemoryRouter,RouterProvider} from 'react-router-dom'
import {WorkspaceProvider} from '@/state/WorkspaceProvider'
import {WorkspaceEntry} from '@/app/WorkspaceEntry'
import {NotFound} from '@/app/NotFound'
import {Assignment} from '@/features/Assignment'
import {AssignmentLayout} from '@/features/AssignmentLayout'
import {Candidates} from '@/features/Candidates'
import {AssignmentComplete} from '@/features/AssignmentComplete'
import {Discussion} from '@/features/Discussion'
import {WorkspaceHome} from '@/features/WorkspaceHome'
import {WorkspaceV2Provider} from '@/state/WorkspaceV2Provider'
const Home=lazy(()=>import('@/pages/Home').then(module=>({default:module.Home})))
const Process=lazy(()=>import('@/pages/Process').then(module=>({default:module.Process})))
const Experts=lazy(()=>import('@/features/Experts').then(module=>({default:module.Experts})))
const PrototypeNotes=lazy(()=>import('@/features/PrototypeNotes').then(module=>({default:module.PrototypeNotes})))

const routes=[
 {path:'/',element:<Home/>},
 {path:'/workspace',element:<WorkspaceEntry/>,children:[{path:'home',element:<WorkspaceHome/>},{path:'experts',element:<Experts/>},{element:<AssignmentLayout/>,children:[{path:'assignment',element:<Assignment/>},{path:'candidates',element:<Candidates/>},{path:'discussion',element:<Discussion/>},{path:'completed',element:<AssignmentComplete/>}]},{index:true,element:<WorkspaceHome/>}]},
 {path:'/process',element:<Process/>},
 {path:'/prototype-notes',element:<PrototypeNotes/>},
 {path:'*',element:<NotFound/>},
]
// Embedded previews use the same routes without adding child entries to browser history.
const router=window.self!==window.top?createMemoryRouter(routes,{initialEntries:[window.location.pathname+window.location.search]}):createBrowserRouter(routes)
export default function App(){return <WorkspaceProvider><WorkspaceV2Provider><Suspense fallback={<div role="status" className="route-loading">Loading…</div>}><RouterProvider router={router}/></Suspense></WorkspaceV2Provider></WorkspaceProvider>}

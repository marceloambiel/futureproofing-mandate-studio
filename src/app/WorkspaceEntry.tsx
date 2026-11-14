import {useLayoutEffect,useRef} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {useWorkspace} from '@/state/WorkspaceProvider'
import {useWorkspaceV2} from '@/state/WorkspaceV2Provider'
import {Shell} from './Shell'

/** Only an explicit external demo entry starts a new sample session. */
export function WorkspaceEntry(){
 const location=useLocation()
 const navigate=useNavigate()
 const {session}=useWorkspace()
 const {reset}=useWorkspaceV2()
 const handled=useRef<string|null>(null)
 const restart=new URLSearchParams(location.search).get('restart')==='1'
 useLayoutEffect(()=>{
  if(!restart||handled.current===location.key)return
  handled.current=location.key
  session.reset(true)
  reset()
  const search=new URLSearchParams(location.search)
  search.delete('restart')
  navigate({pathname:location.pathname,search:search.toString(),hash:location.hash},{replace:true})
 },[restart,location,navigate,session,reset])
 // Mount the actual workspace after both stores have reset, including notifications.
 return restart?<div role="status" className="route-loading">Starting a fresh demo…</div>:<Shell/>
}

import {useId} from 'react'
import {Popover} from '@base-ui/react/popover'
import {RiUserLine,RiLockLine,RiCloseLine} from '@remixicon/react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import './sign-in-preview.css'

export function SignInPreview(){
 const id=useId()
 return <Popover.Root><Popover.Trigger className="marketing-header-login">Sign in</Popover.Trigger><Popover.Portal><Popover.Positioner side="bottom" align="end" sideOffset={12} collisionPadding={16} className="homepage-signin-positioner"><Popover.Popup className="homepage-signin-popup" data-signin-popup onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation()}}>
  <div className="homepage-signin-heading"><Popover.Title>Sign in</Popover.Title><Popover.Close aria-label="Close sign in"><RiCloseLine aria-hidden="true"/></Popover.Close></div>
  <Popover.Description>Demo preview only. Sign-in is unavailable; no credentials are accepted.</Popover.Description>
  <form onSubmit={event=>event.preventDefault()} autoComplete="off">
   <label htmlFor={`${id}-username`}><RiUserLine aria-hidden="true"/>Username</label><Input id={`${id}-username`} placeholder="Username" autoComplete="off" spellCheck={false}/>
   <label htmlFor={`${id}-password`}><RiLockLine aria-hidden="true"/>Password</label><Input id={`${id}-password`} type="password" placeholder="Password" autoComplete="off"/>
   <Button disabled type="submit">Sign in</Button>
  </form>
 </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>
}

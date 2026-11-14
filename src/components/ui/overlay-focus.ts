import type {KeyboardEvent} from 'react'

/** Keep keyboard traversal within the named popup, including detached trigger cases. */
export function containOverlayFocus(event:KeyboardEvent<HTMLElement>){
 if(event.key!=='Tab'||event.defaultPrevented)return
 const popup=event.currentTarget
 const controls=Array.from(popup.querySelectorAll<HTMLElement>('a[href],button,input,textarea,select,[tabindex]')).filter(el=>el.tabIndex>=0&&!el.matches(':disabled,[aria-hidden="true"],[inert]')&&el.getClientRects().length>0)
 const first=controls[0],last=controls.at(-1),active=document.activeElement
 if(!first){event.preventDefault();popup.focus();return}
 if(event.shiftKey&&(active===first||active===popup)){event.preventDefault();last?.focus()}
 else if(!event.shiftKey&&(active===last||active===popup)){event.preventDefault();first.focus()}
}

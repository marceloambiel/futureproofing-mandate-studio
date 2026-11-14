import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Popover } from '@base-ui/react/popover'
import { RiNotification3Line, RiArrowRightLine } from '@remixicon/react'
import { sampleAssignment } from '@/domain/v2'

export function Notifications({unread}:{unread:boolean}) {
  const [open,setOpen]=useState(false)
  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger className="notification-trigger" aria-label={unread?'Notifications, 1 unread':'Notifications'}>
      <RiNotification3Line aria-hidden="true"/>
      {unread&&<span className="notification-unread-dot" aria-hidden="true"/>}
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner side="bottom" align="end" sideOffset={12} collisionPadding={16} className="notification-positioner">
        <Popover.Popup className="notification-popup">
          <Popover.Title className="sr-only">Notifications</Popover.Title>
          <Link className="notification-item" to="/workspace/assignment" onClick={()=>setOpen(false)}>
            <strong className="notification-item-title">{sampleAssignment.title} mandate updated<span className={`notification-new-tag ${unread?'':'notification-viewed-tag'}`}>{unread?'NEW':'Viewed'}</span></strong>
            <p>The priority has changed to acquisition integration.</p>
            <span className={`notification-action ${unread?'':'notification-action-viewed'}`}>Review update {unread&&<RiArrowRightLine aria-hidden="true"/>}</span>
          </Link>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
}

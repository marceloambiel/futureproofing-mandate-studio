import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiHistoryLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useWorkspace } from '@/state/WorkspaceProvider'
import { getCurrent } from '@/domain/model'

export function VersionComparison() {
  const { state, session, error } = useWorkspace()
  const current = getCurrent(state)
  const earlier = state.versions.find(version => version.id === 'V1')!
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const navigate = useNavigate()
  const close = () => { setOpen(false); setConfirm(false) }
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setConfirm(false) }}>
    <DialogTrigger render={<Button variant="outline" />}><RiHistoryLine aria-hidden="true" />Compare versions</DialogTrigger>
    <DialogContent confirmation={confirm} className={confirm ? 'workspace-dialog' : 'workspace-dialog workspace-version-dialog'}>
      <DialogHeader>
        <DialogTitle>{confirm ? 'Restore mandate section?' : 'Compare versions'}</DialogTitle>
        <DialogDescription>{confirm ? 'Restore V1’s mandate section as a new draft? It reflects the earlier expansion priority and will require fresh review.' : 'The board changed its priority. Historical approval belongs to the earlier version only.'}</DialogDescription>
      </DialogHeader>
      {confirm ? <div className="workspace-dialog-body">
        <div className="workspace-notice"><strong>Only the mandate section will be restored.</strong><p>Current candidate evidence and next questions will stay in the discussion. The board’s mandate remains integration. This action does not transfer approval.</p></div>
        {error && <div role="alert" className="workspace-error-message"><p>We couldn’t restore the section. Your current brief is unchanged.</p>{error === 'unavailable' && <Button variant="outline" onClick={session.continueInMemory}>Continue without saving</Button>}<p>Resolve the issue and try Restore as draft again, or cancel.</p></div>}
      </div> : <div className="workspace-dialog-body">
        <div className="workspace-mandate-strip"><strong>Current board priority</strong><span>Integrate two acquisitions</span></div>
        <div className="workspace-version-pair">
          <section className="workspace-version-pane"><p className="workspace-eyebrow">V1 · Earlier approved</p><h2>Geographic expansion</h2><p className="workspace-summary">{earlier.content.summary}</p><p className="workspace-muted">Historical mandate excerpt only. No earlier candidate recommendation was supplied.</p></section>
          <section className="workspace-version-pane workspace-version-current"><p className="workspace-eyebrow">{current.id} · {current.status === 'ready' ? 'Ready for review' : 'Current draft'}</p><h2>{current.content.alignment === 'integration' ? 'Acquisition integration' : 'Restored expansion priority'}</h2><p className="workspace-summary">{current.content.summary}</p><p className="workspace-muted">{current.restoredFrom ? `Restored from ${current.restoredFrom}. Fresh review required.` : 'The current discussion has not been approved.'}</p></section>
        </div>
        <p className="workspace-change-note"><strong>Priority changed:</strong> geographic expansion → integrating two recent acquisitions. The operating context remains twelve locations, with a start target within sixty days.</p>
      </div>}
      <DialogFooter>
        {confirm ? <><Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={() => { if (session.restore('V1')) { close(); navigate('/workspace/discussion') } }}>Restore as draft</Button></> : <><Button variant="outline" onClick={() => setConfirm(true)}>Restore this mandate section as draft</Button><Button onClick={close}>Return to current draft</Button></>}
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

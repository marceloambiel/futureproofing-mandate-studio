import { RiHistoryLine } from '@remixicon/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { clientBriefDocuments, type ClientBriefDocumentRecord } from '@/domain/v2'

const historyTime=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Chicago'})
export function FieldHistory({label,valueFor}:{label:string;valueFor:(document:ClientBriefDocumentRecord)=>string|undefined}) {
  return <span className="assignment-changed-field"><span className="notification-new-tag">NEW</span><Dialog>
    <DialogTrigger className="assignment-history-icon" aria-label={`View past versions of ${label.toLowerCase()}`} title={`View past versions of ${label.toLowerCase()}`}><RiHistoryLine aria-hidden="true"/></DialogTrigger>
    <DialogContent className="workspace-dialog field-history-dialog"><DialogHeader><DialogTitle>{label} history</DialogTitle><DialogDescription className="sr-only">Current and previous values from the client brief, newest first.</DialogDescription></DialogHeader>
      <div className="field-history-list">{clientBriefDocuments.map((document,index)=><section key={document.version} className={index?'field-history-entry field-history-past':'field-history-entry'}><h3>{index?'Past version':'Current'}</h3><div className="field-history-value"><p>{valueFor(document)??'Not provided in this version.'}</p><div className="field-history-source"><span>{document.version}</span><time dateTime={document.recordedAt}>{historyTime.format(new Date(document.recordedAt))} CST</time></div></div></section>)}</div>
    </DialogContent>
  </Dialog></span>
}

import type { ReactNode } from 'react'
import { RiFileTextLine, RiArrowRightLine } from '@remixicon/react'
import './mobile-document-preview.css'

export function MobileDocumentPreview({label,action,onOpen,children}:{label:string;action:string;onOpen:()=>void;children:ReactNode}){
 return <div className="mobile-document-preview"><div className="mobile-document-preview-paper" aria-hidden="true">{children}</div><div className="mobile-document-preview-action"><RiFileTextLine aria-hidden="true"/><span>{action}</span><RiArrowRightLine aria-hidden="true"/></div><button type="button" aria-label={label} onClick={onOpen}/></div>
}

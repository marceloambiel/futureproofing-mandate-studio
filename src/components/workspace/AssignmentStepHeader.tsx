import type { ReactNode } from 'react'
import './assignment-step-header.css'

export function AssignmentStepHeader({title,task,children}:{title:string;task:string;children?:ReactNode}){
 return <header className="assignment-step-header"><h2 data-step-result-heading tabIndex={-1}>{title}</h2><p>{task}</p>{children}</header>
}

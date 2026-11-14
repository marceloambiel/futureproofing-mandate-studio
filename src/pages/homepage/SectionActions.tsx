import {Link} from 'react-router-dom'
import {RiArrowRightLine} from '@remixicon/react'
import {Button} from '@/components/ui/button'
import './section-actions.css'

export type ConversationAction={onRequestConversation:()=>void}
export function SectionActions({onRequestConversation,primary,secondary}:{primary:string;secondary:string}&ConversationAction){
 return <div className="homepage-section-actions"><Button onClick={onRequestConversation}>{primary}</Button><Link to="/workspace?restart=1">{secondary}<RiArrowRightLine aria-hidden="true"/></Link></div>
}

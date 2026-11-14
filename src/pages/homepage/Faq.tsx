import {Button} from '@/components/ui/button'
import type {ConversationAction} from './SectionActions'
import './faq.css'

const questions=[
 {question:'What leadership challenges do you support?',answer:'Mandate focuses on executive-search questions around growth, acquisition integration, business transformation, and critical leadership transitions.'},
 {question:'How do you handle a changing brief?',answer:'Requirements can evolve as the business changes. Versioned briefs keep earlier priorities visible so the search can be reviewed against the current need.'},
 {question:'How are candidates assessed?',answer:'Relevant experience is considered alongside the role requirements and operating context. Supplied evidence, unverified claims, and unanswered questions stay distinct.'},
 {question:'Where does AI help?',answer:'AI helps organize existing information and prepare discussion drafts. Consultants review the evidence, refine the document, and remain responsible for recommendations.'},
 {question:'Can I try the demo without an account?',answer:'Yes. The demo opens Mandate Studio with fictional data and no account. Progress stays in your browser, and Reset lets you start again.'},
] as const

export function Faq({onRequestConversation}:ConversationAction){
 return <section id="faq" className="homepage-section homepage-faq" data-nav-theme="light" aria-labelledby="homepage-faq-title"><div className="homepage-container"><div className="homepage-faq-content">
  <h2 id="homepage-faq-title" className="homepage-heading">Common questions</h2>
  <div className="homepage-faq-list">{questions.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  <div className="homepage-faq-contact"><p>Still have questions?</p><Button variant="ghost" onClick={onRequestConversation}>Contact us</Button></div>
 </div></div></section>
}

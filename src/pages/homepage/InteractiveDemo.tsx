import { GuidedDemo } from '@/components/workspace/GuidedDemo'
import './interactive-demo.css'

export function InteractiveDemo({ onRequestConversation }: { onRequestConversation: () => void }) {
  return <section id="sample-workspace" data-nav-theme="light" className="homepage-section interactive-demo" aria-labelledby="interactive-demo-title">
    <div className="homepage-container">
      <header className="interactive-demo-intro"><p className="eyebrow">Experience Mandate Studio</p><h2 id="interactive-demo-title" className="homepage-heading">A last-minute change to the brief. What would you do next?</h2><p className="homepage-copy">Step into the role of an executive-search consultant. Your client has just changed the requirements for a critical leadership appointment. Reassess the candidates, navigate the trade-offs, and prepare the next discussion.</p></header>
      <GuidedDemo onRequestConversation={onRequestConversation}/>
    </div>
  </section>
}

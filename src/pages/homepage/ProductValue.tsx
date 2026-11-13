import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { EvidenceLabel } from '@/components/workspace/CandidateProfile'
import './product-value.css'

// Read-only, anonymized adapters of the real product layouts. No assignment data,
// provider, candidate scoring, editor commands or persistence is duplicated here.
export function BriefShowcase() {
  const [version, setVersion] = useState<'current' | 'previous'>('current')
  return <div className="product-interface product-brief" aria-label="Client brief and requirements interface illustration">
    <div className="product-interface-bar"><span>Client brief</span><span>Interface illustration</span></div>
    <div className="product-brief-grid">
      <article className="client-brief-document product-document" aria-label={`${version === 'current' ? 'Current' : 'Previous'} illustrative brief`}>
        <header className="client-brief-paper-title"><h4>Executive search brief</h4><p>Leadership priorities</p></header>
        <div className="client-brief-body"><section><h5>Business context</h5><p>{version === 'current' ? 'As business priorities evolve, review the experience and leadership responsibilities the appointment calls for.' : 'Start with the organization’s direction, operating context and the responsibilities of the next leader.'}</p></section>
          <section><h5>Experience and capabilities</h5><p>Clarify relevant experience, decision-making responsibility and the questions to explore with each candidate.</p></section>
          <section><h5>Discussion priorities</h5><p>Keep the reasons behind the requirements visible throughout the search.</p></section></div>
      </article>
      <aside className="product-brief-details" aria-label="Requirements and version history illustration">
        <h4>Brief breakdown</h4><dl><div><dt>Search priorities</dt><dd>{version === 'current' ? 'Aligned to the latest business direction' : 'Initial leadership requirements'}</dd></div><div><dt>Relevant experience</dt><dd>Responsibilities, context and capabilities</dd></div></dl>
        <div className="product-version-history"><h4>Version history</h4><p>Keep earlier context in view.</p><div className="product-version-buttons" role="group" aria-label="Illustrative brief versions">
          <Button variant="ghost" aria-pressed={version === 'current'} onClick={() => setVersion('current')}>Current brief<span>Latest priorities</span></Button>
          <Button variant="ghost" aria-pressed={version === 'previous'} onClick={() => setVersion('previous')}>Previous brief<span>Earlier context</span></Button>
        </div></div>
      </aside>
    </div>
  </div>
}

export function CandidateMatrixPreview() {
  return <div className="product-matrix"><h4>Candidate comparison</h4><table className="v2-comparison-table"><caption className="sr-only">Illustrative comparison structure; no candidate results are represented.</caption><thead><tr><th scope="col">Role criteria</th><th scope="col">Evidence to examine</th></tr></thead><tbody>
        <tr><th scope="row">Relevant experience</th><td><span className="product-evidence-label">Supplied material</span><p>Responsibilities and operating context</p></td></tr>
        <tr><th scope="row">Leadership scope</th><td><EvidenceLabel kind="unverified"/><p>Clarify personal ownership</p></td></tr>
        <tr><th scope="row">Open questions</th><td><EvidenceLabel kind="unknown"/><p>Carry unanswered questions into discussion</p></td></tr>
      </tbody></table></div>
}

export function CandidateProfilePreview() {
  return <aside className="product-profile-drawer" aria-label="Read-only candidate profile drawer excerpt">
        <header className="candidate-full-header"><p>Profile excerpt</p><h4>Relevant experience</h4><span>Review responsibilities in context</span></header>
        <div className="candidate-profile-nav product-profile-nav" aria-label="Profile section labels"><span className="product-profile-active">Experience</span><span>Education</span><span>Projects</span><span>Skill Map</span></div>
        <div className="candidate-full-content"><article className="profile-career-record"><h5>Leadership responsibility</h5><p className="profile-record-meta">Career history · supplied information</p><div className="profile-record-description"><p>Examine the decisions the person owned, the teams they led and the context in which they worked.</p></div></article>
          <div className="product-profile-question"><span>Question for discussion</span><p>What was their personal responsibility, and what still needs verification?</p></div></div>
      </aside>
}

function CandidateShowcase() {
  return <div className="product-interface product-candidates" aria-label="Profile drawer and comparison interface illustration">
    <div className="product-interface-bar"><span>Candidate evaluation</span><span>Interface illustration</span></div>
    <div className="product-candidate-grid"><CandidateMatrixPreview/><CandidateProfilePreview/></div>
  </div>
}

export function DiscussionShowcase() {
  return <div className="product-interface product-discussion" aria-label="Read-only discussion brief editor interface illustration">
    <div className="product-interface-bar"><span>Discussion brief</span><span>Draft · human review required</span></div>
    <div className="discussion-doc-toolbar product-editor-toolbar" aria-label="Read-only editor toolbar illustration"><span>11 pt</span><span className="product-toolbar-tools" aria-hidden="true"><b>B</b><i>I</i><u>U</u></span><span>Version history</span></div>
    <article className="discussion-doc-editor product-document" aria-label="Illustrative discussion document">
      <header><p className="product-document-kicker">AI-assisted draft · Review and edit in the workspace</p><h4>Leadership discussion brief</h4><p>Bring the evidence and the questions into one conversation.</p></header>
      <section><h5>1. Leadership priorities</h5><p>Confirm the business direction and the experience the role now calls for.</p></section>
      <section><h5>2. Evidence and trade-offs</h5><p>Consider relevant experience alongside its context, limitations and areas that need verification.</p></section>
      <section><h5>3. Questions to explore</h5><ul><li>Which responsibilities did the candidate personally own?</li><li>What further evidence would inform the discussion?</li></ul></section>
      <section><h5>4. Review before sharing</h5><p>Refine the document, save a version and prepare it for human review.</p></section>
    </article>
  </div>
}

export function ProductValue() {
  const id = useId()
  return <section id="product-value" className="homepage-section product-value" aria-labelledby={`${id}-title`}>
    <div className="homepage-container">
      <header className="product-value-intro"><p className="eyebrow">A connected approach</p><h2 id={`${id}-title`} className="homepage-heading">Better understanding. Better conversations. More informed decisions.</h2><p className="homepage-copy">The right leadership decision takes more than a shortlist. Mandate connects evolving requirements, candidate evidence, and professional judgment throughout the search.</p></header>
      <div className="product-value-features">
        <article className="product-feature product-feature-brief"><div className="product-feature-copy"><p className="product-feature-number">01 / Evolving requirements</p><h3>A brief that evolves with your business</h3><p>Keep requirements clear, understand changing priorities, and preserve the context behind every search.</p></div><BriefShowcase/></article>
        <article className="product-feature product-feature-candidates"><div className="product-feature-copy"><p className="product-feature-number">02 / Candidate evidence</p><h3>Go deeper than candidate profiles</h3><p>Examine relevant experience, compare capabilities, and understand what still needs verification.</p></div><CandidateShowcase/></article>
        <article className="product-feature product-feature-discussion"><div className="product-feature-copy"><p className="product-feature-number">03 / Useful discussion</p><h3>Turn research into meaningful conversations</h3><p>Bring findings, trade-offs, and outstanding questions together in a discussion ready for review.</p></div><DiscussionShowcase/></article>
      </div>
      <p className="product-value-note">Read-only interface excerpts with illustrative copy. Explore the sample workspace to use the complete workflow.</p>
    </div>
  </section>
}

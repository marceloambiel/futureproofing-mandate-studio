import { RiArrowRightLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import "./final-conversation.css"

export function FinalConversation({
  onRequestConversation,
}: {
  onRequestConversation: () => void
}) {
  return (
    <section
      id="conversation"
      className="homepage-section final-conversation homepage-final-conversation"
      data-nav-theme="dark"
      aria-labelledby="final-conversation-title"
    >
      <div className="homepage-container">
        <h2 id="final-conversation-title" className="homepage-heading">
          Let's find the leadership your next chapter needs.
        </h2>
        <p className="homepage-copy">
          Tell us about the business challenge, the role, and what's changing.
          We'll start with the questions that matter.
        </p>
        <div className="homepage-final-actions">
          <Button size="lg" onClick={onRequestConversation}>
            Request a conversation
            <RiArrowRightLine aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}

import { WorkspaceDemo } from "@/components/workspace/WorkspaceDemo"
import "./interactive-demo.css"

export function InteractiveDemo() {
  return (
    <section
      id="sample-workspace"
      data-nav-theme="light"
      className="homepage-section interactive-demo"
      aria-labelledby="interactive-demo-title"
    >
      <div className="homepage-container">
        <header className="interactive-demo-intro">
          <h2 id="interactive-demo-title" className="homepage-heading">
            Explore the demo
          </h2>
          <p className="homepage-copy">
            A last-minute change to the brief. What would you do next?
            <br />
            Learn how Mandate Studio helps you navigate this problem.
          </p>
        </header>
        <WorkspaceDemo />
      </div>
    </section>
  )
}

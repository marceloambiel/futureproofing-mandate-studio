import { useEffect, useRef } from "react"
import "./assignment-generation.css"

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <span className="generation-skeleton-line" style={{ width }} />
}
export function AssignmentGeneration({
  kind,
}: {
  kind: "candidates" | "discussion"
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [])
  return (
    <section
      className="assignment-generation"
      aria-busy="true"
      aria-label={
        kind === "candidates"
          ? "Generating candidates"
          : "Generating discussion brief"
      }
    >
      <div className="generation-heading" role="status" aria-live="polite">
        <span className="generation-brand">
          <span className="generation-orbit" />
          <img src="/brand/mandate-studio-icon.svg" alt="" />
        </span>
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {kind === "candidates"
              ? "Finding matching candidates"
              : "Generating your discussion brief"}
          </h2>
          <p>
            {kind === "candidates"
              ? "Using the client brief to match experience, location and availability."
              : "Bringing together the latest client brief, selected candidates and open questions."}
          </p>
        </div>
      </div>
      {kind === "candidates" ? (
        <div className="generation-candidate-list" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div className="generation-candidate" key={index}>
              <div className="generation-candidate-header">
                <span className="generation-avatar generation-skeleton-line" />
                <div>
                  <SkeletonLine width="35%" />
                  <SkeletonLine width="65%" />
                </div>
              </div>
              <SkeletonLine width="75%" />
              <SkeletonLine />
              <SkeletonLine width="55%" />
            </div>
          ))}
          <div className="generation-comparison">
            <SkeletonLine width="30%" />
            {[0, 1, 2].map((index) => (
              <div key={index}>
                {[0, 1, 2, 3].map((cell) => (
                  <SkeletonLine key={cell} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="generation-document-layout" aria-hidden="true">
          <div>
            <div className="generation-toolbar">
              <SkeletonLine width="45%" />
              <SkeletonLine width="25%" />
            </div>
            <div className="generation-paper">
              <SkeletonLine width="70%" />
              <SkeletonLine width="45%" />
              {[0, 1, 2, 3].map((index) => (
                <div className="generation-document-section" key={index}>
                  <SkeletonLine width="40%" />
                  <SkeletonLine />
                  <SkeletonLine />
                  <SkeletonLine width="80%" />
                </div>
              ))}
            </div>
          </div>
          <aside className="generation-note">
            <SkeletonLine width="65%" />
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine width="70%" />
          </aside>
        </div>
      )}
    </section>
  )
}

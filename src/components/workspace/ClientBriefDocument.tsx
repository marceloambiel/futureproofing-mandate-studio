import type { ClientBriefDocumentRecord } from "@/domain/v2"

const documentDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "America/Chicago",
})
export function ClientBriefDocument({
  document,
}: {
  document: ClientBriefDocumentRecord
}) {
  return (
    <article
      className="client-brief-document"
      aria-label={`${document.version} · ${document.label}`}
    >
      <header className="client-brief-paper-title">
        <h2>Executive search brief</h2>
        <p>Northline Services Group — Head of Operations</p>
      </header>
      <p className="client-brief-author">
        {document.from}
        <br />
        {documentDate.format(new Date(document.recordedAt))}
      </p>
      <div className="client-brief-body">
        {document.sections.map((section) => (
          <section key={section.id}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}

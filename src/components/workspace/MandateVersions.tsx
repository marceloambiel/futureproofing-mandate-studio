import { useLayoutEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { clientBriefDocuments } from "@/domain/v2"
import {
  RiHistoryLine,
  RiArrowLeftLine,
  RiFileTextLine,
  RiArrowRightLine,
} from "@remixicon/react"
import { ClientBriefDocument } from "./ClientBriefDocument"

const documentTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Chicago",
})
export function MandateVersions({ iconOnly = false }: { iconOnly?: boolean }) {
  const [reading, setReading] = useState<string | null>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const previewRefs = useRef(new Map<string, HTMLButtonElement>())
  const lastReading = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (reading) backRef.current?.focus()
    else if (lastReading.current) {
      const preview = previewRefs.current.get(lastReading.current)
      if (preview?.isConnected) preview.focus()
    }
    lastReading.current = reading
  }, [reading])
  const document = clientBriefDocuments.find((item) => item.version === reading)
  return (
    <Dialog onOpenChange={() => setReading(null)}>
      <DialogTrigger
        className={
          iconOnly ? "assignment-history-icon" : "mandate-versions-trigger"
        }
        aria-label={iconOnly ? "View past versions of client brief" : undefined}
        title={iconOnly ? "View past versions of client brief" : undefined}
      >
        <RiHistoryLine aria-hidden="true" />
        {!iconOnly && "View past versions"}
      </DialogTrigger>
      <DialogContent
        className={`workspace-dialog mandate-versions-dialog ${document ? "brief-version-reading" : ""}`}
      >
        <DialogHeader>
          <DialogTitle>
            {document
              ? `${document.label} · ${document.version}`
              : "Client brief versions"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Read the client documents, newest first.
          </DialogDescription>
        </DialogHeader>
        {document ? (
          <>
            <button
              ref={backRef}
              type="button"
              className="brief-versions-back"
              onClick={() => setReading(null)}
            >
              <RiArrowLeftLine aria-hidden="true" />
              All versions
            </button>
            <div
              className="brief-version-document"
              tabIndex={0}
              role="region"
              aria-label={`${document.label} full document`}
            >
              <ClientBriefDocument document={document} />
            </div>
          </>
        ) : (
          <div className="mandate-versions-list">
            {clientBriefDocuments.map((item, index) => (
              <div
                className={`client-brief-history-group ${index ? "client-brief-history-past" : ""}`}
                key={item.version}
              >
                <span className="client-brief-history-tag">
                  {index ? "Past versions" : "Current"}
                </span>
                <button
                  ref={(node) => {
                    if (node) previewRefs.current.set(item.version, node)
                    else previewRefs.current.delete(item.version)
                  }}
                  type="button"
                  className="brief-version-preview"
                  onClick={() => setReading(item.version)}
                  aria-label={`Read ${item.label.toLowerCase()} ${item.version}`}
                >
                  <span className="brief-preview-title">
                    <RiFileTextLine aria-hidden="true" />
                    {item.label} · {item.version}
                    <RiArrowRightLine aria-hidden="true" />
                  </span>
                  <span className="brief-preview-meta">
                    {documentTime.format(new Date(item.recordedAt))} CST ·{" "}
                    {item.from}
                  </span>
                  <span className="brief-preview-section">
                    <span className="brief-preview-section-title">
                      {item.sections[0].title}
                    </span>
                    {item.sections[0].paragraphs.map((paragraph) => (
                      <span className="brief-preview-copy" key={paragraph}>
                        {paragraph}
                      </span>
                    ))}
                  </span>
                  <span className="brief-preview-read">
                    Read full document · {item.sections.length} sections
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

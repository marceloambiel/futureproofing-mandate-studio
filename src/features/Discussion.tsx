import { AssignmentStepHeader } from "@/components/workspace/AssignmentStepHeader"
import type { ComponentPropsWithoutRef, RefObject } from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useMobileLayout } from "@/hooks/use-mobile-layout"
import { MobileDocumentPreview } from "@/components/workspace/MobileDocumentPreview"
import {
  Link,
  useNavigate,
  useBeforeUnload,
  useBlocker,
  useSearchParams,
  useLocation,
} from "react-router-dom"
import {
  RiSendPlaneFill,
  RiSparklingLine,
  RiBold,
  RiItalic,
  RiUnderline,
  RiListUnordered,
  RiListOrdered,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiHistoryLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  candidates,
  canMarkReady,
  contentValid,
  getCurrent,
} from "@/domain/model"
import {
  applyDocumentFontSize,
  documentFontSizes,
  normalizeTypedFontSize,
} from "@/domain/document-font-size"
import {
  buildDiscussionDocument,
  readDiscussionFields,
  sanitizeDiscussionHtml,
} from "@/domain/discussion-document"
import { useWorkspace } from "@/state/WorkspaceProvider"
import { useWorkspaceV2 } from "@/state/WorkspaceV2Provider"
import { CandidateFullProfile } from "@/components/workspace/CandidateFullProfile"
import "./workspace.css"
import "./discussion-document.css"

const tools = [
  ["bold", "Bold", RiBold],
  ["italic", "Italic", RiItalic],
  ["underline", "Underline", RiUnderline],
  ["insertUnorderedList", "Bulleted list", RiListUnordered],
  ["insertOrderedList", "Numbered list", RiListOrdered],
  ["undo", "Undo", RiArrowGoBackLine],
  ["redo", "Redo", RiArrowGoForwardLine],
] as const

function DiscussionEditor({
  html,
  editorRef,
  ...props
}: {
  html: string
  editorRef: RefObject<HTMLDivElement | null>
} & ComponentPropsWithoutRef<"div">) {
  useLayoutEffect(() => {
    const element = editorRef.current
    if (element && document.activeElement !== element)
      element.innerHTML = sanitizeDiscussionHtml(html)
  }, [html, editorRef])
  return <div ref={editorRef} {...props} />
}

function DocumentHistory({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, dirty, session } = useWorkspace()
  const [reading, setReading] = useState<string | null>(null)
  const version =
    state.versions.find((item) => item.id === reading) ?? getCurrent(state)
  function restore() {
    if (session.restore("V1")) {
      setReading(null)
      onClose()
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setReading(null)
          onClose()
        }
      }}
    >
      <DialogContent className="workspace-dialog discussion-history-dialog">
        <DialogHeader>
          <DialogTitle>Discussion brief versions</DialogTitle>
          <DialogDescription className="sr-only">
            Saved versions, newest first. Select a version to read it.
          </DialogDescription>
        </DialogHeader>
        <div className="discussion-history-layout">
          <nav aria-label="Discussion versions">
            {[...state.versions].reverse().map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={version.id === item.id}
                onClick={() => setReading(item.id)}
              >
                Version {item.sequence}
                <span>
                  {item.id === state.currentId
                    ? "Current"
                    : item.status === "earlier-approved"
                      ? "Earlier approved"
                      : item.status === "ready"
                        ? "Sent for review"
                        : "Past draft"}
                </span>
              </button>
            ))}
          </nav>
          <div className="discussion-history-document">
            <div
              className="discussion-doc-editor discussion-doc-readonly"
              dangerouslySetInnerHTML={{
                __html: sanitizeDiscussionHtml(
                  version.content.documentHtml ??
                    buildDiscussionDocument(version.content)
                ),
              }}
            />
          </div>
        </div>
        {version.id === "V1" && (
          <div className="discussion-history-actions">
            <Button variant="outline" disabled={dirty} onClick={restore}>
              Restore original mandate as a draft
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function Discussion() {
  const activePage = useLocation().pathname === "/workspace/discussion"
  const navigate = useNavigate()
  const mobile = useMobileLayout()
  const [documentOpen, setDocumentOpen] = useState(false)
  const closeAfterDiscard = useRef(false)
  const editorHeader = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const header = editorHeader.current
    if (!header) return
    const update = () =>
      header
        .closest<HTMLElement>(".mobile-discussion-editor")
        ?.style.setProperty(
          "--editor-header-height",
          `${header.getBoundingClientRect().height}px`
        )
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => observer.disconnect()
  }, [documentOpen, mobile])
  const {
    state,
    working,
    dirty,
    error,
    recovery,
    conflict,
    session,
    persistence,
  } = useWorkspace()
  const { includedIds, assignmentDetails } = useWorkspaceV2()
  const detailsRevision = assignmentDetails?.revision ?? 0
  const current = getCurrent(state)
  const profiles = candidates.filter((candidate) =>
    includedIds.includes(candidate.id)
  )
  const activeContent = working ?? current.content
  const html =
    activeContent.documentHtml ??
    buildDiscussionDocument(activeContent, profiles, assignmentDetails)
  const editor = useRef<HTMLDivElement>(null)
  const savedSelection = useRef<Range | null>(null)
  const typingFontSize = useRef(11)
  const [fontSize, setFontSize] = useState(11)
  const [history, setHistory] = useState(false)
  const [discardRequested, setDiscardRequested] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const reviewTrigger = useRef<HTMLButtonElement>(null)
  const reviewCancel = useRef<HTMLButtonElement>(null)
  const [params, setParams] = useSearchParams()
  const selected = activePage
    ? candidates.find((candidate) => candidate.id === params.get("candidate"))
    : undefined
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
  )
  useBeforeUnload((event) => {
    if (dirty) {
      event.preventDefault()
      event.returnValue = ""
    }
  })
  const armedScenario = useRef(false)
  const scenario = params.get("scenario") === "save-failure"
  useEffect(() => {
    if (scenario && !armedScenario.current) {
      armedScenario.current = true
      session.failNextSave()
    }
  }, [scenario, session])

  useEffect(() => {
    const remember = () => {
      const selection = window.getSelection()
      if (
        selection?.rangeCount &&
        editor.current?.contains(
          selection.getRangeAt(0).commonAncestorContainer
        )
      )
        savedSelection.current = selection.getRangeAt(0).cloneRange()
    }
    document.addEventListener("selectionchange", remember)
    return () => document.removeEventListener("selectionchange", remember)
  }, [])
  const invalid = attempted && !contentValid(working ?? current.content)
  const stale =
    detailsRevision > (current.content.assignmentDetailsRevision ?? 0)
  const ready = current.status === "ready" && working === null && !stale
  const readiness = canMarkReady(state)
  const discardOpen = discardRequested || blocker.state === "blocked"
  function recordChanges() {
    if (editor.current && !ready) {
      normalizeTypedFontSize(editor.current, typingFontSize.current)
      session.beginEdit()
      session.changeWorking(readDiscussionFields(editor.current))
      setAttempted(false)
    }
  }
  function restoreSelection() {
    const element = editor.current
    if (!element) return
    element.focus({ preventScroll: true })
    const selection = window.getSelection()
    if (!selection) return
    let range = savedSelection.current
    if (!range || !element.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      range.selectNodeContents(element)
      range.collapse(false)
    }
    selection.removeAllRanges()
    selection.addRange(range)
  }
  function rememberSelection() {
    const selection = window.getSelection()
    if (
      !selection?.rangeCount ||
      !editor.current?.contains(selection.getRangeAt(0).commonAncestorContainer)
    )
      return
    const range = selection.getRangeAt(0)
    savedSelection.current = range.cloneRange()
    const node =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement
    if (node) {
      const pixels = parseFloat(getComputedStyle(node).fontSize)
      if (Number.isFinite(pixels)) {
        const points = Math.round(pixels * 0.75 * 2) / 2
        setFontSize(points)
        typingFontSize.current = points
      }
    }
  }
  function changeFontSize(points: number) {
    if (ready || !editor.current) return
    restoreSelection()
    typingFontSize.current = points
    setFontSize(points)
    applyDocumentFontSize(editor.current, points)
    recordChanges()
  }
  function format(command: string) {
    if (ready) return
    restoreSelection()
    document.execCommand(command)
    recordChanges()
  }
  function save() {
    if (editor.current) {
      session.beginEdit()
      session.changeWorking({
        ...readDiscussionFields(editor.current),
        assignmentDetailsRevision: detailsRevision,
      })
    } else if (working)
      session.changeWorking({ assignmentDetailsRevision: detailsRevision })
    setAttempted(true)
    if (session.save()) {
      setAttempted(false)
      setDiscardRequested(false)
      if (closeAfterDiscard.current || (mobile && documentOpen)) {
        closeAfterDiscard.current = false
        setDocumentOpen(false)
      }
      if (blocker.state === "blocked") blocker.proceed()
    }
  }
  function sendForReview() {
    if (stale || assignmentDetails?.requiresReview) return
    if (!current.content.documentHtml) {
      if (editor.current) {
        session.beginEdit()
        session.changeWorking(readDiscussionFields(editor.current))
        if (!session.save()) return
      }
    }
    if (session.getSnapshot().dirty) return
    session.cancelEdit()
    if (session.ready()) {
      setReviewOpen(false)
      navigate("/workspace/completed")
    }
  }
  function closeDocument() {
    if (dirty) {
      closeAfterDiscard.current = true
      setDiscardRequested(true)
    } else setDocumentOpen(false)
  }
  function keepEditing() {
    closeAfterDiscard.current = false
    setDiscardRequested(false)
    if (blocker.state === "blocked") blocker.reset()
  }
  function discard() {
    if (closeAfterDiscard.current) {
      closeAfterDiscard.current = false
      setDocumentOpen(false)
    }
    session.cancelEdit()
    setAttempted(false)
    setDiscardRequested(false)
    if (editor.current)
      editor.current.innerHTML = sanitizeDiscussionHtml(
        current.content.documentHtml ??
          buildDiscussionDocument(current.content, profiles)
      )
    if (blocker.state === "blocked") blocker.proceed()
  }
  function closeProfile() {
    const next = new URLSearchParams(params)
    next.delete("candidate")
    setParams(next)
  }
  const saveAction = (
    <Button
      variant={mobile ? "default" : "outline"}
      disabled={
        conflict ||
        (!ready && !dirty && !stale && !!current.content.documentHtml)
      }
      onClick={
        ready
          ? () => {
              session.beginEdit()
              requestAnimationFrame(() =>
                editor.current?.focus({ preventScroll: true })
              )
            }
          : save
      }
    >
      {ready
        ? "Edit as new draft"
        : error === "save-failed" || error === "unavailable"
          ? "Retry save"
          : "Save changes"}
    </Button>
  )
  const documentEditor = (
    <>
      <div
        className="discussion-doc-toolbar"
        role="toolbar"
        aria-label="Document formatting"
      >
        <div className="discussion-doc-format-tools">
          <label className="discussion-font-size">
            <span className="sr-only">Font size</span>
            <select
              aria-label="Font size"
              value={fontSize}
              disabled={ready}
              onChange={(event) => changeFontSize(Number(event.target.value))}
            >
              {!documentFontSizes.some((size) => size === fontSize) && (
                <option value={fontSize}>{fontSize}</option>
              )}
              {documentFontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span aria-hidden="true">pt</span>
          </label>
          <span className="discussion-toolbar-divider" aria-hidden="true" />
          {mobile ? (
            <>
              <select
                className="discussion-format-group"
                aria-label="Text style"
                value=""
                disabled={ready}
                onChange={(event) => format(event.target.value)}
              >
                <option value="" disabled>
                  Aa
                </option>
                {tools.slice(0, 3).map(([command, label]) => (
                  <option key={command} value={command}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="discussion-format-group"
                aria-label="List style"
                value=""
                disabled={ready}
                onChange={(event) => format(event.target.value)}
              >
                <option value="" disabled>
                  List
                </option>
                {tools.slice(3, 5).map(([command, label]) => (
                  <option key={command} value={command}>
                    {label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          {(mobile ? tools.slice(5) : tools).map(([command, label, Icon]) => (
            <button
              key={command}
              type="button"
              aria-label={label}
              title={label}
              disabled={ready}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => format(command)}
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="discussion-doc-toolbar-actions">
          {!mobile && dirty && (
            <button
              type="button"
              className="discussion-history-trigger"
              onClick={() => setDiscardRequested(true)}
            >
              Discard changes
            </button>
          )}
          <button
            type="button"
            className="discussion-history-trigger"
            aria-label="View past versions"
            title="View past versions"
            onClick={() => setHistory(true)}
          >
            <RiHistoryLine aria-hidden="true" />
            {!mobile && "View past versions"}
          </button>
          {!mobile && saveAction}
        </div>
      </div>
      <div className="discussion-doc-paper">
        <DiscussionEditor
          html={html}
          editorRef={editor}
          className="discussion-doc-editor"
          role="textbox"
          aria-label="Discussion brief document"
          aria-multiline="true"
          aria-invalid={invalid || undefined}
          contentEditable={!ready}
          aria-readonly={ready}
          tabIndex={ready ? 0 : undefined}
          suppressContentEditableWarning
          spellCheck
          onFocus={() => {
            if (!ready) session.beginEdit()
          }}
          onInput={recordChanges}
          onMouseUp={rememberSelection}
          onKeyUp={rememberSelection}
          onPaste={(event) => {
            event.preventDefault()
            if (ready) return
            document.execCommand(
              "insertText",
              false,
              event.clipboardData.getData("text/plain")
            )
            recordChanges()
          }}
          onKeyDown={(event) => {
            if (
              (event.metaKey || event.ctrlKey) &&
              event.key.toLowerCase() === "s"
            ) {
              event.preventDefault()
              if (!ready) save()
            }
          }}
        />
      </div>
    </>
  )
  const reviewActions = (
    <div className="discussion-review-actions">
      {current.content.alignment === "expansion" && (
        <Button variant="outline" onClick={session.updateToRevisedMandate}>
          Update to revised mandate
        </Button>
      )}
      <div className="mobile-assignment-action-bar">
        <Button
          className="assignment-primary-action"
          ref={reviewTrigger}
          onClick={() => setReviewOpen(true)}
          disabled={
            ready ||
            stale ||
            !!assignmentDetails?.requiresReview ||
            dirty ||
            !readiness.allowed ||
            !!error ||
            conflict ||
            (recovery !== "none" && persistence !== "memory")
          }
        >
          <RiSendPlaneFill aria-hidden="true" />
          Send for review
        </Button>
      </div>
      {!ready &&
        (stale || dirty || !readiness.allowed || error || conflict) && (
          <p className="workspace-muted">
            {stale
              ? "Review and save a fresh draft before sending."
              : dirty
                ? "Save or discard your changes before sending for review."
                : conflict
                  ? "Resolve the newer saved version before sending for review."
                  : error
                    ? "Resolve the save issue before sending for review."
                    : readiness.reason}
          </p>
        )}
    </div>
  )
  const generationNote = (
    <aside
      className="workspace-preparation discussion-generation-note"
      aria-label="AI-generated brief"
    >
      <RiSparklingLine aria-hidden="true" />
      <div className="discussion-generation-copy">
        <h2>AI-generated brief</h2>{" "}
        <p>
          based on the latest client brief and candidates’ information.{" "}
          {ready ? "Create a new draft to edit." : "Review it and edit below."}
        </p>
      </div>
    </aside>
  )
  if (params.has("candidate") && !selected)
    return (
      <section className="workspace-page">
        <h1>Candidate not found</h1>
        <Link to="/workspace/discussion">Return to discussion brief</Link>
      </section>
    )
  return (
    <section className="workspace-page workspace-discussion-page discussion-document-page">
      <AssignmentStepHeader
        title="Discussion brief"
        task="Review and edit the document, then save your changes and send it for manager review."
      >
        <span role="status" aria-live="polite">
          {dirty
            ? "Unsaved changes"
            : error
              ? "Couldn’t save changes"
              : ready
                ? "Sent for review"
                : current.status === "ready" && working
                  ? "New draft"
                  : current.content.documentHtml
                    ? "Saved"
                    : ""}
        </span>
      </AssignmentStepHeader>
      {stale && (
        <div className="assignment-review-required" role="status">
          <strong>Fresh review required</strong>
          <p>
            Assignment details have changed since this brief was saved. Review
            and update the document, then save it as a new draft before sending.
            Earlier versions remain in history.
          </p>
        </div>
      )}
      {current.restoredFrom && (
        <div className="workspace-warning" role="status">
          <p>
            The restored mandate reflects geographic expansion. Update it to the
            current integration brief before review.
          </p>
        </div>
      )}
      {invalid && (
        <p className="workspace-field-error" role="alert">
          Add an assignment objective and discussion questions before saving.
        </p>
      )}
      {(error === "save-failed" || error === "unavailable") && (
        <div className="workspace-error-message" role="alert">
          <p>Your changes are still here. Try saving again.</p>
          {error === "unavailable" && (
            <Button variant="outline" onClick={session.continueInMemory}>
              Continue without saving
            </Button>
          )}
        </div>
      )}
      {conflict && (
        <div className="workspace-error-message" role="alert">
          <p>
            A newer version was saved in another tab. Your edits are still here.
          </p>
          <div className="workspace-actions">
            <Button variant="outline" onClick={session.reloadExternal}>
              Reload saved version
            </Button>
            <Button variant="outline" onClick={session.keepWorking}>
              Keep my edits as a new draft
            </Button>
          </div>
        </div>
      )}
      {(recovery === "corrupt" || recovery === "unsupported") && (
        <p className="workspace-warning" role="status">
          Recover the workspace or continue without saving before applying
          edits.
        </p>
      )}
      <div className="discussion-editing-layout">
        {generationNote}
        <div className="discussion-editor-column">
          {mobile ? (
            <>
              <MobileDocumentPreview
                label={
                  ready
                    ? "Open full discussion brief"
                    : "Open discussion brief editor"
                }
                action={ready ? "Read full document" : "Read and edit document"}
                onOpen={() => setDocumentOpen(true)}
              >
                <div
                  className="discussion-doc-editor"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDiscussionHtml(html),
                  }}
                />
              </MobileDocumentPreview>
              <Dialog
                open={documentOpen}
                onOpenChange={(open) => {
                  if (open) setDocumentOpen(true)
                  else closeDocument()
                }}
              >
                <DialogContent
                  showCloseButton={false}
                  className="workspace-dialog mobile-document-dialog mobile-discussion-editor"
                  aria-describedby={undefined}
                >
                  <DialogHeader ref={editorHeader}>
                    <DialogTitle>Discussion brief</DialogTitle>
                    <div className="mobile-discussion-header-actions">
                      <Button variant="outline" onClick={closeDocument}>
                        Cancel
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="mobile-document-feedback">
                    {stale && (
                      <p className="workspace-warning" role="status">
                        Assignment details changed. Review this document and
                        save a fresh draft before sending.
                      </p>
                    )}
                    {dirty && (
                      <p className="workspace-muted" role="status">
                        Unsaved changes
                      </p>
                    )}
                    {invalid && (
                      <p role="alert">
                        Add an assignment objective and discussion questions
                        before saving.
                      </p>
                    )}
                    {error && (
                      <p role="alert">
                        Your changes are still here. Try saving again.
                      </p>
                    )}
                    {conflict && (
                      <p role="alert">
                        A newer version was saved in another tab. Close the
                        document to resolve it.
                      </p>
                    )}
                  </div>
                  {documentEditor}
                  <div className="mobile-discussion-save-bar">{saveAction}</div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            documentEditor
          )}
        </div>
      </div>
      {reviewActions}
      <DocumentHistory open={history} onClose={() => setHistory(false)} />
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent
          confirmation
          className="workspace-dialog"
          initialFocus={reviewCancel}
          finalFocus={() => (ready ? editor.current : reviewTrigger.current)}
        >
          <DialogHeader>
            <DialogTitle>Send for review?</DialogTitle>
            <DialogDescription>
              This action can’t be undone. This version will be locked; any
              further changes must be made in a new draft.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="workspace-error-message" role="alert">
              Couldn’t send for review. Your edits are still here. Try again.
            </p>
          )}
          <div className="workspace-actions discussion-discard-actions">
            <Button
              ref={reviewCancel}
              variant="outline"
              onClick={() => setReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={conflict} onClick={sendForReview}>
              <RiSendPlaneFill aria-hidden="true" />
              Send for review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={discardOpen}
        onOpenChange={(open) => {
          if (!open) keepEditing()
        }}
      >
        <DialogContent confirmation className="workspace-dialog">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              Your latest edits haven’t been saved.
            </DialogDescription>
          </DialogHeader>
          <div className="workspace-actions discussion-discard-actions">
            <Button variant="outline" onClick={keepEditing}>
              Keep editing
            </Button>
            <Button variant="outline" onClick={discard}>
              Discard changes
            </Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
      {selected && (
        <CandidateFullProfile
          key={selected.id}
          candidate={selected}
          onClose={closeProfile}
        />
      )}
    </section>
  )
}

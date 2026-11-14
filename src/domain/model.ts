/** Supplied fictional evidence and immutable discussion snapshots.
 * Keep evidence limits explicit and historical approval attached to its source version.
 */
export type EvidenceKind = "provided" | "unverified" | "unknown"
export interface Candidate {
  id: "A" | "B" | "C"
  name: string
  statement: string
  integration: { text: string; kind: EvidenceKind }
  scale: { text: string; kind: EvidenceKind }
  availabilityDays: number
  limitation: string
  question: string
}
export interface BriefContent {
  summary: string
  questions: string
  alignment: "integration" | "expansion"
  documentHtml?: string
  assignmentDetailsRevision?: number
}
export interface Snapshot {
  id: string
  sequence: number
  parentId?: string
  restoredFrom?: string
  status: "draft" | "ready" | "earlier-approved"
  content: BriefContent
}
export interface Workspace {
  schemaVersion: 1
  revision: number
  currentId: string
  versions: Snapshot[]
}

export const mandate = Object.freeze({
  priority: "integration",
  locations: 12,
  acquisitions: 2,
  startWithinDays: 60,
} as const)
export const candidates: readonly Candidate[] = Object.freeze(
  [
    {
      id: "A",
      name: "Claire Bennett",
      statement:
        "Helped expand an operation from four to twelve locations; available in thirty days.",
      integration: Object.freeze({
        text: "Acquisition-integration experience has not been established.",
        kind: "unknown",
      }),
      scale: Object.freeze({
        text: "Helped expand an operation from four to twelve locations.",
        kind: "provided",
      }),
      availabilityDays: 30,
      limitation:
        "Acquisition-integration experience has not been established.",
      question:
        "What responsibility have you held for integrating acquired businesses?",
    },
    {
      id: "B",
      name: "Marcus Reed",
      statement:
        "Led two acquisition integrations; available in forty-five days.",
      integration: Object.freeze({
        text: "Led two acquisition integrations.",
        kind: "provided",
      }),
      scale: Object.freeze({
        text: "Experience managing a twelve-location operation needs clarification.",
        kind: "unknown",
      }),
      availabilityDays: 45,
      limitation:
        "Experience managing a twelve-location operation needs clarification.",
      question:
        "How many locations did you oversee, and what was your operating responsibility?",
    },
    {
      id: "C",
      name: "Daniel Foster",
      statement:
        "Describes growth and integration work; available in ninety days.",
      integration: Object.freeze({
        text: "Describes growth and integration work; integration scope is unverified.",
        kind: "unverified",
      }),
      scale: Object.freeze({
        text: "Twelve-location operating scale is not supplied.",
        kind: "unknown",
      }),
      availabilityDays: 90,
      limitation:
        "Integration scope is unverified and availability exceeds the client's target. Twelve-location operating scale is not supplied.",
      question:
        "What integration work did you personally lead, and is an earlier start possible?",
    },
  ].map((candidate) => Object.freeze(candidate as Candidate))
)

export const revisedSummary =
  "The board now prioritizes integrating two recent acquisitions across a twelve-location operation. The Head of Operations should be able to start within sixty days. Geographic expansion is the earlier priority; the discussion now needs to establish integration responsibility, operating scale, and start-date constraints."
const earlierSummary =
  "The Head of Operations search prioritizes geographic expansion. The client operates twelve locations and wants the successful candidate to start within sixty days."

export function createSeed(): Workspace {
  return {
    schemaVersion: 1,
    revision: 0,
    currentId: "V2",
    versions: [
      {
        id: "V1",
        sequence: 1,
        status: "earlier-approved",
        content: {
          summary: earlierSummary,
          questions: "",
          alignment: "expansion",
        },
      },
      {
        id: "V2",
        sequence: 2,
        parentId: "V1",
        status: "draft",
        content: {
          summary: revisedSummary,
          questions: candidates
            .map((c) => `${c.name}: ${c.question}`)
            .join("\n\n"),
          alignment: "integration",
        },
      },
    ],
  }
}

export function getCurrent(state: Workspace): Snapshot {
  const current = state.versions.find(
    (version) => version.id === state.currentId
  )
  if (!current) throw new Error("The current discussion version is missing.")
  return current
}

export function contentEquals(
  left: BriefContent,
  right: BriefContent
): boolean {
  return (
    left.summary === right.summary &&
    left.questions === right.questions &&
    left.alignment === right.alignment &&
    (left.documentHtml ?? "") === (right.documentHtml ?? "") &&
    (left.assignmentDetailsRevision ?? 0) ===
      (right.assignmentDetailsRevision ?? 0)
  )
}

export function contentValid(content: BriefContent): boolean {
  return Boolean(
    content.summary.trim() &&
    content.questions.trim() &&
    (content.documentHtml === undefined ||
      content.documentHtml
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim())
  )
}

function appendDraft(
  state: Workspace,
  content: BriefContent,
  restoredFrom?: string
): Workspace {
  const sequence =
    Math.max(...state.versions.map((version) => version.sequence)) + 1
  const snapshot: Snapshot = {
    id: `V${sequence}`,
    sequence,
    parentId: state.currentId,
    status: "draft",
    content: { ...content },
  }
  if (restoredFrom) snapshot.restoredFrom = restoredFrom
  return {
    ...state,
    revision: state.revision + 1,
    currentId: snapshot.id,
    versions: [...state.versions, snapshot],
  }
}

export function saveContent(
  state: Workspace,
  content: BriefContent
): Workspace {
  if (
    contentEquals(getCurrent(state).content, content) ||
    !contentValid(content)
  )
    return state
  return appendDraft(state, content)
}

export function canMarkReady(state: Workspace): {
  allowed: boolean
  reason?: string
} {
  const current = getCurrent(state)
  if (current.content.alignment !== "integration")
    return {
      allowed: false,
      reason:
        "The restored opening reflects an outdated expansion priority. Update it to the current integration mandate before review.",
    }
  if (!contentValid(current.content))
    return {
      allowed: false,
      reason: "Add a meeting opening and next questions before review.",
    }
  if (current.status === "earlier-approved")
    return {
      allowed: false,
      reason: "Earlier approval is historical. Prepare a current draft.",
    }
  return { allowed: true }
}

export function markReady(state: Workspace): Workspace {
  const current = getCurrent(state)
  if (current.status === "ready" || !canMarkReady(state).allowed) return state
  return {
    ...state,
    revision: state.revision + 1,
    versions: state.versions.map((version) =>
      version.id === current.id ? { ...version, status: "ready" } : version
    ),
  }
}

export function restoreMandate(state: Workspace, sourceId: string): Workspace {
  const source = state.versions.find(
    (version) =>
      version.id === sourceId && version.status === "earlier-approved"
  )
  if (!source) return state
  const current = getCurrent(state)
  if (
    current.status === "draft" &&
    current.restoredFrom === sourceId &&
    current.content.summary === source.content.summary
  )
    return state
  return appendDraft(
    state,
    {
      ...current.content,
      summary: source.content.summary,
      alignment: "expansion",
      documentHtml: undefined,
    },
    sourceId
  )
}

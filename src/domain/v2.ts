import { clientBriefContent } from "./client-brief-content"
import { candidates, createSeed, mandate, type Candidate } from "./model"

export type CandidateId = Candidate["id"]
export type ProfileSection = "overview" | "experience" | "skills" | "education"
export type AssistantAction = "changes" | "missing-evidence" | "meeting-opening"
export interface AssignmentVersion {
  version: string
  priority: string
  summary: string
}
export interface Assignment {
  id: string
  title: string
  previous: AssignmentVersion
  current: AssignmentVersion
  criteria: readonly { id: string; label: string; question: string }[]
  candidateIds: readonly CandidateId[]
}
export interface AssignmentChange {
  id: string
  section: "mandate"
  previous: string
  current: string
  previousVersion: string
  currentVersion: string
}
export interface ProfileSectionContent {
  id: ProfileSection
  label: string
  text: string
}
export interface AssistantResponse {
  title: string
  text: string
  sources: readonly string[]
  draft?: string
}

const seed = createSeed()
const earlier = seed.versions[0]
const current = seed.versions[1]
export interface ClientBriefDocumentRecord {
  readonly version: string
  readonly label: string
  readonly recordedAt: string
  readonly addedBy: string
  readonly from: string
  readonly summary: string
  readonly facts: Readonly<
    Record<
      "company" | "role" | "search",
      readonly {
        readonly id: string
        readonly label: string
        readonly value: string
      }[]
    >
  >
  readonly sections: readonly {
    readonly id: string
    readonly title: string
    readonly paragraphs: readonly string[]
  }[]
  readonly paragraphs: readonly string[]
}
// Fictional client documents for the prototype; each version keeps its own wording.
export const clientBriefDocuments: readonly ClientBriefDocumentRecord[] =
  Object.freeze([
    Object.freeze({
      ...clientBriefContent.revised,
      version: current.id,
      label: "Revised brief",
      recordedAt: "2026-11-08T16:40:00-06:00",
      addedBy: "Caroline S.",
      from: "Maya Chen · CEO, Northline Services Group",
      paragraphs: Object.freeze([
        "We need a Head of Operations to integrate our two recently acquired businesses into one operating model across 12 locations. Acquisition integration is now the priority for this hire.",
        "We need someone who has personally led integrations, can align site leaders and day-to-day operations, and can start within 60 days.",
      ]),
    }),
    Object.freeze({
      ...clientBriefContent.original,
      version: earlier.id,
      label: "Original brief",
      recordedAt: "2026-11-05T10:15:00-06:00",
      addedBy: "Maya Chen",
      from: "Maya Chen · CEO, Northline Services Group",
      paragraphs: Object.freeze([
        "We are looking for a Head of Operations to lead our next phase of geographic expansion. We operate across 12 locations and need a leader who can build the operating capacity to support further growth.",
        "The successful hire should be comfortable leading a multi-location business and able to start within 60 days.",
      ]),
    }),
  ])
export const sampleAssignment: Assignment = Object.freeze({
  id: "head-of-operations",
  title: "Northline Integration Search",
  previous: Object.freeze({
    version: earlier.id,
    priority: "Geographic expansion",
    summary: earlier.content.summary,
  }),
  current: Object.freeze({
    version: current.id,
    priority: `Integrate ${mandate.acquisitions === 2 ? "two" : mandate.acquisitions} acquisitions`,
    summary: current.content.summary,
  }),
  criteria: Object.freeze([
    Object.freeze({
      id: "integration",
      label: "Acquisition integration",
      question: "What integration work did the candidate personally lead?",
    }),
    Object.freeze({
      id: "scale",
      label: "Operating scale",
      question:
        "What was their responsibility across a twelve-location operation?",
    }),
    Object.freeze({
      id: "availability",
      label: "Availability",
      question: "Can they start within the client’s sixty-day target?",
    }),
  ]),
  candidateIds: Object.freeze(candidates.map((candidate) => candidate.id)),
})

// The fingerprint identifies supplied content, never an invented notification time.
function contentFingerprint(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619)
  return (hash >>> 0).toString(16)
}

export function getAssignmentChanges(
  assignment: Assignment = sampleAssignment
): AssignmentChange[] {
  const { previous, current } = assignment
  if (
    previous.priority === current.priority &&
    previous.summary === current.summary
  )
    return []
  const fingerprint = contentFingerprint(
    JSON.stringify([
      previous.priority,
      previous.summary,
      current.priority,
      current.summary,
    ])
  )
  return [
    {
      id: `${assignment.id}:mandate:${previous.version}:${current.version}:${fingerprint}`,
      section: "mandate",
      previous:
        previous.summary === current.summary
          ? previous.priority
          : previous.summary,
      current:
        previous.summary === current.summary
          ? current.priority
          : current.summary,
      previousVersion: previous.version,
      currentVersion: current.version,
    },
  ]
}

export function getProfileSections(
  candidate: Candidate
): readonly ProfileSectionContent[] {
  return [
    {
      id: "overview",
      label: "Overview",
      text: `${candidate.statement}\n${candidate.limitation}`,
    },
    {
      id: "experience",
      label: "Experience",
      text: `${candidate.statement}\n${candidate.integration.text}\n${candidate.scale.text}`,
    },
    {
      id: "skills",
      label: "Skills / Technical",
      text: "Not supplied in this sample",
    },
    {
      id: "education",
      label: "Education",
      text: "Not supplied in this sample",
    },
  ]
}

export function assistantResponse(
  action: AssistantAction,
  assignment: Assignment = sampleAssignment
): AssistantResponse {
  if (action === "changes")
    return {
      title: "What changed?",
      text: `Earlier (${assignment.previous.version}): ${assignment.previous.summary}\nCurrent (${assignment.current.version}): ${assignment.current.summary}`,
      sources: [
        `${assignment.title} · ${assignment.previous.version} mandate`,
        `${assignment.title} · ${assignment.current.version} mandate`,
      ],
    }
  const includedCandidates = candidates.filter((candidate) =>
    assignment.candidateIds.includes(candidate.id)
  )
  if (action === "missing-evidence")
    return {
      title: "What evidence is missing?",
      text: includedCandidates.length
        ? includedCandidates
            .map(
              (candidate) =>
                `${candidate.name}: ${candidate.limitation} Next question: ${candidate.question}`
            )
            .join("\n\n")
        : "No candidate records are included in this sample assignment.",
      sources: includedCandidates.map(
        (candidate) => `${candidate.name} · supplied fictional record`
      ),
    }
  const draft = `${assignment.current.summary}\n\nOur next step is to clarify the supplied evidence before making a recommendation.`
  return {
    title: "Draft meeting opening",
    text: draft,
    draft,
    sources: [
      `${assignment.title} · ${assignment.current.version} current mandate`,
    ],
  }
}

export function filterExperts(
  query: string,
  availability: "all" | "within-target" = "all"
): readonly Candidate[] {
  const normalized = query.trim().toLowerCase()
  return candidates.filter((candidate) => {
    if (
      availability === "within-target" &&
      candidate.availabilityDays > mandate.startWithinDays
    )
      return false
    const supplied = [
      candidate.name,
      `Candidate ${candidate.id}`,
      candidate.statement,
      candidate.integration.text,
      candidate.scale.text,
      candidate.limitation,
      candidate.question,
      `${candidate.availabilityDays} days`,
    ]
      .join(" ")
      .toLowerCase()
    return supplied.includes(normalized)
  })
}

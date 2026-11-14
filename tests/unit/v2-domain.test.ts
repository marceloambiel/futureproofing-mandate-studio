import { beforeAll, describe, expect, it } from "vitest"
import { candidates, createSeed, type Candidate } from "../../src/domain/model"

type Assignment = {
  id: string
  title: string
  previous: { version: string; priority: string; summary: string }
  current: { version: string; priority: string; summary: string }
  criteria: readonly { id: string; label: string; question: string }[]
  candidateIds: readonly Candidate["id"][]
}
type V2 = {
  sampleAssignment: Assignment
  getAssignmentChanges: (assignment?: Assignment) => {
    id: string
    section: string
    previous: string
    current: string
    previousVersion: string
    currentVersion: string
  }[]
  getProfileSections: (
    candidate: Candidate
  ) => { id: string; label: string; text: string }[]
  assistantResponse: (
    action: "changes" | "missing-evidence" | "meeting-opening",
    assignment?: Assignment
  ) => {
    title: string
    text: string
    sources: readonly string[]
    draft?: string
  }
  filterExperts: (
    query: string,
    availability?: "all" | "within-target"
  ) => readonly Candidate[]
}
let v2: V2
beforeAll(async () => {
  const module = Object.values(import.meta.glob("../../src/domain/v2.ts"))[0]
  v2 = module ? ((await module()) as V2) : ({} as V2)
})

describe("v2 domain contract", () => {
  it("harness control preserves v1 source facts while evaluating new domain requirements", () => {
    expect(candidates.map((c) => c.id)).toEqual(["A", "B", "C"])
    expect(createSeed().versions).toHaveLength(2)
  })
  it("V211 V220 V222 emits only a stable real changed-field event without fictitious time", () => {
    expect(v2.getAssignmentChanges).toBeTypeOf("function")
    const changes = v2.getAssignmentChanges()
    expect(changes).toHaveLength(1)
    expect(changes[0]).toMatchObject({
      section: "mandate",
      previousVersion: "V1",
      currentVersion: "V2",
    })
    expect(changes[0].previous).toMatch(/expansion/i)
    expect(changes[0].current).toMatch(/integrat/i)
    expect(changes[0]).not.toHaveProperty("timestamp")
    expect(v2.getAssignmentChanges()).toEqual(changes)
    const unchanged = {
      ...v2.sampleAssignment,
      current: { ...v2.sampleAssignment.previous, version: "V2" },
    }
    expect(v2.getAssignmentChanges(unchanged)).toEqual([])
  })
  it("V213 local assistant uses actual source fields and retains candidate qualifiers", () => {
    expect(v2.assistantResponse).toBeTypeOf("function")
    const change = v2.assistantResponse("changes")
    expect(change.text).toMatch(/expansion/i)
    expect(change.text).toMatch(/integrat/i)
    expect(change.sources.length).toBeGreaterThan(0)
    const missing = v2.assistantResponse("missing-evidence")
    for (const candidate of candidates)
      expect(missing.text).toContain(candidate.name)
    expect(missing.text).toMatch(/unverified/i)
    expect(missing.text).toMatch(/not.*established/i)
    const opening = v2.assistantResponse("meeting-opening")
    expect(opening.draft).toMatch(/integrat/i)
    expect(opening.draft).toMatch(/sixty|60/i)
    expect(v2.assistantResponse("changes")).toEqual(change)
    const altered = {
      ...v2.sampleAssignment,
      current: {
        ...v2.sampleAssignment.current,
        summary: "Current supplied mandate changed for this domain test.",
      },
    }
    expect(v2.assistantResponse("changes", altered).text).toContain(
      altered.current.summary
    )
  })
  it("V232 V235 V238 profiles expose only supplied evidence and explicit unsupported fields", () => {
    expect(v2.getProfileSections).toBeTypeOf("function")
    for (const candidate of candidates) {
      const sections = v2.getProfileSections(candidate)
      expect(sections.map((s) => s.id)).toEqual([
        "overview",
        "experience",
        "skills",
        "education",
      ])
      expect(sections.find((s) => s.id === "experience")?.text).toContain(
        candidate.statement
      )
      expect(sections.find((s) => s.id === "skills")?.text).toBe(
        "Not supplied in this sample"
      )
      expect(sections.find((s) => s.id === "education")?.text).toBe(
        "Not supplied in this sample"
      )
      expect(JSON.stringify(sections)).not.toMatch(
        /university|linkedin|endorsement|senior director/i
      )
    }
  })
  it("V236 directory searches actual records, handles empty and filters by actual target", () => {
    expect(v2.filterExperts).toBeTypeOf("function")
    expect(v2.filterExperts("").map((c) => c.id)).toEqual(["A", "B", "C"])
    expect(v2.filterExperts("Candidate B").map((c) => c.id)).toEqual(["B"])
    expect(v2.filterExperts("Marcus Reed").map((c) => c.id)).toEqual(["B"])
    expect(v2.filterExperts("no such sample")).toEqual([])
    expect(v2.filterExperts("", "within-target").map((c) => c.id)).toEqual([
      "A",
      "B",
    ])
    expect(v2.filterExperts("  candidate c  ").map((c) => c.id)).toEqual(["C"])
  })
})

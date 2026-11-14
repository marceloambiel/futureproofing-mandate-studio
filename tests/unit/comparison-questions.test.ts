import { describe, expect, it } from "vitest"
import { candidates, createSeed } from "../../src/domain/model"
import {
  comparisonCriteria,
  getComparisonQuestions,
  getComparisonStatus,
  prepareDiscussionQuestions,
} from "../../src/domain/comparison"

describe("comparison discussion questions", () => {
  it("covers every unresolved comparison item without adding questions for matches", () => {
    const questions = getComparisonQuestions()
    expect(questions).toHaveLength(7)
    for (const candidate of candidates)
      for (const criterion of comparisonCriteria) {
        const matching = questions.filter(
          (item) =>
            item.candidateId === candidate.id && item.criterion === criterion.id
        )
        expect(matching).toHaveLength(
          getComparisonStatus(candidate, criterion.id) === "match" ? 0 : 1
        )
      }
    expect(
      questions.find(
        (item) => item.candidateId === "C" && item.criterion === "availability"
      )?.question
    ).toContain("60-day target rather than 90 days")
  })
  it("refreshes the default question copy without changing the stored historical seed", () => {
    const seed = createSeed()
    const original = seed.versions[1].content.questions
    const text = prepareDiscussionQuestions(original)
    expect(text).toContain("Can you be based in Chicago")
    expect(text).toContain("operating responsibility")
    expect(seed.versions[1].content.questions).toBe(original)
    expect(prepareDiscussionQuestions(text)).toBe(text)
  })
  it("preserves advisor edits and generates questions only for selected candidates", () => {
    const custom = "Ask the client about the interview schedule."
    const text = prepareDiscussionQuestions(custom, [candidates[0]])
    expect(text).toMatch(/^Ask the client about the interview schedule\./)
    expect(text).toContain("Claire Bennett:")
    expect(text).not.toContain("Marcus Reed:")
    expect(text).not.toContain("Daniel Foster:")
    expect(prepareDiscussionQuestions(text, [candidates[0]])).toBe(text)
  })
})

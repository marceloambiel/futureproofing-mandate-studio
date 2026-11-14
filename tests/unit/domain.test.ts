import { describe, expect, it } from 'vitest'
import { candidates, mandate, createSeed, getCurrent, saveContent, markReady, restoreMandate, canMarkReady, revisedSummary } from '../../src/domain/model'

describe('harness control', () => {
  it('runs requirement-facing assertions', () => expect(2 + 2).toBe(4))
})

describe('supplied facts and immutable review versions', () => {
  it('D01 preserves the exact fictional evidence and uncertainty', () => {
    expect(mandate).toEqual({ priority: 'integration', locations: 12, acquisitions: 2, startWithinDays: 60 })
    expect(candidates.map(c => c.id)).toEqual(['A', 'B', 'C'])
    const [a, b, c] = candidates
    expect(a.statement).toMatch(/helped expand/i)
    expect(a.statement).toMatch(/four|4/)
    expect(a.statement).toMatch(/twelve|12/)
    expect(a.integration.kind).toBe('unknown')
    expect(a.availabilityDays).toBe(30)
    expect(b.integration.kind).toBe('provided')
    expect(b.statement).toMatch(/led (two|2) acquisition integrations/i)
    expect(b.scale.kind).toBe('unknown')
    expect(b.availabilityDays).toBe(45)
    expect(c.integration.kind).toBe('unverified')
    expect(c.scale.kind).toBe('unknown')
    expect(c.availabilityDays).toBe(90)
    for (const candidate of candidates) {
      expect(candidate.limitation.trim().length).toBeGreaterThan(15)
      expect(candidate.question).toMatch(/\?$/)
      expect(candidate).not.toHaveProperty('score')
    }
  })

  it('D02 keeps earlier approval and current integration draft distinct', () => {
    const state = createSeed()
    const historical = state.versions.find(v => v.id === 'V1')!
    expect(historical.status).toBe('earlier-approved')
    expect(historical.content.summary).toMatch(/expansion/i)
    expect(historical.content.questions).toBe('')
    expect(getCurrent(state)).toMatchObject({ id: 'V2', status: 'draft', content: { alignment: 'integration' } })
    expect(getCurrent(state).content.summary).toMatch(/integrat/i)
    expect(getCurrent(state).content.summary).toMatch(/60|sixty/i)
  })

  it('D03 marks the exact saved version ready idempotently, never approved', () => {
    const seed = createSeed()
    const ready = markReady(seed)
    expect(canMarkReady(seed).allowed).toBe(true)
    expect(getCurrent(ready).id).toBe(getCurrent(seed).id)
    expect(getCurrent(ready).status).toBe('ready')
    expect(ready.versions).toHaveLength(2)
    expect(markReady(ready)).toBe(ready)
    expect(getCurrent(seed).status).toBe('draft')
  })

  it('D04 saves changed ready content as a new draft and preserves source snapshot', () => {
    const ready = markReady(createSeed())
    const original = structuredClone(ready)
    const source = getCurrent(ready)
    const changed = saveContent(ready, { ...source.content, questions: source.content.questions + '\nAsk the board whether the start date is firm.' })
    expect(getCurrent(changed).status).toBe('draft')
    expect(getCurrent(changed).id).not.toBe(source.id)
    expect(getCurrent(changed).parentId).toBe(source.id)
    expect(changed.versions.find(v => v.id === source.id)).toEqual(source)
    expect(ready).toEqual(original)
    expect(changed.revision).toBeGreaterThan(ready.revision)
  })

  it('D05 no-op save preserves version and ready status', () => {
    const ready = markReady(createSeed())
    expect(saveContent(ready, { ...getCurrent(ready).content })).toBe(ready)
  })

  it('D06 restores only the supplied earlier mandate as a fresh draft', () => {
    const seed = createSeed()
    const before = structuredClone(seed)
    const restored = restoreMandate(seed, 'V1')
    expect(getCurrent(restored)).toMatchObject({ status: 'draft', restoredFrom: 'V1', content: { alignment: 'expansion' } })
    expect(getCurrent(restored).content.summary).toBe(seed.versions[0].content.summary)
    expect(getCurrent(restored).content.questions).toBe(getCurrent(seed).content.questions)
    expect(restored.versions[0]).toEqual(seed.versions[0])
    expect(seed).toEqual(before)
    expect(mandate.priority).toBe('integration')
    expect(restoreMandate(restored, 'V1')).toBe(restored)
  })

  it('D07 blocks outdated restore until content is aligned, then requires explicit ready action', () => {
    const restored = restoreMandate(createSeed(), 'V1')
    expect(canMarkReady(restored).allowed).toBe(false)
    expect(canMarkReady(restored).reason).toMatch(/priority|mandate|integration|outdated/i)
    expect(markReady(restored)).toBe(restored)
    const aligned = saveContent(restored, { ...getCurrent(restored).content, summary: revisedSummary, alignment: 'integration' })
    expect(getCurrent(aligned).status).toBe('draft')
    expect(canMarkReady(aligned).allowed).toBe(true)
    expect(getCurrent(markReady(aligned)).status).toBe('ready')
  })

  it('D08 preserves unresolved candidate questions while allowing readiness', () => {
    const seed = createSeed()
    const questions = getCurrent(seed).content.questions
    for (const candidate of candidates) expect(questions).toContain(candidate.question)
    expect(canMarkReady(seed).allowed).toBe(true)
    expect(getCurrent(markReady(seed)).content.questions).toBe(questions)
  })
})

import {
  createSeed,
  contentValid,
  type Workspace,
  type Snapshot,
  type BriefContent,
} from "../domain/model"
export const STORAGE_KEY = "mandate-studio:v1"
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
export type Recovery = "none" | "corrupt" | "unsupported" | "unavailable"

type RecordValue = Record<string, unknown>
const isRecord = (value: unknown): value is RecordValue =>
  Boolean(value && typeof value === "object" && !Array.isArray(value))
function isContent(value: unknown): value is BriefContent {
  return (
    isRecord(value) &&
    typeof value.summary === "string" &&
    typeof value.questions === "string" &&
    (value.documentHtml === undefined ||
      typeof value.documentHtml === "string") &&
    (value.assignmentDetailsRevision === undefined ||
      (Number.isSafeInteger(value.assignmentDetailsRevision) &&
        Number(value.assignmentDetailsRevision) >= 0)) &&
    (value.alignment === "integration" || value.alignment === "expansion")
  )
}
function isSnapshot(value: unknown): value is Snapshot {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    Number.isSafeInteger(value.sequence) &&
    Number(value.sequence) > 0 &&
    (value.status === "draft" ||
      value.status === "ready" ||
      value.status === "earlier-approved") &&
    isContent(value.content) &&
    (value.parentId === undefined || typeof value.parentId === "string") &&
    (value.restoredFrom === undefined || value.restoredFrom === "V1")
  )
}
export function isWorkspace(value: unknown): value is Workspace {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Number.isSafeInteger(value.revision) ||
    Number(value.revision) < 0 ||
    typeof value.currentId !== "string" ||
    !Array.isArray(value.versions) ||
    value.versions.length < 2
  )
    return false
  if (!value.versions.every(isSnapshot)) return false
  const versions: Snapshot[] = value.versions
  const seed = createSeed()
  if (
    Number(value.revision) < versions.length - 2 ||
    value.currentId !== versions.at(-1)?.id
  )
    return false
  return versions.every((version, index) => {
    if (version.sequence !== index + 1 || version.id !== `V${index + 1}`)
      return false
    if (index === 0)
      return (
        version.status === "earlier-approved" &&
        version.content.summary === seed.versions[0].content.summary &&
        version.content.questions === "" &&
        version.content.alignment === "expansion" &&
        version.parentId === undefined &&
        version.restoredFrom === undefined
      )
    if (version.status === "earlier-approved" || !contentValid(version.content))
      return false
    if (
      index === 1 &&
      (version.content.summary !== seed.versions[1].content.summary ||
        version.content.questions !== seed.versions[1].content.questions ||
        version.content.alignment !== "integration")
    )
      return false
    if (version.parentId !== versions[index - 1].id) return false
    if (
      version.status === "ready" &&
      version.content.alignment !== "integration"
    )
      return false
    if (
      version.restoredFrom &&
      (version.content.alignment !== "expansion" ||
        version.content.summary !== seed.versions[0].content.summary)
    )
      return false
    return true
  })
}

export function loadWorkspace(storage: StorageLike): {
  state: Workspace
  recovery: Recovery
} {
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: createSeed(), recovery: "unavailable" }
  }
  if (raw === null) return { state: createSeed(), recovery: "none" }
  try {
    const value: unknown = JSON.parse(raw)
    if (
      isRecord(value) &&
      value.schemaVersion !== undefined &&
      value.schemaVersion !== 1
    )
      return { state: createSeed(), recovery: "unsupported" }
    if (!isWorkspace(value)) return { state: createSeed(), recovery: "corrupt" }
    return { state: value, recovery: "none" }
  } catch {
    return { state: createSeed(), recovery: "corrupt" }
  }
}

export function commitWorkspace(
  storage: StorageLike,
  state: Workspace,
  baseRevision: number
): { ok: boolean; error?: "save-failed" | "conflict" | "unavailable" } {
  const loaded = loadWorkspace(storage)
  if (loaded.recovery === "unavailable")
    return { ok: false, error: "unavailable" }
  if (loaded.recovery !== "none" || !isWorkspace(state))
    return { ok: false, error: "save-failed" }
  if (loaded.state.revision !== baseRevision)
    return { ok: false, error: "conflict" }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch {
    return { ok: false, error: "unavailable" }
  }
}

export function resetWorkspace(storage: StorageLike): Workspace {
  storage.removeItem(STORAGE_KEY)
  return createSeed()
}

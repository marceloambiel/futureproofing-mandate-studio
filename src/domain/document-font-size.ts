export const documentFontSizes = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
] as const

/** Keep size formatting precise, with no font-family or other inline CSS. */
export function safeFontSize(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(pt|px)$/i)
  if (!match) return undefined
  const points = Number(match[1]) * (match[2].toLowerCase() === "px" ? 0.75 : 1)
  return points >= 8 && points <= 72
    ? `${Number(points.toFixed(3))}pt`
    : undefined
}
export function normalizeTypedFontSize(editor: HTMLElement, points: number) {
  if (!Number.isFinite(points) || points < 8 || points > 72) return
  for (const font of editor.querySelectorAll<HTMLElement>('font[size="7"]')) {
    font.style.fontSize = `${points}pt`
    font.removeAttribute("size")
  }
}
export function applyDocumentFontSize(editor: HTMLElement, points: number) {
  if (!Number.isFinite(points) || points < 8 || points > 72) return
  // Native editing preserves paragraph structure, selected text and undo history.
  document.execCommand("styleWithCSS", false, "false")
  document.execCommand("fontSize", false, "7")
  normalizeTypedFontSize(editor, points)
}

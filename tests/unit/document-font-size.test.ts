import { expect, it } from 'vitest'
import { normalizeTypedFontSize, safeFontSize } from '../../src/domain/document-font-size'

it('resizes newly formatted text without changing previous sizes or losing the selection',()=>{
  const editor=document.createElement('div')
  editor.innerHTML='<p><font style="font-size: 12pt">Previous size</font> <font size="7">Selected text</font></p>'
  document.body.append(editor)
  const range=document.createRange();range.selectNodeContents(editor.querySelector('font[size="7"]')!)
  const selection=window.getSelection()!;selection.removeAllRanges();selection.addRange(range)
  normalizeTypedFontSize(editor,18)
  expect(editor.querySelectorAll('font')[0].style.fontSize).toBe('12pt')
  expect(editor.querySelectorAll('font')[1].style.fontSize).toBe('18pt')
  expect(selection.toString()).toBe('Selected text')
  normalizeTypedFontSize(editor,24)
  expect(editor.querySelectorAll('font')[1].style.fontSize).toBe('18pt')
  selection.removeAllRanges();editor.remove()
})
it('accepts safe point sizes and converts pixels to points',()=>{
  expect(safeFontSize('16pt')).toBe('16pt')
  expect(safeFontSize('24px')).toBe('18pt')
  expect(safeFontSize('999pt')).toBeUndefined()
  expect(safeFontSize('calc(1em + 20px)')).toBeUndefined()
})

import { useEffect, useState, type RefObject } from 'react'

/** Follow the section behind the glass header, without observing content inside previews. */
export function useHomepageNavbarTheme(headerRef: RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const header = headerRef.current
    const root = header?.closest('.mandate-home')
    if (!header || !root) return
    const sections = [...root.querySelectorAll<HTMLElement>('main > section, footer')]
    let frame = 0
    const update = () => {
      frame = 0
      const bounds = header.getBoundingClientRect()
      const midpoint = bounds.top + bounds.height / 2
      const section = sections.find(element => {
        const bounds = element.getBoundingClientRect()
        return bounds.top <= midpoint && bounds.bottom > midpoint
      })
      setTheme(section?.dataset.navTheme === 'dark' ? 'dark' : 'light')
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(schedule)
    observer.observe(header)
    sections.forEach(section => observer.observe(section))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [headerRef])
  return theme
}

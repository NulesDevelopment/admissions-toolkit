import { useLayoutEffect, useRef } from 'react'
import { bindFormHost } from '../lib/formHost'

/** Ref + bind editable forms / photos після монтування HTML у DOM. */
export function useFormHost(html: string, active = true) {
  const ref = useRef<HTMLDivElement>(null)

  // useLayoutEffect: Dialog portal уже в DOM до paint; менше шансів «порожнього» ref
  useLayoutEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    return bindFormHost(root)
  }, [html, active])

  return ref
}

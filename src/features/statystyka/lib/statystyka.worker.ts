/// <reference lib="webworker" />
import { StatystykaStore } from './store'
import type { DetailKind } from './types'

const store = new StatystykaStore()

type InMessage =
  | { type: 'load'; file: File; encoding: string }
  | {
      type: 'summarize'
      requestNo: number
      faculty: string
      thresholds: Record<string, number>
    }
  | {
      type: 'detail'
      requestNo: number
      faculty: string
      specialty: string
      kind: DetailKind
      threshold: number
    }
  | {
      type: 'priorityDetail'
      requestNo: number
      faculty: string
      specialty: string
      priority: number
    }

self.onmessage = async (event: MessageEvent<InMessage>) => {
  const m = event.data

  try {
    if (m.type === 'load') {
      const result = await store.loadFile(m.file, m.encoding, (rows) => {
        self.postMessage({ type: 'progress', rows })
      })
      self.postMessage({ type: 'loaded', ...result })
      return
    }

    if (m.type === 'summarize') {
      const result = store.summarize(m.faculty, m.thresholds)
      self.postMessage({ type: 'summary', requestNo: m.requestNo, ...result })
      return
    }

    if (m.type === 'detail') {
      const result = store.detail(
        m.faculty,
        m.specialty,
        m.kind,
        m.threshold,
      )
      self.postMessage({
        type: 'detail',
        requestNo: m.requestNo,
        specialty: m.specialty,
        kind: m.kind,
        threshold: m.threshold,
        ...result,
      })
      return
    }

    if (m.type === 'priorityDetail') {
      const result = store.priorityDetail(m.faculty, m.specialty, m.priority)
      self.postMessage({
        type: 'priorityDetail',
        requestNo: m.requestNo,
        specialty: m.specialty,
        priority: m.priority,
        ...result,
      })
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}

export {}

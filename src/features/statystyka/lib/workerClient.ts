import type {
  DetailKind,
  LoadMeta,
  PriorityDetailRow,
  PublicAppRecord,
  SummaryResult,
} from './types'

type ProgressHandler = (rows: number) => void

export class StatystykaWorkerClient {
  private worker: Worker
  private summaryNo = 0
  private detailNo = 0
  private priorityNo = 0

  constructor() {
    this.worker = new Worker(
      new URL('./statystyka.worker.ts', import.meta.url),
      { type: 'module' },
    )
  }

  terminate() {
    this.worker.terminate()
  }

  private once<T>(
    match: (data: { type: string; requestNo?: number }) => boolean,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        const data = event.data
        if (!data || typeof data !== 'object') return

        if (data.type === 'progress') return

        if (data.type === 'error') {
          // Лише якщо ще чекаємо «свій» результат — інакше чужі error
          // можуть зірвати паралельний запит. Тут error глобальний від worker.
          cleanup()
          reject(new Error(data.message || 'Помилка обробки CSV'))
          return
        }

        if (!match(data)) return
        cleanup()
        resolve(data as T)
      }
      const onError = (err: ErrorEvent) => {
        cleanup()
        reject(new Error(err.message || 'Помилка Web Worker'))
      }
      const cleanup = () => {
        this.worker.removeEventListener('message', onMessage)
        this.worker.removeEventListener('error', onError)
      }
      this.worker.addEventListener('message', onMessage)
      this.worker.addEventListener('error', onError)
    })
  }

  async loadFile(
    file: File,
    encoding: string,
    onProgress?: ProgressHandler,
  ): Promise<{ faculties: string[]; meta: LoadMeta }> {
    // Копія буфера — надійніше після IndexedDB / transfer
    const buffer = await file.arrayBuffer()
    const safeFile = new File([buffer], file.name, {
      type: file.type || 'text/csv',
    })

    const progressListener = (event: MessageEvent) => {
      if (event.data?.type === 'progress') onProgress?.(event.data.rows)
    }
    this.worker.addEventListener('message', progressListener)

    try {
      const pending = this.once<{
        type: 'loaded'
        faculties: string[]
        meta: LoadMeta
      }>((d) => d.type === 'loaded')
      this.worker.postMessage({ type: 'load', file: safeFile, encoding })
      return await pending
    } finally {
      this.worker.removeEventListener('message', progressListener)
    }
  }

  async summarize(
    faculty: string,
    thresholds: Record<string, number>,
  ): Promise<SummaryResult> {
    const requestNo = ++this.summaryNo
    const pending = this.once<SummaryResult & { type: 'summary' }>(
      (d) => d.type === 'summary' && d.requestNo === requestNo,
    )
    this.worker.postMessage({
      type: 'summarize',
      requestNo,
      faculty,
      thresholds,
    })
    const result = await pending
    return {
      summary: result.summary,
      duplicates: result.duplicates,
      categories: result.categories,
      totals: result.totals,
    }
  }

  async detail(
    faculty: string,
    specialty: string,
    kind: DetailKind,
    threshold: number,
  ): Promise<{ rows: PublicAppRecord[]; persons: number; apps: number }> {
    const requestNo = ++this.detailNo
    const pending = this.once<{
      type: 'detail'
      rows: PublicAppRecord[]
      persons: number
      apps: number
    }>((d) => d.type === 'detail' && d.requestNo === requestNo)
    this.worker.postMessage({
      type: 'detail',
      requestNo,
      faculty,
      specialty,
      kind,
      threshold,
    })
    return await pending
  }

  async priorityDetail(
    faculty: string,
    specialty: string,
    priority: number,
  ): Promise<{ rows: PriorityDetailRow[]; applications: number }> {
    const requestNo = ++this.priorityNo
    const pending = this.once<{
      type: 'priorityDetail'
      rows: PriorityDetailRow[]
      applications: number
    }>((d) => d.type === 'priorityDetail' && d.requestNo === requestNo)
    this.worker.postMessage({
      type: 'priorityDetail',
      requestNo,
      faculty,
      specialty,
      priority,
    })
    return await pending
  }
}

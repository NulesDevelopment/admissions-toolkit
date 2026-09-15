export class CsvParser {
  private onRow: (row: string[]) => void
  private row: string[] = []
  private field = ''
  private inQuotes = false
  private quotePending = false
  private skipLF = false

  constructor(onRow: (row: string[]) => void) {
    this.onRow = onRow
  }

  private endField() {
    this.row.push(this.field)
    this.field = ''
  }

  private endRow(isCR: boolean) {
    this.endField()
    this.onRow(this.row)
    this.row = []
    if (isCR) this.skipLF = true
  }

  push(text: string, final = false) {
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i)

      if (this.skipLF) {
        this.skipLF = false
        if (c === 10) continue
      }

      if (this.inQuotes) {
        if (this.quotePending) {
          if (c === 34) {
            this.field += '"'
            this.quotePending = false
            continue
          }

          this.inQuotes = false
          this.quotePending = false

          if (c === 59) {
            this.endField()
            continue
          }
          if (c === 13 || c === 10) {
            this.endRow(c === 13)
            continue
          }
          if (c === 32 || c === 9) continue

          this.field += text[i]
          continue
        }

        if (c === 34) this.quotePending = true
        else this.field += text[i]
        continue
      }

      if (c === 34 && this.field.length === 0) {
        this.inQuotes = true
        continue
      }
      if (c === 59) {
        this.endField()
        continue
      }
      if (c === 13 || c === 10) {
        this.endRow(c === 13)
        continue
      }

      this.field += text[i]
    }

    if (final) {
      if (this.quotePending) {
        this.quotePending = false
        this.inQuotes = false
      }
      if (this.field.length || this.row.length) this.endRow(false)
    }
  }
}

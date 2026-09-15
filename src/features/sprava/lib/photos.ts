import { esc } from './helpers'

export type PhotoState = {
  src: string
  x: number
  y: number
  scale: number
}

const BOX_W = 90
const BOX_H = 110

const photos = new Map<string, PhotoState>()

export function getPhoto(key: string): PhotoState | undefined {
  return photos.get(key)
}

export function setPhoto(key: string, state: PhotoState) {
  photos.set(key, state)
}

export function clearPhoto(key: string) {
  photos.delete(key)
}

export function clearAllPhotos() {
  photos.clear()
}

export function coverScale(natW: number, natH: number): number {
  if (natW <= 0 || natH <= 0) return 1
  return Math.max(BOX_W / natW, BOX_H / natH)
}

export function clampScale(scale: number): number {
  return Math.min(12, Math.max(0.05, scale))
}

function imgTransform(p: PhotoState): string {
  return `translate(-50%,-50%) translate(${p.x}px,${p.y}px) scale(${p.scale})`
}

/** HTML рамки фото з урахуванням збереженого стану. */
export function photoBoxHTML(fnum: string): string {
  const key = String(fnum || '')
  const p = photos.get(key)
  const img = p
    ? `<img alt="" src="${p.src.replace(/"/g, '')}" style="transform:${imgTransform(p)}">`
    : ''
  return `<div class="photo-box${p ? ' has-img' : ''}" data-ph="${esc(key)}" contenteditable="false">
    ${img}
    <span class="ph-hint">фото</span>
    <span class="ph-ctrl" contenteditable="false">
      <button type="button" data-ph-act="pick" title="Обрати файл">⬆</button>
      <button type="button" data-ph-act="zoom-in" title="Збільшити">+</button>
      <button type="button" data-ph-act="zoom-out" title="Зменшити">−</button>
      <button type="button" data-ph-act="fit" title="Вписати">⤢</button>
      <button type="button" data-ph-act="clear" title="Видалити">✕</button>
    </span>
  </div>`
}

function paintBox(box: HTMLElement, key: string) {
  const p = photos.get(key)
  let img = box.querySelector('img')
  if (!p) {
    img?.remove()
    box.classList.remove('has-img')
    return
  }
  if (!img) {
    img = document.createElement('img')
    img.alt = ''
    box.insertBefore(img, box.firstChild)
  }
  if (img.getAttribute('src') !== p.src) img.src = p.src
  img.style.transform = imgTransform(p)
  box.classList.add('has-img')
}

function paintAll(root: ParentNode, key: string) {
  root
    .querySelectorAll<HTMLElement>(`.photo-box[data-ph="${CSS.escape(key)}"]`)
    .forEach((box) => paintBox(box, key))
}

function loadImageSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const probe = new Image()
    probe.onload = () =>
      resolve({ w: probe.naturalWidth, h: probe.naturalHeight })
    probe.onerror = () => reject(new Error('Не вдалося прочитати зображення'))
    probe.src = src
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result))
    fr.onerror = () => reject(fr.error ?? new Error('read failed'))
    fr.readAsDataURL(file)
  })
}

/**
 * Відкриває діалог файлу синхронно з user gesture.
 * display:none часто блокує .click() — використовуємо візуально прихований input.
 */
function pickAndFit(root: ParentNode, key: string) {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = 'image/*'
  inp.multiple = false
  Object.assign(inp.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
  })
  document.body.appendChild(inp)

  let settled = false
  const cleanup = () => {
    if (!inp.isConnected) return
    inp.remove()
  }

  const applyFile = async (file: File) => {
    try {
      const src = await readFileAsDataUrl(file)
      const { w, h } = await loadImageSize(src)
      setPhoto(key, { src, x: 0, y: 0, scale: coverScale(w, h) })
      paintAll(root, key)
    } catch {
      // ignore broken images
    }
  }

  inp.addEventListener(
    'change',
    () => {
      settled = true
      const file = inp.files?.[0]
      cleanup()
      if (file) void applyFile(file)
    },
    { once: true },
  )

  // Скасування діалогу не завжди дає change — приберемо input після повернення фокусу
  window.addEventListener(
    'focus',
    () => {
      window.setTimeout(() => {
        if (!settled) cleanup()
      }, 400)
    },
    { once: true },
  )

  inp.click()
}

async function refit(root: ParentNode, key: string) {
  const p = photos.get(key)
  if (!p) return
  try {
    const { w, h } = await loadImageSize(p.src)
    setPhoto(key, { ...p, x: 0, y: 0, scale: coverScale(w, h) })
    paintAll(root, key)
  } catch {
    // ignore
  }
}

function zoom(root: ParentNode, key: string, factor: number) {
  const p = photos.get(key)
  if (!p) return
  p.scale = clampScale(p.scale * factor)
  paintAll(root, key)
}

/**
 * Делегування в capture-фазі — щоб contentEditable батька не з’їв клік.
 */
export function bindPhotoControls(root: HTMLElement): () => void {
  root.querySelectorAll<HTMLElement>('.photo-box[data-ph]').forEach((box) => {
    box.contentEditable = 'false'
    box.setAttribute('contenteditable', 'false')
    const key = box.dataset.ph
    if (key) paintBox(box, key)
  })

  const onPointerDownCapture = (ev: PointerEvent) => {
    const target = ev.target as HTMLElement | null
    if (!target) return

    const actEl = target.closest('[data-ph-act]') as HTMLElement | null
    if (actEl && root.contains(actEl)) {
      ev.preventDefault()
      ev.stopPropagation()
      const box = actEl.closest('.photo-box') as HTMLElement | null
      const key = box?.dataset.ph
      const act = actEl.dataset.phAct
      if (!key || !act) return

      if (act === 'pick') pickAndFit(root, key)
      else if (act === 'zoom-in') zoom(root, key, 1.15)
      else if (act === 'zoom-out') zoom(root, key, 0.87)
      else if (act === 'fit') void refit(root, key)
      else if (act === 'clear') {
        clearPhoto(key)
        paintAll(root, key)
      }
      return
    }

    const box = target.closest('.photo-box') as HTMLElement | null
    if (!box || !root.contains(box)) return
    const key = box.dataset.ph
    if (!key) return

    // Не дати contentEditable забрати фокус
    ev.preventDefault()
    ev.stopPropagation()

    const p = photos.get(key)
    if (!p) {
      pickAndFit(root, key)
      return
    }

    const sx = ev.clientX
    const sy = ev.clientY
    const ox = p.x
    const oy = p.y

    try {
      box.setPointerCapture(ev.pointerId)
    } catch {
      // ignore
    }

    const onMove = (e: PointerEvent) => {
      p.x = ox + (e.clientX - sx)
      p.y = oy + (e.clientY - sy)
      paintAll(root, key)
    }
    const onUp = () => {
      try {
        box.releasePointerCapture(ev.pointerId)
      } catch {
        // ignore
      }
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerup', onUp)
      box.removeEventListener('pointercancel', onUp)
    }
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerup', onUp)
    box.addEventListener('pointercancel', onUp)
  }

  const onWheel = (ev: WheelEvent) => {
    const box = (ev.target as HTMLElement | null)?.closest?.(
      '.photo-box',
    ) as HTMLElement | null
    if (!box || !root.contains(box)) return
    const key = box.dataset.ph
    if (!key || !photos.get(key)) return
    ev.preventDefault()
    zoom(root, key, ev.deltaY < 0 ? 1.1 : 0.91)
  }

  root.addEventListener('pointerdown', onPointerDownCapture, true)
  root.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    root.removeEventListener('pointerdown', onPointerDownCapture, true)
    root.removeEventListener('wheel', onWheel)
  }
}

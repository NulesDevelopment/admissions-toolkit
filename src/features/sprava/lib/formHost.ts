import { bindPhotoControls } from './photos'

/** Увімкнути редагування форм і фото-контроли в контейнері. */
export function bindFormHost(root: HTMLElement): () => void {
  root.querySelectorAll<HTMLElement>('.form-page').forEach((page) => {
    page.contentEditable = 'true'
    page.style.outline = 'none'
  })
  return bindPhotoControls(root)
}

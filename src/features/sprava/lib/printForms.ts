/** Спільні стилі для вікна друку (синхронно з forms.css, без UI chrome). */
export const FORM_PRINT_CSS = `
.form-page{width:210mm;height:297mm;margin:0;padding:10mm 14mm;background:#fff;
  font-family:'Times New Roman',Times,serif;font-size:14pt;line-height:1.4;
  page-break-after:always;position:relative;display:flex;flex-direction:column;
  box-sizing:border-box;overflow:visible;box-shadow:none}
.form-page:last-child{page-break-after:avoid}
.fp-ul{text-decoration:underline}
.fp-small{font-size:8.5pt}
.fp-section{font-size:20pt;font-weight:bold;text-align:center;text-transform:uppercase;margin:0;letter-spacing:.5px}
.fp-mark{background:transparent!important}
.ft{width:100%;border-collapse:collapse}
.ft td,.ft th{padding:2px 5px;vertical-align:middle}
.ft-border td,.ft-border th{border:1px solid #000}
.photo-box{position:relative;border:1px solid #000;width:90px;height:110px;overflow:hidden;
  background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.photo-box .ph-hint{font-size:9pt;color:#bbb;text-align:center;line-height:1.3}
.photo-box.has-img .ph-hint{display:none}
.photo-box img{position:absolute;top:50%;left:50%;max-width:none;max-height:none;
  transform-origin:center center;pointer-events:none;display:block}
.ph-ctrl{display:none!important}
.chk{display:inline-block;width:14px;height:14px;border:1px solid #000;text-align:center;
  line-height:13px;font-size:10pt;vertical-align:middle;margin:0 2px}
.chk-x::before{content:'х'}
@page{size:A4;margin:0}
body{margin:0;background:#fff}
`

/** Друк HTML форм у окремому вікні з інлайновими стилями. */
export function printFormsHtml(html: string, title = 'Форми особової справи') {
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    window.print()
    return
  }
  w.document.open()
  w.document.write(`<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/</g, '')}</title>
  <style>${FORM_PRINT_CSS}</style>
</head>
<body>${html}</body>
</html>`)
  w.document.close()
  w.focus()
  // Дати браузеру відмалювати зображення перед діалогом друку
  const imgs = [...w.document.images]
  const ready =
    imgs.length === 0
      ? Promise.resolve()
      : Promise.all(
          imgs.map(
            (img) =>
              img.complete
                ? Promise.resolve()
                : new Promise<void>((res) => {
                    img.addEventListener('load', () => res(), { once: true })
                    img.addEventListener('error', () => res(), { once: true })
                  }),
          ),
        )
  void ready.then(() => {
    setTimeout(() => w.print(), 50)
  })
}

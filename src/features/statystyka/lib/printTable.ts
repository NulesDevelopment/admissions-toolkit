/** Друк одного HTML-фрагмента таблиці без решти сторінки. */
export function printHtmlFragment(html: string, title = 'Таблиця') {
  const areaId = 'single-table-print-area'
  let area = document.getElementById(areaId)
  if (!area) {
    area = document.createElement('div')
    area.id = areaId
    area.className = 'single-table-print-area'
    document.body.appendChild(area)
  }
  area.innerHTML = `<h2 style="font-family:inherit;font-size:16px;margin:0 0 12px">${title}</h2>${html}`
  document.body.classList.add('print-single-table')

  const cleanup = () => {
    document.body.classList.remove('print-single-table')
    area!.innerHTML = ''
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  // Safari / деякі браузери не завжди шлють afterprint
  window.setTimeout(cleanup, 1000)
}

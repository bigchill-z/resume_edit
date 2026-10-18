export function debounce(fn, wait = 800) {
  let timer = null
  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }
  const wrapped = (...args) => {
    clear()
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, wait)
  }
  wrapped.flush = (...args) => {
    clear()
    fn(...args)
  }
  wrapped.pending = () => timer !== null
  return wrapped
}

export function nowTime() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// 时间戳/日期字符串 → 'YYYY-MM-DD HH:mm'（本地时区），非法输入返回 ''
export function formatDateTime(ts) {
  if (ts === null || ts === undefined || ts === '') return ''
  let d
  if (ts instanceof Date) d = ts
  else if (typeof ts === 'number' || typeof ts === 'string') d = new Date(ts)
  else return ''
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

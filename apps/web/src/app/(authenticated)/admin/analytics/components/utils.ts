export function formatTime(sec: number): string {
  if (sec < 60) return `${sec}秒`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分`
  const hours = Math.floor(min / 60)
  const remainMin = min % 60
  return `${hours}時間${remainMin}分`
}

export function formatPercent(views: number, completions: number): string {
  if (views === 0) return '-'
  return `${((completions / views) * 100).toFixed(1)}%`
}

export function formatShortDate(date: Date): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function formatDate(date: Date | null): string {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function toInputLocal(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  // datetime-local expects YYYY-MM-DDTHH:MM (no seconds)
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function formatDisplay(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours === 0 ? 12 : hours
  const hoursStr = String(hours).padStart(2, '0')
  return `${year}-${month}-${day} ${hoursStr}:${minutes} ${ampm}`
}
export const timeAgo = (date: string) => {
  const now = new Date().getTime()
  const oldTime = new Date(date).getTime()
  const diffMs = now - oldTime
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) {
    return `${years}y ${months % 12 !== 0 ? (months % 12) + "mo " : ""}`
  }
  if (months > 0) {
    return `${months}mo ${days % 30 !== 0 ? (days % 30) + "d " : ""}`
  }
  if (days > 0) {
    return `${days}d ${hours % 24 !== 0 ? (hours % 24) + "h " : ""}`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  if (seconds > 0) {
    return `${seconds}s`
  }

  return `0s`
}

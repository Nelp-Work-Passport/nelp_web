/** `Amina K.` to `AK`, `John` to `J`. Already-short input passes through. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) {
    const word = words[0]
    return /^[A-Z]{1,3}$/.test(word) ? word : word[0].toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

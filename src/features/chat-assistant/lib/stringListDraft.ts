export type StringListDraftParseResult =
  | { ok: true; items: string[] }
  | { ok: false }

const BULLET_PREFIX_PATTERN = /^(?:[-*•]+|\d+[.)])\s*/

export const normalizeDraftListItem = (value: string) =>
  value.trim().replace(BULLET_PREFIX_PATTERN, "").trim().replace(/\s+/g, " ")

export const dedupeDraftListItems = (items: string[]) => {
  const seen = new Set<string>()

  return items.filter((item) => {
    const normalized = item.toLowerCase()
    if (seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

export const parseDraftStringList = (value: string): StringListDraftParseResult => {
  const trimmed = value.trim()
  if (!trimmed) return { ok: false }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown

      if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
        return { ok: false }
      }

      const items = dedupeDraftListItems(
        parsed
          .map(normalizeDraftListItem)
          .filter(Boolean),
      )

      return items.length ? { ok: true, items } : { ok: false }
    } catch {
      return { ok: false }
    }
  }

  const lines = trimmed
    .split(/\r?\n+/)
    .map(normalizeDraftListItem)
    .filter(Boolean)

  if (lines.length > 1) {
    return { ok: true, items: dedupeDraftListItems(lines) }
  }

  const inlineBulletItems = trimmed
    .split(/(?=\s*(?:[-*•]+|\d+[.)])\s+)/)
    .map(normalizeDraftListItem)
    .filter(Boolean)

  const fallbackItems = inlineBulletItems.length > 1 ? inlineBulletItems : lines
  const items = dedupeDraftListItems(fallbackItems)

  return items.length ? { ok: true, items } : { ok: false }
}

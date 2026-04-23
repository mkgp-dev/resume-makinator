type UnknownRecord = Record<string, unknown>

const isPlainObject = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const parseJsonCandidate = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

const unwrapParsedJson = (value: unknown): UnknownRecord | null => {
  if (isPlainObject(value)) return value
  if (typeof value !== "string") return null

  const reparsed = parseJsonCandidate(value)
  return isPlainObject(reparsed) ? reparsed : null
}

export const parseDraftJsonObject = (value: string): UnknownRecord | null => {
  const normalized = value.trim()
  if (!normalized) return null

  const parsed = unwrapParsedJson(parseJsonCandidate(normalized))
  if (parsed) return parsed

  const unescaped = normalized.replace(/\\"/g, "\"")
  if (unescaped === normalized) return null

  return unwrapParsedJson(parseJsonCandidate(unescaped))
}

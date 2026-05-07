export function reorder<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) {
    return items
  }

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)

  if (moved === undefined) {
    return items
  }

  next.splice(toIndex, 0, moved)
  return next
}

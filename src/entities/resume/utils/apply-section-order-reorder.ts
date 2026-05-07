import type { ResumeSectionKey } from '@/entities/resume/model'
import { reorder } from '@/shared/dnd/reorder'

export function applySectionOrderReorder(
  currentOrder: ResumeSectionKey[],
  activeId: string,
  overId: string,
): ResumeSectionKey[] {
  const fromIndex = currentOrder.findIndex((key) => key === activeId)
  const toIndex = currentOrder.findIndex((key) => key === overId)

  return reorder(currentOrder, fromIndex, toIndex)
}

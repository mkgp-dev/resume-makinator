import { arrayMove } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import type { ItemSectionKey, SectionItemMap } from "@/entities/resume/types"

export function useSortHook<K extends ItemSectionKey>({ section }: { section: K }) {
    const items = useResumeStore(state => state[section]) as Array<SectionItemMap[K]>
    const sort = useResumeStore(state => state.updateItemOrder)
    const remove = useResumeStore(state => state.removeItem)
    const id = useInterfaceStore(state => state.newItem)

    const handleDrag = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        if (oldIndex < 0 || newIndex < 0) return

        const newOrder = arrayMove(items, oldIndex, newIndex)
        sort(section, newOrder)
    }

    return { id, items, remove, handleDrag }
}

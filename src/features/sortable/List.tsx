import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortHook } from "@/features/editor/hooks/useSort"
import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import Button from "@/shared/ui/Button"
import SortableItem from "@/features/sortable/Item"
import EditorSection from "@/shared/ui/EditorSection"
import { useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { DragEndEvent, DragStartEvent, Modifier, UniqueIdentifier } from "@dnd-kit/core"
import type { ItemSectionKey, SectionItemMap } from "@/entities/resume/types"

export type SortableItemSummary = {
    title: string
    subtitle?: string
}

type SortableListProps<K extends ItemSectionKey> = {
    header: string
    section: K
    renderItem: (item: SectionItemMap[K]) => ReactNode
    getItemSummary: (item: SectionItemMap[K]) => SortableItemSummary
    onClick: () => void
}

export default function SortableList<K extends ItemSectionKey>({
    header,
    section,
    renderItem,
    getItemSummary,
    onClick
}: SortableListProps<K>) {
    const { id, items, remove, handleDrag } = useSortHook({ section })
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }))
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
    const [expandedId, setExpandedId] = useState<UniqueIdentifier | null>(null)
    const sortableListRef = useRef<HTMLDivElement | null>(null)
    const sortableItems: UniqueIdentifier[] = items.map(item => item.id)
    const activeIndex = activeId ? sortableItems.indexOf(activeId) : -1
    const restrictToSortableListTop = useMemo<Modifier>(() => ({ draggingNodeRect, transform }) => {
        const sortableListRect = sortableListRef.current?.getBoundingClientRect()

        if (!draggingNodeRect || !sortableListRect) {
            return transform
        }

        const minY = sortableListRect.top - draggingNodeRect.top

        return {
            ...transform,
            y: Math.max(transform.y, minY),
        }
    }, [])
    const resolvedExpandedId = expandedId !== null && sortableItems.includes(expandedId)
            ? expandedId
            : sortableItems.length === 1
                ? sortableItems[0]
                : null

    const handleAddItem = () => {
        onClick()
        const newId = useInterfaceStore.getState().newItem
        if (newId) {
            setExpandedId(newId)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
        setOverId(event.active.id)
    }

    const handleDragEndWithState = (event: DragEndEvent) => {
        handleDrag(event)
        setActiveId(null)
        setOverId(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
        setOverId(null)
    }

    return (
        <EditorSection title={header} testId={`editor-section-${section}`}>
            <Button
                variant="surface"
                text="Add an item"
                icon={<PlusCircleIcon className="size-5" />}
                onClick={handleAddItem}
                isStretch={true}
                className="h-12 justify-start border-slate-500/34 bg-base-200/28 px-4 hover:border-slate-400/45"
            />

            {items.length === 0 ? (
                <div className="animate-fade-in rounded-[0.35rem] border border-dashed border-slate-500/30 bg-base-200/28 px-4 py-8 text-center text-sm text-slate-500">
                    Add an item to make a list.
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement, restrictToSortableListTop]}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={(event) => setOverId(event.over?.id ?? null)}
                    onDragCancel={handleDragCancel}
                    onDragEnd={handleDragEndWithState}
                >
                    <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                        <div ref={sortableListRef} className="space-y-3">
                            {items.map((item, index) => (
                                <SortableItem
                                    key={item.id}
                                    id={item.id}
                                    summary={getItemSummary(item)}
                                    isExpanded={resolvedExpandedId === item.id}
                                    isDragging={activeId === item.id}
                                    dropPosition={
                                        activeId !== null && overId === item.id && activeId !== item.id && activeIndex !== -1
                                            ? activeIndex < index
                                                ? "after"
                                                : "before"
                                            : null
                                    }
                                    onToggleExpand={() => setExpandedId(current => current === item.id ? null : item.id)}
                                    onDelete={() => remove(section, item.id)}
                                    isFadeIn={item.id === id}
                                >
                                    {renderItem(item)}
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </EditorSection>
    )
}

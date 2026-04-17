import { DndContext, MouseSensor, closestCenter, pointerWithin, useDroppable, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeftIcon, ArrowRightIcon, Bars3Icon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { TEMPLATE_SECTION_LABELS } from "@/entities/resume/constants/templateSections"
import {
    isSameModernSectionZones,
    normalizeModernSectionZones,
} from "@/entities/resume/lib/templateSections"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from "@dnd-kit/core"
import type { TemplateSectionKey } from "@/entities/resume/types"

type SectionZone = "sidebar" | "main"

type SortableSectionItemProps = {
    id: TemplateSectionKey
    container: SectionZone
    onMove: (id: TemplateSectionKey, container: SectionZone) => void
}

type SectionColumnProps = {
    container: SectionZone
    label: string
    items: TemplateSectionKey[]
    onMove: (id: TemplateSectionKey, container: SectionZone) => void
}

type SectionZones = {
    sidebar: TemplateSectionKey[]
    main: TemplateSectionKey[]
}

const updateModernZones = (nextZones: SectionZones) => {
    useResumeStore.setState((state) => ({
        template: {
            ...state.template,
            modern: {
                ...state.template.modern,
                sidebarSections: nextZones.sidebar,
                mainSections: nextZones.main,
            },
        },
    }))
}

function SortableSectionItem({ id, container, onMove }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: { container },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const targetContainer = container === "sidebar" ? "main" : "sidebar"
    const moveLabel = container === "sidebar" ? "Move to main content" : "Move to sidebar"
    const MoveIcon = targetContainer === "main" ? ArrowRightIcon : ArrowLeftIcon

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-testid={`modern-section-${id}`}
            {...attributes}
            {...listeners}
            className={clsx(
                "flex min-w-0 cursor-grab flex-row items-start gap-3 rounded-[0.35rem] border border-base-300/70 bg-base-200/55 px-3 py-2 active:cursor-grabbing",
                isDragging ? "opacity-80" : "opacity-100",
            )}
        >
            <div className="pt-0.5 text-slate-400 hover:text-primary">
                <Bars3Icon className="size-5" />
            </div>
            <span className="min-w-0 flex-1 text-sm font-medium leading-tight text-slate-200">
                {TEMPLATE_SECTION_LABELS[id]}
            </span>
            <button
                type="button"
                className="ml-auto shrink-0 rounded-[0.25rem] border border-base-300 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-primary/45 hover:text-slate-50"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation()
                    onMove(id, container)
                }}
                data-testid={`modern-move-${id}`}
                aria-label={`${moveLabel}: ${TEMPLATE_SECTION_LABELS[id]}`}
            >
                <span className="inline-flex items-center gap-1.5">
                    <MoveIcon className="size-3.5" />
                    {targetContainer === "main" ? "To main" : "To sidebar"}
                </span>
            </button>
        </div>
    )
}

function SectionColumn({ container, label, items, onMove }: SectionColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: container,
    })

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-200">{label}</h3>
            <div
                ref={setNodeRef}
                data-testid={`modern-${container}-sections`}
                className={clsx("space-y-2 rounded-[0.35rem] border border-base-300/60 bg-base-200/25 p-2", isOver && "bg-base-200/55")}
            >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <SortableSectionItem key={item} id={item} container={container} onMove={onMove} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}

export default function ModernSectionLayout() {
    const { template } = useConfigurationHook()
    const sensors = useSensors(useSensor(MouseSensor))
    const normalizedZones = normalizeModernSectionZones(
        template.modern.sidebarSections,
        template.modern.mainSections,
    )
    const [draftZones, setDraftZones] = useState<SectionZones | null>(null)
    const zones = draftZones ?? normalizedZones

    useEffect(() => {
        if (!isSameModernSectionZones(
            template.modern.sidebarSections,
            template.modern.mainSections,
            normalizedZones.sidebar,
            normalizedZones.main,
        )) {
            updateModernZones(normalizedZones)
        }
    }, [template.modern.sidebarSections, template.modern.mainSections, normalizedZones])

    const findContainer = (id: UniqueIdentifier, currentZones: SectionZones): SectionZone | null => {
        if (id === "sidebar" || id === "main") return id
        if (currentZones.sidebar.includes(id as TemplateSectionKey)) return "sidebar"
        if (currentZones.main.includes(id as TemplateSectionKey)) return "main"
        return null
    }

    const moveBetweenContainers = (
        currentZones: SectionZones,
        activeId: TemplateSectionKey,
        activeContainer: SectionZone,
        overContainer: SectionZone,
        overId: UniqueIdentifier,
    ) => {
        const sourceItems = [...currentZones[activeContainer]]
        const targetItems = [...currentZones[overContainer]]
        const sourceIndex = sourceItems.indexOf(activeId)

        if (sourceIndex === -1) return currentZones

        sourceItems.splice(sourceIndex, 1)

        const targetIndex = overId === overContainer
            ? targetItems.length
            : targetItems.indexOf(overId as TemplateSectionKey)

        if (targetIndex === -1) {
            targetItems.push(activeId)
        } else {
            targetItems.splice(targetIndex, 0, activeId)
        }

        return {
            ...currentZones,
            [activeContainer]: sourceItems,
            [overContainer]: targetItems,
        }
    }

    const persistZones = (nextZones: SectionZones) => {
        updateModernZones(nextZones)
    }

    const moveSection = (id: TemplateSectionKey, container: SectionZone) => {
        const targetContainer = container === "sidebar" ? "main" : "sidebar"
        const nextZones = moveBetweenContainers(zones, id, container, targetContainer, targetContainer)
        persistZones(nextZones)
        setDraftZones(null)
    }

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return

        const activeId = active.id as TemplateSectionKey
        const activeContainer = findContainer(active.id, zones)
        const overContainer = findContainer(over.id, zones)

        if (!activeContainer || !overContainer) return
        if (activeContainer === overContainer) return

        setDraftZones(moveBetweenContainers(
            zones,
            activeId,
            activeContainer,
            overContainer,
            over.id,
        ))
    }

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over) {
            setDraftZones(null)
            return
        }

        const activeId = active.id as TemplateSectionKey
        const currentZones = zones
        const activeContainer = findContainer(active.id, currentZones)
        const overContainer = findContainer(over.id, currentZones)

        if (!activeContainer || !overContainer) {
            setDraftZones(null)
            return
        }

        let nextZones = currentZones

        if (activeContainer === overContainer) {
            const items = currentZones[activeContainer]
            const oldIndex = items.indexOf(activeId)
            const newIndex = over.id === overContainer
                ? items.length - 1
                : items.indexOf(over.id as TemplateSectionKey)

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                nextZones = {
                    ...currentZones,
                    [activeContainer]: arrayMove(items, oldIndex, newIndex),
                }
            }
        } else {
            nextZones = moveBetweenContainers(
                currentZones,
                activeId,
                activeContainer,
                overContainer,
                over.id,
            )
        }

        persistZones(nextZones)
        setDraftZones(null)
    }

    return (
        <fieldset className="fieldset rounded-[0.35rem] border border-base-300/70 p-3 md:h-full" aria-label="Section layout">
            <legend className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Section layout</legend>
            <span className="text-xs text-slate-400">
                Drag sections between the sidebar and the main content area, or use the move action inside each row.
            </span>

            <DndContext
                sensors={sensors}
                collisionDetection={(args) => {
                    const collisions = pointerWithin(args)
                    return collisions.length > 0 ? collisions : closestCenter(args)
                }}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDraftZones(null)}
            >
                <div className="mt-2 space-y-3">
                    <SectionColumn container="sidebar" label="Sidebar sections" items={zones.sidebar} onMove={moveSection} />
                    <SectionColumn container="main" label="Main content sections" items={zones.main} onMove={moveSection} />
                </div>
            </DndContext>
        </fieldset>
    )
}

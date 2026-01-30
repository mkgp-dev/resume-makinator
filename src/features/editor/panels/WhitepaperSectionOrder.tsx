import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bars3Icon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useMemo } from "react"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import {
    WHITEPAPER_SECTION_LABELS,
    WHITEPAPER_SECTION_ORDER_DEFAULT,
} from "@/entities/resume/constants/whitepaperSections"
import type { DragEndEvent } from "@dnd-kit/core"
import type { RenderConfig, WhitepaperSectionKey } from "@/entities/resume/types"

type SectionOrderItemProps = {
    id: WhitepaperSectionKey
    label: string
    isEnabled: boolean
    onToggle: () => void
}

const normalizeSectionOrder = (value?: WhitepaperSectionKey[]) => {
    const seen = new Set<WhitepaperSectionKey>()
    const sanitized = (value || []).filter((key) => {
        if (!WHITEPAPER_SECTION_LABELS[key]) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    const missing = WHITEPAPER_SECTION_ORDER_DEFAULT.filter((key) => !seen.has(key))
    return [...sanitized, ...missing]
}

const isSameOrder = (a: WhitepaperSectionKey[] | undefined, b: WhitepaperSectionKey[]) => {
    if (!a || a.length !== b.length) return false
    return a.every((key, index) => key === b[index])
}

const SECTION_TOGGLE_KEYS: Record<WhitepaperSectionKey, keyof RenderConfig> = {
    summary: "summary",
    coreSkills: "coreSkills",
    workExperiences: "workExperiences",
    personalProjects: "personalProjects",
    certificates: "certificates",
    achievements: "achievements",
    softSkills: "softSkills",
    education: "education",
    knownLanguages: "language",
    references: "references",
}

function SectionOrderItem({ id, label, isEnabled, onToggle }: SectionOrderItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "card flex flex-row items-center gap-3 rounded-md border border-slate-600/70 bg-slate-700/90 px-3 py-2",
                isDragging ? "opacity-80" : "opacity-100",
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-300 hover:text-sky-400 active:cursor-grabbing"
            >
                <Bars3Icon className="size-5" />
            </div>
            <span className="text-sm font-medium text-slate-200">{label}</span>
            <div className="ml-auto">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    className="toggle toggle-xs"
                    onChange={onToggle}
                />
            </div>
        </div>
    )
}

export default function WhitepaperSectionOrder() {
    const { template, render, toggle, ammend } = useConfigurationHook()
    const sensors = useSensors(useSensor(PointerSensor))
    const normalizedOrder = useMemo(
        () => normalizeSectionOrder(template.whitepaper.sectionOrder),
        [template.whitepaper.sectionOrder]
    )

    useEffect(() => {
        if (!isSameOrder(template.whitepaper.sectionOrder, normalizedOrder)) {
            ammend("whitepaper", "sectionOrder", normalizedOrder)
        }
    }, [template.whitepaper.sectionOrder, normalizedOrder, ammend])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeId = active.id as WhitepaperSectionKey
        const overId = over.id as WhitepaperSectionKey
        const oldIndex = normalizedOrder.indexOf(activeId)
        const newIndex = normalizedOrder.indexOf(overId)

        if (oldIndex === -1 || newIndex === -1) return
        ammend("whitepaper", "sectionOrder", arrayMove(normalizedOrder, oldIndex, newIndex))
    }

    return (
        <fieldset className="fieldset border border-slate-600 p-2 md:h-full">
            <legend className="fieldset-legend text-sm font-normal">Modify components</legend>
            <span className="text-xs text-slate-400">Drag to reorder and toggle to enable.</span>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={normalizedOrder} strategy={verticalListSortingStrategy}>
                    <div className="mt-2 space-y-2">
                        {normalizedOrder.length === 0 ? (
                            <div className="rounded-md border border-dashed border-slate-600/70 bg-slate-800/70 px-3 py-6 text-center text-sm text-slate-400">
                                No sections available.
                            </div>
                        ) : (
                            normalizedOrder.map((key) => {
                                const toggleKey = SECTION_TOGGLE_KEYS[key]
                                return (
                                    <SectionOrderItem
                                        key={key}
                                        id={key}
                                        label={WHITEPAPER_SECTION_LABELS[key]}
                                        isEnabled={render[toggleKey]}
                                        onToggle={() => toggle(toggleKey)}
                                    />
                                )
                            })
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        </fieldset>
    )
}

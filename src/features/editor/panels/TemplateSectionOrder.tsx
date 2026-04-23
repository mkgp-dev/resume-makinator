import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bars3Icon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect } from "react"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import { TEMPLATE_SECTION_LABELS } from "@/entities/resume/constants/templateSections"
import {
    isSameTemplateSectionOrder,
    normalizeTemplateSectionOrder,
    TEMPLATE_SECTION_TOGGLE_KEYS,
} from "@/entities/resume/lib/templateSections"
import type { DragEndEvent } from "@dnd-kit/core"
import type { TemplateSectionKey } from "@/entities/resume/types"

type LinearTemplateId = "whitepaper" | "classic" | "modern-alt"

type SectionOrderItemProps = {
    id: TemplateSectionKey
    label: string
    isEnabled: boolean
    onToggle: () => void
}

type TemplateSectionOrderProps = {
    templateId: LinearTemplateId
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
                "flex flex-row items-center gap-3 rounded-[0.35rem] border border-slate-500/30 bg-slate-800/58 px-3 py-2 shadow-[inset_0_1px_0_rgba(148,163,184,0.04)]",
                isDragging ? "opacity-80" : "opacity-100",
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-400 hover:text-primary active:cursor-grabbing"
            >
                <Bars3Icon className="size-5" />
            </div>
            <span className="text-sm font-medium text-slate-100">{label}</span>
            <div className="ml-auto">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    className="toggle toggle-sm border-2 border-slate-500/70 bg-slate-950/75 text-white checked:border-primary checked:bg-primary"
                    onChange={onToggle}
                />
            </div>
        </div>
    )
}

export default function TemplateSectionOrder({ templateId }: TemplateSectionOrderProps) {
    const { template, render, toggle, amendTemplate } = useConfigurationHook()
    const sensors = useSensors(useSensor(PointerSensor))
    const normalizedOrder = normalizeTemplateSectionOrder(template[templateId].sectionOrder)

    useEffect(() => {
        if (!isSameTemplateSectionOrder(template[templateId].sectionOrder, normalizedOrder)) {
            amendTemplate(templateId, "sectionOrder", normalizedOrder)
        }
    }, [template, templateId, normalizedOrder, amendTemplate])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeId = active.id as TemplateSectionKey
        const overId = over.id as TemplateSectionKey
        const oldIndex = normalizedOrder.indexOf(activeId)
        const newIndex = normalizedOrder.indexOf(overId)

        if (oldIndex === -1 || newIndex === -1) return
        amendTemplate(templateId, "sectionOrder", arrayMove(normalizedOrder, oldIndex, newIndex))
    }

    return (
        <fieldset className="fieldset rounded-[0.45rem] border border-slate-500/48 bg-slate-800/34 p-4 md:h-full">
            <legend className="fieldset-legend px-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Modify components</legend>
            <span className="text-sm text-slate-400">Drag to reorder and toggle to enable.</span>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={normalizedOrder} strategy={verticalListSortingStrategy}>
                    <div className="mt-3 space-y-2">
                        {normalizedOrder.length === 0 ? (
                            <div className="rounded-[0.35rem] border border-dashed border-slate-500/36 bg-base-200/45 px-3 py-6 text-center text-sm text-slate-400">
                                No sections available.
                            </div>
                        ) : (
                            normalizedOrder.map((key) => {
                                const toggleKey = TEMPLATE_SECTION_TOGGLE_KEYS[key]
                                return (
                                    <SectionOrderItem
                                        key={key}
                                        id={key}
                                        label={TEMPLATE_SECTION_LABELS[key]}
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

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bars3Icon, ChevronDownIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { UniqueIdentifier } from "@dnd-kit/core"
import type { SortableItemSummary } from "@/features/sortable/List"

type SortableItemProps = {
    children: ReactNode
    id: UniqueIdentifier
    summary: SortableItemSummary
    onDelete: () => void
    onToggleExpand: () => void
    isFadeIn?: boolean
    isExpanded?: boolean
    isDragging?: boolean
    dropPosition?: "before" | "after" | null
}

const EXIT_DURATION_MS = 180

type SortableSummaryHeaderProps = {
    summary: SortableItemSummary
    isExpanded?: boolean
    onToggleExpand?: () => void
    isInteractive?: boolean
}

export function SortableSummaryHeader({
    summary,
    isExpanded = false,
    onToggleExpand,
    isInteractive = true,
}: SortableSummaryHeaderProps) {
    const ChevronIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon

    return (
        <button
            type="button"
            aria-expanded={isExpanded}
            onClick={onToggleExpand}
            disabled={!isInteractive}
            className={clsx(
                "flex w-full items-start gap-3 px-0 py-0.5 text-left transition-colors duration-150",
                isInteractive ? "text-slate-100 hover:text-slate-50" : "cursor-default text-slate-100",
            )}
        >
            <div className="pt-0.5 text-slate-400">
                <ChevronIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate font-manrope text-sm font-semibold text-inherit">{summary.title}</div>
                {summary.subtitle ? (
                    <div className="truncate pt-0.5 text-xs uppercase tracking-[0.08em] text-slate-400">{summary.subtitle}</div>
                ) : null}
            </div>
        </button>
    )
}

export default function SortableItem({
    children,
    id,
    summary,
    onDelete,
    onToggleExpand,
    isFadeIn,
    isExpanded = false,
    isDragging = false,
    dropPosition = null,
}: SortableItemProps) {
    const [isRemoving, setIsRemoving] = useState(false)
    const deleteTimerRef = useRef<number | null>(null)
    const {
        attributes,
        listeners,
        isDragging: sortableIsDragging,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id,
        transition: {
            duration: 220,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
    })
    const isActiveDrag = isDragging || sortableIsDragging

    const styles = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    useEffect(() => {
        return () => {
            if (deleteTimerRef.current !== null) {
                window.clearTimeout(deleteTimerRef.current)
            }
        }
    }, [])

    const handleDelete = () => {
        if (isRemoving) return

        setIsRemoving(true)
        deleteTimerRef.current = window.setTimeout(() => {
            onDelete()
        }, EXIT_DURATION_MS)
    }

    return (
        <div
            ref={setNodeRef}
            style={styles}
            data-testid="sortable-item"
            data-expanded={isExpanded ? "true" : "false"}
            data-state={isRemoving ? "removing" : isActiveDrag ? "dragging" : "idle"}
            data-drop-position={dropPosition ?? "none"}
            className={clsx(
                "relative rounded-[0.45rem] border border-slate-500/24 bg-base-200/30 px-3 py-3 transition-[transform,border-color,box-shadow,background-color,opacity] duration-180",
                isFadeIn && "editor-item-enter",
                isRemoving && "editor-item-removing",
                isActiveDrag && "z-30 border-sky-300/38 bg-slate-800/86 shadow-[0_22px_46px_rgba(2,6,23,0.38)]",
            )}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    data-testid="sortable-handle"
                    aria-label="Drag item"
                    className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-[0.35rem] text-slate-400 transition-[background-color,color,transform] duration-150 hover:bg-base-100/70 hover:text-slate-100 active:cursor-grabbing active:scale-95 active:text-slate-50"
                >
                    <Bars3Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                    <SortableSummaryHeader
                        summary={summary}
                        isExpanded={isExpanded}
                        onToggleExpand={onToggleExpand}
                        isInteractive={!isActiveDrag}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="Delete item"
                    className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.35rem] text-slate-400 transition-[background-color,color,transform] duration-150 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
                >
                    <TrashIcon className="size-5" />
                </button>
            </div>

            {isExpanded && !isActiveDrag ? (
                <div
                    className={clsx(
                        "mt-3 border-t border-slate-500/16 pt-3 transition-opacity duration-150",
                        "editor-panel-enter",
                    )}
                >
                    {children}
                </div>
            ) : null}

        </div>
    )
}

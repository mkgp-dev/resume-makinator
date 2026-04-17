import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import Button from "@/shared/ui/Button"
import Textarea from "@/shared/ui/Textarea"

type BulletListProps = {
    items: string[]
    onChange: (items: string[]) => void
    placeholder?: string
    addLabel?: string
}

const EXIT_DURATION_MS = 180

export default function BulletList({ items, onChange, placeholder, addLabel }: BulletListProps) {
    const [exitingIndexes, setExitingIndexes] = useState<number[]>([])
    const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null)
    const itemsRef = useRef(items)
    const removeTimersRef = useRef<number[]>([])

    useEffect(() => {
        itemsRef.current = items
    }, [items])

    useEffect(() => {
        return () => {
            removeTimersRef.current.forEach(timer => window.clearTimeout(timer))
        }
    }, [])

    useEffect(() => {
        if (recentlyAddedIndex === null) return

        const timer = window.setTimeout(() => {
            setRecentlyAddedIndex(null)
        }, 220)

        return () => window.clearTimeout(timer)
    }, [recentlyAddedIndex])

    const add = () => {
        setRecentlyAddedIndex(items.length)
        onChange([ ...items, "" ])
    }

    const remove = (index: number) => {
        if (exitingIndexes.includes(index)) return

        setExitingIndexes(current => [ ...current, index ])

        const timer = window.setTimeout(() => {
            const list = [ ...itemsRef.current ]
            if (index >= list.length) {
                removeTimersRef.current = removeTimersRef.current.filter(current => current !== timer)
                return
            }

            list.splice(index, 1)
            onChange(list)

            setExitingIndexes(current => current.filter(value => value !== index).map(value => value > index ? value - 1 : value))
            setRecentlyAddedIndex(current => current !== null && current > index ? current - 1 : current)
            removeTimersRef.current = removeTimersRef.current.filter(current => current !== timer)
        }, EXIT_DURATION_MS)

        removeTimersRef.current.push(timer)
    }

    const update = (index: number, value: string) => {
        const list = [...items]
        list[index] = value
        onChange(list)
    }

    return (
        <div data-testid="bullet-list-panel" className="editor-panel-enter space-y-3">
            <div className="mt-1">
                <Button
                    variant="addBullet"
                    icon={<PlusIcon className="size-3" />}
                    text={addLabel ?? "Add a bullet"}
                    onClick={add}
                    alignCenter={true}
                />
                {items.map((text, index) => (
                    <div
                        key={index}
                        data-testid="bullet-row"
                        data-state={exitingIndexes.includes(index) ? "removing" : "idle"}
                        className={clsx(
                            "flex items-start gap-2.5 overflow-hidden",
                            recentlyAddedIndex === index && "editor-item-enter",
                            exitingIndexes.includes(index) && "editor-item-removing",
                        )}
                    >
                        <Textarea
                            rows={2}
                            value={text}
                            placeholder={placeholder ?? "List of your achievements or experiences"}
                            onChange={event => update(index, event.target.value)}
                            isStretch={true}
                            isFlex={true}
                        />

                        <button
                            type="button"
                            aria-label="Delete bullet"
                            onClick={() => remove(index)}
                            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.3rem] border border-transparent text-slate-400 transition-colors duration-150 hover:border-red-400/26 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <XMarkIcon className="size-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import Textarea from "@/shared/ui/Textarea"

type BulletListProps = {
    items: string[]
    onChange: (items: string[]) => void
    placeholder?: string
    addLabel?: string
}

export default function BulletList({ items, onChange, placeholder, addLabel }: BulletListProps) {
    const add = () => onChange([ ...items, "" ])
    const remove = (index: number) => {
        const list = [...items]
        list.splice(index, 1)
        onChange(list)
    }
    const update = (index: number, value: string) => {
        const list = [...items]
        list[index] = value
        onChange(list)
    }

    return (
        <div className="space-y-2">
            <div className="mt-1">
                <Button
                    variant="addBullet"
                    icon={<PlusIcon className="size-3" />}
                    text={addLabel ?? "Add a bullet"}
                    onClick={add}
                    alignCenter={true}
                />
                {items.map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Textarea
                            rows={2}
                            value={text}
                            placeholder={placeholder ?? "List of your achievements or experiences"}
                            onChange={event => update(index, event.target.value)}
                            isStretch={true}
                            isFlex={true}
                        />

                        <Button variant="dangerTransparent" icon={<XMarkIcon className="size-6" />} iconOnly={true} onClick={() => remove(index)} />
                    </div>
                ))}
            </div>
        </div>
    )
}

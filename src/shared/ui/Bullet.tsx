import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import Textarea from "@/shared/ui/Textarea"
import type { WorkExperienceItem } from "@/entities/resume/types"

type BulletListProps = {
    item: WorkExperienceItem
}

export default function BulletList({ item }: BulletListProps) {
    const { modify } = useExperienceHook()

    const add = () => modify("workExperiences", item.id, { bulletSummary: [ ...item.bulletSummary, "" ] })
    const remove = (index: number) => {
        const list = [...item.bulletSummary]
        list.splice(index, 1)
        modify("workExperiences", item.id, { bulletSummary: list })
    }
    const update = (index: number, value: string) => {
        const list = [...item.bulletSummary]
        list[index] = value
        modify("workExperiences", item.id, { bulletSummary: list })
    }

    return (
        <div className="space-y-2">
            <div className="mt-1">
                <Button variant="addBullet" icon={<PlusIcon className="size-3" />} text="Add a bullet"  onClick={add} alignCenter={true} />
                {item.bulletSummary.map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Textarea
                            rows={2}
                            value={text}
                            placeholder="List of your achievements or experiences"
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

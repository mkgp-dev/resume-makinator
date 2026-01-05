import { useExperienceHook } from "@/hooks/useExperience";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

export default function BulletList({ item }) {
    const { modify } = useExperienceHook();

    const add = () => modify("workExperiences", item.id, { bulletSummary: [ ...item.bulletSummary, "" ] });
    const remove = (index) => {
        const list = [...item.bulletSummary];
        list.splice(index, 1);
        modify("workExperiences", item.id, { bulletSummary: list });
    };
    const update = (index, value) => {
        const list = [...item.bulletSummary];
        list[index] = value;
        modify("workExperiences", item.id, { bulletSummary: list });
    };

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
    );
}
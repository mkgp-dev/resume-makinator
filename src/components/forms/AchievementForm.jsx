import { useCommonStore } from "../../hooks/useCommonStore";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

export default function AchievementForm({ item }) {
    const { modify } = useCommonStore();

    return (
        <div className="flex flex-col">
            <Input
                label="Name"
                value={item.achievementName}
                placeholder="Academic Excellence Award"
                onChange={event => modify("achievements", item.id, { achievementName: event.target.value })}
                isStretch={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <Input
                    label="Institution"
                    value={item.achievementIssuer}
                    placeholder="Maritime Studies"
                    onChange={event => modify("achievements", item.id, { achievementIssuer: event.target.value })}
                    isStretch={true}
                />

                <Input
                    label="Year issued"
                    value={item.yearIssued}
                    placeholder="October 2021"
                    onChange={event => modify("achievements", item.id, { yearIssued: event.target.value })}
                    isStretch={true}
                />
            </div>

            <div className="mb-1">
                <Textarea
                    label="Description"
                    rows={4}
                    value={item.achievementDescription}
                    placeholder="Honored for outstanding scholastic performance, ranking within the Top 8 of the class."
                    onChange={event => modify("achievements", item.id, { achievementDescription: event.target.value })}
                    isStretch={true}
                />
            </div>
        </div>
    );
}
import { useExperienceHook } from "@/hooks/useExperience";
import BulletList from "@/components/ui/Bullet";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export default function WorkForm({ item }) {
    const { modify } = useExperienceHook();

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 items-start">
                <Input
                    label="Position"
                    value={item.jobTitle}
                    placeholder="Junior Web Developer"
                    onChange={event => modify("workExperiences", item.id, { jobTitle: event.target.value })}
                    isStretch={true}
                />

                <Input
                    label="Company"
                    value={item.companyName}
                    placeholder="Google"
                    onChange={event => modify("workExperiences", item.id, { companyName: event.target.value })}
                    isStretch={true}
                />
            </div>

            <div className="mt-1">
                <Checkbox
                    label="Use bullet points"
                    isChecked={item.bulletType}
                    onChange={event => modify("workExperiences", item.id, { bulletType: event.target.checked })}
                />
            </div>
            {!item.bulletType ? (
                <Textarea
                    label="Brief summary"
                    rows={4}
                    value={item.briefSummary}
                    placeholder="Tell me something about your achievements or experiences"
                    onChange={event => modify("workExperiences", item.id, { briefSummary: event.target.value })}
                    isStretch={true}
                />
            ) : (
                <BulletList item={item} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <Input
                    label="Year started"
                    value={item.startYear}
                    placeholder="October 2021"
                    onChange={event => modify("workExperiences", item.id, { startYear: event.target.value })}
                    isStretch={true}
                />
                <div className="flex flex-col">
                    <Input
                        label="Year ended"
                        value={item.endYear}
                        placeholder="November 2022"
                        onChange={event => modify("workExperiences", item.id, { endYear: event.target.value })}
                        isStretch={true}
                        isDisabled={item.currentlyHired}
                    />

                    <Checkbox
                        label="Present"
                        isChecked={item.currentlyHired}
                        onChange={event => modify("workExperiences", item.id, { currentlyHired: event.target.checked, endYear: event.target.checked ? "Present" : "" })}
                    />
                </div>
            </div>
        </div>
    );
}
import { useSkillHook } from "@/hooks/useSkill";
import Card from "@/components/ui/Card";
import MultiSelect from "@/features/multiselect/MultiSelect";
import SortableList from "@/features/sortable/List";
import SkillForm from "@/features/editor/forms/SkillForm";

export default function Skill() {
    const { common, update, newCore } = useSkillHook();

    return (
        <div className="space-y-4">
            <Card header="Common">
                <MultiSelect
                    label="Soft skills"
                    mode="softskill"
                    value={common}
                    placeholder="Leadership, Teamwork, Management"
                    onChange={softskill => update(softskill)}
                />
            </Card>


            <SortableList
                header="Developer"
                section="coreSkills"
                renderItem={item => <SkillForm item={item} />}
                onClick={newCore}
            />

        </div>
    );
}
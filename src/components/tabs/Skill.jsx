import { useSkillStore } from "../../hooks/useSkillStore";
import MultiSelect from "../../features/multiselect/MultiSelect";
import SortableList from "../../features/sortable/List";
import SkillForm from "../forms/SkillForm";

export default function Skill() {
    const { common, update, newCore } = useSkillStore();

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
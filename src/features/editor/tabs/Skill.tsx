import { useSkillHook } from "@/features/editor/hooks/useSkill"
import MultiSelect from "@/features/multiselect/MultiSelect"
import SortableList from "@/features/sortable/List"
import SkillForm from "@/features/editor/forms/SkillForm"
import EditorSection from "@/shared/ui/EditorSection"

export default function Skill() {
    const { common, update, newCore } = useSkillHook()

    return (
        <div className="space-y-8">
            <EditorSection title="Common">
                <MultiSelect
                    label="Soft skills"
                    mode="softskill"
                    value={common}
                    placeholder="Leadership, Teamwork, Management"
                    onChange={softskill => update(softskill)}
                />
            </EditorSection>

            <SortableList
                header="Developer"
                section="coreSkills"
                renderItem={item => <SkillForm item={item} />}
                getItemSummary={(item) => ({
                    title: item.devLanguage || "Untitled core skill",
                    subtitle: item.devFramework.length > 0 ? item.devFramework.join(", ") : undefined,
                })}
                onClick={newCore}
            />

        </div>
    )
}

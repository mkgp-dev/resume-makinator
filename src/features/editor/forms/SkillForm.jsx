import { useSkillHook } from "@/hooks/useSkill";
import MultiSelect from "@/features/multiselect/MultiSelect";

export default function SkillForm({ item }) {
    const { modify } = useSkillHook();

    return (
        <div className="flex flex-col">
            <MultiSelect
                label="Language"
                mode="devLanguage"
                value={item.devLanguage}
                placeholder="JavaScript"
                onChange={value => modify("coreSkills", item.id, { devLanguage: value })}
                allowMultiple={false}
            />

            <div className="mb-1">
                <MultiSelect
                    label="Frameworks"
                    mode="framework"
                    value={item.devFramework}
                    placeholder="Webpack, React, Node.js, Express"
                    onChange={value => modify("coreSkills", item.id, { devFramework: value })}
                />
            </div>
        </div>
    );
}
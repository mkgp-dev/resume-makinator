import { useConfigurationStore } from "../../hooks/useConfigurationStore";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Toggle from "../ui/Toggle";

export default function PagePanel() {
    const { config, render, modify, toggle } = useConfigurationStore();

    const pageSize = [
        { name: "A4", value: "A4" },
        { name: "LETTER", value: "Letter" },
    ];

    const fontStyle = [
        { name: "Lora", value: "Lora" },
        { name: "Playfair Display", value: "Playfair-Display" },
        { name: "Helvetica", value: "Helvetica" },
        { name: "Montserrat", value: "Montserrat" },
    ];

    const renderBlock = [
        { label: "Work experience", isChecked: render.workExperiences, onChange: () => toggle("workExperiences") },
        { label: "Personal project", isChecked: render.personalProjects, onChange: () => toggle("personalProjects") },
        { label: "Certificate", isChecked: render.certificates, onChange: () => toggle("certificates") },
        { label: "Achievement", isChecked: render.achievements, onChange: () => toggle("achievements") },
        { label: "Education", isChecked: render.education, onChange: () => toggle("education") },
        { label: "Soft skill", isChecked: render.softSkills, onChange: () => toggle("softSkills") },
        { label: "Core skill", isChecked: render.coreSkills, onChange: () => toggle("coreSkills") },
        { label: "Reference", isChecked: render.references, onChange: () => toggle("references") },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <div className="flex flex-col">
                <Select
                    label="Paper size"
                    value={config.pageSize}
                    options={pageSize}
                    onChange={value => modify("pageSize", value)}
                />

                <Select
                    label="Font style"
                    value={config.fontStyle}
                    options={fontStyle}
                    onChange={value => modify("fontStyle", value)}
                />

                <Input
                    type="number"
                    label="Font size"
                    value={config.fontSize}
                    placeholder="11 is recommended"
                    onChange={event => modify("fontSize", event.target.value)}
                    isStretch={true}
                />
            </div>

            <div className="flex flex-col">
                <Toggle header="Modify components" lists={renderBlock} />
            </div>
        </div>
    );
}
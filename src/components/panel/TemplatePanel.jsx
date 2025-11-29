import { useConfigurationStore } from "../../hooks/useConfigurationStore";
import Checkbox from "../ui/Checkbox";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function TemplatePanel() {
    const { config, template, modify, ammend } = useConfigurationStore();

    const templates = [
        { name: "Simple Whitepaper", value: "whitepaper" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <div className="flex flex-col">
                <Select
                    label="Select your theme"
                    value={config.template}
                    options={templates}
                    onChange={value => modify("template", value)}
                />

                <div className="mt-1">
                    {config.template === "whitepaper" && (
                        <>
                            <Checkbox
                                label="Enable profile picture"
                                isChecked={template[config.template].enablePicture}
                                onChange={event => ammend(config.template, "enablePicture", event.target.checked)}
                            />

                            <Checkbox
                                label="Enable bullets"
                                isChecked={template[config.template].bulletText}
                                onChange={event => ammend(config.template, "bulletText", event.target.checked)}
                            />

                            <Checkbox
                                label="Inline information"
                                isChecked={template[config.template].inlineInformation}
                                onChange={event => ammend(config.template, "inlineInformation", event.target.checked)}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col">
                {config.template === "whitepaper" && (
                    <>
                        <Input
                            label="Component spacing"
                            value={template[config.template].blockSpace}
                            placeholder="12 is recommended"
                            onChange={event => ammend(config.template, "blockSpace", event.target.value)}
                            isStretch={true}
                        />

                        <Input
                            label="Profile picture size"
                            value={template[config.template].pictureSize}
                            placeholder="100 is 1x1"
                            onChange={event => ammend(config.template, "pictureSize", event.target.value)}
                            isStretch={true}
                            isDisabled={!template[config.template].enablePicture}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
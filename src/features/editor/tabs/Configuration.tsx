import EditorSection from "@/shared/ui/EditorSection"
import PagePanel from "@/features/editor/panels/PagePanel"
import TemplatePanel from "@/features/editor/panels/TemplatePanel"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import Input from "@/shared/ui/Input"

const POLLINATIONS_KEY_PATTERN = "^(sk|pk)_[A-Za-z0-9]{32}$"
const isPollinationsKeyValid = (value: string) =>
    !value.trim() || /^(sk|pk)_[A-Za-z0-9]{32}$/.test(value.trim())

function AssistantPanel() {
    const { config, updateConfig } = useConfigurationHook()
    const isKeyValid = isPollinationsKeyValid(config.pollinationsApiKey)

    return (
        <div className="editor-subtle-panel space-y-3 p-4">
            <Input
                label="Pollinations API key"
                value={config.pollinationsApiKey}
                placeholder="sk_00000000000000000000000000000000"
                maxLength={35}
                pattern={POLLINATIONS_KEY_PATTERN}
                autoComplete="off"
                onChange={(event) => updateConfig("pollinationsApiKey", event.target.value.replace(/\s/g, ""))}
                isStretch={true}
                noPadding={true}
            />
            {!isKeyValid ? (
                <p className="text-sm leading-6 text-error">
                    Use sk_ or pk_ followed by 32 alphanumeric characters.
                </p>
            ) : null}
            <p className="text-sm leading-6 text-slate-400">
                Optional. Get your Pollinations key at{" "}
                <a
                    href="https://enter.pollinations.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-sky-200 underline-offset-4 transition-colors duration-150 hover:text-sky-100 hover:underline"
                >
                    enter.pollinations.ai
                </a>
                .
            </p>
        </div>
    )
}

export default function Configuration() {

    return (
        <div className="space-y-8">
            <EditorSection title="Template">
                <TemplatePanel />
            </EditorSection>

            <EditorSection title="Page">
                <PagePanel />
            </EditorSection>

            <EditorSection title="Assistant">
                <AssistantPanel />
            </EditorSection>
        </div>
    )
}

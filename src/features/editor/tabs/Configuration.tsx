import EditorSection from "@/shared/ui/EditorSection"
import PagePanel from "@/features/editor/panels/PagePanel"
import TemplatePanel from "@/features/editor/panels/TemplatePanel"

export default function Configuration() {

    return (
        <div className="space-y-8">
            <EditorSection title="Template">
                <TemplatePanel />
            </EditorSection>

            <EditorSection title="Page">
                <PagePanel />
            </EditorSection>
        </div>
    )
}

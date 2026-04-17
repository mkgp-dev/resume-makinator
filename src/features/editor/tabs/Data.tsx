import DataPanel from "@/features/editor/panels/DataPanel"
import ResetPanel from "@/features/editor/panels/ResetPanel"
import EditorSection from "@/shared/ui/EditorSection"

export default function Data() {

    return (
        <div className="space-y-8">
            <DataPanel />

            <EditorSection title="Reset">
                <ResetPanel />
            </EditorSection>
        </div>
    )
}

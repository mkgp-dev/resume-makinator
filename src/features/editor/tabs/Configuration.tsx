import Card from "@/shared/ui/Card"
import PagePanel from "@/features/editor/panels/PagePanel"
import TemplatePanel from "@/features/editor/panels/TemplatePanel"

export default function Configuration() {

    return (
        <div className="space-y-4">
            <Card header="Template">
                <TemplatePanel />
            </Card>

            <Card header="Page">
                <PagePanel />
            </Card>
        </div>
    )
}
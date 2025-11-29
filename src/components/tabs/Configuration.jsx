import Card from "../ui/Card";
import PagePanel from "../panel/PagePanel";
import TemplatePanel from "../panel/TemplatePanel";

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
    );
}
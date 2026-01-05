import DataPanel from "@/features/editor/panels/DataPanel";
import ResetPanel from "@/features/editor/panels/ResetPanel";
import Card from "@/components/ui/Card";

export default function Data() {

    return (
        <div className="space-y-4">
            <DataPanel />

            <Card header="Reset">
                <ResetPanel />
            </Card>
        </div>
    );
}
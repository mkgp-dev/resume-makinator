import DataPanel from "../panel/DataPanel";
import ResetPanel from "../panel/ResetPanel";
import Card from "../ui/Card";

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
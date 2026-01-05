import AboutForm from "@/features/editor/forms/AboutForm";
import Card from "@/components/ui/Card";

export default function About() {

    return (
        <Card header="About you">
            <AboutForm />
        </Card>
    );
}
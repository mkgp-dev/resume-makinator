import { pdf } from "@react-pdf/renderer";
import { useResumeStore } from "../../hooks/useResumeStore";
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import Render from "./templates/Render";

const DEBOUNCE_MS = 300;

const previewData = (store) => ({
    activePanel: store.activePanel,
    personalDetails: store.personalDetails,
    education: store.education,
    references: store.references,
    softSkills: store.softSkills,
    coreSkills: store.coreSkills,
    workExperiences: store.workExperiences,
    personalProjects: store.personalProjects,
    certificates: store.certificates,
    achievements: store.achievements,
    configuration: store.configuration,
    enableInRender: store.enableInRender,
    template: store.template,
});

export default function Preview() {
    const store = useResumeStore();

    const stableObject = useMemo(() => previewData(store), [
        store.activePanel,
        store.personalDetails,
        store.education,
        store.references,
        store.softSkills,
        store.coreSkills,
        store.workExperiences,
        store.personalProjects,
        store.certificates,
        store.achievements,
        store.configuration,
        store.enableInRender,
        store.template,
    ]);

    const [debouncedData] = useDebounce(stableObject, DEBOUNCE_MS);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (!debouncedData) return;

        let cancelled = false, objectUrl;

        const generateDocument = async () => {
            try {
                const blob = await pdf(<Render data={debouncedData} />).toBlob();
                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);
                setPdfUrl(objectUrl);
            } catch (error) {
                console.error("An error has occured", error);
            }
        }

        generateDocument();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [debouncedData]);

    const src = pdfUrl ? `${pdfUrl}#view=Fit` : undefined;

    return (
        <iframe
            src={src}
            title="Resume Preview"
            className="h-full w-full border-0"
        />
    );
}
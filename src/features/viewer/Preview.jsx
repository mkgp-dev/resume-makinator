import { pdf } from "@react-pdf/renderer";
import { useResumeStore } from "../../hooks/useResumeStore";
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { InformationCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Render from "./templates/Render";
import Button from "../../components/ui/Button";

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
    const blobId = pdfUrl
        ? pdfUrl.split("/").pop() ?? null
        : null;

    return (
        <>
            <div className="hidden h-full md:block">
                <iframe
                    src={src}
                    title="Resume Preview"
                    className="h-full w-full border-0"
                />
            </div>

            <div className="space-y-2 p-4 md:hidden">
                <div className="flex items-start gap-2 text-slate-500">
                    <InformationCircleIcon className="size-6 shrink-0" />
                    <p className="text-sm">PDF preview is limited on mobile devices. Tap the button below to open your resume in a new tab.</p>
                </div>
                <Button
                    text="Preview"
                    icon={<ArrowTopRightOnSquareIcon className="size-5" />}
                    onClick={() => {
                        if (!pdfUrl) return;
                        window.open(pdfUrl, "_blank", "noopener,noreferrer");
                    }}
                    alignCenter={true}
                    isStretch={true}
                />
            </div>
        </>
    );
}
import "@/features/viewer/components/fonts/FontRegister";
import { Document, Page } from "@react-pdf/renderer";
import React from "react";
import { getTemplateComponent } from "@/features/viewer/templates";

function Render({ data }) {
    const Template = getTemplateComponent(data.configuration.template);

    const documentTitle = data.personalDetails.fullName
        ? `${data.personalDetails.fullName} - ${data.personalDetails.jobTitle || "Resume"}`
        : "My Resume";

    return (
        <Document
            title={documentTitle}
            author={data.personalDetails.fullName || "mkgp-dev"}
            subject="Resume"
            creator="Resume Makinator"
            producer="mkgp-dev"
            language="en"
        >
            <Page
                size={data.configuration.pageSize}
                style={{ padding: 15 }}
                renderTextLayer={false}
                renderAnnotationLayer={false}
            >
                <Template data={data} />
            </Page>
        </Document>
    );
}

export default React.memo(Render);
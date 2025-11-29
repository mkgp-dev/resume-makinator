import "../components/fonts/FontRegister";
import { Document, Page } from "@react-pdf/renderer";
import React from "react";
import Whitepaper from "./whitepaper/Whitepaper";

function Render({ data }) {
    const templateConfiguration = () => {
        switch (data.configuration.template) {
            case "whitepaper": return Whitepaper;
            default: return Whitepaper;
        }
    };

    const Template = templateConfiguration();

    const documentTitle = data.personalDetails.fullName
        ? `${data.personalDetails.fullName} – ${data.personalDetails.jobTitle || "Resume"}`
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
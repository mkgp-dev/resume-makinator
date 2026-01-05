import Whitepaper from "@/features/viewer/templates/whitepaper/Whitepaper";
import Classic from "@/features/viewer/templates/classic/Classic";

export const TEMPLATE_REGISTRY = {
    whitepaper: {
        id: "whitepaper",
        label: "Simple Whitepaper",
        Component: Whitepaper,
    },
    classic: {
        id: "classic",
        label: "Classic",
        Component: Classic,
    },
};

export const templateOptions = Object.values(TEMPLATE_REGISTRY).map(template => ({
    name: template.label,
    value: template.id,
}));

export const getTemplateComponent = (templateId) => TEMPLATE_REGISTRY[templateId]?.Component || TEMPLATE_REGISTRY.whitepaper.Component;

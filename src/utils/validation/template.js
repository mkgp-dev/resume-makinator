export const TEMPLATE_OPTIONS = [
    { name: "Simple Whitepaper", value: "whitepaper" },
    { name: "Classic", value: "classic" },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATE_OPTIONS[0].value;

export const isTemplateId = (value) => TEMPLATE_OPTIONS.some((option) => option.value === value);
export const normalizeTemplateId = (value) => isTemplateId(value) ? value : DEFAULT_TEMPLATE_ID;
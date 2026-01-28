import ISO6391 from "iso-639-1"

export const LANGUAGE_OPTIONS = ISO6391.getAllCodes().map(item => ({
    value: item,
    label: ISO6391.getName(item),
}))

LANGUAGE_OPTIONS.sort((a, b) => a.label.localeCompare(b.label))

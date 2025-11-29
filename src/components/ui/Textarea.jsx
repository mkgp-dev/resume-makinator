import clsx from "clsx";

export default function Textarea({
    label,
    rows = 2,
    value,
    placeholder,
    onChange,
    isStretch = false,
    isFlex = false,
}) {

    return (
        <fieldset className={clsx(
            "fieldset",
            isFlex && "flex-1",
        )}>
            {label && <legend className="fieldset-legend text-sm font-medium">{label}</legend>}
            <textarea
                rows={rows}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={onChange}
                className={clsx(
                    "textarea bg-slate-800 border border-slate-600 shadow-none outline-none resize-none placeholder:text-slate-600",
                    isStretch && "w-full",
                )}
            />
        </fieldset>
    );
}
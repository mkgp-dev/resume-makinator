import ReactSelect from "react-select"
import clsx from "clsx"

type SelectOptionItem = {
    name?: string
    value: string
}

type SelectOption = {
    label: string
    value: string
}

type SelectProps = {
    label?: string
    value?: string
    options?: SelectOptionItem[]
    onChange?: (value: string) => void
}

export default function Select({
    label,
    value,
    options = [],
    onChange,
}: SelectProps) {
    const selectOptions = options.map(item => ({
        value: item.value,
        label: item.name ?? String(item.value),
    }))

    const selectedOption = selectOptions.find(item => item.value === value) ?? null

    const handleChange = (selected: SelectOption | null) => onChange?.(selected ? selected.value : "")

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend text-sm font-medium">{label}</legend>}
            <ReactSelect
                unstyled
                value={selectedOption}
                options={selectOptions}
                onChange={handleChange}
                classNames={{
                    control: () => "input h-full bg-slate-800 border border-slate-600 shadow-none outline-none w-full",
                    placeholder: () => "text-slate-600 text-sm",
                    multiValue: () => "flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5",
                    multiValueLabel: () => "text-xs text-black",
                    multiValueRemove: () => "text-black hover:bg-transparent cursor-pointer",
                    menu: () => "mt-1 w-full rounded-md border border-slate-600 bg-slate-800 shadow-lg",
                    option: ({ isFocused }) =>
                        clsx(
                            "cursor-pointer px-3 py-1.5 text-sm",
                            isFocused && "bg-primary text-black",
                        ),
                    noOptionsMessage: () => "px-3 py-2 text-sm text-slate-500 bg-slate-800 border border-dashed border-slate-600 rounded-md",
                    indicatorsContainer: () => "flex items-center gap-1",
                    clearIndicator: () => "p-1 text-slate-400 hover:text-error",
                    dropdownIndicator: ({ isFocused }) =>
                        clsx(
                            "p-1 rounded-md hover:text-primary",
                            isFocused ? "text-primary" : "text-slate-400",
                        ),
                }}
            />
        </fieldset>
    )
}

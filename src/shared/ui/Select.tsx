import ReactSelect from "react-select"
import clsx from "clsx"
import { useId } from "react"

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
    isDisabled?: boolean
}

export default function Select({
    label,
    value,
    options = [],
    onChange,
    isDisabled = false,
}: SelectProps) {
    const selectId = useId()
    const selectOptions = options.map(item => ({
        value: item.value,
        label: item.name ?? String(item.value),
    }))

    const selectedOption = selectOptions.find(item => item.value === value) ?? null

    const handleChange = (selected: SelectOption | null) => onChange?.(selected ? selected.value : "")

    return (
        <fieldset className="fieldset gap-1.5">
            {label ? (
                <label htmlFor={selectId} className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {label}
                </label>
            ) : null}
            <ReactSelect
                inputId={selectId}
                aria-label={label}
                isDisabled={isDisabled}
                unstyled
                value={selectedOption}
                options={selectOptions}
                onChange={handleChange}
                classNames={{
                    control: () => "editor-control input min-h-11 w-full rounded-[var(--radius-field)]",
                    placeholder: () => "text-sm text-slate-500",
                    multiValue: () => "flex items-center gap-1 rounded-[0.2rem] bg-primary/18 px-2 py-0.5 text-primary-content",
                    multiValueLabel: () => "text-xs text-slate-100",
                    multiValueRemove: () => "cursor-pointer text-slate-100 hover:bg-transparent",
                    menu: () => "mt-1 w-full rounded-[var(--radius-field)] border border-slate-500/38 bg-slate-900/96 shadow-xl backdrop-blur-xl",
                    option: ({ isFocused }) =>
                        clsx(
                            "cursor-pointer px-3 py-1.5 text-sm",
                            isFocused && "bg-primary/18 text-slate-100",
                        ),
                    noOptionsMessage: () => "rounded-[var(--radius-field)] border border-dashed border-slate-500/38 bg-slate-900/55 px-3 py-2 text-sm text-slate-500",
                    indicatorsContainer: () => "flex items-center gap-1 border-l border-slate-500/34 pl-2",
                    clearIndicator: () => "p-1 text-slate-400 hover:text-error",
                    dropdownIndicator: ({ isFocused }) =>
                        clsx(
                            "rounded-[var(--radius-field)] p-1 hover:text-primary",
                            isFocused ? "text-primary" : "text-slate-400",
                        ),
                }}
            />
        </fieldset>
    )
}

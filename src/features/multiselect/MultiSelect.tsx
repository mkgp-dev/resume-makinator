import { useId, useMemo, useState } from "react"
import type { KeyboardEvent } from "react"
import { LANGUAGE_OPTIONS } from "@/features/multiselect/constants/Languages"
import { SOFT_SKILL_OPTIONS } from "@/features/multiselect/constants/SoftSkills"
import { FRAMEWORK_OPTIONS } from "@/features/multiselect/constants/Frameworks"
import { DEV_LANGUAGE_OPTIONS } from "@/features/multiselect/constants/DevLanguages"
import { components } from "react-select"
import type { InputActionMeta, MultiValue, OnChangeValue, OptionProps, PropsValue } from "react-select"
import CreatableSelect from "react-select/creatable"
import clsx from "clsx"

const SelectOption = components.Option

type Option = {
    label: string
    value: string
}

type MultiSelectMode = "language" | "softskill" | "devLanguage" | "framework"

type MultiSelectProps =
    | {
          label?: string
          mode: MultiSelectMode
          value?: string[]
          placeholder?: string
          onChange?: (value: string[]) => void
          allowMultiple?: true
      }
    | {
          label?: string
          mode: MultiSelectMode
          value?: string
          placeholder?: string
          onChange?: (value: string) => void
          allowMultiple: false
      }

const OPTIONS = {
    language: LANGUAGE_OPTIONS,
    softskill: SOFT_SKILL_OPTIONS,
    devLanguage: DEV_LANGUAGE_OPTIONS,
    framework: FRAMEWORK_OPTIONS,
}

export default function MultiSelect({
    label,
    mode,
    value,
    placeholder,
    onChange,
    allowMultiple = true,
}: MultiSelectProps) {
    const inputId = useId()
    const [input, setInput] = useState("")
    const setOptions = OPTIONS[mode] || []

    const currentData = Array.isArray(value)
        ? value
        : typeof value === "string" && value.trim()
            ? value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean)
            : []

    const properMappingValue = (text: string): Option | null => {
        if (!text) return null
        const found = setOptions.find(item => item.label.toLowerCase() === text.toLowerCase() || String(item.value).toLowerCase() === text.toLowerCase())
        return found || { label: text, value: text }
    }

    const multipleValue = currentData
        .map(properMappingValue)
        .filter((option): option is Option => Boolean(option))

    const singleValue = currentData.length > 0 ? properMappingValue(currentData[0]) : null

    const currentValue: PropsValue<Option> = allowMultiple ? multipleValue : singleValue

    const filteredOptions = setOptions
        .filter(item => item.label.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 25)

    const handleChange = (selected: OnChangeValue<Option, boolean>) => {
        if (!onChange) return

        if (allowMultiple === false) {
            const option = selected as Option | null
            (onChange as ((value: string) => void) | undefined)?.(option ? option.label : "")
            return
        }

        const selectedItems = (selected as MultiValue<Option>) || []
        const items = Array.from(new Set(selectedItems.map(item => item.label)))
        void (onChange as ((value: string[]) => void) | undefined)?.(items)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!input) return

        if (event.key === ",") {
            event.preventDefault()

            const label = input.replace(/,$/, "").trim()
            if (!label) return

            const exist = currentData.some(item => item.toLowerCase() === label.toLowerCase())

            if (allowMultiple) {
                if (!exist) {
                    (onChange as ((value: string[]) => void) | undefined)?.([...currentData, label])
                }
            } else {
                (onChange as ((value: string) => void) | undefined)?.(label)
            }

            setInput("")
        }
    }

    const checkBoxOption = useMemo(() => {
        return function CheckboxOption(props: OptionProps<Option, boolean>) {
            const { isSelected } = props
            return (
                <SelectOption {...props}>
                    <div className="flex items-center gap-2">
                        {allowMultiple && (
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.2rem] border bg-base-100 transition-colors duration-150",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-content"
                                        : "border-base-300 text-transparent",
                                )}
                            >
                                <span className="text-[10px] leading-none">✓</span>
                            </span>
                        )}
                        <span>{props.label}</span>
                    </div>
                </SelectOption>
            )
        }
    }, [allowMultiple])

    const selectComponents = useMemo(() => ({
        Option: checkBoxOption,
    }), [checkBoxOption])

    return (
        <fieldset className="fieldset gap-1.5">
            {label ? (
                <label htmlFor={inputId} className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {label}
                </label>
            ) : null}
            <CreatableSelect<Option, boolean>
                inputId={inputId}
                aria-label={label}
                isMulti={allowMultiple}
                unstyled
                value={currentValue}
                options={filteredOptions}
                inputValue={input}
                onInputChange={(nextValue: string, meta: InputActionMeta) => {
                    if (meta.action === "input-change") {
                        setInput(nextValue)
                    }

                    if (meta.action === "menu-close") {
                        setInput("")
                    }
                }}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                openMenuOnFocus
                openMenuOnClick
                closeMenuOnSelect={!allowMultiple}
                hideSelectedOptions={!allowMultiple}
                blurInputOnSelect={!allowMultiple}
                isValidNewOption={(inputValue, selectValue, selectOptions) => {
                    const normalized = inputValue.trim().toLowerCase()
                    if (!normalized) return false

                    const getNormalizedLabel = (option: { label?: string; value?: string }) =>
                        String(option.label ?? option.value ?? "").toLowerCase()

                    const existsInOptions = selectOptions.some(option => getNormalizedLabel(option) === normalized)
                    const existsInValue = selectValue.some(option => getNormalizedLabel(option) === normalized)

                    return !existsInOptions && !existsInValue
                }}
                components={selectComponents}
                getOptionValue={(option) => option.label}
                getOptionLabel={(option) => option.label}
                classNames={{
                    control: () => "editor-control flex min-h-11 w-full items-stretch gap-2 rounded-[var(--radius-field)] px-3 py-2",
                    placeholder: () => "m-0 text-sm leading-none text-slate-500",
                    valueContainer: () => "flex min-h-8 flex-1 flex-wrap content-center items-center gap-1.5 py-0",
                    input: () => "m-0 p-0 text-sm leading-none text-slate-100",
                    singleValue: () => "m-0 text-sm leading-none text-slate-100",
                    multiValue: () => "flex items-center gap-1 rounded-[0.2rem] bg-sky-300/16 px-2 py-0.5 ring-1 ring-sky-200/10",
                    multiValueLabel: () => "text-xs text-slate-100",
                    multiValueRemove: () => "cursor-pointer text-slate-100 hover:bg-transparent",
                    menu: () => "mt-1 w-full rounded-[var(--radius-field)] border border-slate-500/38 bg-slate-900/96 shadow-xl backdrop-blur-xl",
                    option: ({ isFocused }) =>
                        clsx(
                            "cursor-pointer px-3 py-1.5 text-sm",
                            isFocused && "bg-primary/18 text-slate-100",
                        ),
                    noOptionsMessage: () => "rounded-[var(--radius-field)] border border-dashed border-slate-500/38 bg-slate-900/55 px-3 py-2 text-sm text-slate-500",
                    indicatorsContainer: () => "flex min-h-8 shrink-0 items-center justify-center self-stretch border-l border-slate-500/34 pl-2",
                    clearIndicator: () => "p-1 text-slate-400 hover:text-error",
                    dropdownIndicator: ({ isFocused }) =>
                        clsx(
                            "flex h-full items-center justify-center px-1.5 text-slate-300 hover:text-slate-50",
                            isFocused && "text-primary",
                        ),
                    indicatorSeparator: () => "hidden",
                }}
            />
        </fieldset>
    )
}

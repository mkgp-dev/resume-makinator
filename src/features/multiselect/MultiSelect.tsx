import { useState } from "react"
import type { KeyboardEvent } from "react"
import { LANGUAGE_OPTIONS } from "@/features/multiselect/constants/Languages"
import { SOFT_SKILL_OPTIONS } from "@/features/multiselect/constants/SoftSkills"
import { FRAMEWORK_OPTIONS } from "@/features/multiselect/constants/Frameworks"
import { DEV_LANGUAGE_OPTIONS } from "@/features/multiselect/constants/DevLanguages"
import { components } from "react-select"
import type { MultiValue, OnChangeValue, OptionProps, PropsValue } from "react-select"
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

    const checkBoxOption = (props: OptionProps<Option, boolean>) => {
        const { isSelected } = props
        return (
            <SelectOption {...props}>
                <div className="flex items-center gap-2">
                    {allowMultiple && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => null}
                            className="checkbox checkbox-xs rounded-sm shadow-none bg-slate-700/90 border border-slate-600/70 checked:bg-primary checked:text-black"
                        />
                    )}
                    <span>{props.label}</span>
                </div>
            </SelectOption>
        )
    }

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend text-sm font-medium">{label}</legend>}
            <CreatableSelect<Option, boolean>
                isMulti={allowMultiple}
                unstyled
                value={currentValue}
                options={filteredOptions}
                inputValue={input}
                onInputChange={setInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                closeMenuOnSelect={!allowMultiple}
                hideSelectedOptions={!allowMultiple}
                components={{
                    Option: checkBoxOption,
                }}
                getOptionValue={(option) => option.label}
                getOptionLabel={(option) => option.label}
                classNames={{
                    control: () => "input h-full bg-slate-800 border border-slate-600 shadow-none outline-none w-full",
                    placeholder: () => "text-slate-600 text-sm",
                    valueContainer: () => "flex flex-wrap gap-1 py-3",
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
                    indicatorSeparator: () => "bg-slate-600",
                }}
            />
        </fieldset>
    )
}

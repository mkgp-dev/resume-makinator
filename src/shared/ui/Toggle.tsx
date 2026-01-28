import clsx from "clsx"
import type { ChangeEventHandler } from "react"

type ToggleItem = {
    label: string
    isChecked?: boolean
    onChange?: ChangeEventHandler<HTMLInputElement> | (() => void)
}

type ToggleProps = {
    header?: string
    lists?: ToggleItem[]
    label?: string
    isChecked?: boolean
    onChange?: ChangeEventHandler<HTMLInputElement> | (() => void)
    fixHeight?: boolean
}

export default function Toggle({
    header,
    lists = [],
    label,
    isChecked,
    onChange,
    fixHeight = false,
}: ToggleProps) {

    return (
        <fieldset className={clsx(
            "fieldset border border-slate-600 p-2",
            fixHeight && "h-full",
        )}>
            {header && <legend className="fieldset-legend text-sm font-normal">{header}</legend>}
            {lists.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {lists.map((item, index) => (
                        <div key={index}>
                            <label className="label text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={!!item.isChecked}
                                    className="toggle toggle-xs"
                                    onChange={item.onChange}
                                />
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <label className="label text-slate-300">
                        <input
                            type="checkbox"
                            checked={!!isChecked}
                            className="toggle toggle-sm"
                            onChange={onChange}
                        />
                        {label}
                    </label>
                </div>
            )}

        </fieldset>
    )
}

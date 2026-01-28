import type { ChangeEventHandler } from "react"

type CheckboxProps = {
    label?: string
    isChecked?: boolean
    onChange?: ChangeEventHandler<HTMLInputElement>
}

export default function Checkbox({
    label,
    isChecked,
    onChange,
}: CheckboxProps) {

    return (
        <div>
            <label className="label text-sm text-wrap">
                <input
                    type="checkbox"
                    checked={isChecked ?? false}
                    className="checkbox checkbox-xs rounded-sm shadow-none bg-slate-800 border border-slate-600 checked:bg-primary checked:text-black"
                    onChange={onChange}
                />
                {label}
            </label>
        </div>
    )
}

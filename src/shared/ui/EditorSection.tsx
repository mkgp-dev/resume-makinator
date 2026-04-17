import clsx from "clsx"
import type { ReactNode } from "react"

type EditorSectionProps = {
    title: string
    children: ReactNode
    action?: ReactNode
    testId?: string
    className?: string
}

export default function EditorSection({
    title,
    children,
    action,
    testId,
    className,
}: EditorSectionProps) {
    return (
        <section data-testid={testId} className={clsx("space-y-4", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <h2 className="editor-section-title shrink-0">{title}</h2>
                    <div aria-hidden="true" className="editor-section-rule" />
                </div>
                {action ? <div className="w-full sm:w-auto">{action}</div> : null}
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </section>
    )
}

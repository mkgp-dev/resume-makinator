import {
    ArrowDownCircleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline"
import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import { useEffect, useRef } from "react"
import Alert from "@/shared/ui/Alert"
import Button from "@/shared/ui/Button"
import Input from "@/shared/ui/Input"
import EditorSection from "@/shared/ui/EditorSection"
import Modal from "@/shared/ui/Modal"

export default function DataPanel() {
    const {
        dataStatus,
        setDataStatus,
        importData,
        exportData,
        isImporting,
        hasPendingImport,
        confirmImportData,
        cancelImportData,
    } = useConfigurationHook()
    const importWarningRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        setDataStatus(null)
    }, [setDataStatus])

    useEffect(() => {
        if (hasPendingImport) {
            importWarningRef.current?.showModal()
        } else {
            importWarningRef.current?.close()
        }
    }, [hasPendingImport])

    return (
        <EditorSection title="Transfer data">
            <Modal
                ref={importWarningRef}
                size="md"
                onCancel={cancelImportData}
                content={
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-warning/28 bg-warning/12 text-warning">
                                <ExclamationTriangleIcon className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-manrope text-lg font-semibold text-slate-100">Replace current resume data?</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    You already have resume information saved in this browser. Importing this JSON file will replace the current data.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-[0.4rem] border border-sky-300/18 bg-sky-400/8 px-4 py-3 text-sm leading-6 text-slate-300">
                            I recommend downloading your current data first so you have a backup before continuing.
                        </div>
                    </div>
                }
                actions={
                    <>
                        <Button
                            text="Cancel"
                            variant="transparent"
                            onClick={cancelImportData}
                        />
                        <Button
                            text="Proceed with import"
                            variant="warning"
                            onClick={confirmImportData}
                            isDisabled={isImporting}
                        />
                    </>
                }
            />

            <div className="editor-subtle-panel flex flex-col gap-3">
                <Button
                    text="Download your data"
                    icon={<ArrowDownCircleIcon className="size-5" />}
                    onClick={exportData}
                    alignCenter={true}
                    isStretch={true}
                />
                <span className="text-sm leading-6 text-slate-400">Save a copy of your data to your device. If localStorage is ever reset or corrupted, you can quickly import this file to restore everything.</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                <div className="h-px flex-1 bg-slate-500/45" />
                <span className="text-slate-400">Or</span>
                <div className="h-px flex-1 bg-slate-500/45" />
            </div>

            <div className="editor-subtle-panel flex flex-col gap-3">
                <Input type="file" accept="json" onChange={importData} noPadding={true} isStretch={true} isDisabled={isImporting} />
                {dataStatus === null && (
                    <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
                        <InformationCircleIcon className="size-5 shrink-0" />
                        <span>Import is limited to JSON files that were previously downloaded from this server. Other JSON files are not supported.</span>
                    </div>
                )}

                {dataStatus === true && (
                    <Alert text="Data import completed without issues" icon={<CheckCircleIcon className="size-6 shrink-0" />} variant="success" isSoft={true} />
                )}

                {dataStatus === false && (
                    <Alert text="The selected file does not match the required format" icon={<XCircleIcon className="size-6 shrink-0" />} variant="error" isSoft={true} />
                )}
            </div>
        </EditorSection>
    )
}

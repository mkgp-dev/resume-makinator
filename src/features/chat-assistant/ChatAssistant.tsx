import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react"
import ReactMarkdown from "react-markdown"
import { useShallow } from "zustand/react/shallow"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import type { AiAssistantMode, AiModel, AiPlanTarget } from "@/features/chat-assistant/types"
import { getChatSectionLabel, toChatDisplayText } from "@/features/chat-assistant/lib/fieldLabels"
import { formatDraftPreview } from "@/features/chat-assistant/lib/formatDraftPreview"
import { resolveTargetItemLabel } from "@/features/chat-assistant/lib/resolveTargetItemLabel"
import { useChatAssistant } from "@/features/chat-assistant/hooks/useChatAssistant"
import Alert from "@/shared/ui/Alert"
import Button from "@/shared/ui/Button"
import Modal from "@/shared/ui/Modal"

const MODE_OPTIONS = [
  {
    label: "Chat",
    value: "chat",
    description: "Broad resume help, feedback, and brainstorming.",
  },
  {
    label: "Plan",
    value: "plan",
    description: "Focused section edits with a local review step.",
  },
] satisfies Array<{ label: string; value: AiAssistantMode; description: string }>

const MODEL_OPTIONS = [
  {
    label: "Gemini 2.5 Flash Lite",
    value: "gemini",
    description: "Fast, balanced help for everyday resume edits.",
  },
  {
    label: "Nova Micro",
    value: "nova",
    description: "Lean, quick responses for shorter drafting passes.",
  },
  {
    label: "Mistral Small 3.2",
    value: "mistral",
    description: "A thoughtful middle ground for rewrites and reviews.",
  },
  {
    label: "GPT-5.4 Nano",
    value: "openai",
    description: "Compact reasoning for concise polish and feedback.",
  },
] satisfies Array<{ label: string; value: AiModel; description: string }>

const PLAN_SECTION_OPTIONS = [
  { label: "Summary", value: "summary" },
  { label: "Languages", value: "languages" },
  { label: "Core skills", value: "coreSkills" },
  { label: "Soft skills", value: "softSkills" },
  { label: "Work experience", value: "workExperiences" },
  { label: "Personal projects", value: "personalProjects" },
  { label: "Education", value: "education" },
  { label: "Certificates", value: "certificates" },
  { label: "Achievements", value: "achievements" },
  { label: "References", value: "references" },
] satisfies Array<{ label: string; value: AiPlanTarget["section"] }>

type MenuKey = "section" | "settings" | null

function getOptionLabel<TValue extends string>(
  options: Array<{ label: string; value: TValue }>,
  value: TValue | undefined,
  fallback: string,
) {
  return options.find((option) => option.value === value)?.label ?? fallback
}

function ToolbarTrigger({
  label,
  value,
  onClick,
  isDisabled = false,
  isOpen = false,
}: {
  label: string
  value: string
  onClick: () => void
  isDisabled?: boolean
  isOpen?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      disabled={isDisabled}
      onClick={onClick}
      className={clsx(
        "group flex min-h-11 w-full items-center justify-between gap-3 rounded-[0.95rem] border px-4 py-2.5 text-left transition-all duration-150",
        "border-slate-400/14 bg-slate-950/28 text-slate-100 shadow-[0_14px_30px_rgba(2,6,23,0.14)] hover:border-sky-200/24 hover:bg-slate-950/34",
        isOpen && "border-sky-200/30 bg-slate-950/38",
        isDisabled && "cursor-not-allowed opacity-55 hover:border-slate-400/14 hover:bg-slate-950/28",
      )}
    >
      <span className="min-w-0 truncate font-manrope text-sm font-semibold text-slate-50">{value}</span>
      <ChevronUpDownIcon className="size-4 shrink-0 text-slate-400 transition-colors duration-150 group-hover:text-sky-100" />
    </button>
  )
}

function ModeSegmentedControl({
  value,
  onChange,
  isDisabled = false,
}: {
  value: AiAssistantMode
  onChange: (value: AiAssistantMode) => void
  isDisabled?: boolean
}) {
  return (
    <div
      role="group"
      aria-label="Mode"
      className={clsx(
        "flex h-11 w-[11.5rem] shrink-0 rounded-[0.95rem] border border-slate-400/14 bg-slate-950/28 p-1 shadow-[0_14px_30px_rgba(2,6,23,0.14)]",
        isDisabled && "opacity-55",
      )}
    >
      {MODE_OPTIONS.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={isSelected}
            disabled={isDisabled}
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex-1 rounded-[0.72rem] px-3 text-sm font-manrope font-semibold transition-all duration-150",
              isSelected
                ? "bg-slate-800/96 text-slate-50 shadow-[0_10px_24px_rgba(2,6,23,0.22)]"
                : "text-slate-400 hover:text-slate-100",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function SelectionMenu<TValue extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  placement = "bottom",
  className,
}: {
  label: string
  options: Array<{ label: string; value: TValue; description?: string }>
  selectedValue?: TValue
  onSelect: (value: TValue) => void
  placement?: "top" | "bottom"
  className?: string
}) {
  return (
    <div
      role="menu"
      aria-label={`${label} options`}
      className={clsx(
        "absolute left-0 z-20 w-full rounded-[1rem] border border-slate-400/16 bg-slate-950/96 p-2 shadow-[0_30px_80px_rgba(2,6,23,0.5)] backdrop-blur-2xl",
        placement === "top"
          ? "bottom-[calc(100%+0.55rem)]"
          : "top-[calc(100%+0.55rem)]",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={clsx(
              "flex w-full items-start justify-between gap-3 rounded-[0.85rem] px-3 py-3 text-left transition-colors duration-150",
              isSelected
                ? "bg-slate-800/92 text-slate-50"
                : "text-slate-200 hover:bg-slate-800/72",
            )}
          >
            <span className="min-w-0">
              <span className="block font-manrope text-sm font-semibold text-inherit">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs leading-5 text-slate-400">{option.description}</span>
              ) : null}
            </span>
            <CheckIcon className={clsx("mt-0.5 size-4 shrink-0", isSelected ? "text-sky-200" : "opacity-0")} />
          </button>
        )
      })}
    </div>
  )
}

function AssistantMarkdown({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="ml-5 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-slate-50">{children}</strong>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-sky-200 underline underline-offset-4"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-950/45 px-1.5 py-0.5 text-[0.95em] text-sky-100">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function ClearConversationModal({
  dialogRef,
  onConfirm,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>
  onConfirm: () => void
}) {
  return (
    <Modal
      ref={dialogRef}
      size="sm"
      content={(
        <div className="space-y-3">
          <h3 className="font-manrope text-xl font-semibold text-slate-50">Clear conversation?</h3>
          <p className="text-sm leading-6 text-slate-300">
            This will remove the saved chat history from this browser. Your resume data will stay as it is.
          </p>
        </div>
      )}
      actions={(
        <>
          <Button
            variant="surface"
            text="Cancel"
            onClick={() => dialogRef.current?.close()}
          />
          <Button
            variant="danger"
            text="Clear chat"
            onClick={onConfirm}
          />
        </>
      )}
      allowOutsideClick={true}
    />
  )
}

function ChatAssistantInfoModal({
  dialogRef,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>
}) {
  return (
    <Modal
      ref={dialogRef}
      size="md"
      content={(
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/82">
              <ChatBubbleLeftRightIcon className="size-4" />
              <span>Chat Assistant</span>
            </div>
            <h3 className="mt-2 font-manrope text-xl font-semibold text-slate-50">
              About your Assistant
            </h3>
          </div>

          <div className="space-y-4 text-sm leading-6 text-slate-300">
            <section className="rounded-[0.7rem] border border-slate-500/18 bg-slate-950/22 p-4">
              <h4 className="font-manrope text-sm font-semibold text-slate-100">Early stage</h4>
              <p className="mt-1">
                The Chat Assistant is still improving. It may respond slowly, ask follow-up questions, or occasionally get things wrong.
              </p>
              <p className="mt-3">
                For better results, be specific about what you want to add, change, review, or remove from your resume. If something feels off, you can send a report to help improve it.
              </p>
            </section>

            <section className="rounded-[0.7rem] border border-slate-500/18 bg-slate-950/22 p-4">
              <h4 className="font-manrope text-sm font-semibold text-slate-100">Usage</h4>
              <p className="mt-1">
                This assistant helps with resume writing and editing through AI models.
              </p>
              <p className="mt-3">
                You can add your own Pollinations key in configuration to keep using the assistant if the shared app allowance runs out.
              </p>
            </section>

            <section className="rounded-[0.7rem] border border-amber-300/18 bg-amber-400/8 p-4">
              <h4 className="font-manrope text-sm font-semibold text-slate-100">Best results</h4>
              <p className="mt-1">
                Use Chat mode for general resume help. Use Plan mode when you want to work on one section at a time and review changes before applying them.
              </p>
            </section>
          </div>
        </div>
      )}
      actions={(
        <>
          <Button
            variant="surface"
            text="Report a bug"
            onClick={() => window.open("https://github.com/mkgp-dev/resume-makinator/issues/new?template=bug_report.md", "_blank", "noopener,noreferrer")}
          />
          <Button
            variant="surface"
            text="Close"
            onClick={() => dialogRef.current?.close()}
          />
        </>
      )}
      allowOutsideClick={true}
    />
  )
}

function DraftMeta({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="rounded-[0.75rem] border border-slate-400/10 bg-slate-950/24 px-3 py-3 text-sm leading-6 text-slate-300">
      {children}
    </div>
  )
}

export default function ChatAssistant() {
  const resumeData = useResumeStore(useShallow((state) => ({
    personalProjects: state.personalProjects,
    workExperiences: state.workExperiences,
    education: state.education,
    certificates: state.certificates,
    achievements: state.achievements,
    references: state.references,
    coreSkills: state.coreSkills,
  })))
  const {
    hasHydrated,
    messages,
    notices,
    activeDraft,
    selectedModel,
    selectedMode,
    selectedPlanSection,
    pending,
    sendMessage,
    acceptDraft,
    rejectDraft,
    clearConversation,
    setSelectedModel,
    setSelectedMode,
    setSelectedPlanSection,
  } = useChatAssistant()
  const [isOpen, setIsOpen] = useState(false)
  const [isAcceptingDraft, setIsAcceptingDraft] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuKey>(null)
  const [pendingRequestStartedWithDraft, setPendingRequestStartedWithDraft] = useState(false)
  const [message, setMessage] = useState("")
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const clearDialogRef = useRef<HTMLDialogElement | null>(null)
  const infoDialogRef = useRef<HTMLDialogElement | null>(null)
  const feedRef = useRef<HTMLDivElement | null>(null)
  const textareaId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (openMenu) {
        setOpenMenu(null)
        return
      }
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, openMenu])

  useEffect(() => {
    if (!isOpen || !openMenu) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest("[data-chat-menu-root='true']")) return
      setOpenMenu(null)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [isOpen, openMenu])

  useEffect(() => {
    const element = feedRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
  }, [messages, notices, activeDraft, pending, isOpen])

  useEffect(() => {
    if (pending) return
    setPendingRequestStartedWithDraft(false)
  }, [pending])

  useEffect(() => {
    if (!pending) return
    setOpenMenu(null)
  }, [pending])

  if (!hasHydrated) return null

  const closePanel = () => {
    setIsOpen(false)
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  const handleSubmit = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || pending) return

    setPendingRequestStartedWithDraft(Boolean(activeDraft))
    const wasSent = await sendMessage(message)
    if (wasSent) {
      setMessage("")
      return
    }

    setPendingRequestStartedWithDraft(false)
  }

  const handleClearConversation = () => {
    clearConversation()
    clearDialogRef.current?.close()
  }

  const handleAcceptDraft = async () => {
    if (isAcceptingDraft || !activeDraft) return

    setIsAcceptingDraft(true)

    try {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })
      await acceptDraft()
    } finally {
      setIsAcceptingDraft(false)
    }
  }

  const draftPreview = activeDraft
    ? formatDraftPreview(activeDraft)
    : null
  const draftItemLabel = activeDraft
    ? resolveTargetItemLabel(activeDraft.target, resumeData)
    : null
  const composerPlaceholder = selectedMode === "plan"
    ? selectedPlanSection
      ? `Describe what to change in ${getChatSectionLabel(selectedPlanSection).toLowerCase()}.`
      : "Select a section, then describe the change you want."
    : "Ask for resume feedback, ideas, or writing help."
  const activeSectionLabel = getOptionLabel(PLAN_SECTION_OPTIONS, selectedPlanSection, "Choose a section")
  const activeModelLabel = getOptionLabel(MODEL_OPTIONS, selectedModel, "Gemini 2.5 Flash Lite")
  const isThinkingWithoutDraft = pending && !pendingRequestStartedWithDraft && !activeDraft
  const isUpdatingDraftResponse = pending && pendingRequestStartedWithDraft && Boolean(activeDraft) && !isAcceptingDraft
  const isApplyingDraft = isAcceptingDraft

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid="chat-assistant-trigger"
        aria-label="Open Chat Assistant"
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed top-1/2 z-40 -translate-y-1/2 transition-opacity duration-200",
          "right-3 flex items-center gap-2 rounded-[0.8rem] border border-slate-400/18 px-3 py-2.5 text-xs font-manrope font-semibold uppercase tracking-[0.18em] text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.3)] hover:border-sky-200/36 lg:right-[-2.85rem] lg:-rotate-90 lg:gap-2.5 lg:rounded-t-[0.9rem] lg:border lg:border-slate-400/20 lg:bg-slate-900/88 lg:px-4 lg:py-3 lg:text-sm lg:tracking-[0.08em] lg:backdrop-blur-xl",
          "editor-glass-surface lg:border-slate-400/20 lg:bg-slate-900/88",
          isOpen && "pointer-events-none opacity-0",
        )}
      >
        <ChatBubbleLeftRightIcon className="size-4 text-sky-200 lg:rotate-90" />
        <span className="lg:hidden">Chat</span>
        <span className="hidden lg:block lg:rotate-180">Chat Assistant</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close Chat Assistant"
            className="absolute inset-0 bg-slate-950/38 backdrop-blur-[2px]"
            onClick={closePanel}
          />

          <aside
            data-testid="chat-assistant-panel"
            className="editor-chat-panel editor-glass-surface absolute inset-0 flex flex-col overflow-hidden border-0 sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[min(36rem,calc(100vw-2rem))] sm:rounded-[1rem] sm:border"
          >
            <div className="border-b border-slate-400/14 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-sky-200/82">
                    <ChatBubbleLeftRightIcon className="size-3.5 shrink-0" />
                    <span>Chat Assistant</span>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <a
                      href="https://pollinations.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors duration-150 hover:text-sky-200"
                    >
                      Powered with Pollinations.ai
                    </a>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="About your Assistant"
                    className="flex size-10 items-center justify-center rounded-[0.55rem] border border-slate-400/14 bg-base-200/40 text-slate-300 transition-colors duration-150 hover:border-sky-200/30 hover:bg-sky-400/10 hover:text-sky-100"
                    onClick={() => infoDialogRef.current?.showModal()}
                  >
                    <InformationCircleIcon className="size-5" />
                  </button>

                  <div className="relative" data-chat-menu-root="true">
                    <button
                      type="button"
                      aria-label="Chat settings"
                      aria-haspopup="menu"
                      aria-expanded={openMenu === "settings"}
                      disabled={pending}
                      className="flex size-10 items-center justify-center rounded-[0.55rem] border border-slate-400/14 bg-base-200/40 text-slate-300 transition-colors duration-150 hover:border-sky-200/30 hover:bg-sky-400/10 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-55"
                      onClick={() => setOpenMenu((current) => current === "settings" ? null : "settings")}
                    >
                      <Cog6ToothIcon className="size-5" />
                    </button>

                    {openMenu === "settings" ? (
                      <div
                        data-testid="chat-settings-menu"
                        role="menu"
                        aria-label="Chat settings options"
                        className="absolute right-0 top-[calc(100%+0.55rem)] z-20 w-[min(22rem,calc(100vw-3rem))] rounded-[1rem] border border-slate-400/16 bg-slate-950/96 p-2 shadow-[0_30px_80px_rgba(2,6,23,0.5)] backdrop-blur-2xl"
                      >
                        <div className="px-3 pb-2 pt-1">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Model</p>
                          <p className="mt-1 font-manrope text-sm font-semibold text-slate-50">{activeModelLabel}</p>
                        </div>

                        <div className="space-y-1">
                          {MODEL_OPTIONS.map((option) => {
                            const isSelected = option.value === selectedModel

                            return (
                              <button
                                key={option.value}
                                type="button"
                                aria-label={option.label}
                                aria-pressed={isSelected}
                                onClick={() => {
                                  setSelectedModel(option.value)
                                  setOpenMenu(null)
                                }}
                                className={clsx(
                                  "flex w-full items-start justify-between gap-3 rounded-[0.85rem] px-3 py-3 text-left transition-colors duration-150",
                                  isSelected
                                    ? "bg-slate-800/92 text-slate-50"
                                    : "text-slate-200 hover:bg-slate-800/72",
                                )}
                              >
                                <span className="min-w-0">
                                  <span className="block font-manrope text-sm font-semibold text-inherit">{option.label}</span>
                                  <span className="mt-0.5 block text-xs leading-5 text-slate-400">{option.description}</span>
                                </span>
                                <CheckIcon className={clsx("mt-0.5 size-4 shrink-0", isSelected ? "text-sky-200" : "opacity-0")} />
                              </button>
                            )
                          })}
                        </div>

                        <div className="my-2 border-t border-slate-400/10" />

                        <button
                          type="button"
                          aria-label="Delete conversation"
                          onClick={() => {
                            setOpenMenu(null)
                            clearDialogRef.current?.showModal()
                          }}
                          className="flex w-full items-center gap-3 rounded-[0.85rem] px-3 py-3 text-left text-rose-200 transition-colors duration-150 hover:bg-rose-400/10 hover:text-rose-100"
                        >
                          <TrashIcon className="size-4 shrink-0" />
                          <span className="font-manrope text-sm font-semibold">Delete conversation</span>
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    aria-label="Close Chat Assistant"
                    className="flex size-10 items-center justify-center rounded-[0.55rem] border border-slate-400/14 bg-base-200/40 text-slate-300 transition-colors duration-150 hover:border-slate-300/24 hover:bg-base-200/65 hover:text-slate-50"
                    onClick={closePanel}
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={feedRef}
              className="primary-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
            >
              {!messages.length ? (
                <div className="flex min-h-full items-center justify-center">
                  <div className="max-w-sm rounded-[0.9rem] border border-slate-400/12 bg-slate-950/28 px-5 py-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/10 text-sky-200">
                      <ChatBubbleLeftRightIcon className="size-6" />
                    </div>
                    <p className="mt-4 font-manrope text-base font-semibold text-slate-50">
                      Ask about your resume
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Use Chat mode for broad guidance or switch to Plan mode when you want a focused section edit with a review step.
                    </p>
                  </div>
                </div>
              ) : null}

              {messages.map((entry) => (
                <div
                  key={entry.id}
                  className={clsx(
                    "chat chat-assistant-message",
                    entry.role === "user"
                      ? "chat-end chat-assistant-message--user"
                      : "chat-start chat-assistant-message--assistant",
                  )}
                >
                  <div
                    data-testid="chat-message-bubble"
                    className={clsx(
                      "chat-bubble chat-assistant-bubble rounded-[0.85rem] border text-sm leading-6 shadow-none",
                      entry.role === "user"
                        ? "chat-assistant-bubble--user border-primary/40 bg-primary/92 text-primary-content"
                        : "chat-assistant-bubble--assistant border-slate-400/16 bg-base-200/68 text-slate-100",
                    )}
                  >
                    {entry.role === "assistant" ? (
                      <AssistantMarkdown content={entry.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {notices.map((notice) => (
                <div
                  key={notice.id}
                  data-testid={notice.variant === "error" ? "chat-inline-error" : undefined}
                >
                  <Alert
                    text={toChatDisplayText(notice.text)}
                    variant={notice.variant}
                    isSoft={true}
                  />
                </div>
              ))}

              {isThinkingWithoutDraft ? (
                <div
                  data-testid="chat-response-loading"
                  className="rounded-[0.8rem] border border-slate-400/12 bg-slate-950/30 px-4 py-3 text-sm text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="loading loading-dots loading-sm text-sky-200" />
                    <span>Hang tight while we prepare a response</span>
                  </div>
                </div>
              ) : null}

              {activeDraft ? (
                <div
                  data-testid="chat-draft-review"
                  className="animate-chat-card-in rounded-[0.9rem] border border-sky-300/16 bg-sky-400/8 px-4 py-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] text-sky-200/78">
                    Review draft
                  </div>
                  <p className="mt-2 font-manrope text-base font-semibold text-slate-50">
                    {activeDraft.title}
                  </p>

                  <nav
                    aria-label="Draft target"
                    data-testid="chat-draft-breadcrumbs"
                    className="breadcrumbs mt-3 max-w-full overflow-hidden py-0 text-[11px] uppercase tracking-[0.16em] text-slate-400"
                  >
                    <ul className="min-h-0">
                      <li>
                        <span>{getChatSectionLabel(activeDraft.target.section)}</span>
                      </li>
                      {draftItemLabel ? (
                        <li>
                          <span>{draftItemLabel}</span>
                        </li>
                      ) : null}
                    </ul>
                  </nav>

                  <DraftMeta>
                    <AssistantMarkdown content={activeDraft.previewText} className="text-slate-300" />
                  </DraftMeta>

                  {draftPreview?.entries.length ? (
                    <div className="mt-3 space-y-2">
                      {draftPreview.entries.map((entry, index) => (
                        <DraftMeta key={`${entry.label}-${index}`}>
                          <p className="font-medium text-slate-100">{entry.label}</p>
                          <p className="mt-1 text-slate-300">{entry.detail}</p>
                        </DraftMeta>
                      ))}
                    </div>
                  ) : null}

                  {activeDraft.assumptions?.length ? (
                    <div className="mt-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Assumptions</p>
                      <DraftMeta>
                        <ul className="ml-5 list-disc space-y-1">
                          {activeDraft.assumptions.map((assumption) => (
                            <li key={assumption}>{assumption}</li>
                          ))}
                        </ul>
                      </DraftMeta>
                    </div>
                  ) : null}

                  {activeDraft.questions?.length ? (
                    <div className="mt-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Questions</p>
                      <DraftMeta>
                        <ul className="ml-5 list-disc space-y-1">
                          {activeDraft.questions.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      </DraftMeta>
                    </div>
                  ) : null}

                  {isUpdatingDraftResponse ? (
                    <div
                      data-testid="chat-draft-response-loading"
                      className="mt-4 rounded-[0.75rem] border border-sky-300/12 bg-slate-950/30 px-3 py-3 text-sm text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="loading loading-dots loading-sm text-sky-200" />
                        <span>Updating the review...</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      text={isApplyingDraft ? "Applying..." : "Accept"}
                      onClick={() => void handleAcceptDraft()}
                      isDisabled={pending || isApplyingDraft}
                    />
                    <Button
                      variant="surface"
                      text="Reject"
                      onClick={rejectDraft}
                      isDisabled={pending || isApplyingDraft}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-400/14 bg-slate-950/14 px-4 py-4 sm:px-5">
              <div className="rounded-[1.05rem] border border-slate-400/14 bg-slate-950/36 p-3 shadow-[0_20px_50px_rgba(2,6,23,0.22)]">
                <textarea
                  id={textareaId}
                  aria-label="Message"
                  rows={4}
                  value={message}
                  disabled={pending}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || event.shiftKey) return
                    event.preventDefault()
                    void handleSubmit()
                  }}
                  placeholder={composerPlaceholder}
                  className="min-h-28 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:text-slate-500"
                />

                <div className="mt-3 border-t border-slate-400/10 pt-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center justify-end gap-2">
                      {selectedMode === "plan" ? (
                        <div className="relative w-[10.5rem] shrink-0" data-chat-menu-root="true">
                          <ToolbarTrigger
                            label="Plan Section"
                            value={activeSectionLabel}
                            isDisabled={pending}
                            isOpen={openMenu === "section"}
                            onClick={() => setOpenMenu((current) => current === "section" ? null : "section")}
                          />

                          {openMenu === "section" ? (
                            <SelectionMenu
                              label="Plan Section"
                              options={PLAN_SECTION_OPTIONS}
                              selectedValue={selectedPlanSection}
                              placement="top"
                              className="right-0 left-auto"
                              onSelect={(value) => {
                                setSelectedPlanSection(value)
                                setOpenMenu(null)
                              }}
                            />
                          ) : null}
                        </div>
                      ) : null}

                      <ModeSegmentedControl
                        value={selectedMode}
                        isDisabled={pending}
                        onChange={(value) => setSelectedMode(value)}
                      />
                    </div>

                    <button
                      type="button"
                      aria-label="Send message"
                      onClick={() => void handleSubmit()}
                      disabled={pending || !message.trim()}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-sky-200/22 bg-sky-300 text-slate-950 shadow-[0_12px_28px_rgba(125,211,252,0.28)] transition-all duration-150 hover:-translate-y-px hover:bg-sky-200 disabled:cursor-not-allowed disabled:border-slate-500/14 disabled:bg-slate-900/35 disabled:text-slate-500 disabled:shadow-none"
                    >
                      <PaperAirplaneIcon className="size-4" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <ClearConversationModal
        dialogRef={clearDialogRef}
        onConfirm={handleClearConversation}
      />

      <ChatAssistantInfoModal dialogRef={infoDialogRef} />
    </>
  )
}

import {
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useEffect, useId, useRef, useState, type RefObject } from "react"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { toChatDisplayText } from "@/features/chat-assistant/lib/fieldLabels"
import { formatDraftPreview } from "@/features/chat-assistant/lib/formatDraftPreview"
import { resolveTargetItemLabel } from "@/features/chat-assistant/lib/resolveTargetItemLabel"
import { useShallow } from "zustand/react/shallow"
import Alert from "@/shared/ui/Alert"
import Button from "@/shared/ui/Button"
import Modal from "@/shared/ui/Modal"
import { useChatAssistant } from "@/features/chat-assistant/hooks/useChatAssistant"
import type { AiDraftChange } from "@/features/chat-assistant/types"

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
                The Chat Assistant is still in an early stage, so responses may be slow, it may ask for clarification from time to time, and it may not always be accurate. Clear intent matters here: broad or vague requests can lead to random or less useful output, while specific goals help the assistant stay on target. If you want to help improve this feature,
                {" "}
                <a
                  href="https://github.com/mkgp-dev/resume-makinator/issues/new?template=bug_report.md"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-sky-200 underline-offset-4 transition-colors duration-150 hover:text-sky-100 hover:underline"
                >
                  send a report
                </a>
                .
              </p>
            </section>

            <section className="rounded-[0.7rem] border border-slate-500/18 bg-slate-950/22 p-4">
              <h4 className="font-manrope text-sm font-semibold text-slate-100">Powered by Pollinations AI</h4>
              <p className="mt-1">
                The assistant is proudly powered by Pollinations AI. You can add your own Pollinations key in the app configuration, which helps you continue using the assistant if the shared server allowance is depleted. As the developer, I am deeply grateful to Pollinations because it helped me learn how model configuration works and better understand what these models can and cannot do.
              </p>
            </section>

            <section className="rounded-[0.7rem] border border-amber-300/18 bg-amber-400/8 p-4">
              <h4 className="font-manrope text-sm font-semibold text-slate-100">Best results</h4>
              <p className="mt-1">
                For the best output, tackle one section at a time instead of asking it to handle everything at once. The assistant may struggle to respond well when a request covers too much, so focused section-by-section edits are the safest path for now. This limit will be improved further in the future.
              </p>
            </section>
          </div>
        </div>
      )}
      actions={(
        <Button
          variant="surface"
          text="Close"
          onClick={() => dialogRef.current?.close()}
        />
      )}
      allowOutsideClick={true}
    />
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
    entries,
    activeDraft,
    activeClarification,
    pending,
    sendMessage,
    acceptDraft,
    rejectDraft,
    clearConversation,
  } = useChatAssistant()
  const [isOpen, setIsOpen] = useState(false)
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
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    const element = feedRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
  }, [entries, activeDraft, pending, isOpen])

  if (!hasHydrated) return null

  const closePanel = () => {
    setIsOpen(false)
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  const openPanel = () => setIsOpen(true)

  const handleSubmit = async () => {
    const wasSent = await sendMessage(message)
    if (wasSent) setMessage("")
  }

  const handleClearConversation = () => {
    clearConversation()
    clearDialogRef.current?.close()
  }

  const composerPlaceholder = activeClarification
    ? "Answer the assistant's question to continue."
    : "Please be gentle to your assistant."
  const draftItemLabel = activeDraft
    ? resolveTargetItemLabel(activeDraft.target, resumeData)
    : null

  const resolveDraftChangeItemLabel = activeDraft
    ? (change: AiDraftChange) =>
        resolveTargetItemLabel(
          {
            section: change.section,
            itemId: change.itemId,
            field: change.field,
            scope: activeDraft.target.scope,
          },
          resumeData,
        )
    : undefined

  const draftPreview = activeDraft
    ? formatDraftPreview(
        activeDraft.draft,
        draftItemLabel,
        resolveDraftChangeItemLabel,
      )
    : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid="chat-assistant-trigger"
        aria-label="Open Chat Assistant"
        onClick={openPanel}
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
            className="editor-chat-panel editor-glass-surface absolute inset-0 flex flex-col overflow-hidden border-0 sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[min(28rem,calc(100vw-2rem))] sm:rounded-[1rem] sm:border"
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
              {!entries.length ? (
                <div className="flex min-h-full items-center justify-center">
                  <div className="max-w-sm rounded-[0.9rem] border border-slate-400/12 bg-slate-950/28 px-5 py-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/10 text-sky-200">
                      <ChatBubbleLeftRightIcon className="size-6" />
                    </div>
                    <p className="mt-4 font-manrope text-base font-semibold text-slate-50">
                      Ask about a specific part of your resume
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Ask to add, edit, or remove content in one specific section at a time.
                    </p>
                  </div>
                </div>
              ) : null}

              {entries.map((entry) => {
                if (entry.kind === "notice") {
                  return (
                    <div
                      key={entry.id}
                      data-testid={entry.variant === "error" ? "chat-inline-error" : undefined}
                    >
                      <Alert
                        text={toChatDisplayText(entry.text)}
                        variant={entry.variant}
                        isSoft={true}
                      />
                    </div>
                  )
                }

                return (
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
                        "chat-bubble chat-assistant-bubble whitespace-pre-wrap rounded-[0.85rem] border text-sm leading-6 shadow-none",
                        entry.role === "user"
                          ? "chat-assistant-bubble--user border-primary/40 bg-primary/92 text-primary-content"
                          : "chat-assistant-bubble--assistant border-slate-400/16 bg-base-200/68 text-slate-100",
                      )}
                    >
                      {entry.role === "assistant" ? toChatDisplayText(entry.text) : entry.text}
                    </div>
                  </div>
                )
              })}

              {pending && !activeDraft ? (
                <div className="rounded-[0.8rem] border border-slate-400/12 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="loading loading-dots loading-sm text-sky-200" />
                    <span>Hang tight while we prepare a response</span>
                  </div>
                </div>
              ) : null}

              {activeClarification ? (
                <div className="animate-chat-card-in rounded-[0.9rem] border border-amber-300/18 bg-amber-400/8 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200/82">
                    Need details before I can continue
                  </div>
                  <p className="mt-2 font-manrope text-base font-semibold text-slate-50">
                    {toChatDisplayText(activeClarification.question)}
                  </p>
                </div>
              ) : null}

              {activeDraft ? (
                <div
                  data-testid="chat-draft-review"
                  className="animate-chat-card-in rounded-[0.9rem] border border-sky-300/16 bg-sky-400/8 px-4 py-4"
                >
                  {pending ? (
                    <div
                      data-testid="chat-draft-loading"
                      className="flex min-h-44 flex-col items-center justify-center text-center"
                    >
                      <span className="loading loading-dots loading-md text-sky-200" />
                      <p className="mt-3 font-manrope text-sm font-semibold text-slate-100">
                        Updating draft
                      </p>
                      <p className="mt-1 max-w-xs text-sm leading-6 text-slate-400">
                        I’m updating the content, please wait.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-sky-200/78">
                        Review draft
                      </div>
                      <p className="mt-2 font-manrope text-base font-semibold text-slate-50">
                        {toChatDisplayText(activeDraft.draft.summary)}
                      </p>
                      {draftPreview?.entries.length ? (
                        <div className="mt-3 space-y-4 text-sm leading-6 text-slate-300">
                          {draftPreview.entries.map((entry, index) => (
                            <div
                              key={`draft-preview-${index}`}
                              className="space-y-2 border-t border-slate-400/10 pt-3 first:border-t-0 first:pt-0"
                            >
                              {entry.metadata ? (
                                <nav
                                  aria-label="Draft target"
                                  data-testid="chat-draft-breadcrumbs"
                                  className="breadcrumbs max-w-full overflow-hidden py-0 text-[11px] uppercase tracking-[0.16em] text-slate-400"
                                >
                                  <ul className="min-h-0">
                                    {entry.metadata.map((part, partIndex) => (
                                      <li key={`${part}-${partIndex}`}>
                                        <span>{part}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </nav>
                              ) : null}

                              {entry.kind === "text" ? (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                  {entry.text}
                                </p>
                              ) : null}

                              {entry.kind === "bullets" ? (
                                <ul className="space-y-2 text-sm leading-6 text-slate-300">
                                  {entry.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5">
                                      <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-sky-200/80" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}

                              {entry.kind === "coreSkills" ? (
                                <dl className="divide-y divide-slate-400/10 text-sm">
                                  <div className="grid gap-1 py-2.5 text-slate-300 first:pt-0 last:pb-0 sm:grid-cols-[minmax(8rem,0.45fr)_1fr] sm:gap-3">
                                    <dt className="font-medium text-slate-100">
                                      {entry.isNewGroup ? "New group" : "Group"}
                                    </dt>
                                    <dd className="text-slate-300">{entry.groupName}</dd>
                                  </div>
                                  <div className="grid gap-1 py-2.5 text-slate-300 first:pt-0 last:pb-0 sm:grid-cols-[minmax(8rem,0.45fr)_1fr] sm:gap-3">
                                    <dt className="font-medium text-slate-100">Skills</dt>
                                    <dd className="text-slate-300">{entry.skills.join(", ")}</dd>
                                  </div>
                                </dl>
                              ) : null}

                              {entry.kind === "fields" ? (
                                <dl className="divide-y divide-slate-400/10 text-sm">
                                  {entry.rows.map((row) => (
                                    <div
                                      key={`${row.label}-${row.value}`}
                                      className="grid gap-1 py-2.5 text-slate-300 first:pt-0 last:pb-0 sm:grid-cols-[minmax(8rem,0.45fr)_1fr] sm:gap-3"
                                    >
                                      <dt className="font-medium text-slate-100">{row.label}</dt>
                                      <dd className="text-slate-300">{row.value}</dd>
                                    </div>
                                  ))}
                                </dl>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          text="Accept"
                          onClick={() => void acceptDraft()}
                          isDisabled={pending}
                        />
                        <Button
                          variant="surface"
                          text="Reject"
                          onClick={rejectDraft}
                          isDisabled={pending}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-400/14 bg-slate-950/14 px-4 py-4 sm:px-5">
              <div className="space-y-3">
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
                  className="editor-control textarea min-h-28 w-full resize-none rounded-[0.75rem] border border-slate-400/14 bg-base-200/54 px-4 py-3 text-sm leading-6"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={() => void handleSubmit()}
                    disabled={pending || !message.trim()}
                    className="btn btn-sm border border-sky-300/24 bg-sky-400/14 font-manrope text-sm font-medium normal-case text-sky-100 shadow-none transition-colors duration-150 hover:border-sky-200/38 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:border-slate-500/14 disabled:bg-slate-900/30 disabled:text-slate-500"
                  >
                    <PaperAirplaneIcon className="size-4" />
                    <span>Send</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Clear conversation"
                    onClick={() => clearDialogRef.current?.showModal()}
                    className="btn btn-sm border border-slate-500/24 bg-base-200/32 font-manrope text-sm font-medium normal-case text-slate-300 shadow-none transition-colors duration-150 hover:border-slate-300/30 hover:bg-base-200/52 hover:text-slate-100"
                  >
                    <TrashIcon className="size-4" />
                    <span>Clear conversation</span>
                  </button>
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

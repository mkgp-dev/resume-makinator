import { usePageHook } from "@/features/editor/hooks/usePage"
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Tab from "@/widgets/layout/Tab"
import Default from "@/widgets/layout/Default"
import Navigation from "@/widgets/layout/Navigation"
import Card from "@/shared/ui/Card"
import Toast from "@/shared/ui/Toast"
import PrivacyModal from "@/widgets/modals/Privacy"
import Footer from "@/widgets/layout/Footer"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { getDocumentTitle } from "@/app/seo"

const Preview = lazy(() => import("@/features/viewer/Preview"))

export default function App() {
  const { page, hasHydrated } = usePageHook()
  const hydrateNotice = useInterfaceStore(state => state.hydrateNotice)
  const setHydrateNotice = useInterfaceStore(state => state.setHydrateNotice)
  const editorScrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollFadeState, setScrollFadeState] = useState({ top: false, bottom: false })
  const scrollMaskClass = scrollFadeState.top && scrollFadeState.bottom
    ? "editor-scroll-mask-both"
    : scrollFadeState.top
      ? "editor-scroll-mask-top"
      : scrollFadeState.bottom
        ? "editor-scroll-mask-bottom"
        : ""

  const syncEditorScrollFade = useCallback(() => {
    const element = editorScrollRef.current
    if (!element) return

    const hasOverflow = element.scrollHeight > element.clientHeight + 2

    setScrollFadeState({
      top: hasOverflow && element.scrollTop > 2,
      bottom: hasOverflow && element.scrollTop + element.clientHeight < element.scrollHeight - 2,
    })
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    document.title = getDocumentTitle(page)
  }, [hasHydrated, page])

  useEffect(() => {
    const element = editorScrollRef.current
    if (!element) return

    let animationFrameId = 0
    const requestFadeSync = () => {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(() => {
        syncEditorScrollFade()
      })
    }

    requestFadeSync()

    const handleResize = () => requestFadeSync()
    const resizeObserver = new ResizeObserver(() => requestFadeSync())
    const mutationObserver = new MutationObserver(() => requestFadeSync())
    const contentElement = element.firstElementChild

    resizeObserver.observe(element)
    if (contentElement instanceof HTMLElement) {
      resizeObserver.observe(contentElement)
    }
    mutationObserver.observe(element, { childList: true, subtree: true })
    window.addEventListener("resize", handleResize)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [page, syncEditorScrollFade])

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!page) return (<Default />)

  return (
    <div className="editor-app-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col px-4 pb-5 pt-4 sm:px-6 lg:h-screen lg:gap-4 lg:pl-28 lg:pr-6 lg:pt-6 xl:pl-32">
        <PrivacyModal />
        <Toast
          items={
            hydrateNotice
              ? [
                  {
                    id: "hydrate-failsafe",
                    text: hydrateNotice,
                    icon: <ExclamationTriangleIcon className="size-6 shrink-0" />,
                    variant: "warning",
                    onClose: () => setHydrateNotice(null),
                  },
                ]
              : []
          }
          placement="top-end"
        />
        <Navigation active={page} />
        <main className="flex flex-1 flex-col gap-5 lg:min-h-0 lg:flex-row lg:gap-6">
          <section className="editor-panel-surface relative overflow-hidden rounded-[0.65rem] px-4 py-4 sm:px-5 lg:min-h-0 lg:w-[min(44vw,37rem)] lg:flex-none lg:px-6 lg:py-5">
            <div className="relative lg:h-full">
              <div
                className={`editor-scroll-fade editor-scroll-fade-top hidden lg:block ${scrollFadeState.top ? "opacity-100" : "opacity-0"}`}
              />
              <div
                className={`editor-scroll-fade editor-scroll-fade-bottom hidden lg:block ${scrollFadeState.bottom ? "opacity-100" : "opacity-0"}`}
              />
              <div
                ref={editorScrollRef}
                onScroll={syncEditorScrollFade}
                className={`primary-scroll overflow-visible lg:h-full lg:overflow-x-hidden lg:overflow-y-auto lg:pb-6 lg:pr-2 ${scrollMaskClass}`}
              >
                <Tab active={page} />
              </div>
            </div>
          </section>

          <section
            data-testid="editor-preview-panel"
            className="min-h-[24rem] flex-1 lg:min-h-0"
          >
            <Card noPadding={true} isPreview={true}>
              <Suspense
                fallback={
                  <div className="flex h-full min-h-[24rem] items-center justify-center text-sm text-slate-500">
                    L<span className="loading loading-spinner loading-lg text-primary" />
                  </div>
                }
              >
                <Preview />
              </Suspense>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}

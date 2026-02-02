import { usePageHook } from "@/features/editor/hooks/usePage"
import { Suspense, lazy, useEffect, useState } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Tab from "@/widgets/layout/Tab"
import Default from "@/widgets/layout/Default"
import Navigation from "@/widgets/layout/Navigation"
import Card from "@/shared/ui/Card"
import Toast from "@/shared/ui/Toast"
import PrivacyModal from "@/widgets/modals/Privacy"
import Footer from "@/widgets/layout/Footer"
import localforage from "@/shared/lib/localForage"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"

const Preview = lazy(() => import("@/features/viewer/Preview"))

export default function App() {
  const { page, hydrate } = usePageHook()
  const hydrateNotice = useInterfaceStore(state => state.hydrateNotice)
  const setHydrateNotice = useInterfaceStore(state => state.setHydrateNotice)
  const [storageStatus, setStorageStatus] = useState<"checking" | "empty" | "hasData">("checking")

  useEffect(() => {
    let isMounted = true
    localforage.getItem("resumeData")
      .then((value) => {
        if (!isMounted) return
        setStorageStatus(value ? "hasData" : "empty")
      })
      .catch(() => {
        if (!isMounted) return
        setStorageStatus("empty")
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (storageStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (storageStatus === "hasData" && !hydrate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!page) return (<Default />)

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden items-center justify-center">
      <div className="container flex flex-col h-screen p-4 md:p-0">
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
        <main className="mt-5 mb-5 grid grid-cols-1 md:grid-cols-[1.5fr_3.5fr] gap-4 flex-1 min-h-0">
          <div className="overflow-y-auto pr-2 primary-scroll">
            <Tab active={page} />
          </div>

          <Card noPadding={true} noRadius={true} isPreview={true}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  L<span className="loading loading-spinner loading-lg text-primary" />
                </div>
              }
            >
              <Preview />
            </Suspense>
          </Card>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

import { usePageHook } from "@/features/editor/hooks/usePage"
import { Suspense, lazy } from "react"
import Tab from "@/widgets/layout/Tab"
import Default from "@/widgets/layout/Default"
import Navigation from "@/widgets/layout/Navigation"
import Card from "@/shared/ui/Card"
import PrivacyModal from "@/widgets/modals/Privacy"
import Footer from "@/widgets/layout/Footer"

const Preview = lazy(() => import("@/features/viewer/Preview"))

export default function App() {
  const { page, hydrate } = usePageHook()

  if (!hydrate) return null

  if (!page) return (<Default />)

  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden items-center justify-center">
      <div className="container flex flex-col h-screen p-4 md:p-0">
        <PrivacyModal />
        <Navigation active={page} />
        <main className="mt-5 mb-5 grid grid-cols-1 md:grid-cols-[1.5fr_3.5fr] gap-4 flex-1 min-h-0">
          <div className="overflow-y-auto pr-2 primary-scroll">
            <Tab active={page} />
          </div>

          <Card noPadding={true} noRadius={true} isPreview={true}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading preview...
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

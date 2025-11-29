import { usePageStore } from "./hooks/usePageStore";
import Tab from "./components/layout/Tab";
import Default from "./components/layout/Default";
import Navigation from "./components/layout/Navigation";
import Preview from "./features/viewer/Preview";
import Card from "./components/ui/Card";
import PrivacyModal from "./components/modal/Privacy";
import Footer from "./components/layout/Footer";

export default function App() {
  const { page, hydrate } = usePageStore();

  if (!hydrate) return null;

  if (!page) return (<Default />);

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
            <Preview />
          </Card>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
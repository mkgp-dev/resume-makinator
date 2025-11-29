import {
    UserIcon,
    IdentificationIcon,
    AcademicCapIcon,
    WrenchScrewdriverIcon,
    BriefcaseIcon,
    CodeBracketIcon,
    DocumentTextIcon,
    StarIcon,
    UsersIcon,
    Cog8ToothIcon,
    ArchiveBoxIcon
} from "@heroicons/react/24/solid";
import { usePageStore } from "../../hooks/usePageStore";
import clsx from "clsx";

const tabs = [
    { id: "about", label: "About you", icon: <UserIcon className="size-4 shrink-0" /> },
    { id: "information", label: "Information", icon: <IdentificationIcon className="size-4 shrink-0" /> },
    { id: "education", label: "Education", icon: <AcademicCapIcon className="size-4 shrink-0" /> },
    { id: "skill", label: "Skill", icon: <WrenchScrewdriverIcon className="size-4 shrink-0" /> },
    { id: "work", label: "Work Experience", icon: <BriefcaseIcon className="size-4 shrink-0" /> },
    { id: "project", label: "Personal Project", icon: <CodeBracketIcon className="size-4 shrink-0" /> },
    { id: "certificate", label: "Certificate", icon: <DocumentTextIcon className="size-4 shrink-0" /> },
    { id: "achievement", label: "Achievement", icon: <StarIcon className="size-4 shrink-0" /> },
    { id: "reference", label: "Reference", icon: <UsersIcon className="size-4 shrink-0" /> },
    { id: "config", label: "Configuration", icon: <Cog8ToothIcon className="size-4 shrink-0" /> },
    { id: "data", label: "Data", icon: <ArchiveBoxIcon className="size-4 shrink-0" /> },
];

export default function Navigation({ active }) {
    const { update } = usePageStore();

    return (
        <nav className="flex items-center border-b border-slate-700 overflow-x-auto whitespace-nowrap no-scrollbar mt-5">
            {tabs.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => update(item.id)}
                    className={clsx(
                        "flex items-center gap-2 px-2 pb-2 text-xs md:text-sm shrink-0",
                        "border-b-2 text-slate-400 hover:text-slate-100 cursor-pointer",
                        active === item.id ? "border-sky-400 text-slate-100" : "border-transparent"
                    )}
                >
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="inline md:hidden">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
import About from "@/features/editor/tabs/About";
import Achievement from "@/features/editor/tabs/Achievement";
import Certificate from "@/features/editor/tabs/Certificate";
import Configuration from "@/features/editor/tabs/Configuration";
import Data from "@/features/editor/tabs/Data";
import Education from "@/features/editor/tabs/Education";
import Information from "@/features/editor/tabs/Information";
import Project from "@/features/editor/tabs/Project";
import Reference from "@/features/editor/tabs/Reference";
import Skill from "@/features/editor/tabs/Skill";
import Work from "@/features/editor/tabs/Work";

export default function Tab({ active }) {
    
    return (
        <div key={active} className="animate-fade-in">
            {active === "about" && <About />}
            {active === "information" && <Information />}
            {active === "education" && <Education />}
            {active === "skill" && <Skill />}
            {active === "work" && <Work />}
            {active === "project" && <Project />}
            {active === "certificate" && <Certificate />}
            {active === "achievement" && <Achievement />}
            {active === "reference" && <Reference />}
            {active === "config" && <Configuration />}
            {active === "data" && <Data />}
        </div>
    );
}
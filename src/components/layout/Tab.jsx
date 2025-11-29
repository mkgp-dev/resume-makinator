import About from "../tabs/About";
import Achievement from "../tabs/Achievement";
import Certificate from "../tabs/Certificate";
import Configuration from "../tabs/Configuration";
import Data from "../tabs/Data";
import Education from "../tabs/Education";
import Information from "../tabs/Information";
import Project from "../tabs/Project";
import Reference from "../tabs/Reference";
import Skill from "../tabs/Skill";
import Work from "../tabs/Work";

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
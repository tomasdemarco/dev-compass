import React, {useState} from "react";
import {Children} from "react";
import {ExpandIcon} from "@/components/generics/Icons"

const Accordion = ({title, children, openDefault}: {title: string, children: React.ReactNode, openDefault: boolean}) => {
    const [accordionOpen, setAccordionOpen] = useState(openDefault);

    return (
        <div className={`${accordionOpen && "my-2 bg-card rounded-lg border border-gray-70"}`}>
            <div
                className="flex justify-between text-xl rounded-lg hover:bg-gray/25 cursor-pointer py-2"
                onClick={() => setAccordionOpen(!accordionOpen)}
            >
                <div className={`pl-4 ${accordionOpen && "text-secondary-gp"}`}>
                    {title}
                </div>
                <div className={`${!accordionOpen ? "pr-5" : "pl-5 !rotate-180"}`}>
                    <ExpandIcon className="h-7 w-7"/>
                </div>
            </div>
            <div className={`my-2 mx-4 overflow-hidden transition-all duration-300 ease-in-out ${!accordionOpen && "h-0"}`}>
                {Children.map(children, child =>
                    <div>
                        {child}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accordion;
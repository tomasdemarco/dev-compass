import React, { useState } from "react";
import { Children } from "react";
import { ExpandIcon } from "@/components/generics/Icons"

interface AccordionMenuProps {
    title: string;
    children: React.ReactNode;
}

const AccordionMenu: React.FC<AccordionMenuProps> = ({ title, children }) => {
    const [accordionOpen, setAccordionOpen] = useState(false);

    return (
        <div className={`pl-1 py-2`}>
            <div
                className="flex justify-between text-xl rounded-lg hover:bg-gray/25 cursor-pointer py-2 ml-3 mr-3"
                onClick={() => setAccordionOpen(!accordionOpen)}
            >
                <div className="pl-6">
                    {title}
                </div>
                <div className={`${!accordionOpen ? "pr-6" : "pl-6 !rotate-180"}`}>
                    <ExpandIcon className="h-7 w-7" />
                </div>
            </div>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${!accordionOpen && "h-0"}`}
            >
                {Children.map(children, child =>
                    <div>
                        {child}
                    </div>)}
            </div>
        </div>
    );
};

export default AccordionMenu;
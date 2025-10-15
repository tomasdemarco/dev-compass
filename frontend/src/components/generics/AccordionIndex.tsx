import React, {useState} from "react";
import {Children} from "react";
import {ExpandIcon} from "@/components/generics/Icons"

interface AccordionIndexProps {
    title: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

const AccordionIndex: React.FC<AccordionIndexProps> = ({title, onClick, children}) => {
    const [accordionOpen, setAccordionOpen] = useState(false);

    return (
        <div className={` py-1`} onClick={React.Children.count(children) == 0 ? onClick: undefined}>
            <div
                className="flex justify-between text-md rounded-lg hover:bg-gray/25 cursor-pointer py-1"
                onClick={() => {React.Children.count(children) > 0 && setAccordionOpen(!accordionOpen)}}
            >
                <div className="pl-2">
                    {title}
                </div>
                {React.Children.count(children) > 0 &&
                    <div className={`${!accordionOpen ? "pr-2" : "pl-2 !rotate-180"}`}>
                        <ExpandIcon className="h-7 w-7"/>
                    </div>
                }
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!accordionOpen && "h-0"}`}>
                {Children.map(children, child =>
                    <div>
                        {child}
                    </div>)}
            </div>
        </div>
    );
};

export default AccordionIndex;
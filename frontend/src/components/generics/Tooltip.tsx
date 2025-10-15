import React from "react";

interface TooltipProps {
    children: React.ReactNode;
    tooltipsText: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, tooltipsText, position }) => {

    return (
        <div className="group relative inline-block cursor-pointer">
            {children}
            <div
                className={`absolute whitespace-nowrap rounded bg-gray px-4 py-[6px] text-xs opacity-0 group-hover:opacity-100
                    ${(position === "right" &&
                        `left-full top-1/2 ml-3 -translate-y-1/2`) ||
                    (position === "top" &&
                        `bottom-full left-1/2 z-20 mb-3 -translate-x-1/2`) ||
                    (position === "left" &&
                        `right-full top-1/2 z-20 mr-3 -translate-y-1/2`) ||
                    (position === "bottom" &&
                        `left-1/2 top-full z-20 mt-3 -translate-x-1/2`)
                    }`}
            >
                <span
                    className={`absolute h-2 w-2 rotate-45 bg-gray
                        ${(position === "right" &&
                            `left-[-3px] top-1/2 -translate-y-1/2`) ||
                        (position === "top" &&
                            `bottom-[-3px] left-1/2 -translate-x-1/2`) ||
                        (position === "left" &&
                            `right-[-3px] top-1/2 -translate-y-1/2`) ||
                        (position === "bottom" &&
                            `left-1/2 top-[-3px] -translate-x-1/2`)
                        } `}
                />
                {tooltipsText}
            </div>
        </div>
    );
};

export default Tooltip;

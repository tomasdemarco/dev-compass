import React, {useState} from 'react';
import {CasesIcon, CodeIcon} from "@/components/generics/Icons";

type ViewMode = 'table' | 'code';

interface ViewSwitcherProps {
    TableViewComponent: React.ReactNode;
    CodeViewComponent: React.ReactNode;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({TableViewComponent, CodeViewComponent,}) => {

    const [currentView, setCurrentView] = useState<ViewMode>('table');

    const handleToggleView = (mode: ViewMode) => {
        setCurrentView(mode);
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-2">
                <div
                    className="flex rounded-full overflow-hidden shadow-sm shadow-secondary-gp/25 ring-1 ring-inset ring-gray/25 text-sm">
                    <button
                        onClick={() => handleToggleView('table')}
                        className={`flex items-center justify-center h-10 px-5 text-sm font-medium
                            ${currentView === 'table'
                            ? 'bg-black/15 dark:bg-white/15 shadow-md'
                            : 'bg-transparent text-purple-600 opacity-80 hover:bg-purple-50'}
                        `}
                    >
                        <CasesIcon className="w-5 h-5 mr-1"/>
                    </button>
                    <button
                        onClick={() => handleToggleView('code')}
                        className={`flex items-center justify-center h-10 px-5 text-sm font-medium
                            ${currentView === 'code'
                            ? 'bg-black/15 dark:bg-white/15 shadow-md'
                            : 'bg-transparent text-purple-600 opacity-80 hover:bg-purple-50'}
                        `}
                        aria-label="Switch to Code View"
                    >
                        <CodeIcon className="w-5 h-5 mr-1"/>
                    </button>
                </div>
            </div>

            <div>
                {currentView === 'table' ? TableViewComponent : CodeViewComponent}
            </div>
        </div>
    );
};
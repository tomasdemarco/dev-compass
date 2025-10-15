import React, { useLayoutEffect, useRef, useState, MouseEvent } from 'react';
import { TAG_STYLES, DEFAULT_TAG_STYLE } from '@/lib/tag-styles';
import { MoreVertical, Eye, Database, Component as ComponentIcon } from 'lucide-react';

// Updated Node structure to include entity kind
export interface DiagramNodeData {
    id: string;
    name: string;
    position: { x: number; y: number };
    layer?: number; // For layouting
    tags?: string[];
    kind: string; // 'Component', 'Resource', etc.
    isCenterNode?: boolean;
}

interface DiagramNodeProps {
    node: DiagramNodeData;
    isSelected: boolean;
    isHighlighted: boolean;
    onNodeClick: (id: string) => void;
    onNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void; // For dragging
    onHeightMeasured: (height: number) => void;
    onWidthMeasured: (width: number) => void;
    onView: (nodeId: string) => void;
}

const DiagramNode = ({ 
    node, 
    isSelected, 
    isHighlighted, 
    onNodeClick, 
    onNodeMouseDown, 
    onHeightMeasured,
    onWidthMeasured,
    onView
}: DiagramNodeProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useLayoutEffect(() => {
        if (nodeRef.current) {
            onHeightMeasured(nodeRef.current.offsetHeight);
            onWidthMeasured(nodeRef.current.offsetWidth);
        }
    }, [node.tags, onHeightMeasured, onWidthMeasured]);

    const handleMenuClick = (e: MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleViewClick = (e: MouseEvent) => {
        e.stopPropagation();
        // Resources don't have a details page yet
        if (node.kind !== 'Component') return;
        onView(node.id);
        setIsMenuOpen(false);
    };

    // --- STYLING --- //
    let ringClasses = 'ring-1 ring-gray-400 dark:ring-gray-600';
    let backgroundClasses = 'bg-white dark:bg-gray-800';
    let headerIcon = <ComponentIcon size={16} className="text-gray-500" />;

    if (node.kind === 'Resource') {
        backgroundClasses = 'bg-sky-50 dark:bg-sky-900/30';
        ringClasses = 'ring-1 ring-sky-400 dark:ring-sky-700';
        headerIcon = <Database size={16} className="text-sky-500" />;
    }

    if (node.isCenterNode) {
        ringClasses = 'ring-2 ring-purple-500 shadow-lg';
    } else if (isSelected) {
        ringClasses = 'ring-2 ring-sky-500';
    } else if (isHighlighted) {
        ringClasses = 'ring-2 ring-amber-400';
    }
    // --- END STYLING --- //

    return (
        <div
            ref={nodeRef}
            className={`absolute w-56 rounded-lg cursor-pointer shadow-md ${ringClasses} ${backgroundClasses}`}
            style={{ left: node.position.x, top: node.position.y }}
            onClick={() => onNodeClick(node.id)}
            onMouseDown={(e) => onNodeMouseDown(e, node.id)}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-2 text-sm font-bold rounded-t-md bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 select-none">
                <div className="flex items-center gap-2 truncate">
                    {headerIcon}
                    <span title={node.name} className="truncate">
                        {node.name}
                    </span>
                </div>
                <div className="relative">
                    <button onClick={handleMenuClick} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <MoreVertical size={16} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg z-10">
                            <button 
                                onClick={handleViewClick}
                                disabled={node.kind !== 'Component'} // Disable view for non-components
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Eye size={14} />
                                View
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body with Tags */}
            <div className="p-3 flex flex-wrap gap-2 items-center">
                 {node.tags?.map(tag => (
                    <span 
                        key={tag} 
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TAG_STYLES[tag.toLowerCase()] || DEFAULT_TAG_STYLE}`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default React.memo(DiagramNode);

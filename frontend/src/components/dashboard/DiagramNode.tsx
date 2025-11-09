import React, {useLayoutEffect, useRef, useState, MouseEvent} from 'react';
import {TAG_STYLES, DEFAULT_TAG_STYLE} from '@/lib/tag-styles';
import {Database, Component as ComponentIcon} from 'lucide-react';
import ComponentActionsMenu from '@/components/generics/ComponentActionsMenu';

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

    useLayoutEffect(() => {
        if (nodeRef.current) {
            onHeightMeasured(nodeRef.current.offsetHeight);
            onWidthMeasured(nodeRef.current.offsetWidth);
        }
    }, [node.tags, onHeightMeasured, onWidthMeasured]);

    // --- STYLING --- //
    let ringClasses = 'ring-1 ring-gray-400 dark:ring-gray-600';
    let backgroundClasses = 'bg-node-component';
    let headerIcon = <ComponentIcon size={16} className="text-gray-500"/>;

    if (node.kind === 'Resource') {
        backgroundClasses = 'bg-node-resource';
        ringClasses = 'ring-1 ring-sky-400 dark:ring-sky-700';
        headerIcon = <Database size={16} className="text-sky-500"/>;
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
            style={{left: node.position.x, top: node.position.y}}
            onClick={() => onNodeClick(node.id)}
            onMouseDown={(e) => onNodeMouseDown(e, node.id)}
        >
            {/* Header */}
            <div
                className="flex justify-between items-center px-3 py-2 text-sm font-bold rounded-t-md bg-node-header border-b border-gray-200 dark:border-gray-600 select-none">
                <div className="flex items-center gap-2 truncate">
                    {headerIcon}
                    <span title={node.name} className="truncate">
                        {node.name}
                    </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <ComponentActionsMenu onViewDetails={() => onView(node.id)}/>
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

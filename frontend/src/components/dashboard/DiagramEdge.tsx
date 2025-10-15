import React from 'react';

// Define the structure of an Edge
export interface DiagramEdgeData {
    id: string;
    sourceId: string; // ID of the source node
    targetId: string; // ID of the target node
    sourcePos: { x: number; y: number };
    targetPos: { x: number; y: number };
}

interface DiagramEdgeProps {
    edge: DiagramEdgeData;
    isSelected: boolean;
    onEdgeClick: (id: string) => void;
}

export default function DiagramEdge({ edge, isSelected, onEdgeClick }: DiagramEdgeProps) {
    const arrowheadOffset = 15; // Pixels to shorten the line for the arrowhead

    // Calculate the vector from source to target
    const dx = edge.targetPos.x - edge.sourcePos.x;
    const dy = edge.targetPos.y - edge.sourcePos.y;

    // Calculate the distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the vector (if distance is not zero)
    const unitDx = distance > 0 ? dx / distance : 0;
    const unitDy = distance > 0 ? dy / distance : 0;

    // Calculate the adjusted target position
    const adjustedTargetX = edge.targetPos.x - unitDx * arrowheadOffset;
    const adjustedTargetY = edge.targetPos.y - unitDy * arrowheadOffset;

    const pathData = `M ${edge.sourcePos.x} ${edge.sourcePos.y} L ${adjustedTargetX} ${adjustedTargetY}`;

    const strokeColor = isSelected ? '#0de6b4' : '#9CA3AF'; // Use secondary-gp color when selected
    const strokeWidth = isSelected ? 2 : 1;
    const markerId = `arrowhead-${edge.id}`; // Unique ID for the marker

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            overflow="visible"
        >
            <defs>
                <marker
                    id={markerId} // Use unique ID
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
                </marker>
            </defs>
            {/* Visible path */}
            <path
                d={pathData}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                markerEnd={`url(#${markerId})`} // Reference unique ID
            />
            {/* Invisible wider path for easier clicking */}
            <path
                d={pathData}
                stroke="transparent"
                strokeWidth="10" // Wider stroke for easier clicking
                fill="none"
                className="pointer-events-auto cursor-pointer"
                onClick={() => onEdgeClick(edge.id)}
            />
        </svg>
    );
}
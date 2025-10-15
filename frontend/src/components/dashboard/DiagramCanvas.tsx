import React, { useState, useRef, MouseEvent, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, ArrowRightLeft } from 'lucide-react';
import DiagramNode, { DiagramNodeData } from './DiagramNode';
import DiagramEdge, { DiagramEdgeData } from './DiagramEdge';
import { LayoutDirection } from '@/lib/graph-layout';

interface DiagramCanvasProps {
    nodes: DiagramNodeData[];
    dependencies: { source: string; target: string }[];
    onNodeClick: (id: string) => void;
    totalDiagramWidth: number;
    totalDiagramHeight: number;
    layoutDirection: LayoutDirection;
    onLayoutDirectionChange: (direction: LayoutDirection) => void;
    onViewNode: (nodeId: string) => void;
}

export default function DiagramCanvas({ 
    nodes: initialNodes, 
    dependencies, 
    onNodeClick: onNodeClickProp,
    totalDiagramWidth,
    totalDiagramHeight,
    layoutDirection,
    onLayoutDirectionChange,
    onViewNode
}: DiagramCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

    const [localNodes, setLocalNodes] = useState<DiagramNodeData[]>([]);
    const [nodeHeights, setNodeHeights] = useState<Map<string, number>>(new Map());
    const [nodeWidths, setNodeWidths] = useState<Map<string, number>>(new Map());
    const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const [didDrag, setDidDrag] = useState(false);

    const animationFrameRef = useRef<number | null>(null);
    const mousePosRef = useRef({ x: 0, y: 0 });

    const handleHeightMeasured = useCallback((nodeId: string, height: number) => {
        setNodeHeights(prevHeights => {
            if (prevHeights.get(nodeId) !== height) {
                const newHeights = new Map(prevHeights);
                newHeights.set(nodeId, height);
                return newHeights;
            }
            return prevHeights;
        });
    }, []);

    const handleWidthMeasured = useCallback((nodeId: string, width: number) => {
        setNodeWidths(prevWidths => {
            if (prevWidths.get(nodeId) !== width) {
                const newWidths = new Map(prevWidths);
                newWidths.set(nodeId, width);
                return newWidths;
            }
            return prevWidths;
        });
    }, []);

    const onNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
        setSelectedEdgeId(null);
        onNodeClickProp(nodeId);
    }, [onNodeClickProp]);

    const onEdgeClick = useCallback((edgeId: string) => {
        setSelectedEdgeId(edgeId);
        setSelectedNodeId(null);
    }, []);

    // Effect to set initial nodes and view
    useEffect(() => {
        setLocalNodes(initialNodes);

        const canvas = canvasRef.current;
        if (initialNodes && initialNodes.length > 0 && canvas && totalDiagramWidth > 0 && totalDiagramHeight > 0) {
            const canvasWidth = canvas.clientWidth;
            const canvasHeight = canvas.clientHeight;
            const padding = 80;

            const scaleX = (canvasWidth - padding) / totalDiagramWidth;
            const scaleY = (canvasHeight - padding) / totalDiagramHeight;
            const newScale = Math.min(scaleX, scaleY, 1); // Do not zoom in more than 100%

            const diagramCenterX = totalDiagramWidth / 2;
            const diagramCenterY = totalDiagramHeight / 2;

            const newPanX = (canvasWidth / 2) - (diagramCenterX * newScale);
            const newPanY = (canvasHeight / 2) - (diagramCenterY * newScale);

            setScale(newScale);
            setPan({ x: newPanX, y: newPanY });
        }
    }, [initialNodes, totalDiagramWidth, totalDiagramHeight]);

    const edges = useMemo(() => {
        const defaultNodeWidth = 230;
        const defaultNodeHeight = 110;
        const newEdges: DiagramEdgeData[] = [];

        dependencies.forEach((dep) => {
            const sourceNode = localNodes.find(n => n.id === dep.source);
            const targetNode = localNodes.find(n => n.id === dep.target);

            if (sourceNode && targetNode) {
                const sourceHeight = nodeHeights.get(sourceNode.id) || defaultNodeHeight;
                const targetHeight = nodeHeights.get(targetNode.id) || defaultNodeHeight;
                const sourceWidth = nodeWidths.get(sourceNode.id) || defaultNodeWidth;
                const targetWidth = nodeWidths.get(targetNode.id) || defaultNodeWidth;

                const sourceCenter = { x: sourceNode.position.x + sourceWidth / 2, y: sourceNode.position.y + sourceHeight / 2 };
                const targetCenter = { x: targetNode.position.x + targetWidth / 2, y: targetNode.position.y + targetHeight / 2 };

                const dx = targetCenter.x - sourceCenter.x;
                const dy = targetCenter.y - sourceCenter.y;

                let sourcePos, targetPos;
                const tolerance = 1.5;

                if (Math.abs(dx) > Math.abs(dy) * tolerance) {
                    if (dx > 0) {
                        sourcePos = { x: sourceNode.position.x + sourceWidth, y: sourceCenter.y };
                        targetPos = { x: targetNode.position.x, y: targetCenter.y };
                    } else {
                        sourcePos = { x: sourceNode.position.x, y: sourceCenter.y };
                        targetPos = { x: targetNode.position.x + targetWidth, y: targetCenter.y };
                    }
                } else {
                    if (dy > 0) {
                        sourcePos = { x: sourceCenter.x, y: sourceNode.position.y + sourceHeight };
                        targetPos = { x: targetCenter.x, y: targetNode.position.y };
                    } else {
                        sourcePos = { x: sourceCenter.x, y: sourceNode.position.y };
                        targetPos = { x: targetCenter.x, y: targetNode.position.y + targetHeight };
                    }
                }

                newEdges.push({
                    id: `e-${dep.source}-${dep.target}`,
                    sourceId: sourceNode.id,
                    targetId: targetNode.id,
                    sourcePos: sourcePos,
                    targetPos: targetPos,
                });
            }
        });
        return newEdges;
    }, [localNodes, dependencies, nodeHeights, nodeWidths]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomFactor = 1.1;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const newScale = e.deltaY > 0 ? scale / zoomFactor : scale * zoomFactor;
            const clampedScale = Math.max(0.1, Math.min(newScale, 5));

            const panX = mouseX - (mouseX - pan.x) * (clampedScale / scale);
            const panY = mouseY - (mouseY - pan.y) * (clampedScale / scale);

            setScale(clampedScale);
            setPan({ x: panX, y: panY });
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [scale, pan.x, pan.y]);

    const updateDrag = useCallback(() => {
        if (!draggedNode || !canvasRef.current) return;

        const gridSize = 10;
        const { x, y } = mousePosRef.current;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (x - rect.left - pan.x) / scale;
        const mouseY = (y - rect.top - pan.y) / scale;

        const newX = mouseX - draggedNode.offsetX;
        const newY = mouseY - draggedNode.offsetY;

        const snappedX = Math.round(newX / gridSize) * gridSize;
        const snappedY = Math.round(newY / gridSize) * gridSize;

        setLocalNodes(prevNodes =>
            prevNodes.map(n =>
                n.id === draggedNode.id
                    ? { ...n, position: { x: snappedX, y: snappedY } }
                    : n
            )
        );
        animationFrameRef.current = null;
    }, [draggedNode, pan.x, pan.y, scale]);

    const requestDragUpdate = useCallback(() => {
        if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateDrag);
        }
    }, [updateDrag]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
        if (draggedNode) {
            setDidDrag(true);
            requestDragUpdate();
        } else if (isPanning) {
            setDidDrag(true);
            setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
        }
    };

    const handleNodeMouseDown = useCallback((e: MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setDidDrag(false);
        const node = localNodes.find(n => n.id === nodeId);
        if (!node || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / scale;
        const mouseY = (e.clientY - rect.top - pan.y) / scale;

        setDraggedNode({ id: nodeId, offsetX: mouseX - node.position.x, offsetY: mouseY - node.position.y });
    }, [localNodes, pan.x, pan.y, scale]);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0 || draggedNode) return;
        if (selectedNodeId || selectedEdgeId) {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
        }
        setDidDrag(false);
        setIsPanning(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        canvasRef.current?.style.setProperty('cursor', 'grabbing');
    };

    const handleMouseUp = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (!didDrag && draggedNode) {
            onNodeClick(draggedNode.id);
        }
        setIsPanning(false);
        setDraggedNode(null);
        canvasRef.current?.style.setProperty('cursor', 'grab');
    };

    const handleMouseLeave = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPanning(false);
        setDraggedNode(null);
        canvasRef.current?.style.setProperty('cursor', 'grab');
    };

    const zoomIn = () => setScale(s => Math.min(5, s * 1.2));
    const zoomOut = () => setScale(s => Math.max(0.1, s / 1.2));
    const toggleLayoutDirection = () => {
        onLayoutDirectionChange(layoutDirection === 'TB' ? 'LR' : 'TB');
    };

    return (
        <div className="px-4 py-1 rounded-lg h-full">
            <div
                ref={canvasRef}
                className="relative h-full w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden cursor-grab grid-background"
                style={{
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {localNodes.length === 0 ? (
                    <p className="text-center text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        No components found to display.
                    </p>
                ) : (
                    <>
                        <div
                            className="absolute top-0 left-0"
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                                transformOrigin: '0 0',
                                width: totalDiagramWidth,
                                height: totalDiagramHeight,
                                willChange: 'transform' // Performance hint
                            }}
                        >
                            {edges.map(edge => (
                                <DiagramEdge 
                                    key={edge.id} 
                                    edge={edge} 
                                    isSelected={edge.id === selectedEdgeId} 
                                    onEdgeClick={onEdgeClick} 
                                />
                            ))}
                            {localNodes.map(node => {
                                const selectedEdge = edges.find(e => e.id === selectedEdgeId);
                                const isHighlighted = selectedEdge ? node.id === selectedEdge.sourceId || node.id === selectedEdge.targetId : false;
                                return (
                                    <DiagramNode
                                        key={node.id}
                                        node={node}
                                        isSelected={node.id === selectedNodeId}
                                        isHighlighted={isHighlighted}
                                        onNodeClick={onNodeClick}
                                        onNodeMouseDown={handleNodeMouseDown}
                                        onHeightMeasured={(height) => handleHeightMeasured(node.id, height)}
                                        onWidthMeasured={(width) => handleWidthMeasured(node.id, width)}
                                        onView={onViewNode}
                                    />
                                );
                            })}
                        </div>
                        <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2">
                            <button onClick={zoomIn} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-2 shadow-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Zoom In">
                                <ZoomIn className="h-5 w-5" />
                            </button>
                            <button onClick={zoomOut} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-2 shadow-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Zoom Out">
                                <ZoomOut className="h-5 w-5" />
                            </button>
                            <button onClick={toggleLayoutDirection} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-2 shadow-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Toggle Layout Direction">
                                <ArrowRightLeft className="h-5 w-5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

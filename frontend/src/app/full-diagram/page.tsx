'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetEntitiesQuery } from "@/store/apiSlice";
import Link from "next/link";
import DiagramCanvas from '@/components/dashboard/DiagramCanvas';
import { DiagramNodeData } from '@/components/dashboard/DiagramNode';
import { Entity, isComponent } from '@/types/component';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { getLayoutedElementsForSubgraph, LayoutDirection } from '@/lib/graph-layout';
import TagFilterDropdown from '@/components/dashboard/TagFilterDropdown';

// --- Componente de la Página ---
export default function FullDiagramPage() {
    const { data: entities, isLoading, error } = useGetEntitiesQuery({});
    const { width: windowWidth } = useWindowDimensions();
    const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');

    // No longer filtering for only components
    const diagramEntities = useMemo(() => {
        if (!entities) return [];
        return entities;
    }, [entities]);

    // State for tag filtering (now based on all entities)
    const allTags = useMemo(() => {
        if (!diagramEntities) return [];
        const tagsSet = new Set<string>();
        diagramEntities.forEach(e => {
            e.metadata.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }, [diagramEntities]);

    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

        useEffect(() => {
            // Initialize with all tags selected once they are loaded
            setSelectedTags(new Set(allTags));
        }, [allTags]);
    
        // Add responsive layout effect
        useEffect(() => {
            if (windowWidth < 768) {
                setLayoutDirection('LR');
            } else {
                setLayoutDirection('TB');
            }
        }, [windowWidth]);
    
        // Memoize the graph calculation to prevent re-running on every render
        const { nodes, edges, totalDiagramWidth, totalDiagramHeight } = useMemo(() => {
            if (!diagramEntities) {
                return { nodes: [], edges: [], totalDiagramWidth: 0, totalDiagramHeight: 0 };
            }
    
            // Filter entities based on selected tags
            const filteredEntities = diagramEntities.filter(entity => 
                entity.metadata.tags?.every(tag => selectedTags.has(tag))
            );
    
            // 1. Build adjacency list for the entire graph to find subgraphs
            const adj = new Map<string, string[]>();
            const allNodeNames = new Set(filteredEntities.map(e => e.metadata.name));
            filteredEntities.forEach(e => adj.set(e.metadata.name, []));
    
            const allEdges: { source: string; target: string }[] = [];
            filteredEntities.forEach(entity => {
                // Only components have relations
                if (isComponent(entity)) {
                    entity.spec.relations?.forEach(relation => {
                        if (allNodeNames.has(relation.target.name)) {
                            const source = relation.type === 'dependsOn' ? relation.target.name : entity.metadata.name;
                            const target = relation.type === 'dependsOn' ? entity.metadata.name : relation.target.name;
                            allEdges.push({ source, target });
                            adj.get(source)?.push(target);
                            adj.get(target)?.push(source);
                        }
                    });
                }
            });
    
            // 2. Find all connected components (subgraphs)
            const visited = new Set<string>();
            const subgraphs: { nodes: Entity[], edges: { source: string, target: string }[] }[] = [];
            filteredEntities.forEach(e => {
                if (!visited.has(e.metadata.name)) {
                    const componentNodes: Entity[] = [];
                    const queue = [e.metadata.name];
                    visited.add(e.metadata.name);
                    let head = 0;
                    while (head < queue.length) {
                        const currentName = queue[head++];
                        const currentEntity = filteredEntities.find(entity => entity.metadata.name === currentName)!;
                        componentNodes.push(currentEntity);
                        adj.get(currentName)?.forEach(neighbor => {
                            if (!visited.has(neighbor)) {
                                visited.add(neighbor);
                                queue.push(neighbor);
                            }
                        });
                    }
                    const nodeNamesInSubgraph = new Set(componentNodes.map(n => n.metadata.name));
                    const subgraphEdges = allEdges.filter(
                        edge => nodeNamesInSubgraph.has(edge.source) && nodeNamesInSubgraph.has(edge.target)
                    );
                    subgraphs.push({ nodes: componentNodes, edges: subgraphEdges });
                }
            });
    
            // 3. Layout each subgraph individually
            const laidOutSubgraphs = subgraphs.map(subgraph => {
                const subgraphDiagramNodes: DiagramNodeData[] = subgraph.nodes.map(entity => ({
                    id: entity.metadata.name,
                    name: entity.metadata.name,
                    position: { x: 0, y: 0 },
                    tags: entity.metadata.tags || [],
                    kind: entity.kind, // Pass kind to the node
                }));
                return getLayoutedElementsForSubgraph(subgraphDiagramNodes, subgraph.edges, layoutDirection);
            });
    
            laidOutSubgraphs.sort((a, b) => b.width - a.width);
    
            // 4. Arrange subgraphs into a single row or column
            const finalNodes: DiagramNodeData[] = [];
            const COLUMN_GAP = 100;
            const ROW_GAP = 100;
            let totalWidth = 0;
            let totalHeight = 0;
    
            if (layoutDirection === 'TB') {
                let currentX = 0;
                let maxHeight = 0;
                laidOutSubgraphs.forEach(subgraph => {
                    if (subgraph.width === 0) return;
                    subgraph.nodes.forEach(node => {
                        finalNodes.push({ ...node, position: { x: node.position.x + currentX, y: node.position.y } });
                    });
                    currentX += subgraph.width + COLUMN_GAP;
                    maxHeight = Math.max(maxHeight, subgraph.height);
                });
                totalWidth = currentX > 0 ? currentX - COLUMN_GAP : 0;
                totalHeight = maxHeight;
            } else { // 'LR' layout: stack vertically
                let currentY = 0;
                let maxWidth = 0;
                laidOutSubgraphs.forEach(subgraph => {
                    if (subgraph.width === 0) return;
                    subgraph.nodes.forEach(node => {
                        finalNodes.push({ ...node, position: { x: node.position.x, y: node.position.y + currentY } });
                    });
                    currentY += subgraph.height + ROW_GAP;
                    maxWidth = Math.max(maxWidth, subgraph.width);
                });
                totalWidth = maxWidth;
                totalHeight = currentY > 0 ? currentY - ROW_GAP : 0;
            }
    
            return { nodes: finalNodes, edges: allEdges, totalDiagramWidth: totalWidth, totalDiagramHeight: totalHeight };
    
        }, [diagramEntities, windowWidth, layoutDirection, selectedTags]);
    
        if (isLoading) {
            return <div className="text-center p-8">Loading diagram...</div>;
        }
    
        if (error) {
            return <div className="text-center p-8 text-red-500">Error loading entities for diagram.</div>;
        }
    
        return (
            <main className="w-screen h-[calc(100vh-theme(space.20))]">
                <div className="absolute top-24 left-8 z-10 flex items-center gap-4">
                    <TagFilterDropdown 
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onSelectionChange={setSelectedTags}
                    />
                </div>
                <DiagramCanvas 
                    nodes={nodes}
                    dependencies={edges}
                    onNodeClick={(id) => console.log("Node clicked:", id)}
                    totalDiagramWidth={totalDiagramWidth}
                    totalDiagramHeight={totalDiagramHeight}
                    layoutDirection={layoutDirection}
                    onLayoutDirectionChange={setLayoutDirection}
                    onViewNode={(nodeId) => window.open(`/catalog/${nodeId}`, '_blank')}
                />
            </main>
        );}
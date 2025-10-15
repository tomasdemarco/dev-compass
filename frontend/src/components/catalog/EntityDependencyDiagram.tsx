'use client';

import React, { useMemo, useState } from 'react';
import { Entity, isComponent } from '@/types/component';
import DiagramCanvas from '@/components/dashboard/DiagramCanvas';
import { DiagramNodeData } from '@/components/dashboard/DiagramNode';
import { getLayoutedElementsForSubgraph, LayoutDirection } from '@/lib/graph-layout';

interface EntityDependencyDiagramProps {
  entity: Entity;
  allEntities: Entity[];
}

// Helper function to create a node with its kind
const createNode = (entity: Entity, isCenter: boolean = false): DiagramNodeData => ({
  id: entity.metadata.name,
  name: entity.metadata.name,
  position: { x: 0, y: 0 },
  tags: entity.metadata.tags || [],
  kind: entity.kind,
  isCenterNode: isCenter,
});

export default function EntityDependencyDiagram({ entity, allEntities }: EntityDependencyDiagramProps) {
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');

  const { nodes, edges, totalDiagramWidth, totalDiagramHeight } = useMemo(() => {
    const diagramNodes: DiagramNodeData[] = [];
    const dependencies: { source: string; target: string }[] = [];

    // Add the central node for the current entity
    diagramNodes.push(createNode(entity, true));

    // Add nodes and edges for each dependency, only if it's a component
    if (isComponent(entity) && entity.spec.relations) {
      entity.spec.relations.forEach(relation => {
        const dependencyEntity = allEntities.find(e => e.metadata.name === relation.target.name);
        if (!dependencyEntity) return; // Skip if the related entity doesn't exist

        // Add the node if it's not already in the list
        if (!diagramNodes.find(n => n.id === relation.target.name)) {
          diagramNodes.push(createNode(dependencyEntity, false));
        }

        // Add the dependency edge
        if (relation.type === 'dependsOn') {
          dependencies.push({ source: relation.target.name, target: entity.metadata.name });
        } else {
          dependencies.push({ source: entity.metadata.name, target: relation.target.name });
        }
      });
    }

    const { nodes: finalNodes, width, height } = getLayoutedElementsForSubgraph(diagramNodes, dependencies, layoutDirection);

    return { 
      nodes: finalNodes, 
      edges: dependencies, 
      totalDiagramWidth: width, 
      totalDiagramHeight: height 
    };
  }, [entity, allEntities, layoutDirection]);

  return (
    <div className="p-2 w-full rounded-lg border bg-card">
      <h3 className="font-bold text-lg mt-2 ml-4">Relations</h3>
      <div className="h-96">
        <DiagramCanvas
            nodes={nodes}
            dependencies={edges}
            onNodeClick={() => {}} // No action on click for now
            totalDiagramWidth={totalDiagramWidth}
            totalDiagramHeight={totalDiagramHeight}
            layoutDirection={layoutDirection}
            onLayoutDirectionChange={setLayoutDirection}
            onViewNode={(nodeId) => window.open(`/catalog/${nodeId}`, '_blank')}
        />
      </div>
    </div>
  );
}
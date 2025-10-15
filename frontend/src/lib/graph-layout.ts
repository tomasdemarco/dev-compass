
import { DiagramNodeData } from '@/components/dashboard/DiagramNode';

export type LayoutDirection = 'TB' | 'LR';

/**
 * Arranges nodes and edges in a hierarchical layout using the Sugiyama method.
 * This function takes a single connected component (a subgraph).
 *
 * @param nodes The nodes of the subgraph.
 * @param dependencies The edges of the subgraph.
 * @param direction The layout direction ('TB' for Top-to-Bottom, 'LR' for Left-to-Right).
 * @returns An object containing the positioned nodes and the calculated width and height of the layout.
 */
export const getLayoutedElementsForSubgraph = (
    nodes: DiagramNodeData[],
    dependencies: { source: string; target: string }[],
    direction: LayoutDirection
) => {
    if (nodes.length === 0) {
        return { nodes: [], width: 0, height: 0 };
    }

    const nodeWidth = 230, nodeHeight = 110, verticalGap = 60, horizontalGap = 80;

    // 1. Assign Layers (Topological Sort - Kahn's algorithm)
    const nodesWithLayers = [...nodes];
    const graphNodes = new Map<string, any>();
    nodesWithLayers.forEach(node => {
        graphNodes.set(node.id, { id: node.id, incoming: new Set(), outgoing: new Set(), layer: -1, inDegree: 0 });
    });

    dependencies.forEach(dep => {
        const source = graphNodes.get(dep.source);
        const target = graphNodes.get(dep.target);
        if (source && target) {
            source.outgoing.add(target.id);
            target.incoming.add(source.id);
            target.inDegree++;
        }
    });

    const queue: any[] = [];
    graphNodes.forEach(node => {
        if (node.inDegree === 0) {
            node.layer = 0;
            queue.push(node);
        }
    });

    let head = 0;
    while (head < queue.length) {
        const u = queue[head++];
        u.outgoing.forEach((vId: string) => {
            const v = graphNodes.get(vId);
            if (v) {
                v.layer = Math.max(v.layer, u.layer + 1);
                v.inDegree--;
                if (v.inDegree === 0) {
                    queue.push(v);
                }
            }
        });
    }

    let maxLayer = 0;
    graphNodes.forEach(node => {
        if (node.layer > maxLayer) maxLayer = node.layer;
    });
    graphNodes.forEach(node => {
        if (node.layer === -1) node.layer = maxLayer + 1;
    });

    nodesWithLayers.forEach(node => {
        const graphNode = graphNodes.get(node.id);
        node.layer = graphNode ? graphNode.layer : 0;
    });

    // 2. Group nodes by layer
    const nodesByLayer = new Map<number, DiagramNodeData[]>();
    nodesWithLayers.forEach(node => {
        const layer = node.layer || 0;
        if (!nodesByLayer.has(layer)) {
            nodesByLayer.set(layer, []);
        }
        nodesByLayer.get(layer)?.push(node);
    });

    const layerKeys = Array.from(nodesByLayer.keys()).sort((a, b) => a - b);
    const nodePositionsInLayer = new Map<string, number>();

    (nodesByLayer.get(0) || []).forEach((node, index) => {
        nodePositionsInLayer.set(node.id, index);
    });

    // 3. Iterative Barycenter Sorting to reduce crossings
    const maxIterations = 8;
    for (let iter = 0; iter < maxIterations; iter++) {
        for (let i = 1; i < layerKeys.length; i++) {
            const currentLayer = nodesByLayer.get(layerKeys[i]) || [];
            const barycenters = new Map<string, number>();
            currentLayer.forEach(node => {
                let sum = 0, count = 0;
                dependencies.forEach(dep => {
                    if (dep.target === node.id) {
                        const parentPos = nodePositionsInLayer.get(dep.source);
                        if (parentPos !== undefined) { sum += parentPos; count++; }
                    }
                });
                barycenters.set(node.id, count > 0 ? sum / count : -1);
            });
            currentLayer.sort((a, b) => (barycenters.get(a.id) ?? -1) - (barycenters.get(b.id) ?? -1));
            currentLayer.forEach((node, index) => nodePositionsInLayer.set(node.id, index));
        }
        for (let i = layerKeys.length - 2; i >= 0; i--) {
            const currentLayer = nodesByLayer.get(layerKeys[i]) || [];
            const barycenters = new Map<string, number>();
            currentLayer.forEach(node => {
                let sum = 0, count = 0;
                dependencies.forEach(dep => {
                    if (dep.source === node.id) {
                        const childPos = nodePositionsInLayer.get(dep.target);
                        if (childPos !== undefined) { sum += childPos; count++; }
                    }
                });
                barycenters.set(node.id, count > 0 ? sum / count : -1);
            });
            currentLayer.sort((a, b) => (barycenters.get(a.id) ?? -1) - (barycenters.get(b.id) ?? -1));
            currentLayer.forEach((node, index) => nodePositionsInLayer.set(node.id, index));
        }
    }

    // 4. Assign final X, Y positions
    const positionedNodes = [...nodesWithLayers];
    let totalWidth = 0;
    let totalHeight = 0;

    if (direction === 'LR') {
        let maxLayerHeight = 0;
        nodesByLayer.forEach(layer => {
            const layerHeight = layer.length * nodeHeight + (layer.length > 0 ? (layer.length - 1) * verticalGap : 0);
            maxLayerHeight = Math.max(maxLayerHeight, layerHeight);
        });

        let currentLayerX = 0;
        layerKeys.forEach(layerIndex => {
            const nodesInLayer = nodesByLayer.get(layerIndex) || [];
            const layerActualHeight = nodesInLayer.length * nodeHeight + (nodesInLayer.length > 0 ? (nodesInLayer.length - 1) * verticalGap : 0);
            let currentYInLayer = (maxLayerHeight - layerActualHeight) / 2;

            nodesInLayer.forEach(node => {
                const posInLayer = nodePositionsInLayer.get(node.id) ?? 0;
                node.position = { x: currentLayerX, y: currentYInLayer + (posInLayer * (nodeHeight + verticalGap)) };
            });
            currentLayerX += nodeWidth + horizontalGap;
        });
        totalWidth = currentLayerX > 0 ? currentLayerX - horizontalGap : 0;
        totalHeight = maxLayerHeight;
    } else { // 'TB'
        let maxLayerWidth = 0;
        nodesByLayer.forEach((layer, key) => {
            const sortedLayer = [...layer].sort((a,b) => (nodePositionsInLayer.get(a.id) ?? 0) - (nodePositionsInLayer.get(b.id) ?? 0));
            nodesByLayer.set(key, sortedLayer);
            const layerWidth = layer.length * nodeWidth + (layer.length > 0 ? (layer.length - 1) * horizontalGap : 0);
            maxLayerWidth = Math.max(maxLayerWidth, layerWidth);
        });

        let currentLayerY = 0;
        layerKeys.forEach(layerIndex => {
            const nodesInLayer = nodesByLayer.get(layerIndex) || [];
            const layerActualWidth = nodesInLayer.length * nodeWidth + (nodesInLayer.length > 0 ? (nodesInLayer.length - 1) * horizontalGap : 0);
            let currentXInLayer = (maxLayerWidth - layerActualWidth) / 2;

            nodesInLayer.forEach(node => {
                node.position = { x: currentXInLayer, y: currentLayerY };
                currentXInLayer += nodeWidth + horizontalGap;
            });
            currentLayerY += nodeHeight + verticalGap;
        });
        totalWidth = maxLayerWidth;
        totalHeight = currentLayerY > 0 ? currentLayerY - verticalGap : 0;
    }

    return { nodes: positionedNodes, width: totalWidth, height: totalHeight };
};

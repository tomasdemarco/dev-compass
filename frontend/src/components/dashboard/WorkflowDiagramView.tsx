'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WorkflowList from '@/components/dashboard/WorkflowList';
import DiagramCanvas from '@/components/dashboard/DiagramCanvas';
import DetailsPanel from '@/components/dashboard/DetailsPanel';
import { DiagramNodeData } from '@/components/dashboard/DiagramNode';
import Loading from '@/components/generics/Loading';
import { apiSlice, useGetJobsByWorkflowRunIdQuery, useGetWorkflowByIdQuery, useGetWorkflowRunsByWorkflowIdQuery, useGetWorkflowStepsQuery } from '@/store/apiSlice';
import { useAppDispatch } from '@/store';
import { MenuIcon } from "@/components/generics/Icons";
import { Button } from "@/components/generics/Button";
import { Job } from '@/types'; // Import Job type
import { JobType } from '@/components/generics/StyledBadge'; // Import JobType

// --- Funciones Helper ---

interface GraphNode {
    id: string;
    incoming: Set<string>;
    outgoing: Set<string>;
    layer: number;
    inDegree: number;
}

const assignLayers = (nodes: DiagramNodeData[], dependencies: { source: string; target: string }[]) => {
    const graphNodes = new Map<string, GraphNode>();
    nodes.forEach(node => {
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
    const q: GraphNode[] = [];
    graphNodes.forEach(node => {
        if (node.inDegree === 0) {
            node.layer = 0;
            q.push(node);
        }
    });
    let head = 0;
    while (head < q.length) {
        const u = q[head++];
        u.outgoing.forEach(vId => {
            const v = graphNodes.get(vId);
            if (v) {
                v.inDegree--;
                v.layer = Math.max(v.layer, u.layer + 1);
                if (v.inDegree === 0) q.push(v);
            }
        });
    }
    nodes.forEach(node => {
        const graphNode = graphNodes.get(node.id);
        if (graphNode && graphNode.layer === -1) graphNode.layer = 0;
    });
    return nodes.map(node => ({ ...node, layer: graphNodes.get(node.id)?.layer || 0 }));
};

// --- Props del Componente ---

interface WorkflowDiagramViewProps {
    runIdToShow?: string; // Si se provee, carga este run específico
    showWorkflowList?: boolean; // Decide si mostrar la barra lateral de workflows
}

// --- Componente Principal Reutilizable ---

export default function WorkflowDiagramView({ runIdToShow, showWorkflowList = true }: WorkflowDiagramViewProps) {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    // --- Lógica de Fetching de Datos ---

    const { data: runsData, isLoading: isLoadingRuns, isFetching: isFetchingRuns } = useGetWorkflowRunsByWorkflowIdQuery(selectedWorkflowId!, {
        skip: !selectedWorkflowId || !!runIdToShow,
    });
    const runs = runsData ?? [];

    const latestRunId = runs.length > 0 ? [...runs].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0].workflow_run_id : null;
    const runIdToUse = runIdToShow || latestRunId;

    const { data: jobsData, isLoading: isLoadingJobs } = useGetJobsByWorkflowRunIdQuery(runIdToUse || undefined, {
        skip: !runIdToUse,
    });

    // Previene que se muestren datos obsoletos al cambiar de workflow.
    const isSwitchingWorkflow = isLoadingRuns || isFetchingRuns;
    const currentWorkflowHasNoRuns = !isSwitchingWorkflow && runs.length === 0 && !runIdToShow;
    const jobs = (isSwitchingWorkflow || (currentWorkflowHasNoRuns && selectedWorkflowId)) ? [] : (jobsData ?? []);

    const workflowIdFromJobs = jobs && jobs.length > 0 ? jobs[0].workflow_id : null;
    const workflowIdToUse = runIdToShow ? workflowIdFromJobs : selectedWorkflowId;

    const { data: stepsData, isLoading: isLoadingSteps } = useGetWorkflowStepsQuery(workflowIdToUse || undefined, {
        skip: !workflowIdToUse,
    });
    const steps = stepsData ?? [];

    const { data: workflowData, isLoading: isLoadingWorkflowDetails } = useGetWorkflowByIdQuery(workflowIdToUse || undefined, {
        skip: !workflowIdToUse,
    });
    const workflow = workflowData ?? null;

    // --- Lógica de SSE para actualizaciones en tiempo real ---
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:8080/api/v1/jobs/events');
        eventSource.onmessage = (event) => {
            const updatedJob: Job = JSON.parse(event.data);
            if (runIdToUse && updatedJob.workflow_run_id === runIdToUse) {
                dispatch(
                    apiSlice.util.updateQueryData('getJobsByWorkflowRunId', runIdToUse, (draft) => {
                        const jobIndex = draft.findIndex(job => job.id === updatedJob.id);
                        if (jobIndex !== -1) {
                            draft[jobIndex] = updatedJob;
                        }
                    })
                );
            }
        };
        eventSource.onerror = () => eventSource.close();
        return () => eventSource.close();
    }, [dispatch, runIdToUse]);

    // --- Preparación de Datos para el Diagrama ---
    const dependencies = useMemo(() => {
        if (!jobs || !steps) return [];
        const jobToStepMap = new Map(jobs.map(job => [job.workflow_step_id, job.id]));
        const deps: { source: string; target: string }[] = [];
        steps.forEach(step => {
            if (step.dependencies && step.dependencies.length > 0) {
                step.dependencies.forEach((depStepId: string) => {
                    const sourceJobId = jobToStepMap.get(depStepId);
                    const targetJobId = jobToStepMap.get(step.id);
                    if (sourceJobId && targetJobId) deps.push({ source: sourceJobId, target: targetJobId });
                });
            }
        });
        return deps;
    }, [jobs, steps]);

    const diagramNodes: DiagramNodeData[] = useMemo(() => {
        if (!jobs || !steps) return [];
        const stepsMap = new Map(steps.map(step => [step.id, step]));
        const nodes = jobs.map(job => {
            const correspondingStep = stepsMap.get(job.workflow_step_id);
            return {
                id: job.id,
                name: correspondingStep?.name || `Job ${job.id}`,
                status: job.status,
                position: { x: 0, y: 0 },
                stepName: correspondingStep?.name || 'N/A',
                createdAt: job.created_at,
                executorType: correspondingStep?.executor_type || JobType.SSH, // <<< CAMBIO A JobType.SSH
                requiresArgs: correspondingStep?.requires_args || false,
                expectedArgs: correspondingStep?.expected_args || null,
            };
        });
        return assignLayers(nodes, dependencies);
    }, [jobs, steps, dependencies]);

    const selectedJob = jobs.find(job => job.id === selectedJobId);
    const selectedStep = steps.find(s => s.id === selectedJob?.workflow_step_id);

    // --- Handlers ---
    const handleNodeClick = useCallback((jobId: string) => {
        setSelectedJobId(jobId);
        setSelectedEdgeId(null);
    }, []);

    const handleEdgeClick = useCallback((edgeId: string) => {
        setSelectedEdgeId(edgeId);
        setSelectedJobId(null);
    }, []);

    const handleActionClick = useCallback((jobId: string) => {
        console.log(`Action clicked for job: ${jobId}`);
    }, []);

    const handleWorkflowSelect = useCallback((workflowId: string) => {
        setSelectedWorkflowId(workflowId);
        setSelectedJobId(null);
        setSelectedEdgeId(null);
    }, []);

    const isGlobalLoading = (isLoadingRuns && !runIdToShow) || isLoadingJobs || isLoadingSteps || isLoadingWorkflowDetails;

    return (
        <div className="h-full w-full font-sans">
            {isGlobalLoading && <Loading size={80} />}
            <main className="flex items-stretch h-full">
                {showWorkflowList && (
                    <aside className="flex-shrink-0 h-full overflow-y-auto relative">
                        {isSidebarVisible ? (
                            <WorkflowList
                                selectedWorkflowId={selectedWorkflowId}
                                onSelectWorkflow={handleWorkflowSelect}
                                onToggleVisibility={() => setIsSidebarVisible(false)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-start justify-center pt-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarVisible(true)}
                                >
                                    <MenuIcon className="h-7 w-7 text-white m-1" />
                                </Button>
                            </div>
                        )}
                    </aside>
                )}

                <section className="flex-grow">
                    <DiagramCanvas
                        nodes={diagramNodes}
                        dependencies={dependencies}
                        selectedJobId={selectedJobId}
                        selectedEdgeId={selectedEdgeId}
                        onNodeClick={handleNodeClick}
                        onEdgeClick={handleEdgeClick}
                        onActionClick={handleActionClick}
                    />
                </section>

                <aside className="flex-shrink-0 h-full overflow-y-auto">
                    {selectedJobId && selectedJob && selectedStep && (
                        <DetailsPanel
                            job={selectedJob}
                            workflowId={workflowIdToUse}
                            workflowName={workflow?.name || null}
                            runId={runIdToUse}
                            stepId={selectedStep.id}
                            stepName={selectedStep.name}
                            stepDescription={selectedStep.description || null}
                            stepExecutorType={selectedStep.executor_type}
                            jobOutput={selectedJob.output || null}
                            onClose={() => setSelectedJobId(null)}
                        />
                    )}
                </aside>
            </main>
        </div>
    );
}

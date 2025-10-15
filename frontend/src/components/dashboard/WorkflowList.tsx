'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGetWorkflowsForListQuery } from '@/store/apiSlice';
import Loading from '@/components/generics/Loading';
import { BackIcon } from "@/components/generics/Icons";
import { Button } from "@/components/generics/Button";

interface Workflow {
    id: string;
    name: string;
    category: string;
}

interface WorkflowListProps {
    selectedWorkflowId: string | null;
    onSelectWorkflow: (id: string) => void;
    onToggleVisibility: () => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({ selectedWorkflowId, onSelectWorkflow, onToggleVisibility }) => {
    const [page, setPage] = useState(1);
    const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([]);
    const limit = 20;

    const { data, error, isLoading } = useGetWorkflowsForListQuery({ page, limit });

    useEffect(() => {
        if (data?.workflows) {
            setAllWorkflows(prevWorkflows => {
                const combined = [...prevWorkflows, ...data.workflows];
                const uniqueWorkflows = Array.from(new Map(combined.map(wf => [wf.id, wf])).values());
                return uniqueWorkflows;
            });
        }
    }, [data]);

    const totalWorkflows = data?.total || 0;
    const hasMore = allWorkflows.length < totalWorkflows;

    useEffect(() => {
        if (!selectedWorkflowId && allWorkflows.length > 0) {
            onSelectWorkflow(allWorkflows[0].id);
        }
    }, [allWorkflows, selectedWorkflowId, onSelectWorkflow]);

    const groupedWorkflows: Record<string, Workflow[]> = allWorkflows.reduce((acc: Record<string, Workflow[]>, wf: Workflow) => {
        const category = wf.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(wf);
        return acc;
    }, {});

    return (
        <div className="bg-card border border-gray-600 rounded-lg shadow-md h-full min-w-76 max-w-xs relative">
            <div className="p-3 border-b border-gray-600">
                <h3 className="ml-2 font-bold text-lg">Workflows</h3>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-3 rounded-lg p-1 hover:bg-secondary transition-colors h-auto w-auto"
                onClick={onToggleVisibility}
            >
                <BackIcon className="h-6 w-6" />
            </Button>

            {error && <p className="text-red-500 text-xs">Error al cargar workflows.</p>}

            <div className="p-3">
                {allWorkflows.length === 0 && !isLoading ? (
                    <p className="text-sm text-gray-500">No workflows found.</p>
                ) : (
                    <ul>
                        {allWorkflows.map((wf: Workflow) => (
                            <li key={wf.id}>
                                <Link
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectWorkflow(wf.id);
                                    }}
                                    className={`block p-2 rounded-md text-sm font-medium transition-colors ${
                                        wf.id === selectedWorkflowId
                                            ? 'bg-primary-gp'
                                            : 'hover:bg-secondary'
                                    }`}
                                >
                                    {wf.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isLoading && <Loading size={80} />}

            {hasMore && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-xs font-medium text-white bg-secondary rounded-md disabled:opacity-50 hover:bg-secondary-gp transition-colors"
                    >
                        {isLoading ? 'Cargando...' : 'Cargar más'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkflowList;
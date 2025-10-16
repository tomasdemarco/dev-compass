'use client';

import React, { useMemo } from 'react';
import { useGetEnvironmentsQuery } from '@/store/apiSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/generics/Card";
import Loading from "@/components/generics/Loading";
import InlineAlert from "@/components/generics/InlineAlert";
import StyledBadge from "@/components/generics/StyledBadge";
import { DeploymentComponent } from "@/store/apiSlice";
import { GitCommit, GitBranch } from 'lucide-react';

// Group deployments by component name
const groupDeploymentsByComponent = (deployments: DeploymentComponent[]) => {
    if (!deployments) return {};
    return deployments.reduce((acc, dep) => {
        (acc[dep.componentName] = acc[dep.componentName] || []).push(dep);
        return acc;
    }, {} as Record<string, DeploymentComponent[]>);
};

const EnvironmentPage: React.FC = () => {
    const { data: environments, error, isLoading } = useGetEnvironmentsQuery();

    // Sort environments: prod, uat, qa, dev
    const sortedEnvironments = useMemo(() => {
        if (!environments) return [];
        const order = ['development', 'qa', 'uat', 'production'];
        return [...environments].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }, [environments]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loading size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <InlineAlert variant="error" title="Error Fetching Environments">
                    <p>An error occurred while fetching the environment data. Please try again later.</p>
                </InlineAlert>
            </div>
        );
    }

    return (
        <main className="p-4 lg:p-8">
            <h1 className="text-3xl font-bold mb-8 px-4">Environments Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {sortedEnvironments?.map(env => {
                    const components = groupDeploymentsByComponent(env.deployments);
                    return (
                        <div key={env.name} className="bg-card border rounded-lg p-4">
                            <h2 className="text-xl font-semibold capitalize mb-1 tracking-tight">{env.name.replace("wg_adquirencia_", "")}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{env.description}</p>
                            <div className="space-y-4">
                                {Object.keys(components).sort().map(componentName => (
                                    <Card key={componentName} className="bg-background/50">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <GitBranch className="w-5 h-5 text-primary"/>
                                                {componentName}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <ul className="space-y-2 text-sm">
                                                {components[componentName].map((dep, index) => (
                                                    <li key={index} className="flex items-center justify-between text-muted-foreground">
                                                        <span className="flex items-center gap-2">
                                                            <GitCommit className="w-4 h-4"/>
                                                            {dep.entidad ? `Entidad ${dep.entidad}` : 'Global'}
                                                        </span>
                                                        <StyledBadge
                                                            href={`${dep.projectURL}/-/${dep.version.startsWith('v') ? 'tags' : 'commit'}/${dep.version}`}
                                                            text={dep.version}
                                                            type="custom"
                                                            className="font-mono bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
};

export default EnvironmentPage;
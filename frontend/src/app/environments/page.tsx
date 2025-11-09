'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetEnvironmentsQuery, EnvironmentWithPagination, GroupedComponent } from '@/store/apiSlice';
import useDebounce from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/generics/Card";
import Loading from "@/components/generics/Loading";
import InlineAlert from "@/components/generics/InlineAlert";
import StyledBadge from "@/components/generics/StyledBadge";
import { Input } from "@/components/generics/Input";
import { Button } from "@/components/generics/Button";
import { GitCommit, GitBranch, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ComponentActionsMenu from "@/components/generics/ComponentActionsMenu";

const PAGE_LIMIT = 10;

const EnvironmentPage: React.FC = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [page, setPage] = useState(1);
    const [environments, setEnvironments] = useState<EnvironmentWithPagination[]>([]);

    const { data: newEnvironments, error, isLoading, isFetching } = useGetEnvironmentsQuery({
        search: debouncedSearchTerm,
        page,
        limit: PAGE_LIMIT,
    });

    useEffect(() => {
        // Reset page and clear data on a new search
        if (debouncedSearchTerm) {
            setPage(1);
            setEnvironments([]);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (newEnvironments) {
            if (page === 1) {
                // If it's the first page (or a new search), replace the data
                setEnvironments(newEnvironments);
            } else {
                // If loading more, merge the new components into the existing state
                setEnvironments(prevEnvironments => {
                    return prevEnvironments.map(env => {
                        const newEnvData = newEnvironments.find(ne => ne.name === env.name);
                        if (newEnvData) {
                            // Create a Set of existing component names for quick lookup
                            const existingComponentNames = new Set(env.result.components.map(c => c.componentName));
                            // Filter out any components that are already in the state to prevent duplicates
                            const uniqueNewComponents = newEnvData.result.components.filter(c => !existingComponentNames.has(c.componentName));

                            return {
                                ...env,
                                result: {
                                    total: newEnvData.result.total, // Always update the total count
                                    components: [...(env.result?.components || []), ...uniqueNewComponents],
                                },
                            };
                        }
                        return env;
                    });
                });
            }
        }
    }, [newEnvironments, page]);

    const handleLoadMore = () => {
        if (!isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const hasMore = useMemo(() => {
        if (!environments || environments.length === 0) return false;
        // Check if any environment has more components to load
        return environments.some(env => (env.result?.components?.length || 0) < (env.result?.total || 0));
    }, [environments]);

    const sortedEnvironments = useMemo(() => {
        if (!environments) return [];
        const order = ['development', 'qa', 'uat', 'production'];
        return [...environments].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }, [environments]);

    if (isLoading && page === 1) {
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
            <div className="flex justify-between items-center mb-8 px-4">
                <h1 className="text-3xl font-bold">Environments Dashboard</h1>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                        placeholder="Filter by component..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {sortedEnvironments?.map(env => (
                    <div key={env.name} className="bg-card border rounded-lg p-4 flex flex-col">
                        <h2 className="text-xl font-semibold capitalize mb-1 tracking-tight">{env.name.replace("wg_adquirencia_", "")}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{env.description}</p>
                        <div className="space-y-4 flex-grow">
                            {env.result?.components?.length > 0 ? (
                                env.result.components.map(component => {
                                    return (
                                        <Card key={component.componentName} className="bg-background/50">
                                            <CardHeader className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <GitBranch className="w-5 h-5 text-primary"/>
                                                        {component.componentName}
                                                    </CardTitle>
                                                    <ComponentActionsMenu onViewDetails={() => router.push(`/catalog/${component.componentName}`)} />
                                                </div>
                                            </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <ul className="space-y-2 text-sm">
                                                {component.deployments.map((dep, index) => (
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
                                  )
                                })
                            ) : (
                                <div className="text-center text-muted-foreground py-8">No components found.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button onClick={handleLoadMore} disabled={isFetching}>
                        {isFetching ? <Loading size={20} /> : 'Load More'}
                    </Button>
                </div>
            )}
        </main>
    );
};

export default EnvironmentPage;
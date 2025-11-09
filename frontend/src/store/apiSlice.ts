import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Entity } from '@/types/component';

// --- Type Definitions for Environments (Grouped by Backend) ---

export interface DeploymentVersion {
    version: string;
    timestamp: string;
    entidad?: string;
    projectURL?: string;
}

export interface GroupedComponent {
    componentName: string;
    deployments: DeploymentVersion[];
}

export interface PaginatedGroupedComponents {
    components: GroupedComponent[];
    total: number;
}

export interface EnvironmentWithPagination {
    name: string;
    description: string;
    result: PaginatedGroupedComponents;
}

export interface ComponentDeployment {
    environment: string;
    version: string;
    timestamp: string;
    entidad?: string;
}

// Define a service using a base URL and expected endpoints.
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api/v1/' }),
    tagTypes: ['Entity', 'Environment'],
    endpoints: (builder) => ({
        getEntities: builder.query<Entity[], { search?: string; tag?: string }>({ 
            query: ({ search = '', tag = '' }) => {
                const params = new URLSearchParams({ search, tag });
                return `entities?${params.toString()}`;
            },
            providesTags: (result) => 
                result
                    ? [
                          ...result.map(({ metadata }) => ({ type: 'Entity' as const, id: metadata.name })),
                          { type: 'Entity', id: 'LIST' },
                      ]
                    : [{ type: 'Entity', id: 'LIST' }],
        }),
        getEnvironments: builder.query<EnvironmentWithPagination[], { search?: string; page?: number; limit?: number }>({ 
            query: ({ search = '', page = 1, limit = 10 }) => {
                const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
                return `environments?${params.toString()}`;
            },
            providesTags: ['Environment'],
        }),
        getEnvironmentsByComponent: builder.query<ComponentDeployment[], string>({ 
            query: (componentName) => `components/${componentName}/environments`,
            providesTags: (result, error, arg) => [{ type: 'Environment', id: arg }],
        }),
        releaseJob: builder.mutation<void, string>({
            query: (jobId) => ({
                url: `jobs/${jobId}/release`, // This endpoint doesn't have to exist yet
                method: 'POST',
            }),
        }),
        getEntityDocs: builder.query<string, { name: string; path: string }>({
            query: ({ name, path }) => ({
                url: `entities/${name}/docs/${path}`,
                responseHandler: (response) => response.text(), // We want the raw markdown text
            }),
        }),
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetEntitiesQuery, useGetEnvironmentsQuery, useGetEnvironmentsByComponentQuery, useReleaseJobMutation, useGetEntityDocsQuery } = apiSlice;

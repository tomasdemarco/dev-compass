import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Entity } from '@/types/component';

// --- Type Definitions for Environments ---
export interface DeploymentComponent {
  componentName: string;
  version: string;
  timestamp: string;
  entidad?: string;
}

export interface Environment {
  name: string;
  description: string;
  deployments: DeploymentComponent[];
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
    getEnvironments: builder.query<Environment[], void>({
      query: () => 'environments',
      providesTags: ['Environment'],
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
export const { useGetEntitiesQuery, useGetEnvironmentsQuery, useReleaseJobMutation, useGetEntityDocsQuery } = apiSlice;

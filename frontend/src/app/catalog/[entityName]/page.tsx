'use client';

import { useGetEntitiesQuery } from "@/store/apiSlice";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import EntityDependencyDiagram from "@/components/catalog/EntityDependencyDiagram"; // Updated import
import TechDocsViewer from "@/components/catalog/TechDocsViewer";
import StyledBadge from "@/components/generics/StyledBadge";
import { CheckCircle2, XCircle, Loader, Tag, AlertTriangle } from 'lucide-react';
import TagsList from "@/components/catalog/TagsList";
import CiCdTabContent from "@/components/catalog/CiCdTabContent";
import EnvironmentTabContent from "@/components/catalog/EnvironmentTabContent";
import { cn } from "@/lib/utils";
import { Entity, isComponent, isResource } from "@/types/component";

import Link from "next/link";

// --- Generic Overview Tab --- //
function OverviewTab({ entity, allEntities }: { entity: Entity, allEntities: Entity[] }) {
    // Common layout for details and tags
    const detailsAndTags = (
        <div className="lg:col-span-1 space-y-4">
            <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-bold text-lg mb-2">Details</h3>
                <p><strong>Owner:</strong> {entity.spec.owner}</p>
                {isComponent(entity) && <p><strong>Lifecycle:</strong> {entity.spec.lifecycle}</p>}
                <p><strong>Type:</strong> {entity.spec.type}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-bold text-lg mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    {(entity.metadata.tags || []).map(tag => (
                        <StyledBadge key={tag} type="tag" text={tag} />
                    ))}
                </div>
            </div>
            {isComponent(entity) && entity.spec.repository?.tags && entity.spec.repository.tags.length > 0 && (
                <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-bold text-lg mb-2">Repository Tags</h3>
                    <TagsList tags={entity.spec.repository.tags} projectURL={entity.spec.projectURL} />
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {detailsAndTags}
            <div className="lg:col-span-2">
                <EntityDependencyDiagram entity={entity} allEntities={allEntities} />
            </div>
        </div>
    );
}


export default function EntityDetailPage() {
  const params = useParams();
  const entityName = params.entityName as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: entities, isLoading, error } = useGetEntitiesQuery({});

  const { entity, latestTag } = useMemo(() => {
    if (!entities) return { entity: null, latestTag: null };
    
    const currentEntity = entities.find(e => e.metadata.name === entityName);

    if (!currentEntity) {
      return { entity: null, latestTag: null };
    }

    if (isComponent(currentEntity) && currentEntity.spec.repository?.tags) {
        const sortedTags = [...currentEntity.spec.repository.tags].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return { entity: currentEntity, latestTag: sortedTags[0] || null };
    }

    return { entity: currentEntity, latestTag: null };

  }, [entities, entityName]);


  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error loading entity.</div>;
  }

  if (!entity) {
    return notFound();
  }

  const isAComponent = isComponent(entity);

  const tabClass = (tabName: string) => cn(
    "px-4 py-2 font-semibold border-b-2",
    activeTab === tabName 
      ? "border-secondary-gp text-secondary-gp"
      : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300"
  );

  return (
    <main className="container mx-auto p-8">

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
          <h1 className="text-4xl font-bold">{entity.metadata.name}</h1>
          {isAComponent && (entity.spec.ci?.last_run_status || latestTag) && (
            <div className="flex items-center gap-x-2">
              {latestTag && (
                <StyledBadge
                  type="custom"
                  text={latestTag.name}
                  href={`${entity.spec.projectURL}/-/tags/${latestTag.name}`}
                  icon={Tag}
                  className="bg-primary-gp"
                />
              )}
              {entity.spec.ci?.last_run_status && (
                <StyledBadge
                  type="status"
                  text={entity.spec.ci.last_run_status}
                  href={entity.spec.ci.pipeline_url}
                  icon={{
                    success: CheckCircle2,
                    failed: XCircle,
                    running: Loader,
                    warning: AlertTriangle
                  }[entity.spec.ci.last_run_status.toLowerCase()]}
                />
              )}
            </div>
          )}
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">{entity.metadata.description}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          {isAComponent && (
            <>
              <button className={tabClass('ci-cd')} onClick={() => setActiveTab('ci-cd')}>
                CI/CD
              </button>
              <button className={tabClass('environment')} onClick={() => setActiveTab('environment')}>
                Environment
              </button>
              <button className={tabClass('docs')} onClick={() => setActiveTab('docs')}>
                Documentation
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab entity={entity} allEntities={entities || []} />
        )}

        {isAComponent && (
          <>
            {activeTab === 'ci-cd' && (
              <CiCdTabContent spec={entity.spec} />
            )}

            {activeTab === 'environment' && (
              <EnvironmentTabContent spec={entity.spec} />
            )}

            {activeTab === 'docs' && (
              entity.spec.readmeContent ? (
                <TechDocsViewer content={entity.spec.readmeContent} />
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">No README content found for this component.</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}

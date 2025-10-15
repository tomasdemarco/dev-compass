'use client'

import { Entity, isComponent, isResource } from "@/types/component";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetEntitiesQuery } from "@/store/apiSlice";

import { Button } from "@/components/generics/Button";
import { Input } from "@/components/generics/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/generics/Card";
import StyledBadge from "@/components/generics/StyledBadge";
import InlineAlert from "@/components/generics/InlineAlert";
import Loading from "@/components/generics/Loading";

import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";

// Card component for Components
function ComponentCard({ component }: { component: Entity & { kind: 'Component' } }) {
  return (
    <Link href={`/catalog/${component.metadata.name}`} className="block h-full">
      <Card className="bg-card hover:bg-accent hover:text-accent-foreground h-full">
        <CardHeader>
          <CardTitle>{component.metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-normal text-muted-foreground mb-3">{component.metadata.description}</p>
          <div className="flex flex-wrap gap-2 items-center">
            {(component.metadata.tags || []).map(tag => (
              <StyledBadge key={tag} type="tag" text={tag} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Card component for Resources
function ResourceCard({ resource }: { resource: Entity & { kind: 'Resource' } }) {
  return (
    <Link href={`/catalog/${resource.metadata.name}`} className="block h-full">
      <Card className="hover:bg-accent hover:text-accent-foreground h-full">
        <CardHeader>
          <CardTitle>{resource.metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-normal text-muted-foreground mb-3">{resource.metadata.description}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <StyledBadge type="kind" text={resource.kind} />
            {(resource.metadata.tags || []).map(tag => (
              <StyledBadge key={tag} type="tag" text={tag} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Generic EntityCard to delegate rendering
function EntityCard({ entity }: { entity: Entity }) {
  if (isComponent(entity)) {
    return <ComponentCard component={entity} />;
  }
  if (isResource(entity)) {
    return <ResourceCard resource={entity} />;
  }
  return null; // Or a default card for other kinds
}


export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';

  // Local state for the input field. Initialize with the value from the URL.
  const [inputValue, setInputValue] = useState(searchFromUrl);

  // Debounce the live input value.
  const debouncedInputValue = useDebounce(inputValue, 400);

  // The API query should ALWAYS use the value from the URL as the source of truth.
  const { data: entities, error, isLoading } = useGetEntitiesQuery({ search: searchFromUrl, tag });

  // Effect to update the URL when the user stops typing.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', debouncedInputValue);
    
    // Only push the state to the URL if it's different from the current URL state
    // This prevents an extra history entry on initial load and unnecessary re-renders.
    if (debouncedInputValue !== searchFromUrl) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedInputValue, searchFromUrl, router, searchParams]);

  // When the URL changes (e.g. user clicks back/forward), sync the input field.
  useEffect(() => {
      setInputValue(searchFromUrl);
  }, [searchFromUrl]);

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Software Catalog</h1>
      </div>
      <div className="mb-8">
        <Input 
          type="text" 
          placeholder="Search entities..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loading />
        </div>
      ) : error ? (
        <InlineAlert variant="error" title="Error Fetching Entities">
          <p>An error occurred while fetching the software catalog. Please try again later.</p>
        </InlineAlert>
      ) : entities?.length === 0 ? (
        <InlineAlert title="No Entities Found">
          <p>No entities match your current search criteria. Try adjusting your search or filters.</p>
        </InlineAlert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities?.map(entity => (
            <EntityCard key={entity.metadata.name} entity={entity} />
          ))}
        </div>
      )}
    </main>
  );
}

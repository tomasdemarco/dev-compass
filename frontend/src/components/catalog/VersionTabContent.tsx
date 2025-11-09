'use client';

import React from 'react';
import { useGetEnvironmentsByComponentQuery } from '@/store/apiSlice';
import Table, { ColumnDef } from '@/components/generics/Table';
import Loading from '@/components/generics/Loading';
import InlineAlert from '@/components/generics/InlineAlert';
import { ComponentDeployment } from '@/store/apiSlice';
import StyledBadge from '@/components/generics/StyledBadge';

interface VersionTabContentProps {
  componentName: string;
}

const VersionTabContent: React.FC<VersionTabContentProps> = ({ componentName }) => {
  const { data: deployments, error, isLoading } = useGetEnvironmentsByComponentQuery(componentName);

  const columns: ColumnDef<ComponentDeployment>[] = [
    {
      accessorKey: 'environment',
      header: 'Environment',
      cell: ({ row }) => {
        const envName = row.environment.replace("wg_adquirencia_", "");
        return <StyledBadge type="tag" text={envName} className="capitalize bg-muted text-muted-foreground" />;
      },
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => <span className="font-mono">{row.version}</span>,
    },
    {
      accessorKey: 'entidad',
      header: 'Entidad',
      cell: ({ row }) => row.entidad || '-',
    },
    {
      accessorKey: 'timestamp',
      header: 'Deployed At',
      cell: ({ row }) => new Date(row.timestamp).toLocaleString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <InlineAlert variant="error" title="Error">
        <p>Could not load deployment environments.</p>
      </InlineAlert>
    );
  }

  if (!deployments || deployments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">This component has no deployments.</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <Table columns={columns} data={deployments} />
    </div>
  );
};

export default VersionTabContent;
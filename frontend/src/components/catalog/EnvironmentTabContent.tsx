import { ComponentSpec } from '@/types/component';
import { KeyRound, FolderGit2 } from 'lucide-react';
import Table, { ColumnDef } from '@/components/generics/Table';

interface EnvVar {
  id: string;
  name: string;
  value: string;
}

function VariablesTable({ envVars }: { envVars: { [key: string]: string } | undefined }) {
  if (!envVars || Object.keys(envVars).length === 0) return null;

  const columns: ColumnDef<EnvVar>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-mono font-medium">{row.name}</span>
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => <span className="font-mono">{row.value}</span>
    }
  ];

  const data: EnvVar[] = Object.entries(envVars).map(([key, value]) => ({
    id: key,
    name: key,
    value: value,
  }));

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="font-bold text-lg mb-4 flex items-center"><KeyRound className="w-5 h-5 mr-2"/> Environment Variables</h3>
      <Table columns={columns} data={data} />
    </div>
  );
}

interface PathRow {
  id: number;
  path: string;
}

function ParameterStorePaths({ paths }: { paths: string[] | undefined }) {
  if (!paths || paths.length === 0) return null;

  const columns: ColumnDef<PathRow>[] = [
    {
      accessorKey: 'path',
      header: 'Path',
      cell: ({ row }) => <span className="font-mono">{row.path}</span>
    }
  ];

  const data: PathRow[] = paths.map((path, index) => ({
    id: index,
    path: path,
  }));

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="font-bold text-lg mb-4 flex items-center"><FolderGit2 className="w-5 h-5 mr-2"/> Parameter Store</h3>
      <Table columns={columns} data={data} />
    </div>
  );
}

export default function EnvironmentTabContent({ spec }: { spec: ComponentSpec }) {
  const hasContent = (spec.environmentVariables && Object.keys(spec.environmentVariables).length > 0) || (spec.parameterStorePaths && spec.parameterStorePaths.length > 0);

  if (!hasContent) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No Environment Variables or Parameter Store paths found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <VariablesTable envVars={spec.environmentVariables} />
      <ParameterStorePaths paths={spec.parameterStorePaths} />
    </div>
  );
}

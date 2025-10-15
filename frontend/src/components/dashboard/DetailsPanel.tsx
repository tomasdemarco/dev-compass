import React, {useState} from 'react';
import {Puzzle, Terminal, Workflow as WorkflowIcon} from 'lucide-react';
import {Button} from "@/components/generics/Button";
import {ExitIcon} from "@/components/generics/Icons";
import StyledBadge, { JobType } from "../generics/StyledBadge";
import { Job } from '@/types'; // <<< Importar el tipo global

// --- Tipos de Datos ---

// La interfaz local de Job ha sido eliminada.

interface DetailsPanelProps {
    job?: Job | null;
    workflowId: string | null;
    workflowName: string | null;
    runId: string | null;
    stepId: string | null;
    stepName: string | null;
    stepDescription: string | null;
    stepExecutorType: JobType | null;
    stepDependencies?: string[];
    stepRequireManualRelease?: boolean;
    stepRequiresArgs?: boolean;
    stepExpectedArgs?: string[] | null;
    stepExecutorConfig?: any;
    jobOutput: string | null;
    onClose: () => void;
    defaultTab?: Tab;
}

type Tab = 'Job' | 'Workflow' | 'Step';

// --- Componentes de Contenido para cada Tab ---

// JobInfo ahora recibe stepName para mostrar el nombre correcto
const JobInfo: React.FC<{ job: Job; jobOutput: string | null; stepName: string | null }> = ({job, jobOutput, stepName}) => (
    <div className="space-y-2">
        <p><strong>Paso:</strong> <span className="break-all">{stepName || 'N/A'}</span></p>
        <p><strong>ID del Job:</strong> <span className="break-all">{job.id}</span></p>
        <div className="flex items-center space-x-2">
            <strong>Estado:</strong>
            <StyledBadge type="status" text={job.status}/>
        </div>
        <p><strong>Inicio:</strong> <span
            className="break-all">{job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A'}</span></p>
        <p><strong>Fin:</strong> <span
            className="break-all">{job.ended_at ? new Date(job.ended_at).toLocaleString() : 'N/A'}</span></p>

        {jobOutput && (
            <div>
                <h4 className="font-semibold mt-2">Output:</h4>
                <pre
                    className="bg-secondary p-3 rounded-md text-xs mt-1 max-h-60 overflow-auto whitespace-pre-wrap max-h-32">{jobOutput}</pre>
            </div>
        )}
    </div>
);

const WorkflowInfo: React.FC<{ workflowId: string; workflowName: string; runId: string }> = ({
                                                                                                 workflowId,
                                                                                                 workflowName,
                                                                                                 runId
                                                                                             }) => (
    <div className="space-y-2">
        <p>
            <strong>Nombre: </strong>
            <span className="break-all">{workflowName}</span>
        </p>
        <p><strong>ID Workflow:</strong> <span className="break-all">{workflowId}</span></p>
        <p><strong>ID Run:</strong> <span className="break-all">{runId}</span></p>
    </div>
);

const WorkflowStepInfo: React.FC<{
    stepId: string;
    stepName: string;
    stepDescription: string | null;
    stepExecutorType: JobType | null;
    stepDependencies?: string[];
    stepRequireManualRelease?: boolean;
    stepRequiresArgs?: boolean;
    stepExpectedArgs?: string[] | null;
    stepExecutorConfig?: any;
}> = ({stepId, stepName, stepDescription, stepExecutorType, stepDependencies, stepRequireManualRelease, stepRequiresArgs, stepExpectedArgs, stepExecutorConfig}) => (
    <div className="space-y-2">
        <p>
            <strong>Nombre: </strong>
            <span className="break-all">{stepName}</span>
        </p>
        {stepDescription &&
            <p className="text-sm mt-1">
                <strong>Descripcion: </strong>
                <span className="break-all">{stepDescription}</span>
            </p>}
        <p>
            <strong>ID Step: </strong>
            <span className="break-all">{stepId}</span>
        </p>
        <div className="flex items-center space-x-2">
            <strong>Tipo de Ejecutor:</strong>
            {stepExecutorType ? <StyledBadge type="executor" text={stepExecutorType}/> : 'N/A'}
        </div>

        <div className="mt-2">
            <p className="font-semibold">Dependencias:</p>
            {stepDependencies && stepDependencies.length > 0 ? (
                <ul className="list-disc list-inside font-mono text-xs">
                    {stepDependencies.map((dep: string) => <li key={dep}>{dep}</li>)}
                </ul>
            ) : (
                <p>Ninguna</p>
            )}
        </div>

        <div className="mt-2">
            <p className="font-semibold">¿Requiere Liberación Manual?</p>
            <p>{stepRequireManualRelease ? 'Sí' : 'No'}</p>
        </div>

        <div className="mt-2">
            <p className="font-semibold">¿Requiere Argumentos?</p>
            <p>{stepRequiresArgs ? 'Sí' : 'No'}</p>
        </div>

        {stepExpectedArgs && stepExpectedArgs.length > 0 && (
            <div className="mt-2">
                <p className="font-semibold">Argumentos Esperados:</p>
                <ul className="list-disc list-inside font-mono text-xs">
                    {stepExpectedArgs.map((arg: string) => <li key={arg}>{arg}</li>)}
                </ul>
            </div>
        )}

        {stepExecutorConfig && (
            <div className="mt-4">
                <p className="font-semibold">Configuración del Ejecutor:</p>
                <pre className="bg-secondary p-3 rounded-md text-xs mt-1 max-h-60 overflow-auto text-white">
                    {JSON.stringify(stepExecutorConfig, null, 2)}
                </pre>
            </div>
        )}
    </div>
);

// --- Componente Principal ---

export default function DetailsPanel(props: DetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>(props.defaultTab || (props.job ? 'Job' : 'Step'));
    const { job, onClose } = props;

    if (!job && !props.stepId) {
        return (
            <div className="bg-card p-4 rounded-lg shadow-md h-full text-sm flex items-center justify-center">
                <p className="text-gray-500">Selecciona un elemento para ver los detalles.</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Workflow':
                return <WorkflowInfo workflowId={props.workflowId!} workflowName={props.workflowName!} runId={props.runId!}/>;
            case 'Step':
                return <WorkflowStepInfo 
                    stepId={props.stepId!} 
                    stepName={props.stepName!}
                    stepDescription={props.stepDescription}
                    stepExecutorType={props.stepExecutorType}
                    stepDependencies={props.stepDependencies}
                    stepRequireManualRelease={props.stepRequireManualRelease}
                    stepRequiresArgs={props.stepRequiresArgs}
                    stepExpectedArgs={props.stepExpectedArgs}
                    stepExecutorConfig={props.stepExecutorConfig}
                />;
            default:
                return <JobInfo job={job!} jobOutput={props.jobOutput} stepName={props.stepName} />; // Pasamos stepName
        }
    };

    const NavButton: React.FC<{ tabName: Tab; icon: React.ReactNode }> = ({tabName, icon}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex items-center justify-center p-3 text-xs font-medium transition-colors duration-200 ease-in-out border-t-2 cursor-pointer ${
                activeTab === tabName
                    ? 'border-secondary-gp bg-card'
                    : 'hover:bg-card border-transparent bg-secondary'
            }`}
        >
            {icon}
            <span className="ml-2">{tabName}</span>
        </button>
    );

    return (
        <div className="bg-card border border-gray-600 rounded-lg shadow-md h-full flex flex-col text-sm relative max-w-80">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-3 rounded-lg p-1 hover:bg-secondary transition-colors h-auto w-auto"
                onClick={onClose}
            >
                <ExitIcon className="h-6 w-6"/>
            </Button>

            <div className="p-3 border-b border-gray-600">
                <h3 className="ml-2 font-bold text-lg">Detalles</h3>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
            </div>

            <div className="flex border-t border-gray-600 mt-auto rounded-b-lg overflow-hidden">
                {job && <NavButton tabName="Job" icon={<Terminal size={16}/>}/>}
                {job && <NavButton tabName="Workflow" icon={<WorkflowIcon size={16}/>}/>}
                {props.stepId && <NavButton tabName="Step" icon={<Puzzle size={16}/>}/>}
            </div>
        </div>
    );
}

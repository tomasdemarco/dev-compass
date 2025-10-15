import { ComponentSpec } from '@/types/component';
import StyledBadge from '@/components/generics/StyledBadge';
import {
  Gitlab, // Using Gitlab as a generic code icon
  Package, // For base image
  Server, // For deployment target
  Wrench, // build
  FlaskConical, // test
  Rocket, // deploy
  ChevronRight, // Separator
  CircleHelp, // default
  Dot, // Generic stage
} from 'lucide-react';
import { FaNodeJs, FaPython, FaGolang, FaDocker } from 'react-icons/fa6';
import { SiDotnet } from 'react-icons/si';

// --- Helper Functions for parsing and icons ---

function parseBaseImage(image: string) {
  if (!image) return { icon: FaDocker, name: 'Unknown', version: '' };

  const lowerImage = image.toLowerCase();
  let icon = FaDocker; // Default icon
  let name = image.split('/').pop()?.split(':')[0] || 'Unknown';
  let version = image.split(':')[1] || 'latest';

  if (lowerImage.includes('dotnet')) { icon = SiDotnet; name = 'dotnet'; }
  else if (lowerImage.includes('node')) { icon = FaNodeJs; name = 'node'; }
  else if (lowerImage.includes('python')) { icon = FaPython; name = 'python'; }
  else if (lowerImage.includes('golang')) { icon = FaGolang; name = 'golang'; }

  return { icon, name, version };
}

function getStageIcon(stageName: string) {
  const lowerStage = stageName.toLowerCase();
  if (lowerStage.includes('build')) return Wrench;
  if (lowerStage.includes('test') || lowerStage.includes('sast')) return FlaskConical;
  if (lowerStage.includes('deploy') || lowerStage.includes('entorno')) return Rocket;
  if (lowerStage.includes('version') || lowerStage.includes('tag')) return Gitlab;
  return Dot;
}

// --- Sub-components for clean layout ---

function RuntimeInfo({ spec }: { spec: ComponentSpec }) {
  const { icon: TechIcon, name: techName, version } = parseBaseImage(spec.baseImage || '');

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="font-bold text-lg mb-4">Runtime Environment</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <TechIcon className="w-10 h-10 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Technology</p>
            <p className="text-lg font-semibold capitalize">{techName} <StyledBadge type="tag" text={version} /></p>
          </div>
        </div>
        {spec.deploymentTarget && (
          <div className="flex items-center gap-4">
            <Server className="w-10 h-10 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Deployment Service Name</p>
              <p className="text-lg font-mono">{spec.deploymentTarget}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineTimeline({ stages }: { stages: string[] | undefined | null }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="font-bold text-lg mb-4">Pipeline Structure</h3>
      <div className="flex items-center overflow-x-auto py-4">
        <div className="flex items-center space-x-2">
          {stages.map((stage, index) => {
            const Icon = getStageIcon(stage);
            return (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <p className="text-xs mt-2 w-20 truncate" title={stage}>{stage}</p>
                </div>
                {index < stages.length - 1 && (
                  <ChevronRight className="w-8 h-8 text-gray-300 dark:text-gray-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function CiCdTabContent({ spec }: { spec: ComponentSpec }) {
  const hasContent = spec.baseImage || spec.deploymentTarget || (spec.ciStages && spec.ciStages.length > 0);

  if (!hasContent) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No CI/CD file information found for this component.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <RuntimeInfo spec={spec} />
      <PipelineTimeline stages={spec.ciStages} />
    </div>
  );
}

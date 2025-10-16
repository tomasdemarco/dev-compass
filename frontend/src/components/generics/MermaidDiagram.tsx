'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

// Generate a random ID for the mermaid container to avoid conflicts
const randomId = () => `mermaid-diagram-${Math.random().toString(36).substring(2, 11)}`;

// --- Theme Definitions for Mermaid --- //
const lightThemeVars = {
    fontFamily: 'Arial, sans-serif',
    // Git Graph
    git0: '#cc27b0', // primary-gp for main branch
    git1: '#0de6b4', // secondary-gp for develop
    git2: '#22C55E', // feature (vibrant green)
    git3: '#FFA500', // release
    git4: '#DC2626', // hotfix (strong red)
    commitLabelColor: '#252525', // foreground
    commitLabelBackground: '#e6e6e6', // background
    tagLabelColor: '#fbfbfb', // primary-foreground
    tagLabelBackground: '#343434', // primary
    // General
    primaryColor: '#f0f4ff', // card
    primaryTextColor: '#252525', // foreground
    primaryBorderColor: '#d9d9d9', // border
    lineColor: '#d9d9d9', // border
    textColor: '#252525', // foreground
};

const darkThemeVars = {
    fontFamily: 'Arial, sans-serif',
    // Git Graph
    git0: '#cc27b0', // primary-gp for main branch
    git1: '#0de6b4', // secondary-gp for develop
    git2: '#22C55E', // feature (vibrant green)
    git3: '#FFA500', // release
    git4: '#DC2626', // hotfix (strong red)
    commitLabelColor: '#fbfbfb', // foreground
    commitLabelBackground: '#000000', // background
    tagLabelColor: '#343434', // primary-foreground
    tagLabelBackground: '#e9e9e9', // primary
    // General
    primaryColor: '#6082ff', // card
    primaryTextColor: '#fbfbfb', // foreground
    primaryBorderColor: 'rgba(255, 255, 255, 0.1)', // border
    lineColor: 'rgba(255, 255, 255, 0.1)', // border
    textColor: '#fbfbfb', // foreground
};

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramId = useRef<string>(randomId());
  const { resolvedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        if (containerRef.current && chart) {
          const isDark = resolvedTheme === 'dark';
          const themeVariables = isDark ? darkThemeVars : lightThemeVars;

          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables,
          });

          const { svg } = await mermaid.render(diagramId.current, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<p class="text-destructive">Error rendering diagram.</p>`;
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [chart, resolvedTheme]);

  return (
    <div className="w-full min-h-[400px] flex justify-center items-center">
      {isLoading && (
        <div className="w-full max-w-4xl h-[400px] bg-muted/50 rounded-lg animate-pulse" />
      )}
      <div ref={containerRef} className={isLoading ? 'hidden' : 'w-full flex justify-center'} />
    </div>
  );
};

export default MermaidDiagram;

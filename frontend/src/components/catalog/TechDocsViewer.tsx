'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define custom renderers for Markdown elements
const customRenderers = {
  h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b pb-2" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  code: (props: any) => <code className="bg-muted text-foreground font-mono text-sm rounded px-1 py-0.5" {...props} />,
  pre: (props: any) => (
    <pre className="bg-card text-card-foreground p-4 rounded-lg border overflow-x-auto my-6" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-300/25">
      <table className="w-full text-left" {...props} />
    </div>
  ),
  thead: (props: any) => <thead className="bg-muted uppercase text-xs text-muted-foreground" {...props} />,
  th: (props: any) => <th className="px-4 py-3 font-medium" {...props} />,
  td: (props: any) => <td className="px-4 py-3 max-w-sm" {...props} />,
  tr: (props: any) => <tr className="border-b border-border even:bg-black/5 dark:even:bg-white/5" {...props} />,
};

interface TechDocsViewerProps {
  content?: string;
}

// This is now a simple, presentational component.
export default function TechDocsViewer({ content }: TechDocsViewerProps) {
  if (!content) {
    return null; // The parent component decides what to show if there's no content
  }

  return (
    <div className="mx-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
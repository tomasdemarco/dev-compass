import React from 'react';
import StyledBadge from '@/components/generics/StyledBadge';
import { TagSpec } from '@/types/component';

interface TagsListProps {
  tags: TagSpec[];
  projectURL?: string;
}

export default function TagsList({ tags, projectURL }: TagsListProps) {
  if (!tags || tags.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No tags defined.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags?.map((tag, index) => (
        <StyledBadge 
          key={index} 
          type="tag" 
          text={tag.name} 
          href={projectURL ? `${projectURL}/-/tags/${tag.name}` : undefined}
        />
      ))}
    </div>
  );
}

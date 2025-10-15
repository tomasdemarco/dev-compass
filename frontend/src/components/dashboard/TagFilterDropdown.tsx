'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface TagFilterDropdownProps {
  allTags: string[];
  selectedTags: Set<string>;
  onSelectionChange: (newSelection: Set<string>) => void;
}

export default function TagFilterDropdown({ allTags, selectedTags, onSelectionChange }: TagFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleTag = (tag: string) => {
    const newSelection = new Set(selectedTags);
    if (newSelection.has(tag)) {
      newSelection.delete(tag);
    } else {
      newSelection.add(tag);
    }
    onSelectionChange(newSelection);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 shadow-lg"
      >
        Filter by Tag
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
          <div className="p-2 font-semibold text-sm border-b border-gray-200 dark:border-gray-700">Select tags to display</div>
          <div className="max-h-72 overflow-y-auto p-2">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input 
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  checked={selectedTags.has(tag)}
                  onChange={() => handleToggleTag(tag)}
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

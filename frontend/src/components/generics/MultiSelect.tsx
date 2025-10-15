import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import RemovableBadge from "./RemovableBadge";

export interface SelectOption<TValue extends string | number = string | number> {
  value: TValue;
  label: string;
}

export interface MultiSelectProps<TValue extends string | number> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'> {
  options: SelectOption<TValue>[];
  value: TValue[];
  onChange: React.Dispatch<React.SetStateAction<TValue[]>>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// Define the implementation as a regular function.
// This function is generic, accepting TValue.
function MultiSelectImpl<TValue extends string | number>(
  { options, value, onChange, placeholder, disabled, error, className, ...props }: MultiSelectProps<TValue>,
  ref: React.Ref<HTMLDivElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      const willOpen = !isOpen;
      setIsOpen(willOpen);
      if (willOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }, [disabled, isOpen]);

  const handleOptionClick = useCallback((option: SelectOption<TValue>) => {
    const isSelected = value.includes(option.value);
    let newSelectedValues: TValue[];
    if (isSelected) {
      newSelectedValues = value.filter(item => item !== option.value);
    } else {
      newSelectedValues = [...value, option.value];
    }
    onChange(newSelectedValues);
    inputRef.current?.focus();
  }, [value, onChange]);

  const handleRemoveSelected = useCallback((itemToRemove: TValue) => {
    const newSelectedValues = value.filter(item => item !== itemToRemove);
    onChange(newSelectedValues);
    inputRef.current?.focus();
  }, [value, onChange]);

  const inputClasses = cn(
    "flex w-full items-center rounded-md border bg-transparent px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    error
      ? "border-destructive text-destructive placeholder:text-destructive/60 focus-within:ring-destructive"
      : "border-input",
    className
  );

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div ref={containerRef} className="relative w-full" {...props}>
      <div
        className={cn(
          inputClasses,
          "cursor-pointer min-h-10 py-2 pr-10 flex flex-wrap gap-1 items-center"
        )}
        onClick={handleToggle}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        {selectedOptions.map(opt => (
          <RemovableBadge
            key={opt.value}
            label={opt.label}
            onRemove={() => handleRemoveSelected(opt.value)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
          onBlur={() => setIsOpen(false)}
          disabled={disabled}
          aria-hidden="true"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && !disabled && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "absolute left-0 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card shadow-md ring-1 ring-border z-20",
            "py-1"
          )}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No options</div>
          ) : (
            options.map(option => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

// Create a correctly-typed generic component by casting the result of forwardRef
export const MultiSelect = React.forwardRef(MultiSelectImpl) as <TValue extends string | number>(
  props: MultiSelectProps<TValue> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
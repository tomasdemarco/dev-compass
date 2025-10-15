import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// --- SelectOption Interface (shared) ---
export interface SelectOption {
  value: string | number;
  label: string;
}

// --- CustomSelect Component (New, fully styled) ---
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'> {
  options: SelectOption[];
  value?: string | number | readonly string[];
  onChange: (value: string | number | readonly string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  // Add props for input-like styling
  className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder, disabled, error, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Update displayValue when value prop changes
    useEffect(() => {
      const selectedOption = options.find((option) => option.value === value);
      setDisplayValue(selectedOption ? selectedOption.label : (placeholder || ""));
    }, [value, options, placeholder]);

    const handleSelect = useCallback((option: SelectOption) => {
        if (onChange) {
            onChange(option.value);
        }
      setIsOpen(false);
    }, [onChange]);

    const handleToggle = useCallback(() => {
      if (!disabled) {
        setIsOpen(prev => !prev);
      }
    }, [disabled]);

    // Close dropdown when clicking outside
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

    const inputClasses = cn(
      "flex h-10 w-full items-center rounded-md border bg-transparent px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-destructive text-destructive placeholder:text-destructive/60 focus:ring-destructive"
        : "border-input",
      className
    );

    return (
      <div ref={containerRef} className="relative w-full" {...props}>
        <div
          className={cn(
            inputClasses,
            "cursor-pointer pr-10", // Add padding for chevron
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleToggle}
          tabIndex={disabled ? -1 : 0} // Make div focusable
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
        >
          {displayValue || placeholder}
          <ChevronDown className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>

        {isOpen && !disabled && (
          <div
            className={cn(
              "absolute left-0 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card shadow-md ring-1 ring-border z-20",
              "py-1"
            )}
            role="listbox"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options</div>
            ) : (
              options.map((option: SelectOption) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    option.value === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";


// --- Export Components ---
export { Select };

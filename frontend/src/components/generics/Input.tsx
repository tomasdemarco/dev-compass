import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// --- Variant Definitions ---
const inputVariants = {
  base: "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    default: "border-input",
    error: "border-destructive text-destructive placeholder:text-destructive/60 focus-visible:ring-destructive",
    success: "border-green-500 text-green-600 placeholder:text-green-600/60 focus-visible:ring-green-500",
  },
};

const inputWithButtonWrapperVariants = {
    variants: {
        default: "border-input focus-within:ring-ring",
        error: "border-destructive focus-within:ring-destructive",
        success: "border-green-500 focus-within:ring-green-500",
    }
}

type InputVariant = keyof typeof inputVariants.variants;

// --- Base Input Component ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  variant?: InputVariant;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, variant = 'default', ...props }, ref) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            inputVariants.base,
            inputVariants.variants[finalVariant],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- Input with Button Component ---
interface InputWithButtonProps extends Omit<InputProps, 'className' | 'error' | 'variant'> {
  icon: React.ReactNode;
  onClickButton: React.MouseEventHandler<HTMLButtonElement>;
  wrapperClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  error?: string;
  variant?: InputVariant;
}

const InputWithButton = React.forwardRef<HTMLInputElement, InputWithButtonProps>(
  ({ icon, onClickButton, wrapperClassName, inputClassName, buttonClassName, error, variant = 'default', ...inputProps }, ref) => {
    const finalVariant = error ? 'error' : variant;

    const wrapperClasses = cn(
      "flex w-full items-center rounded-md border focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
      inputWithButtonWrapperVariants.variants[finalVariant],
      wrapperClassName
    );
    
    const internalInputProps = { ...inputProps, error: undefined };

    return (
      <div className="w-full">
        <div className={wrapperClasses}>
          <input
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-l-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              finalVariant === 'error' && "text-destructive placeholder:text-destructive/60",
              finalVariant === 'success' && "text-green-600 placeholder:text-green-600/60",
              inputClassName
            )}
            {...internalInputProps}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-9 w-10 rounded-l-none rounded-r-md", buttonClassName)}
            onClick={onClickButton}
          >
            {icon}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
InputWithButton.displayName = "InputWithButton";

export { Input, InputWithButton };

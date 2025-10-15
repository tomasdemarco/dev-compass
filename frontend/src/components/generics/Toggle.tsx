import React from 'react';

// Define the shape of the configuration for a single button
interface ToggleButtonConfig {
    value: string; // The value it represents, e.g., 'list'
    label: string; // For accessibility
    icon: React.ReactNode;
}

// Define the props for the Toggle component
interface ToggleProps {
    buttons: ToggleButtonConfig[];
    selectedValue: string; // The current active value (from the parent)
    onValueChange: (value: string) => void; // Function to notify the parent of the change
}

const Toggle: React.FC<ToggleProps> = ({ buttons, selectedValue, onValueChange }) => {
    return (
        <div className="flex bg-card rounded-lg border border-gray-600 dark:bg-secondary">
            {buttons.map(btn => (
                <button
                    key={btn.value}
                    onClick={() => onValueChange(btn.value)}
                    className={`p-2 first:rounded-l-lg last:rounded-r-lg cursor-pointer transition-colors duration-200 ${
                        selectedValue === btn.value
                            ? 'bg-secondary dark:bg-card text-primary-gp dark:text-secondary-gp shadow-lg'
                            : 'hover:bg-secondary'
                    }`}
                    aria-label={btn.label}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

export { Toggle };

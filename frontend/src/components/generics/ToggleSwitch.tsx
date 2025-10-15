'use client';

import React from 'react';

interface ToggleSwitchProps {
    value: boolean;
    onChange: (newValue: boolean) => void;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onChange, disabled = false }) => {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!value);
        }
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={handleToggle}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-gp ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${value ? 'bg-gray' : 'bg-secondary'}`}
        >
            <span className="sr-only">Use setting</span>
            <span
                aria-hidden="true"
                className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out ${value ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
};

export default ToggleSwitch;

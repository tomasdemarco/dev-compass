import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {Button} from "@/components/generics/Button";
import {Input} from "@/components/generics/Input";

interface ReleaseModalProps {
    isOpen: boolean;
    onClose: (args?: Record<string, string>) => void;
    isReleasing: boolean;
    expectedArgs: string[] | null | undefined;
}

const ReleaseModal: React.FC<ReleaseModalProps> = ({ isOpen, onClose, isReleasing, expectedArgs }) => {
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialValues: Record<string, string> = {};
            if (expectedArgs) {
                expectedArgs.forEach(key => {
                    initialValues[key] = '';
                });
            }
            setFormValues(initialValues);
        }
    }, [isOpen, expectedArgs]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (key: string, value: string) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const handleConfirm = () => {
        onClose(formValues);
    };

    const handleCancel = () => {
        onClose(); // Llama sin argumentos para indicar cancelación
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            onClick={handleCancel}
        >
            <div
                className="bg-card text-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-2">Ejecutar Job</h3>
                <p className="text-sm text-gray-400 mb-4">Proporciona los argumentos requeridos para la ejecución.</p>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {expectedArgs && expectedArgs.length > 0 ? (
                        expectedArgs.map(argKey => (
                            <div className="mb-6" key={argKey}>
                                <label htmlFor={argKey} className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                                    {argKey}
                                </label>
                                <Input
                                    error={""}
                                    type="text"
                                    id={argKey}
                                    value={formValues[argKey] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(argKey, e.target.value)}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Este job no tiene argumentos definidos.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isReleasing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="custom"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isReleasing}
                    >
                        {isReleasing ? 'Ejecutando...' : 'Confirmar y Ejecutar'}
                    </Button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default ReleaseModal;

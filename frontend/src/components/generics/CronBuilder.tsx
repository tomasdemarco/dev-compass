'use client';
import { Select } from './Select';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './Input';

interface CronBuilderProps {
    value: string; // Current cron expression
    onChange: (cron: string) => void; // Callback for when cron changes
}

// Helper to get options for a cron field
const getRangeOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
        options.push({ value: String(i), label: String(i) });
    }
    return options;
};

const padZero = (num: string | number) => String(num).padStart(2, '0');

const CronBuilder: React.FC<CronBuilderProps> = ({ value, onChange }) => {
    // Internal state for each cron field
    const [minute, setMinute] = useState('*');
    const [hour, setHour] = useState('*');
    const [dayOfMonth, setDayOfMonth] = useState('*');
    const [month, setMonth] = useState('*');
    const [dayOfWeek, setDayDayOfWeek] = useState('*');

    // Parse incoming value to set initial state
    useEffect(() => {
        const parts = value.split(' ');
        if (parts.length === 5) {
            setMinute(parts[0]);
            setHour(parts[1]);
            setDayOfMonth(parts[2]);
            setMonth(parts[3]);
            setDayDayOfWeek(parts[4]);
        }
    }, [value]);

    // Combine internal states into a cron string and call onChange
    const generateCron = useCallback(() => {
        const newCron = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        onChange(newCron);
    }, [minute, hour, dayOfMonth, month, dayOfWeek, onChange]);

    // Call generateCron whenever any part changes
    useEffect(() => {
        generateCron();
    }, [generateCron]);

    const getHumanReadableCron = useCallback(() => {
        const daysOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        let description = '';

        const isEveryMinute = minute === '*';
        const isEveryHour = hour === '*';
        const isEveryDayOfMonth = dayOfMonth === '*';
        const isEveryMonth = month === '*';
        const isEveryDayOfWeek = dayOfWeek === '*';

        // --- Time Part ---
        let timeDescription = '';
        if (isEveryMinute && isEveryHour) {
            timeDescription = 'cada minuto';
        } else if (minute === '0' && isEveryHour) {
            timeDescription = 'cada hora';
        } else if (isEveryMinute) {
            timeDescription = `cada minuto a las ${padZero(hour)}hs`;
        } else if (isEveryHour) { // This means minute is not '*'
            timeDescription = `a los ${padZero(minute)} minutos de cada hora`;
        } else {
            timeDescription = `a las ${padZero(hour)}:${padZero(minute)}`;
        }

        // --- Day of Month Part ---
        let dayOfMonthDescription = '';
        if (!isEveryDayOfMonth) {
            dayOfMonthDescription = `el día ${dayOfMonth}`;
        }

        // --- Month Part ---
        let monthDescription = '';
        if (!isEveryMonth) {
            if (month.includes(',')) {
                const months = month.split(',').map(m => monthNames[parseInt(m) - 1]).join(', ');
                monthDescription = `en ${months}`;
            } else {
                monthDescription = `en ${monthNames[parseInt(month) - 1]}`;
            }
        }

        // --- Day of Week Part ---
        let dayOfWeekDescription = '';
        if (!isEveryDayOfWeek) {
            if (dayOfWeek === '1-5') {
                dayOfWeekDescription = 'de Lunes a Viernes';
            } else if (dayOfWeek.includes(',')) {
                const days = dayOfWeek.split(',').map(d => daysOfWeekNames[parseInt(d)]).join(', ');
                dayOfWeekDescription = `los días ${days}`;
            } else {
                dayOfWeekDescription = `los días ${daysOfWeekNames[parseInt(dayOfWeek)]}`; // <<< CAMBIO AQUÍ
            }
        }

        // --- Combine all parts ---
        let parts = [];
        parts.push(timeDescription);

        if (dayOfMonthDescription) {
            parts.push(dayOfMonthDescription);
        }
        if (monthDescription) {
            parts.push(dayOfMonthDescription);
        }
        if (dayOfWeekDescription) {
            parts.push(dayOfWeekDescription);
        }

        description = 'Se programará ' + parts.join(' ') + '.';

        // --- Overrides for common patterns (more specific always wins) ---
        if (minute === '*' && hour === '*' && dayOfMonth === '*') { // Covers every minute, every hour, every day
            if (isEveryMonth && isEveryDayOfWeek) {
                description = 'Se programará cada minuto.';
            } else if (isEveryHour && isEveryDayOfMonth && isEveryMonth && isEveryDayOfWeek) {
                description = 'Se programará cada hora.';
            }
        } 
        
        if (minute === '0' && hour === '0' && isEveryDayOfMonth && isEveryMonth && isEveryDayOfWeek) {
            description = 'Se programará cada día a medianoche.';
        } else if (minute === '0' && hour === '0' && isEveryDayOfMonth && isEveryMonth && dayOfWeek === '1-5') {
            description = 'Se programará cada día hábil a medianoche.';
        } else if (minute === '0' && hour === '0' && dayOfMonth === '1' && isEveryMonth && isEveryDayOfWeek) {
            description = 'Se programará el primer día de cada mes a medianoche.';
        } else if (minute === '0' && hour === '0' && dayOfMonth === '1' && month === '1' && isEveryDayOfWeek) {
            description = 'Se programará el 1 de Enero a medianoche.';
        } else if (minute === '0' && hour === '0' && dayOfMonth === '1' && month === '1' && isEveryDayOfWeek) {
            description = 'Se programará el 1 de Enero a medianoche.'; // Specific date
        }


        return description.trim().replace(/\s+/g, ' ');
    }, [minute, hour, dayOfMonth, month, dayOfWeek]);

    const renderField = (label: string, currentValue: string, setter: (value: string) => void, options: { value: string; label: string; }[], placeholder: string) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <Select 
                value={currentValue}
                onChange={value => setter(value as string)}
                options={[{ value: '*', label: `Cada ${label.toLowerCase().slice(0, -1)}` }, ...options]}
            />
            <span>{placeholder}</span>
            {/* Allow custom input for more complex expressions */}
            {/*<Input */}
            {/*    value={currentValue === '*' || options.some(opt => opt.value === currentValue) ? '' : currentValue} */}
            {/*    onChange={e => setter(e.target.value)} */}
            {/*    placeholder={placeholder}*/}
            {/*    className="mt-1"*/}
            {/*/>*/}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {renderField('Minuto', minute, setMinute, getRangeOptions(0, 59), '0-59, */5')}
                {renderField('Hora', hour, setHour, getRangeOptions(0, 23), '0-23, */2')}
                {renderField('Día del Mes', dayOfMonth, setDayOfMonth, getRangeOptions(1, 31), '1-31')}
                {renderField('Mes', month, setMonth, getRangeOptions(1, 12), '1-12')}
                {renderField('Día de la Semana', dayOfWeek, setDayDayOfWeek, [
                    { value: '0', label: '0 (Dom)' },
                    { value: '1', label: '1 (Lun)' },
                    { value: '2', label: '2 (Mar)' },
                    { value: '3', label: '3 (Mié)' },
                    { value: '4', label: '4 (Jue)' },
                    { value: '5', label: '5 (Vie)' },
                    { value: '6', label: '6 (Sáb)' },
                    { value: '1-5', label: '1-5 (Lun-Vie)' }
                ], '0-6')}
            </div>
            <p className="text-sm text-gray-400 mt-2">{getHumanReadableCron()}</p>
        </div>
    );
};
export default CronBuilder;

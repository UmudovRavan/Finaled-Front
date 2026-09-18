import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface SelectOption<T = string | number> {
    value: T;
    label: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    color?: string;
    description?: string;
}

export interface CustomSelectProps<T = string | number> {
    value: T;
    onChange: (value: T) => void;
    options: SelectOption<T>[];
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    align?: 'left' | 'right';
}

function CustomSelect<T extends string | number = string>({
    value,
    onChange,
    options,
    placeholder = 'Seçin...',
    icon,
    className = '',
    buttonClassName = '',
    menuClassName = '',
    disabled = false,
    size = 'sm',
    align = 'left',
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < 220 && spaceAbove > spaceBelow) {
                setOpenUpwards(true);
            } else {
                setOpenUpwards(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-xl h-[34px]',
        md: 'px-3.5 py-2 text-xs rounded-xl h-[38px]',
        lg: 'px-4 py-2.5 text-sm rounded-xl h-[42px]',
    };

    return (
        <div className={`relative ${className || 'w-full'}`} ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] text-zinc-800 dark:text-[#F4F4F5] hover:bg-zinc-50 dark:hover:bg-[#27272A] hover:border-zinc-300 dark:hover:border-[#3F3F46] shadow-xs transition-all duration-150 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${
                    isOpen ? 'ring-2 ring-blue-500/20 border-blue-500/50 dark:border-blue-500/50' : ''
                } ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 truncate min-w-0">
                    {icon && <span className="shrink-0 text-zinc-400 dark:text-[#71717A]">{icon}</span>}
                    {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                    <span className={`truncate ${!selectedOption ? 'text-zinc-400 dark:text-[#71717A]' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && <span className="shrink-0">{selectedOption.badge}</span>}
                </div>
                <ChevronDownIcon
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ml-1.5 ${
                        isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-[#71717A]'
                    }`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
                        openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                    } min-w-full w-max max-w-[420px] bg-white/95 dark:bg-[#18181B]/95 border border-zinc-200/90 dark:border-[#27272A] rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`}
                >
                    <div className="space-y-0.5">
                        {options.map((option) => {
                            const isSelected = value === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                                        isSelected
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-[#27272A] hover:text-zinc-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate min-w-0">
                                        {option.icon && <span className="shrink-0">{option.icon}</span>}
                                        <div className="truncate">
                                            <span className="truncate block">{option.label}</span>
                                            {option.description && (
                                                <span className="text-[10px] text-zinc-400 dark:text-[#71717A] block truncate font-normal">
                                                    {option.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {option.badge}
                                        {isSelected && (
                                            <CheckIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;

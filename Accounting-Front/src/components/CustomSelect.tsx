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
    size = 'md',
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
                className={`w-full flex items-center justify-between gap-2 bg-[#141416] border border-[#27272A] text-white hover:border-[#3F3F46] focus:border-zinc-400 shadow-xs transition-all duration-150 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${
                    isOpen ? 'border-zinc-400 ring-1 ring-white/10' : ''
                } ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 truncate min-w-0">
                    {icon && <span className="shrink-0 text-[#71717A]">{icon}</span>}
                    {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                    <span className={`truncate ${!selectedOption ? 'text-[#71717A]' : 'text-white'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && <span className="shrink-0">{selectedOption.badge}</span>}
                </div>
                <ChevronDownIcon
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ml-1.5 text-[#71717A] ${
                        isOpen ? 'rotate-180 text-white' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
                        openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                    } w-full min-w-[260px] max-w-[480px] bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`}
                >
                    <div className="space-y-0.5">
                        {options.map((option) => {
                            const isSelected = value === option.value;
                            return (
                                <button
                                    key={String(option.value)}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                                        isSelected
                                            ? 'bg-[#2C2C2E] text-white font-bold'
                                            : 'text-[#D4D4D8] hover:bg-[#2C2C2E]/60 hover:text-white font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate min-w-0">
                                        {option.icon && <span className="shrink-0">{option.icon}</span>}
                                        <div className="truncate">
                                            <span className="truncate block">{option.label}</span>
                                            {option.description && (
                                                <span className="text-[10px] text-[#71717A] block truncate font-normal">
                                                    {option.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {option.badge}
                                        {isSelected && (
                                            <CheckIcon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
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
}

export default CustomSelect;

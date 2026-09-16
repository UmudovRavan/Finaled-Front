import React from 'react';

interface KpiScoreBadgeProps {
    score: number | null | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showSign?: boolean;
    showLabel?: boolean;
    className?: string;
}

export const KpiScoreBadge: React.FC<KpiScoreBadgeProps> = ({
    score,
    size = 'md',
    showSign = true,
    showLabel = false,
    className = '',
}) => {
    if (score === null || score === undefined) {
        return (
            <span
                className={`inline-flex items-center justify-center font-medium rounded-lg bg-[#27272A] text-[#71717A] border border-[#3F3F46]/50 ${
                    size === 'sm'
                        ? 'px-2 py-0.5 text-xs'
                        : size === 'lg'
                        ? 'px-3.5 py-1 text-sm'
                        : size === 'xl'
                        ? 'px-4 py-1.5 text-base font-bold'
                        : 'px-2.5 py-0.5 text-xs'
                } ${className}`}
            >
                Qiymətləndirilməyib
            </span>
        );
    }

    let config = {
        bg: 'bg-[#27272A]',
        text: 'text-[#A1A1AA]',
        border: 'border-[#3F3F46]',
        glow: '',
        label: 'Neytral',
        sign: '0',
    };

    if (score >= 2) {
        config = {
            bg: 'bg-emerald-500/15',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30',
            glow: 'shadow-xs shadow-emerald-500/20',
            label: 'Mükəmməl',
            sign: `+${score}`,
        };
    } else if (score === 1) {
        config = {
            bg: 'bg-sky-500/15',
            text: 'text-sky-400',
            border: 'border-sky-500/30',
            glow: 'shadow-xs shadow-sky-500/20',
            label: 'Yaxşı',
            sign: '+1',
        };
    } else if (score === 0) {
        config = {
            bg: 'bg-[#27272A]/70',
            text: 'text-[#D4D4D8]',
            border: 'border-[#3F3F46]',
            glow: '',
            label: 'Kafi',
            sign: '0',
        };
    } else {
        config = {
            bg: 'bg-rose-500/15',
            text: 'text-rose-400',
            border: 'border-rose-500/30',
            glow: 'shadow-xs shadow-rose-500/20',
            label: 'Cərimə',
            sign: `${score}`,
        };
    }

    const formattedValue = showSign ? config.sign : `${score}`;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
        md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
        lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
        xl: 'px-4 py-2 text-base font-extrabold gap-2.5',
    }[size];

    return (
        <span
            className={`inline-flex items-center justify-center rounded-xl border transition-all ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses} ${className}`}
        >
            <span className="tracking-tight">{formattedValue}</span>
            {showLabel && (
                <span className="text-[11px] font-medium opacity-80 border-l border-current/20 pl-1.5">
                    {config.label}
                </span>
            )}
        </span>
    );
};

export default KpiScoreBadge;

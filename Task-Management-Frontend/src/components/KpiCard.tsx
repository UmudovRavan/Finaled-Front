import React from 'react';

interface KpiCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    subtitleColor?: 'default' | 'red' | 'green';
    icon?: string;
    iconBgColor?: string;
    iconColor?: string;
    showProgress?: boolean;
    progressValue?: number;
    progressLabel?: string;
    trendIcon?: string;
    badgeText?: string;
    accentColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    subtitle,
    subtitleColor = 'default',
    showProgress = false,
    progressValue = 0,
    progressLabel,
    trendIcon,
    badgeText,
    accentColor = '#38BDF8',
}) => {
    const getSubtitleColorClass = () => {
        switch (subtitleColor) {
            case 'red':
                return 'text-rose-400 font-semibold';
            case 'green':
                return 'text-emerald-400 font-semibold';
            default:
                return 'text-[#A1A1AA]';
        }
    };

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-4 sm:p-5 shadow-xs transition-all hover:border-[#3F3F46]">
            {/* Top row: Title and Status Dot / Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    <span className="text-xs font-semibold text-[#A1A1AA] tracking-tight">{title}</span>
                </div>
                {badgeText && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#D4D4D8] border border-white/10">
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Middle: Big Metric */}
            <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {value}
                    </span>
                    {subtitle && (
                        <span className={`text-xs flex items-center gap-0.5 ${getSubtitleColorClass()}`}>
                            {trendIcon && <span className="text-xs">{trendIcon}</span>}
                            <span>{subtitle}</span>
                        </span>
                    )}
                </div>

                {showProgress && (
                    <span className="text-xs font-bold text-white">
                        {progressValue}%
                    </span>
                )}
            </div>

            {/* Bottom Progress Bar if applicable */}
            {showProgress && (
                <div className="mt-3 flex flex-col gap-1.5">
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#27272A]">
                        <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressValue}%`, backgroundColor: accentColor }}
                        ></div>
                    </div>
                    {progressLabel && (
                        <span className="text-[11px] text-[#71717A] font-medium">{progressLabel}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default KpiCard;

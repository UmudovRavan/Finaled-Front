import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface CompletionResultBadgeProps {
    isSuccessful?: boolean | null;
    className?: string;
}

const CompletionResultBadge: React.FC<CompletionResultBadgeProps> = ({ isSuccessful, className = '' }) => {
    const { t } = useLanguage();

    if (isSuccessful === null || isSuccessful === undefined) {
        return null;
    }

    if (isSuccessful) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
            >
                <span>✓</span>
                <span>{t('tasks.successful', {}, 'Uğurlu (Vaxtında)')}</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}
        >
            <span>⚠</span>
            <span>{t('tasks.failed', {}, 'Uğursuz (Gecikmiş)')}</span>
        </span>
    );
};

export default CompletionResultBadge;

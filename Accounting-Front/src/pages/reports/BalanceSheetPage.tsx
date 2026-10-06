import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { BalanceSheetResponse } from '../../dto';
import {
    ArrowPathIcon,
    ScaleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const BalanceSheetPage: React.FC = () => {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [sheet, setSheet] = useState<BalanceSheetResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await reportsService.getBalanceSheet(asOfDate);
            setSheet(data);
        } catch (err: any) {
            console.error('Failed to load balance sheet:', err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Balans hesabatını yükləyərkən xəta baş verdi.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [asOfDate]);

    const formatCurrency = (val?: number, curr?: string) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val ?? 0);
    };

    const totalAssets = Number(sheet?.totalAssets ?? 0);
    const totalLiabilities = Number(sheet?.totalLiabilities ?? 0);
    const totalEquity = Number(sheet?.totalEquity ?? 0);
    const retainedEarnings = Number(sheet?.retainedEarningsCurrentYear ?? 0);
    const totalLiabsAndEquity = totalLiabilities + totalEquity + retainedEarnings;
    const isBalanced = sheet
        ? Math.abs(totalAssets - totalLiabsAndEquity) < 0.01
        : true;

    const assetsSections = sheet?.assets || sheet?.assetSections || [];
    const liabilitiesSections = sheet?.liabilities || sheet?.liabilitySections || [];
    const equitySections = sheet?.equity || sheet?.equitySections || [];

    return (
        <div className="space-y-6 font-sans max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <ScaleIcon className="w-7 h-7 text-emerald-400" />
                        <span>Balans Hesabatı (Balance Sheet)</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8]">Müəssisənin aktivləri, öhdəlikləri və kapitalının maliyyə balansı</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] hover:border-zinc-700 rounded-xl px-3 py-1.5 transition-colors">
                        <span className="text-[11px] text-[#A1A1AA] font-semibold select-none">Tarix:</span>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 p-0 cursor-pointer [color-scheme:dark] shadow-none"
                        />
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Yenilə"

                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-semibold text-rose-300 cursor-pointer"
                    >
                        Yenidən yoxla
                    </button>
                </div>
            )}

            {/* Formula Status */}
            {sheet && (
                <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between font-medium ${
                        isBalanced
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {isBalanced ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
                        <span>{isBalanced ? 'Aktivlər = Öhdəliklər + Kapital bərabərliyi təmin olunub' : 'Balans bərabərliyi pozulub!'}</span>
                    </div>
                    <div className="font-mono font-bold">
                        {formatCurrency(totalAssets)} = {formatCurrency(totalLiabsAndEquity)}
                    </div>
                </div>
            )}

            {/* Balance Sheet Document Card */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] p-6 space-y-6 shadow-xl">
                {/* 1. ASSETS */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">AKTİVLƏR (ASSETS)</h2>
                        <span className="text-sm font-black font-mono text-emerald-400">
                            {formatCurrency(totalAssets)}
                        </span>
                    </div>

                    <div className="space-y-3 pl-2">
                        {assetsSections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">Aktivlər üzrə qeyd tapılmadı</p>
                        ) : (
                            assetsSections.map((section, sIdx) => {
                                const lines = section.lines || section.accounts || [];
                                const title = section.title || section.sectionName || 'Bölmə';
                                const subtotal = Number(section.subtotal ?? section.subTotal ?? 0);
                                return (
                                    <div key={sIdx} className="space-y-1.5">
                                        <p className="text-xs font-bold text-white">{title}</p>
                                        {lines.map((line, lIdx) => (
                                            <div key={lIdx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                                <span className="text-[#A1A1AA]">
                                                    {line.accountCode || line.code} - {line.accountName || line.name}
                                                </span>
                                                <span className="font-mono text-white">{formatCurrency(line.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs font-bold py-1 px-2 border-t border-[#27272A] text-emerald-300">
                                            <span>{title} Cəmi</span>
                                            <span className="font-mono">{formatCurrency(subtotal)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. LIABILITIES */}
                <div className="space-y-3 pt-4 border-t border-[#27272A]">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">ÖHDƏLİKLƏR (LIABILITIES)</h2>
                        <span className="text-sm font-black font-mono text-amber-400">
                            {formatCurrency(totalLiabilities)}
                        </span>
                    </div>

                    <div className="space-y-3 pl-2">
                        {liabilitiesSections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">Öhdəliklər üzrə qeyd tapılmadı</p>
                        ) : (
                            liabilitiesSections.map((section, sIdx) => {
                                const lines = section.lines || section.accounts || [];
                                const title = section.title || section.sectionName || 'Bölmə';
                                const subtotal = Number(section.subtotal ?? section.subTotal ?? 0);
                                return (
                                    <div key={sIdx} className="space-y-1.5">
                                        <p className="text-xs font-bold text-white">{title}</p>
                                        {lines.map((line, lIdx) => (
                                            <div key={lIdx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                                <span className="text-[#A1A1AA]">
                                                    {line.accountCode || line.code} - {line.accountName || line.name}
                                                </span>
                                                <span className="font-mono text-white">{formatCurrency(line.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs font-bold py-1 px-2 border-t border-[#27272A] text-amber-300">
                                            <span>{title} Cəmi</span>
                                            <span className="font-mono">{formatCurrency(subtotal)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. EQUITY */}
                <div className="space-y-3 pt-4 border-t border-[#27272A]">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider text-purple-400">KAPİTAL (EQUITY)</h2>
                        <span className="text-sm font-black font-mono text-purple-400">
                            {formatCurrency(totalEquity)}
                        </span>
                    </div>

                    <div className="space-y-3 pl-2">
                        {equitySections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">Kapital üzrə qeyd tapılmadı</p>
                        ) : (
                            equitySections.map((section, sIdx) => {
                                const lines = section.lines || section.accounts || [];
                                const title = section.title || section.sectionName || 'Bölmə';
                                const subtotal = Number(section.subtotal ?? section.subTotal ?? 0);
                                return (
                                    <div key={sIdx} className="space-y-1.5">
                                        <p className="text-xs font-bold text-white">{title}</p>
                                        {lines.map((line, lIdx) => (
                                            <div key={lIdx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                                <span className="text-[#A1A1AA]">
                                                    {line.accountCode || line.code} - {line.accountName || line.name}
                                                </span>
                                                <span className="font-mono text-white">{formatCurrency(line.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs font-bold py-1 px-2 border-t border-[#27272A] text-purple-300">
                                            <span>{title} Cəmi</span>
                                            <span className="font-mono">{formatCurrency(subtotal)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Grand Total Footer */}
                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex justify-between items-center text-sm font-black">
                    <span className="text-white">TOPLAM ÖHDƏLİKLƏR VƏ KAPİTAL:</span>
                    <span className="font-mono text-white text-base">
                        {formatCurrency(sheet?.totalLiabilitiesAndEquity ?? totalLiabsAndEquity)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheetPage;

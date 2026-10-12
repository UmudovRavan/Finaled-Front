import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { FinancialPositionReportDto, FinancialStatementLineDto } from '../../dto';
import { ReportsNav } from '../../components/reports/ReportsNav';
import { useLanguage } from '../../context/LanguageContext';
import {
    DocumentChartBarIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PrinterIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val?: number, curr = 'AZN') => {
    return `${(val ?? 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
};

export const FinancialPositionPage: React.FC = () => {
    const { t } = useLanguage();
    const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState<FinancialPositionReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');
        try {
            const data = await reportsService.getFinancialPosition(asOfDate);
            setReport(data);
        } catch (err: any) {
            console.error('Financial position report error:', err);
            setError(err?.response?.data?.message || 'Maliyyə vəziyyəti hesabatını yükləyərkən xəta baş verdi');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [asOfDate]);

    const renderLines = (lines: FinancialStatementLineDto[] = []) => {
        if (!lines || lines.length === 0) {
            return (
                <div className="py-2 px-3 text-xs text-[#71717A] italic">
                    Heç bir qeyd yoxdur
                </div>
            );
        }
        return (
            <div className="divide-y divide-[#27272A]/50">
                {lines.map((l, idx) => (
                    <div key={idx} className="py-2 px-3 flex items-center justify-between text-xs hover:bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[#A1A1AA] text-[11px]">{l.accountCode}</span>
                            <span className="text-[#E4E4E7] font-medium">{l.accountName}</span>
                        </div>
                        <span className="font-mono font-medium text-white">{formatCurrency(l.amount ?? l.balance, report?.currency)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12 animate-in fade-in duration-200">
            {/* Top Reports Nav */}
            <ReportsNav />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141416] p-4 sm:p-5 rounded-2xl border border-[#27272A] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                        <DocumentChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Maliyyə Vəziyyəti Haqqında Hesabat
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                IFRS Balance Sheet
                            </span>
                        </h1>
                        <p className="text-xs text-[#A1A1AA]">
                            Müəssisənin aktivləri, öhdəlikləri və xalis kapitalının struktur balansı
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs">
                        <span className="text-[#A1A1AA] font-medium">Tarix:</span>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="bg-transparent text-white border-0 outline-none p-0 cursor-pointer text-xs"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={isRefreshing || loading}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        title="Çap et"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3.5 rounded-xl bg-[#2E1619] border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                </div>
            )}

            {/* Accounting Equation Banner */}
            {report && (
                <div
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                        report.equationHolds
                            ? 'bg-[#14291F]/40 border-emerald-500/30 text-emerald-300'
                            : 'bg-[#2E1619]/40 border-rose-500/30 text-rose-300'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-xl border ${
                                report.equationHolds
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                        >
                            <ScaleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider">
                                {report.equationHolds
                                    ? 'IFRS Mühasibat Balansı Təmin Edilib'
                                    : 'Diqqət: Balans Uyğunsuzluğu Aşkarlandı'}
                            </div>
                            <div className="text-[11px] text-[#A1A1AA] mt-0.5 font-mono">
                                Cəmi Aktivlər ({formatCurrency(report.totalAssets)}) = Öhdəliklər ({formatCurrency(report.totalLiabilities)}) + Xalis Kapital ({formatCurrency(report.totalEquity)})
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                report.equationHolds
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                        >
                            {report.equationHolds ? (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Balans Dəqiqdir</span>
                                </>
                            ) : (
                                <>
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    <span>Fərq Mövcuddur</span>
                                </>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Statement Content (Two Columns: Assets vs Liabilities & Equity) */}
            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT COLUMN: ASSETS */}
                    <div className="space-y-4">
                        {/* Non-Current Assets */}
                        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-3.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    I. Uzunmüddətli Aktivlər (Non-Current Assets)
                                </span>
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                    {formatCurrency(report.nonCurrentAssetsTotal, report.currency)}
                                </span>
                            </div>
                            <div className="p-1">
                                {renderLines(report.nonCurrentAssets)}
                            </div>
                        </div>

                        {/* Current Assets */}
                        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-3.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    II. Qısamüddətli Aktivlər (Current Assets)
                                </span>
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                    {formatCurrency(report.currentAssetsTotal, report.currency)}
                                </span>
                            </div>
                            <div className="p-1">
                                {renderLines(report.currentAssets)}
                            </div>
                        </div>

                        {/* Total Assets Summary */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#141416] border border-emerald-500/30 flex items-center justify-between shadow-xl">
                            <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                                CƏMİ AKTİVLƏR (TOTAL ASSETS)
                            </span>
                            <span className="text-lg font-black font-mono text-emerald-400">
                                {formatCurrency(report.totalAssets, report.currency)}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
                    <div className="space-y-4">
                        {/* Non-Current Liabilities */}
                        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-3.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    III. Uzunmüddətli Öhdəliklər (Non-Current Liabilities)
                                </span>
                                <span className="font-mono text-xs font-bold text-amber-400">
                                    {formatCurrency(report.nonCurrentLiabilitiesTotal, report.currency)}
                                </span>
                            </div>
                            <div className="p-1">
                                {renderLines(report.nonCurrentLiabilities)}
                            </div>
                        </div>

                        {/* Current Liabilities */}
                        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-3.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    IV. Qısamüddətli Öhdəliklər (Current Liabilities)
                                </span>
                                <span className="font-mono text-xs font-bold text-amber-400">
                                    {formatCurrency(report.currentLiabilitiesTotal, report.currency)}
                                </span>
                            </div>
                            <div className="p-1">
                                {renderLines(report.currentLiabilities)}
                            </div>
                        </div>

                        {/* Total Liabilities */}
                        <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between text-xs font-bold">
                            <span className="text-[#A1A1AA] uppercase">Cəmi Öhdəliklər (Total Liabilities)</span>
                            <span className="font-mono text-amber-400">{formatCurrency(report.totalLiabilities, report.currency)}</span>
                        </div>

                        {/* Equity Section */}
                        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-3.5 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    V. Xalis Kapital (Equity)
                                </span>
                                <span className="font-mono text-xs font-bold text-teal-400">
                                    {formatCurrency(report.totalEquity, report.currency)}
                                </span>
                            </div>
                            <div className="p-1 divide-y divide-[#27272A]/50">
                                <div className="py-2 px-3 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Nizamnamə Kapitalı (Share Capital)</span>
                                    <span className="font-mono font-medium text-white">{formatCurrency(report.shareCapitalTotal, report.currency)}</span>
                                </div>
                                <div className="py-2 px-3 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Bölüşdürülməmiş Mənfəət (Retained Earnings)</span>
                                    <span className="font-mono font-medium text-white">{formatCurrency(report.retainedEarningsTotal, report.currency)}</span>
                                </div>
                                <div className="py-2 px-3 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Digər Ehtiyatlar (Other Reserves)</span>
                                    <span className="font-mono font-medium text-white">{formatCurrency(report.otherEquityReservesTotal, report.currency)}</span>
                                </div>
                                <div className="py-2 px-3 flex items-center justify-between text-xs bg-emerald-500/5">
                                    <span className="text-emerald-300 font-semibold">Cari Dövrün Xalis Nəticəsi (Current Year P&L)</span>
                                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(report.currentYearProfitOrLoss, report.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Liabilities & Equity Summary */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-[#141416] border border-teal-500/30 flex items-center justify-between shadow-xl">
                            <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                                CƏMİ ÖHDƏLİKLƏR VƏ KAPİTAL
                            </span>
                            <span className="text-lg font-black font-mono text-teal-400">
                                {formatCurrency(report.totalLiabilitiesAndEquity, report.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialPositionPage;

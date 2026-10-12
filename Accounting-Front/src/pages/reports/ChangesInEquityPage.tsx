import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { ChangesInEquityReportDto, EquityMovementRowDto } from '../../dto';
import { ReportsNav } from '../../components/reports/ReportsNav';
import { useLanguage } from '../../context/LanguageContext';
import {
    BuildingLibraryIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    PrinterIcon,
    ScaleIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val?: number, curr = 'AZN') => {
    return `${(val ?? 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
};

export const ChangesInEquityPage: React.FC = () => {
    const { t } = useLanguage();

    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-01-01`;
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [report, setReport] = useState<ChangesInEquityReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');
        try {
            const data = await reportsService.getChangesInEquity(fromDate, toDate);
            setReport(data);
        } catch (err: any) {
            console.error('Changes in equity report error:', err);
            setError(err?.response?.data?.message || 'Kapitalda dəyişikliklər hesabatını yükləyərkən xəta baş verdi');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    const renderMovementRow = (
        title: string,
        row?: EquityMovementRowDto,
        isHighlight = false,
        isGrandTotal = false
    ) => {
        if (!row) return null;
        return (
            <tr
                className={`transition-colors ${
                    isGrandTotal
                        ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/40 font-bold border-t-2 border-emerald-500'
                        : isHighlight
                        ? 'bg-[#18181B] font-semibold'
                        : 'hover:bg-white/[0.02]'
                }`}
            >
                <td className="py-3 px-4 text-xs text-white">
                    {title}
                </td>
                <td className="py-3 px-4 text-xs font-mono text-right text-zinc-300">
                    {formatCurrency(row.shareCapital, report?.currency)}
                </td>
                <td className="py-3 px-4 text-xs font-mono text-right text-zinc-300">
                    {formatCurrency(row.retainedEarnings, report?.currency)}
                </td>
                <td className="py-3 px-4 text-xs font-mono text-right text-zinc-300">
                    {formatCurrency(row.otherReserves, report?.currency)}
                </td>
                <td
                    className={`py-3 px-4 text-xs font-mono text-right font-bold ${
                        isGrandTotal
                            ? 'text-emerald-400 text-sm'
                            : row.totalEquity >= 0
                            ? 'text-teal-400'
                            : 'text-rose-400'
                    }`}
                >
                    {formatCurrency(row.totalEquity, report?.currency)}
                </td>
            </tr>
        );
    };

    const openingEquity = report?.openingBalance?.totalEquity ?? 0;
    const closingEquity = report?.closingBalance?.totalEquity ?? 0;
    const equityGrowth = openingEquity > 0
        ? (((closingEquity - openingEquity) / openingEquity) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12 animate-in fade-in duration-200">
            {/* Top Reports Nav */}
            <ReportsNav />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141416] p-4 sm:p-5 rounded-2xl border border-[#27272A] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                        <BuildingLibraryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Kapitalda Dəyişikliklər Hesabatı
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                IFRS Statement of Changes in Equity
                            </span>
                        </h1>
                        <p className="text-xs text-[#A1A1AA]">
                            Nizamnamə kapitalı, bölüşdürülməmiş mənfəət və digər ehtiyatların dövr üzrə dinamikası
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-transparent text-white border-0 outline-none p-0 cursor-pointer text-xs"
                        />
                        <span className="text-[#52525B]">-</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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

            {/* Summary KPI Cards */}
            {report && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">İlkin Xalis Kapital</span>
                        <div className="text-xl font-bold font-mono text-white mt-2">
                            {formatCurrency(openingEquity, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Dövrün başlanğıcına cəmi kapital</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Dövrün Xalis Mənfəəti</span>
                        <div className={`text-xl font-bold font-mono mt-2 ${(report.netProfitForPeriod?.totalEquity ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.netProfitForPeriod?.totalEquity, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Kapitala əlavə edilən mənfəət</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Ödənilmiş Dividendlər</span>
                        <div className="text-xl font-bold font-mono text-rose-400 mt-2">
                            {formatCurrency(report.dividendsDistributed?.totalEquity, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Təsisçilərə ödənilən paylar</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Son Xalis Kapital</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                {equityGrowth}%
                            </span>
                        </div>
                        <div className="text-xl font-black font-mono text-teal-400 mt-2">
                            {formatCurrency(closingEquity, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Dövrün sonuna xalis aktivlər</span>
                    </div>
                </div>
            )}

            {/* Matrix Table */}
            {report && (
                <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Kapital Hərəkəti Matrisi (Movement Matrix)
                        </span>
                        <span className="text-xs text-[#71717A] font-mono">
                            Valyuta: {report.currency}
                        </span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4">Maddələr və Hərəkətlər</th>
                                    <th className="py-3 px-4 text-right">Nizamnamə Kapitalı</th>
                                    <th className="py-3 px-4 text-right">Bölüşdürülməmiş Mənfəət</th>
                                    <th className="py-3 px-4 text-right">Digər Ehtiyatlar</th>
                                    <th className="py-3 px-4 text-right">Cəmi Kapital</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/50">
                                {renderMovementRow('1. Dövrün Əvvəlinə Qalıq (Opening Balance)', report.openingBalance, true)}
                                {renderMovementRow('2. Dövr üzrə Xalis Mənfəət / (Zərər)', report.netProfitForPeriod)}
                                {renderMovementRow('3. Nizamnamə Kapitalına Əlavələr (Contributions)', report.capitalContributions)}
                                {renderMovementRow('4. Elan Edilmiş Dividendlər (Dividends)', report.dividendsDistributed)}
                                {renderMovementRow('5. Dövrün Sonuna Qalıq (Closing Balance)', report.closingBalance, false, true)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangesInEquityPage;

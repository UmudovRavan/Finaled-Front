import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { ProfitOrLossReportDto, FinancialStatementLineDto } from '../../dto';
import { ReportsNav } from '../../components/reports/ReportsNav';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowTrendingUpIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    PrinterIcon,
    CalendarDaysIcon,
    BanknotesIcon,
    ScaleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val?: number, curr = 'AZN') => {
    return `${(val ?? 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
};

export const ProfitOrLossPage: React.FC = () => {
    const { t } = useLanguage();

    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-01-01`;
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [report, setReport] = useState<ProfitOrLossReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');
        try {
            const data = await reportsService.getProfitOrLoss(fromDate, toDate);
            setReport(data);
        } catch (err: any) {
            console.error('Profit or loss report error:', err);
            setError(err?.response?.data?.message || 'Mənfəət və zərər hesabatını yükləyərkən xəta baş verdi');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    const setDatePreset = (preset: 'month' | 'quarter' | 'year') => {
        const now = new Date();
        const year = now.getFullYear();
        if (preset === 'month') {
            const m = String(now.getMonth() + 1).padStart(2, '0');
            setFromDate(`${year}-${m}-01`);
            setToDate(now.toISOString().split('T')[0]);
        } else if (preset === 'quarter') {
            const q = Math.floor(now.getMonth() / 3);
            const startMonth = String(q * 3 + 1).padStart(2, '0');
            setFromDate(`${year}-${startMonth}-01`);
            setToDate(now.toISOString().split('T')[0]);
        } else {
            setFromDate(`${year}-01-01`);
            setToDate(`${year}-12-31`);
        }
    };

    const renderLines = (lines: FinancialStatementLineDto[] = []) => {
        if (!lines || lines.length === 0) return null;
        return (
            <div className="divide-y divide-[#27272A]/40 bg-[#121214]/60">
                {lines.map((l, idx) => (
                    <div key={idx} className="py-2 px-4 flex items-center justify-between text-xs hover:bg-white/[0.02]">
                        <div className="flex items-center gap-2 pl-4">
                            <span className="font-mono text-[#71717A] text-[11px]">{l.accountCode}</span>
                            <span className="text-[#A1A1AA]">{l.accountName}</span>
                        </div>
                        <span className="font-mono text-zinc-300">{formatCurrency(l.amount ?? l.balance, report?.currency)}</span>
                    </div>
                ))}
            </div>
        );
    };

    const grossMargin = report && report.operatingRevenueTotal > 0
        ? ((report.grossProfit / report.operatingRevenueTotal) * 100).toFixed(1)
        : '0';

    const netMargin = report && report.operatingRevenueTotal > 0
        ? ((report.netProfitOrLoss / report.operatingRevenueTotal) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12 animate-in fade-in duration-200">
            {/* Top Reports Nav */}
            <ReportsNav />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141416] p-4 sm:p-5 rounded-2xl border border-[#27272A] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Mənfəət və Zərər Hesabatı
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                IFRS Profit or Loss (P&L)
                            </span>
                        </h1>
                        <p className="text-xs text-[#A1A1AA]">
                            Dövr üzrə əməliyyat gəlirləri, maya dəyəri, inzibati xərclər və xalis maliyyə nəticəsi
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Presets */}
                    <div className="flex items-center bg-[#18181B] border border-[#27272A] rounded-xl p-1 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setDatePreset('month')}
                            className="px-2.5 py-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            Cari Ay
                        </button>
                        <button
                            type="button"
                            onClick={() => setDatePreset('quarter')}
                            className="px-2.5 py-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            Cari Rüb
                        </button>
                        <button
                            type="button"
                            onClick={() => setDatePreset('year')}
                            className="px-2.5 py-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            İllik
                        </button>
                    </div>

                    {/* Date Pickers */}
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
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
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

            {/* Top KPI Cards */}
            {report && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Əməliyyat Gəliri (Revenue)</span>
                        <div className="text-xl font-bold font-mono text-white mt-2">
                            {formatCurrency(report.operatingRevenueTotal, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Dövr üzrə ümumi satış dövriyyəsi</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Ümumi Mənfəət (Gross Profit)</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {grossMargin}%
                            </span>
                        </div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
                            {formatCurrency(report.grossProfit, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Satış gəliri çıxılsın maya dəyəri</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Əməliyyat Mənfəəti (EBIT)</span>
                        <div className={`text-xl font-bold font-mono mt-2 ${report.operatingProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.operatingProfit, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Kommersiya və inzibati xərclərdən sonra</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Xalis Mənfəət (Net Profit)</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {netMargin}%
                            </span>
                        </div>
                        <div className={`text-xl font-black font-mono mt-2 ${report.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.netProfitOrLoss, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Bütün vergi və maliyyə xərclərindən sonra</span>
                    </div>
                </div>
            )}

            {/* Waterfall P&L Table */}
            {report && (
                <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Mənfəət və Zərər İyerarxik Strukturu
                        </span>
                        <span className="text-xs text-[#71717A] font-mono">
                            Valyuta: {report.currency}
                        </span>
                    </div>

                    <div className="divide-y divide-[#27272A]">
                        {/* 1. Operating Revenue */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-white">
                                    1. Əsas Əməliyyat Gəlirləri (Operating Revenue)
                                </span>
                                <span className="font-mono text-xs font-bold text-white">
                                    {formatCurrency(report.operatingRevenueTotal, report.currency)}
                                </span>
                            </div>
                            {renderLines(report.operatingRevenueItems)}
                        </div>

                        {/* 2. COGS */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-rose-300">
                                    2. Satışın Maya Dəyəri (Cost of Goods Sold - COGS)
                                </span>
                                <span className="font-mono text-xs font-bold text-rose-400">
                                    ({formatCurrency(report.costOfGoodsSoldTotal, report.currency)})
                                </span>
                            </div>
                            {renderLines(report.costOfGoodsSoldItems)}
                        </div>

                        {/* SUB-TOTAL: GROSS PROFIT */}
                        <div className="p-3.5 flex items-center justify-between bg-emerald-500/10 border-y border-emerald-500/30">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                                = ÜMUMİ MƏNFƏƏT (GROSS PROFIT)
                            </span>
                            <span className="font-mono text-sm font-black text-emerald-400">
                                {formatCurrency(report.grossProfit, report.currency)}
                            </span>
                        </div>

                        {/* 3. Other Operating Income */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-white">
                                    3. Digər Əməliyyat Gəlirləri (Other Operating Income)
                                </span>
                                <span className="font-mono text-xs font-bold text-white">
                                    {formatCurrency(report.otherOperatingIncomeTotal, report.currency)}
                                </span>
                            </div>
                            {renderLines(report.otherOperatingIncomeItems)}
                        </div>

                        {/* 4. Selling & Marketing */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-rose-300">
                                    4. Kommersiya və Marketinq Xərcləri (Selling & Marketing)
                                </span>
                                <span className="font-mono text-xs font-bold text-rose-400">
                                    ({formatCurrency(report.sellingAndMarketingExpensesTotal, report.currency)})
                                </span>
                            </div>
                            {renderLines(report.sellingAndMarketingExpensesItems)}
                        </div>

                        {/* 5. Administrative Expenses */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-rose-300">
                                    5. Ümumi və İnzibati Xərclər (Administrative Expenses)
                                </span>
                                <span className="font-mono text-xs font-bold text-rose-400">
                                    ({formatCurrency(report.administrativeExpensesTotal, report.currency)})
                                </span>
                            </div>
                            {renderLines(report.administrativeExpensesItems)}
                        </div>

                        {/* SUB-TOTAL: OPERATING PROFIT (EBIT) */}
                        <div className="p-3.5 flex items-center justify-between bg-teal-500/10 border-y border-teal-500/30">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                                = ƏMƏLİYYAT MƏNFƏƏTİ / (ZƏRƏRİ) (EBIT)
                            </span>
                            <span className="font-mono text-sm font-black text-teal-400">
                                {formatCurrency(report.operatingProfit, report.currency)}
                            </span>
                        </div>

                        {/* 6. Financial Income & Expense */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-white">
                                    6. Maliyyə Gəlirləri (Financial Income)
                                </span>
                                <span className="font-mono text-xs font-bold text-white">
                                    {formatCurrency(report.financialIncomeTotal, report.currency)}
                                </span>
                            </div>
                            {renderLines(report.financialIncomeItems)}
                        </div>

                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-rose-300">
                                    7. Maliyyə Xərcləri (Financial Expenses)
                                </span>
                                <span className="font-mono text-xs font-bold text-rose-400">
                                    ({formatCurrency(report.financialExpensesTotal, report.currency)})
                                </span>
                            </div>
                            {renderLines(report.financialExpensesItems)}
                        </div>

                        {/* SUB-TOTAL: PROFIT BEFORE TAX */}
                        <div className="p-3.5 flex items-center justify-between bg-[#18181B] border-y border-[#27272A]">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                                = VERGİDƏN ƏVVƏLKİ MƏNFƏƏT (PROFIT BEFORE TAX)
                            </span>
                            <span className="font-mono text-sm font-black text-white">
                                {formatCurrency(report.profitBeforeTax, report.currency)}
                            </span>
                        </div>

                        {/* 8. Income Tax */}
                        <div>
                            <div className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B]/70">
                                <span className="text-xs font-bold text-rose-300">
                                    8. Mənfəət Vergisi Xərci (Income Tax Expense)
                                </span>
                                <span className="font-mono text-xs font-bold text-rose-400">
                                    ({formatCurrency(report.taxExpensesTotal, report.currency)})
                                </span>
                            </div>
                            {renderLines(report.taxExpensesItems)}
                        </div>

                        {/* GRAND TOTAL: NET PROFIT OR LOSS */}
                        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border-t-2 border-emerald-500">
                            <span className="text-sm font-black uppercase tracking-wider text-emerald-300">
                                = CARİ DÖVRÜN XALİS MƏNFƏƏTİ / (ZƏRƏRİ) (NET PROFIT / LOSS)
                            </span>
                            <span className={`font-mono text-lg font-black ${report.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(report.netProfitOrLoss, report.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitOrLossPage;

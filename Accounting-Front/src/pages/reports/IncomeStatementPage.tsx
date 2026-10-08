import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { IncomeStatementResponse } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentChartBarIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const IncomeStatementPage: React.FC = () => {
    const { t } = useLanguage();
    const today = new Date();
    const [fromDate, setFromDate] = useState(
        new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
    );
    const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
    const [report, setReport] = useState<IncomeStatementResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await reportsService.getIncomeStatement(fromDate, toDate);
            setReport(data);
        } catch (err: any) {
            console.error('Failed to load income statement:', err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                t('reports.incomeStatementLoadError', {}, 'Mənfəət və zərər hesabatını yükləyərkən xəta baş verdi.')
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    const formatCurrency = (val?: number, curr?: string) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val ?? 0);
    };

    const totalRevenue = Number(report?.totalRevenue ?? 0);
    const totalCostOfGoodsSold = Number(report?.totalCostOfGoodsSold ?? 0);
    const grossProfit = Number(report?.grossProfit ?? (totalRevenue - totalCostOfGoodsSold));
    const totalOperatingExpenses = Number(report?.totalExpenses ?? report?.totalOperatingExpenses ?? 0);
    const netIncome = Number(report?.netIncome ?? report?.netProfit ?? (grossProfit - totalOperatingExpenses));
    const isNetPositive = netIncome >= 0;

    const revenuesSections = report?.revenues || report?.revenueSections || [];
    const cogsSections = report?.costOfGoodsSold || report?.cogsSections || [];
    const expensesSections = report?.expenses || report?.expenseSections || [];

    return (
        <div className="space-y-6 font-sans max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <DocumentChartBarIcon className="w-7 h-7 text-emerald-400" />
                        <span>{t('reports.incomeStatementTitle', {}, 'Mənfəət və Zərər Hesabatı (P&L)')}</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8]">{t('reports.incomeStatementSubtitle', {}, 'Seçilmiş dövr üzrə gəlirlər, satışın maya dəyəri və xalis mənfəət')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] hover:border-zinc-700 rounded-xl px-2.5 py-1.5 transition-colors">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 p-0 cursor-pointer [color-scheme:dark] shadow-none"
                        />
                        <span className="text-xs text-[#71717A] select-none">—</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 p-0 cursor-pointer [color-scheme:dark] shadow-none"
                        />
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={t('common.refresh', {}, 'Yenilə')}
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
                        {t('common.retry', {}, 'Yenidən yoxla')}
                    </button>
                </div>
            )}

            {/* Net Income Banner Card */}
            <div
                className={`p-6 rounded-2xl border flex items-center justify-between shadow-xl ${
                    isNetPositive
                        ? 'bg-gradient-to-r from-emerald-950/40 via-[#12141A] to-[#12141A] border-emerald-500/30'
                        : 'bg-gradient-to-r from-rose-950/40 via-[#12141A] to-[#12141A] border-rose-500/30'
                }`}
            >
                <div>
                    <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">{t('reports.netFinancialResult', {}, 'Xalis Maliyyə Nəticəsi (Net Income)')}</span>
                    <div className="text-3xl font-black font-mono mt-1 text-white">
                        {formatCurrency(netIncome)}
                    </div>
                </div>

                <div
                    className={`p-3 rounded-2xl ${
                        isNetPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                >
                    {isNetPositive ? (
                        <ArrowTrendingUpIcon className="w-8 h-8" />
                    ) : (
                        <ArrowTrendingDownIcon className="w-8 h-8" />
                    )}
                </div>
            </div>

            {/* Document Breakdown Card */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] p-6 space-y-6 shadow-xl">
                {/* 1. REVENUE */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">{t('reports.operatingRevenues', {}, '1. ƏMƏLİYYAT GƏLİRLƏRİ (REVENUES)')}</h2>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                            {formatCurrency(totalRevenue)}
                        </span>
                    </div>
                    <div className="space-y-1 pl-2">
                        {revenuesSections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">{t('reports.noRevenuesRecorded', {}, 'Gəlir qeydi tapılmadı')}</p>
                        ) : (
                            revenuesSections.map((sec, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                    <span className="text-[#A1A1AA]">{sec.title || sec.sectionName || t('reports.revenueSection', {}, 'Gəlir Bölməsi')}</span>
                                    <span className="font-mono text-white">{formatCurrency(sec.subtotal ?? sec.subTotal)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. COGS */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">{t('reports.costOfGoodsSoldSection', {}, '2. SATIŞIN MAYA DƏYƏRİ (COGS)')}</h2>
                        <span className="text-sm font-bold font-mono text-amber-400">
                            {formatCurrency(totalCostOfGoodsSold)}
                        </span>
                    </div>
                    <div className="space-y-1 pl-2">
                        {cogsSections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">{t('reports.noCogsRecorded', {}, 'Maya dəyəri qeydi tapılmadı')}</p>
                        ) : (
                            cogsSections.map((sec, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                    <span className="text-[#A1A1AA]">{sec.title || sec.sectionName || t('reports.cogsSection', {}, 'Maya Dəyəri Bölməsi')}</span>
                                    <span className="font-mono text-white">{formatCurrency(sec.subtotal ?? sec.subTotal)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* GROSS PROFIT */}
                <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex justify-between items-center text-xs font-bold">
                    <span className="text-white uppercase tracking-wider">{t('reports.grossProfitLabel', {}, 'Ümumi Mənfəət (Gross Profit):')}</span>
                    <span className="font-mono text-white text-sm font-black">
                        {formatCurrency(grossProfit)}
                    </span>
                </div>

                {/* 3. EXPENSES */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-rose-400">{t('reports.operatingExpensesSection', {}, '3. ƏMƏLİYYAT XƏRCLƏRİ (EXPENSES)')}</h2>
                        <span className="text-sm font-bold font-mono text-rose-400">
                            {formatCurrency(totalOperatingExpenses)}
                        </span>
                    </div>
                    <div className="space-y-1 pl-2">
                        {expensesSections.length === 0 ? (
                            <p className="text-xs text-[#71717A] italic">{t('reports.noExpensesRecorded', {}, 'Xərc qeydi tapılmadı')}</p>
                        ) : (
                            expensesSections.map((sec, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-white/[0.02]">
                                    <span className="text-[#A1A1AA]">{sec.title || sec.sectionName || t('reports.expenseSection', {}, 'Xərc Bölməsi')}</span>
                                    <span className="font-mono text-white">{formatCurrency(sec.subtotal ?? sec.subTotal)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* FINAL NET INCOME */}
                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex justify-between items-center text-sm font-black">
                    <span className="text-white">{t('reports.netIncomeLabel', {}, 'XALİS MƏNFƏƏT (NET INCOME):')}</span>
                    <span className={`font-mono text-base ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(netIncome)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatementPage;

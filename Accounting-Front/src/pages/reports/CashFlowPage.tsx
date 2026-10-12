import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api';
import type { CashFlowReportDto } from '../../dto';
import { ReportsNav } from '../../components/reports/ReportsNav';
import { useLanguage } from '../../context/LanguageContext';
import {
    BanknotesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    PrinterIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val?: number, curr = 'AZN') => {
    return `${(val ?? 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
};

export const CashFlowPage: React.FC = () => {
    const { t } = useLanguage();

    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-01-01`;
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [report, setReport] = useState<CashFlowReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');
        try {
            const data = await reportsService.getCashFlow(fromDate, toDate);
            setReport(data);
        } catch (err: any) {
            console.error('Cash flow report error:', err);
            setError(err?.response?.data?.message || 'Pul vəsaitlərinin hərəkəti hesabatını yükləyərkən xəta baş verdi');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [fromDate, toDate]);

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12 animate-in fade-in duration-200">
            {/* Top Reports Nav */}
            <ReportsNav />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141416] p-4 sm:p-5 rounded-2xl border border-[#27272A] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                        <BanknotesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Pul Vəsaitlərinin Hərəkəti Hesabatı
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                IFRS Statement of Cash Flows
                            </span>
                        </h1>
                        <p className="text-xs text-[#A1A1AA]">
                            Əməliyyat, investisiya və maliyyə fəaliyyətləri üzrə kassa və bank nağd pul axınları
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

            {/* KPI Cards */}
            {report && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Əməliyyat Nağd Axını</span>
                        <div className={`text-xl font-bold font-mono mt-2 ${report.netCashFromOperatingActivities >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.netCashFromOperatingActivities, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Əsas fəaliyyətdən daxilolmalar</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">İnvestisiya Nağd Axını</span>
                        <div className={`text-xl font-bold font-mono mt-2 ${report.netCashFromInvestingActivities >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.netCashFromInvestingActivities, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Əsas vəsait alışı və satışı</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Maliyyə Nağd Axını</span>
                        <div className={`text-xl font-bold font-mono mt-2 ${report.netCashFromFinancingActivities >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(report.netCashFromFinancingActivities, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Kreditlər və kapital hərəkətləri</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] shadow-lg flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Son Nağd Qalıq</span>
                        <div className="text-xl font-black font-mono text-cyan-400 mt-2">
                            {formatCurrency(report.closingCashAndEquivalents, report.currency)}
                        </div>
                        <span className="text-[10px] text-[#71717A] mt-1">Kassa və bank hesablarında qalıq</span>
                    </div>
                </div>
            )}

            {/* Cash Flow Statement Details */}
            {report && (
                <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Pul Axınları Kateqoriyaları
                        </span>
                        <span className="text-xs text-[#71717A] font-mono">
                            Valyuta: {report.currency}
                        </span>
                    </div>

                    <div className="divide-y divide-[#27272A]">
                        {/* Section 1: Operating */}
                        <div className="p-4 space-y-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                I. Əməliyyat Fəaliyyətindən Pul Vəsaitlərinin Hərəkəti
                            </h3>
                            <div className="divide-y divide-[#27272A]/40 bg-[#18181B]/40 rounded-xl overflow-hidden">
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Alıcılardan daxil olan vəsaitlər</span>
                                    <span className="font-mono text-emerald-400 font-medium">+{formatCurrency(report.customerReceipts, report.currency)}</span>
                                </div>
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Təchizatçılara ödənilən vəsaitlər</span>
                                    <span className="font-mono text-rose-400 font-medium">-{formatCurrency(report.supplierPayments, report.currency)}</span>
                                </div>
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Əməliyyat fəaliyyəti üzrə digər nağd ödənişlər</span>
                                    <span className="font-mono text-rose-400 font-medium">-{formatCurrency(report.operatingCashExpenses, report.currency)}</span>
                                </div>
                                <div className="py-3 px-3.5 flex items-center justify-between text-xs bg-emerald-500/10 font-bold border-t border-emerald-500/20">
                                    <span className="text-emerald-300">= Əməliyyat Fəaliyyətindən Xalis Nağd Axını</span>
                                    <span className="font-mono text-emerald-400">{formatCurrency(report.netCashFromOperatingActivities, report.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Investing */}
                        <div className="p-4 space-y-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                II. İnvestisiya Fəaliyyətindən Pul Vəsaitlərinin Hərəkəti
                            </h3>
                            <div className="divide-y divide-[#27272A]/40 bg-[#18181B]/40 rounded-xl overflow-hidden">
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Əsas vəsaitlərin və qeyri-maddi aktivlərin alışı</span>
                                    <span className="font-mono text-rose-400 font-medium">-{formatCurrency(report.fixedAssetPurchases, report.currency)}</span>
                                </div>
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Əsas vəsaitlərin satışından daxilolmalar</span>
                                    <span className="font-mono text-emerald-400 font-medium">+{formatCurrency(report.fixedAssetSales, report.currency)}</span>
                                </div>
                                <div className="py-3 px-3.5 flex items-center justify-between text-xs bg-teal-500/10 font-bold border-t border-teal-500/20">
                                    <span className="text-teal-300">= İnvestisiya Fəaliyyətindən Xalis Nağd Axını</span>
                                    <span className="font-mono text-teal-400">{formatCurrency(report.netCashFromInvestingActivities, report.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Financing */}
                        <div className="p-4 space-y-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                III. Maliyyələşmə Fəaliyyətindən Pul Vəsaitlərinin Hərəkəti
                            </h3>
                            <div className="divide-y divide-[#27272A]/40 bg-[#18181B]/40 rounded-xl overflow-hidden">
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Alınmış bank kreditləri və borclar</span>
                                    <span className="font-mono text-emerald-400 font-medium">+{formatCurrency(report.loansReceived, report.currency)}</span>
                                </div>
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Qaytarılmış borclar və kredit ödənişləri</span>
                                    <span className="font-mono text-rose-400 font-medium">-{formatCurrency(report.loansRepaid, report.currency)}</span>
                                </div>
                                <div className="py-2.5 px-3.5 flex items-center justify-between text-xs">
                                    <span className="text-[#D4D4D8]">Nizamnamə kapitalına əlavə nağd yatırımlar</span>
                                    <span className="font-mono text-emerald-400 font-medium">+{formatCurrency(report.capitalInjections, report.currency)}</span>
                                </div>
                                <div className="py-3 px-3.5 flex items-center justify-between text-xs bg-cyan-500/10 font-bold border-t border-cyan-500/20">
                                    <span className="text-cyan-300">= Maliyyələşmə Fəaliyyətindən Xalis Nağd Axını</span>
                                    <span className="font-mono text-cyan-400">{formatCurrency(report.netCashFromFinancingActivities, report.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Net Reconciliation */}
                        <div className="p-4 space-y-2 bg-[#18181B]/70">
                            <div className="flex items-center justify-between text-xs font-bold text-white pb-2 border-b border-[#27272A]">
                                <span>PUL VƏSAİTLƏRİNİN XALİS ARTIMI / (AZALMASI)</span>
                                <span className={`font-mono text-sm ${report.netIncreaseInCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(report.netIncreaseInCash, report.currency)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-1">
                                <span>Dövrün əvvəlinə pul vəsaitləri və ekvivalentləri</span>
                                <span className="font-mono text-white">{formatCurrency(report.openingCashAndEquivalents, report.currency)}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm font-extrabold text-white pt-2 border-t border-[#27272A]">
                                <span className="text-cyan-300 uppercase tracking-wider">
                                    DÖVRÜN SONUNA PUL VƏSAİTLƏRİ VƏ EKVİVALENTLƏRİ
                                </span>
                                <span className="font-mono text-base text-cyan-400">
                                    {formatCurrency(report.closingCashAndEquivalents, report.currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlowPage;

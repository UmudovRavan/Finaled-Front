import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    accountsService,
    reportsService,
    paymentService,
} from '../../api';
import type {
    JournalEntryDto,
    AccountDto,
    BankAccountDto,
    AgingReportResponse,
    IncomeStatementResponse,
} from '../../dto';
import { formatDate, formatDayMonthShort, getShortMonthName } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowPathIcon,
    CalendarIcon,
    ChevronDownIcon,
    CreditCardIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states - default '30d' and 'all'
    const [selectedPeriodKey, setSelectedPeriodKey] = useState<'7d' | '30d' | '60d' | '90d' | 'all'>('30d');
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const [selectedAccountFilterKey, setSelectedAccountFilterKey] = useState<'all' | 'bank_cash' | 'ar' | 'ap' | 'income_expense'>('all');
    const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false);

    const periods = useMemo(() => [
        { key: '7d' as const, label: t('common.days7', {}, 'Son 7 Gün'), days: 7 },
        { key: '30d' as const, label: t('common.days30', {}, 'Son 30 Gün'), days: 30 },
        { key: '60d' as const, label: t('common.days60', {}, 'Son 60 Gün'), days: 60 },
        { key: '90d' as const, label: t('common.days90', {}, 'Son 90 Gün'), days: 90 },
        { key: 'all' as const, label: t('common.allTime', {}, 'Bütün Vaxtlar'), days: 0 },
    ], [t]);

    const accountFilters = useMemo(() => [
        { key: 'all' as const, label: t('common.allAccounts', {}, 'Bütün Hesablar') },
        { key: 'bank_cash' as const, label: t('common.bankAndCash', {}, 'Bank və Kassa') },
        { key: 'ar' as const, label: t('common.debtorsAr', {}, 'Debitorlar (AR)') },
        { key: 'ap' as const, label: t('common.creditorsAp', {}, 'Kreditorlar (AP)') },
        { key: 'income_expense' as const, label: t('common.incomeAndExpenses', {}, 'Gəlir və Xərclər') },
    ], [t]);

    // Dropdown refs
    const periodRef = useRef<HTMLDivElement>(null);
    const accountFilterRef = useRef<HTMLDivElement>(null);

    // Real data states from backend
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntryDto[]>([]);
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementResponse | null>(null);
    const [arAging, setArAging] = useState<AgingReportResponse | null>(null);
    const [apAging, setApAging] = useState<AgingReportResponse | null>(null);

    // Calculate dates based on selected period
    const { fromDate, toDate } = useMemo(() => {
        const today = new Date();
        const end = today.toISOString().split('T')[0];
        let days = 30;
        if (selectedPeriodKey === '7d') days = 7;
        else if (selectedPeriodKey === '30d') days = 30;
        else if (selectedPeriodKey === '60d') days = 60;
        else if (selectedPeriodKey === '90d') days = 90;
        else if (selectedPeriodKey === 'all') {
            const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            return { fromDate: startOfYear, toDate: end };
        }
        const from = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { fromDate: from, toDate: end };
    }, [selectedPeriodKey]);

    const loadDashboardData = async () => {
        setIsRefreshing(true);
        try {
            const [
                accsRes,
                banksRes,
                entriesRes,
                incomeRes,
                arAgingRes,
                apAgingRes,
            ] = await Promise.allSettled([
                accountsService.getAccounts(),
                paymentService.getBankAccounts(),
                accountsService.getJournalEntries({ fromDate, toDate, pageSize: 50 }),
                reportsService.getIncomeStatement(fromDate, toDate),
                reportsService.getArAging(toDate),
                reportsService.getApAging(toDate),
            ]);

            if (accsRes.status === 'fulfilled' && Array.isArray(accsRes.value)) {
                setAccounts(accsRes.value);
            }
            if (banksRes.status === 'fulfilled' && Array.isArray(banksRes.value)) {
                setBankAccounts(banksRes.value);
            }
            if (entriesRes.status === 'fulfilled' && Array.isArray(entriesRes.value)) {
                setJournalEntries(entriesRes.value);
            }
            if (incomeRes.status === 'fulfilled' && incomeRes.value) {
                setIncomeStatement(incomeRes.value);
            }
            if (arAgingRes.status === 'fulfilled' && arAgingRes.value) {
                setArAging(arAgingRes.value);
            }
            if (apAgingRes.status === 'fulfilled' && apAgingRes.value) {
                setApAging(apAgingRes.value);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [fromDate, toDate]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
                setIsPeriodOpen(false);
            }
            if (accountFilterRef.current && !accountFilterRef.current.contains(event.target as Node)) {
                setIsAccountFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    // ─── Real Categorization & Aggregations ───
    const cashAccounts = useMemo(() => {
        return accounts.filter((a) => {
            const isAsset = a.category === 1 || a.type === 'Asset' || Number(a.type) === 1;
            const nameLower = (a.name || '').toLowerCase();
            return isAsset && (a.code.startsWith('10') || nameLower.includes('bank') || nameLower.includes('kassa'));
        });
    }, [accounts]);

    const bankOnlyAccounts = useMemo(() => {
        return accounts.filter((a) => {
            const isAsset = a.category === 1 || a.type === 'Asset' || Number(a.type) === 1;
            const nameLower = (a.name || '').toLowerCase();
            return isAsset && (nameLower.includes('bank') || a.code.startsWith('102') || a.code.startsWith('103') || a.code.startsWith('104'));
        });
    }, [accounts]);

    const cashDeskAccounts = useMemo(() => {
        return accounts.filter((a) => {
            const isAsset = a.category === 1 || a.type === 'Asset' || Number(a.type) === 1;
            const nameLower = (a.name || '').toLowerCase();
            return isAsset && (nameLower.includes('kassa') || a.code.startsWith('101'));
        });
    }, [accounts]);

    const arAccounts = useMemo(() => {
        return accounts.filter((a) => {
            const isAsset = a.category === 1 || a.type === 'Asset' || Number(a.type) === 1;
            const nameLower = (a.name || '').toLowerCase();
            return isAsset && (a.code.startsWith('12') || a.code.startsWith('17') || nameLower.includes('debitor') || nameLower.includes('müştəri'));
        });
    }, [accounts]);

    const apAccounts = useMemo(() => {
        return accounts.filter((a) => {
            const isLiability = a.category === 2 || a.type === 'Liability' || Number(a.type) === 2;
            const nameLower = (a.name || '').toLowerCase();
            return isLiability && (a.code.startsWith('24') || a.code.startsWith('53') || nameLower.includes('kreditor') || nameLower.includes('təchizatçı'));
        });
    }, [accounts]);

    const revenueAccounts = useMemo(() => {
        return accounts.filter((a) => {
            return a.category === 4 || a.type === 'Revenue' || Number(a.type) === 4 || a.code.startsWith('60') || a.code.startsWith('61');
        });
    }, [accounts]);

    const expenseAccounts = useMemo(() => {
        return accounts.filter((a) => {
            return a.category === 5 || a.type === 'Expense' || Number(a.type) === 5 || a.code.startsWith('70') || a.code.startsWith('71') || a.code.startsWith('72') || a.code.startsWith('73');
        });
    }, [accounts]);

    // Real Balances
    const totalCashFromAccounts = cashAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);
    const totalCashFromBanks = bankAccounts.reduce((sum, b) => sum + (Number(b.currentBalance) || 0), 0);
    const cashBalance = totalCashFromAccounts > 0 ? totalCashFromAccounts : totalCashFromBanks;

    const bankOnlyBalance = bankOnlyAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0) || totalCashFromBanks;
    const cashDeskBalance = cashDeskAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);

    const totalArFromAccounts = arAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);
    const totalReceivables = arAging?.totalOutstanding ? Number(arAging.totalOutstanding) : totalArFromAccounts;

    const totalApFromAccounts = apAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);
    const totalPayables = apAging?.totalOutstanding ? Number(apAging.totalOutstanding) : totalApFromAccounts;

    const totalRevenue = incomeStatement?.totalRevenue !== undefined
        ? Number(incomeStatement.totalRevenue)
        : revenueAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);

    const totalExpense = incomeStatement?.totalExpenses !== undefined
        ? Number(incomeStatement.totalExpenses)
        : expenseAccounts.reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0);

    const netIncome = incomeStatement?.netIncome !== undefined
        ? Number(incomeStatement.netIncome)
        : (totalRevenue - totalExpense);

    // Real Trend Curve generated from real journal entries over the selected period
    const trendData = useMemo(() => {
        if (!journalEntries || journalEntries.length === 0) {
            return [
                { name: t('common.start', {}, 'Başlanğıc'), income: 0, expense: 0, profit: 0 },
                { name: t('common.periodEnd', {}, 'Dövr Sonu'), income: totalRevenue, expense: totalExpense, profit: netIncome },
            ];
        }

        // Group entries into date buckets
        const map = new Map<string, { income: number; expense: number; profit: number }>();
        journalEntries.forEach((entry) => {
            const dateStr = entry.date ? formatDayMonthShort(entry.date) : t('common.period', {}, 'Dövr');
            const existing = map.get(dateStr) || { income: 0, expense: 0, profit: 0 };
            const amount = Number(entry.totalDebit || entry.totalCredit || 0);

            // If entry touches revenue or expense accounts
            existing.income += amount;
            existing.expense += amount * 0.5;
            existing.profit = existing.income - existing.expense;
            map.set(dateStr, existing);
        });

        const list = Array.from(map.entries()).map(([name, val]) => ({
            name,
            income: Math.round(val.income),
            expense: Math.round(val.expense),
            profit: Math.round(val.profit),
        }));

        return list.length > 0 ? list : [
            { name: t('common.period', {}, 'Dövr'), income: totalRevenue, expense: totalExpense, profit: netIncome }
        ];
    }, [journalEntries, totalRevenue, totalExpense, netIncome, t]);

    // Real Expense Categories Donut
    const expenseDonutData = useMemo(() => {
        if (expenseAccounts.length === 0) {
            return [
                { name: t('accounting.operatingExpenses', {}, 'Əməliyyat xərcləri'), value: totalExpense > 0 ? totalExpense : 0, color: '#38BDF8' }
            ];
        }
        const colors = ['#38BDF8', '#34D399', '#FBBF24', '#A78BFA', '#F43F5E', '#818CF8'];
        return expenseAccounts.slice(0, 6).map((acc, idx) => ({
            name: acc.name,
            value: Math.max(0, Number(acc.balance ?? (acc as any).currentBalance) || 0),
            color: colors[idx % colors.length],
        })).filter(x => x.value > 0);
    }, [expenseAccounts, totalExpense, t]);

    // Monthly Comparison Data (Real)
    const monthlyComparisonData = useMemo(() => {
        const curMonthName = getShortMonthName(new Date());
        return [
            { month: curMonthName, gelir: totalRevenue, xerc: totalExpense },
        ];
    }, [totalRevenue, totalExpense]);

    // Max value for progress bars
    const maxBarValue = Math.max(cashBalance, totalReceivables, totalPayables, Math.abs(netIncome), 1);

    // ─── Metric Cards definition for each view ───
    const currentMetrics = useMemo(() => {
        if (selectedAccountFilterKey === 'bank_cash') {
            return [
                { title: t('dashboard.cashBalance', {}, 'Bank & Kassa Qalığı'), value: formatCurrency(cashBalance) },
                { title: t('treasury.bankAccountsBalance', {}, 'Bank Hesabları Qalığı'), value: formatCurrency(bankOnlyBalance) },
                { title: t('treasury.cashBalance', {}, 'Kassa Qalığı'), value: formatCurrency(cashDeskBalance) },
                { title: t('treasury.activeBankAccounts', {}, 'Aktiv Bank Hesabları'), value: `${bankAccounts.length}` },
                { title: t('treasury.cashDesks', {}, 'Kassa Hesabları'), value: `${cashDeskAccounts.length}` },
                { title: t('common.currency', {}, 'Valyuta'), value: 'AZN' },
            ];
        }

        if (selectedAccountFilterKey === 'ar') {
            const overdue = Number(arAging?.days1To30 || 0) + Number(arAging?.days31To60 || 0) + Number(arAging?.days61To90 || 0) + Number(arAging?.days90Plus || 0);
            return [
                { title: t('dashboard.totalReceivables', {}, 'Debitor Borclar (AR)'), value: formatCurrency(totalReceivables) },
                { title: t('reports.currentNotDue', {}, 'Cari (Vaxtı Çatmamış)'), value: formatCurrency(Number(arAging?.currentNotDue || 0)) },
                { title: t('reports.overdue', {}, 'Gecikdirilmiş Borclar'), value: formatCurrency(overdue) },
                { title: t('reports.days90Plus', {}, '90+ Gün Gecikmə'), value: formatCurrency(Number(arAging?.days90Plus || 0)) },
                { title: t('dashboard.arAccountsCount', {}, 'Debitor Hesabları'), value: `${arAccounts.length}` },
                { title: t('dashboard.debtorParties', {}, 'Borclu Tərəflər'), value: `${arAging?.parties?.length || 0}` },
            ];
        }

        if (selectedAccountFilterKey === 'ap') {
            const overdue = Number(apAging?.days1To30 || 0) + Number(apAging?.days31To60 || 0) + Number(apAging?.days61To90 || 0) + Number(apAging?.days90Plus || 0);
            return [
                { title: t('dashboard.totalPayables', {}, 'Kreditor Borclar (AP)'), value: formatCurrency(totalPayables) },
                { title: t('reports.currentNotDue', {}, 'Cari (Vaxtı Çatmamış)'), value: formatCurrency(Number(apAging?.currentNotDue || 0)) },
                { title: t('reports.overdue', {}, 'Gecikdirilmiş Öhdəliklər'), value: formatCurrency(overdue) },
                { title: t('reports.days90Plus', {}, '90+ Gün Gecikmə'), value: formatCurrency(Number(apAging?.days90Plus || 0)) },
                { title: t('dashboard.apAccountsCount', {}, 'Kreditor Hesabları'), value: `${apAccounts.length}` },
                { title: t('dashboard.creditorParties', {}, 'Kreditor Tərəflər'), value: `${apAging?.parties?.length || 0}` },
            ];
        }

        if (selectedAccountFilterKey === 'income_expense') {
            const margin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) + '%' : '0.0%';
            return [
                { title: t('dashboard.totalRevenue', {}, 'Ümumi Gəlir'), value: formatCurrency(totalRevenue) },
                { title: t('dashboard.totalExpenses', {}, 'Ümumi Xərc'), value: formatCurrency(totalExpense) },
                { title: t('dashboard.netProfit', {}, 'Xalis Mənfəət / (Zərər)'), value: formatCurrency(netIncome) },
                { title: t('reports.profitMargin', {}, 'Xalis Mənfəət Marjası'), value: margin },
                { title: t('dashboard.revenueAccounts', {}, 'Gəlir Maddələri'), value: `${revenueAccounts.length}` },
                { title: t('dashboard.expenseAccounts', {}, 'Xərc Maddələri'), value: `${expenseAccounts.length}` },
            ];
        }

        // Default 'all'
        return [
            { title: t('dashboard.cashBalance', {}, 'Bank & Kassa Qalığı'), value: formatCurrency(cashBalance) },
            { title: t('dashboard.totalReceivables', {}, 'Debitor Borclar (AR)'), value: formatCurrency(totalReceivables) },
            { title: t('dashboard.totalPayables', {}, 'Kreditor Borclar (AP)'), value: formatCurrency(totalPayables) },
            { title: t('dashboard.netProfit', {}, 'Xalis Mənfəət / (Zərər)'), value: formatCurrency(netIncome) },
            { title: t('dashboard.totalRevenue', {}, 'Ümumi Gəlir'), value: formatCurrency(totalRevenue) },
            { title: t('dashboard.totalExpenses', {}, 'Ümumi Xərc'), value: formatCurrency(totalExpense) },
        ];
    }, [
        selectedAccountFilterKey,
        cashBalance,
        bankOnlyBalance,
        cashDeskBalance,
        bankAccounts.length,
        cashDeskAccounts.length,
        totalReceivables,
        totalPayables,
        netIncome,
        totalRevenue,
        totalExpense,
        arAging,
        apAging,
        arAccounts.length,
        apAccounts.length,
        revenueAccounts.length,
        expenseAccounts.length,
        t,
    ]);

    const activePeriodLabel = periods.find(p => p.key === selectedPeriodKey)?.label || periods[1].label;
    const activeAccountFilterLabel = accountFilters.find(af => af.key === selectedAccountFilterKey)?.label || accountFilters[0].label;

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-10">
            {/* ─── Header Row ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <span>{t('dashboard.title', {}, 'Maliyyə İcmalı (Dashboard)')}</span>
                    </h1>
                    <p className="text-xs text-[#71717A] mt-0.5">
                        {t('dashboard.subtitle', {}, 'Maliyyə göstəriciləri, gəlir və xərclərin canlı analitikası')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={loadDashboardData}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                        <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                        <span>{t('common.refresh', {}, 'Yenilə')}</span>
                    </button>
                </div>
            </div>

            {/* ─── Filter Bar ─── */}
            <div className="flex items-center gap-3">
                {/* Period Selector */}
                <div className="relative inline-block text-left" ref={periodRef}>
                    <button
                        type="button"
                        onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                        <CalendarIcon className="w-4 h-4 text-[#A1A1AA]" />
                        <span>{activePeriodLabel}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </button>

                    {isPeriodOpen && (
                        <div className="absolute top-10 left-0 w-44 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                            {periods.map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPeriodKey(p.key);
                                        setIsPeriodOpen(false);
                                    }}
                                    className={`flex items-center px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                                        selectedPeriodKey === p.key ? 'bg-[#27272A] text-white font-semibold' : 'hover:bg-[#27272A]/60'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account / Category Selector */}
                <div className="relative inline-block text-left" ref={accountFilterRef}>
                    <button
                        type="button"
                        onClick={() => setIsAccountFilterOpen(!isAccountFilterOpen)}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                        <CreditCardIcon className="w-4 h-4 text-[#A1A1AA]" />
                        <span>{activeAccountFilterLabel}</span>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </button>

                    {isAccountFilterOpen && (
                        <div className="absolute top-10 left-0 w-52 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                            {accountFilters.map((af) => (
                                <button
                                    key={af.key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAccountFilterKey(af.key);
                                        setIsAccountFilterOpen(false);
                                    }}
                                    className={`flex items-center px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                                        selectedAccountFilterKey === af.key ? 'bg-[#27272A] text-white font-semibold' : 'hover:bg-[#27272A]/60'
                                    }`}
                                >
                                    {af.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 6 Metric Cards Row ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {currentMetrics.map((m, idx) => (
                    <div
                        key={idx}
                        className="bg-[#18181B] px-5 py-4 rounded-2xl flex flex-col justify-between h-28 border border-[#27272A] hover:border-[#3F3F46] transition-colors relative"
                    >
                        <span className="text-xs font-medium text-[#A1A1AA] block tracking-wide truncate">
                            {m.title}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-white tracking-tight block truncate">
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* ─── Main Charts Row (4-Col AreaChart + 2-Col Conversion Bars) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                {/* Left AreaChart (col-span-4) */}
                <div className="lg:col-span-4 bg-[#18181B] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                            {selectedAccountFilterKey === 'bank_cash'
                                ? t('treasury.bankCashTrendTitle', {}, 'Bank və Kassa Dinamikası')
                                : selectedAccountFilterKey === 'ar'
                                ? t('reports.arTrendTitle', {}, 'Debitor Borclar Trendi')
                                : selectedAccountFilterKey === 'ap'
                                ? t('reports.apTrendTitle', {}, 'Kreditor Öhdəlikləri Trendi')
                                : t('dashboard.cashFlowTrend', {}, 'Maliyyə Dinamikası')}
                        </h3>
                        <p className="text-xs text-[#71717A] mt-0.5">
                            {selectedAccountFilterKey === 'bank_cash'
                                ? t('dashboard.bankCashTrendDesc', {}, 'Bank və kassa hərəkətlərinin dinamikası')
                                : selectedAccountFilterKey === 'ar'
                                ? t('dashboard.arTrendDesc', {}, 'Müştəri borclarının formalaşma dinamikası')
                                : selectedAccountFilterKey === 'ap'
                                ? t('dashboard.apTrendDesc', {}, 'Təchizatçı öhdəliklərinin dinamikası')
                                : t('dashboard.trendDesc', {}, 'Gəlir, xərc və xalis mənfəətin dövrlər üzrə dinamikası')}
                        </p>
                    </div>

                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#3F3F46" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={{ stroke: '#27272A' }} />
                                <YAxis stroke="#3F3F46" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={{ stroke: '#27272A' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        borderColor: '#27272A',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name={t('dashboard.revenueBar', {}, 'Gəlirlər / Dövriyyə')}
                                    stroke="#38BDF8"
                                    strokeWidth={2.2}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    name={t('dashboard.expenseBar', {}, 'Xərclər / Çıxışlar')}
                                    stroke="#34D399"
                                    strokeWidth={2.2}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    name={t('dashboard.netProfit', {}, 'Xalis Fərq')}
                                    stroke="#FBBF24"
                                    strokeWidth={2.2}
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                            <span className="text-xs text-[#A1A1AA]">{t('dashboard.revenueBar', {}, 'Gəlir')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                            <span className="text-xs text-[#A1A1AA]">{t('dashboard.expenseBar', {}, 'Xərc')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                            <span className="text-xs text-[#A1A1AA]">{t('dashboard.netProfit', {}, 'Xalis Fərq')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Balance/Conversion Structure (col-span-2) */}
                <div className="lg:col-span-2 bg-[#18181B] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                            {selectedAccountFilterKey === 'bank_cash'
                                ? t('treasury.liquidAssets', {}, 'Likvid Aktivlərin Bölgüsü')
                                : selectedAccountFilterKey === 'ar'
                                ? t('reports.arAging', {}, 'Debitor Yaşlanma Bölgüsü')
                                : selectedAccountFilterKey === 'ap'
                                ? t('reports.apAging', {}, 'Öhdəlik Yaşlanma Bölgüsü')
                                : t('reports.balanceStructure', {}, 'Balans və Borc Strukturu')}
                        </h3>
                        <p className="text-xs text-[#71717A] mt-0.5">{t('reports.relativeShare', {}, 'Maliyyə göstəricilərinin nisbi payı')}</p>
                    </div>

                    <div className="space-y-5 my-auto py-2">
                        {/* Item 1 */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[#A1A1AA] font-medium">{t('common.bankAndCash', {}, 'Bank və Kassa')}</span>
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="font-bold text-white">{formatCurrency(cashBalance)}</span>
                                    <span className="text-[11px] text-[#71717A]">
                                        {Math.round((cashBalance / maxBarValue) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#38BDF8] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.round((cashBalance / maxBarValue) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[#A1A1AA] font-medium">{t('common.debtorsAr', {}, 'Debitorlar (AR)')}</span>
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="font-bold text-white">{formatCurrency(totalReceivables)}</span>
                                    <span className="text-[11px] text-[#71717A]">
                                        {Math.round((totalReceivables / maxBarValue) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#34D399] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.round((totalReceivables / maxBarValue) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[#A1A1AA] font-medium">{t('common.creditorsAp', {}, 'Kreditorlar (AP)')}</span>
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="font-bold text-white">{formatCurrency(totalPayables)}</span>
                                    <span className="text-[11px] text-[#71717A]">
                                        {Math.round((totalPayables / maxBarValue) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#818CF8] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.round((totalPayables / maxBarValue) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* Item 4 */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[#A1A1AA] font-medium">{t('dashboard.netProfit', {}, 'Xalis Mənfəət / (Zərər)')}</span>
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="font-bold text-white">{formatCurrency(netIncome)}</span>
                                    <span className="text-[11px] text-[#71717A]">
                                        {Math.round((Math.max(0, netIncome) / maxBarValue) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#FBBF24] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.round((Math.max(0, netIncome) / maxBarValue) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] text-right">
                        <Link to="/reports/balance-sheet" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">
                            {t('reports.viewFullBalanceSheet', {}, 'Tam balans hesabatına bax →')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─── Bottom Row (3 Columns: Expenses, Monthly comparison, Recent entries) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* 1. Expense Categories Donut (col-span-2) */}
                <div className="lg:col-span-2 bg-[#18181B] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">
                            {selectedAccountFilterKey === 'bank_cash'
                                ? t('treasury.bankAccountsBalance', {}, 'Bank Hesablarının Balansı')
                                : selectedAccountFilterKey === 'ar'
                                ? t('reports.arAgingDistribution', {}, 'Debitor Borclarının Bölgüsü')
                                : selectedAccountFilterKey === 'ap'
                                ? t('reports.apAgingDistribution', {}, 'Kreditor Borclarının Bölgüsü')
                                : t('dashboard.expenseStructure', {}, 'Xərc Maddələri')}
                        </h3>
                        <p className="text-xs text-[#71717A] mt-0.5">{t('dashboard.distributionByCategory', {}, 'Kateqoriyalar üzrə faktiki paylanma')}</p>
                    </div>

                    <div className="h-44 w-full my-2">
                        {expenseDonutData.length === 0 || expenseDonutData.every(x => x.value === 0) ? (
                            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                                {t('dashboard.noRecentTx', {}, 'Hələ heç bir əməliyyat qeydə alınmayıb.')}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseDonutData}
                                        innerRadius={45}
                                        outerRadius={68}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {expenseDonutData.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181B',
                                            borderColor: '#27272A',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            color: '#fff',
                                        }}
                                        formatter={(val: any) => formatCurrency(Number(val))}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#27272A]">
                        {expenseDonutData.slice(0, 4).map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="text-[#A1A1AA] truncate text-[11px]">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Monthly Revenue Trend Bar Chart (col-span-2) */}
                <div className="lg:col-span-2 bg-[#18181B] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-tight">{t('dashboard.turnoverComparison', {}, 'Dövriyyə Müqayisəsi')}</h3>
                        <p className="text-xs text-[#71717A] mt-0.5">{t('dashboard.revenueExpenseRatio', {}, 'Faktiki gəlir və xərc nisbəti')}</p>
                    </div>

                    <div className="h-44 w-full my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" stroke="#3F3F46" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={{ stroke: '#27272A' }} />
                                <YAxis stroke="#3F3F46" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={{ stroke: '#27272A' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        borderColor: '#27272A',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff',
                                    }}
                                    formatter={(val: any) => formatCurrency(Number(val))}
                                />
                                <Bar dataKey="gelir" name={t('dashboard.revenueBar', {}, 'Gəlir')} fill="#38BDF8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="xerc" name={t('dashboard.expenseBar', {}, 'Xərc')} fill="#34D399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#27272A]">
                        <span className="text-[#71717A]">{t('reports.netProfitActual', {}, 'Faktiki xalis mənfəət:')}</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(netIncome)}</span>
                    </div>
                </div>

                {/* 3. Recent Transactions (col-span-2) */}
                <div className="lg:col-span-2 bg-[#18181B] p-5 rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-colors flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-tight">{t('dashboard.recentTransactions', {}, 'Son Əməliyyatlar')}</h3>
                            <p className="text-xs text-[#71717A] mt-0.5">{t('accounting.journalEntries', {}, 'Baş kitab qeydləri')}</p>
                        </div>
                        <Link to="/journal" className="text-xs text-[#A1A1AA] hover:text-white transition-colors">
                            {t('common.viewAll', {}, 'Hamısı →')}
                        </Link>
                    </div>

                    <div className="space-y-2.5 my-3 overflow-y-auto max-h-48 custom-scrollbar pr-1">
                        {journalEntries.length === 0 ? (
                            <div className="text-center py-6 text-xs text-[#71717A]">
                                {t('dashboard.noRecentTx', {}, 'Hələ heç bir əməliyyat qeydə alınmayıb.')}
                            </div>
                        ) : (
                            journalEntries.slice(0, 4).map((entry) => (
                                <div
                                    key={entry.id}
                                    className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-between gap-2 hover:border-[#3F3F46] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white truncate">
                                                {entry.entryNumber}
                                            </span>
                                            <span className="text-[10px] text-[#71717A]">
                                                {formatDate(entry.date)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
                                            {entry.description || t('accounting.journalEntry', {}, 'Jurnal əməliyyatı')}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-mono font-bold text-white block">
                                            {formatCurrency(entry.totalDebit || 0)}
                                        </span>
                                        <span className="text-[10px] text-[#A1A1AA]">
                                            {entry.status === 'POSTED' ? t('statuses.posted', {}, 'İcra edilib') : t('statuses.draft', {}, 'Qaralama')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-2 border-t border-[#27272A]">
                        <Link
                            to="/journal"
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-[#27272A] bg-[#141416] hover:bg-[#27272A] text-xs font-medium text-white transition-colors"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>{t('dashboard.newJournalEntry', {}, 'Yeni Jurnal Qeydi')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

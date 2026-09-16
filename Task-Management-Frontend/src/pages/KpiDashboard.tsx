import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Sidebar, Header } from '../layout';
import { kpiService, divisionService, authService, getKpiErrorMessage } from '../api';
import type {
    DailyKpiDTO,
    EmployeeKpiSummaryDTO,
    SubordinateKpiStatusDTO,
    CompanyKpiAnalyticsDTO,
    DivisionDTO,
} from '../dto';
import { parseJwtToken, getPrimaryRole, isUserAdmin, isUserDirector, isUserManager, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    KpiScoreBadge,
    KpiSubmitModal,
    KpiAdminEditModal,
    KpiHistoryTable,
} from '../components/kpi';
import {
    Zap,
    TrendingUp,
    CalendarDays,
    ShieldAlert,
    Star,
    Award,
    RefreshCw,
    Calendar,
    Building2,
    Users,
    CheckCircle,
    Clock3,
    PenLine,
    FilePenLine,
    ChevronDown,
    Check,
    AlertCircle,
    Info,
    BarChart3,
    ArrowUpRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

type ActiveTab = 'employee' | 'manager' | 'analytics';

export const KpiDashboard: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('employee');

    // Loading & Refreshing States
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Employee KPI State
    const [mySummary, setMySummary] = useState<EmployeeKpiSummaryDTO | null>(null);
    const [myHistory, setMyHistory] = useState<DailyKpiDTO[]>([]);
    const [historyFilter, setHistoryFilter] = useState<'7d' | '30d' | 'all'>('30d');

    // Manager State
    const [subordinates, setSubordinates] = useState<SubordinateKpiStatusDTO[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Analytics / Admin State
    const [analytics, setAnalytics] = useState<CompanyKpiAnalyticsDTO | null>(null);
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');

    // Soft Dropdowns State
    const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
    const [showDivisionDropdown, setShowDivisionDropdown] = useState<boolean>(false);
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const divisionDropdownRef = useRef<HTMLDivElement>(null);

    // Modals
    const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
    const [selectedSubordinate, setSelectedSubordinate] = useState<SubordinateKpiStatusDTO | null>(null);

    const [adminEditModalOpen, setAdminEditModalOpen] = useState<boolean>(false);
    const [kpiToEdit, setKpiToEdit] = useState<DailyKpiDTO | null>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
                setShowMonthDropdown(false);
            }
            if (divisionDropdownRef.current && !divisionDropdownRef.current.contains(event.target as Node)) {
                setShowDivisionDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Parse Token User
    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            const parsed = parseJwtToken(token);
            setUserInfo(parsed);
        }
    }, []);

    const userRoles = useMemo(() => userInfo?.roles || ['Employee'], [userInfo]);
    const isAdmin = useMemo(() => isUserAdmin(userRoles), [userRoles]);
    const isDirector = useMemo(() => isUserDirector(userRoles), [userRoles]);
    const isManager = useMemo(() => isUserManager(userRoles), [userRoles]);

    const canViewManagerTab = isAdmin || isDirector || isManager;
    const canViewAnalyticsTab = isAdmin || isDirector;

    const displayName = useMemo(() => {
        if (!userInfo) return 'İstifadəçi';
        if (userInfo.userName) {
            return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        }
        if (userInfo.email) {
            return userInfo.email.split('@')[0];
        }
        return 'İstifadəçi';
    }, [userInfo]);

    const userRoleStr = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    // Data Loaders
    const loadEmployeeData = useCallback(async () => {
        try {
            const summary = await kpiService.getMyKpiSummary();
            setMySummary(summary);

            // History with date range calculation
            const now = new Date();
            let startStr: string | undefined = undefined;
            if (historyFilter === '7d') {
                const s = new Date();
                s.setDate(now.getDate() - 7);
                startStr = s.toISOString().split('T')[0];
            } else if (historyFilter === '30d') {
                const s = new Date();
                s.setDate(now.getDate() - 30);
                startStr = s.toISOString().split('T')[0];
            }
            const history = await kpiService.getMyKpiHistory(startStr);
            setMyHistory(history);
        } catch (err) {
            console.error('Failed to load employee KPI:', err);
        }
    }, [historyFilter]);

    const loadManagerData = useCallback(async () => {
        if (!canViewManagerTab) return;
        try {
            const subs = await kpiService.getSubordinatesStatus(selectedDate);
            setSubordinates(subs);
        } catch (err) {
            console.error('Failed to load subordinate KPI:', err);
        }
    }, [canViewManagerTab, selectedDate]);

    const loadAnalyticsData = useCallback(async () => {
        if (!canViewAnalyticsTab) return;
        try {
            const data = await kpiService.getAnalytics(selectedYear, selectedMonth, selectedDivisionId);
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to load KPI analytics:', err);
        }
    }, [canViewAnalyticsTab, selectedYear, selectedMonth, selectedDivisionId]);

    const loadDivisions = useCallback(async () => {
        if (!canViewAnalyticsTab) return;
        try {
            const divs = await divisionService.getAllDivisions();
            setDivisions(divs);
        } catch (err) {
            console.error('Failed to load divisions:', err);
        }
    }, [canViewAnalyticsTab]);

    // Initial Full Load
    const refreshAll = useCallback(async () => {
        setRefreshing(true);
        setErrorMessage(null);
        try {
            await Promise.allSettled([
                loadEmployeeData(),
                loadManagerData(),
                loadAnalyticsData(),
                loadDivisions(),
            ]);
        } catch (err: any) {
            setErrorMessage(getKpiErrorMessage(err, 'Məlumatlar yüklənərkən xəta baş verdi'));
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [loadEmployeeData, loadManagerData, loadAnalyticsData, loadDivisions]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Handlers
    const handleOpenSubmit = (sub: SubordinateKpiStatusDTO) => {
        setSelectedSubordinate(sub);
        setSubmitModalOpen(true);
    };

    const handleKpiSubmitSuccess = (saved: DailyKpiDTO) => {
        // Refresh manager list and employee state
        loadManagerData();
        loadEmployeeData();
        if (canViewAnalyticsTab) loadAnalyticsData();
    };

    const handleOpenAdminEdit = (kpi: DailyKpiDTO) => {
        setKpiToEdit(kpi);
        setAdminEditModalOpen(true);
    };

    const handleAdminEditSuccess = (updated: DailyKpiDTO) => {
        loadEmployeeData();
        loadManagerData();
        loadAnalyticsData();
    };

    const handleDeleteSuccess = (id: string) => {
        loadEmployeeData();
        loadManagerData();
        loadAnalyticsData();
    };

    // Months list for dropdown
    const months = [
        { value: 1, label: 'Yanvar' },
        { value: 2, label: 'Fevral' },
        { value: 3, label: 'Mart' },
        { value: 4, label: 'Aprel' },
        { value: 5, label: 'May' },
        { value: 6, label: 'İyun' },
        { value: 7, label: 'İyul' },
        { value: 8, label: 'Avqust' },
        { value: 9, label: 'Sentyabr' },
        { value: 10, label: 'Oktyabr' },
        { value: 11, label: 'Noyabr' },
        { value: 12, label: 'Dekabr' },
    ];

    const currentMonthLabel = months.find((m) => m.value === selectedMonth)?.label || 'Bu ay';
    const currentDivisionLabel =
        selectedDivisionId === 'all'
            ? 'Bütün Şöbələr'
            : divisions.find((d) => String(d.id) === selectedDivisionId)?.name || 'Seçilmiş Şöbə';

    // Subordinate Stats calculation
    const managerStats = useMemo(() => {
        const total = subordinates.length;
        const evaluated = subordinates.filter((s) => s.isEvaluatedToday).length;
        const pending = total - evaluated;
        const evaluatedItems = subordinates.filter((s) => s.todayKpi);
        const avgToday =
            evaluatedItems.length > 0
                ? (
                      evaluatedItems.reduce((acc, curr) => acc + (curr.todayKpi?.totalScore || 0), 0) /
                      evaluatedItems.length
                  ).toFixed(2)
                : '0.00';
        return { total, evaluated, pending, avgToday };
    }, [subordinates]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5] selection:bg-fuchsia-500/30">
            <Sidebar userRole={userRoleStr} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121214] scroll-smooth">
                <Header
                    userName={displayName}
                    userRole={userRoleStr}
                    userEmail={userInfo?.email}
                    userAvatar={avatarSrc}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Dəyər-Zərər KPI Paneli
                                </h1>
                            </div>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Günlük "Vəzifə Öhdəliyi", "İntizam Pozuntusu" və "Bonus" göstəricilərinin vahid idarəetmə mərkəzi
                            </p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={refreshAll}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : 'text-[#A1A1AA]'}`} />
                                <span className="hidden sm:inline">Yenilə</span>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs (if Manager or Admin) */}
                    {(canViewManagerTab || canViewAnalyticsTab) && (
                        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#18181B] border border-[#27272A] max-w-fit">
                            <button
                                type="button"
                                onClick={() => setActiveTab('employee')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'employee'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Şəxsi KPI</span>
                            </button>

                            {canViewManagerTab && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('manager')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                                        activeTab === 'manager'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Menecer Qiymətləndirməsi</span>
                                    {managerStats.pending > 0 && (
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    )}
                                </button>
                            )}

                            {canViewAnalyticsTab && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('analytics')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === 'analytics'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Şirkət Analitikası</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 1: EMPLOYEE PERSONAL KPI */}
                    {/* ========================================================================= */}
                    {activeTab === 'employee' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* 4 Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Card 1: Today Score */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 hover:border-[#3F3F46] transition-all shadow-xs flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Bugünkü Bal</span>
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        {mySummary?.todayScore?.totalScore !== null && mySummary?.todayScore?.totalScore !== undefined ? (
                                            <>
                                                <div>
                                                    <span className="text-2xl font-extrabold text-white">
                                                        {mySummary.todayScore.totalScore > 0 ? `+${mySummary.todayScore.totalScore}` : mySummary.todayScore.totalScore}
                                                    </span>
                                                    <span className="text-xs text-[#71717A] ml-1.5 font-medium">bal</span>
                                                </div>
                                                <div className="text-right">
                                                    <KpiScoreBadge score={mySummary.todayScore.totalScore} size="sm" showLabel />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <span className="text-2xl font-extrabold text-[#71717A]">—</span>
                                                    <span className="text-xs text-[#71717A] ml-1.5 font-medium">bal</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-xs">
                                                        <Clock3 className="w-3.5 h-3.5" />
                                                        Qiymət gözləyir
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Card 2: Weekly Total & Average */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 hover:border-[#3F3F46] transition-all shadow-xs flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Həftəlik Statistika</span>
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-extrabold text-white">
                                                {(() => {
                                                    const val = mySummary?.weeklyTotalScore ?? mySummary?.weeklyTotal ?? 0;
                                                    return val > 0 ? `+${val}` : val;
                                                })()}
                                            </span>
                                            <span className="text-xs text-[#71717A] ml-1.5 font-medium">cəm bal</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-emerald-400">
                                                {(mySummary?.weeklyAverageScore ?? mySummary?.weeklyAverage ?? 0).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-[#71717A] block">orta / gün</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Monthly Total & Days */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 hover:border-[#3F3F46] transition-all shadow-xs flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Aylıq Yekun</span>
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                            <CalendarDays className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-extrabold text-white">
                                                {(() => {
                                                    const val = mySummary?.monthlyTotalScore ?? mySummary?.monthlyTotal ?? 0;
                                                    return val > 0 ? `+${val}` : val;
                                                })()}
                                            </span>
                                            <span className="text-xs text-[#71717A] ml-1.5 font-medium">cəm</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-purple-400">
                                                {(mySummary?.monthlyAverageScore ?? mySummary?.monthlyAverage ?? 0).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-[#71717A] block">orta / gün</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Penalties & Warnings */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 hover:border-[#3F3F46] transition-all shadow-xs flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">İntizam Pozuntuları</span>
                                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-baseline justify-between">
                                        <div>
                                            <span className={`text-2xl font-extrabold ${(mySummary?.disciplineViolationsCount ?? mySummary?.disciplinePenaltyCount ?? 0) > 0 ? 'text-rose-400' : 'text-white'}`}>
                                                {mySummary?.disciplineViolationsCount ?? mySummary?.disciplinePenaltyCount ?? 0}
                                            </span>
                                            <span className="text-xs text-[#71717A] ml-1.5 font-medium">cərimə</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-amber-400">
                                                +{mySummary?.bonusCount || 0}
                                            </span>
                                            <span className="text-[10px] text-[#71717A] block">bonus</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Negative Score Warnings if any */}
                            {(() => {
                                const negList = mySummary?.negativeScoresHistory || mySummary?.recentNegativeScores || [];
                                if (negList.length === 0) return null;
                                return (
                                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-in fade-in duration-200">
                                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                                            <ShieldAlert className="w-4 h-4 shrink-0" />
                                            <span>Son Dövr İntizam Qeydləri və Cərimələr</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {negList.map((neg) => (
                                                <div
                                                    key={neg.id}
                                                    className="p-3 rounded-xl bg-[#18181B]/80 border border-rose-500/20 flex items-start justify-between gap-3 text-xs"
                                                >
                                                    <div>
                                                        <span className="text-[#A1A1AA] text-[11px] block">{neg.evaluationDate || neg.date}</span>
                                                        <p className="text-rose-300 font-medium mt-0.5">
                                                            {neg.disciplinePenaltyReason || 'İntizam pozuntusu qeydə alınıb'}
                                                        </p>
                                                    </div>
                                                    <KpiScoreBadge score={neg.totalScore} size="sm" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* History Table with Filters */}
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        <h3 className="text-sm font-bold text-white tracking-tight">KPI Tarixçəsi</h3>
                                    </div>

                                    {/* Date Range Selector */}
                                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181B] border border-[#27272A]">
                                        <button
                                            type="button"
                                            onClick={() => setHistoryFilter('7d')}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                historyFilter === '7d'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-[#A1A1AA] hover:text-white'
                                            }`}
                                        >
                                            Son 7 gün
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHistoryFilter('30d')}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                historyFilter === '30d'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-[#A1A1AA] hover:text-white'
                                            }`}
                                        >
                                            Son 30 gün
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHistoryFilter('all')}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                historyFilter === 'all'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-[#A1A1AA] hover:text-white'
                                            }`}
                                        >
                                            Hamısı
                                        </button>
                                    </div>
                                </div>

                                <KpiHistoryTable
                                    items={myHistory}
                                    isLoading={loading}
                                    isAdmin={isAdmin}
                                    onEdit={handleOpenAdminEdit}
                                />
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 2: MANAGER EVALUATION PANEL */}
                    {/* ========================================================================= */}
                    {activeTab === 'manager' && canViewManagerTab && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Manager Stats Bar & Date Selector */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[#27272A] bg-[#18181B]">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Tabeçilikdə</span>
                                        <p className="text-xl font-extrabold text-white mt-0.5">{managerStats.total} nəfər</p>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Qiymətləndirildi</span>
                                        <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{managerStats.evaluated}</p>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Gözləyir</span>
                                        <p className={`text-xl font-extrabold mt-0.5 ${managerStats.pending > 0 ? 'text-amber-400' : 'text-white'}`}>
                                            {managerStats.pending}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Günlük Orta</span>
                                        <p className="text-xl font-extrabold text-blue-400 mt-0.5">{managerStats.avgToday}</p>
                                    </div>
                                </div>

                                {/* Evaluation Date Control */}
                                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#27272A]">
                                    <span className="text-xs text-[#A1A1AA] font-semibold">Tarix:</span>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#27272A] text-xs text-white focus:outline-none focus:border-blue-500 font-semibold transition-all"
                                    />
                                </div>
                            </div>

                            {/* Subordinates Grid / Table */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                                <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        Əməkdaşların Günlük Qiymətləndirmə Vəziyyəti
                                    </h3>
                                    <span className="text-xs text-[#A1A1AA]">
                                        Tarix: <b className="text-white">{selectedDate}</b>
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#27272A] bg-[#1C1C1E]/70 text-[#A1A1AA] font-bold">
                                                <th className="py-3.5 px-4 sm:px-5">Əməkdaş</th>
                                                <th className="py-3.5 px-3">Şöbə</th>
                                                <th className="py-3.5 px-3">Vəzifə Öhdəliyi</th>
                                                <th className="py-3.5 px-3">İntizam</th>
                                                <th className="py-3.5 px-3">Bonus</th>
                                                <th className="py-3.5 px-3">Bugünkü Nəticə</th>
                                                <th className="py-3.5 px-4 text-right">Əməliyyat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#27272A]/70 text-[#D4D4D8]">
                                            {subordinates.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-[#71717A]">
                                                        Tabeçilikdə heç bir əməkdaş tapılmadı.
                                                    </td>
                                                </tr>
                                            ) : (
                                                subordinates.map((sub) => {
                                                    const subId = sub.employeeId || sub.id || sub.userId || '';
                                                    const subName = sub.employeeName || 'Əməkdaş';
                                                    const subEmail = sub.employeeEmail || sub.email || '';
                                                    const initials = (subName.charAt(0) || 'U').toUpperCase();

                                                    return (
                                                        <tr key={subId || subName} className="hover:bg-white/[0.02] transition-colors">
                                                            {/* Employee */}
                                                            <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    {sub.avatarUrl ? (
                                                                        <img
                                                                            src={sub.avatarUrl}
                                                                            alt={subName}
                                                                            className="w-8 h-8 rounded-full object-cover border border-[#3F3F46]"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                                                                            {initials}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <span className="font-bold text-white block">
                                                                            {subName}
                                                                        </span>
                                                                        <span className="text-[11px] text-[#71717A]">
                                                                            {subEmail}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Division */}
                                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                                <span className="text-[#A1A1AA] font-medium">
                                                                    {sub.divisionName || '—'}
                                                                </span>
                                                            </td>

                                                            {/* Duty Score */}
                                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                                {sub.todayKpi ? (
                                                                    sub.todayKpi.jobDutiesScore === 1 ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[11px]">
                                                                            <Check className="w-3 h-3" /> İcra olundu (+1)
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700 text-[11px]">
                                                                            İcra olunmadı (0)
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#71717A] text-xs">—</span>
                                                                )}
                                                            </td>

                                                            {/* Discipline Score */}
                                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                                {sub.todayKpi ? (
                                                                    sub.todayKpi.disciplineScore === -1 ? (
                                                                        <span
                                                                            title={sub.todayKpi.disciplinePenaltyReason || 'İntizam cəriməsi'}
                                                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 text-[11px] cursor-help"
                                                                        >
                                                                            <ShieldAlert className="w-3 h-3" /> Cərimə (-1)
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[#A1A1AA] text-[11px] font-medium">Qaydasında (0)</span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#71717A] text-xs">—</span>
                                                                )}
                                                            </td>

                                                            {/* Bonus Score */}
                                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                                {sub.todayKpi ? (
                                                                    sub.todayKpi.bonusScore === 1 ? (
                                                                        <span
                                                                            title={sub.todayKpi.bonusReason || 'Bonus səbəbi'}
                                                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 text-[11px] cursor-help"
                                                                        >
                                                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" /> Bonus (+1)
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[#71717A] text-[11px]">0</span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-[#71717A] text-xs">—</span>
                                                                )}
                                                            </td>

                                                            {/* Today Status / Score */}
                                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                                {sub.isEvaluatedToday && sub.todayKpi ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                                        <KpiScoreBadge score={sub.todayKpi.totalScore} size="sm" showLabel />
                                                                    </div>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-[11px]">
                                                                        <Clock3 className="w-3 h-3" />
                                                                        Gözləyir
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenSubmit(sub)}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                                        sub.isEvaluatedToday
                                                                            ? 'bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white border border-[#3F3F46]/50'
                                                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                                                                    }`}
                                                                >
                                                                    <PenLine className="w-3.5 h-3.5" />
                                                                    <span>{sub.isEvaluatedToday ? 'Düzəliş et' : 'Qiymətləndir'}</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 3: COMPANY & DIRECTOR ANALYTICS */}
                    {/* ========================================================================= */}
                    {activeTab === 'analytics' && canViewAnalyticsTab && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Analytics Filter Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#27272A] bg-[#18181B]">
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-purple-400" />
                                        Şirkət KPI Analitika və Trendləri
                                    </h3>
                                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                                        Şöbələr üzrə müqayisə və günlük dinamika
                                    </p>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* Month Dropdown */}
                                    <div className="relative" ref={monthDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1C1E] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                        >
                                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                            <span>{currentMonthLabel} {selectedYear}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showMonthDropdown && (
                                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col max-h-60 overflow-y-auto animate-in fade-in duration-100">
                                                {months.map((m) => (
                                                    <div
                                                        key={m.value}
                                                        onClick={() => {
                                                            setSelectedMonth(m.value);
                                                            setShowMonthDropdown(false);
                                                        }}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                                            selectedMonth === m.value
                                                                ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                                : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        <span>{m.label}</span>
                                                        {selectedMonth === m.value && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Division Dropdown */}
                                    <div className="relative" ref={divisionDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
                                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1C1E] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                        >
                                            <Building2 className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="max-w-[130px] truncate">{currentDivisionLabel}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showDivisionDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showDivisionDropdown && (
                                            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col max-h-60 overflow-y-auto animate-in fade-in duration-100">
                                                <div
                                                    onClick={() => {
                                                        setSelectedDivisionId('all');
                                                        setShowDivisionDropdown(false);
                                                    }}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                                        selectedDivisionId === 'all'
                                                            ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                            : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <span>Bütün Şöbələr</span>
                                                    {selectedDivisionId === 'all' && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                {divisions.map((div) => (
                                                    <div
                                                        key={div.id}
                                                        onClick={() => {
                                                            setSelectedDivisionId(String(div.id));
                                                            setShowDivisionDropdown(false);
                                                        }}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                                            selectedDivisionId === String(div.id)
                                                                ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                                : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="truncate">{div.name}</span>
                                                        {selectedDivisionId === String(div.id) && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Summary Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-4">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Şirkət Orta Bal</span>
                                    <p className="text-2xl font-extrabold text-blue-400 mt-1">
                                        {(analytics?.companyAverageDailyScore ?? analytics?.companyAverageScore ?? 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-4">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Toplam Qiymətləndirmə</span>
                                    <p className="text-2xl font-extrabold text-white mt-1">
                                        {analytics?.totalEvaluationsCount ?? analytics?.totalEvaluations ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-4">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Aktiv Əməkdaşlar</span>
                                    <p className="text-2xl font-extrabold text-purple-400 mt-1">
                                        {analytics?.evaluatedEmployeesCount || 0} nəfər
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-4">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Cərimələr</span>
                                    <p className="text-2xl font-extrabold text-rose-400 mt-1">
                                        {analytics?.totalDisciplineViolationsCount ?? analytics?.totalDisciplinePenalties ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-4">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase">Bonuslar</span>
                                    <p className="text-2xl font-extrabold text-amber-400 mt-1">
                                        +{analytics?.totalBonusCount ?? analytics?.totalBonuses ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Daily Trend Chart */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                        Günlük Orta KPI Bal Trendi
                                    </h4>
                                    <div className="h-64 w-full">
                                        {analytics?.dailyTrends && analytics.dailyTrends.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analytics.dailyTrends}>
                                                    <defs>
                                                        <linearGradient id="blueLineGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                                                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#71717A" textAnchor="end" tick={{ fontSize: 10 }} />
                                                    <YAxis stroke="#71717A" domain={[-1, 2]} tick={{ fontSize: 10 }} />
                                                    <Tooltip
                                                        cursor={{ stroke: 'rgba(59, 130, 246, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                                        content={({ active, payload, label }) => {
                                                            if (active && payload && payload.length) {
                                                                const val = payload[0].value as number;
                                                                return (
                                                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                                                                        <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider mb-1">Tarix: {label}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />
                                                                            <span className="text-xs font-medium text-[#D4D4D8]">Günlük Orta Bal:</span>
                                                                            <span className={`text-xs font-black ${val > 0 ? 'text-blue-400' : val < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                                                                                {val > 0 ? `+${val}` : val}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="averageScore"
                                                        stroke="#3B82F6"
                                                        strokeWidth={2.5}
                                                        fill="url(#blueLineGrad)"
                                                        activeDot={{ r: 5, fill: '#3B82F6', stroke: '#18181B', strokeWidth: 2 }}
                                                        name="Orta Bal"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                                                Qrafik üçün kifayət qədər günlük məlumat yoxdur
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Division Breakdown Bar Chart */}
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-purple-400" />
                                        Şöbələr Üzrə Orta KPI Nəticələri
                                    </h4>
                                    <div className="h-64 w-full">
                                        {analytics?.divisionBreakdown && analytics.divisionBreakdown.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.divisionBreakdown}>
                                                    <defs>
                                                        <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#A855F7" stopOpacity={0.95} />
                                                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                                    <XAxis dataKey="divisionName" stroke="#71717A" tick={{ fontSize: 10 }} />
                                                    <YAxis stroke="#71717A" tick={{ fontSize: 10 }} />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(139, 92, 246, 0.08)', radius: 8 }}
                                                        content={({ active, payload, label }) => {
                                                            if (active && payload && payload.length) {
                                                                const val = payload[0].value as number;
                                                                return (
                                                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                                                                        <p className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                                                                            <Building2 className="w-3.5 h-3.5 text-purple-400" />
                                                                            {label}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 pt-1 border-t border-[#27272A]">
                                                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500/50" />
                                                                            <span className="text-xs font-medium text-[#A1A1AA]">Orta KPI Balı:</span>
                                                                            <span className={`text-xs font-black ${val > 0 ? 'text-purple-300' : val < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                                                                                {val > 0 ? `+${val}` : val}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey="averageScore"
                                                        fill="url(#purpleBarGrad)"
                                                        radius={[8, 8, 0, 0]}
                                                        maxBarSize={56}
                                                        name="Orta Bal"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                                                Şöbə müqayisəsi üçün məlumat tapılmadı
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Discipline Violations */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                                    Son İntizam Pozuntuları və Tətbiq Edilən Cərimələr
                                </h4>

                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#27272A] bg-[#1C1C1E]/70 text-[#A1A1AA] font-bold">
                                                    <th className="py-3.5 px-4 sm:px-5">Tarix</th>
                                                    <th className="py-3.5 px-3">Əməkdaş</th>
                                                    <th className="py-3.5 px-3">Şöbə</th>
                                                    <th className="py-3.5 px-4">Pozuntu Səbəbi</th>
                                                    <th className="py-3.5 px-3 text-center">Yekun Bal</th>
                                                    {isAdmin && <th className="py-3.5 px-4 text-right">Audit Redaktə</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#27272A]/70 text-[#D4D4D8]">
                                                {analytics?.recentDisciplineViolations && analytics.recentDisciplineViolations.length > 0 ? (
                                                    analytics.recentDisciplineViolations.map((v) => (
                                                        <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="py-3.5 px-4 sm:px-5 font-semibold text-white whitespace-nowrap">
                                                                {v.evaluationDate || v.date}
                                                            </td>
                                                            <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                                                                {v.employeeName}
                                                            </td>
                                                            <td className="py-3.5 px-3 text-[#A1A1AA] whitespace-nowrap">
                                                                {v.divisionName || '—'}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-rose-400 font-medium max-w-sm">
                                                                {v.disciplinePenaltyReason || 'İntizam qayda pozuntusu'}
                                                            </td>
                                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                                <KpiScoreBadge score={v.totalScore} size="sm" />
                                                            </td>
                                                            {isAdmin && (
                                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenAdminEdit(v)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-purple-600/20 hover:text-purple-300 text-xs font-semibold text-[#A1A1AA] transition-colors cursor-pointer border border-[#3F3F46]/60"
                                                                    >
                                                                        <FilePenLine className="w-3 h-3" />
                                                                        <span>Düzəliş</span>
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-[#71717A]">
                                                            Qeydə alınmış heç bir intizam pozuntusu yoxdur.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Manager Submit Modal */}
            {selectedSubordinate && (
                <KpiSubmitModal
                    isOpen={submitModalOpen}
                    onClose={() => {
                        setSubmitModalOpen(false);
                        setSelectedSubordinate(null);
                    }}
                    onSuccess={handleKpiSubmitSuccess}
                    employeeId={selectedSubordinate.employeeId || selectedSubordinate.id || selectedSubordinate.userId}
                    employeeName={selectedSubordinate.employeeName || 'Əməkdaş'}
                    divisionName={selectedSubordinate.divisionName || undefined}
                    date={selectedDate}
                    initialData={selectedSubordinate.todayKpi}
                    currentUserId={userInfo?.userId}
                    isAdminOrHr={isAdmin || isDirector}
                />
            )}

            {/* Admin Audit Edit Modal */}
            {kpiToEdit && (
                <KpiAdminEditModal
                    isOpen={adminEditModalOpen}
                    onClose={() => setAdminEditModalOpen(false)}
                    onSuccess={handleAdminEditSuccess}
                    onDeleteSuccess={handleDeleteSuccess}
                    kpi={kpiToEdit}
                />
            )}
        </div>
    );
};

export default KpiDashboard;

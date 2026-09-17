import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Sidebar, Header } from '../layout';
import { kpiService, divisionService, authService } from '../api';
import { useLanguage } from '../context/LanguageContext';
import type { KpiLeaderboardItemDTO, DivisionDTO } from '../dto';
import { parseJwtToken, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { KpiScoreBadge } from '../components/kpi';
import {
    Medal,
    Trophy,
    Crown,
    Download,
    Calendar,
    Building2,
    Search,
    ChevronDown,
    Check,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Sparkles,
    ShieldAlert,
    Star,
    ClipboardCheck,
} from 'lucide-react';

export const KpiLeaderboard: React.FC = () => {
    const { t, language } = useLanguage();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<KpiLeaderboardItemDTO[]>([]);
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Filters
    const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    // Dropdown toggles
    const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
    const [showDivisionDropdown, setShowDivisionDropdown] = useState<boolean>(false);
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const divisionDropdownRef = useRef<HTMLDivElement>(null);

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

    // Token user
    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            const parsed = parseJwtToken(token);
            setUserInfo(parsed);
        }
    }, []);

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

    // Data loaders
    const loadLeaderboard = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await kpiService.getKpiLeaderboard(selectedYear, selectedMonth, selectedDivisionId);
            setLeaderboard(data);
        } catch (err) {
            console.error('Failed to load KPI leaderboard:', err);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [selectedYear, selectedMonth, selectedDivisionId]);

    const loadDivisions = useCallback(async () => {
        try {
            const divs = await divisionService.getAllDivisions();
            setDivisions(divs);
        } catch (err) {
            console.error('Failed to load divisions:', err);
        }
    }, []);

    useEffect(() => {
        loadLeaderboard();
        loadDivisions();
    }, [loadLeaderboard, loadDivisions]);

    // Months list
    const months = useMemo(() => {
        if (language === 'en') {
            return [
                { value: 1, label: 'January' },
                { value: 2, label: 'February' },
                { value: 3, label: 'March' },
                { value: 4, label: 'April' },
                { value: 5, label: 'May' },
                { value: 6, label: 'June' },
                { value: 7, label: 'July' },
                { value: 8, label: 'August' },
                { value: 9, label: 'September' },
                { value: 10, label: 'October' },
                { value: 11, label: 'November' },
                { value: 12, label: 'December' },
            ];
        }
        if (language === 'ru') {
            return [
                { value: 1, label: 'Январь' },
                { value: 2, label: 'Февраль' },
                { value: 3, label: 'Март' },
                { value: 4, label: 'Апрель' },
                { value: 5, label: 'Май' },
                { value: 6, label: 'Июнь' },
                { value: 7, label: 'Июль' },
                { value: 8, label: 'Август' },
                { value: 9, label: 'Сентябрь' },
                { value: 10, label: 'Октябрь' },
                { value: 11, label: 'Ноябрь' },
                { value: 12, label: 'Декабрь' },
            ];
        }
        return [
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
    }, [language]);

    const currentMonthLabel = months.find((m) => m.value === selectedMonth)?.label || t('kpi.thisMonth', {}, 'Bu ay');
    const currentDivisionLabel =
        selectedDivisionId === 'all'
            ? t('kpi.allDivisions', {}, 'Bütün Şöbələr')
            : divisions.find((d) => String(d.id) === selectedDivisionId)?.name || t('kpi.division', {}, 'Şöbə');

    // Filter by search
    const filteredLeaderboard = useMemo(() => {
        if (!searchQuery.trim()) return leaderboard;
        const query = searchQuery.toLowerCase();
        return leaderboard.filter((item) => {
            const name = (item.employeeName || item.userName || '').toLowerCase();
            const email = (item.employeeEmail || item.userEmail || '').toLowerCase();
            const div = (item.divisionName || '').toLowerCase();
            return name.includes(query) || email.includes(query) || div.includes(query);
        });
    }, [leaderboard, searchQuery]);

    // Top 3 Podium
    const topThree = useMemo(() => {
        return leaderboard.slice(0, 3);
    }, [leaderboard]);

    // Pagination
    const totalPages = Math.ceil(filteredLeaderboard.length / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLeaderboard.slice(start, start + pageSize);
    }, [filteredLeaderboard, currentPage, pageSize]);

    // CSV Export
    const handleExportCsv = () => {
        if (!filteredLeaderboard || filteredLeaderboard.length === 0) return;

        const headers = [
            'Reytinq',
            'Əməkdaş Adı',
            'Email',
            'Şöbə',
            'Aylıq Toplam Bal',
            'Orta Gündəlik Bal',
            'Qiymətləndirilən Günlər',
            'Öhdəlik Balı',
            'İntizam Cəriməsi',
            'Bonus Balı',
        ];

        const rows = filteredLeaderboard.map((item, idx) => [
            idx + 1,
            `"${item.employeeName || item.userName || ''}"`,
            `"${item.employeeEmail || item.userEmail || ''}"`,
            `"${item.divisionName || ''}"`,
            item.monthlyCumulativeScore ?? item.monthlyTotalScore ?? 0,
            (item.averageDailyScore ?? item.averageScore ?? 0).toFixed(2),
            item.daysEvaluated ?? item.evaluatedDaysCount ?? 0,
            item.dutiesCompletedDays ?? item.dutyScoreCount ?? 0,
            item.disciplineViolationsDays ?? item.disciplinePenaltyCount ?? 0,
            item.bonusDays ?? item.bonusScoreCount ?? 0,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `KPI_Reytinq_${selectedYear}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5] selection:bg-fuchsia-500/30">
            <Sidebar userRole={userRoleStr} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-zinc-50 dark:bg-[#121214] scroll-smooth">
                <Header
                    userName={displayName}
                    userRole={userRoleStr}
                    userEmail={userInfo?.email}
                    userAvatar={avatarSrc}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-8 max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                                    <Medal className="w-4 h-4" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                                    {t('kpi.leaderboardTitle', {}, 'Aylıq KPI Reytinq Cədvəli')}
                                </h1>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                {t('kpi.leaderboardSubtitle', {}, 'Dəyər-Zərər modeli üzrə ən yüksək performans göstərən əməkdaşların reytinqi')}
                            </p>
                        </div>

                        {/* Top Filters & Export */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Month Dropdown */}
                            <div className="relative" ref={monthDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#18181B] dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-xs font-semibold text-zinc-800 dark:text-white shadow-xs transition-colors cursor-pointer"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                    <span>{currentMonthLabel} {selectedYear}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 dark:text-[#71717A] transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showMonthDropdown && (
                                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white/95 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-1 z-50 flex flex-col max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
                                        {months.map((m) => (
                                            <div
                                                key={m.value}
                                                onClick={() => {
                                                    setSelectedMonth(m.value);
                                                    setShowMonthDropdown(false);
                                                }}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                                    selectedMonth === m.value
                                                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                                        : 'text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
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
                                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#18181B] dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-xs font-semibold text-zinc-800 dark:text-white shadow-xs transition-colors cursor-pointer"
                                >
                                    <Building2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                                    <span className="max-w-[130px] truncate">{currentDivisionLabel}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 dark:text-[#71717A] transition-transform ${showDivisionDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDivisionDropdown && (
                                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white/95 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-1 z-50 flex flex-col max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
                                        <div
                                            onClick={() => {
                                                setSelectedDivisionId('all');
                                                setShowDivisionDropdown(false);
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                                selectedDivisionId === 'all'
                                                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <span>{t('kpi.allDivisions', {}, 'Bütün Şöbələr')}</span>
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
                                                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                                        : 'text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <span className="truncate">{div.name}</span>
                                                {selectedDivisionId === String(div.id) && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export to CSV Button */}
                            <button
                                type="button"
                                onClick={handleExportCsv}
                                disabled={leaderboard.length === 0}
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#18181B] dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-xs font-semibold text-zinc-800 dark:text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                <span className="hidden sm:inline">{t('common.exportCsv', {}, 'CSV İxrac')}</span>
                            </button>

                            {/* Refresh Button */}
                            <button
                                type="button"
                                onClick={loadLeaderboard}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#18181B] dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-800 dark:text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                title={t('common.refresh', {}, 'Yenilə')}
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : 'text-zinc-400 dark:text-[#A1A1AA]'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Top 3 Podium Cards */}
                    {topThree.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 2nd Place */}
                            {topThree[1] && (
                                <div className="rounded-2xl border border-slate-200/90 dark:border-[#3F3F46]/60 bg-gradient-to-b from-slate-50 via-white to-slate-100/80 dark:from-[#1E1E22] dark:to-[#18181B] p-5 relative overflow-hidden shadow-md flex flex-col justify-between order-2 md:order-1 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-slate-200/80 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center text-xs border border-slate-300 dark:border-slate-400/30">
                                                2
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('kpi.silverMedal', {}, 'Gümüş Medal')}</span>
                                        </div>
                                        <Medal className="w-5 h-5 text-slate-400" />
                                    </div>

                                    <div className="mt-4 flex items-center gap-3.5">
                                        {topThree[1].profilePictureUrl ? (
                                            <img
                                                src={topThree[1].profilePictureUrl}
                                                alt={topThree[1].employeeName || topThree[1].userName || ''}
                                                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-400/50"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-600 to-zinc-500 text-white font-extrabold flex items-center justify-center text-base border-2 border-slate-300 dark:border-slate-400/50">
                                                {((topThree[1].employeeName || topThree[1].userName || 'U').charAt(0)).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{topThree[1].employeeName || topThree[1].userName}</h3>
                                            <span className="text-xs text-zinc-500 dark:text-[#A1A1AA] truncate block">{topThree[1].divisionName || t('kpi.division', {}, 'Şöbə')}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-[#27272A] flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-zinc-500 dark:text-[#71717A] block">{t('kpi.monthlyTotal', {}, 'Aylıq Bal')}</span>
                                            <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                                                {(() => {
                                                    const val = topThree[1].monthlyCumulativeScore ?? topThree[1].monthlyTotalScore ?? 0;
                                                    return val > 0 ? `+${val}` : val;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-zinc-500 dark:text-[#71717A] block">{t('kpi.dailyAvg', {}, 'Orta Bal')}</span>
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                {(topThree[1].averageDailyScore ?? topThree[1].averageScore ?? 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place (Champion) */}
                            {topThree[0] && (
                                <div className="rounded-2xl border border-amber-300/80 dark:border-amber-500/50 bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-amber-100/60 dark:from-amber-500/15 dark:via-[#1E1E22] dark:to-[#18181B] p-5 relative overflow-hidden shadow-lg shadow-amber-500/10 dark:shadow-amber-500/5 flex flex-col justify-between order-1 md:order-2 md:-mt-2 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold flex items-center justify-center text-sm border border-amber-400/50 shadow-xs">
                                                1
                                            </div>
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                                {t('kpi.winnerOfMonth', {}, 'Ayın Qalibi')}
                                            </span>
                                        </div>
                                        <Trophy className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                                    </div>

                                    <div className="mt-4 flex items-center gap-3.5">
                                        {topThree[0].profilePictureUrl ? (
                                            <img
                                                src={topThree[0].profilePictureUrl}
                                                alt={topThree[0].employeeName || topThree[0].userName || ''}
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white font-extrabold flex items-center justify-center text-lg border-2 border-amber-400 shadow-md shadow-amber-500/20">
                                                {((topThree[0].employeeName || topThree[0].userName || 'U').charAt(0)).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white truncate">{topThree[0].employeeName || topThree[0].userName}</h3>
                                            <span className="text-xs text-amber-800 dark:text-amber-300/90 font-medium truncate block">{topThree[0].divisionName || t('kpi.division', {}, 'Şöbə')}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-amber-300/60 dark:border-amber-500/20 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-zinc-600 dark:text-[#A1A1AA] block">{t('kpi.monthlyTotal', {}, 'Aylıq Toplam Bal')}</span>
                                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                                {(() => {
                                                    const val = topThree[0].monthlyCumulativeScore ?? topThree[0].monthlyTotalScore ?? 0;
                                                    return val > 0 ? `+${val}` : val;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-zinc-600 dark:text-[#A1A1AA] block">{t('kpi.dailyAvg', {}, 'Orta Bal')}</span>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {(topThree[0].averageDailyScore ?? topThree[0].averageScore ?? 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {topThree[2] && (
                                <div className="rounded-2xl border border-orange-200/90 dark:border-amber-700/50 bg-gradient-to-b from-orange-50/80 via-white to-amber-50/60 dark:from-[#221C18] dark:to-[#18181B] p-5 relative overflow-hidden shadow-md flex flex-col justify-between order-3 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-orange-200/80 dark:bg-amber-700/30 text-orange-800 dark:text-amber-400 font-extrabold flex items-center justify-center text-xs border border-orange-300 dark:border-amber-700/40">
                                                3
                                            </div>
                                            <span className="text-xs font-bold text-orange-800 dark:text-amber-500 uppercase tracking-wider">{t('kpi.bronzeMedal', {}, 'Bürünc Medal')}</span>
                                        </div>
                                        <Medal className="w-5 h-5 text-amber-600" />
                                    </div>

                                    <div className="mt-4 flex items-center gap-3.5">
                                        {topThree[2].profilePictureUrl ? (
                                            <img
                                                src={topThree[2].profilePictureUrl}
                                                alt={topThree[2].employeeName || topThree[2].userName || ''}
                                                className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-300 dark:border-amber-700/60"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 to-orange-700 text-white font-extrabold flex items-center justify-center text-base border-2 border-orange-300 dark:border-amber-700/60">
                                                {((topThree[2].employeeName || topThree[2].userName || 'U').charAt(0)).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{topThree[2].employeeName || topThree[2].userName}</h3>
                                            <span className="text-xs text-zinc-500 dark:text-[#A1A1AA] truncate block">{topThree[2].divisionName || t('kpi.division', {}, 'Şöbə')}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-orange-200/80 dark:border-[#27272A] flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-zinc-500 dark:text-[#71717A] block">{t('kpi.monthlyTotal', {}, 'Aylıq Bal')}</span>
                                            <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                                                {(() => {
                                                    const val = topThree[2].monthlyCumulativeScore ?? topThree[2].monthlyTotalScore ?? 0;
                                                    return val > 0 ? `+${val}` : val;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-zinc-500 dark:text-[#71717A] block">{t('kpi.dailyAvg', {}, 'Orta Bal')}</span>
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                {(topThree[2].averageDailyScore ?? topThree[2].averageScore ?? 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table Container with Search */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
                        {/* Table Search Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                {t('kpi.overallRanking', {}, 'Ümumi Əməkdaş Reytinqi')}
                            </h3>

                            <div className="relative max-w-xs w-full">
                                <Search className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder={t('kpi.searchEmployee', {}, 'Əməkdaş axtar...')}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#27272A] focus:border-blue-500 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Full Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#1C1C1E]/70 text-zinc-600 dark:text-[#A1A1AA] font-bold">
                                        <th className="py-3.5 px-3 text-center w-12">#</th>
                                        <th className="py-3.5 px-4">{t('kpi.employee', {}, 'Əməkdaş')}</th>
                                        <th className="py-3.5 px-3">{t('kpi.division', {}, 'Şöbə')}</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.monthlyTotal', {}, 'Aylıq Cəm Bal')}</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.dailyAvg', {}, 'Orta Bal')}</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.evaluatedDays', {}, 'Qiymətləndirilən Gün')}</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.dutyObligation', {}, 'Öhdəlik')} (+1)</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.discipline', {}, 'Cərimə')} (-1)</th>
                                        <th className="py-3.5 px-3 text-center">{t('kpi.bonus', {}, 'Bonus')} (+1)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-[#27272A]/70 text-zinc-700 dark:text-[#D4D4D8]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-zinc-500 dark:text-[#71717A]">
                                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                {t('common.loading', {}, 'Reytinq cədvəli yüklənir...')}
                                            </td>
                                        </tr>
                                    ) : paginatedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-zinc-500 dark:text-[#71717A]">
                                                {t('common.noData', {}, 'Axtarışa uyğun heç bir nəticə tapılmadı.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedItems.map((item, idx) => {
                                            const rank = (currentPage - 1) * pageSize + idx + 1;
                                            const id = item.employeeId || item.userId || `emp-${idx}`;
                                            const name = item.employeeName || item.userName || t('kpi.employee', {}, 'İstifadəçi');
                                            const email = item.employeeEmail || item.userEmail || '';
                                            const initials = (name.charAt(0) || 'U').toUpperCase();

                                            let rankBadge = (
                                                <span className="text-zinc-500 dark:text-[#71717A] font-bold">{rank}</span>
                                            );
                                            if (rank === 1) {
                                                rankBadge = (
                                                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-xs mx-auto border border-amber-400/40">
                                                        1
                                                    </span>
                                                );
                                            } else if (rank === 2) {
                                                rankBadge = (
                                                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center text-xs mx-auto border border-slate-300 dark:border-slate-400/30">
                                                        2
                                                    </span>
                                                );
                                            } else if (rank === 3) {
                                                rankBadge = (
                                                    <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-amber-700/20 text-orange-700 dark:text-amber-500 font-extrabold flex items-center justify-center text-xs mx-auto border border-orange-300 dark:border-amber-700/30">
                                                        3
                                                    </span>
                                                );
                                            }

                                            const score = item.monthlyCumulativeScore ?? item.monthlyTotalScore ?? 0;
                                            const avg = item.averageDailyScore ?? item.averageScore ?? 0;
                                            const days = item.daysEvaluated ?? item.evaluatedDaysCount ?? 0;
                                            const duties = item.dutiesCompletedDays ?? item.dutyScoreCount ?? 0;
                                            const penalties = item.disciplineViolationsDays ?? item.disciplinePenaltyCount ?? 0;
                                            const bonuses = item.bonusDays ?? item.bonusScoreCount ?? 0;

                                            return (
                                                <tr key={id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3.5 px-3 text-center">{rankBadge}</td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            {item.profilePictureUrl ? (
                                                                <img
                                                                    src={item.profilePictureUrl}
                                                                    alt={name}
                                                                    className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-[#3F3F46]"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                                                                    {initials}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-bold text-zinc-900 dark:text-white block">
                                                                    {name}
                                                                </span>
                                                                <span className="text-[11px] text-zinc-500 dark:text-[#71717A]">
                                                                    {email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-3 text-zinc-600 dark:text-[#A1A1AA] whitespace-nowrap">
                                                        {item.divisionName || '—'}
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                        <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                                                            {score > 0 ? `+${score}` : score}
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                                                        {avg.toFixed(2)}
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center text-zinc-600 dark:text-[#A1A1AA] whitespace-nowrap">
                                                        {days}
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                                                        +{duties}
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                                                        {penalties > 0 ? `-${penalties}` : '0'}
                                                    </td>

                                                    <td className="py-3.5 px-3 text-center text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                                                        +{bonuses}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-[#27272A] text-xs">
                                <span className="text-zinc-500 dark:text-[#71717A]">
                                    {currentPage} / {totalPages}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-zinc-100 dark:bg-[#1C1C1E] hover:bg-zinc-200 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-800 dark:text-white disabled:opacity-40 transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-zinc-100 dark:bg-[#1C1C1E] hover:bg-zinc-200 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-800 dark:text-white disabled:opacity-40 transition-colors cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default KpiLeaderboard;

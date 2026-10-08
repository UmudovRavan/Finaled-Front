import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fiscalService } from '../../api';
import type { FiscalPeriodDto, CreateFiscalPeriodRequest } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon,
    LockClosedIcon,
    LockOpenIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    ViewColumnsIcon,
    ArrowsUpDownIcon,
    ChevronDownIcon,
    EyeIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export const FiscalPeriodsPage: React.FC = () => {
    const { t } = useLanguage();
    const currentCalendarYear = new Date().getFullYear();
    const [periods, setPeriods] = useState<FiscalPeriodDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fiscalYear, setFiscalYear] = useState<number>(currentCalendarYear);
    const [statusFilter, setStatusFilter] = useState<'Status' | 'Hamısı' | 'Açıq' | 'Bağlı'>('Status');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    // Dropdown open states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'periodNumber' | 'name' | 'startDate' | 'status'>('periodNumber');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility
    const [columns, setColumns] = useState([
        { key: 'periodNumber', label: t('accounting.periodNumber', {}, 'Dövr №'), visible: true },
        { key: 'name', label: t('accounting.periodName', {}, 'Dövrün Adı'), visible: true },
        { key: 'startDate', label: t('common.startDate', {}, 'Başlama Tarixi'), visible: true },
        { key: 'endDate', label: t('common.endDate', {}, 'Bitmə Tarixi'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
        { key: 'notes', label: t('common.notes', {}, 'Qeyd'), visible: true },
    ]);

    // Detail Drawer State
    const [selectedPeriod, setSelectedPeriod] = useState<FiscalPeriodDto | null>(null);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formYear, setFormYear] = useState<number>(currentCalendarYear);
    const [formStartDate, setFormStartDate] = useState<string>(`${currentCalendarYear}-01-01`);
    const [formEndDate, setFormEndDate] = useState<string>(`${currentCalendarYear}-12-31`);
    const [formNotes, setFormNotes] = useState<string>(`${currentCalendarYear}-ci il maliyyə ili və 12 aylıq əməliyyat dövrü`);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Action Confirm Modal (Close / Reopen)
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        action: 'close' | 'reopen';
        period: FiscalPeriodDto | null;
        loading: boolean;
    }>({
        open: false,
        action: 'close',
        period: null,
        loading: false,
    });

    // Refs for outside click
    const statusRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
            if (yearRef.current && !yearRef.current.contains(e.target as Node)) setIsYearDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setIsColumnsOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const loadPeriods = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setLoading(true);
        try {
            const data = await fiscalService.getFiscalPeriods({ fiscalYear });
            setPeriods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load fiscal periods:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadPeriods();
    }, [fiscalYear]);

    // Active Filter Count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (statusFilter !== 'Status' && statusFilter !== 'Hamısı') count++;
        return count;
    }, [searchQuery, statusFilter]);

    // Filter & Sort
    const filteredPeriods = useMemo(() => {
        return periods.filter((p) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchNotes = (p.notes || '').toLowerCase().includes(q);
                const matchNum = String(p.periodNumber).includes(q);
                if (!matchName && !matchNotes && !matchNum) return false;
            }

            if (statusFilter !== 'Status' && statusFilter !== 'Hamısı') {
                const isClosed = statusFilter === 'Bağlı';
                if (Boolean(p.isClosed) !== isClosed) return false;
            }

            return true;
        }).sort((a, b) => {
            let comp = 0;
            if (sortField === 'periodNumber') {
                comp = a.periodNumber - b.periodNumber;
            } else if (sortField === 'name') {
                comp = (a.name || '').localeCompare(b.name || '');
            } else if (sortField === 'startDate') {
                comp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            } else if (sortField === 'status') {
                comp = (a.isClosed ? 1 : 0) - (b.isClosed ? 1 : 0);
            }
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [periods, searchQuery, statusFilter, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredPeriods.length / pageSize) || 1;
    const paginatedPeriods = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPeriods.slice(start, start + pageSize);
    }, [filteredPeriods, currentPage, pageSize]);

    // KPI Metrics
    const stats = useMemo(() => {
        const total = periods.length;
        const openCount = periods.filter((p) => !p.isClosed).length;
        const closedCount = periods.filter((p) => p.isClosed).length;
        const allOpen = total > 0 && openCount === total;
        const allClosed = total > 0 && closedCount === total;

        return { total, openCount, closedCount, allOpen, allClosed };
    }, [periods]);

    // Checkbox selections
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedPeriods.map((p) => p.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    // Close / Reopen actions
    const handleConfirmAction = async () => {
        if (!confirmModal.period) return;
        setConfirmModal((prev) => ({ ...prev, loading: true }));

        try {
            if (confirmModal.action === 'close') {
                await fiscalService.closeFiscalPeriod(confirmModal.period.id);
                showToast(`Dövr ${confirmModal.period.periodNumber} uğurla bağlandı.`);
            } else {
                await fiscalService.reopenFiscalPeriod(confirmModal.period.id);
                showToast(`Dövr ${confirmModal.period.periodNumber} yenidən açıldı.`);
            }
            setConfirmModal({ open: false, action: 'close', period: null, loading: false });
            if (selectedPeriod?.id === confirmModal.period.id) {
                setSelectedPeriod(null);
            }
            await loadPeriods(true);
        } catch (err: any) {
            console.error('Failed to execute period action:', err);
            showToast(err.message || 'Əməliyyat zamanı xəta baş verdi.');
            setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
    };

    // Create Fiscal Year
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');

        try {
            await fiscalService.createFiscalPeriod({
                fiscalYear: formYear,
                startDate: formStartDate,
                endDate: formEndDate,
                notes: formNotes,
                createFullYear: true,
            });

            showToast(`${formYear}-ci il maliyyə ili və 12 aylıq dövrlər uğurla yaradıldı!`);
            setShowCreateModal(false);
            setFiscalYear(formYear);
            await loadPeriods(true);
        } catch (err: any) {
            console.error('Failed to create fiscal year:', err);
            setCreateError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Maliyyə ilini yaradarkən xəta baş verdi.'
            );
        } finally {
            setCreateLoading(false);
        }
    };

    const formatDate = (dStr: string) => {
        if (!dStr) return '-';
        try {
            const d = new Date(dStr);
            if (isNaN(d.getTime())) return dStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        } catch {
            return dStr;
        }
    };

    const isColumnVisible = (key: string) => {
        const col = columns.find((c) => c.key === key);
        return col ? col.visible : true;
    };

    const toggleColumn = (key: string) => {
        setColumns((prev) =>
            prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
        );
    };

    const getMonthName = (monthNum: number) => {
        const key = `months.${monthNum}`;
        const defaultNames = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
        return t(key, {}, defaultNames[monthNum] || `Ay ${monthNum}`);
    };

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & + Yarat button) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('nav.reports', {}, 'Maliyyə Hesabatları')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('nav.fiscalPeriods', {}, 'Maliyyə Dövrləri')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Fiscal Year Selector */}
                    <div className="relative" ref={yearRef}>
                        <button
                            type="button"
                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] hover:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
                        >
                            <CalendarDaysIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold">{fiscalYear}</span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0 ml-1" />
                        </button>

                        {isYearDropdownOpen && (
                            <div className="absolute top-9 right-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[currentCalendarYear - 1, currentCalendarYear, currentCalendarYear + 1, currentCalendarYear + 2].map((y) => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => {
                                            setFiscalYear(y);
                                            setIsYearDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            fiscalYear === y
                                                ? 'bg-[#2C2C2E] text-white font-semibold'
                                                : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => loadPeriods(true)}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* + Yarat button */}
                    <button
                        onClick={() => {
                            setFormYear(fiscalYear);
                            setFormStartDate(`${fiscalYear}-01-01`);
                            setFormEndDate(`${fiscalYear}-12-31`);
                            setFormNotes(`${fiscalYear}`);
                            setCreateError('');
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('common.create', {}, 'Yarat')}</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* 4 Premium Dark CRM KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{t('accounting.currentFiscalYear', {}, 'Cari Maliyyə İli')}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                            12 {t('accounting.months', {}, 'Ay')}
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-white mt-2">
                        {fiscalYear}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">{t('common.total', {}, 'Cəmi')} {stats.total} {t('accounting.periodCount', {}, 'əməliyyat dövrü')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{t('accounting.openPeriods', {}, 'Açıq Dövrlər')}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                            {t('common.active', {}, 'Aktiv')}
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-400 mt-2">
                        {stats.openCount}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">{t('accounting.operationsAllowed', {}, 'Əməliyyat aparılmasına icazə verilir')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{t('accounting.closedPeriods', {}, 'Bağlanmış Dövrlər')}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                            {t('accounting.closed', {}, 'Bağlı')}
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-[#A1A1AA] mt-2">
                        {stats.closedCount}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">{t('accounting.closedForEdits', {}, 'Dəyişikliklərə qapalı dövrlər')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">{t('accounting.yearEndStatus', {}, 'İl Sonu Statusu')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            stats.allClosed
                                ? 'bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]'
                                : 'bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30'
                        }`}>
                            {stats.allClosed ? t('accounting.closed', {}, 'Bağlanıb') : t('accounting.currentYear', {}, 'Cari İldir')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {stats.allClosed ? (
                            <>
                                <LockClosedIcon className="w-5 h-5 text-[#A1A1AA] shrink-0" />
                                <span className="text-sm font-bold text-[#A1A1AA]">{t('accounting.yearCompleted', {}, 'İl Tamamlanıb')}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-sm font-bold text-emerald-400">{t('accounting.yearOpen', {}, 'İl Açıqdır')}</span>
                            </>
                        )}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">{t('accounting.fiscalYearClosingState', {}, 'Maliyyə ilinin bağlanış vəziyyəti')}</span>
                </div>
            </div>

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder={t('accounting.searchPeriods', {}, 'Dövr adı və ya nömrəsi ilə axtar...')}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-56 sm:w-72 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between min-w-[120px] bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">{statusFilter === 'Status' ? t('common.all', {}, 'Bütün Statuslar') : statusFilter}</span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0 ml-1.5" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {['Status', 'Açıq', 'Bağlı'].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(st as any);
                                            setIsStatusDropdownOpen(false);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            statusFilter === st ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {st === 'Status' ? t('common.all', {}, 'Bütün Statuslar') : st === 'Açıq' ? t('accounting.open', {}, 'Açıq') : t('accounting.closed', {}, 'Bağlı')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filtr Popover Button */}
                    <div className="relative" ref={filterRef}>
                        <button
                            type="button"
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                                activeFilterCount > 0 || isFilterPopoverOpen
                                    ? 'bg-[#27272A] border-white/40 text-white'
                                    : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Interactive Filter Popover */}
                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 left-0 w-72 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <span className="font-bold text-white">{t('common.allFilters', {}, 'Dövr Filtrləri')}</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setStatusFilter('Status');
                                            }}
                                            className="text-[11px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                        >
                                            {t('common.reset', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[11px] text-[#A1A1AA] font-semibold block">{t('accounting.fiscalYear', {}, 'Maliyyə İli')}: {fiscalYear}</span>
                                    <p className="text-[11px] text-[#71717A]">
                                        {t('accounting.useYearDropdownHint', {}, 'İllər üzrə filtrləmək üçün yuxarı başlıqdakı il seçicisindən istifadə edin.')}
                                    </p>
                                </div>

                                <div className="pt-2 flex justify-end gap-2 border-t border-[#2C2C2E]">
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer"
                                    >
                                        {t('common.apply', {}, 'Tətbiq et')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right utility buttons */}
                <div className="flex items-center gap-1.5 ml-auto">
                    {/* Columns Dropdown */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            type="button"
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('accounting.columns', {}, 'Sütunlar')}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <div className="font-bold text-white px-1.5 pb-1 border-b border-[#2C2C2E]">{t('accounting.columns', {}, 'Sütunlar')}</div>
                                {columns.map((col) => (
                                    <label key={col.key} className="flex items-center gap-2 px-1.5 py-1 hover:bg-[#2C2C2E]/60 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={col.visible}
                                            onChange={() => toggleColumn(col.key)}
                                            className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0"
                                        />
                                        <span>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortRef}>
                        <button
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.sort', {}, 'Sıralama')}
                        >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                        </button>
                        {isSortOpen && (
                            <div className="absolute top-9 right-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] flex flex-col animate-in fade-in duration-150">
                                {[
                                    { key: 'periodNumber', label: t('accounting.periodNumber', {}, 'Dövr №') },
                                    { key: 'name', label: t('accounting.periodName', {}, 'Dövrün Adı') },
                                    { key: 'startDate', label: t('common.startDate', {}, 'Başlama Tarixi') },
                                    { key: 'status', label: t('common.status', {}, 'Status') },
                                ].map((s) => (
                                    <button
                                        key={s.key}
                                        onClick={() => {
                                            if (sortField === s.key) {
                                                setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
                                            } else {
                                                setSortField(s.key as any);
                                                setSortDirection('asc');
                                            }
                                            setIsSortOpen(false);
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer flex items-center justify-between"
                                    >
                                        <span>{s.label}</span>
                                        {sortField === s.key && (
                                            <span className="text-[10px] text-emerald-400 font-bold font-mono">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Table Card ─── */}
            <div className="rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                                <th className="py-3 px-3 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            paginatedPeriods.length > 0 &&
                                             selectedRows.length === paginatedPeriods.length
                                        }
                                        className="rounded bg-[#121214] border-[#27272A] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {isColumnVisible('periodNumber') && (
                                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('periodNumber'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        {t('accounting.periodNumber', {}, 'Dövr №')} {sortField === 'periodNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('name') && (
                                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('name'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        {t('accounting.periodName', {}, 'Dövrün Adı')} {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('startDate') && (
                                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('startDate'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        {t('common.startDate', {}, 'Başlama Tarixi')} {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('endDate') && (
                                    <th className="py-3 px-3">{t('common.endDate', {}, 'Bitmə Tarixi')}</th>
                                )}
                                {isColumnVisible('status') && (
                                    <th className="py-3 px-3 text-center">{t('common.status', {}, 'Status')}</th>
                                )}
                                {isColumnVisible('notes') && (
                                    <th className="py-3 px-3">{t('common.notes', {}, 'Qeydlər')}</th>
                                )}
                                <th className="py-3 px-3 text-right">{t('common.actions', {}, 'Fəaliyyət')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-14 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-400" />
                                            <span>{t('common.loading', {}, 'Maliyyə dövrləri yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedPeriods.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-14 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <CalendarDaysIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {searchQuery || statusFilter !== 'Status'
                                                        ? t('accounting.noPeriodsFound', {}, 'Axtarış üzrə heç bir dövr tapılmadı')
                                                        : t('accounting.noPeriodsForYear', { year: fiscalYear }, `${fiscalYear}-ci il üçün maliyyə dövrləri mövcud deyil`)}
                                                </p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">
                                                    {t('accounting.createFiscalYearHint', {}, 'Yeni maliyyə ili və 12 aylıq əməliyyat dövrü formalaşdırmaq üçün Yarat düyməsinə klikləyin')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setFormYear(fiscalYear);
                                                    setFormStartDate(`${fiscalYear}-01-01`);
                                                    setFormEndDate(`${fiscalYear}-12-31`);
                                                    setFormNotes(`${fiscalYear}`);
                                                    setCreateError('');
                                                    setShowCreateModal(true);
                                                }}
                                                className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                                <span>{t('accounting.createFiscalYear', {}, 'İli Yarat')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPeriods.map((p) => {
                                    const isSelected = selectedRows.includes(p.id);
                                    const isClosed = Boolean(p.isClosed);

                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedPeriod(p)}
                                            className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                                                isSelected ? 'bg-white/[0.02]' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(p.id)}
                                                    className="rounded bg-[#121214] border-[#27272A] text-white focus:ring-0 cursor-pointer"
                                                />
                                            </td>
                                            {isColumnVisible('periodNumber') && (
                                                <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                                                    {t('accounting.periodNumber', {}, 'Dövr')} {p.periodNumber < 10 ? `0${p.periodNumber}` : p.periodNumber}
                                                </td>
                                            )}
                                            {isColumnVisible('name') && (
                                                <td className="py-3 px-3 font-semibold text-white">
                                                    {p.name || `${getMonthName(p.periodNumber)} (${p.fiscalYear})`}
                                                </td>
                                            )}
                                            {isColumnVisible('startDate') && (
                                                <td className="py-3 px-3 font-mono text-[#A1A1AA]">
                                                    {formatDate(p.startDate)}
                                                </td>
                                            )}
                                            {isColumnVisible('endDate') && (
                                                <td className="py-3 px-3 font-mono text-[#A1A1AA]">
                                                    {formatDate(p.endDate)}
                                                </td>
                                            )}
                                            {isColumnVisible('status') && (
                                                <td className="py-3 px-3 text-center">
                                                    {!isClosed ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                                                            <LockOpenIcon className="w-3 h-3" />
                                                            <span>{t('accounting.open', {}, 'Açıq')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                                                            <LockClosedIcon className="w-3 h-3" />
                                                            <span>{t('accounting.closed', {}, 'Bağlı')}</span>
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            {isColumnVisible('notes') && (
                                                <td className="py-3 px-3 text-[#A1A1AA] max-w-xs truncate">
                                                    {p.notes || '-'}
                                                </td>
                                            )}
                                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {!isClosed ? (
                                                        <button
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                action: 'close',
                                                                period: p,
                                                                loading: false,
                                                            })}
                                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-rose-500/30 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold transition-colors cursor-pointer"
                                                            title={t('accounting.closePeriod', {}, 'Dövrü Bağla')}
                                                        >
                                                            <LockClosedIcon className="w-3 h-3 text-rose-400" />
                                                            <span>{t('accounting.close', {}, 'Bağla')}</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                action: 'reopen',
                                                                period: p,
                                                                loading: false,
                                                            })}
                                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-emerald-500/30 text-[#A1A1AA] hover:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-semibold transition-colors cursor-pointer"
                                                            title={t('accounting.reopenPeriod', {}, 'Dövrü Yenidən Aç')}
                                                        >
                                                            <LockOpenIcon className="w-3 h-3 text-emerald-400" />
                                                            <span>{t('accounting.open', {}, 'Aç')}</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedPeriod(p)}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title={t('common.details', {}, 'Ətraflı Bax')}
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Pagination Bar */}
                <div className="p-3 bg-[#141416] border-t border-[#27272A] flex items-center justify-between text-xs text-[#71717A]">
                    <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-xl border border-[#27272A]">
                        {[20, 50, 100].map((size) => (
                            <button
                                key={size}
                                onClick={() => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    pageSize === size ? 'bg-[#27272A] text-white' : 'hover:text-white'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <span>
                        {filteredPeriods.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredPeriods.length
                              )} ${t('common.of', {}, '/')} ${filteredPeriods.length}`}
                    </span>
                </div>
            </div>

            {/* Quick Period Detail Drawer (Slide-over) */}
            {selectedPeriod && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setSelectedPeriod(null)}
                    />
                    <div className="relative w-full max-w-lg bg-[#18181B] border-l border-[#27272A] p-6 shadow-2xl overflow-y-auto space-y-6 z-10 flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-[#27272A]">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-emerald-400 font-bold text-lg">
                                            {t('accounting.periodNumber', {}, 'Dövr')} {selectedPeriod.periodNumber < 10 ? `0${selectedPeriod.periodNumber}` : selectedPeriod.periodNumber}
                                        </span>
                                        {!selectedPeriod.isClosed ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                                                <LockOpenIcon className="w-3 h-3" />
                                                <span>{t('accounting.open', {}, 'Açıq')}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                                                <LockClosedIcon className="w-3 h-3" />
                                                <span>{t('accounting.closed', {}, 'Bağlı')}</span>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-extrabold text-white mt-1">
                                        {selectedPeriod.name || `${getMonthName(selectedPeriod.periodNumber)} (${selectedPeriod.fiscalYear})`}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedPeriod(null)}
                                    className="p-2 rounded-xl bg-[#121214] border border-[#27272A] text-[#A1A1AA] hover:text-white cursor-pointer"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] space-y-2">
                                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">{t('accounting.periodDetails', {}, 'Dövr Məlumatları')}</span>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-[#71717A] block">{t('accounting.fiscalYear', {}, 'Maliyyə İli')}:</span>
                                            <span className="font-bold text-white">{selectedPeriod.fiscalYear}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#71717A] block">{t('accounting.periodOrder', {}, 'Dövr Sırası')}:</span>
                                            <span className="font-bold text-white">{selectedPeriod.periodNumber} / 12</span>
                                        </div>
                                        <div>
                                            <span className="text-[#71717A] block">{t('common.startDate', {}, 'Başlama Tarixi')}:</span>
                                            <span className="font-mono text-white">{formatDate(selectedPeriod.startDate)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#71717A] block">{t('common.endDate', {}, 'Bitmə Tarixi')}:</span>
                                            <span className="font-mono text-white">{formatDate(selectedPeriod.endDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedPeriod.notes && (
                                    <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A]">
                                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">{t('common.notes', {}, 'Qeydlər')}</span>
                                        <p className="text-xs text-white">{selectedPeriod.notes}</p>
                                    </div>
                                )}

                                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#121214] to-[#121214] border border-emerald-500/20 text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                                        <CheckCircleIcon className="w-4 h-4 shrink-0" />
                                        <span>{t('accounting.rulesTitle', {}, 'Əməliyyat Qaydaları')}</span>
                                    </div>
                                    <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                                        {t('accounting.rulesDesc', {}, 'Maliyyə dövrü açıq olduqda jurnal qeydləri, hesab-fakturalar və ödənişlər daxil edilə bilər. Dövr bağlandıqdan sonra qeydlərə düzəliş edilməsi məhdudlaşdırılır.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="pt-4 border-t border-[#27272A] flex items-center gap-3">
                            {!selectedPeriod.isClosed ? (
                                <button
                                    onClick={() => {
                                        setConfirmModal({
                                            open: true,
                                            action: 'close',
                                            period: selectedPeriod,
                                            loading: false,
                                        });
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-center text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('accounting.closePeriod', {}, 'Dövrü Bağla')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setConfirmModal({
                                            open: true,
                                            action: 'reopen',
                                            period: selectedPeriod,
                                            loading: false,
                                        });
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-center text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('accounting.reopenPeriod', {}, 'Dövrü Yenidən Aç')}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedPeriod(null)}
                                className="px-4 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {t('common.close', {}, 'Bağla')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── CREATE FISCAL YEAR MODAL ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('accounting.createFiscalYearTitle', {}, 'Yeni Maliyyə İli Yarat')}</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">{t('accounting.createFiscalYearSubtitle', {}, 'İl və avtomatik 12 aylıq əməliyyat dövrlərinin formalaşdırılması')}</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error Alert */}
                        {createError && (
                            <div className="p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-start gap-2.5">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{createError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('accounting.fiscalYear', {}, 'Maliyyə İli (İl Nömrəsi)')} *</label>
                                <input
                                    type="number"
                                    required
                                    min="2020"
                                    max="2035"
                                    value={formYear}
                                    onChange={(e) => {
                                        const y = Number(e.target.value) || currentCalendarYear;
                                        setFormYear(y);
                                        setFormStartDate(`${y}-01-01`);
                                        setFormEndDate(`${y}-12-31`);
                                        setFormNotes(`${y}`);
                                    }}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.startDate', {}, 'Başlama Tarixi')} *</label>
                                    <div className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] focus-within:border-white transition-colors">
                                        <input
                                            type="date"
                                            required
                                            value={formStartDate}
                                            onChange={(e) => setFormStartDate(e.target.value)}
                                            className="w-full bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 p-0 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.endDate', {}, 'Bitmə Tarixi')} *</label>
                                    <div className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] focus-within:border-white transition-colors">
                                        <input
                                            type="date"
                                            required
                                            value={formEndDate}
                                            onChange={(e) => setFormEndDate(e.target.value)}
                                            className="w-full bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 p-0 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.notes', {}, 'Qeydlər')}</label>
                                <input
                                    type="text"
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    placeholder={t('accounting.fiscalYearNotesPlaceholder', {}, 'Məs: 2026-cı il üçün əməliyyat dövrləri')}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-[#A1A1AA] space-y-1">
                                <span className="text-white font-semibold flex items-center gap-1.5">
                                    <CalendarDaysIcon className="w-4 h-4 text-emerald-400" />
                                    <span>{t('accounting.autoPeriods', {}, 'Avtomatik Dövrlər')}</span>
                                </span>
                                <p className="text-[11px]">
                                    {t('accounting.autoPeriodsDesc', {}, 'İl yaradıldıqda sistem avtomatik olaraq 1-ci aydan 12-ci aya qədər hər ay üçün açıq statuslu maliyyə dövrlərini formalaşdırır.')}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? t('common.saving', {}, 'Yaradılır...') : t('accounting.createFiscalYear', {}, 'İli Yarat')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── ACTION CONFIRMATION MODAL ─── */}
            {confirmModal.open && confirmModal.period && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${
                                confirmModal.action === 'close'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                                {confirmModal.action === 'close' ? (
                                    <LockClosedIcon className="w-6 h-6" />
                                ) : (
                                    <LockOpenIcon className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    {confirmModal.action === 'close' ? t('accounting.confirmCloseTitle', {}, 'Dövrü Bağlamaq İstəyirsiniz?') : t('accounting.confirmReopenTitle', {}, 'Dövrü Yenidən Açmaq İstəyirsiniz?')}
                                </h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">
                                    {confirmModal.period.name || `${t('accounting.periodNumber', {}, 'Dövr')} ${confirmModal.period.periodNumber}`} ({confirmModal.period.fiscalYear})
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-[#A1A1AA] leading-relaxed">
                            {confirmModal.action === 'close'
                                ? t('accounting.closePeriodWarning', {}, 'Dövr bağlandıqdan sonra bu dövrün tarixlərinə aid yeni əməliyyatların (jurnal, faktura, ödəniş) daxil edilməsi məhdudlaşdırılacaq.')
                                : t('accounting.reopenPeriodNotice', {}, 'Dövr yenidən açıldıqda bu dövrün tarixlərinə yeni əməliyyatların daxil edilməsinə icazə veriləcək.')}
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                            <button
                                type="button"
                                disabled={confirmModal.loading}
                                onClick={() => setConfirmModal({ open: false, action: 'close', period: null, loading: false })}
                                className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                                {t('common.cancel', {}, 'İmtina')}
                            </button>
                            <button
                                type="button"
                                disabled={confirmModal.loading}
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50 ${
                                    confirmModal.action === 'close'
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                        : 'bg-white hover:bg-zinc-200 text-black'
                                }`}
                            >
                                {confirmModal.loading ? t('common.processing', {}, 'İcra olunur...') : confirmModal.action === 'close' ? t('accounting.closePeriod', {}, 'Dövrü Bağla') : t('accounting.open', {}, 'Dövrü Aç')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiscalPeriodsPage;

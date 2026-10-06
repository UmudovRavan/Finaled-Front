import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportsService, accountsService } from '../../api';
import type {
    TrialBalanceResponse,
    TrialBalanceItemDto,
    AccountDto,
    JournalEntryDto,
} from '../../dto';
import { formatDate } from '../../utils';
import {
    ScaleIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ViewColumnsIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    PlusIcon,
    XMarkIcon,
    EyeIcon,
    ArrowTopRightOnSquareIcon,
    ChevronDownIcon,
    CheckIcon,
    Bars3Icon,
    DocumentTextIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export const TrialBalancePage: React.FC = () => {
    const navigate = useNavigate();
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<TrialBalanceResponse | null>(null);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string>('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Kateqoriya');
    const [onlyWithBalance, setOnlyWithBalance] = useState(false);
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // Dropdowns
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'code' | 'name' | 'debit' | 'credit' | 'balance'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility
    const [columns, setColumns] = useState([
        { key: 'code', label: 'Hesab Kodu', visible: true },
        { key: 'name', label: 'Hesabın Adı', visible: true },
        { key: 'category', label: 'Kateqoriya', visible: true },
        { key: 'opening', label: 'İlkin Qalıq', visible: true },
        { key: 'debit', label: 'Debet Dövriyyəsi', visible: true },
        { key: 'credit', label: 'Kredit Dövriyyəsi', visible: true },
        { key: 'balance', label: 'Xalis Son Qalıq', visible: true },
    ]);

    // Detail Drawer State
    const [selectedItem, setSelectedItem] = useState<TrialBalanceItemDto | null>(null);
    const [drawerEntries, setDrawerEntries] = useState<JournalEntryDto[]>([]);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createDate, setCreateDate] = useState(new Date().toISOString().split('T')[0]);
    const [createRef, setCreateRef] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createLines, setCreateLines] = useState<
        { accountId: string; description: string; debit: number | string; credit: number | string; currency: string }[]
    >([
        { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
        { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
    ]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Refs
    const categoryRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Outside click handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterPopoverOpen(false);
            }
            if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
                setIsColumnsOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const loadData = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const [reportRes, accsRes] = await Promise.allSettled([
                reportsService.getTrialBalance(asOfDate),
                accountsService.getAccounts(),
            ]);

            if (reportRes.status === 'fulfilled') {
                setData(reportRes.value);
            } else {
                console.error('Failed to load trial balance:', reportRes.reason);
                setError(
                    reportRes.reason?.response?.data?.detail ||
                    reportRes.reason?.response?.data?.message ||
                    'Sınaq balansını yükləyərkən xəta baş verdi.'
                );
            }

            if (accsRes.status === 'fulfilled') {
                setAccounts(Array.isArray(accsRes.value) ? accsRes.value : []);
            }
        } catch (err: any) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [asOfDate]);

    // Format currency
    const formatCurrency = (val?: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val ?? 0);
    };

    // Safe Items extraction
    const rawItems: TrialBalanceItemDto[] = useMemo(() => {
        if (!data) return [];
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.lines)) return data.lines;
        return [];
    }, [data]);

    // Unique Categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        rawItems.forEach((it) => {
            const cat = it.category || it.accountType;
            if (cat) set.add(cat);
        });
        return Array.from(set);
    }, [rawItems]);

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (selectedCategory !== 'Kateqoriya' && selectedCategory !== 'ALL') count++;
        if (onlyWithBalance) count++;
        if (minAmount) count++;
        if (maxAmount) count++;
        return count;
    }, [searchQuery, selectedCategory, onlyWithBalance, minAmount, maxAmount]);

    // Filtering
    const filteredItems = useMemo(() => {
        return rawItems.filter((item) => {
            const cat = item.category || item.accountType || '';
            const deb = Number(item.debit ?? item.debitTotal ?? 0);
            const crd = Number(item.credit ?? item.creditTotal ?? 0);
            const net = Number(item.netBalance ?? item.closingBalance ?? (deb - crd));

            // Category filter
            if (selectedCategory !== 'Kateqoriya' && selectedCategory !== 'ALL' && cat !== selectedCategory) {
                return false;
            }

            // Only with balance filter
            if (onlyWithBalance && deb === 0 && crd === 0 && net === 0) {
                return false;
            }

            // Amount range filter
            if (minAmount && Math.abs(net) < Number(minAmount)) {
                return false;
            }
            if (maxAmount && Math.abs(net) > Number(maxAmount)) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchCode = (item.accountCode || '').toLowerCase().includes(q);
                const matchName = (item.accountName || '').toLowerCase().includes(q);
                const matchCat = cat.toLowerCase().includes(q);
                if (!matchCode && !matchName && !matchCat) return false;
            }

            return true;
        });
    }, [rawItems, selectedCategory, onlyWithBalance, minAmount, maxAmount, searchQuery]);

    // Sorting
    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            let comp = 0;
            if (sortField === 'code') {
                comp = (a.accountCode || '').localeCompare(b.accountCode || '');
            } else if (sortField === 'name') {
                comp = (a.accountName || '').localeCompare(b.accountName || '');
            } else if (sortField === 'debit') {
                const dA = Number(a.debit ?? a.debitTotal ?? 0);
                const dB = Number(b.debit ?? b.debitTotal ?? 0);
                comp = dA - dB;
            } else if (sortField === 'credit') {
                const cA = Number(a.credit ?? a.creditTotal ?? 0);
                const cB = Number(b.credit ?? b.creditTotal ?? 0);
                comp = cA - cB;
            } else if (sortField === 'balance') {
                const nA = Number(a.netBalance ?? a.closingBalance ?? 0);
                const nB = Number(b.netBalance ?? b.closingBalance ?? 0);
                comp = nA - nB;
            }
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [filteredItems, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedItems.slice(start, start + pageSize);
    }, [sortedItems, currentPage, pageSize]);

    // KPI Totals
    const totals = useMemo(() => {
        const totalDebit = Number(data?.totalDebit ?? rawItems.reduce((sum, it) => sum + (it.debit ?? it.debitTotal ?? 0), 0));
        const totalCredit = Number(data?.totalCredit ?? rawItems.reduce((sum, it) => sum + (it.credit ?? it.creditTotal ?? 0), 0));
        const isBalanced = data?.isBalanced !== undefined ? data.isBalanced : Math.abs(totalDebit - totalCredit) < 0.001;
        const diff = Math.abs(totalDebit - totalCredit);
        const filteredDebit = filteredItems.reduce((s, it) => s + Number(it.debit ?? it.debitTotal ?? 0), 0);
        const filteredCredit = filteredItems.reduce((s, it) => s + Number(it.credit ?? it.creditTotal ?? 0), 0);
        const filteredNet = filteredItems.reduce((s, it) => s + Number(it.netBalance ?? it.closingBalance ?? ((it.debit ?? it.debitTotal ?? 0) - (it.credit ?? it.creditTotal ?? 0))), 0);

        return { totalDebit, totalCredit, isBalanced, diff, filteredDebit, filteredCredit, filteredNet };
    }, [data, rawItems, filteredItems]);

    // Checkbox selections
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedItems.map((it) => it.accountId));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    // Open Detail Drawer
    const handleOpenDrawer = async (item: TrialBalanceItemDto) => {
        setSelectedItem(item);
        setDrawerLoading(true);
        try {
            const res = await accountsService.getJournalEntries({ pageSize: 50 });
            if (Array.isArray(res)) {
                const target = String(item.accountId).toLowerCase();
                const matched = res.filter((entry) =>
                    entry.lines?.some((l) => String(l.accountId).toLowerCase() === target)
                );
                setDrawerEntries(matched);
            }
        } catch (err) {
            console.error('Failed to load drawer entries:', err);
        } finally {
            setDrawerLoading(false);
        }
    };

    // Export to CSV
    const exportToCsv = () => {
        const headers = ['Hesab Kodu', 'Hesab Adı', 'Kateqoriya', 'İlkin Qalıq', 'Debet Dövriyyəsi', 'Kredit Dövriyyəsi', 'Son Qalıq'];
        const rows = sortedItems.map((it) => [
            `"${it.accountCode}"`,
            `"${it.accountName.replace(/"/g, '""')}"`,
            `"${it.category || it.accountType || ''}"`,
            (it.openingBalance ?? 0).toFixed(2),
            (it.debit ?? it.debitTotal ?? 0).toFixed(2),
            (it.credit ?? it.creditTotal ?? 0).toFixed(2),
            (it.netBalance ?? it.closingBalance ?? 0).toFixed(2),
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Sinaq_Balansi_${asOfDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Sınaq Balansı CSV faylı uğurla endirildi.');
    };

    // Create Modal Line Management
    const handleAddLine = () => {
        setCreateLines((prev) => [
            ...prev,
            { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
        ]);
    };

    const handleRemoveLine = (idx: number) => {
        if (createLines.length <= 2) return;
        setCreateLines((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: string, value: any) => {
        setCreateLines((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const totalModalDebit = useMemo(() => {
        return createLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    }, [createLines]);

    const totalModalCredit = useMemo(() => {
        return createLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    }, [createLines]);

    const isModalBalanced = Math.abs(totalModalDebit - totalModalCredit) < 0.001 && totalModalDebit > 0;

    const handleCreateJournal = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!createDesc.trim()) {
            setCreateError('Zəhmət olmasa əməliyyat təsvirini daxil edin.');
            return;
        }

        if (!isModalBalanced) {
            setCreateError('Debet və Kredit məbləğləri bir-birinə bərabər və 0-dan böyük olmalıdır!');
            return;
        }

        const validLines = createLines.filter((l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0));
        if (validLines.length < 2) {
            setCreateError('Ən azı 2 hesab üzrə sətr doldurulmalıdır.');
            return;
        }

        setCreateLoading(true);
        try {
            await accountsService.createJournalEntry({
                date: createDate,
                reference: createRef || undefined,
                description: createDesc,
                lines: validLines.map((l) => ({
                    accountId: l.accountId,
                    debit: Number(l.debit) || 0,
                    credit: Number(l.credit) || 0,
                    currency: l.currency || 'AZN',
                    exchangeRate: 1.0,
                    description: l.description || createDesc,
                })),
            });

            showToast('Jurnal qeydi uğurla yaradıldı və sınaq balansı yeniləndi.');
            setShowCreateModal(false);
            setCreateDesc('');
            setCreateRef('');
            setCreateLines([
                { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
                { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
            ]);
            await loadData(true);
        } catch (err: any) {
            console.error('Failed to create journal entry:', err);
            setCreateError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Jurnal qeydini yaradarkən xəta baş verdi.'
            );
        } finally {
            setCreateLoading(false);
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

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & + Yarat button) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Maliyyə Hesabatları</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>Sınaq Balansı</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Date Selector */}
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] hover:border-zinc-700 rounded-xl px-3 py-1.5 transition-colors">
                        <span className="text-[11px] text-[#A1A1AA] font-semibold select-none">Tarix:</span>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 p-0 cursor-pointer [color-scheme:dark] shadow-none"
                        />
                    </div>


                    {/* Refresh */}
                    <button
                        onClick={() => loadData(true)}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export CSV */}
                    <button
                        onClick={exportToCsv}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="İxrac (CSV)"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>

                    {/* + Yarat button */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yarat</span>
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

            {/* Error Banner */}
            {error && (
                <div className="p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                        <span className="font-semibold">{error}</span>
                    </div>
                    <button
                        onClick={() => loadData(true)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-bold text-rose-300 transition-colors cursor-pointer"
                    >
                        Yenidən yoxla
                    </button>
                </div>
            )}

            {/* 4 Premium Dark CRM KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Cəmi Debet</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                            Dövriyyə
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-400 mt-2">
                        {formatCurrency(totals.totalDebit)}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">Dövr üzrə ümumi debet dövriyyəsi</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Cəmi Kredit</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#122336] text-[#60A5FA] border border-[#3B82F6]/30">
                            Dövriyyə
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-blue-400 mt-2">
                        {formatCurrency(totals.totalCredit)}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">Dövr üzrə ümumi kredit dövriyyəsi</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Balans Statusu</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            totals.isBalanced
                                ? 'bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30'
                                : 'bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30'
                        }`}>
                            {totals.isBalanced ? 'Bərabərdir' : 'Fərq var'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {totals.isBalanced ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-sm font-bold text-emerald-400">Balans Tamdır</span>
                            </>
                        ) : (
                            <>
                                <ExclamationTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
                                <span className="text-sm font-bold text-rose-400">Fərq: {formatCurrency(totals.diff)}</span>
                            </>
                        )}
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">Debet = Kredit auditi</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Aktiv Hesablar</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                            Say
                        </span>
                    </div>
                    <div className="text-xl font-black font-mono text-white mt-2">
                        {rawItems.length} <span className="text-xs text-[#71717A] font-normal">hesab</span>
                    </div>
                    <span className="text-[10px] text-[#71717A] mt-1">Filtrlənmiş: {filteredItems.length} hesab</span>
                </div>
            </div>

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Hesab kodu və ya adı ilə axtar..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-56 sm:w-72 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Kateqoriya Dropdown */}
                    <div className="relative" ref={categoryRef}>
                        <button
                            type="button"
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className="flex items-center justify-between min-w-[130px] bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">{selectedCategory === 'ALL' ? 'Bütün Kateqoriyalar' : selectedCategory}</span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0 ml-1.5" />
                        </button>

                        {isCategoryDropdownOpen && (
                            <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('ALL');
                                        setIsCategoryDropdownOpen(false);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                        selectedCategory === 'ALL' || selectedCategory === 'Kateqoriya'
                                            ? 'bg-[#2C2C2E] text-white font-semibold'
                                            : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                    }`}
                                >
                                    Bütün Kateqoriyalar ({rawItems.length})
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setIsCategoryDropdownOpen(false);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedCategory === cat
                                                ? 'bg-[#2C2C2E] text-white font-semibold'
                                                : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {cat} ({rawItems.filter((i) => (i.category || i.accountType) === cat).length})
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
                            <span>Filtr</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-4 h-4 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Interactive Filter Popover */}
                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 left-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <span className="font-bold text-white">Sınaq Balansı Filtrləri</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory('Kateqoriya');
                                                setOnlyWithBalance(false);
                                                setMinAmount('');
                                                setMaxAmount('');
                                            }}
                                            className="text-[11px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                        >
                                            Sıfırla
                                        </button>
                                    )}
                                </div>

                                <label className="flex items-center gap-2 text-xs text-[#A1A1AA] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyWithBalance}
                                        onChange={(e) => setOnlyWithBalance(e.target.checked)}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                    <span>Yalnız qalıqlı hesabları göstər</span>
                                </label>

                                <div>
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold block mb-1">Məbləğ Aralığı (AZN)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            className="bg-[#121214] border border-[#2C2C2E] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            className="bg-[#121214] border border-[#2C2C2E] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2 border-t border-[#2C2C2E]">
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer"
                                    >
                                        Tətbiq et
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
                            title="Sütunlar"
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <div className="font-bold text-white px-1.5 pb-1 border-b border-[#2C2C2E]">Sütunlar</div>
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
                            title="Sıralama"
                        >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                        </button>
                        {isSortOpen && (
                            <div className="absolute top-9 right-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] flex flex-col animate-in fade-in duration-150">
                                {[
                                    { key: 'code', label: 'Kod' },
                                    { key: 'name', label: 'Hesab Adı' },
                                    { key: 'debit', label: 'Debet' },
                                    { key: 'credit', label: 'Kredit' },
                                    { key: 'balance', label: 'Son Qalıq' },
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
                                            paginatedItems.length > 0 &&
                                            selectedRows.length === paginatedItems.length
                                        }
                                        className="rounded bg-[#121214] border-[#27272A] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {isColumnVisible('code') && (
                                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('code'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        Hesab Kodu {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('name') && (
                                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('name'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        Hesab Adı {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('category') && (
                                    <th className="py-3 px-3 text-center">Kateqoriya</th>
                                )}
                                {isColumnVisible('opening') && (
                                    <th className="py-3 px-3 text-right">İlkin Qalıq</th>
                                )}
                                {isColumnVisible('debit') && (
                                    <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('debit'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        Debet Dövriyyəsi {sortField === 'debit' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('credit') && (
                                    <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('credit'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        Kredit Dövriyyəsi {sortField === 'credit' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                {isColumnVisible('balance') && (
                                    <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('balance'); setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc')); }}>
                                        Xalis Son Qalıq {sortField === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                )}
                                <th className="py-3 px-3 text-right">Fəaliyyət</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-14 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-400" />
                                            <span>Sınaq balansı məlumatları hesablanır...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-14 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <ScaleIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {searchQuery || (selectedCategory !== 'ALL' && selectedCategory !== 'Kateqoriya')
                                                        ? 'Axtarış üzrə heç bir hesab tapılmadı'
                                                        : 'Sınaq balansı üzrə qeyd tapılmadı'}
                                                </p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">
                                                    Sınaq balansı jurnala təsdiqlənmiş əməliyyatlar daxil edildikdə avtomatik formalaşır
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                                <span>İlk Qeydi Yarat</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => {
                                    const deb = Number(item.debit ?? item.debitTotal ?? 0);
                                    const crd = Number(item.credit ?? item.creditTotal ?? 0);
                                    const net = Number(item.netBalance ?? item.closingBalance ?? (deb - crd));
                                    const opening = Number(item.openingBalance ?? 0);
                                    const cat = item.category || item.accountType || 'Asset';
                                    const isSelected = selectedRows.includes(item.accountId);

                                    return (
                                        <tr
                                            key={item.accountId}
                                            onClick={() => handleOpenDrawer(item)}
                                            className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                                                isSelected ? 'bg-white/[0.02]' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(item.accountId)}
                                                    className="rounded bg-[#121214] border-[#27272A] text-white focus:ring-0 cursor-pointer"
                                                />
                                            </td>
                                            {isColumnVisible('code') && (
                                                <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                                                    {item.accountCode}
                                                </td>
                                            )}
                                            {isColumnVisible('name') && (
                                                <td className="py-3 px-3 font-semibold text-white">
                                                    {item.accountName}
                                                </td>
                                            )}
                                            {isColumnVisible('category') && (
                                                <td className="py-3 px-3 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                                                        {cat}
                                                    </span>
                                                </td>
                                            )}
                                            {isColumnVisible('opening') && (
                                                <td className="py-3 px-3 text-right font-mono text-[#71717A]">
                                                    {formatCurrency(opening)}
                                                </td>
                                            )}
                                            {isColumnVisible('debit') && (
                                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                                                    {formatCurrency(deb)}
                                                </td>
                                            )}
                                            {isColumnVisible('credit') && (
                                                <td className="py-3 px-3 text-right font-mono font-bold text-blue-400">
                                                    {formatCurrency(crd)}
                                                </td>
                                            )}
                                            {isColumnVisible('balance') && (
                                                <td className={`py-3 px-3 text-right font-mono font-bold ${
                                                    net < 0 ? 'text-rose-400' : 'text-white'
                                                }`}>
                                                    {formatCurrency(net)}
                                                </td>
                                            )}
                                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenDrawer(item)}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title="Ətraflı Bax"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <Link
                                                        to={`/accounts/${item.accountId}`}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title="Hesab Səhifəsinə Keç"
                                                    >
                                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {filteredItems.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-[#27272A] bg-[#18181B] font-mono text-xs font-bold">
                                    <td colSpan={4} className="py-3 px-3 font-sans text-white">Cəmi ({filteredItems.length} hesab):</td>
                                    {isColumnVisible('opening') && (
                                        <td className="py-3 px-3 text-right text-[#71717A]">
                                            {formatCurrency(filteredItems.reduce((s, it) => s + Number(it.openingBalance || 0), 0))}
                                        </td>
                                    )}
                                    {isColumnVisible('debit') && (
                                        <td className="py-3 px-3 text-right text-emerald-400">
                                            {formatCurrency(totals.filteredDebit)}
                                        </td>
                                    )}
                                    {isColumnVisible('credit') && (
                                        <td className="py-3 px-3 text-right text-blue-400">
                                            {formatCurrency(totals.filteredCredit)}
                                        </td>
                                    )}
                                    {isColumnVisible('balance') && (
                                        <td className="py-3 px-3 text-right text-white">
                                            {formatCurrency(totals.filteredNet)}
                                        </td>
                                    )}
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
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
                        {sortedItems.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  sortedItems.length
                              )} of ${sortedItems.length}`}
                    </span>
                </div>
            </div>

            {/* Quick Account Ledger Drawer (Slide-over) */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setSelectedItem(null)}
                    />
                    <div className="relative w-full max-w-xl bg-[#18181B] border-l border-[#27272A] p-6 shadow-2xl overflow-y-auto space-y-6 z-10 flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-[#27272A]">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-emerald-400 font-bold text-lg">
                                            {selectedItem.accountCode}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                                            {selectedItem.category || selectedItem.accountType || 'Asset'}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-white mt-1">
                                        {selectedItem.accountName}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 rounded-xl bg-[#121214] border border-[#27272A] text-[#A1A1AA] hover:text-white cursor-pointer"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Debet Dövriyyəsi</span>
                                    <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
                                        {formatCurrency(Number(selectedItem.debit ?? selectedItem.debitTotal ?? 0))}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Kredit Dövriyyəsi</span>
                                    <p className="text-sm font-bold font-mono text-blue-400 mt-1">
                                        {formatCurrency(Number(selectedItem.credit ?? selectedItem.creditTotal ?? 0))}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Son Qalıq</span>
                                    <p className="text-sm font-bold font-mono text-white mt-1">
                                        {formatCurrency(Number(selectedItem.netBalance ?? selectedItem.closingBalance ?? 0))}
                                    </p>
                                </div>
                            </div>

                            {/* Recent Ledger Transactions */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <DocumentTextIcon className="w-4 h-4 text-emerald-400" />
                                        <span>Son Jurnal Əməliyyatları</span>
                                    </h3>
                                    <Link
                                        to={`/accounts/${selectedItem.accountId}`}
                                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                        <span>Hesabın tam tarixçəsi</span>
                                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                    </Link>
                                </div>

                                {drawerLoading ? (
                                    <div className="py-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-400" />
                                        <span>Əməliyyatlar yüklənir...</span>
                                    </div>
                                ) : drawerEntries.length === 0 ? (
                                    <div className="p-6 rounded-xl bg-[#121214] border border-[#27272A] text-center text-xs text-[#71717A]">
                                        Bu hesab üzrə son jurnal qeydi tapılmadı
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {drawerEntries.map((entry) => {
                                            const matchedLine = entry.lines?.find(
                                                (l) => String(l.accountId).toLowerCase() === String(selectedItem.accountId).toLowerCase()
                                            );
                                            return (
                                                <div
                                                    key={entry.id}
                                                    className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between text-xs hover:border-white/20 transition-all"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <span className="font-bold text-white">{entry.entryNumber || entry.journalNumber || 'JRN'}</span>
                                                            <span className="text-[#71717A] text-[10px]">
                                                                {formatDate(entry.date || entry.postingDate, '')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[#A1A1AA] mt-0.5 line-clamp-1">
                                                            {entry.description || 'Təsvir qeyd olunmayıb'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right font-mono font-bold">
                                                        {matchedLine && matchedLine.debit > 0 ? (
                                                            <span className="text-emerald-400">+{formatCurrency(matchedLine.debit)} (D)</span>
                                                        ) : matchedLine && matchedLine.credit > 0 ? (
                                                            <span className="text-blue-400">-{formatCurrency(matchedLine.credit)} (K)</span>
                                                        ) : (
                                                            <span className="text-white">{formatCurrency(entry.totalDebit || entry.totalAmount || 0)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="pt-4 border-t border-[#27272A] flex items-center gap-3">
                            <Link
                                to={`/accounts/${selectedItem.accountId}`}
                                className="flex-1 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-center text-xs font-semibold shadow-md transition-colors cursor-pointer"
                            >
                                Hesabın Detallarına Keç
                            </Link>
                            <Link
                                to="/journal"
                                className="px-4 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Jurnala Bax
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── CREATE JOURNAL ENTRY MODAL (Matching CRM standard) ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-3xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">Yeni Jurnal Əməliyyatı</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">Baş kitaba yeni debet/kredit qeydi daxil edin</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Inline Error */}
                        {createError && (
                            <div className="p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-start gap-2.5">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{createError}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleCreateJournal} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Tarix *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createDate}
                                        onChange={(e) => setCreateDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">İstinad № (Reference)</label>
                                    <input
                                        type="text"
                                        placeholder="məs. REF-2026-001"
                                        value={createRef}
                                        onChange={(e) => setCreateRef(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Əməliyyatın Təsviri *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="məs. İlkin kapitalın formalaşdırılması və ya xidmət haqqı"
                                    value={createDesc}
                                    onChange={(e) => setCreateDesc(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Lines Section */}
                            <div className="space-y-2 pt-2 border-t border-[#27272A]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">Əməliyyat Sətirləri</span>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {createLines.map((line, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#121214] border border-[#27272A]">
                                            <div className="flex-1 min-w-[140px]">
                                                <select
                                                    required
                                                    value={line.accountId}
                                                    onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white focus:outline-none"
                                                >
                                                    <option value="">Hesab seçin...</option>
                                                    {accounts.map((acc) => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-28">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Debet"
                                                    value={line.debit}
                                                    onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                                                />
                                            </div>

                                            <div className="w-28">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Kredit"
                                                    value={line.credit}
                                                    onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-mono font-bold text-blue-400 focus:outline-none"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLine(idx)}
                                                disabled={createLines.length <= 2}
                                                className="p-1.5 text-[#71717A] hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                title="Sil"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Sum & Status */}
                                <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-4">
                                        <div>Debet Cəmi: <span className="text-emerald-400 font-bold">{formatCurrency(totalModalDebit)}</span></div>
                                        <div>Kredit Cəmi: <span className="text-blue-400 font-bold">{formatCurrency(totalModalCredit)}</span></div>
                                    </div>
                                    <div className="font-sans font-bold">
                                        {isModalBalanced ? (
                                            <span className="text-emerald-400 flex items-center gap-1">
                                                <CheckCircleIcon className="w-4 h-4" /> Bərabərdir
                                            </span>
                                        ) : (
                                            <span className="text-rose-400">
                                                Fərq: {formatCurrency(Math.abs(totalModalDebit - totalModalCredit))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading || !isModalBalanced}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? 'Yaradılır...' : 'Qeydi Yarat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrialBalancePage;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsService } from '../../api';
import type { JournalEntryDto, AccountDto, CreateJournalEntryRequest } from '../../dto';
import { formatDate, formatDateTime, extractErrorMessage } from '../../utils';
import {
    PlusIcon,
    ArrowPathIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ViewColumnsIcon,
    EllipsisHorizontalIcon,
    ChevronDownIcon,
    XMarkIcon,
    Bars3Icon,
    CheckIcon,
    DocumentTextIcon,
    EyeIcon,
    ArrowPathRoundedSquareIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    ScaleIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

export const JournalPage: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<JournalEntryDto[]>([]);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [filterNumber, setFilterNumber] = useState('');
    const [filterDesc, setFilterDesc] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Status');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // Dropdown open states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'date' | 'number' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility
    const [columns, setColumns] = useState([
        { key: 'number', label: 'Jurnal №', visible: true },
        { key: 'date', label: 'Tarix', visible: true },
        { key: 'description', label: 'Təsvir', visible: true },
        { key: 'reference', label: 'İstinad №', visible: true },
        { key: 'debit', label: 'Debet', visible: true },
        { key: 'credit', label: 'Kredit', visible: true },
        { key: 'status', label: 'Status', visible: true },
    ]);

    // Toast
    const [toastMessage, setToastMessage] = useState('');

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

    // Reverse Modal State
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [reversingEntryId, setReversingEntryId] = useState<string | null>(null);
    const [reversalReason, setReversalReason] = useState('');
    const [reversalDate, setReversalDate] = useState(new Date().toISOString().split('T')[0]);
    const [reverseLoading, setReverseLoading] = useState(false);
    const [reverseError, setReverseError] = useState('');

    // Detail Modal State
    const [selectedEntry, setSelectedEntry] = useState<JournalEntryDto | null>(null);

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);

    const loadData = async () => {
        setIsRefreshing(true);
        try {
            const [entriesData, accountsData] = await Promise.all([
                accountsService.getJournalEntries(),
                accountsService.getAccounts(),
            ]);
            setEntries(Array.isArray(entriesData) ? entriesData : []);
            setAccounts(Array.isArray(accountsData) ? accountsData : []);
        } catch (err) {
            console.error('Failed to load journal data:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Outside click listener
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setIsColumnsOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOptionsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    // Calculate Create Modal Totals
    const totalDebit = useMemo(() => {
        return createLines.reduce((sum, l) => sum + (parseFloat(String(l.debit)) || 0), 0);
    }, [createLines]);

    const totalCredit = useMemo(() => {
        return createLines.reduce((sum, l) => sum + (parseFloat(String(l.credit)) || 0), 0);
    }, [createLines]);

    const isBalanced = useMemo(() => {
        return Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;
    }, [totalDebit, totalCredit]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterNumber.trim()) count++;
        if (filterDesc.trim()) count++;
        if (selectedStatus !== 'Status') count++;
        if (fromDate) count++;
        if (toDate) count++;
        if (minAmount) count++;
        if (maxAmount) count++;
        return count;
    }, [filterNumber, filterDesc, selectedStatus, fromDate, toDate, minAmount, maxAmount]);

    // Filter & Sort entries
    const filteredEntries = useMemo(() => {
        return entries.filter((e) => {
            if (filterNumber.trim()) {
                const num = String(e.entryNumber || '').toLowerCase();
                if (!num.includes(filterNumber.trim().toLowerCase())) return false;
            }
            if (filterDesc.trim()) {
                const desc = String(e.description || '').toLowerCase();
                const ref = String(e.reference || '').toLowerCase();
                if (!desc.includes(filterDesc.trim().toLowerCase()) && !ref.includes(filterDesc.trim().toLowerCase())) return false;
            }
            if (selectedStatus !== 'Status') {
                if (String(e.status).toLowerCase() !== selectedStatus.toLowerCase()) return false;
            }
            if (fromDate) {
                if (new Date(e.date) < new Date(fromDate)) return false;
            }
            if (toDate) {
                if (new Date(e.date) > new Date(toDate + 'T23:59:59')) return false;
            }
            if (minAmount) {
                const min = parseFloat(minAmount);
                if (!isNaN(min) && (e.totalDebit || 0) < min) return false;
            }
            if (maxAmount) {
                const max = parseFloat(maxAmount);
                if (!isNaN(max) && (e.totalDebit || 0) > max) return false;
            }
            return true;
        }).sort((a, b) => {
            if (sortField === 'date') {
                const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'number') {
                const diff = String(a.entryNumber || '').localeCompare(String(b.entryNumber || ''));
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'amount') {
                const diff = (a.totalDebit || 0) - (b.totalDebit || 0);
                return sortDirection === 'asc' ? diff : -diff;
            }
            return 0;
        });
    }, [entries, filterNumber, filterDesc, selectedStatus, fromDate, toDate, minAmount, maxAmount, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
    const paginatedEntries = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEntries.slice(start, start + pageSize);
    }, [filteredEntries, currentPage, pageSize]);

    // Handle Create Line Actions
    const handleAddLine = () => {
        setCreateLines([...createLines, { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' }]);
    };

    const handleRemoveLine = (index: number) => {
        if (createLines.length <= 2) return;
        setCreateLines(createLines.filter((_, i) => i !== index));
    };

    const handleLineChange = (index: number, field: string, val: any) => {
        const next = [...createLines];
        next[index] = { ...next[index], [field]: val };
        setCreateLines(next);
    };

    // Submit Create Journal Entry
    const handleCreateSubmit = async (e: React.FormEvent, autoPost = false) => {
        e.preventDefault();
        if (accounts.length === 0) {
            setCreateError('Hesablar Planında heç bir hesab yoxdur. Əvvəlcə hesablar əlavə edin.');
            return;
        }
        if (!createDesc.trim()) {
            setCreateError('Zəhmət olmasa jurnal qeydi üçün təsvir daxil edin.');
            return;
        }
        if (!isBalanced) {
            setCreateError(`Debet və Kredit məbləğləri mütləq bərabər olmalıdır! (Fərq: ${Math.abs(totalDebit - totalCredit).toFixed(2)} AZN)`);
            return;
        }
        for (const line of createLines) {
            if (!line.accountId) {
                setCreateError('Zəhmət olmasa hər sətir üçün hesab seçin.');
                return;
            }
            const d = parseFloat(String(line.debit)) || 0;
            const c = parseFloat(String(line.credit)) || 0;
            if (d === 0 && c === 0) {
                setCreateError('Hər sətirdə Debet və ya Kredit məbləği 0-dan böyük olmalıdır.');
                return;
            }
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            const created = await accountsService.createJournalEntry({
                date: createDate,
                reference: createRef || null,
                description: createDesc,
                lines: createLines.map((l) => ({
                    accountId: l.accountId,
                    description: l.description || createDesc,
                    debit: parseFloat(String(l.debit)) || 0,
                    credit: parseFloat(String(l.credit)) || 0,
                    currency: l.currency || 'AZN',
                })),
            });

            if (autoPost && created?.id) {
                try {
                    await accountsService.postJournalEntry(created.id);
                    showToast('Jurnal qeydi yaradıldı və Baş Kitaba təsdiqləndi (Posted)!');
                } catch {
                    showToast('Jurnal qeydi qaralama olaraq yaradıldı.');
                }
            } else {
                showToast('Yeni jurnal qeydi uğurla yaradıldı!');
            }

            setShowCreateModal(false);
            setCreateDesc('');
            setCreateRef('');
            setCreateLines([
                { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
                { accountId: '', description: '', debit: '', credit: '', currency: 'AZN' },
            ]);
            loadData();
        } catch (err: any) {
            setCreateError(extractErrorMessage(err, 'Jurnal qeydi yaradılarkən xəta baş verdi.'));
        } finally {
            setCreateLoading(false);
        }
    };

    // Post Entry
    const handlePost = async (id: string, date?: string) => {
        try {
            await accountsService.postJournalEntry(id, date);
            showToast('Qeyd baş kitaba uğurla keçirildi (Posted)!');
            loadData();
            if (selectedEntry && selectedEntry.id === id) {
                setSelectedEntry({ ...selectedEntry, status: 'Posted', postedAt: new Date().toISOString() });
            }
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Qeydi təsdiqləmək mümkün olmadı.'));
        }
    };

    // Open Reverse Modal
    const openReverseModal = (id: string) => {
        setReversingEntryId(id);
        setReversalReason('Səhv əməliyyatın ləğvi');
        setReversalDate(new Date().toISOString().split('T')[0]);
        setReverseError('');
        setShowReverseModal(true);
    };

    // Submit Reversal
    const handleReverseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reversingEntryId) return;
        setReverseLoading(true);
        setReverseError('');
        try {
            await accountsService.reverseJournalEntry(reversingEntryId, reversalReason, reversalDate);
            setShowReverseModal(false);
            showToast('Qeyd uğurla tərs çevrildi (Reversed)!');
            loadData();
            if (selectedEntry && selectedEntry.id === reversingEntryId) {
                setSelectedEntry({ ...selectedEntry, status: 'Reversed' });
            }
        } catch (err: any) {
            setReverseError(extractErrorMessage(err, 'Ləğvetmə zamanı xəta baş verdi.'));
        } finally {
            setReverseLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedEntries.map((a) => a.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((r) => r !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getStatusBadge = (status: string) => {
        const s = String(status || '').toLowerCase();
        if (s === 'posted' || s === 'approved') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Posted
                </span>
            );
        }
        if (s === 'reversed' || s === 'cancelled') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    Reversed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                Draft
            </span>
        );
    };

    const getAccountName = (accId: string) => {
        const found = accounts.find((a) => String(a.id).toLowerCase() === String(accId).toLowerCase());
        return found ? `${found.code} - ${found.name}` : accId;
    };

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & + Yarat button) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Jurnal Qeydləri</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>Siyahı</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
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

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Jurnal № Input */}
                    <input
                        type="text"
                        placeholder="Jurnal №"
                        value={filterNumber}
                        onChange={(e) => setFilterNumber(e.target.value)}
                        className="w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Təsvir Input */}
                    <input
                        type="text"
                        placeholder="Təsvir və ya İstinad"
                        value={filterDesc}
                        onChange={(e) => setFilterDesc(e.target.value)}
                        className="w-44 sm:w-56 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">{selectedStatus === 'Status' ? 'Status' : selectedStatus}</span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {['Status', 'Draft', 'Posted', 'Reversed'].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => {
                                            setSelectedStatus(st);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedStatus === st ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {st === 'Status' ? 'Bütün Statuslar' : st}
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
                                    <span className="font-bold text-white">Filtrlər</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterNumber('');
                                                setFilterDesc('');
                                                setSelectedStatus('Status');
                                                setFromDate('');
                                                setToDate('');
                                                setMinAmount('');
                                                setMaxAmount('');
                                            }}
                                            className="text-[11px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                        >
                                            Sıfırla
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <div>
                                        <label className="text-[11px] text-[#A1A1AA] font-semibold block mb-1">Tarix Aralığı</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="bg-[#121214] border border-[#2C2C2E] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                            />
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="bg-[#121214] border border-[#2C2C2E] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                            />
                                        </div>
                                    </div>

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
                                {columns.map((col, idx) => (
                                    <label key={col.key} className="flex items-center gap-2 px-1.5 py-1 hover:bg-[#2C2C2E]/60 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={col.visible}
                                            onChange={() => {
                                                const next = [...columns];
                                                next[idx].visible = !next[idx].visible;
                                                setColumns(next);
                                            }}
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
                                <button
                                    onClick={() => { setSortField('date'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Tarix üzrə ({sortDirection === 'asc' ? 'Artan' : 'Azalan'})
                                </button>
                                <button
                                    onClick={() => { setSortField('number'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Qeyd № üzrə
                                </button>
                                <button
                                    onClick={() => { setSortField('amount'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Məbləğ üzrə
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Journal Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedEntries.length > 0 && selectedRows.length === paginatedEntries.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'number')?.visible && <th className="py-3 px-3">Jurnal №</th>}
                                {columns.find((c) => c.key === 'date')?.visible && <th className="py-3 px-3">Tarix</th>}
                                {columns.find((c) => c.key === 'description')?.visible && <th className="py-3 px-3">Təsvir</th>}
                                {columns.find((c) => c.key === 'reference')?.visible && <th className="py-3 px-3">İstinad №</th>}
                                {columns.find((c) => c.key === 'debit')?.visible && <th className="py-3 px-3 text-right">Debet</th>}
                                {columns.find((c) => c.key === 'credit')?.visible && <th className="py-3 px-3 text-right">Kredit</th>}
                                {columns.find((c) => c.key === 'status')?.visible && <th className="py-3 px-3 text-center">Status</th>}
                                <th className="py-3 px-3 text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                            <span>Məlumatlar yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Heç bir jurnal qeydi tapılmadı</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">İkiqat qeydiyyat sistemi üzrə əməliyyat daxil edin</p>
                                            </div>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>İlk Qeydi Yarat</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedEntries.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(entry.id)}
                                                onChange={() => handleSelectRow(entry.id)}
                                                className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {columns.find((c) => c.key === 'number')?.visible && (
                                            <td className="py-3 px-3 font-mono font-bold text-white">
                                                {entry.entryNumber}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'date')?.visible && (
                                            <td className="py-3 px-3 text-[#A1A1AA]">
                                                {formatDate(entry.date)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'description')?.visible && (
                                            <td className="py-3 px-3 text-white font-medium max-w-xs truncate">
                                                {entry.description || '—'}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'reference')?.visible && (
                                            <td className="py-3 px-3 text-[#71717A] font-mono">
                                                {entry.reference || '—'}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'debit')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                                {formatCurrency(entry.totalDebit || 0)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'credit')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                                {formatCurrency(entry.totalCredit || 0)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'status')?.visible && (
                                            <td className="py-3 px-3 text-center">
                                                {getStatusBadge(entry.status)}
                                            </td>
                                        )}

                                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setSelectedEntry(entry)}
                                                    className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                    title="Ətraflı Bax"
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                </button>

                                                {entry.status === 'Draft' && (
                                                    <button
                                                        onClick={() => handlePost(entry.id, entry.date)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#14291F] hover:bg-[#14291F]/80 border border-[#22C55E]/40 text-[#4ADE80] text-[11px] font-semibold transition-colors cursor-pointer"
                                                        title="Baş Kitaba Keçir (Post)"
                                                    >
                                                        Təsdiq
                                                    </button>
                                                )}

                                                {entry.status === 'Posted' && (
                                                    <button
                                                        onClick={() => openReverseModal(entry.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#2E1619] hover:bg-[#2E1619]/80 border border-[#EF4444]/40 text-[#F87171] text-[11px] font-semibold transition-colors cursor-pointer"
                                                        title="Tərs Çevir (Reverse)"
                                                    >
                                                        Ləğv et
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                        {filteredEntries.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredEntries.length
                              )} of ${filteredEntries.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE JOURNAL ENTRY MODAL (Matching Accounts Create Modal) ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-4xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">Yeni Jurnal Qeydi (Double Entry)</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">İkiqat müxabirləşmə üzrə balanslaşdırılmış qeyd</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Inline Error Alert */}
                        {createError && (
                            <div className="p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-start gap-2.5">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{createError}</span>
                            </div>
                        )}

                        <form onSubmit={(e) => handleCreateSubmit(e, false)} className="space-y-4">
                            {/* Header Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Tarix *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createDate}
                                        onChange={(e) => setCreateDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">İstinad № (Reference)</label>
                                    <input
                                        type="text"
                                        value={createRef}
                                        onChange={(e) => setCreateRef(e.target.value)}
                                        placeholder="məs. INV-2026-001 və ya Qaimə №"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white placeholder:text-[#52525B] focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Təsvir / Açıqlama *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createDesc}
                                        onChange={(e) => setCreateDesc(e.target.value)}
                                        placeholder="məs. Əmək haqqı hesablanması"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white placeholder:text-[#52525B] focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                                        <span>Qeyd Sətirləri (Müxabirləşmə)</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-white hover:text-black text-xs font-semibold text-white transition-colors cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                                    {createLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex flex-col sm:flex-row gap-2.5 items-center"
                                        >
                                            {/* Account Select */}
                                            <div className="w-full sm:w-1/3">
                                                <select
                                                    required
                                                    value={line.accountId}
                                                    onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                                >
                                                    <option value="">Hesab seçin...</option>
                                                    {accounts.map((a) => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.code} - {a.name} ({a.currency || 'AZN'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Description */}
                                            <div className="w-full sm:flex-1">
                                                <input
                                                    type="text"
                                                    value={line.description}
                                                    onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                                    placeholder="Sətir açıqlaması..."
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-[#52525B] focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Debit */}
                                            <div className="w-full sm:w-28">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.debit}
                                                    onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                                                    placeholder="Debet"
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white text-right font-mono focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Credit */}
                                            <div className="w-full sm:w-28">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.credit}
                                                    onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                                                    placeholder="Kredit"
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white text-right font-mono focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Delete Line */}
                                            <button
                                                type="button"
                                                disabled={createLines.length <= 2}
                                                onClick={() => handleRemoveLine(idx)}
                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Sətri Sil"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Balance Summary Box */}
                            <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#A1A1AA]">Status:</span>
                                    {isBalanced ? (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                            <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                                            Balanslaşdırılıb (Debet = Kredit)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                                            ✗ Balans bərabər deyil (Fərq: {formatCurrency(Math.abs(totalDebit - totalCredit))})
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 font-mono font-bold">
                                    <div>
                                        <span className="text-[#A1A1AA] font-normal mr-1.5">Debet:</span>
                                        <span className="text-white">{formatCurrency(totalDebit)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#A1A1AA] font-normal mr-1.5">Kredit:</span>
                                        <span className="text-white">{formatCurrency(totalCredit)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading || !isBalanced || accounts.length === 0}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-bold text-white border border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? 'Saxlanılır...' : 'Qaralama Kimi Saxla'}
                                </button>
                                <button
                                    type="button"
                                    disabled={createLoading || !isBalanced || accounts.length === 0}
                                    onClick={(e) => handleCreateSubmit(e, true)}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-black shadow-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? 'Saxlanılır...' : 'Saxla və Təsdiqlə (Post)'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── REVERSE CONFIRMATION MODAL ─── */}
            {showReverseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <h3 className="text-sm font-bold text-white">Jurnal Qeydinin Ləğvi (Reverse)</h3>
                            <button
                                onClick={() => setShowReverseModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {reverseError && (
                            <div className="p-3 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs">
                                {reverseError}
                            </div>
                        )}

                        <form onSubmit={handleReverseSubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ləğvetmə Səbəbi *</label>
                                <input
                                    type="text"
                                    required
                                    value={reversalReason}
                                    onChange={(e) => setReversalReason(e.target.value)}
                                    placeholder="məs. Səhv hesab seçimi və ya dublikat"
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ləğvetmə Tarixi *</label>
                                <input
                                    type="date"
                                    required
                                    value={reversalDate}
                                    onChange={(e) => setReversalDate(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <p className="text-[11px] text-[#A1A1AA] bg-[#121214] p-3 rounded-xl border border-[#27272A]">
                                ⚠️ Bu əməliyyat baş kitabda əks-müxabirləşmə (Reverse entry) yaradacaq və qeydin statusunu "Reversed" edəcək.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReverseModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={reverseLoading}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
                                >
                                    {reverseLoading ? 'Ləğv edilir...' : 'Təsdiqlə və Ləğv Et'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── JOURNAL DETAIL SLIDE-OVER / MODAL ─── */}
            {selectedEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-3xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-white font-mono">{selectedEntry.entryNumber}</h3>
                                        {getStatusBadge(selectedEntry.status)}
                                    </div>
                                    <p className="text-xs text-[#A1A1AA] mt-0.5">{selectedEntry.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                <span className="text-[11px] text-[#A1A1AA] block">Tarix</span>
                                <span className="text-xs font-bold text-white mt-1 block">
                                    {formatDate(selectedEntry.date)}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                <span className="text-[11px] text-[#A1A1AA] block">İstinad №</span>
                                <span className="text-xs font-mono font-bold text-white mt-1 block">
                                    {selectedEntry.reference || '—'}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                <span className="text-[11px] text-[#A1A1AA] block">Debet Cəmi</span>
                                <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                                    {formatCurrency(selectedEntry.totalDebit || 0)}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                                <span className="text-[11px] text-[#A1A1AA] block">Kredit Cəmi</span>
                                <span className="text-xs font-mono font-bold text-white mt-1 block">
                                    {formatCurrency(selectedEntry.totalCredit || 0)}
                                </span>
                            </div>
                        </div>

                        {/* Lines Table */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Qeyd Sətirləri</h4>
                            <div className="rounded-xl border border-[#27272A] bg-[#121214] overflow-hidden">
                                <table className="w-full text-left text-xs text-[#E4E4E7]">
                                    <thead>
                                        <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-[10px] uppercase font-bold">
                                            <th className="py-2.5 px-3">Hesab</th>
                                            <th className="py-2.5 px-3">Təsvir</th>
                                            <th className="py-2.5 px-3 text-right">Debet</th>
                                            <th className="py-2.5 px-3 text-right">Kredit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]/50">
                                        {(selectedEntry.lines || []).map((line, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02]">
                                                <td className="py-2.5 px-3 font-semibold text-white">
                                                    {line.accountCode ? `${line.accountCode} - ${line.accountName}` : getAccountName(line.accountId)}
                                                </td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">
                                                    {line.description || selectedEntry.description || '—'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                                    {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                                    {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Actions in Detail Modal */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#27272A]">
                            <span className="text-[11px] text-[#71717A]">
                                {selectedEntry.postedAt ? `Baş kitaba keçirilib: ${formatDateTime(selectedEntry.postedAt)}` : 'Qaralama statusundadır'}
                            </span>

                            <div className="flex items-center gap-2">
                                {selectedEntry.status === 'Draft' && (
                                    <button
                                        onClick={() => handlePost(selectedEntry.id, selectedEntry.date)}
                                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Baş Kitaba Keçir (Post)
                                    </button>
                                )}
                                {selectedEntry.status === 'Posted' && (
                                    <button
                                        onClick={() => openReverseModal(selectedEntry.id)}
                                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Ləğv Et (Reverse)
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
                                >
                                    Bağla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalPage;

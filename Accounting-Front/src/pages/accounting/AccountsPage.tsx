import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsService } from '../../api';
import type { AccountDto, CreateAccountRequest, InitialBalanceRequest } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
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
    PencilSquareIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const CURRENCIES = ['AZN', 'USD', 'EUR', 'GBP', 'TRY'];

export const AccountsPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const ACCOUNT_CATEGORIES = useMemo(() => [
        { id: 1, label: t('accounting.asset', {}, 'Aktiv (Asset)') },
        { id: 2, label: t('accounting.liability', {}, 'Öhdəlik (Liability)') },
        { id: 3, label: t('accounting.equity', {}, 'Kapital (Equity)') },
        { id: 4, label: t('accounting.income', {}, 'Gəlir (Income)') },
        { id: 5, label: t('accounting.expense', {}, 'Xərc (Expense)') },
    ], [t]);

    const ACCOUNT_TYPE_OPTIONS = useMemo(() => [
        { id: 0, label: t('accounting.typeStandard', {}, 'Standart (Standard)') },
        { id: 1, label: t('accounting.typeReceivable', {}, 'Debitor (Receivable)') },
        { id: 2, label: t('accounting.typePayable', {}, 'Kreditor (Payable)') },
        { id: 3, label: t('accounting.typeBank', {}, 'Bank') },
        { id: 4, label: t('accounting.typeCash', {}, 'Kassa (Cash)') },
        { id: 5, label: t('accounting.typeStock', {}, 'Anbar (Stock)') },
        { id: 6, label: 'GRNI' },
        { id: 7, label: t('accounting.typeCogs', {}, 'Satışın Mayası (COGS)') },
        { id: 8, label: t('accounting.typeTax', {}, 'Vergi (Tax)') },
        { id: 9, label: t('accounting.typeRetainedEarnings', {}, 'Bölüşdürülməmiş Mənfəət') },
        { id: 10, label: t('accounting.typeRevenue', {}, 'Gəlir (Revenue)') },
        { id: 11, label: t('accounting.typeExpense', {}, 'Xərc (Expense)') },
        { id: 12, label: t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)') },
        { id: 13, label: t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)') },
        { id: 14, label: t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik') },
        { id: 15, label: t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik') },
    ], [t]);

    const getAccountTypeLabel = (typeKey: string) => {
        switch (typeKey) {
            case 'Asset': return t('accounting.asset', {}, 'Aktiv (Asset)');
            case 'Liability': return t('accounting.liability', {}, 'Öhdəlik (Liability)');
            case 'Equity': return t('accounting.equity', {}, 'Kapital (Equity)');
            case 'Revenue': return t('accounting.typeRevenue', {}, 'Gəlir (Revenue)');
            case 'Expense': return t('accounting.typeExpense', {}, 'Xərc (Expense)');
            default: return typeKey;
        }
    };

    // Filters
    const [filterCode, setFilterCode] = useState('');
    const [filterName, setFilterName] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedCurrency, setSelectedCurrency] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    // Filter Dropdown Open States
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'code' | 'name' | 'type' | 'balance'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility State
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        code: true,
        name: true,
        type: true,
        currency: true,
        balance: true,
        status: true,
    });

    const columns = useMemo(() => [
        { key: 'code', label: t('accounting.accountCode', {}, 'Kod'), visible: columnVisibility.code ?? true },
        { key: 'name', label: t('accounting.accountName', {}, 'Hesabın Adı'), visible: columnVisibility.name ?? true },
        { key: 'type', label: t('accounting.accountType', {}, 'Tipi'), visible: columnVisibility.type ?? true },
        { key: 'currency', label: t('common.currency', {}, 'Valyuta'), visible: columnVisibility.currency ?? true },
        { key: 'balance', label: t('accounting.balance', {}, 'Qalıq'), visible: columnVisibility.balance ?? true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: columnVisibility.status ?? true },
    ], [t, columnVisibility]);

    // Create Modal State - strictly backend CreateAccountDto fields
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        code: '',
        name: '',
        category: 1,
        type: 0,
        currency: 'AZN',
        parentAccountId: '',
        isControlAccount: false,
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Initial Balance Modal
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(null);
    const [balanceError, setBalanceError] = useState('');
    const [balanceForm, setBalanceForm] = useState<InitialBalanceRequest>({
        accountId: '',
        debitAmount: 0,
        creditAmount: 0,
        asOfDate: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [seedLoading, setSeedLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Dropdown Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    const loadAccounts = async () => {
        setIsRefreshing(true);
        try {
            const data = await accountsService.getAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load accounts:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    // Outside click listener for filter popovers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typeRef.current && !typeRef.current.contains(e.target as Node)) setIsTypeDropdownOpen(false);
            if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setIsCurrencyDropdownOpen(false);
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOptionsOpen(false);
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

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCode.trim()) count++;
        if (filterName.trim()) count++;
        if (selectedType !== 'ALL') count++;
        if (selectedCurrency !== 'ALL') count++;
        if (selectedStatus !== 'ALL') count++;
        return count;
    }, [filterCode, filterName, selectedType, selectedCurrency, selectedStatus]);

    // Filtered & Sorted accounts
    const filteredAccounts = useMemo(() => {
        return accounts.filter((acc) => {
            if (filterCode.trim()) {
                const codeStr = String(acc.code || '').toLowerCase();
                if (!codeStr.includes(filterCode.trim().toLowerCase())) return false;
            }
            if (filterName.trim()) {
                const nameStr = String(acc.name || '').toLowerCase();
                if (!nameStr.includes(filterName.trim().toLowerCase())) return false;
            }
            if (selectedType !== 'ALL') {
                const typeStr = String(acc.type || '').toLowerCase();
                const catStr = String(acc.category || '').toLowerCase();
                const sel = selectedType.toLowerCase();

                const matchesCat =
                    (sel === 'asset' && (acc.category === 1 || catStr.includes('asset') || typeStr.includes('asset'))) ||
                    (sel === 'liability' && (acc.category === 2 || catStr.includes('liability') || typeStr.includes('liability'))) ||
                    (sel === 'equity' && (acc.category === 3 || catStr.includes('equity') || typeStr.includes('equity'))) ||
                    (sel === 'revenue' && (acc.category === 4 || catStr.includes('revenue') || catStr.includes('income') || typeStr.includes('revenue') || typeStr.includes('income'))) ||
                    (sel === 'expense' && (acc.category === 5 || catStr.includes('expense') || typeStr.includes('expense')));

                const matchesType = typeStr.includes(sel);

                if (!matchesCat && !matchesType) return false;
            }
            if (selectedCurrency !== 'ALL') {
                const cur = String(acc.currency || 'AZN').toUpperCase();
                if (cur !== selectedCurrency.toUpperCase()) return false;
            }
            if (selectedStatus === 'ACTIVE' && !acc.isActive) return false;
            if (selectedStatus === 'INACTIVE' && acc.isActive) return false;
            return true;
        }).sort((a, b) => {
            let valA: any = a[sortField] || '';
            let valB: any = b[sortField] || '';
            if (sortField === 'balance') {
                valA = Number(a.balance ?? (a as any).currentBalance) || 0;
                valB = Number(b.balance ?? (b as any).currentBalance) || 0;
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [accounts, filterCode, filterName, selectedType, selectedCurrency, selectedStatus, sortField, sortDirection]);

    const paginatedAccounts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAccounts.slice(start, start + pageSize);
    }, [filteredAccounts, currentPage, pageSize]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedAccounts.map((a) => a.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleColumnVisibility = (key: string) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [key]: prev[key] === undefined ? false : !prev[key],
        }));
    };

    const isColVisible = (key: string) => {
        return columnVisibility[key] ?? true;
    };

    // Handle Create Submit
    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await accountsService.createAccount({
                code: createForm.code.trim(),
                name: createForm.name.trim(),
                category: Number(createForm.category),
                type: Number(createForm.type),
                parentAccountId: createForm.parentAccountId || null,
                isControlAccount: Boolean(createForm.isControlAccount),
                currency: createForm.currency || 'AZN',
            });

            setShowCreateModal(false);
            setCreateForm({
                code: '',
                name: '',
                category: 1,
                type: 0,
                currency: 'AZN',
                parentAccountId: '',
                isControlAccount: false,
            });
            showToast(t('common.success', {}, 'Hesab uğurla yaradıldı!'));
            loadAccounts();
        } catch (err: any) {
            setCreateError(err.response?.data?.message || t('common.error', {}, 'Hesab yaradılarkən xəta baş verdi.'));
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle Initial Balance Submit
    const handleSetInitialBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        setBalanceLoading(true);
        setBalanceError('');
        try {
            await accountsService.setInitialBalance(balanceForm);
            setShowBalanceModal(false);
            showToast(t('common.success', {}, 'İlkin qalıq uğurla təyin edildi!'));
            loadAccounts();
        } catch (err: any) {
            setBalanceError(err.response?.data?.message || err.message || t('common.error', {}, 'İlkin qalıq qeyd olunarkən xəta baş verdi.'));
        } finally {
            setBalanceLoading(false);
        }
    };

    const handleSeedTemplate = async () => {
        setSeedLoading(true);
        try {
            await accountsService.seedTemplate();
            showToast(t('settings.seedSuccess', {}, 'Standart hesablar planı şablonu uğurla tətbiq edildi!'));
            loadAccounts();
        } catch (err: any) {
            showToast(err.response?.data?.message || t('common.error', {}, 'Şablon yüklənərkən xəta baş verdi.'));
        } finally {
            setSeedLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Asset': return '#38BDF8';
            case 'Liability': return '#F59E0B';
            case 'Equity': return '#A855F7';
            case 'Revenue': return '#22C55E';
            case 'Expense': return '#EF4444';
            default: return '#71717A';
        }
    };

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('accounting.accountsTitle', {}, 'Hesablar Planı')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('common.list', {}, 'Siyahı')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('accounting.newAccount', {}, 'Yarat')}</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Kod Input */}
                    <input
                        type="text"
                        placeholder={t('accounting.accountCode', {}, 'Kod')}
                        value={filterCode}
                        onChange={(e) => setFilterCode(e.target.value)}
                        className="w-28 sm:w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Ad Input */}
                    <input
                        type="text"
                        placeholder={t('accounting.accountName', {}, 'Hesabın adı')}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-36 sm:w-44 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedStatus === 'ALL'
                                    ? t('common.status', {}, 'Status')
                                    : selectedStatus === 'ACTIVE'
                                    ? t('common.active', {}, 'Aktiv')
                                    : t('common.inactive', {}, 'Deaktiv')}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { key: 'ALL' as const, label: t('common.allStatuses', {}, 'Bütün Statuslar') },
                                    { key: 'ACTIVE' as const, label: t('common.active', {}, 'Aktiv') },
                                    { key: 'INACTIVE' as const, label: t('common.inactive', {}, 'Deaktiv') },
                                ].map((st) => (
                                    <button
                                        key={st.key}
                                        type="button"
                                        onClick={() => {
                                            setSelectedStatus(st.key);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedStatus === st.key ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tip Dropdown */}
                    <div className="relative" ref={typeRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedType === 'ALL' ? t('accounting.accountType', {}, 'Tip') : getAccountTypeLabel(selectedType)}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedType('ALL');
                                        setIsTypeDropdownOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-left cursor-pointer text-[#A1A1AA] hover:bg-[#2C2C2E]/60"
                                >
                                    {t('common.allTypes', {}, 'Bütün Tiplər')}
                                </button>
                                <div className="h-px bg-[#2C2C2E] my-1" />
                                {ACCOUNT_TYPES.map((tItem) => (
                                    <button
                                        key={tItem}
                                        type="button"
                                        onClick={() => {
                                            setSelectedType(tItem);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedType === tItem ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getTypeColor(tItem) }} />
                                        <span>{getAccountTypeLabel(tItem)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Valyuta Dropdown */}
                    <div className="relative" ref={currencyRef}>
                        <button
                            type="button"
                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedCurrency === 'ALL' ? t('common.currency', {}, 'Valyuta') : selectedCurrency}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isCurrencyDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCurrency('ALL');
                                        setIsCurrencyDropdownOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-left cursor-pointer text-[#A1A1AA] hover:bg-[#2C2C2E]/60"
                                >
                                    {t('common.allCurrencies', {}, 'Bütün Valyutalar')}
                                </button>
                                <div className="h-px bg-[#2C2C2E] my-1" />
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCurrency(c);
                                            setIsCurrencyDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer font-mono ${
                                            selectedCurrency === c ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={loadAccounts}
                        title={t('common.refresh', {}, 'Yenilə')}
                        className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    {/* Filter Button */}
                    <div className="relative" ref={filterRef}>
                        <button
                            type="button"
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                                activeFilterCount > 0
                                    ? 'bg-white text-black border-white font-semibold'
                                    : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-white'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-3.5 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <div className="flex items-center gap-1.5 font-bold text-white">
                                        <FunnelIcon className="w-4 h-4 text-[#A1A1AA]" />
                                        <span>{t('common.filters', {}, 'Filtrlər')}</span>
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterCode('');
                                                setFilterName('');
                                                setSelectedType('ALL');
                                                setSelectedCurrency('ALL');
                                                setSelectedStatus('ALL');
                                            }}
                                            className="text-[11px] text-rose-400 hover:underline cursor-pointer font-medium"
                                        >
                                            {t('common.clear', {}, 'Təmizlə')} ({activeFilterCount})
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountCode', {}, 'Hesab Kodu')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('common.searchPlaceholder', {}, 'Kod üzrə axtar...')}
                                            value={filterCode}
                                            onChange={(e) => setFilterCode(e.target.value)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountName', {}, 'Hesabın Adı')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('common.searchPlaceholder', {}, 'Ad üzrə axtar...')}
                                            value={filterName}
                                            onChange={(e) => setFilterName(e.target.value)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountType', {}, 'Kateqoriya / Tip')}</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                            >
                                                <option value="ALL">{t('common.allTypes', {}, 'Bütün Tiplər')}</option>
                                                {ACCOUNT_TYPES.map((tItem) => (
                                                    <option key={tItem} value={tItem} className="bg-[#1C1C1E]">
                                                        {getAccountTypeLabel(tItem)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] text-[#A1A1AA]">{t('common.currency', {}, 'Valyuta')}</label>
                                            <select
                                                value={selectedCurrency}
                                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                                className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                                            >
                                                <option value="ALL" className="bg-[#1C1C1E]">{t('common.allCurrencies', {}, 'Hamısı')}</option>
                                                {CURRENCIES.map((c) => (
                                                    <option key={c} value={c} className="bg-[#1C1C1E]">
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('common.status', {}, 'Status')}</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                        >
                                            <option value="ALL" className="bg-[#1C1C1E]">{t('common.allStatuses', {}, 'Bütün Statuslar')}</option>
                                            <option value="ACTIVE" className="bg-[#1C1C1E]">● {t('common.active', {}, 'Aktiv')}</option>
                                            <option value="INACTIVE" className="bg-[#1C1C1E]">● {t('common.inactive', {}, 'Deaktiv')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2E]">
                                    <span className="text-[11px] text-[#71717A]">
                                        {filteredAccounts.length} {t('common.resultsFound', {}, 'nəticə tapıldı')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="px-3.5 py-1.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
                                    >
                                        {t('common.apply', {}, 'Tətbiq et')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sort Button */}
                    <div className="relative" ref={sortRef}>
                        <button
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.sort', {}, 'Sırala')}
                        >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-9 right-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                                {[
                                    { key: 'code', label: t('accounting.byCode', {}, 'Kod üzrə') },
                                    { key: 'name', label: t('accounting.byName', {}, 'Ad üzrə') },
                                    { key: 'type', label: t('accounting.byType', {}, 'Tip üzrə') },
                                    { key: 'balance', label: t('accounting.byBalance', {}, 'Qalıq üzrə') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => {
                                            if (sortField === item.key) {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField(item.key as any);
                                                setSortDirection('asc');
                                            }
                                            setIsSortOpen(false);
                                        }}
                                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                                            sortField === item.key ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {sortField === item.key && (
                                            <span className="text-[10px] text-[#A1A1AA] font-mono">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Columns Button */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            type="button"
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.columns', {}, 'Sütunlar')}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <div className="space-y-1">
                                    {columns.map((col) => (
                                        <div
                                            key={col.key}
                                            onClick={() => toggleColumnVisibility(col.key)}
                                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141416]/50 border border-[#2C2C2E]/40 hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer"
                                        >
                                            <span className={col.visible ? 'text-white' : 'text-[#71717A] line-through'}>
                                                {col.label}
                                            </span>
                                            {col.visible && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* More Options */}
                    <div className="relative" ref={moreRef}>
                        <button
                            type="button"
                            onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.more', {}, 'Digər')}
                        >
                            <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>

                        {isMoreOptionsOpen && (
                            <div className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreOptionsOpen(false);
                                        handleSeedTemplate();
                                    }}
                                    disabled={seedLoading}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium"
                                >
                                    <SparklesIcon className="w-4 h-4 text-amber-400" />
                                    <span>{t('settings.seedDefaults', {}, 'Standart Şablonu Yüklə')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Table View (Exact CRM Leads Style - Image 1) ─── */}
            <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            selectedRows.length === paginatedAccounts.length &&
                                            paginatedAccounts.length > 0
                                        }
                                        className="rounded border-[#3F3F46] bg-[#27272A] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {isColVisible('code') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('accounting.accountCode', {}, 'KOD')}</th>
                                )}
                                {isColVisible('name') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('accounting.accountName', {}, 'HESABIN ADI')}</th>
                                )}
                                {isColVisible('type') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('accounting.accountType', {}, 'TİPİ')}</th>
                                )}
                                {isColVisible('currency') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal">{t('common.currency', {}, 'VALYUTA')}</th>
                                )}
                                {isColVisible('balance') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal text-right">{t('accounting.balance', {}, 'QALIQ')}</th>
                                )}
                                {isColVisible('status') && (
                                    <th className="py-3 px-4 text-[#A1A1AA] font-normal text-center">{t('common.status', {}, 'STATUS')}</th>
                                )}
                                <th className="py-3 px-4 text-[#A1A1AA] font-normal text-right">{t('common.actions', {}, 'ƏMƏLİYYAT')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                        <div className="flex flex-col items-center gap-2">
                                            <ArrowPathIcon className="w-5 h-5 animate-spin text-white" />
                                            <span>{t('common.loading', {}, 'Yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                        {t('accounting.noAccountsFound', {}, 'Heç bir hesab tapılmadı. "Yarat" düyməsi ilə yeni hesab əlavə edə bilərsiniz.')}
                                    </td>
                                </tr>
                            ) : (
                                paginatedAccounts.map((acc) => {
                                    const isSelected = selectedRows.includes(acc.id);
                                    const initialChar = (acc.name || 'H').charAt(0).toUpperCase();
                                    const currentBal = Number(acc.balance ?? (acc as any).currentBalance) || 0;

                                    return (
                                        <tr
                                            key={acc.id}
                                            onClick={() => navigate(`/accounts/${acc.id}`)}
                                            className={`hover:bg-[#18181B]/80 transition-colors cursor-pointer group ${
                                                isSelected ? 'bg-[#18181B]' : ''
                                            }`}
                                        >
                                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(acc.id)}
                                                    className="rounded border-[#3F3F46] bg-[#27272A] text-white focus:ring-0 cursor-pointer"
                                                />
                                            </td>

                                            {/* Code */}
                                            {isColVisible('code') && (
                                                <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-sky-400 transition-colors">
                                                    {acc.code}
                                                </td>
                                            )}

                                            {/* Name with Circle Avatar */}
                                            {isColVisible('name') && (
                                                <td className="py-3.5 px-4 font-semibold text-white group-hover:underline transition-colors">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {initialChar}
                                                        </span>
                                                        <span className="truncate">{acc.name}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Type with Dot */}
                                            {isColVisible('type') && (
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-2 h-2 rounded-full inline-block shrink-0"
                                                            style={{ backgroundColor: getTypeColor(acc.type) }}
                                                        />
                                                        <span className="text-white font-medium">{getAccountTypeLabel(acc.type)}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Currency */}
                                            {isColVisible('currency') && (
                                                <td className="py-3.5 px-4 font-mono text-[#A1A1AA]">
                                                    {acc.currency || 'AZN'}
                                                </td>
                                            )}

                                            {/* Balance */}
                                            {isColVisible('balance') && (
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                    {new Intl.NumberFormat('az-AZ', {
                                                        style: 'currency',
                                                        currency: acc.currency || 'AZN',
                                                    }).format(currentBal)}
                                                </td>
                                            )}

                                            {/* Status with Dot */}
                                            {isColVisible('status') && (
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                                                                acc.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                                                            }`}
                                                        />
                                                        <span className="text-white">
                                                            {acc.isActive ? t('common.active', {}, 'Aktiv') : t('common.inactive', {}, 'Deaktiv')}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedAccount(acc);
                                                        setBalanceError('');
                                                        setBalanceForm({
                                                            accountId: acc.id,
                                                            debitAmount: 0,
                                                            creditAmount: 0,
                                                            asOfDate: new Date().toISOString().split('T')[0],
                                                            notes: '',
                                                        });
                                                        setShowBalanceModal(true);
                                                    }}
                                                    className="px-2.5 py-1 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[11px] font-medium text-[#D4D4D8] hover:text-white transition-colors cursor-pointer"
                                                >
                                                    {t('accounting.initialBalance', {}, 'İlkin Qalıq')}
                                                </button>
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
                        {filteredAccounts.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredAccounts.length
                              )} of ${filteredAccounts.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE ACCOUNT MODAL ─── */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCreateModal(false);
                    }}
                >
                    <div
                        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl text-[#E4E4E7] flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden my-auto animate-in fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 p-4 sm:p-6 shrink-0 bg-[#1C1C1E]">
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t('accounting.newAccount', {}, 'Yeni Hesab')}</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label={t('common.close', {}, 'Bağla')}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                                {createError}
                            </div>
                        )}

                        {/* Modal Form Body */}
                        <form onSubmit={handleCreateAccount} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
                                {/* Row 1: Hesab Kodu * & Hesabın Adı * */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">
                                            {t('accounting.accountCode', {}, 'Hesab Kodu')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="məs. 101"
                                            value={createForm.code}
                                            onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">
                                            {t('accounting.accountName', {}, 'Hesabın Adı')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t('accounting.accountName', {}, 'Hesabın adı')}
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Kateqoriya, Hesab Növü (Type), Valyuta */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.accountCategory', {}, 'Kateqoriya')}</label>
                                        <select
                                            value={createForm.category}
                                            onChange={(e) => setCreateForm({ ...createForm, category: Number(e.target.value) })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            {ACCOUNT_CATEGORIES.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-[#1C1C1E]">
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.accountType', {}, 'Hesab Növü (Type)')}</label>
                                        <select
                                            value={createForm.type}
                                            onChange={(e) => setCreateForm({ ...createForm, type: Number(e.target.value) })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            {ACCOUNT_TYPE_OPTIONS.map((tItem) => (
                                                <option key={tItem.id} value={tItem.id} className="bg-[#1C1C1E]">
                                                    {tItem.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('common.currency', {}, 'Valyuta')}</label>
                                        <select
                                            value={createForm.currency}
                                            onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c} value={c} className="bg-[#1C1C1E]">
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Əsas Hesab (Parent) & Nəzarət Hesabı (Control) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.parentAccount', {}, 'Əsas Hesab (Parent)')}</label>
                                        <select
                                            value={createForm.parentAccountId}
                                            onChange={(e) => setCreateForm({ ...createForm, parentAccountId: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            <option value="" className="bg-[#1C1C1E]">{t('accounting.noneParent', {}, 'Yoxdur (Baş Hesab)')}</option>
                                            {accounts.map((a) => (
                                                <option key={a.id} value={a.id} className="bg-[#1C1C1E]">
                                                    {a.code} - {a.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.controlAccount', {}, 'Nəzarət Hesabı')}</label>
                                        <select
                                            value={createForm.isControlAccount ? 'true' : 'false'}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    isControlAccount: e.target.value === 'true',
                                                })
                                            }
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            <option value="false" className="bg-[#1C1C1E]">{t('common.no', {}, 'Xeyr')}</option>
                                            <option value="true" className="bg-[#1C1C1E]">{t('common.yes', {}, 'Bəli')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-[#2C2C2E]/60 p-4 sm:p-6 shrink-0 bg-[#1C1C1E]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-[#2C2C2E] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? t('common.saving', {}, 'Yaradılır...') : t('common.create', {}, 'Yarat')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── INITIAL BALANCE MODAL ─── */}
            {showBalanceModal && selectedAccount && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg text-[#E4E4E7] overflow-hidden animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 p-5">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('accounting.setInitialBalance', {}, 'İlkin Qalıq Təyin Et')}</h3>
                                <p className="text-xs text-[#71717A]">
                                    {selectedAccount.code} - {selectedAccount.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBalanceModal(false)}
                                className="p-1 rounded-lg text-[#A1A1AA] hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSetInitialBalance} className="p-6 space-y-4 text-xs">
                            {balanceError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                                    <span>{balanceError}</span>
                                    <button type="button" onClick={() => setBalanceError('')} className="text-rose-400 hover:text-white p-0.5 cursor-pointer">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[#A1A1AA] font-medium">{t('accounting.debitAmount', {}, 'Debet Məbləği')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={balanceForm.debitAmount}
                                        onChange={(e) =>
                                            setBalanceForm({
                                                ...balanceForm,
                                                debitAmount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#A1A1AA] font-medium">{t('accounting.creditAmount', {}, 'Kredit Məbləği')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={balanceForm.creditAmount}
                                        onChange={(e) =>
                                            setBalanceForm({
                                                ...balanceForm,
                                                creditAmount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[#A1A1AA] font-medium">{t('common.asOfDate', {}, 'Qalıq Tarixi')}</label>
                                <input
                                    type="date"
                                    required
                                    value={balanceForm.asOfDate}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, asOfDate: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white"
                                />
                            </div>

                            <div>
                                <label className="text-[#A1A1AA] font-medium">{t('common.notes', {}, 'Qeydlər')}</label>
                                <input
                                    type="text"
                                    placeholder={t('common.notesPlaceholder', {}, 'İlkin saldo qeydi...')}
                                    value={balanceForm.notes}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, notes: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white placeholder:text-[#71717A] focus:outline-none focus:border-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2E]/60">
                                <button
                                    type="button"
                                    onClick={() => setShowBalanceModal(false)}
                                    className="px-4 py-2 rounded-xl border border-[#2C2C2E] text-xs font-semibold text-[#A1A1AA] hover:text-white"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={balanceLoading}
                                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {balanceLoading ? t('common.saving', {}, 'Yadda saxlanılır...') : t('common.confirm', {}, 'Təsdiqlə')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;

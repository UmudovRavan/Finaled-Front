import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentService, accountsService } from '../../api';
import type { BankAccountDto, CreateBankAccountRequest, AccountDto } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    FunnelIcon,
    AdjustmentsHorizontalIcon,
    ArrowsUpDownIcon,
    EyeIcon,
    BuildingLibraryIcon,
    BanknotesIcon,
    CreditCardIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const POPULAR_BANKS = [
    { name: 'PAŞA Bank', swift: 'PASHAZ22' },
    { name: 'ABB (Azərbaycan Beynəlxalq Bankı)', swift: 'IBAZAZ2X' },
    { name: 'Kapital Bank', swift: 'AIIBAZ2X' },
    { name: 'Unibank', swift: 'UBAZAZ22' },
    { name: 'Bank Respublika', swift: 'BRESAZ22' },
    { name: 'AccessBank', swift: 'ACBZAZ22' },
    { name: 'Yelo Bank', swift: 'NIKOAZ2X' },
];

const CURRENCIES = ['AZN', 'USD', 'EUR', 'TRY', 'GBP', 'RUB'];

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export const BankAccountsPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Data States
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [glAccounts, setGlAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Selection & Pagination
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'Bank' | 'Cash'>('ALL');
    const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
    const [minBalanceFilter, setMinBalanceFilter] = useState<string>('');

    // Popover toggles
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'balance' | 'name' | 'currency' | 'date'>('balance');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'bankName', label: t('treasury.bankName', {}, 'Hesab / Bank Adı'), visible: true },
        { key: 'accountNumber', label: t('treasury.accountNumber', {}, 'Hesab / IBAN'), visible: true },
        { key: 'swiftCode', label: 'SWIFT / BIC', visible: true },
        { key: 'currency', label: t('common.currency', {}, 'Valyuta'), visible: true },
        { key: 'glAccount', label: t('treasury.glAccount', {}, 'Mühasibat Hesabı (GL)'), visible: true },
        { key: 'balance', label: t('treasury.currentBalance', {}, 'Cari Balans'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
    ]);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalAccountType, setModalAccountType] = useState<'Bank' | 'Cash'>('Bank');
    const [modalBankName, setModalBankName] = useState('');
    const [modalAccountName, setModalAccountName] = useState('');
    const [modalAccountNumber, setModalAccountNumber] = useState('');
    const [modalSwiftCode, setModalSwiftCode] = useState('');
    const [modalBranchName, setModalBranchName] = useState('');
    const [modalCurrency, setModalCurrency] = useState('AZN');
    const [modalGlAccountId, setModalGlAccountId] = useState('');
    const [modalOpeningBalance, setModalOpeningBalance] = useState<string>('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Quick Deposit / Statement Modal
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAccount, setDepositAccount] = useState<BankAccountDto | null>(null);
    const [depositAmount, setDepositAmount] = useState<string>('');
    const [depositDescription, setDepositDescription] = useState<string>('');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositError, setDepositError] = useState('');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4500);
    };

    const extractErrorMessage = (err: any): string => {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
        if (data?.error) return data.error;
        return err.message || t('common.error', {}, 'Xəta baş verdi');
    };

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [banksData, accsData] = await Promise.all([
                paymentService.getBankAccounts(),
                accountsService.getAccounts().catch(() => []),
            ]);

            setBankAccounts(banksData);

            // Filter relevant asset / cash / bank GL accounts
            const assetAccounts = (accsData || []).filter((a: any) => {
                const cat = a.category;
                const typ = a.type;
                const code = String(a.code || '');
                return (
                    cat === 1 ||
                    cat === 'Asset' ||
                    cat === 'asset' ||
                    typ === 3 ||
                    typ === 'Bank' ||
                    typ === 2 ||
                    typ === 'Cash' ||
                    code.startsWith('10') ||
                    code.startsWith('22')
                );
            });
            setGlAccounts(assetAccounts);
        } catch (err) {
            console.error('Failed to load bank accounts data:', err);
            showToast(t('treasury.loadFailed', {}, 'Bank hesabları yüklənərkən xəta baş verdi'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Outside click handlers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setIsFilterPopoverOpen(false);
            }
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
                setIsColumnsOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyIban = (id: string, iban: string) => {
        if (!iban) return;
        navigator.clipboard.writeText(iban);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatCurrency = (val?: number, curr = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    // Open Create Modal
    const openCreateModal = () => {
        setModalAccountType('Bank');
        setModalBankName('');
        setModalAccountName('');
        setModalAccountNumber('');
        setModalSwiftCode('');
        setModalBranchName('');
        setModalCurrency('AZN');

        // Auto select standard 1020 or 1010 GL account if available
        const defaultGl = glAccounts.find((a) => a.code === '1020' || a.code === '1010');
        setModalGlAccountId(defaultGl?.id || '');
        setModalOpeningBalance('');
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleSelectPresetBank = (preset: { name: string; swift: string }) => {
        setModalBankName(preset.name);
        setModalSwiftCode(preset.swift);
        if (!modalAccountName) {
            setModalAccountName(`${preset.name} - ${t('treasury.mainAccount', {}, 'Əsas Hesab')}`);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');

        try {
            const cleanName = modalBankName.trim();
            if (!cleanName) {
                setCreateError(modalAccountType === 'Bank' ? t('treasury.specifyBankName', {}, 'Bankın adını qeyd edin.') : t('treasury.specifyCashName', {}, 'Kassanın adını qeyd edin.'));
                setCreateLoading(false);
                return;
            }

            const cleanAccNum = modalAccountNumber.trim();
            if (modalAccountType === 'Bank' && !cleanAccNum) {
                setCreateError(t('treasury.specifyIban', {}, 'Hesab nömrəsi və ya IBAN daxil edilməlidir.'));
                setCreateLoading(false);
                return;
            }

            const selectedGl = glAccounts.find((g) => g.id === modalGlAccountId);

            if (modalAccountType === 'Bank') {
                const payload: CreateBankAccountRequest = {
                    bankName: cleanName,
                    accountName: modalAccountName.trim() || cleanName,
                    accountNumber: cleanAccNum,
                    iban: cleanAccNum,
                    currency: modalCurrency,
                    swiftCode: modalSwiftCode.trim() || undefined,
                    branchName: modalBranchName.trim() || undefined,
                    glAccountId: modalGlAccountId || undefined,
                    openingBalance: Number(modalOpeningBalance) || 0,
                    accountType: 'Bank',
                    isActive: true,
                };

                const created = await paymentService.createBankAccount({
                    ...payload,
                    glAccountCode: selectedGl?.code,
                    glAccountName: selectedGl?.name,
                });

                showToast(`${created.bankName} ${t('common.createdSuccess', {}, 'uğurla yaradıldı!')}`);
            } else {
                // Create Cash Desk
                await paymentService.createCashDesk({
                    name: cleanName,
                    currency: modalCurrency,
                    glAccountId: modalGlAccountId || undefined,
                    openingBalance: Number(modalOpeningBalance) || 0,
                });

                showToast(`${cleanName} ${t('treasury.cashCreatedSuccess', {}, 'kassası uğurla yaradıldı!')}`);
            }

            setShowCreateModal(false);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to create account:', err);
            setCreateError(extractErrorMessage(err));
        } finally {
            setCreateLoading(false);
        }
    };

    // Open Quick Deposit Modal
    const openDepositModal = (acc: BankAccountDto) => {
        setDepositAccount(acc);
        setDepositAmount('');
        setDepositDescription(t('treasury.balanceIncreaseDefault', {}, 'Hesab balansının artırılması'));
        setDepositError('');
        setShowDepositModal(true);
    };

    const handleDepositSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAccount) return;

        const amountNum = Number(depositAmount);
        if (!amountNum || amountNum <= 0) {
            setDepositError(t('treasury.amountMustBePositive', {}, 'Məbləğ 0-dan böyük olmalıdır.'));
            return;
        }

        setDepositLoading(true);
        setDepositError('');

        try {
            const nowIso = new Date().toISOString();
            const currentBal = Number(depositAccount.currentBalance) || 0;
            const newBal = currentBal + amountNum;

            await paymentService.importBankStatement({
                bankAccountId: depositAccount.id,
                statementNumber: `DEP-${nowIso.slice(0, 10).replace(/-/g, '')}`,
                statementDate: nowIso,
                openingBalance: currentBal,
                closingBalance: newBal,
                lines: [
                    {
                        transactionDate: nowIso,
                        amount: amountNum,
                        reference: t('treasury.depositReference', {}, 'Balans Artırılması'),
                        counterpartyName: t('treasury.accountOwner', {}, 'Hesab Sahibi'),
                        description: depositDescription.trim() || t('treasury.depositReference', {}, 'Balans artırılması'),
                    },
                ],
            });

            showToast(`${depositAccount.bankName} ${t('treasury.depositSuccess', {}, 'balansına')} +${formatCurrency(amountNum, depositAccount.currency)} ${t('treasury.addedSuccess', {}, 'uğurla əlavə edildi!')}`);
            setShowDepositModal(false);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to deposit:', err);
            setDepositError(extractErrorMessage(err));
        } finally {
            setDepositLoading(false);
        }
    };

    // KPI Metrics
    const stats = useMemo(() => {
        let totalBankAzn = 0;
        let totalCashAzn = 0;
        let activeCount = 0;

        bankAccounts.forEach((b) => {
            const bal = Number(b.currentBalance) || 0;
            const isCash = b.accountType === 'Cash' || String(b.bankName).toLowerCase().includes('kassa');

            if (isCash) {
                totalCashAzn += bal;
            } else {
                totalBankAzn += bal;
            }

            if (b.isActive) activeCount++;
        });

        const distinctCurrencies = Array.from(new Set(bankAccounts.map((b) => b.currency))).filter(Boolean);

        return {
            totalBankAzn,
            totalCashAzn,
            totalAllAzn: totalBankAzn + totalCashAzn,
            activeCount,
            totalAccounts: bankAccounts.length,
            currencyCount: distinctCurrencies.length || 1,
        };
    }, [bankAccounts]);

    // Filtering & Sorting
    const filteredAccounts = useMemo(() => {
        return bankAccounts.filter((b) => {
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchName = b.bankName?.toLowerCase().includes(term) || b.accountName?.toLowerCase().includes(term);
                const matchNumber = b.accountNumber?.toLowerCase().includes(term) || b.iban?.toLowerCase().includes(term);
                const matchSwift = b.swiftCode?.toLowerCase().includes(term);
                const matchBranch = b.branchName?.toLowerCase().includes(term);
                const matchCurr = b.currency?.toLowerCase().includes(term);
                if (!matchName && !matchNumber && !matchSwift && !matchBranch && !matchCurr) return false;
            }

            const isCash = b.accountType === 'Cash' || String(b.bankName).toLowerCase().includes('kassa');
            if (typeFilter === 'Bank' && isCash) return false;
            if (typeFilter === 'Cash' && !isCash) return false;

            if (currencyFilter !== 'ALL' && b.currency !== currencyFilter) {
                return false;
            }

            if (statusFilter === 'active' && !b.isActive) return false;
            if (statusFilter === 'inactive' && b.isActive) return false;

            if (minBalanceFilter) {
                const minVal = Number(minBalanceFilter);
                if (!isNaN(minVal) && (Number(b.currentBalance) || 0) < minVal) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            let comp = 0;
            if (sortField === 'balance') {
                comp = (Number(a.currentBalance) || 0) - (Number(b.currentBalance) || 0);
            } else if (sortField === 'name') {
                comp = (a.bankName || '').localeCompare(b.bankName || '');
            } else if (sortField === 'currency') {
                comp = (a.currency || '').localeCompare(b.currency || '');
            } else if (sortField === 'date') {
                comp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            }
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [bankAccounts, searchTerm, typeFilter, currencyFilter, statusFilter, minBalanceFilter, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
    const paginatedAccounts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAccounts.slice(start, start + pageSize);
    }, [filteredAccounts, currentPage, pageSize]);

    const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;
    const toggleColumn = (key: string) => {
        setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
    };

    const handleSelectAll = () => {
        if (paginatedAccounts.every((b) => selectedRows.includes(b.id))) {
            setSelectedRows(selectedRows.filter((id) => !paginatedAccounts.some((b) => b.id === id)));
        } else {
            const next = Array.from(new Set([...selectedRows, ...paginatedAccounts.map((b) => b.id)]));
            setSelectedRows(next);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(selectedRows.includes(id) ? selectedRows.filter((i) => i !== id) : [...selectedRows, id]);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (currencyFilter !== 'ALL') count++;
        if (statusFilter !== 'ALL') count++;
        if (minBalanceFilter) count++;
        return count;
    }, [currencyFilter, statusFilter, minBalanceFilter]);

    const resetFilters = () => {
        setCurrencyFilter('ALL');
        setStatusFilter('ALL');
        setMinBalanceFilter('');
        setTypeFilter('ALL');
        setSearchTerm('');
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 font-sans text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('nav.treasury', {}, 'Xəzinə')}</span>
                        <span className="text-xs text-zinc-600">/</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{t('treasury.bankAccountsTitle', {}, 'Bank Hesabları və Xəzinə')}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#18181B] text-zinc-400 border border-[#27272A]">
                            {bankAccounts.length} {t('treasury.accountsCount', {}, 'hesab')}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        {t('treasury.bankAccountsSubtitle', {}, 'Bank hesablaşma hesabları, kassa qalıqları, valyutalar və bank əməliyyatlarının idarə olunması')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(false)}
                        disabled={loading || isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 text-black" />
                        <span>{t('treasury.newBankAccount', {}, 'Yeni Hesab / Kassa')}</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalBankBalance', {}, 'Toplam Bank Balansı')}</div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                            {formatCurrency(stats.totalBankAzn, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.totalBankDesc', {}, 'Bank hesablarındakı vəsait')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <BuildingLibraryIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalCashBalance', {}, 'Kassa Qalıqları')}</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                            {formatCurrency(stats.totalCashAzn, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.totalCashDesc', {}, 'Nağd pul kassaları')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.activeAccounts', {}, 'Aktiv Hesablar')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {stats.activeCount} <span className="text-xs font-normal text-zinc-500">/ {stats.totalAccounts}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.inUseAccounts', {}, 'İstifadədə olan hesablar')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CreditCardIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalLiquidFunds', {}, 'Ümumi Likvid Vəsait')}</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                            {formatCurrency(stats.totalAllAzn, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{stats.currencyCount} {t('treasury.distinctCurrencies', {}, 'fərqli valyutada')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BuildingOfficeIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in transition-all ${
                        toastType === 'success'
                            ? 'bg-[#18181B] border-zinc-700 text-white'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                >
                    {toastType === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Filter Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#121214] border border-[#27272A]">
                {/* Left side: Search & Type Filter */}
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    <div className="relative flex-1 max-w-sm">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('treasury.searchPlaceholder', {}, 'Axtar (bank, hesab nömrəsi, valyuta, IBAN)...')}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Quick Type Dropdown */}
                    <div className="relative" ref={typeRef}>
                        <button
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            <span>
                                {t('common.type', {}, 'Növ')}:{' '}
                                <strong className="text-white font-medium">
                                    {typeFilter === 'ALL' ? t('common.all', {}, 'Hamısı') : typeFilter === 'Bank' ? t('treasury.typeBank', {}, 'Bank Hesabları') : t('treasury.typeCash', {}, 'Kassa')}
                                </strong>
                            </span>
                            <ArrowsUpDownIcon className="w-3 h-3 text-zinc-500" />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-44 rounded-xl bg-[#18181B] border border-[#27272A] py-1 shadow-xl z-30">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { key: 'Bank', label: t('treasury.typeBank', {}, 'Bank Hesabları') },
                                    { key: 'Cash', label: t('treasury.typeCash', {}, 'Kassa (Cash)') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setTypeFilter(item.key as any);
                                            setIsTypeDropdownOpen(false);
                                            setCurrentPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/5 ${
                                            typeFilter === item.key ? 'text-white font-semibold' : 'text-zinc-400'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {typeFilter === item.key && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Advanced Filter, Columns, Sorting */}
                <div className="flex items-center gap-2">
                    {/* Advanced Filter Popover */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                                activeFilterCount > 0
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#18181B] border-[#27272A] text-zinc-300 hover:text-white hover:bg-[#27272A]'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#18181B] border border-[#27272A] p-4 shadow-2xl z-40 space-y-3.5">
                                <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                                    <span className="text-xs font-bold text-white">{t('common.filterOptions', {}, 'Filter Parametrləri')}</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                                        >
                                            {t('common.reset', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('common.currency', {}, 'Valyuta')}</label>
                                    <select
                                        value={currencyFilter}
                                        onChange={(e) => {
                                            setCurrencyFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.allCurrencies', {}, 'Bütün valyutalar')}</option>
                                        {CURRENCIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('common.status', {}, 'Status')}</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value as any);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Hamısı')}</option>
                                        <option value="active">{t('treasury.onlyActive', {}, 'Yalnız Aktiv Hesablar')}</option>
                                        <option value="inactive">{t('treasury.onlyInactive', {}, 'Deaktiv Hesablar')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('treasury.minBalance', {}, 'Minimum Balans (AZN)')}</label>
                                    <input
                                        type="number"
                                        placeholder="Məs: 1000"
                                        value={minBalanceFilter}
                                        onChange={(e) => {
                                            setMinBalanceFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs font-mono text-white focus:outline-hidden"
                                    />
                                </div>

                                <div className="pt-2 border-t border-[#27272A]">
                                    <button
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="w-full py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                                    >
                                        {t('common.apply', {}, 'Tətbiq et')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columns Toggle */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                            <span>{t('common.columns', {}, 'Sütunlar')}</span>
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#18181B] border border-[#27272A] p-3 shadow-2xl z-40 space-y-2">
                                <div className="text-[11px] font-bold text-white pb-1.5 border-b border-[#27272A]">
                                    {t('common.visibleColumns', {}, 'Görünən Sütunlar')}
                                </div>
                                <div className="space-y-1 max-h-56 overflow-y-auto">
                                    {columns.map((col) => (
                                        <label
                                            key={col.key}
                                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 text-xs text-zinc-300 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={col.visible}
                                                onChange={() => toggleColumn(col.key)}
                                                className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                            />
                                            <span>{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sorting Toggle */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                            <span>{t('common.sort', {}, 'Sıralama')}</span>
                        </button>

                        {isSortOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#18181B] border border-[#27272A] p-2 shadow-2xl z-40 space-y-1">
                                {[
                                    { key: 'balance', label: t('treasury.sortByBalance', {}, 'Balans üzrə') },
                                    { key: 'name', label: t('treasury.sortByName', {}, 'Ad üzrə (A-Z)') },
                                    { key: 'currency', label: t('treasury.sortByCurrency', {}, 'Valyuta üzrə') },
                                    { key: 'date', label: t('treasury.sortByDate', {}, 'Yaradılma Tarixi') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            if (sortField === item.key) {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField(item.key as any);
                                                setSortDirection('desc');
                                            }
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between hover:bg-white/5 ${
                                            sortField === item.key ? 'text-white font-semibold' : 'text-zinc-400'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {sortField === item.key && (
                                            <span className="text-[10px] text-zinc-400">
                                                {sortDirection === 'desc' ? t('common.descending', {}, 'Azalan') : t('common.ascending', {}, 'Artan')}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Rows Bulk Actions Bar */}
            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#18181B] border border-zinc-700 text-xs">
                    <span className="font-semibold text-white">{selectedRows.length} {t('treasury.accountsSelected', {}, 'hesab seçilib')}</span>
                    <button
                        onClick={() => setSelectedRows([])}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                    >
                        {t('common.clearSelection', {}, 'Seçimi ləğv et')}
                    </button>
                </div>
            )}

            {/* Main Table */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                <th className="w-10 py-3.5 px-4">
                                    <input
                                        type="checkbox"
                                        checked={
                                            paginatedAccounts.length > 0 &&
                                            paginatedAccounts.every((b) => selectedRows.includes(b.id))
                                        }
                                        onChange={handleSelectAll}
                                        className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                    />
                                </th>
                                {isColVisible('bankName') && <th className="py-3.5 px-4">{t('treasury.bankName', {}, 'Hesab / Bank Adı')}</th>}
                                {isColVisible('accountNumber') && <th className="py-3.5 px-4">{t('treasury.accountNumber', {}, 'Hesab Nömrəsi / IBAN')}</th>}
                                {isColVisible('swiftCode') && <th className="py-3.5 px-4">SWIFT / BIC</th>}
                                {isColVisible('currency') && <th className="py-3.5 px-4 text-center">{t('common.currency', {}, 'Valyuta')}</th>}
                                {isColVisible('glAccount') && <th className="py-3.5 px-4">{t('treasury.glAccount', {}, 'Mühasibat Hesabı (GL)')}</th>}
                                {isColVisible('balance') && <th className="py-3.5 px-4 text-right">{t('treasury.currentBalance', {}, 'Cari Balans')}</th>}
                                {isColVisible('status') && <th className="py-3.5 px-4 text-center">{t('common.status', {}, 'Status')}</th>}
                                <th className="w-32 py-3.5 px-4 text-right"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-400" />
                                            <span>{t('common.loading', {}, 'Bank hesabları yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BuildingLibraryIcon className="w-8 h-8 text-zinc-600" />
                                            <span className="font-semibold text-zinc-400">{t('treasury.noAccountsFound', {}, 'Heç bir bank hesabı tapılmadı')}</span>
                                            <p className="text-[11px] text-zinc-500 max-w-sm">
                                                {t('treasury.noAccountsFoundDesc', {}, 'Yuxarıdakı "+ Yeni Hesab / Kassa" düyməsinə klikləyərək yeni bank və ya kassa hesabı əlavə edin.')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAccounts.map((acc) => {
                                    const isSelected = selectedRows.includes(acc.id);
                                    const isCash = acc.accountType === 'Cash' || String(acc.bankName).toLowerCase().includes('kassa');
                                    const matchedGl = glAccounts.find((g) => g.id === acc.glAccountId);

                                    return (
                                        <tr
                                            key={acc.id}
                                            className={`hover:bg-white/[0.02] transition-colors group ${
                                                isSelected ? 'bg-white/[0.04]' : ''
                                            }`}
                                        >
                                            <td className="py-3.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(acc.id)}
                                                    className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                                />
                                            </td>

                                            {isColVisible('bankName') && (
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                                                isCash
                                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                                    : 'bg-white/5 border-white/10 text-white'
                                                            }`}
                                                        >
                                                            {isCash ? (
                                                                <BanknotesIcon className="w-4 h-4" />
                                                            ) : (
                                                                <BuildingLibraryIcon className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                to={`/bank-accounts/${acc.id}`}
                                                                className="font-bold text-white hover:text-zinc-300 hover:underline"
                                                            >
                                                                {acc.bankName}
                                                            </Link>
                                                            {acc.accountName && acc.accountName !== acc.bankName && (
                                                                <div className="text-[11px] text-zinc-400">
                                                                    {acc.accountName}
                                                                </div>
                                                            )}
                                                            {acc.branchName && (
                                                                <div className="text-[10px] text-zinc-500">
                                                                    {acc.branchName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {isColVisible('accountNumber') && (
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-300">
                                                        <span>{acc.accountNumber || acc.iban || '—'}</span>
                                                        {acc.accountNumber && (
                                                            <button
                                                                onClick={() => handleCopyIban(acc.id, acc.accountNumber)}
                                                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                                                title={t('treasury.copyIban', {}, 'IBAN Kopyala')}
                                                            >
                                                                {copiedId === acc.id ? (
                                                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                                                ) : (
                                                                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {isColVisible('swiftCode') && (
                                                <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                                                    {acc.swiftCode || '—'}
                                                </td>
                                            )}

                                            {isColVisible('currency') && (
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18181B] text-zinc-300 border border-[#27272A]">
                                                        {acc.currency || 'AZN'}
                                                    </span>
                                                </td>
                                            )}

                                            {isColVisible('glAccount') && (
                                                <td className="py-3.5 px-4 text-zinc-300 text-xs">
                                                    {matchedGl ? (
                                                        <span title={matchedGl.name}>
                                                            <strong className="text-white font-mono">{matchedGl.code}</strong> - {matchedGl.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-500">
                                                            {acc.glAccountId ? t('treasury.assigned', {}, 'Təyin edilib') : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {isColVisible('balance') && (
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-xs">
                                                    {formatCurrency(acc.currentBalance, acc.currency)}
                                                </td>
                                            )}

                                            {isColVisible('status') && (
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            acc.isActive
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        }`}
                                                    >
                                                        {acc.isActive ? t('statuses.active', {}, 'Aktiv') : t('statuses.inactive', {}, 'Deaktiv')}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openDepositModal(acc)}
                                                        className="px-2 py-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                                        title={t('treasury.depositOrStatement', {}, 'Balansı artır və ya çıxarış daxil et')}
                                                    >
                                                        <PlusIcon className="w-3 h-3" />
                                                        <span>{t('treasury.deposit', {}, 'Mədaxil')}</span>
                                                    </button>

                                                    <Link
                                                        to={`/bank-accounts/${acc.id}`}
                                                        className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                        title={t('treasury.bankAccountDetails', {}, 'Hesab detalları')}
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                    </Link>
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
                        {filteredAccounts.length === 0
                            ? `0 ${t('common.of', {}, 'of')} 0`
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredAccounts.length
                              )} ${t('common.of', {}, 'of')} ${filteredAccounts.length}`}
                    </span>
                </div>
            </div>

            {/* Create Bank Account / Cash Desk Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-xl rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('treasury.newBankAccount', {}, 'Yeni Bank Hesabı / Kassa')}</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {t('treasury.newAccountDesc', {}, 'Mühasibatlıq sistemi üçün yeni bank hesabı və ya nağd kassa qeydiyyatdan keçirin')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{createError}</span>
                            </div>
                        )}

                        {/* Account Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#18181B] border border-[#27272A]">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalAccountType('Bank');
                                    const gl = glAccounts.find((a) => a.code === '1020');
                                    if (gl) setModalGlAccountId(gl.id);
                                }}
                                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    modalAccountType === 'Bank'
                                        ? 'bg-white text-black shadow-xs'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <BuildingLibraryIcon className="w-4 h-4" />
                                <span>{t('treasury.typeBank', {}, 'Bank Hesabı')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setModalAccountType('Cash');
                                    const gl = glAccounts.find((a) => a.code === '1010');
                                    if (gl) setModalGlAccountId(gl.id);
                                }}
                                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    modalAccountType === 'Cash'
                                        ? 'bg-white text-black shadow-xs'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <BanknotesIcon className="w-4 h-4" />
                                <span>{t('treasury.typeCash', {}, 'Kassa (Cash Desk)')}</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            {/* Popular Bank Chips (Only for Bank type) */}
                            {modalAccountType === 'Bank' && (
                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1.5">{t('treasury.popularBanks', {}, 'Populyar Banklar:')}</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {POPULAR_BANKS.map((b) => (
                                            <button
                                                key={b.name}
                                                type="button"
                                                onClick={() => handleSelectPresetBank(b)}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                                                    modalBankName === b.name
                                                        ? 'bg-white text-black border-white font-semibold'
                                                        : 'bg-[#18181B] border-[#27272A] text-zinc-300 hover:text-white hover:bg-[#27272A]'
                                                }`}
                                            >
                                                {b.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {modalAccountType === 'Bank' ? `${t('treasury.bankName', {}, 'Bank Adı')} *` : `${t('treasury.typeCash', {}, 'Kassa Adı')} *`}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={modalAccountType === 'Bank' ? 'Məs: PAŞA Bank ASC' : 'Məs: Baş Kassa'}
                                        value={modalBankName}
                                        onChange={(e) => setModalBankName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.accountName', {}, 'Hesabın Təyinatı / Adı')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Məs: Əsas Hesablaşma Hesabı"
                                        value={modalAccountName}
                                        onChange={(e) => setModalAccountName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {modalAccountType === 'Bank' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                            {t('treasury.iban', {}, 'Hesab Nömrəsi / IBAN')} *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="AZ21NABZ01350100000000012345"
                                            value={modalAccountNumber}
                                            onChange={(e) => setModalAccountNumber(e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                            {t('treasury.swiftCode', {}, 'SWIFT / BIC Kodu')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="PASHAZ22"
                                            value={modalSwiftCode}
                                            onChange={(e) => setModalSwiftCode(e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.currency', {}, 'Valyuta')} *</label>
                                    <select
                                        value={modalCurrency}
                                        onChange={(e) => setModalCurrency(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.glAccount', {}, 'Mühasibatlıq (GL) Hesabı')}
                                    </label>
                                    <select
                                        value={modalGlAccountId}
                                        onChange={(e) => setModalGlAccountId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    >
                                        <option value="">{t('treasury.noGlAssigned', {}, 'Hesab təyin edilməsin')}</option>
                                        {glAccounts.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.code} - {g.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.openingBalance', {}, 'İlkin Qalıq / Açılış Balansı')} ({modalCurrency})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={modalOpeningBalance}
                                        onChange={(e) => setModalOpeningBalance(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                {modalAccountType === 'Bank' && (
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                            {t('treasury.branchName', {}, 'Filial / Şöbə')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Məs: Baş Ofis Filialı"
                                            value={modalBranchName}
                                            onChange={(e) => setModalBranchName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <CheckIcon className="w-4 h-4 text-black" />
                                    )}
                                    <span>{modalAccountType === 'Bank' ? t('treasury.createBankSubmit', {}, 'Bank Hesabını Yarat') : t('treasury.createCashSubmit', {}, 'Kassanı Yarat')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Deposit Modal */}
            {showDepositModal && depositAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('treasury.quickDepositTitle', {}, 'Mədaxil / Balans Artırılması')}</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {depositAccount.bankName} ({depositAccount.currency})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {depositError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{depositError}</span>
                            </div>
                        )}

                        <form onSubmit={handleDepositSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                    {t('common.amount', {}, 'Məbləğ')} ({depositAccount.currency}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    autoFocus
                                    placeholder="0.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-sm font-mono font-bold text-emerald-400 placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                    {t('common.description', {}, 'Təyinat / Açıqlama')}
                                </label>
                                <input
                                    type="text"
                                    value={depositDescription}
                                    onChange={(e) => setDepositDescription(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowDepositModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={depositLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {depositLoading ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <CheckIcon className="w-4 h-4 text-black" />
                                    )}
                                    <span>{t('treasury.increaseBalance', {}, 'Balansı Artır')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankAccountsPage;

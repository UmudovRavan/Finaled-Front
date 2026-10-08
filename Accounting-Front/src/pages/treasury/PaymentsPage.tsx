import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentService, customersService, procurementService, accountsService } from '../../api';
import type {
    PaymentDto,
    BankAccountDto,
    CustomerDto,
    SupplierDto,
    AccountDto,
    CreatePaymentRequest,
} from '../../dto';
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
    BanknotesIcon,
    BuildingLibraryIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentTextIcon,
    UserIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

const CURRENCIES = ['AZN', 'USD', 'EUR', 'TRY', 'GBP', 'RUB'];

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export const PaymentsPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Data states
    const [payments, setPayments] = useState<PaymentDto[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [glAccounts, setGlAccounts] = useState<AccountDto[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Selection & Pagination
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [partyTypeFilter, setPartyTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
    const [filterBankAccountId, setFilterBankAccountId] = useState<string>('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Popover toggles
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'date' | 'amount' | 'number' | 'party'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'date', label: t('common.date', {}, 'Tarix'), visible: true },
        { key: 'number', label: t('treasury.paymentNumber', {}, 'Ödəniş №'), visible: true },
        { key: 'type', label: t('common.type', {}, 'Növ'), visible: true },
        { key: 'party', label: t('treasury.party', {}, 'Qarşı Tərəf'), visible: true },
        { key: 'account', label: t('treasury.bankOrCash', {}, 'Bank / Kassa'), visible: true },
        { key: 'currency', label: t('common.currency', {}, 'Valyuta'), visible: true },
        { key: 'amount', label: t('common.amount', {}, 'Məbləğ'), visible: true },
        { key: 'allocated', label: t('treasury.allocatedAmount', {}, 'Bölüşdürülən'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalPaymentTypeEnum, setModalPaymentTypeEnum] = useState<number>(1); // 1: Receipt, 2: CustAdvance, 3: SuppPayment, 4: SuppAdvance, 5: InternalTransfer
    const [modalPartyId, setModalPartyId] = useState('');
    const [modalBankAccountId, setModalBankAccountId] = useState('');
    const [modalPaymentDate, setModalPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalPostingDate, setModalPostingDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalAmount, setModalAmount] = useState<string>('');
    const [modalCurrency, setModalCurrency] = useState('AZN');
    const [modalExchangeRate, setModalExchangeRate] = useState<string>('1.0');
    const [modalPaymentMethod, setModalPaymentMethod] = useState<'BankTransfer' | 'Cash' | 'CreditCard'>('BankTransfer');
    const [modalReference, setModalReference] = useState('');
    const [modalNotes, setModalNotes] = useState('');
    const [modalAutoPost, setModalAutoPost] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

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
            const [pmts, banks, gls, custs, supps] = await Promise.all([
                paymentService.getPayments(),
                paymentService.getBankAccounts().catch(() => []),
                accountsService.getAccounts().catch(() => []),
                customersService.getCustomers().catch(() => []),
                procurementService.getSuppliers().catch(() => []),
            ]);

            setPayments(pmts);
            setBankAccounts(banks);
            setGlAccounts(gls);
            setCustomers(custs);
            setSuppliers(supps);
        } catch (err) {
            console.error('Failed to load payments data:', err);
            showToast(t('treasury.paymentsLoadFailed', {}, 'Ödənişlər yüklənərkən xəta baş verdi'), 'error');
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

    const handleCopy = (id: string, text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
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

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '—';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        } catch {
            return dateStr;
        }
    };

    const getTypeBadge = (type: any, paymentType?: string) => {
        const tVal = String(type || '').toLowerCase();
        const pt = String(paymentType || '').toLowerCase();

        if (tVal === '1' || tVal.includes('customerreceipt') || pt === 'incoming') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    <span>{t('treasury.typeCustomerReceipt', {}, 'Mədaxil')}</span>
                </span>
            );
        }
        if (tVal === '2' || tVal.includes('customeradvance')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    <span>{t('treasury.customerAdvance', {}, 'Müştəri Avansı')}</span>
                </span>
            );
        }
        if (tVal === '3' || tVal.includes('supplierpayment') || pt === 'outgoing') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                    <span>{t('treasury.typeSupplierPayment', {}, 'Məxaric')}</span>
                </span>
            );
        }
        if (tVal === '4' || tVal.includes('supplieradvance')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                    <span>{t('treasury.supplierAdvance', {}, 'Təchizatçı Avansı')}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ArrowsRightLeftIcon className="w-3 h-3" />
                <span>{t('treasury.typeInternalTransfer', {}, 'Transfer')}</span>
            </span>
        );
    };

    // Open Create Modal
    const openCreateModal = () => {
        setModalPaymentTypeEnum(1);
        setModalPartyId(customers[0]?.id || '');
        setModalBankAccountId(bankAccounts[0]?.id || '');
        setModalPaymentDate(new Date().toISOString().split('T')[0]);
        setModalPostingDate(new Date().toISOString().split('T')[0]);
        setModalAmount('');
        setModalCurrency('AZN');
        setModalExchangeRate('1.0');
        setModalPaymentMethod('BankTransfer');
        setModalReference(`REF-${Date.now().toString().slice(-5)}`);
        setModalNotes('');
        setModalAutoPost(true);
        setCreateError('');
        setShowCreateModal(true);
    };

    // On Type Change in Modal
    const handleTypeChange = (enumVal: number) => {
        setModalPaymentTypeEnum(enumVal);
        if (enumVal === 1 || enumVal === 2) {
            setModalPartyId(customers[0]?.id || '');
        } else if (enumVal === 3 || enumVal === 4) {
            setModalPartyId(suppliers[0]?.id || '');
        } else {
            setModalPartyId('');
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(modalAmount);
        if (!amt || amt <= 0) {
            setCreateError(t('treasury.specifyValidAmount', {}, 'Zəhmət olmasa 0-dan böyük məbləğ daxil edin.'));
            return;
        }

        const isCust = modalPaymentTypeEnum === 1 || modalPaymentTypeEnum === 2;
        const isSupp = modalPaymentTypeEnum === 3 || modalPaymentTypeEnum === 4;

        if ((isCust || isSupp) && !modalPartyId) {
            setCreateError(t('treasury.specifyParty', {}, 'Zəhmət olmasa qarşı tərəfi seçin.'));
            return;
        }

        if (!modalBankAccountId) {
            setCreateError(t('treasury.specifyAccount', {}, 'Zəhmət olmasa Bank və ya Kassa hesabını seçin.'));
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const matchedBank = bankAccounts.find((b) => b.id === modalBankAccountId);
            let partyName = '';
            if (isCust) {
                const found = customers.find((c) => c.id === modalPartyId);
                partyName = found?.name || '';
            } else if (isSupp) {
                const found = suppliers.find((s) => s.id === modalPartyId);
                partyName = found?.name || '';
            }

            const payload: any = {
                type: modalPaymentTypeEnum,
                paymentType: isCust ? 'Incoming' : 'Outgoing',
                partyType: isCust ? 'Customer' : isSupp ? 'Supplier' : undefined,
                partyId: modalPartyId || undefined,
                partyName,
                bankAccountId: modalBankAccountId,
                bankAccountName: matchedBank?.bankName || matchedBank?.accountName,
                glAccountId: matchedBank?.glAccountId,
                paymentDate: modalPaymentDate,
                postingDate: modalPostingDate,
                amount: amt,
                currency: modalCurrency,
                exchangeRate: Number(modalExchangeRate) || 1.0,
                paymentMethod: modalPaymentMethod,
                reference: modalReference.trim(),
                referenceNumber: modalReference.trim(),
                notes: modalNotes.trim(),
                autoPost: modalAutoPost,
            };

            const created = await paymentService.createPayment(payload);

            showToast(`${created.paymentNumber} ${t('treasury.paymentCreatedSuccess', {}, 'ödəniş sənədi uğurla yaradıldı!')}`);
            setShowCreateModal(false);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to create payment:', err);
            setCreateError(extractErrorMessage(err));
        } finally {
            setCreateLoading(false);
        }
    };

    // Post individual payment
    const handlePostPayment = async (pId: string, pNumber: string) => {
        setActionLoadingId(pId);
        try {
            await paymentService.postPayment(pId);
            showToast(`${pNumber} ${t('treasury.paymentPostedSuccess', {}, 'ödənişi uğurla icra edildi və uçota alındı!')}`);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to post payment:', err);
            showToast(extractErrorMessage(err), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // KPI Aggregations
    const stats = useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;
        let postedCount = 0;

        payments.forEach((p) => {
            const amt = Number(p.amount) || 0;
            const isIncoming = p.paymentType === 'Incoming' || p.rawType === 1 || p.rawType === 2;
            const isOutgoing = p.paymentType === 'Outgoing' || p.rawType === 3 || p.rawType === 4;

            if (isIncoming) totalIn += amt;
            else if (isOutgoing) totalOut += amt;

            const isPosted = String(p.status || '').toLowerCase().includes('posted') || p.rawStatus === 4;
            if (isPosted) postedCount++;
        });

        const netCashflow = totalIn - totalOut;

        return {
            totalIn,
            totalOut,
            netCashflow,
            totalCount: payments.length,
            postedCount,
        };
    }, [payments]);

    // Filtering & Sorting
    const filteredPayments = useMemo(() => {
        return payments.filter((p) => {
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchNum = p.paymentNumber?.toLowerCase().includes(term);
                const matchParty = p.partyName?.toLowerCase().includes(term);
                const matchBank = p.bankAccountName?.toLowerCase().includes(term);
                const matchRef = p.reference?.toLowerCase().includes(term);
                const matchNotes = p.notes?.toLowerCase().includes(term);
                if (!matchNum && !matchParty && !matchBank && !matchRef && !matchNotes) return false;
            }

            if (typeFilter !== 'ALL') {
                const isIncoming = p.paymentType === 'Incoming' || p.rawType === 1 || p.rawType === 2;
                const isOutgoing = p.paymentType === 'Outgoing' || p.rawType === 3 || p.rawType === 4;
                if (typeFilter === 'Incoming' && !isIncoming) return false;
                if (typeFilter === 'Outgoing' && !isOutgoing) return false;
                if (typeFilter === 'CustAdvance' && p.rawType !== 2) return false;
                if (typeFilter === 'SuppAdvance' && p.rawType !== 4) return false;
            }

            if (partyTypeFilter !== 'ALL' && p.partyType !== partyTypeFilter) {
                return false;
            }

            if (statusFilter !== 'ALL') {
                const isPosted = String(p.status || '').toLowerCase().includes('posted') || p.rawStatus === 4;
                if (statusFilter === 'Posted' && !isPosted) return false;
                if (statusFilter === 'Draft' && isPosted) return false;
            }

            if (currencyFilter !== 'ALL' && p.currency !== currencyFilter) {
                return false;
            }

            if (filterBankAccountId !== 'ALL' && p.bankAccountId !== filterBankAccountId) {
                return false;
            }

            const rowDate = p.paymentDate || p.postingDate;
            if (filterStartDate && rowDate && new Date(rowDate) < new Date(filterStartDate)) return false;
            if (filterEndDate && rowDate && new Date(rowDate) > new Date(filterEndDate + 'T23:59:59')) return false;

            return true;
        }).sort((a, b) => {
            let comp = 0;
            if (sortField === 'date') {
                comp = new Date(a.paymentDate || 0).getTime() - new Date(b.paymentDate || 0).getTime();
            } else if (sortField === 'amount') {
                comp = (Number(a.amount) || 0) - (Number(b.amount) || 0);
            } else if (sortField === 'number') {
                comp = (a.paymentNumber || '').localeCompare(b.paymentNumber || '');
            } else if (sortField === 'party') {
                comp = (a.partyName || '').localeCompare(b.partyName || '');
            }
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [payments, searchTerm, typeFilter, partyTypeFilter, statusFilter, currencyFilter, filterBankAccountId, filterStartDate, filterEndDate, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
    const paginatedPayments = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPayments.slice(start, start + pageSize);
    }, [filteredPayments, currentPage, pageSize]);

    const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;
    const toggleColumn = (key: string) => {
        setColumns(columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
    };

    const handleSelectAll = () => {
        if (paginatedPayments.every((p) => selectedRows.includes(p.id))) {
            setSelectedRows(selectedRows.filter((id) => !paginatedPayments.some((p) => p.id === id)));
        } else {
            const next = Array.from(new Set([...selectedRows, ...paginatedPayments.map((p) => p.id)]));
            setSelectedRows(next);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(selectedRows.includes(id) ? selectedRows.filter((i) => i !== id) : [...selectedRows, id]);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (partyTypeFilter !== 'ALL') count++;
        if (statusFilter !== 'ALL') count++;
        if (currencyFilter !== 'ALL') count++;
        if (filterBankAccountId !== 'ALL') count++;
        if (filterStartDate) count++;
        if (filterEndDate) count++;
        return count;
    }, [partyTypeFilter, statusFilter, currencyFilter, filterBankAccountId, filterStartDate, filterEndDate]);

    const resetFilters = () => {
        setTypeFilter('ALL');
        setPartyTypeFilter('ALL');
        setStatusFilter('ALL');
        setCurrencyFilter('ALL');
        setFilterBankAccountId('ALL');
        setFilterStartDate('');
        setFilterEndDate('');
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
                        <h1 className="text-2xl font-bold tracking-tight text-white">{t('treasury.paymentsTitle', {}, 'Ödənişlər və Mədaxillər')}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#18181B] text-zinc-400 border border-[#27272A]">
                            {payments.length} {t('treasury.recordsCount', {}, 'qeyd')}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        {t('treasury.paymentsSubtitle', {}, 'Müştərilərdən mədaxillər, təchizatçılara ödənişlər, avanslar və kassa/bank köçürmələri jurnalı')}
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
                        <span>{t('treasury.newPayment', {}, 'Yeni Ödəniş / Mədaxil')}</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalReceipts', {}, 'Toplam Mədaxil (+)')}</div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                            +{formatCurrency(stats.totalIn, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.customerReceiptsDesc', {}, 'Müştərilərdən daxilolmalar')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalPaymentsOut', {}, 'Toplam Məxaric (-)')}</div>
                        <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
                            -{formatCurrency(stats.totalOut, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.supplierPaymentsDesc', {}, 'Təchizatçılara ödənişlər')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <ArrowTrendingDownIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.netCashflow', {}, 'Xalis Pul Axını')}</div>
                        <div
                            className={`text-xl font-bold font-mono mt-0.5 ${
                                stats.netCashflow >= 0 ? 'text-white' : 'text-rose-400'
                            }`}
                        >
                            {stats.netCashflow >= 0 ? '+' : ''}{formatCurrency(stats.netCashflow, 'AZN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.cashflowDesc', {}, 'Mədaxil və məxaric fərqi')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalPaymentsCount', {}, 'Ümumi Ödəniş Sayı')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {stats.totalCount} <span className="text-xs font-normal text-zinc-500">({stats.postedCount} {t('treasury.postedCountSuffix', {}, 'uçotda')})</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.receiptsTotalDesc', {}, 'Ödəniş qəbzləri cəmi')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <DocumentTextIcon className="w-5 h-5" />
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
                            placeholder={t('treasury.searchPaymentPlaceholder', {}, 'Axtar (nömrə, qarşı tərəf, bank, təyinat)...')}
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
                                    {typeFilter === 'ALL'
                                        ? t('common.all', {}, 'Hamısı')
                                        : typeFilter === 'Incoming'
                                        ? t('treasury.incomingFilter', {}, 'Mədaxil (Receipt)')
                                        : typeFilter === 'Outgoing'
                                        ? t('treasury.outgoingFilter', {}, 'Məxaric (Payment)')
                                        : typeFilter === 'CustAdvance'
                                        ? t('treasury.customerAdvance', {}, 'Müştəri Avansı')
                                        : t('treasury.supplierAdvance', {}, 'Təchizatçı Avansı')}
                                </strong>
                            </span>
                            <ArrowsUpDownIcon className="w-3 h-3 text-zinc-500" />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-[#18181B] border border-[#27272A] py-1 shadow-xl z-30">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { key: 'Incoming', label: t('treasury.incomingFilter', {}, 'Mədaxil (Gələn)') },
                                    { key: 'Outgoing', label: t('treasury.outgoingFilter', {}, 'Məxaric (Gedən)') },
                                    { key: 'CustAdvance', label: t('treasury.customerAdvance', {}, 'Müştəri Avansı') },
                                    { key: 'SuppAdvance', label: t('treasury.supplierAdvance', {}, 'Təchizatçı Avansı') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setTypeFilter(item.key);
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
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('common.status', {}, 'Status')}</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.allStatuses', {}, 'Bütün statuslar')}</option>
                                        <option value="Posted">{t('statuses.posted', {}, 'Uçota alınıb (Posted)')}</option>
                                        <option value="Draft">{t('statuses.draft', {}, 'Qaralama (Draft)')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('treasury.partyType', {}, 'Qarşı Tərəf Növü')}</label>
                                    <select
                                        value={partyTypeFilter}
                                        onChange={(e) => {
                                            setPartyTypeFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Hamısı')}</option>
                                        <option value="Customer">{t('treasury.onlyCustomers', {}, 'Yalnız Müştərilər')}</option>
                                        <option value="Supplier">{t('treasury.onlySuppliers', {}, 'Yalnız Təchizatçılar')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('treasury.bankOrCashAccount', {}, 'Bank / Kassa Hesabı')}</label>
                                    <select
                                        value={filterBankAccountId}
                                        onChange={(e) => {
                                            setFilterBankAccountId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('treasury.allAccounts', {}, 'Bütün hesablar')}</option>
                                        {bankAccounts.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.bankName} ({b.currency})
                                            </option>
                                        ))}
                                    </select>
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

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1">{t('common.startDate', {}, 'Başlanğıc Tarix')}</label>
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => {
                                                setFilterStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1">{t('common.endDate', {}, 'Son Tarix')}</label>
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => {
                                                setFilterEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                        />
                                    </div>
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
                                    { key: 'date', label: t('treasury.sortByDate', {}, 'Tarix üzrə') },
                                    { key: 'amount', label: t('treasury.sortByAmount', {}, 'Məbləğ üzrə') },
                                    { key: 'number', label: t('treasury.sortByNumber', {}, 'Ödəniş № üzrə') },
                                    { key: 'party', label: t('treasury.sortByParty', {}, 'Qarşı tərəf üzrə') },
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
                    <span className="font-semibold text-white">{selectedRows.length} {t('treasury.paymentsSelected', {}, 'ödəniş seçilib')}</span>
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
                                            paginatedPayments.length > 0 &&
                                            paginatedPayments.every((p) => selectedRows.includes(p.id))
                                        }
                                        onChange={handleSelectAll}
                                        className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                    />
                                </th>
                                {isColVisible('date') && <th className="py-3.5 px-4">{t('common.date', {}, 'Tarix')}</th>}
                                {isColVisible('number') && <th className="py-3.5 px-4">{t('treasury.paymentNumber', {}, 'Ödəniş №')}</th>}
                                {isColVisible('type') && <th className="py-3.5 px-4">{t('common.type', {}, 'Növ')}</th>}
                                {isColVisible('party') && <th className="py-3.5 px-4">{t('treasury.party', {}, 'Qarşı Tərəf')}</th>}
                                {isColVisible('account') && <th className="py-3.5 px-4">{t('treasury.bankOrCash', {}, 'Bank / Kassa')}</th>}
                                {isColVisible('currency') && <th className="py-3.5 px-4 text-center">{t('common.currency', {}, 'Valyuta')}</th>}
                                {isColVisible('amount') && <th className="py-3.5 px-4 text-right">{t('common.amount', {}, 'Məbləğ')}</th>}
                                {isColVisible('allocated') && <th className="py-3.5 px-4 text-right">{t('treasury.allocatedAmount', {}, 'Bölüşdürülən')}</th>}
                                {isColVisible('status') && <th className="py-3.5 px-4 text-center">{t('common.status', {}, 'Status')}</th>}
                                <th className="w-32 py-3.5 px-4 text-right"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-400" />
                                            <span>{t('common.loading', {}, 'Ödənişlər yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BanknotesIcon className="w-8 h-8 text-zinc-600" />
                                            <span className="font-semibold text-zinc-400">{t('treasury.noPaymentsFound', {}, 'Heç bir ödəniş tapılmadı')}</span>
                                            <p className="text-[11px] text-zinc-500 max-w-sm">
                                                {t('treasury.noPaymentsFoundDesc', {}, 'Yuxarıdakı "+ Yeni Ödəniş / Mədaxil" düyməsinə klikləyərək yeni ödəniş sənədi qeydiyyatdan keçirin.')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPayments.map((pmt) => {
                                    const isSelected = selectedRows.includes(pmt.id);
                                    const isPosted = String(pmt.status || '').toLowerCase().includes('posted') || pmt.rawStatus === 4;
                                    const isIncoming = pmt.paymentType === 'Incoming' || pmt.rawType === 1 || pmt.rawType === 2;

                                    return (
                                        <tr
                                            key={pmt.id}
                                            className={`hover:bg-white/[0.02] transition-colors group ${
                                                isSelected ? 'bg-white/[0.04]' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(pmt.id)}
                                                    className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                                />
                                            </td>

                                            {isColVisible('date') && (
                                                <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                                                    {formatDate(pmt.paymentDate || pmt.postingDate)}
                                                </td>
                                            )}

                                            {isColVisible('number') && (
                                                <td className="py-3 px-4 font-mono font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            to={`/payments/${pmt.id}`}
                                                            className="text-white hover:text-zinc-300 hover:underline"
                                                        >
                                                            {pmt.paymentNumber}
                                                        </Link>
                                                        <button
                                                            onClick={() => handleCopy(pmt.id, pmt.paymentNumber)}
                                                            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                                            title={t('common.copy', {}, 'Kopyala')}
                                                        >
                                                            {copiedId === pmt.id ? (
                                                                <CheckIcon className="w-3 h-3 text-emerald-400" />
                                                            ) : (
                                                                <ClipboardDocumentIcon className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {pmt.reference && (
                                                        <div className="text-[10px] font-mono text-zinc-500">
                                                            Ref: {pmt.reference}
                                                        </div>
                                                    )}
                                                </td>
                                            )}

                                            {isColVisible('type') && (
                                                <td className="py-3 px-4">
                                                    {getTypeBadge(pmt.rawType || pmt.paymentType, pmt.paymentType)}
                                                </td>
                                            )}

                                            {isColVisible('party') && (
                                                <td className="py-3 px-4 text-zinc-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span className="font-semibold text-white truncate max-w-[150px]">
                                                            {pmt.partyName || pmt.partyId || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {isColVisible('account') && (
                                                <td className="py-3 px-4 text-zinc-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <BuildingLibraryIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span className="truncate max-w-[130px]">
                                                            {pmt.bankAccountName || (pmt.paymentMethod === 'Cash' ? t('treasury.typeCash', {}, 'Kassa') : t('treasury.typeBank', {}, 'Bank Hesabı'))}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {isColVisible('currency') && (
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18181B] text-zinc-300 border border-[#27272A]">
                                                        {pmt.currency || 'AZN'}
                                                    </span>
                                                </td>
                                            )}

                                            {isColVisible('amount') && (
                                                <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                                                    <span className={isIncoming ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {isIncoming ? '+' : '-'}{formatCurrency(pmt.amount, pmt.currency)}
                                                    </span>
                                                </td>
                                            )}

                                            {isColVisible('allocated') && (
                                                <td className="py-3 px-4 text-right font-mono text-zinc-300 whitespace-nowrap">
                                                    {formatCurrency(pmt.allocatedAmount || 0, pmt.currency)}
                                                </td>
                                            )}

                                            {isColVisible('status') && (
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            isPosted
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}
                                                    >
                                                        {isPosted ? t('statuses.posted', {}, 'Uçotda') : t('statuses.draft', {}, 'Qaralama')}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {!isPosted && (
                                                        <button
                                                            onClick={() => handlePostPayment(pmt.id, pmt.paymentNumber)}
                                                            disabled={actionLoadingId === pmt.id}
                                                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                            title={t('treasury.postPayment', {}, 'İcra Et')}
                                                        >
                                                            {actionLoadingId === pmt.id ? (
                                                                <ArrowPathIcon className="w-3 h-3 animate-spin text-black" />
                                                            ) : (
                                                                <CheckIcon className="w-3 h-3 text-black" />
                                                            )}
                                                            <span>{t('treasury.postPayment', {}, 'İcra Et')}</span>
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/payments/${pmt.id}`}
                                                        className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                        title={t('common.view', {}, 'Baxış')}
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
                        {filteredPayments.length === 0
                            ? `0 ${t('common.of', {}, 'of')} 0`
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredPayments.length
                              )} ${t('common.of', {}, 'of')} ${filteredPayments.length}`}
                    </span>
                </div>
            </div>

            {/* Create Payment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('treasury.newPaymentTitle', {}, 'Yeni Ödəniş / Mədaxil Sənədi')}</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {t('treasury.newPaymentDesc', {}, 'Müştəri və ya təchizatçı üzrə nağd / bank ödənişi qeydiyyatdan keçirin')}
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

                        {/* Payment Type Selector Pills */}
                        <div>
                            <label className="text-[11px] text-zinc-400 block mb-1.5">{t('treasury.paymentTypeLabel', {}, 'Ödəniş Sənədinin Növü:')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#18181B] border border-[#27272A]">
                                {[
                                    { id: 1, label: t('treasury.typeCustomerReceipt', {}, 'Müştəri Mədaxili'), type: 'Receipt' },
                                    { id: 2, label: t('treasury.customerAdvance', {}, 'Müştəri Avansı'), type: 'Advance' },
                                    { id: 3, label: t('treasury.typeSupplierPayment', {}, 'Təchizatçı Ödənişi'), type: 'Payment' },
                                    { id: 4, label: t('treasury.supplierAdvance', {}, 'Təchizatçı Avansı'), type: 'Advance' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleTypeChange(item.id)}
                                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                            modalPaymentTypeEnum === item.id
                                                ? 'bg-white text-black shadow-xs'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Counterparty Selection */}
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {modalPaymentTypeEnum <= 2 ? `${t('customers.customer', {}, 'Müştəri')} *` : `${t('procurement.supplier', {}, 'Təchizatçı')} *`}
                                    </label>
                                    <select
                                        value={modalPartyId}
                                        onChange={(e) => setModalPartyId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    >
                                        <option value="">{t('common.select', {}, 'Seçin...')}</option>
                                        {(modalPaymentTypeEnum <= 2 ? customers : suppliers).map((party) => (
                                            <option key={party.id} value={party.id}>
                                                {party.name} ({party.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bank or Cash Account Selection */}
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.bankOrCashAccount', {}, 'Bank / Kassa Hesabı')} *
                                    </label>
                                    <select
                                        value={modalBankAccountId}
                                        onChange={(e) => {
                                            setModalBankAccountId(e.target.value);
                                            const found = bankAccounts.find((b) => b.id === e.target.value);
                                            if (found?.currency) setModalCurrency(found.currency);
                                        }}
                                        required
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    >
                                        <option value="">{t('common.select', {}, 'Seçin...')}</option>
                                        {bankAccounts.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.bankName} ({b.currency}) - {t('common.balance', {}, 'Qalıq')}: {b.currentBalance} {b.currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.amount', {}, 'Məbləğ')} *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={modalAmount}
                                        onChange={(e) => setModalAmount(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono font-bold text-emerald-400 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.currency', {}, 'Valyuta')}</label>
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
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.exchangeRate', {}, 'Məzənnə')}</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={modalExchangeRate}
                                        onChange={(e) => setModalExchangeRate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('treasury.paymentDate', {}, 'Ödəniş Tarixi')}</label>
                                    <input
                                        type="date"
                                        required
                                        value={modalPaymentDate}
                                        onChange={(e) => setModalPaymentDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('procurement.postingDate', {}, 'Uçot Tarixi')}</label>
                                    <input
                                        type="date"
                                        required
                                        value={modalPostingDate}
                                        onChange={(e) => setModalPostingDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('treasury.paymentMethod', {}, 'Ödəniş Metodu')}</label>
                                    <select
                                        value={modalPaymentMethod}
                                        onChange={(e) => setModalPaymentMethod(e.target.value as any)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    >
                                        <option value="BankTransfer">{t('treasury.bankTransfer', {}, 'Bank Köçürməsi')}</option>
                                        <option value="Cash">{t('treasury.cashDesk', {}, 'Nağd (Kassa)')}</option>
                                        <option value="CreditCard">{t('treasury.creditCard', {}, 'Bank Kartı')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.referenceReceiptNo', {}, 'Referans / Bank Qəbzi №')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Məs: TXN-98421"
                                        value={modalReference}
                                        onChange={(e) => setModalReference(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.notes', {}, 'Təyinat / Qeydlər')}</label>
                                    <input
                                        type="text"
                                        placeholder="Məs: Qaimə üzrə avans ödənişi"
                                        value={modalNotes}
                                        onChange={(e) => setModalNotes(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Auto Post Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="modalAutoPost"
                                    checked={modalAutoPost}
                                    onChange={(e) => setModalAutoPost(e.target.checked)}
                                    className="rounded bg-[#18181B] border-zinc-700 text-white focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="modalAutoPost" className="text-xs text-zinc-300 cursor-pointer select-none">
                                    {t('treasury.autoPostGl', {}, 'Ödənişi yaradılan kimi dərhal uçota al (Auto-Post to GL)')}
                                </label>
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
                                    <span>{t('treasury.createPaymentSubmit', {}, 'Ödənişi Yarat')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;

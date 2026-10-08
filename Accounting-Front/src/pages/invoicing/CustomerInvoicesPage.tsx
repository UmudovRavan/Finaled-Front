import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersService, paymentService, accountsService } from '../../api';
import type {
    CustomerInvoiceDto,
    CustomerDto,
    ItemDto,
    BankAccountDto,
    AccountDto,
    PayInvoiceRequest,
} from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ViewColumnsIcon,
    ChevronDownIcon,
    XMarkIcon,
    Bars3Icon,
    CheckIcon,
    DocumentTextIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    CreditCardIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const CustomerInvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [invoices, setInvoices] = useState<CustomerInvoiceDto[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Filters
    const [filterNumber, setFilterNumber] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // Dropdowns
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'date' | 'number' | 'customer' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility
    const [columns, setColumns] = useState([
        { key: 'number', label: 'Qaimə №', i18nKey: 'customers.invoiceNumber', visible: true },
        { key: 'customer', label: 'Müştəri', i18nKey: 'customers.customer', visible: true },
        { key: 'date', label: 'Tarix', i18nKey: 'common.date', visible: true },
        { key: 'dueDate', label: 'Son Ödəniş Tarixi', i18nKey: 'customers.dueDate', visible: true },
        { key: 'amount', label: 'Cəmi Məbləğ', i18nKey: 'common.grandTotal', visible: true },
        { key: 'paid', label: 'Ödənilən', i18nKey: 'common.paidAmount', visible: true },
        { key: 'remaining', label: 'Qalıq Borc', i18nKey: 'common.remainingAmount', visible: true },
        { key: 'status', label: 'Status', i18nKey: 'common.status', visible: true },
    ]);

    // Toast
    const [toastMessage, setToastMessage] = useState('');

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createCustomerId, setCreateCustomerId] = useState('');
    const [createIssueDate, setCreateIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [createDueDate, setCreateDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [createCurrency, setCreateCurrency] = useState('AZN');
    const [createNotes, setCreateNotes] = useState('');
    const [createLines, setCreateLines] = useState<
        { itemId: string; description: string; quantity: number | string; unitPrice: number | string; discountPercent: number | string; revenueAccountId: string }[]
    >([
        { itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, revenueAccountId: '' },
    ]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState<CustomerInvoiceDto | null>(null);
    const [payAmount, setPayAmount] = useState<number | string>('');
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [payMethod, setPayMethod] = useState('BankTransfer');
    const [payBankAccountId, setPayBankAccountId] = useState('');
    const [payReference, setPayReference] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    const loadData = async () => {
        setIsRefreshing(true);
        try {
            const [invoicesData, customersData, itemsData, bankData, accountsData] = await Promise.all([
                customersService.getInvoices(),
                customersService.getCustomers(),
                customersService.getItems().catch(() => []),
                paymentService.getBankAccounts().catch(() => []),
                accountsService.getAccounts().catch(() => []),
            ]);
            setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
            setCustomers(Array.isArray(customersData) ? customersData : []);
            setItems(Array.isArray(itemsData) ? itemsData : []);
            setBankAccounts(Array.isArray(bankData) ? bankData : []);
            setAccounts(Array.isArray(accountsData) ? accountsData : []);
        } catch (err) {
            console.error('Failed to load customer invoice data:', err);
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
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Income Accounts
    const revenueAccounts = useMemo(() => {
        return accounts.filter((a) => Number(a.category) === 4 || a.type === 'Revenue' || a.type === 10 || (typeof a.code === 'string' && a.code.startsWith('6')));
    }, [accounts]);

    // Create Modal Calculations
    const subTotal = useMemo(() => {
        return createLines.reduce((sum, l) => {
            const qty = parseFloat(String(l.quantity)) || 0;
            const price = parseFloat(String(l.unitPrice)) || 0;
            const disc = parseFloat(String(l.discountPercent)) || 0;
            const lineSub = (qty * price) * (1 - (disc / 100));
            return sum + lineSub;
        }, 0);
    }, [createLines]);

    const taxTotal = useMemo(() => subTotal * 0.18, [subTotal]);
    const grandTotal = useMemo(() => subTotal + taxTotal, [subTotal, taxTotal]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterNumber.trim()) count++;
        if (filterCustomer.trim()) count++;
        if (selectedStatus !== 'ALL') count++;
        if (fromDate) count++;
        if (toDate) count++;
        if (minAmount) count++;
        if (maxAmount) count++;
        return count;
    }, [filterNumber, filterCustomer, selectedStatus, fromDate, toDate, minAmount, maxAmount]);

    // Filter & Sort
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            if (filterNumber.trim()) {
                const num = String(inv.invoiceNumber || '').toLowerCase();
                if (!num.includes(filterNumber.trim().toLowerCase())) return false;
            }
            if (filterCustomer.trim()) {
                const name = String(inv.customerName || '').toLowerCase();
                if (!name.includes(filterCustomer.trim().toLowerCase())) return false;
            }
            if (selectedStatus !== 'ALL') {
                if (String(inv.status).toLowerCase() !== selectedStatus.toLowerCase()) return false;
            }
            if (fromDate) {
                const d = new Date(inv.issueDate || inv.invoiceDate || '');
                if (d < new Date(fromDate)) return false;
            }
            if (toDate) {
                const d = new Date(inv.issueDate || inv.invoiceDate || '');
                if (d > new Date(toDate + 'T23:59:59')) return false;
            }
            if (minAmount) {
                const min = parseFloat(minAmount);
                if (!isNaN(min) && (inv.totalAmount || inv.grandTotal || 0) < min) return false;
            }
            if (maxAmount) {
                const max = parseFloat(maxAmount);
                if (!isNaN(max) && (inv.totalAmount || inv.grandTotal || 0) > max) return false;
            }
            return true;
        }).sort((a, b) => {
            if (sortField === 'date') {
                const da = new Date(a.issueDate || a.invoiceDate || '').getTime();
                const db = new Date(b.issueDate || b.invoiceDate || '').getTime();
                return sortDirection === 'asc' ? da - db : db - da;
            }
            if (sortField === 'number') {
                const diff = String(a.invoiceNumber || '').localeCompare(String(b.invoiceNumber || ''));
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'customer') {
                const diff = String(a.customerName || '').localeCompare(String(b.customerName || ''));
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'amount') {
                const diff = (a.totalAmount || a.grandTotal || 0) - (b.totalAmount || b.grandTotal || 0);
                return sortDirection === 'asc' ? diff : -diff;
            }
            return 0;
        });
    }, [invoices, filterNumber, filterCustomer, selectedStatus, fromDate, toDate, minAmount, maxAmount, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
    const paginatedInvoices = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredInvoices.slice(start, start + pageSize);
    }, [filteredInvoices, currentPage, pageSize]);

    // Handle Create Lines
    const handleAddLine = () => {
        const defAcc = revenueAccounts[0]?.id || '';
        setCreateLines([...createLines, { itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, revenueAccountId: defAcc }]);
    };

    const handleRemoveLine = (idx: number) => {
        if (createLines.length <= 1) return;
        setCreateLines(createLines.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: string, val: any) => {
        const next = [...createLines];
        next[idx] = { ...next[idx], [field]: val };

        // If ItemId changed, auto-fill unitPrice and description
        if (field === 'itemId' && val) {
            const item = items.find((it) => it.id === val);
            if (item) {
                next[idx].description = item.name;
                next[idx].unitPrice = item.standardSellingPrice !== undefined ? item.standardSellingPrice : (item.unitPrice || '');
            }
        }
        setCreateLines(next);
    };

    // Submit Create Invoice
    const handleCreateSubmit = async (e: React.FormEvent, autoPost = false) => {
        e.preventDefault();
        if (!createCustomerId) {
            setCreateError(t('validation.customerRequired', {}, 'Zəhmət olmasa müştəri seçin.'));
            return;
        }
        if (createLines.length === 0) {
            setCreateError(t('validation.atLeastOneLine', {}, 'Fakturada ən azı 1 sətir olmalıdır.'));
            return;
        }

        for (const line of createLines) {
            const qty = parseFloat(String(line.quantity)) || 0;
            const price = parseFloat(String(line.unitPrice)) || 0;
            if (qty <= 0) {
                setCreateError(t('validation.invalidQuantity', {}, 'Məhsul sayı 0-dan böyük olmalıdır.'));
                return;
            }
            if (price < 0) {
                setCreateError(t('validation.invalidAmount', {}, 'Vahid qiymət mənfi ola bilməz.'));
                return;
            }
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            const defaultRev = revenueAccounts[0]?.id || accounts[0]?.id || undefined;
            const created = await customersService.createInvoice({
                customerId: createCustomerId,
                issueDate: createIssueDate,
                dueDate: createDueDate,
                currency: createCurrency,
                notes: createNotes,
                lines: createLines.map((l) => ({
                    itemId: l.itemId || null,
                    description: l.description || 'Məhsul / Xidmət satışı',
                    quantity: parseFloat(String(l.quantity)) || 1,
                    unitPrice: parseFloat(String(l.unitPrice)) || 0,
                    discountPercent: parseFloat(String(l.discountPercent)) || 0,
                    revenueAccountId: l.revenueAccountId || defaultRev,
                })),
            });

            if (autoPost && created?.id) {
                try {
                    await customersService.approveInvoice(created.id, createIssueDate);
                    showToast(t('customers.invoicePostedSuccess', {}, 'Satış qaiməsi yaradıldı və Baş Kitaba təsdiqləndi (Posted)!'));
                } catch {
                    showToast(t('customers.invoiceCreatedDraft', {}, 'Satış qaiməsi qaralama olaraq yaradıldı.'));
                }
            } else {
                showToast(t('customers.invoiceCreatedSuccess', {}, 'Yeni satış qaiməsi uğurla yaradıldı!'));
            }

            setShowCreateModal(false);
            setCreateCustomerId('');
            setCreateNotes('');
            setCreateLines([{ itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, revenueAccountId: '' }]);
            loadData();
        } catch (err: any) {
            setCreateError(err.response?.data?.detail || err.response?.data?.message || err.message || t('common.error', {}, 'Qaimə yaradılarkən xəta baş verdi.'));
        } finally {
            setCreateLoading(false);
        }
    };

    // Approve / Post Invoice
    const handleApprove = async (inv: CustomerInvoiceDto) => {
        setActionLoadingId(inv.id);
        try {
            await customersService.approveInvoice(inv.id, inv.issueDate || inv.invoiceDate);
            showToast(`${inv.invoiceNumber} - ${t('customers.invoicePostedSuccess', {}, 'Qaimə uğurla baş kitaba post edildi!')}`);
            await loadData();
        } catch (err: any) {
            showToast(extractErrorMessage(err, t('common.error', {}, 'Qaiməni təsdiqləmək mümkün olmadı.')), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Open Pay Modal
    const openPayModal = (inv: CustomerInvoiceDto) => {
        setPayingInvoice(inv);
        const rem = inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.outstandingAmount || inv.totalAmount || 0);
        setPayAmount(rem > 0 ? rem : (inv.totalAmount || inv.grandTotal || 0));
        setPayDate(new Date().toISOString().split('T')[0]);
        setPayMethod('BankTransfer');
        setPayBankAccountId(bankAccounts[0]?.id || '');
        setPayReference(`PAY-${inv.invoiceNumber}`);
        setPayError('');
        setShowPayModal(true);
    };

    // Submit Payment
    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payingInvoice) return;
        if (!payBankAccountId) {
            setPayError(t('validation.accountRequired', {}, 'Zəhmət olmasa kassa və ya bank hesabı seçin.'));
            return;
        }

        setPayLoading(true);
        setPayError('');
        try {
            await customersService.payInvoice(payingInvoice.id, {
                amount: parseFloat(String(payAmount)) || 0,
                paymentDate: payDate,
                paymentMethod: payMethod,
                bankAccountId: payBankAccountId,
                reference: payReference,
                customerId: payingInvoice.customerId,
            });
            setShowPayModal(false);
            showToast(t('customers.invoicePaySuccess', {}, 'Ödəniş uğurla qəbul edildi!'));
            loadData();
        } catch (err: any) {
            setPayError(err.response?.data?.detail || err.response?.data?.message || err.message || t('common.error', {}, 'Ödəniş qeyd olunarkən xəta baş verdi.'));
        } finally {
            setPayLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedInvoices.map((i) => i.id));
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

    const formatCurrency = (val: number, curr = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getStatusBadge = (status: string) => {
        const s = String(status || '').toLowerCase();
        const localizedLabel = t(`statuses.${status.toUpperCase()}`, {}, status);
        if (s === 'paid') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    {localizedLabel}
                </span>
            );
        }
        if (s === 'partiallypaid') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#142638] text-[#38BDF8] border border-[#0284C7]/30">
                    {localizedLabel}
                </span>
            );
        }
        if (s === 'posted' || s === 'approved' || s === 'unpaid') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                    {localizedLabel}
                </span>
            );
        }
        if (s === 'overdue' || s === 'cancelled') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    {localizedLabel}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46]">
                {localizedLabel}
            </span>
        );
    };

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & + Yarat button) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('nav.customerInvoices', {}, 'Satış Qaimələri')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('accounting.listView', {}, 'Siyahı')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            setCreateCustomerId(customers[0]?.id || '');
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
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-2xl animate-in fade-in duration-150 ${
                    toastType === 'error'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}>
                    {toastType === 'error' ? (
                        <XMarkIcon className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                        <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Qaimə № Input */}
                    <input
                        type="text"
                        placeholder={t('customers.invoiceNumber', {}, 'Qaimə №')}
                        value={filterNumber}
                        onChange={(e) => setFilterNumber(e.target.value)}
                        className="w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Müştəri Input */}
                    <input
                        type="text"
                        placeholder={t('customers.customer', {}, 'Müştəri adı')}
                        value={filterCustomer}
                        onChange={(e) => setFilterCustomer(e.target.value)}
                        className="w-44 sm:w-56 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedStatus === 'ALL'
                                    ? t('common.status', {}, 'Status')
                                    : t(`statuses.${selectedStatus.toUpperCase()}`, {}, selectedStatus)}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Bütün Statuslar') },
                                    { key: 'Draft', label: t('statuses.DRAFT', {}, 'Draft') },
                                    { key: 'Posted', label: t('statuses.POSTED', {}, 'Posted') },
                                    { key: 'Paid', label: t('statuses.PAID', {}, 'Paid') },
                                    { key: 'PartiallyPaid', label: t('statuses.PARTIALLYPAID', {}, 'Partially Paid') },
                                    { key: 'Unpaid', label: t('statuses.UNPAID', {}, 'Unpaid') },
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
                            <div className="absolute top-9 left-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <span className="font-bold text-white">{t('common.allFilters', {}, 'Qaimə Filtrləri')}</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterNumber('');
                                                setFilterCustomer('');
                                                setSelectedStatus('ALL');
                                                setFromDate('');
                                                setToDate('');
                                                setMinAmount('');
                                                setMaxAmount('');
                                            }}
                                            className="text-[11px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                        >
                                            {t('common.reset', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <div>
                                        <label className="text-[11px] text-[#A1A1AA] font-semibold block mb-1">{t('common.customRange', {}, 'Tarix Aralığı')}</label>
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
                                        <label className="text-[11px] text-[#A1A1AA] font-semibold block mb-1">{t('common.amount', {}, 'Məbləğ Aralığı')} (AZN)</label>
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
                            title={t('common.columns', {}, 'Sütunlar')}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <div className="font-bold text-white px-1.5 pb-1 border-b border-[#2C2C2E]">{t('common.columns', {}, 'Sütunlar')}</div>
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
                                        <span>{t(col.i18nKey || col.key, {}, col.label)}</span>
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
                                <button
                                    onClick={() => { setSortField('date'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('common.date', {}, 'Tarix')} ({sortDirection === 'asc' ? '↑' : '↓'})
                                </button>
                                <button
                                    onClick={() => { setSortField('number'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('customers.invoiceNumber', {}, 'Qaimə №')}
                                </button>
                                <button
                                    onClick={() => { setSortField('customer'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('customers.customer', {}, 'Müştəri')}
                                </button>
                                <button
                                    onClick={() => { setSortField('amount'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('common.amount', {}, 'Məbləğ')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Invoices Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedInvoices.length > 0 && selectedRows.length === paginatedInvoices.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'number')?.visible && <th className="py-3 px-3">{t('customers.invoiceNumber', {}, 'Qaimə №')}</th>}
                                {columns.find((c) => c.key === 'customer')?.visible && <th className="py-3 px-3">{t('customers.customer', {}, 'Müştəri')}</th>}
                                {columns.find((c) => c.key === 'date')?.visible && <th className="py-3 px-3">{t('common.date', {}, 'Tarix')}</th>}
                                {columns.find((c) => c.key === 'dueDate')?.visible && <th className="py-3 px-3">{t('customers.dueDate', {}, 'Son Ödəniş Tarixi')}</th>}
                                {columns.find((c) => c.key === 'amount')?.visible && <th className="py-3 px-3 text-right">{t('common.grandTotal', {}, 'Cəmi Məbləğ')}</th>}
                                {columns.find((c) => c.key === 'paid')?.visible && <th className="py-3 px-3 text-right">{t('common.paidAmount', {}, 'Ödənilən')}</th>}
                                {columns.find((c) => c.key === 'remaining')?.visible && <th className="py-3 px-3 text-right">{t('common.remainingAmount', {}, 'Qalıq Borc')}</th>}
                                {columns.find((c) => c.key === 'status')?.visible && <th className="py-3 px-3 text-center">{t('common.status', {}, 'Status')}</th>}
                                <th className="py-3 px-3 text-right">{t('common.actions', {}, 'Əməliyyatlar')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                            <span>{t('common.loading', {}, 'Satış qaimələri yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{t('common.noData', {}, 'Heç bir satış qaiməsi tapılmadı')}</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">{t('customers.invoicesSubtitle', {}, 'Müştəriyə satış və xidmət üzrə faktura tərtib edin')}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowCreateModal(true);
                                                    setCreateCustomerId(customers[0]?.id || '');
                                                }}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>{t('customers.newInvoice', {}, 'İlk Qaiməni Yarat')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedInvoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => navigate(`/customer-invoices/${inv.id}`)}
                                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(inv.id)}
                                                onChange={() => handleSelectRow(inv.id)}
                                                className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {columns.find((c) => c.key === 'number')?.visible && (
                                            <td className="py-3 px-3 font-mono font-bold text-white">
                                                {inv.invoiceNumber}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'customer')?.visible && (
                                            <td className="py-3 px-3 font-semibold text-white">
                                                {inv.customerName || t('customers.customer', {}, 'Müştəri')}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'date')?.visible && (
                                            <td className="py-3 px-3 text-[#A1A1AA]">
                                                {formatDate(inv.issueDate || inv.invoiceDate)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'dueDate')?.visible && (
                                            <td className="py-3 px-3 text-[#A1A1AA]">
                                                {formatDate(inv.dueDate)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'amount')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                                {formatCurrency(inv.totalAmount || inv.grandTotal || 0, inv.currency)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'paid')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono text-emerald-400">
                                                {formatCurrency(inv.paidAmount || 0, inv.currency)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'remaining')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold">
                                                <span className={(inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.outstandingAmount || 0)) > 0 ? 'text-amber-400' : 'text-white'}>
                                                    {formatCurrency(inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.outstandingAmount || 0), inv.currency)}
                                                </span>
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'status')?.visible && (
                                            <td className="py-3 px-3 text-center">
                                                {getStatusBadge(inv.status)}
                                            </td>
                                        )}

                                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/customer-invoices/${inv.id}`)}
                                                    className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                    title={t('common.details', {}, 'Ətraflı Bax')}
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                </button>

                                                {inv.status === 'Draft' && (
                                                    <button
                                                        onClick={() => handleApprove(inv)}
                                                        disabled={actionLoadingId === inv.id}
                                                        className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                                                        title={t('customers.postInvoice', {}, 'Sənədi İcra Et (Post)')}
                                                    >
                                                        {actionLoadingId === inv.id ? (
                                                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            t('common.processing', {}, 'İcra Et')
                                                        )}
                                                    </button>
                                                )}

                                                {(inv.status === 'Posted' || inv.status === 'Unpaid' || inv.status === 'PartiallyPaid' || inv.status === 'Approved') && (
                                                    <button
                                                        onClick={() => openPayModal(inv)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-white hover:text-black text-white text-[11px] font-semibold border border-white/20 transition-colors cursor-pointer"
                                                        title={t('customers.payInvoice', {}, 'Ödəniş Qəbul Et')}
                                                    >
                                                        {t('customers.payInvoice', {}, 'Ödə')}
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
                        {filteredInvoices.length === 0
                            ? '0 / 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredInvoices.length
                              )} / ${filteredInvoices.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE INVOICE MODAL ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-4xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('customers.newInvoice', {}, 'Yeni Satış Qaiməsi')}</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">{t('customers.invoicesSubtitle', {}, 'Müştəriyə satış fakturasının tərtibi')}</p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.customer', {}, 'Müştəri')} *</label>
                                    <select
                                        required
                                        value={createCustomerId}
                                        onChange={(e) => setCreateCustomerId(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    >
                                        <option value="">{t('common.select', {}, 'Müştəri seçin...')}</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name} {c.taxNumber ? `(VÖEN: ${c.taxNumber})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.invoiceDate', {}, 'Qaimə Tarixi')} *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createIssueDate}
                                        onChange={(e) => setCreateIssueDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.dueDate', {}, 'Son Ödəniş Tarixi')} *</label>
                                    <input
                                        type="date"
                                        required
                                        value={createDueDate}
                                        onChange={(e) => setCreateDueDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">{t('customers.itemsTable', {}, 'Qaimə Sətirləri')}</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-white hover:text-black text-xs font-semibold text-white transition-colors cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>{t('accounting.addLine', {}, 'Sətir Əlavə Et')}</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                                    {createLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex flex-col sm:flex-row gap-2.5 items-center"
                                        >
                                            {/* Item Select */}
                                            {items.length > 0 && (
                                                <div className="w-full sm:w-1/4">
                                                    <select
                                                        value={line.itemId}
                                                        onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                                                        className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                                    >
                                                        <option value="">{t('common.select', {}, 'Məhsul seçin...')}</option>
                                                        {items.map((it) => (
                                                            <option key={it.id} value={it.id}>
                                                                {it.name} ({formatCurrency(it.standardSellingPrice !== undefined ? it.standardSellingPrice : (it.unitPrice || 0))})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="w-full sm:flex-1">
                                                <input
                                                    type="text"
                                                    required
                                                    value={line.description}
                                                    onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                                    placeholder={t('common.description', {}, 'Təsvir...')}
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-[#52525B] focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div className="w-full sm:w-20">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="1"
                                                    required
                                                    value={line.quantity}
                                                    onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                                                    placeholder={t('common.quantity', {}, 'Say')}
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white text-right font-mono focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Unit Price */}
                                            <div className="w-full sm:w-28">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    value={line.unitPrice}
                                                    onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                                                    placeholder={t('common.unitPrice', {}, 'Qiymət (AZN)')}
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white text-right font-mono focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Discount % */}
                                            <div className="w-full sm:w-20">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="100"
                                                    value={line.discountPercent}
                                                    onChange={(e) => handleLineChange(idx, 'discountPercent', e.target.value)}
                                                    placeholder={t('customers.discount', {}, 'Endirim %')}
                                                    className="w-full px-2.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white text-right font-mono focus:border-white focus:outline-none"
                                                />
                                            </div>

                                            {/* Line Total display */}
                                            <div className="w-full sm:w-24 text-right font-mono font-bold text-white text-xs">
                                                {formatCurrency(
                                                    ((parseFloat(String(line.quantity)) || 0) * (parseFloat(String(line.unitPrice)) || 0)) *
                                                        (1 - ((parseFloat(String(line.discountPercent)) || 0) / 100))
                                                )}
                                            </div>

                                            {/* Delete Line */}
                                            <button
                                                type="button"
                                                disabled={createLines.length <= 1}
                                                onClick={() => handleRemoveLine(idx)}
                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={t('common.delete', {}, 'Sətri Sil')}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary & Notes Box */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.notes', {}, 'Qeydlər / Şərtlər')}</label>
                                    <textarea
                                        rows={3}
                                        value={createNotes}
                                        onChange={(e) => setCreateNotes(e.target.value)}
                                        placeholder={t('common.notes', {}, 'Faktura üzrə xüsusi şərtlər...')}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white placeholder:text-[#52525B] focus:border-white focus:outline-none resize-none"
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-2 text-xs">
                                    <div className="flex justify-between text-[#A1A1AA]">
                                        <span>{t('common.subTotal', {}, 'Ara Cəm (Subtotal)')}:</span>
                                        <span className="font-mono text-white font-bold">{formatCurrency(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#A1A1AA]">
                                        <span>{t('common.taxTotal', {}, 'ƏDV (18% VAT)')}:</span>
                                        <span className="font-mono text-white font-bold">{formatCurrency(taxTotal)}</span>
                                    </div>
                                    <div className="h-px bg-[#27272A] my-1" />
                                    <div className="flex justify-between text-white font-bold text-sm">
                                        <span>{t('common.grandTotal', {}, 'Yekun Məbləğ')}:</span>
                                        <span className="font-mono text-emerald-400">{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading || !createCustomerId || grandTotal <= 0}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-bold text-white border border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? t('common.saving', {}, 'Saxlanılır...') : t('common.save', {}, 'Qaralama Kimi Saxla')}
                                </button>
                                <button
                                    type="button"
                                    disabled={createLoading || !createCustomerId || grandTotal <= 0}
                                    onClick={(e) => handleCreateSubmit(e, true)}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-black shadow-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? t('common.saving', {}, 'Saxlanılır...') : t('customers.postInvoice', {}, 'Saxla və Təsdiqlə (Post)')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── PAYMENT ACCEPTANCE MODAL ─── */}
            {showPayModal && payingInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-sm font-bold text-white">{t('customers.payInvoice', {}, 'Ödəniş Qəbul Et')}</h3>
                                <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">{payingInvoice.invoiceNumber} - {payingInvoice.customerName}</p>
                            </div>
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {payError && (
                            <div className="p-3 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs">
                                {payError}
                            </div>
                        )}

                        <form onSubmit={handlePaySubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.paidAmount', {}, 'Ödənilən Məbləğ')} (AZN) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white font-mono focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.paymentDate', {}, 'Ödəniş Tarixi')} *</label>
                                <input
                                    type="date"
                                    required
                                    value={payDate}
                                    onChange={(e) => setPayDate(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.bankOrCashAccount', {}, 'Ödəniş Hesabı (Bank / Kassa)')} *</label>
                                <select
                                    required
                                    value={payBankAccountId}
                                    onChange={(e) => setPayBankAccountId(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                >
                                    <option value="">{t('common.select', {}, 'Hesab seçin...')}</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.accountName} ({b.accountNumber || b.currency || 'AZN'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.reference', {}, 'İstinad № / Qəbz')}</label>
                                <input
                                    type="text"
                                    value={payReference}
                                    onChange={(e) => setPayReference(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={payLoading}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-black transition-colors cursor-pointer"
                                >
                                    {payLoading ? t('common.saving', {}, 'Qeyd edilir...') : t('common.confirm', {}, 'Ödənişi Təsdiqlə')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInvoicesPage;

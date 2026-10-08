import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { procurementService } from '../../api';
import type { SupplierDto, CreateSupplierRequest } from '../../dto';
import CustomSelect from '../../components/CustomSelect';
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
    Bars3Icon,
    TruckIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    CreditCardIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export const SuppliersPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Data states
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Selection & Pagination
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'WITH_DEBT' | 'NO_DEBT'>('ALL');
    const [filterMinDebt, setFilterMinDebt] = useState('');
    const [filterMaxDebt, setFilterMaxDebt] = useState('');
    const [filterTerms, setFilterTerms] = useState<string>('ALL');

    // Popover toggles
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'code' | 'name' | 'debt' | 'terms'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'code', label: t('common.code', {}, 'Kod'), visible: true },
        { key: 'name', label: t('procurement.supplierName', {}, 'Təchizatçı Adı'), visible: true },
        { key: 'taxNumber', label: t('common.taxNumber', {}, 'VÖEN'), visible: true },
        { key: 'contact', label: t('customers.contactPerson', {}, 'Əlaqə'), visible: true },
        { key: 'address', label: t('customers.address', {}, 'Ünvan'), visible: true },
        { key: 'debt', label: t('procurement.supplierBalanceDue', {}, 'Kreditor Borc'), visible: true },
        { key: 'terms', label: t('customers.paymentTerms', {}, 'Ödəniş Müddəti'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createCode, setCreateCode] = useState('');
    const [createName, setCreateName] = useState('');
    const [createCompanyName, setCreateCompanyName] = useState('');
    const [createTaxNumber, setCreateTaxNumber] = useState('');
    const [createPhone, setCreatePhone] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createAddress, setCreateAddress] = useState('');
    const [createBankAccount, setCreateBankAccount] = useState('');
    const [createPaymentTermsDays, setCreatePaymentTermsDays] = useState('30');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Fetch suppliers
    const loadSuppliers = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await procurementService.getSuppliers();
            setSuppliers(data);
        } catch (err: any) {
            console.error('[SuppliersPage] Error loading suppliers:', err);
            showToast('Təchizatçıları yükləyərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    // Outside click handlers
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setIsColumnsOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const formatCurrency = (val?: number, curr = 'AZN') => {
        const num = typeof val === 'number' && !isNaN(val) ? val : 0;
        return (
            new Intl.NumberFormat('az-AZ', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(num) + ` ${curr}`
        );
    };

    // Filter & Sort Pipeline
    const filteredSuppliers = useMemo(() => {
        return suppliers
            .filter((s) => {
                // Search term
                if (searchTerm.trim()) {
                    const q = searchTerm.toLowerCase();
                    const matchCode = s.code?.toLowerCase().includes(q);
                    const matchName = s.name?.toLowerCase().includes(q);
                    const matchCompany = s.companyName?.toLowerCase().includes(q);
                    const matchTax = s.taxNumber?.toLowerCase().includes(q);
                    const matchPhone = s.phone?.toLowerCase().includes(q);
                    const matchEmail = s.email?.toLowerCase().includes(q);
                    if (!matchCode && !matchName && !matchCompany && !matchTax && !matchPhone && !matchEmail) return false;
                }

                // Status debt filter
                const payable = Number(s.outstandingPayable ?? s.balance ?? 0);
                if (statusFilter === 'WITH_DEBT' && payable <= 0) return false;
                if (statusFilter === 'NO_DEBT' && payable > 0) return false;

                // Min Debt
                if (filterMinDebt !== '') {
                    const min = parseFloat(filterMinDebt);
                    if (!isNaN(min) && payable < min) return false;
                }

                // Max Debt
                if (filterMaxDebt !== '') {
                    const max = parseFloat(filterMaxDebt);
                    if (!isNaN(max) && payable > max) return false;
                }

                // Payment terms filter
                if (filterTerms !== 'ALL') {
                    const termsDays = s.paymentTermsDays ?? 30;
                    if (String(termsDays) !== filterTerms) return false;
                }

                return true;
            })
            .sort((a, b) => {
                let comp = 0;
                if (sortField === 'code') {
                    comp = (a.code || '').localeCompare(b.code || '');
                } else if (sortField === 'name') {
                    comp = (a.name || '').localeCompare(b.name || '');
                } else if (sortField === 'debt') {
                    const debtA = Number(a.outstandingPayable ?? a.balance ?? 0);
                    const debtB = Number(b.outstandingPayable ?? b.balance ?? 0);
                    comp = debtA - debtB;
                } else if (sortField === 'terms') {
                    comp = (a.paymentTermsDays || 0) - (b.paymentTermsDays || 0);
                }
                return sortDirection === 'asc' ? comp : -comp;
            });
    }, [suppliers, searchTerm, statusFilter, filterMinDebt, filterMaxDebt, filterTerms, sortField, sortDirection]);

    // Active filter counter
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (statusFilter !== 'ALL') count++;
        if (filterMinDebt !== '') count++;
        if (filterMaxDebt !== '') count++;
        if (filterTerms !== 'ALL') count++;
        return count;
    }, [statusFilter, filterMinDebt, filterMaxDebt, filterTerms]);

    const clearAllFilters = () => {
        setStatusFilter('ALL');
        setFilterMinDebt('');
        setFilterMaxDebt('');
        setFilterTerms('ALL');
        setSearchTerm('');
    };

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));
    const paginatedSuppliers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSuppliers.slice(start, start + pageSize);
    }, [filteredSuppliers, currentPage, pageSize]);

    // Selection handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedSuppliers.map((s) => s.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    };

    // Open Create Modal
    const openCreateModal = () => {
        setCreateCode(`SUP-${Math.floor(1000 + Math.random() * 9000)}`);
        setCreateName('');
        setCreateCompanyName('');
        setCreateTaxNumber('');
        setCreatePhone('');
        setCreateEmail('');
        setCreateAddress('');
        setCreateBankAccount('');
        setCreatePaymentTermsDays('30');
        setCreateError('');
        setShowCreateModal(true);
    };

    // Create Submit Handler
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!createName.trim()) {
            setCreateError('Təchizatçı adı mütləq daxil edilməlidir.');
            return;
        }

        setCreateLoading(true);
        try {
            const req: CreateSupplierRequest = {
                code: createCode.trim() || `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
                name: createName.trim(),
                companyName: createCompanyName.trim() || undefined,
                taxNumber: createTaxNumber.trim() || undefined,
                phone: createPhone.trim() || undefined,
                email: createEmail.trim() || undefined,
                address: createAddress.trim() || undefined,
                bankAccountDetails: createBankAccount.trim() || undefined,
                paymentTermsDays: parseInt(createPaymentTermsDays, 10) || 30,
                currency: 'AZN',
                isActive: true,
            };

            await procurementService.createSupplier(req);
            setShowCreateModal(false);
            showToast('Təchizatçı uğurla yaradıldı!', 'success');
            loadSuppliers(true);
        } catch (err: any) {
            console.error('[SuppliersPage] Create error:', err);
            const msg = err.response?.data?.message || err.response?.data?.title || err.message || 'Təchizatçı yaradılarkən xəta baş verdi.';
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="space-y-4 font-sans text-white">
            {/* ─── Breadcrumb & Main Header ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 text-xs">
                    <button
                        onClick={() => navigate('/suppliers')}
                        className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white hover:bg-white/10 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>{t('procurement.suppliersTitle', {}, 'Təchizatçılar')}</span>
                    </button>
                    <span className="text-[#52525B]">/</span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-[#27272A]">
                        <Bars3Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-medium text-white">{t('common.list', {}, 'Siyahı')}</span>
                    </div>
                </div>

                {/* Right Actions: Refresh & Create */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadSuppliers(true)}
                        disabled={loading || isRefreshing}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('common.create', {}, 'Yarat')}</span>
                    </button>
                </div>
            </div>

            {/* ─── Inline Toast Notification ─── */}
            {toastMessage && (
                <div
                    className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                        toastType === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                >
                    {toastType === 'success' ? <CheckIcon className="w-4 h-4 shrink-0" /> : <XMarkIcon className="w-4 h-4 shrink-0" />}
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative w-56 sm:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-[#71717A]" />
                        <input
                            type="text"
                            placeholder={t('common.search', {}, 'Axtarış...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    {/* Status / Debt Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-40 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {statusFilter === 'ALL' ? t('common.all', {}, 'Bütün Təchizatçılar') : statusFilter === 'WITH_DEBT' ? t('customers.withDebt', {}, 'Borclu') : t('customers.noDebt', {}, 'Borcsuz')}
                            </span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { id: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { id: 'WITH_DEBT', label: t('customers.withDebt', {}, 'Borclu') },
                                    { id: 'NO_DEBT', label: t('customers.noDebt', {}, 'Borcsuz') },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(tab.id as any);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            statusFilter === tab.id ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {tab.label}
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                activeFilterCount > 0
                                    ? 'bg-[#27272A] border-[#3F3F46] text-white'
                                    : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold ml-0.5">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 left-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-4 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <span className="font-bold text-white text-xs">{t('common.filter', {}, 'Filtrlər')}</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                            {t('common.clearFilters', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                {/* Payment Terms Filter */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">{t('customers.paymentTerms', {}, 'Ödəniş Müddəti')}</label>
                                    <CustomSelect
                                        value={filterTerms}
                                        onChange={(val) => setFilterTerms(String(val))}
                                        options={[
                                            { value: 'ALL', label: t('common.all', {}, 'Bütün müddətlər') },
                                            { value: '15', label: `15 ${t('common.days', {}, 'Gün')}` },
                                            { value: '30', label: `30 ${t('common.days', {}, 'Gün')}` },
                                            { value: '45', label: `45 ${t('common.days', {}, 'Gün')}` },
                                            { value: '60', label: `60 ${t('common.days', {}, 'Gün')}` },
                                            { value: '90', label: `90 ${t('common.days', {}, 'Gün')}` },
                                        ]}
                                    />
                                </div>

                                {/* Debt Range */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">{t('procurement.supplierBalanceDue', {}, 'Kreditor Borc Aralığı')} (AZN)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinDebt}
                                            onChange={(e) => setFilterMinDebt(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                        <input
                                            type="number"
                                            placeholder={t('common.max', {}, 'Maks')}
                                            value={filterMaxDebt}
                                            onChange={(e) => setFilterMaxDebt(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 cursor-pointer"
                                    >
                                        {t('common.apply', {}, 'Tətbiq et')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right utility buttons: Columns & Sorting */}
                <div className="flex items-center gap-2">
                    {/* Columns Selector */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            type="button"
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.columns', {}, 'Sütunlar')}
                        >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <span className="font-bold text-white px-2 py-1 block text-[11px]">{t('common.columns', {}, 'Görünən Sütunlar')}</span>
                                {columns.map((col) => (
                                    <label
                                        key={col.key}
                                        className="flex items-center gap-2 px-2 py-1 hover:bg-[#2C2C2E]/50 rounded-lg cursor-pointer select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={col.visible}
                                            onChange={() =>
                                                setColumns(
                                                    columns.map((c) =>
                                                        c.key === col.key ? { ...c, visible: !c.visible } : c
                                                    )
                                                )
                                            }
                                            className="rounded bg-[#121214] border-[#3F3F46] text-white focus:ring-0"
                                        />
                                        <span>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sorting Dropdown */}
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
                                    onClick={() => { setSortField('code'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('common.code', {}, 'Kod')} ({sortDirection === 'asc' ? 'Artan' : 'Azalan'})
                                </button>
                                <button
                                    onClick={() => { setSortField('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('procurement.supplierName', {}, 'Ad üzrə')}
                                </button>
                                <button
                                    onClick={() => { setSortField('debt'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('procurement.supplierBalanceDue', {}, 'Borc üzrə')}
                                </button>
                                <button
                                    onClick={() => { setSortField('terms'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('customers.paymentTerms', {}, 'Ödəniş Müddəti üzrə')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Suppliers Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedSuppliers.length > 0 && selectedRows.length === paginatedSuppliers.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'code')?.visible && <th className="py-3 px-3">{t('common.code', {}, 'Kod')}</th>}
                                {columns.find((c) => c.key === 'name')?.visible && <th className="py-3 px-3">{t('procurement.supplierName', {}, 'Təchizatçı / Şirkət Adı')}</th>}
                                {columns.find((c) => c.key === 'taxNumber')?.visible && <th className="py-3 px-3">{t('common.taxNumber', {}, 'VÖEN')}</th>}
                                {columns.find((c) => c.key === 'contact')?.visible && <th className="py-3 px-3">{t('customers.contactPerson', {}, 'Əlaqə')}</th>}
                                {columns.find((c) => c.key === 'address')?.visible && <th className="py-3 px-3">{t('customers.address', {}, 'Ünvan')}</th>}
                                {columns.find((c) => c.key === 'debt')?.visible && <th className="py-3 px-3 text-right">{t('procurement.supplierBalanceDue', {}, 'Kreditor Borc')}</th>}
                                {columns.find((c) => c.key === 'terms')?.visible && <th className="py-3 px-3 text-center">{t('customers.paymentTerms', {}, 'Ödəniş Müddəti')}</th>}
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
                                            <span>{t('common.loading', {}, 'Təchizatçılar yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <TruckIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{t('common.noData', {}, 'Heç bir təchizatçı tapılmadı')}</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">{t('procurement.suppliersSubtitle', {}, 'Satınalma və kreditor əməliyyatları üçün yeni təchizatçı əlavə edin')}</p>
                                            </div>
                                            <button
                                                onClick={openCreateModal}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>{t('procurement.newSupplier', {}, 'İlk Təchizatçını Yarat')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedSuppliers.map((s) => {
                                    const payable = Number(s.outstandingPayable ?? s.balance ?? 0);
                                    return (
                                        <tr
                                            key={s.id}
                                            onClick={() => navigate(`/suppliers/${s.id}`)}
                                            className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                        >
                                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(s.id)}
                                                    onChange={() => handleSelectRow(s.id)}
                                                    className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                                />
                                            </td>

                                            {columns.find((c) => c.key === 'code')?.visible && (
                                                <td className="py-3 px-3 font-mono font-bold text-white">
                                                    {s.code || '—'}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'name')?.visible && (
                                                <td className="py-3 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white group-hover:text-zinc-200 transition-colors">
                                                            {s.name}
                                                        </span>
                                                        {s.companyName && (
                                                            <span className="text-[11px] text-[#71717A]">
                                                                {s.companyName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'taxNumber')?.visible && (
                                                <td className="py-3 px-3 font-mono text-[#A1A1AA]">
                                                    {s.taxNumber || '—'}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'contact')?.visible && (
                                                <td className="py-3 px-3">
                                                    <div className="flex flex-col text-[11px] text-[#A1A1AA] gap-0.5">
                                                        {s.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <PhoneIcon className="w-3 h-3 text-[#71717A]" />
                                                                {s.phone}
                                                            </span>
                                                        )}
                                                        {s.email && (
                                                            <span className="flex items-center gap-1 text-[#71717A]">
                                                                <EnvelopeIcon className="w-3 h-3 text-[#71717A]" />
                                                                {s.email}
                                                            </span>
                                                        )}
                                                        {!s.phone && !s.email && <span className="text-[#52525B]">—</span>}
                                                    </div>
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'address')?.visible && (
                                                <td className="py-3 px-3 text-[#A1A1AA] max-w-xs truncate">
                                                    {s.address || '—'}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'debt')?.visible && (
                                                <td className="py-3 px-3 text-right font-mono font-bold">
                                                    <span className={payable > 0 ? 'text-amber-400' : 'text-white'}>
                                                        {formatCurrency(payable, s.currency)}
                                                    </span>
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'terms')?.visible && (
                                                <td className="py-3 px-3 text-center text-zinc-300 font-medium">
                                                    {s.paymentTermsDays ? `${s.paymentTermsDays} ${t('common.days', {}, 'Gün')}` : `30 ${t('common.days', {}, 'Gün')}`}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'status')?.visible && (
                                                <td className="py-3 px-3 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                        {t('statuses.ACTIVE', {}, 'Aktiv')}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        to={`/suppliers/${s.id}`}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                                                        title={t('common.viewDetails', {}, 'Detallara Bax')}
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
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
                        {filteredSuppliers.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredSuppliers.length
                              )} of ${filteredSuppliers.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE SUPPLIER MODAL (Soft CRM Design) ─── */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCreateModal(false);
                    }}
                >
                    <div
                        className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('procurement.newSupplier', {}, 'Yeni Təchizatçı Yarat')}</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">{t('procurement.suppliersSubtitle', {}, 'Satınalma və kreditor əlaqələri üçün yeni təchizatçı kartı')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label={t('common.close', {}, 'Bağla')}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{createError}</span>
                            </div>
                        )}

                        {/* Modal Form Body */}
                        <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
                                {/* Row 1: Code & Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">
                                            {t('common.code', {}, 'Təchizatçı Kodu')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createCode}
                                            onChange={(e) => setCreateCode(e.target.value)}
                                            placeholder="məs. SUP-1001"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">
                                            {t('procurement.supplierName', {}, 'Təchizatçı / Şirkət Adı')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createName}
                                            onChange={(e) => setCreateName(e.target.value)}
                                            placeholder="məs. AzərTexnika Təchizat MMC"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Tax Number & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('common.taxNumber', {}, 'VÖEN (Vergi Nömrəsi)')}</label>
                                        <input
                                            type="text"
                                            value={createTaxNumber}
                                            onChange={(e) => setCreateTaxNumber(e.target.value)}
                                            placeholder="məs. 1234567891"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('customers.phone', {}, 'Əlaqə Telefonu')}</label>
                                        <input
                                            type="text"
                                            value={createPhone}
                                            onChange={(e) => setCreatePhone(e.target.value)}
                                            placeholder="+994 12 400 00 00"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Email & Address */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('customers.email', {}, 'Email Ünvanı')}</label>
                                        <input
                                            type="email"
                                            value={createEmail}
                                            onChange={(e) => setCreateEmail(e.target.value)}
                                            placeholder="supply@azertechnica.az"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('customers.address', {}, 'Faktiki Ünvan')}</label>
                                        <input
                                            type="text"
                                            value={createAddress}
                                            onChange={(e) => setCreateAddress(e.target.value)}
                                            placeholder="Bakı ş., Nərimanov r-nu, Əhməd Rəcəbli 15"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Payment Terms & Bank Account */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('customers.paymentTerms', {}, 'Ödəniş Müddəti')}</label>
                                        <CustomSelect
                                            value={createPaymentTermsDays}
                                            onChange={(val) => setCreatePaymentTermsDays(String(val))}
                                            options={[
                                                { value: '15', label: `15 ${t('common.days', {}, 'Gün')}` },
                                                { value: '30', label: `30 ${t('common.days', {}, 'Gün')}` },
                                                { value: '45', label: `45 ${t('common.days', {}, 'Gün')}` },
                                                { value: '60', label: `60 ${t('common.days', {}, 'Gün')}` },
                                                { value: '90', label: `90 ${t('common.days', {}, 'Gün')}` },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">{t('procurement.supplierName', {}, 'Hüquqi Şirkət Adı')} (Optional)</label>
                                        <input
                                            type="text"
                                            value={createCompanyName}
                                            onChange={(e) => setCreateCompanyName(e.target.value)}
                                            placeholder="məs. AzərTexnika Group QSC"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Bank Account Details */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA] block">{t('treasury.bankAccount', {}, 'Bank Hesab Məlumatları (IBAN / Bank)')}</label>
                                    <input
                                        type="text"
                                        value={createBankAccount}
                                        onChange={(e) => setCreateBankAccount(e.target.value)}
                                        placeholder="AZ00AAAA00000000000000000000 - Kapital Bank"
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#27272A] bg-[#18181B] shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {createLoading ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                            <span>{t('common.loading', {}, 'Yaradılır...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>{t('procurement.newSupplier', {}, 'Təchizatçını Yarat')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;

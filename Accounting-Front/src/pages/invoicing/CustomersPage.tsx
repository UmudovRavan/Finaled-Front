import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersService } from '../../api';
import type { CustomerDto, CreateCustomerRequest } from '../../dto';
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
    UserGroupIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BanknotesIcon,
    CreditCardIcon,
    DocumentPlusIcon,
} from '@heroicons/react/24/outline';

export const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [filterCode, setFilterCode] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterTax, setFilterTax] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [minCreditLimit, setMinCreditLimit] = useState('');
    const [maxCreditLimit, setMaxCreditLimit] = useState('');

    // Dropdowns
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Pagination
    const [sortField, setSortField] = useState<'code' | 'name' | 'balance' | 'creditLimit'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility
    const [columns, setColumns] = useState([
        { key: 'code', label: 'Kod', i18nKey: 'common.code', visible: true },
        { key: 'name', label: 'Müştəri Adı', i18nKey: 'customers.customerName', visible: true },
        { key: 'taxNumber', label: 'VÖEN', i18nKey: 'common.taxNumber', visible: true },
        { key: 'contact', label: 'Əlaqə', i18nKey: 'common.phone', visible: true },
        { key: 'balance', label: 'Borc / Qalıq', i18nKey: 'customers.balanceDue', visible: true },
        { key: 'creditLimit', label: 'Kredit Limiti', i18nKey: 'customers.creditLimit', visible: true },
        { key: 'terms', label: 'Ödəniş Müddəti', i18nKey: 'customers.paymentTermsDays', visible: true },
        { key: 'status', label: 'Status', i18nKey: 'common.status', visible: true },
    ]);

    // Toast
    const [toastMessage, setToastMessage] = useState('');

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateCustomerRequest>({
        code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        taxNumber: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 0,
        paymentTermsDays: 30,
        currency: 'AZN',
        isActive: true,
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Quick Detail Modal State
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    const loadCustomers = async () => {
        setIsRefreshing(true);
        try {
            const data = await customersService.getCustomers();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadCustomers();
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

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCode.trim()) count++;
        if (filterName.trim()) count++;
        if (filterTax.trim()) count++;
        if (selectedStatus !== 'ALL') count++;
        if (minCreditLimit) count++;
        if (maxCreditLimit) count++;
        return count;
    }, [filterCode, filterName, filterTax, selectedStatus, minCreditLimit, maxCreditLimit]);

    // Filter & Sort
    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            if (filterCode.trim()) {
                const code = String(c.code || '').toLowerCase();
                if (!code.includes(filterCode.trim().toLowerCase())) return false;
            }
            if (filterName.trim()) {
                const name = String(c.name || '').toLowerCase();
                const company = String(c.companyName || '').toLowerCase();
                if (!name.includes(filterName.trim().toLowerCase()) && !company.includes(filterName.trim().toLowerCase())) return false;
            }
            if (filterTax.trim()) {
                const tax = String(c.taxNumber || '').toLowerCase();
                if (!tax.includes(filterTax.trim().toLowerCase())) return false;
            }
            if (selectedStatus !== 'ALL') {
                const isActive = selectedStatus === 'ACTIVE';
                if (c.isActive !== isActive) return false;
            }
            if (minCreditLimit) {
                const min = parseFloat(minCreditLimit);
                if (!isNaN(min) && (c.creditLimit || 0) < min) return false;
            }
            if (maxCreditLimit) {
                const max = parseFloat(maxCreditLimit);
                if (!isNaN(max) && (c.creditLimit || 0) > max) return false;
            }
            return true;
        }).sort((a, b) => {
            if (sortField === 'code') {
                const diff = String(a.code || '').localeCompare(String(b.code || ''));
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'name') {
                const diff = String(a.name || '').localeCompare(String(b.name || ''));
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'balance') {
                const diff = (a.outstandingBalance || a.balance || 0) - (b.outstandingBalance || b.balance || 0);
                return sortDirection === 'asc' ? diff : -diff;
            }
            if (sortField === 'creditLimit') {
                const diff = (a.creditLimit || 0) - (b.creditLimit || 0);
                return sortDirection === 'asc' ? diff : -diff;
            }
            return 0;
        });
    }, [customers, filterCode, filterName, filterTax, selectedStatus, minCreditLimit, maxCreditLimit, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCustomers.slice(start, start + pageSize);
    }, [filteredCustomers, currentPage, pageSize]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.name.trim()) {
            setCreateError(t('validation.customerNameRequired', {}, 'Zəhmət olmasa müştəri adını daxil edin.'));
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            await customersService.createCustomer(createForm);
            setShowCreateModal(false);
            showToast(t('customers.customerCreatedSuccess', {}, 'Müştəri uğurla əlavə edildi!'));
            setCreateForm({
                code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '',
                taxNumber: '',
                email: '',
                phone: '',
                address: '',
                creditLimit: 0,
                paymentTermsDays: 30,
                currency: 'AZN',
                isActive: true,
            });
            loadCustomers();
        } catch (err: any) {
            setCreateError(err.response?.data?.detail || err.response?.data?.message || err.message || t('common.error', {}, 'Xəta baş verdi.'));
        } finally {
            setCreateLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedCustomers.map((c) => c.id));
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

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & + Yarat button) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('nav.customers', {}, 'Müştərilər')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('accounting.listView', {}, 'Siyahı')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadCustomers}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            setCreateForm({
                                code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                                name: '',
                                taxNumber: '',
                                email: '',
                                phone: '',
                                address: '',
                                creditLimit: 0,
                                paymentTermsDays: 30,
                                currency: 'AZN',
                                isActive: true,
                            });
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

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Kod Input */}
                    <input
                        type="text"
                        placeholder={t('common.code', {}, 'Kod')}
                        value={filterCode}
                        onChange={(e) => setFilterCode(e.target.value)}
                        className="w-28 sm:w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Ad Input */}
                    <input
                        type="text"
                        placeholder={t('customers.customerName', {}, 'Müştəri və ya Şirkət adı')}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-40 sm:w-52 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* VÖEN Input */}
                    <input
                        type="text"
                        placeholder={t('common.taxNumber', {}, 'VÖEN')}
                        value={filterTax}
                        onChange={(e) => setFilterTax(e.target.value)}
                        className="w-28 sm:w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
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
                                    : selectedStatus === 'ACTIVE'
                                    ? t('common.active', {}, 'Aktiv')
                                    : t('common.inactive', {}, 'Deaktiv')}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { key: 'ACTIVE', label: t('common.active', {}, 'Aktiv') },
                                    { key: 'INACTIVE', label: t('common.inactive', {}, 'Deaktiv') },
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
                                    <span className="font-bold text-white">{t('common.allFilters', {}, 'Müştəri Filtrləri')}</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterCode('');
                                                setFilterName('');
                                                setFilterTax('');
                                                setSelectedStatus('ALL');
                                                setMinCreditLimit('');
                                                setMaxCreditLimit('');
                                            }}
                                            className="text-[11px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                        >
                                            {t('common.reset', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <div>
                                        <label className="text-[11px] text-[#A1A1AA] font-semibold block mb-1">
                                            {t('customers.creditLimit', {}, 'Kredit Limiti')} (AZN)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minCreditLimit}
                                                onChange={(e) => setMinCreditLimit(e.target.value)}
                                                className="bg-[#121214] border border-[#2C2C2E] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxCreditLimit}
                                                onChange={(e) => setMaxCreditLimit(e.target.value)}
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
                                    onClick={() => { setSortField('code'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('common.code', {}, 'Kod')} ({sortDirection === 'asc' ? '↑' : '↓'})
                                </button>
                                <button
                                    onClick={() => { setSortField('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('common.name', {}, 'Ad')}
                                </button>
                                <button
                                    onClick={() => { setSortField('balance'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('customers.balanceDue', {}, 'Borc / Qalıq')}
                                </button>
                                <button
                                    onClick={() => { setSortField('creditLimit'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    {t('customers.creditLimit', {}, 'Kredit Limiti')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Customers Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedCustomers.length > 0 && selectedRows.length === paginatedCustomers.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'code')?.visible && <th className="py-3 px-3">{t('common.code', {}, 'Kod')}</th>}
                                {columns.find((c) => c.key === 'name')?.visible && <th className="py-3 px-3">{t('customers.customerName', {}, 'Müştəri Adı')}</th>}
                                {columns.find((c) => c.key === 'taxNumber')?.visible && <th className="py-3 px-3">{t('common.taxNumber', {}, 'VÖEN')}</th>}
                                {columns.find((c) => c.key === 'contact')?.visible && <th className="py-3 px-3">{t('common.phone', {}, 'Əlaqə')}</th>}
                                {columns.find((c) => c.key === 'balance')?.visible && <th className="py-3 px-3 text-right">{t('customers.balanceDue', {}, 'Borc / Qalıq')}</th>}
                                {columns.find((c) => c.key === 'creditLimit')?.visible && <th className="py-3 px-3 text-right">{t('customers.creditLimit', {}, 'Kredit Limiti')}</th>}
                                {columns.find((c) => c.key === 'terms')?.visible && <th className="py-3 px-3 text-center">{t('customers.paymentTermsDays', {}, 'Ödəniş Müddəti')}</th>}
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
                                            <span>{t('common.loading', {}, 'Müştərilər yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <UserGroupIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{t('common.noData', {}, 'Heç bir müştəri tapılmadı')}</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">{t('customers.subtitle', {}, 'Satış və debitor qeydiyyatı üçün müştəri əlavə edin')}</p>
                                            </div>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>{t('customers.newCustomer', {}, 'İlk Müştərini Yarat')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map((cust) => (
                                    <tr
                                        key={cust.id}
                                        onClick={() => navigate(`/customers/${cust.id}`)}
                                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(cust.id)}
                                                onChange={() => handleSelectRow(cust.id)}
                                                className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {columns.find((c) => c.key === 'code')?.visible && (
                                            <td className="py-3 px-3 font-mono font-bold text-white">
                                                {cust.code || '—'}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'name')?.visible && (
                                            <td className="py-3 px-3">
                                                <div className="font-semibold text-white group-hover:text-zinc-200">
                                                    {cust.name}
                                                </div>
                                                {cust.companyName && cust.companyName !== cust.name && (
                                                    <div className="text-[11px] text-[#A1A1AA]">{cust.companyName}</div>
                                                )}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'taxNumber')?.visible && (
                                            <td className="py-3 px-3 text-[#A1A1AA] font-mono">
                                                {cust.taxNumber || '—'}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'contact')?.visible && (
                                            <td className="py-3 px-3 text-[#A1A1AA]">
                                                {cust.phone && <div className="text-xs text-white">{cust.phone}</div>}
                                                {cust.email && <div className="text-[11px] text-[#71717A]">{cust.email}</div>}
                                                {!cust.phone && !cust.email && <span>—</span>}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'balance')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold">
                                                <span className={(cust.outstandingBalance || cust.balance || 0) > 0 ? 'text-amber-400' : 'text-white'}>
                                                    {formatCurrency(cust.outstandingBalance || cust.balance || 0, cust.currency)}
                                                </span>
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'creditLimit')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono text-white font-medium">
                                                {formatCurrency(cust.creditLimit || 0, cust.currency)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'terms')?.visible && (
                                            <td className="py-3 px-3 text-center text-[#A1A1AA]">
                                                {cust.paymentTermsDays ? `${cust.paymentTermsDays} ${t('common.days', {}, 'gün')}` : `30 ${t('common.days', {}, 'gün')}`}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'status')?.visible && (
                                            <td className="py-3 px-3 text-center">
                                                {cust.isActive !== false ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                                                        {t('common.active', {}, 'Aktiv')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                                                        {t('common.inactive', {}, 'Deaktiv')}
                                                    </span>
                                                )}
                                            </td>
                                        )}

                                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/customers/${cust.id}`)}
                                                    className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                    title={t('common.details', {}, 'Ətraflı Bax')}
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                </button>
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
                        {filteredCustomers.length === 0
                            ? '0 / 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredCustomers.length
                              )} / ${filteredCustomers.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE CUSTOMER MODAL ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('customers.newCustomer', {}, 'Yeni Müştəri Əlavə Et')}</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">{t('customers.subtitle', {}, 'Satış və hesablaşmalar üçün yeni müştəri kartı')}</p>
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

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Kod */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.code', {}, 'Müştəri Kodu')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.code}
                                        onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                                        placeholder="CUST-1001"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Ad */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.customerName', {}, 'Müştəri / Şirkət Adı')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        placeholder={t('customers.customerName', {}, 'Müştəri Adı')}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* VÖEN */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.taxNumber', {}, 'VÖEN')}</label>
                                    <input
                                        type="text"
                                        value={createForm.taxNumber || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, taxNumber: e.target.value })}
                                        placeholder="1234567891"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Telefon */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.phone', {}, 'Əlaqə Telefonu')}</label>
                                    <input
                                        type="text"
                                        value={createForm.phone || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        placeholder="+994 50 123 45 67"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.email', {}, 'Email Ünvanı')}</label>
                                    <input
                                        type="email"
                                        value={createForm.email || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder="info@company.com"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Ünvan */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.address', {}, 'Faktiki Ünvan')}</label>
                                    <input
                                        type="text"
                                        value={createForm.address || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                        placeholder="Baku, Azerbaijan"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Kredit Limiti */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.creditLimit', {}, 'Kredit Limiti')} (AZN)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.creditLimit || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, creditLimit: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Ödəniş Müddəti */}
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('customers.paymentTermsDays', {}, 'Ödəniş Müddəti (Gün)')}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={createForm.paymentTermsDays || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, paymentTermsDays: parseInt(e.target.value, 10) || 30 })}
                                        placeholder="30"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>
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
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-black shadow-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {createLoading ? t('common.saving', {}, 'Saxlanılır...') : t('common.save', {}, 'Yadda Saxla')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;

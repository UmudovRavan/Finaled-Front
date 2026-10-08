import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { inventoryService, accountsService } from '../../api';
import type { WarehouseDto, CreateWarehouseRequest, AccountDto } from '../../dto';
import CustomSelect from '../../components/CustomSelect';
import { useLanguage } from '../../i18n';
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
    TrashIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CircleStackIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export const WarehousesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Data states
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
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
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [filterLocation, setFilterLocation] = useState('ALL');

    // Popover toggles
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'code' | 'name' | 'location' | 'stockCount' | 'stockValue'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'code', label: t('inventory.warehouseCode', {}, 'Anbar Kodu'), visible: true },
        { key: 'name', label: t('inventory.warehouseName', {}, 'Anbar Adı'), visible: true },
        { key: 'location', label: t('inventory.location', {}, 'Yerləşmə (Ünvan)'), visible: true },
        { key: 'manager', label: t('inventory.manager', {}, 'Məsul Şəxs'), visible: true },
        { key: 'stockItemsCount', label: t('common.itemsCount', {}, 'Çeşid Sayı'), visible: true },
        { key: 'totalStockOnHand', label: t('common.totalQuantity', {}, 'Ümumi Qalıq'), visible: true },
        { key: 'totalStockValue', label: t('inventory.stockValue', {}, 'Stok Dəyəri'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState<CreateWarehouseRequest>({
        code: '',
        name: '',
        location: '',
        managerName: '',
        phone: '',
        notes: '',
        defaultInventoryAccountId: '',
        isActive: true,
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const extractErrorMessage = (err: any): string => {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
        if (data?.error) return data.error;
        return err.message || 'Xəta baş verdi';
    };

    // Load Data
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [warehousesData, accountsData] = await Promise.allSettled([
                inventoryService.getWarehouses(),
                accountsService.getAccounts(),
            ]);

            if (warehousesData.status === 'fulfilled' && Array.isArray(warehousesData.value)) {
                setWarehouses(warehousesData.value);
            }
            if (accountsData.status === 'fulfilled' && Array.isArray(accountsData.value)) {
                // Filter asset/inventory accounts
                setAccounts(accountsData.value);
            }
        } catch (err) {
            console.error('Failed to load warehouses data:', err);
            showToast('Məlumatlar yüklənərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Outside click handlers for popovers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
                setIsStatusDropdownOpen(false);
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

    const openCreateModal = () => {
        const nextCode = `WH-${String(warehouses.length + 1).padStart(2, '0')}`;
        setForm({
            code: nextCode,
            name: '',
            location: '',
            managerName: '',
            phone: '',
            notes: '',
            defaultInventoryAccountId: '',
            isActive: true,
        });
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setCreateError('Anbar adı mütləq daxil edilməlidir');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            await inventoryService.createWarehouse({
                code: form.code.trim() || `WH-${Date.now().toString().slice(-4)}`,
                name: form.name.trim(),
                location: form.location?.trim() || '',
                managerName: form.managerName?.trim() || '',
                phone: form.phone?.trim() || '',
                notes: form.notes?.trim() || '',
                defaultInventoryAccountId: form.defaultInventoryAccountId || undefined,
                isActive: form.isActive !== undefined ? form.isActive : true,
            });

            setShowCreateModal(false);
            showToast('Yeni anbar uğurla yaradıldı!');
            loadData(true);
        } catch (err: any) {
            setCreateError(extractErrorMessage(err));
        } finally {
            setCreateLoading(false);
        }
    };

    // Inventory accounts for CustomSelect
    const inventoryAccountOptions = useMemo(() => {
        return accounts
            .filter((a) => a.type === 'Asset' || a.category === 'Asset' || a.code?.startsWith('2'))
            .map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name}`,
            }));
    }, [accounts]);

    // Unique Locations for filter
    const uniqueLocations = useMemo(() => {
        const locs = new Set<string>();
        warehouses.forEach((w) => {
            if (w.location?.trim()) locs.add(w.location.trim());
        });
        return Array.from(locs);
    }, [warehouses]);

    // KPI Aggregations
    const stats = useMemo(() => {
        const total = warehouses.length;
        const active = warehouses.filter((w) => w.isActive).length;
        const totalVal = warehouses.reduce((acc, w) => acc + (w.totalStockValue || 0), 0);
        const totalItemsCount = warehouses.reduce((acc, w) => acc + (w.stockItemsCount || 0), 0);
        return { total, active, totalVal, totalItemsCount };
    }, [warehouses]);

    // Filter & Sort
    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w) => {
            // Search
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchCode = w.code?.toLowerCase().includes(term);
                const matchName = w.name?.toLowerCase().includes(term);
                const matchLoc = w.location?.toLowerCase().includes(term);
                const matchMgr = w.managerName?.toLowerCase().includes(term);
                if (!matchCode && !matchName && !matchLoc && !matchMgr) return false;
            }

            // Status filter
            if (statusFilter === 'ACTIVE' && !w.isActive) return false;
            if (statusFilter === 'INACTIVE' && w.isActive) return false;

            // Location filter
            if (filterLocation !== 'ALL' && w.location !== filterLocation) return false;

            return true;
        });
    }, [warehouses, searchTerm, statusFilter, filterLocation]);

    const sortedWarehouses = useMemo(() => {
        return [...filteredWarehouses].sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortField) {
                case 'code':
                    valA = a.code || '';
                    valB = b.code || '';
                    break;
                case 'name':
                    valA = a.name || '';
                    valB = b.name || '';
                    break;
                case 'location':
                    valA = a.location || '';
                    valB = b.location || '';
                    break;
                case 'stockCount':
                    valA = a.stockItemsCount || 0;
                    valB = b.stockItemsCount || 0;
                    break;
                case 'stockValue':
                    valA = a.totalStockValue || 0;
                    valB = b.totalStockValue || 0;
                    break;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredWarehouses, sortField, sortDirection]);

    // Paginated
    const totalPages = Math.ceil(sortedWarehouses.length / pageSize) || 1;
    const paginatedWarehouses = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedWarehouses.slice(start, start + pageSize);
    }, [sortedWarehouses, currentPage, pageSize]);

    // Selection
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedWarehouses.map((w) => w.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const formatCurrency = (val?: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const isColVisible = (key: string) => {
        return columns.find((c) => c.key === key)?.visible ?? true;
    };

    const toggleColumn = (key: string) => {
        setColumns((prev) =>
            prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setFilterLocation('ALL');
        setIsFilterPopoverOpen(false);
    };

    const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (filterLocation !== 'ALL' ? 1 : 0);

    return (
        <div className="space-y-6 font-sans text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('nav.inventory', {}, 'İnventar')}</span>
                        <span className="text-xs text-zinc-600">/</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{t('inventory.warehousesTitle', {}, 'Anbarlar')}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#18181B] text-zinc-400 border border-[#27272A]">
                            {warehouses.length} {t('nav.warehouses', {}, 'anbar')}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        {t('inventory.warehousesSubtitle', {}, 'Məhsul ehtiyatlarının saxlanıldığı bütün anbar, bölmə və filialların vahid idarəetmə mərkəzi')}
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
                        <span>{t('inventory.newWarehouse', {}, 'Yeni Anbar')}</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('common.total', {}, 'Ümumi')} {t('nav.warehouses', {}, 'Anbarlar')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">{stats.total}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{stats.active} {t('statuses.active', {}, 'Aktiv')} / {stats.total - stats.active} {t('statuses.inactive', {}, 'Qeyri-aktiv')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BuildingStorefrontIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('statuses.active', {}, 'Aktiv')} {t('inventory.location', {}, 'Məkanlar')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">{uniqueLocations.length}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.location', {}, 'Fərqli fiziki ünvan')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('common.itemsCount', {}, 'Məhsul Çeşidi')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">{stats.totalItemsCount}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockItemsList', {}, 'Anbarlarda qeydiyyatda')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CircleStackIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('inventory.stockValue', {}, 'Toplam Stok Dəyəri')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">{formatCurrency(stats.totalVal)}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockValue', {}, 'Maya dəyəri ilə balans')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Toast */}
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
                {/* Left side: Search & Status Quick Filter */}
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
                            placeholder={t('common.searchPlaceholder', {}, 'Kod, ad, məkan, məsul şəxs axtar...')}
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

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            <span>
                                {t('common.status', {}, 'Status')}:{' '}
                                <strong className="text-white font-medium">
                                    {statusFilter === 'ALL'
                                        ? t('common.all', {}, 'Hamısı')
                                        : statusFilter === 'ACTIVE'
                                        ? t('statuses.active', {}, 'Aktiv')
                                        : t('statuses.inactive', {}, 'Qeyri-aktiv')}
                                </strong>
                            </span>
                            <ArrowsUpDownIcon className="w-3 h-3 text-zinc-500" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-40 rounded-xl bg-[#18181B] border border-[#27272A] py-1 shadow-xl z-30">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { key: 'ACTIVE', label: t('statuses.active', {}, 'Aktiv') },
                                    { key: 'INACTIVE', label: t('statuses.inactive', {}, 'Qeyri-aktiv') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setStatusFilter(item.key as any);
                                            setIsStatusDropdownOpen(false);
                                            setCurrentPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/5 ${
                                            statusFilter === item.key ? 'text-white font-semibold' : 'text-zinc-400'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {statusFilter === item.key && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Filter popover, Columns, Sorting */}
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
                            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#18181B] border border-[#27272A] p-4 shadow-2xl z-40 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                                    <span className="text-xs font-bold text-white">{t('common.filter', {}, 'Filter Parametrləri')}</span>
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
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('inventory.location', {}, 'Məkan / Ünvan')}</label>
                                    <select
                                        value={filterLocation}
                                        onChange={(e) => {
                                            setFilterLocation(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Bütün məkanlar')}</option>
                                        {uniqueLocations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#27272A]">
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

                    {/* Sorting */}
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
                                    { field: 'code', label: t('inventory.warehouseCode', {}, 'Koda görə') },
                                    { field: 'name', label: t('inventory.warehouseName', {}, 'Ada görə') },
                                    { field: 'location', label: t('inventory.location', {}, 'Məkana görə') },
                                    { field: 'stockCount', label: t('common.itemsCount', {}, 'Çeşid sayına görə') },
                                    { field: 'stockValue', label: t('inventory.stockValue', {}, 'Stok dəyərinə görə') },
                                ].map((item) => (
                                    <button
                                        key={item.field}
                                        onClick={() => {
                                            if (sortField === item.field) {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField(item.field as any);
                                                setSortDirection('asc');
                                            }
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-white/5 ${
                                            sortField === item.field ? 'text-white font-bold' : 'text-zinc-400'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {sortField === item.field && (
                                            <span className="text-[10px] text-zinc-400 uppercase">
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

            {/* Selected Bulk Actions Bar */}
            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#18181B] border border-zinc-700 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{selectedRows.length} {t('common.selected', {}, 'seçilib')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedRows([])}
                            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                        >
                            {t('common.cancel', {}, 'Seçimi ləğv et')}
                        </button>
                    </div>
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
                                            paginatedWarehouses.length > 0 &&
                                            paginatedWarehouses.every((w) => selectedRows.includes(w.id))
                                        }
                                        onChange={handleSelectAll}
                                        className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                    />
                                </th>
                                {isColVisible('code') && <th className="py-3.5 px-4">{t('inventory.warehouseCode', {}, 'Kod')}</th>}
                                {isColVisible('name') && <th className="py-3.5 px-4">{t('inventory.warehouseName', {}, 'Anbar Adı')}</th>}
                                {isColVisible('location') && <th className="py-3.5 px-4">{t('inventory.location', {}, 'Yerləşmə (Ünvan)')}</th>}
                                {isColVisible('manager') && <th className="py-3.5 px-4">{t('inventory.manager', {}, 'Məsul Şəxs')}</th>}
                                {isColVisible('stockItemsCount') && <th className="py-3.5 px-4 text-center">{t('common.itemsCount', {}, 'Çeşid Sayı')}</th>}
                                {isColVisible('totalStockOnHand') && <th className="py-3.5 px-4 text-right">{t('common.totalQuantity', {}, 'Ümumi Qalıq')}</th>}
                                {isColVisible('totalStockValue') && <th className="py-3.5 px-4 text-right">{t('inventory.stockValue', {}, 'Stok Dəyəri')}</th>}
                                {isColVisible('status') && <th className="py-3.5 px-4 text-center">{t('common.status', {}, 'Status')}</th>}
                                <th className="w-12 py-3.5 px-4 text-right"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-400" />
                                            <span>{t('common.loading', {}, 'Anbarlar yüklənir...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedWarehouses.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BuildingStorefrontIcon className="w-8 h-8 text-zinc-600" />
                                            <span className="font-semibold text-zinc-400">{t('common.noRecordsFound', {}, 'Heç bir anbar tapılmadı')}</span>
                                            <p className="text-[11px] text-zinc-500 max-w-sm">
                                                {t('common.tryAdjustingSearch', {}, 'Axtarış və ya filter parametrlərini dəyişərək yenidən yoxlayın və ya yeni anbar əlavə edin.')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedWarehouses.map((w) => {
                                    const isSelected = selectedRows.includes(w.id);

                                    return (
                                        <tr
                                            key={w.id}
                                            className={`hover:bg-white/[0.02] transition-colors group ${
                                                isSelected ? 'bg-white/[0.04]' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(w.id)}
                                                    className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                                />
                                            </td>

                                            {isColVisible('code') && (
                                                <td className="py-3 px-4 font-mono font-bold">
                                                    <Link
                                                        to={`/warehouses/${w.id}`}
                                                        className="text-white hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500" />
                                                        <span>{w.code}</span>
                                                    </Link>
                                                </td>
                                            )}

                                            {isColVisible('name') && (
                                                <td className="py-3 px-4">
                                                    <Link
                                                        to={`/warehouses/${w.id}`}
                                                        className="font-semibold text-white hover:underline block"
                                                    >
                                                        {w.name}
                                                    </Link>
                                                    {w.notes && (
                                                        <span className="text-[10px] text-zinc-500 line-clamp-1">
                                                            {w.notes}
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {isColVisible('location') && (
                                                <td className="py-3 px-4 text-zinc-300">
                                                    {w.location ? (
                                                        <div className="flex items-center gap-1 text-zinc-300">
                                                            <MapPinIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                            <span>{w.location}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-600">—</span>
                                                    )}
                                                </td>
                                            )}

                                            {isColVisible('manager') && (
                                                <td className="py-3 px-4 text-zinc-400">
                                                    {w.managerName ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1 text-zinc-200">
                                                                <UserIcon className="w-3 h-3 text-zinc-500" />
                                                                <span>{w.managerName}</span>
                                                            </div>
                                                            {w.phone && (
                                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                                    <PhoneIcon className="w-2.5 h-2.5 text-zinc-600" />
                                                                    <span>{w.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-600">—</span>
                                                    )}
                                                </td>
                                            )}

                                            {isColVisible('stockItemsCount') && (
                                                <td className="py-3 px-4 text-center font-mono text-zinc-300">
                                                    <span className="px-2 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-zinc-300 text-[11px]">
                                                        {w.stockItemsCount || 0}
                                                    </span>
                                                </td>
                                            )}

                                            {isColVisible('totalStockOnHand') && (
                                                <td className="py-3 px-4 text-right font-mono text-zinc-300 font-medium">
                                                    {(w.totalStockOnHand || 0).toLocaleString()}
                                                </td>
                                            )}

                                            {isColVisible('totalStockValue') && (
                                                <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                                                    {formatCurrency(w.totalStockValue)}
                                                </td>
                                            )}

                                            {isColVisible('status') && (
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            w.isActive
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}
                                                    >
                                                        {w.isActive ? t('statuses.active', {}, 'Aktiv') : t('statuses.inactive', {}, 'Qeyri-aktiv')}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    to={`/warehouses/${w.id}`}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors inline-block"
                                                    title={t('common.view', {}, 'Ətraflı Bax')}
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
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
                        {sortedWarehouses.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  sortedWarehouses.length
                              )} of ${sortedWarehouses.length}`}
                    </span>
                </div>
            </div>

            {/* Create Warehouse Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="bg-[#121214] border border-[#27272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                                    <BuildingStorefrontIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{t('inventory.newWarehouse', {}, 'Yeni Anbar Əlavə Et')}</h3>
                                    <p className="text-[11px] text-zinc-400">
                                        {t('inventory.warehousesSubtitle', {}, 'Məhsul ehtiyatlarının saxlanılması üçün yeni anbar və ya filial qeydiyyatı')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{createError}</span>
                            </div>
                        )}

                        {/* Modal Form */}
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.warehouseCode', {}, 'Anbar Kodu')} <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        placeholder="WH-01"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.warehouseName', {}, 'Anbar Adı')} <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Mərkəzi Anbar"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.location', {}, 'Yerləşmə / Ünvan')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location || ''}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        placeholder="Bakı şəh."
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.manager', {}, 'Məsul Şəxs (Menecer)')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.managerName || ''}
                                        onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                                        placeholder="Rəşad Məmmədov"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('customers.phone', {}, 'Əlaqə Nömrəsi')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone || ''}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+994 50 123 45 67"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('customers.inventoryAccount', {}, 'Mühasibatlıq Stok Hesabı (GL)')}
                                    </label>
                                    <CustomSelect
                                        value={form.defaultInventoryAccountId || ''}
                                        onChange={(val) => setForm({ ...form, defaultInventoryAccountId: val })}
                                        options={[
                                            { value: '', label: t('common.none', {}, 'Seçilməyib (Standart Şirkət Hesabı)') },
                                            ...inventoryAccountOptions,
                                        ]}
                                        placeholder={t('common.select', {}, 'Stok hesabını seçin')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-zinc-300 block mb-1">
                                    {t('common.notes', {}, 'Əlavə Qeydlər')}
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.notes || ''}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder={t('common.notes', {}, 'Anbar haqqında əlavə təsvir və ya qeydlər...')}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive !== false}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="rounded bg-[#18181B] border-zinc-700 text-white focus:ring-0"
                                />
                                <label htmlFor="isActive" className="text-xs text-zinc-300 select-none cursor-pointer">
                                    {t('statuses.active', {}, 'Anbar aktivdir')}
                                </label>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white hover:bg-[#27272A] text-xs font-semibold transition-colors"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {createLoading ? (
                                        <>
                                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                            <span>{t('common.saving', {}, 'Yaradılır...')}</span>
                                        </>
                                    ) : (
                                        <span>{t('common.create', {}, 'Əlavə Et')}</span>
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

export default WarehousesPage;

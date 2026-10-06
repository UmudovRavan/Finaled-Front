import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customersService, accountsService } from '../../api';
import type { ItemDto, AccountDto } from '../../dto';
import CustomSelect from '../../components/CustomSelect';
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
    ArchiveBoxIcon,
    CubeIcon,
    SparklesIcon,
    CircleStackIcon,
    TagIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

export const ItemsPage: React.FC = () => {
    const navigate = useNavigate();

    // Data states
    const [items, setItems] = useState<ItemDto[]>([]);
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
    const [filterType, setFilterType] = useState('ALL');
    const [filterUom, setFilterUom] = useState('ALL');
    const [filterMinPrice, setFilterMinPrice] = useState('');
    const [filterMaxPrice, setFilterMaxPrice] = useState('');
    const [filterMinStock, setFilterMinStock] = useState('');
    const [filterMaxStock, setFilterMaxStock] = useState('');

    // Popover toggles
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'code' | 'name' | 'price' | 'stock' | 'created'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'code', label: 'SKU / Kod', visible: true },
        { key: 'name', label: 'Məhsul / Xidmət', visible: true },
        { key: 'type', label: 'Növ', visible: true },
        { key: 'uom', label: 'Ölçü Vahidi', visible: true },
        { key: 'costPrice', label: 'Alış / Maya Qiyməti', visible: true },
        { key: 'unitPrice', label: 'Satış Qiyməti', visible: true },
        { key: 'stock', label: 'Mövcud Stok', visible: true },
        { key: 'stockValue', label: 'Stok Dəyəri', visible: true },
        { key: 'status', label: 'Status', visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createCode, setCreateCode] = useState('');
    const [createName, setCreateName] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [createType, setCreateType] = useState<'StockItem' | 'NonStockItem' | 'Service'>('StockItem');
    const [createValuation, setCreateValuation] = useState<'MovingAverage' | 'FIFO'>('MovingAverage');
    const [createUOM, setCreateUOM] = useState('PCS');
    const [createBuyingPrice, setCreateBuyingPrice] = useState<number | string>('');
    const [createSellingPrice, setCreateSellingPrice] = useState<number | string>('');
    const [createInventoryAccountId, setCreateInventoryAccountId] = useState('');
    const [createCogsAccountId, setCreateCogsAccountId] = useState('');
    const [createRevenueAccountId, setCreateRevenueAccountId] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemsData, accountsData] = await Promise.allSettled([
                customersService.getItems(),
                accountsService.getAccounts(),
            ]);

            if (itemsData.status === 'fulfilled') {
                setItems(itemsData.value);
            }
            if (accountsData.status === 'fulfilled' && Array.isArray(accountsData.value)) {
                setAccounts(accountsData.value);
            }
        } catch (err) {
            console.error('Failed to load items data:', err);
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
            if (typeRef.current && !typeRef.current.contains(e.target as Node)) setIsTypeDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setIsColumnsOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Account lookups
    const stockAccounts = useMemo(() => accounts.filter((a) => a.type === 'Stock' || a.type === 5 || (typeof a.code === 'string' && a.code.startsWith('11'))), [accounts]);
    const cogsAccounts = useMemo(() => accounts.filter((a) => a.type === 'COGS' || a.type === 7 || (typeof a.code === 'string' && a.code.startsWith('70'))), [accounts]);
    const revenueAccounts = useMemo(() => accounts.filter((a) => Number(a.category) === 4 || a.type === 'Revenue' || a.type === 10 || (typeof a.code === 'string' && a.code.startsWith('6'))), [accounts]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterUom !== 'ALL') count++;
        if (filterMinPrice) count++;
        if (filterMaxPrice) count++;
        if (filterMinStock) count++;
        if (filterMaxStock) count++;
        return count;
    }, [filterUom, filterMinPrice, filterMaxPrice, filterMinStock, filterMaxStock]);

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterType('ALL');
        setFilterUom('ALL');
        setFilterMinPrice('');
        setFilterMaxPrice('');
        setFilterMinStock('');
        setFilterMaxStock('');
        setIsFilterPopoverOpen(false);
    };

    // Filter & Sort Items
    const filteredItems = useMemo(() => {
        return items.filter((it) => {
            // Search term
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase().trim();
                const matchCode = (it.code || '').toLowerCase().includes(q);
                const matchName = (it.name || '').toLowerCase().includes(q);
                const matchDesc = (it.description || '').toLowerCase().includes(q);
                if (!matchCode && !matchName && !matchDesc) return false;
            }

            // Type filter
            if (filterType !== 'ALL') {
                if (String(it.type).toLowerCase() !== filterType.toLowerCase()) return false;
            }

            // UOM filter
            if (filterUom !== 'ALL') {
                const uom = (it.baseUOM || it.unitOfMeasure || '').toUpperCase();
                if (uom !== filterUom.toUpperCase()) return false;
            }

            // Price range
            const price = Number(it.standardSellingPrice !== undefined ? it.standardSellingPrice : it.unitPrice) || 0;
            if (filterMinPrice && price < parseFloat(filterMinPrice)) return false;
            if (filterMaxPrice && price > parseFloat(filterMaxPrice)) return false;

            // Stock range
            const stock = Number(it.totalStockOnHand) || 0;
            if (filterMinStock && stock < parseFloat(filterMinStock)) return false;
            if (filterMaxStock && stock > parseFloat(filterMaxStock)) return false;

            return true;
        }).sort((a, b) => {
            let comp = 0;
            if (sortField === 'code') {
                comp = (a.code || '').localeCompare(b.code || '');
            } else if (sortField === 'name') {
                comp = (a.name || '').localeCompare(b.name || '');
            } else if (sortField === 'price') {
                const pA = Number(a.standardSellingPrice !== undefined ? a.standardSellingPrice : a.unitPrice) || 0;
                const pB = Number(b.standardSellingPrice !== undefined ? b.standardSellingPrice : b.unitPrice) || 0;
                comp = pA - pB;
            } else if (sortField === 'stock') {
                const sA = Number(a.totalStockOnHand) || 0;
                const sB = Number(b.totalStockOnHand) || 0;
                comp = sA - sB;
            }
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [items, searchTerm, filterType, filterUom, filterMinPrice, filterMaxPrice, filterMinStock, filterMaxStock, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedItems.map((i) => i.id));
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

    const getItemTypeBadge = (type: string | number) => {
        const tStr = String(type);
        if (tStr === 'StockItem' || tStr === '1') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <CubeIcon className="w-3 h-3" />
                    <span>Stok Məhsulu</span>
                </span>
            );
        }
        if (tStr === 'Service' || tStr === '3') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Xidmət</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TagIcon className="w-3 h-3" />
                <span>Qeyri-stok</span>
            </span>
        );
    };

    const openCreateModal = () => {
        const randSku = `SKU-${Date.now().toString().slice(-5)}`;
        setCreateCode(randSku);
        setCreateName('');
        setCreateDescription('');
        setCreateType('StockItem');
        setCreateValuation('MovingAverage');
        setCreateUOM('PCS');
        setCreateBuyingPrice('');
        setCreateSellingPrice('');
        setCreateInventoryAccountId(stockAccounts[0]?.id || '');
        setCreateCogsAccountId(cogsAccounts[0]?.id || '');
        setCreateRevenueAccountId(revenueAccounts[0]?.id || '');
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createName.trim()) {
            setCreateError('Zəhmət olmasa məhsul və ya xidmətin adını qeyd edin.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            await customersService.createItem({
                code: createCode.trim() || `SKU-${Date.now().toString().slice(-5)}`,
                name: createName.trim(),
                description: createDescription.trim(),
                baseUOM: createUOM,
                type: createType,
                valuationMethod: createValuation,
                standardBuyingPrice: parseFloat(String(createBuyingPrice)) || 0,
                standardSellingPrice: parseFloat(String(createSellingPrice)) || 0,
                inventoryAccountId: createInventoryAccountId || undefined,
                cogsAccountId: createCogsAccountId || undefined,
                revenueAccountId: createRevenueAccountId || undefined,
            });

            showToast('Yeni məhsul/xidmət uğurla yaradıldı!');
            setShowCreateModal(false);
            loadData();
        } catch (err: any) {
            setCreateError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Məhsul yaradılarkən xəta baş verdi.');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
            {/* ─── Top Breadcrumb Bar ─── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Məhsul və Xidmətlər</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-semibold text-[#E4E4E7]">
                            <Bars3Icon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                            <span>Siyahı</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            loadData();
                        }}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yarat</span>
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
                    {/* Search Input */}
                    <div className="relative w-56 sm:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-[#71717A]" />
                        <input
                            type="text"
                            placeholder="Məhsul adı və ya SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    {/* Type Dropdown */}
                    <div className="relative" ref={typeRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center justify-between w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {filterType === 'ALL' ? 'Bütün Növlər' : filterType === 'StockItem' ? 'Stok Məhsulu' : filterType === 'Service' ? 'Xidmət' : 'Qeyri-stok'}
                            </span>
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute top-9 left-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { id: 'ALL', label: 'Bütün Növlər' },
                                    { id: 'StockItem', label: 'Stok Məhsulu' },
                                    { id: 'NonStockItem', label: 'Qeyri-stok Məhsulu' },
                                    { id: 'Service', label: 'Xidmət' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setFilterType(t.id);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            filterType === t.id ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {t.label}
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
                            <span>Filtr</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold ml-0.5">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 left-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-4 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <span className="font-bold text-white text-xs">Məhsul Filtrləri</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                            Sıfırla
                                        </button>
                                    )}
                                </div>

                                {/* UOM Filter */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Ölçü Vahidi (UOM)</label>
                                    <CustomSelect
                                        value={filterUom}
                                        onChange={(val) => setFilterUom(String(val))}
                                        options={[
                                            { value: 'ALL', label: 'Bütün ölçü vahidləri' },
                                            { value: 'PCS', label: 'Ədəd (PCS)' },
                                            { value: 'KG', label: 'Kiloqram (KG)' },
                                            { value: 'L', label: 'Litr (L)' },
                                            { value: 'M', label: 'Metr (M)' },
                                            { value: 'BOX', label: 'Qutu (BOX)' },
                                            { value: 'SET', label: 'Dəst (SET)' },
                                        ]}
                                    />
                                </div>

                                {/* Price Range */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Satış Qiyməti (AZN)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinPrice}
                                            onChange={(e) => setFilterMinPrice(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={filterMaxPrice}
                                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                    </div>
                                </div>

                                {/* Stock Range */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Mövcud Stok Sayı</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinStock}
                                            onChange={(e) => setFilterMinStock(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={filterMaxStock}
                                            onChange={(e) => setFilterMaxStock(e.target.value)}
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
                                        Tətbiq et
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
                            title="Sütunlar"
                        >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <span className="font-bold text-white px-2 py-1 block text-[11px]">Görünən Sütunlar</span>
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
                            title="Sıralama"
                        >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                        </button>
                        {isSortOpen && (
                            <div className="absolute top-9 right-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] flex flex-col animate-in fade-in duration-150">
                                <button
                                    onClick={() => { setSortField('code'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    SKU üzrə ({sortDirection === 'asc' ? 'Artan' : 'Azalan'})
                                </button>
                                <button
                                    onClick={() => { setSortField('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Ad üzrə
                                </button>
                                <button
                                    onClick={() => { setSortField('price'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Qiymət üzrə
                                </button>
                                <button
                                    onClick={() => { setSortField('stock'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Stok üzrə
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Items Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedItems.length > 0 && selectedRows.length === paginatedItems.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'code')?.visible && <th className="py-3 px-3">SKU / Kod</th>}
                                {columns.find((c) => c.key === 'name')?.visible && <th className="py-3 px-3">Məhsul / Xidmət Adı</th>}
                                {columns.find((c) => c.key === 'type')?.visible && <th className="py-3 px-3">Növ</th>}
                                {columns.find((c) => c.key === 'uom')?.visible && <th className="py-3 px-3 text-center">Ölçü Vahidi</th>}
                                {columns.find((c) => c.key === 'costPrice')?.visible && <th className="py-3 px-3 text-right">Alış Qiyməti</th>}
                                {columns.find((c) => c.key === 'unitPrice')?.visible && <th className="py-3 px-3 text-right">Satış Qiyməti</th>}
                                {columns.find((c) => c.key === 'stock')?.visible && <th className="py-3 px-3 text-right">Mövcud Stok</th>}
                                {columns.find((c) => c.key === 'stockValue')?.visible && <th className="py-3 px-3 text-right">Stok Dəyəri</th>}
                                {columns.find((c) => c.key === 'status')?.visible && <th className="py-3 px-3 text-center">Status</th>}
                                <th className="py-3 px-3 text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                            <span>Məhsullar və xidmətlər yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <CubeIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Heç bir məhsul və ya xidmət tapılmadı</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">Müəssisəniz üçün yeni məhsul, xammal və ya xidmət əlavə edin</p>
                                            </div>
                                            <button
                                                onClick={openCreateModal}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>İlk Məhsulu Yarat</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((it) => (
                                    <tr
                                        key={it.id}
                                        onClick={() => navigate(`/items/${it.id}`)}
                                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(it.id)}
                                                onChange={() => handleSelectRow(it.id)}
                                                className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {columns.find((c) => c.key === 'code')?.visible && (
                                            <td className="py-3 px-3 font-mono font-bold text-white">
                                                {it.code}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'name')?.visible && (
                                            <td className="py-3 px-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white group-hover:text-zinc-200 transition-colors">
                                                        {it.name}
                                                    </span>
                                                    {it.description && (
                                                        <span className="text-[11px] text-[#71717A] truncate max-w-xs">
                                                            {it.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'type')?.visible && (
                                            <td className="py-3 px-3">
                                                {getItemTypeBadge(it.type)}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'uom')?.visible && (
                                            <td className="py-3 px-3 text-center font-medium text-zinc-300">
                                                {it.baseUOM || it.unitOfMeasure || 'PCS'}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'costPrice')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-medium text-[#A1A1AA]">
                                                {formatCurrency(it.standardBuyingPrice !== undefined ? it.standardBuyingPrice : (it.costPrice || 0))}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'unitPrice')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                                {formatCurrency(it.standardSellingPrice !== undefined ? it.standardSellingPrice : (it.unitPrice || 0))}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'stock')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-medium text-white">
                                                {String(it.type) === 'Service' || String(it.type) === '3' ? (
                                                    <span className="text-[#52525B]">—</span>
                                                ) : (
                                                    <span>{Number(it.totalStockOnHand) || 0} {it.baseUOM || 'PCS'}</span>
                                                )}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'stockValue')?.visible && (
                                            <td className="py-3 px-3 text-right font-mono font-medium text-emerald-400">
                                                {String(it.type) === 'Service' || String(it.type) === '3' ? (
                                                    <span className="text-[#52525B]">—</span>
                                                ) : (
                                                    formatCurrency(it.totalStockValue || 0)
                                                )}
                                            </td>
                                        )}

                                        {columns.find((c) => c.key === 'status')?.visible && (
                                            <td className="py-3 px-3 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    Aktiv
                                                </span>
                                            </td>
                                        )}

                                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    to={`/items/${it.id}`}
                                                    className="p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                                                    title="Detallara Bax"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
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
                        {filteredItems.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredItems.length
                              )} of ${filteredItems.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE ITEM MODAL (Soft CRM Design) ─── */}
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
                                <h3 className="text-base font-bold text-white">Yeni Məhsul / Xidmət Yarat</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">Anbar və satış üçün yeni element qeydiyyatı</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label="Bağla"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs flex items-center gap-2">
                                <XMarkIcon className="w-4 h-4 text-rose-400 shrink-0" />
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
                                            SKU / Kod <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createCode}
                                            onChange={(e) => setCreateCode(e.target.value)}
                                            placeholder="məs. SKU-1001"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">
                                            Məhsul / Xidmət Adı <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createName}
                                            onChange={(e) => setCreateName(e.target.value)}
                                            placeholder="məs. MacBook Pro M3 və ya Logistika Xidməti"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Type, UOM, Valuation Method */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Element Növü</label>
                                        <CustomSelect
                                            value={createType}
                                            onChange={(val) => setCreateType(val as any)}
                                            options={[
                                                { value: 'StockItem', label: 'Stok Məhsulu (Stock)' },
                                                { value: 'NonStockItem', label: 'Qeyri-stok Məhsulu' },
                                                { value: 'Service', label: 'Xidmət (Service)' },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Ölçü Vahidi (UOM)</label>
                                        <CustomSelect
                                            value={createUOM}
                                            onChange={(val) => setCreateUOM(String(val))}
                                            options={[
                                                { value: 'PCS', label: 'Ədəd (PCS)' },
                                                { value: 'KG', label: 'Kiloqram (KG)' },
                                                { value: 'L', label: 'Litr (L)' },
                                                { value: 'M', label: 'Metr (M)' },
                                                { value: 'BOX', label: 'Qutu (BOX)' },
                                                { value: 'SET', label: 'Dəst (SET)' },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Qiymətləndirmə Metodu</label>
                                        <CustomSelect
                                            value={createValuation}
                                            onChange={(val) => setCreateValuation(val as any)}
                                            options={[
                                                { value: 'MovingAverage', label: 'Orta Qiymət (Moving Avg)' },
                                                { value: 'FIFO', label: 'FIFO (İlk Gələn İlk Çıxar)' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Buying & Selling Price */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Standart Alış / Maya Qiyməti (AZN)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={createBuyingPrice}
                                            onChange={(e) => setCreateBuyingPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Standart Satış Qiyməti (AZN)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={createSellingPrice}
                                            onChange={(e) => setCreateSellingPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: GL Accounts Mapping */}
                                <div className="p-4 rounded-2xl bg-[#121214]/60 border border-[#27272A] space-y-3">
                                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                                        Mühasibat Hesabları (GL Accounts)
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {createType === 'StockItem' && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] text-[#A1A1AA] font-semibold block">Stok Hesabı (Asset)</label>
                                                <CustomSelect
                                                    value={createInventoryAccountId}
                                                    onChange={(val) => setCreateInventoryAccountId(String(val))}
                                                    options={[
                                                        { value: '', label: 'Default (1100)' },
                                                        ...stockAccounts.map((a) => ({
                                                            value: a.id,
                                                            label: `${a.code} - ${a.name}`,
                                                        })),
                                                    ]}
                                                />
                                            </div>
                                        )}

                                        {createType === 'StockItem' && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] text-[#A1A1AA] font-semibold block">Maya Dəyəri (COGS)</label>
                                                <CustomSelect
                                                    value={createCogsAccountId}
                                                    onChange={(val) => setCreateCogsAccountId(String(val))}
                                                    options={[
                                                        { value: '', label: 'Default (7010)' },
                                                        ...cogsAccounts.map((a) => ({
                                                            value: a.id,
                                                            label: `${a.code} - ${a.name}`,
                                                        })),
                                                    ]}
                                                />
                                            </div>
                                        )}

                                        <div className={`space-y-1.5 ${createType !== 'StockItem' ? 'sm:col-span-3' : ''}`}>
                                            <label className="text-[11px] text-[#A1A1AA] font-semibold block">Gəlir Hesabı (Revenue)</label>
                                            <CustomSelect
                                                value={createRevenueAccountId}
                                                onChange={(val) => setCreateRevenueAccountId(String(val))}
                                                options={[
                                                    { value: '', label: 'Default (6010)' },
                                                    ...revenueAccounts.map((a) => ({
                                                        value: a.id,
                                                        label: `${a.code} - ${a.name}`,
                                                    })),
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 5: Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA] block">Təsvir və Qeydlər</label>
                                    <textarea
                                        rows={2}
                                        value={createDescription}
                                        onChange={(e) => setCreateDescription(e.target.value)}
                                        placeholder="Məhsulun xüsusiyyətləri, texniki parametrləri və s."
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#52525B] focus:outline-none focus:border-white transition-colors resize-none"
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
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {createLoading ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                            <span>Yaradılır...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>Məhsulu Yarat</span>
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

export default ItemsPage;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { procurementService, customersService } from '../../api';
import type { PurchaseOrderDto, SupplierDto, ItemDto, CreatePurchaseOrderRequest } from '../../dto';
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
    ShoppingBagIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

interface OrderLineState {
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    taxRate: number;
}

export const PurchaseOrdersPage: React.FC = () => {
    const navigate = useNavigate();

    // Data states
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
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
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [filterSupplierId, setFilterSupplierId] = useState<string>('ALL');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Popover toggles
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'orderNumber' | 'supplier' | 'date' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Action button loadings
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Refs
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'orderNumber', label: 'Sifariş №', visible: true },
        { key: 'supplier', label: 'Təchizatçı', visible: true },
        { key: 'orderDate', label: 'Sifariş Tarixi', visible: true },
        { key: 'deliveryDate', label: 'Gözlənilən Çatdırılma', visible: true },
        { key: 'amount', label: 'Toplam Məbləğ', visible: true },
        { key: 'status', label: 'Status', visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalSupplierId, setModalSupplierId] = useState('');
    const [modalOrderDate, setModalOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalDeliveryDate, setModalDeliveryDate] = useState('');
    const [modalCurrency, setModalCurrency] = useState('AZN');
    const [modalNotes, setModalNotes] = useState('');
    const [modalLines, setModalLines] = useState<OrderLineState[]>([
        { itemId: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 18 },
    ]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Fetch initial data
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [ordersData, suppliersData, itemsData] = await Promise.all([
                procurementService.getPurchaseOrders(),
                procurementService.getSuppliers(),
                customersService.getItems().catch(() => []),
            ]);
            setOrders(ordersData);
            setSuppliers(suppliersData);
            setItems(itemsData);
        } catch (err: any) {
            console.error('[PurchaseOrdersPage] Error loading data:', err);
            showToast('Məlumatları yükləyərkən xəta baş verdi', 'error');
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


    const getStatusBadge = (status: any) => {
        const str = String(status || '').toLowerCase();
        if (str === 'approved' || str === '3') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Təsdiqlənib
                </span>
            );
        }
        if (str === 'received' || str === 'partiallyreceived' || str === 'fullyreceived' || str === 'completed' || str === '4' || str === '5' || str === '6') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Qəbul Edilib
                </span>
            );
        }
        if (str === 'cancelled' || str === '7') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Ləğv Edilib
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                Qaralama
            </span>
        );
    };

    // Filter & Sort Pipeline
    const filteredOrders = useMemo(() => {
        return orders
            .filter((po) => {
                // Search
                if (searchTerm.trim()) {
                    const q = searchTerm.toLowerCase();
                    const matchNum = po.orderNumber?.toLowerCase().includes(q);
                    const matchSupp = po.supplierName?.toLowerCase().includes(q);
                    if (!matchNum && !matchSupp) return false;
                }

                // Status
                if (statusFilter !== 'ALL') {
                    const st = String(po.status || '').toLowerCase();
                    const filterSt = statusFilter.toLowerCase();
                    if (filterSt === 'draft' && st !== 'draft' && st !== '1') return false;
                    if (filterSt === 'approved' && st !== 'approved' && st !== '3') return false;
                    if (filterSt === 'received' && !['received', 'partiallyreceived', 'fullyreceived', 'completed', '4', '5', '6'].includes(st)) return false;
                    if (filterSt === 'cancelled' && st !== 'cancelled' && st !== '7') return false;
                }

                // Supplier Filter
                if (filterSupplierId !== 'ALL' && po.supplierId !== filterSupplierId) {
                    return false;
                }

                // Min Amount
                const amt = Number(po.grandTotal ?? po.totalAmount ?? 0);
                if (filterMinAmount !== '') {
                    const min = parseFloat(filterMinAmount);
                    if (!isNaN(min) && amt < min) return false;
                }

                // Max Amount
                if (filterMaxAmount !== '') {
                    const max = parseFloat(filterMaxAmount);
                    if (!isNaN(max) && amt > max) return false;
                }

                // Date range
                if (filterStartDate) {
                    const start = new Date(filterStartDate).getTime();
                    const ordTime = new Date(po.orderDate).getTime();
                    if (ordTime < start) return false;
                }
                if (filterEndDate) {
                    const end = new Date(filterEndDate).getTime() + 86400000;
                    const ordTime = new Date(po.orderDate).getTime();
                    if (ordTime > end) return false;
                }

                return true;
            })
            .sort((a, b) => {
                let comp = 0;
                if (sortField === 'orderNumber') {
                    comp = (a.orderNumber || '').localeCompare(b.orderNumber || '');
                } else if (sortField === 'supplier') {
                    comp = (a.supplierName || '').localeCompare(b.supplierName || '');
                } else if (sortField === 'date') {
                    comp = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                } else if (sortField === 'amount') {
                    const amtA = Number(a.grandTotal ?? a.totalAmount ?? 0);
                    const amtB = Number(b.grandTotal ?? b.totalAmount ?? 0);
                    comp = amtA - amtB;
                }
                return sortDirection === 'asc' ? comp : -comp;
            });
    }, [orders, searchTerm, statusFilter, filterSupplierId, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate, sortField, sortDirection]);

    // Active filters count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (statusFilter !== 'ALL') count++;
        if (filterSupplierId !== 'ALL') count++;
        if (filterMinAmount !== '') count++;
        if (filterMaxAmount !== '') count++;
        if (filterStartDate !== '' || filterEndDate !== '') count++;
        return count;
    }, [statusFilter, filterSupplierId, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate]);

    const clearAllFilters = () => {
        setStatusFilter('ALL');
        setFilterSupplierId('ALL');
        setFilterMinAmount('');
        setFilterMaxAmount('');
        setFilterStartDate('');
        setFilterEndDate('');
        setSearchTerm('');
    };

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    // Selection handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(paginatedOrders.map((o) => o.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    };

    // Modal Line Operations
    const handleAddLine = () => {
        setModalLines((prev) => [
            ...prev,
            { itemId: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 18 },
        ]);
    };

    const handleRemoveLine = (index: number) => {
        if (modalLines.length <= 1) return;
        setModalLines((prev) => prev.filter((_, i) => i !== index));
    };

    const handleItemSelect = (index: number, itmId: string) => {
        const found = items.find((i) => i.id === itmId);
        setModalLines((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                itemId: itmId,
                description: found?.name || next[index].description || '',
                unitPrice: Number(found?.standardBuyingPrice ?? found?.costPrice ?? found?.unitPrice ?? 0),
                taxRate: 18,
            };
            return next;
        });
    };

    const handleLineChange = (index: number, field: keyof OrderLineState, value: any) => {
        setModalLines((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Calculations
    const modalSubTotal = useMemo(() => {
        return modalLines.reduce((sum, l) => {
            const lineSub = (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * (1 - (Number(l.discountPercent) || 0) / 100);
            return sum + lineSub;
        }, 0);
    }, [modalLines]);

    const modalTaxTotal = useMemo(() => {
        return modalLines.reduce((sum, l) => {
            const lineSub = (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * (1 - (Number(l.discountPercent) || 0) / 100);
            const lineTax = lineSub * ((Number(l.taxRate) || 0) / 100);
            return sum + lineTax;
        }, 0);
    }, [modalLines]);

    const modalGrandTotal = modalSubTotal + modalTaxTotal;

    // Open Create Modal
    const openCreateModal = () => {
        setModalSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
        setModalOrderDate(new Date().toISOString().split('T')[0]);
        const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        setModalDeliveryDate(nextMonth);
        setModalCurrency('AZN');
        setModalNotes('');
        setModalLines([
            { itemId: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 18 },
        ]);
        setCreateError('');
        setShowCreateModal(true);
    };

    // Create Submit Handler
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!modalSupplierId) {
            setCreateError('Zəhmət olmasa təchizatçı seçin.');
            return;
        }

        const validLines = modalLines.filter((l) => (l.description.trim() || l.itemId) && Number(l.quantity) > 0);
        if (validLines.length === 0) {
            setCreateError('Zəhmət olmasa ən azı bir sifariş sətri və miqdarı (0-dan böyük) daxil edin.');
            return;
        }

        setCreateLoading(true);
        try {
            const req: CreatePurchaseOrderRequest = {
                supplierId: modalSupplierId,
                orderDate: modalOrderDate,
                expectedDeliveryDate: modalDeliveryDate || undefined,
                currency: modalCurrency,
                notes: modalNotes.trim() || undefined,
                lines: validLines.map((l) => ({
                    itemId: l.itemId || undefined,
                    description: l.description.trim() || 'Məhsul',
                    quantity: Number(l.quantity) || 1,
                    unitPrice: Number(l.unitPrice) || 0,
                    taxRate: Number(l.taxRate) || 18,
                })),
            };

            await procurementService.createPurchaseOrder(req);
            setShowCreateModal(false);
            showToast('Satınalma sifarişi uğurla yaradıldı!', 'success');
            loadData(true);
        } catch (err: any) {
            console.error('[PurchaseOrdersPage] Create error:', err);
            const msg = err.response?.data?.message || err.response?.data?.title || err.message || 'Sifariş yaradılarkən xəta baş verdi.';
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    // Approve Action
    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActionLoadingId(id);
        try {
            await procurementService.approvePurchaseOrder(id);
            showToast('Sifariş uğurla təsdiqləndi!', 'success');
            loadData(true);
        } catch (err: any) {
            console.error('[PurchaseOrdersPage] Approve error:', err);
            showToast(err.response?.data?.message || 'Təsdiqləmək mümkün olmadı.', 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-4 font-sans text-white">
            {/* ─── Breadcrumb & Main Header ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 text-xs">
                    <button
                        onClick={() => navigate('/purchase-orders')}
                        className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white hover:bg-white/10 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>Satınalma</span>
                    </button>
                    <span className="text-[#52525B]">/</span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-[#27272A]">
                        <Bars3Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-medium text-white">Satınalma Sifarişləri</span>
                    </div>
                </div>

                {/* Right Actions: Refresh & Create */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={loading || isRefreshing}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title="Məlumatları Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yarat</span>
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
                            placeholder="Sifariş № və ya təchizatçı adı..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-36 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {statusFilter === 'ALL'
                                    ? 'Bütün Statuslar'
                                    : statusFilter === 'Draft'
                                    ? 'Qaralama'
                                    : statusFilter === 'Approved'
                                    ? 'Təsdiqlənib'
                                    : statusFilter === 'Received'
                                    ? 'Qəbul Edilib'
                                    : 'Ləğv Edilib'}
                            </span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { id: 'ALL', label: 'Bütün Statuslar' },
                                    { id: 'Draft', label: 'Qaralama (Draft)' },
                                    { id: 'Approved', label: 'Təsdiqlənib (Approved)' },
                                    { id: 'Received', label: 'Qəbul Edilib (Received)' },
                                    { id: 'Cancelled', label: 'Ləğv Edilib (Cancelled)' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(t.id);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            statusFilter === t.id ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
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
                                    <span className="font-bold text-white text-xs">Sifariş Filtrləri</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                            Sıfırla
                                        </button>
                                    )}
                                </div>

                                {/* Supplier Filter */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Təchizatçı</label>
                                    <CustomSelect
                                        value={filterSupplierId}
                                        onChange={(val) => setFilterSupplierId(String(val))}
                                        options={[
                                            { value: 'ALL', label: 'Bütün Təchizatçılar' },
                                            ...suppliers.map((s) => ({
                                                value: s.id,
                                                label: s.name,
                                            })),
                                        ]}
                                    />
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Məbləğ Aralığı (AZN)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinAmount}
                                            onChange={(e) => setFilterMinAmount(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={filterMaxAmount}
                                            onChange={(e) => setFilterMaxAmount(e.target.value)}
                                            className="px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none placeholder:text-[#52525B]"
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-1">
                                    <label className="text-[11px] text-[#A1A1AA] font-semibold">Sifariş Tarixi Aralığı</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="px-2 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="px-2 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-xs text-white focus:outline-none"
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
                                    onClick={() => { setSortField('date'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Tarix üzrə ({sortDirection === 'asc' ? 'Artan' : 'Azalan'})
                                </button>
                                <button
                                    onClick={() => { setSortField('orderNumber'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Sifariş № üzrə
                                </button>
                                <button
                                    onClick={() => { setSortField('supplier'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); setIsSortOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl text-left hover:bg-[#2C2C2E]/60 cursor-pointer"
                                >
                                    Təchizatçı üzrə
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

            {/* ─── Main Orders Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedOrders.length > 0 && selectedRows.length === paginatedOrders.length}
                                        className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                {columns.find((c) => c.key === 'orderNumber')?.visible && <th className="py-3 px-3">Sifariş №</th>}
                                {columns.find((c) => c.key === 'supplier')?.visible && <th className="py-3 px-3">Təchizatçı</th>}
                                {columns.find((c) => c.key === 'orderDate')?.visible && <th className="py-3 px-3">Sifariş Tarixi</th>}
                                {columns.find((c) => c.key === 'deliveryDate')?.visible && <th className="py-3 px-3">Gözlənilən Çatdırılma</th>}
                                {columns.find((c) => c.key === 'amount')?.visible && <th className="py-3 px-3 text-right">Toplam Məbləğ</th>}
                                {columns.find((c) => c.key === 'status')?.visible && <th className="py-3 px-3 text-center">Status</th>}
                                <th className="py-3 px-3 text-right">Əməliyyatlar</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                            <span>Satınalma sifarişləri yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                                                <ShoppingBagIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Heç bir satınalma sifarişi tapılmadı</p>
                                                <p className="text-xs text-[#71717A] mt-1 max-w-sm">Təchizatçılara göndərilən mallar və xidmətlər üzrə ilk sifarişi tərtib edin</p>
                                            </div>
                                            <button
                                                onClick={openCreateModal}
                                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>İlk Sifarişi Yarat</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((o) => {
                                    const total = Number(o.grandTotal ?? o.totalAmount ?? 0);
                                    const isDraft = String(o.status) === 'Draft' || String(o.status) === '1';
                                    return (
                                        <tr
                                            key={o.id}
                                            onClick={() => navigate(`/purchase-orders/${o.id}`)}
                                            className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                        >
                                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(o.id)}
                                                    onChange={() => handleSelectRow(o.id)}
                                                    className="rounded bg-[#121214] border-[#2C2C2E] text-white focus:ring-0 cursor-pointer"
                                                />
                                            </td>

                                            {columns.find((c) => c.key === 'orderNumber')?.visible && (
                                                <td className="py-3 px-3 font-mono font-bold text-white">
                                                    {o.orderNumber}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'supplier')?.visible && (
                                                <td className="py-3 px-3">
                                                    <span className="font-semibold text-white group-hover:text-zinc-200 transition-colors">
                                                        {o.supplierName || 'Təchizatçı'}
                                                    </span>
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'orderDate')?.visible && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    {formatDate(o.orderDate)}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'deliveryDate')?.visible && (
                                                <td className="py-3 px-3 text-[#71717A]">
                                                    {formatDate(o.expectedDeliveryDate)}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'amount')?.visible && (
                                                <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                                    {formatCurrency(total, o.currency)}
                                                </td>
                                            )}

                                            {columns.find((c) => c.key === 'status')?.visible && (
                                                <td className="py-3 px-3 text-center">
                                                    {getStatusBadge(o.status)}
                                                </td>
                                            )}

                                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isDraft && (
                                                        <button
                                                            onClick={(e) => handleApprove(o.id, e)}
                                                            disabled={actionLoadingId === o.id}
                                                            className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            {actionLoadingId === o.id ? (
                                                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                            )}
                                                            <span>Təsdiqlə</span>
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/purchase-orders/${o.id}`}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
                                                        title="Detallara Bax"
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
                        {filteredOrders.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredOrders.length
                              )} of ${filteredOrders.length}`}
                    </span>
                </div>
            </div>

            {/* ─── CREATE PURCHASE ORDER MODAL (Soft CRM Design) ─── */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCreateModal(false);
                    }}
                >
                    <div
                        className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-3xl text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-white">Yeni Satınalma Sifarişi</h3>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">Təchizatçı üçün yeni rəsmi satınalma sifarişi tərtib edin</p>
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
                                <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{createError}</span>
                            </div>
                        )}

                        {/* Modal Form Body */}
                        <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
                                {/* Top Controls: Supplier, Order Date, Delivery Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">
                                            Təchizatçı <span className="text-rose-400">*</span>
                                        </label>
                                        <CustomSelect
                                            value={modalSupplierId}
                                            onChange={(val) => setModalSupplierId(String(val))}
                                            placeholder="Təchizatçı seçin..."
                                            options={suppliers.map((s) => ({
                                                value: s.id,
                                                label: s.name,
                                                description: s.code,
                                            }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">
                                            Sifariş Tarixi <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={modalOrderDate}
                                            onChange={(e) => setModalOrderDate(e.target.value)}
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#A1A1AA] block">Gözlənilən Çatdırılma</label>
                                        <input
                                            type="date"
                                            value={modalDeliveryDate}
                                            onChange={(e) => setModalDeliveryDate(e.target.value)}
                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Line Items Header */}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                        Sifariş Sətirləri (Məhsullar / Xidmətlər)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                {/* Line Items List */}
                                <div className="space-y-2.5">
                                    {modalLines.map((line, idx) => {
                                        const lineSub = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) * (1 - (Number(line.discountPercent) || 0) / 100);
                                        const lineTax = lineSub * ((Number(line.taxRate) || 0) / 100);
                                        const lineTot = lineSub + lineTax;

                                        return (
                                            <div
                                                key={idx}
                                                className="p-3.5 rounded-2xl bg-[#121214]/60 border border-[#27272A] space-y-2.5"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                                    {/* Item Dropdown */}
                                                    <div className="sm:col-span-4 space-y-1">
                                                        <label className="text-[10.5px] text-[#71717A] block">Məhsul / Xidmət</label>
                                                        <CustomSelect
                                                            value={line.itemId}
                                                            onChange={(val) => handleItemSelect(idx, String(val))}
                                                            placeholder="Məhsul seçin..."
                                                            options={[
                                                                { value: '', label: 'Əllə daxil et...' },
                                                                ...items.map((itm) => ({
                                                                    value: itm.id,
                                                                    label: `${itm.code} - ${itm.name}`,
                                                                })),
                                                            ]}
                                                        />
                                                    </div>

                                                    {/* Description */}
                                                    <div className="sm:col-span-3 space-y-1">
                                                        <label className="text-[10.5px] text-[#71717A] block">Təsvir</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Məhsulun təsviri..."
                                                            value={line.description}
                                                            onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                                        />
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="sm:col-span-2 space-y-1">
                                                        <label className="text-[10.5px] text-[#71717A] block">Say</label>
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="any"
                                                            required
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white text-right font-mono focus:outline-none focus:border-white transition-colors"
                                                        />
                                                    </div>

                                                    {/* Unit Price */}
                                                    <div className="sm:col-span-2 space-y-1">
                                                        <label className="text-[10.5px] text-[#71717A] block">Qiymət (AZN)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                            value={line.unitPrice}
                                                            onChange={(e) => handleLineChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white text-right font-mono focus:outline-none focus:border-white transition-colors"
                                                        />
                                                    </div>

                                                    {/* Remove Button */}
                                                    <div className="sm:col-span-1 flex items-end justify-center pt-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLine(idx)}
                                                            disabled={modalLines.length <= 1}
                                                            className="p-2 rounded-xl text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                            title="Sətri sil"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1 border-t border-[#27272A]/40 font-mono">
                                                    <span>ƏDV (18%): {formatCurrency(lineTax)}</span>
                                                    <span>Sətir Yekunu: <strong className="text-white">{formatCurrency(lineTot)}</strong></span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Summary Box */}
                                <div className="p-4 rounded-2xl bg-[#121214]/60 border border-[#27272A] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                                    <div className="text-[#A1A1AA]">
                                        Cəmi: <strong className="text-white ml-1">{formatCurrency(modalSubTotal)}</strong>
                                    </div>
                                    <div className="text-[#A1A1AA]">
                                        ƏDV (18%): <strong className="text-white ml-1">{formatCurrency(modalTaxTotal)}</strong>
                                    </div>
                                    <div className="text-white font-bold text-sm">
                                        Yekun Məbləğ: <span className="text-emerald-400 ml-1">{formatCurrency(modalGrandTotal)}</span>
                                    </div>
                                </div>

                                {/* Notes / Terms */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA] block">Şərtlər və Qeydlər (Terms & Conditions)</label>
                                    <textarea
                                        rows={2}
                                        value={modalNotes}
                                        onChange={(e) => setModalNotes(e.target.value)}
                                        placeholder="Sifarişin xüsusi tələbləri, çatdırılma ünvanı və ya müqavilə şərtləri..."
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
                                    disabled={createLoading || suppliers.length === 0}
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
                                            <span>Sifarişi Yarat</span>
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

export default PurchaseOrdersPage;

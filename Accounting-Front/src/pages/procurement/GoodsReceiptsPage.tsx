import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { procurementService, inventoryService, customersService } from '../../api';
import { formatDate } from '../../utils';
import type { GoodsReceiptDto, SupplierDto, WarehouseDto, ItemDto, PurchaseOrderDto, CreateGoodsReceiptRequest } from '../../dto';
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
    InboxArrowDownIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

interface ReceiptLineState {
    itemId: string;
    description: string;
    quantityReceived: number;
    unitCost: number;
}

export const GoodsReceiptsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Data states
    const [receipts, setReceipts] = useState<GoodsReceiptDto[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
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
    const [filterWarehouseId, setFilterWarehouseId] = useState<string>('ALL');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Popover toggles
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'receiptNumber' | 'supplier' | 'date' | 'amount'>('date');
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
        { key: 'receiptNumber', label: 'Qəbul №', visible: true },
        { key: 'waybillNumber', label: 'İrsaliyə / Qaimə №', visible: true },
        { key: 'supplier', label: 'Təchizatçı', visible: true },
        { key: 'warehouse', label: 'Anbar', visible: true },
        { key: 'receiptDate', label: 'Qəbul Tarixi', visible: true },
        { key: 'amount', label: 'Yekun Dəyər', visible: true },
        { key: 'status', label: 'Status', visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalSupplierId, setModalSupplierId] = useState('');
    const [modalWarehouseId, setModalWarehouseId] = useState('');
    const [modalPurchaseOrderId, setModalPurchaseOrderId] = useState('');
    const [modalReceiptDate, setModalReceiptDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalPostingDate, setModalPostingDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalWaybillNumber, setModalWaybillNumber] = useState('');
    const [modalNotes, setModalNotes] = useState('');
    const [modalLines, setModalLines] = useState<ReceiptLineState[]>([
        { itemId: '', description: '', quantityReceived: 1, unitCost: 0 },
    ]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const extractErrorMessage = (err: any): string => {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
        if (data?.error) return data.error;
        return err.message || t('common.error', {}, 'Xəta baş verdi');
    };

    // Fetch initial data
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [rcptData, suppData, whData, itemData, poData] = await Promise.all([
                procurementService.getGoodsReceipts(),
                procurementService.getSuppliers(),
                inventoryService.getWarehouses(),
                customersService.getItems(),
                procurementService.getPurchaseOrders().catch(() => []),
            ]);

            setReceipts(rcptData);
            setSuppliers(suppData);
            setWarehouses(whData);
            setItems(itemData);
            setOrders(poData);
        } catch (err) {
            console.error('Error loading goods receipts data:', err);
            showToast(t('common.error', {}, 'Məlumatlar yüklənərkən xəta baş verdi'), 'error');
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
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
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
        setTimeout(() => setToastMessage(''), 3500);
    };

    // Auto fill if PO is selected in create modal
    const handlePoSelection = (poId: string) => {
        setModalPurchaseOrderId(poId);
        if (!poId) return;

        const po = orders.find((o) => o.id === poId);
        if (po) {
            if (po.supplierId) setModalSupplierId(po.supplierId);
            if (po.lines && po.lines.length > 0) {
                setModalLines(
                    po.lines.map((l) => ({
                        itemId: l.itemId || '',
                        description: l.description || '',
                        quantityReceived: l.quantity || 1,
                        unitCost: l.unitPrice || 0,
                    }))
                );
            }
        }
    };

    // Sətir əməliyyatları
    const handleAddLine = () => {
        setModalLines([...modalLines, { itemId: '', description: '', quantityReceived: 1, unitCost: 0 }]);
    };

    const handleRemoveLine = (idx: number) => {
        if (modalLines.length <= 1) return;
        setModalLines(modalLines.filter((_, i) => i !== idx));
    };

    const handleLineItemSelect = (idx: number, itmId: string) => {
        const found = items.find((i) => i.id === itmId);
        const next = [...modalLines];
        next[idx] = {
            ...next[idx],
            itemId: itmId,
            description: found ? (found.code ? `${found.name} (${found.code})` : found.name) : '',
            unitCost: found?.costPrice || found?.unitPrice || 0,
        };
        setModalLines(next);
    };

    const handleLineChange = (idx: number, field: keyof ReceiptLineState, val: any) => {
        const next = [...modalLines];
        next[idx] = { ...next[idx], [field]: val };
        setModalLines(next);
    };

    // Calculate totals for modal
    const modalCalculations = useMemo(() => {
        const totalItemsCount = modalLines.reduce((sum, l) => sum + (Number(l.quantityReceived) || 0), 0);
        const totalValue = modalLines.reduce((sum, l) => sum + (Number(l.quantityReceived) || 0) * (Number(l.unitCost) || 0), 0);
        return { totalItemsCount, totalValue };
    }, [modalLines]);

    // Handle Create Submit
    const handleCreateReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalSupplierId) {
            setCreateError(t('validation.supplierRequired', {}, 'Zəhmət olmasa təchizatçı seçin.'));
            return;
        }
        if (!modalWarehouseId) {
            setCreateError(t('validation.warehouseRequired', {}, 'Zəhmət olmasa anbar seçin.'));
            return;
        }

        const validLines = modalLines.filter((l) => l.itemId || l.description.trim());
        if (validLines.length === 0) {
            setCreateError(t('validation.selectAtLeastOneLine', {}, 'Ən azı 1 məhsul sətiri doldurulmalıdır.'));
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const supplierObj = suppliers.find((s) => s.id === modalSupplierId);
            const warehouseObj = warehouses.find((w) => w.id === modalWarehouseId);
            const poObj = orders.find((o) => o.id === modalPurchaseOrderId);

            const payload: CreateGoodsReceiptRequest = {
                supplierId: modalSupplierId,
                warehouseId: modalWarehouseId,
                purchaseOrderId: modalPurchaseOrderId || undefined,
                receiptDate: modalReceiptDate,
                postingDate: modalPostingDate,
                waybillNumber: modalWaybillNumber,
                notes: modalNotes,
                lines: validLines.map((l) => ({
                    itemId: l.itemId,
                    description: l.description || 'Məhsul',
                    quantityReceived: Number(l.quantityReceived) || 1,
                    receivedQuantity: Number(l.quantityReceived) || 1,
                    unitCost: Number(l.unitCost) || 0,
                })),
            };

            const created = await procurementService.createGoodsReceipt({
                ...payload,
                supplierName: supplierObj?.name,
                warehouseName: warehouseObj?.name,
                purchaseOrderNumber: poObj?.orderNumber,
            });

            setShowCreateModal(false);
            showToast(`${t('procurement.receiptNumber', {}, 'Qəbul')} (${created.receiptNumber || 'Yeni'}) ${t('common.success', {}, 'uğurla yaradıldı!')}`);
            resetCreateForm();
            await loadData(true);
        } catch (err: any) {
            console.error('Error creating goods receipt:', err);
            const msg = extractErrorMessage(err);
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    const resetCreateForm = () => {
        setModalSupplierId('');
        setModalWarehouseId('');
        setModalPurchaseOrderId('');
        setModalReceiptDate(new Date().toISOString().split('T')[0]);
        setModalPostingDate(new Date().toISOString().split('T')[0]);
        setModalWaybillNumber('');
        setModalNotes('');
        setModalLines([{ itemId: '', description: '', quantityReceived: 1, unitCost: 0 }]);
        setCreateError('');
    };

    // Post Goods Receipt (İcra et)
    const handlePostReceipt = async (receiptId: string, receiptNumber: string) => {
        setActionLoadingId(receiptId);
        try {
            await procurementService.postGoodsReceipt(receiptId);
            showToast(`${receiptNumber} ${t('procurement.grnPostedSuccess', {}, 'sənədi uğurla icra edildi və anbara mədaxil olundu!')}`);
            await loadData(true);
        } catch (err: any) {
            console.error('Error posting goods receipt:', err);
            const msg = extractErrorMessage(err);
            showToast(msg, 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Status helper
    const getStatusInfo = (status: any) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('post') || status === 4) {
            return {
                label: t('statuses.posted', {}, 'İcra Edilib'),
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                dot: 'bg-emerald-400',
            };
        }
        if (s.includes('appr') || status === 3) {
            return {
                label: t('statuses.approved', {}, 'Təsdiqlənib'),
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/20',
                text: 'text-cyan-400',
                dot: 'bg-cyan-400',
            };
        }
        if (s.includes('sub') || status === 2) {
            return {
                label: t('statuses.pending', {}, 'Təqdim Edilib'),
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                text: 'text-blue-400',
                dot: 'bg-blue-400',
            };
        }
        if (s.includes('canc') || status === 5) {
            return {
                label: t('statuses.cancelled', {}, 'Ləğv Edilib'),
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                dot: 'bg-rose-400',
            };
        }
        return {
            label: t('statuses.draft', {}, 'Qaralama'),
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
            dot: 'bg-neutral-400',
        };
    };

    // Filter, Search, and Sort Logic
    const filteredReceipts = useMemo(() => {
        let list = [...receipts];

        // 1. Text Search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (r) =>
                    r.receiptNumber.toLowerCase().includes(q) ||
                    (r.waybillNumber && r.waybillNumber.toLowerCase().includes(q)) ||
                    (r.supplierName && r.supplierName.toLowerCase().includes(q)) ||
                    (r.warehouseName && r.warehouseName.toLowerCase().includes(q))
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'ALL') {
            list = list.filter((r) => {
                const s = String(r.status || '').toLowerCase();
                if (statusFilter === 'Draft') return s.includes('draft') || r.status === 1;
                if (statusFilter === 'Submitted') return s.includes('sub') || r.status === 2;
                if (statusFilter === 'Approved') return s.includes('appr') || r.status === 3;
                if (statusFilter === 'Posted') return s.includes('post') || r.status === 4;
                if (statusFilter === 'Cancelled') return s.includes('canc') || r.status === 5;
                return true;
            });
        }

        // 3. Supplier Filter
        if (filterSupplierId !== 'ALL') {
            list = list.filter((r) => r.supplierId === filterSupplierId);
        }

        // 4. Warehouse Filter
        if (filterWarehouseId !== 'ALL') {
            list = list.filter((r) => r.warehouseId === filterWarehouseId);
        }

        // 5. Amount Range
        if (filterMinAmount) {
            const min = parseFloat(filterMinAmount);
            if (!isNaN(min)) list = list.filter((r) => (r.totalValue || 0) >= min);
        }
        if (filterMaxAmount) {
            const max = parseFloat(filterMaxAmount);
            if (!isNaN(max)) list = list.filter((r) => (r.totalValue || 0) <= max);
        }

        // 6. Date Range
        if (filterStartDate) {
            list = list.filter((r) => new Date(r.receiptDate) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            list = list.filter((r) => new Date(r.receiptDate) <= new Date(filterEndDate + 'T23:59:59'));
        }

        // 7. Sorting
        list.sort((a, b) => {
            let res = 0;
            if (sortField === 'receiptNumber') {
                res = a.receiptNumber.localeCompare(b.receiptNumber);
            } else if (sortField === 'supplier') {
                res = (a.supplierName || '').localeCompare(b.supplierName || '');
            } else if (sortField === 'amount') {
                res = (a.totalValue || 0) - (b.totalValue || 0);
            } else {
                res = new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
            }
            return sortDirection === 'asc' ? res : -res;
        });

        return list;
    }, [
        receipts,
        searchTerm,
        statusFilter,
        filterSupplierId,
        filterWarehouseId,
        filterMinAmount,
        filterMaxAmount,
        filterStartDate,
        filterEndDate,
        sortField,
        sortDirection,
    ]);

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filterSupplierId !== 'ALL') count++;
        if (filterWarehouseId !== 'ALL') count++;
        if (filterMinAmount || filterMaxAmount) count++;
        if (filterStartDate || filterEndDate) count++;
        return count;
    }, [filterSupplierId, filterWarehouseId, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate]);

    const resetFilters = () => {
        setFilterSupplierId('ALL');
        setFilterWarehouseId('ALL');
        setFilterMinAmount('');
        setFilterMaxAmount('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // Pagination
    const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
    const paginatedReceipts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredReceipts.slice(start, start + pageSize);
    }, [filteredReceipts, currentPage, pageSize]);

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedReceipts.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedReceipts.map((r) => r.id));
        }
    };

    const toggleSelectRow = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((r) => r !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const toggleColumn = (key: string) => {
        setColumns(columns.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
    };

    const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-200">
            {/* ─── Top Header & Breadcrumbs ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs text-[#71717A]">
                        <span>{t('nav.suppliers', {}, 'Təchizat')}</span>
                        <span>/</span>
                        <span className="text-[#E4E4E7] font-medium">{t('nav.goodsReceipts', {}, 'Malların Qəbulu')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <h1 className="text-xl font-semibold text-white tracking-tight">{t('procurement.grnTitle', {}, 'Malların Qəbulu')}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[#1C1C1E] border border-[#27272A] text-[#A1A1AA] font-mono">
                            {filteredReceipts.length}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-300' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            resetCreateForm();
                            setShowCreateModal(true);
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-sm active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>{t('procurement.newGrn', {}, 'Qəbul Yarat')}</span>
                    </button>
                </div>
            </div>

            {/* ─── Toast Notification ─── */}
            {toastMessage && (
                <div
                    className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                        toastType === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                >
                    {toastType === 'success' ? <CheckIcon className="w-4 h-4 shrink-0" /> : <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />}
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            {/* ─── Control Bar: Search, Status, Filter, Columns, Sort ─── */}
            <div className="p-2.5 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-wrap items-center justify-between gap-2.5">
                {/* Left controls */}
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('common.searchPlaceholder', {}, 'Qəbul №, irsaliyə və ya təchizatçı axtar...')}
                            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46] transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#E4E4E7] hover:border-[#3F3F46] transition-colors"
                        >
                            <span>
                                {statusFilter === 'ALL'
                                    ? t('common.all', {}, 'Bütün Statuslar')
                                    : statusFilter === 'Draft'
                                    ? t('statuses.draft', {}, 'Qaralama')
                                    : statusFilter === 'Submitted'
                                    ? t('statuses.pending', {}, 'Təqdim Edilib')
                                    : statusFilter === 'Approved'
                                    ? t('statuses.approved', {}, 'Təsdiqlənib')
                                    : statusFilter === 'Posted'
                                    ? t('statuses.posted', {}, 'İcra Edilib')
                                    : t('statuses.cancelled', {}, 'Ləğv Edilib')}
                            </span>
                            <span className="text-[#71717A] text-[10px]">▼</span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Bütün Statuslar') },
                                    { key: 'Draft', label: t('statuses.draft', {}, 'Qaralama') },
                                    { key: 'Submitted', label: t('statuses.pending', {}, 'Təqdim Edilib') },
                                    { key: 'Approved', label: t('statuses.approved', {}, 'Təsdiqlənib') },
                                    { key: 'Posted', label: t('statuses.posted', {}, 'İcra Edilib') },
                                    { key: 'Cancelled', label: t('statuses.cancelled', {}, 'Ləğv Edilib') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setStatusFilter(item.key);
                                            setIsStatusDropdownOpen(false);
                                            setCurrentPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#27272A] transition-colors ${
                                            statusFilter === item.key ? 'text-white font-semibold bg-[#27272A]/50' : 'text-[#A1A1AA]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {statusFilter === item.key && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Popover Button */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                                activeFiltersCount > 0
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-[#18181B] border-[#27272A] text-[#E4E4E7] hover:border-[#3F3F46]'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFiltersCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-black font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* Filter Popover Content */}
                        {isFilterPopoverOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl p-4 z-30 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                                <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                                    <span className="text-xs font-semibold text-white">{t('common.allFilters', {}, 'Filter parametrləri')}</span>
                                    {activeFiltersCount > 0 && (
                                        <button onClick={resetFilters} className="text-[10px] text-emerald-400 hover:underline">
                                            {t('common.reset', {}, 'Sıfırla')}
                                        </button>
                                    )}
                                </div>

                                {/* Supplier filter */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">{t('procurement.supplierName', {}, 'Təchizatçı')}</label>
                                    <select
                                        value={filterSupplierId}
                                        onChange={(e) => setFilterSupplierId(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Bütün Təchizatçılar')}</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Warehouse filter */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">{t('inventory.warehouseName', {}, 'Anbar')}</label>
                                    <select
                                        value={filterWarehouseId}
                                        onChange={(e) => setFilterWarehouseId(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Bütün Anbarlar')}</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount range */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">{t('common.amount', {}, 'Məbləğ aralığı')} (AZN)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filterMinAmount}
                                            onChange={(e) => setFilterMinAmount(e.target.value)}
                                            className="bg-[#121214] border border-[#27272A] rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filterMaxAmount}
                                            onChange={(e) => setFilterMaxAmount(e.target.value)}
                                            className="bg-[#121214] border border-[#27272A] rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        />
                                    </div>
                                </div>

                                {/* Date range */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">{t('procurement.receiptDate', {}, 'Qəbul Tarixi')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="bg-[#121214] border border-[#27272A] rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        />
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="bg-[#121214] border border-[#27272A] rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right controls: Columns & Sort */}
                <div className="flex items-center gap-2">
                    {/* Columns Toggle */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#E4E4E7] hover:border-[#3F3F46] transition-colors"
                        >
                            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                            <span>{t('common.details', {}, 'Sütunlar')}</span>
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-2 px-3 z-30 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                                <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                                    {t('common.details', {}, 'Görünən Sütunlar')}
                                </span>
                                {columns.map((col) => (
                                    <label key={col.key} className="flex items-center gap-2 text-xs text-[#E4E4E7] cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={col.visible}
                                            onChange={() => toggleColumn(col.key)}
                                            className="rounded border-[#27272A] bg-[#121214] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                        />
                                        <span>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#E4E4E7] hover:border-[#3F3F46] transition-colors"
                        >
                            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                            <span>{t('common.sort', {}, 'Sıralama')}</span>
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                {[
                                    { field: 'date' as const, dir: 'desc' as const, label: `${t('common.date', {}, 'Tarix')}: ${t('common.today', {}, 'Yeni - Köhnə')}` },
                                    { field: 'date' as const, dir: 'asc' as const, label: `${t('common.date', {}, 'Tarix')}: Köhnə - Yeni` },
                                    { field: 'receiptNumber' as const, dir: 'asc' as const, label: `${t('procurement.receiptNumber', {}, 'Qəbul №')}: A - Z` },
                                    { field: 'amount' as const, dir: 'desc' as const, label: `${t('common.amount', {}, 'Dəyər')}: Çox - Az` },
                                    { field: 'amount' as const, dir: 'asc' as const, label: `${t('common.amount', {}, 'Dəyər')}: Az - Çox` },
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSortField(item.field);
                                            setSortDirection(item.dir);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#27272A] transition-colors ${
                                            sortField === item.field && sortDirection === item.dir
                                                ? 'text-white font-semibold bg-[#27272A]/50'
                                                : 'text-[#A1A1AA]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {sortField === item.field && sortDirection === item.dir && (
                                            <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Table Card ─── */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B]/40 text-[#71717A] text-[11px] font-semibold tracking-wider uppercase">
                                <th className="py-3 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginatedReceipts.length > 0 && selectedRows.length === paginatedReceipts.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#27272A] bg-[#121214] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                    />
                                </th>
                                {isColVisible('receiptNumber') && <th className="py-3 px-3">{t('procurement.receiptNumber', {}, 'Qəbul №')}</th>}
                                {isColVisible('waybillNumber') && <th className="py-3 px-3">{t('procurement.waybillNumber', {}, 'İrsaliyə / Qaimə №')}</th>}
                                {isColVisible('supplier') && <th className="py-3 px-3">{t('procurement.supplierName', {}, 'Təchizatçı')}</th>}
                                {isColVisible('warehouse') && <th className="py-3 px-3">{t('inventory.warehouseName', {}, 'Anbar')}</th>}
                                {isColVisible('receiptDate') && <th className="py-3 px-3">{t('procurement.receiptDate', {}, 'Qəbul Tarixi')}</th>}
                                {isColVisible('amount') && <th className="py-3 px-3 text-right">{t('common.grandTotal', {}, 'Yekun Dəyər')}</th>}
                                {isColVisible('status') && <th className="py-3 px-3 text-center">{t('common.status', {}, 'Status')}</th>}
                                <th className="py-3 px-3 text-right w-28">{t('common.actions', {}, 'Əməliyyatlar')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-[#71717A]">
                                        <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
                                        <span>{t('common.loading', {}, 'Malların qəbulu sənədləri yüklənir...')}</span>
                                    </td>
                                </tr>
                            ) : paginatedReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-[#71717A]">
                                        <InboxArrowDownIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm text-[#A1A1AA] font-medium">{t('common.noData', {}, 'Heç bir qəbul sənədi tapılmadı')}</p>
                                        <p className="text-[11px] mt-1">{t('common.searchPlaceholder', {}, 'Axtarış filtrini dəyişin və ya yeni qəbul yaradın.')}</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedReceipts.map((rcpt) => {
                                    const isSelected = selectedRows.includes(rcpt.id);
                                    const statusObj = getStatusInfo(rcpt.status);
                                    const isDraft = String(rcpt.status || '').toLowerCase().includes('draft') || rcpt.status === 1;

                                    return (
                                        <tr
                                            key={rcpt.id}
                                            className={`hover:bg-[#18181B]/60 transition-colors ${
                                                isSelected ? 'bg-[#18181B]/80' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectRow(rcpt.id)}
                                                    className="rounded border-[#27272A] bg-[#121214] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                                />
                                            </td>

                                            {/* Receipt Number */}
                                            {isColVisible('receiptNumber') && (
                                                <td className="py-3 px-3 font-mono font-medium text-white">
                                                    <Link
                                                        to={`/goods-receipts/${rcpt.id}`}
                                                        className="hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1.5"
                                                    >
                                                        <InboxArrowDownIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span>{rcpt.receiptNumber}</span>
                                                    </Link>
                                                </td>
                                            )}

                                            {/* Waybill Number */}
                                            {isColVisible('waybillNumber') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    {rcpt.waybillNumber ? (
                                                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300">
                                                            {rcpt.waybillNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#52525B] italic">—</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Supplier */}
                                            {isColVisible('supplier') && (
                                                <td className="py-3 px-3 text-[#E4E4E7]">
                                                    <span className="font-medium">{rcpt.supplierName || t('procurement.supplierName', {}, 'Təchizatçı')}</span>
                                                </td>
                                            )}

                                            {/* Warehouse */}
                                            {isColVisible('warehouse') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    <div className="flex items-center gap-1.5">
                                                        <BuildingOffice2Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span>{rcpt.warehouseName || t('inventory.warehouseName', {}, 'Əsas Anbar')}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Receipt Date */}
                                            {isColVisible('receiptDate') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span>{formatDate(rcpt.receiptDate)}</span>
                                                    </div>
                                                </td>
                                            )}


                                            {/* Amount / Total Value */}
                                            {isColVisible('amount') && (
                                                <td className="py-3 px-3 text-right font-medium text-white">
                                                    {(rcpt.totalValue || 0).toLocaleString('az-AZ', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}{' '}
                                                    <span className="text-[10px] text-[#71717A]">AZN</span>
                                                </td>
                                            )}

                                            {/* Status Badge */}
                                            {isColVisible('status') && (
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusObj.bg} ${statusObj.border} ${statusObj.text}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                                                        {statusObj.label}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handlePostReceipt(rcpt.id, rcpt.receiptNumber)}
                                                            disabled={actionLoadingId === rcpt.id}
                                                            className="px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-300 hover:text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                                            title={t('procurement.postGrn', {}, 'Sənədi İcra Et (Post)')}
                                                        >
                                                            {actionLoadingId === rcpt.id ? (
                                                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                t('common.confirm', {}, 'İcra Et')
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/goods-receipts/${rcpt.id}`}
                                                        className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors"
                                                        title={t('common.details', {}, 'Detallara bax')}
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
                        {filteredReceipts.length === 0
                            ? '0 / 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredReceipts.length
                              )} ${t('common.of', {}, '/')} ${filteredReceipts.length}`}
                    </span>
                </div>
            </div>

            {/* ─── Soft CRM Create Modal ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-[#27272A] flex items-center justify-between bg-[#121214]/60">
                            <div>
                                <h2 className="text-base font-semibold text-white">{t('procurement.newGrn', {}, 'Yeni Malların Qəbulu (Mədaxil)')}</h2>
                                <p className="text-xs text-[#71717A]">{t('procurement.grnSubtitle', {}, 'Anbara daxil olan malları qeydiyyata alın və irsaliyə yaradın')}</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl bg-[#27272A]/50 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateReceipt} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                            {createError && (
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                    <span>{createError}</span>
                                </div>
                            )}

                            {/* Section 1: General Info (2 columns clean layout) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Təchizatçı (CustomSelect) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('procurement.supplierName', {}, 'Təchizatçı')} <span className="text-rose-400">*</span>
                                    </label>
                                    <CustomSelect
                                        options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                        value={modalSupplierId}
                                        onChange={(val) => setModalSupplierId(val)}
                                        placeholder={t('common.select', {}, 'Təchizatçı seçin...')}
                                    />
                                </div>

                                {/* Anbar (CustomSelect) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('procurement.warehouse', {}, 'Mədaxil Anbarı')} <span className="text-rose-400">*</span>
                                    </label>
                                    <CustomSelect
                                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                                        value={modalWarehouseId}
                                        onChange={(val) => setModalWarehouseId(val)}
                                        placeholder={t('common.select', {}, 'Anbar seçin...')}
                                    />
                                </div>

                                {/* Sifariş Əlaqəsi (CustomSelect, opsional) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('procurement.poTitle', {}, 'Əlaqəli Sifariş (PO)')}
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: t('common.none', {}, 'Sərbəst Mədaxil (Sifarişsiz)') },
                                            ...orders.map((o) => ({
                                                value: o.id,
                                                label: `${o.orderNumber} - ${o.supplierName || t('procurement.supplierName', {}, 'Təchizatçı')}`,
                                            })),
                                        ]}
                                        value={modalPurchaseOrderId}
                                        onChange={handlePoSelection}
                                        placeholder={t('common.select', {}, 'Sifariş seçin...')}
                                    />
                                </div>

                                {/* Qaimə / İrsaliyə № */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('procurement.waybillNumber', {}, 'İrsaliyə / Faktura №')}
                                    </label>
                                    <input
                                        type="text"
                                        value={modalWaybillNumber}
                                        onChange={(e) => setModalWaybillNumber(e.target.value)}
                                        placeholder="Məs: IRS-2024-001"
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>

                                {/* Qəbul Tarixi */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('procurement.receiptDate', {}, 'Qəbul Tarixi')} <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={modalReceiptDate}
                                        onChange={(e) => setModalReceiptDate(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        required
                                    />
                                </div>

                                {/* İcra (Posting) Tarixi */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        {t('accounting.postingDate', {}, 'Uçot (Posting) Tarixi')}
                                    </label>
                                    <input
                                        type="date"
                                        value={modalPostingDate}
                                        onChange={(e) => setModalPostingDate(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Line Items */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                                        {t('accounting.lines', {}, 'Mədaxil Sətirləri')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-medium transition-colors"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>{t('accounting.addLine', {}, 'Sətir Əlavə Et')}</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {modalLines.map((line, idx) => {
                                        const lineTotal = (Number(line.quantityReceived) || 0) * (Number(line.unitCost) || 0);

                                        return (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-2xl bg-[#121214] border border-[#27272A] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                                            >
                                                {/* Məhsul Seçimi (CustomSelect) */}
                                                <div className="sm:col-span-5 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">
                                                        {t('customers.item', {}, 'Məhsul / Xidmət')} <span className="text-rose-400">*</span>
                                                    </label>
                                                    <CustomSelect
                                                        options={items.map((i) => ({
                                                            value: i.id,
                                                            label: `${i.name} ${i.code ? `(${i.code})` : ''}`,
                                                        }))}
                                                        value={line.itemId}
                                                        onChange={(val) => handleLineItemSelect(idx, val)}
                                                        placeholder={t('common.select', {}, 'Məhsul seçin...')}
                                                    />
                                                </div>

                                                {/* Say (Miqdar) */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">{t('procurement.receivedQty', {}, 'Qəbul Sayı')}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={line.quantityReceived}
                                                        onChange={(e) =>
                                                            handleLineChange(idx, 'quantityReceived', parseFloat(e.target.value) || 0)
                                                        }
                                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                                    />
                                                </div>

                                                {/* Vahid Maya Dəyəri */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">{t('common.unitCost', {}, 'Vahid Maya')} (AZN)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={line.unitCost}
                                                        onChange={(e) =>
                                                            handleLineChange(idx, 'unitCost', parseFloat(e.target.value) || 0)
                                                        }
                                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                                    />
                                                </div>

                                                {/* Sətir Cəmi */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">{t('common.total', {}, 'Cəmi')}</label>
                                                    <div className="py-1.5 text-xs font-semibold text-white">
                                                        {lineTotal.toFixed(2)} <span className="text-[10px] text-[#71717A]">AZN</span>
                                                    </div>
                                                </div>

                                                {/* Sil */}
                                                <div className="sm:col-span-1 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLine(idx)}
                                                        disabled={modalLines.length <= 1}
                                                        className="p-1.5 rounded-xl text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                                                        title={t('common.delete', {}, 'Sətiri sil')}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 3: Notes & Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">{t('common.notes', {}, 'Qeydlər və Əlavə Məlumat')}</label>
                                    <textarea
                                        rows={3}
                                        value={modalNotes}
                                        onChange={(e) => setModalNotes(e.target.value)}
                                        placeholder={t('common.notes', {}, 'Qəbul aktı və ya təhvil-təslim qeydləri...')}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl p-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>

                                {/* Summary Box */}
                                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between space-y-2">
                                    <span className="text-xs font-semibold text-white uppercase tracking-wide">{t('common.details', {}, 'Mədaxil Xülasəsi')}</span>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-[#A1A1AA]">
                                            <span>{t('common.linesCount', {}, 'Məhsul növü sayı:')}</span>
                                            <span className="text-white font-medium">{modalLines.length}</span>
                                        </div>
                                        <div className="flex justify-between text-[#A1A1AA]">
                                            <span>{t('common.itemsCount', {}, 'Toplam ədəd sayı:')}</span>
                                            <span className="text-white font-medium">{modalCalculations.totalItemsCount}</span>
                                        </div>
                                        <div className="pt-2 border-t border-[#27272A] flex justify-between text-sm font-semibold text-white">
                                            <span>{t('common.grandTotal', {}, 'Yekun Məbləğ:')}</span>
                                            <span className="text-white font-bold">
                                                {modalCalculations.totalValue.toFixed(2)} AZN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-xs font-medium transition-colors"
                                >
                                    {t('common.cancel', {}, 'Ləğv Et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {createLoading && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{t('common.create', {}, 'Yarat')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoodsReceiptsPage;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { procurementService, customersService, accountsService } from '../../api';
import { formatDate } from '../../utils';
import type {
    SupplierInvoiceDto,
    SupplierDto,
    ItemDto,
    PurchaseOrderDto,
    GoodsReceiptDto,
    CreateSupplierInvoiceRequest,
} from '../../dto';
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
    TrashIcon,
    DocumentTextIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

interface InvoiceLineState {
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export const SupplierInvoicesPage: React.FC = () => {
    const navigate = useNavigate();

    // Data states
    const [invoices, setInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [receipts, setReceipts] = useState<GoodsReceiptDto[]>([]);
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
    const [filterMatchStatus, setFilterMatchStatus] = useState<string>('ALL');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Popover toggles
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'invoiceNumber' | 'supplier' | 'date' | 'amount' | 'outstanding'>('date');
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
        { key: 'invoiceNumber', label: 'Faktura №', visible: true },
        { key: 'supplierInvoiceNumber', label: 'Təchizatçı Faktura №', visible: true },
        { key: 'supplier', label: 'Təchizatçı', visible: true },
        { key: 'invoiceDate', label: 'Faktura Tarixi', visible: true },
        { key: 'dueDate', label: 'Son Ödəniş', visible: true },
        { key: 'amount', label: 'Yekun Məbləğ', visible: true },
        { key: 'outstanding', label: 'Qalıq Borc', visible: true },
        { key: 'matchStatus', label: '3-Way Match', visible: true },
        { key: 'status', label: 'Status', visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalSupplierId, setModalSupplierId] = useState('');
    const [modalSupplierInvoiceNumber, setModalSupplierInvoiceNumber] = useState('');
    const [modalPurchaseOrderId, setModalPurchaseOrderId] = useState('');
    const [modalGoodsReceiptId, setModalGoodsReceiptId] = useState('');
    const [modalInvoiceDate, setModalInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalDueDate, setModalDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [modalPostingDate, setModalPostingDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalCurrency, setModalCurrency] = useState('AZN');
    const [modalNotes, setModalNotes] = useState('');
    const [modalLines, setModalLines] = useState<InvoiceLineState[]>([
        { itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 18 },
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
        return err.message || 'Xəta baş verdi';
    };

    // Fetch initial data
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [invData, suppData, itemData, poData, rcptData] = await Promise.all([
                procurementService.getSupplierInvoices(),
                procurementService.getSuppliers(),
                customersService.getItems(),
                procurementService.getPurchaseOrders().catch(() => []),
                procurementService.getGoodsReceipts().catch(() => []),
            ]);

            setInvoices(invData);
            setSuppliers(suppData);
            setItems(itemData);
            setOrders(poData);
            setReceipts(rcptData);
        } catch (err) {
            console.error('Error loading supplier invoices data:', err);
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
        setTimeout(() => setToastMessage(''), 4500);
    };

    // PO Selection Handler in Create Modal
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
                        quantity: l.quantity || 1,
                        unitPrice: l.unitPrice || 0,
                        taxRate: l.taxRate ?? 18,
                    }))
                );
            }
        }
    };

    // GRN Selection Handler in Create Modal
    const handleGrnSelection = (grnId: string) => {
        setModalGoodsReceiptId(grnId);
        if (!grnId) return;

        const grn = receipts.find((g) => g.id === grnId);
        if (grn) {
            if (grn.supplierId) setModalSupplierId(grn.supplierId);
            if (grn.purchaseOrderId) setModalPurchaseOrderId(grn.purchaseOrderId);
            if (grn.waybillNumber && !modalSupplierInvoiceNumber) {
                setModalSupplierInvoiceNumber(grn.waybillNumber);
            }
            if (grn.lines && grn.lines.length > 0) {
                setModalLines(
                    grn.lines.map((l) => ({
                        itemId: l.itemId || '',
                        description: l.description || '',
                        quantity: l.receivedQuantity ?? l.quantityReceived ?? 1,
                        unitCost: l.unitCost || 0,
                        unitPrice: l.unitCost || 0,
                        taxRate: 18,
                    }))
                );
            }
        }
    };

    // Line handlers
    const handleAddLine = () => {
        setModalLines([...modalLines, { itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 18 }]);
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
            unitPrice: found?.costPrice || found?.unitPrice || 0,
        };
        setModalLines(next);
    };

    const handleLineChange = (idx: number, field: keyof InvoiceLineState, val: any) => {
        const next = [...modalLines];
        next[idx] = { ...next[idx], [field]: val };
        setModalLines(next);
    };

    // Calculations for Modal
    const modalCalculations = useMemo(() => {
        const subTotal = modalLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
        const taxTotal = subTotal * 0.18;
        const grandTotal = subTotal + taxTotal;
        return { subTotal, taxTotal, grandTotal };
    }, [modalLines]);

    // Handle Create Invoice Submit
    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalSupplierId) {
            setCreateError('Zəhmət olmasa təchizatçı seçin.');
            return;
        }

        const validLines = modalLines.filter((l) => l.itemId || l.description.trim());
        if (validLines.length === 0) {
            setCreateError('Ən azı 1 sətir doldurulmalıdır.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const supplierObj = suppliers.find((s) => s.id === modalSupplierId);

            const payload: CreateSupplierInvoiceRequest = {
                supplierId: modalSupplierId,
                supplierInvoiceNumber: modalSupplierInvoiceNumber.trim(),
                supplierInvoiceReference: modalSupplierInvoiceNumber.trim(),
                purchaseOrderId: modalPurchaseOrderId || undefined,
                goodsReceiptId: modalGoodsReceiptId || undefined,
                issueDate: modalInvoiceDate,
                invoiceDate: modalInvoiceDate,
                dueDate: modalDueDate,
                postingDate: modalPostingDate,
                currency: modalCurrency,
                exchangeRate: 1.0,
                isGRNIBased: Boolean(modalGoodsReceiptId),
                notes: modalNotes,
                lines: validLines.map((l) => ({
                    itemId: l.itemId || undefined,
                    description: l.description || 'Alış sətri',
                    quantity: Number(l.quantity) || 1,
                    unitPrice: Number(l.unitPrice) || 0,
                    taxRate: Number(l.taxRate) || 18,
                })),
            };

            const created = await procurementService.createSupplierInvoice({
                ...payload,
                supplierName: supplierObj?.name,
            });

            setShowCreateModal(false);
            showToast(`Alış qaiməsi (${created.invoiceNumber || 'Yeni'}) uğurla yaradıldı!`);
            resetCreateForm();
            await loadData(true);
        } catch (err: any) {
            console.error('Error creating supplier invoice:', err);
            const msg = extractErrorMessage(err);
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    const resetCreateForm = () => {
        setModalSupplierId('');
        setModalSupplierInvoiceNumber('');
        setModalPurchaseOrderId('');
        setModalGoodsReceiptId('');
        setModalInvoiceDate(new Date().toISOString().split('T')[0]);
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setModalDueDate(d.toISOString().split('T')[0]);
        setModalPostingDate(new Date().toISOString().split('T')[0]);
        setModalCurrency('AZN');
        setModalNotes('');
        setModalLines([{ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 18 }]);
        setCreateError('');
    };

    // Post Supplier Invoice (İcra et)
    const handlePostInvoice = async (invoiceId: string, invoiceNumber: string) => {
        setActionLoadingId(invoiceId);
        try {
            await procurementService.postSupplierInvoice(invoiceId);
            showToast(`${invoiceNumber} qaiməsi uğurla icra edildi və uçota alındı!`);
            await loadData(true);
        } catch (err: any) {
            console.error('Error posting supplier invoice:', err);
            const msg = extractErrorMessage(err);
            showToast(msg, 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Status helpers
    const getStatusInfo = (status: any, docStatus: any, setStatus: any) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('paid') && !s.includes('part')) {
            return {
                label: 'Ödənilib',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                dot: 'bg-emerald-400',
            };
        }
        if (s.includes('part') || setStatus === 2) {
            return {
                label: 'Qismən Ödənilib',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
                dot: 'bg-amber-400',
            };
        }
        if (s.includes('post') || s.includes('appr') || docStatus === 4) {
            return {
                label: 'Təsdiqlənib',
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/20',
                text: 'text-cyan-400',
                dot: 'bg-cyan-400',
            };
        }
        if (s.includes('canc') || docStatus === 5) {
            return {
                label: 'Ləğv Edilib',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                dot: 'bg-rose-400',
            };
        }
        return {
            label: 'Qaralama',
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
            dot: 'bg-neutral-400',
        };
    };

    const getMatchStatusInfo = (matchStatus: any) => {
        const s = String(matchStatus || '').toLowerCase();
        if (s.includes('match') && !s.includes('not') && !s.includes('discr')) {
            return {
                label: 'Uyğundur',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
            };
        }
        if (s.includes('tol') || matchStatus === 3) {
            return {
                label: 'Tolerans Daxilində',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
            };
        }
        if (s.includes('hold') || matchStatus === 4) {
            return {
                label: 'Tolerans Aşıldı',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
            };
        }
        return {
            label: 'Gözləmədə',
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
        };
    };

    // Filter, Search, and Sort Logic
    const filteredInvoices = useMemo(() => {
        let list = [...invoices];

        // 1. Text Search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (i) =>
                    i.invoiceNumber.toLowerCase().includes(q) ||
                    (i.supplierInvoiceNumber && i.supplierInvoiceNumber.toLowerCase().includes(q)) ||
                    (i.supplierName && i.supplierName.toLowerCase().includes(q))
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'ALL') {
            list = list.filter((i) => {
                const s = String(i.status || '').toLowerCase();
                if (statusFilter === 'Draft') return s.includes('draft');
                if (statusFilter === 'Approved') return s.includes('appr') || s.includes('post');
                if (statusFilter === 'Paid') return s.includes('paid') && !s.includes('part');
                if (statusFilter === 'PartiallyPaid') return s.includes('part');
                if (statusFilter === 'Cancelled') return s.includes('canc');
                return true;
            });
        }

        // 3. Supplier Filter
        if (filterSupplierId !== 'ALL') {
            list = list.filter((i) => i.supplierId === filterSupplierId);
        }

        // 4. 3-Way Match Filter
        if (filterMatchStatus !== 'ALL') {
            list = list.filter((i) => {
                const s = String(i.threeWayMatchStatus || '').toLowerCase();
                if (filterMatchStatus === 'Matched') return s.includes('matched');
                if (filterMatchStatus === 'Tolerance') return s.includes('tolerance') || s.includes('discr');
                if (filterMatchStatus === 'Hold') return s.includes('hold');
                return true;
            });
        }

        // 5. Amount Range
        if (filterMinAmount) {
            const min = parseFloat(filterMinAmount);
            if (!isNaN(min)) list = list.filter((i) => (i.grandTotal || i.totalAmount || 0) >= min);
        }
        if (filterMaxAmount) {
            const max = parseFloat(filterMaxAmount);
            if (!isNaN(max)) list = list.filter((i) => (i.grandTotal || i.totalAmount || 0) <= max);
        }

        // 6. Date Range
        if (filterStartDate) {
            list = list.filter((i) => new Date(i.issueDate || i.invoiceDate || 0) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            list = list.filter((i) => new Date(i.issueDate || i.invoiceDate || 0) <= new Date(filterEndDate + 'T23:59:59'));
        }

        // 7. Sorting
        list.sort((a, b) => {
            let res = 0;
            if (sortField === 'invoiceNumber') {
                res = a.invoiceNumber.localeCompare(b.invoiceNumber);
            } else if (sortField === 'supplier') {
                res = (a.supplierName || '').localeCompare(b.supplierName || '');
            } else if (sortField === 'amount') {
                res = (a.grandTotal || a.totalAmount || 0) - (b.grandTotal || b.totalAmount || 0);
            } else if (sortField === 'outstanding') {
                res = (a.outstandingAmount || a.remainingAmount || 0) - (b.outstandingAmount || b.remainingAmount || 0);
            } else {
                res = new Date(a.issueDate || a.invoiceDate || 0).getTime() - new Date(b.issueDate || b.invoiceDate || 0).getTime();
            }
            return sortDirection === 'asc' ? res : -res;
        });

        return list;
    }, [
        invoices,
        searchTerm,
        statusFilter,
        filterSupplierId,
        filterMatchStatus,
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
        if (filterMatchStatus !== 'ALL') count++;
        if (filterMinAmount || filterMaxAmount) count++;
        if (filterStartDate || filterEndDate) count++;
        return count;
    }, [filterSupplierId, filterMatchStatus, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate]);

    const resetFilters = () => {
        setFilterSupplierId('ALL');
        setFilterMatchStatus('ALL');
        setFilterMinAmount('');
        setFilterMaxAmount('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // Pagination
    const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
    const paginatedInvoices = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredInvoices.slice(start, start + pageSize);
    }, [filteredInvoices, currentPage, pageSize]);

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedInvoices.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedInvoices.map((i) => i.id));
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
                        <span>Təchizat</span>
                        <span>/</span>
                        <span className="text-[#E4E4E7] font-medium">Alış Qaimələri</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <h1 className="text-xl font-semibold text-white tracking-tight">Alış Qaimələri (Fakturalar)</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[#1C1C1E] border border-[#27272A] text-[#A1A1AA] font-mono">
                            {filteredInvoices.length}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors disabled:opacity-50"
                        title="Yenilə"
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
                        <span>Faktura Yarat</span>
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
                            placeholder="Faktura №, təchizatçı və ya qaimə axtar..."
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
                                    ? 'Bütün Statuslar'
                                    : statusFilter === 'Draft'
                                    ? 'Qaralama'
                                    : statusFilter === 'Approved'
                                    ? 'Təsdiqlənib'
                                    : statusFilter === 'Paid'
                                    ? 'Ödənilib'
                                    : statusFilter === 'PartiallyPaid'
                                    ? 'Qismən Ödənilib'
                                    : 'Ləğv Edilib'}
                            </span>
                            <span className="text-[#71717A] text-[10px]">▼</span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                {[
                                    { key: 'ALL', label: 'Bütün Statuslar' },
                                    { key: 'Draft', label: 'Qaralama' },
                                    { key: 'Approved', label: 'Təsdiqlənib' },
                                    { key: 'Paid', label: 'Ödənilib' },
                                    { key: 'PartiallyPaid', label: 'Qismən Ödənilib' },
                                    { key: 'Cancelled', label: 'Ləğv Edilib' },
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
                            <span>Filtr</span>
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
                                    <span className="text-xs font-semibold text-white">Filter parametrləri</span>
                                    {activeFiltersCount > 0 && (
                                        <button onClick={resetFilters} className="text-[10px] text-emerald-400 hover:underline">
                                            Sıfırla
                                        </button>
                                    )}
                                </div>

                                {/* Supplier filter */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">Təchizatçı</label>
                                    <select
                                        value={filterSupplierId}
                                        onChange={(e) => setFilterSupplierId(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    >
                                        <option value="ALL">Bütün Təchizatçılar</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3-Way Match filter */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">3-Way Match</label>
                                    <select
                                        value={filterMatchStatus}
                                        onChange={(e) => setFilterMatchStatus(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    >
                                        <option value="ALL">Hamısı</option>
                                        <option value="Matched">Uyğundur (Matched)</option>
                                        <option value="Tolerance">Tolerans Daxilində</option>
                                        <option value="Hold">Tolerans Aşıldı (On Hold)</option>
                                    </select>
                                </div>

                                {/* Amount range */}
                                <div>
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">Məbləğ aralığı (AZN)</label>
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
                                    <label className="block text-[11px] text-[#A1A1AA] mb-1 font-medium">Faktura Tarixi</label>
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
                            <span>Sütunlar</span>
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-2 px-3 z-30 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                                <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                                    Görünən Sütunlar
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
                            <span>Sıralama</span>
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                {[
                                    { field: 'date' as const, dir: 'desc' as const, label: 'Tarix: Yeni - Köhnə' },
                                    { field: 'date' as const, dir: 'asc' as const, label: 'Tarix: Köhnə - Yeni' },
                                    { field: 'invoiceNumber' as const, dir: 'asc' as const, label: 'Faktura №: A - Z' },
                                    { field: 'amount' as const, dir: 'desc' as const, label: 'Məbləğ: Çox - Az' },
                                    { field: 'outstanding' as const, dir: 'desc' as const, label: 'Qalıq Borc: Çox - Az' },
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
                                        checked={paginatedInvoices.length > 0 && selectedRows.length === paginatedInvoices.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#27272A] bg-[#121214] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                    />
                                </th>
                                {isColVisible('invoiceNumber') && <th className="py-3 px-3">Faktura №</th>}
                                {isColVisible('supplierInvoiceNumber') && <th className="py-3 px-3">Təchizatçı Faktura №</th>}
                                {isColVisible('supplier') && <th className="py-3 px-3">Təchizatçı</th>}
                                {isColVisible('invoiceDate') && <th className="py-3 px-3">Faktura Tarixi</th>}
                                {isColVisible('dueDate') && <th className="py-3 px-3">Son Ödəniş</th>}
                                {isColVisible('amount') && <th className="py-3 px-3 text-right">Yekun Məbləğ</th>}
                                {isColVisible('outstanding') && <th className="py-3 px-3 text-right">Qalıq Borc</th>}
                                {isColVisible('matchStatus') && <th className="py-3 px-3 text-center">3-Way Match</th>}
                                {isColVisible('status') && <th className="py-3 px-3 text-center">Status</th>}
                                <th className="py-3 px-3 text-right w-28">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-[#71717A]">
                                        <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
                                        <span>Alış qaimələri yüklənir...</span>
                                    </td>
                                </tr>
                            ) : paginatedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-[#71717A]">
                                        <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm text-[#A1A1AA] font-medium">Heç bir alış qaiməsi tapılmadı</p>
                                        <p className="text-[11px] mt-1">Axtarış filtrini dəyişin və ya yeni faktura yaradın.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedInvoices.map((inv) => {
                                    const isSelected = selectedRows.includes(inv.id);
                                    const statusObj = getStatusInfo(inv.status, inv.documentStatus, inv.settlementStatus);
                                    const matchObj = getMatchStatusInfo(inv.threeWayMatchStatus);
                                    const isDraft = String(inv.status || '').toLowerCase().includes('draft') || inv.documentStatus === 1;

                                    return (
                                        <tr
                                            key={inv.id}
                                            className={`hover:bg-[#18181B]/60 transition-colors ${
                                                isSelected ? 'bg-[#18181B]/80' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectRow(inv.id)}
                                                    className="rounded border-[#27272A] bg-[#121214] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                                />
                                            </td>

                                            {/* Invoice Number */}
                                            {isColVisible('invoiceNumber') && (
                                                <td className="py-3 px-3 font-mono font-medium text-white">
                                                    <Link
                                                        to={`/supplier-invoices/${inv.id}`}
                                                        className="hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1.5"
                                                    >
                                                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span>{inv.invoiceNumber}</span>
                                                    </Link>
                                                </td>
                                            )}

                                            {/* Supplier Invoice Number */}
                                            {isColVisible('supplierInvoiceNumber') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    {inv.supplierInvoiceNumber ? (
                                                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300">
                                                            {inv.supplierInvoiceNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#52525B] italic">—</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Supplier */}
                                            {isColVisible('supplier') && (
                                                <td className="py-3 px-3 text-[#E4E4E7]">
                                                    <span className="font-medium">{inv.supplierName || 'Təchizatçı'}</span>
                                                </td>
                                            )}

                                            {/* Invoice Date */}
                                            {isColVisible('invoiceDate') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span>{formatDate(inv.issueDate || inv.invoiceDate)}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Due Date */}
                                            {isColVisible('dueDate') && (
                                                <td className="py-3 px-3 text-[#A1A1AA]">
                                                    <span>{formatDate(inv.dueDate, '—')}</span>
                                                </td>
                                            )}


                                            {/* Grand Total */}
                                            {isColVisible('amount') && (
                                                <td className="py-3 px-3 text-right font-medium text-white">
                                                    {(inv.grandTotal || inv.totalAmount || 0).toLocaleString('az-AZ', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}{' '}
                                                    <span className="text-[10px] text-[#71717A]">AZN</span>
                                                </td>
                                            )}

                                            {/* Outstanding Amount */}
                                            {isColVisible('outstanding') && (
                                                <td className="py-3 px-3 text-right font-medium">
                                                    {(inv.outstandingAmount ?? inv.remainingAmount ?? 0) > 0 ? (
                                                        <span className="text-amber-400">
                                                            {(inv.outstandingAmount ?? inv.remainingAmount ?? 0).toLocaleString('az-AZ', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}{' '}
                                                            <span className="text-[10px] text-[#71717A]">AZN</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-400 font-normal">0.00 AZN</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* 3-Way Match Badge */}
                                            {isColVisible('matchStatus') && (
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${matchObj.bg} ${matchObj.border} ${matchObj.text}`}
                                                    >
                                                        {matchObj.label}
                                                    </span>
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
                                                            onClick={() => handlePostInvoice(inv.id, inv.invoiceNumber)}
                                                            disabled={actionLoadingId === inv.id}
                                                            className="px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-300 hover:text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                                            title="Qaiməni İcra Et (Post)"
                                                        >
                                                            {actionLoadingId === inv.id ? (
                                                                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                'İcra Et'
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/supplier-invoices/${inv.id}`}
                                                        className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors"
                                                        title="Detallara bax"
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
                        {filteredInvoices.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                  currentPage * pageSize,
                                  filteredInvoices.length
                              )} of ${filteredInvoices.length}`}
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
                                <h2 className="text-base font-semibold text-white">Yeni Alış Qaiməsi (Faktura)</h2>
                                <p className="text-xs text-[#71717A]">Təchizatçı fakturasını qeydiyyata alın və 3-Way Match aparın</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl bg-[#27272A]/50 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                            {createError && (
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                    <span>{createError}</span>
                                </div>
                            )}

                            {/* Section 1: Metadata (Clean 2 Columns) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Təchizatçı (CustomSelect) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Təchizatçı <span className="text-rose-400">*</span>
                                    </label>
                                    <CustomSelect
                                        options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                        value={modalSupplierId}
                                        onChange={(val) => setModalSupplierId(val)}
                                        placeholder="Təchizatçı seçin..."
                                    />
                                </div>

                                {/* Təchizatçı Faktura № */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Təchizatçı Faktura №
                                    </label>
                                    <input
                                        type="text"
                                        value={modalSupplierInvoiceNumber}
                                        onChange={(e) => setModalSupplierInvoiceNumber(e.target.value)}
                                        placeholder="Məs: INV-2024-998"
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>

                                {/* Əlaqəli Sifariş (PO) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Əlaqəli Sifariş (PO)
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Sərbəst Qaimə (Sifarişsiz)' },
                                            ...orders.map((o) => ({
                                                value: o.id,
                                                label: `${o.orderNumber} - ${o.supplierName || 'Təchizatçı'}`,
                                            })),
                                        ]}
                                        value={modalPurchaseOrderId}
                                        onChange={handlePoSelection}
                                        placeholder="Sifariş seçin..."
                                    />
                                </div>

                                {/* Əlaqəli Mədaxil (GRN) */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Əlaqəli Qəbul Sənədi (GRN)
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'Sərbəst Qaimə (İrsaliyəsiz)' },
                                            ...receipts.map((g) => ({
                                                value: g.id,
                                                label: `${g.receiptNumber} - ${g.supplierName || 'Təchizatçı'}`,
                                            })),
                                        ]}
                                        value={modalGoodsReceiptId}
                                        onChange={handleGrnSelection}
                                        placeholder="Qəbul sənədi seçin..."
                                    />
                                </div>

                                {/* Faktura Tarixi */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Faktura Tarixi <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={modalInvoiceDate}
                                        onChange={(e) => setModalInvoiceDate(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                        required
                                    />
                                </div>

                                {/* Son Ödəniş Tarixi */}
                                <div className="min-w-0">
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">
                                        Son Ödəniş Tarixi
                                    </label>
                                    <input
                                        type="date"
                                        value={modalDueDate}
                                        onChange={(e) => setModalDueDate(e.target.value)}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Line Items */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                                    <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                                        Faktura Sətirləri
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-medium transition-colors"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {modalLines.map((line, idx) => {
                                        const lineSub = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
                                        const lineTotal = lineSub * (1 + (Number(line.taxRate) || 18) / 100);

                                        return (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-2xl bg-[#121214] border border-[#27272A] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                                            >
                                                {/* Məhsul Seçimi (CustomSelect) */}
                                                <div className="sm:col-span-5 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">
                                                        Məhsul / Xidmət <span className="text-rose-400">*</span>
                                                    </label>
                                                    <CustomSelect
                                                        options={items.map((i) => ({
                                                            value: i.id,
                                                            label: `${i.name} ${i.code ? `(${i.code})` : ''}`,
                                                        }))}
                                                        value={line.itemId}
                                                        onChange={(val) => handleLineItemSelect(idx, val)}
                                                        placeholder="Məhsul seçin..."
                                                    />
                                                </div>

                                                {/* Say (Miqdar) */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">Say</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={line.quantity}
                                                        onChange={(e) =>
                                                            handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                                                        }
                                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                                    />
                                                </div>

                                                {/* Vahid Qiymət */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">Vahid Qiymət (AZN)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={line.unitPrice}
                                                        onChange={(e) =>
                                                            handleLineChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                                                        }
                                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3F3F46]"
                                                    />
                                                </div>

                                                {/* Sətir Cəmi */}
                                                <div className="sm:col-span-2 min-w-0">
                                                    <label className="block text-[11px] text-[#A1A1AA] mb-1">Cəmi (+ƏDV)</label>
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
                                                        title="Sətiri sil"
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
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">Qeydlər və Şərtlər</label>
                                    <textarea
                                        rows={3}
                                        value={modalNotes}
                                        onChange={(e) => setModalNotes(e.target.value)}
                                        placeholder="Faktura qeydləri və ödəniş şərtləri..."
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl p-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>

                                {/* Summary Box */}
                                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between space-y-2">
                                    <span className="text-xs font-semibold text-white uppercase tracking-wide">Faktura Xülasəsi</span>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between text-[#A1A1AA]">
                                            <span>Xalis Məbləğ:</span>
                                            <span className="text-white font-medium">{modalCalculations.subTotal.toFixed(2)} AZN</span>
                                        </div>
                                        <div className="flex justify-between text-[#A1A1AA]">
                                            <span>ƏDV (18%):</span>
                                            <span className="text-white font-medium">{modalCalculations.taxTotal.toFixed(2)} AZN</span>
                                        </div>
                                        <div className="pt-2 border-t border-[#27272A] flex justify-between text-sm font-semibold text-white">
                                            <span>Yekun Faktura Məbləği:</span>
                                            <span className="text-white font-bold">
                                                {modalCalculations.grandTotal.toFixed(2)} AZN
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
                                    Ləğv Et
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {createLoading && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Yarat</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierInvoicesPage;

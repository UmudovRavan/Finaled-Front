import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { inventoryService, customersService } from '../../api';
import type {
    StockLedgerEntryDto,
    WarehouseDto,
    ItemDto,
    StockTransactionDto,
    CreateStockTransactionRequest,
    StockTransactionType,
} from '../../dto';
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
    ArchiveBoxIcon,
    BuildingStorefrontIcon,
    CalendarIcon,
    DocumentTextIcon,
    CubeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
}

interface TxLineState {
    itemId: string;
    quantity: number;
    unitCost: number;
    description: string;
}

export const StockLedgerPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Tabs
    const [activeTab, setActiveTab] = useState<'transactions' | 'ledger'>('transactions');

    // Data states
    const [entries, setEntries] = useState<StockLedgerEntryDto[]>([]);
    const [transactions, setTransactions] = useState<StockTransactionDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Selection & Pagination
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [filterWarehouseId, setFilterWarehouseId] = useState<string>('ALL');
    const [filterItemId, setFilterItemId] = useState<string>('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Popover toggles
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortField, setSortField] = useState<'date' | 'item' | 'warehouse' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Columns config for Transactions tab
    const [txColumns, setTxColumns] = useState<ColumnConfig[]>([
        { key: 'date', label: t('common.date', {}, 'Tarix'), visible: true },
        { key: 'number', label: t('inventory.transactionNumber', {}, 'Əməliyyat №'), visible: true },
        { key: 'type', label: t('inventory.transactionType', {}, 'Növ'), visible: true },
        { key: 'sourceWarehouse', label: t('inventory.sourceWarehouse', {}, 'Mənbə Anbar'), visible: true },
        { key: 'targetWarehouse', label: t('inventory.targetWarehouse', {}, 'Hədəf Anbar'), visible: true },
        { key: 'linesCount', label: t('common.itemsCount', {}, 'Sətir Sayı'), visible: true },
        { key: 'totalValue', label: t('inventory.stockValue', {}, 'Toplam Dəyər'), visible: true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: true },
    ]);

    // Columns config for Ledger tab
    const [ledgerColumns, setLedgerColumns] = useState<ColumnConfig[]>([
        { key: 'date', label: t('common.date', {}, 'Tarix'), visible: true },
        { key: 'reference', label: t('accounting.referenceNumber', {}, 'Sənəd / Qaimə №'), visible: true },
        { key: 'type', label: t('inventory.transactionType', {}, 'Növ'), visible: true },
        { key: 'item', label: t('inventory.stockLedgerTitle', {}, 'Məhsul'), visible: true },
        { key: 'warehouse', label: t('procurement.warehouse', {}, 'Anbar'), visible: true },
        { key: 'qtyIn', label: t('inventory.typeReceipt', {}, 'Giriş (+)'), visible: true },
        { key: 'qtyOut', label: t('inventory.typeIssue', {}, 'Çıxış (-)'), visible: true },
        { key: 'unitCost', label: t('customers.averageCost', {}, 'Maya Dəyəri'), visible: true },
        { key: 'balanceQty', label: t('customers.currentStockQty', {}, 'Son Qalıq'), visible: true },
        { key: 'balanceValue', label: t('inventory.stockValue', {}, 'Balans Dəyəri'), visible: true },
    ]);

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalTxType, setModalTxType] = useState<StockTransactionType>('Receipt');
    const [modalSourceWarehouseId, setModalSourceWarehouseId] = useState('');
    const [modalTargetWarehouseId, setModalTargetWarehouseId] = useState('');
    const [modalTxDate, setModalTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalPostingDate, setModalPostingDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalReferenceNumber, setModalReferenceNumber] = useState('');
    const [modalNotes, setModalNotes] = useState('');
    const [modalAutoPost, setModalAutoPost] = useState(true);
    const [modalLines, setModalLines] = useState<TxLineState[]>([
        { itemId: '', quantity: 1, unitCost: 0, description: '' },
    ]);
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
        return err.message || 'Xəta baş verdi';
    };

    // Load Data
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [ledgerData, txData, whData, itemsData] = await Promise.allSettled([
                inventoryService.getStockLedger(),
                inventoryService.getStockTransactions(),
                inventoryService.getWarehouses(),
                customersService.getItems(),
            ]);

            if (ledgerData.status === 'fulfilled' && Array.isArray(ledgerData.value)) {
                setEntries(ledgerData.value);
            }
            if (txData.status === 'fulfilled' && Array.isArray(txData.value)) {
                setTransactions(txData.value);
            }
            if (whData.status === 'fulfilled' && Array.isArray(whData.value)) {
                setWarehouses(whData.value);
            }
            if (itemsData.status === 'fulfilled' && Array.isArray(itemsData.value)) {
                setItems(itemsData.value);
            }
        } catch (err) {
            console.error('Failed to load stock data:', err);
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

    const openCreateModal = () => {
        setModalTxType('Receipt');
        setModalSourceWarehouseId(warehouses[0]?.id || '');
        setModalTargetWarehouseId('');
        setModalTxDate(new Date().toISOString().split('T')[0]);
        setModalPostingDate(new Date().toISOString().split('T')[0]);
        setModalReferenceNumber(`STK-REF-${Date.now().toString().slice(-4)}`);
        setModalNotes('');
        setModalAutoPost(true);
        setModalLines([{ itemId: items[0]?.id || '', quantity: 1, unitCost: items[0]?.costPrice || 0, description: '' }]);
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleAddLine = () => {
        setModalLines([...modalLines, { itemId: '', quantity: 1, unitCost: 0, description: '' }]);
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
            unitCost: found?.costPrice || found?.unitPrice || 0,
            description: found ? `${found.name} (${found.code})` : '',
        };
        setModalLines(next);
    };

    const handleLineChange = (idx: number, field: keyof TxLineState, val: any) => {
        const next = [...modalLines];
        next[idx] = { ...next[idx], [field]: val };
        setModalLines(next);
    };

    const modalTotalValue = useMemo(() => {
        return modalLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0);
    }, [modalLines]);

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalSourceWarehouseId) {
            setCreateError('Zəhmət olmasa mənbə anbarını seçin.');
            return;
        }

        if (modalTxType === 'Transfer' && !modalTargetWarehouseId) {
            setCreateError('Transfer əməliyyatı üçün hədəf anbar seçilməlidir.');
            return;
        }

        const validLines = modalLines.filter((l) => l.itemId && Number(l.quantity) > 0);
        if (validLines.length === 0) {
            setCreateError('Ən azı 1 məhsul və müsbət say daxil edilməlidir.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const srcWh = warehouses.find((w) => w.id === modalSourceWarehouseId);
            const tgtWh = warehouses.find((w) => w.id === modalTargetWarehouseId);

            const payload: CreateStockTransactionRequest = {
                type: modalTxType,
                transactionDate: modalTxDate,
                postingDate: modalPostingDate,
                sourceWarehouseId: modalSourceWarehouseId,
                sourceWarehouseName: srcWh?.name,
                targetWarehouseId: modalTargetWarehouseId || undefined,
                targetWarehouseName: tgtWh?.name,
                referenceNumber: modalReferenceNumber.trim(),
                notes: modalNotes.trim(),
                lines: validLines.map((l) => ({
                    itemId: l.itemId,
                    quantity: Number(l.quantity) || 1,
                    unitCost: Number(l.unitCost) || 0,
                    description: l.description,
                })),
            };

            const created = await inventoryService.createStockTransaction(payload);

            // If auto-post is checked, immediately post
            if (modalAutoPost && created?.id) {
                try {
                    await inventoryService.postStockTransaction(created.id);
                } catch (postErr) {
                    console.warn('Auto-post notice:', postErr);
                }
            }

            setShowCreateModal(false);
            showToast(`Stok əməliyyatı (${created.transactionNumber}) uğurla yaradıldı!`);
            loadData(true);
        } catch (err: any) {
            setCreateError(extractErrorMessage(err));
        } finally {
            setCreateLoading(false);
        }
    };

    // Post individual transaction
    const handlePostTx = async (txId: string, txNumber: string) => {
        setActionLoadingId(txId);
        try {
            await inventoryService.postStockTransaction(txId);
            showToast(`${txNumber} əməliyyatı uğurla icra edildi və uçota alındı!`);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to post tx:', err);
            showToast(extractErrorMessage(err), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // KPI Aggregations
    const stats = useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;
        let totalValue = 0;

        entries.forEach((e) => {
            const inQ = Number(e.qtyIn ?? e.quantityIn ?? 0);
            const outQ = Number(e.qtyOut ?? e.quantityOut ?? 0);
            totalIn += inQ;
            totalOut += outQ;
            totalValue += Number(e.balanceValue ?? 0);
        });

        // Also aggregate from created transactions if ledger is fresh
        if (totalIn === 0 && totalOut === 0) {
            transactions.forEach((t) => {
                const isReceipt = String(t.type).toLowerCase().includes('receipt') || t.type === 1;
                const isIssue = String(t.type).toLowerCase().includes('issue') || t.type === 2;
                const qty = (t.lines || []).reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
                if (isReceipt) totalIn += qty;
                else if (isIssue) totalOut += qty;
                totalValue += t.totalValue || 0;
            });
        }

        const netBalance = totalIn - totalOut;
        const totalTxCount = transactions.length + entries.length;

        return { totalIn, totalOut, netBalance, totalTxCount, totalValue };
    }, [entries, transactions]);

    const formatCurrency = (val?: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        } catch {
            return dateStr;
        }
    };

    const getTypeBadge = (type: any) => {
        const tStr = String(type || '').toLowerCase();
        if (tStr.includes('receipt') || tStr.includes('mədaxil') || tStr.includes('giriş') || tStr.includes('goodsreceipt') || tStr === '1') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    <span>{t('inventory.typeReceipt', {}, 'Mədaxil')}</span>
                </span>
            );
        }
        if (tStr.includes('issue') || tStr.includes('məxaric') || tStr.includes('çıxış') || tStr === '2') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                    <span>{t('inventory.typeIssue', {}, 'Məxaric')}</span>
                </span>
            );
        }
        if (tStr.includes('transfer') || tStr === '3') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ArrowsRightLeftIcon className="w-3 h-3" />
                    <span>{t('inventory.typeTransfer', {}, 'Transfer')}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CubeIcon className="w-3 h-3" />
                <span>{t('inventory.transactionType', {}, 'Düzəliş')}</span>
            </span>
        );
    };

    // Filter Transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tItem) => {
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchNum = tItem.transactionNumber?.toLowerCase().includes(term);
                const matchSrc = tItem.sourceWarehouseName?.toLowerCase().includes(term);
                const matchTgt = tItem.targetWarehouseName?.toLowerCase().includes(term);
                const matchRef = tItem.referenceNumber?.toLowerCase().includes(term);
                const matchLines = (tItem.lines || []).some(
                    (l) => l.description?.toLowerCase().includes(term) || l.itemCode?.toLowerCase().includes(term)
                );
                if (!matchNum && !matchSrc && !matchTgt && !matchRef && !matchLines) return false;
            }

            if (typeFilter !== 'ALL') {
                const typeStr = String(tItem.type).toLowerCase();
                if (typeFilter === 'Receipt' && !typeStr.includes('receipt') && tItem.type !== 1) return false;
                if (typeFilter === 'Issue' && !typeStr.includes('issue') && tItem.type !== 2) return false;
                if (typeFilter === 'Transfer' && !typeStr.includes('transfer') && tItem.type !== 3) return false;
            }

            if (filterWarehouseId !== 'ALL' && tItem.sourceWarehouseId !== filterWarehouseId && tItem.targetWarehouseId !== filterWarehouseId) {
                return false;
            }

            const rowDate = tItem.transactionDate || tItem.postingDate;
            if (filterStartDate && rowDate && new Date(rowDate) < new Date(filterStartDate)) return false;
            if (filterEndDate && rowDate && new Date(rowDate) > new Date(filterEndDate + 'T23:59:59')) return false;

            return true;
        });
    }, [transactions, searchTerm, typeFilter, filterWarehouseId, filterStartDate, filterEndDate]);

    // Filter Ledger Entries
    const filteredLedgerEntries = useMemo(() => {
        return entries.filter((e) => {
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchCode = e.itemCode?.toLowerCase().includes(term);
                const matchName = e.itemName?.toLowerCase().includes(term);
                const matchWh = e.warehouseCode?.toLowerCase().includes(term) || e.warehouseName?.toLowerCase().includes(term);
                const matchDoc = e.sourceDocumentNumber?.toLowerCase().includes(term) || e.referenceNumber?.toLowerCase().includes(term);
                if (!matchCode && !matchName && !matchWh && !matchDoc) return false;
            }

            if (typeFilter !== 'ALL') {
                const typeStr = String(e.transactionType || e.sourceDocumentType || '').toLowerCase();
                if (typeFilter === 'Receipt' && !typeStr.includes('receipt') && !typeStr.includes('giriş') && !typeStr.includes('mədaxil') && !typeStr.includes('goodsreceipt') && !typeStr.includes('adjustment')) return false;
                if (typeFilter === 'Issue' && !typeStr.includes('issue') && !typeStr.includes('çıxış') && !typeStr.includes('məxaric')) return false;
                if (typeFilter === 'Transfer' && !typeStr.includes('transfer')) return false;
            }

            if (filterWarehouseId !== 'ALL' && e.warehouseId !== filterWarehouseId && e.warehouseCode !== filterWarehouseId) {
                return false;
            }

            if (filterItemId !== 'ALL' && e.itemId !== filterItemId && e.itemCode !== filterItemId) {
                return false;
            }

            const rowDate = e.postingDate || e.date;
            if (filterStartDate && rowDate && new Date(rowDate) < new Date(filterStartDate)) return false;
            if (filterEndDate && rowDate && new Date(rowDate) > new Date(filterEndDate + 'T23:59:59')) return false;

            return true;
        });
    }, [entries, searchTerm, typeFilter, filterWarehouseId, filterItemId, filterStartDate, filterEndDate]);

    // Active Tab Data & Pagination
    const activeDataCount = activeTab === 'transactions' ? filteredTransactions.length : filteredLedgerEntries.length;
    const totalPages = Math.ceil(activeDataCount / pageSize) || 1;

    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(start, start + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    const paginatedLedgerEntries = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLedgerEntries.slice(start, start + pageSize);
    }, [filteredLedgerEntries, currentPage, pageSize]);

    // Selection
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            if (activeTab === 'transactions') {
                setSelectedRows(paginatedTransactions.map((tItem) => tItem.id));
            } else {
                setSelectedRows(paginatedLedgerEntries.map((r) => r.id));
            }
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const isTxColVisible = (key: string) => txColumns.find((c) => c.key === key)?.visible ?? true;
    const isLedgerColVisible = (key: string) => ledgerColumns.find((c) => c.key === key)?.visible ?? true;

    const toggleTxColumn = (key: string) => {
        setTxColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
    };
    const toggleLedgerColumn = (key: string) => {
        setLedgerColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setFilterWarehouseId('ALL');
        setFilterItemId('ALL');
        setFilterStartDate('');
        setFilterEndDate('');
        setIsFilterPopoverOpen(false);
    };

    const activeFilterCount =
        (typeFilter !== 'ALL' ? 1 : 0) +
        (filterWarehouseId !== 'ALL' ? 1 : 0) +
        (filterItemId !== 'ALL' ? 1 : 0) +
        (filterStartDate ? 1 : 0) +
        (filterEndDate ? 1 : 0);

    const warehouseOptions = useMemo(
        () => warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` })),
        [warehouses]
    );

    const itemOptions = useMemo(
        () => items.map((i) => ({ value: i.id, label: `${i.name} (${i.code})` })),
        [items]
    );

    return (
        <div className="space-y-6 font-sans text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('nav.inventory', {}, 'İnventar')}</span>
                        <span className="text-xs text-zinc-600">/</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{t('inventory.stockLedgerTitle', {}, 'Ehtiyat Hərəkəti')}</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#18181B] text-zinc-400 border border-[#27272A]">
                            {transactions.length + entries.length} {t('common.details', {}, 'qeyd')}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        {t('inventory.stockLedgerSubtitle', {}, 'Bütün anbarlar üzrə mədaxil, məxaric, transfer və maya dəyəri üzrə qalıq hərəkətləri jurnalı')}
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
                        <span>{t('inventory.newStockTransaction', {}, 'Yeni Stok Əməliyyatı')}</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('inventory.typeReceipt', {}, 'Toplam Mədaxil (+)')}</div>
                        <div className="text-xl font-bold text-emerald-400 mt-0.5">
                            +{stats.totalIn.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.sourceWarehouse', {}, 'Bütün anbarlara giriş')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('inventory.typeIssue', {}, 'Toplam Məxaric (-)')}</div>
                        <div className="text-xl font-bold text-rose-400 mt-0.5">
                            -{stats.totalOut.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.sourceWarehouse', {}, 'Anbarlardan çıxış')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <ArrowTrendingDownIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('customers.currentStockQty', {}, 'Xalis Qalıq Miqdarı')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {stats.netBalance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockItemsList', {}, 'Cari ehtiyat vahidləri')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CubeIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('common.total', {}, 'Ümumi Qeyd Sayı')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">{stats.totalTxCount}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockLedgerSubtitle', {}, 'Əməliyyat və hərəkətlər')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <ArchiveBoxIcon className="w-5 h-5" />
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

            {/* Tab Navigation Switcher */}
            <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
                <button
                    onClick={() => {
                        setActiveTab('transactions');
                        setCurrentPage(1);
                        setSelectedRows([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'transactions'
                            ? 'bg-white text-black shadow-xs'
                            : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#27272A]'
                    }`}
                >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    <span>{t('inventory.stockLedgerTitle', {}, 'Stok Əməliyyatları')}</span>
                    <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            activeTab === 'transactions' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                        }`}
                    >
                        {transactions.length}
                    </span>
                </button>

                <button
                    onClick={() => {
                        setActiveTab('ledger');
                        setCurrentPage(1);
                        setSelectedRows([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'ledger'
                            ? 'bg-white text-black shadow-xs'
                            : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#27272A]'
                    }`}
                >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>{t('inventory.stockLedgerTitle', {}, 'Hərəkət Jurnalı (Ledger)')}</span>
                    <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            activeTab === 'ledger' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                        }`}
                    >
                        {entries.length}
                    </span>
                </button>
            </div>

            {/* Filter Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#121214] border border-[#27272A]">
                {/* Left side: Search & Quick Type Filter */}
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
                            placeholder={t('common.searchPlaceholder', {}, 'Axtar (kod, məhsul, anbar, nömrə)...')}
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

                    {/* Type Dropdown */}
                    <div className="relative" ref={typeRef}>
                        <button
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                            <span>
                                {t('inventory.transactionType', {}, 'Növ')}:{' '}
                                <strong className="text-white font-medium">
                                    {typeFilter === 'ALL'
                                        ? t('common.all', {}, 'Hamısı')
                                        : typeFilter === 'Receipt'
                                        ? t('inventory.typeReceipt', {}, 'Mədaxil')
                                        : typeFilter === 'Issue'
                                        ? t('inventory.typeIssue', {}, 'Məxaric')
                                        : t('inventory.typeTransfer', {}, 'Transfer')}
                                </strong>
                            </span>
                            <ArrowsUpDownIcon className="w-3 h-3 text-zinc-500" />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-44 rounded-xl bg-[#18181B] border border-[#27272A] py-1 shadow-xl z-30">
                                {[
                                    { key: 'ALL', label: t('common.all', {}, 'Hamısı') },
                                    { key: 'Receipt', label: t('inventory.typeReceipt', {}, 'Mədaxil (Receipt)') },
                                    { key: 'Issue', label: t('inventory.typeIssue', {}, 'Məxaric (Issue)') },
                                    { key: 'Transfer', label: t('inventory.typeTransfer', {}, 'Transfer') },
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
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('procurement.warehouse', {}, 'Anbar')}</label>
                                    <select
                                        value={filterWarehouseId}
                                        onChange={(e) => {
                                            setFilterWarehouseId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Bütün anbarlar')}</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] text-zinc-400 block mb-1">{t('inventory.stockLedgerTitle', {}, 'Məhsul')}</label>
                                    <select
                                        value={filterItemId}
                                        onChange={(e) => {
                                            setFilterItemId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:outline-hidden"
                                    >
                                        <option value="ALL">{t('common.all', {}, 'Bütün məhsullar')}</option>
                                        {items.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.name} ({i.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[11px] text-zinc-400 block mb-1">{t('accounting.startDate', {}, 'Başlanğıc Tarix')}</label>
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
                                        <label className="text-[11px] text-zinc-400 block mb-1">{t('accounting.endDate', {}, 'Son Tarix')}</label>
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
                                    {(activeTab === 'transactions' ? txColumns : ledgerColumns).map((col) => (
                                        <label
                                            key={col.key}
                                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 text-xs text-zinc-300 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={col.visible}
                                                onChange={() =>
                                                    activeTab === 'transactions'
                                                        ? toggleTxColumn(col.key)
                                                        : toggleLedgerColumn(col.key)
                                                }
                                                className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                            />
                                            <span>{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Rows Bulk Actions Bar */}
            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#18181B] border border-zinc-700 text-xs">
                    <span className="font-semibold text-white">{selectedRows.length} {t('common.selected', {}, 'seçilib')}</span>
                    <button
                        onClick={() => setSelectedRows([])}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    >
                        {t('common.cancel', {}, 'Seçimi ləğv et')}
                    </button>
                </div>
            )}

            {/* Main Table: Tab 1 - Transactions */}
            {activeTab === 'transactions' && (
                <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                    <th className="w-10 py-3.5 px-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                paginatedTransactions.length > 0 &&
                                                paginatedTransactions.every((tItem) => selectedRows.includes(tItem.id))
                                            }
                                            onChange={handleSelectAll}
                                            className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                        />
                                    </th>
                                    {isTxColVisible('date') && <th className="py-3.5 px-4">{t('common.date', {}, 'Tarix')}</th>}
                                    {isTxColVisible('number') && <th className="py-3.5 px-4">{t('inventory.transactionNumber', {}, 'Əməliyyat №')}</th>}
                                    {isTxColVisible('type') && <th className="py-3.5 px-4">{t('inventory.transactionType', {}, 'Növ')}</th>}
                                    {isTxColVisible('sourceWarehouse') && <th className="py-3.5 px-4">{t('inventory.sourceWarehouse', {}, 'Mənbə Anbar')}</th>}
                                    {isTxColVisible('targetWarehouse') && <th className="py-3.5 px-4">{t('inventory.targetWarehouse', {}, 'Hədəf Anbar')}</th>}
                                    {isTxColVisible('linesCount') && <th className="py-3.5 px-4 text-center">{t('common.itemsCount', {}, 'Sətir Sayı')}</th>}
                                    {isTxColVisible('totalValue') && <th className="py-3.5 px-4 text-right">{t('inventory.stockValue', {}, 'Toplam Dəyər')}</th>}
                                    {isTxColVisible('status') && <th className="py-3.5 px-4 text-center">{t('common.status', {}, 'Status')}</th>}
                                    <th className="w-32 py-3.5 px-4 text-right"></th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#27272A]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-400" />
                                                <span>{t('common.loading', {}, 'Stok əməliyyatları yüklənir...')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-16 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArchiveBoxIcon className="w-8 h-8 text-zinc-600" />
                                                <span className="font-semibold text-zinc-400">{t('common.noRecordsFound', {}, 'Heç bir stok əməliyyatı tapılmadı')}</span>
                                                <p className="text-[11px] text-zinc-500 max-w-sm">
                                                    {t('common.tryAdjustingSearch', {}, 'Yeni mədaxil, məxaric və ya transfer qeydiyyatdan keçirin.')}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((tx) => {
                                        const isSelected = selectedRows.includes(tx.id);
                                        const isDraft = String(tx.status || '').toLowerCase().includes('draft') || tx.status === 1;

                                        return (
                                            <tr
                                                key={tx.id}
                                                className={`hover:bg-white/[0.02] transition-colors group ${
                                                    isSelected ? 'bg-white/[0.04]' : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(tx.id)}
                                                        className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                                    />
                                                </td>

                                                {isTxColVisible('date') && (
                                                    <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                                                        {formatDate(tx.transactionDate || tx.postingDate)}
                                                    </td>
                                                )}

                                                {isTxColVisible('number') && (
                                                    <td className="py-3 px-4 font-mono font-bold">
                                                        <Link
                                                            to={`/stock-ledger/${tx.id}`}
                                                            className="text-white hover:text-zinc-300 hover:underline"
                                                        >
                                                            {tx.transactionNumber}
                                                        </Link>
                                                        {tx.referenceNumber && (
                                                            <div className="text-[10px] font-mono text-zinc-500">
                                                                Ref: {tx.referenceNumber}
                                                            </div>
                                                        )}
                                                    </td>
                                                )}

                                                {isTxColVisible('type') && (
                                                    <td className="py-3 px-4">
                                                        {getTypeBadge(tx.type)}
                                                    </td>
                                                )}

                                                {isTxColVisible('sourceWarehouse') && (
                                                    <td className="py-3 px-4 text-zinc-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                            <span>{tx.sourceWarehouseName || tx.sourceWarehouseId || '—'}</span>
                                                        </div>
                                                    </td>
                                                )}

                                                {isTxColVisible('targetWarehouse') && (
                                                    <td className="py-3 px-4">
                                                        {tx.targetWarehouseId ? (
                                                            <div className="flex items-center gap-1.5 text-cyan-400">
                                                                <BuildingStorefrontIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                                <span>{tx.targetWarehouseName || tx.targetWarehouseId}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-zinc-600">—</span>
                                                        )}
                                                    </td>
                                                )}

                                                {isTxColVisible('linesCount') && (
                                                    <td className="py-3 px-4 text-center font-mono text-zinc-300">
                                                        <span className="px-2 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-[11px]">
                                                            {(tx.lines || []).length}
                                                        </span>
                                                    </td>
                                                )}

                                                {isTxColVisible('totalValue') && (
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                        {formatCurrency(tx.totalValue)}
                                                    </td>
                                                )}

                                                {isTxColVisible('status') && (
                                                    <td className="py-3 px-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                !isDraft
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                            }`}
                                                        >
                                                            {!isDraft ? t('statuses.posted', {}, 'İcra Edilib') : t('statuses.draft', {}, 'Qaralama')}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {isDraft && (
                                                            <button
                                                                onClick={() => handlePostTx(tx.id, tx.transactionNumber)}
                                                                disabled={actionLoadingId === tx.id}
                                                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {actionLoadingId === tx.id ? (
                                                                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCircleIcon className="w-3 h-3" />
                                                                )}
                                                                <span>{t('inventory.postStockTransaction', {}, 'İcra Et')}</span>
                                                            </button>
                                                        )}
                                                        <Link
                                                            to={`/stock-ledger/${tx.id}`}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors inline-block"
                                                            title={t('common.view', {}, 'Ətraflı Bax')}
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
                            {filteredTransactions.length === 0
                                ? '0 of 0'
                                : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                      currentPage * pageSize,
                                      filteredTransactions.length
                                  )} of ${filteredTransactions.length}`}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Table: Tab 2 - Ledger Entries */}
            {activeTab === 'ledger' && (
                <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                    <th className="w-10 py-3.5 px-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                paginatedLedgerEntries.length > 0 &&
                                                paginatedLedgerEntries.every((r) => selectedRows.includes(r.id))
                                            }
                                            onChange={handleSelectAll}
                                            className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                        />
                                    </th>
                                    {isLedgerColVisible('date') && <th className="py-3.5 px-4">{t('common.date', {}, 'Tarix')}</th>}
                                    {isLedgerColVisible('reference') && <th className="py-3.5 px-4">{t('accounting.referenceNumber', {}, 'Sənəd / Qaimə №')}</th>}
                                    {isLedgerColVisible('type') && <th className="py-3.5 px-4">{t('inventory.transactionType', {}, 'Növ')}</th>}
                                    {isLedgerColVisible('item') && <th className="py-3.5 px-4">{t('inventory.stockLedgerTitle', {}, 'Məhsul (SKU)')}</th>}
                                    {isLedgerColVisible('warehouse') && <th className="py-3.5 px-4">{t('procurement.warehouse', {}, 'Anbar')}</th>}
                                    {isLedgerColVisible('qtyIn') && <th className="py-3.5 px-4 text-right">{t('inventory.typeReceipt', {}, 'Giriş (+)')}</th>}
                                    {isLedgerColVisible('qtyOut') && <th className="py-3.5 px-4 text-right">{t('inventory.typeIssue', {}, 'Çıxış (-)')}</th>}
                                    {isLedgerColVisible('unitCost') && <th className="py-3.5 px-4 text-right">{t('customers.averageCost', {}, 'Maya Dəyəri')}</th>}
                                    {isLedgerColVisible('balanceQty') && <th className="py-3.5 px-4 text-right">{t('customers.currentStockQty', {}, 'Son Qalıq')}</th>}
                                    {isLedgerColVisible('balanceValue') && <th className="py-3.5 px-4 text-right">{t('inventory.stockValue', {}, 'Balans Dəyəri')}</th>}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#27272A]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="py-16 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-400" />
                                                <span>{t('common.loading', {}, 'Ehtiyat hərəkətləri yüklənir...')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLedgerEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-16 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArchiveBoxIcon className="w-8 h-8 text-zinc-600" />
                                                <span className="font-semibold text-zinc-400">{t('common.noRecordsFound', {}, 'Heç bir stok hərəkəti qeydi tapılmadı')}</span>
                                                <p className="text-[11px] text-zinc-500 max-w-sm">
                                                    {t('common.tryAdjustingSearch', {}, 'İcra edilmiş stok əməliyyatları və ya qəbul edilmiş malların hərəkətləri burada əks olunur.')}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLedgerEntries.map((row, idx) => {
                                        const isSelected = selectedRows.includes(row.id);
                                        const qtyIn = Number(row.qtyIn ?? row.quantityIn ?? 0);
                                        const qtyOut = Number(row.qtyOut ?? row.quantityOut ?? 0);

                                        return (
                                            <tr
                                                key={row.id || idx}
                                                className={`hover:bg-white/[0.02] transition-colors group ${
                                                    isSelected ? 'bg-white/[0.04]' : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(row.id)}
                                                        className="rounded bg-[#121214] border-zinc-700 text-white focus:ring-0"
                                                    />
                                                </td>

                                                {isLedgerColVisible('date') && (
                                                    <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                                                        {formatDate(row.postingDate || row.date)}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('reference') && (
                                                    <td className="py-3 px-4 font-mono font-semibold text-white">
                                                        {row.sourceDocumentNumber || row.referenceNumber || '—'}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('type') && (
                                                    <td className="py-3 px-4">
                                                        {getTypeBadge(row.sourceDocumentType || row.transactionType)}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('item') && (
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-white">
                                                            {row.itemName || row.itemCode}
                                                        </div>
                                                        {row.itemCode && row.itemName && (
                                                            <div className="text-[10px] font-mono text-zinc-500">
                                                                SKU: {row.itemCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('warehouse') && (
                                                    <td className="py-3 px-4 text-zinc-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                            <span>{row.warehouseName || row.warehouseCode || '—'}</span>
                                                        </div>
                                                    </td>
                                                )}

                                                {isLedgerColVisible('qtyIn') && (
                                                    <td className="py-3 px-4 text-right font-mono">
                                                        {qtyIn > 0 ? (
                                                            <span className="text-emerald-400 font-bold">
                                                                +{qtyIn.toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-600">—</span>
                                                        )}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('qtyOut') && (
                                                    <td className="py-3 px-4 text-right font-mono">
                                                        {qtyOut > 0 ? (
                                                            <span className="text-rose-400 font-bold">
                                                                -{qtyOut.toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-600">—</span>
                                                        )}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('unitCost') && (
                                                    <td className="py-3 px-4 text-right font-mono text-zinc-400">
                                                        {formatCurrency(row.unitCost || row.valuationRate || 0)}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('balanceQty') && (
                                                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                                                        {Number(row.balanceQty ?? row.runningBalance ?? 0).toLocaleString()}
                                                    </td>
                                                )}

                                                {isLedgerColVisible('balanceValue') && (
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                        {formatCurrency(row.balanceValue)}
                                                    </td>
                                                )}
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
                            {filteredLedgerEntries.length === 0
                                ? '0 of 0'
                                : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                                      currentPage * pageSize,
                                      filteredLedgerEntries.length
                                  )} of ${filteredLedgerEntries.length}`}
                        </span>
                    </div>
                </div>
            )}

            {/* Soft Create Stock Transaction Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="bg-[#121214] border border-[#27272A] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                                    <ArchiveBoxIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{t('inventory.newStockTransaction', {}, 'Yeni Stok Əməliyyatı')}</h3>
                                    <p className="text-[11px] text-zinc-400">
                                        {t('inventory.stockLedgerSubtitle', {}, 'Anbara birbaşa mədaxil, məxaric, anbarlararası transfer və ya düzəliş qeydiyyatı')}
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

                        {/* Modal Form Scrollable */}
                        <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.transactionType', {}, 'Əməliyyat Növü')} <span className="text-rose-400">*</span>
                                    </label>
                                    <CustomSelect
                                        value={String(modalTxType)}
                                        onChange={(val) => setModalTxType(val as any)}
                                        options={[
                                            { value: 'Receipt', label: t('inventory.typeReceipt', {}, 'Mədaxil (Stok Girişi)') },
                                            { value: 'Issue', label: t('inventory.typeIssue', {}, 'Məxaric (Stok Çıxışı)') },
                                            { value: 'Transfer', label: t('inventory.typeTransfer', {}, 'Transfer (Anbarlararası Köçürmə)') },
                                            { value: 'Adjustment', label: t('inventory.transactionType', {}, 'Düzəliş (Sayım Fərqi)') },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.sourceWarehouse', {}, 'Mənbə Anbar')} <span className="text-rose-400">*</span>
                                    </label>
                                    <CustomSelect
                                        value={modalSourceWarehouseId}
                                        onChange={(val) => setModalSourceWarehouseId(val)}
                                        options={warehouseOptions}
                                        placeholder={t('common.select', {}, 'Mənbə anbarı seçin')}
                                    />
                                </div>

                                {modalTxType === 'Transfer' && (
                                    <div>
                                        <label className="text-xs font-medium text-zinc-300 block mb-1">
                                            {t('inventory.targetWarehouse', {}, 'Hədəf Anbar')} <span className="text-rose-400">*</span>
                                        </label>
                                        <CustomSelect
                                            value={modalTargetWarehouseId}
                                            onChange={(val) => setModalTargetWarehouseId(val)}
                                            options={warehouseOptions.filter((w) => w.value !== modalSourceWarehouseId)}
                                            placeholder={t('common.select', {}, 'Hədəf anbarı seçin')}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('accounting.referenceNumber', {}, 'Sənəd / Referans №')}
                                    </label>
                                    <input
                                        type="text"
                                        value={modalReferenceNumber}
                                        onChange={(e) => setModalReferenceNumber(e.target.value)}
                                        placeholder="STK-2026-001"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('inventory.transactionDate', {}, 'Əməliyyat Tarixi')}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={modalTxDate}
                                        onChange={(e) => setModalTxDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                                        {t('accounting.postingDate', {}, 'Uçot (Posting) Tarixi')}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={modalPostingDate}
                                        onChange={(e) => setModalPostingDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="space-y-2 pt-2 border-t border-[#27272A]">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                                        {t('accounting.lines', {}, 'Əməliyyat Sətirləri')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-semibold cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>+ {t('accounting.addLine', {}, 'Sətir Əlavə Et')}</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {modalLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#18181B] border border-[#27272A]"
                                        >
                                            <div className="col-span-12 sm:col-span-5">
                                                <CustomSelect
                                                    value={line.itemId}
                                                    onChange={(val) => handleLineItemSelect(idx, val)}
                                                    options={itemOptions}
                                                    placeholder={t('common.select', {}, 'Məhsul seçin')}
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={line.quantity}
                                                    onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                                                    placeholder={t('customers.quantity', {}, 'Say')}
                                                    className="w-full px-2.5 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white font-mono text-right focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="col-span-5 sm:col-span-3">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                        value={line.unitCost}
                                                        onChange={(e) => handleLineChange(idx, 'unitCost', Number(e.target.value))}
                                                        placeholder={t('customers.averageCost', {}, 'Vahid maya')}
                                                        className="w-full px-2.5 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white font-mono text-right focus:outline-hidden pr-8"
                                                    />
                                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                                                        AZN
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-span-1 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLine(idx)}
                                                    disabled={modalLines.length <= 1}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 transition-colors"
                                                    title={t('common.delete', {}, 'Sətiri sil')}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-[#27272A] text-xs font-semibold">
                                    <span className="text-zinc-400">{t('inventory.stockValue', {}, 'Yekun Maya Dəyəri')}:</span>
                                    <span className="text-white font-mono font-bold text-sm">
                                        {formatCurrency(modalTotalValue)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="autoPost"
                                    checked={modalAutoPost}
                                    onChange={(e) => setModalAutoPost(e.target.checked)}
                                    className="rounded bg-[#18181B] border-zinc-700 text-white focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="autoPost" className="text-xs text-zinc-300 select-none cursor-pointer">
                                    {t('inventory.postStockTransaction', {}, 'Əməliyyatı yaradılan kimi birbaşa icra et (Post & Stok hərəkəti yarat)')}
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-zinc-300 block mb-1">{t('common.notes', {}, 'Qeydlər')}</label>
                                <textarea
                                    rows={2}
                                    value={modalNotes}
                                    onChange={(e) => setModalNotes(e.target.value)}
                                    placeholder={t('common.notes', {}, 'Stok əməliyyatı haqqında əlavə qeydlər...')}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden resize-none"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
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
                                            <span>{t('common.saving', {}, 'Saxlanılır...')}</span>
                                        </>
                                    ) : (
                                        <span>{t('common.save', {}, 'Saxla və Yarat')}</span>
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

export default StockLedgerPage;

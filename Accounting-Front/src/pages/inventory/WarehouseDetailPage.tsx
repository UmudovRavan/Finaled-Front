import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryService, accountsService, customersService } from '../../api';
import type { WarehouseDto, AccountDto, StockLedgerEntryDto, ItemDto } from '../../dto';
import { useLanguage } from '../../i18n';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CircleStackIcon,
    BanknotesIcon,
    DocumentTextIcon,
    ClockIcon,
    CubeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    TagIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export const WarehouseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [allItems, setAllItems] = useState<ItemDto[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<StockLedgerEntryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'items' | 'ledger'>('items');
    const [tableSearch, setTableSearch] = useState('');

    const loadWarehouseDetails = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(false);

        try {
            const [whData, accountsData, ledgerData, itemsData] = await Promise.allSettled([
                inventoryService.getWarehouse(id),
                accountsService.getAccounts(),
                inventoryService.getStockLedger({ warehouseId: id }),
                customersService.getItems(),
            ]);

            let loadedWh: WarehouseDto | null = null;
            if (whData.status === 'fulfilled' && whData.value) {
                loadedWh = whData.value;
                setWarehouse(loadedWh);
            }

            if (accountsData.status === 'fulfilled' && Array.isArray(accountsData.value)) {
                setAccounts(accountsData.value);
            }

            let entries: StockLedgerEntryDto[] = [];
            if (ledgerData.status === 'fulfilled' && Array.isArray(ledgerData.value)) {
                entries = ledgerData.value;
                // If filtered by backend didn't work, filter on client
                if (loadedWh) {
                    entries = entries.filter(
                        (e) => e.warehouseId === id || (e.warehouseCode && e.warehouseCode === loadedWh?.code)
                    );
                }
                setLedgerEntries(entries);
            }

            if (itemsData.status === 'fulfilled' && Array.isArray(itemsData.value)) {
                setAllItems(itemsData.value);
            }
        } catch (err) {
            console.error('Failed to load warehouse details:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadWarehouseDetails();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

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

    // Calculate item balances in this warehouse
    const warehouseStockSummary = useMemo(() => {
        const itemMap = new Map<
            string,
            {
                itemId?: string;
                itemCode: string;
                itemName: string;
                balanceQty: number;
                balanceValue: number;
                valuationRate: number;
                lastMovementDate?: string;
            }
        >();

        // Process ledger chronological
        ledgerEntries.forEach((e) => {
            const key = e.itemCode || e.itemId || 'unknown';
            const existing = itemMap.get(key);

            const qty = Number(e.balanceQty ?? 0);
            const val = Number(e.balanceValue ?? 0);
            const rate = Number(e.valuationRate ?? (qty > 0 ? val / qty : 0));

            itemMap.set(key, {
                itemId: e.itemId,
                itemCode: e.itemCode || existing?.itemCode || '—',
                itemName: e.itemName || existing?.itemName || '—',
                balanceQty: qty,
                balanceValue: val,
                valuationRate: rate,
                lastMovementDate: e.postingDate || e.date,
            });
        });

        // Also check if any item exists in allItems but not yet in ledger
        const summaryList = Array.from(itemMap.values()).filter((item) => item.balanceQty !== 0 || item.balanceValue !== 0);

        let totalQty = 0;
        let totalVal = 0;
        summaryList.forEach((s) => {
            totalQty += s.balanceQty;
            totalVal += s.balanceValue;
        });

        return {
            items: summaryList,
            totalItemsCount: summaryList.length,
            totalStockOnHand: totalQty,
            totalStockValue: totalVal,
        };
    }, [ledgerEntries]);

    // GL Account Name
    const defaultGlAccount = useMemo(() => {
        if (!warehouse?.defaultInventoryAccountId) return null;
        return accounts.find((a) => a.id === warehouse.defaultInventoryAccountId);
    }, [warehouse, accounts]);

    // Filtered items list
    const filteredStockItems = useMemo(() => {
        if (!tableSearch.trim()) return warehouseStockSummary.items;
        const q = tableSearch.toLowerCase();
        return warehouseStockSummary.items.filter(
            (i) => i.itemCode.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q)
        );
    }, [warehouseStockSummary.items, tableSearch]);

    // Filtered ledger entries
    const filteredLedgerEntries = useMemo(() => {
        if (!tableSearch.trim()) return ledgerEntries;
        const q = tableSearch.toLowerCase();
        return ledgerEntries.filter(
            (e) =>
                e.itemCode?.toLowerCase().includes(q) ||
                e.itemName?.toLowerCase().includes(q) ||
                e.sourceDocumentNumber?.toLowerCase().includes(q) ||
                e.referenceNumber?.toLowerCase().includes(q)
        );
    }, [ledgerEntries, tableSearch]);

    // Last transaction date
    const lastTransaction = useMemo(() => {
        if (ledgerEntries.length === 0) return null;
        return ledgerEntries[ledgerEntries.length - 1];
    }, [ledgerEntries]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 font-sans text-white">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-400">{t('common.loading', {}, 'Anbar məlumatları yüklənir...')}</span>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="p-8 text-center space-y-4 font-sans text-white">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-[#27272A] mx-auto flex items-center justify-center text-zinc-400">
                    <BuildingStorefrontIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold">{t('common.noRecordsFound', {}, 'Anbar tapılmadı')}</h2>
                <p className="text-xs text-zinc-400">{t('common.noRecordsFound', {}, 'Axtardığınız anbar mövcud deyil və ya silinib.')}</p>
                <Link
                    to="/warehouses"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>{t('inventory.warehousesTitle', {}, 'Anbarlar siyahısına qayıt')}</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/warehouses')}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        title={t('common.back', {}, 'Geri')}
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-zinc-400">{warehouse.code}</span>
                            <span className="text-zinc-600">•</span>
                            <h1 className="text-xl font-bold tracking-tight text-white">{warehouse.name}</h1>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    warehouse.isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}
                            >
                                {warehouse.isActive ? t('statuses.active', {}, 'Aktiv Anbar') : t('statuses.inactive', {}, 'Qeyri-aktiv')}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {warehouse.location || t('inventory.location', {}, 'Fiziki ünvan qeyd olunmayıb')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadWarehouseDetails(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/goods-receipts"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 text-black" />
                        <span>{t('procurement.newGrn', {}, 'Məhsul Qəbulu (İrsaliyə)')}</span>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('inventory.stockValue', {}, 'Toplam Stok Dəyəri')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {formatCurrency(warehouseStockSummary.totalStockValue)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockValue', {}, 'Anbardakı cari balans')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('common.itemsCount', {}, 'Məhsul Çeşidi')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {warehouseStockSummary.totalItemsCount}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('inventory.stockItemsList', {}, 'Mövcud qalıqlı məhsullar')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CubeIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('common.totalQuantity', {}, 'Ümumi Qalıq Sayı')}</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {warehouseStockSummary.totalStockOnHand.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('common.totalQuantity', {}, 'Bütün vahidlər cəmi')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CircleStackIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('inventory.stockLedgerTitle', {}, 'Son Stok Hərəkəti')}</div>
                        <div className="text-xs font-bold text-white mt-1">
                            {lastTransaction ? formatDate(lastTransaction.postingDate || lastTransaction.date) : t('common.noRecordsFound', {}, 'Hərəkət yoxdur')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                            {lastTransaction ? `${lastTransaction.itemCode || ''} (${lastTransaction.qtyIn ? '+' + lastTransaction.qtyIn : '-' + lastTransaction.qtyOut})` : t('common.noRecordsFound', {}, 'Stok hərəkəti qeydə alınmayıb')}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <ClockIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Warehouse Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                <BuildingStorefrontIcon className="w-4 h-4 text-zinc-500" />
                                <span>{t('inventory.warehouseDetails', {}, 'Anbar Parametrləri')}</span>
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('inventory.warehouseCode', {}, 'Anbar Kodu')}</span>
                                <span className="font-mono font-bold text-white mt-0.5 block">{warehouse.code}</span>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('inventory.warehouseName', {}, 'Anbar Adı')}</span>
                                <span className="font-semibold text-white mt-0.5 block">{warehouse.name}</span>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('inventory.location', {}, 'Yerləşmə / Ünvan')}</span>
                                <div className="flex items-start gap-1.5 mt-0.5 text-zinc-300">
                                    <MapPinIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                                    <span>{warehouse.location || t('inventory.location', {}, 'Ünvan daxil edilməyib')}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('inventory.manager', {}, 'Məsul Şəxs (Menecer)')}</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-zinc-300">
                                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    <span>{warehouse.managerName || t('common.none', {}, 'Təyin edilməyib')}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('customers.phone', {}, 'Əlaqə Nömrəsi')}</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-zinc-300">
                                    <PhoneIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    <span>{warehouse.phone || '—'}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">{t('customers.inventoryAccount', {}, 'Mühasibatlıq Stok Hesabı (GL)')}</span>
                                <div className="mt-0.5 p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300">
                                    {defaultGlAccount ? (
                                        <div className="font-mono text-[11px]">
                                            <span className="font-bold text-white">{defaultGlAccount.code}</span> - {defaultGlAccount.name}
                                        </div>
                                    ) : (
                                        <span className="text-zinc-500 text-[11px]">{t('common.none', {}, 'Standart Şirkət Stok Hesabı')}</span>
                                    )}
                                </div>
                            </div>

                            {warehouse.notes && (
                                <div>
                                    <span className="text-[11px] text-zinc-500 block">{t('common.notes', {}, 'Qeydlər')}</span>
                                    <p className="mt-0.5 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 text-xs">
                                        {warehouse.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Card: Items & Movements Tabs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                        {/* Tab header & Search */}
                        <div className="p-3 border-b border-[#27272A] bg-[#18181B] flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#27272A]">
                                <button
                                    onClick={() => setActiveTab('items')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === 'items'
                                            ? 'bg-white text-black shadow-xs'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {t('inventory.stockItemsList', {}, 'Məhsul Qalıqları')} ({warehouseStockSummary.items.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('ledger')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === 'ledger'
                                            ? 'bg-white text-black shadow-xs'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {t('inventory.stockLedgerTitle', {}, 'Stok Hərəkətləri')} ({ledgerEntries.length})
                                </button>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    value={tableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    placeholder={t('common.searchPlaceholder', {}, 'Cədvəldə axtar...')}
                                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden transition-colors"
                                />
                                {tableSearch && (
                                    <button
                                        onClick={() => setTableSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tab Content: Items on Hand */}
                        {activeTab === 'items' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                            <th className="py-3 px-4">{t('customers.itemCode', {}, 'Məhsul Kodu')}</th>
                                            <th className="py-3 px-4">{t('customers.itemName', {}, 'Məhsul Adı')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.stockItemsList', {}, 'Qalıq (Say)')}</th>
                                            <th className="py-3 px-4 text-right">{t('customers.averageCost', {}, 'Orta Maya Dəyəri')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.stockValue', {}, 'Toplam Dəyər')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {filteredStockItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-zinc-500">
                                                    <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                                    <p className="text-xs font-semibold text-zinc-400">
                                                        {t('common.noRecordsFound', {}, 'Bu anbarda heç bir məhsul qalığı qeydə alınmayıb.')}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500 mt-1">
                                                        {t('inventory.warehousesSubtitle', {}, 'Məhsul qəbulu və ya transfer əməliyyatı həyata keçirdikdə qalıqlar burada əks olunacaq.')}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStockItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-mono font-bold text-white">
                                                        {item.itemId ? (
                                                            <Link
                                                                to={`/items/${item.itemId}`}
                                                                className="hover:underline text-white"
                                                            >
                                                                {item.itemCode}
                                                            </Link>
                                                        ) : (
                                                            item.itemCode
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-zinc-200">
                                                        {item.itemName}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                                                        {item.balanceQty.toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono text-zinc-400">
                                                        {formatCurrency(item.valuationRate)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                        {formatCurrency(item.balanceValue)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab Content: Stock Movements Ledger */}
                        {activeTab === 'ledger' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                            <th className="py-3 px-4">{t('common.date', {}, 'Tarix')}</th>
                                            <th className="py-3 px-4">{t('inventory.stockLedgerTitle', {}, 'Məhsul')}</th>
                                            <th className="py-3 px-4">{t('common.details', {}, 'Sənəd / Əməliyyat')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.typeReceipt', {}, 'Giriş (+)')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.typeIssue', {}, 'Çıxış (-)')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.stockItemsList', {}, 'Son Qalıq')}</th>
                                            <th className="py-3 px-4 text-right">{t('inventory.stockValue', {}, 'Balans Dəyəri')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {filteredLedgerEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-zinc-500">
                                                    <ClockIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                                    <p className="text-xs font-semibold text-zinc-400">
                                                        {t('common.noRecordsFound', {}, 'Heç bir stok hərəkəti qeydi tapılmadı.')}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLedgerEntries.map((entry, idx) => {
                                                const qtyIn = Number(entry.qtyIn ?? entry.quantityIn ?? 0);
                                                const qtyOut = Number(entry.qtyOut ?? entry.quantityOut ?? 0);

                                                return (
                                                    <tr key={entry.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                                                            {formatDate(entry.postingDate || entry.date)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-mono font-bold text-white">
                                                                {entry.itemCode}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 line-clamp-1">
                                                                {entry.itemName}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-mono text-[11px] text-zinc-300">
                                                                {entry.sourceDocumentNumber || entry.referenceNumber || '—'}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500">
                                                                {String(entry.sourceDocumentType || entry.transactionType || t('inventory.stockLedgerTitle', {}, 'Hərəkət'))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono">
                                                            {qtyIn > 0 ? (
                                                                <span className="text-emerald-400 font-bold">
                                                                    +{qtyIn.toLocaleString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-zinc-600">—</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono">
                                                            {qtyOut > 0 ? (
                                                                <span className="text-rose-400 font-bold">
                                                                    -{qtyOut.toLocaleString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-zinc-600">—</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                                                            {Number(entry.balanceQty ?? entry.runningBalance ?? 0).toLocaleString()}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                            {formatCurrency(entry.balanceValue)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetailPage;

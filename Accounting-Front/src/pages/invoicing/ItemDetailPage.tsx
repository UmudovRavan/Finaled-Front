import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customersService, accountsService, inventoryService } from '../../api';
import type { ItemDto, AccountDto, StockLedgerEntryDto } from '../../dto';
import { formatDate } from '../../utils';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    CubeIcon,
    TagIcon,
    SparklesIcon,
    CircleStackIcon,
    CheckIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export const ItemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [item, setItem] = useState<ItemDto | null>(null);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<StockLedgerEntryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    const fetchItemDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [itemData, accountsData, ledgerData] = await Promise.allSettled([
                customersService.getItem(id),
                accountsService.getAccounts(),
                inventoryService.getStockLedger({ itemId: id }),
            ]);

            if (itemData.status === 'fulfilled' && itemData.value) {
                setItem(itemData.value);
            }
            if (accountsData.status === 'fulfilled' && Array.isArray(accountsData.value)) {
                setAccounts(accountsData.value);
            }
            if (ledgerData.status === 'fulfilled' && Array.isArray(ledgerData.value)) {
                setLedgerEntries(ledgerData.value);
            }
        } catch (err) {
            console.error('Error fetching item details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <CubeIcon className="w-3.5 h-3.5" />
                    <span>Stok Məhsulu</span>
                </span>
            );
        }
        if (tStr === 'Service' || tStr === '3') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Xidmət</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TagIcon className="w-3.5 h-3.5" />
                <span>Qeyri-stok Məhsulu</span>
            </span>
        );
    };

    // Lookup GL account names
    const getAccountName = (accId?: string, defaultFallback = '—') => {
        if (!accId) return defaultFallback;
        const acc = accounts.find((a) => a.id.toLowerCase() === accId.toLowerCase());
        if (acc) return `${acc.code} - ${acc.name}`;
        return defaultFallback;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#71717A] space-y-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-white" />
                <p className="text-sm font-medium">Məhsul məlumatları yüklənir...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-base font-semibold text-white mb-4">Məhsul və ya xidmət tapılmadı.</p>
                <Link
                    to="/items"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#27272A] rounded-xl hover:bg-[#3F3F46] transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Məhsullar Siyahısına Qayıt
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-150">
            {/* ─── Breadcrumb & Top Bar ─── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/items')}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/items" className="hover:text-zinc-300 transition-colors">
                            Məhsul və Xidmətlər
                        </Link>
                        <span className="text-[#52525B]">/</span>
                        <span className="font-mono text-white">{item.code}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {getItemTypeBadge(item.type)}
                    <button
                        onClick={fetchItemDetails}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── Summary Metric Cards ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Current Stock */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Mövcud Stok Qalığı</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {String(item.type) === 'Service' || String(item.type) === '3' ? (
                            <span className="text-[#52525B]">Xidmət</span>
                        ) : (
                            <span>{Number(item.totalStockOnHand) || 0} {item.baseUOM || 'PCS'}</span>
                        )}
                    </span>
                </div>

                {/* Stock Total Value */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Ümumi Stok Dəyəri</span>
                    <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">
                        {String(item.type) === 'Service' || String(item.type) === '3' ? (
                            <span className="text-[#52525B]">—</span>
                        ) : (
                            formatCurrency(item.totalStockValue || 0)
                        )}
                    </span>
                </div>

                {/* Buying / Cost Price */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Alış / Maya Qiyməti</span>
                    <span className="text-base font-mono font-bold text-[#A1A1AA] mt-1 block">
                        {formatCurrency(item.standardBuyingPrice !== undefined ? item.standardBuyingPrice : (item.costPrice || 0))}
                    </span>
                </div>

                {/* Selling Price */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Standart Satış Qiyməti</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {formatCurrency(item.standardSellingPrice !== undefined ? item.standardSellingPrice : (item.unitPrice || 0))}
                    </span>
                </div>
            </div>

            {/* ─── Item Overview & GL Mappings ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left (2 cols): Details */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Məhsul / Xidmət Məlumatları</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-[#71717A] block">Ad</span>
                            <span className="text-white font-semibold text-sm mt-0.5 block">{item.name}</span>
                        </div>

                        <div>
                            <span className="text-[#71717A] block">SKU / Kod</span>
                            <span className="text-white font-mono font-semibold text-sm mt-0.5 block">{item.code}</span>
                        </div>

                        <div>
                            <span className="text-[#71717A] block">Ölçü Vahidi (UOM)</span>
                            <span className="text-white font-medium mt-0.5 block">{item.baseUOM || item.unitOfMeasure || 'PCS'}</span>
                        </div>

                        <div>
                            <span className="text-[#71717A] block">Qiymətləndirmə Metodu</span>
                            <span className="text-white font-medium mt-0.5 block">
                                {String(item.valuationMethod) === 'FIFO' || String(item.valuationMethod) === '2' ? 'FIFO (İlk Gələn İlk Çıxar)' : 'Orta Maya Dəyəri (Moving Average)'}
                            </span>
                        </div>

                        <div className="sm:col-span-2">
                            <span className="text-[#71717A] block">Təsvir</span>
                            <p className="text-zinc-300 mt-1 leading-relaxed">{item.description || 'Heç bir təsvir qeyd olunmayıb.'}</p>
                        </div>
                    </div>
                </div>

                {/* Right (1 col): GL Accounts Mapping */}
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Mühasibat Hesabları (GL)</h3>

                    <div className="space-y-3.5 text-xs">
                        <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] text-[11px] block">Stok Aktiv Hesabı (Asset)</span>
                            <span className="text-white font-medium mt-0.5 block font-mono">
                                {getAccountName(item.inventoryAccountId, '1100 - Mallar və Materiallar (Default)')}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] text-[11px] block">Maya Dəyəri Hesabı (COGS)</span>
                            <span className="text-white font-medium mt-0.5 block font-mono">
                                {getAccountName(item.cogsAccountId, '7010 - Satılmış Malların Maya Dəyəri (Default)')}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] text-[11px] block">Satış Gəliri Hesabı (Revenue)</span>
                            <span className="text-white font-medium mt-0.5 block font-mono">
                                {getAccountName(item.revenueAccountId, '6010 - Satış Gəliri (Default)')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Stock Movements / Ledger Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-[#A1A1AA]" />
                        <span>Anbar Hərəkəti Tarixçəsi (Stock Ledger)</span>
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7]">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-4">Tarix</th>
                                <th className="py-3 px-4">Əməliyyat Növü</th>
                                <th className="py-3 px-4">İstinad №</th>
                                <th className="py-3 px-4 text-right">Daxil olan</th>
                                <th className="py-3 px-4 text-right">Xaric olan</th>
                                <th className="py-3 px-4 text-right">Vahid Dəyər</th>
                                <th className="py-3 px-4 text-right">Cari Qalıq</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60">
                            {ledgerEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-[#71717A]">
                                        Bu məhsul üzrə hələlik heç bir anbar hərəkəti qeydə alınmayıb
                                    </td>
                                </tr>
                            ) : (
                                ledgerEntries.map((entry, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 text-white">
                                            {formatDate(entry.postingDate || entry.date, '—')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-md bg-[#18181B] text-[#E4E4E7] border border-[#27272A] text-[11px]">
                                                {String(entry.transactionType || entry.sourceDocumentType || 'Hərəkət')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-zinc-300">
                                            {entry.referenceNumber || entry.sourceDocumentNumber || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-emerald-400">
                                            {(entry.quantityIn || entry.qtyIn || 0) > 0 ? `+${entry.quantityIn || entry.qtyIn}` : '—'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-rose-400">
                                            {(entry.quantityOut || entry.qtyOut || 0) > 0 ? `-${entry.quantityOut || entry.qtyOut}` : '—'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-white">
                                            {formatCurrency(entry.unitCost || entry.valuationRate || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                            {entry.runningBalance ?? entry.balanceQty ?? 0} {item.baseUOM || 'PCS'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;

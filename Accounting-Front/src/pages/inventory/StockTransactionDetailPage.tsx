import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryService } from '../../api';
import type { StockTransactionDto } from '../../dto';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
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
    CurrencyDollarIcon,
    InboxArrowDownIcon,
} from '@heroicons/react/24/outline';

export const StockTransactionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState<StockTransactionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [error, setError] = useState('');

    const extractErrorMessage = (err: any): string => {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
        if (data?.error) return data.error;
        return err.message || 'Xəta baş verdi';
    };

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');

        try {
            const data = await inventoryService.getStockTransaction(id);
            setTransaction(data);
        } catch (err: any) {
            console.error('Failed to load stock transaction detail:', err);
            setError(extractErrorMessage(err) || 'Stok əməliyyatı tapılmadı.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4500);
    };

    const handlePost = async () => {
        if (!transaction?.id) return;
        setIsPosting(true);
        try {
            const updated = await inventoryService.postStockTransaction(transaction.id);
            setTransaction(updated);
            showToast('Stok əməliyyatı uğurla icra edildi və uçota alındı!');
            await loadData(true);
        } catch (err: any) {
            console.error('Failed to post stock transaction:', err);
            showToast(extractErrorMessage(err), 'error');
        } finally {
            setIsPosting(false);
        }
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

    const getTypeBadge = (type: any) => {
        const t = String(type || '').toLowerCase();
        if (t.includes('receipt') || t.includes('mədaxil') || t.includes('giriş') || t === '1') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    <span>Mədaxil (Receipt)</span>
                </span>
            );
        }
        if (t.includes('issue') || t.includes('məxaric') || t.includes('çıxış') || t === '2') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                    <span>Məxaric (Issue)</span>
                </span>
            );
        }
        if (t.includes('transfer') || t === '3') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CubeIcon className="w-3.5 h-3.5" />
                <span>Düzəliş (Adjustment)</span>
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 font-sans text-white">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-400">Stok əməliyyatı yüklənir...</span>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="p-8 text-center space-y-4 font-sans text-white">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-400">
                    <ArchiveBoxIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold">Əməliyyat tapılmadı</h2>
                <p className="text-xs text-zinc-400">{error || 'Axtardığınız stok əməliyyatı mövcud deyil.'}</p>
                <Link
                    to="/stock-ledger"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Ehtiyat Hərəkəti siyahısına qayıt</span>
                </Link>
            </div>
        );
    }

    const isDraft = String(transaction.status || '').toLowerCase().includes('draft') || transaction.status === 1;
    const totalQty = (transaction.lines || []).reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

    return (
        <div className="space-y-6 font-sans text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/stock-ledger')}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-white">{transaction.transactionNumber}</span>
                            <span className="text-zinc-600">•</span>
                            {getTypeBadge(transaction.type)}
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    !isDraft
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}
                            >
                                {!isDraft ? 'İcra Edilib' : 'Qaralama'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {formatDate(transaction.transactionDate)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {isDraft && (
                        <button
                            onClick={handlePost}
                            disabled={isPosting}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isPosting ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 text-black" />}
                            <span>Sənədi İcra Et (Post)</span>
                        </button>
                    )}
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

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Yekun Dəyər</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {formatCurrency(transaction.totalValue)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Maya dəyəri ilə cəmi</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CurrencyDollarIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Məhsul Çeşidi</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {(transaction.lines || []).length} növ
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Sətir sayı</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CubeIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Toplam Say</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                            {totalQty.toLocaleString('az-AZ')}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Hərəkət edən vahidlər</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <InboxArrowDownIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Sənəd Vəziyyəti</div>
                        <div className="text-xs font-bold text-white mt-1">
                            {!isDraft ? 'Təsdiqlənib / Uçota Alınıb' : 'Qaralama (İcra gözləyir)'}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                            {!isDraft ? 'Stok balansına daxil edilib' : 'Stok balansına təsir etməyib'}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <ArchiveBoxIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Transaction Details */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                <ArchiveBoxIcon className="w-4 h-4 text-zinc-500" />
                                <span>Əməliyyat Məlumatları</span>
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="text-[11px] text-zinc-500 block">Əməliyyat Nömrəsi</span>
                                <span className="font-mono font-bold text-white mt-0.5 block">
                                    {transaction.transactionNumber}
                                </span>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">Mənbə Anbar</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-zinc-300">
                                    <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    <span>{transaction.sourceWarehouseName || transaction.sourceWarehouseId || '—'}</span>
                                </div>
                            </div>

                            {transaction.targetWarehouseId && (
                                <div>
                                    <span className="text-[11px] text-zinc-500 block">Hədəf Anbar (Transfer)</span>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-cyan-400">
                                        <BuildingStorefrontIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        <span>{transaction.targetWarehouseName || transaction.targetWarehouseId}</span>
                                    </div>
                                </div>
                            )}

                            {transaction.referenceNumber && (
                                <div>
                                    <span className="text-[11px] text-zinc-500 block">Referans / Sənəd №</span>
                                    <span className="font-mono text-zinc-300 mt-0.5 block">{transaction.referenceNumber}</span>
                                </div>
                            )}

                            <div>
                                <span className="text-[11px] text-zinc-500 block">Əməliyyat Tarixi</span>
                                <span className="text-zinc-300 mt-0.5 block">{formatDate(transaction.transactionDate)}</span>
                            </div>

                            <div>
                                <span className="text-[11px] text-zinc-500 block">Uçot (Posting) Tarixi</span>
                                <span className="text-zinc-300 mt-0.5 block">{formatDate(transaction.postingDate)}</span>
                            </div>

                            {transaction.notes && (
                                <div className="pt-2 border-t border-[#27272A]">
                                    <span className="text-[11px] text-zinc-500 block">Qeydlər</span>
                                    <p className="mt-0.5 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 text-xs leading-relaxed">
                                        {transaction.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Card: Line Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                Əməliyyat Sətirləri ({(transaction.lines || []).length} məhsul)
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                        <th className="py-3 px-4">#</th>
                                        <th className="py-3 px-4">Məhsul / Təsvir</th>
                                        <th className="py-3 px-4 text-right">Miqdar</th>
                                        <th className="py-3 px-4 text-right">Vahid Maya Dəyəri</th>
                                        <th className="py-3 px-4 text-right">Cəmi Dəyər</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]">
                                    {(!transaction.lines || transaction.lines.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-zinc-500">
                                                Heç bir sətir məlumatı mövcud deyil.
                                            </td>
                                        </tr>
                                    ) : (
                                        transaction.lines.map((line, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-4 text-zinc-500 font-mono">{idx + 1}</td>
                                                <td className="py-3 px-4 font-semibold text-white">
                                                    <div>{line.description || line.itemName || line.itemCode || 'Məhsul'}</div>
                                                    {line.itemCode && (
                                                        <div className="text-[10px] font-mono text-zinc-500">
                                                            SKU: {line.itemCode}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                    {Number(line.quantity).toLocaleString('az-AZ')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono text-zinc-400">
                                                    {formatCurrency(Number(line.unitCost))}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency((Number(line.quantity) || 0) * (Number(line.unitCost) || 0))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-[#27272A] bg-white/5 font-semibold text-xs text-white">
                                        <td colSpan={2} className="py-3.5 px-4 text-right text-zinc-400">Yekun:</td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                            {totalQty.toLocaleString('az-AZ')}
                                        </td>
                                        <td className="py-3.5 px-4"></td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                            {formatCurrency(transaction.totalValue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTransactionDetailPage;

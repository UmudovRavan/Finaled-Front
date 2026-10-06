import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { procurementService } from '../../api';
import { formatDate } from '../../utils';
import type { GoodsReceiptDto } from '../../dto';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    InboxArrowDownIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    DocumentTextIcon,
    TagIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export const GoodsReceiptDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState<GoodsReceiptDto | null>(null);
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
            const data = await procurementService.getGoodsReceipt(id);
            setReceipt(data);
        } catch (err: any) {
            console.error('Failed to load goods receipt detail:', err);
            setError(extractErrorMessage(err) || 'Malların qəbulu sənədi tapılmadı.');
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

    const handlePostReceipt = async () => {
        if (!receipt?.id) return;
        setIsPosting(true);
        try {
            const updated = await procurementService.postGoodsReceipt(receipt.id);
            setReceipt(updated);
            showToast('Qəbul sənədi uğurla icra edildi və mallar anbara mədaxil olundu!');
            await loadData(true);
        } catch (err: any) {
            console.error('Failed to post goods receipt:', err);
            const msg = extractErrorMessage(err);
            showToast(msg, 'error');
        } finally {
            setIsPosting(false);
        }
    };

    const getStatusInfo = (status: any) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('post') || status === 4) {
            return {
                label: 'İcra Edilib',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                dot: 'bg-emerald-400',
                desc: 'Mallar anbara mədaxil olunub və uçota alınıb.',
            };
        }
        if (s.includes('appr') || status === 3) {
            return {
                label: 'Təsdiqlənib',
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/20',
                text: 'text-cyan-400',
                dot: 'bg-cyan-400',
                desc: 'Sənəd təsdiqlənib, icra üçün hazırdır.',
            };
        }
        if (s.includes('sub') || status === 2) {
            return {
                label: 'Təqdim Edilib',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                text: 'text-blue-400',
                dot: 'bg-blue-400',
                desc: 'Sənəd yoxlanışdadır.',
            };
        }
        if (s.includes('canc') || status === 5) {
            return {
                label: 'Ləğv Edilib',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                dot: 'bg-rose-400',
                desc: 'Bu qəbul sənədi ləğv edilmişdir.',
            };
        }
        return {
            label: 'Qaralama',
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
            dot: 'bg-neutral-400',
            desc: 'Sənəd qaralama halındadır. Anbara mədaxil üçün icra edin.',
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#71717A] space-y-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-xs">Malların qəbulu sənədi yüklənir...</p>
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="max-w-xl mx-auto my-12 p-6 rounded-3xl bg-[#121214] border border-[#27272A] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                    <ExclamationCircleIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-white">Sənəd Tapılmadı</h2>
                <p className="text-xs text-[#A1A1AA]">{error || 'Axtardığınız malların qəbulu sənədi mövcud deyil.'}</p>
                <div className="pt-2">
                    <button
                        onClick={() => navigate('/goods-receipts')}
                        className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
                    >
                        Siyahıya Qayıt
                    </button>
                </div>
            </div>
        );
    }

    const statusObj = getStatusInfo(receipt.status);
    const isDraft = String(receipt.status || '').toLowerCase().includes('draft') || receipt.status === 1;
    const totalLinesCount = (receipt.lines || []).reduce(
        (sum, l) => sum + (Number(l.receivedQuantity ?? l.quantityReceived) || 0),
        0
    );

    return (
        <div className="space-y-5 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-200">
            {/* ─── Header & Breadcrumbs ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs text-[#71717A]">
                        <Link to="/goods-receipts" className="hover:text-white transition-colors">
                            Malların Qəbulu
                        </Link>
                        <span>/</span>
                        <span className="text-[#E4E4E7] font-medium font-mono">{receipt.receiptNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Link
                            to="/goods-receipts"
                            className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors"
                            title="Geriyə"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                        </Link>
                        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                            <span>Qəbul:</span>
                            <span className="font-mono text-white">{receipt.receiptNumber}</span>
                        </h1>
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${statusObj.bg} ${statusObj.border} ${statusObj.text}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors disabled:opacity-50"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-300' : ''}`} />
                    </button>

                    {isDraft && (
                        <button
                            onClick={handlePostReceipt}
                            disabled={isPosting}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-white font-medium text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {isPosting ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 text-zinc-400" />}
                            <span>Sənədi İcra Et (Post)</span>
                        </button>
                    )}

                    <Link
                        to="/supplier-invoices"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-sm active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Faktura Yarat</span>
                    </Link>
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

            {/* ─── 4 Metric KPI Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Grand Total */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">Yekun Dəyər</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <CurrencyDollarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {(receipt.totalValue || 0).toLocaleString('az-AZ', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        <span className="text-xs text-[#71717A] ml-1.5 font-medium">AZN</span>
                    </div>
                </div>

                {/* 2. Items / Quantity Count */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">Qəbul Miqdarı</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <InboxArrowDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-bold text-white tracking-tight">{totalLinesCount}</span>
                        <span className="text-xs text-[#71717A] ml-1.5 font-medium">ədəd ({(receipt.lines || []).length} çeşid)</span>
                    </div>
                </div>

                {/* 3. Receipt Date */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">Qəbul Tarixi</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-sm font-semibold text-white">
                            {formatDate(receipt.receiptDate)}
                        </span>
                    </div>
                </div>

                {/* 4. Status Description */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">Sənəd Vəziyyəti</span>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${statusObj.bg} ${statusObj.border} ${statusObj.text}`}>
                            <TagIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className={`text-xs font-semibold ${statusObj.text}`}>{statusObj.label}</span>
                        <p className="text-[11px] text-[#71717A] mt-0.5 line-clamp-1">{statusObj.desc}</p>
                    </div>
                </div>
            </div>

            {/* ─── Main Content Grid: Metadata & Line Items ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Card: Sənəd Məlumatları */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-5 rounded-3xl bg-[#121214] border border-[#27272A] space-y-4">
                        <h2 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-[#27272A] pb-3">
                            Qəbul Məlumatları
                        </h2>

                        <div className="space-y-3.5 text-xs">
                            {/* Təchizatçı */}
                            <div>
                                <span className="text-[#71717A] block mb-1">Təchizatçı</span>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <div className="w-6 h-6 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] text-[10px] font-bold">
                                        {(receipt.supplierName || 'T')[0]}
                                    </div>
                                    <Link
                                        to={`/suppliers/${receipt.supplierId}`}
                                        className="hover:text-emerald-400 hover:underline transition-colors"
                                    >
                                        {receipt.supplierName || 'Təchizatçı'}
                                    </Link>
                                </div>
                            </div>

                            {/* Anbar */}
                            <div>
                                <span className="text-[#71717A] block mb-1">Mədaxil Anbarı</span>
                                <div className="flex items-center gap-2 text-[#E4E4E7]">
                                    <BuildingOffice2Icon className="w-4 h-4 text-zinc-400" />
                                    <span>{receipt.warehouseName || 'Əsas Anbar'}</span>
                                </div>
                            </div>

                            {/* Əlaqəli Sifariş */}
                            {receipt.purchaseOrderId && (
                                <div>
                                    <span className="text-[#71717A] block mb-1">Əlaqəli Sifariş (PO)</span>
                                    <Link
                                        to={`/purchase-orders/${receipt.purchaseOrderId}`}
                                        className="font-mono text-zinc-300 hover:text-white hover:underline inline-flex items-center gap-1"
                                    >
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{receipt.purchaseOrderNumber || receipt.purchaseOrderId}</span>
                                    </Link>
                                </div>
                            )}

                            {/* İrsaliyə / Faktura № */}
                            <div>
                                <span className="text-[#71717A] block mb-1">İrsaliyə / Faktura №</span>
                                <span className="text-white font-mono">{receipt.waybillNumber || '—'}</span>
                            </div>

                            {/* Qəbul Tarixi */}
                            <div>
                                <span className="text-[#71717A] block mb-1">Qəbul Tarixi</span>
                                <span className="text-white">{formatDate(receipt.receiptDate)}</span>
                            </div>

                            {/* Uçot Tarixi */}
                            {receipt.postingDate && (
                                <div>
                                    <span className="text-[#71717A] block mb-1">Uçot (Posting) Tarixi</span>
                                    <span className="text-white">{formatDate(receipt.postingDate)}</span>
                                </div>
                            )}


                            {/* Qeydlər */}
                            {receipt.notes && (
                                <div className="pt-2 border-t border-[#27272A]">
                                    <span className="text-[#71717A] block mb-1">Qeydlər və Təhvil-təslim</span>
                                    <p className="text-[#A1A1AA] text-xs bg-[#18181B] p-2.5 rounded-xl border border-[#27272A] leading-relaxed">
                                        {receipt.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Card: Mədaxil Sətirləri */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-5 rounded-3xl bg-[#121214] border border-[#27272A] space-y-4">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                                Mədaxil Sətirləri
                            </h2>
                            <span className="text-xs text-[#71717A]">
                                Toplam: <span className="text-white font-medium">{(receipt.lines || []).length}</span> sətir
                            </span>
                        </div>

                        {/* Line Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] text-[11px] font-semibold tracking-wider uppercase">
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">Məhsul / Təsvir</th>
                                        <th className="py-2.5 px-3 text-right">Qəbul Sayı</th>
                                        <th className="py-2.5 px-3 text-right">Vahid Maya</th>
                                        <th className="py-2.5 px-3 text-right">Cəmi Dəyər</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-xs">
                                    {(!receipt.lines || receipt.lines.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-[#71717A]">
                                                Sətir məlumatı mövcud deyil.
                                            </td>
                                        </tr>
                                    ) : (
                                        receipt.lines.map((line, idx) => {
                                            const qty = Number(line.receivedQuantity ?? line.quantityReceived) || 1;
                                            const unitCost = Number(line.unitCost) || 0;
                                            const totalCost = Number(line.totalCost) || qty * unitCost;

                                            return (
                                                <tr key={line.id || idx} className="hover:bg-[#18181B]/40 transition-colors">
                                                    <td className="py-3 px-3 text-[#71717A] font-mono">{idx + 1}</td>
                                                    <td className="py-3 px-3 text-white font-medium">
                                                        <div>{line.description || line.itemCode || 'Məhsul'}</div>
                                                        {line.itemCode && (
                                                            <span className="text-[10px] text-[#71717A] font-mono">
                                                                Kod: {line.itemCode}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-white font-semibold">{qty}</td>
                                                    <td className="py-3 px-3 text-right text-[#E4E4E7]">
                                                        {unitCost.toFixed(2)} <span className="text-[10px] text-[#71717A]">AZN</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-white font-semibold">
                                                        {totalCost.toFixed(2)} <span className="text-[10px] text-[#71717A]">AZN</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Footer */}
                        <div className="pt-3 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="text-[#71717A]">
                                <span>Toplam qəbul edilən məhsul vahidi: </span>
                                <span className="text-white font-semibold">{totalLinesCount}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[#71717A] mr-2">Yekun Mədaxil Dəyəri:</span>
                                <span className="text-base font-bold text-white">
                                    {(receipt.totalValue || 0).toLocaleString('az-AZ', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{' '}
                                    AZN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoodsReceiptDetailPage;

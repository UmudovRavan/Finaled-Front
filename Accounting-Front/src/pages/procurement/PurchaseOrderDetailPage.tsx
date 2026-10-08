import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { procurementService } from '../../api';
import type { PurchaseOrderDto } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ShoppingBagIcon,
    CalendarIcon,
    TruckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    DocumentTextIcon,
    PlusIcon,
    BuildingOffice2Icon,
    TagIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export const PurchaseOrderDetailPage: React.FC = () => {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<PurchaseOrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [error, setError] = useState('');

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');

        try {
            const data = await procurementService.getPurchaseOrder(id);
            setOrder(data);
        } catch (err: any) {
            console.error('[PurchaseOrderDetailPage] Error:', err);
            setError(err.message || 'Satınalma sifarişi tapılmadı.');
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

    const handleApprove = async () => {
        if (!order) return;
        setIsApproving(true);
        try {
            await procurementService.approvePurchaseOrder(order.id);
            showToast('Sifariş uğurla təsdiqləndi!', 'success');
            loadData(true);
        } catch (err: any) {
            console.error('[PurchaseOrderDetailPage] Approve error:', err);
            showToast(err.response?.data?.message || 'Təsdiqləmək mümkün olmadı.', 'error');
        } finally {
            setIsApproving(false);
        }
    };

    const getStatusBadge = (status: any) => {
        const str = String(status || '').toLowerCase();
        if (str === 'approved' || str === '3') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {t('statuses.APPROVED', {}, 'Təsdiqlənib')}
                </span>
            );
        }
        if (str === 'received' || str === 'partiallyreceived' || str === 'fullyreceived' || str === 'completed' || str === '4' || str === '5' || str === '6') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {t('statuses.RECEIVED', {}, 'Qəbul Edilib')}
                </span>
            );
        }
        if (str === 'cancelled' || str === '7') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    {t('statuses.CANCELLED', {}, 'Ləğv Edilib')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                {t('statuses.DRAFT', {}, 'Qaralama')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#A1A1AA]">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
                <span className="text-xs">{t('common.loading', {}, 'Satınalma sifarişi yüklənir...')}</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <ExclamationCircleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t('common.notFound', {}, 'Sifariş Tapılmadı')}</h3>
                <p className="text-xs text-[#A1A1AA]">{error || t('common.noData', {}, 'Axtardığınız satınalma sifarişi mövcud deyil.')}</p>
                <button
                    onClick={() => navigate('/purchase-orders')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                    {t('procurement.poTitle', {}, 'Sifarişlər Siyahısına Qayıt')}
                </button>
            </div>
        );
    }

    const total = Number(order.grandTotal ?? order.totalAmount ?? 0);
    const subTotal = Number(order.subTotal ?? (total > 0 ? Number((total / 1.18).toFixed(2)) : 0));
    const taxTotal = Number(order.taxTotal ?? Math.max(0, Number((total - subTotal).toFixed(2))));
    const isDraft = String(order.status) === 'Draft' || String(order.status) === '1';
    const lines = Array.isArray(order.lines) ? order.lines : [];

    return (
        <div className="space-y-4 font-sans text-white">
            {/* ─── Breadcrumb & Top Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                    <button
                        onClick={() => navigate('/purchase-orders')}
                        className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white hover:bg-white/10 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t('procurement.poTitle', {}, 'Sifarişlər')}</span>
                    </button>
                    <span className="text-[#52525B]">/</span>
                    <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                    <span className="text-[#52525B]">/</span>
                    <span className="text-[#A1A1AA]">{t('procurement.poDetails', {}, 'Detallar')}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    {isDraft && (
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isApproving ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
                            )}
                            <span>{t('invoices.post', {}, 'Sifarişi Təsdiqlə')}</span>
                        </button>
                    )}

                    <Link
                        to="/supplier-invoices"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('procurement.newSupplierInvoice', {}, 'Alış Fakturası Tərtib Et')}</span>
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
                        <span className="text-xs font-medium">{t('invoices.grandTotal', {}, 'Yekun Məbləğ')}</span>
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CurrencyDollarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-emerald-400">
                            {formatCurrency(total, order.currency)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('invoices.taxInclusive', {}, 'ƏDV daxil yekun məbləğ')}</span>
                    </div>
                </div>

                {/* 2. Subtotal */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('invoices.subTotal', {}, 'Xalis Məbləğ')}</span>
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <DocumentTextIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-white">
                            {formatCurrency(subTotal, order.currency)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('invoices.taxExclusive', {}, 'ƏDV-siz sifariş dəyəri')}</span>
                    </div>
                </div>

                {/* 3. Tax Amount */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('invoices.taxAmount', {}, 'Hesablanmış ƏDV')}</span>
                        <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <TagIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-white">
                            {formatCurrency(taxTotal, order.currency)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('invoices.taxRate', {}, '18% standart vergi')}</span>
                    </div>
                </div>

                {/* 4. Status */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('common.status', {}, 'Sifariş Statusu')}</span>
                        <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300">
                            <ShoppingBagIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-sm font-bold">
                            {getStatusBadge(order.status)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-1 block">{t('common.date', {}, 'Tarix')}: {formatDate(order.orderDate)}</span>
                    </div>
                </div>
            </div>

            {/* ─── Details Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Card: PO Overview */}
                <div className="lg:col-span-1 rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                        <div>
                            <h3 className="text-sm font-bold text-white">{t('procurement.poDetails', {}, 'Sifariş Məlumatları')}</h3>
                            <span className="text-xs font-mono text-zinc-400">{order.orderNumber}</span>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <BuildingOffice2Icon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('procurement.supplierName', {}, 'Təchizatçı')}:
                            </span>
                            <Link
                                to={`/suppliers/${order.supplierId}`}
                                className="font-semibold text-white hover:text-zinc-300 text-right underline underline-offset-2"
                            >
                                {order.supplierName || 'Təchizatçı'}
                            </Link>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('procurement.orderDate', {}, 'Sifariş Tarixi')}:
                            </span>
                            <span className="text-white font-medium">{formatDate(order.orderDate)}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <TruckIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('procurement.expectedDate', {}, 'Gözlənilən Çatdırılma')}:
                            </span>
                            <span className="text-white font-medium">{formatDate(order.expectedDeliveryDate)}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <CurrencyDollarIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('common.currency', {}, 'Valyuta')}:
                            </span>
                            <span className="font-mono text-white font-bold">{order.currency || 'AZN'}</span>
                        </div>

                        {order.notes && (
                            <div className="pt-2 border-t border-[#27272A]/60">
                                <span className="text-[11px] text-[#71717A] block mb-1 font-semibold">{t('common.description', {}, 'Qeydlər və Şərtlər')}:</span>
                                <p className="text-xs text-zinc-300 bg-[#18181B] p-2.5 rounded-xl border border-[#27272A] whitespace-pre-wrap">
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Card: Line Items Table */}
                <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-3.5 border-b border-[#27272A] bg-[#18181B]/60 text-xs">
                        <span className="font-bold text-white text-xs">{t('invoices.lines', {}, 'Sifariş Sətirləri')} ({lines.length || '1+'})</span>
                        <span className="font-mono text-[#71717A] text-[11px]">{t('common.total', {}, 'Yekun')}: {formatCurrency(total, order.currency)}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B]/40 text-[#A1A1AA] text-[11px] font-bold">
                                    <th className="py-2.5 px-3">№</th>
                                    <th className="py-2.5 px-3">{t('common.description', {}, 'Təsvir / Məhsul')}</th>
                                    <th className="py-2.5 px-3 text-right">{t('invoices.quantity', {}, 'Miqdar')}</th>
                                    <th className="py-2.5 px-3 text-right">{t('invoices.unitPrice', {}, 'Vahid Qiymət')}</th>
                                    <th className="py-2.5 px-3 text-right">{t('invoices.taxAmount', {}, 'ƏDV')}</th>
                                    <th className="py-2.5 px-3 text-right">{t('common.total', {}, 'Sətir Cəmi')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/60">
                                {lines.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#71717A]">
                                            {t('common.noData', {}, 'Sifariş üzrə xüsusi sətir məlumatları saxlanmayıb.')}
                                        </td>
                                    </tr>
                                ) : (
                                    lines.map((l, idx) => {
                                        const qty = Number(l.quantity) || 1;
                                        const price = Number(l.unitPrice) || 0;
                                        const taxR = Number(l.taxRate ?? 18);
                                        const sub = qty * price;
                                        const tot = sub * (1 + taxR / 100);

                                        return (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-3 font-mono text-[#71717A]">{idx + 1}</td>
                                                <td className="py-2.5 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white">{l.description || 'Məhsul'}</span>
                                                        {l.itemCode && <span className="font-mono text-[11px] text-zinc-400">{l.itemCode}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-medium text-white">{qty}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-[#A1A1AA]">{formatCurrency(price, order.currency)}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-[#71717A]">{taxR}%</td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatCurrency(tot, order.currency)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-auto p-4 border-t border-[#27272A] bg-[#18181B]/60 flex flex-wrap items-center justify-end gap-6 text-xs font-mono">
                        <div className="text-[#A1A1AA]">
                            {t('invoices.subTotal', {}, 'Xalis')}: <strong className="text-white ml-1">{formatCurrency(subTotal, order.currency)}</strong>
                        </div>
                        <div className="text-[#A1A1AA]">
                            {t('invoices.taxAmount', {}, 'ƏDV (18%)')}: <strong className="text-white ml-1">{formatCurrency(taxTotal, order.currency)}</strong>
                        </div>
                        <div className="text-white font-bold text-sm">
                            {t('invoices.grandTotal', {}, 'Yekun')}: <span className="text-emerald-400 ml-1">{formatCurrency(total, order.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetailPage;

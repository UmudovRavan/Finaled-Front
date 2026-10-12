import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salesService } from '../../api';
import type { DeliveryNoteDto } from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    TruckIcon,
    CheckIcon,
    XMarkIcon,
    ReceiptPercentIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    PrinterIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val: number, cur = 'AZN'): string => {
    return `${(val || 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

export const DeliveryNoteDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [delivery, setDelivery] = useState<DeliveryNoteDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'lines' | 'logistics' | 'notes'>('lines');
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await salesService.getDeliveryById(id);
            setDelivery(data);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Təhvil irsaliyyəsi yüklənərkən xəta baş verdi.'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handlePost = async () => {
        if (!delivery) return;
        setActionLoading(true);
        try {
            await salesService.postDelivery(delivery.id);
            showToast('Təhvil uğurla təsdiqləndi: Real stok anbardan silindi və maya dəyəri (COGS) uçota alındı!');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Təsdiqləmə zamanı xəta baş verdi.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateInvoice = () => {
        if (!delivery) return;
        navigate('/customer-invoices', {
            state: {
                openCreateModal: true,
                customerId: delivery.customerId,
                deliveryNoteId: delivery.id,
                salesOrderId: delivery.salesOrderId,
                notes: `Təhvil İrsaliyyəsi: ${delivery.deliveryNumber}`,
            },
        });
    };

    const getStatusBadge = (status: any, statusName: string) => {
        const s = (statusName || String(status)).toLowerCase();
        if (s.includes('draft') || status === 1) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                    Qaralama
                </span>
            );
        }
        if (s.includes('posted') || status === 2) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Uçota Alınıb
                </span>
            );
        }
        if (s.includes('invoice') || status === 3) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                    Qaimələnib
                </span>
            );
        }
        if (s.includes('cancel') || status === 4) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    Ləğv Edilib
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                {statusName || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#A1A1AA]">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
                <span className="text-xs">İrsaliyyə məlumatları yüklənir...</span>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/sales/deliveries')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>İrsaliyyələr siyahısına qayıt</span>
                </button>
                <div className="p-12 text-center text-xs text-[#71717A] bg-[#121214] border border-[#27272A] rounded-2xl">
                    Təhvil irsaliyyəsi tapılmadı.
                </div>
            </div>
        );
    }

    const isDraft = delivery.statusName === 'Draft' || delivery.status === 1;
    const isPosted = delivery.statusName === 'Posted' || delivery.status === 2;

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Toast Notification ─── */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* ─── Top Header (Breadcrumb & Action buttons) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => navigate('/sales/deliveries')}
                        className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/sales/deliveries" className="text-[#A1A1AA] hover:text-white transition-colors">
                            {t('sales.deliveriesTitle', {}, 'Mal Göndərişi')}
                        </Link>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-mono font-bold">
                            <TruckIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{delivery.deliveryNumber}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Post and issue goods from warehouse */}
                    {isDraft && (
                        <button
                            type="button"
                            onClick={handlePost}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    <span>Təsdiqlənir...</span>
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>Təsdiqlə & Anbardan Sil</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Issue Invoice from posted delivery */}
                    {isPosted && (
                        <button
                            type="button"
                            onClick={handleCreateInvoice}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                        >
                            <ReceiptPercentIcon className="w-4 h-4 stroke-[2]" />
                            <span>e-Qaimə Kəs</span>
                        </button>
                    )}

                    {/* Print Button */}
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Çap et"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ─── Summary Overview Card ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0 mt-0.5">
                            <TruckIcon className="w-6 h-6 stroke-[1.75] text-white" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                                    {delivery.deliveryNumber}
                                </h2>
                                {getStatusBadge(delivery.status, delivery.statusName)}
                                {delivery.trackingNumber && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A] font-mono">
                                        İzləmə: {delivery.trackingNumber}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-[#A1A1AA]">
                                <span className="flex items-center gap-1.5">
                                    <BuildingOfficeIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Müştəri:</span>
                                    <Link to={`/customers/${delivery.customerId}`} className="text-white font-semibold hover:underline">
                                        {delivery.customerName}
                                    </Link>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <ArchiveBoxIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Anbar:</span>
                                    <strong className="text-white">{delivery.warehouseName}</strong>
                                </span>
                                {delivery.salesOrderNumber && (
                                    <span className="flex items-center gap-1.5">
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                        <span className="text-[#71717A]">Sifariş №:</span>
                                        {delivery.salesOrderId ? (
                                            <Link to={`/sales/orders/${delivery.salesOrderId}`} className="text-white font-mono font-semibold hover:underline">
                                                {delivery.salesOrderNumber}
                                            </Link>
                                        ) : (
                                            <strong className="text-white font-mono">{delivery.salesOrderNumber}</strong>
                                        )}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <CalendarDaysIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Təhvil Tarixi:</span>
                                    <strong className="text-white">{formatDate(delivery.deliveryDate)}</strong>
                                </span>
                                {delivery.postingDate && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-[#71717A]">Uçot Tarixi:</span>
                                        <strong className="text-white">{formatDate(delivery.postingDate)}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cost / Items Overview */}
                    <div className="flex items-center gap-4 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A] shrink-0">
                        <div className="text-right">
                            <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Məhsul Sayı</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {delivery.lines?.length || 0} növ
                            </span>
                        </div>
                        <div className="w-px h-8 bg-[#27272A]" />
                        <div className="text-right">
                            <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Cəmi Ədədlər</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {delivery.lines?.reduce((sum, l) => sum + (l.quantity || 0), 0) || 0} ədəd
                            </span>
                        </div>
                        {delivery.totalCost > 0 && (
                            <>
                                <div className="w-px h-8 bg-[#27272A]" />
                                <div className="text-right">
                                    <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Maya Dəyəri</span>
                                    <span className="text-sm font-mono font-bold text-white">
                                        {formatCurrency(delivery.totalCost)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── Navigation Tabs ─── */}
                <div className="flex items-center gap-1 mt-5 pt-4 border-t border-[#27272A] overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('lines')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'lines'
                                ? 'bg-white text-black font-semibold shadow-xs'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <DocumentTextIcon className="w-3.5 h-3.5" />
                        <span>Təhvil Verilən Məhsullar ({delivery.lines?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('logistics')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'logistics'
                                ? 'bg-white text-black font-semibold shadow-xs'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <TruckIcon className="w-3.5 h-3.5" />
                        <span>Logistika & Daşıma Məlumatları</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'notes'
                                ? 'bg-white text-black font-semibold shadow-xs'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <ReceiptPercentIcon className="w-3.5 h-3.5" />
                        <span>Qeydlər & Audit</span>
                    </button>
                </div>
            </div>

            {/* ─── TAB 1: Məhsul Sətirləri ─── */}
            {activeTab === 'lines' && (
                <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                    <div className="p-3.5 border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                            İrsaliyyə Üzrə Çıxarılan Məhsullar
                        </span>
                        <span className="text-xs text-[#71717A]">
                            Cəmi: <strong className="text-white font-mono">{delivery.lines?.length || 0}</strong> sətir
                        </span>
                    </div>

                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                    <th className="py-3 px-4 w-12 text-center">№</th>
                                    <th className="py-3 px-4 min-w-[200px]">Məhsul</th>
                                    <th className="py-3 px-4 min-w-[200px]">Təsvir</th>
                                    <th className="py-3 px-4 text-center w-32">Təhvil Sayı</th>
                                    {delivery.totalCost > 0 && (
                                        <>
                                            <th className="py-3 px-4 text-right w-36">Vahid Maya</th>
                                            <th className="py-3 px-4 text-right w-36">Cəmi Maya</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/60">
                                {delivery.lines && delivery.lines.length > 0 ? (
                                    delivery.lines.map((line, idx) => (
                                        <tr key={line.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4 text-center text-[#71717A] font-mono">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-white">
                                                    {line.itemName || line.description}
                                                </div>
                                                {line.itemCode && (
                                                    <span className="text-[10px] text-[#71717A] font-mono">
                                                        Kod: {line.itemCode}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {line.description || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold text-white">
                                                {line.quantity}
                                            </td>
                                            {delivery.totalCost > 0 && (
                                                <>
                                                    <td className="py-3 px-4 text-right font-mono text-white">
                                                        {formatCurrency(line.unitCost || 0)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                        {formatCurrency(line.totalCost || (line.quantity * (line.unitCost || 0)))}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#71717A]">
                                            Heç bir məhsul sətri mövcud deyil.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── TAB 2: Logistika & Daşıma ─── */}
            {activeTab === 'logistics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            Nəqliyyat və Sürücü Rekvizitləri
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Sürücünün Adı:</span>
                                <span className="font-semibold text-white">{delivery.driverName || 'Təyin edilməyib'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Avtomobil Nömrəsi:</span>
                                <span className="font-mono font-bold text-white">{delivery.vehicleNumber || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">İzləmə Kodu / Qaimə №:</span>
                                <span className="font-mono text-white">{delivery.trackingNumber || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            Anbar və Çatdırılma Yeri
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Çıxış Anbarı:</span>
                                <span className="font-semibold text-white">{delivery.warehouseName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Təhvil Tarixi:</span>
                                <span className="font-mono text-white">{formatDate(delivery.deliveryDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Uçot / Silinmə Tarixi:</span>
                                <span className="font-mono text-white">{formatDate(delivery.postingDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 3: Qeydlər & Audit ─── */}
            {activeTab === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            İrsaliyyə Qeydləri
                        </h3>
                        <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                            {delivery.notes || 'Heç bir xüsusi qeyd qeyd olunmayıb.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            Sistem Qeydiyyat Rekvizitləri
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Sistem ID:</span>
                                <span className="font-mono text-[#A1A1AA]">{delivery.id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Sifariş ID:</span>
                                <span className="font-mono text-[#A1A1AA]">{delivery.salesOrderId || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Müştəri ID:</span>
                                <span className="font-mono text-[#A1A1AA]">{delivery.customerId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Status:</span>
                                <span className="font-semibold text-white">{delivery.statusName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryNoteDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salesService, inventoryService } from '../../api';
import type {
    SalesOrderDto,
    DeliveryNoteDto,
    WarehouseDto,
    CreateDeliveryNoteDto,
} from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    TruckIcon,
    CheckIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ReceiptPercentIcon,
    PrinterIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val: number, cur = 'AZN'): string => {
    return `${(val || 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

export const SalesOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [order, setOrder] = useState<SalesOrderDto | null>(null);
    const [deliveries, setDeliveries] = useState<DeliveryNoteDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'lines' | 'deliveries' | 'notes'>('lines');
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Create Delivery Modal
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryWarehouseId, setDeliveryWarehouseId] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
    const [driverName, setDriverName] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [deliveryLines, setDeliveryLines] = useState<{ salesOrderLineId: string; itemId: string; description: string; quantity: number }[]>([]);
    const [deliveryLoading, setDeliveryLoading] = useState(false);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [orderData, allDeliveries, whData] = await Promise.all([
                salesService.getOrderById(id),
                salesService.getDeliveries().catch(() => []),
                inventoryService.getWarehouses().catch(() => []),
            ]);

            setOrder(orderData);
            setWarehouses(whData);

            // Filter deliveries linked to this sales order
            const linkedDeliveries = allDeliveries.filter(
                (d) => d.salesOrderId === id || (orderData.orderNumber && d.salesOrderNumber === orderData.orderNumber)
            );
            setDeliveries(linkedDeliveries);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş məlumatları yüklənərkən xəta baş verdi.'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleConfirm = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            await salesService.confirmOrder(order.id);
            showToast('Sifariş uğurla təsdiqləndi və çatdırılmaya hazırlandı!');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş təsdiqlənərkən xəta baş verdi.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!order) return;
        if (!window.confirm('Bu sifarişi ləğv etmək istədiyinizdən əminsiniz?')) return;
        setActionLoading(true);
        try {
            await salesService.cancelOrder(order.id);
            showToast('Sifariş ləğv edildi.');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş ləğv edilərkən xəta baş verdi.'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openDeliveryModal = () => {
        if (!order) return;
        setDeliveryWarehouseId(warehouses[0]?.id || '');
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setDriverName('');
        setVehicleNumber('');
        setTrackingNumber('');
        setDeliveryLines(
            order.lines
                .filter((l) => (l.remainingDeliveryQuantity ?? (l.quantity - (l.deliveredQuantity || 0))) > 0)
                .map((l) => ({
                    salesOrderLineId: l.id,
                    itemId: l.itemId || '',
                    description: l.description,
                    quantity: l.remainingDeliveryQuantity ?? (l.quantity - (l.deliveredQuantity || 0)),
                }))
        );
        setShowDeliveryModal(true);
    };

    const handleCreateDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        if (!deliveryWarehouseId) {
            showToast('Zəhmət olmasa təhvil veriləcək anbarı seçin.', 'error');
            return;
        }

        const validLines = deliveryLines.filter((l) => Number(l.quantity) > 0 && l.itemId);
        if (validLines.length === 0) {
            showToast('Təhvil veriləcək ən azı 1 məhsul sətri olmalıdır.', 'error');
            return;
        }

        setDeliveryLoading(true);
        try {
            const payload: CreateDeliveryNoteDto = {
                salesOrderId: order.id,
                customerId: order.customerId,
                warehouseId: deliveryWarehouseId,
                deliveryDate: new Date(deliveryDate).toISOString(),
                driverName: driverName || null,
                vehicleNumber: vehicleNumber || null,
                trackingNumber: trackingNumber || null,
                notes: `Sifariş əsasında: ${order.orderNumber}`,
                lines: validLines.map((l) => ({
                    salesOrderLineId: l.salesOrderLineId,
                    itemId: l.itemId,
                    description: l.description,
                    quantity: Number(l.quantity),
                })),
            };

            await salesService.createDelivery(payload);
            showToast('Mal göndəriş / Təhvil aktı sənədi uğurla yaradıldı!');
            setShowDeliveryModal(false);
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Təhvil aktı yaradılarkən xəta baş verdi.'), 'error');
        } finally {
            setDeliveryLoading(false);
        }
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
        if (s.includes('confirmed') || status === 2) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Təsdiqlənib
                </span>
            );
        }
        if (s.includes('partial') || status === 3) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                    Hissəvi Təhvil
                </span>
            );
        }
        if (s.includes('fully') || s.includes('delivered') || status === 4) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                    Tam Çatdırılıb
                </span>
            );
        }
        if (s.includes('invoice') || status === 5) {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                    Qaiməsi Kəsilib
                </span>
            );
        }
        if (s.includes('cancel') || status === 6) {
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
                <span className="text-xs">Sifariş məlumatları yüklənir...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/sales/orders')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>Sifarişlər siyahısına qayıt</span>
                </button>
                <div className="p-12 text-center text-xs text-[#71717A] bg-[#121214] border border-[#27272A] rounded-2xl">
                    Satış sifarişi tapılmadı.
                </div>
            </div>
        );
    }

    const isDraft = order.statusName === 'Draft' || order.status === 1;
    const isConfirmed = order.statusName === 'Confirmed' || order.status === 2 || order.statusName === 'PartiallyDelivered' || order.status === 3;
    const hasRemainingDelivery = order.lines.some(
        (l) => (l.remainingDeliveryQuantity ?? (l.quantity - (l.deliveredQuantity || 0))) > 0
    );

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
                        onClick={() => navigate('/sales/orders')}
                        className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/sales/orders" className="text-[#A1A1AA] hover:text-white transition-colors">
                            {t('sales.orders', {}, 'Satış Sifarişləri')}
                        </Link>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-mono font-bold">
                            <DocumentTextIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{order.orderNumber}</span>
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

                    {/* Confirm Button */}
                    {isDraft && (
                        <button
                            type="button"
                            onClick={handleConfirm}
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
                                    <span>Sifarişi Təsdiq Et</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Delivery Note Action */}
                    {isConfirmed && hasRemainingDelivery && (
                        <button
                            type="button"
                            onClick={openDeliveryModal}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                        >
                            <TruckIcon className="w-4 h-4 stroke-[2]" />
                            <span>Təhvil İrsaliyyəsi Yarat</span>
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

                    {/* Cancel Button */}
                    {isDraft && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#71717A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Ləğv et"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Summary Overview Card ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0 mt-0.5">
                            <DocumentTextIcon className="w-6 h-6 stroke-[1.75] text-white" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                                    {order.orderNumber}
                                </h2>
                                {getStatusBadge(order.status, order.statusName)}
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                                    {order.currency || 'AZN'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-[#A1A1AA]">
                                <span className="flex items-center gap-1.5">
                                    <BuildingOfficeIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Müştəri:</span>
                                    <Link to={`/customers/${order.customerId}`} className="text-white font-semibold hover:underline">
                                        {order.customerName}
                                    </Link>
                                </span>
                                {order.customerReference && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-[#71717A]">PO №:</span>
                                        <strong className="text-white font-mono">{order.customerReference}</strong>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <CalendarDaysIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Tarix:</span>
                                    <strong className="text-white">{formatDate(order.orderDate)}</strong>
                                </span>
                                {order.expectedDeliveryDate && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-[#71717A]">Gözlənilən Çatdırılma:</span>
                                        <strong className="text-white">{formatDate(order.expectedDeliveryDate)}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="flex items-center gap-4 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A] shrink-0">
                        <div className="text-right">
                            <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Xalis Məbləğ</span>
                            <span className="text-xs font-mono font-bold text-[#A1A1AA]">
                                {formatCurrency(order.subTotal || 0, order.currency)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-[#27272A]" />
                        <div className="text-right">
                            <span className="text-[10px] text-[#71717A] uppercase font-semibold block">ƏDV</span>
                            <span className="text-xs font-mono font-bold text-[#A1A1AA]">
                                {formatCurrency(order.taxTotal || 0, order.currency)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-[#27272A]" />
                        <div className="text-right">
                            <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Yekun Cəm</span>
                            <span className="text-base font-mono font-bold text-white">
                                {formatCurrency(order.grandTotal || 0, order.currency)}
                            </span>
                        </div>
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
                        <span>Sifariş Sətirləri ({order.lines?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('deliveries')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'deliveries'
                                ? 'bg-white text-black font-semibold shadow-xs'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <TruckIcon className="w-3.5 h-3.5" />
                        <span>Təhvil İrsaliyyələri ({deliveries.length})</span>
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
                        <span>Qeydlər & Rekvizitlər</span>
                    </button>
                </div>
            </div>

            {/* ─── TAB 1: Sifariş Sətirləri ─── */}
            {activeTab === 'lines' && (
                <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                    <div className="p-3.5 border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                            Məhsul və Xidmət Sətirləri
                        </span>
                        <span className="text-xs text-[#71717A]">
                            Cəmi: <strong className="text-white font-mono">{order.lines?.length || 0}</strong> sətir
                        </span>
                    </div>

                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                    <th className="py-3 px-4 w-12 text-center">№</th>
                                    <th className="py-3 px-4 min-w-[200px]">Məhsul / Təsvir</th>
                                    <th className="py-3 px-4 text-center w-28">Sifariş Sayı</th>
                                    <th className="py-3 px-4 text-center w-28">Təhvil Verilib</th>
                                    <th className="py-3 px-4 text-center w-28">Qalıq Say</th>
                                    <th className="py-3 px-4 text-right w-32">Qiymət</th>
                                    <th className="py-3 px-4 text-center w-20">Endirim</th>
                                    <th className="py-3 px-4 text-center w-20">ƏDV</th>
                                    <th className="py-3 px-4 text-right w-36">Cəmi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/60">
                                {order.lines && order.lines.length > 0 ? (
                                    order.lines.map((line, idx) => {
                                        const remaining = line.remainingDeliveryQuantity ?? (line.quantity - (line.deliveredQuantity || 0));

                                        return (
                                            <tr key={line.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-4 text-center text-[#71717A] font-mono">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-white">
                                                        {line.description}
                                                    </div>
                                                    {line.itemCode && (
                                                        <span className="text-[10px] text-[#71717A] font-mono">
                                                            Kod: {line.itemCode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono font-bold text-white">
                                                    {line.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono text-[#A1A1AA]">
                                                    {line.deliveredQuantity || 0}
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono font-bold text-white">
                                                    <span className={remaining > 0 ? 'text-white' : 'text-[#71717A]'}>
                                                        {remaining}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono text-white">
                                                    {formatCurrency(line.unitPrice, order.currency)}
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono text-[#A1A1AA]">
                                                    {line.discountPercent ? `${line.discountPercent}%` : '0%'}
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono text-[#A1A1AA]">
                                                    {line.taxRate ? `${line.taxRate}%` : '18%'}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency(line.lineTotal || (line.quantity * line.unitPrice), order.currency)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-[#71717A]">
                                            Heç bir sətir mövcud deyil.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Bottom Totals */}
                    <div className="p-4 border-t border-[#27272A] bg-[#18181B]/40 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
                        <div className="text-xs text-[#71717A]">
                            Bütün qiymətlər ƏDV və endirim daxil hesablanmışdır.
                        </div>

                        <div className="w-full sm:w-72 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[#A1A1AA]">
                                <span>Xalis Cəm (SubTotal):</span>
                                <span className="font-mono text-white">{formatCurrency(order.subTotal || 0, order.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#A1A1AA]">
                                <span>ƏDV Məbləği (Tax):</span>
                                <span className="font-mono text-white">{formatCurrency(order.taxTotal || 0, order.currency)}</span>
                            </div>
                            <div className="w-full h-px bg-[#27272A] my-1" />
                            <div className="flex items-center justify-between font-bold text-white text-sm">
                                <span>Yekun Məbləğ:</span>
                                <span className="font-mono">{formatCurrency(order.grandTotal || 0, order.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 2: Təhvil İrsaliyyələri ─── */}
            {activeTab === 'deliveries' && (
                <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                    <div className="p-3.5 border-b border-[#27272A] flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                            Bağlı Təhvil İrsaliyyələri (Delivery Notes)
                        </span>
                        {isConfirmed && hasRemainingDelivery && (
                            <button
                                type="button"
                                onClick={openDeliveryModal}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-xs text-white transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Yeni Təhvil İrsaliyyəsi</span>
                            </button>
                        )}
                    </div>

                    {deliveries.length === 0 ? (
                        <div className="p-12 text-center text-xs text-[#71717A] flex flex-col items-center gap-2">
                            <TruckIcon className="w-6 h-6 text-[#71717A]" />
                            <span>Bu sifariş üzrə hələ heç bir təhvil irsaliyyəsi tərtib edilməyib.</span>
                            {isConfirmed && (
                                <button
                                    type="button"
                                    onClick={openDeliveryModal}
                                    className="mt-2 px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs transition-colors cursor-pointer hover:bg-zinc-200"
                                >
                                    İlk İrsaliyyəni Yarat
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto scrollbar-none">
                            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                        <th className="py-3 px-4">İrsaliyyə №</th>
                                        <th className="py-3 px-4">Anbar</th>
                                        <th className="py-3 px-4">Təhvil Tarixi</th>
                                        <th className="py-3 px-4">Sürücü / Avtomobil</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-right">Keçid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/60">
                                    {deliveries.map((del) => (
                                        <tr key={del.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-white">
                                                {del.deliveryNumber}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-white">
                                                {del.warehouseName || 'Əsas Anbar'}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {formatDate(del.deliveryDate)}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {del.driverName || '—'} {del.vehicleNumber ? `(${del.vehicleNumber})` : ''}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                                                    {del.statusName || 'Təsdiqlənib'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    to="/sales/deliveries"
                                                    className="text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
                                                >
                                                    İrsaliyyələrə Bax →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── TAB 3: Qeydlər & Rekvizitlər ─── */}
            {activeTab === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            Sifariş Qeydləri və Xüsusi Təlimatlar
                        </h3>
                        <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                            {order.notes || 'Heç bir xüsusi qeyd qeyd olunmayıb.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] pb-2 border-b border-[#27272A]">
                            Sistem Qeydiyyat Rekvizitləri
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Sistem ID:</span>
                                <span className="font-mono text-[#A1A1AA]">{order.id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Müştəri ID:</span>
                                <span className="font-mono text-[#A1A1AA]">{order.customerId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#71717A]">Status:</span>
                                <span className="font-semibold text-white">{order.statusName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── CREATE DELIVERY FROM ORDER MODAL ─── */}
            {showDeliveryModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !deliveryLoading) setShowDeliveryModal(false);
                    }}
                >
                    <div
                        className="bg-[#141416] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl text-[#E4E4E7] flex flex-col max-h-[92vh] overflow-hidden my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#27272A] p-4 sm:p-6 bg-[#18181B] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                                    <TruckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                        Təhvil Aktı / İrsaliyyə Tərtib Et
                                    </h2>
                                    <p className="text-xs text-[#A1A1AA]">
                                        Sifariş: <span className="font-mono text-white">{order.orderNumber}</span> ({order.customerName})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !deliveryLoading && setShowDeliveryModal(false)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateDelivery} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 shadow-sm">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Çıxış Anbarı *
                                    </label>
                                    <select
                                        required
                                        value={deliveryWarehouseId}
                                        onChange={(e) => setDeliveryWarehouseId(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    >
                                        <option value="" className="bg-[#18181B] text-[#71717A]">
                                            Anbar seçin...
                                        </option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id} className="bg-[#18181B] text-white">
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Təhvil Tarixi *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Sürücünün Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        placeholder="məs. Əli Hüseynov"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Avtomobil Nömrəsi
                                    </label>
                                    <input
                                        type="text"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value)}
                                        placeholder="məs. 99-AB-123"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines to deliver */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 space-y-3 shadow-sm">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                    Çatdırılacaq Məhsullar
                                </span>
                                <div className="space-y-2">
                                    {deliveryLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-xl bg-[#18181B] border border-[#27272A]"
                                        >
                                            <div>
                                                <p className="font-semibold text-white text-xs">{line.description}</p>
                                                <p className="text-[10px] text-[#71717A]">Sifariş sətiri #{idx + 1}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-[#A1A1AA]">Say:</span>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="any"
                                                    value={line.quantity}
                                                    onChange={(e) => {
                                                        const updated = [...deliveryLines];
                                                        updated[idx].quantity = Number(e.target.value);
                                                        setDeliveryLines(updated);
                                                    }}
                                                    className="w-24 px-2.5 py-1.5 rounded-xl bg-[#141416] border border-[#27272A] text-white font-mono text-center text-xs focus:outline-none focus:border-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowDeliveryModal(false)}
                                    disabled={deliveryLoading}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={deliveryLoading}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {deliveryLoading ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                            <span>Yaradılır...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>Təhvil İrsaliyyəsini Yarat</span>
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

export default SalesOrderDetailPage;

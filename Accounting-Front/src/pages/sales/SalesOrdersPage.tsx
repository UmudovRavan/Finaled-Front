import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesService, customersService, inventoryService } from '../../api';
import type {
    SalesOrderDto,
    CreateSalesOrderDto,
    CustomerDto,
    ItemDto,
    WarehouseDto,
    CreateDeliveryNoteDto,
} from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon,
    TruckIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    TrashIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val: number, cur = 'AZN'): string => {
    return `${val.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

export const SalesOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [orders, setOrders] = useState<SalesOrderDto[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Filters
    const [filterQuery, setFilterQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Create Order Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createCustomerId, setCreateCustomerId] = useState('');
    const [createOrderDate, setCreateOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [createDeliveryDate, setCreateDeliveryDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    });
    const [createCurrency, setCreateCurrency] = useState('AZN');
    const [createRef, setCreateRef] = useState('');
    const [createNotes, setCreateNotes] = useState('');
    const [createLines, setCreateLines] = useState<
        { itemId: string; description: string; quantity: number | string; unitPrice: number | string; discountPercent: number | string; taxRate: number }[]
    >([
        { itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, taxRate: 18 },
    ]);
    const [createLoading, setCreateLoading] = useState(false);

    // Create Delivery Modal from Order
    const [orderForDelivery, setOrderForDelivery] = useState<SalesOrderDto | null>(null);
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
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const [ordersData, custData, itemsData, whData] = await Promise.all([
                salesService.getOrders(),
                customersService.getCustomers(),
                customersService.getItems(),
                inventoryService.getWarehouses(),
            ]);
            setOrders(ordersData);
            setCustomers(custData);
            setItems(itemsData);
            setWarehouses(whData);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Məlumatlar yüklənərkən xəta baş verdi.'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            const matchQuery =
                o.orderNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
                o.customerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                (o.customerReference && o.customerReference.toLowerCase().includes(filterQuery.toLowerCase()));

            if (!matchQuery) return false;

            if (selectedStatus !== 'ALL') {
                const s = typeof o.status === 'number' ? o.statusName : String(o.status);
                if (s.toLowerCase() !== selectedStatus.toLowerCase()) return false;
            }

            return true;
        });
    }, [orders, filterQuery, selectedStatus]);

    // Calculate Create Modal Grand Total
    const createGrandTotal = useMemo(() => {
        return createLines.reduce((sum, line) => {
            const qty = Number(line.quantity) || 0;
            const price = Number(line.unitPrice) || 0;
            const disc = Number(line.discountPercent) || 0;
            const net = qty * price * (1 - disc / 100);
            return sum + net;
        }, 0);
    }, [createLines]);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createCustomerId) {
            showToast('Müştəri seçilməlidir.', 'error');
            return;
        }

        const validLines = createLines.filter((l) => Number(l.quantity) > 0 && Number(l.unitPrice) >= 0);
        if (validLines.length === 0) {
            showToast('Ən azı 1 düzgün sifariş sətri daxil edilməlidir.', 'error');
            return;
        }

        setCreateLoading(true);
        try {
            const payload: CreateSalesOrderDto = {
                customerId: createCustomerId,
                orderDate: new Date(createOrderDate).toISOString(),
                expectedDeliveryDate: createDeliveryDate ? new Date(createDeliveryDate).toISOString() : null,
                currency: createCurrency,
                customerReference: createRef || null,
                notes: createNotes || null,
                lines: validLines.map((l) => ({
                    itemId: l.itemId || null,
                    description: l.description,
                    quantity: Number(l.quantity),
                    unitPrice: Number(l.unitPrice),
                    discountPercent: Number(l.discountPercent) || 0,
                    taxRate: Number(l.taxRate) || 0,
                })),
            };

            await salesService.createOrder(payload);
            showToast('Yeni satış sifarişi uğurla yaradıldı!');
            setShowCreateModal(false);

            // Reset form
            setCreateCustomerId('');
            setCreateRef('');
            setCreateNotes('');
            setCreateLines([{ itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, taxRate: 18 }]);
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş yaradılarkən xəta baş verdi.'), 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId: string) => {
        setActionLoadingId(orderId);
        try {
            await salesService.confirmOrder(orderId);
            showToast('Sifariş təsdiqləndi və çatdırılmaya hazır vəziyyətə keçirildi!');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş təsdiqlənərkən xəta baş verdi.'), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Bu sifarişi ləğv etmək istədiyinizdən əminsiniz?')) return;
        setActionLoadingId(orderId);
        try {
            await salesService.cancelOrder(orderId);
            showToast('Sifariş ləğv edildi.');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Sifariş ləğv edilərkən xəta baş verdi.'), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Open create delivery note modal pre-filled from this order
    const openDeliveryModal = (order: SalesOrderDto) => {
        setOrderForDelivery(order);
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
    };

    const handleCreateDeliveryFromOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderForDelivery) return;
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
                salesOrderId: orderForDelivery.id,
                customerId: orderForDelivery.customerId,
                warehouseId: deliveryWarehouseId,
                deliveryDate: new Date(deliveryDate).toISOString(),
                driverName: driverName || null,
                vehicleNumber: vehicleNumber || null,
                trackingNumber: trackingNumber || null,
                notes: `Sifariş əsasında: ${orderForDelivery.orderNumber}`,
                lines: validLines.map((l) => ({
                    salesOrderLineId: l.salesOrderLineId,
                    itemId: l.itemId,
                    description: l.description,
                    quantity: Number(l.quantity),
                })),
            };

            await salesService.createDelivery(payload);
            showToast('Mal göndəriş / Təhvil aktı sənədi uğurla yaradıldı!');
            setOrderForDelivery(null);
            navigate('/sales/deliveries');
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
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                    Qaralama
                </span>
            );
        }
        if (s.includes('confirmed') || status === 2) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Təsdiqlənib
                </span>
            );
        }
        if (s.includes('partial') || status === 3) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                    Hissəvi Təhvil
                </span>
            );
        }
        if (s.includes('fully') || s.includes('delivered') || status === 4) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                    Tam Çatdırılıb
                </span>
            );
        }
        if (s.includes('invoice') || status === 5) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                    Qaiməsi Kəsilib
                </span>
            );
        }
        if (s.includes('cancel') || status === 6) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    Ləğv Edilib
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                {statusName || status}
            </span>
        );
    };

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
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('sales.title', {}, 'Satış')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <DocumentTextIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('sales.orders', {}, 'Satış Sifarişləri')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yeni Sifariş</span>
                    </button>
                </div>
            </div>

            {/* ─── Filter & Status Bar (Master Data style tabs) ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Sifariş №, müştəri adı və ya referans axtar..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#121214] border border-[#27272A] rounded-2xl overflow-x-auto scrollbar-none shadow-sm">
                    {[
                        { key: 'ALL', label: 'Hamısı' },
                        { key: 'Draft', label: 'Qaralama' },
                        { key: 'Confirmed', label: 'Təsdiqlənib' },
                        { key: 'PartiallyDelivered', label: 'Hissəvi' },
                        { key: 'Delivered', label: 'Tam Çatdırılıb' },
                    ].map((tab) => {
                        const isActive = selectedStatus === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setSelectedStatus(tab.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-black font-semibold shadow-xs'
                                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Orders Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-12 text-center text-xs text-[#71717A] flex flex-col items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin text-white" />
                        <span>Sifarişlər yüklənir...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#71717A]">
                        Heç bir satış sifarişi tapılmadı.
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                    <th className="py-3 px-4">Sifariş №</th>
                                    <th className="py-3 px-4">Müştəri</th>
                                    <th className="py-3 px-4">Tarix</th>
                                    <th className="py-3 px-4">Gözlənilən Çatdırılma</th>
                                    <th className="py-3 px-4 text-right">Məbləğ</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/60">
                                {filteredOrders.map((order) => {
                                    const isConfirmed =
                                        order.statusName === 'Confirmed' ||
                                        order.status === 2 ||
                                        order.statusName === 'PartiallyDelivered' ||
                                        order.status === 3;
                                    const isDraft = order.statusName === 'Draft' || order.status === 1;

                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => navigate(`/sales/orders/${order.id}`)}
                                            className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                        >
                                            <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                                                <span>{order.orderNumber}</span>
                                                {order.customerReference && (
                                                    <span className="text-[10px] text-[#71717A] font-sans">
                                                        ({order.customerReference})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-white">
                                                {order.customerName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">{formatDate(order.orderDate)}</td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-white font-mono">
                                                {formatCurrency(order.grandTotal || 0, order.currency || 'AZN')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(order.status, order.statusName)}
                                            </td>
                                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Detail Button */}
                                                    <button
                                                        onClick={() => navigate(`/sales/orders/${order.id}`)}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title="Ətraflı Bax"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    {/* Confirm Button */}
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleConfirmOrder(order.id)}
                                                            disabled={actionLoadingId === order.id}
                                                            className="px-2.5 py-1 rounded-xl bg-[#14291F] hover:bg-[#14291F]/80 text-[#4ADE80] border border-[#22C55E]/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                                            title="Sifarişi təsdiqlə"
                                                        >
                                                            <CheckIcon className="w-3.5 h-3.5" />
                                                            <span>Təsdiqlə</span>
                                                        </button>
                                                    )}

                                                    {/* Create Delivery Note Button */}
                                                    {isConfirmed && (
                                                        <button
                                                            onClick={() => openDeliveryModal(order)}
                                                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                                            title="Anbar göndəriş sənədi yarat"
                                                        >
                                                            <TruckIcon className="w-3.5 h-3.5" />
                                                            <span>Təhvil İrsaliyyəsi Yarat</span>
                                                        </button>
                                                    )}

                                                    {/* Cancel Button */}
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            disabled={actionLoadingId === order.id}
                                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#71717A] hover:text-red-400 transition-colors cursor-pointer"
                                                            title="Sifarişi ləğv et"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── CREATE SALES ORDER MODAL ─── */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !createLoading) setShowCreateModal(false);
                    }}
                >
                    <div
                        className="bg-[#141416] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl text-[#E4E4E7] flex flex-col max-h-[92vh] overflow-hidden my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#27272A] p-4 sm:p-6 bg-[#18181B] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                                    <DocumentTextIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                        Yeni Satış Sifarişi Yarat
                                    </h2>
                                    <p className="text-xs text-[#A1A1AA]">
                                        Müştəri üçün yeni sifariş tərtib edin və təsdiqləyin
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !createLoading && setShowCreateModal(false)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                            {/* Metadata Card */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Müştəri *
                                    </label>
                                    <select
                                        required
                                        value={createCustomerId}
                                        onChange={(e) => setCreateCustomerId(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    >
                                        <option value="" className="bg-[#18181B] text-[#71717A]">
                                            Müştəri seçin...
                                        </option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id} className="bg-[#18181B] text-white">
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Müştəri Referansı (PO №)
                                    </label>
                                    <input
                                        type="text"
                                        value={createRef}
                                        onChange={(e) => setCreateRef(e.target.value)}
                                        placeholder="məs. PO-CLIENT-9921"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Sifariş Tarixi *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={createOrderDate}
                                        onChange={(e) => setCreateOrderDate(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Gözlənilən Çatdırılma
                                    </label>
                                    <input
                                        type="date"
                                        value={createDeliveryDate}
                                        onChange={(e) => setCreateDeliveryDate(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                        Sifariş Sətirləri
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateLines([
                                                ...createLines,
                                                { itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, taxRate: 18 },
                                            ])
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-xs text-white transition-colors cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="border border-[#27272A] rounded-xl overflow-hidden bg-[#18181B]">
                                    <div className="overflow-x-auto scrollbar-none">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#141416] border-b border-[#27272A] text-[#71717A] font-semibold uppercase tracking-wider text-[11px]">
                                                    <th className="py-2.5 px-3 min-w-[200px]">Məhsul</th>
                                                    <th className="py-2.5 px-3 min-w-[180px]">Təsvir</th>
                                                    <th className="py-2.5 px-3 text-center w-28">Say</th>
                                                    <th className="py-2.5 px-3 text-right w-32">Qiymət (AZN)</th>
                                                    <th className="py-2.5 px-3 text-right w-32">Məbləğ (AZN)</th>
                                                    <th className="py-2.5 px-3 text-center w-12">Sil</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#27272A]/60">
                                                {createLines.map((line, idx) => {
                                                    const qty = Number(line.quantity) || 0;
                                                    const price = Number(line.unitPrice) || 0;
                                                    const rowTotal = qty * price;

                                                    return (
                                                        <tr key={idx} className="hover:bg-white/[0.02]">
                                                            <td className="p-2">
                                                                <select
                                                                    value={line.itemId}
                                                                    onChange={(e) => {
                                                                        const itm = items.find((i) => i.id === e.target.value);
                                                                        const updated = [...createLines];
                                                                        updated[idx].itemId = e.target.value;
                                                                        if (itm) {
                                                                            updated[idx].description = itm.name;
                                                                            const pr = itm.standardSellingPrice ?? itm.unitPrice;
                                                                            if (pr) updated[idx].unitPrice = pr;
                                                                        }
                                                                        setCreateLines(updated);
                                                                    }}
                                                                    className="w-full bg-[#141416] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                                                >
                                                                    <option value="" className="bg-[#141416] text-[#71717A]">
                                                                        Məhsul seçin...
                                                                    </option>
                                                                    {items.map((i) => (
                                                                        <option key={i.id} value={i.id} className="bg-[#141416] text-white">
                                                                            {i.name} ({i.code})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="p-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Təsvir..."
                                                                    value={line.description}
                                                                    onChange={(e) => {
                                                                        const updated = [...createLines];
                                                                        updated[idx].description = e.target.value;
                                                                        setCreateLines(updated);
                                                                    }}
                                                                    className="w-full bg-[#141416] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="any"
                                                                    value={line.quantity}
                                                                    onChange={(e) => {
                                                                        const updated = [...createLines];
                                                                        updated[idx].quantity = e.target.value;
                                                                        setCreateLines(updated);
                                                                    }}
                                                                    className="w-full bg-[#141416] border border-[#27272A] rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-white transition-colors"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-right">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={line.unitPrice}
                                                                    onChange={(e) => {
                                                                        const updated = [...createLines];
                                                                        updated[idx].unitPrice = e.target.value;
                                                                        setCreateLines(updated);
                                                                    }}
                                                                    className="w-full bg-[#141416] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-right focus:outline-none focus:border-white transition-colors"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-right font-mono font-bold text-white">
                                                                {formatCurrency(rowTotal)}
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                {createLines.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setCreateLines(createLines.filter((_, i) => i !== idx))}
                                                                        className="p-1 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                                                                        title="Sil"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Summary & Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Qeydlər / Şərtlər
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={createNotes}
                                        onChange={(e) => setCreateNotes(e.target.value)}
                                        placeholder="Çatdırılma və ya ödəniş şərtləri haqqında qeydlər..."
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex flex-col justify-between shadow-sm">
                                    <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">
                                        Cəmi Məbləğ
                                    </span>
                                    <div className="text-xl font-bold font-mono text-white mt-2">
                                        {formatCurrency(createGrandTotal, createCurrency)}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                            <span>Saxlanılır...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>Sifarişi Saxla</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── CREATE DELIVERY FROM ORDER MODAL ─── */}
            {orderForDelivery && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !deliveryLoading) setOrderForDelivery(null);
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
                                        Sifariş: <span className="font-mono text-white">{orderForDelivery.orderNumber}</span> ({orderForDelivery.customerName})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !deliveryLoading && setOrderForDelivery(null)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateDeliveryFromOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
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
                                    onClick={() => setOrderForDelivery(null)}
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

export default SalesOrdersPage;

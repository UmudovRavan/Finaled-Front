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
    FunnelIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon,
    TruckIcon,
    EyeIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

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
                    taxRate: Number(l.taxRate) || 18,
                })),
            };

            await salesService.createOrder(payload);
            showToast('Satış sifarişi uğurla yaradıldı!');
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
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Qaralama (Draft)
                </span>
            );
        }
        if (s.includes('confirmed') || status === 2) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Təsdiqlənib (Confirmed)
                </span>
            );
        }
        if (s.includes('partial') || status === 3) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Hissəvi Təhvil
                </span>
            );
        }
        if (s.includes('fully') || s.includes('delivered') || status === 4) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Tam Çatdırılıb
                </span>
            );
        }
        if (s.includes('invoice') || status === 5) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Qaiməsi Kəsilib
                </span>
            );
        }
        if (s.includes('cancel') || status === 6) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Ləğv Edilib
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300">
                {statusName || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                        toastMessage.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950/90 border-rose-500 text-rose-200'
                    }`}
                >
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <DocumentTextIcon className="w-6 h-6 text-emerald-400" />
                        <span>{t('sales.ordersTitle', {}, 'Satış Sifarişləri (Sales Orders)')}</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                        Müştəri sifarişlərinin qeydiyyatı, təsdiqlənməsi və anbar göndərişlərinə yönləndirilməsi
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-white/5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/30 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yeni Sifariş</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3.5 rounded-2xl bg-[#12141A] border border-[#27272A] flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Sifariş №, müştəri adı və ya referans axtar..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#18181B] border border-[#27272A] text-[11px] font-semibold text-[#A1A1AA]">
                        {['ALL', 'Draft', 'Confirmed', 'PartiallyDelivered', 'Delivered'].map((statusKey) => (
                            <button
                                key={statusKey}
                                onClick={() => setSelectedStatus(statusKey)}
                                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedStatus === statusKey
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                        : 'hover:text-white'
                                }`}
                            >
                                {statusKey === 'ALL'
                                    ? 'Hamısı'
                                    : statusKey === 'Draft'
                                    ? 'Qaralama'
                                    : statusKey === 'Confirmed'
                                    ? 'Təsdiqlənib'
                                    : statusKey === 'PartiallyDelivered'
                                    ? 'Hissəvi'
                                    : 'Tam Çatdırılıb'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-xs text-[#71717A] flex flex-col items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Sifarişlər yüklənir...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#71717A]">
                        Heç bir satış sifarişi tapılmadı.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Sifariş №</th>
                                    <th className="py-3 px-4">Müştəri</th>
                                    <th className="py-3 px-4">Tarix</th>
                                    <th className="py-3 px-4">Gözlənilən Çatdırılma</th>
                                    <th className="py-3 px-4 text-right">Məbləğ</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]">
                                {filteredOrders.map((order) => {
                                    const isConfirmed =
                                        order.statusName === 'Confirmed' ||
                                        order.status === 2 ||
                                        order.statusName === 'PartiallyDelivered' ||
                                        order.status === 3;
                                    const isDraft = order.statusName === 'Draft' || order.status === 1;

                                    return (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                                                <span>{order.orderNumber}</span>
                                                {order.customerReference && (
                                                    <span className="text-[10px] text-[#71717A] font-sans">
                                                        ({order.customerReference})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-[#E4E4E7]">
                                                {order.customerName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">{formatDate(order.orderDate)}</td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-emerald-400 font-mono">
                                                {order.grandTotal?.toLocaleString('az-AZ', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{' '}
                                                {order.currency || 'AZN'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(order.status, order.statusName)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Confirm Button */}
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleConfirmOrder(order.id)}
                                                            disabled={actionLoadingId === order.id}
                                                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
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
                                                            className="p-1 rounded-lg hover:bg-rose-500/10 text-[#71717A] hover:text-rose-400 transition-colors cursor-pointer"
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

            {/* Create Sales Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-3xl rounded-3xl bg-[#14161E] border border-[#27272A] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <div>
                                <h2 className="text-base font-extrabold text-white">Yeni Satış Sifarişi Yarat</h2>
                                <p className="text-xs text-[#71717A]">Müştəri üçün yeni sifariş tərtib edin</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Müştəri *</label>
                                    <select
                                        required
                                        value={createCustomerId}
                                        onChange={(e) => setCreateCustomerId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="">Seçin...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Müştəri Referansı (PO)</label>
                                    <input
                                        type="text"
                                        value={createRef}
                                        onChange={(e) => setCreateRef(e.target.value)}
                                        placeholder="məs. PO-CLIENT-9921"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Sifariş Tarixi</label>
                                    <input
                                        type="date"
                                        required
                                        value={createOrderDate}
                                        onChange={(e) => setCreateOrderDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Gözlənilən Çatdırılma</label>
                                    <input
                                        type="date"
                                        value={createDeliveryDate}
                                        onChange={(e) => setCreateDeliveryDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines */}
                            <div className="pt-2 border-t border-[#27272A] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-white">Sifariş Sətirləri</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateLines([
                                                ...createLines,
                                                { itemId: '', description: '', quantity: 1, unitPrice: '', discountPercent: 0, taxRate: 18 },
                                            ])
                                        }
                                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {createLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-[#18181B] border border-[#27272A] items-center"
                                        >
                                            <div className="col-span-12 sm:col-span-4">
                                                <select
                                                    value={line.itemId}
                                                    onChange={(e) => {
                                                        const itm = items.find((i) => i.id === e.target.value);
                                                        const updated = [...createLines];
                                                        updated[idx].itemId = e.target.value;
                                                        if (itm) {
                                                            updated[idx].description = itm.name;
                                                            const price = itm.standardSellingPrice ?? itm.unitPrice;
                                                            if (price) updated[idx].unitPrice = price;
                                                        }
                                                        setCreateLines(updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#12141A] border border-[#27272A] text-white"
                                                >
                                                    <option value="">Məhsul seçin...</option>
                                                    {items.map((i) => (
                                                        <option key={i.id} value={i.id}>
                                                            {i.name} ({i.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="Təsvir"
                                                    value={line.description}
                                                    onChange={(e) => {
                                                        const updated = [...createLines];
                                                        updated[idx].description = e.target.value;
                                                        setCreateLines(updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#12141A] border border-[#27272A] text-white"
                                                />
                                            </div>

                                            <div className="col-span-3 sm:col-span-2">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="any"
                                                    placeholder="Say"
                                                    value={line.quantity}
                                                    onChange={(e) => {
                                                        const updated = [...createLines];
                                                        updated[idx].quantity = e.target.value;
                                                        setCreateLines(updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#12141A] border border-[#27272A] text-white font-mono text-center"
                                                />
                                            </div>

                                            <div className="col-span-3 sm:col-span-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Qiymət"
                                                    value={line.unitPrice}
                                                    onChange={(e) => {
                                                        const updated = [...createLines];
                                                        updated[idx].unitPrice = e.target.value;
                                                        setCreateLines(updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#12141A] border border-[#27272A] text-white font-mono text-right"
                                                />
                                            </div>

                                            <div className="col-span-12 sm:col-span-1 flex justify-end">
                                                {createLines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreateLines(createLines.filter((_, i) => i !== idx))}
                                                        className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-400"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#A1A1AA] font-bold mb-1">Qeydlər</label>
                                <textarea
                                    rows={2}
                                    value={createNotes}
                                    onChange={(e) => setCreateNotes(e.target.value)}
                                    placeholder="Təcili çatdırılma və s."
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-white/5 text-[#A1A1AA] font-bold"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                                >
                                    {createLoading ? 'Saxlanılır...' : 'Sifarişi Təsdiq Et və Saxla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Delivery Note from Order Modal */}
            {orderForDelivery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-3xl bg-[#14161E] border border-[#27272A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <div>
                                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                                    <TruckIcon className="w-5 h-5 text-emerald-400" />
                                    <span>Təhvil Aktı / İrsaliyyə Tərtib Et</span>
                                </h2>
                                <p className="text-xs text-[#71717A]">
                                    Sifariş: <span className="font-mono text-white">{orderForDelivery.orderNumber}</span> ({orderForDelivery.customerName})
                                </p>
                            </div>
                            <button
                                onClick={() => setOrderForDelivery(null)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDeliveryFromOrder} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Çıxış Anbarı *</label>
                                    <select
                                        required
                                        value={deliveryWarehouseId}
                                        onChange={(e) => setDeliveryWarehouseId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    >
                                        <option value="">Anbar seçin...</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Təhvil Tarixi</label>
                                    <input
                                        type="date"
                                        required
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Sürücünün Adı</label>
                                    <input
                                        type="text"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        placeholder="məs. Əli Hüseynov"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Avtomobil Nömrəsi</label>
                                    <input
                                        type="text"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value)}
                                        placeholder="məs. 99-AB-123"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>
                            </div>

                            {/* Lines to deliver */}
                            <div className="pt-2 border-t border-[#27272A] space-y-2">
                                <span className="font-bold text-white">Çatdırılacaq Məhsullar</span>
                                <div className="space-y-2">
                                    {deliveryLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-xl bg-[#18181B] border border-[#27272A]"
                                        >
                                            <div>
                                                <p className="font-bold text-white">{line.description}</p>
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
                                                    className="w-24 px-2.5 py-1 rounded-lg bg-[#12141A] border border-[#27272A] text-white font-mono text-center"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setOrderForDelivery(null)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-white/5 text-[#A1A1AA] font-bold"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={deliveryLoading}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                                >
                                    {deliveryLoading ? 'Yaradılır...' : 'Təhvil İrsaliyyəsini Yarat'}
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

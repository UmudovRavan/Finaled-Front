import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesService, customersService, inventoryService } from '../../api';
import type {
    DeliveryNoteDto,
    CreateDeliveryNoteDto,
    CustomerDto,
    ItemDto,
    WarehouseDto,
} from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    TruckIcon,
    CheckIcon,
    XMarkIcon,
    ReceiptPercentIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

export const DeliveryNotesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [deliveries, setDeliveries] = useState<DeliveryNoteDto[]>([]);
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

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createCustomerId, setCreateCustomerId] = useState('');
    const [createWarehouseId, setCreateWarehouseId] = useState('');
    const [createDeliveryDate, setCreateDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
    const [createDriverName, setCreateDriverName] = useState('');
    const [createVehicleNumber, setCreateVehicleNumber] = useState('');
    const [createTrackingNumber, setCreateTrackingNumber] = useState('');
    const [createNotes, setCreateNotes] = useState('');
    const [createLines, setCreateLines] = useState<{ itemId: string; description: string; quantity: number | string }[]>([
        { itemId: '', description: '', quantity: 1 },
    ]);
    const [createLoading, setCreateLoading] = useState(false);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const [delData, custData, itmData, whData] = await Promise.all([
                salesService.getDeliveries(),
                customersService.getCustomers(),
                customersService.getItems(),
                inventoryService.getWarehouses(),
            ]);
            setDeliveries(delData);
            setCustomers(custData);
            setItems(itmData);
            setWarehouses(whData);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Göndərişlər yüklənərkən xəta baş verdi.'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter((d) => {
            const matchQuery =
                d.deliveryNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
                d.customerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
                (d.salesOrderNumber && d.salesOrderNumber.toLowerCase().includes(filterQuery.toLowerCase())) ||
                (d.trackingNumber && d.trackingNumber.toLowerCase().includes(filterQuery.toLowerCase()));

            if (!matchQuery) return false;

            if (selectedStatus !== 'ALL') {
                const s = typeof d.status === 'number' ? d.statusName : String(d.status);
                if (s.toLowerCase() !== selectedStatus.toLowerCase()) return false;
            }

            return true;
        });
    }, [deliveries, filterQuery, selectedStatus]);

    const handleCreateDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createCustomerId || !createWarehouseId) {
            showToast('Müştəri və anbar seçilməlidir.', 'error');
            return;
        }

        const validLines = createLines.filter((l) => Number(l.quantity) > 0 && l.itemId);
        if (validLines.length === 0) {
            showToast('Ən azı 1 məhsul sətri daxil edilməlidir.', 'error');
            return;
        }

        setCreateLoading(true);
        try {
            const payload: CreateDeliveryNoteDto = {
                customerId: createCustomerId,
                warehouseId: createWarehouseId,
                deliveryDate: new Date(createDeliveryDate).toISOString(),
                driverName: createDriverName || null,
                vehicleNumber: createVehicleNumber || null,
                trackingNumber: createTrackingNumber || null,
                notes: createNotes || null,
                lines: validLines.map((l) => ({
                    itemId: l.itemId,
                    description: l.description,
                    quantity: Number(l.quantity),
                })),
            };

            await salesService.createDelivery(payload);
            showToast('Mal göndərişi / İrsaliyyə sənədi uğurla yaradıldı!');
            setShowCreateModal(false);
            setCreateCustomerId('');
            setCreateWarehouseId('');
            setCreateDriverName('');
            setCreateVehicleNumber('');
            setCreateTrackingNumber('');
            setCreateNotes('');
            setCreateLines([{ itemId: '', description: '', quantity: 1 }]);
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'İrsaliyyə yaradılarkən xəta baş verdi.'), 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    // Post Delivery Note (Physical Stock Issue & COGS Journal Posting)
    const handlePostDelivery = async (deliveryId: string) => {
        setActionLoadingId(deliveryId);
        try {
            await salesService.postDelivery(deliveryId);
            showToast('Təhvil təsdiqləndi: Real stok anbardan silindi və maya dəyəri (COGS) uçota alındı!');
            loadData(true);
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Təsdiqləmə zamanı xəta baş verdi (Anbarda qalıq olmaya bilər).'), 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCreateInvoiceFromDelivery = (delivery: DeliveryNoteDto) => {
        // Navigate to CustomerInvoicesPage with delivery reference state
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
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Qaralama (Draft)
                </span>
            );
        }
        if (s.includes('posted') || status === 2) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Uçota Alınıb (Posted)
                </span>
            );
        }
        if (s.includes('invoice') || status === 3) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Qaimələnib (Invoiced)
                </span>
            );
        }
        if (s.includes('cancel') || status === 4) {
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
                        <TruckIcon className="w-6 h-6 text-emerald-400" />
                        <span>{t('sales.deliveriesTitle', {}, 'Mal Göndərişi / Təhvil Qaimələri (Delivery Notes)')}</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                        Məhsulların anbardan faktiki çıxışı, COGS (maya dəyəri) hesablanması və irsaliyyə uçotu
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
                        <span>Yeni Təhvil İrsaliyyəsi</span>
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
                        placeholder="İrsaliyyə №, sifariş №, müştəri və ya izləmə kodu..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#18181B] border border-[#27272A] text-[11px] font-semibold text-[#A1A1AA]">
                        {['ALL', 'Draft', 'Posted', 'Invoiced'].map((statusKey) => (
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
                                    : statusKey === 'Posted'
                                    ? 'Uçota Alınıb'
                                    : 'Qaimələnib'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deliveries Table */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-xs text-[#71717A] flex flex-col items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Təhvil sənədləri yüklənir...</span>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#71717A]">
                        Heç bir göndəriş və ya təhvil aktı tapılmadı.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-semibold">
                                <tr>
                                    <th className="py-3 px-4">İrsaliyyə №</th>
                                    <th className="py-3 px-4">Sifariş №</th>
                                    <th className="py-3 px-4">Müştəri</th>
                                    <th className="py-3 px-4">Anbar</th>
                                    <th className="py-3 px-4">Təhvil Tarixi</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]">
                                {filteredDeliveries.map((delivery) => {
                                    const isDraft = delivery.statusName === 'Draft' || delivery.status === 1;
                                    const isPosted = delivery.statusName === 'Posted' || delivery.status === 2;

                                    return (
                                        <tr key={delivery.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                                                <span>{delivery.deliveryNumber}</span>
                                                {delivery.trackingNumber && (
                                                    <span className="text-[10px] text-[#71717A] font-mono">
                                                        ({delivery.trackingNumber})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[#A1A1AA]">
                                                {delivery.salesOrderNumber || '—'}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-[#E4E4E7]">
                                                {delivery.customerName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {delivery.warehouseName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">{formatDate(delivery.deliveryDate)}</td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(delivery.status, delivery.statusName)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Post and issue goods from warehouse */}
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handlePostDelivery(delivery.id)}
                                                            disabled={actionLoadingId === delivery.id}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                                            title="Təsdiqlə və anbardan sil (COGS qeydini apar)"
                                                        >
                                                            <CheckIcon className="w-3.5 h-3.5" />
                                                            <span>Təsdiqlə & Anbardan Sil</span>
                                                        </button>
                                                    )}

                                                    {/* Issue Invoice from posted delivery */}
                                                    {isPosted && (
                                                        <button
                                                            onClick={() => handleCreateInvoiceFromDelivery(delivery)}
                                                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                                            title="Bu təhvil əsasında satış qaiməsi (e-Qaimə) kəs"
                                                        >
                                                            <ReceiptPercentIcon className="w-3.5 h-3.5" />
                                                            <span>e-Qaimə Kəs</span>
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

            {/* Create Delivery Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-3xl bg-[#14161E] border border-[#27272A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <div>
                                <h2 className="text-base font-extrabold text-white">Yeni Mal Göndərişi / İrsaliyyə</h2>
                                <p className="text-xs text-[#71717A]">Müştəriyə birbaşa mal göndəriş sənədi tərtib edin</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Müştəri *</label>
                                    <select
                                        required
                                        value={createCustomerId}
                                        onChange={(e) => setCreateCustomerId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    >
                                        <option value="">Müştəri seçin...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Çıxış Anbarı *</label>
                                    <select
                                        required
                                        value={createWarehouseId}
                                        onChange={(e) => setCreateWarehouseId(e.target.value)}
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
                                        value={createDeliveryDate}
                                        onChange={(e) => setCreateDeliveryDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">İzləmə Nömrəsi (Tracking)</label>
                                    <input
                                        type="text"
                                        value={createTrackingNumber}
                                        onChange={(e) => setCreateTrackingNumber(e.target.value)}
                                        placeholder="məs. TRK-88129"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Sürücünün Adı</label>
                                    <input
                                        type="text"
                                        value={createDriverName}
                                        onChange={(e) => setCreateDriverName(e.target.value)}
                                        placeholder="məs. Əli Hüseynov"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#A1A1AA] font-bold mb-1">Avtomobil Nömrəsi</label>
                                    <input
                                        type="text"
                                        value={createVehicleNumber}
                                        onChange={(e) => setCreateVehicleNumber(e.target.value)}
                                        placeholder="məs. 99-AB-123"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
                                    />
                                </div>
                            </div>

                            {/* Lines */}
                            <div className="pt-2 border-t border-[#27272A] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-white">Göndəriləcək Mallar</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateLines([...createLines, { itemId: '', description: '', quantity: 1 }])
                                        }
                                        className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Məhsul Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {createLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-[#18181B] border border-[#27272A] items-center"
                                        >
                                            <div className="col-span-12 sm:col-span-5">
                                                <select
                                                    value={line.itemId}
                                                    onChange={(e) => {
                                                        const itm = items.find((i) => i.id === e.target.value);
                                                        const updated = [...createLines];
                                                        updated[idx].itemId = e.target.value;
                                                        if (itm) updated[idx].description = itm.name;
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

                                            <div className="col-span-8 sm:col-span-4">
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

                                            <div className="col-span-1 flex justify-end">
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
                                    {createLoading ? 'Saxlanılır...' : 'İrsaliyyəni Yarat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryNotesPage;

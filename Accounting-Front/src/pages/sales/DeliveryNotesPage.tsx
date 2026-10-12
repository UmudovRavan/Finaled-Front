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
    EyeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val: number, cur = 'AZN'): string => {
    return `${(val || 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

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
        setTimeout(() => setToastMessage(null), 4000);
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
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                    Qaralama
                </span>
            );
        }
        if (s.includes('posted') || status === 2) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Uçota Alınıb
                </span>
            );
        }
        if (s.includes('invoice') || status === 3) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                    Qaimələnib
                </span>
            );
        }
        if (s.includes('cancel') || status === 4) {
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
                            <TruckIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('sales.deliveriesTitle', {}, 'Mal Göndərişi / Təhvil Qaimələri')}</span>
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
                        <span>Yeni Təhvil İrsaliyyəsi</span>
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
                        placeholder="İrsaliyyə №, sifariş № və ya müştəri axtar..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#121214] border border-[#27272A] rounded-2xl overflow-x-auto scrollbar-none shadow-sm">
                    {[
                        { key: 'ALL', label: 'Hamısı' },
                        { key: 'Draft', label: 'Qaralama' },
                        { key: 'Posted', label: 'Uçota Alınıb' },
                        { key: 'Invoiced', label: 'Qaimələnib' },
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

            {/* ─── Deliveries Table ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-12 text-center text-xs text-[#71717A] flex flex-col items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin text-white" />
                        <span>Təhvil sənədləri yüklənir...</span>
                    </div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#71717A]">
                        Heç bir göndəriş və ya təhvil aktı tapılmadı.
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                            <thead>
                                <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                    <th className="py-3 px-4">İrsaliyyə №</th>
                                    <th className="py-3 px-4">Sifariş №</th>
                                    <th className="py-3 px-4">Müştəri</th>
                                    <th className="py-3 px-4">Anbar</th>
                                    <th className="py-3 px-4">Təhvil Tarixi</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/60">
                                {filteredDeliveries.map((delivery) => {
                                    const isDraft = delivery.statusName === 'Draft' || delivery.status === 1;
                                    const isPosted = delivery.statusName === 'Posted' || delivery.status === 2;

                                    return (
                                        <tr
                                            key={delivery.id}
                                            onClick={() => navigate(`/sales/deliveries/${delivery.id}`)}
                                            className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                        >
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
                                            <td className="py-3 px-4 font-semibold text-white">
                                                {delivery.customerName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">
                                                {delivery.warehouseName}
                                            </td>
                                            <td className="py-3 px-4 text-[#A1A1AA]">{formatDate(delivery.deliveryDate)}</td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(delivery.status, delivery.statusName)}
                                            </td>
                                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Detail Button */}
                                                    <button
                                                        onClick={() => navigate(`/sales/deliveries/${delivery.id}`)}
                                                        className="p-1 rounded-lg bg-[#18181B] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title="Ətraflı Bax"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Post and issue goods from warehouse */}
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handlePostDelivery(delivery.id)}
                                                            disabled={actionLoadingId === delivery.id}
                                                            className="px-2.5 py-1 rounded-xl bg-[#14291F] hover:bg-[#14291F]/80 text-[#4ADE80] border border-[#22C55E]/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                                            title="Təsdiqlə və anbardan sil (COGS qeydini apar)"
                                                        >
                                                            <CheckIcon className="w-3.5 h-3.5" />
                                                            <span>Təsdiqlə</span>
                                                        </button>
                                                    )}

                                                    {/* Issue Invoice from posted delivery */}
                                                    {isPosted && (
                                                        <button
                                                            onClick={() => handleCreateInvoiceFromDelivery(delivery)}
                                                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
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

            {/* ─── CREATE DELIVERY NOTE MODAL ─── */}
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
                                    <TruckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                        Yeni Mal Göndərişi / İrsaliyyə Tərtib Et
                                    </h2>
                                    <p className="text-xs text-[#A1A1AA]">
                                        Müştəriyə birbaşa mal göndəriş sənədi tərtib edin
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
                        <form onSubmit={handleCreateDelivery} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                            {/* Metadata Card */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 shadow-sm">
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
                                        Çıxış Anbarı *
                                    </label>
                                    <select
                                        required
                                        value={createWarehouseId}
                                        onChange={(e) => setCreateWarehouseId(e.target.value)}
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
                                        value={createDeliveryDate}
                                        onChange={(e) => setCreateDeliveryDate(e.target.value)}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Sürücünün Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={createDriverName}
                                        onChange={(e) => setCreateDriverName(e.target.value)}
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
                                        value={createVehicleNumber}
                                        onChange={(e) => setCreateVehicleNumber(e.target.value)}
                                        placeholder="məs. 99-AB-123"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        İzləmə Kodu / Qaimə №
                                    </label>
                                    <input
                                        type="text"
                                        value={createTrackingNumber}
                                        onChange={(e) => setCreateTrackingNumber(e.target.value)}
                                        placeholder="məs. TRK-9901"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-4 sm:p-5 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between pb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                        Təhvil Veriləcək Məhsullar
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCreateLines([
                                                ...createLines,
                                                { itemId: '', description: '', quantity: 1 },
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
                                                    <th className="py-2.5 px-3 min-w-[220px]">Məhsul</th>
                                                    <th className="py-2.5 px-3 min-w-[200px]">Təsvir</th>
                                                    <th className="py-2.5 px-3 text-center w-32">Say</th>
                                                    <th className="py-2.5 px-3 text-center w-12">Sil</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#27272A]/60">
                                                {createLines.map((line, idx) => (
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
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Qeydlər
                                </label>
                                <textarea
                                    rows={2}
                                    value={createNotes}
                                    onChange={(e) => setCreateNotes(e.target.value)}
                                    placeholder="Çatdırılma və ya nəqliyyat qeydləri..."
                                    className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
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
                                            <span>Yaradılır...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>İrsaliyyəni Saxla</span>
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

export default DeliveryNotesPage;

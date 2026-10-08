import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { procurementService } from '../../api';
import type { SupplierDto, SupplierInvoiceDto, PurchaseOrderDto, GoodsReceiptDto } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CreditCardIcon,
    DocumentTextIcon,
    TruckIcon,
    ShoppingBagIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export const SupplierDetailPage: React.FC = () => {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState<SupplierDto | null>(null);
    const [invoices, setInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDto[]>([]);
    const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'invoices' | 'orders' | 'receipts'>('invoices');

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');

        try {
            const supp = await procurementService.getSupplier(id);
            setSupplier(supp);

            // Fetch related transactions in parallel
            const [allInvoices, allPOs, allGRNs] = await Promise.all([
                procurementService.getSupplierInvoices({ supplierId: supp.id }).catch(() => []),
                procurementService.getPurchaseOrders({ supplierId: supp.id }).catch(() => []),
                procurementService.getGoodsReceipts({ supplierId: supp.id }).catch(() => []),
            ]);

            setInvoices(allInvoices.filter((i) => i.supplierId === supp.id || i.supplierName === supp.name));
            setPurchaseOrders(allPOs.filter((p) => p.supplierId === supp.id || p.supplierName === supp.name));
            setGoodsReceipts(allGRNs.filter((g) => g.supplierId === supp.id || g.supplierName === supp.name));
        } catch (err: any) {
            console.error('[SupplierDetailPage] Error:', err);
            setError(err.message || 'Təchizatçı məlumatları yüklənərkən xəta baş verdi.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#A1A1AA]">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
                <span className="text-xs">{t('common.loading', {}, 'Təchizatçı məlumatları yüklənir...')}</span>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <ExclamationCircleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t('common.notFound', {}, 'Təchizatçı Tapılmadı')}</h3>
                <p className="text-xs text-[#A1A1AA]">{error || t('common.noData', {}, 'Axtardığınız təchizatçı mövcud deyil və ya silinib.')}</p>
                <button
                    onClick={() => navigate('/suppliers')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                    {t('procurement.suppliersTitle', {}, 'Təchizatçılar Siyahısına Qayıt')}
                </button>
            </div>
        );
    }

    const outstandingPayable = Number(supplier.outstandingPayable ?? supplier.balance ?? 0);
    const totalInvoicesAmount = invoices.reduce((acc, i) => acc + (Number(i.grandTotal) || 0), 0);

    return (
        <div className="space-y-4 font-sans text-white">
            {/* ─── Header & Breadcrumb ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                    <button
                        onClick={() => navigate('/suppliers')}
                        className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white hover:bg-white/10 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t('procurement.suppliersTitle', {}, 'Təchizatçılar')}</span>
                    </button>
                    <span className="text-[#52525B]">/</span>
                    <span className="font-semibold text-white truncate max-w-xs">{supplier.name}</span>
                    <span className="text-[#52525B]">/</span>
                    <span className="text-[#A1A1AA]">{t('procurement.supplierDetails', {}, 'Detallar')}</span>
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

                    <Link
                        to="/supplier-invoices"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('procurement.newSupplierInvoice', {}, 'Yeni Faktura')}</span>
                    </Link>
                </div>
            </div>

            {/* ─── 4 Metric Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Outstanding Payable */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('procurement.supplierBalanceDue', {}, 'Kreditor Borc')}</span>
                        <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <CurrencyDollarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-amber-400">
                            {formatCurrency(outstandingPayable, supplier.currency)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('customers.balance', {}, 'Ödənilməli cari qalıq')}</span>
                    </div>
                </div>

                {/* 2. Total Invoices Amount */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('procurement.totalPurchased', {}, 'Fakturalar Həcmi')}</span>
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <DocumentTextIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-white">
                            {formatCurrency(totalInvoicesAmount, supplier.currency)}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{invoices.length} {t('procurement.supplierInvoicesTitle', {}, 'faktura qeydə alınıb')}</span>
                    </div>
                </div>

                {/* 3. Purchase Orders Count */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('procurement.poTitle', {}, 'Alış Sifarişləri')}</span>
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ShoppingBagIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-white">
                            {purchaseOrders.length}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('procurement.poSubtitle', {}, 'Aktiv satınalma sifarişləri')}</span>
                    </div>
                </div>

                {/* 4. Payment Terms */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('customers.paymentTerms', {}, 'Ödəniş Müddəti')}</span>
                        <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <ClockIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold font-mono text-white">
                            {supplier.paymentTermsDays || 30} {t('common.days', {}, 'Gün')}
                        </div>
                        <span className="text-[11px] text-[#71717A] mt-0.5 block">{t('customers.paymentTerms', {}, 'Standart təxirəsalma müddəti')}</span>
                    </div>
                </div>
            </div>

            {/* ─── Main Details & Tab Content Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Card: Supplier Overview */}
                <div className="lg:col-span-1 rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                        <div>
                            <h3 className="text-sm font-bold text-white">{supplier.name}</h3>
                            <span className="text-xs font-mono text-zinc-400 font-semibold">{supplier.code}</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {t('statuses.ACTIVE', {}, 'Aktiv')}
                        </span>
                    </div>

                    <div className="space-y-3 text-xs">
                        {supplier.companyName && (
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-[#71717A] flex items-center gap-1.5">
                                    <BuildingOffice2Icon className="w-3.5 h-3.5 text-[#71717A]" />
                                    {t('customers.companyName', {}, 'Hüquqi Ad')}:
                                </span>
                                <span className="text-white font-medium text-right">{supplier.companyName}</span>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <CreditCardIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('common.taxNumber', {}, 'VÖEN')}:
                            </span>
                            <span className="font-mono text-white font-medium">{supplier.taxNumber || '—'}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('customers.phone', {}, 'Telefon')}:
                            </span>
                            <span className="text-white font-medium">{supplier.phone || '—'}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <EnvelopeIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('customers.email', {}, 'E-poçt')}:
                            </span>
                            <span className="text-white font-medium">{supplier.email || '—'}</span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[#71717A] flex items-center gap-1.5">
                                <MapPinIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                {t('customers.address', {}, 'Ünvan')}:
                            </span>
                            <span className="text-white font-medium text-right max-w-[180px]">{supplier.address || '—'}</span>
                        </div>

                        {supplier.bankAccountDetails && (
                            <div className="pt-2 border-t border-[#27272A]/60">
                                <span className="text-[11px] text-[#71717A] block mb-1 font-semibold">{t('treasury.bankAccount', {}, 'Bank Hesabı')}:</span>
                                <p className="font-mono text-xs text-zinc-300 bg-[#18181B] p-2 rounded-xl border border-[#27272A] break-all">
                                    {supplier.bankAccountDetails}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Transaction Tabs */}
                <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 p-2 border-b border-[#27272A] bg-[#18181B]/60 text-xs">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'invoices' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <DocumentTextIcon className="w-3.5 h-3.5" />
                            <span>{t('procurement.supplierInvoicesTitle', {}, 'Alış Fakturaları')} ({invoices.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'orders' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <ShoppingBagIcon className="w-3.5 h-3.5" />
                            <span>{t('procurement.poTitle', {}, 'Sifarişlər')} ({purchaseOrders.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('receipts')}
                            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'receipts' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <TruckIcon className="w-3.5 h-3.5" />
                            <span>{t('procurement.grnTitle', {}, 'Mədaxillər')} ({goodsReceipts.length})</span>
                        </button>
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-x-auto p-0">
                        {activeTab === 'invoices' && (
                            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B]/40 text-[#A1A1AA] text-[11px] font-bold">
                                        <th className="py-2.5 px-3">{t('procurement.supplierInvoiceNumber', {}, 'Faktura №')}</th>
                                        <th className="py-2.5 px-3">{t('common.date', {}, 'Tarix')}</th>
                                        <th className="py-2.5 px-3">{t('invoices.dueDate', {}, 'Son Ödəniş')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('common.total', {}, 'Məbləğ')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('procurement.supplierBalanceDue', {}, 'Qalıq Borc')}</th>
                                        <th className="py-2.5 px-3 text-center">{t('common.status', {}, 'Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/60">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-[#71717A]">
                                                {t('common.noData', {}, 'Bu təchizatçıya aid faktura tapılmadı.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-3 font-mono font-bold text-white">
                                                    {inv.invoiceNumber}
                                                </td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">{formatDate(inv.invoiceDate || inv.issueDate)}</td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">{formatDate(inv.dueDate)}</td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                                    {formatCurrency(inv.grandTotal, inv.currency)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                                                    {formatCurrency(inv.outstandingAmount ?? inv.remainingAmount, inv.currency)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                                                        {t(`statuses.${(inv.status || 'Draft').toUpperCase()}`, {}, inv.status || 'Draft')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'orders' && (
                            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B]/40 text-[#A1A1AA] text-[11px] font-bold">
                                        <th className="py-2.5 px-3">{t('procurement.poNumber', {}, 'Sifariş №')}</th>
                                        <th className="py-2.5 px-3">{t('procurement.orderDate', {}, 'Sifariş Tarixi')}</th>
                                        <th className="py-2.5 px-3">{t('procurement.expectedDate', {}, 'Çatdırılma')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('common.total', {}, 'Məbləğ')}</th>
                                        <th className="py-2.5 px-3 text-center">{t('common.status', {}, 'Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/60">
                                    {purchaseOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-[#71717A]">
                                                {t('common.noData', {}, 'Bu təchizatçıya aid satınalma sifarişi tapılmadı.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        purchaseOrders.map((po) => (
                                            <tr key={po.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-3 font-mono font-bold text-white">{po.orderNumber}</td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">{formatDate(po.orderDate)}</td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">{formatDate(po.expectedDeliveryDate)}</td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                                    {formatCurrency(po.grandTotal ?? po.totalAmount, po.currency)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                                                        {t(`statuses.${(po.status || 'Draft').toUpperCase()}`, {}, po.status || 'Draft')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'receipts' && (
                            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B]/40 text-[#A1A1AA] text-[11px] font-bold">
                                        <th className="py-2.5 px-3">{t('procurement.receiptNumber', {}, 'Mədaxil №')}</th>
                                        <th className="py-2.5 px-3">{t('procurement.receiptDate', {}, 'Mədaxil Tarixi')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('inventory.stockValue', {}, 'Dəyər')}</th>
                                        <th className="py-2.5 px-3 text-center">{t('common.status', {}, 'Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/60">
                                    {goodsReceipts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center text-[#71717A]">
                                                {t('common.noData', {}, 'Bu təchizatçıya aid mal mədaxili tapılmadı.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        goodsReceipts.map((gr) => (
                                            <tr key={gr.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-2.5 px-3 font-mono font-bold text-white">{gr.receiptNumber}</td>
                                                <td className="py-2.5 px-3 text-[#A1A1AA]">{formatDate(gr.receiptDate)}</td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                                                    {formatCurrency(gr.totalValue)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                                                        {t('statuses.POSTED', {}, 'Posted')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDetailPage;

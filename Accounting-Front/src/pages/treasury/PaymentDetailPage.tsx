import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService, accountsService, customersService, procurementService } from '../../api';
import type { PaymentDto, BankAccountDto, AccountDto, CustomerDto, SupplierDto } from '../../dto';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BanknotesIcon,
    BuildingLibraryIcon,
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentTextIcon,
    CheckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentIcon,
    UserIcon,
    TagIcon,
    CalendarIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

export const PaymentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [payment, setPayment] = useState<PaymentDto | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [glAccounts, setGlAccounts] = useState<AccountDto[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [copiedNumber, setCopiedNumber] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4500);
    };

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

        try {
            const [pmtData, banks, accs, custs, supps] = await Promise.all([
                paymentService.getPayment(id),
                paymentService.getBankAccounts().catch(() => []),
                accountsService.getAccounts().catch(() => []),
                customersService.getCustomers().catch(() => []),
                procurementService.getSuppliers().catch(() => []),
            ]);

            setPayment(pmtData);
            setBankAccounts(banks);
            setGlAccounts(accs);
            setCustomers(custs);
            setSuppliers(supps);
        } catch (err) {
            console.error('Failed to load payment detail:', err);
            showToast('Ödəniş məlumatları yüklənərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleCopy = (text?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedNumber(true);
        setTimeout(() => setCopiedNumber(false), 2000);
    };

    const handlePost = async () => {
        if (!payment?.id) return;
        setActionLoading(true);
        try {
            const updated = await paymentService.postPayment(payment.id);
            setPayment(updated);
            showToast(`${payment.paymentNumber} ödənişi uğurla icra edildi və uçota alındı!`);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to post payment:', err);
            showToast(extractErrorMessage(err), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (val?: number, curr = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
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


    // Matched Entities
    const matchedPartyName = useMemo(() => {
        if (!payment) return '—';
        if (payment.partyName) return payment.partyName;
        if (payment.partyType === 'Customer') {
            const found = customers.find((c) => c.id === payment.partyId);
            if (found) return `${found.name} (${found.code})`;
        } else if (payment.partyType === 'Supplier') {
            const found = suppliers.find((s) => s.id === payment.partyId);
            if (found) return `${found.name} (${found.code})`;
        }
        return payment.partyId || '—';
    }, [payment, customers, suppliers]);

    const matchedBank = useMemo(() => {
        if (!payment) return null;
        return bankAccounts.find((b) => b.id === payment.bankAccountId || b.glAccountId === payment.glAccountId);
    }, [payment, bankAccounts]);

    const matchedGl = useMemo(() => {
        if (!payment?.glAccountId) return null;
        return glAccounts.find((g) => g.id === payment.glAccountId);
    }, [payment, glAccounts]);

    const getTypeBadge = (type: any, pType?: string) => {
        const t = String(type || '').toLowerCase();
        const pt = String(pType || '').toLowerCase();

        if (t === '1' || t.includes('customerreceipt') || pt === 'incoming') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    <span>Müştəri Mədaxili (Receipt)</span>
                </span>
            );
        }
        if (t === '2' || t.includes('customeradvance')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    <span>Müştəri Avansı</span>
                </span>
            );
        }
        if (t === '3' || t.includes('supplierpayment') || pt === 'outgoing') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                    <span>Təchizatçı Ödənişi</span>
                </span>
            );
        }
        if (t === '4' || t.includes('supplieradvance')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                    <span>Təchizatçı Avansı</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                <span>Daxili Köçürmə</span>
            </span>
        );
    };

    const isPosted = String(payment?.status || '').toLowerCase().includes('posted') || payment?.rawStatus === 4;
    const isIncoming = payment?.paymentType === 'Incoming' || payment?.rawType === 1 || payment?.rawType === 2;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-zinc-400">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-white" />
                <span className="text-sm">Ödəniş məlumatları yüklənir...</span>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-zinc-500">
                    <BanknotesIcon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">Ödəniş Sənədi Tapılmadı</h2>
                <p className="text-xs text-zinc-400">Axtardığınız ödəniş mövcud deyil və ya silinib.</p>
                <Link
                    to="/payments"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Ödənişlərə Qayıt</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans text-white max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/payments"
                            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                            <span>Ödənişlər</span>
                        </Link>
                        <span className="text-xs text-zinc-600">/</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">{payment.paymentNumber}</h1>
                        <button
                            onClick={() => handleCopy(payment.paymentNumber)}
                            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Kopyala"
                        >
                            {copiedNumber ? (
                                <CheckIcon className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                        {getTypeBadge(payment.rawType || payment.paymentType, payment.paymentType)}

                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isPosted
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                        >
                            {isPosted ? 'Uçota alınıb (Posted)' : 'Qaralama (Draft)'}
                        </span>

                        <span className="text-zinc-400">
                            Tarix: <strong className="text-white">{formatDate(payment.paymentDate)}</strong>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(false)}
                        disabled={loading || isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                    </button>

                    {!isPosted && (
                        <button
                            onClick={handlePost}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                            ) : (
                                <CheckIcon className="w-4 h-4 text-black" />
                            )}
                            <span>Sənədi İcra Et (Post)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
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

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Toplam Ödəniş Məbləği</div>
                        <div
                            className={`text-xl font-bold font-mono mt-0.5 ${
                                isIncoming ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                        >
                            {isIncoming ? '+' : '-'}{formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Sənəd üzrə ümumi həcm</div>
                    </div>
                    <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                            isIncoming
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                    >
                        {isIncoming ? (
                            <ArrowTrendingUpIcon className="w-5 h-5" />
                        ) : (
                            <ArrowTrendingDownIcon className="w-5 h-5" />
                        )}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Qaimələrə Bölüşdürülən</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                            {formatCurrency(payment.allocatedAmount || 0, payment.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Faktura ödənişlərinə silinib</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Bölüşdürülməmiş / Avans</div>
                        <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                            {formatCurrency(payment.unallocatedAmount ?? (payment.amount - (payment.allocatedAmount || 0)), payment.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Qarşı tərəf balansında qalan</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <CreditCardIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">Uçot Tarixi</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                            {formatDate(payment.postingDate || payment.paymentDate)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                            {isPosted ? 'Mühasibatlıqda qeyd edilib' : 'Qaralama statusunda'}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Payment Specifications Card */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                        <BanknotesIcon className="w-4 h-4 text-zinc-400" />
                        <h2 className="text-sm font-bold text-white">Ödəniş Rekvizitləri və Təyinatı</h2>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">ID: {payment.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-zinc-500 block mb-1">Qarşı Tərəf</span>
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{matchedPartyName}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Tərəf Tipi</span>
                        <span className="font-semibold text-zinc-300">
                            {payment.partyType === 'Customer' ? 'Müştəri (Customer)' : payment.partyType === 'Supplier' ? 'Təchizatçı (Supplier)' : 'Daxili Təşkilat'}
                        </span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Bank / Kassa Hesabı</span>
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                            <BuildingLibraryIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{matchedBank ? matchedBank.bankName : (payment.bankAccountName || 'Bank / Kassa')}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Mühasibatlıq (GL) Hesabı</span>
                        <span className="font-mono text-zinc-300">
                            {matchedGl ? `${matchedGl.code} - ${matchedGl.name}` : (payment.glAccountId ? payment.glAccountId : '1020 - Bank Hesabı')}
                        </span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Valyuta və Məzənnə</span>
                        <span className="font-semibold text-white">
                            {payment.currency} (Məzənnə: {payment.exchangeRate || 1.0})
                        </span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Ödəniş Metodu</span>
                        <span className="text-zinc-300">{payment.paymentMethod || 'Bank Köçürməsi'}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Referans / Çek №</span>
                        <span className="font-mono text-zinc-300">{payment.reference || '—'}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">Yaradılma Tarixi</span>
                        <span className="text-zinc-300">{formatDate(payment.createdAt)}</span>
                    </div>
                </div>

                {payment.notes && (
                    <div className="pt-3 border-t border-[#27272A] text-xs">
                        <span className="text-zinc-500 block mb-1">Qeydlər və Əlavə Məlumat:</span>
                        <p className="text-zinc-300 bg-[#18181B] p-2.5 rounded-xl border border-[#27272A]">
                            {payment.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Allocations Table */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
                        <h2 className="text-sm font-bold text-white">Faktura və Qaimə Bölüşdürmələri</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#121214] text-zinc-400 border border-[#27272A]">
                            {(payment.allocations || []).length} faktura
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                <th className="py-3.5 px-4">#</th>
                                <th className="py-3.5 px-4">Sənəd Tipi</th>
                                <th className="py-3.5 px-4">Qaimə / Faktura №</th>
                                <th className="py-3.5 px-4">Bölüşdürmə Tarixi</th>
                                <th className="py-3.5 px-4 text-right">Bölüşdürülən Məbləğ</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]">
                            {(!payment.allocations || payment.allocations.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DocumentTextIcon className="w-8 h-8 text-zinc-600" />
                                            <span className="font-semibold text-zinc-400">Heç bir faktura bölüşdürülməsi yoxdur</span>
                                            <p className="text-[11px] text-zinc-500 max-w-sm">
                                                Bu ödəniş birbaşa avans / cari hesab mədaxili kimi qeyd edilib.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payment.allocations.map((alloc, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-mono text-zinc-500">{idx + 1}</td>

                                        <td className="py-3.5 px-4 text-zinc-300">
                                            {alloc.targetDocumentType === 1 || alloc.targetDocumentType === 'CustomerInvoice' ? 'Satış Qaiməsi' : 'Alış Fakturası'}
                                        </td>

                                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                                            {alloc.targetDocumentNumber || alloc.targetDocumentId || `INV-REF-${idx + 1}`}
                                        </td>

                                        <td className="py-3.5 px-4 text-zinc-300">
                                            {formatDate(alloc.allocationDate || payment.paymentDate)}
                                        </td>

                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                            {formatCurrency(alloc.allocatedAmount, payment.currency)}
                                        </td>

                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Silinib
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { procurementService, paymentService } from '../../api';
import { formatDate } from '../../utils';
import type { SupplierInvoiceDto, ThreeWayMatchResultDto, BankAccountDto, PayInvoiceRequest } from '../../dto';
import CustomSelect from '../../components/CustomSelect';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    TagIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon,
    CreditCardIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';

export const SupplierInvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [invoice, setInvoice] = useState<SupplierInvoiceDto | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState<ThreeWayMatchResultDto | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [error, setError] = useState('');

    // Pay Modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payForm, setPayForm] = useState<PayInvoiceRequest>({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BankTransfer',
        bankAccountId: '',
        reference: '',
        notes: '',
    });
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');

    const extractErrorMessage = (err: any): string => {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.detail) return data.detail;
        if (data?.message) return data.message;
        if (data?.title) return data.title;
        if (data?.error) return data.error;
        return err.message || t('common.error', {}, 'Xəta baş verdi');
    };

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError('');

        try {
            const [data, banks] = await Promise.all([
                procurementService.getSupplierInvoice(id),
                paymentService.getBankAccounts().catch(() => []),
            ]);
            setInvoice(data);
            setBankAccounts(banks);
            setPayForm((prev) => ({
                ...prev,
                amount: data.outstandingAmount ?? data.remainingAmount ?? data.grandTotal ?? 0,
                bankAccountId: banks[0]?.id || '',
            }));
        } catch (err: any) {
            console.error('Failed to load supplier invoice detail:', err);
            setError(extractErrorMessage(err) || t('common.noData', {}, 'Alış qaiməsi tapılmadı.'));
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

    // Post invoice
    const handlePostInvoice = async () => {
        if (!invoice?.id) return;
        setIsPosting(true);
        try {
            const updated = await procurementService.postSupplierInvoice(invoice.id);
            setInvoice(updated);
            showToast(t('procurement.supplierInvoicePostedSuccess', {}, 'Alış qaiməsi uğurla icra edildi və uçota alındı!'));
            await loadData(true);
        } catch (err: any) {
            console.error('Failed to post supplier invoice:', err);
            const msg = extractErrorMessage(err);
            showToast(msg, 'error');
        } finally {
            setIsPosting(false);
        }
    };

    // 3-Way Match Check
    const handleCheckMatch = async () => {
        if (!invoice?.id) return;
        setIsMatching(true);
        try {
            const result = await procurementService.evaluateThreeWayMatch(invoice.id);
            setMatchResult(result);
            if (result.isMatched) {
                showToast(t('procurement.matchPassed', {}, '3-Way Match uğurla tamamlandı: Faktura, Sifariş və Qəbul məlumatları tam uyğundur!'));
            } else {
                showToast(`3-Way Match: ${result.message || t('procurement.matchFailed', {}, 'Fərqlər aşkar edildi.')}`, 'error');
            }
        } catch (err: any) {
            console.error('Failed to evaluate 3-way match:', err);
            const msg = extractErrorMessage(err);
            showToast(msg, 'error');
        } finally {
            setIsMatching(false);
        }
    };

    // Pay Submit
    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice?.id) return;
        if (!payForm.amount || payForm.amount <= 0) {
            setPayError(t('validation.positiveNumber', {}, 'Zəhmət olmasa ödəniş məbləğini düzgün qeyd edin.'));
            return;
        }
        setPayLoading(true);
        setPayError('');

        try {
            await procurementService.paySupplierInvoice(invoice.id, {
                ...payForm,
                supplierId: invoice.supplierId,
            });
            setShowPayModal(false);
            showToast(t('treasury.paymentPostedSuccess', {}, 'Ödəniş uğurla qeydiyyata alındı!'));
            await loadData(true);
        } catch (err: any) {
            console.error('Failed to process payment:', err);
            setPayError(extractErrorMessage(err));
        } finally {
            setPayLoading(false);
        }
    };

    const getStatusInfo = (status: any, docStatus: any, setStatus: any) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('paid') && !s.includes('part')) {
            return {
                label: t('statuses.paid', {}, 'Ödənilib'),
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                dot: 'bg-emerald-400',
            };
        }
        if (s.includes('part') || setStatus === 2) {
            return {
                label: t('statuses.partiallyPaid', {}, 'Qismən Ödənilib'),
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
                dot: 'bg-amber-400',
            };
        }
        if (s.includes('post') || s.includes('appr') || docStatus === 4) {
            return {
                label: t('statuses.approved', {}, 'Təsdiqlənib'),
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/20',
                text: 'text-cyan-400',
                dot: 'bg-cyan-400',
            };
        }
        if (s.includes('canc') || docStatus === 5) {
            return {
                label: t('statuses.cancelled', {}, 'Ləğv Edilib'),
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                dot: 'bg-rose-400',
            };
        }
        return {
            label: t('statuses.draft', {}, 'Qaralama'),
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
            dot: 'bg-neutral-400',
        };
    };

    const getMatchStatusInfo = (matchStatus: any) => {
        const s = String(matchStatus || '').toLowerCase();
        if (s.includes('match') && !s.includes('not') && !s.includes('discr')) {
            return {
                label: t('procurement.matchPassed', {}, 'Uyğundur (Matched)'),
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
            };
        }
        if (s.includes('tol') || matchStatus === 3) {
            return {
                label: t('procurement.threeWayMatch', {}, 'Tolerans Daxilində'),
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
            };
        }
        if (s.includes('hold') || matchStatus === 4) {
            return {
                label: t('procurement.matchFailed', {}, 'Tolerans Aşıldı (On Hold)'),
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
            };
        }
        return {
            label: t('procurement.matchPending', {}, 'Gözləmədə'),
            bg: 'bg-neutral-500/10',
            border: 'border-neutral-500/20',
            text: 'text-neutral-400',
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#71717A] space-y-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-xs">{t('common.loading', {}, 'Alış qaiməsi yüklənir...')}</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="max-w-xl mx-auto my-12 p-6 rounded-3xl bg-[#121214] border border-[#27272A] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                    <ExclamationCircleIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-white">{t('common.error', {}, 'Qaimə Tapılmadı')}</h2>
                <p className="text-xs text-[#A1A1AA]">{error || t('common.noData', {}, 'Axtardığınız alış qaiməsi mövcud deyil.')}</p>
                <div className="pt-2">
                    <button
                        onClick={() => navigate('/supplier-invoices')}
                        className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
                    >
                        {t('common.back', {}, 'Siyahıya Qayıt')}
                    </button>
                </div>
            </div>
        );
    }

    const statusObj = getStatusInfo(invoice.status, invoice.documentStatus, invoice.settlementStatus);
    const matchObj = getMatchStatusInfo(invoice.threeWayMatchStatus);
    const isDraft = String(invoice.status || '').toLowerCase().includes('draft') || invoice.documentStatus === 1;
    const outstanding = invoice.outstandingAmount ?? invoice.remainingAmount ?? 0;

    return (
        <div className="space-y-5 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-200">
            {/* ─── Header & Breadcrumbs ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs text-[#71717A]">
                        <Link to="/supplier-invoices" className="hover:text-white transition-colors">
                            {t('nav.supplierInvoices', {}, 'Alış Qaimələri')}
                        </Link>
                        <span>/</span>
                        <span className="text-[#E4E4E7] font-medium font-mono">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Link
                            to="/supplier-invoices"
                            className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors"
                            title={t('common.back', {}, 'Geriyə')}
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                        </Link>
                        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                            <span>{t('procurement.supplierInvoicesTitle', {}, 'Qaimə')}:</span>
                            <span className="font-mono text-white">{invoice.invoiceNumber}</span>
                        </h1>
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${statusObj.bg} ${statusObj.border} ${statusObj.text}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                        </span>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${matchObj.bg} ${matchObj.border} ${matchObj.text}`}
                        >
                            {matchObj.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-300' : ''}`} />
                    </button>

                    <button
                        onClick={handleCheckMatch}
                        disabled={isMatching}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-white font-medium text-xs transition-colors disabled:opacity-50"
                        title={t('procurement.threeWayMatch', {}, '3-Way Match Yoxla')}
                    >
                        {isMatching ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ScaleIcon className="w-3.5 h-3.5 text-zinc-400" />}
                        <span>{t('procurement.threeWayMatch', {}, '3-Way Match')}</span>
                    </button>

                    {isDraft && (
                        <button
                            onClick={handlePostInvoice}
                            disabled={isPosting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-white font-medium text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {isPosting ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 text-zinc-400" />}
                            <span>{t('procurement.postSupplierInvoice', {}, 'Qaiməni İcra Et (Post)')}</span>
                        </button>
                    )}

                    {outstanding > 0 && (
                        <button
                            onClick={() => {
                                setPayError('');
                                setShowPayModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-sm active:scale-95"
                        >
                            <CreditCardIcon className="w-4 h-4" />
                            <span>{t('procurement.paySupplierInvoice', {}, 'Ödəniş Et')}</span>
                        </button>
                    )}
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
                        <span className="text-xs font-medium">{t('common.grandTotal', {}, 'Yekun Məbləğ')}</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <CurrencyDollarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {(invoice.grandTotal || invoice.totalAmount || 0).toLocaleString('az-AZ', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        <span className="text-xs text-[#71717A] ml-1.5 font-medium">AZN</span>
                    </div>
                </div>

                {/* 2. Outstanding */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('common.outstanding', {}, 'Qalıq Borc')}</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <CreditCardIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {outstanding.toLocaleString('az-AZ', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        <span className="text-xs text-[#71717A] ml-1.5 font-medium">AZN</span>
                    </div>
                </div>

                {/* 3. Paid Amount */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('common.paidAmount', {}, 'Ödənilmiş Məbləğ')}</span>
                        <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-300">
                            <CheckCircleIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {(invoice.paidAmount || 0).toLocaleString('az-AZ', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                        <span className="text-xs text-[#71717A] ml-1.5 font-medium">AZN</span>
                    </div>
                </div>

                {/* 4. 3-Way Match Info */}
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span className="text-xs font-medium">{t('procurement.threeWayMatch', {}, '3-Way Match')}</span>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${matchObj.bg} ${matchObj.border} ${matchObj.text}`}>
                            <ScaleIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className={`text-xs font-semibold ${matchObj.text}`}>{matchObj.label}</span>
                        <p className="text-[11px] text-[#71717A] mt-0.5 line-clamp-1">
                            PO və GRN ilə qiymət və miqdar audit vəziyyəti
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── 3-Way Match Result Banner (if checked) ─── */}
            {matchResult && (
                <div className="p-4 rounded-3xl bg-[#121214] border border-[#27272A] space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                            <ScaleIcon className="w-4 h-4 text-zinc-300" />
                            <span>3-Way Match Audit Nəticəsi</span>
                        </span>
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                matchResult.isMatched ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-300'
                            }`}
                        >
                            {matchResult.isMatched ? t('procurement.matchPassed', {}, 'Tam Uyğundur') : t('procurement.matchFailed', {}, 'Fərqlilik Var')}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded-2xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] block">{t('common.quantity', {}, 'Miqdar Fərqi')}:</span>
                            <span className="text-white font-semibold">{matchResult.quantityDifference} vahid</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] block">{t('common.unitPrice', {}, 'Qiymət Fərqi')}:</span>
                            <span className="text-white font-semibold">{matchResult.priceDifference.toFixed(2)} AZN</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#18181B] border border-[#27272A]">
                            <span className="text-[#71717A] block">{t('common.grandTotal', {}, 'Toplam Məbləğ Fərqi')}:</span>
                            <span className="text-white font-semibold">{matchResult.totalAmountDifference.toFixed(2)} AZN</span>
                        </div>
                    </div>
                    {matchResult.message && (
                        <p className="text-xs text-[#A1A1AA] pt-1 italic">{matchResult.message}</p>
                    )}
                </div>
            )}

            {/* ─── Main Content Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Card: Faktura Məlumatları */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-5 rounded-3xl bg-[#121214] border border-[#27272A] space-y-4">
                        <h2 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-[#27272A] pb-3">
                            {t('procurement.supplierInvoiceDetails', {}, 'Qaimə Məlumatları')}
                        </h2>

                        <div className="space-y-3.5 text-xs">
                            {/* Təchizatçı */}
                            <div>
                                <span className="text-[#71717A] block mb-1">{t('procurement.supplierName', {}, 'Təchizatçı')}</span>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <div className="w-6 h-6 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] text-[10px] font-bold">
                                        {(invoice.supplierName || 'T')[0]}
                                    </div>
                                    <Link
                                        to={`/suppliers/${invoice.supplierId}`}
                                        className="hover:text-emerald-400 hover:underline transition-colors"
                                    >
                                        {invoice.supplierName || t('procurement.supplierName', {}, 'Təchizatçı')}
                                    </Link>
                                </div>
                            </div>

                            {/* Təchizatçı Faktura № */}
                            <div>
                                <span className="text-[#71717A] block mb-1">{t('procurement.supplierInvoiceNumber', {}, 'Təchizatçı Faktura №')}</span>
                                <span className="text-white font-mono">{invoice.supplierInvoiceNumber || '—'}</span>
                            </div>

                            {/* Əlaqəli Sifariş (PO) */}
                            {invoice.purchaseOrderId && (
                                <div>
                                    <span className="text-[#71717A] block mb-1">{t('procurement.poTitle', {}, 'Əlaqəli Sifariş (PO)')}</span>
                                    <Link
                                        to={`/purchase-orders/${invoice.purchaseOrderId}`}
                                        className="font-mono text-zinc-300 hover:text-white hover:underline inline-flex items-center gap-1"
                                    >
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{invoice.purchaseOrderId}</span>
                                    </Link>
                                </div>
                            )}

                            {/* Əlaqəli Qəbul (GRN) */}
                            {invoice.goodsReceiptId && (
                                <div>
                                    <span className="text-[#71717A] block mb-1">{t('procurement.grnTitle', {}, 'Əlaqəli Qəbul Sənədi (GRN)')}</span>
                                    <Link
                                        to={`/goods-receipts/${invoice.goodsReceiptId}`}
                                        className="font-mono text-zinc-300 hover:text-white hover:underline inline-flex items-center gap-1"
                                    >
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{invoice.goodsReceiptId}</span>
                                    </Link>
                                </div>
                            )}

                            {/* Faktura Tarixi */}
                            <div>
                                <span className="text-[#71717A] block mb-1">{t('customers.invoiceDate', {}, 'Faktura Tarixi')}</span>
                                <span className="text-white">{formatDate(invoice.issueDate || invoice.invoiceDate)}</span>
                            </div>

                            {/* Son Ödəniş Tarixi */}
                            <div>
                                <span className="text-[#71717A] block mb-1">{t('customers.dueDate', {}, 'Son Ödəniş Tarixi')}</span>
                                <span className="text-white">{formatDate(invoice.dueDate, '—')}</span>
                            </div>

                            {/* Uçot Tarixi */}
                            {invoice.postingDate && (
                                <div>
                                    <span className="text-[#71717A] block mb-1">{t('accounting.postingDate', {}, 'Uçot (Posting) Tarixi')}</span>
                                    <span className="text-white">{formatDate(invoice.postingDate)}</span>
                                </div>
                            )}

                            {/* Qeydlər */}
                            {invoice.notes && (
                                <div className="pt-2 border-t border-[#27272A]">
                                    <span className="text-[#71717A] block mb-1">{t('common.notes', {}, 'Qeydlər')}</span>
                                    <p className="text-[#A1A1AA] text-xs bg-[#18181B] p-2.5 rounded-xl border border-[#27272A] leading-relaxed">
                                        {invoice.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Card: Faktura Sətirləri */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-5 rounded-3xl bg-[#121214] border border-[#27272A] space-y-4">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                                {t('accounting.lines', {}, 'Faktura Sətirləri')}
                            </h2>
                            <span className="text-xs text-[#71717A]">
                                {t('common.total', {}, 'Toplam')}: <span className="text-white font-medium">{(invoice.lines || []).length}</span> {t('common.linesCount', {}, 'sətir')}
                            </span>
                        </div>

                        {/* Line Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] text-[11px] font-semibold tracking-wider uppercase">
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">{t('customers.item', {}, 'Məhsul / Xidmət')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('common.quantity', {}, 'Say')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('common.unitPrice', {}, 'Vahid Qiymət')}</th>
                                        <th className="py-2.5 px-3 text-right">{t('common.total', {}, 'Cəmi')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-xs">
                                    {(!invoice.lines || invoice.lines.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-[#71717A]">
                                                {t('common.noData', {}, 'Sətir məlumatı mövcud deyil.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        invoice.lines.map((line, idx) => {
                                            const qty = Number(line.quantity) || 1;
                                            const price = Number(line.unitPrice) || 0;
                                            const total = line.lineTotal ?? qty * price * 1.18;

                                            return (
                                                <tr key={line.id || idx} className="hover:bg-[#18181B]/40 transition-colors">
                                                    <td className="py-3 px-3 text-[#71717A] font-mono">{idx + 1}</td>
                                                    <td className="py-3 px-3 text-white font-medium">
                                                        <div>{line.description || line.itemCode || t('customers.item', {}, 'Məhsul')}</div>
                                                        {line.itemCode && (
                                                            <span className="text-[10px] text-[#71717A] font-mono">
                                                                {t('common.code', {}, 'Kod')}: {line.itemCode}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-white font-semibold">{qty}</td>
                                                    <td className="py-3 px-3 text-right text-[#E4E4E7]">
                                                        {price.toFixed(2)} <span className="text-[10px] text-[#71717A]">AZN</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right text-white font-semibold">
                                                        {total.toFixed(2)} <span className="text-[10px] text-[#71717A]">AZN</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Footer */}
                        <div className="pt-4 border-t border-[#27272A] space-y-2 text-xs">
                            <div className="flex justify-between text-[#A1A1AA]">
                                <span>{t('common.subTotal', {}, 'Xalis Məbləğ (Subtotal)')}:</span>
                                <span className="text-white font-medium">{(invoice.subTotal || 0).toFixed(2)} AZN</span>
                            </div>
                            <div className="flex justify-between text-[#A1A1AA]">
                                <span>{t('common.taxTotal', {}, 'ƏDV Məbləği (18%)')}:</span>
                                <span className="text-white font-medium">{(invoice.taxTotal || 0).toFixed(2)} AZN</span>
                            </div>
                            <div className="pt-2 border-t border-[#27272A] flex justify-between text-sm font-bold text-white">
                                <span>{t('common.grandTotal', {}, 'Yekun Faktura Məbləği')}:</span>
                                <span className="text-white">
                                    {(invoice.grandTotal || invoice.totalAmount || 0).toLocaleString('az-AZ', {
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

            {/* ─── Soft Pay Modal ─── */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
                        <div className="p-4 sm:p-5 border-b border-[#27272A] flex items-center justify-between bg-[#121214]/60">
                            <div>
                                <h2 className="text-base font-semibold text-white">{t('procurement.paySupplierInvoice', {}, 'Faktura Üzrə Ödəniş')}</h2>
                                <p className="text-xs text-[#71717A]">{t('treasury.paymentsSubtitle', {}, 'Təchizatçıya ödənişi qeydiyyata alın')}</p>
                            </div>
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="p-1.5 rounded-xl bg-[#27272A]/50 text-[#A1A1AA] hover:text-white transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePaySubmit} className="p-4 sm:p-6 space-y-4 text-xs">
                            {payError && (
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                                    <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                                    <span>{payError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">{t('treasury.paymentAmount', {}, 'Ödəniş Məbləği')} (AZN) *</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={payForm.amount}
                                    onChange={(e) => setPayForm({ ...payForm, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#3F3F46]"
                                    required
                                />
                                <span className="text-[11px] text-[#71717A] mt-1 block">
                                    {t('common.outstanding', {}, 'Qalıq borc')}: {outstanding.toFixed(2)} AZN
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">{t('treasury.bankAccountsTitle', {}, 'Bank / Kassa Hesabı')} *</label>
                                <CustomSelect
                                    options={bankAccounts.map((b) => ({
                                        value: b.id,
                                        label: `${b.accountName || b.bankName} (${b.accountNumber})`,
                                    }))}
                                    value={payForm.bankAccountId || ''}
                                    onChange={(val) => setPayForm({ ...payForm, bankAccountId: String(val) })}
                                    placeholder={t('common.select', {}, 'Bank hesabı seçin...')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">{t('treasury.paymentDate', {}, 'Ödəniş Tarixi')} *</label>
                                    <input
                                        type="date"
                                        value={payForm.paymentDate}
                                        onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#3F3F46]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1.5">{t('common.reference', {}, 'Arayış / Qəbz №')}</label>
                                    <input
                                        type="text"
                                        value={payForm.reference || ''}
                                        onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                                        placeholder="Məs: TX-10928"
                                        className="w-full bg-[#121214] border border-[#27272A] rounded-xl px-3 py-2 text-white placeholder-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] transition-colors"
                                >
                                    {t('common.cancel', {}, 'Ləğv Et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={payLoading}
                                    className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {payLoading && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{t('treasury.postPayment', {}, 'Ödənişi Təsdiqlə')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierInvoiceDetailPage;

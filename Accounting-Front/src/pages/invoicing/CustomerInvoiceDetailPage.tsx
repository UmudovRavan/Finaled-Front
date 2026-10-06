import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customersService, paymentService } from '../../api';
import type { CustomerInvoiceDto, BankAccountDto, PayInvoiceRequest } from '../../dto';
import { formatDate, extractErrorMessage } from '../../utils';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    CheckIcon,
    XMarkIcon,
    BanknotesIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export const CustomerInvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState<CustomerInvoiceDto | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [approveLoading, setApproveLoading] = useState(false);

    // Pay Modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState<number | string>('');
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [payMethod, setPayMethod] = useState('BankTransfer');
    const [payBankAccountId, setPayBankAccountId] = useState('');
    const [payReference, setPayReference] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');

    const fetchInvoiceData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [invData, bankData] = await Promise.allSettled([
                customersService.getInvoice(id),
                paymentService.getBankAccounts(),
            ]);

            if (invData.status === 'fulfilled') {
                setInvoice(invData.value);
            }
            if (bankData.status === 'fulfilled' && Array.isArray(bankData.value)) {
                setBankAccounts(bankData.value);
            }
        } catch (err) {
            console.error('Error fetching invoice details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceData();
    }, [id]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleApprove = async () => {
        if (!invoice || approveLoading) return;
        setApproveLoading(true);
        try {
            await customersService.approveInvoice(invoice.id, invoice.issueDate || invoice.invoiceDate);
            showToast('Qaimə baş kitaba uğurla keçirildi (Posted)!', 'success');
            await fetchInvoiceData();
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Qaiməni təsdiqləmək mümkün olmadı.'), 'error');
        } finally {
            setApproveLoading(false);
        }
    };

    const openPayModal = () => {
        if (!invoice) return;
        const rem = invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.outstandingAmount || invoice.totalAmount || 0);
        setPayAmount(rem > 0 ? rem : (invoice.totalAmount || invoice.grandTotal || 0));
        setPayDate(new Date().toISOString().split('T')[0]);
        setPayBankAccountId(bankAccounts[0]?.id || '');
        setPayReference(`PAY-${invoice.invoiceNumber}`);
        setPayError('');
        setShowPayModal(true);
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice) return;
        if (!payBankAccountId) {
            setPayError('Zəhmət olmasa kassa və ya bank hesabı seçin.');
            return;
        }

        setPayLoading(true);
        setPayError('');
        try {
            await customersService.payInvoice(invoice.id, {
                amount: parseFloat(String(payAmount)) || 0,
                paymentDate: payDate,
                paymentMethod: payMethod,
                bankAccountId: payBankAccountId,
                reference: payReference,
                customerId: invoice.customerId,
            });
            setShowPayModal(false);
            showToast('Ödəniş uğurla qəbul edildi!');
            fetchInvoiceData();
        } catch (err: any) {
            setPayError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Ödəniş qeyd olunarkən xəta baş verdi.');
        } finally {
            setPayLoading(false);
        }
    };

    const formatCurrency = (val: number, curr = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getStatusBadge = (status: string) => {
        const s = String(status || '').toLowerCase();
        if (s === 'paid') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Paid
                </span>
            );
        }
        if (s === 'partiallypaid') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#142638] text-[#38BDF8] border border-[#0284C7]/30">
                    Partially Paid
                </span>
            );
        }
        if (s === 'posted' || s === 'approved' || s === 'unpaid') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                    {s === 'unpaid' ? 'Unpaid' : 'Posted'}
                </span>
            );
        }
        if (s === 'overdue' || s === 'cancelled') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    {s === 'overdue' ? 'Overdue' : 'Cancelled'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46]">
                Draft
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-white text-sm">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Qaimə məlumatları yüklənir...</span>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-white text-base font-semibold">Qaimə tapılmadı.</p>
                <Link
                    to="/customer-invoices"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Qaimələr Siyahısına Qayıt</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/customer-invoices')}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/customer-invoices" className="hover:text-zinc-300 transition-colors">Satış Qaimələri</Link>
                        <span className="text-[#52525B]">/</span>
                        <span className="font-mono text-white">{invoice.invoiceNumber}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}

                    {invoice.status === 'Draft' && (
                        <button
                            onClick={handleApprove}
                            disabled={approveLoading}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                            {approveLoading ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    <span>Təsdiqlənir...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Baş Kitaba Keçir (Post)</span>
                                </>
                            )}
                        </button>
                    )}

                    {(invoice.status === 'Posted' || invoice.status === 'Unpaid' || invoice.status === 'PartiallyPaid' || invoice.status === 'Approved') && (
                        <button
                            onClick={openPayModal}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                            <CreditCardIcon className="w-4 h-4" />
                            <span>Ödəniş Qəbul Et</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-2xl animate-in fade-in duration-150 ${
                    toastType === 'error'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}>
                    {toastType === 'error' ? (
                        <XMarkIcon className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                        <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Yekun Məbləğ</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {formatCurrency(invoice.totalAmount || invoice.grandTotal || 0, invoice.currency)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Ödənilən Məbləğ</span>
                    <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">
                        {formatCurrency(invoice.paidAmount || 0, invoice.currency)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Qalıq Borc</span>
                    <span className={`text-base font-mono font-bold mt-1 block ${(invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.outstandingAmount || 0)) > 0 ? 'text-amber-400' : 'text-white'}`}>
                        {formatCurrency(invoice.remainingAmount !== undefined ? invoice.remainingAmount : (invoice.outstandingAmount || 0), invoice.currency)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Sətirlərin Sayı</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {(invoice.lines || []).length || 1}
                    </span>
                </div>
            </div>

            {/* General Info Card */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Qaimə Məlumatları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-[#71717A] block">Müştəri</span>
                        <Link to={`/customers/${invoice.customerId}`} className="text-white font-semibold mt-0.5 block hover:underline">
                            {invoice.customerName || 'Müştəri'}
                        </Link>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Qaimə Tarixi</span>
                        <span className="text-white font-medium mt-0.5 block">
                            {formatDate(invoice.issueDate || invoice.invoiceDate)}
                        </span>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Son Ödəniş Tarixi</span>
                        <span className="text-white font-medium mt-0.5 block">
                            {formatDate(invoice.dueDate)}
                        </span>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Qeydlər</span>
                        <span className="text-white font-medium mt-0.5 block truncate">{invoice.notes || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Lines Table */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Qaimə Sətirləri</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7]">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-4">Təsvir / Məhsul</th>
                                <th className="py-3 px-4 text-center">Say</th>
                                <th className="py-3 px-4 text-right">Qiymət (AZN)</th>
                                <th className="py-3 px-4 text-right">Endirim %</th>
                                <th className="py-3 px-4 text-right">Cəm (AZN)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60">
                            {(!invoice.lines || invoice.lines.length === 0) ? (
                                <tr>
                                    <td className="py-3 px-4 font-medium text-white">{invoice.notes || 'Məhsul / Xidmət satışı'}</td>
                                    <td className="py-3 px-4 text-center font-mono">1</td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(invoice.subTotal || invoice.totalAmount || 0)}</td>
                                    <td className="py-3 px-4 text-right font-mono">0%</td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(invoice.subTotal || invoice.totalAmount || 0)}</td>
                                </tr>
                            ) : (
                                invoice.lines.map((line, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 font-medium text-white">{line.description || 'Məhsul'}</td>
                                        <td className="py-3 px-4 text-center font-mono">{line.quantity}</td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(line.unitPrice)}</td>
                                        <td className="py-3 px-4 text-right font-mono">{line.taxRate ? `${line.taxRate}%` : '0%'}</td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(line.lineTotal || (line.quantity * line.unitPrice))}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-[#27272A] bg-[#18181B] font-bold font-mono text-white text-xs">
                                <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-[#A1A1AA]">Yekun Cəm:</td>
                                <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(invoice.totalAmount || invoice.grandTotal || 0, invoice.currency)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ─── PAYMENT ACCEPTANCE MODAL ─── */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-sm font-bold text-white">Ödəniş Qəbul Et</h3>
                                <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">{invoice.invoiceNumber} - {invoice.customerName}</p>
                            </div>
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {payError && (
                            <div className="p-3 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs">
                                {payError}
                            </div>
                        )}

                        <form onSubmit={handlePaySubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ödənilən Məbləğ (AZN) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white font-mono focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ödəniş Tarixi *</label>
                                <input
                                    type="date"
                                    required
                                    value={payDate}
                                    onChange={(e) => setPayDate(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ödəniş Hesabı (Bank / Kassa) *</label>
                                <select
                                    required
                                    value={payBankAccountId}
                                    onChange={(e) => setPayBankAccountId(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                >
                                    <option value="">Hesab seçin...</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.accountName} ({b.accountNumber || b.currency || 'AZN'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">İstinad № / Qəbz</label>
                                <input
                                    type="text"
                                    value={payReference}
                                    onChange={(e) => setPayReference(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={payLoading}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-black transition-colors cursor-pointer"
                                >
                                    {payLoading ? 'Qeyd edilir...' : 'Ödənişi Təsdiqlə'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInvoiceDetailPage;

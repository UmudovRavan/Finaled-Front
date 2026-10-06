import React, { useState, useEffect } from 'react';
import { paymentService, procurementService } from '../../api';
import type {
    PaymentRunDto,
    BankAccountDto,
    SupplierInvoiceDto,
    CreatePaymentRunRequest,
} from '../../dto';
import { formatDate } from '../../utils';
import {
    PlusIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    PlayIcon,
} from '@heroicons/react/24/outline';

export const PaymentRunsPage: React.FC = () => {
    const [runs, setRuns] = useState<PaymentRunDto[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [approvedInvoices, setApprovedInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bankAccountId, setBankAccountId] = useState('');
    const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [runsData, banksData, invoicesData] = await Promise.all([
                paymentService.getPaymentRuns(),
                paymentService.getBankAccounts(),
                procurementService.getSupplierInvoices({ status: 'Approved' }),
            ]);
            setRuns(runsData);
            setBankAccounts(banksData);
            setApprovedInvoices(invoicesData);
        } catch (err) {
            console.error('Failed to load payment runs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleInvoice = (id: string) => {
        if (selectedInvoiceIds.includes(id)) {
            setSelectedInvoiceIds(selectedInvoiceIds.filter((i) => i !== id));
        } else {
            setSelectedInvoiceIds([...selectedInvoiceIds, id]);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankAccountId) {
            setCreateError('Zəhmət olmasa bank hesabı seçin.');
            return;
        }
        if (selectedInvoiceIds.length === 0) {
            setCreateError('Zəhmət olmasa ən azı 1 qaimə seçin.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            await paymentService.createPaymentRun({
                bankAccountId,
                runDate,
                supplierInvoiceIds: selectedInvoiceIds,
                notes,
            });
            setShowCreateModal(false);
            showToast('Toplu ödəniş paketi yaradıldı!');
            setSelectedInvoiceIds([]);
            loadData();
        } catch (err: any) {
            setCreateError(err.response?.data?.message || 'Yaradılarkən xəta baş verdi.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleExecute = async (id: string) => {
        if (!confirm('Toplu ödəniş paketi icra edilsin?')) return;
        try {
            await paymentService.executePaymentRun(id);
            showToast('Toplu ödənişlər uğurla icra olundu!');
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'İcra zamanı xəta baş verdi.');
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const formatCurrency = (val: number, curr?: string) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val);
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Toplu Ödənişlər (Payment Runs)</h1>
                    <p className="text-xs text-[#94A3B8]">Təsdiqlənmiş təchizatçı qaimələrinin bir toxunuşla toplu ödənilməsi</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Yeni Ödəniş Paketi</span>
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckIcon className="w-4 h-4" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                                <th className="py-3 px-4">Paket №</th>
                                <th className="py-3 px-4">Tarix</th>
                                <th className="py-3 px-4">Bank Hesabı</th>
                                <th className="py-3 px-4 text-center">Qaimə Sayı</th>
                                <th className="py-3 px-4 text-right">Toplam Məbləğ</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-[#71717A]">Yüklənir...</td>
                                </tr>
                            ) : runs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-[#71717A]">Heç bir toplu ödəniş paketi tapılmadı.</td>
                                </tr>
                            ) : (
                                runs.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-white">{r.runNumber}</td>
                                        <td className="py-3.5 px-4 text-[#A1A1AA]">{formatDate(r.runDate)}</td>
                                        <td className="py-3.5 px-4 font-semibold text-white">{r.bankAccountName || 'Bank'}</td>
                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{r.paymentCount || 0}</td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                            {formatCurrency(r.totalAmount || 0, r.currency)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    r.status === 'Executed'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-zinc-800 text-zinc-300'
                                                }`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {r.status === 'Draft' && (
                                                <button
                                                    onClick={() => handleExecute(r.id)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold cursor-pointer"
                                                >
                                                    <PlayIcon className="w-3.5 h-3.5" />
                                                    <span>İcra Et</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="bg-[#12141A] border border-[#27272A] rounded-2xl w-full max-w-2xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <h3 className="text-sm font-bold">Yeni Toplu Ödəniş Paketi</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#71717A] hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Çıxarılacaq Bank Hesabı</label>
                                    <select
                                        required
                                        value={bankAccountId}
                                        onChange={(e) => setBankAccountId(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    >
                                        <option value="">Hesab seçin...</option>
                                        {bankAccounts.map((b) => (
                                            <option key={b.id} value={b.id}>{b.bankName} - {b.accountName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">İcra Tarixi</label>
                                    <input
                                        type="date"
                                        required
                                        value={runDate}
                                        onChange={(e) => setRunDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Selectable Invoices List */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                    Ödəniləcək Qaimələri Seçin ({selectedInvoiceIds.length} seçilib)
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#27272A] rounded-xl p-2 bg-[#18181B]">
                                    {approvedInvoices.length === 0 ? (
                                        <p className="text-xs text-[#71717A] text-center py-4">Təsdiqlənmiş açıq qaimə tapılmadı.</p>
                                    ) : (
                                        approvedInvoices.map((inv) => (
                                            <label
                                                key={inv.id}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                                    selectedInvoiceIds.includes(inv.id)
                                                        ? 'bg-emerald-600/15 border border-emerald-500/30'
                                                        : 'hover:bg-white/5'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedInvoiceIds.includes(inv.id)}
                                                        onChange={() => toggleInvoice(inv.id)}
                                                        className="rounded border-[#27272A] bg-[#12141A] text-emerald-600 focus:ring-0"
                                                    />
                                                    <div>
                                                        <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                                                        <span className="text-[#A1A1AA] ml-2">{inv.supplierName}</span>
                                                    </div>
                                                </div>
                                                <span className="font-mono font-bold text-white">
                                                    {formatCurrency(inv.remainingAmount || inv.totalAmount || 0)}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? 'Saxlanılır...' : 'Paketi Yarat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentRunsPage;

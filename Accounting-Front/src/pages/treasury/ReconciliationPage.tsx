import React, { useState, useEffect, useMemo } from 'react';
import { fiscalService, paymentService } from '../../api';
import type { ReconciliationDto, BankAccountDto } from '../../dto';
import { formatDate } from '../../utils';
import {
    PlusIcon,
    CheckBadgeIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    BuildingLibraryIcon,
    CurrencyDollarIcon,
    ClockIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

export const ReconciliationPage: React.FC = () => {
    const [reconciliations, setReconciliations] = useState<ReconciliationDto[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMessage, setToastMessage] = useState('');
    const [actionError, setActionError] = useState('');

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bankAccountId, setBankAccountId] = useState('');
    const [statementNumber, setStatementNumber] = useState('');
    const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [statementEndingBalance, setStatementEndingBalance] = useState(0);
    const [notes, setNotes] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Details Modal State
    const [selectedReconciliation, setSelectedReconciliation] = useState<ReconciliationDto | null>(null);

    const loadData = async () => {
        setLoading(true);
        setActionError('');
        try {
            const [recs, banks] = await Promise.all([
                fiscalService.getReconciliations(),
                paymentService.getBankAccounts(),
            ]);
            setReconciliations(recs);
            setBankAccounts(banks);
        } catch (err: any) {
            console.error('Failed to load reconciliations:', err);
            setActionError('Məlumatları yükləyərkən xəta baş verdi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const handleOpenCreateModal = () => {
        const defaultBank = bankAccounts[0];
        setBankAccountId(defaultBank?.id || '');
        setOpeningBalance(defaultBank?.currentBalance || 0);
        setStatementEndingBalance(defaultBank?.currentBalance || 0);
        setStatementNumber(`BS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`);
        setStatementDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleBankChange = (bId: string) => {
        setBankAccountId(bId);
        const found = bankAccounts.find((b) => b.id === bId);
        if (found) {
            setOpeningBalance(found.currentBalance || 0);
            setStatementEndingBalance(found.currentBalance || 0);
        }
    };

    const liveDifference = useMemo(() => {
        return Number((statementEndingBalance - openingBalance).toFixed(2));
    }, [statementEndingBalance, openingBalance]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankAccountId) {
            setCreateError('Zəhmət olmasa bank hesabı seçin.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            await fiscalService.createReconciliation({
                bankAccountId,
                statementNumber: statementNumber.trim() || undefined,
                statementDate,
                openingBalance,
                statementEndingBalance,
                closingBalance: statementEndingBalance,
                notes: notes.trim(),
            });

            setShowCreateModal(false);
            showToast('Bank üzləşdirməsi və çıxarışı uğurla qeydə alındı!');
            loadData();
        } catch (err: any) {
            const msg =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                'Üzləşdirmə yaradılarkən xəta baş verdi.';
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleReconcile = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActionError('');
        try {
            await fiscalService.performReconciliation(id);
            showToast('Bank hesabı uğurla üzləşdirildi və təsdiqləndi!');
            if (selectedReconciliation && selectedReconciliation.id === id) {
                setSelectedReconciliation({
                    ...selectedReconciliation,
                    isReconciled: true,
                    difference: 0,
                    reconciledAt: new Date().toISOString(),
                });
            }
            loadData();
        } catch (err: any) {
            setActionError('Üzləşdirmə zamanı xəta baş verdi.');
        }
    };

    const formatCurrency = (val: number, curr?: string) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    // Filtered reconciliations
    const filteredReconciliations = useMemo(() => {
        return reconciliations.filter((r) => {
            if (selectedBankFilter !== 'ALL' && r.bankAccountId !== selectedBankFilter) {
                return false;
            }
            if (statusFilter === 'RECONCILED' && !r.isReconciled) {
                return false;
            }
            if (statusFilter === 'OPEN' && r.isReconciled) {
                return false;
            }
            return true;
        });
    }, [reconciliations, selectedBankFilter, statusFilter]);

    // KPI Metrics
    const metrics = useMemo(() => {
        const totalBankBalance = bankAccounts.reduce((sum, b) => sum + (Number(b.currentBalance) || 0), 0);
        const reconciledCount = reconciliations.filter((r) => r.isReconciled).length;
        const openDiffCount = reconciliations.filter((r) => !r.isReconciled && Math.abs(r.difference) > 0.01).length;

        return {
            totalBankBalance,
            reconciledCount,
            openDiffCount,
            activeBanksCount: bankAccounts.length,
        };
    }, [bankAccounts, reconciliations]);

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <CheckBadgeIcon className="w-7 h-7 text-emerald-400" />
                        <span>Bank Üzləşdirməsi (Bank Reconciliation)</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8]">
                        Bank çıxarışı (Statement) ilə daxili mühasibatlıq balansının tutuşdurulması və təsdiqi
                    </p>
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
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Yeni Üzləşdirmə</span>
                    </button>
                </div>
            </div>

            {/* In-app Toast */}
            {toastMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-emerald-400/60 hover:text-emerald-400">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Action Error Banner */}
            {actionError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                        <ExclamationTriangleIcon className="w-4 h-4 text-rose-400" />
                        <span>{actionError}</span>
                    </div>
                    <button onClick={() => setActionError('')} className="text-rose-400/60 hover:text-rose-400">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#12141A] border border-[#27272A] relative overflow-hidden">
                    <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold mb-2">
                        <span>Cari Bank Qalıqları</span>
                        <BuildingLibraryIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl font-mono font-extrabold text-emerald-400">
                        {formatCurrency(metrics.totalBankBalance)}
                    </div>
                    <div className="text-[10px] text-[#71717A] mt-1">{metrics.activeBanksCount} aktiv bank hesabı üzrə</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#12141A] border border-[#27272A] relative overflow-hidden">
                    <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold mb-2">
                        <span>Üzləşdirilmiş Sənədlər</span>
                        <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xl font-mono font-extrabold text-white">
                        {metrics.reconciledCount}
                    </div>
                    <div className="text-[10px] text-[#71717A] mt-1">Balansları tam uyğunlaşmış</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#12141A] border border-[#27272A] relative overflow-hidden">
                    <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold mb-2">
                        <span>Açıq Fərqlər</span>
                        <ClockIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl font-mono font-extrabold text-amber-400">
                        {metrics.openDiffCount}
                    </div>
                    <div className="text-[10px] text-[#71717A] mt-1">Dəqiqləşdirmə gözləyən</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#12141A] border border-[#27272A] relative overflow-hidden">
                    <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold mb-2">
                        <span>Ümumi Hesabat Sayı</span>
                        <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="text-xl font-mono font-extrabold text-white">
                        {reconciliations.length}
                    </div>
                    <div className="text-[10px] text-[#71717A] mt-1">Qeydə alınmış çıxarışlar</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#12141A] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider pr-2">Status:</span>
                    {[
                        { id: 'ALL', label: 'Hamısı' },
                        { id: 'RECONCILED', label: 'Üzləşdirilib' },
                        { id: 'OPEN', label: 'Açıq / Fərqli' },
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStatusFilter(s.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                statusFilter === s.id
                                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                    : 'bg-[#18181B] text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-[#27272A]'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[#A1A1AA]">Hesab:</label>
                    <select
                        value={selectedBankFilter}
                        onChange={(e) => setSelectedBankFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                        <option value="ALL">Bütün Bank Hesabları</option>
                        {bankAccounts.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.bankName} - {b.accountName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                                <th className="py-3 px-4">Bank Hesabı</th>
                                <th className="py-3 px-4">Çıxarış №</th>
                                <th className="py-3 px-4">Çıxarış Tarixi</th>
                                <th className="py-3 px-4 text-right">İlkin / Kitab Qalığı</th>
                                <th className="py-3 px-4 text-right">Bank Çıxarış Qalığı</th>
                                <th className="py-3 px-4 text-right">Fərq</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-400" />
                                            <span>Məlumatlar yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReconciliations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                        Heç bir bank üzləşdirməsi tapılmadı. "Yeni Üzləşdirmə" düyməsi ilə əlavə edə bilərsiniz.
                                    </td>
                                </tr>
                            ) : (
                                filteredReconciliations.map((r) => {
                                    const diff = r.difference || 0;
                                    const isMatched = r.isReconciled || Math.abs(diff) < 0.01;

                                    return (
                                        <tr
                                            key={r.id}
                                            onClick={() => setSelectedReconciliation(r)}
                                            className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                        >
                                            <td className="py-3.5 px-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {r.bankAccountName || 'Bank Hesabı'}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#A1A1AA]">
                                                {r.statementNumber || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#A1A1AA]">
                                                {formatDate(r.statementDate)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                {formatCurrency(r.bookBalance !== undefined ? r.bookBalance : (r.openingBalance || 0), r.currency)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                                                {formatCurrency(r.statementEndingBalance !== undefined ? r.statementEndingBalance : (r.closingBalance || 0), r.currency)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-bold">
                                                <span className={Math.abs(diff) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {diff > 0 ? `+${formatCurrency(diff, r.currency)}` : formatCurrency(diff, r.currency)}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                                        isMatched
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}
                                                >
                                                    {isMatched ? 'Üzləşdirilib' : 'Açıq Fərq'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {!isMatched && (
                                                        <button
                                                            onClick={(e) => handleReconcile(r.id, e)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-colors cursor-pointer"
                                                        >
                                                            Təsdiqlə
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedReconciliation(r)}
                                                        className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-colors"
                                                        title="Detallara bax"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="bg-[#12141A] border border-[#27272A] rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-sm font-bold text-white">Yeni Bank Üzləşdirməsi və Çıxarışı</h3>
                                <p className="text-[11px] text-[#A1A1AA]">
                                    Bank çıxarışını daxil edərək cari balansla tutuşdurun
                                </p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#71717A] hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{createError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Bank Hesabı *</label>
                                <select
                                    required
                                    value={bankAccountId}
                                    onChange={(e) => handleBankChange(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="">Seçin...</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.bankName} - {b.accountName} ({formatCurrency(b.currentBalance, b.currency)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Çıxarış Nömrəsi</label>
                                    <input
                                        type="text"
                                        value={statementNumber}
                                        onChange={(e) => setStatementNumber(e.target.value)}
                                        placeholder="məs. BS-2026/01"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Çıxarış Tarixi *</label>
                                    <input
                                        type="date"
                                        required
                                        value={statementDate}
                                        onChange={(e) => setStatementDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Kitab / İlkin Qalıq (AZN)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Bank Çıxarış Son Qalığı (AZN) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={statementEndingBalance}
                                        onChange={(e) => setStatementEndingBalance(parseFloat(e.target.value) || 0)}
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Live Difference Badge */}
                            <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between text-xs font-mono">
                                <span className="text-[#A1A1AA]">Hesablanmış Fərq:</span>
                                <span
                                    className={`font-bold px-2 py-0.5 rounded ${
                                        Math.abs(liveDifference) < 0.01
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                >
                                    {Math.abs(liveDifference) < 0.01
                                        ? '0.00 ₼ (Balanslar tam uyğundur)'
                                        : `${liveDifference > 0 ? `+${formatCurrency(liveDifference)}` : formatCurrency(liveDifference)} (Fərq aşkarlandı)`}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Qeyd</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="məs. Cari ay üzrə bank çıxarışı"
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold cursor-pointer"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? 'Saxlanılır...' : 'Üzləşdirməni Yarat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedReconciliation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="bg-[#12141A] border border-[#27272A] rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div className="flex items-center gap-2.5">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <h3 className="text-sm font-bold">{selectedReconciliation.bankAccountName || 'Bank Hesabı'}</h3>
                                    <p className="text-[11px] text-[#A1A1AA]">
                                        Çıxarış № {selectedReconciliation.statementNumber || '—'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReconciliation(null)} className="text-[#71717A] hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#18181B] border border-[#27272A] text-xs">
                            <div>
                                <span className="text-[#71717A] block mb-1">Çıxarış Tarixi</span>
                                <span className="text-white font-mono">{formatDate(selectedReconciliation.statementDate)}</span>
                            </div>
                            <div>
                                <span className="text-[#71717A] block mb-1">Status</span>
                                <span className={selectedReconciliation.isReconciled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                    {selectedReconciliation.isReconciled ? 'Üzləşdirilib (Təsdiqlənib)' : 'Açıq Fərq'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#71717A] block mb-1">Daxili Kitab Qalığı</span>
                                <span className="text-white font-mono font-bold">
                                    {formatCurrency(selectedReconciliation.bookBalance !== undefined ? selectedReconciliation.bookBalance : (selectedReconciliation.openingBalance || 0), selectedReconciliation.currency)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#71717A] block mb-1">Bank Çıxarış Qalığı</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                    {formatCurrency(selectedReconciliation.statementEndingBalance !== undefined ? selectedReconciliation.statementEndingBalance : (selectedReconciliation.closingBalance || 0), selectedReconciliation.currency)}
                                </span>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-[#27272A] flex justify-between items-center">
                                <span className="text-[#71717A]">Üzləşdirmə Fərqi:</span>
                                <span className={`font-mono font-bold ${Math.abs(selectedReconciliation.difference || 0) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(selectedReconciliation.difference || 0, selectedReconciliation.currency)}
                                </span>
                            </div>
                        </div>

                        {selectedReconciliation.notes && (
                            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA]">
                                <span className="text-[#71717A] block mb-1">Qeyd:</span>
                                {selectedReconciliation.notes}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-[#27272A]">
                            <div>
                                {!selectedReconciliation.isReconciled && (
                                    <button
                                        onClick={(e) => handleReconcile(selectedReconciliation.id, e)}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
                                    >
                                        Üzləşdirməni Təsdiqlə
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedReconciliation(null)}
                                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold cursor-pointer"
                            >
                                Bağla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReconciliationPage;

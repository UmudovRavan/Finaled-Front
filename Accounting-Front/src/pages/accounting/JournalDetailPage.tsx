import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { accountsService } from '../../api';
import type { JournalEntryDto, AccountDto } from '../../dto';
import { formatDate, formatDateTime, extractErrorMessage } from '../../utils';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathRoundedSquareIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';

export const JournalDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [entry, setEntry] = useState<JournalEntryDto | null>(null);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    // Reversal Modal
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [reversalReason, setReversalReason] = useState('Səhv əməliyyatın ləğvi');
    const [reversalDate, setReversalDate] = useState(new Date().toISOString().split('T')[0]);
    const [reverseLoading, setReverseLoading] = useState(false);
    const [reverseError, setReverseError] = useState('');

    const fetchJournalData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [entryData, accsData] = await Promise.all([
                accountsService.getJournalEntry(id),
                accountsService.getAccounts(),
            ]);
            setEntry(entryData);
            setAccounts(Array.isArray(accsData) ? accsData : []);
        } catch (err) {
            console.error('Error fetching journal detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournalData();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const handlePost = async () => {
        if (!entry) return;
        try {
            await accountsService.postJournalEntry(entry.id, entry.date);
            showToast('Qeyd baş kitaba uğurla keçirildi (Posted)!');
            fetchJournalData();
        } catch (err: any) {
            showToast(extractErrorMessage(err, 'Qeydi təsdiqləmək mümkün olmadı.'));
        }
    };

    const handleReverseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entry) return;
        setReverseLoading(true);
        setReverseError('');
        try {
            await accountsService.reverseJournalEntry(entry.id, reversalReason, reversalDate);
            setShowReverseModal(false);
            showToast('Qeyd uğurla tərs çevrildi (Reversed)!');
            fetchJournalData();
        } catch (err: any) {
            setReverseError(extractErrorMessage(err, 'Ləğvetmə zamanı xəta baş verdi.'));
        } finally {
            setReverseLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getStatusBadge = (status: string) => {
        const s = String(status || '').toLowerCase();
        if (s === 'posted' || s === 'approved') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                    Posted
                </span>
            );
        }
        if (s === 'reversed' || s === 'cancelled') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2E1619] text-[#F87171] border border-[#EF4444]/30">
                    Reversed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#292214] text-[#FBBF24] border border-[#F59E0B]/30">
                Draft
            </span>
        );
    };

    const getAccountName = (accId: string) => {
        const found = accounts.find((a) => String(a.id).toLowerCase() === String(accId).toLowerCase());
        return found ? `${found.code} - ${found.name}` : accId;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-white text-sm">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Jurnal məlumatları yüklənir...</span>
                </div>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-white text-base font-semibold">Jurnal qeydi tapılmadı.</p>
                <Link
                    to="/journal"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Jurnal Siyahısına Qayıt</span>
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
                        onClick={() => navigate('/journal')}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/journal" className="hover:text-zinc-300 transition-colors">Jurnal Qeydləri</Link>
                        <span className="text-[#52525B]">/</span>
                        <span className="font-mono text-white">{entry.entryNumber}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {getStatusBadge(entry.status)}

                    {entry.status === 'Draft' && (
                        <button
                            onClick={handlePost}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Baş Kitaba Keçir (Post)</span>
                        </button>
                    )}

                    {entry.status === 'Posted' && (
                        <button
                            onClick={() => setShowReverseModal(true)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                            <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                            <span>Ləğv Et (Reverse)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Toast Message */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Tarix</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                        {formatDate(entry.date)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">İstinad №</span>
                    <span className="text-sm font-mono font-bold text-white mt-1 block truncate">
                        {entry.reference || '—'}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Debet Cəmi</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                        {formatCurrency(entry.totalDebit || 0)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Kredit Cəmi</span>
                    <span className="text-sm font-mono font-bold text-white mt-1 block">
                        {formatCurrency(entry.totalCredit || 0)}
                    </span>
                </div>
            </div>

            {/* General Info Card */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Ümumi Məlumat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-[#71717A] block">Təsvir / Açıqlama</span>
                        <span className="text-white font-medium mt-0.5 block">{entry.description || '—'}</span>
                    </div>
                    <div>
                        <span className="text-[#71717A] block">Status Tarixi</span>
                        <span className="text-white font-medium mt-0.5 block">
                            {entry.postedAt ? `Baş kitaba keçirilib: ${formatDateTime(entry.postedAt)}` : 'Qaralama'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Journal Lines Table */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">İkiqat Müxabirləşmə Sətirləri</h3>
                    <span className="text-xs font-mono text-[#A1A1AA]">{(entry.lines || []).length} sətir</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7]">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-4">Hesab (Kod və Ad)</th>
                                <th className="py-3 px-4">Sətir Təsviri</th>
                                <th className="py-3 px-4 text-right">Debet (AZN)</th>
                                <th className="py-3 px-4 text-right">Kredit (AZN)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60">
                            {(entry.lines || []).map((line, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4 font-semibold text-white">
                                        {line.accountCode ? `${line.accountCode} - ${line.accountName}` : getAccountName(line.accountId)}
                                    </td>
                                    <td className="py-3 px-4 text-[#A1A1AA]">
                                        {line.description || entry.description || '—'}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                        {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                        {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-[#27272A] bg-[#18181B] font-bold font-mono text-white text-xs">
                                <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-[#A1A1AA]">Cəmi:</td>
                                <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(entry.totalDebit || 0)}</td>
                                <td className="py-3 px-4 text-right">{formatCurrency(entry.totalCredit || 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Reversal Confirmation Modal */}
            {showReverseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <h3 className="text-sm font-bold text-white">Jurnal Qeydinin Ləğvi (Reverse)</h3>
                            <button
                                onClick={() => setShowReverseModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {reverseError && (
                            <div className="p-3 rounded-xl bg-[#2E1619] border border-[#EF4444]/40 text-[#F87171] text-xs">
                                {reverseError}
                            </div>
                        )}

                        <form onSubmit={handleReverseSubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ləğvetmə Səbəbi *</label>
                                <input
                                    type="text"
                                    required
                                    value={reversalReason}
                                    onChange={(e) => setReversalReason(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#A1A1AA]">Ləğvetmə Tarixi *</label>
                                <input
                                    type="date"
                                    required
                                    value={reversalDate}
                                    onChange={(e) => setReversalDate(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-white focus:border-white focus:outline-none"
                                />
                            </div>

                            <p className="text-[11px] text-[#A1A1AA] bg-[#121214] p-3 rounded-xl border border-[#27272A]">
                                ⚠️ Bu əməliyyat baş kitabda əks-müxabirləşmə yaradacaq və qeydin statusunu "Reversed" edəcək.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReverseModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={reverseLoading}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
                                >
                                    {reverseLoading ? 'Ləğv edilir...' : 'Təsdiqlə və Ləğv Et'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalDetailPage;

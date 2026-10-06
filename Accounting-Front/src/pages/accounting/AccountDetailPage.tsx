import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { accountsService } from '../../api';
import type { AccountDto, JournalEntryDto, InitialBalanceRequest } from '../../dto';
import { formatDate } from '../../utils';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ScaleIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export const AccountDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [account, setAccount] = useState<AccountDto | null>(null);
    const [allAccounts, setAllAccounts] = useState<AccountDto[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntryDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Active Tab in Right Panel
    const [activeTab, setActiveTab] = useState<'transactions' | 'subaccounts' | 'summary'>('transactions');
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    // Initial Balance Modal
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceError, setBalanceError] = useState('');
    const [balanceForm, setBalanceForm] = useState<InitialBalanceRequest>({
        accountId: id || '',
        debitAmount: 0,
        creditAmount: 0,
        asOfDate: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const fetchAccountData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [accsData, entriesData] = await Promise.allSettled([
                accountsService.getAccounts(),
                accountsService.getJournalEntries({ pageSize: 100 }),
            ]);

            let foundAcc: AccountDto | null = null;
            if (accsData.status === 'fulfilled' && Array.isArray(accsData.value)) {
                setAllAccounts(accsData.value);
                const target = String(id).toLowerCase();
                foundAcc = accsData.value.find((a) => String(a.id).toLowerCase() === target || a.code.toLowerCase() === target) || null;
                setAccount(foundAcc);
            }

            if (entriesData.status === 'fulfilled' && Array.isArray(entriesData.value)) {
                // Filter entries that touch this account
                const targetId = foundAcc?.id ? String(foundAcc.id).toLowerCase() : String(id).toLowerCase();
                const relevant = entriesData.value.filter((entry) => {
                    if (!entry.lines || !Array.isArray(entry.lines)) return false;
                    return entry.lines.some((l: any) => String(l.accountId).toLowerCase() === targetId);
                });
                setJournalEntries(relevant);
            }
        } catch (err) {
            console.error('Error fetching account details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const handleSetInitialBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        setBalanceLoading(true);
        setBalanceError('');
        try {
            await accountsService.setInitialBalance({
                ...balanceForm,
                accountId: account?.id || id || '',
            });
            setShowBalanceModal(false);
            showToast('İlkin qalıq uğurla təyin edildi!');
            fetchAccountData();
        } catch (err: any) {
            setBalanceError(err.response?.data?.message || err.message || 'İlkin qalıq qeyd olunarkən xəta baş verdi.');
        } finally {
            setBalanceLoading(false);
        }
    };

    // Sub-accounts whose parent is this account
    const subAccounts = useMemo(() => {
        if (!account?.id || !allAccounts) return [];
        const accId = String(account.id).toLowerCase();
        return allAccounts.filter((a) => a.parentAccountId && String(a.parentAccountId).toLowerCase() === accId);
    }, [account, allAccounts]);

    // Parent account if any
    const parentAccount = useMemo(() => {
        if (!account?.parentAccountId || !allAccounts) return null;
        const pId = String(account.parentAccountId).toLowerCase();
        return allAccounts.find((a) => String(a.id).toLowerCase() === pId) || null;
    }, [account, allAccounts]);

    const formatCurrency = (val: number, cur: string = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: cur || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getTypeColor = (type: string | number) => {
        const typeStr = String(type);
        if (typeStr.includes('Asset') || typeStr === '1') return '#38BDF8';
        if (typeStr.includes('Liability') || typeStr === '2') return '#F59E0B';
        if (typeStr.includes('Equity') || typeStr === '3') return '#A855F7';
        if (typeStr.includes('Revenue') || typeStr.includes('Income') || typeStr === '4') return '#22C55E';
        if (typeStr.includes('Expense') || typeStr === '5') return '#EF4444';
        return '#71717A';
    };

    const getCategoryName = (cat: any) => {
        if (cat === 1 || cat === 'Asset') return 'Aktiv (Asset)';
        if (cat === 2 || cat === 'Liability') return 'Öhdəlik (Liability)';
        if (cat === 3 || cat === 'Equity') return 'Kapital (Equity)';
        if (cat === 4 || cat === 'Income' || cat === 'Revenue') return 'Gəlir (Income)';
        if (cat === 5 || cat === 'Expense') return 'Xərc (Expense)';
        return String(cat || '—');
    };

    const getTypeName = (type: any) => {
        if (type === 0 || type === 'Standard') return 'Standart';
        if (type === 1 || type === 'Receivable') return 'Debitor (Receivable)';
        if (type === 2 || type === 'Payable') return 'Kreditor (Payable)';
        if (type === 3 || type === 'Bank') return 'Bank';
        if (type === 4 || type === 'Cash') return 'Kassa';
        if (type === 5 || type === 'Stock') return 'Anbar (Stock)';
        if (type === 10 || type === 'Revenue') return 'Gəlir (Revenue)';
        if (type === 11 || type === 'Expense') return 'Xərc (Expense)';
        if (type === 12 || type === 'FixedAsset') return 'Əsas Vəsait (Fixed Asset)';
        if (type === 13 || type === 'CurrentAsset') return 'Cari Aktiv (Current Asset)';
        if (type === 14 || type === 'CurrentLiability') return 'Qısamüddətli Öhdəlik';
        if (type === 15 || type === 'LongTermLiability') return 'Uzunmüddətli Öhdəlik';
        return String(type || 'Standart');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-xs text-[#71717A]">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
                <span>Hesab məlumatları yüklənir...</span>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-white text-sm">Hesab tapılmadı.</p>
                <Link
                    to="/accounts"
                    className="inline-block px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl"
                >
                    Hesablar Planına Qayıt
                </Link>
            </div>
        );
    }

    const currentBal = Number(account.balance ?? (account as any).currentBalance) || 0;
    const initialChar = (account.name || 'H').charAt(0).toUpperCase();

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* Toast Alert */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── 1. TOP BREADCRUMB BAR (Exact CRM Match) ─── */}
            <div className="px-1 py-1 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] flex-wrap">
                    <Link to="/accounts" className="hover:text-white transition-colors">
                        Hesablar Planı
                    </Link>
                    <span>/</span>
                    <Link to="/accounts" className="hover:text-white transition-colors">
                        Siyahı
                    </Link>
                    <span>/</span>
                    <span className="text-white font-semibold">
                        {account.code} - {account.name}
                    </span>
                </div>

                <Link
                    to="/accounts"
                    className="px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors"
                >
                    ← Siyahıya qayıt
                </Link>
            </div>

            {/* ─── 2. MAIN TWO-COLUMN CONTENT BODY (Matches CRM ContactDetailPage) ─── */}
            <div className="flex flex-col lg:flex-row min-w-0 border border-[#27272A] rounded-2xl bg-[#121214] overflow-hidden shadow-2xl">
                {/* ─── LEFT PANEL: AVATAR, BALANCE & DETAILS ─── */}
                <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-[#27272A] bg-[#121214] p-5 sm:p-6 space-y-5 text-xs overflow-y-auto custom-scrollbar">
                    {/* Header Info */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-13 h-13 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {initialChar}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-white truncate leading-snug">{account.name}</h1>
                            <p className="text-xs text-[#A1A1AA] font-mono font-bold mt-0.5">{account.code}</p>
                        </div>
                    </div>

                    {/* Balance Highlight Box */}
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 space-y-1">
                        <span className="text-[11px] text-[#A1A1AA] font-medium block">Cari Qalıq</span>
                        <span className="text-2xl font-bold font-mono text-white tracking-tight block">
                            {formatCurrency(currentBal, account.currency)}
                        </span>
                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                            <span
                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: getTypeColor(account.type) }}
                            />
                            <span className="text-[#A1A1AA]">{account.type || 'Asset'}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setBalanceError('');
                                setBalanceForm({
                                    accountId: account.id,
                                    debitAmount: 0,
                                    creditAmount: 0,
                                    asOfDate: new Date().toISOString().split('T')[0],
                                    notes: '',
                                });
                                setShowBalanceModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-white font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
                        >
                            <ScaleIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>İlkin Qalıq Təyin Et</span>
                        </button>
                    </div>

                    <div className="h-px bg-[#27272A]"></div>

                    {/* Collapsible Details Section (Exact CRM Layout) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-white transition-colors text-sm"
                            >
                                <span>Detallar</span>
                                {isDetailsOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
                            </button>
                        </div>

                        {isDetailsOpen && (
                            <div className="space-y-3 text-xs">
                                {/* Hesab Kodu */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Hesab Kodu</label>
                                    <span className="font-mono font-bold text-white block">{account.code}</span>
                                </div>

                                {/* Hesabın Adı */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Hesabın Adı</label>
                                    <span className="font-semibold text-white block">{account.name}</span>
                                </div>

                                {/* Kateqoriya */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Kateqoriya</label>
                                    <span className="text-white block">{getCategoryName(account.category || account.type)}</span>
                                </div>

                                {/* Hesab Növü */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Hesab Növü (Type)</label>
                                    <span className="text-white block">{getTypeName(account.type)}</span>
                                </div>

                                {/* Valyuta */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Valyuta</label>
                                    <span className="font-mono text-white block">{account.currency || 'AZN'}</span>
                                </div>

                                {/* Nəzarət Hesabı */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Nəzarət Hesabı (Control)</label>
                                    <span className="text-white block">{account.isControlAccount ? 'Bəli' : 'Xeyr'}</span>
                                </div>

                                {/* Ana Hesab */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Ana Hesab (Parent)</label>
                                    <span className="text-white block">
                                        {parentAccount ? `${parentAccount.code} - ${parentAccount.name}` : 'Yoxdur (Baş Hesab)'}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">Status</label>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                                                account.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                                            }`}
                                        />
                                        <span className="text-white">{account.isActive ? 'Aktiv' : 'Deaktiv'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT MAIN PANEL: TABS & TABLES ─── */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col min-w-0 bg-[#121214]">
                    {/* Tabs Header with Badges (Matches CRM) */}
                    <div className="border-b border-[#27272A] pb-3 flex items-center gap-4 flex-wrap">
                        {/* Tab 1: Transactions */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('transactions')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'transactions'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Jurnal Qeydləri</span>
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                                {journalEntries.length}
                            </span>
                        </button>

                        {/* Tab 2: Sub-accounts */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('subaccounts')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'subaccounts'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            <span>Alt Hesablar</span>
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                                {subAccounts.length}
                            </span>
                        </button>

                        {/* Tab 3: Summary */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('summary')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'summary'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <ScaleIcon className="w-4 h-4" />
                            <span>Maliyyə Hərəkəti</span>
                        </button>
                    </div>

                    {/* Tab 1 Content: Transactions Table */}
                    {activeTab === 'transactions' && (
                        <div className="mt-5 flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4">NÖMRƏ</th>
                                        <th className="py-3 px-4">TARİX</th>
                                        <th className="py-3 px-4">TƏSVİR</th>
                                        <th className="py-3 px-4 text-right">MƏBLƏĞ</th>
                                        <th className="py-3 px-4 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-[#D4D4D8]">
                                    {journalEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-[#71717A]">
                                                Bu hesab üzrə hələ heç bir jurnal qeydi aparılmayıb.
                                            </td>
                                        </tr>
                                    ) : (
                                        journalEntries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-[#18181B]/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    {entry.entryNumber}
                                                </td>
                                                <td className="py-3.5 px-4 text-[#A1A1AA]">
                                                    {formatDate(entry.date, '—')}
                                                </td>
                                                <td className="py-3.5 px-4 text-white">
                                                    {entry.description || 'Jurnal əməliyyatı'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency(Number(entry.totalDebit || entry.totalCredit || 0), account.currency)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            entry.status === 'POSTED'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-zinc-800 text-zinc-400'
                                                        }`}
                                                    >
                                                        {entry.status === 'POSTED' ? 'Təsdiqlənib' : 'Qaralama'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2 Content: Sub-Accounts Table */}
                    {activeTab === 'subaccounts' && (
                        <div className="mt-5 flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4">KOD</th>
                                        <th className="py-3 px-4">HESABIN ADI</th>
                                        <th className="py-3 px-4">TİPİ</th>
                                        <th className="py-3 px-4 text-right">QALIQ</th>
                                        <th className="py-3 px-4 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-[#D4D4D8]">
                                    {subAccounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-[#71717A]">
                                                Bu hesaba bağlı heç bir alt hesab mövcud deyil.
                                            </td>
                                        </tr>
                                    ) : (
                                        subAccounts.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-[#18181B]/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    <Link to={`/accounts/${sub.id}`} className="hover:underline">
                                                        {sub.code}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-white">
                                                    <Link to={`/accounts/${sub.id}`} className="hover:underline">
                                                        {sub.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-4 text-[#A1A1AA]">{sub.type}</td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency(Number(sub.balance ?? (sub as any).currentBalance) || 0, sub.currency)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${sub.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'}`} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 3 Content: Summary Breakdown */}
                    {activeTab === 'summary' && (
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">Ümumi Cari Qalıq</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {formatCurrency(currentBal, account.currency)}
                                </span>
                            </div>
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">Əlaqəli Əməliyyat Sayı</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {journalEntries.length}
                                </span>
                            </div>
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">Alt Hesabların Sayı</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {subAccounts.length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── INITIAL BALANCE MODAL ─── */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg text-[#E4E4E7] overflow-hidden animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 p-5">
                            <div>
                                <h3 className="text-base font-bold text-white">İlkin Qalıq Təyin Et</h3>
                                <p className="text-xs text-[#71717A]">
                                    {account.code} - {account.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBalanceModal(false)}
                                className="p-1 rounded-lg text-[#A1A1AA] hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSetInitialBalance} className="p-6 space-y-4 text-xs">
                            {balanceError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                                    <span>{balanceError}</span>
                                    <button type="button" onClick={() => setBalanceError('')} className="text-rose-400 hover:text-white p-0.5 cursor-pointer">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[#A1A1AA] font-medium">Debet Məbləği</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={balanceForm.debitAmount}
                                        onChange={(e) =>
                                            setBalanceForm({
                                                ...balanceForm,
                                                debitAmount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#A1A1AA] font-medium">Kredit Məbləği</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={balanceForm.creditAmount}
                                        onChange={(e) =>
                                            setBalanceForm({
                                                ...balanceForm,
                                                creditAmount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[#A1A1AA] font-medium">Qalıq Tarixi</label>
                                <input
                                    type="date"
                                    required
                                    value={balanceForm.asOfDate}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, asOfDate: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white focus:outline-none focus:border-white"
                                />
                            </div>

                            <div>
                                <label className="text-[#A1A1AA] font-medium">Qeydlər</label>
                                <input
                                    type="text"
                                    placeholder="İlkin saldo qeydi..."
                                    value={balanceForm.notes}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, notes: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#2C2C2E] text-white placeholder:text-[#71717A] focus:outline-none focus:border-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2E]/60">
                                <button
                                    type="button"
                                    onClick={() => setShowBalanceModal(false)}
                                    className="px-4 py-2 rounded-xl border border-[#2C2C2E] text-xs font-semibold text-[#A1A1AA] hover:text-white"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={balanceLoading}
                                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {balanceLoading ? 'Yadda saxlanılır...' : 'Təsdiqlə'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountDetailPage;

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService, accountsService } from '../../api';
import type { BankAccountDto, AccountDto } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BuildingLibraryIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentTextIcon,
    PlusIcon,
    XMarkIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

interface StatementLineInput {
    transactionDate: string;
    amount: number;
    reference: string;
    counterpartyName: string;
    description: string;
}

export const BankAccountDetailPage: React.FC = () => {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [bankAccount, setBankAccount] = useState<BankAccountDto | null>(null);
    const [glAccounts, setGlAccounts] = useState<AccountDto[]>([]);
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [copiedIban, setCopiedIban] = useState(false);

    // Import Statement Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [stmtNumber, setStmtNumber] = useState('');
    const [stmtDate, setStmtDate] = useState(new Date().toISOString().split('T')[0]);
    const [stmtOpeningBalance, setStmtOpeningBalance] = useState<number>(0);
    const [stmtClosingBalance, setStmtClosingBalance] = useState<number>(0);
    const [stmtLines, setStmtLines] = useState<StatementLineInput[]>([
        {
            transactionDate: new Date().toISOString().split('T')[0],
            amount: 0,
            reference: 'Mədaxil / Ödəniş',
            counterpartyName: '',
            description: '',
        },
    ]);
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4500);
    };

    const loadData = async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [accData, accList, stmtList] = await Promise.all([
                paymentService.getBankAccount(id),
                accountsService.getAccounts().catch(() => []),
                paymentService.getBankStatements(id).catch(() => []),
            ]);

            setBankAccount(accData);
            setGlAccounts(accList);
            setStatements(stmtList);
            setStmtOpeningBalance(accData.currentBalance || 0);
            setStmtClosingBalance(accData.currentBalance || 0);
        } catch (err) {
            console.error('Failed to load bank account detail:', err);
            showToast(t('treasury.loadFailed', {}, 'Bank hesabı məlumatları yüklənərkən xəta baş verdi'), 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleCopyIban = (iban: string) => {
        if (!iban) return;
        navigator.clipboard.writeText(iban);
        setCopiedIban(true);
        setTimeout(() => setCopiedIban(false), 2000);
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
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}.${month}.${year}`;
        } catch {
            return dateStr;
        }
    };

    const matchedGl = useMemo(() => {
        if (!bankAccount?.glAccountId) return null;
        return glAccounts.find((g) => g.id === bankAccount.glAccountId);
    }, [bankAccount, glAccounts]);

    // Open Import Statement Modal
    const openImportModal = () => {
        setStmtNumber(`BS-${Date.now().toString().slice(-6)}`);
        setStmtDate(new Date().toISOString().split('T')[0]);
        setStmtOpeningBalance(bankAccount?.currentBalance || 0);
        setStmtClosingBalance(bankAccount?.currentBalance || 0);
        setStmtLines([
            {
                transactionDate: new Date().toISOString().split('T')[0],
                amount: 0,
                reference: t('treasury.depositOrPayment', {}, 'Mədaxil / Ödəniş'),
                counterpartyName: '',
                description: '',
            },
        ]);
        setImportError('');
        setShowImportModal(true);
    };

    const handleAddStmtLine = () => {
        setStmtLines([
            ...stmtLines,
            {
                transactionDate: stmtDate,
                amount: 0,
                reference: t('treasury.depositOrPayment', {}, 'Mədaxil / Ödəniş'),
                counterpartyName: '',
                description: '',
            },
        ]);
    };

    const handleRemoveStmtLine = (idx: number) => {
        if (stmtLines.length <= 1) return;
        setStmtLines(stmtLines.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: keyof StatementLineInput, val: any) => {
        const next = [...stmtLines];
        next[idx] = { ...next[idx], [field]: val };
        setStmtLines(next);

        // Auto-calculate closing balance if desired
        const linesSum = next.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
        setStmtClosingBalance((Number(stmtOpeningBalance) || 0) + linesSum);
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankAccount?.id) return;

        setImportLoading(true);
        setImportError('');

        try {
            const validLines = stmtLines.filter((l) => Number(l.amount) !== 0);

            await paymentService.importBankStatement({
                bankAccountId: bankAccount.id,
                statementNumber: stmtNumber.trim(),
                statementDate: stmtDate,
                openingBalance: Number(stmtOpeningBalance) || 0,
                closingBalance: Number(stmtClosingBalance) || 0,
                lines: validLines.map((l) => ({
                    transactionDate: l.transactionDate,
                    amount: Number(l.amount) || 0,
                    reference: l.reference.trim(),
                    counterpartyName: l.counterpartyName.trim(),
                    description: l.description.trim(),
                })),
            });

            showToast(t('treasury.statementImportedSuccess', {}, 'Bank çıxarışı uğurla idxal edildi və hesab balansı yeniləndi!'));
            setShowImportModal(false);
            loadData(true);
        } catch (err: any) {
            console.error('Failed to import statement:', err);
            const msg = err.response?.data?.detail || err.response?.data?.message || err.message || t('common.error', {}, 'Xəta baş verdi');
            setImportError(msg);
        } finally {
            setImportLoading(false);
        }
    };

    // Flatten all statement transaction lines for the activity table
    const allTransactionLines = useMemo(() => {
        const list: any[] = [];
        statements.forEach((st) => {
            (st.lines || []).forEach((l: any) => {
                list.push({
                    ...l,
                    statementNumber: st.statementNumber,
                    statementDate: st.statementDate,
                });
            });
        });
        list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        return list;
    }, [statements]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-zinc-400">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-white" />
                <span className="text-sm">{t('common.loading', {}, 'Bank hesabı məlumatları yüklənir...')}</span>
            </div>
        );
    }

    if (!bankAccount) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-zinc-500">
                    <BuildingLibraryIcon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">{t('treasury.noAccountsFound', {}, 'Bank Hesabı Tapılmadı')}</h2>
                <p className="text-xs text-zinc-400">{t('treasury.accountNotFoundDesc', {}, 'Axtardığınız bank hesabı mövcud deyil və ya silinib.')}</p>
                <Link
                    to="/bank-accounts"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>{t('treasury.backToBankAccounts', {}, 'Bank Hesablarına Qayıt')}</span>
                </Link>
            </div>
        );
    }

    const isCash = bankAccount.accountType === 'Cash' || String(bankAccount.bankName).toLowerCase().includes('kassa');

    return (
        <div className="space-y-6 font-sans text-white max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/bank-accounts"
                            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                            <span>{t('treasury.bankAccountsTitle', {}, 'Bank Hesabları')}</span>
                        </Link>
                        <span className="text-xs text-zinc-600">/</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{bankAccount.bankName}</h1>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isCash
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                        >
                            {isCash ? t('treasury.typeCash', {}, 'Kassa') : t('treasury.typeBank', {}, 'Bank Hesabı')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18181B] text-zinc-300 border border-[#27272A]">
                            {bankAccount.currency}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                        <span>{t('treasury.accountNumber', {}, 'Hesab / IBAN')}: <strong className="text-white font-mono">{bankAccount.accountNumber || bankAccount.iban || '—'}</strong></span>
                        {bankAccount.accountNumber && (
                            <button
                                onClick={() => handleCopyIban(bankAccount.accountNumber)}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title={t('common.copy', {}, 'Kopyala')}
                            >
                                {copiedIban ? (
                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                )}
                            </button>
                        )}
                        {bankAccount.swiftCode && (
                            <span>• SWIFT: <strong className="text-white font-mono">{bankAccount.swiftCode}</strong></span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadData(false)}
                        disabled={loading || isRefreshing}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={openImportModal}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 text-black" />
                        <span>{t('treasury.importStatement', {}, 'Çıxarış İdxal Et / Balans Yenilə')}</span>
                    </button>
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
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.currentBalance', {}, 'Cari Balans')}</div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                            {formatCurrency(bankAccount.currentBalance, bankAccount.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.availableBalanceDesc', {}, 'Mövcud nağd / bank qalığı')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <BanknotesIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalDeposits', {}, 'Ümumi Mədaxil')}</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                            +{formatCurrency(bankAccount.totalDeposits || 0, bankAccount.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.incomingFunds', {}, 'Daxil olan vəsaitlər')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.totalWithdrawals', {}, 'Ümumi Məxaric')}</div>
                        <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
                            -{formatCurrency(bankAccount.totalWithdrawals || 0, bankAccount.currency)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.outgoingFunds', {}, 'Çıxarılan / ödənilən vəsait')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <ArrowTrendingDownIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-medium text-zinc-400">{t('treasury.glAccount', {}, 'Mühasibatlıq (GL) Hesabı')}</div>
                        <div className="text-sm font-bold text-white mt-0.5 truncate max-w-[170px]">
                            {matchedGl ? `${matchedGl.code} - ${matchedGl.name}` : (bankAccount.glAccountId ? t('treasury.assigned', {}, 'Təyin edilib') : t('treasury.notAssigned', {}, 'Təyin edilməyib'))}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{t('treasury.glRelation', {}, 'Baş kitab əlaqəsi')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Account Details & Specifications Card */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                        <BuildingLibraryIcon className="w-4 h-4 text-zinc-400" />
                        <h2 className="text-sm font-bold text-white">{t('treasury.accountSpecifications', {}, 'Hesab Parametrləri və Rekvizitlər')}</h2>
                    </div>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            bankAccount.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                    >
                        {bankAccount.isActive ? t('statuses.active', {}, 'Aktiv') : t('statuses.inactive', {}, 'Deaktiv')}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.bankName', {}, 'Bank / Təşkilat Adı')}</span>
                        <span className="font-semibold text-white">{bankAccount.bankName}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.accountNumber', {}, 'Hesab Nömrəsi / IBAN')}</span>
                        <span className="font-mono font-semibold text-white">
                            {bankAccount.accountNumber || bankAccount.iban || '—'}
                        </span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.swiftCode', {}, 'SWIFT / BIC Kodu')}</span>
                        <span className="font-mono font-semibold text-white">{bankAccount.swiftCode || '—'}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.mainCurrency', {}, 'Əsas Valyuta')}</span>
                        <span className="font-semibold text-white">{bankAccount.currency}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.branchName', {}, 'Filial / Şöbə')}</span>
                        <span className="text-zinc-300">{bankAccount.branchName || t('treasury.headOffice', {}, 'Baş Ofis')}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.linkedGlAccount', {}, 'Əlaqəli Mühasibat Hesabı')}</span>
                        <span className="text-zinc-300">
                            {matchedGl ? `${matchedGl.code} - ${matchedGl.name}` : (bankAccount.glAccountId ? bankAccount.glAccountId : '—')}
                        </span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.statementsCount', {}, 'Çıxarışların Sayı')}</span>
                        <span className="font-mono text-zinc-300">{statements.length} {t('treasury.statements', {}, 'çıxarış')}</span>
                    </div>

                    <div>
                        <span className="text-zinc-500 block mb-1">{t('treasury.registrationDate', {}, 'Qeydiyyat Tarixi')}</span>
                        <span className="text-zinc-300">{formatDate(bankAccount.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Transactions & Statements History Table */}
            <div className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-2xl space-y-0">
                <div className="p-4 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
                        <h2 className="text-sm font-bold text-white">{t('treasury.transactionsAndStatements', {}, 'Hesab Hərəkətləri və Çıxarış Sətirləri')}</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#121214] text-zinc-400 border border-[#27272A]">
                            {allTransactionLines.length} {t('inventory.linesCount', {}, 'sətir')}
                        </span>
                    </div>

                    <button
                        onClick={openImportModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>{t('treasury.addNewMovement', {}, 'Yeni Hərəkət Əlavə Et')}</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                                <th className="py-3 px-4">{t('common.date', {}, 'Tarix')}</th>
                                <th className="py-3 px-4">{t('treasury.statementNumber', {}, 'Sənəd / Çıxarış №')}</th>
                                <th className="py-3 px-4">{t('treasury.party', {}, 'Qarşı Tərəf')}</th>
                                <th className="py-3 px-4">{t('common.description', {}, 'Təyinat / Açıqlama')}</th>
                                <th className="py-3 px-4 text-right">{t('common.amount', {}, 'Məbləğ')}</th>
                                <th className="py-3 px-4 text-center">{t('common.status', {}, 'Status')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#27272A]">
                            {allTransactionLines.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DocumentTextIcon className="w-8 h-8 text-zinc-600" />
                                            <span className="font-semibold text-zinc-400">{t('treasury.noTransactionsRecorded', {}, 'Heç bir bank hərəkəti qeydə alınmayıb')}</span>
                                            <p className="text-[11px] text-zinc-500 max-w-sm">
                                                {t('treasury.noTransactionsDesc', {}, 'Bu hesab üzrə hələ ki bank çıxarışı idxal edilməyib. Yuxarıdakı "Çıxarış İdxal Et" düyməsi ilə hərəkət əlavə edə bilərsiniz.')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                allTransactionLines.map((row, idx) => {
                                    const isDeposit = row.amount >= 0;
                                    return (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                                                {formatDate(row.transactionDate)}
                                            </td>

                                            <td className="py-3 px-4 font-mono font-bold text-white">
                                                {row.statementNumber || row.reference || `TX-${idx + 1}`}
                                            </td>

                                            <td className="py-3 px-4 text-zinc-300">
                                                {row.counterpartyName || '—'}
                                            </td>

                                            <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                                                {row.description || row.reference || '—'}
                                            </td>

                                            <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                                                <span className={isDeposit ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {isDeposit ? '+' : ''}{formatCurrency(row.amount, bankAccount.currency)}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {t('statuses.posted', {}, 'Uçota alınıb')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Import Statement Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                            <div>
                                <h3 className="text-base font-bold text-white">{t('treasury.importStatementTitle', {}, 'Bank Çıxarışı İdxal Et / Balans Düzəlişi')}</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {bankAccount.bankName} ({bankAccount.currency}) {t('treasury.importStatementDesc', {}, 'hesabı üçün hərəkət sətirləri əlavə edin')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {importError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{importError}</span>
                            </div>
                        )}

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.statementNumber', {}, 'Çıxarış / Sənəd №')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={stmtNumber}
                                        onChange={(e) => setStmtNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">{t('common.date', {}, 'Tarix')} *</label>
                                    <input
                                        type="date"
                                        required
                                        value={stmtDate}
                                        onChange={(e) => setStmtDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.openingBalance', {}, 'Açılış Qalığı')} ({bankAccount.currency})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stmtOpeningBalance}
                                        onChange={(e) => {
                                            const op = Number(e.target.value) || 0;
                                            setStmtOpeningBalance(op);
                                            const linesSum = stmtLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
                                            setStmtClosingBalance(op + linesSum);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-white focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                                        {t('treasury.statementEndingBalance', {}, 'Bağlanış Qalığı')} ({bankAccount.currency})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stmtClosingBalance}
                                        onChange={(e) => setStmtClosingBalance(Number(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono font-bold text-emerald-400 focus:border-zinc-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-zinc-300">
                                        {t('treasury.movementLines', {}, 'Hərəkət Sətirləri (Mədaxil (+) və ya Məxaric (-))')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddStmtLine}
                                        className="flex items-center gap-1 text-xs text-white hover:text-zinc-300 font-semibold cursor-pointer"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>{t('treasury.addLine', {}, 'Sətir əlavə et')}</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {stmtLines.map((line, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-[#18181B] border border-[#27272A]"
                                        >
                                            <div className="col-span-3">
                                                <input
                                                    type="date"
                                                    value={line.transactionDate}
                                                    onChange={(e) => handleLineChange(idx, 'transactionDate', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-[#121214] border border-[#27272A] text-[11px] text-white focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder={t('treasury.amountPlusMinus', {}, 'Məbləğ (+/-)')}
                                                    value={line.amount || ''}
                                                    onChange={(e) => handleLineChange(idx, 'amount', Number(e.target.value))}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-[#121214] border border-[#27272A] text-[11px] font-mono font-bold text-white focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder={t('treasury.party', {}, 'Qarşı tərəf')}
                                                    value={line.counterpartyName}
                                                    onChange={(e) => handleLineChange(idx, 'counterpartyName', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-[#121214] border border-[#27272A] text-[11px] text-white focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder={t('common.description', {}, 'Təyinat')}
                                                    value={line.description}
                                                    onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-[#121214] border border-[#27272A] text-[11px] text-white focus:outline-hidden"
                                                />
                                            </div>

                                            <div className="col-span-1 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStmtLine(idx)}
                                                    disabled={stmtLines.length <= 1}
                                                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 cursor-pointer"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={importLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {importLoading ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    ) : (
                                        <CheckIcon className="w-4 h-4 text-black" />
                                    )}
                                    <span>{t('treasury.confirmAndImport', {}, 'Təsdiq Et və İdxal Et')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankAccountDetailPage;

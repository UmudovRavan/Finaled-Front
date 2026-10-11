import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsService } from '../../api';
import type { AccountDto, AccountTreeNodeDto, CreateAccountRequest } from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ViewColumnsIcon,
    EllipsisHorizontalIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    XMarkIcon,
    Bars3Icon,
    CheckIcon,
    PencilSquareIcon,
    SparklesIcon,
    FolderIcon,
    FolderOpenIcon,
    TableCellsIcon,
    ListBulletIcon,
    DocumentTextIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const CURRENCIES = ['AZN', 'USD', 'EUR', 'GBP', 'TRY'];

export const AccountsPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const ACCOUNT_CATEGORIES = useMemo(() => [
        { id: 1, label: t('accounting.asset', {}, 'Aktiv (Asset)') },
        { id: 2, label: t('accounting.liability', {}, 'Öhdəlik (Liability)') },
        { id: 3, label: t('accounting.equity', {}, 'Kapital (Equity)') },
        { id: 4, label: t('accounting.income', {}, 'Gəlir (Income)') },
        { id: 5, label: t('accounting.expense', {}, 'Xərc (Expense)') },
    ], [t]);

    const ACCOUNT_TYPE_OPTIONS = useMemo(() => [
        { id: 0, label: t('accounting.typeStandard', {}, 'Standart (Standard)') },
        { id: 1, label: t('accounting.typeReceivable', {}, 'Debitor (Receivable)') },
        { id: 2, label: t('accounting.typePayable', {}, 'Kreditor (Payable)') },
        { id: 3, label: t('accounting.typeBank', {}, 'Bank') },
        { id: 4, label: t('accounting.typeCash', {}, 'Kassa (Cash)') },
        { id: 5, label: t('accounting.typeStock', {}, 'Anbar (Stock)') },
        { id: 6, label: 'GRNI' },
        { id: 7, label: t('accounting.typeCogs', {}, 'Satışın Mayası (COGS)') },
        { id: 8, label: t('accounting.typeTax', {}, 'Vergi (Tax)') },
        { id: 9, label: t('accounting.typeRetainedEarnings', {}, 'Bölüşdürülməmiş Mənfəət') },
        { id: 10, label: t('accounting.typeRevenue', {}, 'Gəlir (Revenue)') },
        { id: 11, label: t('accounting.typeExpense', {}, 'Xərc (Expense)') },
        { id: 12, label: t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)') },
        { id: 13, label: t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)') },
        { id: 14, label: t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik') },
        { id: 15, label: t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik') },
        { id: 16, label: 'Yığılmış Amortizasiya (Accumulated Depreciation)' },
        { id: 17, label: 'Təhtəlhesab Məbləğlər (Accountable Persons)' },
        { id: 18, label: 'Verilmiş Avanslar (Advances Given)' },
        { id: 19, label: 'Alınmış Avanslar (Advances Received)' },
        { id: 20, label: 'Bank Kreditləri (Bank Loans)' },
    ], [t]);

    const ACCOUNT_SUBCATEGORIES_BY_CATEGORY = useMemo<Record<number, { id: number; label: string }[]>>(() => ({
        // 1: Aktivlər (Asset)
        1: [
            { id: 1, label: 'Uzunmüddətli aktivlər' },
            { id: 2, label: 'Dövriyyə Aktivləri' },
        ],
        // 2: Öhdəliklər (Liability)
        2: [
            { id: 3, label: 'Uzunmüddətli öhdəliklər' },
            { id: 4, label: 'Qısamüddətli öhdəliklər' },
        ],
        // 3: Kapital (Equity)
        3: [
            { id: 5, label: 'Nizamnamə Kapitalı' },
            { id: 6, label: 'Bölüşdürülməmiş Mənfəət / Zərər' },
            { id: 7, label: 'Digər Kapital və Ehtiyatlar' },
        ],
        // 4: Gəlirlər (Income)
        4: [
            { id: 8, label: 'Əsas Fəaliyyət Gəlirləri' },
            { id: 9, label: 'Digər Əməliyyat Gəlirləri' },
            { id: 10, label: 'Maliyyə Gəlirləri' },
            { id: 11, label: 'Digər Gəlirlər' },
        ],
        // 5: Xərclər (Expense)
        5: [
            { id: 12, label: 'Satışın Maya Dəyəri' },
            { id: 13, label: 'Satış və Marketinq Xərcləri' },
            { id: 14, label: 'İnzibati Xərclər' },
            { id: 15, label: 'Maliyyə Xərcləri' },
            { id: 16, label: 'Vergi Xərcləri' },
            { id: 17, label: 'Digər Xərclər' },
        ],
    }), []);

    const SUBCATEGORY_TO_CATEGORY_MAP = useMemo<Record<number, number>>(() => ({
        1: 1, 2: 1,
        3: 2, 4: 2,
        5: 3, 6: 3, 7: 3,
        8: 4, 9: 4, 10: 4, 11: 4,
        12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5,
    }), []);

    const ALL_SUBCATEGORY_GROUPS = useMemo(() => [
        {
            categoryId: 1,
            categoryName: 'Aktivlər (Asset)',
            options: [
                { id: 1, label: 'Uzunmüddətli aktivlər' },
                { id: 2, label: 'Dövriyyə Aktivləri' },
            ],
        },
        {
            categoryId: 2,
            categoryName: 'Öhdəliklər (Liability)',
            options: [
                { id: 3, label: 'Uzunmüddətli öhdəliklər' },
                { id: 4, label: 'Qısamüddətli öhdəliklər' },
            ],
        },
        {
            categoryId: 3,
            categoryName: 'Kapital (Equity)',
            options: [
                { id: 5, label: 'Nizamnamə Kapitalı' },
                { id: 6, label: 'Bölüşdürülməmiş Mənfəət / Zərər' },
                { id: 7, label: 'Digər Kapital və Ehtiyatlar' },
            ],
        },
        {
            categoryId: 4,
            categoryName: 'Gəlirlər (Income)',
            options: [
                { id: 8, label: 'Əsas Fəaliyyət Gəlirləri' },
                { id: 9, label: 'Digər Əməliyyat Gəlirləri' },
                { id: 10, label: 'Maliyyə Gəlirləri' },
                { id: 11, label: 'Digər Gəlirlər' },
            ],
        },
        {
            categoryId: 5,
            categoryName: 'Xərclər (Expense)',
            options: [
                { id: 12, label: 'Satışın Maya Dəyəri' },
                { id: 13, label: 'Satış və Marketinq Xərcləri' },
                { id: 14, label: 'İnzibati Xərclər' },
                { id: 15, label: 'Maliyyə Xərcləri' },
                { id: 16, label: 'Vergi Xərcləri' },
                { id: 17, label: 'Digər Xərclər' },
            ],
        },
    ], []);

    const getAccountTypeLabel = (typeVal: any, typeName?: string) => {
        if (typeName && typeof typeName === 'string' && !/^\d+$/.test(typeName.trim())) {
            return typeName;
        }

        const numeric = Number(typeVal);
        if (!isNaN(numeric) && typeVal !== null && typeVal !== undefined && typeVal !== '') {
            switch (numeric) {
                case 0: return t('accounting.typeStandard', {}, 'Standart');
                case 1: return t('accounting.typeReceivable', {}, 'Debitor (Receivable)');
                case 2: return t('accounting.typePayable', {}, 'Kreditor (Payable)');
                case 3: return t('accounting.typeBank', {}, 'Bank');
                case 4: return t('accounting.typeCash', {}, 'Kassa (Cash)');
                case 5: return t('accounting.typeStock', {}, 'Anbar (Stock)');
                case 6: return 'GRNI';
                case 7: return t('accounting.typeCogs', {}, 'Satışın Mayası (COGS)');
                case 8: return t('accounting.typeTax', {}, 'Vergi (Tax)');
                case 9: return t('accounting.typeRetainedEarnings', {}, 'Bölüşdürülməmiş Mənfəət');
                case 10: return t('accounting.typeRevenue', {}, 'Gəlir (Revenue)');
                case 11: return t('accounting.typeExpense', {}, 'Xərc (Expense)');
                case 12: return t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)');
                case 13: return t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)');
                case 14: return t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik');
                case 15: return t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik');
                case 16: return 'Yığılmış Amortizasiya';
                case 17: return 'Təhtəlhesab Məbləğlər';
                case 18: return 'Verilmiş Avanslar';
                case 19: return 'Alınmış Avanslar';
                case 20: return 'Bank Kreditləri';
                default: break;
            }
        }

        const str = String(typeVal ?? '');
        switch (str) {
            case 'Asset': return t('accounting.asset', {}, 'Aktiv (Asset)');
            case 'Liability': return t('accounting.liability', {}, 'Öhdəlik (Liability)');
            case 'Equity': return t('accounting.equity', {}, 'Kapital (Equity)');
            case 'Revenue':
            case 'Income': return t('accounting.typeRevenue', {}, 'Gəlir (Revenue)');
            case 'Expense': return t('accounting.typeExpense', {}, 'Xərc (Expense)');
            case 'Standard': return t('accounting.typeStandard', {}, 'Standart');
            case 'Receivable': return t('accounting.typeReceivable', {}, 'Debitor (Receivable)');
            case 'Payable': return t('accounting.typePayable', {}, 'Kreditor (Payable)');
            case 'Bank': return t('accounting.typeBank', {}, 'Bank');
            case 'Cash': return t('accounting.typeCash', {}, 'Kassa');
            case 'Stock': return t('accounting.typeStock', {}, 'Anbar (Stock)');
            case 'GRNI': return 'GRNI';
            case 'COGS': return t('accounting.typeCogs', {}, 'Satışın Mayası (COGS)');
            case 'Tax': return t('accounting.typeTax', {}, 'Vergi (Tax)');
            case 'RetainedEarnings': return t('accounting.typeRetainedEarnings', {}, 'Bölüşdürülməmiş Mənfəət');
            case 'FixedAsset': return t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)');
            case 'CurrentAsset': return t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)');
            case 'CurrentLiability': return t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik');
            case 'LongTermLiability': return t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik');
            case 'AccumulatedDepreciation': return 'Yığılmış Amortizasiya';
            case 'AccountablePersons': return 'Təhtəlhesab Məbləğlər';
            case 'AdvancesGiven': return 'Verilmiş Avanslar';
            case 'AdvancesReceived': return 'Alınmış Avanslar';
            case 'BankLoans': return 'Bank Kreditləri';
            default: return str;
        }
    };

    // Filters
    const [filterCode, setFilterCode] = useState('');
    const [filterName, setFilterName] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedCurrency, setSelectedCurrency] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    // Filter Dropdown Open States
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort & Accounts Selection (Pagination removed - Full CoA display)
    const [sortField, setSortField] = useState<'code' | 'name' | 'type' | 'balance'>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Column Visibility State
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        code: true,
        name: true,
        type: true,
        currency: true,
        openingBalance: true,
        turnover: true,
        closingBalance: true,
        status: true,
    });

    const isColVisible = (key: string) => {
        return columnVisibility[key] ?? true;
    };

    const toggleColumnVisibility = (key: string) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [key]: prev[key] === undefined ? false : !prev[key],
        }));
    };

    const columns = useMemo(() => [
        { key: 'code', label: t('accounting.accountCode', {}, 'Kod'), visible: columnVisibility.code ?? true },
        { key: 'name', label: t('accounting.accountName', {}, 'Hesabın Adı'), visible: columnVisibility.name ?? true },
        { key: 'type', label: t('accounting.accountType', {}, 'Hesab Növü'), visible: columnVisibility.type ?? true },
        { key: 'currency', label: t('common.currency', {}, 'Valyuta'), visible: columnVisibility.currency ?? true },
        { key: 'openingBalance', label: t('accounting.openingBalance', {}, 'Başlanğıc Qalıq (DR/CR)'), visible: columnVisibility.openingBalance ?? true },
        { key: 'turnover', label: t('accounting.turnover', {}, 'Dövriyyə Hərəkəti (DR/CR)'), visible: columnVisibility.turnover ?? true },
        { key: 'closingBalance', label: t('accounting.closingBalance', {}, 'Son Qalıq (DR/CR)'), visible: columnVisibility.closingBalance ?? true },
        { key: 'status', label: t('common.status', {}, 'Status'), visible: columnVisibility.status ?? true },
    ], [t, columnVisibility]);

    const formatAmount = (val: number, highlightColor?: string) => {
        if (!val || Math.abs(val) < 0.005) {
            return <span className="text-[#52525B] font-normal">—</span>;
        }
        return (
            <span className={highlightColor || 'text-white'}>
                {val.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        );
    };

    // Create Modal State - strictly backend CreateAccountDto fields
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<{
        code: string;
        name: string;
        category: number;
        subcategory: number | null;
        type: number;
        currency: string;
        parentAccountId: string;
        isControlAccount: boolean;
    }>({
        code: '',
        name: '',
        category: 1,
        subcategory: 1,
        type: 0,
        currency: 'AZN',
        parentAccountId: '',
        isControlAccount: false,
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [seedLoading, setSeedLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Dropdown Refs
    const typeRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // View Mode & Tree State
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
    const [treeData, setTreeData] = useState<AccountTreeNodeDto[]>([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
    const [includeZeroBalance, setIncludeZeroBalance] = useState(true);

    const loadAccounts = async () => {
        setIsRefreshing(true);
        try {
            const data = await accountsService.getAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load accounts:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const loadTree = async () => {
        setTreeLoading(true);
        try {
            const data = await accountsService.getAccountTree();
            setTreeData(data || []);
            // Auto expand level 0/1 nodes
            const initialExpanded = new Set<string>();
            const addExpanded = (nodes: AccountTreeNodeDto[]) => {
                for (const n of nodes) {
                    if (n.level <= 1 || (n.children && n.children.length > 0)) {
                        initialExpanded.add(n.id);
                    }
                    if (n.children) addExpanded(n.children);
                }
            };
            addExpanded(data || []);
            setExpandedNodeIds(initialExpanded);
        } catch (err) {
            console.error('Failed to load account tree:', err);
        } finally {
            setTreeLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    useEffect(() => {
        if (viewMode === 'tree' && treeData.length === 0) {
            loadTree();
        }
    }, [viewMode]);

    const toggleNode = (nodeId: string) => {
        setExpandedNodeIds((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    };

    const expandAllNodes = () => {
        const allIds = new Set<string>();
        const traverse = (nodes: AccountTreeNodeDto[]) => {
            for (const n of nodes) {
                allIds.add(n.id);
                if (n.children && n.children.length > 0) traverse(n.children);
            }
        };
        traverse(treeData);
        setExpandedNodeIds(allIds);
    };

    const collapseAllNodes = () => {
        setExpandedNodeIds(new Set());
    };

    const renderTreeNodes = (nodes: AccountTreeNodeDto[], depth = 0): React.ReactNode => {
        return nodes
            .filter((n) => {
                if (!includeZeroBalance) {
                    const totalAct =
                        Math.abs(n.openingDebit) +
                        Math.abs(n.openingCredit) +
                        Math.abs(n.turnoverDebit) +
                        Math.abs(n.turnoverCredit) +
                        Math.abs(n.closingDebit) +
                        Math.abs(n.closingCredit) +
                        Math.abs(n.currentBalance);
                    if (totalAct < 0.001 && (!n.children || n.children.length === 0)) {
                        return false;
                    }
                }
                if (filterCode && !n.code.toLowerCase().includes(filterCode.toLowerCase())) return false;
                if (filterName && !n.name.toLowerCase().includes(filterName.toLowerCase())) return false;
                return true;
            })
            .map((node) => {
                const hasKids = Boolean(node.children && node.children.length > 0);
                const isExpanded = expandedNodeIds.has(node.id);

                return (
                    <React.Fragment key={node.id}>
                        <tr
                            className={`hover:bg-white/[0.03] transition-colors border-b border-[#27272A]/40 ${
                                hasKids ? 'font-semibold bg-[#18181B]/40' : ''
                            }`}
                        >
                            <td className="py-2.5 px-3">
                                <div
                                    className="flex items-center gap-1.5"
                                    style={{ paddingLeft: `${depth * 20}px` }}
                                >
                                    {hasKids ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleNode(node.id)}
                                            className="p-1 rounded-md hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                        >
                                            {isExpanded ? (
                                                <ChevronDownIcon className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronRightIcon className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    ) : (
                                        <div className="w-5.5" />
                                    )}

                                    {hasKids ? (
                                        <FolderOpenIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <DocumentTextIcon className="w-4 h-4 text-[#71717A] shrink-0" />
                                    )}

                                    <span className="font-mono text-white text-xs font-bold tracking-tight">
                                        {node.code}
                                    </span>
                                </div>
                            </td>

                            <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-xs">{node.name}</span>
                                    {node.subcategoryName && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium border border-zinc-700/50">
                                            {node.subcategoryName}
                                        </span>
                                    )}
                                </div>
                            </td>

                            <td className="py-2.5 px-3">
                                <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/5 text-[#A1A1AA] border border-white/10">
                                    {getAccountTypeLabel(node.type, node.typeName) || node.categoryName}
                                </span>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#A1A1AA]">
                                {node.openingDebit > 0
                                    ? node.openingDebit.toLocaleString('az-AZ', { minimumFractionDigits: 2 })
                                    : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[#A1A1AA]">
                                {node.openingCredit > 0
                                    ? node.openingCredit.toLocaleString('az-AZ', { minimumFractionDigits: 2 })
                                    : '—'}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-sky-400">
                                {node.turnoverDebit > 0
                                    ? node.turnoverDebit.toLocaleString('az-AZ', { minimumFractionDigits: 2 })
                                    : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-amber-400">
                                {node.turnoverCredit > 0
                                    ? node.turnoverCredit.toLocaleString('az-AZ', { minimumFractionDigits: 2 })
                                    : '—'}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-white">
                                {(node.closingDebit - node.closingCredit !== 0
                                    ? node.closingDebit - node.closingCredit
                                    : node.currentBalance
                                ).toLocaleString('az-AZ', { minimumFractionDigits: 2 })}{' '}
                                {node.currency || 'AZN'}
                            </td>
                        </tr>

                        {hasKids && isExpanded && renderTreeNodes(node.children, depth + 1)}
                    </React.Fragment>
                );
            });
    };

    // Outside click listener for filter popovers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typeRef.current && !typeRef.current.contains(e.target as Node)) setIsTypeDropdownOpen(false);
            if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setIsCurrencyDropdownOpen(false);
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusDropdownOpen(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterPopoverOpen(false);
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOptionsOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) setIsColumnsOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCode.trim()) count++;
        if (filterName.trim()) count++;
        if (selectedType !== 'ALL') count++;
        if (selectedCurrency !== 'ALL') count++;
        if (selectedStatus !== 'ALL') count++;
        return count;
    }, [filterCode, filterName, selectedType, selectedCurrency, selectedStatus]);

    // Filtered & Sorted accounts
    const filteredAccounts = useMemo(() => {
        return accounts.filter((acc) => {
            if (filterCode.trim()) {
                const codeStr = String(acc.code || '').toLowerCase();
                if (!codeStr.includes(filterCode.trim().toLowerCase())) return false;
            }
            if (filterName.trim()) {
                const nameStr = String(acc.name || '').toLowerCase();
                if (!nameStr.includes(filterName.trim().toLowerCase())) return false;
            }
            if (selectedType !== 'ALL') {
                const typeStr = String(acc.type || '').toLowerCase();
                const catStr = String(acc.category || '').toLowerCase();
                const sel = selectedType.toLowerCase();

                const matchesCat =
                    (sel === 'asset' && (acc.category === 1 || catStr.includes('asset') || typeStr.includes('asset'))) ||
                    (sel === 'liability' && (acc.category === 2 || catStr.includes('liability') || typeStr.includes('liability'))) ||
                    (sel === 'equity' && (acc.category === 3 || catStr.includes('equity') || typeStr.includes('equity'))) ||
                    (sel === 'revenue' && (acc.category === 4 || catStr.includes('revenue') || catStr.includes('income') || typeStr.includes('revenue') || typeStr.includes('income'))) ||
                    (sel === 'expense' && (acc.category === 5 || catStr.includes('expense') || typeStr.includes('expense')));

                const matchesType = typeStr.includes(sel);

                if (!matchesCat && !matchesType) return false;
            }
            if (selectedCurrency !== 'ALL') {
                const cur = String(acc.currency || 'AZN').toUpperCase();
                if (cur !== selectedCurrency.toUpperCase()) return false;
            }
            if (selectedStatus === 'ACTIVE' && !acc.isActive) return false;
            if (selectedStatus === 'INACTIVE' && acc.isActive) return false;
            return true;
        }).sort((a, b) => {
            let valA: any = a[sortField] || '';
            let valB: any = b[sortField] || '';
            if (sortField === 'balance') {
                valA = Number(a.closingDebit || a.balance || (a as any).currentBalance) || 0;
                valB = Number(b.closingDebit || b.balance || (b as any).currentBalance) || 0;
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [accounts, filterCode, filterName, selectedType, selectedCurrency, selectedStatus, sortField, sortDirection]);

    // Financial Totals for Footer (Trial Balance summary)
    const tableTotals = useMemo(() => {
        return filteredAccounts.reduce(
            (acc, item) => {
                const opD = Number(item.openingDebit) || 0;
                const opC = Number(item.openingCredit) || 0;
                const toD = Number(item.turnoverDebit) || 0;
                const toC = Number(item.turnoverCredit) || 0;
                let clD = Number(item.closingDebit) || 0;
                let clC = Number(item.closingCredit) || 0;
                if (clD === 0 && clC === 0) {
                    const net = (opD - opC) + (toD - toC);
                    if (net > 0) clD = net;
                    else if (net < 0) clC = Math.abs(net);
                    else if (item.balance) {
                        const b = Number(item.balance);
                        if (b > 0) clD = b;
                        else if (b < 0) clC = Math.abs(b);
                    }
                }
                return {
                    opDebit: acc.opDebit + opD,
                    opCredit: acc.opCredit + opC,
                    toDebit: acc.toDebit + toD,
                    toCredit: acc.toCredit + toC,
                    clDebit: acc.clDebit + clD,
                    clCredit: acc.clCredit + clC,
                };
            },
            { opDebit: 0, opCredit: 0, toDebit: 0, toCredit: 0, clDebit: 0, clCredit: 0 }
        );
    }, [filteredAccounts]);

    const totalVisibleColCount = useMemo(() => {
        let count = 1;
        if (isColVisible('code')) count += 1;
        if (isColVisible('name')) count += 1;
        if (isColVisible('type')) count += 1;
        if (isColVisible('currency')) count += 1;
        if (isColVisible('openingBalance')) count += 2;
        if (isColVisible('turnover')) count += 2;
        if (isColVisible('closingBalance')) count += 2;
        if (isColVisible('status')) count += 1;
        return count;
    }, [columnVisibility]);

    // Hierarchical structuring for CoA Table View (Full list without pagination)
    interface HierarchicalAccountItem {
        account: AccountDto;
        depth: number;
        hasChildren: boolean;
        parentCode?: string;
    }

    const hierarchicalAccounts = useMemo<HierarchicalAccountItem[]>(() => {
        if (sortField !== 'code') {
            const sorted = [...filteredAccounts].sort((a, b) => {
                let valA: any = a[sortField] || '';
                let valB: any = b[sortField] || '';
                if (sortField === 'balance') {
                    valA = Number(a.closingDebit || a.balance || (a as any).currentBalance) || 0;
                    valB = Number(b.closingDebit || b.balance || (b as any).currentBalance) || 0;
                }
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });

            const accountIdMap = new Map<string, AccountDto>();
            filteredAccounts.forEach((a) => accountIdMap.set(a.id, a));

            return sorted.map((acc) => {
                let depth = 0;
                let cur = acc;
                while (cur?.parentAccountId && accountIdMap.has(cur.parentAccountId) && depth < 5) {
                    depth++;
                    cur = accountIdMap.get(cur.parentAccountId)!;
                }
                if (depth === 0 && acc.code) {
                    const c = acc.code.trim();
                    if (c.length === 2) depth = 1;
                    else if (c.length >= 3) depth = Math.min(c.length - 1, 3);
                }
                const hasChildren = filteredAccounts.some(
                    (other) => other.parentAccountId === acc.id || (other.code !== acc.code && other.code.startsWith(acc.code))
                );
                return {
                    account: acc,
                    depth,
                    hasChildren,
                };
            });
        }

        // True hierarchy sort for 'code'
        const accountIdMap = new Map<string, AccountDto>();
        filteredAccounts.forEach((a) => accountIdMap.set(a.id, a));

        const codeSorted = [...filteredAccounts].sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
        );

        const codeToAccount = new Map<string, AccountDto>();
        codeSorted.forEach((a) => codeToAccount.set(a.code.trim(), a));

        const parentMap = new Map<string, string | null>();
        const childrenMap = new Map<string, AccountDto[]>();
        filteredAccounts.forEach((a) => childrenMap.set(a.id, []));

        codeSorted.forEach((acc) => {
            let parentId: string | null = null;
            if (acc.parentAccountId && accountIdMap.has(acc.parentAccountId)) {
                parentId = acc.parentAccountId;
            } else {
                const code = acc.code.trim();
                for (let len = code.length - 1; len >= 1; len--) {
                    const prefix = code.substring(0, len);
                    if (codeToAccount.has(prefix)) {
                        parentId = codeToAccount.get(prefix)!.id;
                        break;
                    }
                }
            }
            parentMap.set(acc.id, parentId);
            if (parentId && childrenMap.has(parentId)) {
                childrenMap.get(parentId)!.push(acc);
            }
        });

        const roots = codeSorted.filter((a) => !parentMap.get(a.id));
        const result: HierarchicalAccountItem[] = [];

        const traverse = (node: AccountDto, depth: number) => {
            const children = childrenMap.get(node.id) || [];
            const parent = node.parentAccountId ? accountIdMap.get(node.parentAccountId) : undefined;
            result.push({
                account: node,
                depth,
                hasChildren: children.length > 0,
                parentCode: parent?.code,
            });

            const sortedChildren = [...children].sort((a, b) => {
                const cmp = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
                return sortDirection === 'asc' ? cmp : -cmp;
            });
            sortedChildren.forEach((child) => traverse(child, depth + 1));
        };

        const sortedRoots = [...roots].sort((a, b) => {
            const cmp = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        sortedRoots.forEach((root) => traverse(root, 0));

        // Add any orphans
        const visitedIds = new Set(result.map((r) => r.account.id));
        codeSorted.forEach((item) => {
            if (!visitedIds.has(item.id)) {
                result.push({ account: item, depth: 0, hasChildren: false });
            }
        });

        return result;
    }, [filteredAccounts, sortField, sortDirection]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(filteredAccounts.map((a) => a.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };



    // Handle Create Submit
    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await accountsService.createAccount({
                code: createForm.code.trim(),
                name: createForm.name.trim(),
                category: Number(createForm.category),
                subcategory: createForm.subcategory !== null ? Number(createForm.subcategory) : null,
                type: Number(createForm.type),
                parentAccountId: createForm.parentAccountId || null,
                isControlAccount: Boolean(createForm.isControlAccount),
                currency: createForm.currency || 'AZN',
            });

            setShowCreateModal(false);
            setCreateForm({
                code: '',
                name: '',
                category: 1,
                subcategory: 1,
                type: 0,
                currency: 'AZN',
                parentAccountId: '',
                isControlAccount: false,
            });
            showToast(t('common.success', {}, 'Hesab uğurla yaradıldı!'));
            loadAccounts();
        } catch (err: any) {
            setCreateError(err.response?.data?.message || t('common.error', {}, 'Hesab yaradılarkən xəta baş verdi.'));
        } finally {
            setCreateLoading(false);
        }
    };



    const handleSeedTemplate = async () => {
        setSeedLoading(true);
        try {
            await accountsService.seedTemplate();
            showToast(t('settings.seedSuccess', {}, 'Standart hesablar planı şablonu uğurla tətbiq edildi!'));
            loadAccounts();
        } catch (err: any) {
            showToast(err.response?.data?.message || t('common.error', {}, 'Şablon yüklənərkən xəta baş verdi.'));
        } finally {
            setSeedLoading(false);
        }
    };

    const getTypeColor = (type: any) => {
        const num = Number(type);
        if (!isNaN(num) && type !== null && type !== undefined && type !== '') {
            if ([1, 3, 4, 5, 12, 13, 16, 17, 18].includes(num)) return '#38BDF8';
            if ([2, 14, 15, 19, 20].includes(num)) return '#F59E0B';
            if ([9].includes(num)) return '#A855F7';
            if ([10].includes(num)) return '#22C55E';
            if ([7, 8, 11].includes(num)) return '#EF4444';
            return '#38BDF8';
        }

        const typeStr = String(type ?? '').toLowerCase();
        if (typeStr.includes('asset') || typeStr.includes('receivable') || typeStr.includes('bank') || typeStr.includes('cash') || typeStr.includes('stock')) return '#38BDF8';
        if (typeStr.includes('liability') || typeStr.includes('payable') || typeStr.includes('loan')) return '#F59E0B';
        if (typeStr.includes('equity')) return '#A855F7';
        if (typeStr.includes('revenue') || typeStr.includes('income')) return '#22C55E';
        if (typeStr.includes('expense') || typeStr.includes('cogs') || typeStr.includes('tax')) return '#EF4444';
        return '#71717A';
    };

    return (
        <div className="space-y-3.5 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('accounting.accountsTitle', {}, 'Hesablar Planı (CoA)')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <Bars3Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{t('common.list', {}, 'Siyahı')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="p-0.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center gap-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                viewMode === 'table' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <TableCellsIcon className="w-3.5 h-3.5" />
                            <span>Cədvəl</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('tree')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                viewMode === 'tree' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                            }`}
                        >
                            <FolderOpenIcon className="w-3.5 h-3.5" />
                            <span>Ağac Strukturu</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('accounting.newAccount', {}, 'Yarat')}</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── Filter Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Kod Input */}
                    <input
                        type="text"
                        placeholder={t('accounting.accountCode', {}, 'Kod')}
                        value={filterCode}
                        onChange={(e) => setFilterCode(e.target.value)}
                        className="w-28 sm:w-32 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Ad Input */}
                    <input
                        type="text"
                        placeholder={t('accounting.accountName', {}, 'Hesabın adı')}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-36 sm:w-44 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                    />

                    {/* Status Dropdown */}
                    <div className="relative" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedStatus === 'ALL'
                                    ? t('common.status', {}, 'Status')
                                    : selectedStatus === 'ACTIVE'
                                    ? t('common.active', {}, 'Aktiv')
                                    : t('common.inactive', {}, 'Deaktiv')}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                {[
                                    { key: 'ALL' as const, label: t('common.allStatuses', {}, 'Bütün Statuslar') },
                                    { key: 'ACTIVE' as const, label: t('common.active', {}, 'Aktiv') },
                                    { key: 'INACTIVE' as const, label: t('common.inactive', {}, 'Deaktiv') },
                                ].map((st) => (
                                    <button
                                        key={st.key}
                                        type="button"
                                        onClick={() => {
                                            setSelectedStatus(st.key);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedStatus === st.key ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tip Dropdown */}
                    <div className="relative" ref={typeRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedType === 'ALL' ? t('accounting.accountType', {}, 'Tip') : getAccountTypeLabel(selectedType)}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute top-9 left-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedType('ALL');
                                        setIsTypeDropdownOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-left cursor-pointer text-[#A1A1AA] hover:bg-[#2C2C2E]/60"
                                >
                                    {t('common.allTypes', {}, 'Bütün Tiplər')}
                                </button>
                                <div className="h-px bg-[#2C2C2E] my-1" />
                                {ACCOUNT_TYPES.map((tItem) => (
                                    <button
                                        key={tItem}
                                        type="button"
                                        onClick={() => {
                                            setSelectedType(tItem);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                                            selectedType === tItem ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getTypeColor(tItem) }} />
                                        <span>{getAccountTypeLabel(tItem)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Valyuta Dropdown */}
                    <div className="relative" ref={currencyRef}>
                        <button
                            type="button"
                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                            className="flex items-center justify-between w-28 bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedCurrency === 'ALL' ? t('common.currency', {}, 'Valyuta') : selectedCurrency}
                            </span>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </button>

                        {isCurrencyDropdownOpen && (
                            <div className="absolute top-9 left-0 w-36 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCurrency('ALL');
                                        setIsCurrencyDropdownOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-left cursor-pointer text-[#A1A1AA] hover:bg-[#2C2C2E]/60"
                                >
                                    {t('common.allCurrencies', {}, 'Bütün Valyutalar')}
                                </button>
                                <div className="h-px bg-[#2C2C2E] my-1" />
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCurrency(c);
                                            setIsCurrencyDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-left cursor-pointer font-mono ${
                                            selectedCurrency === c ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={loadAccounts}
                        title={t('common.refresh', {}, 'Yenilə')}
                        className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                    </button>

                    {/* Filter Button */}
                    <div className="relative" ref={filterRef}>
                        <button
                            type="button"
                            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                                activeFilterCount > 0
                                    ? 'bg-white text-black border-white font-semibold'
                                    : 'border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-white'
                            }`}
                        >
                            <FunnelIcon className="w-3.5 h-3.5" />
                            <span>{t('common.filter', {}, 'Filtr')}</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {isFilterPopoverOpen && (
                            <div className="absolute top-9 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-3.5 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-[#2C2C2E]">
                                    <div className="flex items-center gap-1.5 font-bold text-white">
                                        <FunnelIcon className="w-4 h-4 text-[#A1A1AA]" />
                                        <span>{t('common.filters', {}, 'Filtrlər')}</span>
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterCode('');
                                                setFilterName('');
                                                setSelectedType('ALL');
                                                setSelectedCurrency('ALL');
                                                setSelectedStatus('ALL');
                                            }}
                                            className="text-[11px] text-rose-400 hover:underline cursor-pointer font-medium"
                                        >
                                            {t('common.clear', {}, 'Təmizlə')} ({activeFilterCount})
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountCode', {}, 'Hesab Kodu')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('common.searchPlaceholder', {}, 'Kod üzrə axtar...')}
                                            value={filterCode}
                                            onChange={(e) => setFilterCode(e.target.value)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountName', {}, 'Hesabın Adı')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('common.searchPlaceholder', {}, 'Ad üzrə axtar...')}
                                            value={filterName}
                                            onChange={(e) => setFilterName(e.target.value)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-[#A1A1AA]">{t('accounting.accountType', {}, 'Kateqoriya / Tip')}</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                            >
                                                <option value="ALL">{t('common.allTypes', {}, 'Bütün Tiplər')}</option>
                                                {ACCOUNT_TYPES.map((tItem) => (
                                                    <option key={tItem} value={tItem} className="bg-[#1C1C1E]">
                                                        {getAccountTypeLabel(tItem)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] text-[#A1A1AA]">{t('common.currency', {}, 'Valyuta')}</label>
                                            <select
                                                value={selectedCurrency}
                                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                                className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                                            >
                                                <option value="ALL" className="bg-[#1C1C1E]">{t('common.allCurrencies', {}, 'Hamısı')}</option>
                                                {CURRENCIES.map((c) => (
                                                    <option key={c} value={c} className="bg-[#1C1C1E]">
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-[#A1A1AA]">{t('common.status', {}, 'Status')}</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                                        >
                                            <option value="ALL" className="bg-[#1C1C1E]">{t('common.allStatuses', {}, 'Bütün Statuslar')}</option>
                                            <option value="ACTIVE" className="bg-[#1C1C1E]">● {t('common.active', {}, 'Aktiv')}</option>
                                            <option value="INACTIVE" className="bg-[#1C1C1E]">● {t('common.inactive', {}, 'Deaktiv')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2E]">
                                    <span className="text-[11px] text-[#71717A]">
                                        {filteredAccounts.length} {t('common.resultsFound', {}, 'nəticə tapıldı')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterPopoverOpen(false)}
                                        className="px-3.5 py-1.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
                                    >
                                        {t('common.apply', {}, 'Tətbiq et')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sort Button */}
                    <div className="relative" ref={sortRef}>
                        <button
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.sort', {}, 'Sırala')}
                        >
                            <ArrowsUpDownIcon className="w-4 h-4" />
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-9 right-0 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                                {[
                                    { key: 'code', label: t('accounting.byCode', {}, 'Kod üzrə') },
                                    { key: 'name', label: t('accounting.byName', {}, 'Ad üzrə') },
                                    { key: 'type', label: t('accounting.byType', {}, 'Tip üzrə') },
                                    { key: 'balance', label: t('accounting.byBalance', {}, 'Qalıq üzrə') },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => {
                                            if (sortField === item.key) {
                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortField(item.key as any);
                                                setSortDirection('asc');
                                            }
                                            setIsSortOpen(false);
                                        }}
                                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                                            sortField === item.key ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {sortField === item.key && (
                                            <span className="text-[10px] text-[#A1A1AA] font-mono">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Columns Button */}
                    <div className="relative" ref={columnsRef}>
                        <button
                            type="button"
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.columns', {}, 'Sütunlar')}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute top-9 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E4E4E7] space-y-1.5 animate-in fade-in duration-150">
                                <div className="space-y-1">
                                    {columns.map((col) => (
                                        <div
                                            key={col.key}
                                            onClick={() => toggleColumnVisibility(col.key)}
                                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141416]/50 border border-[#2C2C2E]/40 hover:bg-[#2C2C2E]/60 transition-colors cursor-pointer"
                                        >
                                            <span className={col.visible ? 'text-white' : 'text-[#71717A] line-through'}>
                                                {col.label}
                                            </span>
                                            {col.visible && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* More Options */}
                    <div className="relative" ref={moreRef}>
                        <button
                            type="button"
                            onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                            className="p-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title={t('common.more', {}, 'Digər')}
                        >
                            <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>

                        {isMoreOptionsOpen && (
                            <div className="absolute top-9 right-0 w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreOptionsOpen(false);
                                        navigate('/master-data');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium"
                                >
                                    <ScaleIcon className="w-4 h-4 text-emerald-400" />
                                    <span>İlkin Qalıqlar Aktı (Setup Hub)</span>
                                </button>
                                <div className="h-px bg-[#2C2C2E] my-1" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreOptionsOpen(false);
                                        handleSeedTemplate();
                                    }}
                                    disabled={seedLoading}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-left w-full transition-colors cursor-pointer font-medium"
                                >
                                    <SparklesIcon className="w-4 h-4 text-amber-400" />
                                    <span>{t('settings.seedDefaults', {}, 'Standart Şablonu Yüklə')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── TREE VIEW vs TABLE VIEW ─── */}
            {viewMode === 'tree' ? (
                <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
                    {/* Tree View Top Bar */}
                    <div className="p-3 bg-[#18181B] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={expandAllNodes}
                                className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-white/10 text-[#D4D4D8] hover:text-white transition-colors cursor-pointer font-medium flex items-center gap-1.5"
                            >
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                                <span>Hamısını Aç</span>
                            </button>
                            <button
                                type="button"
                                onClick={collapseAllNodes}
                                className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-white/10 text-[#D4D4D8] hover:text-white transition-colors cursor-pointer font-medium flex items-center gap-1.5"
                            >
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                                <span>Hamısını Bağla</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-[#A1A1AA] hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeZeroBalance}
                                    onChange={(e) => setIncludeZeroBalance(e.target.checked)}
                                    className="rounded border-[#3F3F46] bg-[#27272A] text-emerald-500 focus:ring-0 cursor-pointer"
                                />
                                <span>Qalıqsız hesabları göstər</span>
                            </label>

                            <button
                                type="button"
                                onClick={loadTree}
                                disabled={treeLoading}
                                className="p-1.5 rounded-lg bg-[#27272A] hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                title="Ağacı yenilə"
                            >
                                <ArrowPathIcon className={`w-3.5 h-3.5 ${treeLoading ? 'animate-spin text-emerald-400' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Tree Table */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#141416] border-b border-[#27272A] text-[#71717A] font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-3 w-80">Hesab Kodu</th>
                                    <th className="py-3 px-3">Hesabın Adı & Alt-kateqoriya</th>
                                    <th className="py-3 px-3">Tipi</th>
                                    <th className="py-3 px-3 text-right">İlkin Debet</th>
                                    <th className="py-3 px-3 text-right">İlkin Kredit</th>
                                    <th className="py-3 px-3 text-right">Dövriyyə Debet</th>
                                    <th className="py-3 px-3 text-right">Dövriyyə Kredit</th>
                                    <th className="py-3 px-3 text-right">Son Qalıq</th>
                                </tr>
                            </thead>
                            <tbody>
                                {treeLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArrowPathIcon className="w-5 h-5 animate-spin text-emerald-400" />
                                                <span>Hesablar planı iyerarxiyası yüklənir...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : treeData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-[#71717A]">
                                            Ağac strukturu üzrə heç bir hesab tapılmadı.
                                        </td>
                                    </tr>
                                ) : (
                                    renderTreeNodes(treeData, 0)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ─── Table View (Exact CRM Leads Style - Image 1) ─── */
                <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-200">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                {/* Top Header Level */}
                                <tr className="bg-[#18181B] border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                    <th rowSpan={2} className="py-3 px-4 w-10 text-center align-middle">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                selectedRows.length === filteredAccounts.length &&
                                                filteredAccounts.length > 0
                                            }
                                            className="rounded border-[#3F3F46] bg-[#27272A] text-white focus:ring-0 cursor-pointer"
                                        />
                                    </th>
                                    {isColVisible('code') && (
                                        <th rowSpan={2} className="py-3 px-4 text-[#A1A1AA] font-normal align-middle">
                                            {t('accounting.accountCode', {}, 'KOD')}
                                        </th>
                                    )}
                                    {isColVisible('name') && (
                                        <th rowSpan={2} className="py-3 px-4 text-[#A1A1AA] font-normal align-middle">
                                            {t('accounting.accountName', {}, 'HESABIN ADI')}
                                        </th>
                                    )}
                                    {isColVisible('type') && (
                                        <th rowSpan={2} className="py-3 px-4 text-[#A1A1AA] font-normal align-middle">
                                            {t('accounting.accountType', {}, 'HESAB NÖVÜ')}
                                        </th>
                                    )}
                                    {isColVisible('currency') && (
                                        <th rowSpan={2} className="py-3 px-4 text-[#A1A1AA] font-normal text-center align-middle">
                                            {t('common.currency', {}, 'VALYUTA')}
                                        </th>
                                    )}

                                    {/* 1. Başlanğıc Qalıq (Opening Balance) */}
                                    {isColVisible('openingBalance') && (
                                        <th colSpan={2} className="py-2.5 px-3 text-center border-l border-[#27272A] bg-[#141416]/50 text-sky-400 font-semibold text-[10.5px] tracking-wider">
                                            {t('accounting.openingBalance', {}, 'BAŞLANĞIC QALIQ')}
                                        </th>
                                    )}

                                    {/* 2. Dövriyyə Hərəkəti (Turn Over) */}
                                    {isColVisible('turnover') && (
                                        <th colSpan={2} className="py-2.5 px-3 text-center border-l border-[#27272A] bg-[#141416]/50 text-emerald-400 font-semibold text-[10.5px] tracking-wider">
                                            {t('accounting.turnover', {}, 'DÖVRİYYƏ HƏRƏKƏTİ')}
                                        </th>
                                    )}

                                    {/* 3. Son Qalıq (Closing Balance) */}
                                    {isColVisible('closingBalance') && (
                                        <th colSpan={2} className="py-2.5 px-3 text-center border-l border-[#27272A] bg-[#141416]/50 text-white font-semibold text-[10.5px] tracking-wider">
                                            {t('accounting.closingBalance', {}, 'SON QALIQ')}
                                        </th>
                                    )}

                                    {isColVisible('status') && (
                                        <th rowSpan={2} className="py-3 px-4 text-[#A1A1AA] font-normal text-center align-middle border-l border-[#27272A]">
                                            {t('common.status', {}, 'STATUS')}
                                        </th>
                                    )}
                                </tr>

                                {/* Sub-level Header for DR / CR */}
                                <tr className="bg-[#141416] border-b border-[#27272A] text-[10px] uppercase font-bold tracking-wider">
                                    {isColVisible('openingBalance') && (
                                        <>
                                            <th className="py-1.5 px-3 text-right font-mono border-l border-[#27272A] text-sky-400/80">DEBET (DR)</th>
                                            <th className="py-1.5 px-3 text-right font-mono text-sky-400/80">KREDİT (CR)</th>
                                        </>
                                    )}
                                    {isColVisible('turnover') && (
                                        <>
                                            <th className="py-1.5 px-3 text-right font-mono border-l border-[#27272A] text-emerald-400/80">DEBET (DR)</th>
                                            <th className="py-1.5 px-3 text-right font-mono text-emerald-400/80">KREDİT (CR)</th>
                                        </>
                                    )}
                                    {isColVisible('closingBalance') && (
                                        <>
                                            <th className="py-1.5 px-3 text-right font-mono border-l border-[#27272A] text-white/90">DEBET (DR)</th>
                                            <th className="py-1.5 px-3 text-right font-mono text-white/90">KREDİT (CR)</th>
                                        </>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#27272A]/60 text-[#D4D4D8]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={totalVisibleColCount} className="py-12 text-center text-[#71717A]">
                                            <div className="flex flex-col items-center gap-2">
                                                <ArrowPathIcon className="w-5 h-5 animate-spin text-white" />
                                                <span>{t('common.loading', {}, 'Yüklənir...')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : hierarchicalAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={totalVisibleColCount} className="py-12 text-center text-[#71717A]">
                                            {t('accounting.noAccountsFound', {}, 'Heç bir hesab tapılmadı. "Yarat" düyməsi ilə yeni hesab əlavə edə bilərsiniz.')}
                                        </td>
                                    </tr>
                                ) : (
                                    hierarchicalAccounts.map(({ account: acc, depth, hasChildren }) => {
                                        const isSelected = selectedRows.includes(acc.id);
                                        const isRoot = depth === 0;
                                        const isGroup = depth === 1;
                                        const isDetail = depth >= 2;

                                        const opDebit = Number(acc.openingDebit) || 0;
                                        const opCredit = Number(acc.openingCredit) || 0;
                                        const toDebit = Number(acc.turnoverDebit) || 0;
                                        const toCredit = Number(acc.turnoverCredit) || 0;
                                        let clDebit = Number(acc.closingDebit) || 0;
                                        let clCredit = Number(acc.closingCredit) || 0;

                                        if (clDebit === 0 && clCredit === 0) {
                                            const net = (opDebit - opCredit) + (toDebit - toCredit);
                                            if (net > 0) clDebit = net;
                                            else if (net < 0) clCredit = Math.abs(net);
                                            else if (acc.balance) {
                                                const b = Number(acc.balance);
                                                if (b > 0) clDebit = b;
                                                else if (b < 0) clCredit = Math.abs(b);
                                            }
                                        }

                                        return (
                                            <tr
                                                key={acc.id}
                                                onClick={() => navigate(`/accounts/${acc.id}`)}
                                                className={`transition-colors cursor-pointer group ${
                                                    isSelected
                                                        ? 'bg-[#18181B]'
                                                        : isRoot
                                                        ? hasChildren
                                                            ? 'bg-[#151518] hover:bg-[#1C1C20] border-t-2 border-[#27272A]'
                                                            : 'bg-[#141416]/60 hover:bg-[#18181B] border-t border-[#27272A]/50'
                                                        : isGroup
                                                        ? 'bg-[#18181B]/30 hover:bg-[#1E1E22] border-t border-[#27272A]/40'
                                                        : 'hover:bg-[#18181B]/60 border-t border-[#27272A]/30 text-zinc-300'
                                                }`}
                                            >
                                                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(acc.id)}
                                                        className="rounded border-[#3F3F46] bg-[#27272A] text-white focus:ring-0 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Code with Hierarchical Tree Indentation & Guide Lines */}
                                                {isColVisible('code') && (
                                                    <td className="py-2.5 px-4">
                                                        {isRoot ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                                                    {acc.code}
                                                                </span>
                                                                <span className="font-mono font-bold text-white text-sm group-hover:text-sky-400 transition-colors">
                                                                    {acc.code}
                                                                </span>
                                                                {hasChildren && (
                                                                    <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0">
                                                                        Əsas Sinif
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : isGroup ? (
                                                            <div className="flex items-center gap-1.5" style={{ paddingLeft: '20px' }}>
                                                                <span className="text-[#52525B] font-mono select-none text-xs">├──</span>
                                                                <span className="font-mono font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors">
                                                                    {acc.code}
                                                                </span>
                                                                {hasChildren && (
                                                                    <span className="text-[9px] uppercase font-semibold tracking-wider px-1 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40 shrink-0">
                                                                        Alt Qrup
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${20 + (depth - 1) * 18}px` }}>
                                                                <span className="text-[#52525B] font-mono select-none text-xs">
                                                                    {depth === 2 ? '│   └──' : '│   │   └──'}
                                                                </span>
                                                                <span className="font-mono text-zinc-300 group-hover:text-sky-300 transition-colors">
                                                                    {acc.code}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}

                                                {/* Name with Hierarchy Icon & Indentation */}
                                                {isColVisible('name') && (
                                                    <td className="py-2.5 px-4">
                                                        {isRoot ? (
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                                                                    <FolderIcon className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="truncate max-w-[200px] lg:max-w-[260px] font-bold text-white text-[13px] group-hover:underline transition-colors" title={acc.name}>
                                                                    {acc.name}
                                                                </span>
                                                            </div>
                                                        ) : isGroup ? (
                                                            <div className="flex items-center gap-2" style={{ paddingLeft: '12px' }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80 shrink-0" />
                                                                <span className="truncate max-w-[200px] lg:max-w-[240px] font-semibold text-zinc-200 text-xs group-hover:underline transition-colors" title={acc.name}>
                                                                    {acc.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2" style={{ paddingLeft: `${12 + (depth - 1) * 14}px` }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                                                                <span className="truncate max-w-[180px] lg:max-w-[220px] text-zinc-300 text-xs group-hover:underline transition-colors" title={acc.name}>
                                                                    {acc.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}

                                                {/* Type with Dot */}
                                                {isColVisible('type') && (
                                                    <td className="py-2.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                                                style={{ backgroundColor: getTypeColor(acc.type) }}
                                                            />
                                                            <span className="text-white font-medium whitespace-nowrap">
                                                                {getAccountTypeLabel(acc.type, (acc as any).typeName)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {/* Currency */}
                                                {isColVisible('currency') && (
                                                    <td className="py-2.5 px-4 font-mono text-center text-[#A1A1AA]">
                                                        {acc.currency || 'AZN'}
                                                    </td>
                                                )}

                                                {/* 1. Başlanğıc Qalıq (Opening DR/CR) */}
                                                {isColVisible('openingBalance') && (
                                                    <>
                                                        <td className="py-2.5 px-3 text-right font-mono border-l border-[#27272A]/40 text-sky-400/90 font-medium">
                                                            {formatAmount(opDebit, 'text-sky-300')}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-mono text-sky-400/90 font-medium">
                                                            {formatAmount(opCredit, 'text-sky-300')}
                                                        </td>
                                                    </>
                                                )}

                                                {/* 2. Dövriyyə Hərəkəti (Turnover DR/CR) */}
                                                {isColVisible('turnover') && (
                                                    <>
                                                        <td className="py-2.5 px-3 text-right font-mono border-l border-[#27272A]/40 text-emerald-400/90 font-medium">
                                                            {formatAmount(toDebit, 'text-emerald-400')}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400/90 font-medium">
                                                            {formatAmount(toCredit, 'text-emerald-400')}
                                                        </td>
                                                    </>
                                                )}

                                                {/* 3. Son Qalıq (Closing DR/CR) */}
                                                {isColVisible('closingBalance') && (
                                                    <>
                                                        <td className="py-2.5 px-3 text-right font-mono font-bold border-l border-[#27272A]/40 text-white">
                                                            {formatAmount(clDebit, 'text-white font-bold')}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                                            {formatAmount(clCredit, 'text-white font-bold')}
                                                        </td>
                                                    </>
                                                )}

                                                {/* Status with Dot */}
                                                {isColVisible('status') && (
                                                    <td className="py-2.5 px-4 text-center border-l border-[#27272A]/40">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <span
                                                                className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                                                                    acc.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                                                                }`}
                                                            />
                                                            <span className="text-white text-xs">
                                                                {acc.isActive ? t('common.active', {}, 'Aktiv') : t('common.inactive', {}, 'Deaktiv')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Table Footer with Summary Totals */}
                            {!loading && filteredAccounts.length > 0 && (
                                <tfoot className="bg-[#141416] border-t-2 border-[#27272A] font-mono text-xs font-bold text-white">
                                    <tr>
                                        <td
                                            colSpan={
                                                1 +
                                                (isColVisible('code') ? 1 : 0) +
                                                (isColVisible('name') ? 1 : 0) +
                                                (isColVisible('type') ? 1 : 0) +
                                                (isColVisible('currency') ? 1 : 0)
                                            }
                                            className="py-3 px-4 text-right text-[#A1A1AA] uppercase tracking-wider text-[11px]"
                                        >
                                            {t('common.total', {}, 'CƏM')}:
                                        </td>
                                        {isColVisible('openingBalance') && (
                                            <>
                                                <td className="py-3 px-3 text-right text-sky-400 border-l border-[#27272A]">
                                                    {formatAmount(tableTotals.opDebit, 'text-sky-400 font-bold')}
                                                </td>
                                                <td className="py-3 px-3 text-right text-sky-400">
                                                    {formatAmount(tableTotals.opCredit, 'text-sky-400 font-bold')}
                                                </td>
                                            </>
                                        )}
                                        {isColVisible('turnover') && (
                                            <>
                                                <td className="py-3 px-3 text-right text-emerald-400 border-l border-[#27272A]">
                                                    {formatAmount(tableTotals.toDebit, 'text-emerald-400 font-bold')}
                                                </td>
                                                <td className="py-3 px-3 text-right text-emerald-400">
                                                    {formatAmount(tableTotals.toCredit, 'text-emerald-400 font-bold')}
                                                </td>
                                            </>
                                        )}
                                        {isColVisible('closingBalance') && (
                                            <>
                                                <td className="py-3 px-3 text-right text-white font-extrabold border-l border-[#27272A]">
                                                    {formatAmount(tableTotals.clDebit, 'text-white font-extrabold')}
                                                </td>
                                                <td className="py-3 px-3 text-right text-white font-extrabold">
                                                    {formatAmount(tableTotals.clCredit, 'text-white font-extrabold')}
                                                </td>
                                            </>
                                        )}
                                        {isColVisible('status') && <td className="border-l border-[#27272A]" />}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                {/* Bottom Bar: Full CoA Siyahı Göstərişi (Pagination aradan qaldırıldı - Tam Siyahı) */}
                <div className="p-3 bg-[#141416] border-t border-[#27272A] flex items-center justify-between text-xs text-[#71717A]">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Tam Siyahı (Hissələrə bölünmədən)
                        </span>
                        <span>
                            Cəmi: <strong className="text-white font-mono">{filteredAccounts.length}</strong> hesab
                        </span>
                    </div>

                    {selectedRows.length > 0 && (
                        <span className="text-sky-400 font-medium text-xs">
                            {selectedRows.length} hesab seçildi
                        </span>
                    )}
                </div>
            </div>
            )}

            {/* ─── CREATE ACCOUNT MODAL ─── */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCreateModal(false);
                    }}
                >
                    <div
                        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl text-[#E4E4E7] flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden my-auto animate-in fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 p-4 sm:p-6 shrink-0 bg-[#1C1C1E]">
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t('accounting.newAccount', {}, 'Yeni Hesab')}</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label={t('common.close', {}, 'Bağla')}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                                {createError}
                            </div>
                        )}

                        {/* Modal Form Body */}
                        <form onSubmit={handleCreateAccount} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
                                {/* Row 1: Hesab Kodu * & Hesabın Adı * */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">
                                            {t('accounting.accountCode', {}, 'Hesab Kodu')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="məs. 101"
                                            value={createForm.code}
                                            onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">
                                            {t('accounting.accountName', {}, 'Hesabın Adı')} <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t('accounting.accountName', {}, 'Hesabın adı')}
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Kateqoriya & Subkateqoriya */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.accountCategory', {}, 'Kateqoriya')}</label>
                                        <select
                                            value={createForm.category}
                                            onChange={(e) => {
                                                const newCat = Number(e.target.value);
                                                const subList = ACCOUNT_SUBCATEGORIES_BY_CATEGORY[newCat] || [];
                                                setCreateForm({
                                                    ...createForm,
                                                    category: newCat,
                                                    subcategory: subList.length > 0 ? subList[0].id : null,
                                                });
                                            }}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            {ACCOUNT_CATEGORIES.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-[#1C1C1E]">
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[#A1A1AA] font-medium">Subkateqoriya</label>
                                            <span className="text-[10px] text-zinc-500 font-normal">IFRS təsnifatı</span>
                                        </div>
                                        <select
                                            value={createForm.subcategory ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value ? Number(e.target.value) : null;
                                                const mappedCat = val ? SUBCATEGORY_TO_CATEGORY_MAP[val] : createForm.category;
                                                setCreateForm({
                                                    ...createForm,
                                                    subcategory: val,
                                                    category: mappedCat || createForm.category,
                                                });
                                            }}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            <option value="" className="bg-[#1C1C1E]">
                                                Seçilməyib (Yoxdur)
                                            </option>
                                            {ALL_SUBCATEGORY_GROUPS.map((grp) => (
                                                <optgroup key={grp.categoryName} label={grp.categoryName} className="bg-[#18181B] text-zinc-400 font-semibold">
                                                    {grp.options.map((sub) => (
                                                        <option key={sub.id} value={sub.id} className="bg-[#1C1C1E] text-white font-normal">
                                                            {sub.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Hesab Növü (Type) & Valyuta */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.accountType', {}, 'Hesab Növü (Type)')}</label>
                                        <select
                                            value={createForm.type}
                                            onChange={(e) => setCreateForm({ ...createForm, type: Number(e.target.value) })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            {ACCOUNT_TYPE_OPTIONS.map((tItem) => (
                                                <option key={tItem.id} value={tItem.id} className="bg-[#1C1C1E]">
                                                    {tItem.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('common.currency', {}, 'Valyuta')}</label>
                                        <select
                                            value={createForm.currency}
                                            onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c} value={c} className="bg-[#1C1C1E]">
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Əsas Hesab (Parent) & Nəzarət Hesabı (Control) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.parentAccount', {}, 'Əsas Hesab (Parent)')}</label>
                                        <select
                                            value={createForm.parentAccountId}
                                            onChange={(e) => setCreateForm({ ...createForm, parentAccountId: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            <option value="" className="bg-[#1C1C1E]">{t('accounting.noneParent', {}, 'Yoxdur (Baş Hesab)')}</option>
                                            {accounts.map((a) => (
                                                <option key={a.id} value={a.id} className="bg-[#1C1C1E]">
                                                    {a.code} - {a.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[#A1A1AA] font-medium">{t('accounting.controlAccount', {}, 'Nəzarət Hesabı')}</label>
                                        <select
                                            value={createForm.isControlAccount ? 'true' : 'false'}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    isControlAccount: e.target.value === 'true',
                                                })
                                            }
                                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                        >
                                            <option value="false" className="bg-[#1C1C1E]">{t('common.no', {}, 'Xeyr')}</option>
                                            <option value="true" className="bg-[#1C1C1E]">{t('common.yes', {}, 'Bəli')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-[#2C2C2E]/60 p-4 sm:p-6 shrink-0 bg-[#1C1C1E]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-[#2C2C2E] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {createLoading ? t('common.saving', {}, 'Yaradılır...') : t('common.create', {}, 'Yarat')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customersService } from '../../api';
import type { CustomerDto, CustomerInvoiceDto } from '../../dto';
import { formatDate } from '../../utils';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BanknotesIcon,
    CreditCardIcon,
    DocumentTextIcon,
    CheckIcon,
    PlusIcon,
    ClockIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerDto | null>(null);
    const [invoices, setInvoices] = useState<CustomerInvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'details'>('invoices');
    const [toastMessage, setToastMessage] = useState('');

    const fetchCustomerData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [custData, invsData] = await Promise.allSettled([
                customersService.getCustomer(id),
                customersService.getInvoices({ customerId: id }),
            ]);

            if (custData.status === 'fulfilled') {
                setCustomer(custData.value);
            }

            if (invsData.status === 'fulfilled' && Array.isArray(invsData.value)) {
                // Filter invoices for this customer
                const targetId = custData.status === 'fulfilled' ? String(custData.value.id).toLowerCase() : String(id).toLowerCase();
                const relevant = invsData.value.filter((inv) => String(inv.customerId).toLowerCase() === targetId);
                setInvoices(relevant);
            }
        } catch (err) {
            console.error('Error fetching customer details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const formatCurrency = (val: number, curr = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: curr || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.grandTotal || 0), 0);
    const totalOutstanding = customer?.outstandingBalance || customer?.balance || invoices.reduce((sum, inv) => sum + (inv.remainingAmount || inv.outstandingAmount || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-white text-sm">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Müştəri məlumatları yüklənir...</span>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-white text-base font-semibold">Müştəri tapılmadı.</p>
                <Link
                    to="/customers"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Müştəri Siyahısına Qayıt</span>
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
                        onClick={() => navigate('/customers')}
                        className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Geri"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Link to="/customers" className="hover:text-zinc-300 transition-colors">Müştərilər</Link>
                        <span className="text-[#52525B]">/</span>
                        <span className="font-mono text-white">{customer.code}</span>
                        <span className="text-[#71717A] text-sm font-normal">({customer.name})</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {customer.isActive !== false ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#14291F] text-[#4ADE80] border border-[#22C55E]/30">
                            Aktiv
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#2C2C2E] text-[#A1A1AA] border border-[#3F3F46]">
                            Deaktiv
                        </span>
                    )}

                    <Link
                        to="/customer-invoices"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Yeni Faktura</span>
                    </Link>
                </div>
            </div>

            {/* Toast */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Cari Borc / Qalıq</span>
                    <span className={`text-base font-mono font-bold mt-1 block ${totalOutstanding > 0 ? 'text-amber-400' : 'text-white'}`}>
                        {formatCurrency(totalOutstanding, customer.currency)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Kredit Limiti</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {formatCurrency(customer.creditLimit || 0, customer.currency)}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Ödəniş Müddəti</span>
                    <span className="text-base font-bold text-white mt-1 block">
                        {customer.paymentTermsDays ? `${customer.paymentTermsDays} gün` : '30 gün'}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
                    <span className="text-xs text-[#A1A1AA] font-semibold block">Fakturaların Sayı</span>
                    <span className="text-base font-mono font-bold text-white mt-1 block">
                        {invoices.length}
                    </span>
                </div>
            </div>

            {/* Customer Details Info Card */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Müştəri Məlumatları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-[#71717A] block">VÖEN</span>
                        <span className="text-white font-mono font-bold mt-0.5 block">{customer.taxNumber || '—'}</span>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Telefon</span>
                        <span className="text-white font-medium mt-0.5 block">{customer.phone || '—'}</span>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Email</span>
                        <span className="text-white font-medium mt-0.5 block truncate">{customer.email || '—'}</span>
                    </div>

                    <div>
                        <span className="text-[#71717A] block">Ünvan</span>
                        <span className="text-white font-medium mt-0.5 block truncate">{customer.address || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Invoices List / Tabs */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                activeTab === 'invoices' ? 'text-white border-b-2 border-white pb-1' : 'text-[#71717A] hover:text-white'
                            }`}
                        >
                            Fakturalar ({invoices.length})
                        </button>
                    </div>

                    <Link
                        to="/customer-invoices"
                        className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
                    >
                        Bütün Fakturalar →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E4E4E7]">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] text-[11px] font-bold">
                                <th className="py-3 px-4">Faktura №</th>
                                <th className="py-3 px-4">Tarix</th>
                                <th className="py-3 px-4">Son Tarix</th>
                                <th className="py-3 px-4 text-right">Məbləğ</th>
                                <th className="py-3 px-4 text-right">Ödənilən</th>
                                <th className="py-3 px-4 text-right">Qalıq</th>
                                <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]/60">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-[#71717A]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DocumentTextIcon className="w-6 h-6 text-[#52525B]" />
                                            <span>Bu müştəri üzrə heç bir faktura tapılmadı</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-white">
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="py-3 px-4 text-[#A1A1AA]">
                                            {formatDate(inv.issueDate || inv.invoiceDate)}
                                        </td>
                                        <td className="py-3 px-4 text-[#A1A1AA]">
                                            {formatDate(inv.dueDate)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                            {formatCurrency(inv.totalAmount || inv.grandTotal || 0, inv.currency)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-emerald-400">
                                            {formatCurrency(inv.paidAmount || 0, inv.currency)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                                            {formatCurrency(inv.remainingAmount || inv.outstandingAmount || 0, inv.currency)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#18181B] border border-[#27272A] text-white">
                                                {inv.status}
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

export default CustomerDetailPage;

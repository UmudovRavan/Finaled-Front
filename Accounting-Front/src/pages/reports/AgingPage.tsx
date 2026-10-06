import React, { useState, useEffect, useMemo } from 'react';
import { reportsService } from '../../api';
import type { AgingReportResponse, AgingBucketDto } from '../../dto';
import {
    ClockIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export const AgingPage: React.FC = () => {
    const [reportType, setReportType] = useState<'AR' | 'AP'>('AR');
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState<AgingReportResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data =
                reportType === 'AR'
                    ? await reportsService.getArAging(asOfDate)
                    : await reportsService.getApAging(asOfDate);
            setReport(data);
        } catch (err: any) {
            console.error('Failed to load aging report:', err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Yaşlanma hesabatını yükləyərkən xəta baş verdi.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [reportType, asOfDate]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const partiesList: AgingBucketDto[] = useMemo(() => {
        if (!report) return [];
        return Array.isArray(report.parties)
            ? report.parties
            : Array.isArray(report.entries)
            ? report.entries
            : [];
    }, [report]);

    const filteredParties = useMemo(() => {
        if (!searchQuery.trim()) return partiesList;
        const q = searchQuery.toLowerCase().trim();
        return partiesList.filter((p) =>
            (p.partyName || '').toLowerCase().includes(q) ||
            (p.partyCode || '').toLowerCase().includes(q)
        );
    }, [partiesList, searchQuery]);

    // Summary totals with safe fallbacks
    const summaryTotals = useMemo(() => {
        const cur = Number(report?.currentNotDue ?? report?.totalCurrent ?? partiesList.reduce((s, p) => s + (p.currentNotDue ?? p.current ?? 0), 0));
        const d1 = Number(report?.days1To30 ?? report?.total1To30 ?? partiesList.reduce((s, p) => s + (p.days1To30 ?? 0), 0));
        const d31 = Number(report?.days31To60 ?? report?.total31To60 ?? partiesList.reduce((s, p) => s + (p.days31To60 ?? 0), 0));
        const d61 = Number(report?.days61To90 ?? report?.total61To90 ?? partiesList.reduce((s, p) => s + (p.days61To90 ?? 0), 0));
        const d90 = Number(report?.days90Plus ?? report?.totalOver90 ?? partiesList.reduce((s, p) => s + (p.days90Plus ?? p.daysOver90 ?? 0), 0));
        const grand = Number(report?.totalOutstanding ?? report?.grandTotal ?? (cur + d1 + d31 + d61 + d90));

        return { cur, d1, d31, d61, d90, grand };
    }, [report, partiesList]);

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <ClockIcon className="w-7 h-7 text-emerald-400" />
                        <span>Yaşlanma Hesabatı (Aging Report)</span>
                    </h1>
                    <p className="text-xs text-[#94A3B8]">Borcların və öhdəliklərin gecikmə müddətinə görə təhlili</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] hover:border-zinc-700 rounded-xl px-3 py-1.5 transition-colors">
                        <span className="text-[11px] text-[#A1A1AA] font-semibold select-none">Tarix:</span>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="bg-transparent text-xs text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 p-0 cursor-pointer [color-scheme:dark] shadow-none"
                        />
                    </div>
                    <button
                        onClick={loadData}

                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-semibold text-rose-300 cursor-pointer"
                    >
                        Yenidən yoxla
                    </button>
                </div>
            )}

            {/* Type Tabs and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#12141A] border border-[#27272A] w-fit">
                    <button
                        onClick={() => setReportType('AR')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            reportType === 'AR'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                        Debitor Borclar (Müştərilər - AR)
                    </button>
                    <button
                        onClick={() => setReportType('AP')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            reportType === 'AP'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                        Kreditor Borclar (Təchizatçılar - AP)
                    </button>
                </div>

                <div className="relative min-w-[240px]">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={reportType === 'AR' ? 'Müştəri axtar...' : 'Təchizatçı axtar...'}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:border-emerald-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Buckets KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#27272A]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Cari (0 gün)</span>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                        {formatCurrency(summaryTotals.cur)}
                    </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#27272A]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">1 - 30 Gün</span>
                    <p className="text-base font-bold font-mono text-blue-400 mt-1">
                        {formatCurrency(summaryTotals.d1)}
                    </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#27272A]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">31 - 60 Gün</span>
                    <p className="text-base font-bold font-mono text-amber-400 mt-1">
                        {formatCurrency(summaryTotals.d31)}
                    </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#27272A]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">61 - 90 Gün</span>
                    <p className="text-base font-bold font-mono text-orange-400 mt-1">
                        {formatCurrency(summaryTotals.d61)}
                    </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#27272A]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">90+ Gün</span>
                    <p className="text-base font-bold font-mono text-rose-400 mt-1">
                        {formatCurrency(summaryTotals.d90)}
                    </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#12141A] border border-emerald-500/30 bg-emerald-950/20">
                    <span className="text-[10px] text-white uppercase font-bold">Yekun Cəm</span>
                    <p className="text-base font-bold font-mono text-white mt-1">
                        {formatCurrency(summaryTotals.grand)}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#12141A] border border-[#27272A] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                                <th className="py-3 px-4">{reportType === 'AR' ? 'Müştəri' : 'Təchizatçı'}</th>
                                <th className="py-3 px-4 text-right">Cari (Vaxtı Çatmamış)</th>
                                <th className="py-3 px-4 text-right">1-30 Gün</th>
                                <th className="py-3 px-4 text-right">31-60 Gün</th>
                                <th className="py-3 px-4 text-right">61-90 Gün</th>
                                <th className="py-3 px-4 text-right">90+ Gün</th>
                                <th className="py-3 px-4 text-right">Toplam Borc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-[#71717A]">
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-emerald-400" />
                                            <span>Məlumatlar yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredParties.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-[#71717A]">
                                        {searchQuery.trim()
                                            ? 'Axtarış üzrə heç bir nəticə tapılmadı.'
                                            : 'Bu tarix üzrə heç bir gecikmiş borc qeydi tapılmadı.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredParties.map((e) => {
                                    const cur = e.currentNotDue ?? e.current ?? 0;
                                    const d1 = e.days1To30 ?? 0;
                                    const d31 = e.days31To60 ?? 0;
                                    const d61 = e.days61To90 ?? 0;
                                    const d90 = e.days90Plus ?? e.daysOver90 ?? 0;
                                    const tot = e.totalOutstanding ?? e.total ?? (cur + d1 + d31 + d61 + d90);

                                    return (
                                        <tr key={e.partyId} className="hover:bg-white/[0.03] transition-colors font-mono">
                                            <td className="py-3.5 px-4 font-sans font-semibold text-white">
                                                <div>{e.partyName}</div>
                                                {e.partyCode && (
                                                    <span className="text-[10px] text-[#71717A] font-mono">{e.partyCode}</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-emerald-400">{formatCurrency(cur)}</td>
                                            <td className="py-3.5 px-4 text-right text-blue-400">{formatCurrency(d1)}</td>
                                            <td className="py-3.5 px-4 text-right text-amber-400">{formatCurrency(d31)}</td>
                                            <td className="py-3.5 px-4 text-right text-orange-400">{formatCurrency(d61)}</td>
                                            <td className="py-3.5 px-4 text-right text-rose-400">{formatCurrency(d90)}</td>
                                            <td className="py-3.5 px-4 text-right font-bold text-white">{formatCurrency(tot)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {filteredParties.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-[#27272A] bg-[#18181B] font-mono text-xs font-bold">
                                    <td className="py-3.5 px-4 font-sans text-white">Cəmi:</td>
                                    <td className="py-3.5 px-4 text-right text-emerald-400">{formatCurrency(summaryTotals.cur)}</td>
                                    <td className="py-3.5 px-4 text-right text-blue-400">{formatCurrency(summaryTotals.d1)}</td>
                                    <td className="py-3.5 px-4 text-right text-amber-400">{formatCurrency(summaryTotals.d31)}</td>
                                    <td className="py-3.5 px-4 text-right text-orange-400">{formatCurrency(summaryTotals.d61)}</td>
                                    <td className="py-3.5 px-4 text-right text-rose-400">{formatCurrency(summaryTotals.d90)}</td>
                                    <td className="py-3.5 px-4 text-right text-white">{formatCurrency(summaryTotals.grand)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgingPage;

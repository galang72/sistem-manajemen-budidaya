'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Wallet,
  Fish,
  Anchor,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { formatRupiah, formatNumber, formatKg, formatDate, formatDateInput } from '@/lib/formatters';
import { exportToExcel } from '@/lib/exportExcel';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'keuangan' | 'budidaya' | 'panen'>('keuangan');
  const [data, setData] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cycleFilter, setCycleFilter] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        cycleId: cycleFilter,
      });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const [resReport, resCycles] = await Promise.all([
        fetch(`/api/reports?${params.toString()}`),
        fetch('/api/cycles'),
      ]);

      const jsonReport = await resReport.json();
      const jsonCycles = await resCycles.json();
      setData(jsonReport);
      setCycles(jsonCycles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, cycleFilter, startDate, endDate]);

  const handleExportExcel = () => {
    if (!data || !data.data) return;

    if (reportType === 'keuangan') {
      const rows = data.data.map((tx: any) => ({
        Tanggal: formatDate(tx.date),
        Tipe: tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
        Kategori: tx.category,
        Nominal: tx.amount,
        'Sumber / Kas': tx.source,
        'Siklus Terkait': tx.cycle?.code || '-',
        Catatan: tx.notes || '-',
      }));
      exportToExcel(rows, `Laporan_Keuangan_Papap Fish Farm_${formatDateInput(new Date())}`);
    } else if (reportType === 'budidaya') {
      const rows = data.data.map((c: any) => ({
        'Kode Siklus': c.code,
        Kolam: c.pondName,
        'Tanggal Mulai': formatDate(c.startDate),
        Status: c.status,
        'Ikan Awal': c.initialFishCount,
        'Ikan Mati': c.deadCount,
        'Mortalitas (%)': `${c.mortalityRate.toFixed(1)}%`,
        'Ikan Dipanen': c.harvestedCount,
        'Survival Rate (%)': `${c.survivalRate.toFixed(1)}%`,
        'Sisa Hidup': c.remainingFish,
      }));
      exportToExcel(rows, `Laporan_Budidaya_Papap Fish Farm_${formatDateInput(new Date())}`);
    } else if (reportType === 'panen') {
      const rows = data.data.map((h: any) => ({
        'Tanggal Panen': formatDate(h.date),
        Siklus: h.cycle?.code || '-',
        Kolam: h.pond?.name || '-',
        'Jumlah Ekor': h.fishCount,
        'Berat Total (kg)': h.totalWeightKg,
        'Harga / kg': h.pricePerKg,
        'Total Pendapatan': h.totalRevenue,
        Pembeli: h.buyerName,
        Catatan: h.notes || '-',
      }));
      exportToExcel(rows, `Laporan_Panen_Papap Fish Farm_${formatDateInput(new Date())}`);
    }
  };

  const handlePrintOrPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pusat Laporan Farm</h1>
          <p className="text-slate-500 text-sm mt-1">
            Unduh rekapitulasi data keuangan, siklus budidaya, dan panen dalam format Excel atau cetak resmi PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrintOrPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak / Export PDF</span>
          </button>
        </div>
      </div>

      {/* 3 Tab Jenis Laporan */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setReportType('keuangan')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            reportType === 'keuangan'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Laporan Keuangan</span>
        </button>

        <button
          onClick={() => setReportType('budidaya')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            reportType === 'budidaya'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Fish className="w-4 h-4" />
          <span>Laporan Budidaya</span>
        </button>

        <button
          onClick={() => setReportType('panen')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            reportType === 'panen'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Laporan Panen</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Siklus:</span>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Siklus</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <span>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {(startDate || endDate || cycleFilter !== 'Semua') && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setCycleFilter('Semua');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline self-end md:self-auto"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* KOP SURAT KHUSUS CETAK & PDF */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              Papap Fish Farm
            </h1>
            <p className="text-xs text-slate-600">
              Sistem Manajemen Usaha Budidaya Ikan Modern &bull; Telepon: +62 822-1945-6643
            </p>
            <p className="text-xs text-slate-600">
              Dokumen: {reportType === 'keuangan' ? 'Laporan Keuangan & Kas' : reportType === 'budidaya' ? 'Laporan Populasi Budidaya' : 'Laporan Hasil Panen Raya'}
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Tanggal Cetak: {formatDate(new Date())}</p>
            <p>Pengelola: Haji Anung Suryanto</p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Memuat data laporan...</div>
      ) : !data ? (
        <div className="py-20 text-center text-slate-400">Data laporan tidak ditemukan.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === 'keuangan' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Total Pemasukan</p>
                <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
                  {formatRupiah(data.summary?.totalIncome)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Total Pengeluaran</p>
                <h3 className="text-xl font-extrabold text-rose-600 mt-1">
                  {formatRupiah(data.summary?.totalExpense)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Saldo Kas</p>
                <h3
                  className={`text-xl font-extrabold mt-1 ${
                    data.summary?.cashBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(data.summary?.cashBalance)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Keuntungan / Kerugian</p>
                <h3
                  className={`text-xl font-extrabold mt-1 ${
                    data.summary?.netProfitOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {data.summary?.netProfitOrLoss >= 0 ? '+' : '-'} {formatRupiah(Math.abs(data.summary?.netProfitOrLoss))}
                </h3>
              </div>
            </div>
          )}

          {reportType === 'budidaya' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-400">Jumlah Ikan Awal</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {formatNumber(data.summary?.totalInitialFish)} ekor
                </h3>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-400">Jumlah Ikan Mati</p>
                <h3 className="text-lg font-extrabold text-rose-600 mt-1">
                  {formatNumber(data.summary?.totalDeadFish)} ekor
                </h3>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-400">Persentase Kematian</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {data.summary?.overallMortalityRate?.toFixed(1)}%
                </h3>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-400">Ikan Dipanen</p>
                <h3 className="text-lg font-extrabold text-amber-600 mt-1">
                  {formatNumber(data.summary?.totalHarvestedFish)} ekor
                </h3>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-400">Ikan Tersisa</p>
                <h3 className="text-lg font-extrabold text-emerald-600 mt-1">
                  {formatNumber(data.summary?.totalRemainingFish)} ekor
                </h3>
              </div>
            </div>
          )}

          {reportType === 'panen' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Total Berat Panen</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatNumber(data.summary?.totalWeightKg)} kg
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Total Ekor Panen</p>
                <h3 className="text-xl font-extrabold text-amber-600 mt-1">
                  {formatNumber(data.summary?.totalFishCount)} ekor
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Rata-rata Harga Jual</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatRupiah(data.summary?.avgPricePerKg)} / kg
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Total Pendapatan Panen</p>
                <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
                  {formatRupiah(data.summary?.totalRevenue)}
                </h3>
              </div>
            </div>
          )}

          {/* Detailed Tables */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {reportType === 'keuangan' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Sumber Kas</th>
                      <th className="py-3 px-4">Siklus</th>
                      <th className="py-3 px-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-800">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 font-semibold text-xs">
                          <span
                            className={tx.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}
                          >
                            {tx.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{tx.category}</td>
                        <td
                          className={`py-3 px-4 font-bold ${
                            tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{tx.source}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                          {tx.cycle?.code || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{tx.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === 'budidaya' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                      <th className="py-3 px-4">Kode Siklus</th>
                      <th className="py-3 px-4">Kolam</th>
                      <th className="py-3 px-4">Tgl Mulai</th>
                      <th className="py-3 px-4">Ikan Awal</th>
                      <th className="py-3 px-4">Ikan Mati</th>
                      <th className="py-3 px-4">% Kematian</th>
                      <th className="py-3 px-4">Ikan Dipanen</th>
                      <th className="py-3 px-4">Survival Rate</th>
                      <th className="py-3 px-4">Ikan Tersisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.code}</td>
                        <td className="py-3 px-4 text-slate-700">{c.pondName}</td>
                        <td className="py-3 px-4 text-slate-800">{formatDate(c.startDate)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {formatNumber(c.initialFishCount)}
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600">
                          {formatNumber(c.deadCount)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-rose-700">
                          {c.mortalityRate.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600">
                          {formatNumber(c.harvestedCount)}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          {c.survivalRate.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-700">
                          {formatNumber(c.remainingFish)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === 'panen' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                      <th className="py-3 px-4">Tanggal Panen</th>
                      <th className="py-3 px-4">Siklus</th>
                      <th className="py-3 px-4">Kolam</th>
                      <th className="py-3 px-4">Jumlah Ikan</th>
                      <th className="py-3 px-4">Berat Panen (kg)</th>
                      <th className="py-3 px-4">Harga Jual / kg</th>
                      <th className="py-3 px-4">Total Pendapatan</th>
                      <th className="py-3 px-4">Pembeli</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((h: any) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-800">{formatDate(h.date)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{h.cycle?.code}</td>
                        <td className="py-3 px-4 text-slate-700">{h.pond?.name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {formatNumber(h.fishCount)} ekor
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600">
                          {formatNumber(h.totalWeightKg)} kg
                        </td>
                        <td className="py-3 px-4 text-slate-700">{formatRupiah(h.pricePerKg)}</td>
                        <td className="py-3 px-4 font-extrabold text-emerald-600">
                          {formatRupiah(h.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{h.buyerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Tanda Tangan Cetak */}
          <div className="hidden print:flex justify-between pt-16 text-xs text-center">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold mt-16">Pengawas Kolam</p>
              <p className="text-slate-400">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
            </div>
            <div>
              <p>Dicetak pada: {formatDate(new Date())}</p>
              <p className="font-bold mt-16">Haji Anung Suryanto</p>
              <p className="text-slate-500">Pemilik Usaha Papap Fish Farm</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

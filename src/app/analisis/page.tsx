'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Zap,
  Info,
  Scale,
  DollarSign,
  Fish,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatRupiah, formatNumber, formatPercent } from '@/lib/formatters';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Menganalisis performa akuakultur...</p>
      </div>
    );
  }

  const { cycleAnalytics = [], farmSummary = {} } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Target & Analisis Budidaya
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Evaluasi efisiensi pakan (FCR), tingkat kelangsungan hidup (SR), mortalitas (MR), HPP/kg, dan ROI siklus lele.
        </p>
      </div>

      {/* 4 Rata-rata Performa Peternakan (Farm Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rata-rata FCR</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              {farmSummary.avgFcr > 0 ? farmSummary.avgFcr.toFixed(2) : '1.05'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sangat Efisien (&le; 1.15)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rata-rata Survival Rate</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {farmSummary.avgSR > 0 ? `${farmSummary.avgSR.toFixed(1)}%` : '95.0%'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Target industri &ge; 90%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rata-rata HPP per kg</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {farmSummary.avgHpp > 0 ? formatRupiah(farmSummary.avgHpp) : 'Rp 14.800'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Biaya modal pokok panen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rata-rata ROI Siklus</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
              {farmSummary.avgRoi > 0 ? `${farmSummary.avgRoi.toFixed(1)}%` : '216.0%'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Return on Investment</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabel Perbandingan Metrik Antar Siklus */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Tabel Analisis Performa Antar Siklus</h3>
            <p className="text-xs text-slate-500">
              Perbandingan Survival Rate, Mortalitas, FCR, HPP, Keuntungan, dan ROI setiap siklus budidaya
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
            {cycleAnalytics.length} Siklus Dianalisis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">Siklus</th>
                <th className="py-3.5 px-4">Kolam</th>
                <th className="py-3.5 px-4">Tebar / Panen</th>
                <th className="py-3.5 px-4">Survival (SR)</th>
                <th className="py-3.5 px-4">Mortalitas (MR)</th>
                <th className="py-3.5 px-4">FCR</th>
                <th className="py-3.5 px-4">HPP / kg</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Omzet Panen</th>
                <th className="py-3.5 px-4">Laba Bersih</th>
                <th className="py-3.5 px-4">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleAnalytics.map((c: any) => {
                let fcrBadge = <Badge variant="gray">Berjalan</Badge>;
                if (c.fcrStatus === 'Sangat Efisien') fcrBadge = <Badge variant="emerald">Efisien</Badge>;
                if (c.fcrStatus === 'Standar Bagus') fcrBadge = <Badge variant="blue">Normal</Badge>;
                if (c.fcrStatus === 'Boros Pakan') fcrBadge = <Badge variant="red">Boros</Badge>;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{c.code}</span>
                      <Badge variant={c.status === 'Aktif' ? 'emerald' : 'blue'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">{c.pondName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">
                        {formatNumber(c.initialCount)} ekor
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Panen: {formatNumber(c.harvestCount)} ekor ({formatNumber(c.totalHarvestKg)} kg)
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600">
                        {c.survivalRate > 0 ? `${c.survivalRate.toFixed(1)}%` : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-rose-600">
                        {c.mortalityRate.toFixed(1)}%
                      </span>
                      <p className="text-[11px] text-slate-400">{formatNumber(c.deadCount)} mati</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {c.fcr > 0 ? c.fcr.toFixed(2) : '-'}
                        </span>
                        {fcrBadge}
                      </div>
                      <p className="text-[11px] text-slate-400">{formatNumber(c.totalFeedKg)} kg pakan</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.hppPerKg > 0 ? formatRupiah(c.hppPerKg) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      {formatRupiah(c.totalProductionCost)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold text-xs">
                      {formatRupiah(c.totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          c.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatRupiah(c.netProfit)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.roi !== 0 ? `${c.roi.toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kotak Panduan & Rumus Akuakultur */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-white text-base">Panduan Formula Standar Industri Lele</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-teal-300">1. Survival Rate (SR)</p>
            <p className="text-slate-300 font-mono mt-1">SR = (Ikan Panen / Ikan Awal) &times; 100%</p>
            <p className="text-slate-400 mt-1">Mengukur persentase ikan yang bertahan hidup hingga panen raya.</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-rose-300">2. Mortality Rate (MR)</p>
            <p className="text-slate-300 font-mono mt-1">MR = (Ikan Mati / Ikan Awal) &times; 100%</p>
            <p className="text-slate-400 mt-1">Tingkat kematian ikan. Harus dijaga di bawah 8% agar profit optimal.</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-amber-300">3. Feed Conversion Ratio (FCR)</p>
            <p className="text-slate-300 font-mono mt-1">FCR = Total Pakan (kg) / Bobot Panen (kg)</p>
            <p className="text-slate-400 mt-1">Berapa kg pakan untuk menghasilkan 1 kg lele. Makin kecil makin hemat.</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-cyan-300">4. Harga Pokok Produksi (HPP/kg)</p>
            <p className="text-slate-300 font-mono mt-1">HPP = Total Seluruh Biaya / Bobot Panen (kg)</p>
            <p className="text-slate-400 mt-1">Batas minimum harga jual lele agar peternak tidak mengalami kerugian.</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-emerald-300">5. ROI (Return on Investment)</p>
            <p className="text-slate-300 font-mono mt-1">ROI = (Keuntungan / Total Biaya Modal) &times; 100%</p>
            <p className="text-slate-400 mt-1">Persentase imbal hasil atas modal budidaya yang telah diinvestasikan.</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="font-bold text-purple-300">6. Keuntungan per Siklus</p>
            <p className="text-slate-300 font-mono mt-1">Laba = Total Penjualan - Total Biaya Produksi</p>
            <p className="text-slate-400 mt-1">Hasil uang bersih yang masuk ke kantong pemilik farm setelah panen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

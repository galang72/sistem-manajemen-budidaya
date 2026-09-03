'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Filter,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import { formatRupiah, formatNumber, formatKg, formatPercent } from '@/lib/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<'Hari' | 'Minggu' | 'Bulan' | 'Tahun' | 'Semua'>('Bulan');
  const [cycleFilter, setCycleFilter] = useState('Semua');

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `/api/profit-loss?filter=${periodFilter}&cycleId=${cycleFilter}`;
      const [resPL, resC] = await Promise.all([fetch(url), fetch('/api/cycles')]);
      const dataPL = await resPL.json();
      const dataC = await resC.json();
      setData(dataPL);
      setCycles(dataC);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodFilter, cycleFilter]);

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Menghitung Laba & Rugi...</p>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalCost = 0,
    netAmount = 0,
    isProfit = true,
    profit = 0,
    loss = 0,
    profitMargin = 0,
    totalHarvestKg = 0,
    costPerKg = 0,
    revenuePerKg = 0,
    profitPerKg = 0,
    incomeCategories = [],
    expenseCategories = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Perhitungan Laba & Rugi</h1>
          <p className="text-slate-500 text-sm mt-1">
            Analisis profitabilitas otomatis, margin keuntungan, dan efisiensi biaya produksi per kg.
          </p>
        </div>

        {/* Filter Periode */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto flex-wrap">
          {(['Hari', 'Minggu', 'Bulan', 'Tahun', 'Semua'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                periodFilter === p
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p === 'Hari' ? 'Hari Ini' : p === 'Minggu' ? 'Minggu Ini' : p === 'Bulan' ? 'Bulan Ini' : p === 'Tahun' ? 'Tahun Ini' : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Siklus Budidaya */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Berdasarkan Siklus:</span>
        </div>
        <select
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="Semua">Semua Siklus Budidaya</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} ({c.pond?.name})
            </option>
          ))}
        </select>
      </div>

      {/* Hero Card Status Laba / Rugi */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
          isProfit
            ? 'bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-emerald-800'
            : 'bg-gradient-to-r from-rose-950 to-red-900 text-white border-rose-800'
        }`}
      >
        <div className="space-y-1 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md">
            {isProfit ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span>Kondisi Usaha: Menguntungkan (Profit)</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-rose-300" />
                <span>Kondisi Usaha: Defisit (Kerugian)</span>
              </>
            )}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight pt-2">
            {formatRupiah(Math.abs(netAmount))}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            {isProfit ? 'Total Keuntungan Bersih' : 'Total Defisit Kerugian'} pada periode yang dipilih
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-300">Margin Laba</p>
            <p className="text-xl font-extrabold mt-0.5">{profitMargin.toFixed(1)}%</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-300">Laba / kg</p>
            <p className="text-xl font-extrabold mt-0.5">{formatRupiah(profitPerKg)}</p>
          </div>
        </div>
      </div>

      {/* 8 Metrik Keuntungan & Kerugian (Sesuai Persyaratan Prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Pendapatan</p>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
            {formatRupiah(totalRevenue)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Penjualan ikan lele</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Biaya Produksi</p>
          <h3 className="text-xl font-extrabold text-rose-600 mt-1">{formatRupiah(totalCost)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Bibit, pakan & ops</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Keuntungan</p>
          <h3 className="text-xl font-extrabold text-emerald-700 mt-1">{formatRupiah(profit)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Jika hasil positif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Kerugian</p>
          <h3 className="text-xl font-extrabold text-rose-700 mt-1">{formatRupiah(loss)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Jika hasil negatif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Margin Keuntungan</p>
          <h3 className="text-xl font-extrabold text-teal-600 mt-1">{profitMargin.toFixed(1)}%</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">(Laba / Pendapatan) × 100%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Biaya Produksi / kg</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatRupiah(costPerKg)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">HPP per kg lele</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Pendapatan / kg</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {formatRupiah(revenuePerKg)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Harga jual efektif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Keuntungan / kg</p>
          <h3
            className={`text-xl font-extrabold mt-1 ${
              profitPerKg >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatRupiah(profitPerKg)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Margin bersih per kg</p>
        </div>
      </div>

      {/* Rincian Struktur Biaya & Pendapatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rincian Biaya Pengeluaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Komposisi Pengeluaran Biaya</h3>
              <p className="text-xs text-slate-500">Proporsi biaya bibit, pakan, obat & operasional</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700">
              Total: {formatRupiah(totalCost)}
            </span>
          </div>

          <div className="space-y-3">
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Belum ada data pengeluaran pada periode ini.
              </p>
            ) : (
              expenseCategories.map((item: any, idx: number) => {
                const percent = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">
                        {formatRupiah(item.value)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Laporan Laba Rugi Format Standar Akuntansi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Laporan Laba Rugi Operasional</h3>
              <span className="text-xs text-slate-500">Standar Pembukuan Lele</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Pendapatan */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  1. PENDAPATAN OPERASIONAL
                </p>
                {incomeCategories.map((inc: any) => (
                  <div key={inc.name} className="flex justify-between pl-3 text-slate-600">
                    <span>{inc.name}</span>
                    <span className="font-medium text-slate-800">{formatRupiah(inc.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-emerald-700">
                  <span>TOTAL PENDAPATAN (A)</span>
                  <span>{formatRupiah(totalRevenue)}</span>
                </div>
              </div>

              {/* Beban */}
              <div className="space-y-1.5 pt-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  2. BEBAN PRODUKSI & OPERASIONAL
                </p>
                {expenseCategories.map((exp: any) => (
                  <div key={exp.name} className="flex justify-between pl-3 text-slate-600">
                    <span>{exp.name}</span>
                    <span className="font-medium text-slate-800">{formatRupiah(exp.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-rose-700">
                  <span>TOTAL BEBAN PRODUKSI (B)</span>
                  <span>{formatRupiah(totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Laba Bersih Akhir */}
          <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-700">LABA / RUGI BERSIH (A - B)</p>
              <p className="text-[11px] text-slate-500">Margin: {profitMargin.toFixed(1)}%</p>
            </div>
            <p
              className={`text-xl font-extrabold ${
                isProfit ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isProfit ? '+' : '-'} {formatRupiah(Math.abs(netAmount))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

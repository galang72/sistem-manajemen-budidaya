'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Fish,
  Skull,
  Anchor,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import AlertBanner, { AlertItem } from '@/components/ui/AlertBanner';
import { formatRupiah, formatNumber, formatKg, formatDate } from '@/lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Gagal mengambil data dashboard');
      const json = await res.json();
      setData(json);
      setAlerts(json.alerts || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Memuat data Papap fish farm...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700">
        <p className="font-semibold">Error memuat data</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { stats, monthlyFinancials, mortalityTrend, harvestByCycle, recentActivities } = data;

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Budidaya & Keuangan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau performa kolam, pertumbuhan lele, kas usaha, dan margin keuntungan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/panen"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Anchor className="w-4 h-4 text-amber-500" />
            <span>Catat Panen</span>
          </Link>
          <Link
            href="/kematian"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Skull className="w-4 h-4 text-rose-500" />
            <span>Catat Kematian</span>
          </Link>
          <Link
            href="/keuangan?tab=expense"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </Link>
        </div>
      </div>

      {/* Smart Alerts */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* 10 Kartu Statistik Utama */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          1. Metrik Finansial & Kas Usaha
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Uang Masuk"
            value={formatRupiah(stats.totalIncome)}
            subtext="Akumulasi omzet & panen"
            icon={<ArrowDownLeft className="w-5 h-5" />}
            variant="emerald"
          />
          <StatCard
            title="Total Uang Keluar"
            value={formatRupiah(stats.totalExpense)}
            subtext="Bibit, pakan, operasional"
            icon={<ArrowUpRight className="w-5 h-5" />}
            variant="red"
          />
          <StatCard
            title="Total Keuntungan"
            value={formatRupiah(stats.totalProfit)}
            subtext="Hasil bersih positif"
            icon={<TrendingUp className="w-5 h-5" />}
            variant="teal"
          />
          <StatCard
            title="Total Kerugian"
            value={formatRupiah(stats.totalLoss)}
            subtext={stats.totalLoss > 0 ? 'Defisit periode berjalan' : 'Nol (Usaha Sehat)'}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="amber"
          />
          <StatCard
            title="Saldo Kas"
            value={formatRupiah(stats.cashBalance)}
            subtext="Pemasukan - Pengeluaran"
            icon={<Wallet className="w-5 h-5" />}
            variant={stats.cashBalance >= 0 ? 'emerald' : 'red'}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          2. Metrik Budidaya & Populasi Ikan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Ikan Dipelihara"
            value={`${formatNumber(stats.totalCultivatedFish)} ekor`}
            subtext="Total tebar seluruh siklus"
            icon={<Fish className="w-5 h-5" />}
            variant="indigo"
          />
          <StatCard
            title="Total Ikan Mati"
            value={`${formatNumber(stats.totalDeadFish)} ekor`}
            subtext={
              stats.totalCultivatedFish > 0
                ? `Mortalitas: ${((stats.totalDeadFish / stats.totalCultivatedFish) * 100).toFixed(1)}%`
                : '0%'
            }
            icon={<Skull className="w-5 h-5" />}
            variant="red"
          />
          <StatCard
            title="Ikan Berhasil Dipanen"
            value={`${formatNumber(stats.totalHarvestedFish)} ekor`}
            subtext={
              stats.totalCultivatedFish > 0
                ? `Survival: ${((stats.totalHarvestedFish / stats.totalCultivatedFish) * 100).toFixed(1)}%`
                : '0%'
            }
            icon={<Anchor className="w-5 h-5" />}
            variant="teal"
          />
          <StatCard
            title="Siklus Aktif"
            value={`${stats.activeCyclesCount} Siklus`}
            subtext="Sedang berjalan di kolam"
            icon={<Activity className="w-5 h-5" />}
            variant="amber"
          />
          <StatCard
            title="Siklus Selesai"
            value={`${stats.completedCyclesCount} Siklus`}
            subtext="Telah rampung dipanen"
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="blue"
          />
        </div>
      </div>

      {/* 4 Grafik Interaktif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Pemasukan & Pengeluaran Bulanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Pemasukan vs Pengeluaran Bulanan</h3>
              <p className="text-xs text-slate-500">Perbandingan arus kas 6 bulan terakhir</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
              IDR (Juta)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Keuntungan / Kerugian Bulanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Tren Laba / Rugi Bersih Bulanan</h3>
              <p className="text-xs text-slate-500">Net profit margin per bulan</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-medium">
              Net Kas
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Laba/Rugi Bersih']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Laba Bersih"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Kematian Ikan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Tren Kematian Ikan Harian</h3>
              <p className="text-xs text-slate-500">Jumlah kematian ikan yang dicatat petugas</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium">
              Mortalitas
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mortalityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} ekor`, 'Ikan Mati']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Jumlah Ikan Mati"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#e11d48' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Hasil Panen per Siklus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Hasil Panen per Siklus (kg)</h3>
              <p className="text-xs text-slate-500">Total tonase bobot lele yang berhasil dipanen</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium">
              Panen (kg)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestByCycle} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(Number(val))} kg`, 'Total Berat Panen']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="weightKg" name="Berat Panen (kg)" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bagian Aktivitas Terbaru */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Aktivitas Terbaru</h3>
            <p className="text-xs text-slate-500">
              Transaksi keuangan, pencatatan kematian, dan panen yang baru saja berlangsung
            </p>
          </div>
          <Link
            href="/keuangan"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map((act: any) => {
            let icon = <Wallet className="w-4 h-4 text-slate-600" />;
            let bgClass = 'bg-slate-50';

            if (act.type === 'income') {
              icon = <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
              bgClass = 'bg-emerald-50';
            } else if (act.type === 'expense') {
              icon = <ArrowUpRight className="w-4 h-4 text-red-600" />;
              bgClass = 'bg-red-50';
            } else if (act.type === 'mortality') {
              icon = <Skull className="w-4 h-4 text-rose-600" />;
              bgClass = 'bg-rose-50';
            } else if (act.type === 'harvest') {
              icon = <Anchor className="w-4 h-4 text-amber-600" />;
              bgClass = 'bg-amber-50';
            }

            return (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{act.title}</p>
                    <p className="text-xs text-slate-500 truncate">{act.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {act.amount !== null && (
                    <p
                      className={`text-sm font-bold ${
                        act.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {act.type === 'income' ? '+' : '-'} {formatRupiah(act.amount)}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(act.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

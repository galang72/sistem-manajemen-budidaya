'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Fish,
  Skull,
  Anchor,
  Wheat,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Printer,
  TrendingUp,
  Activity,
  Waves,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatRupiah, formatNumber, formatKg, formatDate, formatDateInput } from '@/lib/formatters';

export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;

  const [cycle, setCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mortality' | 'harvest' | 'feed' | 'finance'>('mortality');

  // Quick modals for this cycle
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [mortalityForm, setMortalityForm] = useState({
    date: formatDateInput(new Date()),
    count: 50,
    cause: 'Kualitas Air',
    notes: '',
  });

  const [harvestForm, setHarvestForm] = useState({
    date: formatDateInput(new Date()),
    fishCount: 1000,
    totalWeightKg: 100,
    pricePerKg: 25000,
    buyerName: 'Pengepul',
    notes: '',
  });

  const [feedForm, setFeedForm] = useState({
    date: formatDateInput(new Date()),
    feedType: '781-1',
    weightKg: 50,
    pricePerKg: 11500,
    notes: '',
  });

  const fetchCycle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cycles/${cycleId}`);
      if (!res.ok) throw new Error('Siklus tidak ditemukan');
      const data = await res.json();
      setCycle(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cycleId) fetchCycle();
  }, [cycleId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Ubah status siklus ini menjadi "${newStatus}"?`)) return;
    try {
      const res = await fetch(`/api/cycles/${cycleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          endDate: newStatus === 'Selesai' ? new Date() : undefined,
        }),
      });
      if (res.ok) fetchCycle();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  const handleAddMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch('/api/mortality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId,
          pondId: cycle.pondId,
          ...mortalityForm,
        }),
      });
      if (res.ok) {
        setIsMortalityModalOpen(false);
        fetchCycle();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId,
          pondId: cycle.pondId,
          ...harvestForm,
        }),
      });
      if (res.ok) {
        setIsHarvestModalOpen(false);
        fetchCycle();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId,
          ...feedForm,
        }),
      });
      if (res.ok) {
        setIsFeedModalOpen(false);
        fetchCycle();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Memuat detail siklus...</p>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
        <p className="text-slate-600">Siklus tidak ditemukan.</p>
        <Link href="/siklus" className="text-emerald-600 font-semibold mt-2 inline-block">
          &larr; Kembali ke daftar siklus
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/siklus"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {cycle.code}
              </h1>
              <Badge
                variant={
                  cycle.status === 'Aktif'
                    ? 'emerald'
                    : cycle.status === 'Selesai'
                    ? 'blue'
                    : 'red'
                }
              >
                {cycle.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {cycle.pond?.name} &bull; Mulai: {formatDate(cycle.startDate)} &bull; Estimasi Panen:{' '}
              {formatDate(cycle.harvestEstimateDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {cycle.status === 'Aktif' && (
            <button
              onClick={() => handleStatusChange('Selesai')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesaikan Siklus</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Ringkasan KPI Siklus */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tebar Awal</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatNumber(cycle.initialFishCount)}
          </p>
          <p className="text-[11px] text-slate-500">{cycle.seedSize}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sisa Hidup</p>
          <p className="text-lg font-bold text-emerald-700 mt-1">
            {formatNumber(cycle.remainingFish)}
          </p>
          <p className="text-[11px] text-slate-500">Estimasi kolam</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mortalitas</p>
          <p className="text-lg font-bold text-rose-600 mt-1">
            {cycle.mortalityRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-rose-600/80">{formatNumber(cycle.totalDead)} mati</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hasil Panen</p>
          <p className="text-lg font-bold text-amber-600 mt-1">
            {formatNumber(cycle.totalHarvestWeightKg)} kg
          </p>
          <p className="text-[11px] text-slate-500">{formatNumber(cycle.totalHarvested)} ekor</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Biaya</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatRupiah(cycle.totalExpense)}
          </p>
          <p className="text-[11px] text-slate-500">Bibit + Pakan + Ops</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Laba Bersih</p>
          <p
            className={`text-lg font-bold mt-1 ${
              cycle.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatRupiah(cycle.netProfit)}
          </p>
          <p className="text-[11px] text-slate-500">
            ROI: {cycle.roi !== undefined ? `${cycle.roi.toFixed(1)}%` : '-'}
          </p>
        </div>
      </div>

      {/* Technical Indicators: FCR, Survival Rate, HPP/kg */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-950 text-white p-5 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs text-emerald-300 font-medium">Feed Conversion Ratio (FCR)</span>
          <h3 className="text-2xl font-extrabold mt-0.5">
            {cycle.fcr > 0 ? cycle.fcr.toFixed(2) : '-'}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1">
            {cycle.totalFeedKg} kg pakan / {cycle.totalHarvestWeightKg} kg bobot panen
          </p>
        </div>

        <div>
          <span className="text-xs text-teal-300 font-medium">Survival Rate (SR)</span>
          <h3 className="text-2xl font-extrabold mt-0.5">
            {cycle.survivalRate > 0 ? `${cycle.survivalRate.toFixed(1)}%` : '-'}
          </h3>
          <p className="text-[11px] text-teal-400 mt-1">
            Ikan panen: {formatNumber(cycle.totalHarvested)} dari {formatNumber(cycle.initialFishCount)}
          </p>
        </div>

        <div>
          <span className="text-xs text-cyan-300 font-medium">HPP per Kg Lele</span>
          <h3 className="text-2xl font-extrabold mt-0.5">
            {cycle.hppPerKg > 0 ? formatRupiah(cycle.hppPerKg) : '-'}
          </h3>
          <p className="text-[11px] text-cyan-400 mt-1">
            Total biaya siklus dibagi bobot panen
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('mortality')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'mortality'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Skull className="w-4 h-4" />
          <span>Kematian Ikan ({cycle.mortalities?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('harvest')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'harvest'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Panen ({cycle.harvests?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'feed'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Pakan ({cycle.feedRecords?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'finance'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Keuangan / Kas ({cycle.transactions?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Kematian Ikan */}
      {activeTab === 'mortality' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Catatan Kematian Ikan</h3>
              <p className="text-xs text-slate-500">
                Log harian kematian lele pada siklus {cycle.code}
              </p>
            </div>
            <button
              onClick={() => setIsMortalityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kematian</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Jumlah Mati</th>
                  <th className="py-2.5 px-4">Penyebab Kematian</th>
                  <th className="py-2.5 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycle.mortalities?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Belum ada catatan kematian ikan untuk siklus ini.
                    </td>
                  </tr>
                ) : (
                  cycle.mortalities.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-800">{formatDate(m.date)}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">
                        {formatNumber(m.count)} ekor
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{m.cause}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{m.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Panen */}
      {activeTab === 'harvest' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Catatan Panen Ikan</h3>
              <p className="text-xs text-slate-500">
                Hasil tonase dan omzet penjualan panen lele siklus {cycle.code}
              </p>
            </div>
            <button
              onClick={() => setIsHarvestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Panen Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Jumlah Ekor</th>
                  <th className="py-2.5 px-4">Berat Total (kg)</th>
                  <th className="py-2.5 px-4">Harga / kg</th>
                  <th className="py-2.5 px-4">Total Pendapatan</th>
                  <th className="py-2.5 px-4">Pembeli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycle.harvests?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada panen yang tercatat untuk siklus ini.
                    </td>
                  </tr>
                ) : (
                  cycle.harvests.map((h: any) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-800">{formatDate(h.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatNumber(h.fishCount)} ekor
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600">
                        {formatNumber(h.totalWeightKg)} kg
                      </td>
                      <td className="py-3 px-4 text-slate-700">{formatRupiah(h.pricePerKg)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {formatRupiah(h.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{h.buyerName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pakan */}
      {activeTab === 'feed' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Catatan Pemberian Pakan</h3>
              <p className="text-xs text-slate-500">
                Log konsumsi pelet dan pakan alternatif siklus {cycle.code}
              </p>
            </div>
            <button
              onClick={() => setIsFeedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pakan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Jenis Pakan</th>
                  <th className="py-2.5 px-4">Berat (kg)</th>
                  <th className="py-2.5 px-4">Harga / kg</th>
                  <th className="py-2.5 px-4">Total Biaya</th>
                  <th className="py-2.5 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycle.feedRecords?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada catatan pakan untuk siklus ini.
                    </td>
                  </tr>
                ) : (
                  cycle.feedRecords.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-800">{formatDate(f.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{f.feedType}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{f.weightKg} kg</td>
                      <td className="py-3 px-4 text-slate-600">{formatRupiah(f.pricePerKg)}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">{formatRupiah(f.totalCost)}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{f.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Keuangan */}
      {activeTab === 'finance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">Transaksi Kas Terkait Siklus</h3>
            <p className="text-xs text-slate-500">
              Rincian seluruh uang masuk dan uang keluar yang dialokasikan ke siklus {cycle.code}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Tipe</th>
                  <th className="py-2.5 px-4">Kategori</th>
                  <th className="py-2.5 px-4">Nominal</th>
                  <th className="py-2.5 px-4">Sumber / Kas</th>
                  <th className="py-2.5 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycle.transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada catatan keuangan langsung untuk siklus ini.
                    </td>
                  </tr>
                ) : (
                  cycle.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-800">{formatDate(tx.date)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={tx.type === 'INCOME' ? 'emerald' : 'red'}>
                          {tx.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar'}
                        </Badge>
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
                      <td className="py-3 px-4 text-slate-500 text-xs">{tx.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Quick Catat Kematian */}
      <Modal
        isOpen={isMortalityModalOpen}
        onClose={() => setIsMortalityModalOpen(false)}
        title={`Catat Kematian Ikan - ${cycle.code}`}
      >
        <form onSubmit={handleAddMortality} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
            <input
              type="date"
              required
              value={mortalityForm.date}
              onChange={(e) => setMortalityForm({ ...mortalityForm, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Ikan Mati (Ekor) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={mortalityForm.count}
              onChange={(e) => setMortalityForm({ ...mortalityForm, count: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Penyebab Kematian *</label>
            <select
              value={mortalityForm.cause}
              onChange={(e) => setMortalityForm({ ...mortalityForm, cause: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="Kualitas Air">Kualitas Air (pH drop / amonia tinggi)</option>
              <option value="Penyakit / Jamur">Penyakit / Jamur (Bercak putih)</option>
              <option value="Kanibalisme">Kanibalisme (Ukuran tidak merata)</option>
              <option value="Suhu Ekstrem">Suhu Ekstrem (Malam dingin / hujan lebat)</option>
              <option value="Pakan Berlebih">Pakan Berlebih (Overfeeding)</option>
              <option value="Stres Perjalanan">Stres Perjalanan (Adaptasi awal)</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={mortalityForm.notes}
              onChange={(e) => setMortalityForm({ ...mortalityForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
              placeholder="Tindakan penanganan: tabur garam krosok, kuras 30% air..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMortalityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Kematian'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Quick Catat Panen */}
      <Modal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        title={`Catat Panen Ikan - ${cycle.code}`}
      >
        <form onSubmit={handleAddHarvest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Panen *</label>
            <input
              type="date"
              required
              value={harvestForm.date}
              onChange={(e) => setHarvestForm({ ...harvestForm, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Ikan Dipanen (Ekor) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={harvestForm.fishCount}
                onChange={(e) => setHarvestForm({ ...harvestForm, fishCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Berat Total Panen (kg) *
              </label>
              <input
                type="number"
                required
                min={0.1}
                step="any"
                value={harvestForm.totalWeightKg}
                onChange={(e) =>
                  setHarvestForm({ ...harvestForm, totalWeightKg: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual per kg (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={harvestForm.pricePerKg}
                onChange={(e) =>
                  setHarvestForm({ ...harvestForm, pricePerKg: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Pendapatan (Otomatis)
              </label>
              <input
                type="text"
                readOnly
                value={formatRupiah(harvestForm.totalWeightKg * harvestForm.pricePerKg)}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pembeli</label>
            <input
              type="text"
              value={harvestForm.buyerName}
              onChange={(e) => setHarvestForm({ ...harvestForm, buyerName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              placeholder="Contoh: Mas Bejo - Pecel Lele"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsHarvestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Panen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Quick Tambah Pakan */}
      <Modal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        title={`Catat Pemberian Pakan - ${cycle.code}`}
      >
        <form onSubmit={handleAddFeed} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
            <input
              type="date"
              required
              value={feedForm.date}
              onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pakan *</label>
            <input
              type="text"
              required
              value={feedForm.feedType}
              onChange={(e) => setFeedForm({ ...feedForm, feedType: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
              placeholder="Contoh: PF 1000, 781-1, Maggot"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Pakan (kg) *
              </label>
              <input
                type="number"
                required
                min={0.1}
                step="any"
                value={feedForm.weightKg}
                onChange={(e) => setFeedForm({ ...feedForm, weightKg: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga per kg (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={feedForm.pricePerKg}
                onChange={(e) => setFeedForm({ ...feedForm, pricePerKg: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Biaya Pakan (Otomatis)
            </label>
            <input
              type="text"
              readOnly
              value={formatRupiah(feedForm.weightKg * feedForm.pricePerKg)}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-rose-600 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFeedModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Pakan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

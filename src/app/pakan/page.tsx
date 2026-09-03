'use client';

import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Scale,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatRupiah, formatNumber, formatDate, formatDateInput } from '@/lib/formatters';

export default function FeedPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('Semua');

  // Modals
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    cycleId: '',
    date: formatDateInput(new Date()),
    feedType: '781-1 (Hi-Pro-Vite)',
    weightKg: 50,
    pricePerKg: 11500,
    notes: '',
    autoCreateTransaction: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resF, resC] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/cycles'),
      ]);
      const dataF = await resF.json();
      const dataC = await resC.json();
      setFeeds(dataF);
      setCycles(dataC);

      if (dataC.length > 0 && !formData.cycleId) {
        setFormData((prev) => ({ ...prev, cycleId: dataC[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedFeed(null);
    const activeCycle = cycles.find((c) => c.status === 'Aktif') || cycles[0];
    setFormData({
      cycleId: activeCycle ? activeCycle.id : '',
      date: formatDateInput(new Date()),
      feedType: '781-1 (Hi-Pro-Vite)',
      weightKg: 50,
      pricePerKg: 11500,
      notes: '',
      autoCreateTransaction: true,
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedFeed(item);
    setFormData({
      cycleId: item.cycleId,
      date: formatDateInput(item.date),
      feedType: item.feedType,
      weightKg: item.weightKg,
      pricePerKg: item.pricePerKg,
      notes: item.notes || '',
      autoCreateTransaction: false,
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = selectedFeed ? `/api/feeds/${selectedFeed.id}` : '/api/feeds';
      const method = selectedFeed ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan catatan pakan');
        return;
      }

      setIsOpenModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/feeds/${toDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus catatan pakan');
        return;
      }
      setIsDeleteOpen(false);
      setToDelete(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrik Ringkasan Pakan
  const totalFeedKg = feeds.reduce((s, f) => s + f.weightKg, 0);
  const totalFeedCost = feeds.reduce((s, f) => s + f.totalCost, 0);

  // Total kg panen untuk hitung biaya pakan / kg panen
  const totalHarvestKg = cycles.reduce(
    (s, c) => s + (c.harvests?.reduce((hSum: number, h: any) => hSum + h.totalWeightKg, 0) || 0),
    0
  );
  const feedCostPerKgHarvest = totalHarvestKg > 0 ? totalFeedCost / totalHarvestKg : 0;
  const avgFeedCostPerCycle = cycles.length > 0 ? totalFeedCost / cycles.length : 0;

  const filteredFeeds = feeds.filter((f) => {
    const matchesSearch =
      f.cycle?.code.toLowerCase().includes(search.toLowerCase()) ||
      f.feedType.toLowerCase().includes(search.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCycle = cycleFilter === 'Semua' || f.cycleId === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pencatatan Biaya Pakan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau konsumsi pelet, efisiensi pakan, dan akumulasi biaya pakan per siklus lele.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pakan Baru</span>
        </button>
      </div>

      {/* 4 Metrik Pakan Utama (Sesuai Permintaan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Pakan Digunakan</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatNumber(totalFeedKg)} kg
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Seluruh siklus budidaya</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <Wheat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Biaya Pakan</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(totalFeedCost)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Biaya operasional terbesar (~60-70%)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rata-rata Biaya / Siklus</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatRupiah(avgFeedCostPerCycle)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Per siklus tebar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Biaya Pakan / kg Panen</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              {formatRupiah(feedCostPerKgHarvest)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Standar efisien &lt; Rp 13.500/kg</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari merek pakan, siklus, atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Siklus:</span>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Siklus</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Catatan Pakan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Siklus</th>
                <th className="py-3.5 px-4">Jenis / Merek Pakan</th>
                <th className="py-3.5 px-4">Jumlah (kg)</th>
                <th className="py-3.5 px-4">Harga / kg</th>
                <th className="py-3.5 px-4">Total Biaya Pakan</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Belum ada catatan pakan yang tersimpan.
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(f.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{f.cycle?.code}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{f.feedType}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNumber(f.weightKg)} kg
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{formatRupiah(f.pricePerKg)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600">
                      {formatRupiah(f.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {f.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToDelete(f);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Pakan */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedFeed ? 'Edit Catatan Pakan' : 'Catat Pembelian / Pemberian Pakan'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Siklus Budidaya *
            </label>
            <select
              required
              value={formData.cycleId}
              onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis / Merek Pakan *
            </label>
            <input
              type="text"
              required
              value={formData.feedType}
              onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
              placeholder="Contoh: PF 1000, 781-1, 781-2, Pelet Apung"
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
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
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
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
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
              value={formatRupiah(formData.weightKg * formData.pricePerKg)}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-rose-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500"
              placeholder="Pemberian pagi/sore, respon makan lele..."
            />
          </div>

          {!selectedFeed && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-xs text-yellow-900">
              <input
                type="checkbox"
                id="autoFeedTx"
                checked={formData.autoCreateTransaction}
                onChange={(e) =>
                  setFormData({ ...formData, autoCreateTransaction: e.target.checked })
                }
                className="rounded text-yellow-600 focus:ring-yellow-500 w-4 h-4"
              />
              <label htmlFor="autoFeedTx" className="cursor-pointer font-medium">
                Otomatis catat biaya pakan ini ke buku kas keuangan (Uang Keluar)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpenModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan Pakan"
        message="Apakah Anda yakin ingin menghapus catatan pakan ini?"
        isLoading={actionLoading}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Anchor,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Scale,
  Edit2,
  Trash2,
  Fish,
  CheckCircle2,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatRupiah, formatNumber, formatKg, formatDate, formatDateInput } from '@/lib/formatters';

export default function HarvestsPage() {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('Semua');

  // Modals
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    cycleId: '',
    pondId: '',
    date: formatDateInput(new Date()),
    fishCount: 1000,
    totalWeightKg: 100,
    pricePerKg: 25000,
    buyerName: 'Mas Bejo - Pecel Lele',
    notes: '',
    autoCreateTransaction: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resH, resC] = await Promise.all([
        fetch('/api/harvests'),
        fetch('/api/cycles'),
      ]);
      const dataH = await resH.json();
      const dataC = await resC.json();
      setHarvests(dataH);
      setCycles(dataC);

      if (dataC.length > 0 && !formData.cycleId) {
        setFormData((prev) => ({
          ...prev,
          cycleId: dataC[0].id,
          pondId: dataC[0].pondId,
        }));
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
    setSelectedHarvest(null);
    const activeCycle = cycles.find((c) => c.status === 'Aktif') || cycles[0];
    setFormData({
      cycleId: activeCycle ? activeCycle.id : '',
      pondId: activeCycle ? activeCycle.pondId : '',
      date: formatDateInput(new Date()),
      fishCount: 5000,
      totalWeightKg: 500,
      pricePerKg: 25000,
      buyerName: 'Pengepul Pasar Induk',
      notes: '',
      autoCreateTransaction: true,
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (h: any) => {
    setSelectedHarvest(h);
    setFormData({
      cycleId: h.cycleId,
      pondId: h.pondId,
      date: formatDateInput(h.date),
      fishCount: h.fishCount,
      totalWeightKg: h.totalWeightKg,
      pricePerKg: h.pricePerKg,
      buyerName: h.buyerName || '',
      notes: h.notes || '',
      autoCreateTransaction: false,
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = selectedHarvest ? `/api/harvests/${selectedHarvest.id}` : '/api/harvests';
      const method = selectedHarvest ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan data panen');
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
      const res = await fetch(`/api/harvests/${toDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus panen');
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

  // Metrik Panen
  const totalHarvestWeightKg = harvests.reduce((s, h) => s + h.totalWeightKg, 0);
  const totalHarvestFishCount = harvests.reduce((s, h) => s + h.fishCount, 0);
  const totalRevenue = harvests.reduce((s, h) => s + h.totalRevenue, 0);

  const avgWeightGram =
    totalHarvestFishCount > 0 ? (totalHarvestWeightKg * 1000) / totalHarvestFishCount : 0;
  const avgPricePerKg = totalHarvestWeightKg > 0 ? totalRevenue / totalHarvestWeightKg : 0;

  // Sisa ikan di seluruh farm
  const totalInitialFish = cycles.reduce((s, c) => s + c.initialFishCount, 0);
  const totalDeadFish = cycles.reduce(
    (s, c) => s + (c.mortalities?.reduce((mSum: number, m: any) => mSum + m.count, 0) || 0),
    0
  );
  const totalRemainingFish = Math.max(0, totalInitialFish - totalDeadFish - totalHarvestFishCount);

  const filteredHarvests = harvests.filter((h) => {
    const matchesSearch =
      h.cycle?.code.toLowerCase().includes(search.toLowerCase()) ||
      h.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      (h.notes && h.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCycle = cycleFilter === 'Semua' || h.cycleId === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pencatatan Panen</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekam hasil panen lele, bobot tonase, omzet penjualan, dan kalkulasi rata-rata ukuran ikan.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Panen Baru</span>
        </button>
      </div>

      {/* 6 Metrik Panen Utama (Sesuai Permintaan) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Panen (kg)</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {formatNumber(totalHarvestWeightKg)} kg
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Tonase akumulatif</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Ikan Dipanen</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {formatNumber(totalHarvestFishCount)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Ekor ikan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Pendapatan</p>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
            {formatRupiah(totalRevenue)}
          </h3>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">Omzet kotor panen</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Rata-rata Berat</p>
          <h3 className="text-xl font-extrabold text-amber-600 mt-1">
            {avgWeightGram.toFixed(0)} gram
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ~{(1000 / (avgWeightGram || 100)).toFixed(0)} ekor / kg
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Harga Rata-rata</p>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {formatRupiah(avgPricePerKg)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Per kilogram lele</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold uppercase text-slate-400">Jumlah Ikan Tersisa</p>
          <h3 className="text-xl font-extrabold text-teal-600 mt-1">
            {formatNumber(totalRemainingFish)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Belum dipanen</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pembeli, kode siklus, atau catatan panen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
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

      {/* Tabel Data Panen */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Siklus Budidaya</th>
                <th className="py-3.5 px-4">Kolam</th>
                <th className="py-3.5 px-4">Jumlah Ekor</th>
                <th className="py-3.5 px-4">Berat Total (kg)</th>
                <th className="py-3.5 px-4">Harga / kg</th>
                <th className="py-3.5 px-4">Total Pendapatan</th>
                <th className="py-3.5 px-4">Pembeli</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHarvests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Belum ada data panen yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredHarvests.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(h.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{h.cycle?.code}</td>
                    <td className="py-3.5 px-4 text-slate-700">{h.pond?.name}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {formatNumber(h.fishCount)} ekor
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      {formatNumber(h.totalWeightKg)} kg
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{formatRupiah(h.pricePerKg)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      {formatRupiah(h.totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{h.buyerName}</span>
                      {h.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{h.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(h)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToDelete(h);
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

      {/* Modal Form Panen */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedHarvest ? 'Edit Catatan Panen' : 'Catat Panen Ikan Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Siklus Budidaya *
            </label>
            <select
              required
              value={formData.cycleId}
              onChange={(e) => {
                const selected = cycles.find((c) => c.id === e.target.value);
                setFormData({
                  ...formData,
                  cycleId: e.target.value,
                  pondId: selected ? selected.pondId : formData.pondId,
                });
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.pond?.name} - {c.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Panen *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Ikan (Ekor) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.fishCount}
                onChange={(e) => setFormData({ ...formData, fishCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Berat Total (kg) *
              </label>
              <input
                type="number"
                required
                min={0.1}
                step="any"
                value={formData.totalWeightKg}
                onChange={(e) =>
                  setFormData({ ...formData, totalWeightKg: Number(e.target.value) })
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
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
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
                value={formatRupiah(formData.totalWeightKg * formData.pricePerKg)}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pembeli / Pengepul *
            </label>
            <input
              type="text"
              required
              value={formData.buyerName}
              onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              placeholder="Contoh: Mas Bejo - Pecel Lele Jabodetabek"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              placeholder="Kondisi ikan segar, sampling ukuran..."
            />
          </div>

          {!selectedHarvest && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
              <input
                type="checkbox"
                id="autoTx"
                checked={formData.autoCreateTransaction}
                onChange={(e) =>
                  setFormData({ ...formData, autoCreateTransaction: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <label htmlFor="autoTx" className="cursor-pointer font-medium">
                Otomatis catat hasil panen ke buku kas keuangan (Uang Masuk)
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Panen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan Panen"
        message="Apakah Anda yakin ingin menghapus catatan panen ini?"
        isLoading={actionLoading}
      />
    </div>
  );
}

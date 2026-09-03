'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Waves,
  ArrowRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatRupiah, formatNumber, formatDate, formatDateInput } from '@/lib/formatters';

export default function CyclesPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [ponds, setPonds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [pondFilter, setPondFilter] = useState('Semua');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    pondId: '',
    startDate: formatDateInput(new Date()),
    harvestEstimateDate: '',
    initialFishCount: 10000,
    seedPricePerFish: 150,
    totalSeedCost: 1500000,
    seedSize: '5-7 cm',
    feedType: 'PF 1000 & 781-1',
    status: 'Aktif',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCycles, resPonds] = await Promise.all([
        fetch('/api/cycles'),
        fetch('/api/ponds'),
      ]);
      const dataCycles = await resCycles.json();
      const dataPonds = await resPonds.json();
      setCycles(dataCycles);
      setPonds(dataPonds);

      if (dataPonds.length > 0 && !formData.pondId) {
        setFormData((prev) => ({ ...prev, pondId: dataPonds[0].id }));
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

  // Update totalSeedCost when initialFishCount or seedPricePerFish changes
  const handleCountOrPriceChange = (count: number, price: number) => {
    setFormData((prev) => ({
      ...prev,
      initialFishCount: count,
      seedPricePerFish: price,
      totalSeedCost: count * price,
    }));
  };

  const handleOpenCreate = () => {
    const nextNum = String(cycles.length + 1).padStart(3, '0');
    const autoCode = `Lele-2026-${nextNum}`;
    const defaultPond = ponds.find((p) => p.status === 'Kosong') || ponds[0];

    // Estimasi panen 90 hari kedepan
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 90);

    setFormData({
      code: autoCode,
      pondId: defaultPond ? defaultPond.id : '',
      startDate: formatDateInput(new Date()),
      harvestEstimateDate: formatDateInput(estDate),
      initialFishCount: 10000,
      seedPricePerFish: 150,
      totalSeedCost: 1500000,
      seedSize: '5-7 cm',
      feedType: 'PF 1000 & 781-1',
      status: 'Aktif',
      notes: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (cycle: any) => {
    setSelectedCycle(cycle);
    setFormData({
      code: cycle.code,
      pondId: cycle.pondId,
      startDate: formatDateInput(cycle.startDate),
      harvestEstimateDate: formatDateInput(cycle.harvestEstimateDate),
      initialFishCount: cycle.initialFishCount,
      seedPricePerFish: cycle.seedPricePerFish,
      totalSeedCost: cycle.totalSeedCost,
      seedSize: cycle.seedSize,
      feedType: cycle.feedType,
      status: cycle.status,
      notes: cycle.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const isEditing = Boolean(selectedCycle);
      const url = isEditing ? `/api/cycles/${selectedCycle.id}` : '/api/cycles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan siklus');
        return;
      }

      setIsCreateOpen(false);
      setIsEditOpen(false);
      setSelectedCycle(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cycleToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cycles/${cycleToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus siklus');
        return;
      }
      setIsDeleteOpen(false);
      setCycleToDelete(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCycles = cycles.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.pond?.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'Semua' || c.status === statusFilter;
    const matchesPond = pondFilter === 'Semua' || c.pondId === pondFilter;

    return matchesSearch && matchesStatus && matchesPond;
  });

  const selectedPondObj = ponds.find((p) => p.id === formData.pondId);
  const isPondOccupied = selectedPondObj?.status === 'Digunakan';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Siklus Budidaya</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau dan kelola setiap tahapan tebar benih, pakan harian, panen, hingga perhitungan laba per siklus.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Siklus Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode siklus, kolam, catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <Waves className="w-3.5 h-3.5 text-slate-400" />
            <span>Kolam:</span>
            <select
              value={pondFilter}
              onChange={(e) => setPondFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="Semua">Semua Kolam</option>
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Data Siklus */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Kode Siklus</th>
                <th className="py-3.5 px-4">Kolam</th>
                <th className="py-3.5 px-4">Tgl Mulai / Estimasi</th>
                <th className="py-3.5 px-4">Ikan Awal</th>
                <th className="py-3.5 px-4">Mati / Sisa Hidup</th>
                <th className="py-3.5 px-4">Hasil Panen</th>
                <th className="py-3.5 px-4">Laba Bersih</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCycles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada siklus budidaya yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredCycles.map((cycle) => {
                  let statusBadge = <Badge variant="emerald">Aktif</Badge>;
                  if (cycle.status === 'Selesai') {
                    statusBadge = <Badge variant="blue">Selesai</Badge>;
                  } else if (cycle.status === 'Dibatalkan') {
                    statusBadge = <Badge variant="red">Dibatalkan</Badge>;
                  }

                  return (
                    <tr key={cycle.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          href={`/siklus/${cycle.id}`}
                          className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                        >
                          {cycle.code}
                          <ArrowRight className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        </Link>
                        <p className="text-[11px] font-normal text-slate-400">{cycle.seedSize}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{cycle.pond?.name}</span>
                        <p className="text-[11px] text-slate-400">{cycle.pond?.type}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800">{formatDate(cycle.startDate)}</span>
                        {cycle.harvestEstimateDate && (
                          <p className="text-[11px] text-amber-600">
                            Est: {formatDate(cycle.harvestEstimateDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {formatNumber(cycle.initialFishCount)}
                        </span>{' '}
                        <span className="text-xs text-slate-400">ekor</span>
                        <p className="text-[11px] text-slate-400">
                          {formatRupiah(cycle.totalSeedCost)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-rose-600 font-medium">
                          {formatNumber(cycle.totalDead)}
                        </span>{' '}
                        <span className="text-slate-400">/</span>{' '}
                        <span className="text-emerald-700 font-semibold">
                          {formatNumber(cycle.remainingFish)}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          MR: {cycle.mortalityRate.toFixed(1)}%
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {cycle.totalHarvestWeightKg > 0 ? (
                          <div>
                            <span className="font-bold text-slate-800">
                              {formatNumber(cycle.totalHarvestWeightKg)} kg
                            </span>
                            <p className="text-[11px] text-emerald-600 font-medium">
                              {formatRupiah(cycle.totalHarvestRevenue)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum panen</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {cycle.netProfit !== undefined ? (
                          <span
                            className={`font-bold ${
                              cycle.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatRupiah(cycle.netProfit)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4">{statusBadge}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/siklus/${cycle.id}`}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Detail Siklus"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(cycle)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Siklus"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCycleToDelete(cycle);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Siklus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Siklus */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedCycle(null);
        }}
        title={isEditOpen ? 'Edit Siklus Budidaya' : 'Mulai Siklus Budidaya Baru'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveCycle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode / Nama Siklus *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: Lele-2026-004"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kolam *</label>
              <select
                required
                value={formData.pondId}
                onChange={(e) => setFormData({ ...formData, pondId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type} - {p.status})
                  </option>
                ))}
              </select>
              {isPondOccupied && !isEditOpen && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Perhatian: Kolam ini berstatus 'Digunakan' oleh siklus lain.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai Budidaya *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimasi Tanggal Panen
              </label>
              <input
                type="date"
                value={formData.harvestEstimateDate}
                onChange={(e) => setFormData({ ...formData, harvestEstimateDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Ikan Awal (Ekor) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.initialFishCount}
                onChange={(e) =>
                  handleCountOrPriceChange(Number(e.target.value), formData.seedPricePerFish)
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Beli Bibit / Ekor (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={formData.seedPricePerFish}
                onChange={(e) =>
                  handleCountOrPriceChange(formData.initialFishCount, Number(e.target.value))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Biaya Bibit (Otomatis)
              </label>
              <input
                type="text"
                readOnly
                value={formatRupiah(formData.totalSeedCost)}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ukuran Bibit (cm)
              </label>
              <input
                type="text"
                value={formData.seedSize}
                onChange={(e) => setFormData({ ...formData, seedSize: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 5-7 cm, 7-9 cm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pakan</label>
              <input
                type="text"
                value={formData.feedType}
                onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: PF 1000 & 781-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Siklus
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Catatan benih, supplier, perlakuan air..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Siklus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Siklus Budidaya"
        message={`Apakah Anda yakin ingin menghapus siklus "${cycleToDelete?.code}"? Seluruh data pakan, panen, kematian ikan, dan riwayat yang terkait akan terhapus secara permanen.`}
        confirmText="Hapus Permanen"
        isLoading={actionLoading}
      />
    </div>
  );
}

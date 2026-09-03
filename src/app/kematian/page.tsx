'use client';

import React, { useState, useEffect } from 'react';
import {
  Skull,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingDown,
  Fish,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatNumber, formatDate, formatDateInput } from '@/lib/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function MortalityPage() {
  const [mortalities, setMortalities] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('Semua');

  // Modal Form
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedMortality, setSelectedMortality] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    cycleId: '',
    date: formatDateInput(new Date()),
    count: 20,
    cause: 'Kualitas Air',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMort, resCycles] = await Promise.all([
        fetch('/api/mortality'),
        fetch('/api/cycles'),
      ]);
      const dataMort = await resMort.json();
      const dataCycles = await resCycles.json();
      setMortalities(dataMort);
      setCycles(dataCycles);

      if (dataCycles.length > 0 && !formData.cycleId) {
        setFormData((prev) => ({ ...prev, cycleId: dataCycles[0].id }));
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
    setSelectedMortality(null);
    const activeCycle = cycles.find((c) => c.status === 'Aktif') || cycles[0];
    setFormData({
      cycleId: activeCycle ? activeCycle.id : '',
      date: formatDateInput(new Date()),
      count: 20,
      cause: 'Kualitas Air',
      notes: '',
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedMortality(item);
    setFormData({
      cycleId: item.cycleId,
      date: formatDateInput(item.date),
      count: item.count,
      cause: item.cause,
      notes: item.notes || '',
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = selectedMortality
        ? `/api/mortality/${selectedMortality.id}`
        : '/api/mortality';
      const method = selectedMortality ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan');
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
      const res = await fetch(`/api/mortality/${toDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus');
        return;
      }
      setIsDeleteOpen(false);
      setToDelete(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setActionLoading(false);
    }
  };

  // Kalkulasi statistik kematian
  const selectedCycleObj = cycles.find((c) => c.id === formData.cycleId);
  const initialFishForSelected = selectedCycleObj ? selectedCycleObj.initialFishCount : 10000;
  const estimatedRemainingPreview = Math.max(0, initialFishForSelected - formData.count);
  const mortalityPercentPreview =
    initialFishForSelected > 0 ? (formData.count / initialFishForSelected) * 100 : 0;

  const totalDeadAll = mortalities.reduce((sum, m) => sum + m.count, 0);
  const totalInitialAll = cycles.reduce((sum, c) => sum + c.initialFishCount, 0);
  const totalHarvestAll = cycles.reduce(
    (sum, c) => sum + (c.harvests?.reduce((s: number, h: any) => s + h.fishCount, 0) || 0),
    0
  );
  const estimatedRemainingAll = Math.max(0, totalInitialAll - totalDeadAll - totalHarvestAll);
  const overallMortalityRate = totalInitialAll > 0 ? (totalDeadAll / totalInitialAll) * 100 : 0;

  const filteredMortalities = mortalities.filter((m) => {
    const matchesSearch =
      m.cycle?.code.toLowerCase().includes(search.toLowerCase()) ||
      m.cause.toLowerCase().includes(search.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCycle = cycleFilter === 'Semua' || m.cycleId === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  // Data chart kematian per tanggal
  const chartDataMap: { [key: string]: number } = {};
  filteredMortalities
    .slice()
    .reverse()
    .forEach((m) => {
      const d = formatDate(m.date);
      chartDataMap[d] = (chartDataMap[d] || 0) + m.count;
    });
  const chartData = Object.entries(chartDataMap).map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pencatatan Ikan Mati</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau tingkat mortalitas, analisis penyebab kematian lele, dan estimasi sisa populasi kolam.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Kematian Baru</span>
        </button>
      </div>

      {/* KPI Kematian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Ikan Mati</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {formatNumber(totalDeadAll)} ekor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Akumulasi seluruh siklus</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Skull className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Persentase Kematian</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overallMortalityRate.toFixed(1)}%
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Batas aman industri &lt; 8%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Estimasi Ikan Hidup</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatNumber(estimatedRemainingAll)} ekor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tebar awal - mati - panen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Fish className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Catatan Insiden</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {mortalities.length} Kali
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pencatatan harian/mingguan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grafik Tren Perkembangan Kematian Ikan */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Grafik Perkembangan Kematian Ikan</h3>
              <p className="text-xs text-slate-500">Jumlah kematian ikan harian yang tercatat</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold">
              Mortalitas
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} ekor`, 'Ikan Mati']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Ikan Mati"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#e11d48' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter & Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari penyebab kematian, kode siklus, atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
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

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Siklus Budidaya</th>
                <th className="py-3.5 px-4">Kolam</th>
                <th className="py-3.5 px-4">Jumlah Mati</th>
                <th className="py-3.5 px-4">Penyebab Kematian</th>
                <th className="py-3.5 px-4">Catatan & Penanganan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMortalities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada catatan kematian ikan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMortalities.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(m.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{m.cycle?.code}</span>
                      <p className="text-[11px] text-slate-400">
                        Tebar: {formatNumber(m.cycle?.initialFishCount)} ekor
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{m.pond?.name}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      {formatNumber(m.count)} ekor
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
                        {m.cause}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {m.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToDelete(m);
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

      {/* Modal Form Tambah/Edit */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedMortality ? 'Edit Catatan Kematian' : 'Catat Ikan Mati'}
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
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.pond?.name} - {formatNumber(c.initialFishCount)} ekor)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Kejadian *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Otomatis Hitung Estimasi Sisa */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tebar Awal Siklus:</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(initialFishForSelected)} ekor
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Persentase Kematian Insiden:</span>
              <span className="font-semibold text-rose-600">
                {mortalityPercentPreview.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-slate-700">Estimasi Sisa Ikan Hidup:</span>
              <span className="text-emerald-700">
                {formatNumber(estimatedRemainingPreview)} ekor
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penyebab Kematian *
            </label>
            <select
              value={formData.cause}
              onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="Kualitas Air">Kualitas Air (Amonia / pH drop)</option>
              <option value="Penyakit / Jamur">Penyakit / Jamur / Moncong Putih</option>
              <option value="Kanibalisme">Kanibalisme (Ukuran beda jauh)</option>
              <option value="Suhu Ekstrem">Suhu Ekstrem (Malam dingin / terik)</option>
              <option value="Pakan Berlebih">Pakan Berlebih (Overfeeding)</option>
              <option value="Stres Perjalanan">Stres Perjalanan (Adaptasi tebar)</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
              placeholder="Tindakan penanganan yang diambil..."
            />
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
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
        title="Hapus Catatan Kematian"
        message="Apakah Anda yakin ingin menghapus catatan kematian ikan ini?"
        isLoading={actionLoading}
      />
    </div>
  );
}

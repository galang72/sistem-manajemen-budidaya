'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Waves,
  Edit2,
  Trash2,
  Activity,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatNumber } from '@/lib/formatters';

export default function PondsPage() {
  const [ponds, setPonds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modal
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedPond, setSelectedPond] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pondToDelete, setPondToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    capacity: 5000,
    type: 'Bioflok',
    status: 'Kosong',
    notes: '',
  });

  const fetchPonds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ponds');
      const data = await res.json();
      setPonds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPonds();
  }, []);

  const handleOpenCreate = () => {
    setSelectedPond(null);
    setFormData({
      name: `Kolam Bioflok D3-${ponds.length + 1}`,
      size: 'Diameter 3m x 1.2m',
      capacity: 5000,
      type: 'Bioflok',
      status: 'Kosong',
      notes: '',
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (pond: any) => {
    setSelectedPond(pond);
    setFormData({
      name: pond.name,
      size: pond.size,
      capacity: pond.capacity,
      type: pond.type,
      status: pond.status,
      notes: pond.notes || '',
    });
    setIsOpenModal(true);
  };

  const handleSavePond = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = selectedPond ? `/api/ponds/${selectedPond.id}` : '/api/ponds';
      const method = selectedPond ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan kolam');
        return;
      }

      setIsOpenModal(false);
      fetchPonds();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePond = async () => {
    if (!pondToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/ponds/${pondToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus kolam');
        return;
      }
      setIsDeleteOpen(false);
      setPondToDelete(null);
      fetchPonds();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPonds = ponds.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Kolam</h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar kolam budidaya, kapasitas tebar, jenis konstruksi, dan siklus aktif yang menempati.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kolam Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kolam berdasarkan nama atau jenis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Kosong">Kosong</option>
            <option value="Digunakan">Digunakan</option>
            <option value="Perawatan">Perawatan</option>
          </select>
        </div>
      </div>

      {/* Grid Kartu Kolam */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Memuat data kolam...
          </div>
        ) : filteredPonds.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Tidak ada kolam yang sesuai.
          </div>
        ) : (
          filteredPonds.map((pond) => {
            let variant: any = 'gray';
            if (pond.status === 'Digunakan') variant = 'emerald';
            if (pond.status === 'Perawatan') variant = 'amber';

            const activeCycle = pond.cycles && pond.cycles.length > 0 ? pond.cycles[0] : null;

            return (
              <div
                key={pond.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Waves className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{pond.name}</h3>
                        <p className="text-xs text-slate-500">{pond.type}</p>
                      </div>
                    </div>
                    <Badge variant={variant}>{pond.status}</Badge>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ukuran Kolam:</span>
                      <span className="font-semibold text-slate-800">{pond.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kapasitas Maksimal:</span>
                      <span className="font-semibold text-slate-800">
                        {formatNumber(pond.capacity)} ekor
                      </span>
                    </div>

                    {/* Siklus Aktif */}
                    <div className="pt-2">
                      <span className="text-slate-500 block mb-1">Siklus Saat Ini:</span>
                      {activeCycle ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-emerald-800 text-xs">{activeCycle.code}</p>
                            <p className="text-[11px] text-emerald-600">
                              Tebar: {formatNumber(activeCycle.initialFishCount)} ekor
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                            Berjalan
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                          Tidak ada siklus aktif
                        </div>
                      )}
                    </div>

                    {pond.notes && (
                      <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">
                        {pond.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    onClick={() => handleOpenEdit(pond)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setPondToDelete(pond);
                      setIsDeleteOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah / Edit Kolam */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedPond ? 'Edit Informasi Kolam' : 'Tambah Kolam Baru'}
      >
        <form onSubmit={handleSavePond} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama / Nomor Kolam *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Kolam Bioflok D3-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ukuran Kolam</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: D3 x 1.2m atau 4x6m"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas (Ekor) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kolam *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Bioflok">Bioflok Bundar</option>
                <option value="Terpal Persegi">Terpal Persegi</option>
                <option value="Terpal Bundar">Terpal Bundar</option>
                <option value="Kolam Tanah">Kolam Tanah Tradisional</option>
                <option value="Kolam Beton">Kolam Beton Permanen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kolam</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Kosong">Kosong (Siap Tebar)</option>
                <option value="Digunakan">Digunakan (Ada Ikan)</option>
                <option value="Perawatan">Perawatan (Kering / Servis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              placeholder="Spesifikasi blower, posisi drainase..."
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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Kolam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePond}
        title="Hapus Kolam"
        message={`Apakah Anda yakin ingin menghapus kolam "${pondToDelete?.name}"?`}
        isLoading={actionLoading}
      />
    </div>
  );
}

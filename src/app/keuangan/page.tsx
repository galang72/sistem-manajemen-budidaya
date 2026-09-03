'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Download,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatRupiah, formatDate, formatDateInput } from '@/lib/formatters';
import { exportToExcel } from '@/lib/exportExcel';

function FinanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>(
    initialTab === 'income' ? 'income' : initialTab === 'expense' ? 'expense' : 'all'
  );

  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, cashBalance: 0 });
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [cycleFilter, setCycleFilter] = useState('Semua');

  // Modals
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: 'Pakan',
    source: 'Kas Usaha',
    amount: 500000,
    date: formatDateInput(new Date()),
    cycleId: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTx, resCycles] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/cycles'),
      ]);
      const dataTx = await resTx.json();
      const dataCycles = await resCycles.json();
      setTransactions(dataTx.transactions || []);
      setSummary(dataTx.summary || { totalIncome: 0, totalExpense: 0, cashBalance: 0 });
      setCycles(dataCycles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = (forcedType?: 'INCOME' | 'EXPENSE') => {
    setSelectedTx(null);
    const type = forcedType || (activeTab === 'income' ? 'INCOME' : 'EXPENSE');
    setFormData({
      type,
      category: type === 'INCOME' ? 'Penjualan Ikan' : 'Pakan',
      source: type === 'INCOME' ? 'Pembeli Tunai' : 'Kas Usaha',
      amount: 100000,
      date: formatDateInput(new Date()),
      cycleId: cycles[0]?.id || '',
      notes: '',
    });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (tx: any) => {
    setSelectedTx(tx);
    setFormData({
      type: tx.type,
      category: tx.category,
      source: tx.source,
      amount: tx.amount,
      date: formatDateInput(tx.date),
      cycleId: tx.cycleId || '',
      notes: tx.notes || '',
    });
    setIsOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = selectedTx ? `/api/transactions/${selectedTx.id}` : '/api/transactions';
      const method = selectedTx ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan transaksi');
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
      const res = await fetch(`/api/transactions/${toDelete.id}`, { method: 'DELETE' });
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

  const handleExportExcel = () => {
    const exportData = filteredTransactions.map((tx) => ({
      Tanggal: formatDate(tx.date),
      Tipe: tx.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar',
      Kategori: tx.category,
      Nominal: tx.amount,
      'Kas / Sumber': tx.source,
      'Siklus Budidaya': tx.cycle?.code || '-',
      Catatan: tx.notes || '-',
    }));
    exportToExcel(exportData, `Buku_Kas_Papap Fish Farm_${formatDateInput(new Date())}`);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'income' && tx.type === 'INCOME') ||
      (activeTab === 'expense' && tx.type === 'EXPENSE');

    const matchesSearch =
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      tx.source.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase())) ||
      (tx.cycle?.code && tx.cycle.code.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'Semua' || tx.category === categoryFilter;
    const matchesCycle = cycleFilter === 'Semua' || tx.cycleId === cycleFilter;

    return matchesTab && matchesSearch && matchesCategory && matchesCycle;
  });

  const incomeCategories = ['Penjualan Ikan', 'Pendapatan Panen', 'Pendapatan Lainnya'];
  const expenseCategories = [
    'Pembelian Bibit',
    'Pakan',
    'Obat & Vitamin',
    'Listrik & Air',
    'Transportasi',
    'Tenaga Kerja',
    'Perawatan Kolam',
    'Peralatan',
    'Biaya Lainnya',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Buku kas operasional farm, pencatatan uang masuk dan uang keluar lele secara akurat.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={() => handleOpenCreate('INCOME')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Uang Masuk</span>
          </button>
          <button
            onClick={() => handleOpenCreate('EXPENSE')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Uang Keluar</span>
          </button>
        </div>
      </div>

      {/* KPI Keuangan Otomatis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Uang Masuk</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatRupiah(summary.totalIncome)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Penjualan ikan & panen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Uang Keluar</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(summary.totalExpense)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bibit, pakan, operasional</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Saldo Kas Tersedia</p>
            <h3
              className={`text-2xl font-extrabold mt-1 ${
                summary.cashBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatRupiah(summary.cashBalance)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total Masuk - Total Keluar</p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              summary.cashBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
            }`}
          >
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Menu Transaksi */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Transaksi ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Uang Masuk</span>
        </button>

        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'expense'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Uang Keluar</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kategori, sumber kas, catatan, atau siklus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            {[...incomeCategories, ...expenseCategories].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Siklus</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Data Transaksi */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Sumber Kas</th>
                <th className="py-3.5 px-4">Siklus Terkait</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={tx.type === 'INCOME' ? 'emerald' : 'red'}>
                        {tx.type === 'INCOME' ? 'Uang Masuk' : 'Uang Keluar'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{tx.category}</td>
                    <td
                      className={`py-3.5 px-4 font-extrabold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">{tx.source}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      {tx.cycle?.code ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {tx.cycle.code}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {tx.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToDelete(tx);
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

      {/* Modal Tambah/Edit Transaksi */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={selectedTx ? 'Edit Transaksi Keuangan' : 'Tambah Transaksi Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe Transaksi *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    type: newType,
                    category: newType === 'INCOME' ? 'Penjualan Ikan' : 'Pakan',
                  });
                }}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="INCOME">Uang Masuk (+)</option>
                <option value="EXPENSE">Uang Keluar (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {formData.type === 'INCOME'
                  ? incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber / Kas
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                placeholder="Kas Tunai, Rekening BCA..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Siklus Terkait (Opsional)
              </label>
              <select
                value={formData.cycleId}
                onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tidak Terkait Siklus Tertentu</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
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
              placeholder="Keterangan transaksi..."
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
              {actionLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus catatan transaksi ini? Perhitungan saldo kas akan disesuaikan otomatis."
        isLoading={actionLoading}
      />
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Memuat transaksi keuangan...</div>}>
      <FinanceContent />
    </Suspense>
  );
}

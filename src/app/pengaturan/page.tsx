'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Building2, Save, Key, ShieldCheck, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name);
          setFarmName(data.user.farmName);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, farmName }),
      });
      if (res.ok) {
        setMessage('Pengaturan berhasil diperbarui!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Memuat profil farm...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Usaha</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola informasi peternakan lele, profil pengelola, dan preferensi akun Anda.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
          {message}
        </div>
      )}

      {/* Profil Usaha Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Identitas Usaha Lele</h3>
            <p className="text-xs text-slate-500">Nama peternakan dan nama pemilik</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Usaha / Peternakan
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pemilik / Pengelola
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email Terdaftar
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'admin@Papap Fish Farm.id'}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Keamanan & Sesi */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Keamanan & Sesi Login</h3>
            <p className="text-xs text-slate-500">Keluar dari sesi manajemen peternakan</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Sesi Aktif</p>
            <p className="text-xs text-slate-500">Masuk sebagai: {user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Fish,
  Waves,
  Skull,
  Anchor,
  Wheat,
  Wallet,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Submenu states
  const [budidayaOpen, setBudidayaOpen] = useState(
    pathname.startsWith('/siklus') || pathname.startsWith('/kolam')
  );
  const [keuanganOpen, setKeuanganOpen] = useState(
    pathname.startsWith('/keuangan') || pathname.startsWith('/laba-rugi')
  );

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Fish className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-none flex items-center gap-1.5">
                Papap Fish Farm <span className="text-teal-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-950 border border-teal-800/50">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 truncate">Manajemen Budidaya </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-sm">
          {/* Dashboard */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/')
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          {/* Group: Budidaya (Siklus, Kolam) */}
          <div>
            <button
              onClick={() => setBudidayaOpen(!budidayaOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                pathname.startsWith('/siklus') || pathname.startsWith('/kolam')
                  ? 'text-teal-300 bg-slate-800/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Fish className="w-5 h-5 text-teal-400" />
                <span>Budidaya</span>
              </div>
              {budidayaOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {budidayaOpen && (
              <div className="ml-4 pl-4 mt-1 space-y-1 border-l border-slate-800">
                <Link
                  href="/siklus"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname.startsWith('/siklus')
                      ? 'text-emerald-400 bg-emerald-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Siklus Budidaya</span>
                </Link>
                <Link
                  href="/kolam"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname.startsWith('/kolam')
                      ? 'text-teal-400 bg-teal-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Kolam</span>
                </Link>
              </div>
            )}
          </div>

          {/* Kematian Ikan */}
          <Link
            href="/kematian"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/kematian')
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Skull className="w-5 h-5 text-rose-400" />
            <span>Kematian Ikan</span>
          </Link>

          {/* Panen */}
          <Link
            href="/panen"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/panen')
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Anchor className="w-5 h-5 text-amber-400" />
            <span>Panen</span>
          </Link>

          {/* Pakan */}
          <Link
            href="/pakan"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/pakan')
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wheat className="w-5 h-5 text-yellow-400" />
            <span>Pakan</span>
          </Link>

          {/* Group: Keuangan */}
          <div>
            <button
              onClick={() => setKeuanganOpen(!keuanganOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                pathname.startsWith('/keuangan') || pathname.startsWith('/laba-rugi')
                  ? 'text-emerald-300 bg-slate-800/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Keuangan</span>
              </div>
              {keuanganOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {keuanganOpen && (
              <div className="ml-4 pl-4 mt-1 space-y-1 border-l border-slate-800">
                <Link
                  href="/keuangan?tab=income"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname === '/keuangan'
                      ? 'text-emerald-400 bg-emerald-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Uang Masuk</span>
                </Link>
                <Link
                  href="/keuangan?tab=expense"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    pathname === '/keuangan'
                      ? 'text-red-400 bg-red-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                  <span>Uang Keluar</span>
                </Link>
                <Link
                  href="/laba-rugi"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive('/laba-rugi')
                      ? 'text-teal-400 bg-teal-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                  <span>Laba & Rugi</span>
                </Link>
              </div>
            )}
          </div>

          {/* Analisis */}
          <Link
            href="/analisis"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/analisis')
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <span>Analisis</span>
          </Link>

          {/* Laporan */}
          <Link
            href="/laporan"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/laporan')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Laporan</span>
          </Link>

          {/* Pengaturan */}
          <Link
            href="/pengaturan"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isActive('/pengaturan')
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Pengaturan</span>
          </Link>
        </div>

        {/* Footer / Farm Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              HS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Haji Anung Suryanto</p>
              <p className="text-[11px] text-slate-400 truncate">Papap Fish Farm Sukses Makmur</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

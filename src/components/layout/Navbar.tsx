import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, getInitials } = useUser();
  const [currentDate, setCurrentDate] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    const formatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
    setCurrentDate(formatted);

    // Fetch alerts count from dashboard
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            {user?.farmName || 'Papap Fish Farm Management'}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">{currentDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <Link
          href="/siklus?action=new"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mulai Siklus Baru</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Notifikasi Sistem ({alerts.length})
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Tutup
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Tidak ada notifikasi penting saat ini. Semua siklus dalam batas aman.
                  </p>
                ) : (
                  alerts.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link
          href="/pengaturan"
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            {getInitials()}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden lg:inline">
            {user?.name || 'Pengelola Farm'}
          </span>
        </Link>
      </div>
    </header>
  );
}

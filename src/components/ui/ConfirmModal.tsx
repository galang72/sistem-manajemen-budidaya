import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDangerous = true,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl flex-shrink-0 ${
            isDangerous ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
          } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Memproses...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

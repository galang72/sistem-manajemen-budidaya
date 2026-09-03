import React from 'react';
import { AlertCircle, AlertTriangle, Info, Bell, CheckCircle } from 'lucide-react';

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  linkText?: string;
  linkHref?: string;
}

interface AlertBannerProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
}

export default function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        const typeStyles = {
          warning: 'bg-amber-50 border-amber-200 text-amber-900',
          danger: 'bg-red-50 border-red-200 text-red-900',
          info: 'bg-blue-50 border-blue-200 text-blue-900',
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        };

        const iconStyles = {
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          danger: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
          success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
        };

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm ${typeStyles[alert.type]}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{iconStyles[alert.type]}</div>
              <div>
                <h5 className="text-sm font-semibold">{alert.title}</h5>
                <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
                {alert.linkHref && (
                  <a
                    href={alert.linkHref}
                    className="inline-block text-xs font-semibold underline mt-1.5 hover:opacity-80"
                  >
                    {alert.linkText || 'Lihat Detail'} &rarr;
                  </a>
                )}
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-xs font-medium opacity-60 hover:opacity-100 p-1"
                aria-label="Tutup"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

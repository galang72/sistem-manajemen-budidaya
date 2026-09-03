/**
 * Utility formater angka dan mata uang sesuai standar Indonesia
 */

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatEkor(value: number | null | undefined): string {
  return `${formatNumber(value)} ekor`;
}

export function formatKg(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '0 kg';
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)} kg`;
}

export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

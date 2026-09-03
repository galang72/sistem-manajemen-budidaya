import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Tulis workbook dan unduh otomatis di browser
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (err) {
    console.error('Gagal mengekspor data ke Excel:', err);
    alert('Terjadi kesalahan saat mengekspor ke Excel');
  }
}

import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';

interface ExportOptions {
  filename: string;
  format: 'csv' | 'excel';
  columns?: {
    header: string;
    key: string;
  }[];
}

export async function exportData(data: any[], options: ExportOptions) {
  const { filename, format, columns } = options;

  if (format === 'csv') {
    const csv = Papa.unparse({
      fields: columns?.map(col => col.header) || Object.keys(data[0]),
      data: data.map(item => {
        if (columns) {
          return columns.map(col => item[col.key]);
        }
        return Object.values(item);
      })
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  } 
  
  else if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (columns) {
      worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: 20
      }));
    } else {
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key,
        key,
        width: 20
      }));
    }

    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${filename}.xlsx`);
  }
} 
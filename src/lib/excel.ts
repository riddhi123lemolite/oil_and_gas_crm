import * as XLSX from 'xlsx';

/** Export an array of plain objects to a downloadable .xlsx file. */
export function exportToExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Sheet1',
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(
    workbook,
    filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`,
  );
}

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
}

/** Read the first sheet of an uploaded Excel/CSV file. */
export async function parseExcelFile(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { headers: [], rows: [] };
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) return { headers: [], rows: [] };

  const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false,
  });
  const headers = json.length > 0 ? Object.keys(json[0] ?? {}) : [];
  return { headers, rows: json };
}

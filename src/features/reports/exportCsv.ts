// Minimal client-side CSV export used by the reports dashboard.

function escapeCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): void {
  const lines = [headers, ...rows].map(row => row.map(escapeCell).join(','));
  // BOM so Excel opens UTF-8 (including Tamil text) correctly.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

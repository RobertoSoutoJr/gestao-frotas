/**
 * Export data to CSV and trigger download.
 *
 * @param {Array<Object>} data — rows to export
 * @param {Array<{key, label, format?}>} columns — column definitions
 * @param {string} filename — file name without extension
 */
export function exportToCsv(data, columns, filename = 'export') {
  if (!data.length) return;

  const separator = ';'; // Brazilian Excel default
  const header = columns.map(c => `"${c.label}"`).join(separator);

  const rows = data.map(row => {
    return columns.map(col => {
      let val = resolve(row, col.key);
      if (val == null) val = '';
      if (col.format) val = col.format(val, row);
      // Escape quotes in CSV
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(separator);
  });

  const bom = '﻿'; // UTF-8 BOM for Excel
  const csv = bom + [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function resolve(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

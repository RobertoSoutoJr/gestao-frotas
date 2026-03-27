import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BRAND = 'FuelTrack';
const FONT_SIZE = { title: 16, subtitle: 11, body: 9 };

function addHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(FONT_SIZE.title);
  doc.setFont('helvetica', 'bold');
  doc.text(BRAND, 14, 18);
  doc.setFontSize(FONT_SIZE.subtitle);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(title, 14, 26);
  if (subtitle) {
    doc.setFontSize(FONT_SIZE.body);
    doc.text(subtitle, 14, 32);
  }
  doc.setDrawColor(200);
  doc.line(14, subtitle ? 35 : 30, pageWidth - 14, subtitle ? 35 : 30);
  doc.setTextColor(0);
  return subtitle ? 40 : 34;
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${BRAND} — Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, pageHeight - 10);
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }
}

function formatCurrencyPlain(val) {
  return `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==================== PDF EXPORTS ====================

export function exportDREtoPDF(dreData, dateRange) {
  const doc = new jsPDF();
  const period = dateRange || 'Periodo completo';
  let y = addHeader(doc, 'DRE Simplificado', period);

  const rows = [
    ['RECEITAS', '', true],
    ['  Frete de viagens', formatCurrencyPlain(dreData.receita)],
    ['DESPESAS OPERACIONAIS (VIAGENS)', '', true],
    ['  Combustivel', formatCurrencyPlain(dreData.custoCombustivel)],
    ['  Pedagio', formatCurrencyPlain(dreData.custoPedagio)],
    ['  Manutencao', formatCurrencyPlain(dreData.custoManutencao)],
    ['  Outros', formatCurrencyPlain(dreData.custoOutros)],
    ['  Subtotal viagens', formatCurrencyPlain(dreData.despesasViagens)],
    ['DESPESAS GERAIS (FROTA)', '', true],
    ['  Abastecimentos', formatCurrencyPlain(dreData.despesasCombGeral)],
    ['  Manutencoes', formatCurrencyPlain(dreData.despesasManGeral)],
    ['  Subtotal frota', formatCurrencyPlain(dreData.despesasGerais)],
    ['', ''],
    ['RESULTADO', formatCurrencyPlain(dreData.lucro)],
    ['Margem', `${dreData.margem.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Valor']],
    body: rows.map(r => [r[0], r[1]]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [94, 106, 210] },
    didParseCell(data) {
      const row = rows[data.row.index];
      if (row && row[2]) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 245];
      }
      if (data.row.index >= rows.length - 2) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  addFooter(doc);
  doc.save(`fueltrack-dre-${Date.now()}.pdf`);
}

export function exportTruckReportToPDF(stats) {
  const doc = new jsPDF('landscape');
  let y = addHeader(doc, 'Relatorio por Caminhao');

  const head = [['Placa', 'Modelo', 'Combustivel', 'Manutencao', 'Total', 'Litros', 'km/l', 'Custo/km', 'Viagens', 'Receita', 'Lucro', 'Margem']];
  const body = stats.map(s => [
    s.truck.placa,
    s.truck.modelo || '-',
    formatCurrencyPlain(s.totalFuel),
    formatCurrencyPlain(s.totalMaintenance),
    formatCurrencyPlain(s.totalSpent),
    s.totalLiters.toFixed(1),
    s.kmPerLiter > 0 ? s.kmPerLiter.toFixed(2) : '-',
    s.costPerKm > 0 ? formatCurrencyPlain(s.costPerKm) : '-',
    s.tripsCount,
    formatCurrencyPlain(s.tripReceita),
    formatCurrencyPlain(s.tripLucro),
    s.tripsCount > 0 ? `${s.tripMargem.toFixed(1)}%` : '-',
  ]);

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [94, 106, 210] },
  });

  addFooter(doc);
  doc.save(`fueltrack-caminhoes-${Date.now()}.pdf`);
}

export function exportDriverReportToPDF(driverStats) {
  const doc = new jsPDF('landscape');
  let y = addHeader(doc, 'Relatorio por Motorista');

  const head = [['Motorista', 'Viagens', 'Km Total', 'Km/Viagem', 'Litros', 'km/l', 'Receita', 'Custos', 'Lucro', 'Margem']];
  const body = driverStats.map(s => [
    s.driver.nome,
    s.viagens,
    s.totalKm.toFixed(0),
    s.avgKmPerTrip.toFixed(0),
    s.litros.toFixed(1),
    s.kmPerLiter > 0 ? s.kmPerLiter.toFixed(2) : '-',
    formatCurrencyPlain(s.receita),
    formatCurrencyPlain(s.custos),
    formatCurrencyPlain(s.lucro),
    s.viagens > 0 ? `${s.margem.toFixed(1)}%` : '-',
  ]);

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [94, 106, 210] },
  });

  addFooter(doc);
  doc.save(`fueltrack-motoristas-${Date.now()}.pdf`);
}

export function exportFuelTableToPDF(fuelRecords, trucks) {
  const doc = new jsPDF('landscape');
  let y = addHeader(doc, 'Abastecimentos Detalhados', `${fuelRecords.length} registros`);

  const head = [['Data', 'Caminhao', 'Posto', 'Litros', 'Preco/L', 'Total', 'KM']];
  const body = fuelRecords
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(r => {
      const truck = trucks.find(t => t.id === r.caminhao_id);
      return [
        new Date(r.created_at).toLocaleDateString('pt-BR'),
        truck?.placa || '-',
        r.posto || '-',
        Number(r.litros).toFixed(2),
        r.litros > 0 ? formatCurrencyPlain(Number(r.valor_total) / Number(r.litros)) : '-',
        formatCurrencyPlain(r.valor_total),
        r.km_registro ? Number(r.km_registro).toFixed(0) : '-',
      ];
    });

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [245, 158, 11] },
  });

  addFooter(doc);
  doc.save(`fueltrack-abastecimentos-${Date.now()}.pdf`);
}

export function exportMaintenanceTableToPDF(maintenanceRecords, trucks) {
  const doc = new jsPDF('landscape');
  let y = addHeader(doc, 'Manutencoes Detalhadas', `${maintenanceRecords.length} registros`);

  const head = [['Data', 'Caminhao', 'Tipo', 'Descricao', 'Oficina', 'Custo', 'KM']];
  const body = maintenanceRecords
    .sort((a, b) => new Date(b.data_manutencao) - new Date(a.data_manutencao))
    .map(r => {
      const truck = trucks.find(t => t.id === r.caminhao_id);
      return [
        new Date(r.data_manutencao).toLocaleDateString('pt-BR'),
        truck?.placa || '-',
        r.tipo_manutencao || '-',
        r.descricao || '-',
        r.oficina || '-',
        formatCurrencyPlain(r.valor_total || r.custo),
        r.km_manutencao ? Number(r.km_manutencao).toFixed(0) : '-',
      ];
    });

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [239, 68, 68] },
  });

  addFooter(doc);
  doc.save(`fueltrack-manutencoes-${Date.now()}.pdf`);
}

// ==================== EXCEL EXPORTS ====================

function createWorkbook() {
  return XLSX.utils.book_new();
}

function addSheet(wb, data, name) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  // Auto-width columns
  const colWidths = data[0].map((_, ci) => {
    let max = 10;
    data.forEach(row => {
      const len = String(row[ci] || '').length;
      if (len > max) max = len;
    });
    return { wch: Math.min(max + 2, 40) };
  });
  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, name);
}

export function exportDREtoExcel(dreData, dateRange) {
  const wb = createWorkbook();
  const data = [
    ['DRE Simplificado — FuelTrack', '', dateRange || 'Periodo completo'],
    [],
    ['Descricao', 'Valor'],
    ['Receita — Frete de viagens', dreData.receita],
    [],
    ['Despesas Operacionais (Viagens)'],
    ['Combustivel', dreData.custoCombustivel],
    ['Pedagio', dreData.custoPedagio],
    ['Manutencao', dreData.custoManutencao],
    ['Outros', dreData.custoOutros],
    ['Subtotal viagens', dreData.despesasViagens],
    [],
    ['Despesas Gerais (Frota)'],
    ['Abastecimentos', dreData.despesasCombGeral],
    ['Manutencoes', dreData.despesasManGeral],
    ['Subtotal frota', dreData.despesasGerais],
    [],
    ['Total Despesas', dreData.despesasTotal],
    ['Resultado (Lucro/Prejuizo)', dreData.lucro],
    ['Margem (%)', dreData.margem.toFixed(1) + '%'],
  ];
  addSheet(wb, data, 'DRE');

  if (dreData.monthlyDre && dreData.monthlyDre.length > 0) {
    const monthly = [['Mes', 'Receita', 'Despesas', 'Lucro']];
    dreData.monthlyDre.forEach(m => monthly.push([m.mes, m.Receita, m.Despesas, m.Lucro]));
    addSheet(wb, monthly, 'Evolucao Mensal');
  }

  XLSX.writeFile(wb, `fueltrack-dre-${Date.now()}.xlsx`);
}

export function exportTruckReportToExcel(stats) {
  const wb = createWorkbook();
  const data = [
    ['Placa', 'Modelo', 'Combustivel', 'Manutencao', 'Total Gasto', 'Litros', 'km/l', 'Custo/km', 'Viagens', 'Receita', 'Custos Viagens', 'Lucro', 'Margem (%)'],
    ...stats.map(s => [
      s.truck.placa,
      s.truck.modelo || '',
      s.totalFuel,
      s.totalMaintenance,
      s.totalSpent,
      Number(s.totalLiters.toFixed(1)),
      s.kmPerLiter > 0 ? Number(s.kmPerLiter.toFixed(2)) : '',
      s.costPerKm > 0 ? Number(s.costPerKm.toFixed(2)) : '',
      s.tripsCount,
      s.tripReceita,
      s.tripCustos,
      s.tripLucro,
      s.tripsCount > 0 ? Number(s.tripMargem.toFixed(1)) : '',
    ]),
  ];
  addSheet(wb, data, 'Caminhoes');
  XLSX.writeFile(wb, `fueltrack-caminhoes-${Date.now()}.xlsx`);
}

export function exportDriverReportToExcel(driverStats) {
  const wb = createWorkbook();
  const data = [
    ['Motorista', 'Viagens', 'Km Total', 'Km/Viagem', 'Litros', 'km/l', 'Receita', 'Custos', 'Lucro', 'Margem (%)'],
    ...driverStats.map(s => [
      s.driver.nome,
      s.viagens,
      Number(s.totalKm.toFixed(0)),
      Number(s.avgKmPerTrip.toFixed(0)),
      Number(s.litros.toFixed(1)),
      s.kmPerLiter > 0 ? Number(s.kmPerLiter.toFixed(2)) : '',
      s.receita,
      s.custos,
      s.lucro,
      s.viagens > 0 ? Number(s.margem.toFixed(1)) : '',
    ]),
  ];
  addSheet(wb, data, 'Motoristas');
  XLSX.writeFile(wb, `fueltrack-motoristas-${Date.now()}.xlsx`);
}

export function exportFuelTableToExcel(fuelRecords, trucks) {
  const wb = createWorkbook();
  const data = [
    ['Data', 'Caminhao', 'Posto', 'Litros', 'Preco/L', 'Total', 'KM'],
    ...fuelRecords
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(r => {
        const truck = trucks.find(t => t.id === r.caminhao_id);
        return [
          new Date(r.created_at).toLocaleDateString('pt-BR'),
          truck?.placa || '',
          r.posto || '',
          Number(r.litros),
          r.litros > 0 ? Number((Number(r.valor_total) / Number(r.litros)).toFixed(2)) : '',
          Number(r.valor_total),
          r.km_registro ? Number(r.km_registro) : '',
        ];
      }),
  ];
  addSheet(wb, data, 'Abastecimentos');
  XLSX.writeFile(wb, `fueltrack-abastecimentos-${Date.now()}.xlsx`);
}

export function exportMaintenanceTableToExcel(maintenanceRecords, trucks) {
  const wb = createWorkbook();
  const data = [
    ['Data', 'Caminhao', 'Tipo', 'Descricao', 'Oficina', 'Custo', 'KM'],
    ...maintenanceRecords
      .sort((a, b) => new Date(b.data_manutencao) - new Date(a.data_manutencao))
      .map(r => {
        const truck = trucks.find(t => t.id === r.caminhao_id);
        return [
          new Date(r.data_manutencao).toLocaleDateString('pt-BR'),
          truck?.placa || '',
          r.tipo_manutencao || '',
          r.descricao || '',
          r.oficina || '',
          Number(r.valor_total || r.custo || 0),
          r.km_manutencao ? Number(r.km_manutencao) : '',
        ];
      }),
  ];
  addSheet(wb, data, 'Manutencoes');
  XLSX.writeFile(wb, `fueltrack-manutencoes-${Date.now()}.xlsx`);
}

// ==================== FULL REPORT ====================

export function exportFullReportToPDF(dreData, stats, driverStats, fuelRecords, maintenanceRecords, trucks, dateRange) {
  const doc = new jsPDF();
  const period = dateRange || 'Periodo completo';

  // Page 1: DRE
  let y = addHeader(doc, 'Relatorio Completo — DRE', period);
  const dreRows = [
    ['Receita de Frete', formatCurrencyPlain(dreData.receita)],
    ['(-) Desp. Combustivel', formatCurrencyPlain(dreData.custoCombustivel)],
    ['(-) Desp. Pedagio', formatCurrencyPlain(dreData.custoPedagio)],
    ['(-) Desp. Manutencao', formatCurrencyPlain(dreData.custoManutencao)],
    ['(-) Desp. Outros', formatCurrencyPlain(dreData.custoOutros)],
    ['(-) Abastecimentos frota', formatCurrencyPlain(dreData.despesasCombGeral)],
    ['(-) Manutencoes frota', formatCurrencyPlain(dreData.despesasManGeral)],
    ['RESULTADO', formatCurrencyPlain(dreData.lucro)],
    ['Margem', `${dreData.margem.toFixed(1)}%`],
  ];
  autoTable(doc, {
    startY: y,
    head: [['Descricao', 'Valor']],
    body: dreRows,
    theme: 'striped',
    styles: { fontSize: 9, font: 'helvetica' },
    headStyles: { fillColor: [94, 106, 210] },
  });

  // Page 2: Caminhoes
  doc.addPage();
  y = addHeader(doc, 'Relatorio Completo — Caminhoes', period);
  autoTable(doc, {
    startY: y,
    head: [['Placa', 'Modelo', 'Comb.', 'Manut.', 'Total', 'Viagens', 'Receita', 'Lucro']],
    body: stats.map(s => [
      s.truck.placa, s.truck.modelo || '',
      formatCurrencyPlain(s.totalFuel), formatCurrencyPlain(s.totalMaintenance),
      formatCurrencyPlain(s.totalSpent), s.tripsCount,
      formatCurrencyPlain(s.tripReceita), formatCurrencyPlain(s.tripLucro),
    ]),
    theme: 'striped',
    styles: { fontSize: 8, font: 'helvetica' },
    headStyles: { fillColor: [94, 106, 210] },
  });

  // Page 3: Motoristas
  if (driverStats && driverStats.length > 0) {
    doc.addPage();
    y = addHeader(doc, 'Relatorio Completo — Motoristas', period);
    autoTable(doc, {
      startY: y,
      head: [['Motorista', 'Viagens', 'KM Total', 'Litros', 'km/l', 'Receita', 'Lucro', 'Margem']],
      body: driverStats.map(s => [
        s.driver.nome, s.viagens, s.totalKm.toFixed(0),
        s.litros.toFixed(1), s.kmPerLiter > 0 ? s.kmPerLiter.toFixed(2) : '—',
        formatCurrencyPlain(s.receita), formatCurrencyPlain(s.lucro),
        s.viagens > 0 ? `${s.margem.toFixed(1)}%` : '—',
      ]),
      theme: 'striped',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [94, 106, 210] },
    });
  }

  // Page 4: Ultimos abastecimentos
  doc.addPage();
  y = addHeader(doc, 'Relatorio Completo — Abastecimentos', period);
  const sortedFuel = [...fuelRecords].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
  autoTable(doc, {
    startY: y,
    head: [['Data', 'Caminhao', 'Litros', 'R$/L', 'Total', 'KM']],
    body: sortedFuel.map(r => {
      const truck = trucks.find(t => t.id === r.caminhao_id);
      return [
        new Date(r.created_at).toLocaleDateString('pt-BR'),
        truck?.placa || '', Number(r.litros).toFixed(1),
        r.litros > 0 ? (Number(r.valor_total) / Number(r.litros)).toFixed(2) : '',
        formatCurrencyPlain(r.valor_total), r.km_registro || '',
      ];
    }),
    theme: 'striped',
    styles: { fontSize: 8, font: 'helvetica' },
    headStyles: { fillColor: [94, 106, 210] },
  });

  addFooter(doc);
  doc.save(`fueltrack-relatorio-completo-${Date.now()}.pdf`);
}

export function exportFullReportToExcel(dreData, stats, driverStats, fuelRecords, maintenanceRecords, trucks, dateRange) {
  const wb = createWorkbook();

  // DRE sheet
  const dreSheet = [
    ['DRE Simplificado', '', dateRange || ''],
    [],
    ['Descricao', 'Valor'],
    ['Receita Frete', dreData.receita],
    ['(-) Combustivel viagens', dreData.custoCombustivel],
    ['(-) Pedagio', dreData.custoPedagio],
    ['(-) Manutencao viagens', dreData.custoManutencao],
    ['(-) Outros', dreData.custoOutros],
    ['= Subtotal desp. viagens', dreData.despesasViagens],
    ['(-) Abastecimentos frota', dreData.despesasCombGeral],
    ['(-) Manutencoes frota', dreData.despesasManGeral],
    ['= Subtotal desp. frota', dreData.despesasGerais],
    [],
    ['RESULTADO', dreData.lucro],
    ['Margem', dreData.margem.toFixed(1) + '%'],
  ];
  addSheet(wb, dreSheet, 'DRE');

  // Trucks sheet
  const truckSheet = [
    ['Placa', 'Modelo', 'Combustivel', 'Manutencao', 'Total', 'Litros', 'km/l', 'Custo/km', 'Viagens', 'Receita', 'Lucro', 'Margem'],
    ...stats.map(s => [
      s.truck.placa, s.truck.modelo || '', s.totalFuel, s.totalMaintenance, s.totalSpent,
      Number(s.totalLiters.toFixed(1)), s.kmPerLiter > 0 ? Number(s.kmPerLiter.toFixed(2)) : '',
      s.costPerKm > 0 ? Number(s.costPerKm.toFixed(2)) : '', s.tripsCount, s.tripReceita, s.tripLucro,
      s.tripsCount > 0 ? Number(s.tripMargem.toFixed(1)) : '',
    ]),
  ];
  addSheet(wb, truckSheet, 'Caminhoes');

  // Drivers sheet
  if (driverStats && driverStats.length > 0) {
    const driverSheet = [
      ['Motorista', 'Viagens', 'Km Total', 'Km/Viagem', 'Litros', 'km/l', 'Receita', 'Custos', 'Lucro', 'Margem'],
      ...driverStats.map(s => [
        s.driver.nome, s.viagens, Number(s.totalKm.toFixed(0)), Number(s.avgKmPerTrip.toFixed(0)),
        Number(s.litros.toFixed(1)), s.kmPerLiter > 0 ? Number(s.kmPerLiter.toFixed(2)) : '',
        s.receita, s.custos, s.lucro, s.viagens > 0 ? Number(s.margem.toFixed(1)) : '',
      ]),
    ];
    addSheet(wb, driverSheet, 'Motoristas');
  }

  // Fuel sheet
  const fuelSheet = [
    ['Data', 'Caminhao', 'Posto', 'Litros', 'Preco/L', 'Total', 'KM'],
    ...fuelRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(r => {
      const truck = trucks.find(t => t.id === r.caminhao_id);
      return [
        new Date(r.created_at).toLocaleDateString('pt-BR'), truck?.placa || '', r.posto || '',
        Number(r.litros), r.litros > 0 ? Number((Number(r.valor_total) / Number(r.litros)).toFixed(2)) : '',
        Number(r.valor_total), r.km_registro ? Number(r.km_registro) : '',
      ];
    }),
  ];
  addSheet(wb, fuelSheet, 'Abastecimentos');

  // Maintenance sheet
  const mainSheet = [
    ['Data', 'Caminhao', 'Tipo', 'Descricao', 'Oficina', 'Custo', 'KM'],
    ...maintenanceRecords.sort((a, b) => new Date(b.data_manutencao) - new Date(a.data_manutencao)).map(r => {
      const truck = trucks.find(t => t.id === r.caminhao_id);
      return [
        new Date(r.data_manutencao).toLocaleDateString('pt-BR'), truck?.placa || '', r.tipo_manutencao || '',
        r.descricao || '', r.oficina || '', Number(r.valor_total || r.custo || 0),
        r.km_manutencao ? Number(r.km_manutencao) : '',
      ];
    }),
  ];
  addSheet(wb, mainSheet, 'Manutencoes');

  XLSX.writeFile(wb, `fueltrack-relatorio-completo-${Date.now()}.xlsx`);
}

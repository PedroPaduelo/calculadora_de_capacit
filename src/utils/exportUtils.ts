import jsPDF from 'jspdf';
import { Scenario, IntervalResult } from '../types';

// Função para exportar dados para CSV
export const exportToCSV = (scenario: Scenario, filename?: string) => {
  if (!scenario.results) {
    throw new Error('Nenhum resultado disponível para exportação');
  }

  const headers = [
    'Horário',
    'Chamadas',
    'Agentes Necessários',
    'Agentes com Shrinkage',
    'Nível de Serviço (%)',
    'Tempo Médio de Espera (s)',
    'Probabilidade de Espera (%)',
    'Taxa de Ocupação (%)',
    'Tráfego (Erlangs)'
  ];

  const csvContent = [
    headers.join(','),
    ...scenario.results.map(result => [
      result.time,
      result.calls,
      result.requiredAgents,
      result.requiredAgentsWithShrinkage,
      result.serviceLevel.toFixed(2),
      result.averageWaitTime.toFixed(2),
      (result.probabilityOfWaiting * 100).toFixed(2),
      result.occupancyRate.toFixed(2),
      result.traffic.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${scenario.name}_resultados.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para exportar relatório em PDF
export const exportToPDF = (scenario: Scenario, filename?: string) => {
  if (!scenario.results) {
    throw new Error('Nenhum resultado disponível para exportação');
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Dimensionamento', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(scenario.name, pageWidth / 2, 30, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 40, { align: 'center' });
  
  // Resumo Executivo
  let yPosition = 55;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Executivo', 20, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const avgServiceLevel = scenario.averageServiceLevel;
  const avgWaitTime = scenario.results.reduce((sum, r) => sum + r.averageWaitTime, 0) / scenario.results.length;
  const avgProbabilityOfWaiting = scenario.results.reduce((sum, r) => sum + r.probabilityOfWaiting, 0) / scenario.results.length;
  const avgOccupancy = scenario.results.reduce((sum, r) => sum + r.occupancyRate, 0) / scenario.results.length;
  const peakAgents = Math.max(...scenario.results.map(r => r.requiredAgentsWithShrinkage));
  
  const summaryText = [
    `FTE Total: ${scenario.totalFTE}`,
    `SLA Médio: ${avgServiceLevel}%`,
    `Pico de Agentes: ${peakAgents}`,
    `Ocupação Média: ${avgOccupancy.toFixed(1)}%`,
    `Prob. de Espera: ${(avgProbabilityOfWaiting * 100).toFixed(1)}%`,
    `Tempo Médio de Espera: ${avgWaitTime.toFixed(0)}s`
  ];
  
  summaryText.forEach((text, index) => {
    pdf.text(`• ${text}`, 25, yPosition + (index * 8));
  });
  
  yPosition += summaryText.length * 8 + 15;
  
  // Parâmetros de Configuração
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Parâmetros de Configuração', 20, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const paramText = [
    `TMA Padrão: ${scenario.serviceParameters.defaultAht}s`,
    `Meta SLA: ${scenario.serviceParameters.serviceLevel}% em ${scenario.serviceParameters.targetAnswerTime}s`,
    `Taxa de Abandono: ${scenario.serviceParameters.abandonmentRate || 0}%`,
    `Shrinkage Total: ${Object.values(scenario.shrinkageConfig).reduce((sum, val) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0).toFixed(1)}%`
  ];
  
  paramText.forEach((text, index) => {
    pdf.text(`• ${text}`, 25, yPosition + (index * 8));
  });
  
  yPosition += paramText.length * 8 + 20;
  
  // Tabela de Resultados Detalhados
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resultados por Intervalo', 20, yPosition);
  
  yPosition += 15;
  
  // Headers da tabela
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  const tableHeaders = ['Horário', 'Chamadas', 'Agentes', 'SLA%', 'Espera(s)', 'Ocupação%'];
  const columnWidths = [25, 25, 25, 25, 30, 30];
  let xPosition = 20;
  
  tableHeaders.forEach((header, index) => {
    pdf.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  yPosition += 10;
  
  // Dados da tabela
  pdf.setFont('helvetica', 'normal');
  scenario.results.slice(0, 25).forEach((result, index) => { // Limitar a 25 linhas para caber na página
    if (yPosition > 270) { // Nova página se necessário
      pdf.addPage();
      yPosition = 20;
    }
    
    xPosition = 20;
    const rowData = [
      result.time,
      result.calls.toString(),
      result.requiredAgentsWithShrinkage.toString(),
      result.serviceLevel.toFixed(1) + '%',
      result.averageWaitTime.toFixed(0) + 's',
      result.occupancyRate.toFixed(1) + '%'
    ];
    
    rowData.forEach((data, colIndex) => {
      pdf.text(data, xPosition, yPosition);
      xPosition += columnWidths[colIndex];
    });
    
    yPosition += 8;
  });
  
  // Rodapé
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pdf.internal.pageSize.height - 10);
    pdf.text('Calculadora de Dimensionamento de Call Center', 20, pdf.internal.pageSize.height - 10);
  }
  
  pdf.save(filename || `${scenario.name}_relatorio.pdf`);
};

// Função para exportar resumo executivo em PDF
export const exportSummaryToPDF = (scenario: Scenario, filename?: string) => {
  if (!scenario.results) {
    throw new Error('Nenhum resultado disponível para exportação');
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header com estilo
  pdf.setFillColor(59, 130, 246); // Blue-600
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMO EXECUTIVO', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(scenario.name, pageWidth / 2, 40, { align: 'center' });
  
  // Reset para texto normal
  pdf.setTextColor(0, 0, 0);
  
  // Métricas principais em cards
  let yPosition = 70;
  const metrics = [
    { label: 'FTE Total', value: scenario.totalFTE.toString(), color: [59, 130, 246] },
    { label: 'SLA Médio', value: `${scenario.averageServiceLevel}%`, color: [34, 197, 94] },
    { label: 'Pico de Agentes', value: Math.max(...scenario.results.map(r => r.requiredAgentsWithShrinkage)).toString(), color: [168, 85, 247] }
  ];
  
  metrics.forEach((metric, index) => {
    const xPos = 30 + (index * 55);
    
    // Card background
    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.rect(xPos, yPosition, 50, 35, 'F');
    
    // Text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(metric.label, xPos + 25, yPosition + 12, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value, xPos + 25, yPosition + 25, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
  });
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 55;
  
  // Conclusões e recomendações
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Conclusões', 20, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const avgWaitTime = scenario.results.reduce((sum, r) => sum + r.averageWaitTime, 0) / scenario.results.length;
  const conclusions = [
    `• Operação requer ${scenario.totalFTE} FTEs para atender ${scenario.serviceParameters.serviceLevel}% em ${scenario.serviceParameters.targetAnswerTime}s`,
    `• Tempo médio de espera projetado: ${avgWaitTime.toFixed(0)} segundos`,
    `• Nível de serviço médio alcançado: ${scenario.averageServiceLevel}%`,
    `• Recomenda-se monitoramento contínuo dos indicadores de performance`
  ];
  
  conclusions.forEach((conclusion, index) => {
    const lines = pdf.splitTextToSize(conclusion, pageWidth - 40);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 6 + 2;
  });
  
  // Footer
  pdf.setFontSize(8);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pdf.internal.pageSize.height - 10);
  
  pdf.save(filename || `${scenario.name}_resumo.pdf`);
};
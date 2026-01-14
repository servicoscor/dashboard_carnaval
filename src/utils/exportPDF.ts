import jsPDF from 'jspdf';
import type { Bloco } from '../types/bloco';
import { getCorSubprefeitura } from '../data/coordenadasBairros';

interface ExportTimelineOptions {
  blocos: Bloco[];
  filename?: string;
  title?: string;
}

// Converte cor hex para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 100, g: 100, b: 100 };
}

export async function exportTimelinePDF({
  blocos,
  filename = 'carnaval-rio-2026-timeline',
  title = 'Carnaval Rio 2026 - Timeline dos Blocos',
}: ExportTimelineOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Cores do tema
  const bgPrimary = { r: 10, g: 22, b: 40 };
  const bgSecondary = { r: 15, g: 36, b: 64 };
  const textWhite = { r: 255, g: 255, b: 255 };

  // Background da página
  pdf.setFillColor(bgPrimary.r, bgPrimary.g, bgPrimary.b);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header
  pdf.setFillColor(bgSecondary.r, bgSecondary.g, bgSecondary.b);
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(textWhite.r, textWhite.g, textWhite.b);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, 12);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 200, 200);
  const dataGeracao = new Date().toLocaleString('pt-BR');
  pdf.text(`Gerado em: ${dataGeracao}`, margin, 19);

  pdf.text(`Total: ${blocos.length} blocos`, pageWidth - margin - 40, 12);

  // Agrupar blocos por data
  const blocosPorData: Record<string, Bloco[]> = {};
  blocos.forEach(bloco => {
    if (bloco.data) {
      if (!blocosPorData[bloco.data]) {
        blocosPorData[bloco.data] = [];
      }
      blocosPorData[bloco.data].push(bloco);
    }
  });

  const datasOrdenadas = Object.keys(blocosPorData).sort();

  // Configurações do timeline
  const timelineStartX = margin + 35;
  const timelineWidth = contentWidth - 35;
  const hourWidth = timelineWidth / 24;
  const barHeight = 4;
  const dayHeaderHeight = 8;
  const rowSpacing = 1;

  let currentY = 30;
  let currentPage = 1;

  // Função para adicionar nova página
  const addNewPage = () => {
    pdf.addPage();
    currentPage++;

    pdf.setFillColor(bgPrimary.r, bgPrimary.g, bgPrimary.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(bgSecondary.r, bgSecondary.g, bgSecondary.b);
    pdf.rect(0, 0, pageWidth, 15, 'F');

    pdf.setTextColor(textWhite.r, textWhite.g, textWhite.b);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, 10);

    pdf.setFontSize(8);
    pdf.text(`Página ${currentPage}`, pageWidth - margin - 20, 10);

    currentY = 20;
  };

  // Desenhar escala de horas
  const drawHourScale = (y: number) => {
    pdf.setFontSize(6);
    pdf.setTextColor(150, 150, 150);
    for (let h = 0; h <= 24; h += 2) {
      const x = timelineStartX + h * hourWidth;
      pdf.text(`${h.toString().padStart(2, '0')}h`, x - 3, y);
    }

    pdf.setDrawColor(50, 50, 70);
    pdf.setLineWidth(0.1);
    for (let h = 0; h <= 24; h += 6) {
      const x = timelineStartX + h * hourWidth;
      pdf.line(x, y + 2, x, y + 100);
    }
  };

  drawHourScale(currentY);
  currentY += 6;

  // Para cada dia
  for (const data of datasOrdenadas) {
    const blocosDodia = blocosPorData[data];

    blocosDodia.sort((a, b) => {
      const horaA = a.horaInicio?.split(':').map(Number) || [0, 0];
      const horaB = b.horaInicio?.split(':').map(Number) || [0, 0];
      return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
    });

    const rowsNeeded = calcularRows(blocosDodia);
    const dayHeight = dayHeaderHeight + rowsNeeded * (barHeight + rowSpacing) + 5;

    if (currentY + dayHeight > pageHeight - 15) {
      addNewPage();
      drawHourScale(currentY);
      currentY += 6;
    }

    // Header do dia
    const dataObj = new Date(data + 'T12:00:00');
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });

    pdf.setFillColor(bgSecondary.r, bgSecondary.g, bgSecondary.b);
    pdf.rect(margin, currentY, contentWidth, dayHeaderHeight, 'F');

    pdf.setTextColor(textWhite.r, textWhite.g, textWhite.b);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1), margin + 2, currentY + 5.5);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${blocosDodia.length} blocos`, margin + 80, currentY + 5.5);

    currentY += dayHeaderHeight + 2;

    // Desenhar blocos
    const rows: { endHour: number }[] = [];

    for (const bloco of blocosDodia) {
      const [startH, startM] = (bloco.horaInicio || '08:00').split(':').map(Number);
      const [endH, endM] = (bloco.horaTermino || '12:00').split(':').map(Number);

      let startHour = startH + startM / 60;
      let endHour = endH + endM / 60;

      if (endHour <= startHour) {
        endHour = Math.min(startHour + 4, 24);
      }

      let rowIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].endHour <= startHour) {
          rowIndex = i;
          rows[i].endHour = endHour;
          break;
        }
        rowIndex = i + 1;
      }

      if (rowIndex >= rows.length) {
        rows.push({ endHour });
      } else {
        rows[rowIndex].endHour = endHour;
      }

      const barX = timelineStartX + startHour * hourWidth;
      const barWidth = Math.max((endHour - startHour) * hourWidth, 3);
      const barY = currentY + rowIndex * (barHeight + rowSpacing);

      const cor = getCorSubprefeitura(bloco.subprefeitura);
      const rgb = hexToRgb(cor);

      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');

      if (barWidth > 15) {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(5);
        const maxChars = Math.floor(barWidth / 1.8);
        const nome = bloco.nome.length > maxChars
          ? bloco.nome.substring(0, maxChars - 2) + '..'
          : bloco.nome;
        pdf.text(nome, barX + 1, barY + 3);
      }
    }

    currentY += rows.length * (barHeight + rowSpacing) + 5;
  }

  // Footer
  const footerY = pageHeight - 8;
  pdf.setFillColor(bgSecondary.r, bgSecondary.g, bgSecondary.b);
  pdf.rect(0, footerY - 2, pageWidth, 10, 'F');

  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(7);
  pdf.text('Centro de Operações Rio - COR', pageWidth / 2, footerY + 2, { align: 'center' });

  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`${filename}-${timestamp}.pdf`);
}

function calcularRows(blocos: Bloco[]): number {
  const rows: { endHour: number }[] = [];

  for (const bloco of blocos) {
    const [startH, startM] = (bloco.horaInicio || '08:00').split(':').map(Number);
    const [endH, endM] = (bloco.horaTermino || '12:00').split(':').map(Number);

    let startHour = startH + startM / 60;
    let endHour = endH + endM / 60;

    if (endHour <= startHour) {
      endHour = Math.min(startHour + 4, 24);
    }

    let rowIndex = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].endHour <= startHour) {
        rowIndex = i;
        rows[i].endHour = endHour;
        break;
      }
      rowIndex = i + 1;
    }

    if (rowIndex >= rows.length) {
      rows.push({ endHour });
    } else {
      rows[rowIndex].endHour = endHour;
    }
  }

  return rows.length;
}

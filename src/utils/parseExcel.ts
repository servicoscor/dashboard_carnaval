import * as XLSX from 'xlsx';
import type { Bloco } from '../types/bloco';
import { getCoordenadasBairro } from '../data/coordenadasBairros';

function parseExcelDate(value: unknown): string {
  if (!value) return '';

  // Se já é string no formato esperado
  if (typeof value === 'string') {
    // Tentar identificar formato DD/MM/YYYY
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    // Já está no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    return value;
  }

  // Se é número (Excel serial date)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    const year = date.y;
    const month = String(date.m).padStart(2, '0');
    const day = String(date.d).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
}

function parseHora(value: unknown): string {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  // Se é número (Excel time fraction)
  if (typeof value === 'number') {
    const totalSeconds = Math.round(value * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return '';
}

// Mapeamento de subprefeitura para zona
function getZonaFromSubprefeitura(subprefeitura: string): string {
  const map: Record<string, string> = {
    'CENTRO': 'CENTRO',
    'ZONA SUL': 'ZONA SUL',
    'GRANDE TIJUCA': 'ZONA NORTE',
    'ZONA NORTE': 'ZONA NORTE',
    'ILHAS': 'ZONA NORTE',
    'ZONA OESTE 1': 'ZONA OESTE',
    'ZONA OESTE 2': 'ZONA OESTE',
    'ZONA OESTE 3': 'ZONA OESTE',
    'BARRA, RECREIO E VARGENS': 'ZONA OESTE',
    'JACAREPAGUÁ': 'ZONA OESTE',
  };
  return map[subprefeitura.toUpperCase()] || 'CENTRO';
}

// Função para encontrar valor em objeto independente de case e acentos
function getValueFromRow(row: Record<string, unknown>, possibleKeys: string[]): unknown {
  const rowKeys = Object.keys(row);

  for (const key of possibleKeys) {
    // Busca exata
    if (row[key] !== undefined) return row[key];

    // Busca case-insensitive
    const foundKey = rowKeys.find(k =>
      k.toLowerCase() === key.toLowerCase() ||
      k.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(k.toLowerCase())
    );
    if (foundKey && row[foundKey] !== undefined) return row[foundKey];
  }

  return undefined;
}

export async function carregarBlocosExcel(url: string): Promise<Bloco[]> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Log para debug - mostrar as colunas encontradas
    if (data.length > 0) {
      console.log('Colunas encontradas no Excel:', Object.keys(data[0] as object));
    }

    return (data as Record<string, unknown>[]).map((row, index) => {
      const bairro = String(getValueFromRow(row, ['Bairro']) || '').toUpperCase();
      const percursoDetalhado = String(getValueFromRow(row, ['Percurso Detalhado', 'Percurso']) || '');

      // Buscar forma de apresentação com diferentes nomes possíveis
      const formaApresentacaoRaw = String(
        getValueFromRow(row, ['Forma de apresentação', 'Forma de apresentacao', 'Forma Apresentação', 'Tipo']) || ''
      ).toUpperCase();

      const formaApresentacao = formaApresentacaoRaw.includes('DESLOCAMENTO')
        ? 'COM DESLOCAMENTO'
        : 'PARADO';

      // Coordenadas do bairro (percurso vem do KMZ separadamente)
      const [lat, lng] = getCoordenadasBairro(bairro);
      const subprefeitura = String(getValueFromRow(row, ['Subprefeitura']) || '').toUpperCase();

      return {
        id: Number(getValueFromRow(row, ['Nº', 'N', 'ID', 'Numero'])) || index + 1,
        nome: String(getValueFromRow(row, ['Nome do Bloco', 'Nome', 'Bloco']) || ''),
        data: parseExcelDate(getValueFromRow(row, ['Data do Desfile', 'Data'])),
        dataRelativa: String(getValueFromRow(row, ['Data Relativa']) || ''),
        bairro,
        subprefeitura,
        regiao: getZonaFromSubprefeitura(subprefeitura),
        publicoEstimado: Number(getValueFromRow(row, ['Público Estimado', 'Publico Estimado', 'Publico'])) || 0,
        localConcentracao: String(getValueFromRow(row, ['Local da Concentração', 'Local da Concentracao', 'Concentração']) || ''),
        horaConcentracao: parseHora(getValueFromRow(row, ['Concentração', 'Concentracao', 'Hr. Concentração'])),
        horaInicio: parseHora(getValueFromRow(row, ['Hr. Início', 'Hr. Inicio', 'Hora Início', 'Inicio'])),
        horaTermino: parseHora(getValueFromRow(row, ['Hr. Término', 'Hr. Termino', 'Hora Término', 'Termino'])),
        percursoDetalhado,
        localDispersao: String(getValueFromRow(row, ['Local da Dispersão', 'Local da Dispersao', 'Dispersão']) || ''),
        formaApresentacao,
        estrutura: String(getValueFromRow(row, ['Estrutura']) || ''),
        situacao: String(getValueFromRow(row, ['Situação do desfile', 'Situacao do desfile', 'Situação', 'Status']) || ''),
        lat,
        lng,
        temPercurso: formaApresentacao === 'COM DESLOCAMENTO',
        percurso: [], // Percurso será carregado do KMZ
      } as Bloco;
    });
  } catch (error) {
    console.error('Erro ao carregar Excel:', error);
    return [];
  }
}

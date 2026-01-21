/**
 * Serviço para consumir a API oficial de Blocos de Rua do Rio de Janeiro
 * https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule
 */

import type { Bloco } from '../types/bloco';

// API COR - retorna todos os blocos cadastrados
const API_URL = 'https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRuaTodos.rule?sys=BLO&id=CORRIO';

// Situações que indicam bloco com CADASTRO EFETIVADO
// Apenas blocos com desfile efetivado serão exibidos no dashboard
const SITUACOES_DESFILE_EFETIVADAS = ['CADASTRO EFETIVADO'];

// Interface do bloco retornado pela API
interface BlocoAPI {
  Inscricao: string;
  Categoria: string;
  UltimoAnoDesfile: number | null;
  NomeBloco: string;
  AnoPrimeiroDesfile: number | null;
  Data: string; // DD/MM/YYYY
  DataRelativa: string;
  InicioDesfile: string; // HH:MM
  TerminoDesfile: string; // HH:MM
  LocalDispersao: string;
  PublicoEstimado: number;
  Bairro: string;
  Regiao: string;
  FormaApresentacao: string; // "PARADO" | "COM DESLOCAMENTO"
  LocalConcentracao: string;
  Concentracao: string; // HH:MM
  Percurso: string; // Separado por |
  HaveraExpMarcaPatrocinador: string;
  NomePatrocinador: string | null;
  LocalExposicaoMarca: string | null;
  AtracaoEspecial: string;
  NomeAtracao: string | null;
  Parecer: string | null;
  Observacao: string | null;
  Estrutura: string;
  EstruturaOutros: string | null;
  SituacaoDesfile: string;
  SituacaoBloco: string;
  Subprefeitura: string;
}

interface APIResponse {
  status: string;
  dados: BlocoAPI[];
}

/**
 * Converte data DD/MM/YYYY para YYYY-MM-DD
 */
function converterData(dataStr: string): string {
  if (!dataStr) return '';
  const [dia, mes, ano] = dataStr.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

/**
 * Verifica se o bloco tem cadastro efetivado
 * Apenas blocos com SituacaoDesfile "CADASTRO EFETIVADO" serão exibidos
 */
function blocoEfetivado(bloco: BlocoAPI): boolean {
  const situacaoDesfile = bloco.SituacaoDesfile?.toUpperCase() || '';
  return SITUACOES_DESFILE_EFETIVADAS.some(s => situacaoDesfile.includes(s));
}

/**
 * Gera um ID numérico único a partir da inscrição
 */
function gerarId(inscricao: string): number {
  // Extrai números da inscrição e usa como ID
  const numeros = inscricao.replace(/\D/g, '');
  return parseInt(numeros, 10) || Math.floor(Math.random() * 100000);
}

/**
 * Converte bloco da API para o formato interno
 */
function converterBloco(blocoAPI: BlocoAPI): Bloco {
  const dataISO = converterData(blocoAPI.Data);

  return {
    id: gerarId(blocoAPI.Inscricao),
    nome: blocoAPI.NomeBloco,
    data: dataISO,
    dataRelativa: blocoAPI.DataRelativa,
    bairro: blocoAPI.Bairro,
    subprefeitura: blocoAPI.Subprefeitura,
    regiao: blocoAPI.Regiao || '', // Zona: ZONA SUL, ZONA NORTE, etc.
    publicoEstimado: blocoAPI.PublicoEstimado || 0,
    localConcentracao: blocoAPI.LocalConcentracao,
    horaConcentracao: blocoAPI.Concentracao,
    horaInicio: blocoAPI.InicioDesfile,
    horaTermino: blocoAPI.TerminoDesfile,
    percursoDetalhado: blocoAPI.Percurso?.replace(/\|/g, ' | ') || '',
    localDispersao: blocoAPI.LocalDispersao,
    formaApresentacao: blocoAPI.FormaApresentacao as 'PARADO' | 'COM DESLOCAMENTO',
    estrutura: blocoAPI.Estrutura,
    situacao: blocoAPI.SituacaoDesfile,
    // Coordenadas serão preenchidas depois (geocoding ou KMZ)
    lat: 0,
    lng: 0,
    temPercurso: false,
    percurso: [], // Será preenchido pelo KMZ
  };
}

/**
 * Carrega blocos da API oficial
 * Retorna apenas blocos com CADASTRO EFETIVADO
 */
export async function carregarBlocosAPI(): Promise<Bloco[]> {
  try {
    console.log('[API] Carregando blocos da API oficial...');

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: APIResponse = await response.json();

    if (data.status !== 'success' || !Array.isArray(data.dados)) {
      throw new Error('Resposta inválida da API');
    }

    console.log(`[API] Total de blocos na API: ${data.dados.length}`);

    // Filtrar apenas blocos com cadastro efetivado
    const blocosEfetivados = data.dados.filter(blocoEfetivado);
    console.log(`[API] Blocos efetivados: ${blocosEfetivados.length}`);

    // Converter para formato interno
    const blocos = blocosEfetivados.map(converterBloco);

    // Log das situações encontradas (para debug)
    const situacoes = new Set(data.dados.map(b => b.SituacaoDesfile));
    console.log('[API] Situações de desfile encontradas:', Array.from(situacoes));

    return blocos;
  } catch (error) {
    console.error('[API] Erro ao carregar blocos:', error);
    throw error;
  }
}

/**
 * Retorna lista de situações efetivadas (para referência)
 */
export function getSituacoesEfetivadas(): string[] {
  return [...SITUACOES_DESFILE_EFETIVADAS];
}

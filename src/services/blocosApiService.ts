/**
 * Serviço para consumir a API oficial de Blocos de Rua do Rio de Janeiro
 * https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule
 */

import type { Bloco } from '../types/bloco';

// API COR - retorna todos os blocos cadastrados
const API_URL = 'https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRuaTodos.rule?sys=BLO&id=CORRIO';

// Situações de bloco aceitas
const SITUACOES_BLOCO_ACEITAS = ['ATIVO'];

// Situações de desfile aceitas (para blocos ATIVOS)
const SITUACOES_DESFILE_ACEITAS = [
  'CADASTRO PRELIMINAR',
  'CADASTRO NÃO EFETIVADO',
  'CADASTRO PRELIMINAR UPLOAD',
  'AUTORIZADO',
  'CADASTRO EFETIVADO'
];

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
 * Verifica se o bloco deve ser exibido no dashboard
 * Critérios:
 * - Bloco ATIVO com CADASTRO PRELIMINAR
 * - Bloco ATIVO com CADASTRO NÃO EFETIVADO
 * - Bloco com CADASTRO PRELIMINAR UPLOAD
 * - Bloco AUTORIZADO
 * - Bloco com CADASTRO EFETIVADO
 */
function blocoAceito(bloco: BlocoAPI): boolean {
  const situacaoDesfile = bloco.SituacaoDesfile?.toUpperCase() || '';
  const situacaoBloco = bloco.SituacaoBloco?.toUpperCase() || '';

  // Verifica se o bloco é ATIVO
  const blocoAtivo = SITUACOES_BLOCO_ACEITAS.some(s => situacaoBloco.includes(s));

  // Verifica se a situação de desfile é aceita
  const desfileAceito = SITUACOES_DESFILE_ACEITAS.some(s => situacaoDesfile.includes(s));

  // Bloco deve ser ATIVO e ter situação de desfile aceita
  return blocoAtivo && desfileAceito;
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
 * Retorna blocos ATIVOS com situações de desfile aceitas
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

    // Filtrar blocos aceitos
    const blocosAceitos = data.dados.filter(blocoAceito);
    console.log(`[API] Blocos aceitos: ${blocosAceitos.length}`);

    // Converter para formato interno
    const blocos = blocosAceitos.map(converterBloco);

    // Log das situações encontradas (para debug)
    const situacoes = new Set(data.dados.map(b => `${b.SituacaoBloco} | ${b.SituacaoDesfile}`));
    console.log('[API] Situações encontradas:', Array.from(situacoes));

    return blocos;
  } catch (error) {
    console.error('[API] Erro ao carregar blocos:', error);
    throw error;
  }
}

/**
 * Retorna lista de situações aceitas (para referência)
 */
export function getSituacoesAceitas(): { bloco: string[]; desfile: string[] } {
  return {
    bloco: [...SITUACOES_BLOCO_ACEITAS],
    desfile: [...SITUACOES_DESFILE_ACEITAS]
  };
}

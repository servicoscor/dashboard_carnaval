/**
 * Serviço para consumir a API oficial de Blocos de Rua do Rio de Janeiro
 * https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule
 */

import type { Bloco } from '../types/bloco';

const API_URL = 'https://jeap.rio.rj.gov.br/BLO/wsBlocoDeRua.rule?sys=BLO&id=blocosderua&ano=2026';

// Situações que indicam bloco AUTORIZADO
// SituacaoBloco: "ATIVO" = cadastro ativo/válido
// SituacaoDesfile: "APROVADO", "DEFERIDO", etc. = desfile autorizado
const SITUACOES_BLOCO_AUTORIZADAS = ['ATIVO'];
const SITUACOES_DESFILE_AUTORIZADAS = ['APROVADO', 'DEFERIDO', 'AUTORIZADO', 'LICENCIADO'];

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
 * Verifica se o bloco está autorizado baseado na situação
 * - SituacaoBloco "ATIVO" = cadastro válido
 * - SituacaoDesfile "APROVADO" = desfile aprovado (quando disponível)
 */
function blocoAutorizado(bloco: BlocoAPI): boolean {
  const situacaoDesfile = bloco.SituacaoDesfile?.toUpperCase() || '';
  const situacaoBloco = bloco.SituacaoBloco?.toUpperCase() || '';

  // Bloco com cadastro ATIVO é considerado autorizado
  const blocoAtivo = SITUACOES_BLOCO_AUTORIZADAS.some(s => situacaoBloco.includes(s));

  // OU se o desfile foi explicitamente aprovado
  const desfileAprovado = SITUACOES_DESFILE_AUTORIZADAS.some(s => situacaoDesfile.includes(s));

  return blocoAtivo || desfileAprovado;
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
 * Retorna apenas blocos AUTORIZADOS
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

    // Filtrar apenas blocos autorizados
    const blocosAutorizados = data.dados.filter(blocoAutorizado);
    console.log(`[API] Blocos autorizados: ${blocosAutorizados.length}`);

    // Converter para formato interno
    const blocos = blocosAutorizados.map(converterBloco);

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
 * Retorna lista de situações autorizadas (para referência)
 */
export function getSituacoesAutorizadas(): { bloco: string[]; desfile: string[] } {
  return {
    bloco: [...SITUACOES_BLOCO_AUTORIZADAS],
    desfile: [...SITUACOES_DESFILE_AUTORIZADAS]
  };
}

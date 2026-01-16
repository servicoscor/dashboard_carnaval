import { useState, useEffect, useCallback } from 'react';
import type { Bloco, PontoPercurso } from '../types/bloco';
import { carregarBlocosExcel } from '../utils/parseExcel';
import { carregarPercursosDoKMZ, normalizarNomeBloco, type PercursoBlocoKMZ } from '../utils/kmzParser';
import { carregarBlocosAPI } from '../services/blocosApiService';
import { dadosMock } from '../data/mockData';
import { getBrasiliaTime } from '../utils/formatters';

type FonteDados = 'api' | 'excel' | 'mock';

// Bloco fake para teste de rotas (apenas em desenvolvimento)
function criarBlocoTesteHoje(): Bloco {
  const hoje = getBrasiliaTime();
  // Formatar data manualmente para evitar conversão UTC do toISOString()
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const hojeStr = `${ano}-${mes}-${dia}`; // YYYY-MM-DD

  return {
    id: 99999,
    nome: '[TESTE] Bloco do Desenvolvedor',
    data: hojeStr,
    dataRelativa: 'Hoje',
    bairro: 'Centro',
    subprefeitura: 'CENTRO',
    publicoEstimado: 1000,
    localConcentracao: 'Praça XV de Novembro',
    horaConcentracao: '14:00',
    horaInicio: '15:00',
    horaTermino: '22:00',
    percursoDetalhado: 'Praça XV | Av. Rio Branco | Cinelândia',
    localDispersao: 'Cinelândia',
    formaApresentacao: 'COM DESLOCAMENTO',
    estrutura: 'Trio elétrico',
    situacao: 'APROVADO',
    lat: -22.9027,
    lng: -43.1778,
    temPercurso: true,
    percurso: [
      { lat: -22.9027, lng: -43.1778, rua: 'Praça XV' },
      { lat: -22.9035, lng: -43.1765, rua: 'Av. Rio Branco' },
      { lat: -22.9100, lng: -43.1755, rua: 'Cinelândia' }
    ]
  };
}

const EXCEL_URL = '/data/PLANILHACOMPLETABLOCOS2026.xlsx';
const KMZ_URL = '/data/percursos/kmz/Carnaval 2026 - Blocos.kmz';

/**
 * Remove prefixos comuns de blocos para matching flexível
 */
function removerPrefixoBloco(nome: string): string {
  return nome
    .replace(/^BLOCO\s+(DO|DA|DE|DOS|DAS)?\s*/i, '')
    .replace(/^BC\s+/i, '')
    .replace(/^GRBC\s+/i, '')
    .replace(/^GRB\s+/i, '')
    .trim();
}

/**
 * Tenta encontrar um percurso KMZ usando múltiplas estratégias de matching
 */
function buscarPercursoKMZ(
  nomeBloco: string,
  percursos: Map<string, PercursoBlocoKMZ>
): PercursoBlocoKMZ | undefined {
  const nomeNorm = normalizarNomeBloco(nomeBloco);

  // Estratégia 1: Match exato
  if (percursos.has(nomeNorm)) {
    return percursos.get(nomeNorm);
  }

  // Estratégia 2: Tentar com prefixo "BLOCO" adicionado
  const comPrefixo = `BLOCO ${nomeNorm}`;
  if (percursos.has(comPrefixo)) {
    return percursos.get(comPrefixo);
  }

  // Estratégia 3: Tentar sem prefixos comuns
  const semPrefixo = removerPrefixoBloco(nomeNorm);
  for (const [chave, percurso] of percursos.entries()) {
    const chaveSemPrefixo = removerPrefixoBloco(chave);
    if (chaveSemPrefixo === semPrefixo) {
      return percurso;
    }
  }

  // Estratégia 4: Match parcial para nomes muito longos (> 20 chars)
  if (nomeNorm.length > 20) {
    const inicio = nomeNorm.substring(0, 20);
    for (const [chave, percurso] of percursos.entries()) {
      if (chave.startsWith(inicio)) {
        return percurso;
      }
    }
  }

  return undefined;
}

export function useBlocos() {
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fonteDados, setFonteDados] = useState<FonteDados>('api');
  const [estatisticasKMZ, setEstatisticasKMZ] = useState<{
    totalBlocos: number;
    blocosComPercurso: number;
    blocosAssociados: number;
  } | null>(null);

  // Função auxiliar para associar percursos KMZ aos blocos
  const associarPercursosKMZ = useCallback((
    blocosBase: Bloco[],
    resultadoKMZ: { percursos: Map<string, PercursoBlocoKMZ>; totalBlocos: number; blocosComPercurso: number }
  ) => {
    let blocosAssociados = 0;

    const blocosComPercursos = blocosBase.map(bloco => {
      const percursoKMZ = buscarPercursoKMZ(bloco.nome, resultadoKMZ.percursos);

      if (percursoKMZ && percursoKMZ.percurso.length >= 2) {
        blocosAssociados++;

        const percurso: PontoPercurso[] = percursoKMZ.percurso.map(p => ({
          lat: p.lat,
          lng: p.lng,
          rua: p.rua
        }));

        const lat = percursoKMZ.pontoConcentracao?.lat ?? bloco.lat;
        const lng = percursoKMZ.pontoConcentracao?.lng ?? bloco.lng;

        return { ...bloco, percurso, lat, lng, temPercurso: true };
      }

      return bloco;
    });

    setEstatisticasKMZ({
      totalBlocos: resultadoKMZ.totalBlocos,
      blocosComPercurso: resultadoKMZ.blocosComPercurso,
      blocosAssociados
    });

    console.log(`[KMZ] Blocos associados: ${blocosAssociados}/${blocosBase.length}`);
    return blocosComPercursos;
  }, []);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Carregar KMZ em paralelo (será usado para qualquer fonte de dados)
    const kmzPromise = carregarPercursosDoKMZ(KMZ_URL).catch(err => {
      console.warn('[KMZ] Erro ao carregar:', err);
      return { percursos: new Map<string, PercursoBlocoKMZ>(), totalBlocos: 0, blocosComPercurso: 0 };
    });

    // 1. TENTAR CARREGAR DA API (apenas blocos autorizados)
    try {
      console.log('[DADOS] Tentando carregar da API...');
      const blocosAPI = await carregarBlocosAPI();

      if (blocosAPI.length > 0) {
        const resultadoKMZ = await kmzPromise;
        const blocosComPercursos = associarPercursosKMZ(blocosAPI, resultadoKMZ);

        // Adicionar bloco de teste
        const blocoTeste = criarBlocoTesteHoje();
        setBlocos([blocoTeste, ...blocosComPercursos]);
        setFonteDados('api');
        setLoading(false);
        console.log(`[DADOS] API: ${blocosAPI.length} blocos autorizados carregados`);
        return;
      }
    } catch (err) {
      console.warn('[DADOS] Falha na API, tentando Excel...', err);
    }

    // 2. FALLBACK: TENTAR CARREGAR DO EXCEL
    try {
      console.log('[DADOS] Tentando carregar do Excel...');
      const blocosExcel = await carregarBlocosExcel(EXCEL_URL);

      if (blocosExcel.length > 0) {
        const resultadoKMZ = await kmzPromise;
        const blocosComPercursos = associarPercursosKMZ(blocosExcel, resultadoKMZ);

        // Adicionar bloco de teste
        const blocoTeste = criarBlocoTesteHoje();
        setBlocos([blocoTeste, ...blocosComPercursos]);
        setFonteDados('excel');
        setError('API indisponível. Usando dados do Excel.');
        setLoading(false);
        console.log(`[DADOS] Excel: ${blocosExcel.length} blocos carregados`);
        return;
      }
    } catch (err) {
      console.warn('[DADOS] Falha no Excel, usando mock...', err);
    }

    // 3. FALLBACK FINAL: USAR DADOS MOCK
    console.log('[DADOS] Usando dados mock...');
    const blocoTeste = criarBlocoTesteHoje();
    setBlocos([blocoTeste, ...dadosMock]);
    setFonteDados('mock');
    setError('API e Excel indisponíveis. Usando dados de demonstração.');
    setLoading(false);
  }, [associarPercursosKMZ]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    blocos,
    loading,
    error,
    fonteDados,
    usandoMock: fonteDados === 'mock', // Compatibilidade
    estatisticasKMZ,
    recarregar: carregarDados,
  };
}

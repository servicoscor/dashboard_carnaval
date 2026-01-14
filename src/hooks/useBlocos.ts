import { useState, useEffect, useCallback } from 'react';
import type { Bloco, PontoPercurso } from '../types/bloco';
import { carregarBlocosExcel } from '../utils/parseExcel';
import { carregarPercursosDoKMZ, normalizarNomeBloco, type PercursoBlocoKMZ } from '../utils/kmzParser';
import { dadosMock } from '../data/mockData';

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
  const [usandoMock, setUsandoMock] = useState(false);
  const [estatisticasKMZ, setEstatisticasKMZ] = useState<{
    totalBlocos: number;
    blocosComPercurso: number;
    blocosAssociados: number;
  } | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar blocos do Excel e percursos do KMZ em paralelo
      const [blocosExcel, resultadoKMZ] = await Promise.all([
        carregarBlocosExcel(EXCEL_URL),
        carregarPercursosDoKMZ(KMZ_URL)
      ]);

      if (blocosExcel.length > 0) {
        let blocosAssociados = 0;

        // Associar percursos aos blocos usando matching flexível
        const blocosComPercursos = blocosExcel.map(bloco => {
          const percursoKMZ = buscarPercursoKMZ(bloco.nome, resultadoKMZ.percursos);

          if (percursoKMZ && percursoKMZ.percurso.length >= 2) {
            blocosAssociados++;

            // Converter PontoPercurso do KMZ para o formato esperado
            const percurso: PontoPercurso[] = percursoKMZ.percurso.map(p => ({
              lat: p.lat,
              lng: p.lng,
              rua: p.rua
            }));

            // Se tem ponto de concentração do KMZ, usar coordenadas dele
            const lat = percursoKMZ.pontoConcentracao?.lat ?? bloco.lat;
            const lng = percursoKMZ.pontoConcentracao?.lng ?? bloco.lng;

            return {
              ...bloco,
              percurso,
              lat,
              lng,
              temPercurso: true
            };
          }

          return bloco;
        });

        setEstatisticasKMZ({
          totalBlocos: resultadoKMZ.totalBlocos,
          blocosComPercurso: resultadoKMZ.blocosComPercurso,
          blocosAssociados
        });

        console.log(`Blocos associados com percursos KMZ: ${blocosAssociados}/${blocosExcel.length}`);

        setBlocos(blocosComPercursos);
        setUsandoMock(false);
      } else {
        // Se nao conseguiu carregar o Excel, usar dados mock
        console.log('Usando dados mock (Excel nao encontrado)');
        setBlocos(dadosMock);
        setUsandoMock(true);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      // Em caso de erro, usar dados mock
      setBlocos(dadosMock);
      setUsandoMock(true);
      setError('Arquivo Excel nao encontrado. Usando dados de demonstracao.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    blocos,
    loading,
    error,
    usandoMock,
    estatisticasKMZ,
    recarregar: carregarDados,
  };
}

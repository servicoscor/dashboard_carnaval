import { useState, useEffect, useCallback } from 'react';
import type { Bloco, PontoPercurso } from '../types/bloco';
import { carregarBlocosExcel } from '../utils/parseExcel';
import { dadosMock } from '../data/mockData';

const EXCEL_URL = '/data/PLANILHACOMPLETABLOCOS2026.xlsx';
const PERCURSOS_URL = '/data/percursos-blocos.json';

interface PercursoGerado {
  nomeBloco: string;
  bairro: string;
  percurso: PontoPercurso[];
}

// Função para normalizar nomes para comparação
function normalizarNome(nome: string): string {
  return nome
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Função para carregar percursos gerados pelo script
async function carregarPercursos(): Promise<Map<string, PontoPercurso[]>> {
  const mapa = new Map<string, PontoPercurso[]>();

  try {
    const response = await fetch(PERCURSOS_URL);
    if (!response.ok) return mapa;

    const percursos: PercursoGerado[] = await response.json();

    for (const p of percursos) {
      const nomeNorm = normalizarNome(p.nomeBloco);
      mapa.set(nomeNorm, p.percurso);
    }

    console.log(`Percursos carregados: ${mapa.size} blocos com rotas reais`);
  } catch (err) {
    console.log('Percursos pré-gerados não encontrados');
  }

  return mapa;
}

export function useBlocos() {
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usandoMock, setUsandoMock] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar percursos gerados em paralelo
      const [blocosExcel, percursosMap] = await Promise.all([
        carregarBlocosExcel(EXCEL_URL),
        carregarPercursos()
      ]);

      if (blocosExcel.length > 0) {
        // Associar percursos aos blocos
        const blocosComPercursos = blocosExcel.map(bloco => {
          const nomeNorm = normalizarNome(bloco.nome);
          const percursoReal = percursosMap.get(nomeNorm);

          if (percursoReal && percursoReal.length >= 2) {
            return { ...bloco, percurso: percursoReal };
          }
          return bloco;
        });

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
    recarregar: carregarDados,
  };
}

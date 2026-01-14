import { useState, useEffect, useCallback } from 'react';
import type { Bloco, PontoPercurso } from '../types/bloco';
import { carregarBlocosExcel } from '../utils/parseExcel';
import { dadosMock } from '../data/mockData';

const EXCEL_URL = '/data/PLANILHACOMPLETABLOCOS2026.xlsx';
const PERCURSOS_KMZ_URL = '/data/percursos-blocos-kmz.json'; // Rotas reais do KMZ (prioridade)
const PERCURSOS_GEOCODED_URL = '/data/percursos-blocos.json'; // Rotas geocodificadas (fallback)

interface PercursoGerado {
  nomeBloco: string;
  bairro?: string;
  percurso: PontoPercurso[];
  distanciaMetros?: number;
  fonte?: string;
}

// Função para normalizar nomes para comparação
function normalizarNome(nome: string): string {
  return nome
    .replace(/&amp;/gi, '&')           // Entidade HTML &amp; -> & (ANTES de toUpperCase)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/&/g, 'E')                // & -> E
    .replace(/[.,!?()]/g, '')          // Remove pontuação
    .replace(/-/g, ' ')                // Hífen -> espaço
    .replace(/\s+/g, ' ')              // Múltiplos espaços -> um
    .trim();
}

// Função para carregar percursos de uma URL
async function carregarPercursosDeURL(url: string): Promise<Map<string, PontoPercurso[]>> {
  const mapa = new Map<string, PontoPercurso[]>();

  try {
    const response = await fetch(url);
    if (!response.ok) return mapa;

    const percursos: PercursoGerado[] = await response.json();

    for (const p of percursos) {
      const nomeNorm = normalizarNome(p.nomeBloco);
      if (p.percurso && p.percurso.length >= 2) {
        mapa.set(nomeNorm, p.percurso);
      }
    }
  } catch (err) {
    // Silencioso - arquivo pode não existir
  }

  return mapa;
}

// Função para carregar percursos (KMZ tem prioridade sobre geocodificado)
async function carregarPercursos(): Promise<Map<string, PontoPercurso[]>> {
  // Carregar ambas as fontes em paralelo
  const [percursosKMZ, percursosGeocoded] = await Promise.all([
    carregarPercursosDeURL(PERCURSOS_KMZ_URL),
    carregarPercursosDeURL(PERCURSOS_GEOCODED_URL),
  ]);

  // Mesclar: KMZ tem prioridade
  const mapaMesclado = new Map<string, PontoPercurso[]>();

  // Primeiro adicionar geocodificados
  for (const [nome, percurso] of percursosGeocoded) {
    mapaMesclado.set(nome, percurso);
  }

  // Sobrescrever com KMZ (prioridade)
  for (const [nome, percurso] of percursosKMZ) {
    mapaMesclado.set(nome, percurso);
  }

  console.log(`Percursos carregados: ${percursosKMZ.size} do KMZ, ${percursosGeocoded.size} geocodificados, ${mapaMesclado.size} total`);

  return mapaMesclado;
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

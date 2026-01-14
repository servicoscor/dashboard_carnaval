import { useState, useEffect, useCallback, useRef } from 'react';
import { carregarKMZ, carregarIndicePercursos, simplificarCoordenadas, type PercursoKMZ, type IndicePercursos } from '../utils/kmzParser';

interface PercursoCache {
  [blocoId: string]: PercursoKMZ | null;
}

interface UsePercursosKMZConfig {
  baseUrl?: string;
  simplificar?: boolean;
  toleranciaSimplificacao?: number;
}

const DEFAULT_CONFIG: UsePercursosKMZConfig = {
  baseUrl: '/data/percursos/kmz',
  simplificar: true,
  toleranciaSimplificacao: 0.00005, // ~5 metros
};

export function usePercursosKMZ(config: UsePercursosKMZConfig = {}) {
  const { baseUrl, simplificar, toleranciaSimplificacao } = { ...DEFAULT_CONFIG, ...config };

  const [indice, setIndice] = useState<IndicePercursos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<PercursoCache>({});
  const loadingRef = useRef<Set<string>>(new Set());

  // Carregar índice de percursos disponíveis
  useEffect(() => {
    async function loadIndice() {
      setLoading(true);
      try {
        const data = await carregarIndicePercursos('/data/percursos/index.json');
        if (data) {
          setIndice(data);
          console.log(`Índice de percursos carregado: ${data.blocos.length} arquivos KMZ disponíveis`);
        } else {
          console.log('Índice de percursos não encontrado - usando percursos aproximados');
        }
      } catch (err) {
        console.error('Erro ao carregar índice de percursos:', err);
        setError('Erro ao carregar índice de percursos KMZ');
      } finally {
        setLoading(false);
      }
    }

    loadIndice();
  }, []);

  // Verificar se um bloco tem KMZ disponível
  const temKMZ = useCallback((blocoId: number): boolean => {
    if (!indice) return false;
    return indice.blocos.some(b => b.id === blocoId);
  }, [indice]);

  // Obter informações do arquivo KMZ de um bloco
  const getInfoKMZ = useCallback((blocoId: number) => {
    if (!indice) return null;
    return indice.blocos.find(b => b.id === blocoId) || null;
  }, [indice]);

  // Carregar percurso KMZ de um bloco específico
  const carregarPercurso = useCallback(async (blocoId: number, nomeBloco: string): Promise<PercursoKMZ | null> => {
    const cacheKey = String(blocoId);

    // Verificar cache
    if (cacheRef.current[cacheKey] !== undefined) {
      return cacheRef.current[cacheKey];
    }

    // Verificar se já está carregando
    if (loadingRef.current.has(cacheKey)) {
      return null;
    }

    // Verificar se tem KMZ disponível
    const info = getInfoKMZ(blocoId);
    if (!info) {
      cacheRef.current[cacheKey] = null;
      return null;
    }

    // Marcar como carregando
    loadingRef.current.add(cacheKey);

    try {
      const url = `${baseUrl}/${info.arquivo}`;
      const percurso = await carregarKMZ(url, cacheKey, nomeBloco);

      if (percurso && simplificar && percurso.coordenadas.length > 50) {
        percurso.coordenadas = simplificarCoordenadas(
          percurso.coordenadas,
          toleranciaSimplificacao
        );
      }

      cacheRef.current[cacheKey] = percurso;
      return percurso;
    } catch (err) {
      console.error(`Erro ao carregar KMZ para bloco ${blocoId}:`, err);
      cacheRef.current[cacheKey] = null;
      return null;
    } finally {
      loadingRef.current.delete(cacheKey);
    }
  }, [baseUrl, getInfoKMZ, simplificar, toleranciaSimplificacao]);

  // Obter percurso do cache (sem carregar)
  const getPercursoCache = useCallback((blocoId: number): PercursoKMZ | null | undefined => {
    return cacheRef.current[String(blocoId)];
  }, []);

  // Pré-carregar múltiplos percursos
  const preCarregarPercursos = useCallback(async (blocos: { id: number; nome: string }[]): Promise<void> => {
    const promises = blocos.map(b => carregarPercurso(b.id, b.nome));
    await Promise.all(promises);
  }, [carregarPercurso]);

  // Limpar cache
  const limparCache = useCallback(() => {
    cacheRef.current = {};
    loadingRef.current.clear();
  }, []);

  // Estatísticas
  const getEstatisticas = useCallback(() => {
    const totalDisponivel = indice?.blocos.length || 0;
    const totalCarregado = Object.keys(cacheRef.current).length;
    const totalComPercurso = Object.values(cacheRef.current).filter(p => p !== null).length;

    return {
      totalDisponivel,
      totalCarregado,
      totalComPercurso,
      porcentagemCarregado: totalDisponivel > 0 ? Math.round((totalCarregado / totalDisponivel) * 100) : 0,
    };
  }, [indice]);

  return {
    indice,
    loading,
    error,
    temKMZ,
    getInfoKMZ,
    carregarPercurso,
    getPercursoCache,
    preCarregarPercursos,
    limparCache,
    getEstatisticas,
  };
}

// Hook simplificado para carregar percurso de um bloco específico
export function usePercursoBloco(
  blocoId: number | null,
  nomeBloco: string,
  percursosKMZ: ReturnType<typeof usePercursosKMZ>
) {
  const [percurso, setPercurso] = useState<PercursoKMZ | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blocoId || !percursosKMZ.temKMZ(blocoId)) {
      setPercurso(null);
      return;
    }

    // Verificar cache primeiro
    const cached = percursosKMZ.getPercursoCache(blocoId);
    if (cached !== undefined) {
      setPercurso(cached);
      return;
    }

    // Carregar percurso
    setLoading(true);
    percursosKMZ.carregarPercurso(blocoId, nomeBloco)
      .then(p => setPercurso(p))
      .finally(() => setLoading(false));
  }, [blocoId, nomeBloco, percursosKMZ]);

  return { percurso, loading };
}

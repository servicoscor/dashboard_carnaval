import { useState, useMemo, useCallback } from 'react';
import type { Bloco, Filtros, Estatisticas } from '../types/bloco';

const FILTROS_INICIAIS: Filtros = {
  data: 'todos',
  subprefeitura: 'todos',
  tipo: 'todos',
  busca: '',
};

export function useFilters(blocos: Bloco[]) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  // Extrair datas unicas disponiveis
  const datasDisponiveis = useMemo(() => {
    const datas = new Set<string>();
    blocos.forEach((bloco) => {
      if (bloco.data) {
        datas.add(bloco.data);
      }
    });
    return Array.from(datas).sort();
  }, [blocos]);

  // Filtrar blocos
  const blocosFiltrados = useMemo(() => {
    return blocos.filter((bloco) => {
      // Filtro por data
      if (filtros.data !== 'todos' && bloco.data !== filtros.data) {
        return false;
      }

      // Filtro por subprefeitura
      if (filtros.subprefeitura !== 'todos' && bloco.subprefeitura !== filtros.subprefeitura) {
        return false;
      }

      // Filtro por tipo
      if (filtros.tipo === 'deslocamento' && bloco.formaApresentacao !== 'COM DESLOCAMENTO') {
        return false;
      }
      if (filtros.tipo === 'parado' && bloco.formaApresentacao !== 'PARADO') {
        return false;
      }

      // Filtro por busca
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nomeNormalizado = bloco.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const bairroNormalizado = bloco.bairro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!nomeNormalizado.includes(termoBusca) && !bairroNormalizado.includes(termoBusca)) {
          return false;
        }
      }

      return true;
    });
  }, [blocos, filtros]);

  // Calcular estatisticas dos blocos filtrados
  const estatisticas = useMemo<Estatisticas>(() => {
    return {
      totalBlocos: blocosFiltrados.length,
      publicoTotal: blocosFiltrados.reduce((acc, bloco) => acc + bloco.publicoEstimado, 0),
      comDeslocamento: blocosFiltrados.filter((b) => b.formaApresentacao === 'COM DESLOCAMENTO').length,
      parados: blocosFiltrados.filter((b) => b.formaApresentacao === 'PARADO').length,
    };
  }, [blocosFiltrados]);

  const resetFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
  }, []);

  return {
    filtros,
    setFiltros,
    blocosFiltrados,
    estatisticas,
    datasDisponiveis,
    resetFiltros,
  };
}

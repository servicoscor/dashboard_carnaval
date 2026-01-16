import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Bloco, Filtros, Estatisticas } from '../types/bloco';
import { getBrasiliaTime } from '../utils/formatters';

const FILTROS_INICIAIS: Filtros = {
  data: 'hoje', // Mudado de 'todos' para 'hoje' como default
  zona: 'todos',
  subprefeitura: 'todos',
  tipo: 'todos',
  busca: '',
};

export function useFilters(blocos: Bloco[]) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  // Obter data de hoje no formato YYYY-MM-DD
  const hojeStr = useMemo(() => {
    const hoje = getBrasiliaTime();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }, []);

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

  // Verificar se há blocos hoje
  const temBlocosHoje = useMemo(() => {
    return blocos.some(b => b.data === hojeStr);
  }, [blocos, hojeStr]);

  // Se não houver blocos hoje, mudar para "todos"
  useEffect(() => {
    if (filtros.data === 'hoje' && !temBlocosHoje && blocos.length > 0) {
      setFiltros(prev => ({ ...prev, data: 'todos' }));
    }
  }, [temBlocosHoje, filtros.data, blocos.length]);

  // Filtrar blocos
  const blocosFiltrados = useMemo(() => {
    return blocos.filter((bloco) => {
      // Filtro por data
      if (filtros.data === 'hoje') {
        // Mostrar apenas blocos de hoje
        if (bloco.data !== hojeStr) {
          return false;
        }
      } else if (filtros.data !== 'todos' && bloco.data !== filtros.data) {
        return false;
      }

      // Filtro por zona (região)
      if (filtros.zona !== 'todos') {
        const zonaBloco = bloco.regiao?.toUpperCase() || '';
        const zonaFiltro = filtros.zona.toUpperCase();
        if (!zonaBloco.includes(zonaFiltro)) {
          return false;
        }
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
  }, [blocos, filtros, hojeStr]);

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
    hojeStr, // Exportar para uso em componentes
    temBlocosHoje, // Exportar para uso em componentes
  };
}

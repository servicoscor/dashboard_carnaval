import { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';
import type { Bloco, Filtros } from '../../types/bloco';
import { SearchInput } from './SearchInput';
import { Filters } from './Filters';
import { formatarDataCurta, formatarDiaSemana } from '../../utils/formatters';

interface SidebarProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  datasDisponiveis: string[];
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar(props: SidebarProps) {
  const {
    blocos,
    blocoSelecionado,
    onSelectBloco,
    filtros,
    onFiltrosChange,
    datasDisponiveis,
    isMobile = false,
    isOpen = false,
    onClose,
  } = props;
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(true);
  const [blocosVisiveis, setBlocosVisiveis] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Agrupar blocos por data para exibição
  const blocosPorData = useMemo(() => {
    const agrupados: Record<string, Bloco[]> = {};

    blocos.forEach((bloco) => {
      if (bloco.data) {
        if (!agrupados[bloco.data]) {
          agrupados[bloco.data] = [];
        }
        agrupados[bloco.data].push(bloco);
      }
    });

    return Object.entries(agrupados)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, blocosDaData]) => ({
        data,
        label: formatarDataCurta(data),
        diaSemana: formatarDiaSemana(data),
        blocos: blocosDaData.sort((a, b) => {
          const timeA = a.horaInicio || '';
          const timeB = b.horaInicio || '';
          return timeA.localeCompare(timeB);
        })
      }));
  }, [blocos]);

  const toggleDate = (data: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(data)) {
        newSet.delete(data);
      } else {
        newSet.add(data);
      }
      return newSet;
    });
  };

  // Verifica se há filtros ativos (diferentes do padrão)
  const temFiltrosAtivos = filtros.data !== 'todos' || filtros.subprefeitura !== 'todos' || filtros.tipo !== 'todos';

  // Versão Mobile - Drawer lateral
  if (isMobile) {
    return (
      <>
        {/* Overlay escuro */}
        <div
          className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ zIndex: 9998 }}
          onClick={onClose}
        />

        {/* Drawer Mobile */}
        <aside
          className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-cor-bg-secondary border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            zIndex: 9999,
            height: '100dvh', // Usar dvh para mobile (dynamic viewport height)
            minHeight: '100vh'
          }}
        >
          {/* Container interno com safe areas */}
          <div
            className="h-full w-full flex flex-col overflow-hidden"
            style={{
              paddingTop: 'max(env(safe-area-inset-top), 0px)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 0px)'
            }}
          >
            {/* Header - fixo no topo */}
            <div className="flex-shrink-0 p-4 border-b border-white/10 bg-cor-bg-secondary">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Blocos de Rua</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Fechar menu"
                >
                  <X size={24} className="text-white/70" />
                </button>
              </div>
              <SearchInput
                value={filtros.busca}
                onChange={(busca) => onFiltrosChange({ ...filtros, busca })}
                placeholder="Buscar bloco..."
              />
            </div>

            {/* Conteúdo scrollável */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ minHeight: 0 }}
            >
              {/* Seção de Filtros */}
              <div className="border-b border-white/10">
              <button
                onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors touch-manipulation min-h-[48px]"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-cor-accent-orange" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wide">
                    Filtros
                  </span>
                  {temFiltrosAtivos && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cor-accent-orange animate-pulse" />
                  )}
                </div>
                {filtrosVisiveis ? (
                  <ChevronUp size={20} className="text-white/50" />
                ) : (
                  <ChevronDown size={20} className="text-white/50" />
                )}
              </button>

              {filtrosVisiveis && (
                <div className="px-4 pb-4">
                  <Filters
                    filtros={filtros}
                    onFiltrosChange={onFiltrosChange}
                    datasDisponiveis={datasDisponiveis}
                  />
                </div>
              )}
            </div>

            {/* Seção de Blocos por Data */}
            {blocosPorData.length > 0 && (
              <div className="border-b border-white/10">
                <button
                  onClick={() => setBlocosVisiveis(!blocosVisiveis)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors touch-manipulation min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-cor-accent-orange" />
                    <span className="text-sm font-semibold text-white uppercase tracking-wide">
                      Blocos por Data
                    </span>
                    <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                      {blocos.length}
                    </span>
                  </div>
                  {blocosVisiveis ? (
                    <ChevronUp size={20} className="text-white/50" />
                  ) : (
                    <ChevronDown size={20} className="text-white/50" />
                  )}
                </button>

                {blocosVisiveis && (
                  <div className="px-3 pb-4">
                    {blocosPorData.map(({ data, label, diaSemana, blocos: blocosDaData }) => {
                      const isExpanded = expandedDates.has(data);

                      return (
                        <div key={data} className="mb-2">
                          {/* Header da data */}
                          <button
                            onClick={() => toggleDate(data)}
                            className="w-full bg-cor-bg-tertiary hover:bg-cor-bg-tertiary/80 rounded-lg px-3 py-3 border border-white/10 transition-all duration-200 touch-manipulation"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown size={16} className="text-cor-accent-orange" />
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-bold text-cor-accent-orange">
                                    {label}
                                  </div>
                                  <div className="text-xs text-white/50 capitalize">
                                    {diaSemana}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-white/70 font-semibold bg-white/10 px-2 py-0.5 rounded">
                                {blocosDaData.length}
                              </div>
                            </div>
                          </button>

                          {/* Lista de blocos expandida */}
                          {isExpanded && (
                            <div className="mt-2 space-y-2 pl-2">
                              {blocosDaData.map((bloco) => {
                                const isSelected = blocoSelecionado?.id === bloco.id;

                                return (
                                  <button
                                    key={bloco.id}
                                    onClick={() => {
                                      onSelectBloco(bloco);
                                      onClose?.();
                                    }}
                                    className={`w-full px-3 py-3 text-left transition-all duration-200 rounded-lg border touch-manipulation ${
                                      isSelected
                                        ? 'bg-cor-accent-orange/20 border-cor-accent-orange'
                                        : 'bg-white/5 border-white/10 active:bg-white/15'
                                    }`}
                                  >
                                    <div className={`text-sm font-medium mb-1 ${
                                      isSelected ? 'text-cor-accent-orange' : 'text-white'
                                    }`}>
                                      {bloco.nome}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                      {bloco.horaInicio && <span>{bloco.horaInicio}</span>}
                                      {bloco.subprefeitura && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{bloco.subprefeitura}</span>
                                        </>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        bloco.formaApresentacao === 'COM DESLOCAMENTO'
                                          ? 'bg-purple-500/20 text-purple-300'
                                          : 'bg-pink-500/20 text-pink-300'
                                      }`}>
                                        {bloco.formaApresentacao === 'COM DESLOCAMENTO' ? 'Deslocamento' : 'Concentração'}
                                      </span>
                                      {bloco.publicoEstimado && (
                                        <span className="text-[10px] text-white/40">
                                          {bloco.publicoEstimado.toLocaleString()} pessoas
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Espaçamento no final */}
            <div className="h-4" />
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Versão Desktop/Tablet - Sidebar fixa com toggle
  return (
    <>
      <aside
        className={`flex-shrink-0 flex flex-col bg-cor-bg-secondary transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-[280px] lg:w-[320px] xl:w-[360px] shadow-[4px_0_24px_rgba(0,0,0,0.3)]' : 'w-0'
        }`}
        style={{ height: '100%', maxHeight: '100%' }}
      >
        {/* Header da sidebar */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-white/10 bg-cor-bg-secondary">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Blocos de Rua</h2>
          </div>
          <SearchInput
            value={filtros.busca}
            onChange={(busca) => onFiltrosChange({ ...filtros, busca })}
            placeholder="Buscar bloco..."
          />
        </div>

        {/* Filtros */}
        <div className="flex-shrink-0 border-b border-white/10">
          <button
            onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
            className="w-full flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-white/5 transition-colors touch-manipulation min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/50" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-wide">
                Filtros
              </span>
              {temFiltrosAtivos && (
                <span className="w-2.5 h-2.5 rounded-full bg-cor-accent-orange" />
              )}
            </div>
            {filtrosVisiveis ? (
              <ChevronUp size={20} className="text-white/50" />
            ) : (
              <ChevronDown size={20} className="text-white/50" />
            )}
          </button>

          {filtrosVisiveis && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <Filters
                filtros={filtros}
                onFiltrosChange={onFiltrosChange}
                datasDisponiveis={datasDisponiveis}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Botão toggle para desktop */}
      <button
        onClick={onClose}
        className={`absolute z-[500] top-1/2 -translate-y-1/2 h-14 flex items-center justify-center transition-all duration-300 rounded-r-md touch-manipulation ${
          isOpen
            ? 'left-[280px] lg:left-[320px] xl:left-[360px] w-6 bg-cor-bg-secondary/90 hover:bg-cor-bg-secondary'
            : 'left-0 w-8 bg-cor-bg-secondary hover:bg-cor-bg-tertiary shadow-md'
        }`}
        title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
      >
        {isOpen ? (
          <ChevronLeft size={18} className="text-white/70" />
        ) : (
          <ChevronRight size={18} className="text-white/70" />
        )}
      </button>
    </>
  );
}

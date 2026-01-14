import { useState } from 'react';
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { Bloco, Filtros } from '../../types/bloco';
import { SearchInput } from './SearchInput';
import { Filters } from './Filters';

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
    filtros,
    onFiltrosChange,
    datasDisponiveis,
    isMobile = false,
    isOpen = false,
    onClose,
  } = props;
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(true);

  // Verifica se há filtros ativos (diferentes do padrão)
  const temFiltrosAtivos = filtros.data !== 'todos' || filtros.subprefeitura !== 'todos' || filtros.tipo !== 'todos';

  // Conteúdo da sidebar (compartilhado entre mobile e desktop)
  const sidebarContent = (
    <>
      {/* Header da sidebar - fixo no topo */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-cor-bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Blocos de Rua</h2>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fechar menu"
            >
              <X size={20} className="text-white/70" />
            </button>
          )}
        </div>
        <SearchInput
          value={filtros.busca}
          onChange={(busca) => onFiltrosChange({ ...filtros, busca })}
          placeholder="Buscar por nome do bloco..."
        />
      </div>

      {/* Filtros - colapsável */}
      <div className="flex-shrink-0 border-b border-white/10">
        {/* Header dos filtros com toggle */}
        <button
          onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/50" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
              Filtros
            </span>
            {temFiltrosAtivos && (
              <span className="w-2 h-2 rounded-full bg-cor-accent-orange" title="Filtros ativos" />
            )}
          </div>
          {filtrosVisiveis ? (
            <ChevronUp size={16} className="text-white/50" />
          ) : (
            <ChevronDown size={16} className="text-white/50" />
          )}
        </button>

        {/* Conteúdo dos filtros */}
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

      {/* Lista de blocos ocultada conforme solicitado */}
    </>
  );

  // Versão Mobile - Drawer lateral
  if (isMobile) {
    return (
      <>
        {/* Overlay escuro */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />

        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-cor-bg-secondary flex flex-col border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Versão Desktop - Sidebar fixa com toggle
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-cor-bg-secondary transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-[380px] shadow-[4px_0_24px_rgba(0,0,0,0.3)]' : 'w-0'
        }`}
        style={{ height: '100%', maxHeight: '100%' }}
      >
        {sidebarContent}
      </aside>

      {/* Botão toggle para desktop - flutuante sobre o mapa */}
      <button
        onClick={onClose}
        className={`absolute z-[500] top-1/2 -translate-y-1/2 h-12 flex items-center justify-center transition-all duration-300 rounded-r-md ${
          isOpen
            ? 'left-[380px] w-5 bg-cor-bg-secondary/90 hover:bg-cor-bg-secondary'
            : 'left-0 w-6 bg-cor-bg-secondary hover:bg-cor-bg-tertiary shadow-md'
        }`}
        title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
      >
        {isOpen ? (
          <ChevronLeft size={16} className="text-white/70" />
        ) : (
          <ChevronRight size={16} className="text-white/70" />
        )}
      </button>
    </>
  );
}

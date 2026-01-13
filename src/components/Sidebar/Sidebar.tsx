import type { Bloco, Filtros } from '../../types/bloco';
import { SearchInput } from './SearchInput';
import { Filters } from './Filters';
import { BlocoList } from './BlocoList';

interface SidebarProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  datasDisponiveis: string[];
}

export function Sidebar({
  blocos,
  blocoSelecionado,
  onSelectBloco,
  filtros,
  onFiltrosChange,
  datasDisponiveis,
}: SidebarProps) {
  return (
    <aside
      className="w-[380px] bg-cor-bg-secondary flex flex-col border-r border-white/10"
      style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}
    >
      {/* Header da sidebar - fixo no topo */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-cor-bg-secondary">
        <h2 className="text-lg font-bold text-white mb-4">Blocos de Rua</h2>
        <SearchInput
          value={filtros.busca}
          onChange={(busca) => onFiltrosChange({ ...filtros, busca })}
          placeholder="Buscar por nome do bloco..."
        />
      </div>

      {/* Filtros - fixo */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <Filters
          filtros={filtros}
          onFiltrosChange={onFiltrosChange}
          datasDisponiveis={datasDisponiveis}
        />
      </div>

      {/* Lista de blocos - área scrollável */}
      <div
        className="flex-1 p-4"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}
      >
        <BlocoList
          blocos={blocos}
          blocoSelecionado={blocoSelecionado}
          onSelectBloco={onSelectBloco}
        />
      </div>
    </aside>
  );
}

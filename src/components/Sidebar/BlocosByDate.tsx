import { useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarDataCurta, formatarDiaSemana } from '../../utils/formatters';

interface BlocosByDateProps {
  blocos: Bloco[];
  onSelectBloco?: (bloco: Bloco) => void;
  blocoSelecionado?: Bloco | null;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function BlocosByDate({
  blocos,
  onSelectBloco,
  blocoSelecionado,
  isOpen = true,
  onClose,
  isMobile = false
}: BlocosByDateProps) {
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
      .map(([data, blocos]) => ({
        data,
        label: formatarDataCurta(data),
        diaSemana: formatarDiaSemana(data),
        blocos: blocos.sort((a, b) => {
          const timeA = a.horaInicio || '';
          const timeB = b.horaInicio || '';
          return timeA.localeCompare(timeB);
        })
      }));
  }, [blocos]);

  if (blocosPorData.length === 0 || isMobile) {
    return null;
  }

  return (
    <>
      {/* Sidebar direito */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-cor-bg-secondary transition-all duration-300 ease-in-out overflow-hidden border-l border-white/10 ${
          isOpen ? 'w-[320px]' : 'w-0'
        }`}
        style={{ height: '100%', maxHeight: '100%' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar size={14} />
              Blocos por Data
            </h3>
            <span className="text-xs text-white/50">
              {blocos.length} {blocos.length === 1 ? 'bloco' : 'blocos'}
            </span>
          </div>
        </div>

        {/* Lista de datas com blocos - scrollável */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {blocosPorData.map(({ data, label, diaSemana, blocos }) => (
            <div key={data} className="border-b border-white/5">
              {/* Header da data */}
              <div className="sticky top-0 bg-cor-bg-tertiary/95 backdrop-blur-sm px-4 py-2 border-b border-white/10 z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-cor-accent-orange">
                      {label}
                    </div>
                    <div className="text-[10px] text-white/50 capitalize">
                      {diaSemana}
                    </div>
                  </div>
                  <div className="text-xs text-white/70">
                    {blocos.length} {blocos.length === 1 ? 'bloco' : 'blocos'}
                  </div>
                </div>
              </div>

              {/* Lista de blocos */}
              <div className="divide-y divide-white/5">
                {blocos.map((bloco) => {
                  const isSelected = blocoSelecionado?.id === bloco.id;

                  return (
                    <button
                      key={bloco.id}
                      onClick={() => onSelectBloco?.(bloco)}
                      className={`w-full px-4 py-3 text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-cor-accent-orange/20 border-l-2 border-cor-accent-orange'
                          : 'hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      {/* Nome do bloco */}
                      <div className={`text-sm font-medium mb-1 line-clamp-2 ${
                        isSelected ? 'text-cor-accent-orange' : 'text-white'
                      }`}>
                        {bloco.nome}
                      </div>

                      {/* Informações */}
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        {bloco.horaInicio && (
                          <span>{bloco.horaInicio}</span>
                        )}
                        {bloco.subprefeitura && (
                          <>
                            <span>•</span>
                            <span>{bloco.subprefeitura}</span>
                          </>
                        )}
                      </div>

                      {/* Tipo e Público */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          bloco.formaApresentacao === 'COM DESLOCAMENTO'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-pink-500/20 text-pink-300'
                        }`}>
                          {bloco.formaApresentacao === 'COM DESLOCAMENTO' ? 'Deslocamento' : 'Concentração'}
                        </span>
                        {bloco.publicoEstimado && (
                          <span className="text-[9px] text-white/40">
                            {bloco.publicoEstimado.toLocaleString()} pessoas
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Botão toggle flutuante */}
      <button
        onClick={onClose}
        className={`absolute z-[500] top-1/2 -translate-y-1/2 h-12 flex items-center justify-center transition-all duration-300 rounded-l-md ${
          isOpen
            ? 'right-[320px] w-5 bg-cor-bg-secondary/90 hover:bg-cor-bg-secondary border-l border-white/10'
            : 'right-0 w-6 bg-cor-bg-secondary hover:bg-cor-bg-tertiary shadow-md border-l border-white/10'
        }`}
        title={isOpen ? 'Ocultar lista de blocos' : 'Mostrar lista de blocos'}
      >
        {isOpen ? (
          <ChevronRight size={16} className="text-white/70" />
        ) : (
          <ChevronLeft size={16} className="text-white/70" />
        )}
      </button>
    </>
  );
}

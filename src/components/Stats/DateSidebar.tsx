import { useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarDataCurta, formatarDiaSemana } from '../../utils/formatters';

interface DateSidebarProps {
  blocos: Bloco[];
  dataSelecionada?: string;
  onSelectData?: (data: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function DateSidebar({
  blocos,
  dataSelecionada,
  onSelectData,
  isOpen = true,
  onClose,
  isMobile = false
}: DateSidebarProps) {
  const distribuicao = useMemo(() => {
    const contagem: Record<string, number> = {};

    blocos.forEach((bloco) => {
      if (bloco.data) {
        contagem[bloco.data] = (contagem[bloco.data] || 0) + 1;
      }
    });

    return Object.entries(contagem)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, count]) => ({
        data,
        count,
        label: formatarDataCurta(data),
        diaSemana: formatarDiaSemana(data),
      }));
  }, [blocos]);

  const maxCount = Math.max(...distribuicao.map((d) => d.count), 1);

  if (distribuicao.length === 0) {
    return null;
  }

  // Mobile: renderiza no rodapé
  if (isMobile) {
    return (
      <div className="bg-cor-bg-secondary border-t-2 border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
            <Calendar size={12} />
            Datas
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {distribuicao.map((item) => {
            const isSelected = dataSelecionada === item.data;

            return (
              <button
                key={item.data}
                onClick={() => {
                  if (onSelectData) {
                    onSelectData(isSelected ? null : item.data);
                  }
                }}
                className={`flex-shrink-0 p-2 rounded-lg border transition-all min-w-[80px] ${
                  isSelected
                    ? 'bg-cor-accent-orange/20 border-cor-accent-orange shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-[10px] font-bold text-white/90">
                  {item.label}
                </div>
                <div className="text-[8px] text-white/50 capitalize mb-1">
                  {item.diaSemana}
                </div>
                <div className="text-sm font-bold text-cor-accent-orange">
                  {item.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop: renderiza como sidebar direito vertical
  return (
    <>
      {/* Sidebar direito */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-cor-bg-secondary transition-all duration-300 ease-in-out overflow-hidden border-l border-white/10 ${
          isOpen ? 'w-[280px]' : 'w-0'
        }`}
        style={{ height: '100%', maxHeight: '100%' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar size={14} />
              Distribuição por Data
            </h3>
          </div>
        </div>

        {/* Lista de datas - scrollável */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-3">
          <div className="space-y-2">
            {distribuicao.map((item) => {
              const isSelected = dataSelecionada === item.data;
              const percentage = (item.count / maxCount) * 100;

              return (
                <button
                  key={item.data}
                  onClick={() => {
                    if (onSelectData) {
                      onSelectData(isSelected ? null : item.data);
                    }
                  }}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-cor-accent-orange/20 to-cor-accent-orange/10 border-cor-accent-orange shadow-lg ring-2 ring-cor-accent-orange/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Data e dia da semana */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-cor-accent-orange' : 'text-white'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-white/50 capitalize">
                        {item.diaSemana}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${isSelected ? 'text-cor-accent-orange' : 'text-white/90'}`}>
                      {item.count}
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cor-accent-orange to-cor-accent-pink'
                          : 'bg-gradient-to-r from-white/30 to-white/20'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Label de blocos */}
                  <div className="text-[10px] text-white/40 mt-1">
                    {item.count} {item.count === 1 ? 'bloco' : 'blocos'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Botão toggle flutuante */}
      <button
        onClick={onClose}
        className={`absolute z-[500] top-1/2 -translate-y-1/2 h-12 flex items-center justify-center transition-all duration-300 rounded-l-md ${
          isOpen
            ? 'right-[280px] w-5 bg-cor-bg-secondary/90 hover:bg-cor-bg-secondary'
            : 'right-0 w-6 bg-cor-bg-secondary hover:bg-cor-bg-tertiary shadow-md'
        }`}
        title={isOpen ? 'Ocultar painel de datas' : 'Mostrar painel de datas'}
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

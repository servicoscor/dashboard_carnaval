import { useMemo } from 'react';
import type { Bloco } from '../../types/bloco';
import { formatarDataCurta } from '../../utils/formatters';
import { useResponsive } from '../../hooks';

interface DateDistributionChartProps {
  blocos: Bloco[];
  dataSelecionada?: string;
  onSelectData?: (data: string | null) => void;
}

export function DateDistributionChart({ blocos, dataSelecionada, onSelectData }: DateDistributionChartProps) {
  const { isMobile } = useResponsive();

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
      }));
  }, [blocos]);

  const maxCount = Math.max(...distribuicao.map((d) => d.count), 1);

  if (distribuicao.length === 0) {
    return null;
  }

  // Classes responsivas
  const containerClasses = isMobile
    ? 'bg-cor-bg-secondary border-t-2 border-white/10 px-3 py-3'
    : 'bg-cor-bg-secondary border-t border-white/10 px-6 py-4';

  const chartHeight = isMobile ? 'h-12' : 'h-16';
  const barMinWidth = isMobile ? 'min-w-[28px]' : 'min-w-[32px]';
  const barWidth = isMobile ? 'w-5' : 'w-6';
  const maxBarHeight = isMobile ? 40 : 48;

  return (
    <div className={containerClasses}>
      {!isMobile && (
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">
          Distribuicao por Data
        </h3>
      )}

      {/* Container com gradientes de fade nas laterais */}
      <div className="relative">
        {/* Gradientes de fade - aparecem quando há scroll horizontal */}
        {distribuicao.length > 7 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-cor-bg-secondary to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-cor-bg-secondary to-transparent pointer-events-none z-10" />
          </>
        )}

        <div
          className={`flex items-end gap-1.5 ${chartHeight} overflow-x-auto pb-2 scrollbar-thin`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 107, 53, 0.3) transparent'
          }}
        >
          {distribuicao.map((item) => {
            const isSelected = dataSelecionada === item.data;
            return (
              <div
                key={item.data}
                className={`flex flex-col items-center gap-1 ${barMinWidth} cursor-pointer group flex-shrink-0`}
                onClick={() => {
                  if (onSelectData) {
                    onSelectData(isSelected ? null : item.data);
                  }
                }}
              >
                {/* Badge com contagem quando selecionado em mobile */}
                {isMobile && isSelected && (
                  <span className="text-[9px] font-bold text-cor-accent-green mb-1">
                    {item.count}
                  </span>
                )}

                <div
                  className={`${barWidth} rounded-t transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-cor-accent-green to-cor-accent-green/80 ring-2 ring-cor-accent-green shadow-lg shadow-cor-accent-green/50'
                      : 'bg-gradient-to-t from-cor-accent-orange to-cor-accent-pink group-hover:from-cor-accent-orange/80 group-hover:to-cor-accent-pink/80 group-active:scale-95'
                  }`}
                  style={{
                    height: `${(item.count / maxCount) * maxBarHeight}px`,
                    minHeight: '6px',
                  }}
                  title={`${item.label}: ${item.count} blocos - Clique para filtrar`}
                />

                {/* Label da data */}
                {isMobile ? (
                  <span className={`text-[8px] transition-colors whitespace-nowrap ${
                    isSelected ? 'text-cor-accent-green font-bold' : 'text-white/40'
                  }`}>
                    {item.label.split('/')[0]}
                  </span>
                ) : (
                  <span className={`text-[9px] rotate-45 origin-left whitespace-nowrap transition-colors ${
                    isSelected ? 'text-cor-accent-green font-semibold' : 'text-white/40 group-hover:text-white/60'
                  }`}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

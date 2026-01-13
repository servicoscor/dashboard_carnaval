import { useMemo } from 'react';
import type { Bloco } from '../../types/bloco';
import { formatarDataCurta } from '../../utils/formatters';

interface DateDistributionChartProps {
  blocos: Bloco[];
  dataSelecionada?: string;
  onSelectData?: (data: string | null) => void;
}

export function DateDistributionChart({ blocos, dataSelecionada, onSelectData }: DateDistributionChartProps) {
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

  return (
    <div className="bg-cor-bg-secondary border-t border-white/10 px-6 py-4">
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">
        Distribuicao por Data
      </h3>
      <div className="flex items-end gap-1 h-16 overflow-x-auto pb-1">
        {distribuicao.map((item) => {
          const isSelected = dataSelecionada === item.data;
          return (
            <div
              key={item.data}
              className="flex flex-col items-center gap-1 min-w-[32px] cursor-pointer group"
              onClick={() => {
                if (onSelectData) {
                  onSelectData(isSelected ? null : item.data);
                }
              }}
            >
              <div
                className={`w-6 rounded-t transition-all ${
                  isSelected
                    ? 'bg-gradient-to-t from-cor-accent-green to-cor-accent-green ring-2 ring-cor-accent-green ring-offset-1 ring-offset-cor-bg-secondary'
                    : 'bg-gradient-to-t from-cor-accent-orange to-cor-accent-pink group-hover:from-cor-accent-orange/80 group-hover:to-cor-accent-pink/80'
                }`}
                style={{
                  height: `${(item.count / maxCount) * 48}px`,
                  minHeight: '4px',
                }}
                title={`${item.label}: ${item.count} blocos - Clique para filtrar`}
              />
              <span className={`text-[9px] rotate-45 origin-left whitespace-nowrap transition-colors ${
                isSelected ? 'text-cor-accent-green font-semibold' : 'text-white/40 group-hover:text-white/60'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

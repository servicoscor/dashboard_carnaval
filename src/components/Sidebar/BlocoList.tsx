import { useMemo } from 'react';
import { Users, Clock, MapPin, Route } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarNumero, formatarHora, formatarDataCurta, formatarDiaSemana } from '../../utils/formatters';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';

interface BlocoListProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
}

interface GrupoBlocos {
  data: string;
  dataRelativa: string;
  blocos: Bloco[];
}

export function BlocoList({ blocos, blocoSelecionado, onSelectBloco }: BlocoListProps) {
  // Agrupar blocos por data
  const gruposPorData = useMemo(() => {
    const grupos: Record<string, GrupoBlocos> = {};

    blocos.forEach((bloco) => {
      if (!grupos[bloco.data]) {
        grupos[bloco.data] = {
          data: bloco.data,
          dataRelativa: bloco.dataRelativa,
          blocos: [],
        };
      }
      grupos[bloco.data].blocos.push(bloco);
    });

    // Ordenar grupos por data e blocos por horário
    return Object.values(grupos)
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((grupo) => ({
        ...grupo,
        blocos: grupo.blocos.sort((a, b) =>
          (a.horaInicio || '').localeCompare(b.horaInicio || '')
        ),
      }));
  }, [blocos]);

  if (blocos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/50">
        <p className="text-sm">Nenhum bloco encontrado</p>
        <p className="text-xs mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gruposPorData.map((grupo) => (
        <div key={grupo.data}>
          {/* Header do grupo (data) */}
          <div className="sticky top-0 bg-cor-bg-secondary/95 backdrop-blur-sm py-2 px-1 -mx-1 z-10 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cor-accent-orange">
                  {formatarDataCurta(grupo.data)}
                </span>
                <span className="text-xs text-white/50 ml-2 capitalize">
                  {formatarDiaSemana(grupo.data)}
                </span>
              </div>
              <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">
                {grupo.blocos.length} blocos
              </span>
            </div>
            {grupo.dataRelativa && (
              <p className="text-[10px] text-white/40 mt-0.5">{grupo.dataRelativa}</p>
            )}
          </div>

          {/* Lista de blocos do grupo */}
          <div className="space-y-2 mt-2">
            {grupo.blocos.map((bloco) => (
              <BlocoCard
                key={bloco.id}
                bloco={bloco}
                isSelected={blocoSelecionado?.id === bloco.id}
                onSelect={() => onSelectBloco(bloco)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface BlocoCardProps {
  bloco: Bloco;
  isSelected: boolean;
  onSelect: () => void;
}

function BlocoCard({ bloco, isSelected, onSelect }: BlocoCardProps) {
  const cor = getCorSubprefeitura(bloco.subprefeitura);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-white/10 ring-2 ring-cor-accent-orange'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Indicador de cor da subprefeitura */}
        <div
          className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
          style={{ backgroundColor: cor }}
        />

        <div className="flex-1 min-w-0">
          {/* Nome do bloco */}
          <h4 className="text-sm font-medium text-white truncate pr-2">
            {bloco.nome}
          </h4>

          {/* Info secundária */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {bloco.bairro}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatarHora(bloco.horaInicio)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={10} />
              {formatarNumero(bloco.publicoEstimado)}
            </span>
          </div>

          {/* Badge se tem percurso */}
          {bloco.temPercurso && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-cor-accent-green bg-cor-accent-green/10 px-2 py-0.5 rounded">
                <Route size={10} />
                Com deslocamento
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

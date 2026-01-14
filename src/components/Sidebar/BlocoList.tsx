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
    <div className="space-y-6 pb-4">
      {gruposPorData.map((grupo, grupoIndex) => (
        <div key={grupo.data} className="scroll-mt-2">
          {/* Header do grupo (data) - sticky melhorado */}
          <div className="sticky top-0 bg-gradient-to-b from-cor-bg-secondary via-cor-bg-secondary to-cor-bg-secondary/95 backdrop-blur-sm py-2.5 px-2 -mx-2 z-20 border-b-2 border-cor-accent-orange/30 mb-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-cor-accent-orange rounded-full shadow-sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-cor-accent-orange">
                      {formatarDataCurta(grupo.data)}
                    </span>
                    <span className="text-xs text-white/60 capitalize">
                      {formatarDiaSemana(grupo.data)}
                    </span>
                  </div>
                  {grupo.dataRelativa && (
                    <p className="text-[10px] text-white/50 mt-0.5">{grupo.dataRelativa}</p>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-white/70 bg-cor-accent-orange/20 px-2.5 py-1 rounded-full font-semibold border border-cor-accent-orange/30">
                {grupo.blocos.length}
              </span>
            </div>
          </div>

          {/* Lista de blocos do grupo */}
          <div className="space-y-2.5">
            {grupo.blocos.map((bloco) => (
              <BlocoCard
                key={bloco.id}
                bloco={bloco}
                isSelected={blocoSelecionado?.id === bloco.id}
                onSelect={() => onSelectBloco(bloco)}
              />
            ))}
          </div>

          {/* Separador entre grupos - exceto no último */}
          {grupoIndex < gruposPorData.length - 1 && (
            <div className="mt-6 border-t border-white/5" />
          )}
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
      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-white/15 to-white/10 ring-2 ring-cor-accent-orange shadow-lg scale-[1.02]'
          : 'bg-white/5 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Indicador de cor da subprefeitura */}
        <div
          className={`w-1.5 h-full min-h-[50px] rounded-full flex-shrink-0 transition-all ${
            isSelected ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: cor,
            boxShadow: isSelected ? `0 0 8px ${cor}` : 'none'
          }}
        />

        <div className="flex-1 min-w-0">
          {/* Nome do bloco */}
          <h4 className={`text-sm font-medium truncate pr-2 transition-colors ${
            isSelected ? 'text-white' : 'text-white/90'
          }`}>
            {bloco.nome}
          </h4>

          {/* Info secundária */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} />
              <span className="truncate max-w-[100px]">{bloco.bairro}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {formatarHora(bloco.horaInicio)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={11} />
              {formatarNumero(bloco.publicoEstimado)}
            </span>
          </div>

          {/* Badge se tem percurso */}
          {bloco.temPercurso && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-cor-accent-green bg-cor-accent-green/15 border border-cor-accent-green/20 px-2 py-1 rounded-md font-medium">
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

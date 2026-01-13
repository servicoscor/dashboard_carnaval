import { Music, Users, Route, MapPin, Play, Square, SkipForward } from 'lucide-react';
import type { Bloco, Estatisticas } from '../../types/bloco';
import { formatarNumero } from '../../utils/formatters';

interface TourState {
  ativo: boolean;
  index: number;
  bloco: Bloco | null;
  tempoRestante: number;
  totalBlocos: number;
}

interface HeaderProps {
  estatisticas: Estatisticas;
  totalBlocosOriginal: number;
  tourState: TourState;
  onTourStart: () => void;
  onTourStop: () => void;
  onTourNext: () => void;
}

export function Header({
  estatisticas,
  totalBlocosOriginal,
  tourState,
  onTourStart,
  onTourStop,
  onTourNext,
}: HeaderProps) {
  const isFiltered = estatisticas.totalBlocos !== totalBlocosOriginal;

  return (
    <header className="bg-cor-bg-secondary border-b border-white/10 px-6 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Logo COR - Esquerda */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/data/RIOPREFEITURA COR horizontal monocromatica branco.png"
            alt="COR - Centro de Operacoes Rio"
            className="h-10 w-auto"
          />
        </div>

        {/* Titulo Central */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Carnaval Rio 2026
          </h1>
          <p className="text-xs text-white/50">
            Dashboard de Blocos
          </p>
        </div>

        {/* Stats Pills + Tour - Direita */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatPill
            icon={<MapPin size={14} />}
            label="Blocos"
            value={estatisticas.totalBlocos}
            subValue={isFiltered ? `de ${totalBlocosOriginal}` : undefined}
            color="orange"
          />
          <StatPill
            icon={<Users size={14} />}
            label="Publico"
            value={formatarNumero(estatisticas.publicoTotal)}
            color="green"
          />
          <StatPill
            icon={<Route size={14} />}
            label="Deslocamento"
            value={estatisticas.comDeslocamento}
            subValue={`${Math.round((estatisticas.comDeslocamento / (estatisticas.totalBlocos || 1)) * 100)}%`}
            color="purple"
          />
          <StatPill
            icon={<Music size={14} />}
            label="Parados"
            value={estatisticas.parados}
            subValue={`${Math.round((estatisticas.parados / (estatisticas.totalBlocos || 1)) * 100)}%`}
            color="pink"
          />

          {/* Separador */}
          <div className="w-px h-10 bg-white/10" />

          {/* Botão Tour */}
          {!tourState.ativo ? (
            <button
              onClick={onTourStart}
              disabled={estatisticas.totalBlocos === 0}
              className="flex items-center gap-2 px-4 py-2 bg-cor-accent-green/20 text-cor-accent-green border border-cor-accent-green/30 rounded-lg hover:bg-cor-accent-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Iniciar tour automático pelos blocos"
            >
              <Play size={16} />
              <span className="font-semibold text-sm">Tour</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cor-accent-green/10 border border-cor-accent-green/30 rounded-lg">
              {/* Info do tour */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cor-accent-green rounded-full animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/60">
                    {tourState.index + 1}/{tourState.totalBlocos}
                  </span>
                  <span className="text-xs font-semibold text-cor-accent-green max-w-[100px] truncate" title={tourState.bloco?.nome}>
                    {tourState.bloco?.nome || 'Carregando...'}
                  </span>
                </div>
              </div>

              {/* Tempo restante */}
              <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded">
                <span className="text-xs text-white/70 font-mono">{tourState.tempoRestante}s</span>
              </div>

              {/* Botões de controle */}
              <button
                onClick={onTourNext}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Próximo bloco"
              >
                <SkipForward size={14} className="text-white/70" />
              </button>
              <button
                onClick={onTourStop}
                className="p-1.5 hover:bg-cor-accent-pink/20 rounded transition-colors"
                title="Parar tour"
              >
                <Square size={14} className="text-cor-accent-pink" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'orange' | 'green' | 'purple' | 'pink';
}

function StatPill({ icon, label, value, subValue, color }: StatPillProps) {
  const colorClasses = {
    orange: 'bg-cor-accent-orange/10 text-cor-accent-orange border-cor-accent-orange/20',
    green: 'bg-cor-accent-green/10 text-cor-accent-green border-cor-accent-green/20',
    purple: 'bg-cor-accent-purple/10 text-cor-accent-purple border-cor-accent-purple/20',
    pink: 'bg-cor-accent-pink/10 text-cor-accent-pink border-cor-accent-pink/20',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClasses[color]}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide opacity-70">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold">{value}</span>
          {subValue && (
            <span className="text-[10px] opacity-60">{subValue}</span>
          )}
        </div>
      </div>
    </div>
  );
}

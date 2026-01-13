import { Music, Users, Route, MapPin } from 'lucide-react';
import type { Estatisticas } from '../../types/bloco';
import { formatarNumero } from '../../utils/formatters';

interface HeaderProps {
  estatisticas: Estatisticas;
  totalBlocosOriginal: number;
}

export function Header({ estatisticas, totalBlocosOriginal }: HeaderProps) {
  const isFiltered = estatisticas.totalBlocos !== totalBlocosOriginal;

  return (
    <header className="bg-cor-bg-secondary border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo e Titulo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cor-accent-orange to-cor-accent-pink flex items-center justify-center">
              <Music className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Carnaval Rio 2026
              </h1>
              <p className="text-xs text-white/50">
                Dashboard de Blocos - COR JARVIS
              </p>
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
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

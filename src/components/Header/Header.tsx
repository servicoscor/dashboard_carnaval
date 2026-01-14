import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Users, Route, MapPin, Play, Square, SkipForward, Menu, Info, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import type { Bloco, Estatisticas } from '../../types/bloco';
import { formatarNumero } from '../../utils/formatters';
import { coresSubprefeitura } from '../../data/coordenadasBairros';
import { AlertaBadge } from '../Alertas';

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
  isMobile?: boolean;
  onMenuClick?: () => void;
  alertasCount?: number;
  alertasHighPriority?: boolean;
  onAlertasClick?: () => void;
}

export function Header({
  estatisticas,
  totalBlocosOriginal,
  tourState,
  onTourStart,
  onTourStop,
  onTourNext,
  isMobile = false,
  onMenuClick,
  alertasCount = 0,
  alertasHighPriority = false,
  onAlertasClick,
}: HeaderProps) {
  const isFiltered = estatisticas.totalBlocos !== totalBlocosOriginal;
  const [legendaVisivel, setLegendaVisivel] = useState(false);

  // Versão Mobile
  if (isMobile) {
    return (
      <header className="bg-cor-bg-secondary border-b border-white/10 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Menu hamburger */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={24} className="text-white" />
          </button>

          {/* Logo menor */}
          <img
            src="/data/RIOPREFEITURA COR horizontal monocromatica branco.png"
            alt="COR"
            className="h-7 w-auto"
          />

          {/* Stats compactos - só números */}
          <div className="flex items-center gap-2">
            <CompactStat icon={<MapPin size={12} />} value={estatisticas.totalBlocos} color="orange" />
            <CompactStat icon={<Users size={12} />} value={formatarNumero(estatisticas.publicoTotal)} color="green" />
          </div>

          {/* Tour compacto */}
          {!tourState.ativo ? (
            <button
              onClick={onTourStart}
              disabled={estatisticas.totalBlocos === 0}
              className="p-2 bg-cor-accent-green/20 text-cor-accent-green border border-cor-accent-green/30 rounded-lg disabled:opacity-50"
              title="Tour"
            >
              <Play size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-cor-accent-green/10 border border-cor-accent-green/30 rounded-lg">
              <div className="w-2 h-2 bg-cor-accent-green rounded-full animate-pulse" />
              <span className="text-xs text-white/70 font-mono">{tourState.tempoRestante}s</span>
              <button onClick={onTourNext} className="p-1 hover:bg-white/10 rounded">
                <SkipForward size={12} className="text-white/70" />
              </button>
              <button onClick={onTourStop} className="p-1 hover:bg-cor-accent-pink/20 rounded">
                <Square size={12} className="text-cor-accent-pink" />
              </button>
            </div>
          )}

          {/* Alertas Badge */}
          {onAlertasClick && (
            <AlertaBadge
              count={alertasCount}
              hasHighPriority={alertasHighPriority}
              onClick={onAlertasClick}
            />
          )}
        </div>
      </header>
    );
  }

  // Versão Desktop
  return (
    <header className="bg-cor-bg-secondary border-b border-white/10 relative">
      {/* Linha principal do header */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo COR - Esquerda */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/data/RIOPREFEITURA COR horizontal monocromatica branco.png"
            alt="COR - Centro de Operacoes Rio"
            className="h-10 w-auto"
          />
          {/* Botão Legenda */}
          <button
            onClick={() => setLegendaVisivel(!legendaVisivel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              legendaVisivel
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80'
            }`}
            title={legendaVisivel ? 'Ocultar legenda' : 'Mostrar legenda'}
          >
            <Info size={14} />
            <span className="text-xs font-medium">Legenda</span>
            {legendaVisivel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Botão Timeline */}
          <Link
            to="/timeline"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors"
            title="Ver timeline dos blocos"
          >
            <Calendar size={14} />
            <span className="text-xs font-medium">Timeline</span>
          </Link>
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

          {/* Alertas Badge */}
          {onAlertasClick && (
            <AlertaBadge
              count={alertasCount}
              hasHighPriority={alertasHighPriority}
              onClick={onAlertasClick}
            />
          )}
        </div>
      </div>

      {/* Legenda expansível */}
      {legendaVisivel && (
        <div className="px-6 py-3 border-t border-white/10 bg-cor-bg-primary/50">
          <div className="flex flex-wrap items-start gap-8">
            {/* Subprefeituras */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Subprefeituras
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(coresSubprefeitura).map(([nome, cor]) => (
                  <div key={nome} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cor }}
                    />
                    <span className="text-[11px] text-white/60 truncate max-w-[120px]">{nome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de Bloco */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Tipos de Bloco
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cor-accent-orange flex-shrink-0" />
                  <span className="text-[11px] text-white/60">Com deslocamento (círculo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-cor-accent-pink flex-shrink-0" />
                  <span className="text-[11px] text-white/60">Parado (quadrado)</span>
                </div>
              </div>
            </div>

            {/* Percurso */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Percurso
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 border-t-2 border-dashed border-white/40" />
                  <span className="text-[11px] text-white/60">Trajeto do bloco</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-[11px] text-white/60">Início (I)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 flex-shrink-0" />
                  <span className="text-[11px] text-white/60">Fim (F)</span>
                </div>
              </div>
            </div>

            {/* Câmeras */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Câmeras
              </h4>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-[11px] text-white/60">Câmera próxima (300m)</span>
              </div>
            </div>

            {/* Nota */}
            <div className="text-[10px] text-white/40 italic self-end">
              Tamanho do marcador = público estimado
            </div>
          </div>
        </div>
      )}
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

// Componente compacto para mobile - só ícone e valor
interface CompactStatProps {
  icon: React.ReactNode;
  value: string | number;
  color: 'orange' | 'green' | 'purple' | 'pink';
}

function CompactStat({ icon, value, color }: CompactStatProps) {
  const colorClasses = {
    orange: 'text-cor-accent-orange',
    green: 'text-cor-accent-green',
    purple: 'text-cor-accent-purple',
    pink: 'text-cor-accent-pink',
  };

  return (
    <div className={`flex items-center gap-1 ${colorClasses[color]}`}>
      {icon}
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

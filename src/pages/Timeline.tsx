import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Calendar, FileDown, Loader2, Clock, Play, Pause } from 'lucide-react';
import { useBlocos } from '../hooks';
import { getCorSubprefeitura } from '../data/coordenadasBairros';
import { exportTimelinePDF } from '../utils/exportPDF';
import type { Bloco } from '../types/bloco';

// Configurações do timeline
const HOUR_WIDTH_BASE = 60; // Largura base de 1 hora em pixels
const ROW_HEIGHT = 32;

// Hook para obter horário de Brasília
function useBrasiliaTime() {
  const [now, setNow] = useState(() => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })));
    }, 1000); // Atualiza a cada segundo para o modo esteira

    return () => clearInterval(interval);
  }, []);

  return now;
}

interface TimelineBarProps {
  bloco: Bloco;
  startHour: number;
  durationHours: number;
  hourWidth: number;
  rowIndex: number;
}

function TimelineBar({ bloco, startHour, durationHours, hourWidth, rowIndex }: TimelineBarProps) {
  const cor = getCorSubprefeitura(bloco.subprefeitura);
  const left = startHour * hourWidth;
  const width = Math.max(durationHours * hourWidth, hourWidth * 0.5); // Mínimo de 30min visual
  const top = rowIndex * ROW_HEIGHT;

  return (
    <div
      className="absolute rounded transition-all hover:brightness-110 hover:z-10 cursor-pointer group"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${ROW_HEIGHT - 4}px`,
        backgroundColor: cor,
      }}
      title={`${bloco.nome}\n${bloco.horaInicio} - ${bloco.horaTermino}\n${bloco.subprefeitura}`}
    >
      <div className="px-2 py-1 h-full flex items-center overflow-hidden">
        <span className="text-[10px] text-white font-medium truncate drop-shadow-sm">
          {bloco.nome}
        </span>
      </div>

      {/* Tooltip no hover */}
      <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block">
        <div className="bg-cor-bg-secondary border border-white/20 rounded-lg p-2 shadow-xl min-w-[200px]">
          <p className="text-xs font-semibold text-white">{bloco.nome}</p>
          <p className="text-[10px] text-white/60 mt-1">{bloco.subprefeitura}</p>
          <p className="text-[10px] text-white/60">{bloco.horaInicio} - {bloco.horaTermino}</p>
          {bloco.localConcentracao && (
            <p className="text-[10px] text-white/50 mt-1 truncate">{bloco.localConcentracao}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimelineDayProps {
  data: string;
  blocos: Bloco[];
  hourWidth: number;
  isExpanded: boolean;
  onToggle: () => void;
  currentTime: Date;
  showTimeLine: boolean;
  onScrollRef?: (el: HTMLDivElement | null) => void;
}

function TimelineDay({
  data,
  blocos,
  hourWidth,
  isExpanded,
  onToggle,
  currentTime,
  showTimeLine,
  onScrollRef
}: TimelineDayProps) {
  // Calcular posição da linha do horário atual
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
  const currentTimeLeft = currentHour * hourWidth;

  // Ordenar blocos por horário de início
  const blocosOrdenados = useMemo(() => {
    return [...blocos].sort((a, b) => {
      const horaA = a.horaInicio?.split(':').map(Number) || [0, 0];
      const horaB = b.horaInicio?.split(':').map(Number) || [0, 0];
      return (horaA[0] * 60 + horaA[1]) - (horaB[0] * 60 + horaB[1]);
    });
  }, [blocos]);

  // Calcular posições das barras (evitando sobreposição)
  const barrasPositionadas = useMemo(() => {
    const rows: { endHour: number }[] = [];

    return blocosOrdenados.map(bloco => {
      const [startH, startM] = (bloco.horaInicio || '00:00').split(':').map(Number);
      const [endH, endM] = (bloco.horaTermino || '23:59').split(':').map(Number);

      const startHour = startH + startM / 60;
      let endHour = endH + endM / 60;

      // Se horário fim é menor que início, assumir que vai até meia-noite ou +2h
      if (endHour < startHour) {
        endHour = Math.min(startHour + 2, 24);
      }

      const durationHours = Math.max(endHour - startHour, 0.5);

      // Encontrar a primeira linha disponível
      let rowIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].endHour <= startHour) {
          rowIndex = i;
          break;
        }
        rowIndex = i + 1;
      }

      // Atualizar ou adicionar linha
      if (rowIndex < rows.length) {
        rows[rowIndex].endHour = endHour;
      } else {
        rows.push({ endHour });
      }

      return { bloco, startHour, durationHours, rowIndex };
    });
  }, [blocosOrdenados]);

  const maxRows = Math.max(...barrasPositionadas.map(b => b.rowIndex + 1), 1);
  const contentHeight = maxRows * ROW_HEIGHT;

  // Formatar data
  const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });

  // Largura total (24 horas)
  const totalWidth = 24 * hourWidth;

  return (
    <div className="border-b border-white/10">
      {/* Header do dia - clicável para expandir */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-cor-bg-secondary hover:bg-cor-bg-tertiary transition-colors text-left"
      >
        <Calendar size={16} className="text-cor-accent-orange" />
        <span className="text-sm font-semibold text-white capitalize">{dataFormatada}</span>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">
          {blocos.length} blocos
        </span>
        <span className={`ml-auto text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div
          ref={onScrollRef}
          className="relative overflow-x-auto bg-cor-bg-primary/30 scroll-smooth"
        >
          {/* Header de horas */}
          <div
            className="sticky top-0 z-10 flex border-b border-white/10 bg-cor-bg-secondary/95 backdrop-blur-sm"
            style={{ width: `${totalWidth}px`, minWidth: '100%' }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="flex-shrink-0 text-center py-2 border-r border-white/5"
                style={{ width: `${hourWidth}px` }}
              >
                <span className="text-[10px] text-white/50">
                  {i.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Área das barras */}
          <div
            className="relative"
            style={{
              width: `${totalWidth}px`,
              minWidth: '100%',
              height: `${contentHeight}px`,
              minHeight: '40px'
            }}
          >
            {/* Linhas de grade */}
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-r border-white/5"
                style={{ left: `${i * hourWidth}px` }}
              />
            ))}

            {/* Barras dos blocos */}
            {barrasPositionadas.map(({ bloco, startHour, durationHours, rowIndex }) => (
              <TimelineBar
                key={bloco.id}
                bloco={bloco}
                startHour={startHour}
                durationHours={durationHours}
                hourWidth={hourWidth}
                rowIndex={rowIndex}
              />
            ))}

            {/* Linha do horário atual */}
            {showTimeLine && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: `${currentTimeLeft}px` }}
              >
                {/* Linha vermelha */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                {/* Indicador do horário no topo */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {/* Triângulo apontando para baixo */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Timeline() {
  const { blocos, loading } = useBlocos();
  const [zoom, setZoom] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const currentTime = useBrasiliaTime();

  const hourWidth = HOUR_WIDTH_BASE * zoom;

  // Função para registrar ref de scroll de cada dia
  const setScrollRef = useCallback((data: string, el: HTMLDivElement | null) => {
    if (el) {
      scrollRefs.current.set(data, el);
    } else {
      scrollRefs.current.delete(data);
    }
  }, []);

  // Auto-scroll para manter a linha do tempo visível
  useEffect(() => {
    if (!autoScroll) return;

    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
    const scrollPosition = currentHour * hourWidth - 200; // 200px de margem à esquerda

    // Fazer scroll em todos os dias expandidos
    scrollRefs.current.forEach((el) => {
      if (el) {
        el.scrollLeft = Math.max(0, scrollPosition);
      }
    });
  }, [autoScroll, currentTime, hourWidth]);

  // Função para exportar PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportTimelinePDF({
        blocos,
        filename: 'carnaval-rio-2026-timeline',
        title: 'Carnaval Rio 2026 - Timeline dos Blocos',
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Agrupar blocos por data
  const blocosPorData = useMemo(() => {
    const grupos: Record<string, Bloco[]> = {};

    blocos.forEach(bloco => {
      if (bloco.data) {
        if (!grupos[bloco.data]) {
          grupos[bloco.data] = [];
        }
        grupos[bloco.data].push(bloco);
      }
    });

    // Ordenar por data
    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, blocosData]) => ({ data, blocos: blocosData }));
  }, [blocos]);

  // Expandir primeiro dia por padrão
  useEffect(() => {
    if (blocosPorData.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set([blocosPorData[0].data]));
    }
  }, [blocosPorData]);

  const toggleDay = (data: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(data)) {
        next.delete(data);
      } else {
        next.add(data);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDays(new Set(blocosPorData.map(g => g.data)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  // Ir para o horário atual (centralizar)
  const goToNow = useCallback(() => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const scrollPosition = currentHour * hourWidth - 200;

    scrollRefs.current.forEach((el) => {
      if (el) {
        el.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
      }
    });
  }, [currentTime, hourWidth]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-cor-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cor-accent-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-white/70">Carregando timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-cor-bg-primary flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-cor-bg-secondary border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Esquerda - Voltar e título */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Voltar</span>
            </Link>

            <div>
              <h1 className="text-xl font-bold text-white">Timeline dos Blocos</h1>
              <p className="text-xs text-white/50">Carnaval Rio 2026 - {blocos.length} blocos em {blocosPorData.length} dias</p>
            </div>
          </div>

          {/* Direita - Controles */}
          <div className="flex items-center gap-3">
            {/* Horário de Brasília */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
              <Clock size={14} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-red-400/70">Brasília</span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Modo Esteira */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                autoScroll
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
              title={autoScroll ? 'Desativar modo esteira' : 'Ativar modo esteira'}
            >
              {autoScroll ? <Pause size={14} /> : <Play size={14} />}
              <span className="text-xs font-medium">
                {autoScroll ? 'Esteira ON' : 'Esteira OFF'}
              </span>
            </button>

            {/* Ir para agora */}
            <button
              onClick={goToNow}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              title="Ir para o horário atual"
            >
              <Clock size={14} />
              <span className="text-xs font-medium">Ir para Agora</span>
            </button>

            <div className="w-px h-8 bg-white/10" />

            {/* Expandir/Colapsar */}
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Expandir todos
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Colapsar todos
              </button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Exportar PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-cor-accent-orange hover:bg-cor-accent-orange/80 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileDown size={14} />
              )}
              {isExporting ? 'Gerando...' : 'Exportar PDF'}
            </button>

            <div className="w-px h-8 bg-white/10" />

            {/* Zoom */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Diminuir zoom"
              >
                <ZoomOut size={18} className="text-white/70" />
              </button>
              <span className="text-xs text-white/60 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn size={18} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div ref={containerRef} id="timeline-content" className="flex-1 overflow-y-auto">
        {blocosPorData.map(({ data, blocos: blocosData }) => (
          <TimelineDay
            key={data}
            data={data}
            blocos={blocosData}
            hourWidth={hourWidth}
            isExpanded={expandedDays.has(data)}
            onToggle={() => toggleDay(data)}
            currentTime={currentTime}
            showTimeLine={true}
            onScrollRef={(el) => setScrollRef(data, el)}
          />
        ))}
      </div>

      {/* Legenda */}
      <div className="flex-shrink-0 bg-cor-bg-secondary border-t border-white/10 px-6 py-2">
        <div className="flex items-center gap-6 text-[10px] text-white/50">
          <span>As cores representam as subprefeituras</span>
          <span>|</span>
          <span>Passe o mouse sobre um bloco para ver detalhes</span>
          <span>|</span>
          <span>Use o zoom para ajustar a visualização</span>
          <span>|</span>
          <span className="text-red-400">Linha vermelha = horário atual de Brasília</span>
        </div>
      </div>
    </div>
  );
}

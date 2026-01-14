import { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';
import { coresSubprefeitura } from '../../data/coordenadasBairros';
import { useResponsive } from '../../hooks';

export function MapLegend() {
  const { isMobile } = useResponsive();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  // Versão Mobile - Compacta e expansível
  if (isMobile) {
    return (
      <div className="absolute bottom-4 left-4 z-[1000]">
        {/* Botão toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-cor-bg-secondary/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
        >
          <Info size={14} className="text-white/70" />
          <span className="text-xs text-white/70">Legenda</span>
          {isExpanded ? (
            <ChevronDown size={14} className="text-white/50" />
          ) : (
            <ChevronUp size={14} className="text-white/50" />
          )}
        </button>

        {/* Conteúdo expansível */}
        {isExpanded && (
          <div className="mt-2 bg-cor-bg-secondary/95 backdrop-blur-sm rounded-lg p-3 border border-white/10 max-w-[200px]">
            {/* Tipos de Bloco */}
            <div className="text-[10px] text-white/60 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cor-accent-orange flex-shrink-0" />
                <span>Deslocamento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cor-accent-pink flex-shrink-0" />
                <span>Parado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                <span>Camera</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Versão Desktop - Completa
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-cor-bg-secondary/95 backdrop-blur-sm rounded-lg p-3 border border-white/10 max-w-xs">
      <h4 className="text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
        Subprefeituras
      </h4>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {Object.entries(coresSubprefeitura).map(([nome, cor]) => (
          <div key={nome} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cor }}
            />
            <span className="text-[10px] text-white/70 truncate">{nome}</span>
          </div>
        ))}
      </div>

      {/* Legenda de tipos de marcadores */}
      <div className="mt-3 pt-2 border-t border-white/10">
        <h4 className="text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
          Tipos de Bloco
        </h4>
        <div className="text-[10px] text-white/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-white/40 flex-shrink-0" />
            <span>Com deslocamento (circulo)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-white/40 flex items-center justify-center text-[8px] font-bold flex-shrink-0">P</span>
            <span>Parado (quadrado)</span>
          </div>
        </div>
      </div>

      {/* Legenda de percurso */}
      <div className="mt-3 pt-2 border-t border-white/10">
        <h4 className="text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
          Percurso
        </h4>
        <div className="text-[10px] text-white/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0 border-t-2 border-dashed border-white/50" />
            <span>Trajeto do bloco</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#00D4AA' }} />
            <span>Inicio (I)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#FF3D91' }} />
            <span>Fim (F)</span>
          </div>
        </div>
      </div>

      {/* Legenda de câmeras */}
      <div className="mt-3 pt-2 border-t border-white/10">
        <h4 className="text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
          Cameras
        </h4>
        <div className="text-[10px] text-white/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
              <span className="text-[8px]">📹</span>
            </span>
            <span>Camera proxima (300m)</span>
          </div>
        </div>
      </div>

      {/* Nota sobre tamanho */}
      <div className="mt-2 pt-2 border-t border-white/10">
        <p className="text-[9px] text-white/40 italic">
          Tamanho do marcador = publico estimado
        </p>
      </div>
    </div>
  );
}

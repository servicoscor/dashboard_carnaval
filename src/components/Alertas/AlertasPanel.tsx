import { X, Bell, CheckCheck, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import type { AlertaBloco } from '../../types/alerta';
import { AlertaCard } from './AlertaCard';

interface Props {
  alertas: AlertaBloco[];
  onConfirmar: (id: string) => void;
  onConfirmarTodos: () => void;
  onClose: () => void;
  onVerNoMapa: (blocoId: number) => void;
  somAtivado: boolean;
  onToggleSom: () => void;
}

export function AlertasPanel({
  alertas,
  onConfirmar,
  onConfirmarTodos,
  onClose,
  onVerNoMapa,
  somAtivado,
  onToggleSom,
}: Props) {
  const [filtro, setFiltro] = useState<'todos' | 'alta' | 'media' | 'baixa'>('todos');

  const alertasFiltrados = filtro === 'todos'
    ? alertas
    : alertas.filter(a => a.prioridade === filtro);

  const contagem = {
    alta: alertas.filter(a => a.prioridade === 'alta').length,
    media: alertas.filter(a => a.prioridade === 'media').length,
    baixa: alertas.filter(a => a.prioridade === 'baixa').length,
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[1500]"
        onClick={onClose}
      />

      {/* Painel - responsivo: full width em mobile pequeno, max-w-md em telas maiores */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-cor-bg-primary z-[1600] flex flex-col shadow-2xl safe-area-inset">
        {/* Header */}
        <div className="flex-shrink-0 bg-cor-bg-secondary border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cor-accent-orange" />
              <h2 className="text-base sm:text-lg font-bold text-white">Alertas</h2>
              <span className="bg-cor-accent-orange text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {alertas.length}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onToggleSom}
                className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  somAtivado
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-white/50'
                }`}
                title={somAtivado ? 'Som ativado' : 'Som desativado'}
                aria-label={somAtivado ? 'Desativar som' : 'Ativar som'}
              >
                {somAtivado ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Fechar alertas"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Filtros - scrollável horizontalmente em mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap touch-manipulation min-h-[36px] ${
                filtro === 'todos'
                  ? 'bg-cor-accent-orange text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Todos ({alertas.length})
            </button>
            <button
              onClick={() => setFiltro('alta')}
              className={`px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap touch-manipulation min-h-[36px] ${
                filtro === 'alta'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Alta ({contagem.alta})
            </button>
            <button
              onClick={() => setFiltro('media')}
              className={`px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap touch-manipulation min-h-[36px] ${
                filtro === 'media'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Média ({contagem.media})
            </button>
            <button
              onClick={() => setFiltro('baixa')}
              className={`px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap touch-manipulation min-h-[36px] ${
                filtro === 'baixa'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Baixa ({contagem.baixa})
            </button>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          {alertasFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center text-sm sm:text-base">
                {alertas.length === 0
                  ? 'Nenhum alerta no momento'
                  : 'Nenhum alerta nesta categoria'}
              </p>
            </div>
          ) : (
            alertasFiltrados.map(alerta => (
              <AlertaCard
                key={alerta.id}
                alerta={alerta}
                onConfirmar={onConfirmar}
                onVerNoMapa={onVerNoMapa}
              />
            ))
          )}
        </div>

        {/* Footer com safe area para bottom notch */}
        {alertas.length > 0 && (
          <div className="flex-shrink-0 bg-cor-bg-secondary border-t border-white/10 p-3 sm:p-4 safe-area-bottom">
            <button
              onClick={onConfirmarTodos}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-3 sm:py-3 px-4 rounded-lg transition-colors font-semibold touch-manipulation min-h-[48px]"
            >
              <CheckCheck className="w-5 h-5" />
              Confirmar Todos ({alertas.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}

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
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Painel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cor-bg-primary z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 bg-cor-bg-secondary border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cor-accent-orange" />
              <h2 className="text-lg font-bold text-white">Alertas</h2>
              <span className="bg-cor-accent-orange text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {alertas.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSom}
                className={`p-2 rounded-lg transition-colors ${
                  somAtivado
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-white/50'
                }`}
                title={somAtivado ? 'Som ativado' : 'Som desativado'}
              >
                {somAtivado ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filtro === 'todos'
                  ? 'bg-cor-accent-orange text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Todos ({alertas.length})
            </button>
            <button
              onClick={() => setFiltro('alta')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filtro === 'alta'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              🔴 Alta ({contagem.alta})
            </button>
            <button
              onClick={() => setFiltro('media')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filtro === 'media'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              🟡 Média ({contagem.media})
            </button>
            <button
              onClick={() => setFiltro('baixa')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filtro === 'baixa'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              🟢 Baixa ({contagem.baixa})
            </button>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="flex-1 overflow-y-auto p-4">
          {alertasFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center">
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

        {/* Footer */}
        {alertas.length > 0 && (
          <div className="flex-shrink-0 bg-cor-bg-secondary border-t border-white/10 p-4">
            <button
              onClick={onConfirmarTodos}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
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

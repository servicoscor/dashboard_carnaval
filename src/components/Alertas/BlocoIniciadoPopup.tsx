import { X, MapPin, Clock, Users, Play, Volume2 } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarNumero, formatarHora } from '../../utils/formatters';

interface Props {
  bloco: Bloco;
  onConfirmar: () => void;
  onVerNoMapa: () => void;
}

export function BlocoIniciadoPopup({ bloco, onConfirmar, onVerNoMapa }: Props) {
  return (
    <>
      {/* Overlay com animação de pulso sutil */}
      <div
        className="fixed inset-0 bg-black/70 z-[2000] animate-pulse"
        style={{ animationDuration: '2s' }}
        onClick={onConfirmar}
      />

      {/* Popup centralizado */}
      <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
        <div className="bg-cor-bg-primary border-2 border-cor-accent-orange rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in overflow-hidden">
          {/* Header com ícone animado */}
          <div className="bg-gradient-to-r from-cor-accent-orange to-orange-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Bloco Iniciando!</p>
                <div className="flex items-center gap-2 text-white">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs">Alerta sonoro ativo</span>
                </div>
              </div>
            </div>
            <button
              onClick={onConfirmar}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Nome do bloco */}
            <h2 className="text-xl font-bold text-white mb-4 leading-tight">
              {bloco.nome}
            </h2>

            {/* Informações */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="w-5 h-5 text-cor-accent-orange flex-shrink-0" />
                <span>{bloco.localConcentracao || bloco.bairro}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="w-5 h-5 text-cor-accent-orange flex-shrink-0" />
                <span>
                  {formatarHora(bloco.horaInicio)} - {formatarHora(bloco.horaTermino)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Users className="w-5 h-5 text-cor-accent-orange flex-shrink-0" />
                <span>{formatarNumero(bloco.publicoEstimado)} pessoas estimadas</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={onVerNoMapa}
                className="flex-1 flex items-center justify-center gap-2 bg-cor-accent-orange hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Ver no Mapa
              </button>
              <button
                onClick={onConfirmar}
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-colors border border-white/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de animação */}
      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          50% {
            transform: scale(1.02) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}

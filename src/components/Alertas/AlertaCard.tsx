import { MapPin, Users, Clock, CheckCircle, Map } from 'lucide-react';
import type { AlertaBloco } from '../../types/alerta';
import { formatarNumero } from '../../utils/formatters';

interface Props {
  alerta: AlertaBloco;
  onConfirmar: (id: string) => void;
  onVerNoMapa: (blocoId: number) => void;
}

const prioridadeCores = {
  alta: {
    bg: 'bg-red-500/20',
    border: 'border-red-500',
    badge: 'bg-red-500',
    icon: '🔴',
    label: 'ALTA',
  },
  media: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    badge: 'bg-yellow-500',
    icon: '🟡',
    label: 'MÉDIA',
  },
  baixa: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    badge: 'bg-green-500',
    icon: '🟢',
    label: 'BAIXA',
  },
};

const tipoLabels = {
  concentracao: 'Concentração',
  inicio: 'Início',
  termino: 'Término',
};

export function AlertaCard({ alerta, onConfirmar, onVerNoMapa }: Props) {
  const cores = prioridadeCores[alerta.prioridade];
  const { bloco } = alerta;

  return (
    <div
      className={`
        ${cores.bg} ${cores.border} border-l-4
        rounded-lg p-4 mb-3
        ${alerta.prioridade === 'alta' ? 'animate-pulse' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`${cores.badge} text-white text-xs px-2 py-1 rounded-full font-bold`}>
          {cores.icon} {cores.label}
        </span>
        <span className="flex items-center gap-1 text-white font-mono text-sm">
          <Clock className="w-4 h-4" />
          {tipoLabels[alerta.tipo]} em {alerta.minutosRestantes}min
        </span>
      </div>

      {/* Nome do Bloco */}
      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
        {bloco.nome}
      </h3>

      {/* Detalhes */}
      <div className="space-y-1 text-sm text-white/70 mb-4">
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{bloco.bairro} • {bloco.subprefeitura}</span>
        </p>
        <p className="flex items-center gap-2">
          <Users className="w-4 h-4 flex-shrink-0" />
          {formatarNumero(bloco.publicoEstimado || 0)} pessoas
        </p>
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {bloco.horaInicio} - {bloco.horaTermino}
        </p>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={() => onVerNoMapa(bloco.id)}
          className="flex-1 flex items-center justify-center gap-2
                     bg-white/10 hover:bg-white/20
                     text-white py-2 px-3 rounded-lg transition-colors text-sm"
        >
          <Map className="w-4 h-4" />
          Ver no Mapa
        </button>
        <button
          onClick={() => onConfirmar(alerta.id)}
          className="flex-1 flex items-center justify-center gap-2
                     bg-green-500 hover:bg-green-600
                     text-white py-2 px-3 rounded-lg transition-colors font-semibold text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          Confirmar
        </button>
      </div>
    </div>
  );
}

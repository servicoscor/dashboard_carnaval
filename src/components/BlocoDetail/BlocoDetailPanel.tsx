import { X, MapPin, Clock, Users, Music, Route, Navigation, Flag } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarNumero, formatarHora, formatarData, extrairPontosPercurso } from '../../utils/formatters';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';

interface BlocoDetailPanelProps {
  bloco: Bloco | null;
  onClose: () => void;
}

export function BlocoDetailPanel({ bloco, onClose }: BlocoDetailPanelProps) {
  if (!bloco) return null;

  const cor = getCorSubprefeitura(bloco.subprefeitura);
  const pontosPercurso = extrairPontosPercurso(bloco.percursoDetalhado);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-[340px] bg-cor-bg-secondary/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl overflow-hidden">
      {/* Header colorido */}
      <div
        className="px-4 py-3 relative"
        style={{ backgroundColor: `${cor}20` }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: cor }}
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <h3 className="text-base font-bold text-white pr-8 leading-tight">
          {bloco.nome}
        </h3>
        <p className="text-xs text-white/60 mt-1">{bloco.subprefeitura}</p>
      </div>

      {/* Conteudo */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Data e Horario */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<Clock size={14} />}
            label="Data"
            value={formatarData(bloco.data)}
          />
          <InfoItem
            icon={<Clock size={14} />}
            label="Horario"
            value={`${formatarHora(bloco.horaInicio)} - ${formatarHora(bloco.horaTermino)}`}
          />
        </div>

        {/* Local e Publico */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<MapPin size={14} />}
            label="Bairro"
            value={bloco.bairro}
          />
          <InfoItem
            icon={<Users size={14} />}
            label="Publico Estimado"
            value={`${formatarNumero(bloco.publicoEstimado)} pessoas`}
            highlight
          />
        </div>

        {/* Estrutura */}
        {bloco.estrutura && (
          <InfoItem
            icon={<Music size={14} />}
            label="Estrutura"
            value={bloco.estrutura}
          />
        )}

        {/* Tipo de apresentacao */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          bloco.temPercurso
            ? 'bg-cor-accent-green/10 border border-cor-accent-green/20'
            : 'bg-white/5 border border-white/10'
        }`}>
          <Route size={14} className={bloco.temPercurso ? 'text-cor-accent-green' : 'text-white/50'} />
          <span className={`text-sm ${bloco.temPercurso ? 'text-cor-accent-green' : 'text-white/70'}`}>
            {bloco.formaApresentacao}
          </span>
        </div>

        {/* Local de Concentracao */}
        {bloco.localConcentracao && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wide">
              <Navigation size={12} />
              Concentracao
            </div>
            <p className="text-sm text-white/80 bg-white/5 px-3 py-2 rounded-lg">
              {bloco.localConcentracao}
            </p>
            {bloco.horaConcentracao && (
              <p className="text-xs text-white/50">
                Horario: {formatarHora(bloco.horaConcentracao)}
              </p>
            )}
          </div>
        )}

        {/* Local de Dispersao */}
        {bloco.localDispersao && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wide">
              <Flag size={12} />
              Dispersao
            </div>
            <p className="text-sm text-white/80 bg-white/5 px-3 py-2 rounded-lg">
              {bloco.localDispersao}
            </p>
          </div>
        )}

        {/* Percurso Detalhado */}
        {pontosPercurso.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wide">
              <Route size={12} />
              Percurso ({pontosPercurso.length} pontos)
            </div>
            <div className="space-y-1 pl-2 border-l-2 border-white/10">
              {pontosPercurso.map((ponto, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[10px] text-white/30 w-4 text-right flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-xs text-white/70">{ponto}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {bloco.situacao && (
          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] text-white/40 uppercase tracking-wide">
              Status: {bloco.situacao}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoItem({ icon, label, value, highlight }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className={`text-sm ${highlight ? 'text-cor-accent-orange font-medium' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  );
}

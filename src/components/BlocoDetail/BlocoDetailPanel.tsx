import { X, MapPin, Clock, Users, Music, Route, Navigation, Flag } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import { formatarNumero, formatarHora, formatarData, extrairPontosPercurso } from '../../utils/formatters';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';

interface BlocoDetailPanelProps {
  bloco: Bloco | null;
  onClose: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
}

export function BlocoDetailPanel({ bloco, onClose, isMobile = false, isOpen = true }: BlocoDetailPanelProps) {
  if (!bloco || !isOpen) return null;

  const cor = getCorSubprefeitura(bloco.subprefeitura);
  const pontosPercurso = extrairPontosPercurso(bloco.percursoDetalhado);

  // Classes condicionais para mobile (bottom sheet) vs desktop (side panel)
  // Mobile: altura máxima 60vh em landscape, 75vh em portrait
  // Usando fundo sólido escuro para garantir visibilidade em qualquer tema de mapa
  // z-[1100] para ficar acima dos controles do mapa (zoom, tema, etc)
  const containerClasses = isMobile
    ? 'fixed bottom-0 left-0 right-0 z-[1100] bg-[#1a1f2e] rounded-t-3xl border-t-2 border-white/20 shadow-2xl max-h-[75vh] landscape:max-h-[85vh] overflow-hidden safe-area-bottom'
    : 'absolute top-4 right-4 z-[1100] w-[320px] lg:w-[360px] bg-[#1a1f2e] rounded-xl border border-white/20 shadow-2xl overflow-hidden max-h-[calc(100vh-120px)]';

  return (
    <div className={containerClasses}>
      {/* Barra indicadora para mobile - drag handle */}
      {isMobile && (
        <div className="flex justify-center py-2 bg-[#1a1f2e] border-b border-white/5">
          <div className="w-10 h-1 bg-white/40 rounded-full" />
        </div>
      )}

      {/* Header colorido com gradiente */}
      <div
        className="px-4 py-3 sm:py-4 relative border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${cor}25 0%, ${cor}10 100%)`
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
          style={{ backgroundColor: cor, boxShadow: `0 0 10px ${cor}` }}
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fechar detalhes"
        >
          <X size={20} />
        </button>
        <h3 className="text-base sm:text-lg font-bold text-white pr-12 leading-tight">
          {bloco.nome}
        </h3>
        <p className="text-sm text-white/70 mt-1 font-medium">{bloco.subprefeitura}</p>
      </div>

      {/* Conteudo scrollável com custom scrollbar */}
      <div className={`p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar ${isMobile ? 'max-h-[calc(75vh-100px)] landscape:max-h-[calc(85vh-100px)]' : 'max-h-[calc(100vh-200px)]'}`}>
        {/* Data e Horario */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<Clock size={16} />}
            label="Data"
            value={formatarData(bloco.data)}
          />
          <InfoItem
            icon={<Clock size={16} />}
            label="Horário"
            value={`${formatarHora(bloco.horaInicio)} - ${formatarHora(bloco.horaTermino)}`}
          />
        </div>

        {/* Local e Publico */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<MapPin size={16} />}
            label="Bairro"
            value={bloco.bairro}
          />
          <InfoItem
            icon={<Users size={16} />}
            label="Público Estimado"
            value={`${formatarNumero(bloco.publicoEstimado)} pessoas`}
            highlight
          />
        </div>

        {/* Estrutura */}
        {bloco.estrutura && (
          <InfoItem
            icon={<Music size={16} />}
            label="Estrutura"
            value={bloco.estrutura}
          />
        )}

        {/* Tipo de apresentacao */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${
          bloco.temPercurso
            ? 'bg-cor-accent-green/10 border border-cor-accent-green/20'
            : 'bg-white/5 border border-white/10'
        }`}>
          <Route size={16} className={bloco.temPercurso ? 'text-cor-accent-green' : 'text-white/50'} />
          <span className={`text-sm sm:text-base ${bloco.temPercurso ? 'text-cor-accent-green' : 'text-white/70'}`}>
            {bloco.formaApresentacao}
          </span>
        </div>

        {/* Local de Concentracao */}
        {bloco.localConcentracao && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/50 uppercase tracking-wide">
              <Navigation size={14} />
              Concentração
            </div>
            <p className="text-sm sm:text-base text-white/80 bg-white/5 px-3 py-2.5 rounded-lg">
              {bloco.localConcentracao}
            </p>
            {bloco.horaConcentracao && (
              <p className="text-xs sm:text-sm text-white/50">
                Horário: {formatarHora(bloco.horaConcentracao)}
              </p>
            )}
          </div>
        )}

        {/* Local de Dispersao */}
        {bloco.localDispersao && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/50 uppercase tracking-wide">
              <Flag size={14} />
              Dispersão
            </div>
            <p className="text-sm sm:text-base text-white/80 bg-white/5 px-3 py-2.5 rounded-lg">
              {bloco.localDispersao}
            </p>
          </div>
        )}

        {/* Percurso Detalhado */}
        {pontosPercurso.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/50 uppercase tracking-wide">
              <Route size={14} />
              Percurso ({pontosPercurso.length} pontos)
            </div>
            <div className="space-y-1.5 pl-3 border-l-2 border-white/10">
              {pontosPercurso.map((ponto, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs text-white/30 w-5 text-right flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-white/70">{ponto}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {bloco.situacao && (
          <div className="pt-2 border-t border-white/10">
            <span className="text-xs text-white/40 uppercase tracking-wide">
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
      <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className={`text-sm sm:text-base ${highlight ? 'text-cor-accent-orange font-medium' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  );
}

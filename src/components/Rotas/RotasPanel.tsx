import { useState, useMemo } from 'react';
import { Navigation, X, Loader2, AlertTriangle, Clock, Route as RouteIcon, LocateFixed, MapPin, Users } from 'lucide-react';
import type { Bloco } from '../../types/bloco';
import type { RotaInfo, OrigemUsuario, Coordenada } from '../../types/rota';
import { formatarDuracao, formatarDistanciaKm } from '../../utils/geoUtils';
import { getAlertaIcone, getAlertaLabel } from '../../services/wazeService';
import { getBrasiliaTime } from '../../utils/formatters';
import { formatarHora } from '../../utils/formatters';

// Obter data de hoje no formato YYYY-MM-DD (horário de Brasília)
function getHojeStr(): string {
  const agora = getBrasiliaTime();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

interface RotasPanelProps {
  origem: OrigemUsuario | null;
  rotaAtiva: RotaInfo | null;
  carregando: boolean;
  erro: string | null;
  geolocalizacao: {
    coordenadas: Coordenada | null;
    erro: string | null;
    carregando: boolean;
  };
  onObterLocalizacao: () => void;
  onCalcularRota: (bloco: Bloco) => Promise<RotaInfo | null>;
  onLimparRota: () => void;
  onDefinirOrigemGPS: (coordenadas: Coordenada) => void;
  blocos: Bloco[]; // Lista de todos os blocos
  isMobile?: boolean;
  embedded?: boolean;
}

export function RotasPanel({
  origem,
  rotaAtiva,
  carregando,
  erro,
  geolocalizacao,
  onObterLocalizacao,
  onCalcularRota,
  onLimparRota,
  onDefinirOrigemGPS,
  blocos,
  isMobile = false,
  embedded = false
}: RotasPanelProps) {
  const [blocoSelecionadoId, setBlocoSelecionadoId] = useState<number | null>(null);

  // Filtrar apenas blocos de hoje
  const blocosHoje = useMemo(() => {
    const hojeStr = getHojeStr();
    return blocos.filter(b => b.data === hojeStr);
  }, [blocos]);

  // Quando coordenadas GPS chegarem e não tivermos origem, definir
  if (geolocalizacao.coordenadas && !origem && !geolocalizacao.carregando) {
    onDefinirOrigemGPS(geolocalizacao.coordenadas);
  }

  // Função para selecionar bloco e traçar rota
  const handleSelecionarBloco = async (bloco: Bloco) => {
    setBlocoSelecionadoId(bloco.id);

    // Se não tem localização GPS, obter primeiro
    if (!geolocalizacao.coordenadas && !origem) {
      onObterLocalizacao();
      // Aguardar um momento e tentar novamente quando tiver coordenadas
      return;
    }

    // Definir origem GPS se ainda não definida
    if (!origem && geolocalizacao.coordenadas) {
      onDefinirOrigemGPS(geolocalizacao.coordenadas);
    }

    // Calcular rota
    await onCalcularRota(bloco);
  };

  // Classes do container baseado em embedded
  const containerClass = embedded
    ? ''
    : `bg-cor-bg-secondary border border-white/10 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`;

  // Se tiver rota ativa, mostrar informações da rota
  if (rotaAtiva) {
    return (
      <div className={containerClass}>
        {/* Cabeçalho da rota */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RouteIcon size={18} className="text-cor-accent-blue" />
            <span className="font-semibold text-white">Rota ativa</span>
          </div>
          <button
            onClick={onLimparRota}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Fechar rota"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Destino */}
        <div className="bg-cor-bg-primary/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-white/50 mb-1">Destino</p>
          <p className="text-sm font-semibold text-cor-accent-orange truncate">
            🎭 {rotaAtiva.blocoDestino.nome}
          </p>
        </div>

        {/* Estatísticas da rota */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-cor-accent-blue/10 border border-cor-accent-blue/20 rounded-lg p-2 text-center">
            <RouteIcon size={16} className="text-cor-accent-blue mx-auto mb-1" />
            <p className="text-lg font-bold text-cor-accent-blue">
              {formatarDistanciaKm(rotaAtiva.distanciaKm)}
            </p>
            <p className="text-[10px] text-white/50">Distância</p>
          </div>
          <div className="bg-cor-accent-green/10 border border-cor-accent-green/20 rounded-lg p-2 text-center">
            <Clock size={16} className="text-cor-accent-green mx-auto mb-1" />
            <p className="text-lg font-bold text-cor-accent-green">
              {formatarDuracao(rotaAtiva.duracaoMinutos)}
            </p>
            <p className="text-[10px] text-white/50">Duração</p>
          </div>
        </div>

        {/* Alertas na rota */}
        {rotaAtiva.alertasNaRota.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-500">
                {rotaAtiva.alertasNaRota.length} alerta(s) na rota
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {rotaAtiva.alertasNaRota.map((alerta) => (
                <div
                  key={alerta.uuid}
                  className="flex items-center gap-2 bg-yellow-500/10 rounded px-2 py-1.5"
                >
                  <span className="text-sm">{getAlertaIcone(alerta.type, alerta.subtype)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-yellow-400 truncate">
                      {getAlertaLabel(alerta.type, alerta.subtype)}
                    </p>
                    {alerta.street && (
                      <p className="text-[10px] text-white/50 truncate">{alerta.street}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão para abrir no maps */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${rotaAtiva.origem.lat},${rotaAtiva.origem.lng}&destination=${rotaAtiva.destino.lat},${rotaAtiva.destino.lng}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-cor-accent-blue hover:bg-cor-accent-blue/80 text-white rounded-lg transition-colors"
        >
          <Navigation size={16} />
          <span className="text-sm font-semibold">Abrir no Google Maps</span>
        </a>
      </div>
    );
  }

  // Painel de seleção de bloco
  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={18} className="text-cor-accent-blue" />
          <span className="font-semibold text-white">Traçar rota</span>
        </div>
      )}

      {/* Status da localização */}
      <div className="mb-3 p-2 bg-cor-bg-primary/50 rounded-lg">
        <div className="flex items-center gap-2">
          {geolocalizacao.carregando ? (
            <>
              <Loader2 size={14} className="text-cor-accent-blue animate-spin" />
              <span className="text-xs text-white/70">Obtendo localização...</span>
            </>
          ) : origem || geolocalizacao.coordenadas ? (
            <>
              <LocateFixed size={14} className="text-cor-accent-green" />
              <span className="text-xs text-cor-accent-green">Localização GPS ativa</span>
            </>
          ) : (
            <>
              <LocateFixed size={14} className="text-white/40" />
              <span className="text-xs text-white/50">Clique em um bloco para ativar o GPS</span>
            </>
          )}
        </div>
        {geolocalizacao.erro && (
          <p className="text-xs text-cor-accent-pink mt-1">{geolocalizacao.erro}</p>
        )}
      </div>

      {/* Lista de blocos de hoje */}
      {blocosHoje.length > 0 ? (
        <div>
          <p className="text-xs text-white/50 mb-2">
            Blocos de hoje ({blocosHoje.length}):
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pb-1 pr-1">
            {blocosHoje.map((bloco) => (
              <button
                key={bloco.id}
                onClick={() => handleSelecionarBloco(bloco)}
                disabled={carregando}
                className={`w-full text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
                  blocoSelecionadoId === bloco.id && carregando
                    ? 'bg-cor-accent-orange/20 border-cor-accent-orange/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">🎭</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {bloco.nome}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-white/40 flex-shrink-0" />
                        <span className="text-[10px] text-white/50">{bloco.bairro}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-white/40 flex-shrink-0" />
                        <span className="text-[10px] text-white/50">
                          {formatarHora(bloco.horaInicio)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={10} className="text-white/40 flex-shrink-0" />
                        <span className="text-[10px] text-white/50">
                          {bloco.publicoEstimado.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {blocoSelecionadoId === bloco.id && carregando ? (
                    <Loader2 size={16} className="text-cor-accent-orange animate-spin flex-shrink-0" />
                  ) : (
                    <RouteIcon size={16} className="text-white/30 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-white/50">Nenhum bloco hoje</p>
          <p className="text-xs text-white/30 mt-1">
            Selecione outra data no filtro para ver os blocos
          </p>
        </div>
      )}

      {/* Erro geral */}
      {erro && (
        <p className="mt-2 text-xs text-cor-accent-pink text-center">
          {erro}
        </p>
      )}
    </div>
  );
}

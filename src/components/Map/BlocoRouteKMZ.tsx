import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Bloco } from '../../types/bloco';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';
import { usePercursosKMZ, usePercursoBloco } from '../../hooks/usePercursosKMZ';

interface BlocoRouteKMZProps {
  bloco: Bloco;
  isSelected: boolean;
  percursosKMZ: ReturnType<typeof usePercursosKMZ>;
}

// Ícone para ponto de início (verde com "I")
function createStartIcon(): L.DivIcon {
  return L.divIcon({
    className: 'route-start-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #00D4AA;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">I</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Ícone para ponto de fim (rosa com "F")
function createEndIcon(): L.DivIcon {
  return L.divIcon({
    className: 'route-end-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #FF3D91;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">F</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Ícone de loading
function createLoadingIcon(): L.DivIcon {
  return L.divIcon({
    className: 'route-loading-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        border: 2px solid #FFD700;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function BlocoRouteKMZ({ bloco, isSelected, percursosKMZ }: BlocoRouteKMZProps) {
  const { percurso, loading } = usePercursoBloco(
    isSelected ? bloco.id : null,
    bloco.nome,
    percursosKMZ
  );

  // SOMENTE mostrar rota quando o bloco estiver SELECIONADO e for COM DESLOCAMENTO
  if (!isSelected || bloco.formaApresentacao !== 'COM DESLOCAMENTO') {
    return null;
  }

  const cor = getCorSubprefeitura(bloco.subprefeitura);

  // Se está carregando o KMZ, mostrar indicador
  if (loading) {
    return (
      <Marker
        position={[bloco.lat, bloco.lng]}
        icon={createLoadingIcon()}
        interactive={false}
      />
    );
  }

  // Se tem percurso KMZ carregado, usar ele
  if (percurso && percurso.coordenadas.length >= 2) {
    return (
      <>
        {/* Linha do percurso KMZ */}
        <Polyline
          positions={percurso.coordenadas}
          pathOptions={{
            color: percurso.cor || cor,
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        >
          <Tooltip sticky>
            <div className="text-xs">
              <strong>{bloco.nome}</strong>
              <br />
              Distância: {(percurso.distanciaMetros / 1000).toFixed(2)} km
            </div>
          </Tooltip>
        </Polyline>

        {/* Marcador de início */}
        <Marker
          position={percurso.pontoInicio}
          icon={createStartIcon()}
          interactive={false}
        />

        {/* Marcador de fim */}
        <Marker
          position={percurso.pontoFim}
          icon={createEndIcon()}
          interactive={false}
        />
      </>
    );
  }

  // Fallback: Se tem percurso definido no bloco (geocodificado)
  if (bloco.percurso && bloco.percurso.length >= 2) {
    const positions = bloco.percurso.map(p => [p.lat, p.lng] as [number, number]);
    const startPos = positions[0];
    const endPos = positions[positions.length - 1];

    return (
      <>
        <Polyline
          positions={positions}
          pathOptions={{
            color: cor,
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <Marker position={startPos} icon={createStartIcon()} interactive={false} />
        <Marker position={endPos} icon={createEndIcon()} interactive={false} />
      </>
    );
  }

  // Fallback final: linha simples do ponto central
  const offset = 0.003;
  const startPos: [number, number] = [bloco.lat - offset, bloco.lng - offset];
  const endPos: [number, number] = [bloco.lat + offset, bloco.lng + offset];

  return (
    <>
      <Polyline
        positions={[startPos, [bloco.lat, bloco.lng], endPos]}
        pathOptions={{
          color: cor,
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5',
          lineCap: 'round',
        }}
      >
        <Tooltip sticky>
          <div className="text-xs text-gray-500">
            Percurso aproximado
          </div>
        </Tooltip>
      </Polyline>
      <Marker position={startPos} icon={createStartIcon()} interactive={false} />
      <Marker position={endPos} icon={createEndIcon()} interactive={false} />
    </>
  );
}

// Componente wrapper que gerencia o hook de percursos
export function BlocoRouteWithKMZ({ bloco, isSelected }: { bloco: Bloco; isSelected: boolean }) {
  const percursosKMZ = usePercursosKMZ();

  return (
    <BlocoRouteKMZ
      bloco={bloco}
      isSelected={isSelected}
      percursosKMZ={percursosKMZ}
    />
  );
}

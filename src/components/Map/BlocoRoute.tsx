import { Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Bloco } from '../../types/bloco';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';

interface BlocoRouteProps {
  bloco: Bloco;
  isSelected: boolean;
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

export function BlocoRoute({ bloco, isSelected }: BlocoRouteProps) {
  // SOMENTE mostrar rota quando o bloco estiver SELECIONADO e for COM DESLOCAMENTO
  if (!isSelected || bloco.formaApresentacao !== 'COM DESLOCAMENTO') {
    return null;
  }

  const cor = getCorSubprefeitura(bloco.subprefeitura);

  // Se tem pontos de percurso definidos, usar eles
  if (bloco.percurso && bloco.percurso.length >= 2) {
    const positions = bloco.percurso.map(p => [p.lat, p.lng] as [number, number]);
    const startPos = positions[0];
    const endPos = positions[positions.length - 1];

    return (
      <>
        {/* Linha do percurso */}
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

        {/* Marcador de início */}
        <Marker
          position={startPos}
          icon={createStartIcon()}
          interactive={false}
        />

        {/* Marcador de fim */}
        <Marker
          position={endPos}
          icon={createEndIcon()}
          interactive={false}
        />
      </>
    );
  }

  // Se não tem percurso detalhado, mostrar linha simples do ponto central
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
          lineCap: 'round',
        }}
      />
      <Marker position={startPos} icon={createStartIcon()} interactive={false} />
      <Marker position={endPos} icon={createEndIcon()} interactive={false} />
    </>
  );
}

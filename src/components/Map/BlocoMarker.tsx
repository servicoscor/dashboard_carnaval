import { CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Bloco } from '../../types/bloco';
import { getCorSubprefeitura } from '../../data/coordenadasBairros';
import { getMarkerRadius } from '../../utils/constants';
import { formatarNumero, formatarHora } from '../../utils/formatters';

interface BlocoMarkerProps {
  bloco: Bloco;
  isSelected: boolean;
  onSelect: (bloco: Bloco) => void;
}

// Criar ícone SVG para bloco parado (quadrado com "P")
function createSquareIcon(cor: string, isSelected: boolean, size: number): L.DivIcon {
  const borderColor = isSelected ? '#FFFFFF' : cor;
  const borderWidth = isSelected ? 3 : 2;
  const actualSize = isSelected ? size + 8 : size;

  return L.divIcon({
    className: 'custom-square-marker',
    html: `
      <div style="
        width: ${actualSize}px;
        height: ${actualSize}px;
        background-color: ${cor};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 4px;
        opacity: ${isSelected ? 0.95 : 0.8};
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          color: white;
          font-size: ${Math.max(10, actualSize * 0.5)}px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">P</div>
      </div>
    `,
    iconSize: [actualSize, actualSize],
    iconAnchor: [actualSize / 2, actualSize / 2],
    popupAnchor: [0, -actualSize / 2],
  });
}

export function BlocoMarker({ bloco, isSelected, onSelect }: BlocoMarkerProps) {
  const cor = getCorSubprefeitura(bloco.subprefeitura);
  const radius = getMarkerRadius(bloco.publicoEstimado);

  const popupContent = (
    <div style={{ minWidth: '240px', padding: '4px' }}>
      <h3 style={{
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#FF6B35',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        {bloco.nome}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <span style={{ fontSize: '14px' }}>📍</span>
          <span>{bloco.bairro}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <span style={{ fontSize: '14px' }}>👥</span>
          <span>{formatarNumero(bloco.publicoEstimado)} pessoas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <span style={{ fontSize: '14px' }}>🕐</span>
          <span>{formatarHora(bloco.horaInicio)} - {formatarHora(bloco.horaTermino)}</span>
        </div>
        {bloco.estrutura && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <span style={{ fontSize: '14px' }}>🎵</span>
            <span>{bloco.estrutura}</span>
          </div>
        )}
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {bloco.formaApresentacao === 'COM DESLOCAMENTO' ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#00D4AA',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🚶 Com deslocamento
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FF6B35',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              📌 Parado
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Bloco PARADO: usar marcador quadrado com "P"
  if (bloco.formaApresentacao === 'PARADO') {
    const size = Math.max(16, radius * 2);
    const icon = createSquareIcon(cor, isSelected, size);

    return (
      <Marker
        position={[bloco.lat, bloco.lng]}
        icon={icon}
        eventHandlers={{
          click: () => onSelect(bloco),
        }}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  }

  // Bloco COM DESLOCAMENTO: usar marcador circular
  return (
    <CircleMarker
      center={[bloco.lat, bloco.lng]}
      radius={isSelected ? radius + 4 : radius}
      pathOptions={{
        color: isSelected ? '#FFFFFF' : cor,
        fillColor: cor,
        fillOpacity: isSelected ? 0.9 : 0.7,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{
        click: () => onSelect(bloco),
      }}
    >
      <Popup>{popupContent}</Popup>
    </CircleMarker>
  );
}

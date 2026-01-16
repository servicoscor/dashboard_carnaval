import { CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Bloco } from '../../types/bloco';
import { getMarkerRadius, getCorEstagio } from '../../utils/constants';
import { formatarNumero, formatarHora, blocoTerminou, blocoEmAndamento } from '../../utils/formatters';

interface BlocoMarkerProps {
  bloco: Bloco;
  isSelected: boolean;
  onSelect: (bloco: Bloco) => void;
}

// Cor cinza para blocos encerrados
const COR_ENCERRADO = '#6b7280';

// Criar ícone SVG para bloco parado (quadrado com "P")
function createSquareIcon(cor: string, isSelected: boolean, size: number, encerrado: boolean, emAndamento: boolean): L.DivIcon {
  const corFinal = encerrado ? COR_ENCERRADO : cor;
  const borderColor = isSelected ? '#FFFFFF' : corFinal;
  const borderWidth = isSelected ? 3 : 2;
  const actualSize = isSelected ? size + 8 : size;
  const opacity = encerrado ? 0.4 : (isSelected ? 0.95 : 0.8);
  const cursor = encerrado ? 'default' : 'pointer';
  const animationClass = emAndamento && !encerrado ? 'bloco-em-andamento' : '';

  return L.divIcon({
    className: `custom-square-marker ${animationClass}`,
    html: `
      <div class="${animationClass}" style="
        width: ${actualSize}px;
        height: ${actualSize}px;
        background-color: ${corFinal};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 4px;
        opacity: ${opacity};
        box-shadow: ${emAndamento && !encerrado ? `0 0 20px ${corFinal}, 0 0 40px ${corFinal}40` : '0 2px 8px rgba(0,0,0,0.4)'};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: ${cursor};
        ${encerrado ? 'filter: grayscale(50%);' : ''}
        ${emAndamento && !encerrado ? 'animation: pulse-marker 1.5s ease-in-out infinite;' : ''}
      ">
        <div style="
          color: white;
          font-size: ${Math.max(10, actualSize * 0.5)}px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">${encerrado ? '✓' : emAndamento ? '▶' : 'P'}</div>
      </div>
      ${emAndamento && !encerrado ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${actualSize * 2}px;
          height: ${actualSize * 2}px;
          border: 2px solid ${corFinal};
          border-radius: 4px;
          animation: pulse-ring 1.5s ease-out infinite;
          pointer-events: none;
        "></div>
      ` : ''}
    `,
    iconSize: [actualSize, actualSize],
    iconAnchor: [actualSize / 2, actualSize / 2],
    popupAnchor: [0, -actualSize / 2],
  });
}

// Criar ícone circular para blocos em andamento (com animação)
function createPulsingCircleIcon(cor: string, isSelected: boolean, radius: number): L.DivIcon {
  const size = (isSelected ? radius + 4 : radius) * 2;
  const borderColor = isSelected ? '#FFFFFF' : cor;
  const borderWidth = isSelected ? 3 : 2;

  return L.divIcon({
    className: 'custom-pulsing-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          background-color: ${cor};
          border: ${borderWidth}px solid ${borderColor};
          border-radius: 50%;
          opacity: 0.9;
          box-shadow: 0 0 20px ${cor}, 0 0 40px ${cor}40;
          animation: pulse-marker 1.5s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size * 2}px;
          height: ${size * 2}px;
          border: 2px solid ${cor};
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-out infinite;
          pointer-events: none;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function BlocoMarker({ bloco, isSelected, onSelect }: BlocoMarkerProps) {
  const { cor } = getCorEstagio(bloco.publicoEstimado);
  const radius = getMarkerRadius(bloco.publicoEstimado);
  const encerrado = blocoTerminou(bloco.data, bloco.horaTermino);
  const emAndamento = blocoEmAndamento(bloco.data, bloco.horaInicio, bloco.horaTermino);

  // Handler de clique - não seleciona se encerrado
  const handleClick = () => {
    if (!encerrado) {
      onSelect(bloco);
    }
  };

  const popupContent = (
    <div style={{
      minWidth: '240px',
      padding: '12px',
      backgroundColor: '#1a1f2e',
      borderRadius: '8px',
      margin: '-14px -20px -14px -20px'
    }}>
      {/* Badge de status */}
      {emAndamento && !encerrado && (
        <div style={{
          backgroundColor: '#22c55e',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          textTransform: 'uppercase',
          animation: 'pulse-badge 2s ease-in-out infinite'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'white',
            borderRadius: '50%',
            animation: 'pulse-dot 1s ease-in-out infinite'
          }}></span>
          Acontecendo Agora
        </div>
      )}
      {encerrado && (
        <div style={{
          backgroundColor: '#6b7280',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '8px',
          display: 'inline-block',
          textTransform: 'uppercase'
        }}>
          Encerrado
        </div>
      )}
      <h3 style={{
        fontWeight: 'bold',
        fontSize: '14px',
        color: encerrado ? '#9ca3af' : (emAndamento ? '#22c55e' : '#FF6B35'),
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        {bloco.nome}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: encerrado ? '#9ca3af' : 'white' }}>
          <span style={{ fontSize: '14px' }}>📍</span>
          <span>{bloco.bairro}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: encerrado ? '#9ca3af' : 'white' }}>
          <span style={{ fontSize: '14px' }}>👥</span>
          <span>{formatarNumero(bloco.publicoEstimado)} pessoas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: encerrado ? '#9ca3af' : 'white' }}>
          <span style={{ fontSize: '14px' }}>🕐</span>
          <span>{formatarHora(bloco.horaInicio)} - {formatarHora(bloco.horaTermino)}</span>
        </div>
        {bloco.estrutura && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: encerrado ? '#9ca3af' : 'white' }}>
            <span style={{ fontSize: '14px' }}>🎵</span>
            <span>{bloco.estrutura}</span>
          </div>
        )}
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {encerrado ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ✓ Bloco encerrado
            </span>
          ) : emAndamento ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#22c55e',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ▶ Em andamento
            </span>
          ) : bloco.formaApresentacao === 'COM DESLOCAMENTO' ? (
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

  // Bloco PARADO: usar marcador quadrado com "P" ou "✓" se encerrado ou "▶" se em andamento
  if (bloco.formaApresentacao === 'PARADO') {
    const size = Math.max(16, radius * 2);
    const icon = createSquareIcon(cor, isSelected, size, encerrado, emAndamento);

    return (
      <Marker
        position={[bloco.lat, bloco.lng]}
        icon={icon}
        eventHandlers={{
          click: handleClick,
        }}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  }

  // Bloco COM DESLOCAMENTO em andamento: usar marcador com animação
  if (emAndamento && !encerrado) {
    const icon = createPulsingCircleIcon(cor, isSelected, radius);

    return (
      <Marker
        position={[bloco.lat, bloco.lng]}
        icon={icon}
        eventHandlers={{
          click: handleClick,
        }}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  }

  // Cores para bloco encerrado vs ativo
  const corFinal = encerrado ? COR_ENCERRADO : cor;
  const opacidade = encerrado ? 0.35 : (isSelected ? 0.9 : 0.7);

  // Bloco COM DESLOCAMENTO: usar marcador circular normal
  return (
    <CircleMarker
      center={[bloco.lat, bloco.lng]}
      radius={isSelected ? radius + 4 : radius}
      pathOptions={{
        color: isSelected ? '#FFFFFF' : corFinal,
        fillColor: corFinal,
        fillOpacity: opacidade,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>{popupContent}</Popup>
    </CircleMarker>
  );
}

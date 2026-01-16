import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { RotaInfo } from '../../types/rota';
import { formatarDuracao, formatarDistanciaKm } from '../../utils/geoUtils';

interface RotaPolylineProps {
  rota: RotaInfo;
}

export function RotaPolyline({ rota }: RotaPolylineProps) {
  const positions = rota.polyline.map(p => [p.lat, p.lng] as [number, number]);

  // Ícone de origem
  const origemIcon = L.divIcon({
    className: 'rota-origem-marker',
    html: `
      <div style="
        background: #10B981;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        A
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Ícone de destino
  const destinoIcon = L.divIcon({
    className: 'rota-destino-marker',
    html: `
      <div style="
        background: #F97316;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        B
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <>
      {/* Linha da rota - sombra */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#000000',
          weight: 8,
          opacity: 0.3
        }}
      />

      {/* Linha da rota - principal */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#3B82F6',
          weight: 5,
          opacity: 0.9
        }}
      />

      {/* Marcador de origem */}
      <Marker position={[rota.origem.lat, rota.origem.lng]} icon={origemIcon}>
        <Popup>
          <div style={{
            background: '#1a1f2e',
            padding: '12px',
            borderRadius: '8px',
            color: 'white'
          }}>
            <p style={{
              margin: 0,
              fontWeight: 'bold',
              color: '#10B981'
            }}>
              📍 Sua localização
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Marcador de destino */}
      <Marker position={[rota.destino.lat, rota.destino.lng]} icon={destinoIcon}>
        <Popup>
          <div style={{
            background: '#1a1f2e',
            padding: '12px',
            borderRadius: '8px',
            color: 'white',
            minWidth: '200px'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontWeight: 'bold',
              color: '#F97316',
              fontSize: '14px'
            }}>
              🎭 {rota.blocoDestino.nome}
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <span>🚗 {formatarDistanciaKm(rota.distanciaKm)}</span>
              <span>⏱️ {formatarDuracao(rota.duracaoMinutos)}</span>
            </div>
            {rota.alertasNaRota.length > 0 && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '11px',
                color: '#FBBF24'
              }}>
                ⚠️ {rota.alertasNaRota.length} alerta(s) na rota
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}

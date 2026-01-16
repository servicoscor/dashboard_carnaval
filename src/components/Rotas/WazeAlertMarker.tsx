import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { WazeAlert } from '../../types/waze';
import { getAlertaIcone, getAlertaCor, getAlertaLabel } from '../../services/wazeService';

interface WazeAlertMarkerProps {
  alerta: WazeAlert;
}

export function WazeAlertMarker({ alerta }: WazeAlertMarkerProps) {
  const icone = getAlertaIcone(alerta.type, alerta.subtype);
  const cor = getAlertaCor(alerta.type);
  const label = getAlertaLabel(alerta.type, alerta.subtype);

  const icon = L.divIcon({
    className: 'waze-alert-marker',
    html: `
      <div style="
        background-color: ${cor};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 14px;
      ">
        ${icone}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  return (
    <Marker
      position={[alerta.location.y, alerta.location.x]}
      icon={icon}
    >
      <Popup>
        <div style={{
          background: '#1a1f2e',
          padding: '12px',
          borderRadius: '8px',
          minWidth: '180px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '20px',
              background: cor,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icone}
            </span>
            <span style={{
              fontWeight: 'bold',
              fontSize: '14px',
              color: cor
            }}>
              {label}
            </span>
          </div>

          {alerta.street && (
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 4px 0'
            }}>
              📍 {alerta.street}
            </p>
          )}

          {alerta.reportDescription && (
            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.6)',
              margin: '4px 0 0 0',
              fontStyle: 'italic'
            }}>
              "{alerta.reportDescription}"
            </p>
          )}

          <p style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            margin: '8px 0 0 0',
            textAlign: 'right'
          }}>
            Fonte: Waze
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

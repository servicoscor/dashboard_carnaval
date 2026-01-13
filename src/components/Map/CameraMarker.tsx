import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Camera } from '../../types/bloco';

interface CameraMarkerProps {
  camera: Camera;
  onClick?: (camera: Camera) => void;
}

// Criar ícone de câmera
function createCameraIcon(): L.DivIcon {
  return L.divIcon({
    className: 'camera-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

const cameraIcon = createCameraIcon();

export function CameraMarker({ camera, onClick }: CameraMarkerProps) {
  return (
    <Marker
      position={[camera.lat, camera.lng]}
      icon={cameraIcon}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onClick?.(camera);
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -14]} opacity={0.9}>
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
            📹 {camera.nome}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            Clique para ver ao vivo
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

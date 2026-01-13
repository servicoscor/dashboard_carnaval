import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import type { Bloco, Camera } from '../../types/bloco';
import { BlocoMarker } from './BlocoMarker';
import { BlocoRoute } from './BlocoRoute';
import { CameraMarker } from './CameraMarker';
import { CameraPlayer } from './CameraPlayer';
import { MapLegend } from './MapLegend';
import { RIO_CENTER, DEFAULT_ZOOM, TILE_LAYERS, TILE_ATTRIBUTION } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
  camerasProximas?: Camera[];
}

// Componente para controlar o mapa programaticamente
function MapController({ blocoSelecionado }: { blocoSelecionado: Bloco | null }) {
  const map = useMap();

  useEffect(() => {
    if (blocoSelecionado) {
      map.flyTo([blocoSelecionado.lat, blocoSelecionado.lng], 16, {
        duration: 1.5,
      });
    }
  }, [blocoSelecionado, map]);

  return null;
}

export function MapView({ blocos, blocoSelecionado, onSelectBloco, camerasProximas = [] }: MapContainerProps) {
  const [cameraAberta, setCameraAberta] = useState<Camera | null>(null);

  const handleCameraClick = (camera: Camera) => {
    setCameraAberta(camera);
  };

  const handleCloseCamera = () => {
    setCameraAberta(null);
  };

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer
        center={RIO_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_LAYERS.dark}
        />

        <MapController blocoSelecionado={blocoSelecionado} />

        {/* Renderizar rota do bloco selecionado (se houver) */}
        {blocoSelecionado && (
          <BlocoRoute
            bloco={blocoSelecionado}
            isSelected={true}
          />
        )}

        {/* Renderizar câmeras próximas ao bloco selecionado */}
        {camerasProximas.map((camera) => (
          <CameraMarker
            key={`camera-${camera.id}`}
            camera={camera}
            onClick={handleCameraClick}
          />
        ))}

        {/* Renderizar marcadores */}
        {blocos.map((bloco) => (
          <BlocoMarker
            key={`marker-${bloco.id}`}
            bloco={bloco}
            isSelected={blocoSelecionado?.id === bloco.id}
            onSelect={onSelectBloco}
          />
        ))}
      </LeafletMapContainer>

      <MapLegend />

      {/* Player de câmera flutuante */}
      {cameraAberta && (
        <CameraPlayer
          camera={cameraAberta}
          onClose={handleCloseCamera}
        />
      )}
    </div>
  );
}

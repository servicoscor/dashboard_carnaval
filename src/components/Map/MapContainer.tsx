import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { Bloco, Camera } from '../../types/bloco';
import { BlocoMarker } from './BlocoMarker';
import { BlocoRoute } from './BlocoRoute';
import { CameraMarker } from './CameraMarker';
import { CameraPlayer } from './CameraPlayer';
import { RIO_CENTER, DEFAULT_ZOOM, TILE_LAYERS, TILE_ATTRIBUTION } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

type MapTheme = 'light' | 'dark';

interface MapContainerProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
  camerasProximas?: Camera[];
}

// Componente para invalidar o tamanho do mapa quando o container redimensiona
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 50);
    };

    // Criar ResizeObserver para detectar mudanças no container
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Também ouvir eventos de resize da janela
    window.addEventListener('resize', handleResize);

    // Invalidar tamanho inicial após montagem
    handleResize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
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
  const [mapTheme, setMapTheme] = useState<MapTheme>('light');

  const handleCameraClick = (camera: Camera) => {
    setCameraAberta(camera);
  };

  const handleCloseCamera = () => {
    setCameraAberta(null);
  };

  const toggleTheme = () => {
    setMapTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Usar voyager (estilo Google Maps) para tema claro
  const tileUrl = mapTheme === 'light' ? TILE_LAYERS.voyager : TILE_LAYERS.dark;

  return (
    <div className="relative w-full h-full">
      {/* Botão de toggle do tema */}
      <button
        onClick={toggleTheme}
        className={`absolute top-3 right-3 z-[1000] p-2.5 rounded-lg shadow-lg transition-all duration-200 ${
          mapTheme === 'light'
            ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            : 'bg-cor-bg-secondary hover:bg-cor-bg-tertiary text-white border border-white/10'
        }`}
        title={mapTheme === 'light' ? 'Mudar para mapa escuro' : 'Mudar para mapa claro'}
      >
        {mapTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <LeafletMapContainer
        center={RIO_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={tileUrl}
          key={mapTheme}
        />

        <MapResizeHandler />
        <MapController blocoSelecionado={blocoSelecionado} />

        {/* Renderizar rota do bloco selecionado (percurso do KMZ já está carregado no bloco) */}
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

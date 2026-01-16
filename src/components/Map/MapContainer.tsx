import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Sun, Moon } from 'lucide-react';
import type { Bloco, Camera } from '../../types/bloco';
import type { RotaInfo } from '../../types/rota';
import type { WazeAlert } from '../../types/waze';
import { BlocoMarker } from './BlocoMarker';
import { BlocoRoute } from './BlocoRoute';
import { CameraMarker } from './CameraMarker';
import { CameraPlayer } from './CameraPlayer';
import { RotaPolyline, WazeAlertMarker } from '../Rotas';
import { RIO_CENTER, DEFAULT_ZOOM, TILE_LAYERS, TILE_ATTRIBUTION } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

type MapTheme = 'light' | 'dark';

interface MapContainerProps {
  blocos: Bloco[];
  blocoSelecionado: Bloco | null;
  onSelectBloco: (bloco: Bloco) => void;
  camerasProximas?: Camera[];
  rotaAtiva?: RotaInfo | null;
  alertasWaze?: WazeAlert[];
  mostrarAlertasWaze?: boolean;
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
function MapController({ blocoSelecionado, rotaAtiva }: { blocoSelecionado: Bloco | null; rotaAtiva: RotaInfo | null }) {
  const map = useMap();

  useEffect(() => {
    // Se tiver rota ativa, enquadrar a rota no mapa
    if (rotaAtiva && rotaAtiva.polyline.length > 0) {
      const bounds = L.latLngBounds(
        rotaAtiva.polyline.map(p => [p.lat, p.lng] as [number, number])
      );
      // Adicionar origem e destino aos bounds para garantir que apareçam
      bounds.extend([rotaAtiva.origem.lat, rotaAtiva.origem.lng]);
      bounds.extend([rotaAtiva.destino.lat, rotaAtiva.destino.lng]);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 1
      });
      return;
    }

    // Se não tiver rota, focar no bloco selecionado
    if (blocoSelecionado) {
      map.flyTo([blocoSelecionado.lat, blocoSelecionado.lng], 16, {
        duration: 1.5,
      });
    }
  }, [blocoSelecionado, rotaAtiva, map]);

  return null;
}

export function MapView({
  blocos,
  blocoSelecionado,
  onSelectBloco,
  camerasProximas = [],
  rotaAtiva = null,
  alertasWaze = [],
  mostrarAlertasWaze = false
}: MapContainerProps) {
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
      {/* Botão de toggle do tema - abaixo dos controles de zoom */}
      <button
        onClick={toggleTheme}
        className={`absolute top-[100px] sm:top-[80px] left-2.5 z-[1001] p-3 rounded-lg shadow-lg transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
          mapTheme === 'light'
            ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            : 'bg-[#1a1f2e] hover:bg-[#2a3142] text-white border border-white/20'
        }`}
        title={mapTheme === 'light' ? 'Mudar para mapa escuro' : 'Mudar para mapa claro'}
      >
        {mapTheme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
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
        <MapController blocoSelecionado={blocoSelecionado} rotaAtiva={rotaAtiva} />

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

        {/* Renderizar rota calculada (usuário -> bloco) */}
        {rotaAtiva && (
          <RotaPolyline rota={rotaAtiva} />
        )}

        {/* Renderizar alertas do Waze na rota */}
        {mostrarAlertasWaze && rotaAtiva && rotaAtiva.alertasNaRota.map((alerta) => (
          <WazeAlertMarker key={alerta.uuid} alerta={alerta} />
        ))}

        {/* Renderizar todos os alertas do Waze (quando não houver rota) */}
        {mostrarAlertasWaze && !rotaAtiva && alertasWaze.map((alerta) => (
          <WazeAlertMarker key={alerta.uuid} alerta={alerta} />
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

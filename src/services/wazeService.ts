import type { WazeFeed, WazeAlert } from '../types/waze';
import type { Coordenada } from '../types/rota';
import { pontoProximoARota } from '../utils/geoUtils';

// NOTA: A API do Waze requer um proxy backend devido a CORS
// Para usar em produção, configure um proxy no servidor que redirecione para:
// https://www.waze.com/row-partnerhub-api/partners/{PARTNER_ID}/waze-feeds/{FEED_ID}?format=1
const WAZE_API_URL = import.meta.env.VITE_WAZE_PROXY_URL || '';

export async function buscarAlertasWaze(): Promise<WazeAlert[]> {
  // Se não houver URL configurada, retorna vazio silenciosamente
  if (!WAZE_API_URL) {
    return [];
  }

  try {
    const response = await fetch(WAZE_API_URL);

    if (!response.ok) {
      console.warn(`API Waze indisponível: ${response.status}`);
      return [];
    }

    const data: WazeFeed = await response.json();
    return data.alerts || [];
  } catch {
    // Silenciosamente retorna vazio - CORS ou rede indisponível
    return [];
  }
}

export function filtrarAlertasNaRota(
  alertas: WazeAlert[],
  polyline: Coordenada[],
  raioMetros: number = 200
): WazeAlert[] {
  return alertas.filter(alerta => {
    const pontoAlerta: Coordenada = {
      lat: alerta.location.y,
      lng: alerta.location.x
    };

    return pontoProximoARota(pontoAlerta, polyline, raioMetros);
  });
}

export function getAlertaIcone(type: string, subtype?: string): string {
  switch (type) {
    case 'JAM':
      return subtype === 'JAM_STAND_STILL_TRAFFIC' ? '🚫' : '🚗';
    case 'ACCIDENT':
      return '⚠️';
    case 'ROAD_CLOSED':
      return subtype === 'ROAD_CLOSED_EVENT' ? '🎭' : '⛔';
    case 'HAZARD':
      if (subtype?.includes('FLOOD')) return '🌊';
      if (subtype?.includes('CONSTRUCTION')) return '🚧';
      if (subtype?.includes('POT_HOLE')) return '🕳️';
      return '⚠️';
    default:
      return '📍';
  }
}

export function getAlertaCor(type: string): string {
  switch (type) {
    case 'JAM':
      return '#DC2626'; // red-600
    case 'ACCIDENT':
      return '#F97316'; // orange-500
    case 'ROAD_CLOSED':
      return '#B91C1C'; // red-700
    case 'HAZARD':
      return '#EAB308'; // yellow-500
    default:
      return '#6B7280'; // gray-500
  }
}

export function getAlertaLabel(type: string, subtype?: string): string {
  switch (type) {
    case 'JAM':
      if (subtype === 'JAM_STAND_STILL_TRAFFIC') return 'Trânsito parado';
      if (subtype === 'JAM_HEAVY_TRAFFIC') return 'Trânsito intenso';
      return 'Congestionamento';
    case 'ACCIDENT':
      return 'Acidente';
    case 'ROAD_CLOSED':
      if (subtype === 'ROAD_CLOSED_EVENT') return 'Evento';
      return 'Via bloqueada';
    case 'HAZARD':
      if (subtype?.includes('FLOOD')) return 'Alagamento';
      if (subtype?.includes('CONSTRUCTION')) return 'Obra';
      if (subtype?.includes('POT_HOLE')) return 'Buraco na via';
      if (subtype?.includes('OBJECT')) return 'Objeto na via';
      return 'Perigo';
    default:
      return 'Alerta';
  }
}

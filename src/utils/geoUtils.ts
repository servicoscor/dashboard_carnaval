import type { Coordenada } from '../types/rota';

// Fórmula de Haversine para calcular distância entre dois pontos
export function calcularDistancia(
  ponto1: Coordenada,
  ponto2: Coordenada
): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (ponto1.lat * Math.PI) / 180;
  const φ2 = (ponto2.lat * Math.PI) / 180;
  const Δφ = ((ponto2.lat - ponto1.lat) * Math.PI) / 180;
  const Δλ = ((ponto2.lng - ponto1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
}

// Verifica se um ponto está próximo a uma rota (polyline)
export function pontoProximoARota(
  ponto: Coordenada,
  polyline: Coordenada[],
  raioMetros: number
): boolean {
  for (const pontoDaRota of polyline) {
    const distancia = calcularDistancia(ponto, pontoDaRota);
    if (distancia <= raioMetros) {
      return true;
    }
  }
  return false;
}

// Formata duração em minutos para texto legível
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${Math.round(minutos)} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
}

// Formata distância em km
export function formatarDistanciaKm(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

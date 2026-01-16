import type { Coordenada } from '../types/rota';

// Usando OSRM (Open Source Routing Machine) - gratuito, sem API key
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

interface OSRMStep {
  maneuver: {
    instruction: string;
    type: string;
  };
  distance: number;
  name: string;
}

interface OSRMLeg {
  steps: OSRMStep[];
}

interface OSRMRoute {
  distance: number; // metros
  duration: number; // segundos
  geometry: {
    coordinates: [number, number][]; // [lng, lat]
  };
  legs: OSRMLeg[];
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

export async function calcularRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<{
  distanciaKm: number;
  duracaoMinutos: number;
  polyline: Coordenada[];
  instrucoes: { texto: string; distancia: number; tipo: string }[];
}> {
  // OSRM usa formato: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}
  const url = `${OSRM_BASE_URL}/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao calcular rota: ${response.status}`);
  }

  const data: OSRMResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Não foi possível calcular a rota');
  }

  const route = data.routes[0];

  const polyline = route.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng
  }));

  const instrucoes = route.legs[0]?.steps.map(step => ({
    texto: step.maneuver.instruction || `Siga por ${step.name}`,
    distancia: step.distance,
    tipo: step.maneuver.type
  })) || [];

  return {
    distanciaKm: route.distance / 1000,
    duracaoMinutos: route.duration / 60,
    polyline,
    instrucoes
  };
}
